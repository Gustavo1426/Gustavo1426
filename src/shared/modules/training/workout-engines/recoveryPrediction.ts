/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface RecoveryInput {
  systemicFatigue: number;
  fatigueByMuscle: Record<string, number>;
  recoveryByMuscle: Record<string, number[]>;
  currentWeek?: number;
  painLevel?: number;
  missedWorkouts?: number;
  frequency?: number;
}

export interface RecoveryReport {
  probability: number;
  fatigueRisk: "Baixo" | "Moderado" | "Alto";
  overreachingRisk: "Muito Baixo" | "Baixo" | "Moderado" | "Alto" | "Crítico";
  overtrainingRisk: "Muito Baixo" | "Baixo" | "Moderado" | "Alto" | "Crítico";
  performanceDropRisk: "Muito Baixo" | "Baixo" | "Moderado" | "Alto" | "Crítico";
  jointRisk: "Muito Baixo" | "Baixo" | "Moderado" | "Alto" | "Crítico";
  deloadNeeded: string;
  deloadReason: string;
  recommendedInterval: string;
  maxRecoveryHours: number;
}

export class RecoveryPredictionEngine {
  /**
   * Forecasts systemic and localized recovery statuses based on physiological loads.
   */
  public static predict(input: RecoveryInput): RecoveryReport {
    const {
      systemicFatigue = 0,
      fatigueByMuscle = {},
      recoveryByMuscle = {},
      currentWeek = 2,
      painLevel = 0,
      missedWorkouts = 0,
      frequency = 3
    } = input;

    // Local worst fatigue penalty
    let worstMusclePenalty = 0;
    Object.entries(fatigueByMuscle).forEach(([_, fat]) => {
      if (fat > worstMusclePenalty) {
        worstMusclePenalty = fat;
      }
    });

    const probability = Math.max(25, Math.min(100, Math.round(100 - (systemicFatigue * 0.25) - worstMusclePenalty)));

    let fatigueRisk: "Baixo" | "Moderado" | "Alto" = "Baixo";
    if (systemicFatigue > 120 || worstMusclePenalty > 40) {
      fatigueRisk = "Alto";
    } else if (systemicFatigue > 70 || worstMusclePenalty > 20) {
      fatigueRisk = "Moderado";
    }

    // 1. Overreaching Risk (Muito Baixo, Baixo, Moderado, Alto, Crítico)
    let overreachingRisk: "Muito Baixo" | "Baixo" | "Moderado" | "Alto" | "Crítico" = "Muito Baixo";
    if (systemicFatigue > 150 || worstMusclePenalty > 45) {
      overreachingRisk = "Crítico";
    } else if (systemicFatigue > 110 || worstMusclePenalty >= 35) {
      overreachingRisk = "Alto";
    } else if (systemicFatigue > 75 || worstMusclePenalty >= 20) {
      overreachingRisk = "Moderado";
    } else if (systemicFatigue > 40) {
      overreachingRisk = "Baixo";
    }

    // 2. Overtraining Risk (Muito Baixo, Baixo, Moderado, Alto, Crítico)
    let overtrainingRisk: "Muito Baixo" | "Baixo" | "Moderado" | "Alto" | "Crítico" = "Muito Baixo";
    const mesocycleFatigueAccum = systemicFatigue * (currentWeek / 2);
    if (mesocycleFatigueAccum > 240) {
      overtrainingRisk = "Crítico";
    } else if (mesocycleFatigueAccum > 160) {
      overtrainingRisk = "Alto";
    } else if (mesocycleFatigueAccum > 100) {
      overtrainingRisk = "Moderado";
    } else if (mesocycleFatigueAccum > 50) {
      overtrainingRisk = "Baixo";
    }

    // 3. Performance Drop Risk (Muito Baixo, Baixo, Moderado, Alto, Crítico)
    let performanceDropRisk: "Muito Baixo" | "Baixo" | "Moderado" | "Alto" | "Crítico" = "Muito Baixo";
    if (systemicFatigue > 140 || worstMusclePenalty > 40) {
      performanceDropRisk = "Crítico";
    } else if (systemicFatigue > 100 || worstMusclePenalty > 25) {
      performanceDropRisk = "Alto";
    } else if (systemicFatigue > 70) {
      performanceDropRisk = "Moderado";
    } else if (systemicFatigue > 35) {
      performanceDropRisk = "Baixo";
    }

    // 4. Joint Risk (Muito Baixo, Baixo, Moderado, Alto, Crítico)
    let jointRisk: "Muito Baixo" | "Baixo" | "Moderado" | "Alto" | "Crítico" = "Muito Baixo";
    const articularLoadScore = painLevel * 1.5 + (frequency * 1.2) + (systemicFatigue * 0.1);
    if (painLevel >= 7 || articularLoadScore > 15) {
      jointRisk = "Crítico";
    } else if (painLevel >= 4 || articularLoadScore > 10) {
      jointRisk = "Alto";
    } else if (painLevel >= 2 || articularLoadScore > 6) {
      jointRisk = "Moderado";
    } else if (articularLoadScore > 3) {
      jointRisk = "Baixo";
    }

    let deloadNeeded = "Não Necessário";
    let deloadReason = "Músculos respondendo bem aos treinos com excelente margem adaptativa.";
    
    if (currentWeek === 4) {
      deloadNeeded = "Recomendado (Semana 4)";
      deloadReason = "Fim do mesociclo padrão. Deload é necessário para dissipar fadiga acumulada e consolidar ganhos hipertróficos.";
    } else if (overreachingRisk === "Alto" || overreachingRisk === "Crítico" || systemicFatigue > 135) {
      deloadNeeded = "Imediato (Preventivo)";
      deloadReason = "A fadiga sistêmica extrapolou os limites fisiológicos de segurança. Risco crítico de overreaching não funcional.";
    }

    let maxRecoveryHours = 48;
    Object.entries(recoveryByMuscle).forEach(([_, recPair]) => {
      const hours = recPair[0] || 48;
      if (hours > maxRecoveryHours) {
        maxRecoveryHours = hours;
      }
    });

    const recommendedInterval = `${maxRecoveryHours}h a ${maxRecoveryHours + 24}h`;

    return {
      probability,
      fatigueRisk,
      overreachingRisk,
      overtrainingRisk,
      performanceDropRisk,
      jointRisk,
      deloadNeeded,
      deloadReason,
      recommendedInterval,
      maxRecoveryHours
    };
  }
}
