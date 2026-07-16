/**
 * ============================================================================
 * WORKOUT ACADEMIA - PHASE 2.0: EXERCISE ADAPTATION ENGINE
 * ============================================================================
 */

import { BaseExercise, BiomechanicalConstraint, AdaptedExerciseV2, BiomechanicalDecision } from "./typesV2";
import { restrictionRules } from "../rules/exerciseRestrictionRules";

// Mock Exercise Engine for Substitutions
export const MockExerciseEngine = {
  findSubstitute: (query: { avoidTags: string[], needs: string }) => {
    return {
      exercise: {
        id: "leg_press_45",
        name: "Leg Press 45",
        category: "squat",
        tags: ["machine", "stable"],
        sets: 3,
        reps: "10-12"
      },
      score: 94,
      reason: "Maior estabilidade externa"
    };
  }
};

/**
 * Adapta exercícios com base em restrições biomecânicas e nível de confiança na detecção.
 */
export function adaptExercises(
  exercises: BaseExercise[],
  constraints: BiomechanicalConstraint[]
): AdaptedExerciseV2[] {
  return exercises.map(ex => {
    let decision: BiomechanicalDecision = {
      action: "keep",
      target: ex.name,
      reason: "Seguro para o perfil atual.",
      confidence: 1.0
    };
    let adaptedEx = { ...ex };

    constraints.forEach(c => {
      const rule = restrictionRules.find(r => r.ruleId === c.ruleId && r.severity.includes(c.severity));
      if (!rule) return;

      const hasRestrictedTag = rule.avoidTags.some(tag => ex.tags.includes(tag));
      
      if (hasRestrictedTag) {
        if (c.confidence > 0.75) {
          // Confiança alta na disfunção: SUBSTITUIR. Consulta o Exercise Engine.
          const substitution = MockExerciseEngine.findSubstitute({ avoidTags: rule.avoidTags, needs: rule.needs });
          
          decision = {
            action: "replace",
            target: substitution.exercise.name,
            reason: `Risco de lesão associado a ${c.ruleId}. Trocado por variação mais estável.`,
            confidence: c.confidence
          };

          // Mescla as informações do exercício substituto mantendo o tipo compatível
          adaptedEx = {
            ...adaptedEx,
            id: substitution.exercise.id,
            name: substitution.exercise.name,
            category: substitution.exercise.category,
            tags: substitution.exercise.tags,
            sets: substitution.exercise.sets,
            reps: substitution.exercise.reps
          };
        } else if (c.confidence >= 0.25) {
          // Confiança moderada/baixa na foto: APENAS MODIFICAR. Não deleta o exercício.
          decision = {
            action: "modify",
            target: ex.name,
            reason: `Padrão de atenção (${c.ruleId}). Reduzir carga em 15% e focar na técnica.`,
            confidence: c.confidence
          };
        }
      }
    });

    return { ...adaptedEx, decision };
  });
}
