/**
 * ============================================================================
 * WORKOUT ACADEMIA - BIOMECHANICS AI MODULE: SCORE CALCULATOR & CLASSIFICATION
 * ============================================================================
 */

import { BodyAnalysisOutput } from "../types/body-analysis.types";
import { BiomechanicalFinding } from "../types/biomechanical.types";
import { BiomechanicalScore, IGBClassification, SCORE_WEIGHTS } from "../types/score.types";
import { calculatePostureScore } from "./postureScore";
import { calculateSymmetryScore } from "./symmetryScore";
import { calculateAlignmentScore } from "./alignmentScore";
import { calculateMobilityScore } from "./mobilityScore";
import { calculateRiskScore } from "./riskScore";

/**
 * Classifica a pontuação final do IGB em quadrantes qualitativos.
 */
export function classifyScore(score: number): IGBClassification {
  if (score >= 90) return "excellent";
  if (score >= 75) return "good";
  if (score >= 60) return "attention";
  return "critical";
}

/**
 * Retorna uma orientação amigável baseada na classificação do IGB.
 */
export function getFeedbackMessage(classification: IGBClassification): string {
  switch (classification) {
    case "excellent":
      return "Excelente organização biomecânica geral. Continue assim para potencializar seus treinos de forma segura!";
    case "good":
      return "Boa organização biomecânica geral, com pontos específicos para evolução técnica nos exercícios.";
    case "attention":
      return "Foram identificados alguns padrões que requerem atenção. Recomenda-se focar em exercícios corretivos de mobilidade e estabilidade.";
    case "critical":
      return "Sua avaliação indica prioridade biomecânica. Ajustes preventivos nas cargas e estratégias de treino são recomendados para evitar lesões.";
  }
}

/**
 * Orquestrador principal do Scoring Engine.
 * Consolida as sub-notas de cada sub-região e calcula o IGB (Índice Global Biomecânico).
 */
export function runScoringEngine(
  analysis: BodyAnalysisOutput,
  findings: BiomechanicalFinding[]
): BiomechanicalScore {
  
  // 1. Calcula os scores de cada componente isolado
  const posture = calculatePostureScore(findings);
  const symmetry = calculateSymmetryScore(analysis, findings);
  const alignment = calculateAlignmentScore(analysis, findings);
  const mobility = calculateMobilityScore(findings);
  const risk = calculateRiskScore(findings);

  // 2. Aplica a média ponderada para calcular o IGB geral
  const overallWeighted =
    (posture * SCORE_WEIGHTS.posture) +
    (symmetry * SCORE_WEIGHTS.symmetry) +
    (alignment * SCORE_WEIGHTS.alignment) +
    (mobility * SCORE_WEIGHTS.mobility) +
    (risk * SCORE_WEIGHTS.risk);

  const overall = Math.round(overallWeighted);
  const classification = classifyScore(overall);
  const feedbackMessage = getFeedbackMessage(classification);

  return {
    overall,
    posture,
    symmetry,
    alignment,
    mobility,
    risk,
    classification,
    feedbackMessage
  };
}

/**
 * Compara duas pontuações para demonstrar a evolução ao aluno de forma direta.
 */
export function calculateEvolutionProgress(pastIgb: number, currentIgb: number): string {
  const diff = currentIgb - pastIgb;
  if (diff > 0) {
    return `+${diff} pontos de evolução biomecânica! Excelente progresso.`;
  } else if (diff < 0) {
    return `${diff} pontos de variação. Atenção aos desequilíbrios estruturais recentes.`;
  }
  return "Estabilidade biomecânica mantida desde a última avaliação.";
}
