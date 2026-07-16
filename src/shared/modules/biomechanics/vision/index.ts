/**
 * ============================================================================
 * WORKOUT ACADEMIA - BIOMECHANICS AI MODULE: VISION ENGINE ORCHESTRATOR
 * ============================================================================
 */

import { PoseInput, VisionAnalysis } from "../types/vision.types";
import { detectPose } from "./poseDetector";
import { extractAndMapLandmarks } from "./landmarkExtractor";
import { analyzeLandmarksConfidence } from "./confidenceAnalyzer";
import { buildBodySkeleton } from "./skeletonBuilder";

/**
 * Orquestrador principal da Camada de Visão Computacional.
 * Transforma uma foto aprovada em representações de pontos e esqueletos normalizados.
 */
export async function runVisionEngine(
  photoId: string,
  input: PoseInput,
  canvasWidth: number = 1080,
  canvasHeight: number = 1920
): Promise<VisionAnalysis> {
  
  // 1. Detectar pose primária com rede neural
  const detection = await detectPose(input);
  if (!detection.detected) {
    throw new Error("Pose não pôde ser detectada na imagem fornecida.");
  }

  // 2. Filtrar e mapear landmarks anatômicos estruturados com normalização espacial
  const mappedLandmarks = extractAndMapLandmarks(detection.landmarks, canvasWidth, canvasHeight);

  // 3. Validar consistência e qualidade estatística dos pontos (Análise de Oclusão)
  const confidenceAssessment = analyzeLandmarksConfidence(mappedLandmarks);
  if (!confidenceAssessment.valid) {
    throw new Error(
      `Falha de confiança na detecção corporal dos pontos: [${confidenceAssessment.lowConfidenceJoints.join(", ")}]. Por favor, tire uma nova foto.`
    );
  }

  // 4. Montar malha e conexões do esqueleto
  const skeleton = buildBodySkeleton(mappedLandmarks);

  return {
    photoId,
    poseDetected: true,
    overallConfidence: confidenceAssessment.overallConfidence,
    landmarks: mappedLandmarks,
    skeleton
  };
}
export * from "../types/vision.types";
