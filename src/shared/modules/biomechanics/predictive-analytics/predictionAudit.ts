/**
 * ============================================================================
 * WORKOUT ACADEMIA - BIOMECHANICS AI MODULE: PREDICTION AUDIT LOGGER
 * ============================================================================
 */

import { PredictionAuditLog } from "../types/prediction.types";

export function logPrediction(predictionType: string, confidence: number, result: any): PredictionAuditLog {
  // Salva no banco para que, no futuro, a plataforma compare se a previsão acertou
  return {
    date: new Date().toISOString(),
    predictionType,
    confidence,
    result,
    status: "pending" // Fica pending até que o tempo passe e o sistema valide
  };
}
