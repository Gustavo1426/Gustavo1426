/**
 * ============================================================================
 * WORKOUT ACADEMIA - BIOMECHANICS AI MODULE: DECISION ENGINE
 * ============================================================================
 */

import { GoalPolicyType, FinalDecision } from "../types/decision.types";
import { buildDecisionContext } from "./decisionContextBuilder";
import { evaluateRules } from "./ruleEngine";
import { resolveConflicts } from "./conflictResolver";
import { simulateAction } from "./simulationEngine";
import { calculateConfidence, generateExplanations } from "./explainabilityEngine";
import { createAuditLog } from "./auditEngine";

/**
 * O núcleo principal da Inteligência. Executa a pipeline completa da Etapa 13.
 */
export async function runDecisionIntelligenceEngine(
  studentId: string, 
  policyType: GoalPolicyType
): Promise<FinalDecision | null> {
  
  // 1. Constrói o contexto holístico
  const context = await buildDecisionContext(studentId, policyType);

  // 2. Levanta propostas de todos os motores baseadas nas regras
  const proposals = evaluateRules(context);

  // 3. Resolve conflitos de acordo com a Hierarquia da Política
  const { winningAction, resolvedConflictsLog } = resolveConflicts(proposals, context.goalPolicy);

  // 4. Simula o impacto da ação vencedora no organismo do aluno
  const simulationResult = simulateAction(winningAction, context);

  // Se a simulação for rejeitada (ex: ia gerar muito overtraining), faz fallback para "Maintain" ou "Deload"
  let finalAction = winningAction;
  if (simulationResult === "Rejected") {
    resolvedConflictsLog.push(`Simulação rejeitou ${winningAction.actionType} por risco de extrapolar limites da política.`);
    finalAction = {
      source: "SimulationEngine",
      actionType: "Maintain",
      urgency: 100,
      reason: "Fallback de segurança após simulação reprovada."
    };
  }

  // 5. Calcula nível de certeza matemática da decisão
  const confidence = calculateConfidence(proposals.length, resolvedConflictsLog.length);

  // 6. Gera textos explicativos (Explainability AI)
  const explanations = generateExplanations(finalAction, context);

  // 7. Salva o registro imutável no Audit Log
  const auditLog = createAuditLog(proposals, resolvedConflictsLog, simulationResult);

  const decision: FinalDecision = {
    actionType: finalAction.actionType,
    confidence,
    explanationToStudent: explanations.student,
    explanationToCoach: explanations.coach,
    auditTrail: auditLog
  };

  // Se a confiança for muito baixa, o sistema aborta e solicita intervenção humana (Professor)
  if (confidence < 60) {
    console.warn("ALERTA: Confiança da IA baixa. Solicitando revisão do treinador.");
    return null;
  }

  return decision;
}
