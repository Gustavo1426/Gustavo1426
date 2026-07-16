/**
 * ============================================================================
 * WORKOUT ACADEMIA - PHASE 2.2: AI COACH ENGINE (V2) - TYPES
 * ============================================================================
 */

export type { DailyDirective } from "../training-integration/decision/types";

export interface CoachContextV2 {
  studentName: string;
  trainingGoal: string;
  weeksTraining: number;
  previousEvolution: string; // Ex: "ganho de força no agachamento"
  currentChallenge: string;  // Ex: "melhorar mobilidade de tornozelo"
}

export interface InteractionHistory {
  id: string;
  date: string;
  type: "motivation" | "feedback" | "adjustment";
  message: string;
  studentResponse?: string;
}

export interface StudentFeedback {
  date: string;
  rating: 1 | 2 | 3 | 4 | 5;
  feeling: "better" | "same" | "worse";
  comment: string;
  relatedDirective: string; // Ex: "DELOAD"
}

export interface CoachMessage {
  headline: string;
  body: string;
  callToAction: string;
}

export interface WorkflowTrigger {
  title: string;
  body: string;
  dataPayload: Record<string, string>;
  scheduledFor: string;
}

export interface AiCoachOutput {
  message: CoachMessage;
  pushNotificationTrigger: WorkflowTrigger | null;
  historyLog: InteractionHistory;
}
