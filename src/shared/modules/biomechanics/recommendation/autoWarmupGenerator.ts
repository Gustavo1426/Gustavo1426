/**
 * ============================================================================
 * WORKOUT ACADEMIA - BIOMECHANICS AI MODULE: AUTO WARMUP GENERATOR
 * ============================================================================
 */

import { BiomechanicalRecommendation } from "../types/recommendation.types";

export interface WarmupExercise {
  name: string;
  instructions: string;
  sets: number;
  reps: string;
  type: "mobility" | "stability";
}

export interface WarmupBlock {
  blockName: string;
  exercises: WarmupExercise[];
}

/**
 * Puxa as recomendações da IA e converte no formato de exercícios do seu banco de dados
 * para criar o bloco de aquecimento/mobilidade.
 */
export function generateAutoWarmup(
  mobilityRecs: BiomechanicalRecommendation[],
  stabilityRecs: BiomechanicalRecommendation[]
): WarmupBlock {
  const warmupBlock: WarmupBlock = {
    blockName: "A - Preparação de Movimento e Mobilidade (Gerado por IA)",
    exercises: []
  };

  // Transforma recomendações de mobilidade em "exercícios" na planilha
  mobilityRecs.forEach(rec => {
    warmupBlock.exercises.push({
      name: rec.title,
      instructions: rec.description,
      sets: 2,
      reps: "15 a 20 seg",
      type: "mobility"
    });
  });

  // Transforma recomendações de estabilidade
  stabilityRecs.forEach(rec => {
    warmupBlock.exercises.push({
      name: rec.title,
      instructions: rec.description,
      sets: 2,
      reps: "12 a 15 reps",
      type: "stability"
    });
  });

  return warmupBlock; // Você insere isso direto no JSON do Treino do dia do aluno
}
