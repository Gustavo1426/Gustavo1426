/**
 * ============================================================================
 * WORKOUT ACADEMIA - BIOMECHANICS AI MODULE: LANDMARK EXTRACTOR
 * ============================================================================
 */

import { Landmark, RawLandmark, LandmarkName } from "../types/landmark.types";
import { normalizeCoordinates } from "./coordinateNormalizer";

/**
 * Filtra e organiza os pontos de interesse anatômicos brutos da biblioteca de visão de máquina.
 */
export function extractAndMapLandmarks(
  rawLandmarks: RawLandmark[],
  screenWidth: number,
  screenHeight: number
): Landmark[] {
  
  // Mapeamento dos pontos esperados no nosso escopo
  const allowedLandmarks: Set<string> = new Set([
    "nose", "left_eye", "right_eye", "left_ear", "right_ear",
    "left_shoulder", "right_shoulder", "left_elbow", "right_elbow", "left_wrist", "right_wrist",
    "left_hip", "right_hip", "left_knee", "right_knee",
    "left_ankle", "right_ankle", "left_heel", "right_heel", "left_foot", "right_foot"
  ]);

  return rawLandmarks
    .filter(rl => allowedLandmarks.has(rl.name))
    .map((rl, index) => {
      const normalized = normalizeCoordinates(rl.x, rl.y, rl.z || 0, screenWidth, screenHeight);
      
      return {
        id: `landmark_${rl.name}_${index}`,
        name: rl.name as LandmarkName,
        x: normalized.x,
        y: normalized.y,
        z: normalized.z,
        visibility: rl.visibility !== undefined ? rl.visibility : 1.0,
        confidence: rl.visibility !== undefined ? rl.visibility : 0.95 // Fallback de confiança
      };
    });
}
