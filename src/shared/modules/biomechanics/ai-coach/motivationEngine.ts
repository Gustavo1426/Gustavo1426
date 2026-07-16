/**
 * ============================================================================
 * WORKOUT ACADEMIA - BIOMECHANICS AI MODULE: MOTIVATION ENGINE
 * ============================================================================
 */

import { CoachContext } from "../types/aiCoach.types";

/**
 * Gera mensagens motivacionais baseadas puramente em dados reais de evolução (Gamificação Data-Driven).
 */
export function generateDataDrivenMotivation(context: CoachContext): string {
  if (context.adherence.adherencePercentage >= 85 && context.assessment.evolutionDelta > 0) {
    return `Sua evolução mostra que a consistência está trazendo resultados! Além do aumento de ${context.assessment.evolutionDelta} pontos no seu Índice Biomecânico (IGB), sua assiduidade aos treinos está em excelentes ${context.adherence.adherencePercentage}%. Vamos manter esse ritmo impecável.`;
  }

  if (context.adherence.trend === "dropping") {
    return `Senti sua falta em alguns treinos recentes. Lembre-se que o seu corpo responde à constância. Vamos retomar o ritmo esta semana para não perdermos as adaptações fantásticas que já conquistamos!`;
  }

  return "Cada série executada com controle técnico é um passo a mais em direção ao seu objetivo. Continue focando na qualidade do movimento.";
}
