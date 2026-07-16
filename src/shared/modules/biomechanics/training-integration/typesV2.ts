/**
 * ============================================================================
 * WORKOUT ACADEMIA - PHASE 2.0: TRAINING INTEGRATION ENGINE (V2) - TYPES
 * ============================================================================
 */

export interface BaseExercise {
  id: string;
  name: string;
  category: string;
  tags: string[];
  sets: number;
  reps: string;
}

export interface WorkoutPlan {
  id: string;
  focus: string;
  exercises: BaseExercise[];
}

export interface BiomechanicalConstraint {
  ruleId: string;
  severity: "low" | "medium" | "high";
  region: string;
  confidence: number;
}

export interface SmartWarmup {
  phase: "release" | "mobility" | "activation" | "potentiation";
  duration: number;
  exercises: string[];
  reason: string;
}

export interface BiomechanicalDecision {
  action: "keep" | "modify" | "replace";
  target: string;
  reason: string;
  confidence: number; // 0.0 a 1.0
}

export interface AdaptedExerciseV2 extends BaseExercise {
  decision: BiomechanicalDecision;
}

export interface IntegratedWorkoutPlan {
  originalPlanId: string;
  smartWarmup: SmartWarmup[];
  mainWorkout: AdaptedExerciseV2[];
  systemDecisions: BiomechanicalDecision[];
}
