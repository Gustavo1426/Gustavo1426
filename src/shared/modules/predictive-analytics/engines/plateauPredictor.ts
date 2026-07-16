/**
 * ============================================================================
 * WORKOUT ACADEMIA - PHASE 2.4: PREDICTIVE ANALYTICS ENGINE - PLATEAU PREDICTOR
 * ============================================================================
 */

import { DigitalTwinMock, FatigueForecast, PlateauPrediction } from "../types";

/**
 * Analisa a tendência de força e o histórico para prever quando o aluno vai travar.
 */
export function predictPlateau(twin: DigitalTwinMock, fatigueForecast: FatigueForecast): PlateauPrediction {
  let probability = 0.1;
  let weeksUntil = 8;
  let riskFactor = "Adaptação natural ao estímulo";

  if (twin.performance.strengthTrend === "plateau") {
    probability = 0.95;
    weeksUntil = 0;
    riskFactor = "Estagnação já em curso";
  } else if (fatigueForecast.timeToCriticalFatigueDays !== null && fatigueForecast.timeToCriticalFatigueDays < 14) {
    probability = 0.85;
    weeksUntil = Math.max(1, Math.round(fatigueForecast.timeToCriticalFatigueDays / 7));
    riskFactor = "Acúmulo de fadiga crônica limitando supercompensação";
  } else if (twin.performance.historyOfPlateaus > 3) {
    probability = 0.60;
    weeksUntil = 4;
    riskFactor = "Histórico de rápida resistência anabólica (necessita variações frequentes)";
  }

  return { 
    plateauProbability: probability, 
    estimatedWeeksUntilPlateau: weeksUntil, 
    primaryRiskFactor: riskFactor 
  };
}
