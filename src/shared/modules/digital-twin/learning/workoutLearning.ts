/**
 * ============================================================================
 * WORKOUT ACADEMIA - PHASE 2.3: DIGITAL TWIN ENGINE (V3) - WORKOUT LEARNING
 * ============================================================================
 */

import { DigitalTwin, WorkoutResultPayload } from "../types";

/**
 * Atualiza o Twin com dados profundos após cada sessão de treino.
 */
export function updateTwinFromWorkout(twin: DigitalTwin, workoutData: WorkoutResultPayload): DigitalTwin {
  const updatedTwin: DigitalTwin = {
    ...twin,
    reliability: { ...twin.reliability },
    recovery: { ...twin.recovery },
    performance: { ...twin.performance },
    behavior: { ...twin.behavior }
  };
  
  updatedTwin.lastUpdated = new Date().toISOString();
  
  // Atualiza a Confiabilidade da IA
  updatedTwin.reliability.trainingSessionsAnalyzed += 1;
  updatedTwin.reliability.confidenceScore = Math.min(
    95, 
    30 + (updatedTwin.reliability.trainingSessionsAnalyzed * 0.5)
  );

  // 1. Atualiza Recuperação (Fadiga Crônica baseada em Volume Efetivo e Estresse)
  // Utiliza a sensibilidade individual ao estresse para multiplicar o impacto
  const impactMultiplier = 1 + (twin.recovery.stressSensitivity / 20);
  const fatigueImpact = (workoutData.averageRpe / 10) * (workoutData.effectiveVolume / 100) * impactMultiplier; 
  updatedTwin.recovery.chronicFatigue = Math.min(100, twin.recovery.chronicFatigue + fatigueImpact);

  // 2. Atualiza Performance (Tolerância a Volume via MRV)
  // Aprende com a relação entre RIR, Sentimento e Tensão Mecânica
  if (workoutData.feedbackFeeling === "worse" && workoutData.averageRir < 2) {
    // Treinou muito perto da falha e se sentiu mal: Reduz o teto
    updatedTwin.performance.estimatedMRV = Math.max(10, twin.performance.estimatedMRV - 1);
  } else if (workoutData.feedbackFeeling === "better" && workoutData.mechanicalTension > 70) {
    // Suportou alta tensão e se sentiu bem: Aumenta capacidade de absorção
    updatedTwin.performance.estimatedMRV += 0.5;
  }

  // 3. Atualiza Comportamento (Adesão)
  if (workoutData.skippedExercises.length > 0) {
    updatedTwin.behavior.adherenceScore = Math.max(0, twin.behavior.adherenceScore - 1);
  } else {
    updatedTwin.behavior.adherenceScore = Math.min(100, twin.behavior.adherenceScore + 0.5);
  }

  return updatedTwin;
}
