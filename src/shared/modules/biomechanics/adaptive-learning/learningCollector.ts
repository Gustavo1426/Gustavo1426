/**
 * ============================================================================
 * WORKOUT ACADEMIA - BIOMECHANICS AI MODULE: LEARNING COLLECTOR
 * ============================================================================
 */

import { LearningOutcome } from "../types/adaptiveLearning.types";
import { identifyCohort } from "./cohortBuilder";

/**
 * Coleta os resultados reais após um ciclo de treino e os classifica.
 */
export function analyzeOutcome(
  strategyApplied: string,
  baselineTwin: any,
  currentTwin: any
): LearningOutcome {
  
  const igbDelta = currentTwin.biomechanics.igb - baselineTwin.biomechanics.igb;
  const fatigueDelta = currentTwin.recovery.fatigueLevel - baselineTwin.recovery.fatigueLevel;
  
  let resultStatus: "positive" | "neutral" | "negative" = "neutral";
  
  // Critério de Sucesso: Melhora estrutural (IGB) sem estourar fadiga
  if (igbDelta >= 2 && fatigueDelta < 15) {
    resultStatus = "positive";
  } else if (igbDelta < 0 || fatigueDelta >= 20) {
    resultStatus = "negative";
  }

  return {
    decisionId: `dec_${Date.now()}`,
    date: new Date().toISOString(),
    studentId: currentTwin.identity.id,
    cohortId: identifyCohort(currentTwin),
    strategyApplied,
    expectedResult: "Biomechanics optimization and performance maintenance",
    actualResult: resultStatus,
    metrics: { igbDelta, adherenceDelta: 0, fatigueDelta }
  };
}
