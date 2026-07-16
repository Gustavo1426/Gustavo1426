/**
 * ============================================================================
 * WORKOUT ACADEMIA - PHASE 1.8: EVOLUTION ENGINE (V2) - NARRATIVE GENERATOR
 * ============================================================================
 */

import { ClinicalEvolution, ScoreHistory } from "./types";

/**
 * Gera um texto narrativo descritivo explicando a evolução geral do aluno.
 */
export function generateEvolutionNarrative(
  before: ScoreHistory,
  after: ScoreHistory,
  clinical: ClinicalEvolution
): string {
  const delta = after.globalScore - before.globalScore;
  let text = "";

  if (delta > 5) {
    text += `Evolução altamente positiva! O Índice Global Biomecânico (IGB) subiu de ${before.globalScore} para ${after.globalScore} pontos (+${delta}). `;
  } else if (delta < -5) {
    text += `Atenção necessária. Identificamos uma queda no IGB de ${before.globalScore} para ${after.globalScore} pontos (${delta}). `;
  } else {
    text += `Evolução estável. O IGB se manteve próximo ao patamar anterior, variando de ${before.globalScore} para ${after.globalScore} (${delta >= 0 ? "+" : ""}${delta}). `;
  }

  if (clinical.resolvedIssues.length > 0) {
    const resolvedNames = clinical.resolvedIssues.map(i => i.interpretation).join(", ");
    text += `Tivemos excelentes correções no padrão motor, com a resolução de: ${resolvedNames}. `;
  }

  if (clinical.newIssues.length > 0) {
    const newNames = clinical.newIssues.map(i => i.interpretation).join(", ");
    text += `Contudo, novas compensações ou restrições surgiram e exigem atenção: ${newNames}. `;
  }

  if (clinical.persistentIssues.length > 0) {
    text += `Recomendamos continuar o foco corretivo nos pontos persistentes.`;
  } else if (clinical.resolvedIssues.length > 0) {
    text += `Excelente trabalho de controle e mobilidade corporal.`;
  }

  return text;
}
