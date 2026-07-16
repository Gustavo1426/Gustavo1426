/**
 * ============================================================================
 * WORKOUT ACADEMIA - BIOMECHANICS AI MODULE: REPORT ENGINE CORE
 * ============================================================================
 */

import { BodyAnalysisOutput } from "../types/body-analysis.types";
import { BiomechanicalFinding } from "../types/biomechanical.types";
import { BiomechanicalScore } from "../types/score.types";
import { RecommendationEngineOutput } from "../types/recommendation.types";
import { FullBiomechanicalReport, EvolutionPoint } from "../types/report.types";
import { generateVisualAnnotations } from "./visualAnnotation";
import { createStudentReport } from "./studentReport";
import { createProfessionalReport } from "./professionalReport";

/**
 * Orquestrador principal do Report Engine.
 * Reúne dados de todos os motores prévios e compila o laudo biomecânico integrado.
 */
export async function runReportEngine(
  studentId: string,
  studentName: string,
  analysis: BodyAnalysisOutput,
  findings: BiomechanicalFinding[],
  score: BiomechanicalScore,
  recommendations: RecommendationEngineOutput,
  historyPoints: EvolutionPoint[] = []
): Promise<FullBiomechanicalReport> {
  
  const currentDateStr = "15/07/2026"; // Respeitando a data de escopo do projeto

  // 1. Gera anotações de plotagem de imagem para a renderização visual de pins
  const visualAnnotations = generateVisualAnnotations(findings, analysis);

  // 2. Compila a seção voltada para o Aluno (Linguagem Acessível)
  const studentSection = createStudentReport(findings, score, recommendations);

  // 3. Compila a seção voltada para o Professor (Linguagem Técnica)
  const professionalSection = createProfessionalReport(findings, analysis, recommendations);

  // 4. Integra o histórico de evolução incluindo o ponto gerado na análise de hoje
  const currentPoint: EvolutionPoint = { date: currentDateStr, score: score.overall };
  const evolutionHistory = [...historyPoints.filter(p => p.date !== currentDateStr), currentPoint];

  return {
    studentId,
    studentName,
    date: currentDateStr,
    overallScore: score.overall,
    classification: score.classification,
    visualAnnotations,
    studentSection,
    professionalSection,
    evolutionHistory
  };
}
