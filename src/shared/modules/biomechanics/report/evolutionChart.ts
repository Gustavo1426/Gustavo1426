/**
 * ============================================================================
 * WORKOUT ACADEMIA - BIOMECHANICS AI MODULE: EVOLUTION CHART BUILDER
 * ============================================================================
 */

import { EvolutionPoint } from "../types/report.types";
import { generateVisualProgressBar } from "./scoreVisualization";

/**
 * Processa a linha do tempo e calcula a curva histórica de evolução do aluno.
 */
export function generateEvolutionTracker(history: EvolutionPoint[]): {
  timeline: string;
  totalProgress: number;
} {
  if (history.length < 2) {
    return { timeline: "Histórico em construção. Continue treinando para ver sua evolução!", totalProgress: 0 };
  }

  // Ordena por data (mais antigo para o mais recente)
  const sorted = [...history].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const oldest = sorted[0];
  const newest = sorted[sorted.length - 1];
  const totalProgress = newest.score - oldest.score;

  let timeline = "Evolução do IGB: \n";
  sorted.forEach(point => {
    timeline += `• [${point.date}] IGB: ${point.score} ${generateVisualProgressBar(point.score, 8)}\n`;
  });

  return {
    timeline,
    totalProgress
  };
}
