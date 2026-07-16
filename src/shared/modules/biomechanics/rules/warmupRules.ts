/**
 * ============================================================================
 * WORKOUT ACADEMIA - PHASE 2.0: WARMUP RULES
 * ============================================================================
 */

export interface WarmupRule {
  ruleId: string;
  phase: "release" | "mobility" | "activation" | "potentiation";
  duration: number;
  exercises: string[];
  reason: string;
}

export const warmupRules: WarmupRule[] = [
  { ruleId: "ANKLE_LIMITATION", phase: "release", duration: 2, exercises: ["Liberação Miofascial Panturrilha e Fáscia Plantar"], reason: "Reduzir tensão pré-mobilidade" },
  { ruleId: "ANKLE_LIMITATION", phase: "mobility", duration: 3, exercises: ["Dorsiflexão na Parede (2x 15s)"], reason: "Aumentar amplitude de tornozelo" },
  { ruleId: "SHOULDER_ASYMMETRY", phase: "activation", duration: 4, exercises: ["YTWL com elástico leve (2x 10)", "Rotação Externa de Ombros"], reason: "Estabilização da cintura escapular" },
  { ruleId: "KNEE_VALGUS", phase: "potentiation", duration: 3, exercises: ["Agachamento Isométrico com Miniband (2x 20s)"], reason: "Ativação prévia de glúteo médio" }
];
