/**
 * ============================================================================
 * WORKOUT ACADEMIA - PHASE 2.4: PREDICTIVE ANALYTICS ENGINE - FATIGUE FORECAST
 * ============================================================================
 */

import { DigitalTwinMock, FatigueForecast } from "../types";

/**
 * Preve o acúmulo de fadiga baseado na taxa atual vs. capacidade de recuperação.
 */
export function forecastFatigue(twin: DigitalTwinMock, plannedWeeklyVolume: number): FatigueForecast {
  // Simulação de projeção linear/exponencial
  const dailyAccumulationRate = (plannedWeeklyVolume / twin.performance.estimatedMRV) * 2;
  const netDailyFatigue = dailyAccumulationRate - (twin.recovery.fatigueDecayRate / 10);

  const pred7 = Math.min(100, Math.max(0, twin.recovery.chronicFatigue + (netDailyFatigue * 7)));
  const pred14 = Math.min(100, Math.max(0, twin.recovery.chronicFatigue + (netDailyFatigue * 14)));

  let timeToCritical = null;
  if (netDailyFatigue > 0) {
    const remainingToCritical = 85 - twin.recovery.chronicFatigue; // 85 é a linha vermelha
    timeToCritical = remainingToCritical > 0 ? Math.round(remainingToCritical / netDailyFatigue) : 0;
  }

  return {
    predictedFatigueIn7Days: Math.round(pred7),
    predictedFatigueIn14Days: Math.round(pred14),
    timeToCriticalFatigueDays: timeToCritical
  };
}
