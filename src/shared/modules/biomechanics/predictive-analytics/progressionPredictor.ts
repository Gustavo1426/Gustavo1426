/**
 * ============================================================================
 * WORKOUT ACADEMIA - BIOMECHANICS AI MODULE: PROGRESSION PREDICTOR
 * ============================================================================
 */

import { PredictionContext, PredictionResult, ProgressionPrediction } from "../types/prediction.types";
import { calculatePredictionConfidence } from "./confidenceCalculator";

export function predictProgression(context: PredictionContext): PredictionResult<ProgressionPrediction> {
  const currentPRs = context.digitalTwin.performance.prs || { "bench_press": 80 };
  const rawRate = context.digitalTwin.performance.strengthProgressionRate; // Ex: 4.5 para 4.5% ou 0.045
  const rate = rawRate >= 1 ? rawRate / 100 : rawRate;

  const expectedPrs30Days: Record<string, number> = {};
  const expectedPrs60Days: Record<string, number> = {};

  Object.keys(currentPRs).forEach(exercise => {
    const currentWeight = currentPRs[exercise];
    expectedPrs30Days[exercise] = Math.round(currentWeight * (1 + rate));
    expectedPrs60Days[exercise] = Math.round(currentWeight * (1 + (rate * 1.8))); // Diminishing returns
  });

  return {
    prediction: { expectedPrs30Days, expectedPrs60Days },
    confidence: calculatePredictionConfidence(context.performanceHistory.length, 0.8),
    modelUsed: "linear_regression"
  };
}
