/**
 * @file Normalizers for external medicine summary objects stored in the DB.
 *
 * This module normalizes `external_summaries.summary` blobs to a compact,
 * typed `ExternalMedicineSummary` shape consumed by UI components.
 */

export type ExternalMedicineSummary = {
  brandNames: string[];
  genericNames: string[];
  indications?: string | null;
  warnings?: string | null;
  dosage?: string | null;
  contraindications?: string | null;
  boxedWarning?: string | null;
  adverseReactions?: string | null;
};

function toStringOrUndefined(v: any): string | undefined {
  if (v === null || v === undefined) {
    return undefined;
  }

  if (Array.isArray(v)) {
    return v.join('\n');
  }

  return String(v);
}

/**
 * Normalize a raw summary object (as stored in DB) to `ExternalMedicineSummary`.
 * Accepts either the shape previously returned by the openFDA fetch or a
 * pre-normalized object. This function is intentionally tolerant.
 */
export function normalizeExternalSummary(raw: any): ExternalMedicineSummary {
  const brandNames = (raw && (raw.brandNames || raw.brand_names || raw.openfda?.brand_name)) || [];
  const genericNames = (raw && (raw.genericNames || raw.generic_names || raw.openfda?.generic_name)) || [];

  return {
    brandNames: Array.isArray(brandNames) ? brandNames : [String(brandNames)].filter(Boolean),
    genericNames: Array.isArray(genericNames) ? genericNames : [String(genericNames)].filter(Boolean),
    indications: toStringOrUndefined(raw?.indications || raw?.indications_and_usage),
    warnings: toStringOrUndefined(raw?.warnings || raw?.warnings_and_precautions),
    dosage: toStringOrUndefined(raw?.dosage || raw?.dosage_and_administration),
    contraindications: toStringOrUndefined(raw?.contraindications),
    boxedWarning: toStringOrUndefined(raw?.boxedWarning || raw?.boxed_warning),
    adverseReactions: toStringOrUndefined(raw?.adverseReactions || raw?.adverse_reactions),
  };
}

export default normalizeExternalSummary;
