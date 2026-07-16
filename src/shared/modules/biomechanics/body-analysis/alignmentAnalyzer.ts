/**
 * ============================================================================
 * WORKOUT ACADEMIA - BIOMECHANICS AI MODULE: ALIGNMENT ANALYZER
 * ============================================================================
 */

import { Landmark, LandmarkName } from "../types/landmark.types";
import { AlignmentResult } from "../types/body-analysis.types";

/**
 * Avalia o alinhamento postural da linha central de gravidade corporal (Plumb Line).
 */
export function analyzeAlignment(landmarks: Landmark[], view: "front" | "side" | "back"): AlignmentResult {
  const landmarkMap = new Map<LandmarkName, Landmark>(
    landmarks.map(l => [l.name, l])
  );

  let frontalAlignmentScore = 100;
  let lateralAlignmentScore = 100;

  if (view === "front" || view === "back") {
    // Na vista frontal, o nariz, o centro dos ombros, a pelve e os pés devem coincidir na linha vertical vertical
    const nose = landmarkMap.get("nose");
    const lShoulder = landmarkMap.get("left_shoulder");
    const rShoulder = landmarkMap.get("right_shoulder");
    const lHip = landmarkMap.get("left_hip");
    const rHip = landmarkMap.get("right_hip");

    if (nose && lShoulder && rShoulder && lHip && rHip) {
      const shoulderCenter = (lShoulder.x + rShoulder.x) / 2;
      const hipCenter = (lHip.x + rHip.x) / 2;
      const deviation = Math.abs(nose.x - shoulderCenter) + Math.abs(shoulderCenter - hipCenter);
      frontalAlignmentScore = Math.max(0, 100 - Math.round(deviation * 4));
    }
  }

  if (view === "side") {
    // Na vista lateral (perfil), o conduto auditivo (orelha), acrômio (ombro), grande trocânter (quadril), joelho e tornozelo alinham-se
    const ear = landmarkMap.get("left_ear") || landmarkMap.get("right_ear");
    const shoulder = landmarkMap.get("left_shoulder") || landmarkMap.get("right_shoulder");
    const hip = landmarkMap.get("left_hip") || landmarkMap.get("right_hip");
    const knee = landmarkMap.get("left_knee") || landmarkMap.get("right_knee");

    if (ear && shoulder && hip && knee) {
      const meanX = (ear.x + shoulder.x + hip.x + knee.x) / 4;
      const deviation = 
        Math.abs(ear.x - meanX) + 
        Math.abs(shoulder.x - meanX) + 
        Math.abs(hip.x - meanX) + 
        Math.abs(knee.x - meanX);
      
      lateralAlignmentScore = Math.max(0, 100 - Math.round(deviation * 3));
    }
  }

  return {
    frontalAlignmentScore,
    lateralAlignmentScore
  };
}
