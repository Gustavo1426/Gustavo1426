import exercisesData from "@/src/data/exercises.json";
import { Exercise } from "@/src/shared/modules/training/engines/volumeEngine";

/**
 * Maps any exercise name to its respective muscle group scientifically.
 */
export function mapNameToMuscleGroup(name: string): string | null {
  const nameLower = (name || "").toLowerCase();
  
  if (
    nameLower.includes("aquecimento geral") || 
    nameLower.includes("mobilidade dinâmica") || 
    nameLower.includes("séries de adaptação") || 
    nameLower.includes("series de adaptacao")
  ) {
    return null;
  }
  
  if (nameLower.includes("agachamento") || nameLower.includes("leg press") || nameLower.includes("extensora") || nameLower.includes("sissy") || nameLower.includes("hack")) {
    return "Quadríceps";
  } else if (nameLower.includes("flexora") || nameLower.includes("stiff") || nameLower.includes("romanian") || nameLower.includes("coice") || nameLower.includes("nordic") || nameLower.includes("good morning")) {
    return "Posteriores de Coxa";
  } else if (nameLower.includes("elevaçao lateral") || nameLower.includes("elevação lateral") || nameLower.includes("desenvolvimento") || nameLower.includes("arnold") || nameLower.includes("militar") || nameLower.includes("deltoide") || nameLower.includes("shoulder") || nameLower.includes("face pull") || nameLower.includes("crucifixo inverso")) {
    return "Ombros";
  } else if (nameLower.includes("supino") || nameLower.includes("peck deck") || nameLower.includes("crucifixo") || nameLower.includes("voador") || nameLower.includes("cross") || nameLower.includes("chest press")) {
    return "Peitoral";
  } else if (nameLower.includes("puxada") || nameLower.includes("remada") || nameLower.includes("pulldown") || nameLower.includes("dorsal") || nameLower.includes("chin up") || nameLower.includes("pull up") || nameLower.includes("cavalinho") || nameLower.includes("deadlift")) {
    return "Costas";
  } else if (nameLower.includes("rosca") || nameLower.includes("scott") || nameLower.includes("biceps") || nameLower.includes("concentrada") || nameLower.includes("martelo")) {
    return "Bíceps";
  } else if (nameLower.includes("triceps") || nameLower.includes("pulley") || nameLower.includes("testa") || nameLower.includes("corda") || nameLower.includes("paralela")) {
    return "Tríceps";
  } else if (nameLower.includes("panturrilha") || nameLower.includes("gemeos") || nameLower.includes("calf") || nameLower.includes("calves")) {
    return "Panturrilhas";
  } else if (nameLower.includes("abdominal") || nameLower.includes("infra") || nameLower.includes("supra") || nameLower.includes("obliquo") || nameLower.includes("plank") || nameLower.includes("prancha") || nameLower.includes("core")) {
    return "Core";
  } else if (nameLower.includes("adutora") || nameLower.includes("adutor")) {
    return "Adutores";
  } else if (nameLower.includes("abdutora") || nameLower.includes("elevacao de quadril") || nameLower.includes("glute") || nameLower.includes("hip thrust") || nameLower.includes("pelve") || nameLower.includes("abduçao")) {
    return "Glúteos";
  }
  
  return null;
}

/**
 * Filters and replaces exercises if they violate user physical limitations.
 * For example: if lumbar injury, replace heavy squats or deadlifts with machine alternatives.
 */
export function filterAndReplaceByLimitations(
  exercises: Exercise[],
  limitations: string
): Exercise[] {
  const lims = limitations.toLowerCase();
  
  return exercises.map(ex => {
    const nameLower = ex.name.toLowerCase();
    
    // Knee pain/injury
    if (lims.includes("joelho") || lims.includes("artrose joelho") || lims.includes("condromalacia")) {
      if (nameLower.includes("agachamento livre") || nameLower.includes("hack machine")) {
        return {
          ...ex,
          name: "Cadeira Extensora Bilateral (ROM Controlado)",
          notes: `${ex.notes} | AJUSTADO: Amplitude controlada devido a limitação no joelho.`
        };
      }
    }
    
    // Lumbar pain/injury
    if (lims.includes("lombar") || lims.includes("hernia de disco") || lims.includes("hérnia de disco")) {
      if (nameLower.includes("agachamento livre") || nameLower.includes("deadlift") || nameLower.includes("stiff")) {
        return {
          ...ex,
          name: "Leg Press 45° (Costas Apoiadas)",
          notes: `${ex.notes} | AJUSTADO: Substituído por máquina para proteger a região lombar.`
        };
      }
    }
    
    // Shoulder issues
    if (lims.includes("ombro") || lims.includes("manguito")) {
      if (nameLower.includes("supino reto barra") || nameLower.includes("desenvolvimento barra")) {
        return {
          ...ex,
          name: "Supino Reto com Halteres (Pegada Neutra)",
          notes: `${ex.notes} | AJUSTADO: Uso de halteres com pegada neutra para menor estresse no ombro.`
        };
      }
    }
    
    return ex;
  });
}
