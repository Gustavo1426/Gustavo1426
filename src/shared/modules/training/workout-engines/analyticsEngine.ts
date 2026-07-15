/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface HistoryDataPoint {
  label: string;
  volume: number;       // sets
  fatigue: number;      // UA
  recovery: number;     // %
  performance: number;  // % score
  load: number;         // kg equivalent
  frequency: number;    // times/week
}

export interface AnalyticsHistory {
  weekly: HistoryDataPoint[];
  monthly: HistoryDataPoint[];
  mesocycle: HistoryDataPoint[];
  annual: HistoryDataPoint[];
}

export class AnalyticsEngine {
  /**
   * Generates historical trends based on active dashboard values
   * to power the Analytics Dashboard in weekly, monthly, mesocycle, and annual views.
   */
  public static generateHistory(
    currentVolume: number,
    currentFatigue: number,
    currentRecovery: number,
    currentFrequency: number
  ): AnalyticsHistory {
    const vol = currentVolume || 32;
    const fat = currentFatigue || 95;
    const rec = currentRecovery || 75;
    const freq = currentFrequency || 3;

    // 1. Weekly (6 Weeks)
    const weekly: HistoryDataPoint[] = [
      { label: "Sem. 1", volume: Math.round(vol * 0.8), fatigue: Math.round(fat * 0.7), recovery: 92, performance: 80, load: 120, frequency: freq },
      { label: "Sem. 2 (Atu.)", volume: vol, fatigue: Math.round(fat), recovery: rec, performance: 85, load: 125, frequency: freq },
      { label: "Sem. 3", volume: Math.round(vol * 1.1), fatigue: Math.round(fat * 1.25), recovery: Math.max(25, rec - 20), performance: 88, load: 130, frequency: freq },
      { label: "Sem. 4 (Del.)", volume: Math.round(vol * 0.5), fatigue: Math.round(fat * 0.4), recovery: 98, performance: 75, load: 110, frequency: freq },
      { label: "Sem. 5", volume: Math.round(vol * 1.05), fatigue: Math.round(fat * 0.9), recovery: 85, performance: 90, load: 132, frequency: freq },
      { label: "Sem. 6", volume: Math.round(vol * 1.2), fatigue: Math.round(fat * 1.4), recovery: Math.max(15, rec - 35), performance: 94, load: 138, frequency: freq }
    ];

    // 2. Monthly (4 Months)
    const monthly: HistoryDataPoint[] = [
      { label: "Março", volume: Math.round(vol * 0.9), fatigue: Math.round(fat * 0.85), recovery: 82, performance: 78, load: 115, frequency: freq },
      { label: "Abril", volume: Math.round(vol * 0.95), fatigue: Math.round(fat * 0.9), recovery: 80, performance: 82, load: 120, frequency: freq },
      { label: "Maio", volume: Math.round(vol * 1.02), fatigue: Math.round(fat * 0.98), recovery: 78, performance: 86, load: 124, frequency: freq },
      { label: "Junho (Atu.)", volume: vol, fatigue: Math.round(fat), recovery: rec, performance: 90, load: 128, frequency: freq }
    ];

    // 3. Mesocycle (3 Mesocycles)
    const mesocycle: HistoryDataPoint[] = [
      { label: "Meso 1: Base", volume: Math.round(vol * 0.85), fatigue: Math.round(fat * 0.8), recovery: 85, performance: 76, load: 112, frequency: freq },
      { label: "Meso 2: Força", volume: Math.round(vol * 0.95), fatigue: Math.round(fat * 0.95), recovery: 78, performance: 84, load: 124, frequency: freq },
      { label: "Meso 3: Hipertrofia (Atu.)", volume: vol, fatigue: Math.round(fat), recovery: rec, performance: 92, load: 130, frequency: freq }
    ];

    // 4. Annual (12 Months)
    const annual: HistoryDataPoint[] = [
      { label: "Jul/25", volume: Math.round(vol * 0.7), fatigue: Math.round(fat * 0.6), recovery: 88, performance: 70, load: 100, frequency: freq - 1 },
      { label: "Ago/25", volume: Math.round(vol * 0.75), fatigue: Math.round(fat * 0.7), recovery: 85, performance: 72, load: 104, frequency: freq - 1 },
      { label: "Set/25", volume: Math.round(vol * 0.8), fatigue: Math.round(fat * 0.75), recovery: 82, performance: 75, load: 108, frequency: freq },
      { label: "Out/25", volume: Math.round(vol * 0.85), fatigue: Math.round(fat * 0.8), recovery: 80, performance: 78, load: 112, frequency: freq },
      { label: "Nov/25", volume: Math.round(vol * 0.82), fatigue: Math.round(fat * 0.78), recovery: 82, performance: 80, load: 115, frequency: freq },
      { label: "Dez/25", volume: Math.round(vol * 0.5), fatigue: Math.round(fat * 0.4), recovery: 96, performance: 72, load: 105, frequency: freq - 1 },
      { label: "Jan/26", volume: Math.round(vol * 0.88), fatigue: Math.round(fat * 0.85), recovery: 78, performance: 82, load: 118, frequency: freq },
      { label: "Fev/26", volume: Math.round(vol * 0.92), fatigue: Math.round(fat * 0.9), recovery: 76, performance: 84, load: 122, frequency: freq },
      { label: "Mar/26", volume: Math.round(vol * 0.95), fatigue: Math.round(fat * 0.93), recovery: 75, performance: 86, load: 125, frequency: freq },
      { label: "Abr/26", volume: Math.round(vol * 1.0), fatigue: Math.round(fat * 0.96), recovery: 74, performance: 88, load: 128, frequency: freq },
      { label: "Mai/26", volume: Math.round(vol * 1.05), fatigue: Math.round(fat * 1.02), recovery: 72, performance: 91, load: 132, frequency: freq },
      { label: "Jun/26 (Atu.)", volume: vol, fatigue: Math.round(fat), recovery: rec, performance: 95, load: 136, frequency: freq }
    ];

    return { weekly, monthly, mesocycle, annual };
  }
}
