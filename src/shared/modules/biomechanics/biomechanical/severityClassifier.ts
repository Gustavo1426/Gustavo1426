/**
 * ============================================================================
 * WORKOUT ACADEMIA - BIOMECHANICS AI MODULE: SEVERITY CLASSIFIER
 * ============================================================================
 */

/**
 * Classifica a gravidade do desvio com base na confiança estatística e desvios angulares.
 */
export function classifySeverity(confidence: number): "low" | "medium" | "high" {
  if (confidence >= 85) return "high";
  if (confidence >= 70) return "medium";
  return "low";
}
