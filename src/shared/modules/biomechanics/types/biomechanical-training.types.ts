/**
 * ============================================================================
 * WORKOUT ACADEMIA - BIOMECHANICS AI MODULE: TRAINING INTEGRATION TYPES
 * ============================================================================
 */

export interface BiomechanicalProfile {
  priorities: string[];
  restrictions: string[];
  attentionAreas: string[];
  movementConsiderations: string[];
}

export interface TrainingImpact {
  affectedMovementTags: string[];
  recommendedAction: "monitor" | "reduce_volume" | "require_unilateral" | "avoid";
  reason: string;
}

export interface ExerciseMetadata {
  id: string;
  name: string;
  tags: string[]; // ex: ["horizontal_push", "chest", "bilateral"]
  baseSets: number;
}

export interface AdaptedExercise extends ExerciseMetadata {
  adaptedSets: number;
  biomechanicalWarning?: string;
  isUnilateralForced?: boolean;
}

export interface WorkoutConstraint {
  condition: string;
  action: "require_unilateral_control" | "limit_overhead_load" | "increase_posterior_chain";
  description: string;
}

// Representa os achados brutos vindo da Etapa 5 (Biomechanical Engine)
export interface RawFinding {
  id: string;
  severity: "low" | "medium" | "high";
}
