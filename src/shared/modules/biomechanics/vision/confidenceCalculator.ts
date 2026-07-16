/**
 * ============================================================================
 * WORKOUT ACADEMIA - BIOMECHANICS AI MODULE: CONFIDENCE CALCULATOR
 * ============================================================================
 */

import { BodyLandmarks } from "../types";

/**
 * Avalia se o modelo conseguiu "enxergar" o corpo o suficiente
 * para gerar um laudo seguro.
 */
export function calculateBodyConfidence(landmarks: BodyLandmarks): number {
  const points = landmarks.points;
  if (points.length === 0) return 0;

  const sum = points.reduce((acc, point) => acc + point.confidence, 0);
  const averageConfidence = sum / points.length;

  return averageConfidence;
}
