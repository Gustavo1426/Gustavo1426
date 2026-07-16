/**
 * ============================================================================
 * WORKOUT ACADEMIA - BIOMECHANICS AI MODULE: ADAPTIVE LEARNING TYPES
 * ============================================================================
 */

export interface LearningOutcome {
  decisionId: string;
  date: string;
  studentId: string; // Anonimizado na agregação
  cohortId: string;
  strategyApplied: string; // Ex: "CAX_tension_focus" ou "increase_volume"
  expectedResult: string;
  actualResult: "positive" | "neutral" | "negative";
  metrics: {
    igbDelta: number;
    adherenceDelta: number;
    fatigueDelta: number;
  };
}

export interface CohortProfile {
  id: string;
  description: string;
  criteria: {
    gender?: "male" | "female";
    ageRange: [number, number];
    goal: "hypertrophy" | "fat_loss" | "rehab";
    experienceLevel: "beginner" | "intermediate" | "advanced";
    initialIgbRange: [number, number];
  };
}

export interface StrategyEffectiveness {
  strategyName: string;
  cohortId: string;
  sampleSize: number;
  successRate: number; // 0 a 100%
  averageIgbEvolution: number;
}

export interface RuleHypothesis {
  id: string;
  strategyName: string;
  targetCohortId: string;
  suggestedConfidenceAdjustment: number;
  status: "L1_OBSERVATION" | "L2_VALIDATION" | "L3_APPROVED" | "REJECTED";
  evidence: StrategyEffectiveness;
  createdAt: string;
}

export interface AuditLogEntry {
  action: "ROLLBACK" | "APPROVAL" | "HYPOTHESIS_GENERATED";
  hypothesisId: string;
  reason: string;
  timestamp: string;
}
