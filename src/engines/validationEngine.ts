import { Workout } from "./volumeEngine";
import { calculateDirectVolume, parseVolumeRange } from "./volumeEngine";
import { estimateWorkoutDuration } from "./sessionTimeEngine";

export interface ValidationIssue {
  type: "Volume" | "Frequência" | "Segurança" | "Tempo" | "Geral";
  severity: "Alerta" | "Erro";
  message: string;
  muscleGroup?: string;
}

export interface ValidationReport {
  isValid: boolean;
  issues: ValidationIssue[];
}

/**
 * Validates the full workout plan against a set of rules and parameters.
 */
export function validateWorkoutPlan(
  workouts: Workout[],
  targetFrequency: number,
  activeCycleVol: string,
  limitations: string
): ValidationReport {
  const issues: ValidationIssue[] = [];
  const { min, max } = parseVolumeRange(activeCycleVol);
  const lims = limitations.toLowerCase();
  
  // 1. Validate Frequency
  if (workouts.length !== targetFrequency) {
    issues.push({
      type: "Frequência",
      severity: "Erro",
      message: `Número de treinos gerados (${workouts.length}) diverge da frequência semanal requerida (${targetFrequency}).`
    });
  }
  
  // 2. Validate Volume for main muscles
  const mainMuscles = ["Peitoral", "Costas", "Quadríceps", "Posteriores de Coxa", "Ombros", "Bíceps", "Tríceps"];
  mainMuscles.forEach(muscle => {
    const directSets = calculateDirectVolume(workouts, muscle);
    if (directSets > 0) {
      if (directSets < min) {
        issues.push({
          type: "Volume",
          severity: "Alerta",
          message: `O volume semanal de ${muscle} está abaixo do mínimo exigido (${directSets} de ${min} séries).`,
          muscleGroup: muscle
        });
      } else if (directSets > max) {
        issues.push({
          type: "Volume",
          severity: "Alerta",
          message: `O volume semanal de ${muscle} supera o limite máximo recomendado (${directSets} de ${max} séries).`,
          muscleGroup: muscle
        });
      }
    }
  });
  
  // 3. Validate Session Durations
  workouts.forEach(wk => {
    const duration = estimateWorkoutDuration(wk);
    if (duration > 90) {
      issues.push({
        type: "Tempo",
        severity: "Alerta",
        message: `O treino "${wk.dayName}" está muito longo (${duration} minutos). Recomenda-se reduzir exercícios.`
      });
    }
  });
  
  // 4. Validate Safety / Physical Limitations
  if (lims.trim().length > 0) {
    workouts.forEach(wk => {
      wk.exercises.forEach(ex => {
        const exNameLower = ex.name.toLowerCase();
        
        if (lims.includes("joelho") && (exNameLower.includes("agachamento livre") || exNameLower.includes("hack machine"))) {
          issues.push({
            type: "Segurança",
            severity: "Alerta",
            message: `Exercício pesado de perna "${ex.name}" no "${wk.dayName}" pode sobrecarregar joelhos sensíveis.`
          });
        }
        
        if (lims.includes("lombar") && (exNameLower.includes("agachamento livre") || exNameLower.includes("deadlift") || exNameLower.includes("stiff"))) {
          issues.push({
            type: "Segurança",
            severity: "Alerta",
            message: `Exercício axial livre de alto risco "${ex.name}" detectado no "${wk.dayName}". Sugere-se substituir por máquinas apoiadas.`
          });
        }
      });
    });
  }
  
  const isValid = !issues.some(issue => issue.severity === "Erro");
  
  return {
    isValid,
    issues
  };
}
