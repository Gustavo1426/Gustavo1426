/**
 * ============================================================================
 * WORKOUT ACADEMIA - BIOMECHANICS AI MODULE: EXERCISE INTELLIGENCE TYPES (ETAPA 19)
 * ============================================================================
 */

export type MovementPattern = "horizontal_push" | "vertical_push" | "horizontal_pull" | "vertical_pull" | "squat" | "hinge" | "lunge" | "core_anti_extension" | "isolation";
export type PlaneOfMotion = "sagittal" | "frontal" | "transverse" | "multiplanar";
export type Equipment = "barbell" | "dumbbell" | "machine" | "cable" | "bodyweight" | "band" | "smith";

export interface ExerciseDNA {
  mobilityDemand: number;     // 0.0 a 1.0
  stabilityDemand: number;    // 0.0 a 1.0
  coordinationDemand: number; // 0.0 a 1.0
  systemicFatigue: number;    // 0.0 a 1.0
  localFatigue: number;       // 0.0 a 1.0
  neuralDemand: number;       // 0.0 a 1.0
  technicalComplexity: number;// 0.0 a 1.0
  hypertrophyYield: number;   // 0.0 a 1.0
  strengthYield: number;      // 0.0 a 1.0
}

export interface ExerciseIntelligence {
  id: string;
  name: string;
  aliases: string[];
  
  movement: {
    pattern: MovementPattern;
    plane: PlaneOfMotion;
    bilateral: boolean;
    closedChain: boolean;
  };

  anatomy: {
    joints: string[];
    actions: string[];
    primaryMuscles: string[];
    secondaryMuscles: string[];
    stabilizers: string[];
    // Perfil de ativação com coeficientes para cálculo de volume efetivo
    activationCoefficients: Record<string, number>; 
  };

  dna: ExerciseDNA; // O vetor multidimensional

  executionProfile: {
    averageExecutionTimeSec: number;
    averageSetupTimeSec: number;
  };

  compatibility: {
    equipment: Equipment[];
    relativeContraindications: string[];
    targetLevels: { beginner: number; intermediate: number; advanced: number }; // 0 a 100
  };

  lineage: {
    progressions: string[];
    regressions: string[];
    variations: string[];
  };
}
