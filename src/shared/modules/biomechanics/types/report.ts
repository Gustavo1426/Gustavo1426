export interface BodyAnnotation {
  region: "head" | "shoulder" | "spine" | "pelvis" | "knee" | "ankle";
  position: {
    x: number;
    y: number;
  };
  label: string;
  severity: "low" | "medium" | "high";
}

export interface EvolutionPoint {
  date: string;
  score: number;
}

export interface StudentReport {
  overallScore: number;
  classification: "excellent" | "good" | "attention" | "critical";
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
  classification: "excellent" | "good" | "attention" | "critical";
  visualAnnotations: BodyAnnotation[];
  studentSection: StudentReport;
  professionalSection: ProfessionalReport;
  evolutionHistory: EvolutionPoint[];
}
