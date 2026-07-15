/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { MUSCLE_GROUPS } from "./universalPrescriptionEngine";

export interface QualityCriterion {
  name: string;
  score: number; // 0 to 100
  status: "Excelente" | "Bom" | "Regular" | "Ajustar";
  description: string;
}

export interface WorkoutQualityReport {
  score: number; // Overall score 0 to 100
  rating: "Excelente" | "Bom" | "Regular" | "Crítico";
  color: string; // Tailwind color class or hex
  criteria: Record<string, QualityCriterion>;
}

export class WorkoutQualityEngine {
  /**
   * Calculates a scientific workout quality score (0 to 100) based on engine output data.
   * Utilizes official metrics from WorkoutOrchestrator / UniversalPrescriptionEngine.
   */
  public static calculate(data: {
    volumeDireto: Record<string, number>;
    volumeIndireto: Record<string, number>;
    volumeEfetivo: Record<string, number>;
    fatigueByMuscle: Record<string, number>;
    recoveryByMuscle: Record<string, number[]>;
    systemicFatigue: number;
    movementCount: Record<string, number>;
    studentData: any;
    workouts: any[];
  }): WorkoutQualityReport {
    const criteria: Record<string, QualityCriterion> = {};

    const {
      volumeDireto = {},
      volumeEfetivo = {},
      fatigueByMuscle = {},
      recoveryByMuscle = {},
      systemicFatigue = 0,
      movementCount = {},
      studentData = {},
      workouts = []
    } = data;

    const experience = String(studentData.experiencia || "Intermediário").toLowerCase();
    const objective = String(studentData.objetivo || "Hipertrofia").toLowerCase();

    // -------------------------------------------------------------
    // CRITÉRIO 1: Qualidade do Volume (Weight: 15%)
    // -------------------------------------------------------------
    let volumeScore = 100;
    let volumeIssues = 0;
    for (const muscle of MUSCLE_GROUPS) {
      const vol = volumeDireto[muscle] || 0;
      if (vol > 0) {
        // High quality if volume is in reasonable range
        if (vol > 22) {
          volumeScore -= 15;
          volumeIssues++;
        } else if (vol < 4) {
          volumeScore -= 8;
          volumeIssues++;
        }
      }
    }
    volumeScore = Math.max(0, Math.min(100, volumeScore));
    criteria["volume"] = {
      name: "Qualidade do Volume",
      score: volumeScore,
      status: volumeScore >= 90 ? "Excelente" : volumeScore >= 75 ? "Bom" : volumeScore >= 50 ? "Regular" : "Ajustar",
      description: volumeIssues === 0 
        ? "Todos os grupos musculares estão com volumes perfeitamente calibrados." 
        : `Identificados ${volumeIssues} grupos com volume abaixo do MEV ou acima do MRV.`
    };

    // -------------------------------------------------------------
    // CRITÉRIO 2: Equilíbrio Muscular (Weight: 10%)
    // -------------------------------------------------------------
    // Ratio of anterior (chest/quads) vs posterior (back/hamstrings)
    const antVol = (volumeDireto["Peitoral"] || 0) + (volumeDireto["Quadríceps"] || 0);
    const postVol = (volumeDireto["Costas"] || 0) + (volumeDireto["Posteriores de Coxa"] || 0);
    let balanceScore = 100;
    if (antVol > 0 && postVol > 0) {
      const ratio = antVol / postVol;
      if (ratio > 1.5 || ratio < 0.6) {
        balanceScore = 70;
      } else if (ratio > 1.25 || ratio < 0.8) {
        balanceScore = 88;
      }
    }
    criteria["balance"] = {
      name: "Equilíbrio Muscular",
      score: balanceScore,
      status: balanceScore >= 90 ? "Excelente" : balanceScore >= 75 ? "Bom" : "Regular",
      description: balanceScore >= 90
        ? "Excelente equilíbrio sinérgico entre cadeias musculares anteriores e posteriores."
        : "Leve assimetria de volume semanal entre cadeias anterior e posterior."
    };

    // -------------------------------------------------------------
    // CRITÉRIO 3: Relação Push / Pull (Weight: 10%)
    // -------------------------------------------------------------
    const pushCount = (movementCount.horizontalPush || 0) + (movementCount.verticalPush || 0);
    const pullCount = (movementCount.horizontalPull || 0) + (movementCount.verticalPull || 0);
    let pushPullScore = 100;
    if (pushCount > 0 && pullCount > 0) {
      const ratio = pushCount / pullCount;
      if (ratio > 2.0 || ratio < 0.5) {
        pushPullScore = 65;
      } else if (ratio > 1.5 || ratio < 0.66) {
        pushPullScore = 85;
      }
    }
    criteria["pushPull"] = {
      name: "Relação Push / Pull",
      score: pushPullScore,
      status: pushPullScore >= 90 ? "Excelente" : pushPullScore >= 75 ? "Bom" : "Regular",
      description: pushPullScore >= 90
        ? "Proporção ideal entre movimentos de empurrar e puxar, prevenindo lesões nos ombros."
        : "Desbalanço leve na relação de empurrar e puxar na planilha de treino."
    };

    // -------------------------------------------------------------
    // CRITÉRIO 4: Divisão Upper / Lower (Weight: 10%)
    // -------------------------------------------------------------
    const upperMuscles = ["Peitoral", "Costas", "Bíceps", "Tríceps", "Ombros"];
    const lowerMuscles = ["Quadríceps", "Posteriores de Coxa", "Glúteos", "Panturrilhas", "Adutores"];
    const upperVol = upperMuscles.reduce((acc, m) => acc + (volumeDireto[m] || 0), 0);
    const lowerVol = lowerMuscles.reduce((acc, m) => acc + (volumeDireto[m] || 0), 0);
    let upperLowerScore = 100;
    if (upperVol > 0 && lowerVol > 0) {
      const ratio = upperVol / lowerVol;
      // Ideally upper is slightly larger due to more muscle groups, say 1.2 to 1.8.
      if (ratio > 3.0 || ratio < 0.3) {
        upperLowerScore = 60;
      } else if (ratio > 2.2 || ratio < 0.5) {
        upperLowerScore = 80;
      }
    }
    criteria["upperLower"] = {
      name: "Upper / Lower Ratio",
      score: upperLowerScore,
      status: upperLowerScore >= 90 ? "Excelente" : upperLowerScore >= 75 ? "Bom" : "Regular",
      description: upperLowerScore >= 90
        ? "Distribuição de volume altamente balanceada entre membros superiores e inferiores."
        : "Concentração desproporcional de volume em um dos segmentos corporais."
    };

    // -------------------------------------------------------------
    // CRITÉRIO 5: Redundância de Padrões (Weight: 8%)
    // -------------------------------------------------------------
    let redundancyScore = 100;
    let redundancyIssues = 0;
    for (const [pattern, count] of Object.entries(movementCount)) {
      if (count > 3) {
        redundancyScore -= 15;
        redundancyIssues++;
      }
    }
    redundancyScore = Math.max(0, redundancyScore);
    criteria["redundancy"] = {
      name: "Redundância Motora",
      score: redundancyScore,
      status: redundancyScore >= 90 ? "Excelente" : redundancyScore >= 75 ? "Bom" : "Regular",
      description: redundancyIssues === 0
        ? "Nenhuma redundância de padrão mecânico detectada. Seleção biomecânica limpa."
        : `Detecção de ${redundancyIssues} padrões repetitivos que elevam o estresse articular.`
    };

    // -------------------------------------------------------------
    // CRITÉRIO 6: Estabilidade Biomecânica (Weight: 8%)
    // -------------------------------------------------------------
    // Ratio of complex free weight compounds to machine/cable isolated.
    // Safe and stable workouts are preferred, particularly for beginners.
    let stabilityScore = 95;
    const totalExercises = workouts.flatMap(w => w.exercises || []);
    const machineKeywords = ["máquina", "maquina", "cabo", "polia", "articulad", "guiad", "smith", "leg press", "extensora", "flexora", "adutora", "abdutora"];
    const machineCount = totalExercises.filter(ex => 
      machineKeywords.some(kw => ex.name.toLowerCase().includes(kw))
    ).length;
    const freeWeightCount = totalExercises.length - machineCount;

    if (experience.includes("inic") && freeWeightCount > machineCount * 1.5) {
      stabilityScore = 75; // too many complex compounds for a beginner
    } else if (experience.includes("avan") && machineCount > freeWeightCount * 2) {
      stabilityScore = 80; // too many machines, lacks structural loading for advanced
    }
    criteria["stability"] = {
      name: "Estabilidade Biomecânica",
      score: stabilityScore,
      status: stabilityScore >= 90 ? "Excelente" : stabilityScore >= 75 ? "Bom" : "Regular",
      description: stabilityScore >= 90
        ? "Mix perfeito de exercícios livres multiarticulares e isoladores guiados para segurança."
        : "Proporção desequilibrada de exercícios livres vs máquinas para o nível do aluno."
    };

    // -------------------------------------------------------------
    // CRITÉRIO 7: Recuperação & Supercompensação (Weight: 10%)
    // -------------------------------------------------------------
    let recoveryScore = 100;
    let recoveryIssues = 0;
    for (const [muscle, hrs] of Object.entries(recoveryByMuscle)) {
      const [needed, available] = hrs;
      if (needed > available) {
        recoveryScore -= 10;
        recoveryIssues++;
      }
    }
    recoveryScore = Math.max(0, recoveryScore);
    criteria["recovery"] = {
      name: "Recuperação & Supercompensação",
      score: recoveryScore,
      status: recoveryScore >= 90 ? "Excelente" : recoveryScore >= 75 ? "Bom" : "Regular",
      description: recoveryIssues === 0
        ? "Janelas de descanso ideais para garantir síntese proteica completa."
        : `Identificados ${recoveryIssues} músculos com tempo de recuperação insuficiente.`
    };

    // -------------------------------------------------------------
    // CRITÉRIO 8: Fadiga Sistêmica & Local (Weight: 10%)
    // -------------------------------------------------------------
    let fatigueScore = 100;
    let fatigueIssues = 0;
    for (const [muscle, fat] of Object.entries(fatigueByMuscle)) {
      if (fat > 24) {
        fatigueScore -= 8;
        fatigueIssues++;
      }
    }
    if (systemicFatigue > 120) {
      fatigueScore -= 15;
    }
    fatigueScore = Math.max(0, fatigueScore);
    criteria["fatigue"] = {
      name: "Controle de Fadiga",
      score: fatigueScore,
      status: fatigueScore >= 90 ? "Excelente" : fatigueScore >= 75 ? "Bom" : "Regular",
      description: fatigueScore >= 90
        ? "Fadiga sistêmica acumulada em níveis perfeitamente toleráveis e produtivos."
        : `Estresse metabólico elevado em ${fatigueIssues} músculos ou fadiga sistêmica alta.`
    };

    // -------------------------------------------------------------
    // CRITÉRIO 9: Distribuição Semanal (Weight: 8%)
    // -------------------------------------------------------------
    let distributionScore = 100;
    if (workouts.length > 1) {
      const exCounts = workouts.map(w => (w.exercises || []).length);
      const avg = exCounts.reduce((a, b) => a + b, 0) / exCounts.length;
      const variance = exCounts.reduce((sq, n) => sq + Math.pow(n - avg, 2), 0) / exCounts.length;
      const stdDev = Math.sqrt(variance);
      if (stdDev > 2.5) {
        distributionScore = 65; // highly unbalanced days (e.g. 10 exercises day 1, 2 exercises day 2)
      } else if (stdDev > 1.5) {
        distributionScore = 85;
      }
    }
    criteria["distribution"] = {
      name: "Distribuição Semanal",
      score: distributionScore,
      status: distributionScore >= 90 ? "Excelente" : distributionScore >= 75 ? "Bom" : "Regular",
      description: distributionScore >= 90
        ? "O volume e a densidade de exercícios estão distribuídos uniformemente na semana."
        : "Diferença acentuada de esforço e número de exercícios entre as sessões de treino."
    };

    // -------------------------------------------------------------
    // CRITÉRIO 10: Aderência ao Objetivo (Weight: 11%)
    // -------------------------------------------------------------
    let adherenceScore = 100;
    if (objective.includes("hiper") || objective.includes("force") || objective.includes("forç")) {
      // Must emphasize large multi-joint exercises
      const hasCompounds = totalExercises.some(ex => 
        ["supino", "agachamento", "terra", "puxada", "remada", "desenvolvimento", "leg press"].some(kw => ex.name.toLowerCase().includes(kw))
      );
      if (!hasCompounds) {
        adherenceScore = 60;
      }
    } else if (objective.includes("reab") || objective.includes("postur")) {
      // Rehabilitation should have lower intensity, stable exercises
      const hasHighRPE = totalExercises.some(ex => (ex.rpe || 8) > 9);
      if (hasHighRPE) {
        adherenceScore = 75; // RPE too high for recovery focus
      }
    }
    criteria["adherence"] = {
      name: "Aderência ao Objetivo",
      score: adherenceScore,
      status: adherenceScore >= 90 ? "Excelente" : adherenceScore >= 75 ? "Bom" : "Regular",
      description: adherenceScore >= 90
        ? `Prescrição perfeitamente alinhada com o objetivo de ${studentData.objetivo}.`
        : `A intensidade ou a seleção de exercícios poderia ser melhor ajustada para ${studentData.objetivo}.`
    };

    // Calculate Overall Weighted Score
    // Sum of weighted scores:
    // volume: 15%, balance: 10%, pushPull: 10%, upperLower: 10%, redundancy: 8%,
    // stability: 8%, recovery: 10%, fatigue: 10%, distribution: 8%, adherence: 11%
    const overallScoreRaw = 
      (criteria["volume"].score * 0.15) +
      (criteria["balance"].score * 0.10) +
      (criteria["pushPull"].score * 0.10) +
      (criteria["upperLower"].score * 0.10) +
      (criteria["redundancy"].score * 0.08) +
      (criteria["stability"].score * 0.08) +
      (criteria["recovery"].score * 0.10) +
      (criteria["fatigue"].score * 0.10) +
      (criteria["distribution"].score * 0.08) +
      (criteria["adherence"].score * 0.11);

    const score = Math.round(overallScoreRaw);

    // Dynamic rating based on score
    let rating: "Excelente" | "Bom" | "Regular" | "Crítico" = "Excelente";
    let color = "text-emerald-400";
    if (score < 60) {
      rating = "Crítico";
      color = "text-red-400";
    } else if (score < 80) {
      rating = "Regular";
      color = "text-amber-400";
    } else if (score < 92) {
      rating = "Bom";
      color = "text-blue-400";
    }

    return {
      score,
      rating,
      color,
      criteria
    };
  }
}
