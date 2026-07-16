/**
 * ============================================================================
 * WORKOUT ACADEMIA - BIOMECHANICS AI MODULE: BODY ANALYSIS TYPES
 * ============================================================================
 */

export interface HeadRegion {
  forwardHeadDetected: boolean;
  lateralTiltAngle: number;
  rotationAngle: number;
  severity: "low" | "medium" | "high";
}

export interface ShoulderRegion {
  tiltAngle: number;
  heightDifferencePx: number;
  protractionAngle: number;
  rotationAngle: number;
}

export interface SpineRegion {
  thoracicCurveAngle: number;
  lumbarLordosisAngle: number;
  lateralDeviationDetected: boolean;
}

export interface PelvisRegion {
  tiltAngle: number;
  pelvicShiftDetected: boolean;
  lateralTiltAngle: number;
}

export interface LegsRegion {
  leftKneeDeviationAngle: number;
  rightKneeDeviationAngle: number;
  kneeAlignmentAngle: number;
}

export interface BodyMap {
  head: HeadRegion;
  shoulders: ShoulderRegion;
  spine: SpineRegion;
  pelvis: PelvisRegion;
  legs: LegsRegion;
}

export interface SymmetryResult {
  upperBodyScore: number; // 0 a 100
  lowerBodyScore: number; // 0 a 100
  shoulderAsymmetryMm: number;
  pelvicAsymmetryMm: number;
  legLengthDifferenceCm: number;
}

export interface AlignmentResult {
  frontalAlignmentScore: number; // 0 a 100
  lateralAlignmentScore: number; // 0 a 100
}

export interface PhysicalMeasurements {
  shoulderWidthNormalized: number;
  hipWidthNormalized: number;
  estimatedHeightPx: number;
}

export interface BodyAnalysisOutput {
  bodyMap: BodyMap;
  symmetry: SymmetryResult;
  alignment: AlignmentResult;
  measurements: PhysicalMeasurements;
}
