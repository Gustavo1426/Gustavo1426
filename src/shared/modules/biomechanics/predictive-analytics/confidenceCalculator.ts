/**
 * ============================================================================
 * WORKOUT ACADEMIA - BIOMECHANICS AI MODULE: PREDICTION CONFIDENCE CALCULATOR
 * ============================================================================
 */

/**
 * Calcula a confiança de uma predição baseada no volume e variância dos dados históricos.
 */
export function calculatePredictionConfidence(dataPoints: number, variance: number): number {
  // Quanto mais dados e menor a variância (ruído), maior a confiança
  let confidence = Math.min(95, dataPoints * 5); // Ex: 20 treinos = 100 (capado em 95)
  confidence -= (variance * 10); // Penaliza se os dados forem muito inconstantes
  return Math.max(15, Math.round(confidence)); 
}
