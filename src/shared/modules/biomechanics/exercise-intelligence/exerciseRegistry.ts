/**
 * ============================================================================
 * WORKOUT ACADEMIA - BIOMECHANICS AI MODULE: EXERCISE REGISTRY
 * ============================================================================
 */

import { ExerciseIntelligence } from "../types/exercise.types";

export const ExerciseDatabase: Record<string, ExerciseIntelligence> = {
  "bench_press_barbell": {
    id: "bench_press_barbell",
    name: "Supino Reto com Barra",
    aliases: ["Bench Press", "Supino Reto"],
    movement: { pattern: "horizontal_push", plane: "transverse", bilateral: true, closedChain: false },
    anatomy: {
      joints: ["shoulder", "elbow", "scapula"],
      actions: ["horizontal_adduction", "elbow_extension"],
      primaryMuscles: ["pectoralis_major"],
      secondaryMuscles: ["triceps_brachii", "anterior_deltoid"],
      stabilizers: ["rotator_cuff", "serratus_anterior", "core"],
      activationCoefficients: { "pectoralis_major": 1.00, "triceps_brachii": 0.62, "anterior_deltoid": 0.48, "serratus_anterior": 0.22 }
    },
    dna: {
      mobilityDemand: 0.78, stabilityDemand: 0.91, coordinationDemand: 0.84,
      systemicFatigue: 0.74, localFatigue: 0.81, neuralDemand: 0.67,
      technicalComplexity: 0.86, hypertrophyYield: 0.94, strengthYield: 0.96
    },
    executionProfile: { averageExecutionTimeSec: 40, averageSetupTimeSec: 25 },
    compatibility: {
      equipment: ["barbell"],
      relativeContraindications: ["acute_shoulder_pain", "scapular_dyskinesis"],
      targetLevels: { beginner: 70, intermediate: 95, advanced: 98 }
    },
    lineage: {
      progressions: ["bench_press_chains", "paused_bench_press"],
      regressions: ["machine_chest_press", "push_up"],
      variations: ["bench_press_dumbbell", "smith_machine_bench"]
    }
  },
  "bench_press_dumbbell": {
    id: "bench_press_dumbbell",
    name: "Supino Reto com Halteres",
    aliases: ["Dumbbell Bench Press", "Supino Halter"],
    movement: { pattern: "horizontal_push", plane: "transverse", bilateral: true, closedChain: false },
    anatomy: {
      joints: ["shoulder", "elbow", "scapula"],
      actions: ["horizontal_adduction", "elbow_extension"],
      primaryMuscles: ["pectoralis_major"],
      secondaryMuscles: ["triceps_brachii", "anterior_deltoid"],
      stabilizers: ["rotator_cuff", "serratus_anterior", "core"],
      activationCoefficients: { "pectoralis_major": 0.95, "triceps_brachii": 0.55, "anterior_deltoid": 0.50, "rotator_cuff": 0.70 }
    },
    dna: {
      mobilityDemand: 0.82, stabilityDemand: 0.98, coordinationDemand: 0.90,
      systemicFatigue: 0.70, localFatigue: 0.85, neuralDemand: 0.72,
      technicalComplexity: 0.88, hypertrophyYield: 0.96, strengthYield: 0.85
    },
    executionProfile: { averageExecutionTimeSec: 45, averageSetupTimeSec: 20 },
    compatibility: {
      equipment: ["dumbbell"],
      relativeContraindications: ["acute_shoulder_pain"],
      targetLevels: { beginner: 60, intermediate: 90, advanced: 95 }
    },
    lineage: {
      progressions: ["alternating_dumbbell_press"],
      regressions: ["machine_chest_press"],
      variations: ["bench_press_barbell"]
    }
  },
  "push_up": {
    id: "push_up",
    name: "Flexão de Braços",
    aliases: ["Apoio", "Push-up"],
    movement: { pattern: "horizontal_push", plane: "transverse", bilateral: true, closedChain: true },
    anatomy: {
      joints: ["shoulder", "elbow", "scapula", "spine"],
      actions: ["horizontal_adduction", "elbow_extension", "scapular_protraction"],
      primaryMuscles: ["pectoralis_major"],
      secondaryMuscles: ["triceps_brachii", "anterior_deltoid"],
      stabilizers: ["core", "serratus_anterior", "quadriceps"],
      activationCoefficients: { "pectoralis_major": 0.80, "triceps_brachii": 0.70, "anterior_deltoid": 0.60, "core": 0.85 }
    },
    dna: {
      mobilityDemand: 0.50, stabilityDemand: 0.85, coordinationDemand: 0.75,
      systemicFatigue: 0.60, localFatigue: 0.75, neuralDemand: 0.40,
      technicalComplexity: 0.65, hypertrophyYield: 0.75, strengthYield: 0.60
    },
    executionProfile: { averageExecutionTimeSec: 35, averageSetupTimeSec: 5 },
    compatibility: {
      equipment: ["bodyweight"],
      relativeContraindications: ["wrist_pain"],
      targetLevels: { beginner: 85, intermediate: 80, advanced: 60 }
    },
    lineage: {
      progressions: ["weighted_push_up", "ring_push_up"],
      regressions: ["knee_push_up", "incline_push_up"],
      variations: ["close_grip_push_up"]
    }
  }
};
