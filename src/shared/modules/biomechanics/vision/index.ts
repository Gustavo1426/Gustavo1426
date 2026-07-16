/**
 * ============================================================================
 * WORKOUT ACADEMIA - BIOMECHANICS AI MODULE: VISION ENTRYPOINT
 * ============================================================================
 */

import { Landmark } from "../types/landmark.types";
import { PoseInput } from "../types/vision.types";
import { detectPose } from "./poseDetector";
import { extractAndMapLandmarks } from "./landmarkExtractor";
import { analyzeLandmarksConfidence } from "./confidenceAnalyzer";

export * from "./landmarkDetector";
export * from "./confidenceCalculator";
export * from "./bodyMapper";

export interface VisionEngineResult {
  photoId: string;
  detected: boolean;
  landmarks: Landmark[];
  confidence: number;
  lowConfidenceJoints: string[];
}

/**
 * Ponto de entrada padrão para o processamento de visão computacional.
 * Detecta pose (MediaPipe), extrai marcos anatômicos calibrados e valida confiança.
 */
export async function runVisionEngine(
  photoId: string,
  input: PoseInput,
  screenWidth: number,
  screenHeight: number
): Promise<VisionEngineResult> {
  // 1. Executa detecção da pose
  const detection = await detectPose(input);

  // 2. Extrai e mapeia landmarks normativos
  const landmarks = extractAndMapLandmarks(detection.landmarks, screenWidth, screenHeight);

  // 3. Analisa a confiabilidade geral
  const confidenceResult = analyzeLandmarksConfidence(landmarks);

  return {
    photoId,
    detected: detection.detected,
    landmarks,
    confidence: confidenceResult.overallConfidence,
    lowConfidenceJoints: confidenceResult.lowConfidenceJoints
  };
}
