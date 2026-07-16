/**
 * ============================================================================
 * WORKOUT ACADEMIA - BIOMECHANICS AI MODULE: LANDMARK DETECTOR
 * ============================================================================
 */

import { BodyLandmarks } from "../types";

export interface VisionModel {
  detect(imageUrl: string): Promise<BodyLandmarks>;
}

/**
 * Interface que futuramente conectará ao MediaPipe Pose ou Google Vision.
 * Por enquanto, retorna pontos mockados para garantir o fluxo de testes.
 */
export async function detectLandmarks(imageUrl: string): Promise<BodyLandmarks> {
  // Simulando pontos corporais (frente)
  return {
    points: [
      { name: "left_shoulder", x: 0.35, y: 0.25, confidence: 0.95 },
      { name: "right_shoulder", x: 0.65, y: 0.26, confidence: 0.94 }, // Leve desnível simulado
      { name: "left_hip", x: 0.40, y: 0.50, confidence: 0.92 },
      { name: "right_hip", x: 0.60, y: 0.50, confidence: 0.91 },
      { name: "left_knee", x: 0.42, y: 0.75, confidence: 0.88 },
      { name: "right_knee", x: 0.58, y: 0.75, confidence: 0.89 }
    ],
    modelVersion: "mock-1.0",
    confidence: 0
  };
}
