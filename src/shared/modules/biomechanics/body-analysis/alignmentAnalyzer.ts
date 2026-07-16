/**
 * ============================================================================
 * WORKOUT ACADEMIA - BIOMECHANICS AI MODULE: ALIGNMENT ANALYZER
 * ============================================================================
 */

import { Landmark, LandmarkName } from "../types/landmark.types";
import { AlignmentResult } from "../types/body-analysis.types";
import { BodyLandmarks } from "../types";

export interface BiomechanicalAlignmentResult {
  region: string;
  deviation: number;
  status: "normal" | "attention" | "critical";
}

export function analyzeAlignment(landmarks: Landmark[], view: "front" | "side" | "back"): AlignmentResult;
export function analyzeAlignment(landmarks: BodyLandmarks): BiomechanicalAlignmentResult[];
export function analyzeAlignment(
  landmarks: Landmark[] | BodyLandmarks,
  view?: "front" | "side" | "back"
): AlignmentResult | BiomechanicalAlignmentResult[] {
  if (Array.isArray(landmarks)) {
    const landmarkMap = new Map<LandmarkName, Landmark>(
      landmarks.map(l => [l.name, l])
    );

    let frontalAlignmentScore = 100;
    let lateralAlignmentScore = 100;

    const actualView = view || "front";

    if (actualView === "front" || actualView === "back") {
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

    if (actualView === "side") {
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
  } else {
    const results: BiomechanicalAlignmentResult[] = [];
    const getPoint = (name: string) => landmarks.points.find(p => p.name === name);

    const leftShoulder = getPoint("left_shoulder");
    const rightShoulder = getPoint("right_shoulder");

    // Alinhamento dos Ombros (Eixo Y)
    if (leftShoulder && rightShoulder) {
      // Calcula a inclinação da reta formada pelos ombros (em graus)
      const dy = Math.abs(rightShoulder.y - leftShoulder.y);
      const dx = Math.abs(rightShoulder.x - leftShoulder.x);
      const angleDeviation = Math.atan2(dy, dx) * (180 / Math.PI);
      
      let status: BiomechanicalAlignmentResult["status"] = "normal";
      if (angleDeviation > 5) status = "critical";
      else if (angleDeviation > 2) status = "attention";

      results.push({
        region: "shoulders",
        deviation: parseFloat(angleDeviation.toFixed(2)),
        status
      });
    }

    return results;
  }
}
