/**
 * ============================================================================
 * WORKOUT ACADEMIA - BIOMECHANICS AI MODULE: BODY MAP & FINDINGS TYPES
 * ============================================================================
 */

export interface HeadAnalysis {
  cervicalAnteriorizationCm: number;
  lateralTiltAngle: number;
  rotationAngle: number;
}

export interface ShoulderAnalysis {
  leftHeightPx: number;
  rightHeightPx: number;
  symmetryScore: number;
  protractionAngle: number;
  internalRotationDetected: boolean;
}

export interface SpineAnalysis {
  thoracicKyphosisAngle: number;
  lumbarLordosisAngle: number;
  apparentDeformityDetected: boolean;
}

export interface PelvisAnalysis {
  tiltAngle: number; // Anteversão / Retroversão
  lateralTiltAngle: number; // Inclinação lateral (quadril caído)
  rotationAngle: number;
}

export interface KneeAnalysis {
  leftKneeAngle: number;
  rightKneeAngle: number;
  valgusLeftDetected: boolean;
  valgusRightDetected: boolean;
  varusLeftDetected: boolean;
  varusRightDetected: boolean;
}

export interface AnkleAnalysis {
  supportBaseWidthCm: number;
  pronationLeftDetected: boolean;
  pronationRightDetected: boolean;
}

export interface BodyMap {
  head: HeadAnalysis;
  shoulders: ShoulderAnalysis;
  spine: SpineAnalysis;
  pelvis: PelvisAnalysis;
  knees: KneeAnalysis;
  ankles: AnkleAnalysis;
}

export interface BiomechanicalFinding {
  id: string;
  category: "posture" | "symmetry" | "mobility" | "alignment";
  name: string;
  severity: "low" | "medium" | "high";
  confidence: number;
  description: string;
  possibleImpacts: string[];
}
