/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AuditWorkout } from "./biomechanicalAudit";

export interface WeeklyForecast {
  week: number;
  label: string;
  volume: number;       // total weekly sets
  fatigue: number;      // systemic fatigue in UA
  recoveryPct: number;  // average recovery probability %
  loadIndex: number;    // relative percentage (e.g. 100% is current baseline)
  rir: number;          // Reps In Reserve
  techniquesCount: number; // count of advanced sets
}

export interface ForecastReport {
  weeks: WeeklyForecast[];
  summary: string;
}

export class MesocycleForecastEngine {
  /**
   * Automatically forecasts evolution variables for weeks 1 through 6
   * based on current workout configuration and physiological curves.
   */
  public static calculate(
    workouts: AuditWorkout[],
    baseSystemicFatigue: number,
    baseRir: number = 2,
    baseTechniquesCount: number = 0
  ): ForecastReport {
    // Calculate current total volume in sets
    let currentVolume = 0;
    workouts.forEach(wk => {
      (wk.exercises || []).forEach(ex => {
        currentVolume += ex.sets || 4;
      });
    });

    if (currentVolume === 0) currentVolume = 32; // safe fallback

    const weeks: WeeklyForecast[] = [];

    // Week 1: Adaptação / Introdução
    weeks.push({
      week: 1,
      label: "Semana 1: Adaptação",
      volume: Math.round(currentVolume * 0.85),
      fatigue: Math.round(baseSystemicFatigue * 0.7),
      recoveryPct: 95,
      loadIndex: 98,
      rir: baseRir + 1,
      techniquesCount: Math.max(0, Math.floor(baseTechniquesCount * 0.5))
    });

    // Week 2: Acumulação I (Baseline)
    weeks.push({
      week: 2,
      label: "Semana 2: Acumulação I",
      volume: currentVolume,
      fatigue: Math.round(baseSystemicFatigue),
      recoveryPct: 88,
      loadIndex: 100, // Baseline
      rir: baseRir,
      techniquesCount: baseTechniquesCount
    });

    // Week 3: Acumulação II (Sobrecarga)
    weeks.push({
      week: 3,
      label: "Semana 3: Acumulação II",
      volume: Math.round(currentVolume * 1.1),
      fatigue: Math.round(baseSystemicFatigue * 1.25),
      recoveryPct: 74,
      loadIndex: 103, // load micro-progression (+3%)
      rir: Math.max(1, baseRir - 1),
      techniquesCount: Math.round(baseTechniquesCount * 1.5) + 1
    });

    // Week 4: Deload Regenerativo
    weeks.push({
      week: 4,
      label: "Semana 4: Deload",
      volume: Math.round(currentVolume * 0.5),
      fatigue: Math.round(baseSystemicFatigue * 0.4),
      recoveryPct: 98,
      loadIndex: 90, // deliberate light load to recover joints
      rir: baseRir + 2,
      techniquesCount: 0 // no advanced techniques in deload
    });

    // Week 5: Acumulação III (Transição)
    weeks.push({
      week: 5,
      label: "Semana 5: Transição",
      volume: Math.round(currentVolume * 1.05),
      fatigue: Math.round(baseSystemicFatigue * 0.95),
      recoveryPct: 82,
      loadIndex: 104, // progression from previous cycle
      rir: baseRir,
      techniquesCount: baseTechniquesCount
    });

    // Week 6: Choque Fisiológico (Pico)
    weeks.push({
      week: 6,
      label: "Semana 6: Choque",
      volume: Math.round(currentVolume * 1.2),
      fatigue: Math.round(baseSystemicFatigue * 1.45),
      recoveryPct: 52, // high injury / non-functional risk if sustained
      loadIndex: 107, // peak load
      rir: Math.max(0, baseRir - 2), // close to failure
      techniquesCount: Math.round(baseTechniquesCount * 2) + 2
    });

    const summary = `Projeção matemática indica acúmulo ótimo de fadiga sistêmica até a Semana 3 (${weeks[2].fatigue} UA), dissipação total na Semana 4 de Deload (${weeks[3].fatigue} UA), e pico hipertrófico de estresse mecânico na Semana 6 de Choque (${weeks[5].fatigue} UA) com margem de segurança articular preservada.`;

    return { weeks, summary };
  }
}
