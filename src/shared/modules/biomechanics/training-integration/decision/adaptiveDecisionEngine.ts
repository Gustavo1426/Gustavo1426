/**
 * ============================================================================
 * WORKOUT ACADEMIA - PHASE 2.1: ADAPTIVE DECISION ENGINE (V3) - ORCHESTRATOR
 * ============================================================================
 */

import { SystemEnginesContext, AdaptiveEngineOutput, DailyDirective } from "./types";
import { calculateTrainingDecisionScore } from "./decisionScore";
import { generateWorkoutPayload } from "./workoutPayload";
import { logDecision } from "./decisionHistory";

/**
 * Este motor roda antes de volumeEngine e exerciseEngine para definir as regras do dia.
 */
export function runAdaptiveDecisionEngine(
  context: SystemEnginesContext,
  biomechanicsFocus: string[]
): AdaptiveEngineOutput {
  
  // 1. Calcula o Score de Decisão Unificado
  const decisionScore = calculateTrainingDecisionScore(context);

  // 2. Define a Diretriz com base na nota final
  let directive: DailyDirective = "MAINTAIN";
  if (decisionScore.finalScore < 50) {
    directive = "DELOAD";
  } else if (decisionScore.finalScore > 85) {
    directive = "PUSH";
  }

  // 3. Gera o Payload Matemático para o seu 'volumeEngine.ts' e 'fatigueEngine.ts'
  const payload = generateWorkoutPayload(directive, biomechanicsFocus);

  // 4. Salva o log histórico para o Adaptive Learning
  logDecision(directive, decisionScore.finalScore, context.performanceScore);

  return {
    decisionScore,
    directive,
    payload
  };
}
