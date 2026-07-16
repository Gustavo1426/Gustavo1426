/**
 * ============================================================================
 * WORKOUT ACADEMIA - BIOMECHANICS AI MODULE: ANGLE CALCULATOR
 * ============================================================================
 */

import { Landmark } from "../types/landmark.types";
import { LandmarkPoint } from "../types";

/**
 * Calcula o ângulo formado por três pontos (A, B, C) onde B é o vértice.
 * Exemplo: Quadril (A), Joelho (B), Tornozelo (C).
 */
export function calculateAngle(a: LandmarkPoint, b: LandmarkPoint, c: LandmarkPoint): number {
  const radians = Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x);
  let degrees = Math.abs(radians * (180 / Math.PI));
  
  if (degrees > 180) {
    degrees = 360 - degrees;
  }
  
  return parseFloat(degrees.toFixed(2));
}

/**
 * Utilitário matemático para cálculos trigonométricos baseados nos landmarks 2D/3D.
 */
export class AngleCalculator {
  
  /**
   * Calcula o ângulo em graus de uma linha formada por dois pontos em relação à horizontal.
   */
  static calculateLineAngle(p1: Landmark, p2: Landmark): number {
    const dy = p2.y - p1.y;
    const dx = p2.x - p1.x;
    const radians = Math.atan2(dy, dx);
    const degrees = radians * (180 / Math.PI);
    return Math.round(Math.abs(degrees) * 10) / 10;
  }

  /**
   * Calcula o ângulo articular formado por três pontos (ex: Quadril -> Joelho -> Tornozelo).
   * Retorna o ângulo interno em graus.
   */
  static calculateJointAngle(p1: Landmark, joint: Landmark, p2: Landmark): number {
    // Vetores v1 (joint -> p1) e v2 (joint -> p2)
    const v1 = { x: p1.x - joint.x, y: p1.y - joint.y };
    const v2 = { x: p2.x - joint.x, y: p2.y - joint.y };

    const dotProduct = (v1.x * v2.x) + (v1.y * v2.y);
    const mag1 = Math.sqrt(v1.x * v1.x + v1.y * v1.y);
    const mag2 = Math.sqrt(v2.x * v2.x + v2.y * v2.y);

    if (mag1 === 0 || mag2 === 0) return 0;

    const cosTheta = dotProduct / (mag1 * mag2);
    // Clamping para evitar NaN fora do limite [-1, 1] devido a float precision
    const clampedCos = Math.max(-1, Math.min(1, cosTheta));
    const radians = Math.acos(clampedCos);
    
    return Math.round((radians * (180 / Math.PI)) * 10) / 10;
  }

  /**
   * Calcula a distância euclidiana simples entre dois pontos.
   */
  static calculateDistance(p1: Landmark, p2: Landmark): number {
    return Math.round(Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2)) * 10) / 10;
  }
}
