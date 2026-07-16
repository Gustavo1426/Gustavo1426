/**
 * ============================================================================
 * WORKOUT ACADEMIA - PHASE 2.0: SMART WARMUP ENGINE
 * ============================================================================
 */

import { BiomechanicalConstraint, SmartWarmup } from "./typesV2";
import { warmupRules } from "../rules/warmupRules";

/**
 * Gera um aquecimento inteligente personalizado baseado em restrições biomecânicas.
 */
export function generateSmartWarmup(constraints: BiomechanicalConstraint[]): SmartWarmup[] {
  const routine: SmartWarmup[] = [];
  
  constraints.forEach(c => {
    // Busca regras aplicáveis a esta disfunção e severidade
    const applicableRules = warmupRules.filter(r => r.ruleId === c.ruleId);
    applicableRules.forEach(rule => {
      routine.push({
        phase: rule.phase,
        duration: rule.duration,
        exercises: rule.exercises,
        reason: rule.reason
      });
    });
  });

  // Ordena pela sequência clínica correta (Liberação -> Mobilidade -> Ativação -> Potencialização)
  const phaseOrder = { release: 1, mobility: 2, activation: 3, potentiation: 4 };
  return routine.sort((a, b) => phaseOrder[a.phase] - phaseOrder[b.phase]);
}
