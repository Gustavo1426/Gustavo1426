import exercisesData from "../data/exercises.json";
import mesocyclesData from "../data/mesocycles.json";

export interface Exercise {
  id?: string;
  name: string;
  sets: number;
  reps: string;
  weight: number;
  notes: string;
  muscleGroup: string;
  category: string;
}

export interface Workout {
  dayName: string;
  exercises: Exercise[];
}

export interface VolumeRange {
  min: number;
  max: number;
}

/**
 * Parses the volume range from a mesocycle volume string (e.g., "Vol: 12-15 séries")
 */
export function parseVolumeRange(volumeStr: string): VolumeRange {
  const matches = String(volumeStr).match(/\d+/g);
  if (matches && matches.length >= 2) {
    return {
      min: parseInt(matches[0], 10),
      max: parseInt(matches[1], 10)
    };
  } else if (matches && matches.length === 1) {
    const val = parseInt(matches[0], 10);
    return { min: val, max: val };
  }
  return { min: 12, max: 15 }; // Default fallback
}

/**
 * Calculates the direct sets for a given muscle group in a workout list
 */
export function calculateDirectVolume(workouts: Workout[], muscleGroup: string): number {
  let totalSets = 0;
  workouts.forEach(wk => {
    if (!wk || !Array.isArray(wk.exercises)) return;
    wk.exercises.forEach(ex => {
      const nameLower = (ex.name || "").toLowerCase();
      if (
        nameLower.includes("aquecimento geral") ||
        nameLower.includes("mobilidade dinâmica") ||
        nameLower.includes("séries de adaptação") ||
        nameLower.includes("series de adaptacao")
      ) {
        return;
      }
      if (ex.muscleGroup === muscleGroup) {
        totalSets += (ex.sets || 0);
      }
    });
  });
  return totalSets;
}

const BACKEND_SINERGISTAS_FACTORS: Record<string, Record<string, number>> = {
  "leg press 45°": { "Glúteos": 0.5, "Posteriores de Coxa": 0.25 },
  "leg press 45": { "Glúteos": 0.5, "Posteriores de Coxa": 0.25 },
  "agachamento livre": { "Glúteos": 0.5, "Posteriores de Coxa": 0.25 },
  "agachamento hack": { "Glúteos": 0.5 },
  "hack machine": { "Glúteos": 0.5 },
  "stiff": { "Glúteos": 0.5 },
  "romanian deadlift": { "Glúteos": 0.7 },
  "supino reto": { "Tríceps": 0.5, "Ombros": 0.5 },
  "supino inclinado": { "Tríceps": 0.5, "Ombros": 0.7 },
  "puxada alta": { "Bíceps": 0.5, "Ombros": 0.5 },
  "remada": { "Bíceps": 0.5 },
  "deadlift": { "Glúteos": 0.7, "Posteriores de Coxa": 0.5, "Quadríceps": 0.5 },
  "desenvolvimento": { "Tríceps": 0.5 }
};

const EQUIVALENCE_FACTORS: Record<string, number> = {
  "Peitoral": 0,
  "Costas": 0,
  "Quadríceps": 0,
  "Posteriores de Coxa": 0.8,
  "Ombros": 0.7,
  "Bíceps": 0.7,
  "Tríceps": 0.7,
  "Glúteos": 0.8,
  "Panturrilhas": 0
};

function getBackendExerciseSinergistas(name: string): Record<string, number> {
  const nameLower = (name || "").toLowerCase();
  for (const [key, factors] of Object.entries(BACKEND_SINERGISTAS_FACTORS)) {
    if (nameLower.includes(key)) {
      return factors;
    }
  }
  return {};
}

function calculateScientificVolume(
  workouts: Workout[],
  muscle: string,
  mapNameToMuscleGroup: (name: string) => string | null
): { direct: number; indirect: number; total: number } {
  let direct = 0;
  let indirect = 0;

  workouts.forEach(wk => {
    if (!wk || !Array.isArray(wk.exercises)) return;
    wk.exercises.forEach(ex => {
      const nameLower = (ex.name || "").toLowerCase();
      if (
        nameLower.includes("aquecimento geral") ||
        nameLower.includes("mobilidade dinâmica") ||
        nameLower.includes("séries de adaptação") ||
        nameLower.includes("series de adaptacao")
      ) {
        return;
      }

      let mGroup = ex.muscleGroup;
      if (!mGroup || mGroup === "Desconhecido") {
        mGroup = mapNameToMuscleGroup(ex.name) || "";
      }

      if (mGroup === muscle) {
        direct += (ex.sets || 0);
      } else {
        const factors = getBackendExerciseSinergistas(ex.name);
        if (factors[muscle] !== undefined) {
          indirect += (ex.sets || 0) * factors[muscle];
        }
      }
    });
  });

  const eq = EQUIVALENCE_FACTORS[muscle] ?? 0;
  const total = direct + (indirect * eq);

  return { direct, indirect, total };
}

/**
 * Audit and adjust workout direct volume to match active mesocycle targets
 */
export function adjustWorkoutVolume(
  workouts: Workout[],
  activeCycleVol: string,
  mapNameToMuscleGroup: (name: string) => string | null,
  availablePool: Record<string, string[]>
): Workout[] {
  const { min, max } = parseVolumeRange(activeCycleVol);
  const musclesOfInterest = [
    "Peitoral", "Costas", "Quadríceps", "Posteriores de Coxa", "Ombros", "Bíceps", "Tríceps", "Glúteos", "Panturrilhas"
  ];

  musclesOfInterest.forEach(muscle => {
    const volStats = calculateScientificVolume(workouts, muscle, mapNameToMuscleGroup);
    let currentVolume = volStats.total;
    let directVolume = volStats.direct;

    const workoutsWithMuscle = workouts.filter(wk => {
      return wk.exercises.some(ex => {
        const nameLower = (ex.name || "").toLowerCase();
        if (
          nameLower.includes("aquecimento geral") ||
          nameLower.includes("mobilidade dinâmica") ||
          nameLower.includes("séries de adaptação") ||
          nameLower.includes("series de adaptacao")
        ) {
          return false;
        }
        let mGroup = ex.muscleGroup || mapNameToMuscleGroup(ex.name);
        return mGroup === muscle;
      });
    });

    if (directVolume > 0 && currentVolume < min) {
      let needed = min - currentVolume;

      // Stage A: Try to increase existing exercises up to 5 sets
      for (const wk of workoutsWithMuscle) {
        for (const ex of wk.exercises) {
          const nameLower = (ex.name || "").toLowerCase();
          if (
            nameLower.includes("aquecimento geral") ||
            nameLower.includes("mobilidade dinâmica") ||
            nameLower.includes("séries de adaptação") ||
            nameLower.includes("series de adaptacao")
          ) {
            continue;
          }
          let mGroup = ex.muscleGroup || mapNameToMuscleGroup(ex.name);
          if (mGroup === muscle && ex.sets < 5 && needed > 0) {
            const add = Math.min(5 - ex.sets, needed);
            ex.sets += add;
            needed -= add;
            currentVolume += add;
          }
        }
      }

      // Stage B: If more is needed, add new exercises
      const availableList = availablePool[muscle] || [];
      if (needed > 0 && workoutsWithMuscle.length > 0 && availableList.length > 0) {
        let wkIdx = 0;
        let poolIdx = 0;
        while (needed > 0 && poolIdx < availableList.length) {
          const targetWk = workoutsWithMuscle[wkIdx % workoutsWithMuscle.length];
          const exName = availableList[poolIdx];
          const exists = targetWk.exercises.some(ex => ex.name === exName);

          if (!exists) {
            const setsToAdd = Math.min(4, needed);
            targetWk.exercises.push({
              name: exName,
              sets: setsToAdd,
              reps: ["Peitoral", "Costas", "Quadríceps", "Posteriores de Coxa", "Glúteos"].includes(muscle) ? "8-12" : "10-15",
              weight: 10,
              notes: `Foco no estímulo de ${muscle}. Execução controlada com cadência de 2s na excêntrica.`,
              muscleGroup: muscle,
              category: "musculacao"
            });
            needed -= setsToAdd;
            currentVolume += setsToAdd;
          }
          poolIdx++;
          wkIdx++;
        }
      }

      // Stage C: Force increase sets of existing exercises up to 8 sets
      if (needed > 0) {
        for (const wk of workoutsWithMuscle) {
          for (const ex of wk.exercises) {
            let mGroup = ex.muscleGroup || mapNameToMuscleGroup(ex.name);
            if (mGroup === muscle && ex.sets < 8 && needed > 0) {
              const add = Math.min(8 - ex.sets, needed);
              ex.sets += add;
              needed -= add;
              currentVolume += add;
            }
          }
        }
      }
    }

    // Adjust downward if volume exceeds maximum
    if (currentVolume > max) {
      let excess = currentVolume - max;
      for (const wk of workoutsWithMuscle) {
        for (let i = wk.exercises.length - 1; i >= 0; i--) {
          const ex = wk.exercises[i];
          const nameLower = (ex.name || "").toLowerCase();
          if (
            nameLower.includes("aquecimento geral") ||
            nameLower.includes("mobilidade dinâmica") ||
            nameLower.includes("séries de adaptação") ||
            nameLower.includes("series de adaptacao")
          ) {
            continue;
          }
          let mGroup = ex.muscleGroup || mapNameToMuscleGroup(ex.name);
          if (mGroup === muscle && excess > 0) {
            if (ex.sets > 2) {
              const reduce = Math.min(ex.sets - 2, excess);
              ex.sets -= reduce;
              excess -= reduce;
              currentVolume -= reduce;
            } else {
              // If sets are already at 2, remove the exercise completely
              wk.exercises.splice(i, 1);
              excess -= ex.sets;
              currentVolume -= ex.sets;
            }
          }
        }
      }
    }
  });

  return workouts;
}
