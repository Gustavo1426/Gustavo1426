/**
 * ============================================================================
 * WORKOUT ACADEMIA - BIOMECHANICS AI MODULE: DIGITAL TWIN TYPES
 * ============================================================================
 */

export interface TwinIdentity {
  id: string;
  name: string;
  gender: string;
  age: number;
  heightCm: number;
  experienceLevel: "beginner" | "intermediate" | "advanced";
}

export interface TwinBody {
  weightKg: number;
  bodyFatPercentage?: number;
  leanMassKg?: number;
  lastBioimpedanceDate?: string;
}

export interface TwinTraining {
  currentMesocycle: number;
  currentMicrocycle: number;
  weeklyFrequency: number;
  weeklyVolumeSets: number;
  adherencePercentage: number;
  consistencyScore: number; // Constância de longo prazo (ex: meses sem pausar)
}

export interface TwinPerformance {
  strengthProgressionRate: number; // % de evolução nos últimos 30 dias
  prs: Record<string, number>; // Personal Records (ex: { "bench_press": 100 })
  averageRIR: number; // Repetições na Reserva médias recentes
}

export interface TwinRecovery {
  fatigueLevel: number; // 0 a 100
  readinessScore: number; // 0 a 100 (Prontidão para o treino)
  daysSinceLastDeload: number;
  muscleSoreness: "low" | "medium" | "high";
  sleepQuality?: "good" | "bad" | "normal";
}

export interface TwinBiomechanics {
  igb: number;
  activeFindings: string[];
  activeRestrictions: string[];
  lastAssessmentDate: string;
}

export interface TwinGoals {
  primaryGoal: "hypertrophy" | "fat_loss" | "health" | "rehab" | "performance";
  targetWeightKg?: number;
  targetDate?: string;
}

export interface TwinPrediction {
  churnRisk: "low" | "medium" | "high";
  injuryRisk: "low" | "medium" | "high";
  expectedEvolutionTrend: "positive" | "stable" | "negative";
}

export interface CompositeHealthScore {
  score: number; // 0 a 100
  breakdown: {
    biomechanics: number; // 20%
    adherence: number;    // 20%
    performance: number;  // 20%
    recovery: number;     // 15%
    consistency: number;  // 15%
    bodyComp: number;     // 10%
  };
}

export interface DigitalTwin {
  version: number;
  lastUpdatedAt: string;
  identity: TwinIdentity;
  body: TwinBody;
  training: TwinTraining;
  performance: TwinPerformance;
  recovery: TwinRecovery;
  biomechanics: TwinBiomechanics;
  goals: TwinGoals;
  prediction: TwinPrediction;
  healthScore: CompositeHealthScore;
}

export interface TwinSnapshot {
  snapshotId: string;
  createdAt: string;
  triggerEvent: string; // Ex: "NEW_ASSESSMENT", "WORKOUT_COMPLETED"
  state: DigitalTwin;
}
