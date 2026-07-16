/**
 * ============================================================================
 * WORKOUT ACADEMIA - BIOMECHANICS AI MODULE: SYMMETRY ANALYZER
 * ============================================================================
 */

import { Landmark, LandmarkName } from "../types/landmark.types";
import { SymmetryResult } from "../types/body-analysis.types";
import { AngleCalculator } from "./angleCalculator";

/**
 * Avalia as assimetrias bilaterais comparando os desvios horizontais e verticais dos lados esquerdo/direito.
 */
export function analyzeSymmetry(landmarks: Landmark[]): SymmetryResult {
  const landmarkMap = new Map<LandmarkName, Landmark>(
    landmarks.map(l => [l.name, l])
  );

  const leftShoulder = landmarkMap.get("left_shoulder");
  const rightShoulder = landmarkMap.get("right_shoulder");
  const leftHip = landmarkMap.get("left_hip");
  const rightHip = landmarkMap.get("right_hip");
  const leftAnkle = landmarkMap.get("left_ankle");
  const rightAnkle = landmarkMap.get("right_ankle");

  let shoulderAsymmetry = 0;
  let pelvicAsymmetry = 0;

  if (leftShoulder && rightShoulder) {
    shoulderAsymmetry = Math.abs(leftShoulder.y - rightShoulder.y);
  }

  if (leftHip && rightHip) {
    pelvicAsymmetry = Math.abs(leftHip.y - rightHip.y);
  }

  // Dedução de notas de simetria (Mapeamento linear penalizado de 0 a 100)
  const upperBodyScore = Math.max(0, 100 - Math.round(shoulderAsymmetry * 15));
  const lowerBodyScore = Math.max(0, 100 - Math.round(pelvicAsymmetry * 15));

  // Estimativa de discrepância de membros (discrepância real depende de calibração espacial)
  let legLengthDifference = 0;
  if (leftHip && leftAnkle && rightHip && rightAnkle) {
    const leftLegLen = AngleCalculator.calculateDistance(leftHip, leftAnkle);
    const rightLegLen = AngleCalculator.calculateDistance(rightHip, rightAnkle);
    legLengthDifference = Math.round(Math.abs(leftLegLen - rightLegLen) * 0.1 * 10) / 10; // Convertendo em escala cm hipotética
  }

  return {
    upperBodyScore,
    lowerBodyScore,
    shoulderAsymmetryMm: Math.round(shoulderAsymmetry * 10), // Escala px normalizada para mm aproximado
    pelvicAsymmetryMm: Math.round(pelvicAsymmetry * 10),
    legLengthDifferenceCm: legLengthDifference
  };
}
