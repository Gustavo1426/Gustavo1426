/**
 * ============================================================================
 * WORKOUT ACADEMIA - BIOMECHANICS AI MODULE: STIMULUS ANALYZER
 * ============================================================================
 */

import { StimulusProfile, SessionData } from "../types/adaptation.types";

/**
 * Calcula a magnitude e a direção do estímulo da sessão de treino.
 */
export function analyzeStimulus(session: SessionData): StimulusProfile {
  let mechTension = 0;
  let metStress = 0;
  let neuroDemand = 0;
  let sysStress = 0;

  session.exercises.forEach(ex => {
    // Tensão Mecânica: Alta quando RIR é baixo (próximo à falha) e Carga/DNA hipertrófico é alto
    mechTension += (ex.sets * (10 - ex.rir)) * (ex.dna.hypertrophyYield || 0.8);
    
    // Estresse Metabólico: Alto quando reps são altas e RIR é baixo
    metStress += (ex.sets * ex.reps * (ex.rir <= 2 ? 1.2 : 0.8));
    
    // Demanda Neural: Baseada no DNA do exercício (ex: Levantamento Terra tem alto neuralDemand)
    neuroDemand += (ex.sets * (ex.dna.neuralDemand || 0.5));
    
    // Estresse Sistêmico: Soma das demandas compostas
    sysStress += (ex.sets * (ex.dna.systemicFatigue || 0.5));
  });

  // Normalização simplificada (0 a 100)
  const normalize = (val: number) => Math.min(100, Math.round(val * 1.5));

  return {
    mechanicalTension: normalize(mechTension),
    metabolicStress: normalize(metStress),
    neuromuscularDemand: normalize(neuroDemand),
    systemicStress: normalize(sysStress + (session.perceivedExertion * 5))
  };
}
