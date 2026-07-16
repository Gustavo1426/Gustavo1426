/**
 * ============================================================================
 * WORKOUT ACADEMIA - BIOMECHANICS AI MODULE: RECOMMENDATION PREDICTOR
 * ============================================================================
 */

import { RecommendationPrediction, RiskPrediction, MesocyclePrediction } from "../types/prediction.types";

export function generatePredictiveRecommendations(
  risks: RiskPrediction, 
  meso: MesocyclePrediction
): RecommendationPrediction[] {
  const recommendations: RecommendationPrediction[] = [];

  if (risks.dropout > 60) {
    recommendations.push({ trigger: "high_dropout_risk", action: "Alertar AI Coach para enviar mensagem motivacional e humanizada." });
  }
  if (risks.injuryAttention > 70) {
    recommendations.push({ trigger: "high_injury_risk", action: "Decision Engine: Reduzir volume de exercícios compostos pesados em 20%." });
  }
  if (meso.recommendTransition) {
    recommendations.push({ trigger: "mesocycle_end", action: "Sugerir geração de novo planejamento ao Professor." });
  }

  return recommendations;
}
