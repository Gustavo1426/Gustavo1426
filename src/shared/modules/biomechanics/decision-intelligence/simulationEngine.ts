/**
 * ============================================================================
 * WORKOUT ACADEMIA - BIOMECHANICS AI MODULE: SIMULATION ENGINE
 * ============================================================================
 */

import { DecisionContext, ProposedAction } from "../types/decision.types";

/**
 * Simula o impacto da decisão no corpo do aluno antes de aplicá-la definitivamente.
 */
export function simulateAction(action: ProposedAction, context: DecisionContext): "Approved" | "Rejected" {
  let simulatedFatigue = context.performance.fatigueLevel;

  if (action.actionType === "IncreaseVolume") {
    simulatedFatigue += 15; // Projeta o aumento da fadiga
  }

  // Se a simulação indicar que a ação vai estourar o limite da política, a ação é barrada
  if (simulatedFatigue > context.goalPolicy.maxFatigueTolerance + 5) {
    return "Rejected"; // Bloqueia a progressão
  }

  return "Approved";
}
