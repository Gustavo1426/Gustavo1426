/**
 * ============================================================================
 * WORKOUT ACADEMIA - PHASE 2.2: AI COACH ENGINE (V2) - BRIDGE ORCHESTRATOR
 * ============================================================================
 */

import { DailyDirective, CoachContextV2, AiCoachOutput, InteractionHistory } from "./typesV2";
import { generateExplanation } from "./communication/explanationEngine";
import { evaluateWorkflowTriggers } from "./workflows/workflowTriggers";

/**
 * Motor Central do AI Coach.
 * Roda imediatamente após o Adaptive Engine definir o treino do dia.
 */
export function runAiCoachEngine(
  directive: DailyDirective,
  context: CoachContextV2,
  daysInCycle: number
): AiCoachOutput {
  
  // 1. Gera a mensagem humanizada e contextualizada
  const message = generateExplanation(directive, context);

  // 2. Avalia gatilhos de engajamento para o Firebase Cloud Messaging (ou similar)
  const pushNotificationTrigger = evaluateWorkflowTriggers(daysInCycle);

  // 3. Salva a interação no histórico (para alimentar o messagesController.ts ou memória conversacional)
  const historyLog: InteractionHistory = {
    id: `msg_${Date.now()}`,
    date: new Date().toISOString(),
    type: directive === "PUSH" ? "motivation" : "adjustment",
    message: message.body
  };

  return {
    message,
    pushNotificationTrigger,
    historyLog
  };
}
