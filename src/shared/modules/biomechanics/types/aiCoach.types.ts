/**
 * ============================================================================
 * WORKOUT ACADEMIA - BIOMECHANICS AI MODULE: AI COACH TYPES
 * ============================================================================
 */

export interface AdherenceMetrics {
  plannedWorkouts: number;
  completedWorkouts: number;
  adherencePercentage: number;
  trend: "improving" | "stable" | "dropping";
}

export interface CoachContext {
  studentId: string;
  studentName: string;
  goal: "hypertrophy" | "weight_loss" | "strength" | "rehab";
  daysSinceLastAssessment: number;
  adherence: AdherenceMetrics;
  assessment: {
    igb: number;
    findings: { id: string; name: string; severity: string }[];
    evolutionDelta: number; // Ex: +12 pontos
  };
  workout: {
    currentPhase: string;
    recentVolumeChange: "increased" | "decreased" | "stable";
    fatigueLevel: "low" | "medium" | "high";
  };
}

export interface CoachAlert {
  type: "low_adherence" | "assessment_due" | "performance_drop" | "injury_risk";
  priority: "high" | "medium" | "low";
  messageToProfessor: string;
}

export interface AIResponse {
  answer: string;
  dataDrivenMotivation: string;
  recommendations: string[];
  backgroundAlerts: CoachAlert[];
}

export interface ConversationMemoryEntry {
  role: "user" | "coach";
  content: string;
  timestamp: string;
}
