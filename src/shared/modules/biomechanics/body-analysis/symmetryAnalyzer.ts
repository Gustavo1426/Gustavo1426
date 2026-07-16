/**
 * ============================================================================
 * WORKOUT ACADEMIA - BIOMECHANICS AI MODULE: SYMMETRY ANALYZER
 * ============================================================================
 */

import { Landmark, LandmarkName } from "../types/landmark.types";
import { SymmetryResult } from "../types/body-analysis.types";
import { AngleCalculator } from "./angleCalculator";
import { BodyLandmarks } from "../types";

export interface BiomechanicalSymmetryResult {
  bodyPart: string;
  difference: number; // Diferença percentual ou em unidades normalizadas
  severity: "low" | "medium" | "high";
}

export function analyzeSymmetry(landmarks: Landmark[]): SymmetryResult;
export function analyzeSymmetry(landmarks: BodyLandmarks): BiomechanicalSymmetryResult[];
export function analyzeSymmetry(
  landmarks: Landmark[] | BodyLandmarks
): SymmetryResult | BiomechanicalSymmetryResult[] {
  if (Array.isArray(landmarks)) {
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
  } else {
    const results: BiomechanicalSymmetryResult[] = [];
    const getPoint = (name: string) => landmarks.points.find(p => p.name === name);

    const leftHip = getPoint("left_hip");
    const rightHip = getPoint("right_hip");

    // Assimetria Pélvica
    if (leftHip && rightHip) {
      // Assumindo escala normalizada (0 a 1), multiplicamos por 100 para facilitar leitura
      const diff = Math.abs(leftHip.y - rightHip.y) * 100;
      
      let severity: BiomechanicalSymmetryResult["severity"] = "low";
      if (diff > 4) severity = "high";
      else if (diff > 2) severity = "medium";

      results.push({
        bodyPart: "pelvis",
        difference: parseFloat(diff.toFixed(2)),
        severity
      });
    }

    return results;
  }
}
