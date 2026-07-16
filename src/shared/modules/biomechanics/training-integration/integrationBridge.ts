/**
 * ============================================================================
 * WORKOUT ACADEMIA - PHASE 2.0: BIOMECHANICS TRAINING BRIDGE
 * ============================================================================
 */

import { WorkoutPlan, BiomechanicalConstraint, IntegratedWorkoutPlan, BiomechanicalDecision } from "./typesV2";
import { generateSmartWarmup } from "./smartWarmupEngine";
import { adaptExercises } from "./exerciseAdaptationEngine";
import { applyVolumeLimits } from "./volumeAdjustmentEngine";

/**
 * A Ponte Principal (V2). Orquestra Regras, Consulta Motores Externos e Retorna 
 * o Treino Final com o nível de confiança das modificações e aquecimento inteligente.
 */
export function buildIntegratedWorkout(
  basePlan: WorkoutPlan, 
  constraints: BiomechanicalConstraint[]
): IntegratedWorkoutPlan {
  
  // 1. Constrói o Aquecimento Inteligente em 4 fases
  const smartWarmup = generateSmartWarmup(constraints);

  // 2. Adapta exercícios consultando o Exercise Engine e gera a BiomechanicalDecision
  let integratedExercises = adaptExercises(basePlan.exercises, constraints);

  // 3. Ajusta o volume consultando o Volume Limiter Engine
  integratedExercises = applyVolumeLimits(integratedExercises, constraints);

  // 4. Compila todas as decisões que o sistema tomou para auditoria do Professor
  const systemDecisions = integratedExercises
    .filter(ex => ex.decision.action !== "keep")
    .map(ex => ex.decision);

  return {
    originalPlanId: basePlan.id,
    smartWarmup,
    mainWorkout: integratedExercises,
    systemDecisions
  };
}
