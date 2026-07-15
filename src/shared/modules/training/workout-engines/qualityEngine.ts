/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { MUSCLE_GROUPS } from "../services/universalPrescriptionEngine";

export interface QualityCriterion {
  name: string;
  score: number;
  status: "Excelente" | "Bom" | "Regular" | "Ajustar";
  description: string;
}

export interface WorkoutQualityReport {
  score: number;
  rating: "Excelente" | "Bom" | "Regular" | "Crítico";
  color: string;
  criteria: Record<string, QualityCriterion>;
}

export class QualityEngine {
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
      movementCount = {}
    } = data;

    // Criterion 1: Volume Quality
    let volumeScore = 100;
    let volumeIssues = 0;
    for (const muscle of MUSCLE_GROUPS) {
      const vol = volumeDireto[muscle] || 0;
      if (vol > 0) {
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

    // Criterion 2: Muscle Balance
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

    // Criterion 3: Push / Pull Ratio
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

    // Overall Calculation
    const overallScore = Math.round(
      (volumeScore * 0.4) + (balanceScore * 0.3) + (pushPullScore * 0.3)
    );

    let rating: "Excelente" | "Bom" | "Regular" | "Crítico" = "Excelente";
    let color = "text-[#00f2ff] border-[#00f2ff]/20 bg-[#00f2ff]/5";

    if (overallScore < 60) {
      rating = "Crítico";
      color = "text-red-400 border-red-500/20 bg-red-500/5";
    } else if (overallScore < 75) {
      rating = "Regular";
      color = "text-amber-400 border-amber-500/20 bg-amber-500/5";
    } else if (overallScore < 90) {
      rating = "Bom";
      color = "text-yellow-400 border-yellow-500/20 bg-yellow-500/5";
    }

    return {
      score: overallScore,
      rating,
      color,
      criteria
    };
  }
}
