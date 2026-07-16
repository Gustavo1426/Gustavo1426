/**
 * ============================================================================
 * WORKOUT ACADEMIA - PHASE 2.4: PREDICTIVE ANALYTICS ENGINE - MESOCYCLE DECISION
 * ============================================================================
 */

import { DigitalTwinMock, PredictiveReport, MesocycleTransition } from "../types";
import { forecastFatigue } from "./fatigueForecast";
import { predictPlateau } from "./plateauPredictor";
import { predictRetentionRisk } from "./retentionRisk";

/**
 * O Motor Mestre da Fase 2.4. Roda periodicamente (ex: todo domingo) para 
 * decidir o macro-planejamento da próxima semana.
 */
export function runPredictiveAnalyticsEngine(
  twin: DigitalTwinMock, 
  plannedWeeklyVolume: number,
  currentPhase: string
): PredictiveReport {

  // 1. Projeta as variáveis base
  const fatigue = forecastFatigue(twin, plannedWeeklyVolume);
  const plateau = predictPlateau(twin, fatigue);
  const retention = predictRetentionRisk(twin, plateau);

  // 2. Decide o futuro do planejamento (Mesociclo)
  let mesocycle: MesocycleTransition = {
    action: "continue_current",
    recommendedNextPhase: null,
    justification: "Tendências preditivas estáveis. O bloco de treinamento atual está gerando adaptações positivas."
  };

  if (fatigue.timeToCriticalFatigueDays !== null && fatigue.timeToCriticalFatigueDays <= 7) {
    mesocycle = {
      action: "initiate_deload",
      recommendedNextPhase: "resensitization",
      justification: "Fadiga crítica prevista para os próximos 7 dias. Necessário Deload para dissipar fadiga antes do próximo bloco."
    };
  } else if (plateau.plateauProbability > 0.75 && currentPhase === "hypertrophy") {
    mesocycle = {
      action: "transition_phase",
      recommendedNextPhase: "strength",
      justification: "Alta probabilidade de estagnação hipertrófica. Transição para bloco de força recomendada para criar novo lastro tensional."
    };
  }

  return {
    timestamp: new Date().toISOString(),
    fatigueForecast: fatigue,
    plateauPrediction: plateau,
    retentionPrediction: retention,
    mesocycleDecision: mesocycle
  };
}
