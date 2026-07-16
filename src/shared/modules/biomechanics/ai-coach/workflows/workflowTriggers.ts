/**
 * ============================================================================
 * WORKOUT ACADEMIA - PHASE 2.2: AI COACH ENGINE (V2) - WORKFLOW TRIGGERS
 * ============================================================================
 */

import { WorkflowTrigger } from "../typesV2";

/**
 * Avalia gatilhos de engajamento baseados no ciclo de treino do aluno.
 * Integrado com NotificationService.
 */
export function evaluateWorkflowTriggers(daysInCycle: number): WorkflowTrigger | null {
  // O ciclo CAX padrão de contato automatizado é de 21 dias
  if (daysInCycle === 21) {
    return {
      title: "Como está sendo a adaptação?",
      body: "Já se passaram 21 dias desde o nosso último ajuste de ciclo. O corpo já se acostumou com o novo volume?",
      dataPayload: { action: "open_feedback_modal", cycleDay: "21" },
      scheduledFor: new Date().toISOString()
    };
  }
  return null;
}
