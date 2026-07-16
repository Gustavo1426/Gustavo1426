/**
 * ============================================================================
 * WORKOUT ACADEMIA - BIOMECHANICS AI MODULE: EVOLUTION ENGINE CORE ORCHESTRATOR
 * ============================================================================
 */

import { HistoricalAssessment, EvolutionAnalysisResult } from "../types/evolution.types";
import { calculateEvolutionScore } from "./evolutionScore";
import { compareAssessments } from "./assessmentComparator";
import { analyzeRegionProgress } from "./progressAnalyzer";
import { detectImprovements } from "./improvementDetector";
import { detectRegressions } from "./regressionDetector";
import { generateWorkoutEngineTriggers } from "./workoutAdjustmentBridge";

/**
 * Orquestrador principal do Evolution Engine.
 * Responsável por cruzar registros históricos, apontar progresso ou regressão e sinalizar adaptações de treino.
 */
export async function runEvolutionEngine(
  previous: HistoricalAssessment,
  current: HistoricalAssessment
): Promise<EvolutionAnalysisResult> {
  
  if (!previous || !current) {
    throw new Error("Não é possível gerar evolução biomecânica: requer ao menos duas avaliações completas.");
  }

  // 1. Calcula o Score e quadrante de evolução
  const evolutionScore = calculateEvolutionScore(previous, current);

  // 2. Gera a lista de variações numéricas brutas das métricas chaves
  const metricChanges = compareAssessments(previous, current);

  // 3. Mapeia o progresso por grandes áreas e regiões corporais
  const areaProgressions = analyzeRegionProgress(metricChanges);

  // 4. Identifica melhorias e atenuações de disfunções prévias
  const improvements = detectImprovements(previous, current);

  // 5. Aponta eventuais regressões ou o aparecimento de novas restrições posturais
  const regressions = detectRegressions(previous, current);

  // 6. Lista os problemas que persistem e continuam na zona de monitoramento
  const maintainedIssues: string[] = [];
  current.findings.forEach(curr => {
    const wasActive = previous.findings.some(prev => prev.id === curr.id);
    if (wasActive) {
      maintainedIssues.push(`O padrão de [${curr.name}] continua em acompanhamento.`);
    }
  });

  // 7. Gera os sinais de liberação ou manutenção de restrições de força para o Workout Engine
  const workoutEngineAdjustmentFlags = generateWorkoutEngineTriggers(improvements, current.findings);

  return {
    improvements,
    regressions,
    maintainedIssues,
    evolutionScore,
    metricChanges,
    areaProgressions,
    workoutEngineAdjustmentFlags
  };
}
