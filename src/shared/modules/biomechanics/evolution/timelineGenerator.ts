/**
 * ============================================================================
 * WORKOUT ACADEMIA - PHASE 1.8: EVOLUTION ENGINE (V2) - TIMELINE GENERATOR
 * ============================================================================
 */

import { PastAssessment, ClinicalEvolution, TimelineEvent } from "./types";

/**
 * Constrói a linha do tempo de evolução biomecânica baseada em avaliações e mudanças clínicas.
 */
export function buildEvolutionTimeline(
  assessments: PastAssessment[],
  clinicalChanges: ClinicalEvolution
): TimelineEvent[] {
  const events: TimelineEvent[] = [];

  // Mapeia todas as avaliações como eventos âncora
  assessments.forEach((assessment, index) => {
    events.push({
      date: assessment.date,
      type: "assessment",
      title: index === 0 ? "Avaliação Inicial" : "Reavaliação Biomecânica",
      description: `Índice Global Biomecânico (IGB): ${assessment.scores.globalScore}/100`
    });
  });

  // Insere eventos de conquistas (Melhorias)
  clinicalChanges.resolvedIssues.forEach(issue => {
    events.push({
      date: new Date().toISOString(), // Data atual da nova avaliação
      type: "improvement",
      title: "Padrão Corrigido!",
      description: `O trabalho deu resultado: ${issue.interpretation} foi resolvido.`
    });
  });

  // Insere alertas
  clinicalChanges.newIssues.forEach(issue => {
    events.push({
      date: new Date().toISOString(),
      type: "attention",
      title: "Novo Ponto de Atenção",
      description: `Detectamos: ${issue.interpretation}. O treino será ajustado.`
    });
  });

  // Ordena do mais recente para o mais antigo (Decrescente)
  return events.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}
