/**
 * ============================================================================
 * WORKOUT ACADEMIA - BIOMECHANICS AI MODULE: BIOMECHANICAL ENGINE TYPES
 * ============================================================================
 */

import { BodyAnalysisOutput } from "./body-analysis.types";

export interface BiomechanicalFinding {
  id: string;
  name: string;
  category: "posture" | "symmetry" | "mobility" | "alignment";
  severity: "low" | "medium" | "high";
  confidence: number;
  description: string;
  possibleImpacts: string[];
  suggestedMusclesToTarget: {
    strengthen: string[]; // Musculatura fraca/alongada que precisa de força
    release: string[];    // Musculatura encurtada/hiperativa que precisa de liberação/alongamento
  };
  riskyMovements: {
    movement: string;
    reason: string;
  }[];
}

export interface CompensationPattern {
  name: string;
  relatedAreas: string[];
  confidence: number;
  globalImpact: string;
}

export interface PostureRule {
  id: string;
  name: string;
  category: "posture" | "symmetry" | "mobility" | "alignment";
  description: string;
  conditions: (bodyAnalysis: BodyAnalysisOutput) => {
    triggered: boolean;
    confidence: number;
  };
  impacts: string[];
  strengthen: string[];
  release: string[];
  riskyMovements: { movement: string; reason: string }[];
}
