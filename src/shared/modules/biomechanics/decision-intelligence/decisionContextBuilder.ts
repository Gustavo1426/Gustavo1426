/**
 * ============================================================================
 * WORKOUT ACADEMIA - BIOMECHANICS AI MODULE: DECISION CONTEXT BUILDER
 * ============================================================================
 */

import { GoalPolicyType, DecisionContext } from "../types/decision.types";
import { Policies } from "./policyDefinitions";

/**
 * Agrupa todas as informações periféricas do ecossistema para formar a base da decisão.
 */
export async function buildDecisionContext(studentId: string, policyType: GoalPolicyType): Promise<DecisionContext> {
  // Simulação de busca no banco de dados
  return {
    studentId,
    goalPolicy: Policies[policyType],
    workoutHistory: { adherence: 88, averageRIR: 2 },
    performance: { isProgressing: true, fatigueLevel: 65 },
    biomechanics: { igb: 82, activeRestrictions: [], evolutionDelta: 5 },
    recovery: { sleepQuality: "good", soreness: "medium" }
  };
}
