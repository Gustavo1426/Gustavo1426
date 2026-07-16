/**
 * ============================================================================
 * WORKOUT ACADEMIA - PHASE 2.0: ADAPTATION RULES
 * ============================================================================
 */

export interface AdaptationThresholds {
  confidenceHighThreshold: number;
  confidenceLowThreshold: number;
  minConfidenceToAct: number;
}

export const adaptationThresholds: AdaptationThresholds = {
  confidenceHighThreshold: 0.75,
  confidenceLowThreshold: 0.40,
  minConfidenceToAct: 0.25
};

export function shouldApplyRule(confidence: number, threshold = adaptationThresholds.minConfidenceToAct): boolean {
  return confidence >= threshold;
}
