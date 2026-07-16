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

// ============================================================================
// 🧬 CLINICAL KNOWLEDGE GRAPH (PHASE 2.6)
// ============================================================================

export type NodeType = 
  | "DYSFUNCTION" 
  | "MUSCLE" 
  | "JOINT_MECHANIC" 
  | "CLINICAL_RISK" 
  | "TRAINING_ACTION" 
  | "EXERCISE"; // NOVO: Nó final palpável

export interface GraphNode {
  id: string;
  type: NodeType;
  label: string;
  // Payload opcional para nós do tipo EXERCISE
  dosage?: {
    sets: number;
    reps: string;
    frequency: number;
    phase: "warmup" | "main" | "cooldown";
  };
}

export type EdgeRelation = 
  | "CAUSES"               
  | "COMPENSATES"          // NOVO: Cadeia compensatória (Ex: Tornozelo -> Joelho)
  | "SHORTENS"             
  | "WEAKENS"              
  | "INHIBITS"             // NOVO: Inibição neurológica (Ex: Peitoral inibe Romboide)
  | "OVERACTIVATES"        // NOVO: Hiperatividade compensatória
  | "REQUIRES_MOBILITY"    // NOVO: Pré-requisito de movimento
  | "RESTRICTS"            
  | "INCREASES_RISK_OF"    
  | "CORRECTED_BY"         
  | "IMPLEMENTED_BY";      // NOVO: Ação -> Exercício Específico

export interface GraphEdge {
  sourceId: string;
  relation: EdgeRelation;
  targetId: string;
  weight: number; 
}

// ==========================================
// 2. KNOWLEDGE BASE (O Grafo Cinesiológico Completo)
// ==========================================

export const clinicalNodes: GraphNode[] = [
  // Disfunções (A Teia de Compensação)
  { id: "ANKLE_MOBILITY_DEFICIT", type: "DYSFUNCTION", label: "Déficit de Mobilidade de Tornozelo" },
  { id: "DYNAMIC_KNEE_VALGUS", type: "DYSFUNCTION", label: "Valgo Dinâmico de Joelho" },
  { id: "HIP_INTERNAL_ROTATION", type: "DYSFUNCTION", label: "Rotação Interna de Quadril Compensatória" },

  // Músculos (Inibição / Hiperativação)
  { id: "GLUTEUS_MEDIUS", type: "MUSCLE", label: "Glúteo Médio" },
  { id: "ADDUCTOR_COMPLEX", type: "MUSCLE", label: "Complexo Adutor" },

  // Riscos Clínicos
  { id: "ACL_TEAR_RISK", type: "CLINICAL_RISK", label: "Risco de Lesão no LCA" },
  { id: "PATELLOFEMORAL_PAIN", type: "CLINICAL_RISK", label: "Síndrome Femoropatelar" },

  // Ações
  { id: "ACTIVATE_GLUTE_MEDIUS", type: "TRAINING_ACTION", label: "Ativação de Glúteo Médio" },
  { id: "RELEASE_ADDUCTORS", type: "TRAINING_ACTION", label: "Liberação de Adutores" },

  // Exercícios Específicos (A Dose Terapêutica)
  { 
    id: "CLAMSHELL_BAND", 
    type: "EXERCISE", 
    label: "Ostra com Miniband",
    dosage: { sets: 2, reps: "15-20", frequency: 3, phase: "warmup" }
  },
  { 
    id: "FOAM_ROLLER_ADDUCTOR", 
    type: "EXERCISE", 
    label: "Liberação Miofascial Adutores no Rolo",
    dosage: { sets: 1, reps: "60s/lado", frequency: 3, phase: "warmup" }
  }
];

export const clinicalEdges: GraphEdge[] = [
  // A Cadeia de Compensação (Tornozelo -> Joelho -> Quadril)
  { sourceId: "ANKLE_MOBILITY_DEFICIT", relation: "COMPENSATES", targetId: "DYNAMIC_KNEE_VALGUS", weight: 0.95 },
  { sourceId: "DYNAMIC_KNEE_VALGUS", relation: "CAUSES", targetId: "HIP_INTERNAL_ROTATION", weight: 0.85 },

  // A Mecânica Muscular (Inibição e Hiperativação)
  { sourceId: "DYNAMIC_KNEE_VALGUS", relation: "INHIBITS", targetId: "GLUTEUS_MEDIUS", weight: 0.90 },
  { sourceId: "DYNAMIC_KNEE_VALGUS", relation: "OVERACTIVATES", targetId: "ADDUCTOR_COMPLEX", weight: 0.88 },

  // Risco Clínico
  { sourceId: "DYNAMIC_KNEE_VALGUS", relation: "INCREASES_RISK_OF", targetId: "ACL_TEAR_RISK", weight: 0.75 },
  { sourceId: "DYNAMIC_KNEE_VALGUS", relation: "INCREASES_RISK_OF", targetId: "PATELLOFEMORAL_PAIN", weight: 0.85 },

  // Caminho de Solução (Ação)
  { sourceId: "GLUTEUS_MEDIUS", relation: "CORRECTED_BY", targetId: "ACTIVATE_GLUTE_MEDIUS", weight: 0.9 },
  { sourceId: "ADDUCTOR_COMPLEX", relation: "CORRECTED_BY", targetId: "RELEASE_ADDUCTORS", weight: 0.9 },

  // Caminho Final (Exercício + Dose)
  { sourceId: "ACTIVATE_GLUTE_MEDIUS", relation: "IMPLEMENTED_BY", targetId: "CLAMSHELL_BAND", weight: 1.0 },
  { sourceId: "RELEASE_ADDUCTORS", relation: "IMPLEMENTED_BY", targetId: "FOAM_ROLLER_ADDUCTOR", weight: 1.0 }
];

// ==========================================
// 3. GRAPH INFERENCE ENGINE (Traversal)
// ==========================================

export interface CorrectivePrescription {
  exerciseId: string;
  exerciseName: string;
  sets: number;
  reps: string;
  phase: string;
  rationale: string; // Por que este exercício foi prescrito?
}

export interface ClinicalInference {
  rootDysfunction: string;
  compensatoryChain: string[];
  affectedMuscles: { inhibited: string[], overactive: string[] };
  clinicalRisks: string[];
  prescriptions: CorrectivePrescription[];
}

/**
 * Motor de Travessia do Grafo.
 * Navega da disfunção raiz até o exercício corretivo com sua dosagem.
 */
export function inferClinicalPath(rootNodeId: string, confidenceThreshold: number = 0.7): ClinicalInference {
  const inference: ClinicalInference = {
    rootDysfunction: clinicalNodes.find(n => n.id === rootNodeId)?.label || rootNodeId,
    compensatoryChain: [],
    affectedMuscles: { inhibited: [], overactive: [] },
    clinicalRisks: [],
    prescriptions: []
  };

  const getNode = (id: string) => clinicalNodes.find(n => n.id === id);

  // 1. Encontra Cadeias de Compensação
  const compensations = clinicalEdges.filter(e => e.sourceId === rootNodeId && e.relation === "COMPENSATES");
  compensations.forEach(comp => {
    inference.compensatoryChain.push(getNode(comp.targetId)?.label || "");
    
    // 2. Musculatura Afetada pela Compensação
    const inhibited = clinicalEdges.filter(e => e.sourceId === comp.targetId && e.relation === "INHIBITS");
    const overactive = clinicalEdges.filter(e => e.sourceId === comp.targetId && e.relation === "OVERACTIVATES");
    
    inference.affectedMuscles.inhibited.push(...inhibited.map(e => getNode(e.targetId)?.label || ""));
    inference.affectedMuscles.overactive.push(...overactive.map(e => getNode(e.targetId)?.label || ""));

    // 3. Riscos Clínicos
    const risks = clinicalEdges.filter(e => e.sourceId === comp.targetId && e.relation === "INCREASES_RISK_OF");
    inference.clinicalRisks.push(...risks.map(e => getNode(e.targetId)?.label || ""));

    // 4. Mapeamento de Soluções (Ações -> Exercícios)
    [...inhibited, ...overactive].forEach(muscleEdge => {
      const actions = clinicalEdges.filter(e => e.sourceId === muscleEdge.targetId && e.relation === "CORRECTED_BY");
      
      actions.forEach(actionEdge => {
        const exercises = clinicalEdges.filter(e => e.sourceId === actionEdge.targetId && e.relation === "IMPLEMENTED_BY");
        
        exercises.forEach(exEdge => {
          const exerciseNode = getNode(exEdge.targetId);
          if (exerciseNode && exerciseNode.dosage) {
            inference.prescriptions.push({
              exerciseId: exerciseNode.id,
              exerciseName: exerciseNode.label,
              sets: exerciseNode.dosage.sets,
              reps: exerciseNode.dosage.reps,
              phase: exerciseNode.dosage.phase,
              rationale: `Compensa a disfunção de ${getNode(muscleEdge.targetId)?.label} causada por ${getNode(comp.targetId)?.label}.`
            });
          }
        });
      });
    });
  });

  // Limpa duplicatas
  inference.affectedMuscles.inhibited = [...new Set(inference.affectedMuscles.inhibited)];
  inference.affectedMuscles.overactive = [...new Set(inference.affectedMuscles.overactive)];
  inference.clinicalRisks = [...new Set(inference.clinicalRisks)];
  
  // Dedup de prescrições pelo ID do exercício
  inference.prescriptions = Array.from(new Map(inference.prescriptions.map(item => [item.exerciseId, item])).values());

  return inference;
}
