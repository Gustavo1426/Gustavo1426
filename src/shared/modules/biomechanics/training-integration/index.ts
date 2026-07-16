/**
 * ============================================================================
 * WORKOUT ACADEMIA - BIOMECHANICS AI MODULE: SISTER INTEGRATION ORCHESTRATOR
 * ============================================================================
 */

import { ExerciseMetadata, RawFinding, AdaptedExercise } from "../types/biomechanical-training.types";
import { buildBiomechanicalProfile } from "./biomechanicalAdapter";
import { analyzeTrainingImpacts } from "./trainingImpactAnalyzer";
import { generateConstraints } from "./workoutConstraintEngine";
import { applyModifiersToWorkout } from "./exerciseModifier";
import { generatePreWorkoutActivation } from "./priorityIntegration";

export * from "../types/biomechanical-training.types";
export * from "./biomechanicalAdapter";
export * from "./trainingImpactAnalyzer";
export * from "./workoutConstraintEngine";
export * from "./volumeAdjustment";
export * from "./exerciseModifier";
export * from "./priorityIntegration";

export interface WorkoutAdaptationResult {
  preWorkoutRoutine: string[];
  adaptedExercises: AdaptedExercise[];
  coachSummary: string[];
}

/**
 * Orquestrador principal da Etapa 11 (Integração Biomecânica).
 * Recebe o treino criado pelo Gerador Padrão e os achados da IA Biomecânica,
 * e devolve o Treino 100% Personalizado e Seguro com ajustes de volume,
 * exercícios adaptados e ativações pré-treino adequadas.
 * 
 * @param originalWorkout A lista de exercícios sugerida baseada em objetivo e frequência
 * @param rawFindings Os achados de desvios posturais gerados pela Biomechanics AI
 */
export function runBiomechanicalIntegration(
  originalWorkout: ExerciseMetadata[],
  rawFindings: RawFinding[]
): WorkoutAdaptationResult {
  
  // 1. Traduz os achados biomecânicos para o contexto de hipertrofia/força
  const profile = buildBiomechanicalProfile(rawFindings);

  // 2. Analisa impactos e restrições articulares
  const impacts = analyzeTrainingImpacts(profile);
  const constraints = generateConstraints(profile);

  // 3. Modifica a lista de exercícios (Ajuste de volume, alertas técnicos e substituições)
  const adaptedExercises = applyModifiersToWorkout(originalWorkout, impacts, constraints);

  // 4. Injeta as prioridades de ativação (Aquecimento Inteligente)
  const preWorkoutRoutine = generatePreWorkoutActivation(profile);

  // 5. Gera o sumário gerencial para o Professor aprovar
  const coachSummary = [
    `Restrições Ativas: ${profile.restrictions.length > 0 ? profile.restrictions.join(", ") : "Nenhuma"}`,
    `Ajustes de Volume: ${constraints.some(c => c.action === "increase_posterior_chain") ? "Volume posterior priorizado." : "Proporção padrão mantida."}`,
    `Foco do Aquecimento: ${preWorkoutRoutine.length} exercício(s) de ativação integrados.`
  ];

  return {
    preWorkoutRoutine,
    adaptedExercises,
    coachSummary
  };
}
