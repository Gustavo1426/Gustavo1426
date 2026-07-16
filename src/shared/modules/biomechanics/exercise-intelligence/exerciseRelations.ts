/**
 * ============================================================================
 * WORKOUT ACADEMIA - BIOMECHANICS AI MODULE: EXERCISE RELATIONS & SIMILARITY
 * ============================================================================
 */

import { ExerciseDNA } from "../types/exercise.types";

/**
 * Converte o objeto DNA em um array numérico para cálculos vetoriais.
 */
export function extractVector(dna: ExerciseDNA): number[] {
  return [
    dna.mobilityDemand, dna.stabilityDemand, dna.coordinationDemand,
    dna.systemicFatigue, dna.localFatigue, dna.neuralDemand,
    dna.technicalComplexity, dna.hypertrophyYield, dna.strengthYield
  ];
}

/**
 * Calcula a Similaridade de Cossenos entre dois vetores de DNA de exercícios.
 * Retorna um valor entre 0 (totalmente diferente) e 1 (idêntico).
 */
export function calculateCosineSimilarity(vecA: number[], vecB: number[]): number {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += Math.pow(vecA[i], 2);
    normB += Math.pow(vecB[i], 2);
  }

  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}
