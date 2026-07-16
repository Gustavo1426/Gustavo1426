/**
 * ============================================================================
 * WORKOUT ACADEMIA - BIOMECHANICS AI MODULE: SCORE VISUALIZATION
 * ============================================================================
 */

import { IGBClassification } from "../types/score.types";

/**
 * Transforma pontuações numéricas em indicadores visuais representados por caracteres de bloco (ASCII progress bar).
 */
export function generateVisualProgressBar(score: number, length: number = 10): string {
  const activeLength = Math.round((score / 100) * length);
  const inactiveLength = length - activeLength;
  
  const activeChar = "█";
  const inactiveChar = "░";

  return `${activeChar.repeat(activeLength)}${inactiveChar.repeat(inactiveLength)}`;
}

/**
 * Retorna a cor/indicador qualitativo da classificação em formato amigável.
 */
export function getClassificationColorTag(classification: IGBClassification): string {
  switch (classification) {
    case "excellent": return "🟢 Excelente";
    case "good": return "🟢 Bom";
    case "attention": return "🟡 Atenção";
    case "critical": return "🔴 Prioridade Biomecânica";
  }
}
