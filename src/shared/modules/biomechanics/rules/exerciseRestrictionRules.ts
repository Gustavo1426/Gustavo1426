/**
 * ============================================================================
 * WORKOUT ACADEMIA - PHASE 2.0: EXERCISE RESTRICTION RULES
 * ============================================================================
 */

export interface RestrictionRule {
  ruleId: string;
  avoidTags: string[];
  severity: string[];
  needs: string;
}

export const restrictionRules: RestrictionRule[] = [
  { ruleId: "ANKLE_LIMITATION", avoidTags: ["deep_squat", "high_depth"], severity: ["medium", "high"], needs: "stable_pattern" },
  { ruleId: "SHOULDER_ASYMMETRY", avoidTags: ["heavy_barbell_press"], severity: ["medium", "high"], needs: "unilateral_control" },
  { ruleId: "KNEE_VALGUS", avoidTags: ["dynamic_jumps", "heavy_bilateral_squat"], severity: ["high"], needs: "abductor_activation" }
];
