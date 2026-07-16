/**
 * ============================================================================
 * WORKOUT ACADEMIA - BIOMECHANICS AI MODULE: CONFLICT RESOLVER
 * ============================================================================
 */

import { ProposedAction, TrainingPolicy } from "../types/decision.types";

/**
 * Resolve conflitos quando motores sugerem ações opostas (ex: Aumentar vs Diminuir Volume).
 */
export function resolveConflicts(proposals: ProposedAction[], policy: TrainingPolicy): {
  winningAction: ProposedAction;
  resolvedConflictsLog: string[];
} {
  const resolvedConflictsLog: string[] = [];
  
  // Ordena as propostas pela urgência absoluta (Segurança/Deload geralmente tem urgência > 80)
  proposals.sort((a, b) => b.urgency - a.urgency);

  const highestUrgencyAction = proposals[0];

  // Identifica se há conflito direto (ex: Increase vs Decrease/Deload)
  const isIncreasing = proposals.some(p => p.actionType === "IncreaseVolume");
  const isDecreasing = proposals.some(p => p.actionType === "DecreaseVolume" || p.actionType === "Deload");

  if (isIncreasing && isDecreasing) {
    resolvedConflictsLog.push("Conflito detectado: Performance solicitou progressão, mas Biomecânica/Recovery solicitou regressão.");
    
    // A política dita quem vence. Se "safety" ou "recovery" vier antes de "performance", a regressão vence.
    const safetyIndex = Math.min(
      policy.priorityHierarchy.indexOf("safety"), 
      policy.priorityHierarchy.indexOf("biomechanics")
    );
    const performanceIndex = policy.priorityHierarchy.indexOf("performance");

    if (safetyIndex < performanceIndex) {
      resolvedConflictsLog.push("Resolução: A Política atual prioriza Segurança/Biomecânica sobre Performance. Regressão aplicada.");
      return { 
        winningAction: proposals.find(p => p.actionType === "DecreaseVolume" || p.actionType === "Deload")!, 
        resolvedConflictsLog 
      };
    }
  }

  return { winningAction: highestUrgencyAction, resolvedConflictsLog };
}
