/**
 * ============================================================================
 * WORKOUT ACADEMIA - PHASE 1.8: EVOLUTION ENGINE (V2) - TYPES
 * ============================================================================
 */

export interface RegionalScore {
  shoulder: number;
  spine: number;
  hip: number;
  knee: number;
  ankle: number;
}

export interface ScoreHistory {
  globalScore: number;
  postureScore: number;
  mobilityScore: number;
  symmetryScore: number;
  regional: RegionalScore;
}

export interface FindingHistory {
  ruleId: string;
  interpretation: string;
  region: keyof RegionalScore;
}

export interface PastAssessment {
  id: string;
  date: string;
  scores: ScoreHistory;
  findings: FindingHistory[];
}

export interface RegionalEvolution {
  region: keyof RegionalScore;
  before: number;
  after: number;
  delta: number;
  status: "improved" | "stable" | "worse";
}

export interface TimelineEvent {
  date: string;
  type: "assessment" | "improvement" | "attention" | "training_adjusted";
  title: string;
  description: string;
}

export interface BiomechanicalTimeline {
  studentId: string;
  events: TimelineEvent[];
}

export interface EvolutionTrainingAdjustment {
  add: string[];
  modify: string[];
  attentionPoints: string[];
}

export interface ClinicalEvolution {
  resolvedIssues: FindingHistory[];
  newIssues: FindingHistory[];
  persistentIssues: FindingHistory[];
}

export interface EvolutionReport {
  studentId: string;
  daysBetweenAssessments: number;
  regionalEvolution: RegionalEvolution[];
  timeline: BiomechanicalTimeline;
  trainingAdjustments: EvolutionTrainingAdjustment;
}
