/**
 * ============================================================================
 * WORKOUT ACADEMIA - BIOMECHANICS AI MODULE: IMPROVEMENT DETECTOR
 * ============================================================================
 */

import { HistoricalAssessment } from "../types/evolution.types";

/**
 * Detecta e elenca melhorias biomecânicas expressivas e seus impactos na saúde do treino.
 */
export function detectImprovements(
  previous: HistoricalAssessment,
  current: HistoricalAssessment
): string[] {
  const improvements: string[] = [];

  // Caso um padrão tenha sumido ou reduzido de severidade
  previous.findings.forEach(prev => {
    const curr = current.findings.find(f => f.id === prev.id);
    
    if (!curr) {
      // Padrão biomecânico nocivo foi eliminado completamente
      improvements.push(`Melhora total no padrão de [${prev.name}] - reduzindo os riscos de estresse articular.`);
    } else if (prev.severity === "high" && (curr.severity === "medium" || curr.severity === "low")) {
      // Houve redução na gravidade do desvio
      improvements.push(`Redução de gravidade na disfunção de [${prev.name}] de Crítica para Moderada.`);
    }
  });

  return improvements;
}
