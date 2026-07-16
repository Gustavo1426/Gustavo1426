/**
 * ============================================================================
 * WORKOUT ACADEMIA - BIOMECHANICS AI MODULE: SKELETON BUILDER
 * ============================================================================
 */

import { Landmark, LandmarkName } from "../types/landmark.types";
import { BodySkeleton, SkeletonSegment } from "../types/vision.types";

/**
 * Constrói as relações geométricas entre os pontos articulares mapeados.
 */
export function buildBodySkeleton(landmarks: Landmark[]): BodySkeleton {
  const landmarkMap = new Map<LandmarkName, Landmark>(
    landmarks.map(l => [l.name, l])
  );

  // Função auxiliar para calcular distância euclidiana normalizada entre articulações
  const calculateDistance = (fromName: LandmarkName, toName: LandmarkName): number => {
    const from = landmarkMap.get(fromName);
    const to = landmarkMap.get(toName);
    if (!from || !to) return 0;
    
    return Math.sqrt(Math.pow(to.x - from.x, 2) + Math.pow(to.y - from.y, 2));
  };

  // 1. Segmento: Cabeça
  const headSegment: SkeletonSegment = {
    name: "head_segment",
    joints: ["nose", "left_eye", "right_eye", "left_ear", "right_ear"],
    relations: [
      { from: "left_eye", to: "right_eye", distance: calculateDistance("left_eye", "right_eye") }
    ]
  };

  // 2. Segmento: Tronco e Braços
  const upperBodySegment: SkeletonSegment = {
    name: "upper_body_segment",
    joints: ["left_shoulder", "right_shoulder", "left_elbow", "right_elbow", "left_wrist", "right_wrist"],
    relations: [
      { from: "left_shoulder", to: "right_shoulder", distance: calculateDistance("left_shoulder", "right_shoulder") },
      { from: "left_shoulder", to: "left_elbow", distance: calculateDistance("left_shoulder", "left_elbow") },
      { from: "left_elbow", to: "left_wrist", distance: calculateDistance("left_elbow", "left_wrist") }
    ]
  };

  // 3. Segmento: Quadril e Pernas
  const lowerBodySegment: SkeletonSegment = {
    name: "lower_body_segment",
    joints: ["left_hip", "right_hip", "left_knee", "right_knee", "left_ankle", "right_ankle"],
    relations: [
      { from: "left_hip", to: "right_hip", distance: calculateDistance("left_hip", "right_hip") },
      { from: "left_hip", to: "left_knee", distance: calculateDistance("left_hip", "left_knee") },
      { from: "left_knee", to: "left_ankle", distance: calculateDistance("left_knee", "left_ankle") }
    ]
  };

  // 4. Calcular ângulo das linhas dos ombros em relação à horizontal
  const leftS = landmarkMap.get("left_shoulder");
  const rightS = landmarkMap.get("right_shoulder");
  let shoulderAngle = 0;
  if (leftS && rightS) {
    const dy = leftS.y - rightS.y;
    const dx = leftS.x - rightS.x;
    shoulderAngle = Math.round((Math.atan2(dy, dx) * (180 / Math.PI)) * 10) / 10;
  }

  // 5. Calcular ângulo da linha pélvica em relação à horizontal
  const leftH = landmarkMap.get("left_hip");
  const rightH = landmarkMap.get("right_hip");
  let pelvisAngle = 0;
  if (leftH && rightH) {
    const dy = leftH.y - rightH.y;
    const dx = leftH.x - rightH.x;
    pelvisAngle = Math.round((Math.atan2(dy, dx) * (180 / Math.PI)) * 10) / 10;
  }

  return {
    head: headSegment,
    upperBody: upperBodySegment,
    lowerBody: lowerBodySegment,
    shoulderLine: { angle: shoulderAngle },
    pelvisLine: { angle: pelvisAngle }
  };
}
