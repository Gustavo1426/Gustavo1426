/**
 * ============================================================================
 * WORKOUT ACADEMIA - BIOMECHANICS AI MODULE: EXERCISE RISK CHECKER
 * ============================================================================
 */

import { ExerciseTagBlock } from "../types/recommendation.types";

/**
 * Verifica se um exercício apresenta risco biomecânico para o aluno atual.
 * 
 * @param exerciseTags As tags cadastradas no seu banco para o exercício (ex: ["push", "shoulder_demand"])
 * @param studentRestrictions As restrições geradas pelo RecommendationEngine do aluno
 */
export function checkExerciseRisk(
  exerciseTags: string[], 
  studentRestrictions: ExerciseTagBlock[]
): { isSafe: boolean; warnings: string[] } {
  let hasRisk = false;
  const warnings: string[] = [];

  // Cruza as tags do exercício com as restrições do aluno
  studentRestrictions.forEach(restriction => {
    // Se o exercício tem alguma tag que bate com a restrição do aluno
    const isAffected = exerciseTags.some(tag => restriction.tags.includes(tag));
    
    if (isAffected) {
      hasRisk = true;
      warnings.push(...restriction.monitoringDirectives);
    }
  });

  return {
    isSafe: !hasRisk,
    warnings // Ex: ["Evitar extensão completa do cotovelo"]
  };
}
