/**
 * ============================================================================
 * WORKOUT ACADEMIA - BIOMECHANICS AI MODULE: CONTEXT BUILDER
 * ============================================================================
 */

import { CoachContext } from "../types/aiCoach.types";

/**
 * Agrupa os dados de todo o ecossistema (Biomecânica, Treino, Evolução) 
 * para criar o "cérebro" de contexto que a IA usará antes de responder.
 */
export async function buildCoachContext(studentId: string): Promise<CoachContext> {
  // Em produção, isso faria chamadas aos repositórios do Firebase (Firestore)
  return {
    studentId,
    studentName: "Carlos",
    goal: "hypertrophy",
    daysSinceLastAssessment: 65,
    adherence: {
      plannedWorkouts: 20,
      completedWorkouts: 18,
      adherencePercentage: 90,
      trend: "stable"
    },
    assessment: {
      igb: 84,
      findings: [{ id: "shoulder_anteriorization", name: "Ombro anteriorizado", severity: "medium" }],
      evolutionDelta: 12
    },
    workout: {
      currentPhase: "Acúmulo de Volume",
      recentVolumeChange: "decreased",
      fatigueLevel: "high"
    }
  };
}
