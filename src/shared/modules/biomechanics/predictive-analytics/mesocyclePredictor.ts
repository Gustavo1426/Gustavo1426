/**
 * ============================================================================
 * WORKOUT ACADEMIA - BIOMECHANICS AI MODULE: MESOCYCLE PREDICTOR
 * ============================================================================
 */

import { PredictionContext, PredictionResult, MesocyclePrediction, RiskPrediction } from "../types/prediction.types";

export function predictMesocycleTransition(
  context: PredictionContext, 
  risks: RiskPrediction
): PredictionResult<MesocyclePrediction> {
  
  const twin = context.digitalTwin;
  let recommend = false;
  let reason = "Fase de adaptação em andamento.";

  // Se platô está alto ou overtraining é iminente
  if (risks.plateau > 70 || risks.overtraining > 75) {
    recommend = true;
    reason = "Alto risco de platô ou overtraining detectado. Transição recomendada para dissipar fadiga (Deload/Novo Ciclo).";
  } else if (twin.training.currentMicrocycle >= 6) {
    recommend = true;
    reason = "Tempo limite ótimo do mesociclo atingido (6 semanas).";
  }

  return {
    prediction: { recommendTransition: recommend, reason },
    confidence: 88,
    modelUsed: "ensemble"
  };
}
