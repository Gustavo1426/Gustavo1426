/**
 * ============================================================================
 * WORKOUT ACADEMIA - BIOMECHANICS AI MODULE: MEASUREMENT ENGINE
 * ============================================================================
 */

import { Landmark, LandmarkName } from "../types/landmark.types";
import { PhysicalMeasurements } from "../types/body-analysis.types";
import { AngleCalculator } from "./angleCalculator";

/**
 * Produz medidas antropométricas lineares comparáveis para rastrear a evolução estrutural do aluno.
 */
export function calculatePhysicalMeasurements(landmarks: Landmark[]): PhysicalMeasurements {
  const landmarkMap = new Map<LandmarkName, Landmark>(
    landmarks.map(l => [l.name, l])
  );

  const leftShoulder = landmarkMap.get("left_shoulder");
  const rightShoulder = landmarkMap.get("right_shoulder");
  const leftHip = landmarkMap.get("left_hip");
  const rightHip = landmarkMap.get("right_hip");
  const nose = landmarkMap.get("nose");
  const leftAnkle = landmarkMap.get("left_ankle");

  const shoulderWidthNormalized = leftShoulder && rightShoulder 
    ? AngleCalculator.calculateDistance(leftShoulder, rightShoulder) 
    : 0;

  const hipWidthNormalized = leftHip && rightHip 
    ? AngleCalculator.calculateDistance(leftHip, rightHip) 
    : 0;

  const estimatedHeightPx = nose && leftAnkle 
    ? Math.abs(leftAnkle.y - nose.y) 
    : 0;

  return {
    shoulderWidthNormalized,
    hipWidthNormalized,
    estimatedHeightPx
  };
}
