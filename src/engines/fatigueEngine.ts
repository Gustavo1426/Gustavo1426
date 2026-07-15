import { Workout } from "./volumeEngine";
import { calculateSynergyVolume } from "./synergyEngine";
import { getFatigueForTechnique } from "./techniqueEngine";

export interface MuscleFatigue {
  muscle: string;
  score: number;
  status: "Normal" | "Alerta" | "Crítico";
  recommendation: string;
}

/**
 * Calculates local neuromuscular fatigue for each muscle group.
 */
export function calculateSystemicFatigue(workouts: Workout[]): Record<string, MuscleFatigue> {
  const synergy = calculateSynergyVolume(workouts);
  const fatigueReport: Record<string, MuscleFatigue> = {};
  
  Object.keys(synergy).forEach(muscle => {
    const stats = synergy[muscle];
    
    // Sum technique fatigue modifiers for exercises in this muscle group
    let techniqueFatiqueSum = 0;
    workouts.forEach(wk => {
      wk.exercises.forEach(ex => {
        if (ex.muscleGroup === muscle) {
          techniqueFatiqueSum += getFatigueForTechnique(ex.notes);
        }
      });
    });
    
    // Formula: direct volume + 0.4 * indirect volume + technique fatigue score
    const score = parseFloat((stats.direto * 1.0 + stats.indireto * 0.4 + techniqueFatiqueSum).toFixed(1));
    
    let status: "Normal" | "Alerta" | "Crítico" = "Normal";
    let recommendation = "Volume e intensidade adequados para recuperação e hipertrofia.";
    
    if (score > 30) {
      status = "Crítico";
      recommendation = "Risco elevado de overreaching. Reduza as séries ou remova técnicas avançadas.";
    } else if (score > 22) {
      status = "Alerta";
      recommendation = "Volume limítrofe de fadiga. Monitore dores articulares e fadiga central.";
    }
    
    fatigueReport[muscle] = {
      muscle,
      score,
      status,
      recommendation
    };
  });
  
  return fatigueReport;
}

/**
 * Computes an overall systemic score for the whole body's fatigue.
 */
export function getSystemicFatigueIndex(workouts: Workout[]): number {
  const reports = calculateSystemicFatigue(workouts);
  let totalScore = 0;
  let count = 0;
  
  Object.keys(reports).forEach(m => {
    totalScore += reports[m].score;
    count++;
  });
  
  return parseFloat((totalScore / (count || 1)).toFixed(1));
}
