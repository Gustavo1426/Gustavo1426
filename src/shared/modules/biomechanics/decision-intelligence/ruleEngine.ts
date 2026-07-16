/**
 * ============================================================================
 * WORKOUT ACADEMIA - BIOMECHANICS AI MODULE: RULE ENGINE
 * ============================================================================
 */

import { DecisionContext, ProposedAction } from "../types/decision.types";

/**
 * Avalia as condições estáticas do aluno e gera intenções/ações propostas.
 */
export function evaluateRules(context: DecisionContext): ProposedAction[] {
  const proposals: ProposedAction[] = [];

  // Regra 1: Progressão de Volume/Carga
  if (
    context.workoutHistory.adherence >= context.goalPolicy.minAdherenceRequiredForProgression &&
    context.performance.fatigueLevel < context.goalPolicy.maxFatigueTolerance &&
    context.biomechanics.igb > 75 &&
    context.performance.isProgressing
  ) {
    proposals.push({
      source: "PerformanceEngine",
      actionType: "IncreaseVolume",
      urgency: 60,
      reason: "Adesão alta, IGB estável e fadiga dentro da tolerância da política."
    });
  }

  // Regra 2: Proteção Biomecânica / Risco
  if (context.biomechanics.evolutionDelta < 0 || context.biomechanics.igb < 60) {
    proposals.push({
      source: "BiomechanicalEngine",
      actionType: "DecreaseVolume",
      urgency: 90,
      reason: "Queda no Índice Global Biomecânico detectada. Risco de lesão elevado."
    });
  }

  // Regra 3: Deload por Fadiga
  if (context.performance.fatigueLevel >= context.goalPolicy.maxFatigueTolerance) {
    proposals.push({
      source: "RecoveryEngine",
      actionType: "Deload",
      urgency: 85,
      reason: "Nível de fadiga ultrapassou o teto da política atual."
    });
  }

  // Fallback: Se nenhuma regra for ativada, manter.
  if (proposals.length === 0) {
    proposals.push({
      source: "BaselineRule",
      actionType: "Maintain",
      urgency: 10,
      reason: "Nenhum gatilho de progressão ou regressão atingido."
    });
  }

  return proposals;
}
