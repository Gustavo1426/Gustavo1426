/**
 * ============================================================================
 * WORKOUT ACADEMIA - PHASE 1.8: EVOLUTION ENGINE (V2) - MAIN ORCHESTRATOR
 * ============================================================================
 */

import { HistoricalAssessment, EvolutionAnalysisResult } from "../types/evolution.types";
import { calculateEvolutionScore } from "./evolutionScore";
import { compareAssessments } from "./assessmentComparator";
import { analyzeRegionProgress } from "./progressAnalyzer";
import { detectImprovements } from "./improvementDetector";
import { detectRegressions } from "./regressionDetector";
import { generateWorkoutEngineTriggers, generateTrainingAdjustments } from "./workoutAdjustmentBridge";

import { PastAssessment, EvolutionReport } from "./types";
import { compareRegionalScores } from "./regionalEvolution";
import { trackClinicalFindings } from "./findingTracker";
import { buildEvolutionTimeline } from "./timelineGenerator";

/**
 * Sobrecarga 1: Assinatura da Fase 1.8 V2.
 * Entrega dados visuais prontos e direcionamentos para o Exercise Engine.
 */
export function runEvolutionEngine(
  studentId: string, 
  history: PastAssessment[],
  newAssessment: PastAssessment
): EvolutionReport;

/**
 * Sobrecarga 2: Assinatura Legada.
 * Responsável por cruzar registros históricos, apontar progresso ou regressão e sinalizar adaptações de treino.
 */
export function runEvolutionEngine(
  previous: HistoricalAssessment,
  current: HistoricalAssessment
): Promise<EvolutionAnalysisResult>;

/**
 * Implementação unificada das assinaturas do Evolution Engine.
 */
export function runEvolutionEngine(
  arg1: any,
  arg2: any,
  arg3?: any
): any {
  // Se for a assinatura da Fase 1.8 V2 (onde o primeiro parâmetro é o ID do aluno como string)
  if (typeof arg1 === "string") {
    const studentId = arg1;
    const history = arg2 as PastAssessment[];
    const newAssessment = arg3 as PastAssessment;

    const lastAssessment = history[history.length - 1] || newAssessment;

    // 1. Calcula os deltas regionais (Melhoria 1)
    const regionalEvolution = compareRegionalScores(lastAssessment.scores.regional, newAssessment.scores.regional);

    // 2. Rastrea a evolução clínica das disfunções
    const clinicalEvolution = trackClinicalFindings(lastAssessment.findings, newAssessment.findings);

    // 3. Constrói a linha do tempo de conquistas (Melhoria 2)
    const timeline = {
      studentId,
      events: buildEvolutionTimeline([...history, newAssessment], clinicalEvolution)
    };

    // 4. Gera o gatilho para o Workout Engine (Melhoria 3)
    const trainingAdjustments = generateTrainingAdjustments(clinicalEvolution);

    // Calcula o tempo em dias entre as duas avaliações
    const oldDate = new Date(lastAssessment.date);
    const newDate = new Date(newAssessment.date);
    const daysBetween = Math.max(0, Math.round(Math.abs((newDate.getTime() - oldDate.getTime()) / (1000 * 60 * 60 * 24)))) || 0;

    return {
      studentId,
      daysBetweenAssessments: daysBetween,
      regionalEvolution,
      timeline,
      trainingAdjustments
    };
  }

  // Caso contrário, executa a lógica da assinatura legada
  const previous = arg1 as HistoricalAssessment;
  const current = arg2 as HistoricalAssessment;

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

  return Promise.resolve({
    improvements,
    regressions,
    maintainedIssues,
    evolutionScore,
    metricChanges,
    areaProgressions,
    workoutEngineAdjustmentFlags
  });
}
