/**
 * ============================================================================
 * WORKOUT ACADEMIA - BIOMECHANICS AI MODULE: SKELETON BUILDER
 * ============================================================================
 */

import { BodyLandmarks } from "../types";

export interface BodySegment {
  from: string; // Nome do ponto de origem
  to: string;   // Nome do ponto de destino
  length: number; // Comprimento vetorial
  angle: number;  // Ângulo em relação à horizontal/vertical
}

/**
 * Constrói os segmentos corporais a partir dos pontos.
 * Fundamental para entender assimetrias e encurtamentos.
 */
export function buildSkeleton(landmarks: BodyLandmarks): { segments: BodySegment[] } {
  const points = landmarks.points;
  const getPoint = (name: string) => points.find(p => p.name === name);

  const segments: BodySegment[] = [];

  const leftShoulder = getPoint("left_shoulder");
  const rightShoulder = getPoint("right_shoulder");

  // Exemplo de cálculo de segmento: Linha dos Ombros
  if (leftShoulder && rightShoulder) {
    const dx = rightShoulder.x - leftShoulder.x;
    const dy = rightShoulder.y - leftShoulder.y;
    
    // Cálculo do comprimento do segmento (Pitágoras)
    const length = Math.sqrt(dx * dx + dy * dy);
    // Cálculo do ângulo em graus
    const angle = Math.atan2(dy, dx) * (180 / Math.PI);

    segments.push({
      from: "left_shoulder",
      to: "right_shoulder",
      length,
      angle
    });
  }

  // TODO: Expandir para coluna (ombros -> quadril), pernas (quadril -> joelho), etc.

  return { segments };
}
