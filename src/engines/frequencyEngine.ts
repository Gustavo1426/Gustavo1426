import { Workout } from "./volumeEngine";

/**
 * Validates and adjusts the number of workout sessions based on weekly frequency.
 * For example, if frequency is 4, we must have exactly 4 workouts.
 */
export function validateAndAlignFrequency(workouts: Workout[], targetFrequency: number): Workout[] {
  const currentLength = workouts.length;
  
  if (currentLength === targetFrequency) {
    return workouts;
  }
  
  if (currentLength < targetFrequency) {
    // Duplicate some workouts or add empty templates
    const alignedWorkouts = [...workouts];
    for (let i = currentLength; i < targetFrequency; i++) {
      const templateIdx = i % currentLength;
      const original = workouts[templateIdx] || { dayName: "Treino", exercises: [] };
      const letter = String.fromCharCode(65 + i);
      
      alignedWorkouts.push({
        dayName: `Treino ${letter} - Complementar / Foco`,
        exercises: original.exercises.map(ex => ({ ...ex }))
      });
    }
    return alignedWorkouts;
  } else {
    // Trim to match frequency
    return workouts.slice(0, targetFrequency);
  }
}

/**
 * Renames workout dayNames to match alphabetical order (Treino A, Treino B, etc.)
 */
export function formatWorkoutNames(workouts: Workout[]): Workout[] {
  return workouts.map((wk, idx) => {
    const letter = String.fromCharCode(65 + idx);
    const parts = wk.dayName.split(" - ");
    const suffix = parts.length > 1 ? parts.slice(1).join(" - ") : "Personalizado";
    return {
      ...wk,
      dayName: `Treino ${letter} - ${suffix}`
    };
  });
}
