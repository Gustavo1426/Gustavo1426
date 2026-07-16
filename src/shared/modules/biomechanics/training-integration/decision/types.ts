/**
 * ============================================================================
 * WORKOUT ACADEMIA - PHASE 2.1: ADAPTIVE DECISION ENGINE (V3) - TYPES
 * ============================================================================
 */

export type DailyDirective = "PUSH" | "MAINTAIN" | "DELOAD" | "RECOVERY_ONLY" | "REQUIRE_HUMAN_REVIEW";

export interface SystemEnginesContext {
  readinessScore: number;       // Calculado via Check-in (V2)
  biomechanicalScore: number;   // O IGB (Índice Global Biomecânico)
  performanceScore: number;     // Rendimento recente (0 a 100)
}

export interface TrainingDecisionScore {
  readinessScore: number;
  biomechanicalScore: number;
  performanceScore: number;
  finalScore: number;
}

export interface WorkoutModificationPayload {
  volumeMultiplier: number;
  intensityMultiplier: number;
  rirTarget: number;
  exerciseRestrictions: string[];
  priorityFocus: string[];
}

export interface DecisionHistory {
  id: string;
  date: string;
  directive: DailyDirective;
  decisionScore: number;
  performanceBefore: number;
  performanceAfter: number | null;
  result: "positive" | "neutral" | "negative" | "pending";
}

export interface AdaptiveEngineOutput {
  decisionScore: TrainingDecisionScore;
  directive: DailyDirective;
  payload: WorkoutModificationPayload;
}
