/**
 * ============================================================================
 * WORKOUT ACADEMIA - BIOMECHANICS AI MODULE: RISK & ADHERENCE PREDICTOR
 * ============================================================================
 */

import { PredictionContext, PredictionResult, RiskPrediction } from "../types/prediction.types";
import { calculatePredictionConfidence } from "./confidenceCalculator";

export function predictRisks(context: PredictionContext): PredictionResult<RiskPrediction> {
  const twin = context.digitalTwin;
  const adherence = twin.training.adherencePercentage;
  const fatigue = twin.recovery.fatigueLevel;
  const igb = twin.biomechanics.igb;

  // Cálculos baseados em Heurística Ponderada (Simulando o Ensemble)
  const dropoutProbability = Math.max(0, 100 - adherence + (fatigue > 80 ? 15 : 0));
  const injuryProbability = Math.max(0, (100 - igb) * 0.5 + (fatigue * 0.4));
  const overtrainingProbability = Math.max(0, fatigue * 0.8 + (adherence > 95 ? 10 : 0));
  
  // Platô: alta adesão, alta fadiga, mas sem progressão
  const plateauProbability = (adherence > 80 && twin.performance.strengthProgressionRate < 1) ? 75 : 20;

  const confidence = calculatePredictionConfidence(context.workoutHistory.length, 1.2);

  return {
    prediction: {
      injuryAttention: Math.round(injuryProbability),
      dropout: Math.round(dropoutProbability),
      overtraining: Math.round(overtrainingProbability),
      plateau: Math.round(plateauProbability)
    },
    confidence,
    modelUsed: "ensemble"
  };
}
