/**
 * ============================================================================
 * WORKOUT ACADEMIA - PHASE 1.8: EVOLUTION ENGINE (V2) - WORKOUT BRIDGE
 * ============================================================================
 */

import { BiomechanicalFinding } from "../types/biomechanical.types";
import { ClinicalEvolution, EvolutionTrainingAdjustment } from "./types";

/**
 * Cria a conexão inteligente enviando triggers de adaptação automática para o gerador de treinos (Legado).
 */
export function generateWorkoutEngineTriggers(
  improvements: string[],
  currentFindings: BiomechanicalFinding[]
): { canUnlockExercises: string[]; shouldKeepRestrictions: string[] } {
  
  const canUnlockExercises: string[] = [];
  const shouldKeepRestrictions: string[] = [];
  const activeIds = new Set(currentFindings.map(f => f.id));

  const improvedEscapular = improvements.some(imp => imp.toLowerCase().includes("ombro") || imp.toLowerCase().includes("escapular"));
  if (improvedEscapular && !activeIds.has("shoulder_anteriorization")) {
    canUnlockExercises.push("supino_reto_barra", "desenvolvimento_halteres_vertical");
  } else {
    shouldKeepRestrictions.push("supino_reto_barra");
  }

  const improvedKnee = improvements.some(imp => imp.toLowerCase().includes("joelho") || imp.toLowerCase().includes("valgo"));
  if (improvedKnee && !activeIds.has("knee_valgus_tendency")) {
    canUnlockExercises.push("agachamento_livre_pesado", "afundo_passada_haltere");
  } else {
    shouldKeepRestrictions.push("agachamento_livre_pesado");
  }

  return {
    canUnlockExercises,
    shouldKeepRestrictions
  };
}

/**
 * Gera adaptações e recomendações práticas de treino com base nos achados persistentes da Fase 1.8 V2.
 */
export function generateTrainingAdjustments(clinical: ClinicalEvolution): EvolutionTrainingAdjustment {
  const adjustment: EvolutionTrainingAdjustment = {
    add: [],
    modify: [],
    attentionPoints: []
  };

  // Avalia problemas que não foram resolvidos de uma avaliação para a outra
  clinical.persistentIssues.forEach(issue => {
    if (issue.ruleId === "ANKLE_LIMITATION") {
      adjustment.add.push("Rotina específica de mobilidade de tornozelo (Pré-treino)");
      adjustment.add.push("Alongamento dinâmico de panturrilha");
      adjustment.modify.push("Substituir Agachamento Livre Profundo por Variações com calço ou Hack");
      adjustment.attentionPoints.push("Monitorar inclinação do tronco nos exercícios de perna");
    }
    
    if (issue.ruleId === "SHOULDER_ASYMMETRY") {
      adjustment.add.push("Protocolo de ativação escapular (YTWL)");
      adjustment.modify.push("Priorizar halteres no lugar de barras nos exercícios de empurrar");
      adjustment.attentionPoints.push("Garantir retração escapular em todos os movimentos de puxar");
    }
  });

  return adjustment;
}
