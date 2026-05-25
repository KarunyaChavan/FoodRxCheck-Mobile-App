/**
 * @file Utilities for reading cached external drug summaries from Supabase.
 */

import supabase from '../../lib/supabase-service';
import { normalizeExternalSummary, type ExternalMedicineSummary } from './summary-normalizers';

export type ExternalSummaryRecord = {
  id: string;
  drug_name: string;
  supabase_drug_id?: string | null;
  source_id?: string | null;
  summary?: any;
  fetched_at?: string;
  source_url?: string;
  confidence?: number;
};

export type FetchOptions = {
  drugName?: string;
  supabaseDrugId?: string;
};

type DrugRow = {
  drug_id: number;
  drug_name: string;
};

type SynonymRow = {
  drug_name: string;
  synonym: string;
};

type CandidateCatalog = {
  drugs: DrugRow[];
  synonyms: SynonymRow[];
};

const summarySelect = 'id,drug_name,supabase_drug_id,source_id,summary,fetched_at,source_url,confidence';

let candidateCatalogPromise: Promise<CandidateCatalog> | null = null;

/**
 * Normalize a token for alias matching.
 * The punctuation character class treats separators as whitespace before collapsing spaces.
 */
const normalizeToken = (value: string): string =>
  value
    .toLowerCase()
    .replace(/["'()\[\],.:;\/\\\-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const toRecord = (row: any): ExternalSummaryRecord => ({
  id: row.id,
  drug_name: row.drug_name,
  supabase_drug_id: row.supabase_drug_id || null,
  source_id: row.source_id || null,
  summary: row.summary || null,
  fetched_at: row.fetched_at || null,
  source_url: row.source_url || null,
  confidence: typeof row.confidence === 'number' ? row.confidence : undefined,
});

const getCandidateCatalog = async (): Promise<CandidateCatalog> => {
  if (!candidateCatalogPromise) {
    candidateCatalogPromise = Promise.all([
      supabase.from('drugs').select('drug_id,drug_name'),
      supabase.from('drug_synonyms').select('drug_name,synonym'),
    ]).then(([drugsRes, synonymsRes]) => ({
      drugs: ((drugsRes.data || []) as DrugRow[]).filter((row) => Boolean(row.drug_name)),
      synonyms: ((synonymsRes.data || []) as SynonymRow[]).filter((row) => Boolean(row.drug_name) && Boolean(row.synonym)),
    }));
  }

  return candidateCatalogPromise;
};

const relatedText = (left: string, right: string): boolean => {
  const a = normalizeToken(left);
  const b = normalizeToken(right);
  return a === b || a.includes(b) || b.includes(a);
};

const fetchLatestSummaryByName = async (drugName: string): Promise<ExternalSummaryRecord | null> => {
  const exact = await supabase
    .from('external_summaries')
    .select(summarySelect)
    .ilike('drug_name', drugName)
    .order('fetched_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (exact.data) {
    return toRecord(exact.data);
  }

  const partial = await supabase
    .from('external_summaries')
    .select(summarySelect)
    .ilike('drug_name', `%${drugName}%`)
    .order('fetched_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (partial.data) {
    return toRecord(partial.data);
  }

  return null;
};

const fetchLatestSummaryByDrugId = async (drugId: string): Promise<ExternalSummaryRecord | null> => {
  const { data, error } = await supabase
    .from('external_summaries')
    .select(summarySelect)
    .eq('supabase_drug_id', drugId)
    .order('fetched_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error && error.code !== 'PGRST116' && error.code !== 'PGRST117') {
    console.warn('getCachedSummary error', error.message || error);
    return null;
  }

  return data ? toRecord(data) : null;
};

const buildCandidateNames = (opts: FetchOptions, catalog: CandidateCatalog): string[] => {
  const names = new Set<string>();
  const seed = (opts.drugName || '').trim();

  if (seed) {names.add(seed);}

  if (opts.supabaseDrugId) {
    const matchedDrug = catalog.drugs.find((drug) => String(drug.drug_id) === String(opts.supabaseDrugId));
    if (matchedDrug?.drug_name) {names.add(matchedDrug.drug_name);}
  }

  let expanded = true;
  let guard = 0;
  while (expanded && guard < 4) {
    expanded = false;
    guard += 1;

    for (const drug of catalog.drugs) {
      if ([...names].some((candidate) => relatedText(candidate, drug.drug_name))) {
        if (!names.has(drug.drug_name)) {
          names.add(drug.drug_name);
          expanded = true;
        }
      }
    }

    for (const row of catalog.synonyms) {
      const matchesCandidate = [...names].some(
        (candidate) => relatedText(candidate, row.drug_name) || relatedText(candidate, row.synonym),
      );
      if (matchesCandidate) {
        if (!names.has(row.drug_name)) {
          names.add(row.drug_name);
          expanded = true;
        }
        if (!names.has(row.synonym)) {
          names.add(row.synonym);
          expanded = true;
        }
      }
    }
  }

  return [...names];
};

const fetchOpenFdaLabelByName = async (drugName: string): Promise<ExternalMedicineSummary | null> => {
  const trimmed = drugName.trim();
  if (!trimmed) {return null;}

  try {
    const url = `https://api.fda.gov/drug/label.json?search=openfda.generic_name:%22${encodeURIComponent(trimmed)}%22+OR+openfda.brand_name:%22${encodeURIComponent(trimmed)}%22&limit=1`;
    const resp = await fetch(url);
    if (!resp.ok) {return null;}

    const body = await resp.json();
    const liveRecord = body?.results?.[0];
    if (!liveRecord) {return null;}

    return normalizeExternalSummary(liveRecord);
  } catch (err) {
    console.warn('fetchOpenFdaLabelByName failed', err);
    return null;
  }
};

/**
 * Fetch a cached external summary. Prefer `supabaseDrugId` when available.
 * Falls back to case-insensitive `drugName` matching. Returns the latest
 * `external_summaries` row or `null` when not found.
 */
export const getCachedSummary = async (
  opts: FetchOptions,
): Promise<ExternalSummaryRecord | null> => {
  if (!opts || (!opts.drugName && !opts.supabaseDrugId)) {
    return null;
  }

  try {
    if (opts.supabaseDrugId) {
      return await fetchLatestSummaryByDrugId(opts.supabaseDrugId);
    }

    const name = (opts.drugName || '').trim();
    if (!name) {
      return null;
    }

    return await fetchLatestSummaryByName(name);
  } catch (err: any) {
    console.warn('getCachedSummary error', err.message || err);
  }

  return null;
};

export const resolveFdaLabelSummary = async (
  opts: FetchOptions,
): Promise<ExternalMedicineSummary | null> => {
  const queryName = (opts.drugName || '').trim();
  const queryId = opts.supabaseDrugId?.trim();
  if (!queryName && !queryId) {
    return null;
  }

  const catalog = await getCandidateCatalog();
  const candidates = buildCandidateNames(opts, catalog);

  if (queryId) {
    const cachedById = await fetchLatestSummaryByDrugId(queryId);
    if (cachedById?.summary) {
      return normalizeExternalSummary(cachedById.summary);
    }
  }

  for (const candidate of candidates) {
    const cached = await fetchLatestSummaryByName(candidate);
    if (cached?.summary) {
      return normalizeExternalSummary(cached.summary);
    }
  }

  for (const candidate of candidates) {
    const live = await fetchOpenFdaLabelByName(candidate);
    if (live) {
      return live;
    }
  }

  return null;
};

export default getCachedSummary;
