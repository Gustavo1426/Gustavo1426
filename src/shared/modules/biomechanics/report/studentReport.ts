/**
 * ============================================================================
 * WORKOUT ACADEMIA - BIOMECHANICS AI MODULE: STUDENT REPORT GENERATOR
 * ============================================================================
 */

import { BiomechanicalFinding } from "../types/biomechanical.types";
import { BiomechanicalScore } from "../types/score.types";
import { RecommendationEngineOutput } from "../types/recommendation.types";
import { StudentReport } from "../types/report.types";

/**
 * Produz a versão focada no aluno, priorizando clareza, empatia e sem jargões clínicos pesados.
 */
export function createStudentReport(
  findings: BiomechanicalFinding[],
  score: BiomechanicalScore,
  recommendations: RecommendationEngineOutput
): StudentReport {
  
  const positivePoints: string[] = [];
  const growthPoints: string[] = [];

  // 1. Identificar forças corporais
  if (score.symmetry >= 80) {
    positivePoints.push("Excelente simetria de força e equilíbrio entre o lado esquerdo e direito.");
  } else {
    positivePoints.push("Boa estabilização e controle basal nos movimentos unilaterais.");
  }

  if (score.risk >= 80) {
    positivePoints.push("Ótima integridade articular. Suas articulações respondem de forma segura.");
  }

  // 2. Traduzir achados para pontos de evolução do aluno
  findings.forEach(finding => {
    if (finding.id === "shoulder_anteriorization") {
      growthPoints.push("Melhorar a postura e o posicionamento dos ombros (evitar que fiquem projetados para frente).");
    } else if (finding.id === "knee_valgus_tendency") {
      growthPoints.push("Desenvolver o controle e a estabilidade dos joelhos, impedindo que se aproximem nas cargas de agachamento.");
    } else {
      growthPoints.push(`Ajustar alinhamento na região: ${finding.name}.`);
    }
  });

  if (growthPoints.length === 0) {
    growthPoints.push("Nenhum desvio importante. Foco total em lapidar a técnica em cargas altas.");
  }

  // 3. Próximos passos
  const nextSteps = recommendations.mobilityRecommendations
    .map(r => `Mobilidade: ${r.title}`)
    .concat(recommendations.stabilityRecommendations.map(r => `Estabilidade: ${r.title}`));

  return {
    overallScore: score.overall,
    classification: score.classification,
    emotionalHeadline: score.feedbackMessage,
    positivePoints,
    growthPoints,
    nextSteps: nextSteps.slice(0, 3) // Limita a 3 recomendações chave
  };
}
