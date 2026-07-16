/**
 * ============================================================================
 * WORKOUT ACADEMIA - BIOMECHANICS AI MODULE: ONTOLOGY TYPES
 * ============================================================================
 */

export type MovementPattern = "horizontal_push" | "horizontal_pull" | "vertical_push" | "vertical_pull" | "squat" | "hinge" | "lunge" | "core";
export type JointAction = "flexion" | "extension" | "abduction" | "adduction" | "internal_rotation" | "external_rotation";
export type MuscleName = "pectoralis_major" | "anterior_deltoid" | "triceps_brachii" | "latissimus_dorsi" | "gluteus_maximus" | "quadriceps" | "rhomboids";
export type JointName = "shoulder" | "elbow" | "spine_thoracic" | "spine_lumbar" | "hip" | "knee" | "ankle";
export type BiomechanicalPattern = "shoulder_anteriorization" | "thoracic_kyphosis" | "pelvic_tilt" | "knee_valgus";

// Nós do Grafo
export interface MuscleNode {
  id: MuscleName;
  name: string;
  origin: string;
  insertion: string;
  primaryFunctions: JointAction[];
  synergists: MuscleName[];
  antagonists: MuscleName[];
  recoveryTimeHours: number;
}

export interface JointNode {
  id: JointName;
  name: string;
  mobilityNeeds: string[];
  stabilityNeeds: string[];
  commonDysfunctions: BiomechanicalPattern[];
}

export interface ExerciseNode {
  id: string;
  name: string;
  movementPattern: MovementPattern;
  primaryMuscles: MuscleName[];
  secondaryMuscles: MuscleName[];
  jointActions: { joint: JointName; action: JointAction }[];
  requiredMobility: JointName[];
  requiredStability: JointName[];
  difficulty: 1 | 2 | 3 | 4 | 5;
  fatigueIndex: number; // 0 a 100
  coordinationIndex: number; // 0 a 100
  injuryRisk: "low" | "medium" | "high";
  methodologyTags: string[]; // Integração com a metodologia CXM/CAX
}

export interface BiomechanicsNode {
  id: BiomechanicalPattern;
  name: string;
  reducedMobilityJoints: JointName[];
  reducedStabilityJoints: JointName[];
  hyperactiveMuscles: MuscleName[];
  inhibitedMuscles: MuscleName[];
}
