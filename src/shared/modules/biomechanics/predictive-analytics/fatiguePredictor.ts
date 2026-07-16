/**
 * ============================================================================
 * WORKOUT ACADEMIA - BIOMECHANICS AI MODULE: FATIGUE & RECOVERY PREDICTOR
 * ============================================================================
 */

import { PredictionContext, PredictionResult, FatiguePrediction } from "../types/prediction.types";
import { calculatePredictionConfidence } from "./confidenceCalculator";

export function predictFatigue(context: PredictionContext): PredictionResult<FatiguePrediction> {
  const twin = context.digitalTwin;
  
  // Projeta a fadiga baseada no volume atual e na recuperação
  let projectedFatigue = twin.recovery.fatigueLevel + (twin.training.weeklyVolumeSets * 0.2);
  if (twin.recovery.sleepQuality === "bad") projectedFatigue += 15;

  let readiness = 100 - projectedFatigue;

  return {
    prediction: {
      fatigueNextWeek: Math.min(100, Math.round(projectedFatigue)),
      readinessTomorrow: Math.max(0, Math.round(readiness))
    },
    confidence: calculatePredictionConfidence(context.workoutHistory.length, 2.0),
    modelUsed: "heuristic"
  };
}
