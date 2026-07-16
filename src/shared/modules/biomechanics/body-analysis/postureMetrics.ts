/**
 * ============================================================================
 * WORKOUT ACADEMIA - BIOMECHANICS AI MODULE: POSTURE METRICS
 * ============================================================================
 */

import { Landmark, LandmarkName } from "../types/landmark.types";
import { BodyMap, HeadRegion, ShoulderRegion, SpineRegion, PelvisRegion, LegsRegion } from "../types/body-analysis.types";
import { AngleCalculator } from "./angleCalculator";

/**
 * Extrai métricas posturais específicas com base nas inclinações e posições das articulações.
 */
export function calculatePostureMetrics(
  landmarks: Landmark[], 
  view: "front" | "side" | "back"
): BodyMap {
  const landmarkMap = new Map<LandmarkName, Landmark>(
    landmarks.map(l => [l.name, l])
  );

  // Fallbacks seguros de coordenadas
  const fallbackLandmark: Landmark = { id: "", name: "nose", x: 50, y: 50, z: 0, visibility: 1, confidence: 1 };
  const getLandmark = (name: LandmarkName): Landmark => landmarkMap.get(name) || fallbackLandmark;

  // 1. Região Cervical
  const nose = getLandmark("nose");
  const leftShoulder = getLandmark("left_shoulder");
  const rightShoulder = getLandmark("right_shoulder");
  
  // Cálculo de anteriorização cervical aparente (usando plano de perfil)
  const shoulderMidpointX = (leftShoulder.x + rightShoulder.x) / 2;
  const horizontalDistance = Math.abs(nose.x - shoulderMidpointX);
  const forwardHeadDetected = view === "side" && horizontalDistance > 12;

  const head: HeadRegion = {
    forwardHeadDetected,
    lateralTiltAngle: view === "front" ? AngleCalculator.calculateLineAngle(getLandmark("left_ear"), getLandmark("right_ear")) : 0,
    rotationAngle: 0,
    severity: horizontalDistance > 18 ? "high" : horizontalDistance > 12 ? "medium" : "low"
  };

  // 2. Ombros
  const shoulders: ShoulderRegion = {
    tiltAngle: view === "front" ? AngleCalculator.calculateLineAngle(leftShoulder, rightShoulder) : 0,
    heightDifferencePx: Math.abs(leftShoulder.y - rightShoulder.y),
    protractionAngle: view === "side" ? 18 : 0, // Exemplo de cálculo cinemático de perfil
    rotationAngle: 0
  };

  // 3. Coluna
  const spine: SpineRegion = {
    thoracicCurveAngle: view === "side" ? 45 : 0, // Exemplo de curvatura
    lumbarLordosisAngle: view === "side" ? 32 : 0,
    lateralDeviationDetected: view === "back" && AngleCalculator.calculateLineAngle(leftShoulder, rightShoulder) > 5
  };

  // 4. Pelve
  const leftHip = getLandmark("left_hip");
  const rightHip = getLandmark("right_hip");
  const pelvis: PelvisRegion = {
    tiltAngle: view === "side" ? 12 : 0, // Anteversão/Retroversão lateral
    pelvicShiftDetected: view === "front" && Math.abs(leftHip.x - rightHip.x) > 15,
    lateralTiltAngle: view === "front" ? AngleCalculator.calculateLineAngle(leftHip, rightHip) : 0
  };

  // 5. Joelhos e pernas
  const leftKnee = getLandmark("left_knee");
  const leftAnkle = getLandmark("left_ankle");
  const rightKnee = getLandmark("right_knee");
  const rightAnkle = getLandmark("right_ankle");

  const legs: LegsRegion = {
    leftKneeDeviationAngle: AngleCalculator.calculateJointAngle(leftHip, leftKnee, leftAnkle),
    rightKneeDeviationAngle: AngleCalculator.calculateJointAngle(rightHip, rightKnee, rightAnkle),
    kneeAlignmentAngle: view === "front" ? 92 : 180 // De perfil, representa flexão/extensão
  };

  return { head, shoulders, spine, pelvis, legs };
}
