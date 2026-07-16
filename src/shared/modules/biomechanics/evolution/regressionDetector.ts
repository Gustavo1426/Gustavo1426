/**
 * ============================================================================
 * WORKOUT ACADEMIA - BIOMECHANICS AI MODULE: REGRESSION DETECTOR
 * ============================================================================
 */

import { HistoricalAssessment } from "../types/evolution.types";

/**
 * Monitora retrocessos biomecânicos ou surgimento de novos pontos de atenção.
 */
export function detectRegressions(
  previous: HistoricalAssessment,
  current: HistoricalAssessment
): string[] {
  const regressions: string[] = [];
  const prevFindings = new Set(previous.findings.map(f => f.id));

  // Detecta novos achados que não existiam na avaliação anterior
  current.findings.forEach(curr => {
    if (!prevFindings.has(curr.id)) {
      regressions.push(`Surgimento de novo desvio: [${curr.name}] de intensidade ${curr.severity.toUpperCase()}.`);
    }
  });

  // Detecta se algum achado anterior piorou de severidade
  previous.findings.forEach(prev => {
    const curr = current.findings.find(f => f.id === prev.id);
    if (curr) {
      if (prev.severity === "low" && curr.severity === "high") {
        regressions.push(`Aumento expressivo na severidade de [${prev.name}]: evoluiu para nível crítico.`);
      }
    }
  });

  // Regressão global de IGB
  if (current.score.overall < previous.score.overall) {
    const scoreLoss = previous.score.overall - current.score.overall;
    regressions.push(`Queda de ${scoreLoss} pontos no Índice Global Biomecânico (IGB). Recomendado revisar o volume e distribuição de treinos.`);
  }

  return regressions;
}
