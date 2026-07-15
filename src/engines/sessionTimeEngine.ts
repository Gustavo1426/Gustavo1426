import { Workout, Exercise } from "./volumeEngine";
import { getFatigueForTechnique } from "./techniqueEngine";

/**
 * Estimates the duration of a single workout session in minutes.
 */
export function estimateWorkoutDuration(workout: Workout): number {
  if (!workout || !Array.isArray(workout.exercises)) return 0;
  
  let totalMinutes = 0;
  const numExercises = workout.exercises.length;
  
  // Transition between exercises: ~2 minutes each
  if (numExercises > 1) {
    totalMinutes += (numExercises - 1) * 2;
  }
  
  workout.exercises.forEach(ex => {
    const nameLower = (ex.name || "").toLowerCase();
    const sets = ex.sets || 0;
    
    if (nameLower.includes("aquecimento geral")) {
      totalMinutes += 5; // Fixed 5 minutes
      return;
    }
    
    if (nameLower.includes("mobilidade dinâmica")) {
      totalMinutes += (sets * 3); // 3 minutes per mobility set
      return;
    }
    
    if (nameLower.includes("séries de adaptação") || nameLower.includes("series de adaptacao")) {
      totalMinutes += (sets * 2.5); // 2.5 minutes per adaptation set
      return;
    }
    
    // Standard muscular sets
    const techniqueFatigue = getFatigueForTechnique(ex.notes || "");
    let minutesPerSet = 3; // Default: 45s execution + 2m rest
    
    if (techniqueFatigue > 1.5) {
      minutesPerSet = 4.5; // High impact techniques (e.g. FST-7, Giant sets) require more setup/recovery
    } else if (techniqueFatigue > 0) {
      minutesPerSet = 3.5; // Drop-set, rest-pause adds minor time
    }
    
    totalMinutes += (sets * minutesPerSet);
  });
  
  return Math.ceil(totalMinutes);
}

/**
 * Returns a detailed summary of estimated durations for all workouts in a plan.
 */
export function estimateAllDurations(workouts: Workout[]): Record<string, number> {
  const result: Record<string, number> = {};
  workouts.forEach(wk => {
    result[wk.dayName] = estimateWorkoutDuration(wk);
  });
  return result;
}
