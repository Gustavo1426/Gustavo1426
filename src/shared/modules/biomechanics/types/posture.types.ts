/**
 * ============================================================================
 * WORKOUT ACADEMIA - BIOMECHANICS AI MODULE: POSTURE & PHOTO TYPES
 * ============================================================================
 */

export interface EvaluationPhoto {
  id: string;
  url: string;
  view: "front" | "side" | "back";
  qualityScore: number;
  validation: {
    approved: boolean;
    confidence: number;
  };
}
