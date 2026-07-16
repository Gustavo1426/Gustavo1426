/**
 * ============================================================================
 * WORKOUT ACADEMIA - PHASE 2.0: VOLUME ADJUSTMENT ENGINE
 * ============================================================================
 */

import { AdaptedExerciseV2, BiomechanicalConstraint } from "./typesV2";
import { volumeRules } from "../rules/volumeAdjustmentRules";

// Mock Volume Limiter Engine
export const MockVolumeLimiterEngine = {
  capVolumeAdjustment: (muscleGroup: string, currentSets: number, suggestedDelta: number): number => {
    const maxSets = 22; // Limite teto do aluno
    const newSets = currentSets + suggestedDelta;
    return Math.min(newSets, maxSets); // O sistema decide, não a biomecânica
  }
};

/**
 * Ajusta o volume de treino (séries) respeitando as regras clínicas e de segurança do Volume Limiter Engine.
 */
export function applyVolumeLimits(
  exercises: AdaptedExerciseV2[],
  constraints: BiomechanicalConstraint[]
): AdaptedExerciseV2[] {
  return exercises.map(ex => {
    const adjustedEx = { ...ex };
    
    constraints.forEach(c => {
      const rule = volumeRules.find(r => r.ruleId === c.ruleId);
      // Mapeia a categoria do exercício para o grupo muscular da regra
      const isTargetMuscle = (rule?.targetMuscleGroup === "back" && ex.category === "pull") || 
                             (rule?.targetMuscleGroup === "chest" && ex.category === "push");

      if (rule && isTargetMuscle) {
        // Biomecânica sugeriu a mudança. Volume Limiter aprova ou corta (cap).
        adjustedEx.sets = MockVolumeLimiterEngine.capVolumeAdjustment(rule.targetMuscleGroup, ex.sets, rule.suggestedDelta);
        
        if (adjustedEx.decision.action === "keep") {
          adjustedEx.decision = {
            action: "modify",
            target: "Volume",
            reason: `Volume ajustado (${rule.suggestedDelta > 0 ? '+' : ''}${rule.suggestedDelta} séries) para compensar ${c.ruleId}.`,
            confidence: c.confidence
          };
        }
      }
    });

    return adjustedEx;
  });
}
