import techniquesData from "@/src/data/techniques.json";
import { Workout } from "@/src/shared/modules/training/engines/volumeEngine";

export interface Technique {
  nome: string;
  categoria: string;
  descricao: string;
  instrucao: string;
  nivel_dificuldade: string;
  fator_fadiga: number;
}

const techniquesPool: Technique[] = techniquesData;

/**
 * Normalizes technique name to match keys in the fatigue equivalence mapping.
 */
export function getFatigueForTechnique(notesText: string): number {
  const notesLower = (notesText || "").toLowerCase();
  let totalModifier = 0;
  
  techniquesPool.forEach(tech => {
    const techNameLower = tech.nome.toLowerCase();
    if (notesLower.includes(techNameLower)) {
      totalModifier += tech.fator_fadiga;
    }
  });
  
  return totalModifier;
}

/**
 * Strip or block advanced techniques from exercises if the active mesocycle blocks them.
 */
export function enforceTechniqueRestrictions(
  workouts: Workout[],
  techniquesAllowed: boolean
): Workout[] {
  if (techniquesAllowed) {
    return workouts; // No restrictions
  }
  
  return workouts.map(wk => {
    const updatedExercises = wk.exercises.map(ex => {
      let notes = ex.notes || "";
      
      // Look for techniques to strip/warn
      techniquesPool.forEach(tech => {
        const nameLower = tech.nome.toLowerCase();
        if (notes.toLowerCase().includes(nameLower) && tech.fator_fadiga > 0) {
          // Replace with traditional execution note
          notes = notes.replace(new RegExp(tech.nome, "gi"), "Série Clássica");
          notes += ` (Técnica avançada desativada no Deload/Acumulação)`;
        }
      });
      
      return {
        ...ex,
        notes
      };
    });
    
    return {
      ...wk,
      exercises: updatedExercises
    };
  });
}
