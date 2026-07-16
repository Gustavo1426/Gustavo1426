/**
 * ============================================================================
 * WORKOUT ACADEMIA - BIOMECHANICS AI MODULE: TWIN PREDICTIONS ENGINE
 * ============================================================================
 */

import { DigitalTwin, TwinPrediction } from "../types/digitalTwin.types";

/**
 * Atualiza os vetores de risco e tendências baseado no estado atual do Twin.
 */
export function updatePredictions(twin: DigitalTwin): TwinPrediction {
  let churnRisk: "low" | "medium" | "high" = "low";
  if (twin.training.adherencePercentage < 50 || twin.training.consistencyScore < 40) {
    churnRisk = "high";
  } else if (twin.training.adherencePercentage < 75) {
    churnRisk = "medium";
  }

  let injuryRisk: "low" | "medium" | "high" = "low";
  if (twin.biomechanics.igb < 60 || twin.recovery.fatigueLevel > 85) {
    injuryRisk = "high";
  } else if (twin.biomechanics.igb < 75 || twin.recovery.fatigueLevel > 70) {
    injuryRisk = "medium";
  }

  let expectedEvolutionTrend: "positive" | "stable" | "negative" = "stable";
  if (twin.healthScore && twin.healthScore.score > 80) expectedEvolutionTrend = "positive";
  else if (twin.healthScore && twin.healthScore.score < 60) expectedEvolutionTrend = "negative";

  return { churnRisk, injuryRisk, expectedEvolutionTrend };
}
