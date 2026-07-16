/**
 * ============================================================================
 * WORKOUT ACADEMIA - BIOMECHANICS AI MODULE: KNOWLEDGE GRAPH ENGINE
 * ============================================================================
 */

import {
  MuscleName,
  MuscleNode,
  JointName,
  JointNode,
  BiomechanicalPattern,
  BiomechanicsNode,
  ExerciseNode
} from "../types/ontology.types";

// ==========================================
// KNOWLEDGE BASE REPOSITORIES (Mock DBs)
// ==========================================

export const MuscleGraph: Record<MuscleName, MuscleNode> = {
  pectoralis_major: {
    id: "pectoralis_major",
    name: "Peitoral Maior",
    origin: "Clavícula e Esterno",
    insertion: "Úmero",
    primaryFunctions: ["flexion", "adduction", "internal_rotation"],
    synergists: ["anterior_deltoid", "triceps_brachii"],
    antagonists: ["latissimus_dorsi", "rhomboids"],
    recoveryTimeHours: 48
  },
  anterior_deltoid: { 
    id: "anterior_deltoid", 
    name: "Deltoide Anterior", 
    origin: "Clavícula", 
    insertion: "Úmero", 
    primaryFunctions: ["flexion", "internal_rotation"], 
    synergists: ["pectoralis_major"], 
    antagonists: ["latissimus_dorsi"], 
    recoveryTimeHours: 48 
  },
  triceps_brachii: { 
    id: "triceps_brachii", 
    name: "Tríceps", 
    origin: "Escápula e Úmero", 
    insertion: "Ulna", 
    primaryFunctions: ["extension"], 
    synergists: ["pectoralis_major"], 
    antagonists: ["triceps_brachii"], 
    recoveryTimeHours: 48 
  },
  rhomboids: { 
    id: "rhomboids", 
    name: "Romboides", 
    origin: "Vértebras", 
    insertion: "Escápula", 
    primaryFunctions: ["adduction"], 
    synergists: ["latissimus_dorsi"], 
    antagonists: ["pectoralis_major"], 
    recoveryTimeHours: 48 
  },
  latissimus_dorsi: { 
    id: "latissimus_dorsi", 
    name: "Grande Dorsal", 
    origin: "Vértebras", 
    insertion: "Úmero", 
    primaryFunctions: ["extension", "adduction"], 
    synergists: ["rhomboids"], 
    antagonists: ["pectoralis_major"], 
    recoveryTimeHours: 48 
  },
  gluteus_maximus: { 
    id: "gluteus_maximus", 
    name: "Glúteo Máximo", 
    origin: "Pelve", 
    insertion: "Fêmur", 
    primaryFunctions: ["extension"], 
    synergists: ["quadriceps"], 
    antagonists: ["quadriceps"], 
    recoveryTimeHours: 72 
  },
  quadriceps: { 
    id: "quadriceps", 
    name: "Quadríceps", 
    origin: "Fêmur", 
    insertion: "Tíbia", 
    primaryFunctions: ["extension"], 
    synergists: ["gluteus_maximus"], 
    antagonists: ["gluteus_maximus"], 
    recoveryTimeHours: 72 
  }
};

export const JointGraph: Record<JointName, JointNode> = {
  shoulder: {
    id: "shoulder",
    name: "Complexo Articular do Ombro",
    mobilityNeeds: ["glenohumeral_rotation"],
    stabilityNeeds: ["scapulothoracic_fixation"],
    commonDysfunctions: ["shoulder_anteriorization"]
  },
  spine_thoracic: {
    id: "spine_thoracic",
    name: "Coluna Torácica",
    mobilityNeeds: ["extension", "rotation"],
    stabilityNeeds: ["core_bracing"],
    commonDysfunctions: ["thoracic_kyphosis"]
  },
  elbow: { id: "elbow", name: "Cotovelo", mobilityNeeds: [], stabilityNeeds: [], commonDysfunctions: [] },
  spine_lumbar: { id: "spine_lumbar", name: "Coluna Lombar", mobilityNeeds: [], stabilityNeeds: [], commonDysfunctions: ["pelvic_tilt"] },
  hip: { id: "hip", name: "Quadril", mobilityNeeds: ["flexion", "extension"], stabilityNeeds: ["pelvic_stability"], commonDysfunctions: ["pelvic_tilt"] },
  knee: { id: "knee", name: "Joelho", mobilityNeeds: [], stabilityNeeds: ["patellar_tracking"], commonDysfunctions: ["knee_valgus"] },
  ankle: { id: "ankle", name: "Tornozelo", mobilityNeeds: ["dorsiflexion"], stabilityNeeds: [], commonDysfunctions: [] }
};

export const BiomechanicsGraph: Record<BiomechanicalPattern, BiomechanicsNode> = {
  shoulder_anteriorization: {
    id: "shoulder_anteriorization",
    name: "Anteriorização de Ombros",
    reducedMobilityJoints: ["spine_thoracic"],
    reducedStabilityJoints: ["shoulder"], // Escápula solta
    hyperactiveMuscles: ["pectoralis_major", "anterior_deltoid"],
    inhibitedMuscles: ["rhomboids"]
  },
  thoracic_kyphosis: { 
    id: "thoracic_kyphosis", 
    name: "Cifose Torácica", 
    reducedMobilityJoints: ["spine_thoracic"], 
    reducedStabilityJoints: [], 
    hyperactiveMuscles: ["pectoralis_major"], 
    inhibitedMuscles: ["rhomboids"] 
  },
  pelvic_tilt: { 
    id: "pelvic_tilt", 
    name: "Anteversão Pélvica", 
    reducedMobilityJoints: ["hip"], 
    reducedStabilityJoints: ["spine_lumbar"], 
    hyperactiveMuscles: ["quadriceps"], 
    inhibitedMuscles: ["gluteus_maximus"] 
  },
  knee_valgus: { 
    id: "knee_valgus", 
    name: "Valgo Dinâmico", 
    reducedMobilityJoints: ["ankle"], 
    reducedStabilityJoints: ["knee", "hip"], 
    hyperactiveMuscles: ["quadriceps"], 
    inhibitedMuscles: ["gluteus_maximus"] 
  }
};

export const ExerciseGraph: Record<string, ExerciseNode> = {
  bench_press: {
    id: "bench_press",
    name: "Supino Reto com Barra",
    movementPattern: "horizontal_push",
    primaryMuscles: ["pectoralis_major"],
    secondaryMuscles: ["triceps_brachii", "anterior_deltoid"],
    jointActions: [{ joint: "shoulder", action: "flexion" }, { joint: "elbow", action: "extension" }],
    requiredMobility: ["spine_thoracic"],
    requiredStability: ["shoulder"],
    difficulty: 4,
    fatigueIndex: 82,
    coordinationIndex: 76,
    injuryRisk: "medium",
    methodologyTags: ["CXM_compound_core", "CAX_tension_focus"]
  },
  dumbbell_press: {
    id: "dumbbell_press",
    name: "Supino Reto com Halteres",
    movementPattern: "horizontal_push",
    primaryMuscles: ["pectoralis_major"],
    secondaryMuscles: ["triceps_brachii", "anterior_deltoid"],
    jointActions: [{ joint: "shoulder", action: "flexion" }, { joint: "elbow", action: "extension" }],
    requiredMobility: ["spine_thoracic"],
    requiredStability: ["shoulder"], // Exige MAIS estabilidade que a barra
    difficulty: 3,
    fatigueIndex: 75,
    coordinationIndex: 85,
    injuryRisk: "low",
    methodologyTags: ["CXM_unilateral_balance"]
  },
  machine_chest_press: {
    id: "machine_chest_press",
    name: "Supino Articulado Máquina",
    movementPattern: "horizontal_push",
    primaryMuscles: ["pectoralis_major"],
    secondaryMuscles: ["triceps_brachii", "anterior_deltoid"],
    jointActions: [{ joint: "shoulder", action: "flexion" }, { joint: "elbow", action: "extension" }],
    requiredMobility: [], // Máquina isola a torácica
    requiredStability: [], // Máquina provê estabilidade
    difficulty: 1,
    fatigueIndex: 60,
    coordinationIndex: 20,
    injuryRisk: "low",
    methodologyTags: ["CAX_metabolic_finisher"]
  }
};

// ==========================================
// GRAPH INFERENCE ENGINE
// ==========================================

export class KnowledgeGraphEngine {
  
  /**
   * INFERÊNCIA 1: Encontra o impacto de uma disfunção em um exercício específico.
   * A IA navega: Disfunção -> Articulações Afetadas -> Exercícios que exigem essa articulação.
   */
  static inferRiskForExercise(exerciseId: string, activeDysfunctions: BiomechanicalPattern[]): { isSafe: boolean; reasoning: string[] } {
    const exercise = ExerciseGraph[exerciseId];
    if (!exercise) throw new Error(`Exercício '${exerciseId}' não encontrado no grafo.`);

    const reasoning: string[] = [];
    let isSafe = true;

    activeDysfunctions.forEach(dysId => {
      const dysfunction = BiomechanicsGraph[dysId];
      if (!dysfunction) return;
      
      // Verifica se a disfunção compromete a estabilidade que o exercício exige
      const stabilityConflict = exercise.requiredStability.some(joint => dysfunction.reducedStabilityJoints.includes(joint));
      if (stabilityConflict) {
        isSafe = false;
        reasoning.push(`O exercício ${exercise.name} exige estabilidade na articulação que está comprometida pelo padrão de ${dysfunction.name}.`);
      }

      // Verifica se o exercício hipertrofia um músculo que já está hiperativo/encurtado
      const muscleConflict = exercise.primaryMuscles.some(muscle => dysfunction.hyperactiveMuscles.includes(muscle));
      if (muscleConflict) {
        reasoning.push(`O exercício foca em ${MuscleGraph[exercise.primaryMuscles[0]].name}, o que pode agravar o encurtamento causado pelo ${dysfunction.name}. Requer monitoramento de volume.`);
      }
    });

    return { isSafe, reasoning };
  }

  /**
   * INFERÊNCIA 2: Busca substitutos inteligentes no grafo.
   * Se "Supino com Barra" está arriscado, a IA navega pelo "MovementGraph" (Horizontal Push) 
   * e filtra aqueles que NÃO exigem a estabilidade comprometida.
   */
  static findSaferAlternatives(targetExerciseId: string, activeDysfunctions: BiomechanicalPattern[]): ExerciseNode[] {
    const targetExercise = ExerciseGraph[targetExerciseId];
    if (!targetExercise) return [];

    const alternatives: ExerciseNode[] = [];

    // Busca todos os exercícios do mesmo padrão de movimento (Ex: Empurrar Horizontal)
    const candidates = Object.values(ExerciseGraph).filter(
      ex => ex.movementPattern === targetExercise.movementPattern && ex.id !== targetExercise.id
    );

    candidates.forEach(candidate => {
      const riskAssessment = this.inferRiskForExercise(candidate.id, activeDysfunctions);
      if (riskAssessment.isSafe) {
        alternatives.push(candidate);
      }
    });

    // Retorna ordenado pelo índice de risco de lesão (menor risco primeiro)
    return alternatives.sort((a, b) => (a.injuryRisk === "low" ? -1 : 1));
  }

  /**
   * INFERÊNCIA 3: Constrói a lógica corretiva cruzando músculos inibidos com novos exercícios.
   */
  static inferCorrectiveStrategy(activeDysfunctions: BiomechanicalPattern[]): { targetMuscles: string[]; suggestedProtocols: string[] } {
    const inhibitedMuscles = new Set<string>();
    const protocols: string[] = [];

    activeDysfunctions.forEach(dysId => {
      const dysfunction = BiomechanicsGraph[dysId];
      if (!dysfunction) return;
      dysfunction.inhibitedMuscles.forEach(mId => {
        const muscle = MuscleGraph[mId];
        if (muscle) {
          inhibitedMuscles.add(muscle.name);
        }
      });
      protocols.push(`Aplicar protocolo CAX_tension_focus para fortalecimento isolado de antagonistas relacionados ao ${dysfunction.name}.`);
    });

    return {
      targetMuscles: Array.from(inhibitedMuscles),
      suggestedProtocols: protocols
    };
  }
}
