/**
 * @file External medicine source helpers for fetching and normalizing public FDA label data.
 */

export type ExternalMedicineSummary = {
  brandNames?: string[];
  genericNames?: string[];
  indications?: string;
  warnings?: string;
  dosage?: string;
  contraindications?: string;
  boxedWarning?: string;
  adverseReactions?: string;
};

async function safeJoin(input: any): Promise<string | undefined> {
  if (!input) {
    return undefined;
  }

  if (Array.isArray(input)) {
    return input.join('\n');
  }

  if (typeof input === 'string') {
    return input;
  }

  return String(input);
}

/**
 * Fetches and normalizes an openFDA drug label record for a short summary.
 * Returns `null` when no summary is available or on error.
 */
export async function fetchOpenFdaLabelSummary(query: string): Promise<ExternalMedicineSummary | null> {
  if (!query) {
    return null;
  }

  const encoded = encodeURIComponent(query);
  // Search both generic and brand names
  const search = `openfda.generic_name:%22${encoded}%22+OR+openfda.brand_name:%22${encoded}%22`;
  const url = `https://api.fda.gov/drug/label.json?search=${search}&limit=1`;

  try {
    const resp = await fetch(url);
    if (!resp.ok) {
      return null;
    }

    const body = await resp.json();
    const result = body.results && body.results[0];
    if (!result) {
      return null;
    }

    const openfda = result.openfda || {};

    const summary: ExternalMedicineSummary = {
      brandNames: openfda.brand_name || [],
      genericNames: openfda.generic_name || [],
      indications: await safeJoin(
        result.indications_and_usage || result.indications || result.indications_and_usage
      ),
      warnings: await safeJoin(result.warnings_and_precautions || result.warnings),
      dosage: await safeJoin(result.dosage_and_administration || result.dosage),
      contraindications: await safeJoin(result.contraindications),
      boxedWarning: await safeJoin(result.boxed_warning || result['boxed_warning']),
      adverseReactions: await safeJoin(result.adverse_reactions),
    };

    return summary;
  } catch (err) {
    // Surface fetch errors in console for easier debugging in dev.
    console.warn('openFDA fetch error:', err);
    return null;
  }
}

export default fetchOpenFdaLabelSummary;
