/**
 * ============================================================================
 * WORKOUT ACADEMIA - PHASE 2.4: PREDICTIVE ANALYTICS ENGINE - RETENTION RISK PREDICTOR
 * ============================================================================
 */

import { DigitalTwinMock, PlateauPrediction, ChurnPrediction } from "../types";

/**
 * O motor comercial. Prevê se o aluno vai cancelar o plano baseado em comportamento e biologia.
 */
export function predictRetentionRisk(twin: DigitalTwinMock, plateauPred: PlateauPrediction): ChurnPrediction {
  let riskScore = 100 - twin.behavior.adherenceScore;

  // Se o aluno está estagnado, o risco de evasão sobe dramaticamente (Falta de resultados)
  if (plateauPred.plateauProbability > 0.8) {
    riskScore += 25;
  }

  let category: ChurnPrediction["riskCategory"] = "safe";
  let cxmAction = "Manter réguas de relacionamento automáticas (21 dias).";

  if (riskScore > 75) {
    category = "critical";
    cxmAction = "Intervenção humana imediata (WhatsApp). Aluno não vê resultados e a frequência caiu.";
  } else if (riskScore > 40) {
    category = "monitor";
    cxmAction = "Enviar mensagem do AI Coach parabenizando pelas pequenas vitórias recentes.";
  }

  return {
    churnRiskScore: Math.min(100, riskScore),
    riskCategory: category,
    cxmActionRecommended: cxmAction
  };
}
