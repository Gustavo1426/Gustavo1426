/**
 * ============================================================================
 * WORKOUT ACADEMIA - BIOMECHANICS AI MODULE: REPORT TYPES
 * ============================================================================
 */

import { IGBClassification } from "./score.types";

export interface BodyAnnotation {
  region: "head" | "shoulder" | "spine" | "pelvis" | "knee" | "ankle";
  position: {
    x: number; // Coordenada baseada no sistema normalizado [0, 100]
    y: number;
  };
  label: string;
  severity: "low" | "medium" | "high";
}

export interface EvolutionPoint {
  date: string; // Formato ISO ou DD/MM/AAAA
  score: number; // Nota do IGB correspondente à época
}

export interface StudentReport {
  overallScore: number;
  classification: IGBClassification;
  emotionalHeadline: string;
  positivePoints: string[];
  growthPoints: string[];
  nextSteps: string[];
}

export interface ProfessionalReport {
  technicalFindings: {
    findingName: string;
    confidence: number;
    severity: string;
    technicalDescription: string;
    coachingGuidelines: string[];
  }[];
  structuralAsymmetries: string[];
}

export interface FullBiomechanicalReport {
  studentId: string;
  studentName: string;
  date: string;
  overallScore: number;
  classification: IGBClassification;
  visualAnnotations: BodyAnnotation[];
  studentSection: StudentReport;
  professionalSection: ProfessionalReport;
  evolutionHistory: EvolutionPoint[];
}
