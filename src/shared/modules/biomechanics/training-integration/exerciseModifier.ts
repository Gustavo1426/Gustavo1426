/**
 * ============================================================================
 * WORKOUT ACADEMIA - BIOMECHANICS AI MODULE: EXERCISE MODIFIER
 * ============================================================================
 */

import { ExerciseMetadata, TrainingImpact, WorkoutConstraint, AdaptedExercise } from "../types/biomechanical-training.types";
import { adjustVolume } from "./volumeAdjustment";

/**
 * Filtra, altera e comenta a seleção de exercícios baseada nos impactos e restrições.
 */
export function applyModifiersToWorkout(
  originalExercises: ExerciseMetadata[],
  impacts: TrainingImpact[],
  constraints: WorkoutConstraint[]
): AdaptedExercise[] {
  
  const adaptedWorkout: AdaptedExercise[] = [];

  for (const exercise of originalExercises) {
    let shouldAvoid = false;
    let biomechanicalWarning = "";
    let isUnilateralForced = false;

    // 1. Verifica os Impactos Diretos
    for (const impact of impacts) {
      const isAffected = exercise.tags.some(tag => impact.affectedMovementTags.includes(tag));
      
      if (isAffected) {
        if (impact.recommendedAction === "avoid") {
          shouldAvoid = true; // Remove o exercício do treino
          break;
        }
        if (impact.recommendedAction === "monitor") {
          biomechanicalWarning = `Atenção Técnica: ${impact.reason}`;
        }
        if (impact.recommendedAction === "require_unilateral" && exercise.tags.includes("bilateral")) {
          // A lógica do seu backend deve idealmente trocar o ID do exercício (ex: Barbell Squat -> Bulgarian Split Squat)
          // Aqui sinalizamos a necessidade de troca
          isUnilateralForced = true;
          biomechanicalWarning = `Substituição Recomendada: Trocar por variação unilateral. ${impact.reason}`;
        }
      }
    }

    if (shouldAvoid) continue; // Pula este exercício e não o inclui no treino adaptado

    // 2. Calcula o Volume Adaptado
    const adaptedSets = adjustVolume(exercise.baseSets, exercise.tags, constraints);

    adaptedWorkout.push({
      ...exercise,
      adaptedSets,
      biomechanicalWarning,
      isUnilateralForced
    });
  }

  return adaptedWorkout;
}
