/**
 * ============================================================================
 * WORKOUT ACADEMIA - BIOMECHANICS AI MODULE: QUALITY RULES
 * ============================================================================
 */

export interface ImageQualityRules {
  minWidth: number;
  minHeight: number;
  minQualityScore: number;
  requireFullBody: boolean;
  requireNeutralPosition: boolean;
}

export const defaultQualityRules: ImageQualityRules = {
  minWidth: 720,
  minHeight: 1280,
  minQualityScore: 70,
  requireFullBody: true,
  requireNeutralPosition: true
};
