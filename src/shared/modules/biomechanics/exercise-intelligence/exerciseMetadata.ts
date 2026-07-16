/**
 * ============================================================================
 * WORKOUT ACADEMIA - BIOMECHANICS AI MODULE: EXERCISE METADATA & QUERY ENGINE
 * ============================================================================
 */

import { ExerciseIntelligence, Equipment } from "../types/exercise.types";
import { ExerciseDatabase } from "./exerciseRegistry";
import { extractVector, calculateCosineSimilarity } from "./exerciseRelations";

export interface SubstitutionQuery {
  targetExerciseId: string;
  availableEquipment?: Equipment[];
  excludedJoints?: string[];
  maxTechnicalComplexity?: number; // 0.0 a 1.0
}

/**
 * Encontra o melhor substituto para um exercício utilizando o DNA Biomecânico.
 * Não depende de listas estáticas de substituição, mas sim de matemática.
 */
export function findSmartSubstitute(query: SubstitutionQuery): { exercise: ExerciseIntelligence; similarityScore: number }[] {
  const target = ExerciseDatabase[query.targetExerciseId];
  if (!target) throw new Error(`Exercício alvo "${query.targetExerciseId}" não encontrado no EID.`);

  const targetVector = extractVector(target.dna);
  const candidates: { exercise: ExerciseIntelligence; similarityScore: number }[] = [];

  Object.values(ExerciseDatabase).forEach(candidate => {
    // 1. Filtros Absolutos (Hard Constraints)
    if (candidate.id === target.id) return;
    if (candidate.movement.pattern !== target.movement.pattern) return;
    
    if (query.availableEquipment) {
      const hasEquipment = candidate.compatibility.equipment.some(eq => query.availableEquipment!.includes(eq));
      if (!hasEquipment && !candidate.compatibility.equipment.includes("bodyweight")) return;
    }

    if (query.excludedJoints) {
      const involvesExcludedJoint = candidate.anatomy.joints.some(j => query.excludedJoints!.includes(j));
      if (involvesExcludedJoint) return;
    }

    if (query.maxTechnicalComplexity && candidate.dna.technicalComplexity > query.maxTechnicalComplexity) {
      return;
    }

    // 2. Filtro Relativo (Soft Constraints via Vetores)
    const candidateVector = extractVector(candidate.dna);
    const similarityScore = calculateCosineSimilarity(targetVector, candidateVector);

    candidates.push({ exercise: candidate, similarityScore });
  });

  // Retorna os candidatos ordenados do mais similar para o menos similar
  return candidates.sort((a, b) => b.similarityScore - a.similarityScore);
}
