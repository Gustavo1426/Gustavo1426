/**
 * ============================================================================
 * WORKOUT ACADEMIA - BIOMECHANICS AI MODULE: MOBILITY INFERENCE
 * ============================================================================
 */

import { BodyMap } from "../types/body-analysis.types";

/**
 * Infere a probabilidade matemática de restrição de mobilidade articular baseando-se em posturas estáticas.
 */
export function inferMobilityRestrictions(bodyMap: BodyMap): { joint: string; restrictionProbability: number }[] {
  const inferences: { joint: string; restrictionProbability: number }[] = [];

  // 1. Probabilidade de restrição de mobilidade torácica
  let thoracicProb = 30; // base inicial
  if (bodyMap.spine.thoracicCurveAngle > 42) thoracicProb += 40;
  if (bodyMap.shoulders.protractionAngle > 15) thoracicProb += 15;
  inferences.push({ joint: "coluna torácica (extensão)", restrictionProbability: Math.min(95, thoracicProb) });

  // 2. Probabilidade de restrição de mobilidade de quadril
  let hipProb = 25;
  if (bodyMap.pelvis.tiltAngle > 11) hipProb += 50;
  inferences.push({ joint: "quadril (flexão/extensão)", restrictionProbability: Math.min(95, hipProb) });

  return inferences;
}
