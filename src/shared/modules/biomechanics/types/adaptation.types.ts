/**
 * ============================================================================
 * WORKOUT ACADEMIA - BIOMECHANICS AI MODULE: ADAPTATION TYPES (ETAPA 20)
 * ============================================================================
 */

export interface StimulusProfile {
  mechanicalTension: number; // 0 a 100
  metabolicStress: number;   // 0 a 100
  neuromuscularDemand: number; // 0 a 100
  systemicStress: number;    // 0 a 100
}

export interface FatigueState {
  localFatigue: Record<string, number>; // Fadiga por grupo muscular (ex: "pectoralis_major": 72)
  systemicFatigue: number; // SNC e orgânico geral
  neuralFatigue: number;   // Exclusivo do Sistema Nervoso
}

export interface RecoveryState {
  muscleReadiness: Record<string, number>; // Prontidão por músculo (0 a 100)
  overallReadiness: number;
}

export interface AdaptiveCapacity {
  weeklyCapacitySets: number; // Teto de volume tolerado
  currentLoadSets: number;    // Volume já executado
  remainingCapacity: number;  // Saldo
}

export interface MotorLearning {
  movementLearningScore: number; // 0 a 100 (Estabilidade técnica)
  movementEfficiency: number;    // Relacionado ao IGB e fluidez
}

export interface AdaptationSignature {
  volumeResponse: "low" | "moderate" | "high";
  frequencyResponse: "low" | "moderate" | "high";
  technicalLearningRate: "slow" | "average" | "fast";
  fatigueSensitivity: "low" | "moderate" | "high";
}

export interface AdaptationState {
  stimulus: StimulusProfile;
  fatigue: FatigueState;
  recovery: RecoveryState;
  capacity: AdaptiveCapacity;
  learning: MotorLearning;
  signature: AdaptationSignature;
  lastUpdated: string;
}

export interface ExecutedExercise {
  exerciseId: string;
  sets: number;
  reps: number;
  rir: number;
  dna: any;
}

export interface SessionData {
  exercises: ExecutedExercise[];
  durationMin: number;
  perceivedExertion: number;
}
