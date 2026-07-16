/**
 * ============================================================================
 * WORKOUT ACADEMIA - BIOMECHANICS AI MODULE: DECISION INTELLIGENCE TYPES
 * ============================================================================
 */

export type GoalPolicyType = "HypertrophyPolicy" | "FatLossPolicy" | "RehabilitationPolicy" | "BeginnerPolicy";

export interface TrainingPolicy {
  id: GoalPolicyType;
  maxFatigueTolerance: number; // 0 a 100
  minAdherenceRequiredForProgression: number; // 0 a 100
  reassessmentFrequencyDays: number;
  priorityHierarchy: ("safety" | "biomechanics" | "recovery" | "performance" | "hypertrophy")[];
}

export interface DecisionContext {
  studentId: string;
  goalPolicy: TrainingPolicy;
  workoutHistory: { adherence: number; averageRIR: number };
  performance: { isProgressing: boolean; fatigueLevel: number };
  biomechanics: { igb: number; activeRestrictions: string[]; evolutionDelta: number };
  recovery: { sleepQuality: string; soreness: "low" | "medium" | "high" };
}

export interface ProposedAction {
  source: string; // Qual engine sugeriu
  actionType: "IncreaseVolume" | "DecreaseVolume" | "Maintain" | "Deload" | "ChangeExercises" | "RequestAssessment";
  urgency: number; // 0 a 100
  reason: string;
}

export interface FinalDecision {
  actionType: ProposedAction["actionType"];
  confidence: number;
  explanationToStudent: string;
  explanationToCoach: string;
  auditTrail: AuditLog;
}

export interface AuditLog {
  timestamp: string;
  evaluatedActions: ProposedAction[];
  conflictsResolved: string[];
  simulationResult: "Approved" | "Rejected";
}
