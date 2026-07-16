/**
 * ============================================================================
 * WORKOUT ACADEMIA - BIOMECHANICS AI MODULE: EDUCATIONAL RECOMMENDATION
 * ============================================================================
 */

import { BiomechanicalFinding } from "../types/biomechanical.types";
import { BiomechanicalScore } from "../types/score.types";

/**
 * Traduz os relatórios clínicos secos em feedbacks empáticos e de fácil digestão para o aluno e o treinador.
 */
export function generateEducationalFeedback(
  findings: BiomechanicalFinding[], 
  score: BiomechanicalScore
): { studentMessage: string; coachMessage: string } {
  
  let studentMessage = "";
  let coachMessage = "";

  const activeIds = new Set(findings.map(f => f.id));

  // Feedback para o aluno
  if (score.overall >= 85) {
    studentMessage = "Excelente! Seu corpo apresenta um ótimo alinhamento geral. Seu treino continuará focado em ganho de performance com o máximo de segurança.";
  } else {
    let focusPoints = "equilíbrio muscular geral";
    if (activeIds.has("shoulder_anteriorization")) focusPoints = "ajuste postural dos ombros e controle escapular";
    else if (activeIds.has("knee_valgus_tendency")) focusPoints = "estabilidade dos joelhos e quadril";

    studentMessage = `Identificamos alguns pontos em seu corpo que merecem atenção para que você evolua melhor. Seu treino conterá estratégias especiais de aquecimento para trabalharmos o(a) ${focusPoints}, garantindo treinos eficientes, livres de lesões.`;
  }

  // Feedback para o treinador
  const highPriorityCount = findings.filter(f => f.severity === "high").length;
  if (highPriorityCount > 0) {
    coachMessage = `ALERTA DE SEGURANÇA: Aluno apresenta ${highPriorityCount} desvio(s) de alta prioridade. Recomenda-se realizar monitoramento visual constante na execução e ajustar o volume de cargas se houver falha de alinhamento articular.`;
  } else {
    coachMessage = "Métricas dentro dos padrões aceitáveis de controle motor. Prosseguir com a prescrição baseada no objetivo de hipertrofia/força do aluno, incorporando ativações básicas.";
  }

  return {
    studentMessage,
    coachMessage
  };
}
