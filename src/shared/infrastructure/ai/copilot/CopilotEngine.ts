/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Student, Workout, Exercise } from "../../../../types";

export interface ChurnPrediction {
  studentId: string;
  riskScore: number; // 0 to 100
  riskLevel: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  reasons: string[];
  recommendation: string;
}

export interface ProgressionSuggestion {
  exerciseId: string;
  exerciseName: string;
  currentWeight: number;
  suggestedWeight: number;
  incrementPercentage: number;
  justification: string;
}

export interface DeloadRecommendation {
  shouldDeload: boolean;
  reductionPercentage: number;
  justification: string;
  targetExercises: string[];
}

export interface ExerciseSwapRecommendation {
  originalExercise: string;
  suggestedReplacement: string;
  justification: string;
  adjustments: string;
}

/**
 * AI Copilot Engine providing advanced physical education diagnostics,
 * safety alerts, performance optimization, and student retention predictions.
 */
export class CopilotEngine {
  private static instance: CopilotEngine;

  private constructor() {}

  public static getInstance(): CopilotEngine {
    if (!CopilotEngine.instance) {
      CopilotEngine.instance = new CopilotEngine();
    }
    return CopilotEngine.instance;
  }

  /**
   * Predicts churn risk based on missed training days, attendance frequency,
   * plan expiration date, and last training date.
   */
  public predictChurn(student: Student, consecutiveMissedDays: number): ChurnPrediction {
    const reasons: string[] = [];
    let riskScore = 10;

    if (consecutiveMissedDays >= 5) {
      riskScore += 30;
      reasons.push(`Inatividade contínua por ${consecutiveMissedDays} dias.`);
    }
    if (consecutiveMissedDays >= 8) {
      riskScore += 25;
      reasons.push("Mais de uma semana completa sem registrar nenhum treino.");
    }
    if (student.status === "pending_renewal") {
      riskScore += 20;
      reasons.push("Vínculo de plano pendente de renovação financeira.");
    }
    if (student.renewalDays <= 3 && student.renewalDays >= 0) {
      riskScore += 10;
      reasons.push("Renovação contratual vence nos próximos 3 dias.");
    }

    // Limit maximum risk score
    riskScore = Math.min(riskScore, 95);

    let riskLevel: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL" = "LOW";
    let recommendation = "Manter acompanhamento padrão de rotina.";

    if (riskScore >= 80) {
      riskLevel = "CRITICAL";
      recommendation = "Contatar imediatamente via WhatsApp com mensagem motivadora e agendar feedback individual.";
    } else if (riskScore >= 50) {
      riskLevel = "HIGH";
      recommendation = "Gerar mensagem de resgate pelo Copilot e verificar se houve lesão ou contratempo na rotina.";
    } else if (riskScore >= 30) {
      riskLevel = "MEDIUM";
      recommendation = "Enviar lembrete sutil e demonstrar interesse pelo progresso do aluno nas redes sociais ou app.";
    }

    return {
      studentId: student.id,
      riskScore,
      riskLevel,
      reasons,
      recommendation,
    };
  }

  /**
   * Suggests progressive overload adjustment for a specific exercise based on
   * student performance feedback (e.g. perfect RPE, easily completing reps).
   */
  public suggestProgression(
    exercise: Exercise,
    completedReps: number,
    rpe: number
  ): ProgressionSuggestion | null {
    // RPE <= 7 indicates the load is too light for muscle failure/hypertrophy targets
    if (rpe > 8 || completedReps < exercise.sets) {
      return null;
    }

    const currentWeight = exercise.weight;
    let increment = 2; // Default 2kg increment

    if (currentWeight >= 100) {
      increment = 10;
    } else if (currentWeight >= 50) {
      increment = 5;
    } else if (currentWeight >= 20) {
      increment = 4;
    }

    const suggestedWeight = currentWeight + increment;
    const incrementPercentage = Math.round((increment / currentWeight) * 100);

    return {
      exerciseId: exercise.id,
      exerciseName: exercise.name,
      currentWeight,
      suggestedWeight,
      incrementPercentage,
      justification: `Aluno concluiu todas as séries com RPE de ${rpe}/10 (esforço baixo a moderado). Há margem biomecânica segura para progressão de carga de forma a manter o estímulo hipertrófico na faixa de repetições prescrita.`,
    };
  }

  /**
   * Evaluates if a student requires a deload phase due to systemic fatigue,
   * poor sleep quality, or reported joint pain.
   */
  public suggestDeload(
    student: Student,
    sleepHours: number,
    reportedJointPain: boolean,
    rpeHistoryAverage: number
  ): DeloadRecommendation {
    let shouldDeload = false;
    let reductionPercentage = 0;
    const justifications: string[] = [];
    const targetExercises: string[] = [];

    if (sleepHours < 6) {
      justifications.push(`Sono cronicamente baixo (${sleepHours}h/noite) reduzindo síntese proteica e reparação do colágeno articular.`);
    }
    if (reportedJointPain) {
      shouldDeload = true;
      reductionPercentage = 15;
      justifications.push("Dor articular ativa reportada pelo atleta durante exercícios de cadeia cinética aberta.");
      targetExercises.push("Cadeira Extensora", "Tríceps Testa", "Elevação Lateral");
    }
    if (rpeHistoryAverage >= 9.5) {
      shouldDeload = true;
      reductionPercentage = Math.max(reductionPercentage, 10);
      justifications.push(`Esforço percebido médio (RPE) constantemente no teto fisiológico (${rpeHistoryAverage}/10) por mais de 4 semanas.`);
    }

    if (justifications.length >= 2) {
      shouldDeload = true;
      reductionPercentage = Math.max(reductionPercentage, 10);
    }

    return {
      shouldDeload,
      reductionPercentage,
      justification: shouldDeload
        ? `Deload recomendado devido a: ${justifications.join(" e ")}`
        : "Nenhum sinal crítico de fadiga sistêmica detectado. Continuar progressão linear de carga.",
      targetExercises,
    };
  }

  /**
   * Recommends alternative exercises to bypass physical limitations, injuries, or machinery unavailability.
   */
  public suggestExerciseSwap(originalExercise: string, reason: string): ExerciseSwapRecommendation {
    const originalLower = originalExercise.toLowerCase();
    const reasonLower = reason.toLowerCase();

    if (originalLower.includes("extensora") && (reasonLower.includes("joelho") || reasonLower.includes("patela"))) {
      return {
        originalExercise,
        suggestedReplacement: "Agachamento Hack ou Leg Press 45º (com pés altos)",
        justification: "A Cadeira Extensora gera alta força de cisalhamento patelofemoral nos últimos graus de extensão. O Leg Press 45º com pés altos e afastados distribui melhor a carga biomecânica, ativando mais a cadeia posterior e reduzindo o estresse direto sobre a patela.",
        adjustments: "Realizar com amplitude controlada de até 90º de flexão do joelho e cadência excêntrica de 3 segundos.",
      };
    }

    if (originalLower.includes("supino reto") && (reasonLower.includes("ombro") || reasonLower.includes("manguito"))) {
      return {
        originalExercise,
        suggestedReplacement: "Supino com Halteres Neutro ou Supino Inclinado Articulado",
        justification: "O supino com barra fixa o ombro em rotação interna e abdução excessiva. Halteres com pegada neutra (palmas voltadas para dentro) liberam o espaço subacromial, reduzindo drasticamente o pinçamento dos tendões do manguito rotador.",
        adjustments: "Manter cotovelos em um ângulo aproximado de 45º em relação ao tronco durante a descida.",
      };
    }

    if (originalLower.includes("agachamento livre") && (reasonLower.includes("lombar") || reasonLower.includes("coluna"))) {
      return {
        originalExercise,
        suggestedReplacement: "Agachamento Búlgaro com Halteres",
        justification: "O agachamento búlgaro é unilateral e elimina a carga de compressão axial direta sobre os discos intervertebrais da coluna lombar, ao mesmo tempo em que fornece um estímulo neuromuscular severo e focado nos membros inferiores.",
        adjustments: "Manter o tronco levemente inclinado à frente para maior ativação de glúteos e estabilidade pélvica.",
      };
    }

    // Default general swap
    return {
      originalExercise,
      suggestedReplacement: `Variação articulada de ${originalExercise}`,
      justification: "Transição temporária para uma máquina guiada que oferece vetores de força estabilizados e reduz a necessidade de ativação de músculos estabilizadores secundários fatigados.",
      adjustments: "Focar em alta conexão mente-músculo com cadências mais lentas.",
    };
  }
}
