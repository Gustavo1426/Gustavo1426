/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { PoseLandmark } from "./posturalEngine";

// Math utility helpers
export function calcularAngulo(p1: PoseLandmark, p2: PoseLandmark): number {
  const dy = p2.y - p1.y;
  const dx = p2.x - p1.x;
  return Math.atan2(dy, dx) * (180 / Math.PI);
}

export function calcularDistancia(p1: PoseLandmark, p2: PoseLandmark): number {
  const dx = p1.x - p2.x;
  const dy = p1.y - p2.y;
  return Math.sqrt(dx * dx + dy * dy);
}

export function calcularCentroCorporal(p1: PoseLandmark, p2: PoseLandmark): PoseLandmark {
  return {
    x: (p1.x + p2.x) / 2,
    y: (p1.y + p2.y) / 2,
    z: (p1.z + p2.z) / 2,
    visibility: Math.min(p1.visibility, p2.visibility)
  };
}

export function calcularAnguloTresPontos(pA: PoseLandmark, pB: PoseLandmark, pC: PoseLandmark): number {
  const v1 = { x: pA.x - pB.x, y: pA.y - pB.y };
  const v2 = { x: pC.x - pB.x, y: pC.y - pB.y };
  
  const dotProduct = v1.x * v2.x + v1.y * v2.y;
  const mag1 = Math.sqrt(v1.x * v1.x + v1.y * v1.y);
  const mag2 = Math.sqrt(v2.x * v2.x + v2.y * v2.y);
  
  if (mag1 * mag2 === 0) return 0;
  
  const cosAngle = Math.max(-1, Math.min(1, dotProduct / (mag1 * mag2)));
  return Math.acos(cosAngle) * (180 / Math.PI);
}

// Biomechanical features
export function calcularCervical(landmarks: PoseLandmark[], view: "front" | "back" | "right" | "left") {
  const leftEar = landmarks[7];
  const rightEar = landmarks[8];
  const leftShoulder = landmarks[11];
  const rightShoulder = landmarks[12];

  if (view === "front" || view === "back") {
    const earAngle = calcularAngulo(rightEar, leftEar);
    let cleanAngle = Math.abs(earAngle);
    if (cleanAngle > 90) cleanAngle = Math.abs(cleanAngle - 180);
    return {
      angle: cleanAngle,
      anteriorizationCm: 0
    };
  } else {
    const ear = view === "right" ? rightEar : leftEar;
    const shoulder = view === "right" ? rightShoulder : leftShoulder;
    
    const xDiff = Math.abs(ear.x - shoulder.x);
    const anteriorizationCm = xDiff * 100 * 0.35;
    const cervicalPlumbAngle = Math.abs(calcularAngulo(shoulder, ear) - 90);

    return {
      angle: cervicalPlumbAngle,
      anteriorizationCm: parseFloat(anteriorizationCm.toFixed(1))
    };
  }
}

export function calcularOmbros(landmarks: PoseLandmark[], view: "front" | "back" | "right" | "left") {
  const leftShoulder = landmarks[11];
  const rightShoulder = landmarks[12];

  if (view === "front" || view === "back") {
    const angle = calcularAngulo(rightShoulder, leftShoulder);
    let cleanAngle = Math.abs(angle);
    if (cleanAngle > 90) cleanAngle = Math.abs(cleanAngle - 180);
    const asymmetryPercentage = cleanAngle * 5.5;

    return {
      angle: parseFloat(cleanAngle.toFixed(1)),
      asymmetryPercentage: parseFloat(Math.min(100, asymmetryPercentage).toFixed(1))
    };
  } else {
    const shoulder = view === "right" ? rightShoulder : leftShoulder;
    const hip = view === "right" ? landmarks[24] : landmarks[23];
    const angle = Math.abs(calcularAngulo(hip, shoulder) - 90);
    const protractionPercent = angle * 6.2;

    return {
      angle: parseFloat(angle.toFixed(1)),
      asymmetryPercentage: parseFloat(Math.min(100, protractionPercent).toFixed(1))
    };
  }
}

export function calcularEscapulas(landmarks: PoseLandmark[], view: "front" | "back" | "right" | "left") {
  const leftShoulder = landmarks[11];
  const rightShoulder = landmarks[12];

  const angle = calcularAngulo(rightShoulder, leftShoulder);
  let cleanAngle = Math.abs(angle);
  if (cleanAngle > 90) cleanAngle = Math.abs(cleanAngle - 180);

  const amplification = view === "back" ? 1.4 : 1.0;
  const rawAngle = cleanAngle * amplification;
  const asymmetryPercentage = rawAngle * 7.5;

  return {
    angle: parseFloat(rawAngle.toFixed(1)),
    asymmetryPercentage: parseFloat(Math.min(100, asymmetryPercentage).toFixed(1))
  };
}

export function calcularPelve(landmarks: PoseLandmark[], view: "front" | "back" | "right" | "left") {
  const leftHip = landmarks[23];
  const rightHip = landmarks[24];

  if (view === "front" || view === "back") {
    const angle = calcularAngulo(rightHip, leftHip);
    let cleanAngle = Math.abs(angle);
    if (cleanAngle > 90) cleanAngle = Math.abs(cleanAngle - 180);

    return {
      angle: parseFloat(cleanAngle.toFixed(1)),
      tiltDegrees: parseFloat(cleanAngle.toFixed(1))
    };
  } else {
    const shoulder = view === "right" ? landmarks[12] : landmarks[11];
    const hip = view === "right" ? rightHip : leftHip;
    const knee = view === "right" ? landmarks[26] : landmarks[25];

    const shAngle = calcularAngulo(hip, shoulder);
    const knAngle = calcularAngulo(hip, knee);
    const tilt = Math.abs((shAngle + knAngle) / 2 - 90);

    return {
      angle: parseFloat(tilt.toFixed(1)),
      tiltDegrees: parseFloat(tilt.toFixed(1))
    };
  }
}

export function calcularJoelhos(landmarks: PoseLandmark[], view: "front" | "back" | "right" | "left") {
  const leftHip = landmarks[23];
  const rightHip = landmarks[24];
  const leftKnee = landmarks[25];
  const rightKnee = landmarks[26];
  const leftAnkle = landmarks[27];
  const rightAnkle = landmarks[28];

  const angleRight = calcularAnguloTresPontos(rightHip, rightKnee, rightAnkle);
  const angleLeft = calcularAnguloTresPontos(leftHip, leftKnee, leftAnkle);

  if (view === "front" || view === "back") {
    const hipWidth = calcularDistancia(leftHip, rightHip);
    const kneeWidth = calcularDistancia(leftKnee, rightKnee);
    const ankleWidth = calcularDistancia(leftAnkle, rightAnkle);

    const ratioKneeHip = kneeWidth / (hipWidth || 1);
    const ratioAnkleHip = ankleWidth / (hipWidth || 1);

    let valgoVaroTendency: "Valgo" | "Varo" | "Neutro" = "Neutro";
    let devAngle = 0;

    if (ratioKneeHip < 0.85 && ratioAnkleHip > 0.95) {
      valgoVaroTendency = "Valgo";
      devAngle = Math.abs(180 - (angleRight + angleLeft) / 2) * 0.4;
    } else if (ratioKneeHip > 1.15) {
      valgoVaroTendency = "Varo";
      devAngle = Math.abs(180 - (angleRight + angleLeft) / 2) * 0.45;
    } else {
      devAngle = Math.abs(180 - (angleRight + angleLeft) / 2) * 0.15;
    }

    return {
      angleRight: parseFloat(angleRight.toFixed(1)),
      angleLeft: parseFloat(angleLeft.toFixed(1)),
      valgoVaroTendency,
      devAngle
    };
  } else {
    const kneeAngle = view === "right" ? angleRight : angleLeft;
    let devAngle = 0;
    let label = "Alinhado";

    if (kneeAngle > 182.0) {
      devAngle = kneeAngle - 180;
      label = "Hiperextensão";
    } else if (kneeAngle < 172.0) {
      devAngle = 180 - kneeAngle;
      label = "Flexão";
    }

    return {
      angleRight: parseFloat(angleRight.toFixed(1)),
      angleLeft: parseFloat(angleLeft.toFixed(1)),
      valgoVaroTendency: "Neutro" as const,
      devAngle,
      label
    };
  }
}

export function calcularEscolioseVisual(landmarks: PoseLandmark[], view: "front" | "back" | "right" | "left") {
  const leftShoulder = landmarks[11];
  const rightShoulder = landmarks[12];
  const leftHip = landmarks[23];
  const rightHip = landmarks[24];

  const midShoulders = calcularCentroCorporal(leftShoulder, rightShoulder);
  const midHips = calcularCentroCorporal(leftHip, rightHip);

  const spineAngle = calcularAngulo(midHips, midShoulders);
  const deviationAngle = Math.abs(spineAngle - 270);
  const cleanDeviation = deviationAngle > 180 ? Math.abs(deviationAngle - 360) : deviationAngle;
  const lateralShiftCm = cleanDeviation * 100 * 0.18;

  return {
    maxDeviationAngle: parseFloat(cleanDeviation.toFixed(1)),
    lateralShiftCm: parseFloat(lateralShiftCm.toFixed(1))
  };
}

export function calcularSimetria(landmarks: PoseLandmark[], view: "front" | "back" | "right" | "left"): number {
  if (view === "right" || view === "left") {
    return 100;
  }

  const pairs = [
    [11, 12], // shoulders
    [23, 24], // hips
    [25, 26], // knees
    [27, 28]  // ankles
  ];

  let totalDiff = 0;
  pairs.forEach(([p1Idx, p2Idx]) => {
    const p1 = landmarks[p1Idx];
    const p2 = landmarks[p2Idx];
    const yDiff = Math.abs(p1.y - p2.y);
    const zDiff = Math.abs(p1.z - p2.z);
    totalDiff += (yDiff * 65) + (zDiff * 35);
  });

  const simetriaScore = Math.max(45, Math.min(100, 100 - (totalDiff * 140)));
  return Math.round(simetriaScore);
}

export function calcularEstabilidade(landmarks: PoseLandmark[], view: "front" | "back" | "right" | "left"): number {
  const leftShoulder = landmarks[11];
  const rightShoulder = landmarks[12];
  const leftHip = landmarks[23];
  const rightHip = landmarks[24];
  const leftAnkle = landmarks[27];
  const rightAnkle = landmarks[28];

  const midShoulders = calcularCentroCorporal(leftShoulder, rightShoulder);
  const midHips = calcularCentroCorporal(leftHip, rightHip);
  const midAnkles = calcularCentroCorporal(leftAnkle, rightAnkle);

  const massCenterOffset = Math.abs(midShoulders.x - midAnkles.x) + Math.abs(midHips.x - midAnkles.x);
  const stabilityScore = Math.max(50, Math.min(100, 100 - (massCenterOffset * 180)));
  return Math.round(stabilityScore);
}

export function calcularMobilidade(landmarks: PoseLandmark[], view: "front" | "back" | "right" | "left", infoAluno?: any): number {
  const baseScore = 80;
  let penalty = 0;

  if (infoAluno?.tempoSentado && infoAluno.tempoSentado > 6) {
    penalty += (infoAluno.tempoSentado - 6) * 2.5;
  }

  if (infoAluno?.idade && infoAluno.idade > 40) {
    penalty += (infoAluno.idade - 40) * 0.4;
  }

  const leftShoulder = landmarks[11];
  const leftAnkle = landmarks[27];
  const bodyHeightRatio = calcularDistancia(leftShoulder, leftAnkle);

  if (bodyHeightRatio < 0.65) {
    penalty += 5;
  }

  return Math.round(Math.max(50, Math.min(100, baseScore - penalty)));
}
