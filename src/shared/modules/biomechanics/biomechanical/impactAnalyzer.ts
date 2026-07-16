/**
 * ============================================================================
 * WORKOUT ACADEMIA - PHASE 1.5: BIOMECHANICAL ENGINE - IMPACT ANALYZER
 * ============================================================================
 */

import { AnatomicalRule } from "./anatomicalRules";
import { movementRules } from "./movementRules";

export interface TrainingImpact {
  exerciseCategory: string;
  riskDescription: string;
  recommendation: string;
}

/**
 * Cruza as regras anatômicas acionadas com as regras de movimento para gerar prescrições de treino.
 */
export function analyzeTrainingImpact(triggeredRules: AnatomicalRule[]): TrainingImpact[] {
  const impacts: TrainingImpact[] = [];

  triggeredRules.forEach(rule => {
    const relatedMovement = movementRules.find(m => m.triggerId === rule.id);
    
    if (relatedMovement) {
      // Gera recomendação baseada na severidade
      let recommendation = "Monitorar técnica e amplitude.";
      if (rule.severity === "high") {
        recommendation = "Evitar variações com barra livre pesada. Priorizar halteres, máquinas e trabalho unilateral corretivo.";
      } else if (rule.severity === "medium") {
        recommendation = "Reduzir carga se houver desconforto. Focar em controle motor na fase excêntrica.";
      }

      impacts.push({
        exerciseCategory: relatedMovement.movement,
        riskDescription: relatedMovement.consequence,
        recommendation
      });
    }
  });

  return impacts;
}
