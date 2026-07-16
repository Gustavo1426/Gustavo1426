/**
 * ============================================================================
 * WORKOUT ACADEMIA - PHASE 2.1: ADAPTIVE DECISION ENGINE (V3) - HISTORY LOG
 * ============================================================================
 */

import { DailyDirective, DecisionHistory } from "./types";

/**
 * Registra a decisão para auditoria e futuro aprendizado de máquina (Adaptive Learning).
 */
export function logDecision(directive: DailyDirective, score: number, perfBefore: number): DecisionHistory {
  const log: DecisionHistory = {
    id: `dec_${Date.now()}`,
    date: new Date().toISOString(),
    directive,
    decisionScore: score,
    performanceBefore: perfBefore,
    performanceAfter: null,
    result: "pending"
  };

  console.log("[Decision History] Log salvo para avaliação futura:", log.id);
  return log;
}
