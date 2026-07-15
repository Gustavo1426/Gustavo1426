import synergistsData from "@/src/data/synergists.json";
import { Workout } from "@/src/shared/modules/training/engines/volumeEngine";
import { mapNameToMuscleGroup } from "@/src/shared/modules/training/engines/exerciseEngine";

const synergistFactors: Record<string, Record<string, number>> = synergistsData;

export interface SynergyStats {
  direto: number;
  indireto: number;
  total: number;
}

/**
 * Calculates both direct and indirect synergistic volume for all muscle groups in a week of workouts.
 */
export function calculateSynergyVolume(workouts: Workout[]): Record<string, SynergyStats> {
  const stats: Record<string, SynergyStats> = {};
  
  const muscleGroups = [
    "Peitoral", "Costas", "Quadríceps", "Posteriores de Coxa", "Ombros", 
    "Bíceps", "Tríceps", "Panturrilhas", "Glúteos", "Adutores", "Core", "Eretores da Espinha"
  ];
  
  // Initialize
  muscleGroups.forEach(m => {
    stats[m] = { direto: 0, indireto: 0, total: 0 };
  });
  
  workouts.forEach(wk => {
    if (!wk || !Array.isArray(wk.exercises)) return;
    wk.exercises.forEach(ex => {
      const nameLower = (ex.name || "").toLowerCase();
      // Skip warmups
      if (
        nameLower.includes("aquecimento geral") ||
        nameLower.includes("mobilidade dinâmica") ||
        nameLower.includes("séries de adaptação") ||
        nameLower.includes("series de adaptacao")
      ) {
        return;
      }
      
      let mGroup = ex.muscleGroup || mapNameToMuscleGroup(ex.name);
      const sets = ex.sets || 0;
      
      if (mGroup && muscleGroups.includes(mGroup)) {
        if (!stats[mGroup]) stats[mGroup] = { direto: 0, indireto: 0, total: 0 };
        stats[mGroup].direto += sets;
        stats[mGroup].total += sets;
      }
      
      // Look up synergist factors
      const factors = synergistFactors[ex.name];
      if (factors) {
        Object.keys(factors).forEach(sin => {
          const factor = factors[sin];
          const indirectSets = sets * factor;
          if (!stats[sin]) stats[sin] = { direto: 0, indireto: 0, total: 0 };
          stats[sin].indireto += indirectSets;
          stats[sin].total += indirectSets;
        });
      }
    });
  });
  
  // Format to 1 decimal place
  Object.keys(stats).forEach(m => {
    stats[m].direto = parseFloat(stats[m].direto.toFixed(1));
    stats[m].indireto = parseFloat(stats[m].indireto.toFixed(1));
    stats[m].total = parseFloat(stats[m].total.toFixed(1));
  });
  
  return stats;
}

export function normalizeMuscleName(muscle: string): string {
    if (!muscle) return "Outros";
    const m = muscle.toLowerCase().trim()
        .normalize("NFD").replace(/[\u0300-\u036f]/g, ""); // remove accents
    
    if (m.includes("peito") || m.includes("peitoral")) return "Peitoral";
    if (m.includes("costas") || m.includes("dorsal") || m.includes("dorsais")) return "Costas";
    if (m.includes("quadriceps") || m.includes("quads")) return "Quadríceps";
    if (m.includes("posterior") || m.includes("isquiotibiais") || m.includes("hamstring")) return "Posteriores de Coxa";
    if (m.includes("ombro") || m.includes("deltoid") || m.includes("deltoide")) return "Ombros";
    if (m.includes("biceps")) return "Bíceps";
    if (m.includes("triceps")) return "Tríceps";
    if (m.includes("panturrilha") || m.includes("calf") || m.includes("calves")) return "Panturrilhas";
    if (m.includes("glute") || m.includes("gluteo")) return "Glúteos";
    if (m.includes("adutor") || m.includes("adductor")) return "Adutores";
    if (m.includes("core") || m.includes("abdominal") || m.includes("abs")) return "Core";
    if (m.includes("eretor") || m.includes("lombar") || m.includes("espinha")) return "Eretores da Espinha";
    
    return muscle.charAt(0).toUpperCase() + muscle.slice(1);
}

export function getSynergyKey(muscleName: string): string {
    const norm = normalizeMuscleName(muscleName);
    if (norm === "Quadríceps") return "Quadriceps";
    if (norm === "Posteriores de Coxa") return "Posteriores";
    if (norm === "Glúteos") return "Gluteos";
    if (norm === "Bíceps") return "Biceps";
    if (norm === "Tríceps") return "Triceps";
    if (norm === "Eretores da Espinha") return "Eretores";
    return norm;
}

