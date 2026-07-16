/**
 * ============================================================================
 * WORKOUT ACADEMIA - BIOMECHANICS AI MODULE: BODY MAPPER
 * ============================================================================
 */

import { BodyLandmarks } from "../types";
import { detectLandmarks } from "./landmarkDetector";
import { buildSkeleton, BodySegment } from "./skeletonBuilder";
import { calculateBodyConfidence } from "./confidenceCalculator";

export interface BodyMapperResult {
  landmarks: BodyLandmarks;
  skeleton: { segments: BodySegment[] };
  confidence: number;
}

/**
 * Motor central da visão computacional do sistema.
 * Pega a foto, extrai coordenadas matemáticas e constrói o modelo estrutural.
 */
export async function mapBody(imageUrl: string): Promise<BodyMapperResult> {
  // 1. Detecta os pontos âncora
  const landmarks = await detectLandmarks(imageUrl);
  
  // 2. Calcula a confiança geral da detecção
  const confidence = calculateBodyConfidence(landmarks);
  
  // Atualiza a confiança no objeto raiz
  landmarks.confidence = confidence;

  // 3. Se a confiança for muito baixa, rejeitamos a análise
  if (confidence < 0.60) {
    throw new Error("O sistema não conseguiu mapear os pontos corporais com segurança. Verifique a iluminação e as roupas do aluno.");
  }

  // 4. Constrói as relações geométricas (esqueleto)
  const skeleton = buildSkeleton(landmarks);

  return {
    landmarks,
    skeleton,
    confidence
  };
}
