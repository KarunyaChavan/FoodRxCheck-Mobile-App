/**
 * @file JS utility to normalize openFDA-like records for ingestion scripts.
 *
 * This is purposely small and dependency-free so it can be required by
 * Node scripts without a build step.
 */

async function safeJoin(input) {
  if (!input) return undefined;
  if (Array.isArray(input)) return input.join('\n');
  if (typeof input === 'string') return input;
  return String(input);
}

async function buildSummaryFromRecord(result) {
  if (!result) return null;
  const openfda = result.openfda || {};
  const summary = {
    brandNames: openfda.brand_name || result.brandNames || [],
    genericNames: openfda.generic_name || result.genericNames || [],
    indications: await safeJoin(result.indications_and_usage || result.indications),
    warnings: await safeJoin(result.warnings_and_precautions || result.warnings),
    dosage: await safeJoin(result.dosage_and_administration || result.dosage),
    contraindications: await safeJoin(result.contraindications),
    boxedWarning: await safeJoin(result.boxed_warning || result['boxed_warning']),
    adverseReactions: await safeJoin(result.adverse_reactions),
  };
  return { summary, source_url: result['setid'] || null };
}

module.exports = { buildSummaryFromRecord };
