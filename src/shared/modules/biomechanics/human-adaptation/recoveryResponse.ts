/**
 * ============================================================================
 * WORKOUT ACADEMIA - BIOMECHANICS AI MODULE: RECOVERY RESPONSE
 * ============================================================================
 */

import { FatigueState, RecoveryState } from "../types/adaptation.types";

/**
 * Estima a prontidão de treino do aluno baseada no esvaziamento da fadiga.
 */
export function estimateRecovery(fatigue: FatigueState, sleepQuality: "good" | "bad" = "good"): RecoveryState {
  let readiness = 100 - (fatigue.systemicFatigue * 0.6) - (fatigue.neuralFatigue * 0.4);
  
  if (sleepQuality === "bad") {
    readiness -= 15;
  }

  return {
    muscleReadiness: {}, // Calculado por grupo muscular no futuro
    overallReadiness: Math.max(0, Math.round(readiness))
  };
}
