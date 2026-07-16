/**
 * ============================================================================
 * WORKOUT ACADEMIA - BIOMECHANICS AI MODULE: ADAPTIVE LEARNING CORE ORCHESTRATOR
 * ============================================================================
 */

import { LearningOutcome } from "../types/adaptiveLearning.types";
import { mineStrategyEffectiveness } from "./patternMiner";
import { AdaptivePipelineManager } from "./experimentManager";

export const learningPipeline = new AdaptivePipelineManager();

/**
 * Ciclo principal que roda em background (Cron Job semanal, por exemplo)
 * Processa todos os desfechos, minera os padrões e alimenta o Nível 1 do Pipeline.
 */
export async function runAdaptiveLearningCycle(recentOutcomes: LearningOutcome[]) {
  console.log("[Adaptive Learning Engine] Iniciando mineração de coortes...");

  // 1. Minera a eficácia das estratégias usadas recentemente
  const effectivenessData = mineStrategyEffectiveness(recentOutcomes);

  // 2. Alimenta o Pipeline de Observação com as descobertas de alto valor
  effectivenessData.forEach(evidence => {
    learningPipeline.generateHypothesis(evidence);
  });

  return {
    processedOutcomes: recentOutcomes.length,
    patternsMined: effectivenessData.length,
    status: "Cycle Completed"
  };
}
