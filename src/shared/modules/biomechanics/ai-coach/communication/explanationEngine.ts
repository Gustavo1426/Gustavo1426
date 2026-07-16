/**
 * ============================================================================
 * WORKOUT ACADEMIA - PHASE 2.2: AI COACH ENGINE (V2) - EXPLANATION ENGINE
 * ============================================================================
 */

import { DailyDirective, CoachContextV2, CoachMessage } from "../typesV2";

/**
 * Determina o tom do feedback com base na diretriz de treino recomendada.
 */
export function determineTone(directive: DailyDirective): string {
  return directive === "PUSH" ? "motivational" : "cautious";
}

/**
 * Transforma dados técnicos e decisões em narrativas personalizadas via CoachContext.
 */
export function generateExplanation(
  directive: DailyDirective, 
  context: CoachContextV2
): CoachMessage {
  
  const message: CoachMessage = {
    headline: `Bom treino, ${context.studentName}!`,
    body: "Seu treino de hoje está pronto e alinhado com seus objetivos.",
    callToAction: "Bora treinar!"
  };

  if (directive === "DELOAD") {
    message.headline = `Ajuste inteligente para hoje, ${context.studentName} 🛡️`;
    message.body = `Nas últimas semanas você evoluiu muito no seu foco de ${context.previousEvolution}. Hoje vamos priorizar a qualidade. Seu treino foi ajustado para reduzir riscos, melhorar sua recuperação e preparar seu corpo para o próximo ciclo.`;
    message.callToAction = "Iniciar Treino Adaptado";
  } 
  
  else if (directive === "PUSH") {
    message.headline = `Dia de evoluir, ${context.studentName}! 🚀`;
    message.body = `Seu corpo respondeu muito bem ao último ciclo. Hoje sua recuperação está alta e sua biomecânica está estável. Vamos aproveitar para buscar uma nova progressão rumo ao seu objetivo de ${context.trainingGoal} com total segurança.`;
    message.callToAction = "Iniciar Treino de Alta Performance";
  }

  else if (directive === "RECOVERY_ONLY") {
    message.headline = `Foco na estrutura hoje 🧘`;
    message.body = `Notei que os sinais de fadiga estão altos. Como nosso desafio atual é ${context.currentChallenge}, bloqueei a musculação hoje e preparei uma rotina exclusiva de recuperação e mobilidade.`;
    message.callToAction = "Iniciar Protocolo de Recuperação";
  }

  return message;
}
