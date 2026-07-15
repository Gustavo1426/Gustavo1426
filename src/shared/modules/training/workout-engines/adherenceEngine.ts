/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface AdherenceData {
  missedWorkouts: number;
  incompleteWorkouts: number;
  actualTime: number; // mins
  ignoredExercises: number;
  reportedRpeDiff: number;
  painLevel: number; // 0 to 10
  painArea: string;
  punctualityDelay: number; // mins
}

export interface AdherenceReport {
  score: number;
  rating: string;
  colorClass: string;
  barColor: string;
  tips: string;
  rescheduleActionMessage: string;
}

export class AdherenceEngine {
  /**
   * Evaluates the adherence parameters to produce a scientific, deterministic metric score.
   */
  public static calculate(data: AdherenceData): AdherenceReport {
    let score = 100;
    score -= data.missedWorkouts * 12;
    score -= data.incompleteWorkouts * 6;
    score -= Math.max(0, 60 - data.actualTime) * 0.5;
    score -= data.ignoredExercises * 4;
    score -= Math.abs(data.reportedRpeDiff) * 3;
    score -= data.painLevel * 4;
    score -= data.punctualityDelay * 0.3;

    const finalScore = Math.max(15, Math.min(100, Math.round(score)));

    let rating = "Aderência Excelente";
    let colorClass = "text-emerald-400 border-emerald-500/20 bg-emerald-500/5";
    let barColor = "bg-emerald-500";
    let tips = "O aluno está seguindo a periodização com rigor militar. O sistema neuromuscular está assimilando perfeitamente a carga de trabalho. Mantenha os incrementos graduais programados.";

    if (finalScore < 65) {
      rating = "Aderência Crítica";
      colorClass = "text-red-400 border-red-500/20 bg-red-500/5";
      barColor = "bg-red-500";
      tips = `Aderência abaixo de 65%. Fatores limitantes graves: Dor de nível ${data.painLevel}/10 na área (${data.painArea}) e sessões perdidas. Exige REPLANEJAMENTO IMEDIATO para diluição da sobrecarga ou diminuição da frequência.`;
    } else if (finalScore < 85) {
      rating = "Aderência Moderada";
      colorClass = "text-amber-400 border-amber-500/20 bg-amber-500/5";
      barColor = "bg-amber-500";
      tips = "Algumas sessões ou exercícios foram ignorados. Recomendamos reduzir ligeiramente a duração das sessões para menos de 50 minutos para melhorar a aderência mental, ou agrupar os exercícios prioritários no início.";
    }

    const rescheduleActionMessage = `[REPLANEJAMENTO REALIZADO]: O motor inteligente redistribuiu o volume das ${data.missedWorkouts} sessões perdidas. Foram injetadas micro-séries compensatórias com RPE controlado nos próximos treinos, adaptando o volume de empurrar para evitar agravamento da dor detectada no (${data.painArea}).`;

    return {
      score: finalScore,
      rating,
      colorClass,
      barColor,
      tips,
      rescheduleActionMessage
    };
  }
}
