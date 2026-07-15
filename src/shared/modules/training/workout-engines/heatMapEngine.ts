/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { MUSCLE_GROUPS } from "../services/universalPrescriptionEngine";

export interface MuscleStatus {
  level: "Inativo" | "Baixo Estímulo" | "Ideal" | "Alto" | "Excesso";
  colorClass: string;
  bgClass: string;
  glowClass: string;
  textClass: string;
  vol: number;
  fatigue: number;
  recoveryNeeded: number;
  recoveryAvailable: number;
}

export interface HeatMapReport {
  muscleStatusList: Record<string, MuscleStatus>;
  frontMuscles: Array<{ name: string; label: string; coords: string }>;
  backMuscles: Array<{ name: string; label: string; coords: string }>;
}

export class HeatMapEngine {
  /**
   * Evaluates mechanical and physiological loads per muscle to compute color-coded heat statuses.
   */
  public static calculate(inputs: {
    volumeEfetivo: Record<string, number>;
    volumeDireto: Record<string, number>;
    fatigueByMuscle: Record<string, number>;
    recoveryByMuscle: Record<string, number[]>;
    frequency: number;
  }): HeatMapReport {
    const {
      volumeEfetivo = {},
      volumeDireto = {},
      fatigueByMuscle = {},
      recoveryByMuscle = {},
      frequency = 3
    } = inputs;

    const muscleStatusList: Record<string, MuscleStatus> = {};

    MUSCLE_GROUPS.forEach((m) => {
      const vol = volumeEfetivo[m] || volumeDireto[m] || 0;
      const fatigue = fatigueByMuscle[m] || 0;
      const recPair = recoveryByMuscle[m] || [48, 48];
      const recNeeded = recPair[0] || 0;
      // Convert frequency to hours available: 3x -> 56h, 4x -> 42h, 5x -> 33h
      const recAvail = Math.round(168 / Math.max(1, frequency));

      let level: "Inativo" | "Baixo Estímulo" | "Ideal" | "Alto" | "Excesso" = "Inativo";

      if (vol === 0) {
        level = "Inativo";
      } else if (vol < 6) {
        level = "Baixo Estímulo";
      } else if (vol <= 16 && fatigue < 25 && recNeeded <= recAvail) {
        level = "Ideal";
      } else if (vol > 16 && vol <= 22 || fatigue >= 25 || recNeeded > recAvail) {
        level = "Alto";
      } else {
        level = "Excesso";
      }

      if (vol > 0 && (fatigue >= 35 || recNeeded > recAvail * 1.3)) {
        level = "Excesso";
      }

      let colorClass = "bg-[#3a494b]/30";
      let bgClass = "bg-[#161719]/90 border-[#3a494b]/20";
      let glowClass = "";
      let textClass = "text-[#6a7a7b]";

      if (level === "Baixo Estímulo") {
        colorClass = "bg-[#00f2ff]/20";
        bgClass = "bg-[#00f2ff]/5 border-[#00f2ff]/30";
        glowClass = "shadow-[0_0_12px_rgba(0,242,255,0.15)]";
        textClass = "text-[#00f2ff]";
      } else if (level === "Ideal") {
        colorClass = "bg-emerald-500/20";
        bgClass = "bg-emerald-500/5 border-emerald-500/30";
        glowClass = "shadow-[0_0_12px_rgba(16,185,129,0.15)]";
        textClass = "text-emerald-400";
      } else if (level === "Alto") {
        colorClass = "bg-amber-500/20";
        bgClass = "bg-amber-500/5 border-amber-500/30";
        glowClass = "shadow-[0_0_12px_rgba(245,158,11,0.15)]";
        textClass = "text-amber-400";
      } else if (level === "Excesso") {
        colorClass = "bg-red-500/20";
        bgClass = "bg-red-500/5 border-red-500/30";
        glowClass = "shadow-[0_0_15px_rgba(239,68,68,0.25)] animate-pulse";
        textClass = "text-red-400 font-extrabold";
      }

      muscleStatusList[m] = {
        level,
        colorClass,
        bgClass,
        glowClass,
        textClass,
        vol,
        fatigue,
        recoveryNeeded: recNeeded,
        recoveryAvailable: recAvail
      };
    });

    const frontMuscles = [
      { name: "Peitoral", label: "Peito", coords: "top-[23%] left-[28%] w-[44%]" },
      { name: "Quadríceps", label: "Quadríceps", coords: "top-[54%] left-[26%] w-[48%]" },
      { name: "Ombros", label: "Ombros (Ant)", coords: "top-[16%] left-[12%] w-[76%]" },
      { name: "Bíceps", label: "Bíceps", coords: "top-[28%] left-[16%] w-[68%]" },
      { name: "Core", label: "Abdomen", coords: "top-[36%] left-[34%] w-[32%]" },
      { name: "Adutores", label: "Adutores", coords: "top-[56%] left-[36%] w-[28%]" }
    ];

    const backMuscles = [
      { name: "Costas", label: "Costas / Dorsal", coords: "top-[21%] left-[24%] w-[52%]" },
      { name: "Glúteos", label: "Glúteos", coords: "top-[46%] left-[26%] w-[48%]" },
      { name: "Posteriores de Coxa", label: "Posteriores", coords: "top-[56%] left-[25%] w-[50%]" },
      { name: "Tríceps", label: "Tríceps", coords: "top-[26%] left-[15%] w-[70%]" },
      { name: "Panturrilhas", label: "Panturrilhas", coords: "top-[74%] left-[28%] w-[44%]" }
    ];

    return {
      muscleStatusList,
      frontMuscles,
      backMuscles
    };
  }
}
