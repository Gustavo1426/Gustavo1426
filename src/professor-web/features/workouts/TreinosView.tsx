/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from "react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  AreaChart, 
  Area 
} from "recharts";
import { 
  Dumbbell, 
  Plus, 
  Trash2, 
  Save, 
  Activity, 
  Info,
  Calendar,
  Sparkles,
  ClipboardList,
  Edit,
  X,
  Search,
  BookOpen,
  Brain,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  BarChart3
} from "lucide-react";
import { Student, Workout, Exercise } from "../../../types";
import { TECNICAS_MUSCULACAO } from "@/src/data/tecnicas";
import AnaliseView from "./AnaliseView";
import StudentQuickWorkoutView from "./StudentQuickWorkoutView";
import ConfirmModal from "@/src/shared/presentation/components/ConfirmModal";
import { generateWorkoutWithAI } from "@/src/shared/modules/ai/services/workoutAI";
import { WorkoutQualityEngine } from "@/src/shared/modules/training/services/workoutQualityEngine";
import { ScientificEvidenceEngine } from "@/src/shared/modules/training/services/scientificEvidenceEngine";
import { ExplainableAiEngine } from "@/src/shared/modules/training/services/explainableAiEngine";
import CientificoDashboard from "./CientificoDashboard";
import PeriodizacaoCientifica from "./PeriodizacaoCientifica";

export const MASTER_PROMPT = `MASTER PROMPT — TREINOPRO SCIENTIFIC ENGINE (v2)

Você é o assistente interno do TREINOPRO.

Sua função NÃO é calcular volume, fadiga, recuperação ou periodização.

Todo o cálculo científico pertence exclusivamente ao WorkoutOrchestrator.

Você apenas seleciona exercícios compatíveis com as regras enviadas pelo sistema.

REGRA ABSOLUTA Nº 1

Nunca invente:

número de séries
número de repetições
volume semanal
frequência
prioridade muscular
intensidade
RPE
técnicas avançadas
progressão

Essas informações já foram calculadas pelo motor fisiológico.

REGRA ABSOLUTA Nº 2

Receberá um payload semelhante a:

{
 "goal":"Hipertrofia",
 "muscles":[
   {
      "name":"Peitoral",
      "exerciseCount":3,
      "setsPerExercise":[4,4,4]
   }
 ]
}

Utilize exatamente essa estrutura.

Nunca altere.

Nunca recalcule.

Nunca redistribua séries.

REGRA ABSOLUTA Nº 3

Escolha somente exercícios biomecanicamente compatíveis.

Considere:

equipamentos disponíveis
limitações articulares
experiência
nível técnico
histórico de lesões
exercícios proibidos
REGRA ABSOLUTA Nº 4

Não repetir exercícios.

Evitar:

nomes duplicados
mesma variação
mesmo padrão de movimento
REGRA ABSOLUTA Nº 5

Priorizar maior Stimulus to Fatigue Ratio.

Sempre escolher:

maior estabilidade
melhor curva de resistência
melhor amplitude
menor fadiga neural
REGRA ABSOLUTA Nº 6

Quando existirem várias opções:

priorizar

Máquinas

↓

Cabos

↓

Halteres

↓

Barra

exceto quando houver justificativa biomecânica.

REGRA ABSOLUTA Nº 7

Nunca escolher exercício incompatível com:

lesão

limitação

dor

restrição clínica

equipamento indisponível

REGRA ABSOLUTA Nº 8

Quando houver necessidade de substituir um exercício:

substituir somente por outro com

mesmo padrão motor

mesma função

mesmo grupo primário

mesma curva de resistência

REGRA ABSOLUTA Nº 9

Nunca alterar:

volumeDireto

volumeIndireto

volumeEfetivo

fatigue

recovery

Esses dados pertencem ao WorkoutOrchestrator.

REGRA ABSOLUTA Nº 10

A resposta deve conter apenas:

{
 "Peitoral":[
   {
      "exercise":"Supino Inclinado Máquina"
   },
   {
      "exercise":"Crucifixo Cabo"
   },
   {
      "exercise":"Supino Horizontal Máquina"
   }
 ]
}

Nada além disso.

O que pertence ao WorkoutOrchestrator

O motor matemático é o único responsável por:

cálculo de MEV
cálculo de MAV
cálculo de MRV
periodização
progressão
regressão
deload
sinergia
volume indireto
volume efetivo
fadiga local
fadiga sistêmica
recuperação
autoAdjustment
prioridades
distribuição semanal
teto fisiológico
regras biomecânicas
validação
auditoria
determinismo

A IA nunca pode modificar esses cálculos.

Fluxo Universal do TREINOPRO
Dados do aluno

↓

Objetivo

↓

WorkoutOrchestrator

↓

Volume alvo

↓

Prioridades

↓

Limites fisiológicos

↓

Sinergias

↓

Volume direto

↓

Volume indireto

↓

Fadiga

↓

Recuperação

↓

Distribuição das séries

↓

Quantidade de exercícios

↓

IA recebe apenas:

• músculos
• quantidade de exercícios
• séries por exercício
• limitações

↓

IA escolhe exercícios

↓

WorkoutOrchestrator valida

↓

Treino final`;

interface TreinosViewProps {
  students: Student[];
  workouts: Workout[];
  selectedStudentId: string | null;
  onSaveWorkout: (studentId: string, workoutName: string, exercises: Exercise[]) => void;
  onSelectStudent: (studentId: string) => void;
}

const MUSCULACAO_PRESETS = [
  "Supino Reto (Barra)",
  "Supino Inclinado (Halteres)",
  "Agachamento Livre (Barra)",
  "Leg Press 45°",
  "Cadeira Extensora",
  "Mesa Flexora",
  "Puxada Alta na Polia",
  "Remada Curvada (Barra)",
  "Remada Baixa Triângulo",
  "Desenvolvimento de Ombros (Halteres)",
  "Elevação Lateral (Halteres)",
  "Rosca Direta (Barra W)",
  "Tríceps Corda (Polia)",
  "Panturrilha em pé"
];

const FUNCIONAL_PRESETS = [
  "Kettlebell Swing",
  "Burpee",
  "Box Jump (Salto na Caixa)",
  "Prancha Isométrica",
  "Abdominal Supra na Polia",
  "Corrida em Esteira",
  "Remo Seco (Ergômetro)",
  "Slam Ball (Bola ao Chão)",
  "Corda Naval (Battle Rope)",
  "Wall Ball",
  "Avanço com Halteres (Passada)",
  "Flexão de Braços (Push up)",
  "Saltos Duplos (Corda)",
  "Agachamento Goblet"
];

const FUNCTIONAL_EXERCISE_POOL = [
  {
    name: "Kettlebell Swing",
    needsEquipment: "kettlebell",
    baseReps: { iniciante: "12", "intermediário": "15", "avanço": "20" },
    baseWeight: { iniciante: 8, "intermediário": 12, "avanço": 16 },
    notes: "Foco na extensão explosiva de quadril."
  },
  {
    name: "Wall Ball",
    needsEquipment: "bolapeso",
    baseReps: { iniciante: "10", "intermediário": "15", "avanço": "20" },
    baseWeight: { iniciante: 4, "intermediário": 6, "avanço": 9 },
    notes: "Arremesso na parede mantendo agachamento profundo."
  },
  {
    name: "Slam Ball (Bola ao Chão)",
    needsEquipment: "bolapeso",
    baseReps: { iniciante: "12", "intermediário": "15", "avanço": "20" },
    baseWeight: { iniciante: 6, "intermediário": 8, "avanço": 12 },
    notes: "Poder explosivo ao arremessar a bola contra o solo."
  },
  {
    name: "Box Jump (Salto na Caixa)",
    needsEquipment: "plyobox",
    baseReps: { iniciante: "8", "intermediário": "12", "avanço": "15" },
    baseWeight: { iniciante: 0, "intermediário": 0, "avanço": 0 },
    notes: "Extensão de quadril no topo da caixa."
  },
  {
    name: "Corda Naval (Battle Rope)",
    needsEquipment: "cordanaval",
    baseReps: { iniciante: "30s", "intermediário": "45s", "avanço": "60s" },
    baseWeight: { iniciante: 0, "intermediário": 0, "avanço": 0 },
    notes: "Manter postura semi-agachada e core contraído."
  },
  {
    name: "TRX Rows (Remada TRX)",
    needsEquipment: "trx",
    baseReps: { iniciante: "10", "intermediário": "12", "avanço": "15" },
    baseWeight: { iniciante: 0, "intermediário": 0, "avanço": 0 },
    notes: "Controle da fase excêntrica, corpo alinhado."
  },
  {
    name: "TRX Suspended Lunge",
    needsEquipment: "trx",
    baseReps: { iniciante: "8 cada perna", "intermediário": "10 cada perna", "avanço": "12 cada perna" },
    baseWeight: { iniciante: 0, "intermediário": 0, "avanço": 0 },
    notes: "Estabilidade unipodal e força de quadríceps."
  },
  {
    name: "Burpee Funcional",
    needsEquipment: "none",
    baseReps: { iniciante: "8", "intermediário": "12", "avanço": "15" },
    baseWeight: { iniciante: 0, "intermediário": 0, "avanço": 0 },
    notes: "Intensidade máxima, amortecer bem o pouso."
  },
  {
    name: "Flexão de Braço (Push up)",
    needsEquipment: "none",
    baseReps: { iniciante: "10 (com joelhos)", "intermediário": "12", "avanço": "15 (com toque de ombro)" },
    baseWeight: { iniciante: 0, "intermediário": 0, "avanço": 0 },
    notes: "Manter pelve neutra e cotovelos a 45 graus."
  },
  {
    name: "Prancha Isométrica com Toque",
    needsEquipment: "none",
    baseReps: { iniciante: "30s", "intermediário": "45s", "avanço": "60s" },
    baseWeight: { iniciante: 0, "intermediário": 0, "avanço": 0 },
    notes: "Fortalecimento de core estático e estabilidade escapular."
  }
];

export default function TreinosView({
  students,
  workouts,
  selectedStudentId,
  onSaveWorkout,
  onSelectStudent
}: TreinosViewProps) {
  
  // Local state for selecting active student in workout view
  const activeStudentId = selectedStudentId || (students[0]?.id ?? "");

  // Confirmation Modal states
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [deleteActionType, setDeleteActionType] = useState<"exercise" | "equipment" | "all_functional" | "all_musc" | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [deleteTargetName, setDeleteTargetName] = useState("");

  const handleRemoveEquipmentClick = (id: string, name: string) => {
    setDeleteActionType("equipment");
    setDeleteTargetId(id);
    setDeleteTargetName(name);
    setIsConfirmDeleteOpen(true);
  };

  const handleRemoveAllFunctionalClick = () => {
    setDeleteActionType("all_functional");
    setDeleteTargetId(null);
    setDeleteTargetName("todos os exercícios funcionais");
    setIsConfirmDeleteOpen(true);
  };

  const confirmDeleteAction = () => {
    if (deleteActionType === "exercise" && deleteTargetId) {
      setExercises(prev => prev.filter(ex => ex.id !== deleteTargetId));
    } else if (deleteActionType === "equipment" && deleteTargetId) {
      setEquipments(prev => prev.filter(item => item.id !== deleteTargetId));
    } else if (deleteActionType === "all_functional") {
      setExercises(prev => prev.filter(ex => ex.category !== "funcional"));
    } else if (deleteActionType === "all_musc") {
      setExercises(prev => prev.filter(ex => ex.category === "funcional"));
    }
    setIsConfirmDeleteOpen(false);
    setDeleteActionType(null);
    setDeleteTargetId(null);
  };
  
  // Find current student object
  const currentStudent = useMemo(() => {
    return students.find(s => s.id === activeStudentId) || students[0] || null;
  }, [students, activeStudentId]);
  
  // Find active workout for the selected student
  const activeWorkout = useMemo(() => {
    return workouts.find(w => w.studentId === activeStudentId) || null;
  }, [workouts, activeStudentId]);

  // Load dynamic presets for musculacao, filtering out deactivated ones
  const musculacaoPresets = useMemo(() => {
    try {
      const stored = localStorage.getItem("TreinoPro_Musculacao_Exercises");
      if (stored) {
        const list = JSON.parse(stored) as any[];
        // Filter out deactivated exercises
        const activeList = list.filter(ex => !ex.desativado).map(ex => ex.nome);
        if (activeList.length > 0) return activeList;
      }
    } catch (e) {
      console.warn("Error parsing musculacao exercises in TreinosView:", e);
    }
    return MUSCULACAO_PRESETS;
  }, []);

  // Form states for creating/editing workout
  const [workoutName, setWorkoutName] = useState("Treino Integrado de Alta Performance");
  const [exercises, setExercises] = useState<Exercise[]>([]);

  const handleUpdateExercise = (id: string, field: keyof Exercise, value: any) => {
    setExercises(prev => prev.map(ex => ex.id === id ? { ...ex, [field]: value } : ex));
  };

  const findExerciseMuscleGroup = (name: string): string => {
    const normalized = name.toLowerCase();
    
    if (normalized.includes("supino") || normalized.includes("peck deck") || normalized.includes("crucifixo") || normalized.includes("crossover") || normalized.includes("peitoral") || normalized.includes("chest")) {
      return "Peitoral";
    }
    if (normalized.includes("puxada") || normalized.includes("remada") || normalized.includes("pulldown") || normalized.includes("dorsal") || normalized.includes("chin-up") || normalized.includes("pull-up") || normalized.includes("costas")) {
      return "Costas";
    }
    if (normalized.includes("agachamento") || normalized.includes("leg press") || normalized.includes("hack") || normalized.includes("extensora") || normalized.includes("quadriceps") || normalized.includes("sissy") || normalized.includes("lunge") || normalized.includes("búlgaro") || normalized.includes("bulgarian") || normalized.includes("passada")) {
      return "Quadríceps";
    }
    if (normalized.includes("mesa flexora") || normalized.includes("cadeira flexora") || normalized.includes("flexora") || normalized.includes("stiff") || normalized.includes("romanian") || normalized.includes("good morning") || normalized.includes("posterior de coxa")) {
      return "Posteriores de Coxa";
    }
    if (normalized.includes("panturrilha") || normalized.includes("gêmeos") || normalized.includes("calf") || normalized.includes("panturrilhas")) {
      return "Panturrilhas";
    }
    if (normalized.includes("elevação lateral") || normalized.includes("desenvolvimento") || normalized.includes("crucifixo inverso") || normalized.includes("deltoide") || normalized.includes("shoulder") || normalized.includes("ombro")) {
      return "Ombros";
    }
    if (normalized.includes("rosca") || normalized.includes("bíceps") || normalized.includes("biceps") || normalized.includes("martelo")) {
      return "Bíceps";
    }
    if (normalized.includes("tríceps") || normalized.includes("triceps") || normalized.includes("testa") || normalized.includes("coice")) {
      return "Tríceps";
    }
    if (normalized.includes("glúteo") || normalized.includes("gluteo") || normalized.includes("hip thrust") || normalized.includes("elevação pélvica") || normalized.includes("abdução") || normalized.includes("abdutora")) {
      return "Glúteos";
    }
    if (normalized.includes("adutor") || normalized.includes("adutora")) {
      return "Adutores";
    }
    if (normalized.includes("abdominal") || normalized.includes("prancha") || normalized.includes("core") || normalized.includes("infra") || normalized.includes("obliquo")) {
      return "Core";
    }
    if (normalized.includes("lombar") || normalized.includes("hiperextensão") || normalized.includes("deadlift") || normalized.includes("terra")) {
      return "Eretores da Espinha";
    }
    
    return "Outros";
  };
  const [showPrompt, setShowPrompt] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showStudentViewModal, setShowStudentViewModal] = useState(false);
  
  // Traditional Bodybuilding form state
  const [muscName, setMuscName] = useState(musculacaoPresets[0] || MUSCULACAO_PRESETS[0]);
  const [muscCustomName, setMuscCustomName] = useState("");
  const [isMuscCustom, setIsMuscCustom] = useState(false);
  const [muscSets, setMuscSets] = useState(4);
  const [muscReps, setMuscReps] = useState("10");
  const [muscWeight, setMuscWeight] = useState(20);
  const [muscNotes, setMuscNotes] = useState("");

  // Functional Training form state
  const [funcName, setFuncName] = useState(FUNCIONAL_PRESETS[0]);
  const [funcCustomName, setFuncCustomName] = useState("");
  const [isFuncCustom, setIsFuncCustom] = useState(false);
  const [funcSets, setFuncSets] = useState(4);
  const [funcReps, setFuncReps] = useState("10");
  const [funcWeight, setFuncWeight] = useState(20);
  const [funcNotes, setFuncNotes] = useState("");

  // Parâmetros de Treino Funcional state
  const [funcModel, setFuncModel] = useState<"Circuito" | "HIIT" | "EMOM" | "AMRAP" | "Tabata">("Circuito");
  const [funcIntensity, setFuncIntensity] = useState<"iniciante" | "intermediário" | "avanço">("iniciante");
  const [funcStudentsCount, setFuncStudentsCount] = useState<number>(6);
  const [funcDuration, setFuncDuration] = useState<string>("30 minutos");
  const [funcWeeklyFreq, setFuncWeeklyFreq] = useState<string>("3 vezes por semana");
  const [funcMedicalRestrictions, setFuncMedicalRestrictions] = useState<string>("");
  const [funcDayOfWeek, setFuncDayOfWeek] = useState<string>("Segunda-feira");
  const [generatedTurmaWorkout, setGeneratedTurmaWorkout] = useState<string>(" ");
  const [generatedFunctionalWorkoutJSON, setGeneratedFunctionalWorkoutJSON] = useState<any | null>(null);
  const [copiedTurma, setCopiedTurma] = useState<boolean>(false);
  const [isGeneratingFunc, setIsGeneratingFunc] = useState<boolean>(false);

  // Dynamic Equipment interface and states
  interface EquipmentItem {
    id: string;
    name: string;
    icon: string;
    use: boolean;
    quantity: number;
  }

  const [equipments, setEquipments] = useState<EquipmentItem[]>([
    { id: "eq-trx", name: "Fitas de Suspensão TRX", icon: "🎗", use: true, quantity: 3 },
    { id: "eq-corda", name: "Corda Naval", icon: "➰", use: true, quantity: 2 },
    { id: "eq-escada", name: "Escada de Agilidade", icon: "🪜", use: true, quantity: 1 },
    { id: "eq-medicine", name: "Medicine Ball", icon: "🥎", use: true, quantity: 1 },
    { id: "eq-chapeus", name: "Chapéus Chineses", icon: "🛸", use: true, quantity: 10 },
    { id: "eq-cones", name: "Cones/Balizas", icon: "📐", use: true, quantity: 6 },
    { id: "eq-rua", name: "Rua/Espaço Livre", icon: "🏃", use: true, quantity: 1 },
    { id: "eq-peso", name: "Peso Corporal", icon: "🤸", use: true, quantity: 1 },
    { id: "eq-kettlebell", name: "Kettlebell", icon: "🏋️", use: true, quantity: 5 },
    { id: "eq-bolapeso", name: "Bola de Peso", icon: "⚽", use: true, quantity: 4 },
    { id: "eq-plyobox", name: "Caixa de Salto (Plyo Box)", icon: "📦", use: true, quantity: 2 },
  ]);

  const [showAddEqForm, setShowAddEqForm] = useState(false);
  const [newEqName, setNewEqName] = useState("");
  const [newEqIcon, setNewEqIcon] = useState("🔧");
  const [newEqQuantity, setNewEqQuantity] = useState(1);



  // Parâmetros de Musculação state
  const [periodizacaoModel, setPeriodizacaoModel] = useState<"Blocos Curtos (Linear)" | "Macrociclo Anual">("Blocos Curtos (Linear)");
  const [activeCycleIdx, setActiveCycleIdx] = useState<number>(1); // Semanas 7-10 as default (index 1)
  const [frequenciaSemanal, setFrequenciaSemanal] = useState<string>("5 x");
  const [selectedDivision, setSelectedDivision] = useState<string>("📐 ABC Tradicional");
  const [customDivisionText, setCustomDivisionText] = useState<string>("Dia A: 2 estímulos de Peitoral, 1 estímulo de Ombros, 1 estímulo de Tríceps\nDia B: 2 estímulos de Costas, 1 estímulo de Bíceps\nDia C: 2 estímulos de Quadríceps, 1 estímulo de Glúteos");
  const [generateCategory, setGenerateCategory] = useState<string>("Peito");

  // AI Generated Musculação Plan State
  const [isGeneratingMusculacao, setIsGeneratingMusculacao] = useState<boolean>(false);
  const [generatedPlan, setGeneratedPlan] = useState<{
    workouts: {
      dayName: string;
      exercises: {
        name: string;
        sets: number;
        reps: string;
        weight: number;
        notes: string;
        muscleGroup: string;
        category: "musculacao";
      }[];
    }[];
    reasoningExplanation: string;
    warning?: string;
    qualityReport?: any;
    scientificEvidence?: any;
  } | null>(null);
  const [selectedStudentForImport, setSelectedStudentForImport] = useState<string>("");
  const [selectedExplainableExercise, setSelectedExplainableExercise] = useState<any | null>(null);

  // Mapeia o plano gerado por IA para o formato de Exercise[] usado na Análise em tempo real
  const aiGeneratedExercises = useMemo<Exercise[]>(() => {
    if (!generatedPlan) return [];
    const list: Exercise[] = [];
    generatedPlan.workouts.forEach((wk, wkIdx) => {
      // Robust division mapping: first workout is "A", second is "B", third is "C", etc.
      // This is 100% stable and works regardless of dayName string format (Dia 1, Treino A, etc.)
      const divisionLetter = String.fromCharCode(65 + wkIdx);

      wk.exercises.forEach((ex, exIdx) => {
        list.push({
          id: `ex-ai-preview-${wkIdx}-${exIdx}`,
          name: ex.name,
          sets: Number(ex.sets) || 0,
          reps: String(ex.reps),
          weight: Number(ex.weight) || 0,
          notes: ex.notes,
          category: "musculacao",
          division: divisionLetter,
          muscleGroup: ex.muscleGroup
        });
      });
    });
    return list;
  }, [generatedPlan]);

  const computedQualityReport = useMemo(() => {
    if (!generatedPlan) return null;
    if (generatedPlan.qualityReport) return generatedPlan.qualityReport;
    
    try {
      const studentData = {
        idade: currentStudent?.age || 30,
        sexo: (currentStudent?.gender || "M") as any,
        experiencia: (currentStudent?.currentPhase || "Intermediário") as any,
        objetivo: "Hipertrofia",
        frequenciaSemanal: parseInt(frequenciaSemanal) || 3,
        disponibilidadeMinutos: 60,
        limitacoes: [],
        prioridades: {},
        equipamentosDisponiveis: [],
        tempoMaximoSessao: 60,
        semanaMesociclo: 2
      };
      
      return WorkoutQualityEngine.calculate({
        volumeDireto: {},
        volumeIndireto: {},
        volumeEfetivo: {},
        fatigueByMuscle: {},
        recoveryByMuscle: {},
        systemicFatigue: 0,
        movementCount: {},
        studentData,
        workouts: generatedPlan.workouts
      });
    } catch (e) {
      console.error(e);
      return null;
    }
  }, [generatedPlan, currentStudent, frequenciaSemanal]);

  const computedScientificEvidence = useMemo(() => {
    if (!generatedPlan) return null;
    if (generatedPlan.scientificEvidence) return generatedPlan.scientificEvidence;

    try {
      const studentData = {
        idade: currentStudent?.age || 30,
        sexo: (currentStudent?.gender || "M") as any,
        experiencia: (currentStudent?.currentPhase || "Intermediário") as any,
        objetivo: "Hipertrofia",
        frequenciaSemanal: parseInt(frequenciaSemanal) || 3,
        disponibilidadeMinutos: 60,
        limitacoes: [],
        prioridades: {},
        equipamentosDisponiveis: [],
        tempoMaximoSessao: 60,
        semanaMesociclo: 2
      };

      return ScientificEvidenceEngine.generate({
        studentData,
        workouts: generatedPlan.workouts
      });
    } catch (e) {
      console.error(e);
      return null;
    }
  }, [generatedPlan, currentStudent, frequenciaSemanal]);

  const effectiveAnalysisExercises = useMemo<Exercise[]>(() => {
    if (aiGeneratedExercises.length > 0) {
      return aiGeneratedExercises;
    }
    return exercises;
  }, [aiGeneratedExercises, exercises]);

  const handleAdjustEffectiveExercises = (updatedExs: Exercise[]) => {
    if (generatedPlan) {
      const updatedWorkouts = generatedPlan.workouts.map((wk, wkIdx) => {
        const divisionLetter = String.fromCharCode(65 + wkIdx);
        const matchingExs = updatedExs.filter(ex => ex.division === divisionLetter);

        return {
          ...wk,
          exercises: matchingExs.map(ex => ({
            name: ex.name,
            sets: ex.sets,
            reps: ex.reps,
            weight: ex.weight,
            notes: ex.notes || "",
            muscleGroup: ex.muscleGroup || "",
            category: "musculacao" as const
          }))
        };
      });

      setGeneratedPlan({
        ...generatedPlan,
        workouts: updatedWorkouts
      });
    } else {
      setExercises(updatedExs);
      if (activeStudentId) {
        onSaveWorkout(activeStudentId, workoutName || "Treino Integrado de Alta Performance", updatedExs);
      }
    }
  };

  // Tab/KPI toggle state between Musculação Tradicional and Treinamento Funcional
  const [activeTab, setActiveTab] = useState<"musculacao" | "funcional" | "analise" | "periodizacao">("musculacao");

  // Técnicas de Musculação state
  const [showTecnicasModal, setShowTecnicasModal] = useState(false);
  const [tecnicasSearchQuery, setTecnicasSearchQuery] = useState("");
  const [selectedTecnicaCategory, setSelectedTecnicaCategory] = useState<"todas" | "execucao" | "intensificacao" | "amplitude">("todas");

  // KPI Stats for techniques
  const kpiStats = useMemo(() => {
    const stats = { total: TECNICAS_MUSCULACAO.length, intensificacao: 0, amplitude: 0, execucao: 0 };
    TECNICAS_MUSCULACAO.forEach(tec => {
      if (tec.categoria === "intensificacao") stats.intensificacao++;
      if (tec.categoria === "amplitude") stats.amplitude++;
      if (tec.categoria === "execucao") stats.execucao++;
    });
    return stats;
  }, []);

  const filteredTecnicas = useMemo(() => {
    return TECNICAS_MUSCULACAO.filter(tec => {
      const query = tecnicasSearchQuery.toLowerCase();
      const matchesSearch = 
        tec.nome.toLowerCase().includes(query) ||
        tec.descricao.toLowerCase().includes(query) ||
        tec.instrucao.toLowerCase().includes(query) ||
        tec.tags.some(t => t.toLowerCase().includes(query));
      
      const matchesCategory = selectedTecnicaCategory === "todas" || tec.categoria === selectedTecnicaCategory;
      
      return matchesSearch && matchesCategory;
    });
  }, [tecnicasSearchQuery, selectedTecnicaCategory]);

  const tecnicasPorCategoria = useMemo(() => {
    const categories = {
      intensificacao: [] as typeof TECNICAS_MUSCULACAO,
      amplitude: [] as typeof TECNICAS_MUSCULACAO,
      execucao: [] as typeof TECNICAS_MUSCULACAO,
    };
    filteredTecnicas.forEach(tec => {
      if (tec.categoria in categories) {
        categories[tec.categoria].push(tec);
      }
    });
    return categories;
  }, [filteredTecnicas]);

  // Load saved parameters when student changes
  React.useEffect(() => {
    if (!activeStudentId) return;
    const saved = localStorage.getItem(`treinopro_param_musculacao_${activeStudentId}`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.periodizacaoModel) setPeriodizacaoModel(parsed.periodizacaoModel);
        if (typeof parsed.activeCycleIdx === "number") setActiveCycleIdx(parsed.activeCycleIdx);
        if (parsed.frequenciaSemanal) setFrequenciaSemanal(parsed.frequenciaSemanal);
        if (parsed.selectedDivision) setSelectedDivision(parsed.selectedDivision);
        if (parsed.customDivisionText) setCustomDivisionText(parsed.customDivisionText);
      } catch (e) {
        console.error(e);
      }
    } else {
      // Defaults
      setPeriodizacaoModel("Blocos Curtos (Linear)");
      setActiveCycleIdx(1);
      setFrequenciaSemanal("5 x");
      setSelectedDivision("📐 ABC Tradicional");
    }

    const savedFunc = localStorage.getItem(`treinopro_param_funcional_${activeStudentId}`);
    if (savedFunc) {
      try {
        const parsed = JSON.parse(savedFunc);
        if (parsed.funcModel) setFuncModel(parsed.funcModel);
        if (parsed.funcIntensity) setFuncIntensity(parsed.funcIntensity);
        if (typeof parsed.funcStudentsCount === "number") setFuncStudentsCount(parsed.funcStudentsCount);
        if (parsed.funcDuration) setFuncDuration(parsed.funcDuration);
        if (parsed.funcWeeklyFreq) setFuncWeeklyFreq(parsed.funcWeeklyFreq);
        if (parsed.funcMedicalRestrictions !== undefined) setFuncMedicalRestrictions(parsed.funcMedicalRestrictions);
        if (parsed.funcDayOfWeek) setFuncDayOfWeek(parsed.funcDayOfWeek);
        if (parsed.generatedTurmaWorkout !== undefined) setGeneratedTurmaWorkout(parsed.generatedTurmaWorkout);
        if (parsed.generatedFunctionalWorkoutJSON !== undefined) setGeneratedFunctionalWorkoutJSON(parsed.generatedFunctionalWorkoutJSON);
        
        if (parsed.equipments) {
          setEquipments(parsed.equipments);
        } else {
          // Migrate from legacy variables
          const initialList = [
            { id: "eq-trx", name: "Fitas de Suspensão TRX", icon: "🎗", use: typeof parsed.useTrx === "boolean" ? parsed.useTrx : true, quantity: typeof parsed.equipmentTrx === "number" ? parsed.equipmentTrx : 3 },
            { id: "eq-corda", name: "Corda Naval", icon: "➰", use: typeof parsed.useCordaNaval === "boolean" ? parsed.useCordaNaval : true, quantity: typeof parsed.equipmentCordaNaval === "number" ? parsed.equipmentCordaNaval : 2 },
            { id: "eq-escada", name: "Escada de Agilidade", icon: "🪜", use: typeof parsed.useEscadaAgilidade === "boolean" ? parsed.useEscadaAgilidade : true, quantity: typeof parsed.equipmentEscadaAgilidade === "number" ? parsed.equipmentEscadaAgilidade : 1 },
            { id: "eq-medicine", name: "Medicine Ball", icon: "🥎", use: typeof parsed.useMedicineBall === "boolean" ? parsed.useMedicineBall : true, quantity: typeof parsed.equipmentMedicineBall === "number" ? parsed.equipmentMedicineBall : 1 },
            { id: "eq-chapeus", name: "Chapéus Chineses", icon: "🛸", use: true, quantity: 10 },
            { id: "eq-cones", name: "Cones/Balizas", icon: "📐", use: true, quantity: 6 },
            { id: "eq-rua", name: "Rua/Espaço Livre", icon: "🏃", use: true, quantity: 1 },
            { id: "eq-peso", name: "Peso Corporal", icon: "🤸", use: true, quantity: 1 },
            { id: "eq-kettlebell", name: "Kettlebell", icon: "🏋️", use: typeof parsed.useKettlebell === "boolean" ? parsed.useKettlebell : true, quantity: typeof parsed.equipmentKettlebell === "number" ? parsed.equipmentKettlebell : 5 },
            { id: "eq-bolapeso", name: "Bola de Peso", icon: "⚽", use: typeof parsed.useBolaPeso === "boolean" ? parsed.useBolaPeso : true, quantity: typeof parsed.equipmentBolaPeso === "number" ? parsed.equipmentBolaPeso : 4 },
            { id: "eq-plyobox", name: "Caixa de Salto (Plyo Box)", icon: "📦", use: typeof parsed.usePlyoBox === "boolean" ? parsed.usePlyoBox : true, quantity: typeof parsed.equipmentPlyoBox === "number" ? parsed.equipmentPlyoBox : 2 },
          ];
          setEquipments(initialList);
        }

        // Legacy setters bypassed - values are handled in the equipments array above
      } catch (e) {
        console.error(e);
      }
    } else {
      // Defaults
      setFuncModel("Circuito");
      setFuncIntensity("iniciante");
      setFuncStudentsCount(6);
      setFuncDuration("45 minutos"); // default to 45 mins since 45 is mandatory in class time limit
      setFuncWeeklyFreq("3 vezes por semana");
      setFuncMedicalRestrictions("");
      setFuncDayOfWeek("Segunda-feira");
      setGeneratedTurmaWorkout("");
      setGeneratedFunctionalWorkoutJSON(null);
      setEquipments([
        { id: "eq-trx", name: "Fitas de Suspensão TRX", icon: "🎗", use: true, quantity: 3 },
        { id: "eq-corda", name: "Corda Naval", icon: "➰", use: true, quantity: 2 },
        { id: "eq-escada", name: "Escada de Agilidade", icon: "🪜", use: true, quantity: 1 },
        { id: "eq-medicine", name: "Medicine Ball", icon: "🥎", use: true, quantity: 1 },
        { id: "eq-chapeus", name: "Chapéus Chineses", icon: "🛸", use: true, quantity: 10 },
        { id: "eq-cones", name: "Cones/Balizas", icon: "📐", use: true, quantity: 6 },
        { id: "eq-rua", name: "Rua/Espaço Livre", icon: "🏃", use: true, quantity: 1 },
        { id: "eq-peso", name: "Peso Corporal", icon: "🤸", use: true, quantity: 1 },
        { id: "eq-kettlebell", name: "Kettlebell", icon: "🏋️", use: true, quantity: 5 },
        { id: "eq-bolapeso", name: "Bola de Peso", icon: "⚽", use: true, quantity: 4 },
        { id: "eq-plyobox", name: "Caixa de Salto (Plyo Box)", icon: "📦", use: true, quantity: 2 },
      ]);
    }
  }, [activeStudentId]);

  // Save parameters when they change
  React.useEffect(() => {
    if (!activeStudentId) return;
    const data = {
      periodizacaoModel,
      activeCycleIdx,
      frequenciaSemanal,
      selectedDivision,
      customDivisionText
    };
    localStorage.setItem(`treinopro_param_musculacao_${activeStudentId}`, JSON.stringify(data));
  }, [activeStudentId, periodizacaoModel, activeCycleIdx, frequenciaSemanal, selectedDivision, customDivisionText]);

  React.useEffect(() => {
    if (!activeStudentId) return;

    const getEqUse = (id: string, defaultUse = true) => {
      const found = equipments.find(e => e.id === id);
      return found ? found.use : defaultUse;
    };
    const getEqQty = (id: string, defaultQty = 1) => {
      const found = equipments.find(e => e.id === id);
      return found ? found.quantity : defaultQty;
    };

    const dataFunc = {
      funcModel,
      funcIntensity,
      funcStudentsCount,
      funcDuration,
      funcWeeklyFreq,
      funcMedicalRestrictions,
      funcDayOfWeek,
      generatedTurmaWorkout,
      generatedFunctionalWorkoutJSON,
      equipments,
      useKettlebell: getEqUse("eq-kettlebell", true),
      equipmentKettlebell: getEqQty("eq-kettlebell", 5),
      useBolaPeso: getEqUse("eq-bolapeso", true),
      equipmentBolaPeso: getEqQty("eq-bolapeso", 4),
      usePlyoBox: getEqUse("eq-plyobox", true),
      equipmentPlyoBox: getEqQty("eq-plyobox", 2),
      useCordaNaval: getEqUse("eq-corda", true),
      equipmentCordaNaval: getEqQty("eq-corda", 2),
      useTrx: getEqUse("eq-trx", true),
      equipmentTrx: getEqQty("eq-trx", 3),
      useEscadaAgilidade: getEqUse("eq-escada", true),
      equipmentEscadaAgilidade: getEqQty("eq-escada", 1),
      useMedicineBall: getEqUse("eq-medicine", true),
      equipmentMedicineBall: getEqQty("eq-medicine", 1)
    };
    localStorage.setItem(`treinopro_param_funcional_${activeStudentId}`, JSON.stringify(dataFunc));
  }, [
    activeStudentId,
    funcModel,
    funcIntensity,
    funcStudentsCount,
    funcDuration,
    funcWeeklyFreq,
    funcMedicalRestrictions,
    funcDayOfWeek,
    generatedTurmaWorkout,
    generatedFunctionalWorkoutJSON,
    equipments
  ]);

  // Dynamic calculation of equipment shortages (sempre que o número de alunos superar o número de equipamentos)
  const lowCapacityEquipments = useMemo(() => {
    return equipments
      .filter(eq => eq.use)
      .map(eq => {
        let multiplier = 1;
        const nameLower = eq.name.toLowerCase();
        
        if (nameLower.includes("rua") || nameLower.includes("espaço") || nameLower.includes("peso corporal")) {
          multiplier = 999;
        }
        
        const totalCapacity = eq.quantity * multiplier;
        return {
          ...eq,
          totalCapacity,
          multiplier
        };
      })
      .filter(eq => eq.totalCapacity < funcStudentsCount);
  }, [equipments, funcStudentsCount]);

  // Derived list of mesocycles based on selected periodization model
  const mesocycles = useMemo(() => {
    if (periodizacaoModel === "Macrociclo Anual") {
      return [
        { range: "Semanas 1-12", title: "Acumulação", vol: "Volumes: 8-12 séries", tec: "Téc: Bloqueado" },
        { range: "Semanas 13-24", title: "Progressão A", vol: "Vol: 12-15 séries", tec: "Téc: Bloqueado" },
        { range: "Semanas 25-36", title: "Progressão B", vol: "Vol: 16-20 séries", tec: "Tec: Permitido" },
        { range: "Semanas 37-38", title: "Descarregar", vol: "Volume: 3-4 séries", tec: "Téc: Bloqueado" },
        { range: "Semanas 39-46", title: "Pico", vol: "Volume: 20-25 séries", tec: "Tec: Permitido" },
        { range: "Semanas 47-52", title: "Manutenção", vol: "Volumes: 6-8 séries", tec: "Téc: Bloqueado" }
      ];
    } else {
      return [
        { range: "Semanas 1-6", title: "Técnica básica", vol: "Vol: 16-20 séries", tec: "Téc: Bloqueado" },
        { range: "Semanas 7-10", title: "Hipertrofia Progressiva", vol: "Vol: 20-24 séries", tec: "Tec: Permitido" },
        { range: "Semanas 11-17", title: "Hipertrofia Máxima", vol: "Vol: 24-28 séries", tec: "Tec: Permitido" },
        { range: "Semanas 18-20", title: "Choque / Exaustão", vol: "Vol: 30-35 séries", tec: "Tec: Permitido" },
        { range: "Semanas 21-23", title: "Deload / Recuperação", vol: "Vol: 14-20 séries", tec: "Téc: Bloqueado" }
      ];
    }
  }, [periodizacaoModel]);

  // Ensure activeCycleIdx is safe for the current list of mesocycles
  const safeActiveCycleIdx = useMemo(() => {
    if (activeCycleIdx >= mesocycles.length) {
      return 0;
    }
    return activeCycleIdx;
  }, [activeCycleIdx, mesocycles]);

  const handleGenerateRoutine = () => {
    if (!generateCategory) return;
    
    let baseSets = 4;
    let baseReps = "10";
    let baseWeightMult = 1.0;
    
    if (periodizacaoModel === "Macrociclo Anual") {
      switch (safeActiveCycleIdx) {
        case 0: // Semanas 1-12
          baseSets = 3;
          baseReps = "12-15";
          baseWeightMult = 0.7;
          break;
        case 1: // Semanas 13-24
          baseSets = 4;
          baseReps = "10-12";
          baseWeightMult = 0.9;
          break;
        case 2: // Semanas 25-36
          baseSets = 4;
          baseReps = "8-10";
          baseWeightMult = 1.1;
          break;
        case 3: // Semanas 37-38
          baseSets = 2;
          baseReps = "12-15";
          baseWeightMult = 0.5;
          break;
        case 4: // Semanas 39-46
          baseSets = 5;
          baseReps = "6-8";
          baseWeightMult = 1.3;
          break;
        case 5: // Semanas 47-52
          baseSets = 3;
          baseReps = "10-12";
          baseWeightMult = 0.8;
          break;
      }
    } else {
      switch (safeActiveCycleIdx) {
        case 0: // Semanas 1-6
          baseSets = 4;
          baseReps = "12";
          baseWeightMult = 0.8;
          break;
        case 1: // Semanas 7-10
          baseSets = 4;
          baseReps = "10";
          baseWeightMult = 1.0;
          break;
        case 2: // Semanas 11-17
          baseSets = 4;
          baseReps = "8-12";
          baseWeightMult = 1.25;
          break;
        case 3: // Semanas 18-20
          baseSets = 5;
          baseReps = "FALHA";
          baseWeightMult = 1.4;
          break;
        case 4: // Semanas 21-23
          baseSets = 3;
          baseReps = "15";
          baseWeightMult = 0.6;
          break;
      }
    }

    const routines: Record<string, { name: string; weight: number; notes: string }[]> = {
      "Peito": [
        { name: "Supino Reto (Barra)", weight: 30, notes: "Cadência 3-0-1-0. Foco no peitoral maior." },
        { name: "Supino Inclinado (Halteres)", weight: 22, notes: "Foco na porção clavicular (superior)." },
        { name: "Crucifixo Reto (Halteres)", weight: 14, notes: "Amplitude máxima controlada na descida." },
        { name: "Crossover Polia Média", weight: 15, notes: "Pico de contração de 2 segundos." }
      ],
      "Costas": [
        { name: "Puxada Alta na Polia", weight: 50, notes: "Foco na expansão das dorsais." },
        { name: "Remada Curvada (Barra)", weight: 40, notes: "Tronco inclinado 45 graus, pegada pronada." },
        { name: "Remada Baixa Triângulo", weight: 45, notes: "Adução completa das escápulas." },
        { name: "Pull Over com Halter", weight: 18, notes: "Alongamento completo das dorsais e serrátil." }
      ],
      "Pernas": [
        { name: "Agachamento Livre (Barra)", weight: 60, notes: "Agachamento profundo, mantendo coluna neutra." },
        { name: "Leg Press 45°", weight: 120, notes: "Pés na largura dos ombros, descida controlada." },
        { name: "Cadeira Extensora", weight: 35, notes: "Pico de contração no topo de 2s." },
        { name: "Mesa Flexora", weight: 25, notes: "Foco na fase excêntrica lenta (posterior)." },
        { name: "Panturrilha em pé", weight: 40, notes: "Alongamento máximo e contração completa." }
      ],
      "Ombros": [
        { name: "Desenvolvimento de Ombros (Halteres)", weight: 16, notes: "Cotovelos levemente à frente na descida." },
        { name: "Elevação Lateral (Halteres)", weight: 8, notes: "Foco no deltoide lateral, sem balanço." },
        { name: "Crucifixo Invertido (Halteres/Cabos)", weight: 8, notes: "Foco no deltoide posterior." }
      ],
      "Braços": [
        { name: "Rosca Direta (Barra W)", weight: 12, notes: "Foco no bíceps braquial." },
        { name: "Tríceps Corda (Polia)", weight: 20, notes: "Foco na cabeça lateral do tríceps." },
        { name: "Rosca Alternada (Halteres)", weight: 12, notes: "Rotação de punho no topo." },
        { name: "Tríceps Testa (Barra)", weight: 15, notes: "Cotovelos apontados para o teto." }
      ],
      "Core/Abdomen": [
        { name: "Abdominal Supra na Polia", weight: 30, notes: "Contração máxima do reto abdominal." },
        { name: "Prancha Isométrica", weight: 0, notes: "Manter core 100% ativo." },
        { name: "Abdominal Infra no Solo", weight: 0, notes: "Elevação controlada das pernas." }
      ]
    };

    const selectedRoutine = routines[generateCategory];
    if (!selectedRoutine) return;

    const newExs: Exercise[] = selectedRoutine.map((item, idx) => ({
      id: `ex-gen-${Date.now()}-${idx}`,
      name: item.name,
      sets: baseSets,
      reps: baseReps,
      weight: Math.round(item.weight * baseWeightMult),
      notes: item.notes,
      category: "musculacao"
    }));

    setExercises(prev => [...prev, ...newExs]);
  };

  const handleGenerateMusculacaoPlan = async () => {
    if (!activeStudentId) {
      alert("Selecione um aluno para gerar o treino.");
      return;
    }
    setIsGeneratingMusculacao(true);
    try {
      let aiProvider = "gemini";
      try {
        const savedSettings = localStorage.getItem("treinopro_settings");
        if (savedSettings) {
          const parsed = JSON.parse(savedSettings);
          if (parsed.aiProvider) {
            aiProvider = parsed.aiProvider;
          }
        }
      } catch (e) {
        console.error(e);
      }

      const activeCycle = mesocycles[safeActiveCycleIdx] || { title: "Fase de Hipertrofia", vol: "Vol: 12-15 séries", tec: "Téc: Bloqueado" };
      const data = (await generateWorkoutWithAI({
        periodizacaoModel,
        activeCycleTitle: activeCycle.title,
        activeCycleVol: activeCycle.vol,
        activeCycleTec: activeCycle.tec,
        frequenciaSemanal,
        selectedDivision,
        customDivisionText,
        studentAge: currentStudent?.age,
        studentGender: currentStudent?.gender,
        studentLimitations: currentStudent?.limitations,
        studentObjective: currentStudent?.objective,
        studentPhase: currentStudent?.currentPhase,
        studentName: currentStudent?.name
      })) as any;
      
      if (data && data.workouts) {
        let aiWarning = data.warning || "";
        const muscleVolume: Record<string, number> = {};

        data.workouts.forEach((wk: any) => {
          wk.exercises.forEach((ex: any) => {
            const nameLower = (ex.name || "").toLowerCase();
            if (
              nameLower.includes("aquecimento geral") ||
              nameLower.includes("mobilidade dinâmica") ||
              nameLower.includes("séries de adaptação") ||
              nameLower.includes("series de adaptacao")
            ) {
              return;
            }
            const group = ex.muscleGroup || "Desconhecido";
            muscleVolume[group] = (muscleVolume[group] || 0) + (ex.sets || 0);
          });
        });

        const volNumbers = (activeCycle.vol.match(/\d+/g) || []).map(Number);
        const activeCycleMaxVol = volNumbers.length > 0 ? volNumbers[volNumbers.length - 1] : 30;

        Object.entries(muscleVolume).forEach(([muscle, vol]) => {
          if (vol > activeCycleMaxVol) {
            aiWarning += ` [AUDITORIA TREINOPRO]: A IA prescreveu ${vol} séries semanais para ${muscle}, excedendo o MRV do mesociclo ativo (${activeCycleMaxVol} séries)! Revise o plano! `;
          }
        });

        setGeneratedPlan({
          workouts: data.workouts.map((wk: any) => ({
            dayName: wk.dayName,
            exercises: wk.exercises.map((ex: any) => ({
              name: ex.name,
              sets: ex.sets,
              reps: ex.reps,
              weight: ex.weight,
              notes: ex.notes,
              muscleGroup: ex.muscleGroup,
              category: "musculacao" as const
            }))
          })),
          reasoningExplanation: data.reasoningExplanation || "",
          warning: aiWarning,
          qualityReport: data.qualityReport,
          scientificEvidence: data.scientificEvidence
        });
        
        alert("Planilha completa gerada com IA! Verifique a aba de Análise para conferir o volume. Visualize o treino abaixo e clique em 'Salvar e Adicionar ao Aluno' para confirmar.");
      } else {
        alert("Não foi possível obter dados estruturados da geração com IA.");
      }
    } catch (error) {
      console.error("Error generating musculacao plan:", error);
      alert("Houve um erro ao gerar o treino. Tente novamente.");
    } finally {
      setIsGeneratingMusculacao(false);
    }
  };

  const handleImportMusculacaoPlan = (studentId: string) => {
  if (!generatedPlan) return;
  if (!studentId) {
    alert("Selecione um aluno para salvar o treino.");
    return;
  }
  const targetStudentObj = students.find(s => s.id === studentId);
  const studentName = targetStudentObj ? targetStudentObj.name : "Aluno";
  const newExs: Exercise[] = [];

  generatedPlan.workouts.forEach((wk, wkIdx) => {
    // ✅ EXTRAIR A LETRA DA DIVISÃO DO dayName
    // Exemplo: "Treino A - Peito e Tríceps" → "A"
    const dayNameParts = wk.dayName.split(' - ');
    const dayPrefix = dayNameParts[0]; // "Treino A"
    
    // Extrair a letra do prefixo (suporta A-Z ou números)
    let divisionLetter = "A";
    const match = dayPrefix.match(/Treino\s+([A-Za-z0-9]+)/i);
    if (match && match[1]) {
      divisionLetter = match[1].toUpperCase();
    }

    wk.exercises.forEach((ex, exIdx) => {
      newExs.push({
        id: `ex-imported-${Date.now()}-${wkIdx}-${exIdx}`,
        name: ex.name, // ← Removi o "[Treino A]" do nome, fica mais limpo
        sets: ex.sets,
        reps: ex.reps,
        weight: ex.weight,
        notes: ex.notes,
        category: "musculacao",
        division: divisionLetter // ✅ ADICIONADO: Atribui a divisão correta!
      });
    });
  });

  const targetWorkout = workouts.find(w => w.studentId === studentId);
  const existingExercises = targetWorkout ? targetWorkout.exercises : [];
  const nonMusculacaoExercises = existingExercises.filter(ex => ex.category !== "musculacao");
  const updatedExercises = [...nonMusculacaoExercises, ...newExs];
  const sheetName = targetWorkout?.name || `Planilha de Musculação - ${targetStudentObj?.currentPhase || "Geral"}`;

  justSavedRef.current = true;
  onSaveWorkout(studentId, sheetName, updatedExercises);
  alert(`Treino de Musculação com ${newExs.length} exercícios salvo com sucesso para ${studentName}!`);
  setGeneratedPlan(null);
  setExercises([]);
};

  const handleGenerateFuncional = async () => {
    if (funcStudentsCount > 8) {
      alert("Quantidade máxima permitida para geração automática: 8 alunos");
      return;
    }

    setIsGeneratingFunc(true);
    setGeneratedFunctionalWorkoutJSON(null);

    // Gather active equipment flags and quantities from the dynamic equipments list
    const activeEquipment: string[] = [];
    const equipmentQuantities: Record<string, number> = {};

    equipments.forEach(eq => {
      if (eq.use) {
        let key = eq.name;
        if (eq.name.toLowerCase().includes("trx")) key = "TRX";
        else if (eq.name.toLowerCase().includes("corda")) key = "Corda Naval";
        else if (eq.name.toLowerCase().includes("escada")) key = "Escada";
        else if (eq.name.toLowerCase().includes("medicine")) key = "Medicine Ball";
        else if (eq.name.toLowerCase().includes("kettlebell")) key = "Kettlebell";
        else if (eq.name.toLowerCase().includes("bola de peso")) key = "Bola de Peso";
        else if (eq.name.toLowerCase().includes("plyo") || eq.name.toLowerCase().includes("caixa")) key = "Caixa Plyo";
        else if (eq.name.toLowerCase().includes("chapéu") || eq.name.toLowerCase().includes("chapeu")) key = "Chapéus";
        else if (eq.name.toLowerCase().includes("cone") || eq.name.toLowerCase().includes("baliza")) key = "Cones";
        else if (eq.name.toLowerCase().includes("rua") || eq.name.toLowerCase().includes("espaço")) key = "Rua";
        else if (eq.name.toLowerCase().includes("peso")) key = "Peso Corporal";

        activeEquipment.push(key);
        
        let qKey = key.replace(/\s+/g, '');
        if (qKey === "CordaNaval") qKey = "CordaNaval";
        else if (qKey === "Escada") qKey = "Escada";
        else if (qKey === "MedicineBall") qKey = "MedicineBall";
        else if (qKey === "BoladePeso") qKey = "BolaPeso";
        else if (qKey === "CaixaPlyo") qKey = "CaixaPlyo";
        else if (qKey === "Chapéus") qKey = "Chapeus";
        else if (qKey === "Cones") qKey = "Cones";
        else if (qKey === "Rua") qKey = "Rua";
        else if (qKey === "PesoCorporal") qKey = "PesoCorporal";

        equipmentQuantities[qKey] = eq.quantity;
      }
    });

    // Gather functional exercises catalog from local storage
    let availableExercises: any[] = [];
    try {
      const stored = localStorage.getItem("TreinoPro_Functional_Exercises");
      if (stored) {
        availableExercises = JSON.parse(stored);
      }
    } catch (e) {
      console.warn("Could not read local exercises for API payload:", e);
    }

    // Map intensity string
    const mappedIntensity = funcIntensity === "intermediário" ? "intermediario" : (funcIntensity === "avanço" ? "avancado" : "iniciante");

    // Filter exercises based on active equipment and intensity
    let filteredExercises = availableExercises.filter(ex => {
      const eq = ex.equipamento;
      if (!eq || eq === "Peso Corporal") return true;

      const matchingEquipment = equipments.find(e => {
        const nameLower = e.name.toLowerCase();
        const eqLower = eq.toLowerCase();
        return nameLower.includes(eqLower) || eqLower.includes(nameLower) ||
               (eqLower === "escada" && nameLower.includes("escada")) ||
               (eqLower === "chapéus" && nameLower.includes("chapéu")) ||
               (eqLower === "cones" && nameLower.includes("cone")) ||
               (eqLower === "rua" && nameLower.includes("rua")) ||
               (eqLower === "corda naval" && nameLower.includes("corda")) ||
               (eqLower === "trx" && nameLower.includes("trx"));
      });

      if (matchingEquipment) {
        return matchingEquipment.use;
      }
      return true;
    });

    // Also try to filter by intensity, but keep plenty if too restricted
    const intensitySpecific = filteredExercises.filter(ex => ex.nivel && ex.nivel.includes(mappedIntensity));
    if (intensitySpecific.length >= 6) {
      filteredExercises = intensitySpecific;
    }

    try {
      let aiProvider = "gemini";
      try {
        const savedSettings = localStorage.getItem("treinopro_settings");
        if (savedSettings) {
          const parsed = JSON.parse(savedSettings);
          if (parsed.aiProvider) {
            aiProvider = parsed.aiProvider;
          }
        }
      } catch (e) {
        console.error(e);
      }

      const response = await fetch("/api/generate-functional-workout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          funcModel,
          funcIntensity,
          funcStudentsCount,
          funcDuration,
          funcWeeklyFreq,
          funcMedicalRestrictions,
          funcDayOfWeek,
          activeEquipment,
          equipmentQuantities,
          availableExercises: filteredExercises,
          aiProvider
        })
      });

      const data = await response.json();
      if (data && (data.nomeTreino || data.className) && (data.estacoes || data.stations)) {
        setGeneratedFunctionalWorkoutJSON(data);
      } else {
        throw new Error("Formato de resposta inválido");
      }
    } catch (err: any) {
      console.warn("API functional generation failed, using local generator:", err);
      const fallbackResult = generateLocalFunctionalWorkout(
        funcModel,
        funcIntensity,
        funcStudentsCount,
        funcDuration,
        funcWeeklyFreq,
        funcMedicalRestrictions,
        funcDayOfWeek,
        activeEquipment,
        equipmentQuantities,
        filteredExercises
      );
      setGeneratedFunctionalWorkoutJSON({
        ...fallbackResult,
        warning: `Nota: Executado localmente devido à indisponibilidade momentânea da API (${err.message}).`
      });
    } finally {
      setIsGeneratingFunc(false);
    }
  };

  // Local/Procedural Generator matching the backend's schema exactly
  const generateLocalFunctionalWorkout = (
    model: string,
    intensity: string,
    studentsCount: number,
    duration: string,
    weeklyFrequency: string,
    restrictions: string,
    dayOfWeek: string,
    activeEquipment: string[],
    equipmentQuantities: any,
    availableExercises: any[]
  ) => {
    const activeEquipmentArr = Array.isArray(activeEquipment) ? activeEquipment : [];
    const availableExercisesArr = Array.isArray(availableExercises) ? availableExercises : [];

    const mappedIntensity = intensity === "intermediário" ? "intermediario" : (intensity === "avanço" ? "avancado" : "iniciante");
    
    let pool = [...availableExercisesArr];
    if (pool.length === 0) {
      pool = [
        { nome: "Flexão de Braço Comum", grupo: "superior", equipamento: "Peso Corporal", nivel: ["iniciante", "intermediario"] },
        { nome: "Agachamento Livre", grupo: "inferior", equipamento: "Peso Corporal", nivel: ["iniciante", "intermediario"] },
        { nome: "Prancha Isométrica", grupo: "core", equipamento: "Peso Corporal", nivel: ["iniciante", "intermediario", "avancado"] },
        { nome: "Polichinelo Tradicional", grupo: "cardio", equipamento: "Peso Corporal", nivel: ["iniciante", "intermediario"] }
      ];
    }

    let filtered = pool.filter(ex => {
      const eq = ex.equipamento;
      if (!eq || eq === "Peso Corporal") return true;

      const matchingEquipment = equipments.find(e => {
        const nameLower = e.name.toLowerCase();
        const eqLower = eq.toLowerCase();
        return nameLower.includes(eqLower) || eqLower.includes(nameLower) ||
               (eqLower === "escada" && nameLower.includes("escada")) ||
               (eqLower === "chapéus" && nameLower.includes("chapéu")) ||
               (eqLower === "cones" && nameLower.includes("cone")) ||
               (eqLower === "rua" && nameLower.includes("rua")) ||
               (eqLower === "corda naval" && nameLower.includes("corda")) ||
               (eqLower === "trx" && nameLower.includes("trx"));
      });

      if (matchingEquipment) {
        return matchingEquipment.use;
      }
      return true;
    });

    if (filtered.length < 4) {
      filtered = pool;
    }

    // Pick 4 unique exercises
    const selected: any[] = [];
    const used = new Set<string>();
    const groups = ["superior", "inferior", "core", "cardio"];

    for (const g of groups) {
      const candidates = filtered.filter(ex => (ex.grupo || "").toLowerCase() === g && !used.has(ex.nome));
      if (candidates.length > 0) {
        const choice = candidates[Math.floor(Math.random() * candidates.length)];
        selected.push(choice);
        used.add(choice.nome);
      } else {
        const anyUnused = filtered.filter(ex => !used.has(ex.nome));
        if (anyUnused.length > 0) {
          const choice = anyUnused[Math.floor(Math.random() * anyUnused.length)];
          selected.push(choice);
          used.add(choice.nome);
        } else {
          selected.push({ nome: `Exercício de ${g}`, grupo: g, equipamento: "Peso Corporal" });
        }
      }
    }

    const studentsPerStation = Math.ceil(studentsCount / 4);
    let status: "ok" | "atencao" | "critico" = "ok";
    let message = `Relação equilibrada. Cada uma das 4 estações possui ${studentsPerStation} alunos alocados.`;
    let revezamentoNecessario = false;
    let estrategia = "Cada aluno executa o exercício individualmente ou em revezamento simples.";

    const estacoes = selected.map((ex, idx) => {
      const eq = ex.equipamento;
      let unitsAvailable = 0;

      if (eq === "TRX") {
        unitsAvailable = equipmentQuantities?.TRX ?? 0;
      } else if (eq === "Corda Naval") {
        unitsAvailable = equipmentQuantities?.CordaNaval ?? 0;
      } else if (eq === "Medicine Ball") {
        unitsAvailable = equipmentQuantities?.MedicineBall ?? 0;
      } else if (eq === "Kettlebell") {
        unitsAvailable = equipmentQuantities?.Kettlebell ?? 0;
      } else if (eq === "Bola de Peso") {
        unitsAvailable = equipmentQuantities?.BolaPeso ?? 0;
      } else if (eq === "Caixa Plyo") {
        unitsAvailable = equipmentQuantities?.CaixaPlyo ?? 0;
      } else if (eq === "Escada") {
        unitsAvailable = equipmentQuantities?.Escada ?? 0;
      } else {
        // Try finding in dynamic equipments list
        const foundEq = equipments.find(e => e.name.toLowerCase().includes((eq || "").toLowerCase()));
        unitsAvailable = foundEq ? foundEq.quantity : 1;
      }

      const activeUnits = activeEquipmentArr.includes(eq) || eq === "Peso Corporal" ? unitsAvailable : 0;
      const finalUnits = eq === "Peso Corporal" ? studentsPerStation : activeUnits;

      const alunosUsandoEquipamento = Math.min(studentsPerStation, finalUnits);
      const alunosEmComplementar = Math.max(0, studentsPerStation - finalUnits);

      if (alunosEmComplementar > 0) {
        revezamentoNecessario = true;
        status = "atencao";
      }

      let tempoStr = model === "Tabata" ? "20s" : "45s";
      let descansoStr = model === "Tabata" ? "10s" : "15s";

      return {
        numero: idx + 1,
        categoria: groups[idx],
        exercicioPrincipal: ex.nome,
        unidadesDisponiveis: finalUnits,
        alunosUsandoEquipamento,
        alunosEmComplementar,
        tempo: tempoStr,
        descanso: descansoStr,
        equipamento: eq,
        exerciciosComplementares: ["Agachamento Isométrico", "Polichinelo", "Prancha Tocando Ombros"],
        instrucoesRevezamento: alunosEmComplementar > 0 
          ? `Capacidade excedida na Estação ${idx + 1}. Enquanto ${alunosUsandoEquipamento} aluno(s) utiliza(m) o equipamento principal (${eq}), os outros ${alunosEmComplementar} aluno(s) executam exercício complementar de peso corporal. Revezar funções imediatamente após cada sinal.`
          : `Execução individual regular. Foco em controle articular.`
      };
    });

    if (revezamentoNecessario) {
      status = studentsCount > 12 ? "critico" : "atencao";
      message = `Atenção: Gargalo de Capacidade! Algumas estações possuem mais alunos (${studentsPerStation}) do que unidades físicas de equipamentos.`;
      estrategia = "Ativação do revezamento 1:1. Enquanto o aluno com material executa o exercício principal, os outros realizam exercícios complementares de peso corporal no mesmo espaço. Revezar ao sinal do cronômetro.";
    }

    return {
      nomeTreino: `Treino Funcional ${model} - Fallback Local`,
      alertaCapacidade: {
        status,
        mensagem: message,
        revezamentoNecessario,
        estrategia
      },
      estacoes,
      distribuicaoCategorias: { superior: 1, inferior: 1, core: 1, cardio: 1 },
      observacoesProfessor: `Garantir a execução perfeita. Restrições consideradas: ${restrictions || "Nenhuma registrada"}.`
    };
  };

  const getStudentAllocation = (totalStudents: number) => {
    const students = Array.from({ length: totalStudents }, (_, i) => `Aluno ${String.fromCharCode(65 + i)}`);
    
    if (totalStudents <= 4) {
      return {
        station1: students[0] || "Livre",
        station1IsCombined: false,
        station2: students[1] || "Livre",
        station2IsCombined: false,
        station3: students[2] || "Livre",
        station3IsCombined: false,
        station4: students[3] || "Livre",
        station4IsCombined: false,
      };
    } else {
      // 5 to 8 students
      let pointer = 0;
      
      // Station 1 is always combined (2 students)
      const st1 = [students[pointer++], students[pointer++]];
      
      // Station 2
      let st2: string[] = [];
      if (totalStudents >= 6) {
        st2 = [students[pointer++], students[pointer++]];
      } else {
        st2 = [students[pointer++]];
      }
      
      // Station 3
      let st3: string[] = [];
      if (totalStudents >= 7) {
        st3 = [students[pointer++], students[pointer++]];
      } else {
        st3 = [students[pointer++]];
      }
      
      // Station 4
      let st4: string[] = [];
      if (totalStudents === 8) {
        st4 = [students[pointer++], students[pointer++]];
      } else {
        st4 = [students[pointer++]];
      }
      
      return {
        station1: st1.join(" e "),
        station1IsCombined: true,
        station2: st2.join(" e "),
        station2IsCombined: st2.length > 1,
        station3: st3.join(" e "),
        station3IsCombined: st3.length > 1,
        station4: st4.join(" e "),
        station4IsCombined: st4.length > 1,
      };
    }
  };

  const justSavedRef = React.useRef(false);

  // Keep fields in sync if the student changes
  React.useEffect(() => {
    if (justSavedRef.current) {
      justSavedRef.current = false;
      return;
    }
    if (activeWorkout) {
      setWorkoutName(activeWorkout.name);
      setExercises(activeWorkout.exercises || []);
    } else {
      setWorkoutName(`Treino Integrado - ${currentStudent ? currentStudent.currentPhase : "Geral"}`);
      setExercises([]);
    }
  }, [activeStudentId, currentStudent, activeWorkout]);

  // Derived filtered arrays for 50/50 split display
  const musculacaoExercises = useMemo(() => {
    return exercises.filter(ex => ex.category === "musculacao" || !ex.category);
  }, [exercises]);

  const funcionalExercises = useMemo(() => {
    return exercises.filter(ex => ex.category === "funcional");
  }, [exercises]);

  const handleAddMusculacao = (e: React.FormEvent) => {
    e.preventDefault();
    const finalName = isMuscCustom ? muscCustomName : muscName;
    if (!finalName) return;

    const newEx: Exercise = {
      id: `ex-${Date.now()}`,
      name: finalName,
      sets: Number(muscSets),
      reps: muscReps || "10",
      weight: Number(muscWeight),
      notes: muscNotes || undefined,
      category: "musculacao"
    };

    setExercises(prev => [...prev, newEx]);
    
    // Reset form states
    setMuscCustomName("");
    setIsMuscCustom(false);
    setMuscSets(4);
    setMuscReps("10");
    setMuscWeight(20);
    setMuscNotes("");
  };

  const handleAddFuncional = (e: React.FormEvent) => {
    e.preventDefault();
    const finalName = isFuncCustom ? funcCustomName : funcName;
    if (!finalName) return;

    const newEx: Exercise = {
      id: `ex-${Date.now()}`,
      name: finalName,
      sets: Number(funcSets),
      reps: funcReps || "10",
      weight: Number(funcWeight),
      notes: funcNotes || undefined,
      category: "funcional"
    };

    setExercises(prev => [...prev, newEx]);
    
    // Reset form states
    setFuncCustomName("");
    setIsFuncCustom(false);
    setFuncSets(4);
    setFuncReps("10");
    setFuncWeight(20);
    setFuncNotes("");
  };

  const handleRemoveExercise = (id: string) => {
    const ex = exercises.find(e => e.id === id);
    const exName = ex ? ex.name : "este exercício";
    setDeleteActionType("exercise");
    setDeleteTargetId(id);
    setDeleteTargetName(exName);
    setIsConfirmDeleteOpen(true);
  };

  const handleSave = () => {
    if (!activeStudentId || !workoutName) return;
    justSavedRef.current = false;
    onSaveWorkout(activeStudentId, workoutName, exercises);
    alert("Planilha de treinos integrada salva com sucesso!");
  };

  return (
    <div id="treinos-view" className="space-y-6">
      
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-[#e3e2e4] tracking-tight">Prescrição de Treinos</h2>
          <p className="text-[#b9cacb] text-sm">Monte planilhas completas de treinamento personalizadas.</p>
        </div>
      </div>

      {/* Select Student Banner */}
      <div className="glass-panel p-4 rounded-xl flex flex-col sm:flex-row items-center gap-4 justify-between bg-[#1f2022]/40">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <ClipboardList className="w-5 h-5 text-[#00f2ff]" />
          <span className="font-mono text-xs font-semibold text-[#e3e2e4] uppercase tracking-wider">
            Atleta Selecionado:
          </span>
          <select
            value={activeStudentId}
            onChange={(e) => onSelectStudent(e.target.value)}
            className="bg-[#121315] border border-[#3a494b]/40 focus:border-[#00f2ff] text-white px-3 py-1.5 rounded-lg text-xs font-mono outline-none transition-all cursor-pointer max-w-xs"
          >
            {students.length === 0 ? (
              <option value="">Nenhum aluno cadastrado</option>
            ) : (
              students.map(s => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.currentPhase})
                </option>
              ))
            )}
          </select>
        </div>

        {currentStudent && (
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className="flex items-center gap-2 font-mono text-[11px] text-[#b9cacb]">
              <span className="bg-[#00f2ff]/10 text-[#00dbe7] px-2 py-0.5 rounded border border-[#00f2ff]/20">
                {currentStudent.plan}
              </span>
              <span>Fase atual: <b>{currentStudent.currentPhase}</b></span>
            </div>
          </div>
        )}
      </div>

      {exercises.length === 0 && activeWorkout && activeWorkout.exercises && activeWorkout.exercises.length > 0 && (
        <div className="glass-panel p-4 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#121315]/85 border border-[#00f2ff]/30 animate-fade-in shadow-[0_0_15px_rgba(0,242,255,0.08)]">
          <div className="flex items-center gap-3">
            <span className="text-xl">📂</span>
            <div className="font-mono text-xs">
              <p className="font-extrabold text-white uppercase tracking-wider">Planilha Salva Disponível</p>
              <p className="text-[#b9cacb] mt-0.5">O aluno possui um treino salvo com {activeWorkout.exercises.length} exercícios.</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              setExercises(activeWorkout.exercises);
              if (activeWorkout.name) {
                setWorkoutName(activeWorkout.name);
              }
            }}
            className="px-4 py-2 text-[10px] font-extrabold text-black bg-[#00f2ff] hover:bg-[#33f4ff] rounded-lg transition-all cursor-pointer font-mono uppercase tracking-wider shadow-[0_0_12px_rgba(0,242,255,0.25)] hover:shadow-[0_0_18px_rgba(0,242,255,0.4)] shrink-0"
          >
            Carregar Treino Salvo para Ajuste
          </button>
        </div>
      )}

      {currentStudent ? (
        <div className="space-y-6">
          {/* Análise movida para baixo do div de Musculação Tradicional */}

          {/* KPIs Section / Category Switcher */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* KPI 1: Musculação Tradicional */}
            <div 
              onClick={() => setActiveTab("musculacao")}
              className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between group ${
                activeTab === "musculacao"
                  ? "bg-[#00f2ff]/5 border-[#00f2ff] text-white shadow-[0_0_15px_rgba(0,242,255,0.15)]"
                  : "bg-[#161719]/60 border-[#3a494b]/20 text-[#b9cacb] hover:border-[#00f2ff]/40 hover:bg-[#161719]"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center border transition-all ${
                  activeTab === "musculacao"
                    ? "bg-[#00f2ff]/20 border-[#00f2ff]/30 text-[#00f2ff]"
                    : "bg-[#1c1d1f] border-[#3a494b]/20 text-[#b9cacb] group-hover:text-[#00f2ff]"
                }`}>
                  <Dumbbell className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-mono text-[10px] uppercase tracking-wider font-bold text-[#b9cacb] group-hover:text-[#00f2ff] transition-all">
                    Musculação Tradicional
                  </h4>
                  <div className="flex items-baseline gap-1.5 mt-0.5">
                    <span className="text-xl font-extrabold text-white">
                      {musculacaoExercises.length}
                    </span>
                    <span className="text-[10px] text-[#b9cacb] font-mono lowercase">
                      {musculacaoExercises.length === 1 ? "exercício" : "exercícios"}
                    </span>
                  </div>
                  <div className="text-[9px] text-[#00dbe7] font-mono font-medium truncate max-w-[180px] mt-0.5">
                    Periodização: {periodizacaoModel}
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-end justify-between h-full py-1">
                <span className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                  activeTab === "musculacao"
                    ? "bg-[#00f2ff]/20 text-[#00f2ff]"
                    : "bg-[#1b1c1e] text-[#6a7a7b]"
                }`}>
                  {activeTab === "musculacao" ? "Ativo" : "Ver"}
                </span>
              </div>
            </div>

            {/* KPI 2: Treinamento Funcional */}
            <div 
              onClick={() => setActiveTab("funcional")}
              className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between group ${
                activeTab === "funcional"
                  ? "bg-[#ccff00]/5 border-[#ccff00] text-white shadow-[0_0_15px_rgba(182,1,248,0.15)]"
                  : "bg-[#161719]/60 border-[#3a494b]/20 text-[#b9cacb] hover:border-[#ccff00]/40 hover:bg-[#161719]"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center border transition-all ${
                  activeTab === "funcional"
                    ? "bg-[#ccff00]/20 border-[#ccff00]/30 text-[#ebb2ff]"
                    : "bg-[#1c1d1f] border-[#3a494b]/20 text-[#b9cacb] group-hover:text-[#ebb2ff]"
                }`}>
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-mono text-[10px] uppercase tracking-wider font-bold text-[#b9cacb] group-hover:text-[#ebb2ff] transition-all">
                    Treinamento Funcional
                  </h4>
                  <div className="flex items-baseline gap-1.5 mt-0.5">
                    <span className="text-xl font-extrabold text-white">
                      {funcionalExercises.length}
                    </span>
                    <span className="text-[10px] text-[#b9cacb] font-mono lowercase">
                      {funcionalExercises.length === 1 ? "exercício" : "exercícios"}
                    </span>
                  </div>
                  <div className="text-[9px] text-[#ebb2ff] font-mono font-medium truncate max-w-[180px] mt-0.5">
                    Modelo: {funcModel} ({funcIntensity})
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-end justify-between h-full py-1">
                <span className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                  activeTab === "funcional"
                    ? "bg-[#ccff00]/20 text-[#ebb2ff]"
                    : "bg-[#1b1c1e] text-[#6a7a7b]"
                }`}>
                  {activeTab === "funcional" ? "Ativo" : "Ver"}
                </span>
              </div>
            </div>

            {/* KPI 3: Periodização Científica */}
            <div 
              onClick={() => setActiveTab("periodizacao")}
              className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between group ${
                activeTab === "periodizacao"
                  ? "bg-[#00f2ff]/5 border-[#00f2ff] text-white shadow-[0_0_15px_rgba(0,242,255,0.15)]"
                  : "bg-[#161719]/60 border-[#3a494b]/20 text-[#b9cacb] hover:border-[#00f2ff]/40 hover:bg-[#161719]"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center border transition-all ${
                  activeTab === "periodizacao"
                    ? "bg-[#00f2ff]/20 border-[#00f2ff]/30 text-[#00f2ff]"
                    : "bg-[#1c1d1f] border-[#3a494b]/20 text-[#b9cacb] group-hover:text-[#00f2ff]"
                }`}>
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-mono text-[10px] uppercase tracking-wider font-bold text-[#b9cacb] group-hover:text-[#00f2ff] transition-all">
                    Periodização Científica
                  </h4>
                  <div className="flex items-baseline gap-1.5 mt-0.5">
                    <span className="text-[10px] text-[#00f2ff] font-mono uppercase font-bold tracking-wider">
                      Macrociclos & Mesos
                    </span>
                  </div>
                  <div className="text-[9px] text-[#00f2ff] font-mono font-medium truncate max-w-[180px] mt-0.5">
                    Organização em longo prazo
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-end justify-between h-full py-1">
                <span className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                  activeTab === "periodizacao"
                    ? "bg-[#00f2ff]/20 text-[#00f2ff]"
                    : "bg-[#1b1c1e] text-[#6a7a7b]"
                }`}>
                  {activeTab === "periodizacao" ? "Ativo" : "Ver"}
                </span>
              </div>
            </div>

            {/* KPI 4: Auditoria Científica */}
            <div 
              onClick={() => setActiveTab("analise")}
              className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between group ${
                activeTab === "analise"
                  ? "bg-[#ebb2ff]/5 border-[#ebb2ff] text-white shadow-[0_0_15px_rgba(235,178,255,0.15)]"
                  : "bg-[#161719]/60 border-[#3a494b]/20 text-[#b9cacb] hover:border-[#ebb2ff]/40 hover:bg-[#161719]"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center border transition-all ${
                  activeTab === "analise"
                    ? "bg-[#ebb2ff]/20 border-[#ebb2ff]/30 text-[#ebb2ff]"
                    : "bg-[#1c1d1f] border-[#3a494b]/20 text-[#b9cacb] group-hover:text-[#ebb2ff]"
                }`}>
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-mono text-[10px] uppercase tracking-wider font-bold text-[#b9cacb] group-hover:text-[#ebb2ff] transition-all">
                    Auditoria Científica
                  </h4>
                  <div className="flex items-baseline gap-1.5 mt-0.5">
                    <span className="animate-pulse">
                      <BarChart3 className="w-5 h-5 text-[#ebb2ff] inline-block mr-1" />
                    </span>
                    <span className="text-[10px] text-[#ebb2ff] font-mono uppercase font-bold tracking-wider">
                      MEV/MRV Ativos
                    </span>
                  </div>
                  <div className="text-[9px] text-[#ebb2ff] font-mono font-medium truncate max-w-[180px] mt-0.5">
                    Evita lesões e overtraining
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-end justify-between h-full py-1">
                <span className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                  activeTab === "analise"
                    ? "bg-[#ebb2ff]/20 text-[#ebb2ff]"
                    : "bg-[#1b1c1e] text-[#6a7a7b]"
                }`}>
                  {activeTab === "analise" ? "Ativo" : "Ver"}
                </span>
              </div>
            </div>
          </div>

          {/* FOCUSED WORKOUT TAB PANEL */}
          <div className="grid grid-cols-1 gap-6 items-start">
            
            {/* COLUMN 1: Musculação Tradicional */}
            {activeTab === "musculacao" && (
              <div className="glass-panel rounded-xl p-5 space-y-5 border-t-4 border-[#00f2ff] animate-fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-[#3a494b]/20 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded bg-[#00f2ff]/10 flex items-center justify-center border border-[#00f2ff]/20">
                    <Dumbbell className="w-5 h-5 text-[#00f2ff]" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base text-[#e3e2e4]">Musculação Tradicional</h3>
                    <p className="text-[10px] font-mono text-[#b9cacb]">Treino resistido clássico, foco em força e hipertrofia.</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleSave}
                  className="sm:self-center primary-gradient text-on-primary-fixed hover:opacity-95 px-4 py-2 rounded-lg font-mono font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-[0_0_15px_rgba(0,242,255,0.25)] cursor-pointer shrink-0"
                >
                  <Save className="w-4 h-4" />
                  Salvar Planilha
                </button>
              </div>



              {/* Parâmetros de Musculação Card */}
              <div className="bg-[#121315]/80 border border-[#3a494b]/30 p-5 rounded-xl space-y-4 font-mono text-xs">
                <div className="flex items-center justify-between border-b border-[#3a494b]/20 pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="text-[#00f2ff] text-base font-bold">⚙️</span>
                    <h4 className="font-extrabold text-sm text-[#e3e2e4] uppercase tracking-wider">
                      Parâmetros de Musculação
                    </h4>
                  </div>
                  <button
                    type="button"
                    id="btn-ver-tecnicas"
                    onClick={() => setShowTecnicasModal(true)}
                    className="px-2.5 py-1 rounded bg-[#ccff00]/15 hover:bg-[#ccff00]/30 text-[#ebb2ff] border border-[#ccff00]/40 text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1 shadow-[0_0_8px_rgba(182,1,248,0.2)]"
                  >
                    ⚡ Técnicas
                  </button>
                </div>

                {/* Seletor de Periodização */}
                <div className="space-y-1.5">
                  <label className="block text-[#b9cacb] text-[10px] font-bold uppercase tracking-wider">
                    Seletor de Periodização
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setPeriodizacaoModel("Blocos Curtos (Linear)")}
                      className={`px-3 py-2 rounded-lg font-bold text-center border text-[11px] transition-all cursor-pointer ${
                        periodizacaoModel === "Blocos Curtos (Linear)"
                          ? "bg-[#00f2ff]/15 border-[#00f2ff] text-[#00f2ff] shadow-[0_0_8px_rgba(0,242,255,0.15)]"
                          : "bg-[#1b1c1e] border-[#3a494b]/40 text-[#b9cacb] hover:border-[#b9cacb]/40"
                      }`}
                    >
                      Blocos Curtos (Linear)
                    </button>
                    <button
                      type="button"
                      onClick={() => setPeriodizacaoModel("Macrociclo Anual")}
                      className={`px-3 py-2 rounded-lg font-bold text-center border text-[11px] transition-all cursor-pointer ${
                        periodizacaoModel === "Macrociclo Anual"
                          ? "bg-[#00f2ff]/15 border-[#00f2ff] text-[#00f2ff] shadow-[0_0_8px_rgba(0,242,255,0.15)]"
                          : "bg-[#1b1c1e] border-[#3a494b]/40 text-[#b9cacb] hover:border-[#b9cacb]/40"
                      }`}
                    >
                      Macrociclo Anual
                    </button>
                  </div>
                </div>

                {/* Ciclo Atual (Mesociclos) */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-[10px] uppercase font-bold tracking-wider">
                    <span className="text-[#b9cacb]">Ciclo Atual (Mesociclos)</span>
                    <span className="text-[#00f2ff]">
                      Ativo: {mesocycles[safeActiveCycleIdx]?.title || "Nenhum"}
                    </span>
                  </div>

                  {/* List of Mesocycles */}
                  <div className="space-y-1.5 max-h-[220px] overflow-y-auto pr-1">
                    {mesocycles.map((cycle, idx) => {
                      const isActive = safeActiveCycleIdx === idx;
                      return (
                        <div
                          key={idx}
                          onClick={() => setActiveCycleIdx(idx)}
                          className={`p-2.5 rounded-lg border text-left cursor-pointer transition-all flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5 ${
                            isActive
                              ? "bg-[#00f2ff]/5 border-[#00f2ff] text-white"
                              : "bg-[#161719] border-[#3a494b]/20 text-[#b9cacb] hover:border-[#3a494b]/40"
                          }`}
                        >
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className={`w-1.5 h-1.5 rounded-full ${isActive ? "bg-[#00f2ff]" : "bg-[#3a494b]"}`} />
                              <span className="font-bold text-[10px] text-white">{cycle.range}</span>
                              <span className="text-[10px] text-[#00dbe7] font-medium">— {cycle.title}</span>
                            </div>
                            <div className="text-[9px] text-[#b9cacb]/80 mt-0.5">
                              {cycle.vol}
                            </div>
                          </div>
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded shrink-0 self-start sm:self-center uppercase tracking-wide ${
                            cycle.tec.includes("Permitido") 
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                              : "bg-red-500/10 text-red-400 border border-red-500/20"
                          }`}>
                            {cycle.tec}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Frequência Semanal */}
                <div className="space-y-1.5">
                  <label className="block text-[#b9cacb] text-[10px] font-bold uppercase tracking-wider">
                    Frequência Semanal
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {["1 x", "2 x", "3 x", "4 x", "5 x", "6 x"].map((freq) => (
                      <button
                        key={freq}
                        type="button"
                        onClick={() => setFrequenciaSemanal(freq)}
                        className={`flex-1 min-w-[40px] py-1.5 rounded-lg font-bold text-center text-[10px] border transition-all cursor-pointer ${
                          frequenciaSemanal === freq
                            ? "bg-[#00f2ff]/20 border-[#00f2ff] text-white shadow-[0_0_6px_rgba(0,242,255,0.1)]"
                            : "bg-[#1b1c1e] border-[#3a494b]/30 text-[#b9cacb] hover:border-[#3a494b]/50"
                        }`}
                      >
                        {freq}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Divisão de Treino */}
                <div className="space-y-1.5">
                  <label className="block text-[#b9cacb] text-[10px] font-bold uppercase tracking-wider">
                    Divisão de Treino (Seleção de Modelo)
                  </label>
                  <div className="grid grid-cols-1 gap-1.5 max-h-[180px] overflow-y-auto pr-1">
                    {[
                      { id: "🔁 Empurrar / Puxar / Pernas", name: "🔁 Empurrar / Puxar / Pernas", desc: "Empurrar, Puxar, Pernas" },
                      { id: "⚖️ Superior / Inferior", name: "⚖️ Superior / Inferior", desc: "Membros Superiores e Inferiores" },
                      { id: "📐 ABC Tradicional", name: "📐 ABC Tradicional", desc: "Divisão Clássica de Hipertrofia" },
                      { id: "⚡ ABCDE Avançado", name: "⚡ ABCDE Avançado", desc: "Volume máximo por grupo muscular" },
                      { id: "🏆 Arnold Split", name: "🏆 Arnold Split", desc: "PPL + Braços completo" },
                      { id: "🌍 Corpo Inteiro", name: "🌍 Corpo Inteiro", desc: "Corpo inteiro na mesma sessão" },
                      { id: "🛠️ Personalizada", name: "🛠️ Personalizada", desc: "Monte sua própria divisão de dias" }
                    ].map((div) => {
                      const isActive = selectedDivision === div.id;
                      return (
                        <div
                          key={div.id}
                          onClick={() => setSelectedDivision(div.id)}
                          className={`p-2 rounded-lg border text-left cursor-pointer transition-all flex flex-col ${
                            isActive
                              ? "bg-[#00f2ff]/10 border-[#00f2ff] text-white"
                              : "bg-[#161719] border-[#3a494b]/20 text-[#b9cacb] hover:border-[#3a494b]/40"
                          }`}
                        >
                          <span className="font-bold text-[11px]">{div.name}</span>
                          <span className="text-[9px] text-[#b9cacb]/80 mt-0.5">{div.desc}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {selectedDivision && selectedDivision.includes("Personalizada") && (
                  <div className="space-y-1.5 p-3 rounded-lg border border-[#00f2ff]/20 bg-[#00f2ff]/5">
                    <label className="block text-[#00f2ff] text-[10px] font-bold uppercase tracking-wider">
                      Sua Divisão Personalizada (Estímulos por Grupo)
                    </label>
                    <textarea
                      value={customDivisionText}
                      onChange={(e) => setCustomDivisionText(e.target.value)}
                      rows={4}
                      className="w-full bg-[#1b1c1e] border border-[#3a494b]/40 focus:border-[#00f2ff] text-white p-2 rounded-lg text-xs font-sans outline-none resize-none placeholder-[#b9cacb]/40"
                      placeholder="Exemplo:&#13;Dia A: 2 estímulos de Peitoral, 1 de Ombros, 1 de Tríceps&#13;Dia B: 3 estímulos de Costas, 2 de Bíceps&#13;Dia C: 2 estímulos de Quadríceps, 1 de Glúteos"
                    />
                    <div className="text-[9px] text-[#b9cacb]/80 leading-relaxed space-y-1">
                      <p>💡 <strong>Regra Crítica:</strong> Cada estímulo informado corresponde a exatamente <strong>UM exercício</strong> para aquele grupo muscular. A IA e o sistema respeitarão rigorosamente essa distribuição sem adicionar ou remover exercícios.</p>
                    </div>
                  </div>
                )}

                {/* Generative Row "🟣 Gerar Treinos de" */}
                <div className="border-t border-[#3a494b]/20 pt-3 space-y-3">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 text-white text-[11px] font-bold shrink-0">
                      <span className="text-[#ebb2ff] text-base">🟣</span>
                      <span>Injeção de Exercícios Avulsos:</span>
                    </div>
                    <div className="flex gap-2 w-full sm:w-auto">
                      <select
                        value={generateCategory}
                        onChange={(e) => setGenerateCategory(e.target.value)}
                        className="flex-1 sm:w-32 bg-[#1b1c1e] border border-[#3a494b]/40 focus:border-[#00f2ff] text-white px-2 py-1.5 rounded-lg text-xs font-mono outline-none cursor-pointer"
                      >
                        <option value="Peito">Peito 🥋</option>
                        <option value="Costas">Costas 🎒</option>
                        <option value="Pernas">Pernas 🦵</option>
                        <option value="Ombros">Ombros 🛡️</option>
                        <option value="Braços">Braços 💪</option>
                        <option value="Core/Abdomen">Core 🧱</option>
                      </select>
                      <button
                        type="button"
                        onClick={handleGenerateRoutine}
                        className="px-3 py-1.5 rounded-lg font-bold text-xs bg-[#1b1c1e] hover:bg-[#3a494b]/40 text-[#00f2ff] border border-[#00f2ff]/30 flex items-center gap-1 transition-all cursor-pointer"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-[#00f2ff]" />
                        Injetar
                      </button>
                    </div>
                  </div>

                  <div className="border-t border-[#3a494b]/10 pt-2.5">
                    <button
                      type="button"
                      onClick={handleGenerateMusculacaoPlan}
                      disabled={isGeneratingMusculacao}
                      className="w-full py-2.5 rounded-lg font-extrabold text-xs bg-gradient-to-r from-[#ccff00] to-[#00f2ff] hover:from-[#c220ff] hover:to-[#33f4ff] text-white flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(182,1,248,0.3)] transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isGeneratingMusculacao ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Calculando Volume & Periodizando...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 text-[#ebb2ff]" />
                          <span>GERAR PLANILHA COMPLETA COM IA (PROMPT MESTRE)</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>



              {/* DISPLAY OF AI GENERATED WORKOUT PLAN (PREVIEW) */}
              {generatedPlan && (
                <div className="bg-[#121315]/95 border-2 border-[#00f2ff]/40 rounded-2xl p-6 space-y-6 animate-fade-in font-mono text-xs shadow-[0_0_30px_rgba(0,242,255,0.15)] relative overflow-hidden mt-6">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-[#ccff00]/10 rounded-full blur-3xl pointer-events-none"></div>
                  <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#00f2ff]/10 rounded-full blur-3xl pointer-events-none"></div>
                  
                  <div className="flex items-center justify-between gap-3 border-b border-[#3a494b]/30 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#ccff00] to-[#00f2ff] flex items-center justify-center shadow-lg shadow-[#00f2ff]/10">
                        <Brain className="w-5 h-5 text-white animate-pulse" />
                      </div>
                      <div>
                        <h4 className="font-extrabold text-[13px] text-[#00f2ff] uppercase tracking-wider">
                          Treino Elaborado por Inteligência Artificial
                        </h4>
                        <p className="text-[10px] text-[#b9cacb]/80 font-sans mt-0.5">Metodologia Científica com Ajuste Dinâmico de Volume</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setGeneratedPlan(null)}
                      className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 hover:text-red-300 transition-all cursor-pointer"
                      title="Fechar Prévia"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Reasoning explanation of how IA structured the plan */}
                  {generatedPlan.reasoningExplanation && (
                    <div className="p-4 bg-[#161719]/90 border border-[#3a494b]/30 rounded-xl space-y-2 font-sans">
                      <div className="flex items-center gap-1.5 text-[#ebb2ff] font-bold text-[11px] uppercase tracking-wider">
                        <Sparkles className="w-4 h-4" />
                        <span>Justificativa Fisiológica & Distribuição de Volume</span>
                      </div>
                      <div className="text-[11px] text-[#b9cacb] leading-relaxed italic whitespace-pre-wrap">
                        {generatedPlan.reasoningExplanation}
                      </div>
                    </div>
                  )}

                  {/* Módulo 1 & Módulo 2 Grid: Workout Quality Score & Scientific Evidence */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {/* Módulo 1: Workout Quality Engine Scorecard */}
                    {computedQualityReport && (
                      <div className="p-4 bg-[#161719]/95 border border-[#00f2ff]/20 rounded-xl space-y-4 font-sans shadow-[0_0_15px_rgba(0,242,255,0.05)]">
                        <div className="flex items-center justify-between border-b border-[#3a494b]/20 pb-3">
                          <div className="flex items-center gap-2">
                            <Activity className="w-4 h-4 text-[#00f2ff]" />
                            <span className="font-extrabold text-[#00f2ff] text-[11px] uppercase tracking-wider">Módulo 1 — Workout Quality Score</span>
                          </div>
                          <span className="text-[9px] text-[#b9cacb] bg-[#121315] border border-[#3a494b]/30 px-2 py-0.5 rounded-full font-mono">
                            Auditado Fisiologicamente
                          </span>
                        </div>

                        <div className="flex items-center gap-4">
                          {/* Radial Glow Score Badge */}
                          <div className="relative flex-shrink-0 w-20 h-20 rounded-full border-2 border-dashed border-[#00f2ff]/30 flex flex-col items-center justify-center bg-[#121315]/80 shadow-[0_0_20px_rgba(0,242,255,0.15)]">
                            <span className="text-2xl font-extrabold text-[#00f2ff] font-mono leading-none">
                              {computedQualityReport.score}
                            </span>
                            <span className="text-[8px] text-[#6a7a7b] font-bold uppercase mt-1">Pontos</span>
                          </div>

                          <div className="space-y-1">
                            <h4 className="text-sm font-extrabold text-white">
                              {computedQualityReport.score >= 90 ? "Excelente Prescrição" : 
                               computedQualityReport.score >= 75 ? "Boa Prescrição" : "Prescrição Adequada"}
                            </h4>
                            <p className="text-[11px] text-[#b9cacb] leading-relaxed">
                              {computedQualityReport.feedback}
                            </p>
                          </div>
                        </div>

                        {/* Criteria Breakdown Grid */}
                        <div className="grid grid-cols-2 gap-2.5 pt-1">
                          {Object.values(computedQualityReport.criteria).map((crit: any, cIdx: number) => (
                            <div key={cIdx} className="p-2 bg-[#121315]/80 border border-[#3a494b]/15 rounded-lg space-y-1">
                              <div className="flex justify-between items-center text-[10px]">
                                <span className="text-[#b9cacb] font-medium truncate max-w-[110px]">{crit.name}</span>
                                <span className={`font-mono font-bold ${
                                  crit.score >= 90 ? "text-emerald-400" : 
                                  crit.score >= 70 ? "text-[#00f2ff]" : "text-amber-400"
                                }`}>
                                  {crit.score}
                                </span>
                              </div>
                              {/* Small Progress Bar */}
                              <div className="w-full bg-[#1e2023] h-1 rounded-full overflow-hidden">
                                <div 
                                  className={`h-full rounded-full transition-all duration-500 ${
                                    crit.score >= 90 ? "bg-emerald-500 shadow-[0_0_4px_rgba(16,185,129,0.5)]" : 
                                    crit.score >= 70 ? "bg-[#00f2ff] shadow-[0_0_4px_rgba(0,242,255,0.5)]" : "bg-amber-500 shadow-[0_0_4px_rgba(245,158,11,0.5)]"
                                  }`}
                                  style={{ width: `${crit.score}%` }}
                                ></div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Módulo 2: Scientific Evidence Engine */}
                    {computedScientificEvidence && (
                      <div className="p-4 bg-[#161719]/95 border border-[#ebb2ff]/20 rounded-xl space-y-3 font-sans shadow-[0_0_15px_rgba(235,178,255,0.05)]">
                        <div className="flex items-center justify-between border-b border-[#3a494b]/20 pb-3">
                          <div className="flex items-center gap-2">
                            <BookOpen className="w-4 h-4 text-[#ebb2ff]" />
                            <span className="font-extrabold text-[#ebb2ff] text-[11px] uppercase tracking-wider">Módulo 2 — Evidência Científica</span>
                          </div>
                          <span className="text-[9px] text-[#ebb2ff] bg-[#ebb2ff]/10 border border-[#ebb2ff]/20 px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
                            ACSM & PubMed Cites
                          </span>
                        </div>

                        {/* Justifications Accordion/Pills */}
                        <div className="space-y-2.5 max-h-[160px] overflow-y-auto pr-1 scrollbar-thin">
                          <div className="space-y-1">
                            <span className="text-[9px] text-[#ebb2ff] font-bold uppercase tracking-wider block font-mono">1. Justificativa Geral</span>
                            <p className="text-[10px] text-[#b9cacb] leading-relaxed italic">
                              "{computedScientificEvidence.overallJustification}"
                            </p>
                          </div>
                          <div className="space-y-1">
                            <span className="text-[9px] text-[#ebb2ff] font-bold uppercase tracking-wider block font-mono">2. Dosagem de Volume Fisiológico</span>
                            <p className="text-[10px] text-[#b9cacb] leading-relaxed italic">
                              "{computedScientificEvidence.volumeJustification}"
                            </p>
                          </div>
                          <div className="space-y-1">
                            <span className="text-[9px] text-[#ebb2ff] font-bold uppercase tracking-wider block font-mono">3. Frequência Semanal Diluída</span>
                            <p className="text-[10px] text-[#b9cacb] leading-relaxed italic">
                              "{computedScientificEvidence.frequencyJustification}"
                            </p>
                          </div>
                          <div className="space-y-1">
                            <span className="text-[9px] text-[#ebb2ff] font-bold uppercase tracking-wider block font-mono">4. Autorregulação & Fadiga</span>
                            <p className="text-[10px] text-[#b9cacb] leading-relaxed italic">
                              "{computedScientificEvidence.adjustmentsJustification}"
                            </p>
                          </div>
                        </div>

                        {/* Scientific Bibliography Section */}
                        <div className="bg-[#121315]/90 border border-[#3a494b]/15 rounded-lg p-2 space-y-1">
                          <span className="text-[8px] text-[#6a7a7b] font-bold uppercase tracking-wider font-mono">Referências Bibliográficas Recomendadas:</span>
                          <div className="space-y-1 text-[8px] text-[#b9cacb]/85 font-mono max-h-[45px] overflow-y-auto">
                            {computedScientificEvidence.citations.slice(0, 3).map((cite: string, index: number) => (
                              <div key={index} className="truncate">
                                • {cite}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Módulo 4, 5 e 6 — Dashboard Científico, Heat Map Muscular e Recovery Predictor */}
                  <CientificoDashboard 
                    generatedPlan={generatedPlan as any} 
                    currentStudent={currentStudent} 
                    frequenciaSemanal={frequenciaSemanal} 
                  />

                  {/* Warning message from locally processed / simulated plans */}
                  {generatedPlan.warning && (
                    <div className="p-3 bg-amber-500/10 border border-amber-500/25 rounded-lg space-y-1">
                      <div className="flex items-center gap-1.5 text-amber-400 font-bold text-[10px] uppercase tracking-wider">
                        <span>⚠️ Info</span>
                      </div>
                      <p className="text-[10px] text-[#b9cacb] leading-normal font-mono">
                        {generatedPlan.warning}
                      </p>
                    </div>
                  )}

                  {/* Day-by-day Workout Grid */}
                  <div className="space-y-5">
                    {generatedPlan.workouts.map((day, dIdx) => (
                      <div key={dIdx} className="bg-[#161719]/90 border border-[#3a494b]/20 rounded-xl overflow-hidden shadow-xl hover:border-[#00f2ff]/30 transition-all">
                        {/* Day Header */}
                        <div className="bg-[#1e2023] px-4 py-3.5 border-b border-[#3a494b]/20 flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-[#00f2ff] shadow-[0_0_8px_#00f2ff]"></span>
                            <span className="font-extrabold text-[12px] text-white tracking-wider uppercase">
                              {day.dayName}
                            </span>
                          </div>
                          <span className="text-[10px] text-[#00f2ff] bg-[#121315] border border-[#00f2ff]/20 px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
                            {day.exercises.length} Exercícios
                          </span>
                        </div>

                        {/* Exercises Table (Desktop) */}
                        <div className="hidden md:block overflow-x-auto">
                          <table className="w-full text-left border-collapse font-sans text-[11px]">
                            <thead>
                              <tr className="bg-[#121315] text-[#b9cacb] uppercase text-[9px] tracking-wider border-b border-[#3a494b]/20">
                                <th className="py-2.5 px-4 font-bold w-[5%] font-mono">#</th>
                                <th className="py-2.5 px-4 font-bold w-[35%]">Exercício</th>
                                <th className="py-2.5 px-4 font-bold w-[20%]">Foco Primário</th>
                                <th className="py-2.5 px-4 font-bold text-center w-[15%] font-mono">Séries x Repetições</th>
                                <th className="py-2.5 px-4 font-bold text-center w-[10%] font-mono">Carga</th>
                                <th className="py-2.5 px-4 font-bold w-[15%]">Técnicas / Instrução</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-[#3a494b]/10 bg-[#161719]">
                              {day.exercises.map((ex, exIdx) => (
                                <tr key={exIdx} className="hover:bg-[#1e2023]/30 transition-colors">
                                  <td className="py-3 px-4 font-mono font-bold text-[#6a7a7b]">{exIdx + 1}</td>
                                  <td 
                                    className="py-3 px-4 font-bold text-white text-[12px] cursor-pointer hover:text-[#00f2ff] transition-colors group/ex"
                                    onClick={() => setSelectedExplainableExercise(ExplainableAiEngine.getBiomechanics(ex.name))}
                                    title="Clique para ver a Análise Biomecânica da IA"
                                  >
                                    <div className="flex items-center gap-1.5">
                                      <span>{ex.name}</span>
                                      <Info className="w-3.5 h-3.5 text-[#00f2ff]/30 group-hover/ex:text-[#00f2ff] transition-colors shrink-0" />
                                    </div>
                                    {/* [NOVO] TAGS VISUAIS DE TÉCNICAS */}
                                    {ex.notes && (() => {
                                      const notesLower = ex.notes.toLowerCase();
                                      let badgeColor = "";
                                      let badgeText = "";
                                      
                                      if (notesLower.includes("drop") || notesLower.includes("rest-pause") || notesLower.includes("fst-7") || notesLower.includes("myo-reps") || notesLower.includes("bi-set") || notesLower.includes("tri-set")) {
                                        badgeColor = "bg-[#ebb2ff]/20 text-[#ebb2ff] border-[#ebb2ff]/30";
                                        badgeText = "🔥 Intensificação";
                                      } else if (notesLower.includes("excêntrica") || notesLower.includes("negativa") || notesLower.includes("forçada")) {
                                        badgeColor = "bg-red-500/20 text-red-400 border-red-500/30";
                                        badgeText = "⚠️ Alto Dano";
                                      } else if (notesLower.includes("alongamento") || notesLower.includes("amplitude") || notesLower.includes("isometria")) {
                                        badgeColor = "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";
                                        badgeText = "📐 Amplitude";
                                      } else if (notesLower.includes("tempo") || notesLower.includes("cadência") || notesLower.includes("controlad")) {
                                        badgeColor = "bg-[#00f2ff]/20 text-[#00f2ff] border-[#00f2ff]/30";
                                        badgeText = "⏱️ Tensão";
                                      }
                                      
                                      if (badgeText) {
                                        return (
                                          <div className="mt-1">
                                            <span className={`inline-block text-[8px] font-bold px-1.5 py-0.5 rounded border uppercase tracking-wider font-mono ${badgeColor}`}>
                                              {badgeText}
                                            </span>
                                          </div>
                                        );
                                      }
                                      return null;
                                    })()}
                                  </td>
                                  <td className="py-3 px-4">
                                    <span className="px-2 py-0.5 rounded bg-[#121315] text-[#00dbe7] text-[9px] uppercase font-bold tracking-wider font-mono border border-[#00dbe7]/10">
                                      {ex.muscleGroup}
                                    </span>
                                  </td>
                                  <td className="py-3 px-4 text-center font-mono font-bold text-[#ebb2ff] text-[12px]">
                                    {ex.sets} <span className="text-[#6a7a7b] text-[10px]">x</span> {ex.reps}
                                  </td>
                                  <td className="py-3 px-4 text-center font-mono font-extrabold text-[#00f2ff] text-[12px]">
                                    {ex.weight} <span className="text-white/40 text-[9px]">kg</span>
                                  </td>
                                  <td className="py-3 px-4 text-[11px] text-[#b9cacb] leading-relaxed italic">
                                    {ex.notes || "—"}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>

                        {/* Exercises Cards (Mobile) */}
                        <div className="block md:hidden divide-y divide-[#3a494b]/15">
                          {day.exercises.map((ex, exIdx) => (
                            <div key={exIdx} className="p-4 bg-[#161719] space-y-2">
                              <div className="flex items-start justify-between gap-3">
                                <div className="flex items-center gap-2">
                                  <span className="w-5 h-5 rounded-full bg-[#00f2ff]/10 text-[#00f2ff] flex items-center justify-center font-bold text-[10px] font-mono shrink-0">
                                    {exIdx + 1}
                                  </span>
                                  <span 
                                    className="font-bold text-white text-xs cursor-pointer hover:text-[#00f2ff] flex items-center gap-1"
                                    onClick={() => setSelectedExplainableExercise(ExplainableAiEngine.getBiomechanics(ex.name))}
                                  >
                                    {ex.name} <Info className="w-3.5 h-3.5 text-[#00f2ff]/40 shrink-0" />
                                  </span>
                                                    {/* [NOVO] TAGS VISUAIS DE TÉCNICAS (MOBILE) */}
                  {ex.notes && (() => {
                    const notesLower = ex.notes.toLowerCase();
                    let badgeColor = "";
                    let badgeText = "";
                    
                    if (notesLower.includes("drop") || notesLower.includes("rest-pause") || notesLower.includes("fst-7") || notesLower.includes("myo-reps") || notesLower.includes("bi-set") || notesLower.includes("tri-set")) {
                      badgeColor = "bg-[#ebb2ff]/20 text-[#ebb2ff] border-[#ebb2ff]/30";
                      badgeText = "🔥 Intensificação";
                    } else if (notesLower.includes("excêntrica") || notesLower.includes("negativa") || notesLower.includes("forçada")) {
                      badgeColor = "bg-red-500/20 text-red-400 border-red-500/30";
                      badgeText = "⚠️ Alto Dano";
                    } else if (notesLower.includes("alongamento") || notesLower.includes("amplitude") || notesLower.includes("isometria")) {
                      badgeColor = "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";
                      badgeText = "📐 Amplitude";
                    } else if (notesLower.includes("tempo") || notesLower.includes("cadência") || notesLower.includes("controlad")) {
                      badgeColor = "bg-[#00f2ff]/20 text-[#00f2ff] border-[#00f2ff]/30";
                      badgeText = "⏱️ Tensão";
                    }
                    
                    if (badgeText) {
                      return (
                        <div className="mt-1">
                          <span className={`inline-block text-[8px] font-bold px-1.5 py-0.5 rounded border uppercase tracking-wider font-mono ${badgeColor}`}>
                            {badgeText}
                          </span>
                        </div>
                      );
                    }
                    return null;
                  })()}
                                </div>
                                <span className="px-2 py-0.5 rounded bg-[#121315] text-[#00dbe7] text-[9px] uppercase font-bold tracking-wider font-mono shrink-0">
                                  {ex.muscleGroup}
                                </span>
                              </div>
                              <div className="grid grid-cols-2 gap-2 bg-[#121315]/80 p-2 rounded-lg border border-[#3a494b]/15 text-center">
                                <div className="border-r border-[#3a494b]/15">
                                  <p className="text-[8px] text-[#b9cacb]/60 uppercase tracking-wider font-mono">Séries x Reps</p>
                                  <p className="text-xs font-bold text-[#ebb2ff] font-mono mt-0.5">{ex.sets} x {ex.reps}</p>
                                </div>
                                <div>
                                  <p className="text-[8px] text-[#b9cacb]/60 uppercase tracking-wider font-mono">Carga Sugerida</p>
                                  <p className="text-xs font-extrabold text-[#00f2ff] font-mono mt-0.5">{ex.weight} kg</p>
                                </div>
                              </div>
                              {ex.notes && (
                                <div className="text-[10px] text-[#b9cacb] bg-[#00f2ff]/5 px-2.5 py-2 rounded-lg border border-[#00f2ff]/10 italic leading-relaxed font-sans">
                                  {ex.notes}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Importation Controls */}
                  <div className="border-t border-[#3a494b]/30 pt-5 flex flex-col lg:flex-row items-center justify-between gap-4 bg-[#181a1d] p-4 rounded-xl border border-[#3a494b]/20">
                    <div className="flex items-center gap-2 text-white font-bold text-xs shrink-0">
                      <Save className="w-4 h-4 text-[#ebb2ff]" />
                      <span>Salvar Planilha no Aluno:</span>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto lg:flex-1 justify-end max-w-2xl">
                      <select
                        value={selectedStudentForImport || activeStudentId}
                        onChange={(e) => setSelectedStudentForImport(e.target.value)}
                        className="bg-[#121315] border border-[#3a494b]/40 focus:border-[#00f2ff] text-white px-3 py-2 rounded-lg text-xs font-mono outline-none cursor-pointer transition-colors"
                      >
                        <option value="" disabled>Selecione o aluno...</option>
                        {students.map((student) => (
                          <option key={student.id} value={student.id}>
                            {student.name} ({student.plan})
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={() => handleImportMusculacaoPlan(selectedStudentForImport || activeStudentId)}
                        className="px-6 py-2.5 rounded-lg font-bold text-xs text-black bg-[#00f2ff] hover:bg-[#33f4ff] hover:shadow-[0_0_20px_rgba(0,242,255,0.4)] flex items-center justify-center gap-2 shadow-[0_0_12px_rgba(0,242,255,0.2)] transition-all cursor-pointer whitespace-nowrap"
                      >
                        <Check className="w-4 h-4" />
                        <span>Adicionar Planilha ao Aluno</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}



            </div>
          )}

            {/* COLUMN 2: Treinamento Funcional */}
            {activeTab === "funcional" && (
              <div className="glass-panel rounded-xl p-5 space-y-5 border-t-4 border-[#ccff00] animate-fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-[#3a494b]/20 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded bg-[#ccff00]/10 flex items-center justify-center border border-[#ccff00]/20">
                    <Activity className="w-5 h-5 text-[#ebb2ff]" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base text-[#e3e2e4]">Treinamento Funcional</h3>
                    <p className="text-[10px] font-mono text-[#b9cacb]">Atividades dinâmicas, agilidade, core e condicionamento.</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleSave}
                  className="sm:self-center primary-gradient text-on-primary-fixed hover:opacity-95 px-4 py-2 rounded-lg font-mono font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-[0_0_15px_rgba(0,242,255,0.25)] cursor-pointer shrink-0"
                >
                  <Save className="w-4 h-4" />
                  Salvar Planilha
                </button>
              </div>

              {/* Parâmetros de Treino Funcional Panel */}
              <div className="bg-[#121315]/80 border border-[#3a494b]/30 p-5 rounded-xl space-y-5 font-mono text-xs">
                <div className="flex items-center gap-2 border-b border-[#3a494b]/20 pb-2.5">
                  <Activity className="w-4 h-4 text-[#ccff00]" />
                  <h4 className="font-extrabold text-sm text-[#e3e2e4] uppercase tracking-wider">
                    Parâmetros de Treino Funcional
                  </h4>
                </div>

                {/* Dia da Semana */}
                <div className="space-y-1.5">
                  <label className="text-[#b9cacb] text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-[#ccff00]" /> Dia da Semana
                  </label>
                  <select
                    value={funcDayOfWeek}
                    onChange={(e) => setFuncDayOfWeek(e.target.value)}
                    className="w-full bg-[#1b1c1e] border border-[#3a494b]/40 focus:border-[#ccff00] text-white px-3 py-2 rounded-lg text-xs font-mono outline-none cursor-pointer"
                  >
                    {[
                      "Segunda-feira",
                      "Terça-feira",
                      "Quarta-feira",
                      "Quinta-feira",
                      "Sexta-feira",
                      "Sábado",
                      "Domingo"
                    ].map((day) => (
                      <option key={day} value={day}>{day}</option>
                    ))}
                  </select>
                </div>

                {/* Modelo de Treino */}
                <div className="space-y-2">
                  <label className="block text-[#b9cacb] text-[10px] font-bold uppercase tracking-wider">
                    Modelo de Treino (Selecione um Modelo)
                  </label>
                  <div className="grid grid-cols-1 gap-2">
                    {[
                      { id: "Circuito", title: "🔁 Circuito", desc: "Estações alternadas" },
                      { id: "HIIT", title: "⚡ HIIT", desc: "Intervalado de Alta Intensidade" },
                      { id: "EMOM", title: "⏱ EMOM", desc: "Cada Minuto no Minuto" },
                      { id: "AMRAP", title: "🏆 AMRAP", desc: "Máximo de repetições" },
                      { id: "Tabata", title: "🎵 Tabata", desc: "Protocolo clássico anos 20/10" }
                    ].map((model) => {
                      const isActive = funcModel === model.id;
                      return (
                        <div
                          key={model.id}
                          onClick={() => setFuncModel(model.id as any)}
                          className={`p-3 rounded-lg border text-left cursor-pointer transition-all flex flex-col ${
                            isActive
                              ? "bg-[#ccff00]/15 border-[#ccff00] text-white shadow-[0_0_10px_rgba(182,1,248,0.25)]"
                              : "bg-[#161719] border-[#3a494b]/20 text-[#b9cacb] hover:border-[#3a494b]/40"
                          }`}
                        >
                          <span className="font-extrabold text-[11px] text-[#e3e2e4]">{model.title}</span>
                          <span className="text-[10px] text-[#b9cacb]/85 mt-0.5">{model.desc}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Nível de Intensidade */}
                <div className="space-y-1.5">
                  <label className="block text-[#b9cacb] text-[10px] font-bold uppercase tracking-wider">
                    Nível de Intensidade
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: "iniciante", title: "iniciante" },
                      { id: "intermediário", title: "intermediário" },
                      { id: "avanço", title: "avanço" }
                    ].map((lvl) => (
                      <button
                        type="button"
                        key={lvl.id}
                        onClick={() => setFuncIntensity(lvl.id as any)}
                        className={`py-2 rounded-lg font-bold text-center border text-[10px] transition-all cursor-pointer capitalize ${
                          funcIntensity === lvl.id
                            ? "bg-[#ccff00]/15 border-[#ccff00] text-[#ebb2ff] shadow-[0_0_8px_rgba(182,1,248,0.2)]"
                            : "bg-[#1b1c1e] border-[#3a494b]/40 text-[#b9cacb] hover:border-[#b9cacb]/40"
                        }`}
                      >
                        {lvl.title}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Número de Alunos na Turma */}
                <div className="space-y-1.5">
                  <label className="block text-[#b9cacb] text-[10px] font-bold uppercase tracking-wider">
                    Número de Alunos na Turma
                  </label>
                  <div className="flex items-center gap-3 bg-[#1b1c1e] border border-[#3a494b]/40 p-2 rounded-lg">
                    <button
                      type="button"
                      onClick={() => setFuncStudentsCount(prev => Math.max(1, prev - 1))}
                      className="w-8 h-8 rounded bg-[#121315] hover:bg-[#ccff00]/20 border border-[#3a494b]/40 text-[#ebb2ff] font-extrabold text-lg flex items-center justify-center transition-all cursor-pointer"
                    >
                      -
                    </button>
                    <div className="flex-1 text-center text-xs font-extrabold text-white">
                      {funcStudentsCount} Alunos
                    </div>
                    <button
                      type="button"
                      onClick={() => setFuncStudentsCount(prev => prev + 1)}
                      className="w-8 h-8 rounded bg-[#121315] hover:bg-[#ccff00]/20 border border-[#3a494b]/40 text-[#ebb2ff] font-extrabold text-lg flex items-center justify-center transition-all cursor-pointer"
                    >
                      +
                    </button>
                  </div>

                  {/* Warning banner for > 8 students */}
                  {funcStudentsCount > 8 && (
                    <div className="mt-2 p-2.5 bg-red-500/10 border border-red-500/30 rounded-lg">
                      <p className="text-[10px] text-red-400 font-bold font-mono text-center">
                        ⚠️ Quantidade máxima para geração automática: 8 alunos
                      </p>
                    </div>
                  )}
                </div>

                {/* Duração da Sessão */}
                <div className="space-y-1.5">
                  <label className="block text-[#b9cacb] text-[10px] font-bold uppercase tracking-wider">
                    Duração da Sessão (Minutos)
                  </label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {["15 minutos", "30 minutos", "45 minutos", "60 minutos"].map((dur) => (
                      <button
                        type="button"
                        key={dur}
                        onClick={() => setFuncDuration(dur)}
                        className={`py-2 rounded-lg font-bold text-center text-[10px] border transition-all cursor-pointer ${
                          funcDuration === dur
                            ? "bg-[#ccff00]/20 border-[#ccff00] text-white shadow-[0_0_6px_rgba(182,1,248,0.15)]"
                            : "bg-[#1b1c1e] border-[#3a494b]/30 text-[#b9cacb] hover:border-[#3a494b]/50"
                        }`}
                      >
                        {dur}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Frequência Semanal de Treinos */}
                <div className="space-y-1.5">
                  <label className="block text-[#b9cacb] text-[10px] font-bold uppercase tracking-wider">
                    Frequência Semanal de Treinos
                  </label>
                  <div className="grid grid-cols-1 gap-1.5">
                    {[
                      "1 x na Semana",
                      "2 vezes por semana",
                      "3 vezes por semana",
                      "4 vezes na semana",
                      "5 vezes por semana"
                    ].map((freq) => (
                      <button
                        type="button"
                        key={freq}
                        onClick={() => setFuncWeeklyFreq(freq)}
                        className={`py-2 px-3 rounded-lg font-bold text-left text-[10px] border transition-all cursor-pointer ${
                          funcWeeklyFreq === freq
                            ? "bg-[#ccff00]/20 border-[#ccff00] text-white shadow-[0_0_6px_rgba(182,1,248,0.15)]"
                            : "bg-[#1b1c1e] border-[#3a494b]/30 text-[#b9cacb] hover:border-[#3a494b]/50"
                        }`}
                      >
                        {freq}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Alerta de Capacidade de Equipamentos */}
                {lowCapacityEquipments.length > 0 && (
                  <div className="p-3.5 bg-amber-500/10 border border-amber-500/30 rounded-xl space-y-2">
                    <div className="flex items-center gap-1.5 text-amber-400 font-bold text-[10px] uppercase tracking-wider">
                      <span className="text-sm">⚠️</span>
                      <span>Alerta de Capacidade de Equipamentos</span>
                    </div>
                    <p className="text-[10px] text-white/95 leading-relaxed font-mono">
                      Você possui <span className="text-[#ebb2ff] font-bold">{funcStudentsCount} alunos</span> cadastrados. Como nenhum aluno usará o mesmo aparelho simultaneamente, cada aluno precisará de um aparelho individual.
                    </p>
                    <p className="text-[10px] text-white/90 leading-relaxed font-mono">
                      A quantidade disponível dos seguintes equipamentos é inferior ao número total de alunos atendidos simultaneamente:
                    </p>
                    <div className="space-y-1.5 pl-1 border-l-2 border-amber-500/30 ml-1 py-0.5">
                      {lowCapacityEquipments.map(eq => (
                        <div key={eq.id} className="text-[9.5px] font-mono text-amber-300 flex items-start gap-1.5 leading-relaxed">
                          <span>{eq.icon}</span>
                          <span>
                            <b>{eq.name}</b>: {eq.quantity} {eq.quantity === 1 ? "unidade disponível" : "unidades disponíveis"} (Requisitado: no mínimo <b>{funcStudentsCount}</b> unidades para evitar filas).
                          </span>
                        </div>
                      ))}
                    </div>
                    <p className="text-[9px] text-[#b9cacb] leading-normal font-mono pt-1.5 border-t border-amber-500/10">
                      💡 <b>Rodízio Ativo:</b> O gerador de treinos configurará de forma automatizada exercícios de peso corporal complementares e instruções detalhadas de revezamento para garantir fluxo contínuo.
                    </p>
                  </div>
                )}

                {/* Gerar Treinos Funcionais Button */}
                <button
                  type="button"
                  disabled={isGeneratingFunc}
                  onClick={handleGenerateFuncional}
                  className={`w-full py-3 rounded-xl font-bold text-xs text-white flex items-center justify-center gap-2 transition-all border font-mono uppercase tracking-wider ${
                    isGeneratingFunc
                      ? "bg-gray-700 border-gray-600 cursor-not-allowed opacity-75 animate-pulse"
                      : "bg-[#ccff00] hover:bg-[#c220ff] shadow-[0_0_12px_rgba(182,1,248,0.35)] cursor-pointer border-[#c220ff]/30"
                  }`}
                >
                  <span className="text-sm">{isGeneratingFunc ? "⚡" : "🟣"}</span>
                  <span>{isGeneratingFunc ? "Gerando Treino com IA..." : "Gerar Treinos Funcionais"}</span>
                </button>

                {/* Helper for Copyable text formatting */}
                {(() => {
                  if (typeof (window as any).getCopyableText !== "function") {
                    (window as any).getCopyableText = (data: any) => {
                      if (!data) return "";
                      if (data.nomeTreino) {
                        let text = `Nome da aula: ${data.nomeTreino}\n`;
                        text += `Status de Capacidade: [${data.alertaCapacidade?.status?.toUpperCase()}] - ${data.alertaCapacidade?.mensagem}\n`;
                        if (data.alertaCapacidade?.revezamentoNecessario) {
                          text += `Estratégia de Revezamento: ${data.alertaCapacidade?.estrategia}\n`;
                        }
                        text += `\nParte principal (Circuito com 4 Estações):\n`;
                        (data.estacoes || []).forEach((st: any) => {
                          text += `• Estação ${st.numero} [${st.categoria?.toUpperCase()}]:\n`;
                          text += `  - Exercício Principal: ${st.exercicioPrincipal}\n`;
                          text += `  - Equipamento: ${st.equipamento} (${st.unidadesDisponiveis} un. disponíveis)\n`;
                          text += `  - Tempo: ${st.tempo} Ativo | ${st.descanso} Descanso\n`;
                          text += `  - Alunos usando material: ${st.alunosUsandoEquipamento} | Alunos em complementar: ${st.alunosEmComplementar}\n`;
                          if (st.exerciciosComplementares && st.exerciciosComplementares.length > 0) {
                            text += `  - Complementares sugeridos: ${st.exerciciosComplementares.join(", ")}\n`;
                          }
                          text += `  - Instruções de Revezamento: ${st.instrucoesRevezamento}\n\n`;
                        });
                        text += `Observações e Segurança do Professor:\n${data.observacoesProfessor}\n`;
                        if (data.warning) {
                          text += `\n${data.warning}`;
                        }
                        return text;
                      } else {
                        let text = `Nome da aula: ${data.className}\n`;
                        text += `Objetivo: ${data.objective}\n`;
                        text += `Alunos: ${data.studentsCount} alunos | Intensidade: ${data.intensity}\n`;
                        text += `Duração: ${data.duration} | Frequência Semanal: ${data.weeklyFrequency}\n\n`;
                        if (!data.isCompatible) {
                          text += `⚠️ ALERTA DE CAPACIDADE DE EQUIPAMENTOS:\n${data.compatibilityWarning}\n\n`;
                        }
                        text += `Aquecimento (Warm-up):\n${data.warmup}\n\n`;
                        text += `Parte principal (Circuito com 4 Estações):\n`;
                        (data.stations || []).forEach((st: any) => {
                          text += `• Estação ${st.stationNumber}:\n`;
                          text += `  - Exercício: ${st.exerciseName}\n`;
                          text += `  - Equipamento: ${st.requiredEquipment}\n`;
                          text += `  - Tempo/Duração: ${st.duration}\n`;
                          text += `  - Alunos alocados: ${st.allocatedStudents}\n`;
                          text += `  - Descrição: ${st.description}\n\n`;
                        });
                        text += `Parte final / Finisher:\n${data.finisher}\n\n`;
                        text += `Notas do Coordenador para o Treinador:\n${data.notes}\n`;
                        if (data.warning) {
                          text += `\n${data.warning}`;
                        }
                        return text;
                      }
                    };
                  }
                  return null;
                })()}

                {/* Resultado do Treino de Turma Gerado - Painel Interativo Premium */}
                {generatedFunctionalWorkoutJSON && (
                  <div className="p-4 bg-[#111214] border border-[#ccff00]/40 rounded-2xl space-y-4 shadow-[0_0_20px_rgba(182,1,248,0.15)] animate-fade-in mt-4">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#3a494b]/20 pb-3">
                      <div>
                        <h4 className="text-sm font-extrabold text-white font-sans tracking-tight">
                          {generatedFunctionalWorkoutJSON.nomeTreino || generatedFunctionalWorkoutJSON.className}
                        </h4>
                        <p className="text-[10px] text-[#b9cacb]/80 font-mono mt-0.5">
                          {generatedFunctionalWorkoutJSON.observacoesProfessor || generatedFunctionalWorkoutJSON.objective || "Planejamento inteligente de circuito funcional"}
                        </p>
                      </div>
                      <div className="flex gap-1.5 self-start sm:self-center">
                        <button
                          type="button"
                          onClick={() => {
                            const fullText = (window as any).getCopyableText(generatedFunctionalWorkoutJSON);
                            navigator.clipboard.writeText(fullText);
                            setCopiedTurma(true);
                            setTimeout(() => setCopiedTurma(false), 2000);
                          }}
                          className="px-2.5 py-1.5 rounded-lg bg-[#ccff00]/10 hover:bg-[#ccff00]/20 border border-[#ccff00]/30 text-[#ebb2ff] text-[9px] font-bold uppercase transition-all cursor-pointer"
                        >
                          {copiedTurma ? "✓ Copiado" : "Copiar Texto"}
                        </button>
                        <button
                          type="button"
                          onClick={() => setGeneratedFunctionalWorkoutJSON(null)}
                          className="px-2 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 text-[9px] font-bold uppercase transition-all cursor-pointer"
                        >
                          Limpar
                        </button>
                      </div>
                    </div>

                    {/* Metadata Badges */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      <div className="bg-[#161719] border border-[#3a494b]/10 p-2 rounded-xl text-center">
                        <span className="block text-[8px] text-[#b9cacb]/55 font-mono uppercase">Intensidade</span>
                        <span className="text-[10px] text-[#ebb2ff] font-bold uppercase font-mono">
                          {funcIntensity || generatedFunctionalWorkoutJSON.intensity || "Geral"}
                        </span>
                      </div>
                      <div className="bg-[#161719] border border-[#3a494b]/10 p-2 rounded-xl text-center">
                        <span className="block text-[8px] text-[#b9cacb]/55 font-mono uppercase">Alunos</span>
                        <span className="text-[10px] text-white font-bold font-mono">
                          {funcStudentsCount || generatedFunctionalWorkoutJSON.studentsCount || 1} Alunos
                        </span>
                      </div>
                      <div className="bg-[#161719] border border-[#3a494b]/10 p-2 rounded-xl text-center">
                        <span className="block text-[8px] text-[#b9cacb]/55 font-mono uppercase">Duração</span>
                        <span className="text-[10px] text-[#00f2ff] font-bold font-mono">
                          {funcDuration || generatedFunctionalWorkoutJSON.duration || "45m"}
                        </span>
                      </div>
                      <div className="bg-[#161719] border border-[#3a494b]/10 p-2 rounded-xl text-center">
                        <span className="block text-[8px] text-[#b9cacb]/55 font-mono uppercase">Frequência</span>
                        <span className="text-[10px] text-emerald-400 font-bold font-mono">
                          {funcWeeklyFreq || generatedFunctionalWorkoutJSON.weeklyFrequency || "3x"}
                        </span>
                      </div>
                    </div>

                    {/* Alerta de Capacidade de Equipamento (New Format) */}
                    {generatedFunctionalWorkoutJSON.alertaCapacidade && (
                      <div className={`p-3.5 border rounded-xl space-y-1.5 ${
                        generatedFunctionalWorkoutJSON.alertaCapacidade.status === "ok" 
                          ? "bg-emerald-500/10 border-emerald-500/30" 
                          : generatedFunctionalWorkoutJSON.alertaCapacidade.status === "atencao"
                          ? "bg-amber-500/10 border-amber-500/30"
                          : "bg-red-500/10 border-red-500/30"
                      }`}>
                        <div className="flex items-center gap-2">
                          <span className="text-xs">
                            {generatedFunctionalWorkoutJSON.alertaCapacidade.status === "ok" ? "✅" : "⚠️"}
                          </span>
                          <span className={`font-extrabold text-[10px] uppercase tracking-wider font-mono ${
                            generatedFunctionalWorkoutJSON.alertaCapacidade.status === "ok" 
                              ? "text-emerald-400" 
                              : generatedFunctionalWorkoutJSON.alertaCapacidade.status === "atencao"
                              ? "text-amber-400"
                              : "text-red-400"
                          }`}>
                            AUDITORIA DE CAPACIDADE SIMULTÂNEA: {generatedFunctionalWorkoutJSON.alertaCapacidade.status?.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-[10px] text-white/95 leading-relaxed font-mono">
                          {generatedFunctionalWorkoutJSON.alertaCapacidade.mensagem}
                        </p>
                        {generatedFunctionalWorkoutJSON.alertaCapacidade.revezamentoNecessario && (
                          <div className="bg-black/40 p-2.5 rounded-lg border border-white/5 mt-1">
                            <span className="block text-[9px] text-[#ccff00] font-bold uppercase tracking-wider font-mono mb-1">
                              🔄 Estratégia de Rodízio 1:1 Ativa:
                            </span>
                            <p className="text-[9.5px] text-[#b9cacb] leading-relaxed">
                              {generatedFunctionalWorkoutJSON.alertaCapacidade.estrategia}
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Alerta de Capacidade de Equipamento (Old/Fallback Format) */}
                    {!generatedFunctionalWorkoutJSON.alertaCapacidade && !generatedFunctionalWorkoutJSON.isCompatible && (
                      <div className="p-3.5 bg-amber-500/10 border border-amber-500/30 rounded-xl space-y-1">
                        <div className="flex items-center gap-1.5 text-amber-400 font-extrabold text-[10px] uppercase tracking-wider font-mono">
                          <span>⚠️ ALERTA DE CAPACIDADE DE EQUIPAMENTOS</span>
                        </div>
                        <p className="text-[10px] text-white/95 leading-relaxed font-mono">
                          {generatedFunctionalWorkoutJSON.compatibilityWarning}
                        </p>
                        <p className="text-[9px] text-[#b9cacb] leading-relaxed italic font-mono mt-1">
                          Nota: O TreinoPro AI adaptou o plano com estratégias de rodízio de estações para otimizar os materiais disponíveis!
                        </p>
                      </div>
                    )}

                    {/* Aquecimento (se existir no formato anterior) */}
                    {generatedFunctionalWorkoutJSON.warmup && (
                      <div className="bg-[#161719] border border-[#3a494b]/10 p-3.5 rounded-xl space-y-1.5">
                        <div className="flex items-center gap-1.5 text-[#ebb2ff] font-extrabold text-[10px] uppercase tracking-wider font-mono">
                          <span>🔥 AQUECIMENTO (WARM-UP)</span>
                        </div>
                        <p className="text-[10px] text-white/90 leading-relaxed font-sans">
                          {generatedFunctionalWorkoutJSON.warmup}
                        </p>
                      </div>
                    )}

                    {/* Circuito / Estações */}
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-1.5 text-[#ebb2ff] font-extrabold text-[10px] uppercase tracking-wider font-mono">
                        <span>🔄 CIRCUITO (4 ESTAÇÕES COMBINADAS)</span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {(generatedFunctionalWorkoutJSON.estacoes || generatedFunctionalWorkoutJSON.stations || []).map((st: any, idx: number) => {
                          const num = st.numero || st.stationNumber || (idx + 1);
                          const exerciseName = st.exercicioPrincipal || st.exerciseName || "";
                          const equip = st.equipamento || st.requiredEquipment || "Peso Corporal";
                          const dur = st.tempo ? `${st.tempo} Ativo / ${st.descanso || "10s"} Descanso` : (st.duration || "45s");
                          const hasComplementary = st.exerciciosComplementares && st.exerciciosComplementares.length > 0;

                          return (
                            <div
                              key={idx}
                              className="bg-[#161719] border border-[#3a494b]/20 hover:border-[#ccff00]/40 p-3 rounded-xl space-y-2 transition-all shadow-sm flex flex-col justify-between"
                            >
                              <div className="space-y-2">
                                <div className="flex items-center justify-between border-b border-[#3a494b]/10 pb-1.5">
                                  <span className="px-2 py-0.5 rounded-md bg-[#ccff00]/20 text-[#ebb2ff] font-mono font-extrabold text-[8px] uppercase tracking-wider">
                                    Estação {num} {st.categoria && `[${st.categoria}]`}
                                  </span>
                                  <span className="text-[8px] text-[#b9cacb]/70 font-mono">
                                    ⏱️ {dur}
                                  </span>
                                </div>
                                <div>
                                  <h5 className="text-[11px] font-extrabold text-white font-sans tracking-tight">
                                    {exerciseName}
                                  </h5>
                                  <div className="flex flex-wrap gap-1.5 mt-1">
                                    <span className="text-[8px] text-[#00f2ff] bg-[#00f2ff]/10 border border-[#00f2ff]/20 px-1.5 py-0.5 rounded font-mono">
                                      🛠️ {equip}
                                    </span>
                                    {st.unidadesDisponiveis !== undefined && (
                                      <span className="text-[8px] text-[#ebb2ff] bg-[#ebb2ff]/10 border border-[#ebb2ff]/20 px-1.5 py-0.5 rounded font-mono">
                                        📦 {st.unidadesDisponiveis} un.
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <p className="text-[9.5px] text-[#b9cacb] leading-relaxed">
                                  {st.instrucoesRevezamento || st.description}
                                </p>

                                {/* Complementares */}
                                {hasComplementary && (
                                  <div className="bg-black/30 p-2 rounded-lg border border-dashed border-[#3a494b]/30">
                                    <span className="block text-[7.5px] text-amber-400 font-bold uppercase tracking-wider font-mono mb-1">
                                      🏃‍♂️ Complementar de Espera (Peso Corporal):
                                    </span>
                                    <div className="flex flex-wrap gap-1">
                                      {st.exerciciosComplementares.map((comp: string, cIdx: number) => (
                                        <span key={cIdx} className="text-[8px] bg-white/5 border border-white/10 px-1 py-0.5 rounded text-white font-mono">
                                          {comp}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>

                              <div className="bg-[#0f1011] p-1.5 rounded-lg border border-[#3a494b]/10 flex flex-col gap-1 mt-2">
                                <div className="flex items-center justify-between text-[8px] font-mono">
                                  <span className="text-emerald-400">
                                    <b>No Equipamento:</b> {st.alunosUsandoEquipamento !== undefined ? `${st.alunosUsandoEquipamento} Aluno(s)` : (st.allocatedStudents || "S/A")}
                                  </span>
                                  {st.alunosEmComplementar !== undefined && st.alunosEmComplementar > 0 && (
                                    <span className="text-amber-400 font-bold">
                                      <b>No Complementar:</b> {st.alunosEmComplementar} Aluno(s)
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Finisher */}
                    {generatedFunctionalWorkoutJSON.finisher && (
                      <div className="bg-[#161719] border border-[#3a494b]/10 p-3.5 rounded-xl space-y-1.5">
                        <div className="flex items-center gap-1.5 text-red-400 font-extrabold text-[10px] uppercase tracking-wider font-mono">
                          <span>⚡ PARTE FINAL / FINISHER CHALLENGE</span>
                        </div>
                        <p className="text-[10px] text-white/90 leading-relaxed font-sans">
                          {generatedFunctionalWorkoutJSON.finisher}
                        </p>
                      </div>
                    )}

                    {/* Notas do Coordenador */}
                    {(generatedFunctionalWorkoutJSON.observacoesProfessor || generatedFunctionalWorkoutJSON.notes) && (
                      <div className="bg-[#161719]/60 border border-amber-500/10 p-3.5 rounded-xl space-y-1.5">
                        <div className="flex items-center gap-1.5 text-amber-400 font-extrabold text-[10px] uppercase tracking-wider font-mono">
                          <span>🛡️ NOTAS DE FLUXO, SEGURANÇA E ADAPTAÇÕES</span>
                        </div>
                        <p className="text-[9.5px] text-white/80 leading-relaxed font-mono">
                          {generatedFunctionalWorkoutJSON.observacoesProfessor || generatedFunctionalWorkoutJSON.notes}
                        </p>
                      </div>
                    )}

                    {/* Import Button */}
                    <button
                      type="button"
                      onClick={() => {
                        const newExs: Exercise[] = [];
                        const rawStations = generatedFunctionalWorkoutJSON.estacoes || generatedFunctionalWorkoutJSON.stations || [];
                        rawStations.forEach((st: any) => {
                          const num = st.numero || st.stationNumber || 0;
                          const name = st.exercicioPrincipal || st.exerciseName || "";
                          const duration = st.tempo ? `${st.tempo} Ativo / ${st.descanso || "10s"} Descanso` : (st.duration || "45s");
                          const equipment = st.equipamento || st.requiredEquipment || "Peso Corporal";
                          
                          let notes = `Estação ${num}. Equipamento: ${equipment}.`;
                          if (st.alunosUsandoEquipamento !== undefined) {
                            notes += ` Alunos usando: ${st.alunosUsandoEquipamento}, Alunos no complementar: ${st.alunosEmComplementar || 0}.`;
                          } else if (st.allocatedStudents) {
                            notes += ` Alunos alocados: ${st.allocatedStudents}.`;
                          }
                          
                          const desc = st.instrucoesRevezamento || st.description || "";
                          if (desc) notes += ` Instruções: ${desc}`;
                          
                          newExs.push({
                            id: `ex-func-${Date.now()}-${num}`,
                            name: name,
                            sets: 4,
                            reps: duration,
                            weight: 0,
                            notes: notes,
                            category: "funcional"
                          });
                        });

                        setExercises(prev => {
                          const otherExs = prev.filter(ex => ex.category !== "funcional");
                          return [...otherExs, ...newExs];
                        });

                        alert("Estações adicionadas à ficha do aluno ativo!\n\nEstes exercícios foram marcados como funcionais e foram completamente excluídos dos cálculos de volume de musculação e da aba Análise.");
                      }}
                      className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 border border-emerald-500/30 text-white font-mono font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-[0_0_12px_rgba(16,185,129,0.25)] cursor-pointer"
                    >
                      <span>📥</span>
                      <span>Importar Estações para Planilha do Aluno</span>
                    </button>

                    {/* API source warning if present */}
                    {generatedFunctionalWorkoutJSON.warning && (
                      <p className="text-[8px] text-amber-400/80 font-mono text-center">
                        ⚠️ {generatedFunctionalWorkoutJSON.warning}
                      </p>
                    )}
                  </div>
                )}

                {/* Restrições Médicas e Lesões */}
                <div className="space-y-1.5 border-t border-[#3a494b]/20 pt-3">
                  <div className="flex items-center gap-1.5 text-[#e3e2e4] font-bold text-[10px] uppercase tracking-wider">
                    <span>🩹</span>
                    <span>Restrições Médicas e Lesões</span>
                  </div>
                  <p className="text-[9px] text-[#b9cacb]/80 leading-relaxed font-mono">
                    Informe qualquer desconforto, dor crônica, lesões ou recomendações médicas (ex: "Hérnia de disco L4-L5", "Condromalácia patelar leve"). A IA interpretará isso para <b>bloquear exercícios de risco</b> (como agachamentos profundos ou terra pesada) e sugerir alternativas biomecanicamente seguras.
                  </p>
                  <textarea
                    rows={2}
                    placeholder="Descreva aqui suas lesões ou limitações médicas para blindagem do treino..."
                    value={funcMedicalRestrictions}
                    onChange={(e) => setFuncMedicalRestrictions(e.target.value)}
                    className="w-full bg-[#1b1c1e] border border-[#3a494b]/40 focus:border-[#ccff00] text-white p-2.5 rounded-lg outline-none transition-all text-[10px] font-mono resize-none placeholder-[#b9cacb]/40"
                  />
                </div>

                {/* Gestão de Equipamentos Reais */}
                <div className="space-y-3 border-t border-[#3a494b]/20 pt-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-[#e3e2e4] font-bold text-[10px] uppercase tracking-wider">
                      <span>🛠️</span>
                      <span>Gestão de Equipamentos Reais</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowAddEqForm(prev => !prev)}
                      className="px-2 py-1 rounded bg-[#ccff00]/20 hover:bg-[#ccff00]/30 border border-[#ccff00]/40 text-[#ebb2ff] font-mono text-[8px] font-bold uppercase transition-all cursor-pointer flex items-center gap-1"
                    >
                      <span>➕</span> Adicionar Equipamento
                    </button>
                  </div>
                  
                  <p className="text-[9px] text-[#b9cacb]/80 leading-relaxed font-mono">
                    Defina a quantidade real de equipamentos disponíveis em seu estúdio. A IA criará o treino funcional sob medida para esses recursos e adaptará para evitar filas se a capacidade for ultrapassada.
                  </p>

                  {showAddEqForm && (
                    <div className="bg-[#121315] border border-[#3a494b]/30 p-3 rounded-lg space-y-2">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <div className="space-y-1">
                          <label className="block text-[8px] text-[#b9cacb]/60 font-mono uppercase">Nome</label>
                          <input
                            type="text"
                            placeholder="Ex: Chapéus Chineses"
                            value={newEqName}
                            onChange={(e) => setNewEqName(e.target.value)}
                            className="w-full bg-[#1b1c1e] border border-[#3a494b]/40 focus:border-[#ccff00] text-white p-1.5 rounded text-[10px] outline-none font-mono"
                          />
                        </div>
                        <div className="space-y-1 col-span-1">
                          <label className="block text-[8px] text-[#b9cacb]/60 font-mono uppercase">Ícone (Emoji)</label>
                          <select
                            value={newEqIcon}
                            onChange={(e) => setNewEqIcon(e.target.value)}
                            className="w-full bg-[#1b1c1e] border border-[#3a494b]/40 focus:border-[#ccff00] text-white p-1.5 rounded text-[10px] outline-none font-mono"
                          >
                            <option value="🛸">🛸 Chapéu/Cone</option>
                            <option value="🎗">🎗 TRX/Fita</option>
                            <option value="➰">➰ Corda</option>
                            <option value="🪜">🪜 Escada</option>
                            <option value="🥎">🥎 Bola</option>
                            <option value="📦">📦 Caixa</option>
                            <option value="🏃">🏃 Espaço/Rua</option>
                            <option value="🤸">🤸 Peso Corporal</option>
                            <option value="🏋️">🏋️ Kettlebell</option>
                            <option value="🔧">🔧 Genérico</option>
                          </select>
                        </div>
                        <div className="space-y-1">
                          <label className="block text-[8px] text-[#b9cacb]/60 font-mono uppercase">Qtd Inicial</label>
                          <input
                            type="number"
                            min="1"
                            value={newEqQuantity}
                            onChange={(e) => setNewEqQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                            className="w-full bg-[#1b1c1e] border border-[#3a494b]/40 focus:border-[#ccff00] text-white p-1.5 rounded text-[10px] outline-none font-mono"
                          />
                        </div>
                      </div>
                      <div className="flex justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            setShowAddEqForm(false);
                            setNewEqName("");
                          }}
                          className="px-2 py-1 text-[8px] bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 font-mono rounded transition-all cursor-pointer uppercase font-bold"
                        >
                          Cancelar
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (!newEqName.trim()) {
                              alert("Insira o nome do equipamento.");
                              return;
                            }
                            const newItem: EquipmentItem = {
                              id: `eq-custom-${Date.now()}`,
                              name: newEqName.trim(),
                              icon: newEqIcon,
                              use: true,
                              quantity: newEqQuantity,
                            };
                            setEquipments(prev => [...prev, newItem]);
                            setNewEqName("");
                            setNewEqQuantity(1);
                            setShowAddEqForm(false);
                          }}
                          className="px-2.5 py-1 text-[8px] bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-400 font-mono rounded transition-all cursor-pointer uppercase font-bold"
                        >
                          Adicionar
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    {equipments.map((eq) => (
                      <div
                        key={eq.id}
                        className="flex items-center justify-between bg-[#161719] border border-[#3a494b]/20 p-2 rounded-lg hover:border-[#ccff00]/20 transition-all"
                      >
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={eq.use}
                            onChange={(e) => {
                              setEquipments(prev => prev.map(item => item.id === eq.id ? { ...item, use: e.target.checked } : item));
                            }}
                            className="w-3.5 h-3.5 accent-[#ccff00] cursor-pointer"
                          />
                          <div className="font-mono text-[10px] text-[#e3e2e4]">
                            <span className="mr-1">{eq.icon}</span> {eq.name}{" "}
                            <span className="text-[8px] text-[#b9cacb]/60 lowercase">
                              : {eq.quantity} {eq.quantity === 1 ? "unidade" : "unidades"}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1.5 bg-[#0f1011] p-0.5 rounded border border-[#3a494b]/30">
                            <button
                              type="button"
                              disabled={!eq.use}
                              onClick={() => {
                                setEquipments(prev => prev.map(item => item.id === eq.id ? { ...item, quantity: Math.max(0, item.quantity - 1) } : item));
                              }}
                              className="w-5 h-5 rounded bg-[#121315] hover:bg-[#ccff00]/20 disabled:opacity-30 border border-[#3a494b]/40 text-[#ebb2ff] font-bold flex items-center justify-center transition-all cursor-pointer text-[10px]"
                            >
                              -
                            </button>
                            <span className="w-4 text-center font-bold text-white text-[10px] font-mono">{eq.quantity}</span>
                            <button
                              type="button"
                              disabled={!eq.use}
                              onClick={() => {
                                setEquipments(prev => prev.map(item => item.id === eq.id ? { ...item, quantity: item.quantity + 1 } : item));
                              }}
                              className="w-5 h-5 rounded bg-[#121315] hover:bg-[#ccff00]/20 disabled:opacity-30 border border-[#3a494b]/40 text-[#ebb2ff] font-bold flex items-center justify-center transition-all cursor-pointer text-[10px]"
                            >
                              +
                            </button>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleRemoveEquipmentClick(eq.id, eq.name)}
                            title="Excluir Equipamento"
                            className="p-1 rounded hover:bg-red-500/10 text-red-500 border border-transparent hover:border-red-500/20 transition-all cursor-pointer flex items-center justify-center"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-red-500" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>



              {/* List of Funcional Exercises */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <h4 className="text-[10px] font-mono font-bold text-[#b9cacb] uppercase tracking-wider">
                    Exercícios na Planilha ({funcionalExercises.length})
                  </h4>
                  {funcionalExercises.length > 0 && (
                    <button
                      type="button"
                      onClick={handleRemoveAllFunctionalClick}
                      className="text-red-400 hover:text-red-300 hover:underline text-[9px] font-bold uppercase tracking-wider flex items-center gap-1 cursor-pointer transition-all"
                    >
                      <Trash2 className="w-3 h-3" />
                      Remover Todos
                    </button>
                  )}
                </div>

                {funcionalExercises.length === 0 ? (
                  <div className="p-6 text-center bg-[#121315]/40 rounded-lg border border-dashed border-[#3a494b]/20 text-[#b9cacb] text-xs font-mono">
                    <p>Nenhum exercício de Treinamento Funcional adicionado.</p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1">
                    {funcionalExercises.map((ex, idx) => (
                      <div 
                        key={ex.id}
                        className="bg-[#1b1c1e] p-3 rounded-lg border border-[#3a494b]/20 flex items-center justify-between gap-4 hover:border-[#ccff00]/30 transition-all font-mono text-xs"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full bg-[#ccff00]/10 text-[#ebb2ff] flex items-center justify-center font-bold text-[10px] shrink-0">
                              {idx + 1}
                            </span>
                            <h5 className="font-bold text-[#e3e2e4] truncate">{ex.name}</h5>
                          </div>
                          <div className="flex items-center gap-3 text-[10px] text-[#b9cacb] mt-1.5 pl-7">
                            <span>Séries: <b className="text-white">{ex.sets}</b></span>
                            <span>Reps: <b className="text-white">{ex.reps}</b></span>
                            <span>Carga: <b className="text-white">{ex.weight} kg</b></span>
                          </div>
                          {ex.notes && (
                            <p className="text-[10px] text-[#ebb2ff] bg-[#ccff00]/5 border border-[#ccff00]/10 px-2 py-0.5 rounded mt-2 ml-7 italic">
                              Obs: {ex.notes}
                            </p>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRemoveExercise(ex.id)}
                          className="text-[#b9cacb] hover:text-red-400 p-1.5 rounded bg-[#121315] hover:bg-red-500/5 transition-all cursor-pointer shrink-0"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* COLUMN 3: Auditoria Científica de Volume & Periodização */}
          {activeTab === "analise" && (
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start animate-fade-in">
              {/* Left Column (Main Analysis) */}
              <div 
                className="lg:col-span-3 glass-panel rounded-xl p-5 space-y-5 border-t-4 border-[#ebb2ff]"
                style={{ width: "882.149px" }}
              >
                <div className="flex items-center gap-3 border-b border-[#3a494b]/20 pb-3">
                  <div className="w-9 h-9 rounded bg-[#ebb2ff]/10 flex items-center justify-center border border-[#ebb2ff]/20">
                    <Sparkles className="w-5 h-5 text-[#ebb2ff]" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base text-white font-mono uppercase tracking-wider flex items-center gap-1.5">
                      <BarChart3 className="w-5 h-5 text-purple-400" /> Auditoria de Volume & Periodização
                    </h3>
                    <p className="text-[10px] font-sans text-[#b9cacb]">
                      Análise profunda de MEV, MRV, sinergistas e fadiga sistêmica baseada em Mike Israetel
                    </p>
                  </div>
                </div>

                {effectiveAnalysisExercises.length === 0 ? (
                  <div className="p-8 text-center bg-[#121315]/40 rounded-lg border border-dashed border-[#3a494b]/20 text-[#b9cacb] text-xs font-mono font-bold">
                    <p>Nenhum exercício na planilha ativa para analisar.</p>
                    <p className="text-[10px] mt-1 text-[#6a7a7b] font-normal">Gere um treino com Inteligência Artificial ou adicione exercícios na aba de Musculação Tradicional ou Funcional para auditar o volume.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="p-3.5 bg-[#ebb2ff]/10 border border-[#ebb2ff]/20 rounded-xl text-[11px] text-[#ebb2ff] leading-relaxed font-mono">
                      💡 <b>Sincronização Científica Ativa:</b> {aiGeneratedExercises.length > 0 ? "A planilha gerada por Inteligência Artificial está sendo auditada abaixo antes de salvar." : "A planilha que está sendo montada manualmente é auditada em tempo real aqui. Se você adicionar, remover ou ajustar as séries dos exercícios nas outras abas, os volumes são recalculados instantaneamente."}
                    </div>
                    
                    <AnaliseView
                      students={students}
                      workouts={workouts}
                      selectedStudentId={activeStudentId}
                      onSaveWorkout={onSaveWorkout}
                      onSelectStudent={onSelectStudent}
                      hideHeader={true}
                      customExercises={effectiveAnalysisExercises}
                      onAdjustExercises={handleAdjustEffectiveExercises}
                      activeCycleIdx={activeCycleIdx}
                      periodizacaoModel={periodizacaoModel}
                    />
                  </div>
                )}
              </div>

              {/* Right Column (Control Panel) */}
              <div 
                className="lg:col-span-1 bg-[#121315]/80 border border-[#ebb2ff]/20 p-5 rounded-xl space-y-4 font-mono text-xs shadow-[0_0_15px_rgba(235,178,255,0.05)]"
                style={{ width: "843.913px" }}
              >
                <div className="flex items-center gap-2 border-b border-[#3a494b]/20 pb-2.5">
                  <span className="text-[#ebb2ff] text-base font-bold">⚙️</span>
                  <h4 className="font-extrabold text-[10px] text-[#e3e2e4] uppercase tracking-wider">
                    Ciclo e Periodização
                  </h4>
                </div>

                {/* Seletor de Periodização */}
                <div className="space-y-1.5">
                  <label className="block text-[#b9cacb] text-[9px] font-bold uppercase tracking-wider">
                    Modelo
                  </label>
                  <div className="grid grid-cols-1 gap-1.5">
                    <button
                      type="button"
                      onClick={() => setPeriodizacaoModel("Blocos Curtos (Linear)")}
                      className={`px-2 py-1.5 rounded-lg font-bold text-center border text-[10px] transition-all cursor-pointer ${
                        periodizacaoModel === "Blocos Curtos (Linear)"
                          ? "bg-[#ebb2ff]/15 border-[#ebb2ff] text-[#ebb2ff] shadow-[0_0_8px_rgba(235,178,255,0.15)]"
                          : "bg-[#1b1c1e] border-[#3a494b]/40 text-[#b9cacb] hover:border-[#b9cacb]/40"
                      }`}
                    >
                      Blocos Curtos (Linear)
                    </button>
                    <button
                      type="button"
                      onClick={() => setPeriodizacaoModel("Macrociclo Anual")}
                      className={`px-2 py-1.5 rounded-lg font-bold text-center border text-[10px] transition-all cursor-pointer ${
                        periodizacaoModel === "Macrociclo Anual"
                          ? "bg-[#ebb2ff]/15 border-[#ebb2ff] text-[#ebb2ff] shadow-[0_0_8px_rgba(235,178,255,0.15)]"
                          : "bg-[#1b1c1e] border-[#3a494b]/40 text-[#b9cacb] hover:border-[#b9cacb]/40"
                      }`}
                    >
                      Macrociclo Anual
                    </button>
                  </div>
                </div>

                {/* Ciclo Atual (Mesociclos) */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-[9px] uppercase font-bold tracking-wider">
                    <span className="text-[#b9cacb]">Ciclo Ativo</span>
                  </div>

                  <div className="space-y-1.5 max-h-[300px] overflow-y-auto pr-1">
                    {mesocycles.map((cycle, idx) => {
                      const isActive = safeActiveCycleIdx === idx;
                      return (
                        <div
                          key={idx}
                          onClick={() => setActiveCycleIdx(idx)}
                          className={`p-2 rounded-lg border text-left cursor-pointer transition-all flex flex-col gap-1 ${
                            isActive
                              ? "bg-[#ebb2ff]/5 border-[#ebb2ff] text-white"
                              : "bg-[#161719] border-[#3a494b]/20 text-[#b9cacb] hover:border-[#3a494b]/40"
                          }`}
                        >
                          <div className="flex items-center gap-1.5">
                            <span className={`w-1.5 h-1.5 rounded-full ${isActive ? "bg-[#ebb2ff]" : "bg-[#3a494b]"}`} />
                            <span className="font-bold text-[9px] text-white">{cycle.range}</span>
                          </div>
                          <div className="text-[9px] text-[#ebb2ff] font-medium pl-3">
                            {cycle.title}
                          </div>
                          <div className="text-[9px] text-[#b9cacb]/80 pl-3">
                            {cycle.vol}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* COLUMN 4: Periodização Científica */}
          {activeTab === "periodizacao" && (
            <PeriodizacaoCientifica
              activeStudentId={activeStudentId}
              studentName={currentStudent?.name}
              studentAge={currentStudent?.age}
              studentGender={currentStudent?.gender}
              studentObjective={currentStudent?.objective}
              studentLimitations={currentStudent?.limitations}
              studentPhase={currentStudent?.phase}
              onSaveWorkout={onSaveWorkout}
            />
          )}

          </div>

        </div>
      ) : (
        <div className="glass-panel rounded-xl p-8 text-center text-[#b9cacb]">
          <Activity className="w-12 h-12 mx-auto opacity-20 mb-2" />
          <p className="text-sm font-mono">Por favor, cadastre um aluno na aba Alunos primeiro.</p>
        </div>
      )}

      {/* Técnicas de Musculação Modal */}
      {showTecnicasModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0a0b0d]/90 backdrop-blur-md overflow-hidden animate-fade-in"
          onClick={() => setShowTecnicasModal(false)}
        >
          <div 
            className="bg-[#121315] border border-[#3a494b]/40 rounded-2xl w-full max-w-6xl h-[85vh] flex flex-col shadow-[0_0_50px_rgba(182,1,248,0.2)] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-5 border-b border-[#3a494b]/20 bg-[#161719]/80 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded bg-[#ccff00]/20 flex items-center justify-center border border-[#ccff00]/30">
                  <BookOpen className="w-5 h-5 text-[#ebb2ff]" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-white uppercase tracking-wider font-mono">
                    Biblioteca de Técnicas de Musculação
                  </h3>
                  <p className="text-[10px] text-[#b9cacb] font-mono uppercase tracking-wide">
                    Consulte as técnicas categorizadas e inclua em suas observações
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowTecnicasModal(false)}
                className="p-1.5 rounded-lg bg-[#1b1c1e] text-[#b9cacb] hover:text-white border border-[#3a494b]/30 hover:border-[#3a494b]/60 transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body & Sidebar Layout */}
            <div className="flex-1 flex flex-col overflow-hidden p-6 space-y-5">
              
              {/* KPI Summary / Filters Bar */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 font-mono">
                {/* KPI 1: Todas */}
                <div 
                  onClick={() => setSelectedTecnicaCategory("todas")}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                    selectedTecnicaCategory === "todas"
                      ? "bg-[#ccff00]/10 border-[#ccff00] text-white shadow-[0_0_12px_rgba(182,1,248,0.15)]"
                      : "bg-[#161719] border-[#3a494b]/30 text-[#b9cacb] hover:border-[#3a494b]/60"
                  }`}
                >
                  <span className="text-[9px] uppercase tracking-wider font-bold text-[#ebb2ff]">Todas as Técnicas</span>
                  <div className="flex items-baseline justify-between mt-1">
                    <span className="text-2xl font-extrabold text-white">{kpiStats.total}</span>
                    <span className="text-[9px] text-[#b9cacb]">Ativo</span>
                  </div>
                </div>

                {/* KPI 2: Execução */}
                <div 
                  onClick={() => setSelectedTecnicaCategory("execucao")}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                    selectedTecnicaCategory === "execucao"
                      ? "bg-[#00f2ff]/10 border-[#00f2ff] text-white shadow-[0_0_12px_rgba(0,242,255,0.15)]"
                      : "bg-[#161719] border-[#3a494b]/30 text-[#b9cacb] hover:border-[#3a494b]/60"
                  }`}
                >
                  <span className="text-[9px] uppercase tracking-wider font-bold text-[#00f2ff]">Seção de Execução</span>
                  <div className="flex items-baseline justify-between mt-1">
                    <span className="text-2xl font-extrabold text-white">{kpiStats.execucao}</span>
                    <span className="text-[9px] text-[#00dbe7]">Métodos</span>
                  </div>
                </div>

                {/* KPI 3: Intensificação */}
                <div 
                  onClick={() => setSelectedTecnicaCategory("intensificacao")}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                    selectedTecnicaCategory === "intensificacao"
                      ? "bg-[#ebb2ff]/10 border-[#ebb2ff] text-white shadow-[0_0_12px_rgba(235,178,255,0.15)]"
                      : "bg-[#161719] border-[#3a494b]/30 text-[#b9cacb] hover:border-[#3a494b]/60"
                  }`}
                >
                  <span className="text-[9px] uppercase tracking-wider font-bold text-[#ebb2ff]">Seção de Intensificação</span>
                  <div className="flex items-baseline justify-between mt-1">
                    <span className="text-2xl font-extrabold text-white">{kpiStats.intensificacao}</span>
                    <span className="text-[9px] text-[#ebb2ff]">Métodos</span>
                  </div>
                </div>

                {/* KPI 4: Amplitude */}
                <div 
                  onClick={() => setSelectedTecnicaCategory("amplitude")}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                    selectedTecnicaCategory === "amplitude"
                      ? "bg-amber-500/10 border-amber-500/40 text-white shadow-[0_0_12px_rgba(245,158,11,0.15)]"
                      : "bg-[#161719] border-[#3a494b]/30 text-[#b9cacb] hover:border-[#3a494b]/60"
                  }`}
                >
                  <span className="text-[9px] uppercase tracking-wider font-bold text-amber-400">Seção de Amplitude</span>
                  <div className="flex items-baseline justify-between mt-1">
                    <span className="text-2xl font-extrabold text-white">{kpiStats.amplitude}</span>
                    <span className="text-[9px] text-amber-400">Métodos</span>
                  </div>
                </div>
              </div>

              {/* Search input bar */}
              <div className="relative font-mono">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-[#b9cacb]/60" />
                <input
                  type="text"
                  placeholder="DIGITE PARA BUSCAR POR NOME, INSTRUÇÃO OU TAGS (EX: DROP SET, FALHA, FORÇA...)"
                  value={tecnicasSearchQuery}
                  onChange={(e) => setTecnicasSearchQuery(e.target.value)}
                  className="w-full bg-[#161719] border border-[#3a494b]/40 focus:border-[#ccff00] text-white pl-10 pr-4 py-2 rounded-xl text-xs outline-none transition-all placeholder-[#b9cacb]/40 uppercase tracking-wider"
                />
                {tecnicasSearchQuery && (
                  <button
                    type="button"
                    onClick={() => setTecnicasSearchQuery("")}
                    className="absolute right-3 top-2.5 text-[#b9cacb] hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Grid Content with Scrollable Box */}
              <div className="flex-1 overflow-y-auto space-y-6 pr-1.5 custom-scrollbar">
                
                {/* 1. SEÇÃO DE EXECUÇÃO */}
                {(selectedTecnicaCategory === "todas" || selectedTecnicaCategory === "execucao") && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 border-b border-[#3a494b]/20 pb-1.5">
                      <span className="text-[#00f2ff] text-sm">⚙️</span>
                      <h4 className="font-extrabold text-xs text-[#00f2ff] uppercase tracking-widest font-mono">
                        Seção de Execução ({tecnicasPorCategoria.execucao.length})
                      </h4>
                    </div>

                    {tecnicasPorCategoria.execucao.length === 0 ? (
                      <p className="text-[10px] text-[#b9cacb]/60 font-mono italic">Nenhuma técnica de execução encontrada.</p>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {tecnicasPorCategoria.execucao.map((tec, idx) => (
                          <div 
                            key={idx}
                            className="bg-[#1b1c1e]/60 border border-[#3a494b]/20 hover:border-[#00f2ff]/40 p-4 rounded-xl flex flex-col justify-between space-y-3 transition-all hover:translate-y-[-1px] hover:bg-[#1b1c1e]"
                          >
                            <div>
                              <div className="flex items-start justify-between gap-2">
                                <h5 className="font-extrabold text-white text-[11px] leading-tight font-mono">{tec.nome}</h5>
                                <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wide shrink-0 ${
                                  tec.nivel_dificuldade === "iniciante" 
                                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                    : tec.nivel_dificuldade === "intermediario"
                                      ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                                      : "bg-fuchsia-500/10 text-fuchsia-400 border border-fuchsia-500/20"
                                }`}>
                                  {tec.nivel_dificuldade}
                                </span>
                              </div>
                              <p className="text-[10px] text-[#b9cacb] mt-1 font-mono leading-relaxed">{tec.descricao}</p>
                              
                              <div className="mt-2.5 p-2 bg-[#121315]/80 rounded border border-[#3a494b]/10">
                                <span className="text-[#00f2ff] text-[8px] font-bold uppercase tracking-wider block mb-0.5">Instrução:</span>
                                <p className="text-[9px] text-white leading-relaxed font-mono">{tec.instrucao}</p>
                              </div>
                            </div>

                            <div className="flex flex-wrap gap-1 pt-1">
                              {tec.tags.map((tag, tIdx) => (
                                <span key={tIdx} className="bg-[#121315] text-[#b9cacb]/70 border border-[#3a494b]/10 text-[8px] px-1.5 py-0.5 rounded-md font-mono">
                                  #{tag}
                                </span>
                              ))}
                            </div>

                            <button
                              type="button"
                              onClick={() => {
                                setMuscNotes(tec.nome + " — " + tec.instrucao);
                                setShowTecnicasModal(false);
                              }}
                              className="w-full mt-2 py-1.5 rounded bg-[#00f2ff]/10 hover:bg-[#00f2ff] text-[#00f2ff] hover:text-black font-bold text-[9px] uppercase tracking-wider transition-all flex items-center justify-center gap-1 cursor-pointer border border-[#00f2ff]/20"
                            >
                              <Plus className="w-3 h-3" /> Usar esta Técnica
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* 2. SEÇÃO DE INTENSIFICAÇÃO */}
                {(selectedTecnicaCategory === "todas" || selectedTecnicaCategory === "intensificacao") && (
                  <div className="space-y-3 pt-2">
                    <div className="flex items-center gap-2 border-b border-[#3a494b]/20 pb-1.5">
                      <span className="text-[#ebb2ff] text-sm">🔥</span>
                      <h4 className="font-extrabold text-xs text-[#ebb2ff] uppercase tracking-widest font-mono">
                        Seção de Intensificação ({tecnicasPorCategoria.intensificacao.length})
                      </h4>
                    </div>

                    {tecnicasPorCategoria.intensificacao.length === 0 ? (
                      <p className="text-[10px] text-[#b9cacb]/60 font-mono italic">Nenhuma técnica de intensificação encontrada.</p>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {tecnicasPorCategoria.intensificacao.map((tec, idx) => (
                          <div 
                            key={idx}
                            className="bg-[#1b1c1e]/60 border border-[#3a494b]/20 hover:border-[#ebb2ff]/40 p-4 rounded-xl flex flex-col justify-between space-y-3 transition-all hover:translate-y-[-1px] hover:bg-[#1b1c1e]"
                          >
                            <div>
                              <div className="flex items-start justify-between gap-2">
                                <h5 className="font-extrabold text-white text-[11px] leading-tight font-mono">{tec.nome}</h5>
                                <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wide shrink-0 ${
                                  tec.nivel_dificuldade === "iniciante" 
                                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                    : tec.nivel_dificuldade === "intermediario"
                                      ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                                      : "bg-fuchsia-500/10 text-fuchsia-400 border border-fuchsia-500/20"
                                }`}>
                                  {tec.nivel_dificuldade}
                                </span>
                              </div>
                              <p className="text-[10px] text-[#b9cacb] mt-1 font-mono leading-relaxed">{tec.descricao}</p>
                              
                              <div className="mt-2.5 p-2 bg-[#121315]/80 rounded border border-[#3a494b]/10">
                                <span className="text-[#ebb2ff] text-[8px] font-bold uppercase tracking-wider block mb-0.5">Instrução:</span>
                                <p className="text-[9px] text-white leading-relaxed font-mono">{tec.instrucao}</p>
                              </div>
                            </div>

                            <div className="flex flex-wrap gap-1 pt-1">
                              {tec.tags.map((tag, tIdx) => (
                                <span key={tIdx} className="bg-[#121315] text-[#b9cacb]/70 border border-[#3a494b]/10 text-[8px] px-1.5 py-0.5 rounded-md font-mono">
                                  #{tag}
                                </span>
                              ))}
                            </div>

                            <button
                              type="button"
                              onClick={() => {
                                setMuscNotes(tec.nome + " — " + tec.instrucao);
                                setShowTecnicasModal(false);
                              }}
                              className="w-full mt-2 py-1.5 rounded bg-[#ebb2ff]/10 hover:bg-[#ebb2ff] text-[#ebb2ff] hover:text-black font-bold text-[9px] uppercase tracking-wider transition-all flex items-center justify-center gap-1 cursor-pointer border border-[#ebb2ff]/20"
                            >
                              <Plus className="w-3 h-3" /> Usar esta Técnica
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* 3. SEÇÃO DE AMPLITUDE */}
                {(selectedTecnicaCategory === "todas" || selectedTecnicaCategory === "amplitude") && (
                  <div className="space-y-3 pt-2">
                    <div className="flex items-center gap-2 border-b border-[#3a494b]/20 pb-1.5">
                      <span className="text-amber-400 text-sm">📐</span>
                      <h4 className="font-extrabold text-xs text-amber-400 uppercase tracking-widest font-mono">
                        Seção de Amplitude ({tecnicasPorCategoria.amplitude.length})
                      </h4>
                    </div>

                    {tecnicasPorCategoria.amplitude.length === 0 ? (
                      <p className="text-[10px] text-[#b9cacb]/60 font-mono italic">Nenhuma técnica de amplitude encontrada.</p>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {tecnicasPorCategoria.amplitude.map((tec, idx) => (
                          <div 
                            key={idx}
                            className="bg-[#1b1c1e]/60 border border-[#3a494b]/20 hover:border-amber-500/40 p-4 rounded-xl flex flex-col justify-between space-y-3 transition-all hover:translate-y-[-1px] hover:bg-[#1b1c1e]"
                          >
                            <div>
                              <div className="flex items-start justify-between gap-2">
                                <h5 className="font-extrabold text-white text-[11px] leading-tight font-mono">{tec.nome}</h5>
                                <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wide shrink-0 ${
                                  tec.nivel_dificuldade === "iniciante" 
                                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                    : tec.nivel_dificuldade === "intermediario"
                                      ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                                      : "bg-fuchsia-500/10 text-fuchsia-400 border border-fuchsia-500/20"
                                }`}>
                                  {tec.nivel_dificuldade}
                                </span>
                              </div>
                              <p className="text-[10px] text-[#b9cacb] mt-1 font-mono leading-relaxed">{tec.descricao}</p>
                              
                              <div className="mt-2.5 p-2 bg-[#121315]/80 rounded border border-[#3a494b]/10">
                                <span className="text-amber-400 text-[8px] font-bold uppercase tracking-wider block mb-0.5">Instrução:</span>
                                <p className="text-[9px] text-white leading-relaxed font-mono">{tec.instrucao}</p>
                              </div>
                            </div>

                            <div className="flex flex-wrap gap-1 pt-1">
                              {tec.tags.map((tag, tIdx) => (
                                <span key={tIdx} className="bg-[#121315] text-[#b9cacb]/70 border border-[#3a494b]/10 text-[8px] px-1.5 py-0.5 rounded-md font-mono">
                                  #{tag}
                                </span>
                              ))}
                            </div>

                            <button
                              type="button"
                              onClick={() => {
                                setMuscNotes(tec.nome + " — " + tec.instrucao);
                                setShowTecnicasModal(false);
                              }}
                              className="w-full mt-2 py-1.5 rounded bg-amber-500/10 hover:bg-amber-500 text-amber-400 hover:text-black font-bold text-[9px] uppercase tracking-wider transition-all flex items-center justify-center gap-1 cursor-pointer border border-amber-500/20"
                            >
                              <Plus className="w-3 h-3" /> Usar esta Técnica
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-[#3a494b]/20 bg-[#161719]/50 flex justify-between items-center text-[10px] text-[#b9cacb] font-mono uppercase">
              <span>Total de Métodos disponíveis: <b>{TECNICAS_MUSCULACAO.length}</b></span>
              <span>Clique em <b>"Usar esta técnica"</b> para aplicá-la ao formulário de cadastro.</span>
            </div>
          </div>
        </div>
      )}

      {currentStudent && (
        <StudentQuickWorkoutView
          isOpen={showStudentViewModal}
          onClose={() => setShowStudentViewModal(false)}
          student={currentStudent}
          allWorkouts={workouts}
          currentDraftExercises={exercises}
          workoutNameDraft={workoutName}
          onSaveWorkout={onSaveWorkout}
        />
      )}

      {/* Módulo 3 — Explainable AI Biomechanics Modal */}
      {selectedExplainableExercise && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#161719] border border-[#00f2ff]/40 rounded-2xl w-full max-w-2xl overflow-hidden shadow-[0_0_50px_rgba(0,242,255,0.25)] flex flex-col font-sans">
            
            {/* Modal Header */}
            <div className="bg-[#1e2023] p-5 border-b border-[#3a494b]/20 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-[#00f2ff]/10 text-[#00f2ff]">
                  <Brain className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <span className="text-[9px] text-[#00f2ff] font-bold uppercase tracking-wider block font-mono">Módulo 3 — IA Explicável Biomecânica</span>
                  <h3 className="text-lg font-extrabold text-white leading-tight mt-0.5">
                    {selectedExplainableExercise.name}
                  </h3>
                </div>
              </div>
              <button
                onClick={() => setSelectedExplainableExercise(null)}
                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-[#b9cacb] hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5 overflow-y-auto max-h-[70vh] scrollbar-thin">
              
              {/* Quick Biomechanical Attributes Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="p-3 bg-[#121315] border border-[#3a494b]/15 rounded-xl space-y-1">
                  <span className="text-[9px] text-[#6a7a7b] font-bold uppercase tracking-wider block">Foco Primário</span>
                  <p className="text-[11px] text-[#00f2ff] font-extrabold">{selectedExplainableExercise.primaryMuscles}</p>
                </div>
                <div className="p-3 bg-[#121315] border border-[#3a494b]/15 rounded-xl space-y-1">
                  <span className="text-[9px] text-[#6a7a7b] font-bold uppercase tracking-wider block">Sinergistas</span>
                  <p className="text-[11px] text-white font-medium">{selectedExplainableExercise.synergists}</p>
                </div>
                <div className="p-3 bg-[#121315] border border-[#3a494b]/15 rounded-xl space-y-1">
                  <span className="text-[9px] text-[#6a7a7b] font-bold uppercase tracking-wider block">Estabilidade</span>
                  <p className="text-[11px] text-[#ebb2ff] font-medium">{selectedExplainableExercise.stability}</p>
                </div>
                <div className="p-3 bg-[#121315] border border-[#3a494b]/15 rounded-xl space-y-1 col-span-2 sm:col-span-1">
                  <span className="text-[9px] text-[#6a7a7b] font-bold uppercase tracking-wider block">Curva de Carga</span>
                  <p className="text-[11px] text-amber-400 font-medium">{selectedExplainableExercise.resistanceCurve}</p>
                </div>
                <div className="p-3 bg-[#121315] border border-[#3a494b]/15 rounded-xl space-y-1 col-span-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] text-[#6a7a7b] font-bold uppercase tracking-wider block">Relação Estímulo/Fadiga (SFR)</span>
                    <span className="text-xs font-mono font-extrabold text-emerald-400">{selectedExplainableExercise.sfr}</span>
                  </div>
                  <div className="w-full bg-[#1e2023] h-1.5 rounded-full overflow-hidden mt-1.5">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: '90%' }}></div>
                  </div>
                </div>
              </div>

              {/* Detailed scientific explanations */}
              <div className="space-y-4 pt-1">
                
                {/* 1. Motivo da Escolha */}
                <div className="p-3 bg-white/[0.02] border-l-2 border-[#00f2ff] rounded-r-xl space-y-1">
                  <span className="text-[10px] text-[#00f2ff] font-extrabold uppercase tracking-widest font-mono">Motivo Fisiológico da Escolha</span>
                  <p className="text-xs text-[#b9cacb] leading-relaxed">
                    {selectedExplainableExercise.choiceReason}
                  </p>
                </div>

                {/* 2. Vantagens Biomecânicas */}
                <div className="p-3 bg-white/[0.02] border-l-2 border-emerald-500 rounded-r-xl space-y-1">
                  <span className="text-[10px] text-emerald-400 font-extrabold uppercase tracking-widest font-mono">Vantagens Biomecânicas Específicas</span>
                  <p className="text-xs text-[#b9cacb] leading-relaxed">
                    {selectedExplainableExercise.biomechanicalAdvantages}
                  </p>
                </div>

                {/* 3. Motivo de Substituição */}
                <div className="p-3 bg-white/[0.02] border-l-2 border-[#ebb2ff] rounded-r-xl space-y-1">
                  <span className="text-[10px] text-[#ebb2ff] font-extrabold uppercase tracking-widest font-mono">Alternativas & Recomendações de Substituição</span>
                  <p className="text-xs text-[#b9cacb] leading-relaxed">
                    {selectedExplainableExercise.substituteReason}
                  </p>
                </div>

                {/* 4. Contraindicações */}
                <div className="p-3 bg-white/[0.02] border-l-2 border-red-500 rounded-r-xl space-y-1">
                  <span className="text-[10px] text-red-400 font-extrabold uppercase tracking-widest font-mono">Contraindicações & Cuidados Articulares</span>
                  <p className="text-xs text-[#b9cacb] leading-relaxed">
                    {selectedExplainableExercise.contraindications}
                  </p>
                </div>

              </div>

            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-[#3a494b]/20 bg-[#121315] flex justify-end">
              <button
                onClick={() => setSelectedExplainableExercise(null)}
                className="px-5 py-2 rounded-xl bg-[#00f2ff] hover:bg-[#00dbe7] text-black font-extrabold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-[0_0_15px_rgba(0,242,255,0.3)]"
              >
                Entendido, Fechar
              </button>
            </div>

          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={isConfirmDeleteOpen}
        title={
          deleteActionType === "exercise" 
            ? "Remover Exercício" 
            : deleteActionType === "equipment" 
            ? "Excluir Equipamento" 
            : "Remover Todos os Exercícios"
        }
        message={`Deseja realmente remover "${deleteTargetName}"? Esta ação não poderá ser desfeita.`}
        confirmLabel="Confirmar Remoção"
        cancelLabel="Cancelar"
        onConfirm={confirmDeleteAction}
        onCancel={() => {
          setIsConfirmDeleteOpen(false);
          setDeleteActionType(null);
          setDeleteTargetId(null);
        }}
        variant="danger"
      />

    </div>
  );
}
