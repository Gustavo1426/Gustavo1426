/**
 * ============================================================================
 * WORKOUT ACADEMIA - PHASE 2.0: VOLUME ADJUSTMENT RULES
 * ============================================================================
 */

export interface VolumeRule {
  ruleId: string;
  targetMuscleGroup: string;
  suggestedDelta: number;
  reason: string;
}

export const volumeRules: VolumeRule[] = [
  { ruleId: "SHOULDER_ASYMMETRY", targetMuscleGroup: "back", suggestedDelta: +2, reason: "Aumentar demanda da cadeia posterior" },
  { ruleId: "SHOULDER_ASYMMETRY", targetMuscleGroup: "chest", suggestedDelta: -1, reason: "Reduzir tensão anterior temporariamente" }
];
