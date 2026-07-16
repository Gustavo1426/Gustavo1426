/**
 * ============================================================================
 * WORKOUT ACADEMIA - BIOMECHANICS AI MODULE: WORKOUT VOLUME & FATIGUE CALCULATOR
 * ============================================================================
 */

import { ExerciseDatabase } from "./exerciseRegistry";

/**
 * Calcula a tonelagem efetiva e a fadiga muscular sistêmica de um treino
 * utilizando os coeficientes exatos de ativação de cada exercício.
 */
export function calculateSessionMuscleLoad(sessionExercises: { exerciseId: string; sets: number; reps: number }[]) {
  const globalMuscleLoad: Record<string, number> = {};
  let totalSystemicFatigue = 0;

  sessionExercises.forEach(item => {
    const ex = ExerciseDatabase[item.exerciseId];
    if (!ex) return;

    const baseVolume = item.sets * item.reps;
    
    // Distribui o volume com base nos coeficientes de ativação do exercício
    Object.entries(ex.anatomy.activationCoefficients).forEach(([muscle, coefficient]) => {
      if (!globalMuscleLoad[muscle]) globalMuscleLoad[muscle] = 0;
      globalMuscleLoad[muscle] += baseVolume * coefficient;
    });

    // Calcula a carga no Sistema Nervoso Central
    totalSystemicFatigue += (item.sets * ex.dna.systemicFatigue * ex.dna.neuralDemand);
  });

  return {
    muscleVolumeDistribution: globalMuscleLoad,
    estimatedSystemicFatigue: parseFloat(totalSystemicFatigue.toFixed(2))
  };
}
