/**
 * ============================================================================
 * WORKOUT ACADEMIA - BIOMECHANICS AI MODULE: BIOMECHANICS PREDICTOR
 * ============================================================================
 */

import { PredictionContext, PredictionResult } from "../types/prediction.types";
import { calculatePredictionConfidence } from "./confidenceCalculator";

export function predictBiomechanics(context: PredictionContext): PredictionResult<{ expectedIGB: number }> {
  const currentIGB = context.digitalTwin.biomechanics.igb;
  const adherence = context.digitalTwin.training.adherencePercentage;

  // Se o aluno treina direito, o IGB tende a subir
  let delta = 0;
  if (adherence > 80) delta = 4;
  else if (adherence < 40) delta = -3;

  return {
    prediction: { expectedIGB: Math.min(100, currentIGB + delta) },
    confidence: calculatePredictionConfidence(context.adherenceHistory.length, 1.0),
    modelUsed: "heuristic"
  };
}
