/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { classifyExercise, AuditWorkout } from "./biomechanicalAudit";

export interface CoachInsight {
  type: "warning" | "opportunity" | "biomechanical" | "danger" | "success";
  title: string;
  description: string;
  impact: string;
}

export class CoachInsightsEngine {
  /**
   * Evaluates workout volumes, fatigue metrics, and exercise selections to generate insights.
   * Utilizes actual deterministic indicators to populate recommendations.
   */
  public static generateInsights(
    workouts: AuditWorkout[],
    volumeDireto: Record<string, number>,
    volumeIndireto: Record<string, number>,
    volumeEfetivo: Record<string, number>,
    fatigueByMuscle: Record<string, number>
  ): CoachInsight[] {
    const insights: CoachInsight[] = [];

    // 1. Calculate push vs pull volume
    let pushSets = 0;
    let pullSets = 0;
    
    // Track muscle-specific Direct vs Indirect
    const musclesDirect: Record<string, number> = {};
    const musclesEffective: Record<string, number> = {};
    const musclesFatigue: Record<string, number> = {};

    // Standardize muscle names to match MUSCLE_GROUPS
    const standardMuscles = [
      "Peitoral", "Costas", "Quadríceps", "Posteriores de Coxa", 
      "Glúteos", "Bíceps", "Tríceps", "Ombros", "Panturrilhas", "Core", "Adutores"
    ];

    standardMuscles.forEach(m => {
      musclesDirect[m] = volumeDireto[m] || 0;
      musclesEffective[m] = volumeEfetivo[m] || 0;
      musclesFatigue[m] = fatigueByMuscle[m] || 0;
    });

    // Count workout frequency by muscle
    const muscleFrequencies: Record<string, number> = {};
    workouts.forEach(wk => {
      const distinctMusclesInWorkout = new Set<string>();
      (wk.exercises || []).forEach(ex => {
        const mg = ex.muscleGroup;
        if (mg) distinctMusclesInWorkout.add(mg);
      });
      distinctMusclesInWorkout.forEach(m => {
        muscleFrequencies[m] = (muscleFrequencies[m] || 0) + 1;
      });
    });

    workouts.forEach(wk => {
      (wk.exercises || []).forEach(ex => {
        const cls = classifyExercise(ex.name, ex.muscleGroup);
        const sets = ex.sets || 4;
        if (cls.pushPull === "Push") pushSets += sets;
        if (cls.pushPull === "Pull") pullSets += sets;
      });
    });

    // A. Push vs Pull Excess Insight
    if (pushSets > 0 && pullSets > 0) {
      const diffPct = Math.round((Math.abs(pushSets - pullSets) / Math.max(1, pullSets)) * 100);
      if (pushSets > pullSets && diffPct >= 15) {
        insights.push({
          type: "biomechanical",
          title: `Volume de empurrar supera puxar em ${diffPct}%`,
          description: `Identificamos ${pushSets} séries de empurrar versus ${pullSets} séries de puxar. Um volume excessivamente dominante de empurrar pode tensionar a cápsula anterior do ombro.`,
          impact: "Desequilíbrio de Torque Articular"
        });
      } else if (pullSets > pushSets && diffPct >= 15) {
        insights.push({
          type: "biomechanical",
          title: `Volume de puxar supera empurrar em ${diffPct}%`,
          description: `Há predominância na cadeia posterior de puxar (${pullSets} vs ${pushSets} séries). Excelente proteção para postura escapular, mas monitore fadiga de bíceps.`,
          impact: "Dominância Posterolateral"
        });
      }
    }

    // B. Quadriceps recovery limits check
    const quadVol = musclesEffective["Quadríceps"] || 0;
    const quadFat = musclesFatigue["Quadríceps"] || 0;
    if (quadVol >= 15 || quadFat > 7.5) {
      insights.push({
        type: "danger",
        title: "Quadríceps está próximo do limite recuperável.",
        description: `O volume de Quadríceps atingiu ${quadVol} séries efetivas com fadiga local em ${quadFat.toFixed(1)} UA. Mais estímulos nesta semana podem ultrapassar seu Limite Recuperável Máximo (MRV).`,
        impact: "Risco de Overreaching Local"
      });
    } else if (quadVol > 0 && quadVol <= 6) {
      insights.push({
        type: "opportunity",
        title: "Quadríceps apresenta margem de aumento volumétrico.",
        description: `Volume atual está em apenas ${quadVol} séries. Perfeito para alunos em fase regenerativa ou iniciantes que necessitam de consolidação coordenativa.`,
        impact: "Aproveitamento de MEV"
      });
    }

    // C. Triceps capacity insight
    const triVol = musclesEffective["Tríceps"] || 0;
    const triFat = musclesFatigue["Tríceps"] || 0;
    if (triVol <= 6 && triFat < 3.5) {
      insights.push({
        type: "opportunity",
        title: "Tríceps pode receber mais 2 séries.",
        description: `O Tríceps possui baixa fadiga local acumulada (${triFat.toFixed(1)} UA) e volume efetivo de ${triVol} séries. Pode receber estímulos isoladores adicionais de alta tensão.`,
        impact: "Sub-utilização de Capacidade"
      });
    }

    // D. Back low frequency insight
    const backFreq = muscleFrequencies["Costas"] || 0;
    const backVol = musclesEffective["Costas"] || 0;
    if (backVol >= 12 && backFreq <= 1) {
      insights.push({
        type: "warning",
        title: "Costas está com baixa frequência semanal.",
        description: `O volume acumulado de Costas de ${backVol} séries está concentrado em apenas ${backFreq} sessão de treino. Distribuir em 2 sessões melhoraria a qualidade de contração e síntese proteica.`,
        impact: "Concentração Volumétrica Ineficiente"
      });
    }

    // E. Hamstrings mechanical tension (Posteriores)
    const postDirect = musclesDirect["Posteriores de Coxa"] || 0;
    const postVol = musclesEffective["Posteriores de Coxa"] || 0;
    if (postVol > 0 && postDirect <= 4) {
      insights.push({
        type: "warning",
        title: "Posteriores apresentam baixa tensão mecânica direta.",
        description: `A maioria das séries efetivas (${postVol}) para Isquiotibiais é fruto de trabalho indireto e sinérgico. Recomenda-se adicionar movimentos focados em flexão de joelho (Cadeira/Mesa Flexora).`,
        impact: "Estímulo Tensionais Insuficientes"
      });
    }

    // F. General safe default insights
    if (insights.length < 3) {
      insights.push({
        type: "success",
        title: "Distribuição volumétrica equilibrada e harmoniosa",
        description: "Os volumes semanais se encontram distribuídos dentro dos limites seguros da fisiologia para os principais grupamentos musculares do mesociclo.",
        impact: "Consistência Estrutural"
      });
    }

    return insights;
  }
}
