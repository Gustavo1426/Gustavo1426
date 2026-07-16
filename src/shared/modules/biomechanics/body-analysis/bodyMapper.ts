/**
 * ============================================================================
 * WORKOUT ACADEMIA - BIOMECHANICS AI MODULE: BODY MAPPER
 * ============================================================================
 */

import { Landmark, LandmarkName } from "../types/landmark.types";

/**
 * Agrupa pontos esparsos identificados pelo Vision Engine em domínios anatômicos específicos.
 */
export function mapLandmarksToRegions(landmarks: Landmark[]): Record<string, Landmark[]> {
  const landmarkMap = new Map<LandmarkName, Landmark>(
    landmarks.map(l => [l.name, l])
  );

  const getOrNull = (name: LandmarkName): Landmark | null => landmarkMap.get(name) || null;

  return {
    head: [getOrNull("nose"), getOrNull("left_ear"), getOrNull("right_ear")].filter(Boolean) as Landmark[],
    shoulders: [getOrNull("left_shoulder"), getOrNull("right_shoulder")].filter(Boolean) as Landmark[],
    arms: [getOrNull("left_elbow"), getOrNull("right_elbow"), getOrNull("left_wrist"), getOrNull("right_wrist")].filter(Boolean) as Landmark[],
    pelvis: [getOrNull("left_hip"), getOrNull("right_hip")].filter(Boolean) as Landmark[],
    legs: [getOrNull("left_knee"), getOrNull("right_knee"), getOrNull("left_ankle"), getOrNull("right_ankle")].filter(Boolean) as Landmark[]
  };
}
