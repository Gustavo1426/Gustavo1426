/**
 * ============================================================================
 * WORKOUT ACADEMIA - BIOMECHANICS AI MODULE: BIOMECHANICS EXPLAINER
 * ============================================================================
 */

import { CoachContext } from "../types/aiCoach.types";

/**
 * Traduz o laudo biomecânico para tirar dúvidas em linguagem acessível e desmistificar medos.
 */
export function explainBiomechanics(question: string, context: CoachContext): string {
  const q = question.toLowerCase();

  if (q.includes("ombro anteriorizado") || q.includes("ombros para frente")) {
    return "Significa que seus ombros apresentam uma tendência a permanecer um pouco mais à frente da linha central do corpo. Isso é muito comum devido ao uso de celulares e computadores. Isso pode influenciar alguns movimentos de empurrar, mas já ajustamos seu treino para corrigir esse padrão de forma natural.";
  }

  if (q.includes("torto") || q.includes("desalinhado") || q.includes("assimetria")) {
    return "Não se preocupe, a avaliação encontrou algumas assimetrias aparentes que são perfeitamente normais e comuns na maioria das pessoas. Elas servem apenas como referência para ajustarmos o volume de exercícios unilaterais (como halteres) e não representam, por si só, nenhum diagnóstico clínico ou problema grave.";
  }

  return `O seu Índice Global Biomecânico (IGB) atual é ${context.assessment.igb}/100. Isso indica como o seu corpo está organizando o movimento e a postura. Estamos sempre monitorando esses dados para proteger suas articulações.`;
}
