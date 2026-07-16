/**
 * ============================================================================
 * WORKOUT ACADEMIA - PHASE 2.5.1: DECISION MEMORY ENGINE - LEARNING MEMORY
 * ============================================================================
 */

import { DecisionAction, IntelligenceDecision } from "../types/decisionTypes";

export interface ActionFrequency {
  action: DecisionAction;
  frequency: number;
}

export interface StudentLearningProfile {
  studentId: string;
  successfulActions: ActionFrequency[];
  failedActions: ActionFrequency[];
  personalThresholds: {
    maxVolumeTolerance: number;
    fatigueBurnoutPoint: number;
    optimalRir: number;
  };
}

/**
 * Analisa a decisão que o Rule Engine quer tomar e confronta com o DNA do aluno.
 * Retorna a decisão ajustada (se a memória provar que a teoria falha na prática).
 */
export function applyMemoryCorrection(
  proposedDecision: IntelligenceDecision, 
  learningProfile: StudentLearningProfile
): IntelligenceDecision {
  
  const correctedDecision = { ...proposedDecision };
  
  // Busca se essa mesma ação já falhou muito no passado para esse aluno
  const failureHistory = learningProfile.failedActions.find(a => a.action === proposedDecision.action);
  const successHistory = learningProfile.successfulActions.find(a => a.action === proposedDecision.action);

  // Se a ação já falhou repetidamente (Ex: INCREASE_VOLUME sempre causa lesão no João)
  if (failureHistory && failureHistory.frequency >= 3) {
    // Rebaixa a confiança da IA
    correctedDecision.confidence -= 0.30;
    
    // Se a confiança cair muito, a IA desiste e troca a ação para algo conservador
    if (correctedDecision.confidence < 0.60) {
      correctedDecision.action = "MAINTAIN";
      correctedDecision.reason += ` | [Correção via Memória]: Histórico indica que ${proposedDecision.action} gera falha adaptativa para este perfil. Mantendo o volume atual.`;
    }
  }

  // Se a ação tem alto índice de sucesso no passado (Reforço Positivo)
  if (successHistory && successHistory.frequency >= 3) {
    correctedDecision.confidence = Math.min(1.0, correctedDecision.confidence + 0.15);
    correctedDecision.reason += ` | [Reforço via Memória]: Perfil responde historicamente bem a esta intervenção.`;
  }

  return correctedDecision;
}

/**
 * Fluxo de execução de exemplo demonstrando onde a Memória entra.
 */
export function executeDecisionFlow(
  rawDecisionsFromRules: IntelligenceDecision[], 
  learningProfile: StudentLearningProfile
): IntelligenceDecision {
  
  // 1. Prioriza a decisão baseada na lógica fria (Segurança > Recuperação > ...)
  const topRuleDecision = rawDecisionsFromRules[0]; // Assumindo que já passou pelo prioritizeDecisions()

  // 2. Consulta a Memória: Bate a decisão fria contra o DNA do aluno
  const finalDecision = applyMemoryCorrection(topRuleDecision, learningProfile);

  return finalDecision;
}
