/**
 * ============================================================================
 * WORKOUT ACADEMIA - BIOMECHANICS AI MODULE: EVOLUTION TYPES
 * ============================================================================
 */

import { BodyAnalysisOutput } from "./body-analysis.types";
import { BiomechanicalFinding } from "./biomechanical.types";
import { BiomechanicalScore } from "./score.types";

export type ChangeStatus = "improved" | "stable" | "worse";
export type EvolutionClassification = "excellent" | "positive" | "stable" | "attention";

export interface BiomechanicalChange {
  metricName: string;
  before: number;
  after: number;
  difference: number;
  status: ChangeStatus;
}

export interface AreaProgress {
  area: string;
  description: string;
  status: ChangeStatus;
}

export interface EvolutionScore {
  initial: number;
  current: number;
  difference: number;
  percentageChange: number;
  classification: EvolutionClassification;
}

export interface EvolutionAnalysisResult {
  improvements: string[];
  regressions: string[];
  maintainedIssues: string[];
  evolutionScore: EvolutionScore;
  metricChanges: BiomechanicalChange[];
  areaProgressions: AreaProgress[];
  workoutEngineAdjustmentFlags: {
    canUnlockExercises: string[]; // Exercícios que podem ser liberados (ex: "supino_barra")
    shouldKeepRestrictions: string[]; // Exercícios que ainda requerem moderação
  };
}

// Interface auxiliar para empacotar avaliações completas no comparador
export interface HistoricalAssessment {
  id: string;
  date: string;
  score: BiomechanicalScore;
  bodyAnalysis: BodyAnalysisOutput;
  findings: BiomechanicalFinding[];
}
