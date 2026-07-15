import React, { useState, useEffect, useMemo, useRef } from "react";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  LineChart, 
  Line 
} from "recharts";
import { 
  Calendar, 
  Sparkles, 
  Plus, 
  Trash2, 
  Save, 
  Activity, 
  ChevronLeft, 
  ChevronRight, 
  HelpCircle, 
  Info, 
  Check, 
  Brain, 
  Sliders, 
  ArrowUp, 
  ArrowDown, 
  RefreshCw, 
  AlertTriangle,
  Lightbulb,
  Send
} from "lucide-react";
import { db, auth, handleFirestoreError, OperationType } from "@/src/shared/infrastructure/firebase/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { 
  Etapa1Identificacao,
  Etapa2Diagnostico,
  Etapa3Estrategia,
  Etapa4Planejamento,
  Etapa5Timeline,
  Etapa6Copilot,
  Etapa7Auditoria,
  Etapa8Construcao
} from "./components/PeriodizationStages";
import { buildPeriodizationPlan, auditAndAutoHeal, buildCopilotInterpretation } from "@/src/shared/modules/training/services/periodizationEngine";
import { Exercise } from "../../../types";

// Types
export interface Macrociclo {
  id: string;
  name: string;
  objective: string;
  durationMonths: number;
  startDate: string;
  endDate: string;
  notes: string;
  status: "Planejado" | "Em andamento" | "Concluído";
  model: string;
}

export interface Mesociclo {
  id: string;
  name: string;
  objective: string;
  weeks: number;
  volumePlanejado: string; // e.g. "12-15 séries/grupo"
  intensidadeMedia: number; // %
  estrategias: string; // e.g. "Drop-set, Rest-Pause"
  deload: boolean;
}

export interface MicroExercise {
  name: string;
  sets: number;
  reps: string;
  load: number; // kg
  rpe: number; // 1-10
  rir: number; // reps in reserve
  rest: string; // resting time e.g. "90s"
  notes?: string;
  muscleGroup: string;
  day?: string; // e.g. "Treino A", "Treino B"
}

export interface Microciclo {
  weekIndex: number; // 1-indexed overall macrocycle week
  mesocycleId: string;
  division: string; // e.g. "ABC", "AB", "ABCD"
  customDivisionText?: string;
  weeklyVolume: number; // aggregate sets target
  fatigue: number; // predicted fatigue index (1-10)
  recovery: number; // predicted recovery index (1-10)
  notes: string;
  exercises: MicroExercise[];
}

export interface PeriodizationData {
  studentId: string;
  macrociclo: Macrociclo;
  mesociclos: Mesociclo[];
  microciclos: Microciclo[];
  isAuditApproved?: boolean;
  clinicalDossier?: {
    etapa1Analise?: string;
    etapa2Periodizacao?: string;
    etapa3Parametros?: string;
    etapa4Selecao?: string;
    etapa5Progressão?: string;
    etapa6Adaptacao?: string;
  };
  metrics?: {
    height?: number;
    weight?: number;
    fatPercent?: number;
    muscleMass?: number;
    freq?: string;
    duration?: string;
    avoid?: string;
    preferences?: string;
    equip?: string;
    postural?: string;
    history?: string;
    recovery?: string;
    sleep?: string;
    stress?: string;
    adherence?: string;
    references?: string;
    priorityMuscles?: string;
    maintenanceMuscles?: string;
    division?: string;
    customDivisionText?: string;
  };
  lastUpdated: string;
}

const getDivisionDisplay = (div: string) => {
  if (div === "ABC" || div === "📐 ABC Tradicional") return "📐 ABC Tradicional";
  if (div === "AB" || div === "⚖️ Superior / Inferior") return "⚖️ Superior / Inferior";
  if (div === "ABCD") return "⚡ ABCD Especialização";
  if (div === "ABCDE" || div === "⚡ ABCDE Avançado") return "⚡ ABCDE Avançado";
  if (div === "Fullbody" || div === "🌍 Corpo Inteiro") return "🌍 Corpo Inteiro";
  if (div === "🔁 Empurrar / Puxar / Pernas") return "🔁 Empurrar / Puxar / Pernas";
  if (div === "🏆 Arnold Split") return "🏆 Arnold Split";
  if (div === "🛠️ Personalizada") return "🛠️ Personalizada";
  return div || "📐 ABC Tradicional";
};

interface PeriodizacaoCientificaProps {
  activeStudentId: string | null;
  studentName?: string;
  studentAge?: string | number;
  studentGender?: string;
  studentObjective?: string;
  studentLimitations?: string;
  studentPhase?: string;
  onSaveWorkout?: (studentId: string, name: string, exercises: Exercise[]) => void;
}

// Default presets according to selected model
const getPresetPeriodization = (
  model: string,
  objective: string = "Hipertrofia"
): { mesociclos: Mesociclo[]; microciclos: Microciclo[] } => {
  const plan = buildPeriodizationPlan({
    frequency: "5 dias por semana",
    duration: "60 minutos",
    model,
    objective,
    references: "Diretrizes de Brad Schoenfeld e Mike Israetel",
    priorityMuscles: "Peitoral, Costas",
    maintenanceMuscles: "Panturrilhas",
    division: "⚡ ABCD Especialização"
  });

  return {
    mesociclos: plan.mesociclos as Mesociclo[],
    microciclos: plan.microciclos as Microciclo[]
  };
};

export default function PeriodizacaoCientifica({
  activeStudentId,
  studentName = "Aluno",
  studentAge,
  studentGender,
  studentObjective,
  studentLimitations,
  studentPhase,
  onSaveWorkout
}: PeriodizacaoCientificaProps) {
  
  // State
  const [loading, setLoading] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [saveStatus, setSaveStatus] = useState<"clean" | "unsaved" | "saved">("clean");
  
  const [modelSelected, setModelSelected] = useState<string>("Periodização Linear");
  const [macrociclo, setMacrociclo] = useState<Macrociclo>({
    id: "macro-1",
    name: "Macrociclo de Desenvolvimento Integrado",
    objective: studentObjective || "Hipertrofia Miofibrilar e Estética",
    durationMonths: 6,
    startDate: new Date().toISOString().split("T")[0],
    endDate: new Date(Date.now() + 6 * 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    notes: "Planejamento estruturado cientificamente para ganho de massa magra de alta qualidade, respeitando os tetos metabólicos de MEV/MRV de Mike Israetel.",
    status: "Em andamento",
    model: "Periodização Linear"
  });

  const [mesociclos, setMesociclos] = useState<Mesociclo[]>([]);
  const [microciclos, setMicrociclos] = useState<Microciclo[]>([]);
  const [activeMesoIdx, setActiveMesoIdx] = useState<number>(0);
  const [activeWeekIdx, setActiveWeekIdx] = useState<number>(0);
  
  // 15 Bio-clinical States for Etapa 1
  const [studHeight, setStudHeight] = useState<number>(175);
  const [studWeight, setStudWeight] = useState<number>(76);
  const [studFatPercent, setStudFatPercent] = useState<number>(14);
  const [studMuscleMass, setStudMuscleMass] = useState<number>(35);
  const [studFreq, setStudFreq] = useState<string>("5 dias por semana");
  const [studDuration, setStudDuration] = useState<string>("60 minutos");
  const [studAvoid, setStudAvoid] = useState<string>("Exercícios com compressão axial excessiva (ex: agachamento costas pesado)");
  const [studPreferences, setStudPreferences] = useState<string>("Gosta de focar em peitoral/costas. Prefere halteres e cabos.");
  const [studEquip, setStudEquip] = useState<string>("Academia comercial completa (peso livre, polia, máquinas articuladas)");
  const [studPostural, setStudPostural] = useState<string>("Leve hipercifose torácica e protração de ombros");
  const [studHistory, setStudHistory] = useState<string>("1.5 anos de treino contínuo, boa execução de supino e terra");
  const [studRecovery, setStudRecovery] = useState<string>("Boa capacidade de recuperação de quadríceps, mais lenta para dorsais");
  const [studSleep, setStudSleep] = useState<string>("7 horas por noite, sono de boa qualidade");
  const [studStress, setStudStress] = useState<string>("Moderado (trabalha na área de tecnologia)");
  const [studAdherence, setStudAdherence] = useState<string>("Altíssima (frequenta regularmente sem faltas)");

  // Opções de escolha do professor
  const [studReferences, setStudReferences] = useState<string>("Diretrizes de Brad Schoenfeld (2020), Mike Israetel (MEV/MRV)");
  const [studPriorityMuscles, setStudPriorityMuscles] = useState<string>("Peitoral, Dorsal, Deltoide Lateral");
  const [studMaintenanceMuscles, setStudMaintenanceMuscles] = useState<string>("Quadríceps, Panturrilhas");
  const [studDivision, setStudDivision] = useState<string>("📐 ABC Tradicional");
  const [studCustomDivisionText, setStudCustomDivisionText] = useState<string>("");
  const [isAuditApproved, setIsAuditApproved] = useState<boolean>(false);
  const [auditLog, setAuditLog] = useState<string[]>([]);

  const [showAdmissionPanel, setShowAdmissionPanel] = useState<boolean>(false);
  const [showSetupWizard, setShowSetupWizard] = useState<boolean>(false);
  const [wizardRegenerate, setWizardRegenerate] = useState<boolean>(false);
  const [clinicalDossier, setClinicalDossier] = useState<{
    etapa1Analise?: string;
    etapa2Periodizacao?: string;
    etapa3Parametros?: string;
    etapa4Selecao?: string;
    etapa5Progressão?: string;
    etapa6Adaptacao?: string;
  } | null>(null);

  const [activeDossierTab, setActiveDossierTab] = useState<number>(1);
  const [isRecalculating, setIsRecalculating] = useState<boolean>(false);
  const [activeDayTab, setActiveDayTab] = useState<string>("Treino A");
  const [isDivisionDropdownOpen, setIsDivisionDropdownOpen] = useState<boolean>(false);

  // AI State
  const [aiPrompt, setAiPrompt] = useState<string>("");
  const [aiResponse, setAiResponse] = useState<string>("");
  const [isAiGenerating, setIsAiGenerating] = useState<boolean>(false);
  const [isAiGeneratingDirect, setIsAiGeneratingDirect] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showAiModal, setShowAiModal] = useState<boolean>(false);
  const [copilotSummary, setCopilotSummary] = useState<string>("");

  const initialStrategyEffectRef = useRef(true);
  const skipAutoGenerationRef = useRef(true);
  const currentObjective = macrociclo.objective || studentObjective || "Hipertrofia";
  const recoveryScore = useMemo(() => {
    let score = 80;
    const sleepLower = (studSleep || "").toLowerCase();
    const stressLower = (studStress || "").toLowerCase();
    const adherenceLower = (studAdherence || "").toLowerCase();

    if (sleepLower.includes("restrita") || sleepLower.includes("insônia")) score -= 15;
    if (sleepLower.includes("excelente") || sleepLower.includes("7-8h")) score += 10;
    if (stressLower.includes("elevado") || stressLower.includes("alto")) score -= 10;
    if (adherenceLower.includes("altíssima") || adherenceLower.includes("atleta")) score += 5;

    return Math.min(98, Math.max(40, score));
  }, [studSleep, studStress, studAdherence]);

  // Load from Firebase / Offline Local Cache
  useEffect(() => {
    if (!activeStudentId) return;

    skipAutoGenerationRef.current = true;

    const loadPeriodization = async () => {
      setLoading(true);
      let localLoaded = false;
      
      try {
        // 1. Try reading from localStorage first (offline-first architecture)
        const localKey = `treinopro_periodization_${activeStudentId}`;
        const localData = localStorage.getItem(localKey);
        
        if (localData) {
          try {
            const data = JSON.parse(localData) as PeriodizationData;
            setMacrociclo(data.macrociclo);
            setMesociclos(data.mesociclos || []);
            setMicrociclos(data.microciclos || []);
            setModelSelected(data.macrociclo.model || "Periodização Linear");
            setIsAuditApproved(data.isAuditApproved || false);
            if (data.clinicalDossier) {
              setClinicalDossier(data.clinicalDossier);
            } else {
              setClinicalDossier(null);
            }
            if (data.metrics) {
              setStudHeight(data.metrics.height ?? 175);
              setStudWeight(data.metrics.weight ?? 76);
              setStudFatPercent(data.metrics.fatPercent ?? 14);
              setStudMuscleMass(data.metrics.muscleMass ?? 35);
              setStudFreq(data.metrics.freq ?? "5 dias por semana");
              setStudDuration(data.metrics.duration ?? "60 minutos");
              setStudAvoid(data.metrics.avoid ?? "Exercícios com compressão axial excessiva (ex: agachamento costas pesado)");
              setStudPreferences(data.metrics.preferences ?? "Gosta de focar em peitoral/costas. Prefere halteres e cabos.");
              setStudEquip(data.metrics.equip ?? "Academia comercial completa (peso livre, polia, máquinas articuladas)");
              setStudPostural(data.metrics.postural ?? "Leve hipercifose torácica e protração de ombros");
              setStudHistory(data.metrics.history ?? "1.5 anos de treino contínuo, boa execução de supino e terra");
              setStudRecovery(data.metrics.recovery ?? "Boa capacidade de recuperação de quadríceps, mais lenta para dorsais");
              setStudSleep(data.metrics.sleep ?? "7 horas por noite, sono de boa qualidade");
              setStudStress(data.metrics.stress ?? "Moderado (trabalha na área de tecnologia)");
              setStudAdherence(data.metrics.adherence ?? "Altíssima (frequenta regularmente sem faltas)");
              setStudReferences(data.metrics.references ?? "Diretrizes de Brad Schoenfeld (2020), Mike Israetel (MEV/MRV)");
              setStudPriorityMuscles(data.metrics.priorityMuscles ?? "Peitoral, Dorsal, Deltoide Lateral");
              setStudMaintenanceMuscles(data.metrics.maintenanceMuscles ?? "Quadríceps, Panturrilhas");
              setStudDivision(data.metrics.division ?? "📐 ABC Tradicional");
              setStudCustomDivisionText(data.metrics.customDivisionText ?? "");
            }
            setSaveStatus("clean");
            setWizardRegenerate(false);
            setShowSetupWizard(false);
            localLoaded = true;
          } catch (e) {
            console.warn("[Periodização] Corrupted local storage data. Clearing fallback.", e);
          }
        }

        // 2. If signed in, fetch the remote source of truth from Firebase
        if (auth?.currentUser) {
          try {
            const docRef = doc(db, "periodizations", activeStudentId);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
              const data = docSnap.data() as PeriodizationData;
              
              // Cache to local storage
              localStorage.setItem(localKey, JSON.stringify(data));
              
              setMacrociclo(data.macrociclo);
              setMesociclos(data.mesociclos || []);
              setMicrociclos(data.microciclos || []);
              setModelSelected(data.macrociclo.model || "Periodização Linear");
              setIsAuditApproved(data.isAuditApproved || false);
              if (data.clinicalDossier) {
                setClinicalDossier(data.clinicalDossier);
              } else {
                setClinicalDossier(null);
              }
              if (data.metrics) {
                setStudHeight(data.metrics.height ?? 175);
                setStudWeight(data.metrics.weight ?? 76);
                setStudFatPercent(data.metrics.fatPercent ?? 14);
                setStudMuscleMass(data.metrics.muscleMass ?? 35);
                setStudFreq(data.metrics.freq ?? "5 dias por semana");
                setStudDuration(data.metrics.duration ?? "60 minutos");
                setStudAvoid(data.metrics.avoid ?? "Exercícios com compressão axial excessiva (ex: agachamento costas pesado)");
                setStudPreferences(data.metrics.preferences ?? "Gosta de focar em peitoral/costas. Prefere halteres e cabos.");
                setStudEquip(data.metrics.equip ?? "Academia comercial completa (peso livre, polia, máquinas articuladas)");
                setStudPostural(data.metrics.postural ?? "Leve hipercifose torácica e protração de ombros");
                setStudHistory(data.metrics.history ?? "1.5 anos de treino contínuo, boa execução de supino e terra");
                setStudRecovery(data.metrics.recovery ?? "Boa capacidade de recuperação de quadríceps, mais lenta para dorsais");
                setStudSleep(data.metrics.sleep ?? "7 horas por noite, sono de boa qualidade");
                setStudStress(data.metrics.stress ?? "Moderado (trabalha na área de tecnologia)");
                setStudAdherence(data.metrics.adherence ?? "Altíssima (frequenta regularmente sem faltas)");
                setStudReferences(data.metrics.references ?? "Diretrizes de Brad Schoenfeld (2020), Mike Israetel (MEV/MRV)");
                setStudPriorityMuscles(data.metrics.priorityMuscles ?? "Peitoral, Dorsal, Deltoide Lateral");
                setStudMaintenanceMuscles(data.metrics.maintenanceMuscles ?? "Quadríceps, Panturrilhas");
                setStudDivision(data.metrics.division ?? "📐 ABC Tradicional");
                setStudCustomDivisionText(data.metrics.customDivisionText ?? "");
              }
              setSaveStatus("clean");
              setWizardRegenerate(false);
              setShowSetupWizard(false);
            } else if (!localLoaded) {
              // Document does not exist on remote and not loaded locally - load preset defaults
              const preset = getPresetPeriodization("Periodização Linear", studentObjective);
              setMesociclos(preset.mesociclos);
              setMicrociclos(preset.microciclos);
              setMacrociclo(prev => ({
                ...prev,
                objective: studentObjective || "Hipertrofia Estética",
                model: "Periodização Linear"
              }));
              setClinicalDossier(null);
              setSaveStatus("unsaved");
              setWizardRegenerate(true);
              setShowSetupWizard(false);
            }
          } catch (firebaseErr: any) {
            console.warn("[Periodização] Remote Firebase read failed, relying on local cache:", firebaseErr);
            // If the failure was due to lack of permission, report the diagnostic error
            const errMsg = String(firebaseErr?.message || firebaseErr).toLowerCase();
            if (errMsg.includes("permission") || errMsg.includes("insufficient")) {
              try {
                handleFirestoreError(firebaseErr, OperationType.GET, `periodizations/${activeStudentId}`);
              } catch (reportedErr) {
                // Propagate or print the standard error
                console.error("[Periodização] Handled Firestore error details:", reportedErr);
              }
            }
            
            if (!localLoaded) {
              // If local not loaded, fall back to presets so UI is not blank
              const preset = getPresetPeriodization("Periodização Linear", studentObjective);
              setMesociclos(preset.mesociclos);
              setMicrociclos(preset.microciclos);
              setMacrociclo(prev => ({
                ...prev,
                objective: studentObjective || "Hipertrofia Estética",
                model: "Periodização Linear"
              }));
              setClinicalDossier(null);
              setSaveStatus("unsaved");
              setWizardRegenerate(true);
              setShowSetupWizard(false);
            }
          }
        } else if (!localLoaded) {
          // Offline/Guest with no cached data - load presets
          const preset = getPresetPeriodization("Periodização Linear", studentObjective);
          setMesociclos(preset.mesociclos);
          setMicrociclos(preset.microciclos);
          setMacrociclo(prev => ({
            ...prev,
            objective: studentObjective || "Hipertrofia Estética",
            model: "Periodização Linear"
          }));
          setClinicalDossier(null);
          setSaveStatus("unsaved");
          setWizardRegenerate(true);
          setShowSetupWizard(false);
        }
      } catch (err) {
        console.error("Failed to load periodization:", err);
      } finally {
        setLoading(false);
        setTimeout(() => {
          skipAutoGenerationRef.current = false;
        }, 300);
      }
    };

    loadPeriodization();
  }, [activeStudentId, studentObjective]);

  useEffect(() => {
    if (loading || skipAutoGenerationRef.current) {
      return;
    }

    const generatedPlan = auditAndAutoHeal(
      buildPeriodizationPlan({
        frequency: studFreq,
        duration: studDuration,
        model: modelSelected,
        objective: currentObjective,
        references: studReferences,
        priorityMuscles: studPriorityMuscles,
        maintenanceMuscles: studMaintenanceMuscles,
        division: studDivision
      }),
      {
        avoid: studAvoid,
        sleep: studSleep,
        stress: studStress,
        recoveryScore
      }
    );

    setMacrociclo(generatedPlan.macrociclo as Macrociclo);
    setMesociclos(generatedPlan.mesociclos as Mesociclo[]);
    setMicrociclos(generatedPlan.microciclos as Microciclo[]);
    setAuditLog(generatedPlan.auditLog || []);
    setIsAuditApproved((generatedPlan.auditLog || []).length === 0);
    setActiveMesoIdx(0);
    setActiveWeekIdx(0);
    setSaveStatus("unsaved");
  }, [studFreq, studDuration, modelSelected, currentObjective, studReferences, studPriorityMuscles, studMaintenanceMuscles, studDivision]);

  // Unified Real-Time Clinical Sync (Single Source of Truth)
  useEffect(() => {
    if (!activeStudentId) return;

    const syncClinicalContext = () => {
      let syncedHeight = 175;
      let syncedWeight = 76;
      let syncedFatPercent = 14;
      let syncedMuscleMass = 35;
      let syncedPostural = "Leve hipercifose torácica e protração de ombros";
      let syncedSleep = "7 horas por noite, sono de boa qualidade";
      let syncedStress = "Moderado (trabalha na área de tecnologia)";
      let syncedAdherence = "Altíssima (frequenta regularmente sem faltas)";
      let syncedHistory = "1.5 anos de treino contínuo, boa execução de supino e terra";
      let syncedAvoid = "Exercícios com compressão axial excessiva (ex: agachamento costas pesado)";

      let pains = "";
      let diseases = "";

      try {
        const savedPhysical = localStorage.getItem(`coach_physical_evaluations_${activeStudentId}`);
        if (savedPhysical) {
          const parsed = JSON.parse(savedPhysical);
          if (Array.isArray(parsed) && parsed.length > 0) {
            const latest = [...parsed].sort((a: any, b: any) => {
              const dateA = a.date ? new Date(a.date).getTime() : 0;
              const dateB = b.date ? new Date(b.date).getTime() : 0;
              return dateB - dateA;
            })[0];

            if (latest) {
              syncedWeight = parseFloat(latest.weight || latest.peso || syncedWeight);
              syncedHeight = parseInt(latest.height || latest.altura || syncedHeight);
              syncedFatPercent = parseFloat(latest.fatPercent || latest.bf || latest.percentualGordura || syncedFatPercent);
              if (latest.muscleMass || latest.massaMagra) {
                syncedMuscleMass = parseFloat(latest.muscleMass || latest.massaMagra);
              } else {
                syncedMuscleMass = parseFloat((syncedWeight * (1 - syncedFatPercent / 100)).toFixed(1));
              }
            }
          }
        }
      } catch (e) {
        console.warn("Failed to sync physical evaluation from localStorage:", e);
      }

      try {
        const savedAnamnese = localStorage.getItem(`anamnese_${activeStudentId}`);
        if (savedAnamnese) {
          const parsed = JSON.parse(savedAnamnese);
          pains = parsed.lesoesDores || parsed.pains || "";
          diseases = parsed.doencasCronicas || parsed.diseases || "";

          if (parsed.sleepAnswers && Array.isArray(parsed.sleepAnswers)) {
            const badSleepCount = parsed.sleepAnswers.filter((a: boolean) => a).length;
            syncedSleep = badSleepCount > 4
              ? "Qualidade de sono restrita / insônia intermitente relatada"
              : badSleepCount > 1
                ? "Sono razoável, 6-7 horas com pequenos despertares"
                : "Sono excelente de 7-8h restaurador e reparador";
          } else if (parsed.sono) {
            syncedSleep = parsed.sono;
          }

          if (parsed.mhaActivity) {
            const stressLevel = parsed.mhaActivity === 3 ? "Elevado" : parsed.mhaActivity === 2 ? "Moderado" : "Controlado";
            syncedStress = `${stressLevel} (${parsed.etnia || "Trabalho ativo"})`;
          }

          syncedAdherence = parsed.condicaoFisica === "Avançado"
            ? "Altíssima aderência (atleta experiente consistente)"
            : "Aderência regular em construção e engajamento";

          const parts = [] as string[];
          if (parsed.medicamentos) parts.push(`Uso de medicamentos: ${parsed.medicamentos}`);
          if (parsed.cirurgias) parts.push(`Cirurgias prévias: ${parsed.cirurgias}`);
          if (diseases) parts.push(`Condições clínicas: ${diseases}`);
          if (parts.length > 0) {
            syncedHistory = parts.join(". ");
          }
        }
      } catch (e) {
        console.warn("Failed to sync clinical anamnese from localStorage:", e);
      }

      try {
        const savedPostural = localStorage.getItem(`treinopro_postural_evaluations_${activeStudentId}`);
        if (savedPostural) {
          const parsed = JSON.parse(savedPostural);
          if (Array.isArray(parsed) && parsed.length > 0) {
            const latest = [...parsed].sort((a: any, b: any) => {
              const tA = a.timestamp || 0;
              const tB = b.timestamp || 0;
              return tB - tA;
            })[0];
            if (latest && (latest.aiReport || latest.analysis)) {
              syncedPostural = latest.aiReport || latest.analysis;
            }
          }
        }
      } catch (e) {
        console.warn("Failed to sync postural evaluation from localStorage:", e);
      }

      const avoids: string[] = [];
      const textToAnalyze = `${pains} ${syncedPostural} ${studentLimitations || ""}`.toLowerCase();

      if (textToAnalyze.includes("ombro") || textToAnalyze.includes("manguito") || textToAnalyze.includes("escapula")) {
        avoids.push("Desenvolvimento por trás com barra", "Supino reto com barra livre pesada em amplitude total", "Remada alta com barra pegada fechada");
      }
      if (textToAnalyze.includes("lombar") || textToAnalyze.includes("cifose") || textToAnalyze.includes("hernia") || textToAnalyze.includes("espondilo")) {
        avoids.push("Agachamento costas livre pesado com barra", "Levantamento terra convencional pesado", "Remada curvada livre com barra");
      }
      if (textToAnalyze.includes("joelho") || textToAnalyze.includes("patela") || textToAnalyze.includes("menisco") || textToAnalyze.includes("condromalacia")) {
        avoids.push("Cadeira extensora (fase final de extensão com cargas limite)", "Agachamento profundo com alta compressão patelar");
      }
      if (textToAnalyze.includes("punho") || textToAnalyze.includes("cotovelo") || textToAnalyze.includes("tendinite")) {
        avoids.push("Rosca direta com barra reta livre", "Tríceps testa com barra reta");
      }
      if (studentLimitations && studentLimitations !== "Nenhuma") {
        avoids.push(studentLimitations);
      }

      syncedAvoid = avoids.length > 0
        ? avoids.join(", ")
        : "Sem contraindicações específicas identificadas. Manter biomecânica e cadência controladas.";

      setStudHeight(syncedHeight);
      setStudWeight(syncedWeight);
      setStudFatPercent(syncedFatPercent);
      setStudMuscleMass(syncedMuscleMass);
      setStudPostural(syncedPostural.length > 100 ? `${syncedPostural.substring(0, 100)}...` : syncedPostural);
      setStudSleep(syncedSleep);
      setStudStress(syncedStress);
      setStudAdherence(syncedAdherence);
      setStudHistory(syncedHistory.length > 150 ? `${syncedHistory.substring(0, 150)}...` : syncedHistory);
      setStudAvoid(syncedAvoid);
    };

    syncClinicalContext();
    const intervalId = window.setInterval(syncClinicalContext, 2000);
    const handleStorage = (event: StorageEvent) => {
      if (!event.key) return;
      if (event.key.includes(activeStudentId)) {
        syncClinicalContext();
      }
    };
    const handleFocus = () => syncClinicalContext();

    window.addEventListener("storage", handleStorage);
    window.addEventListener("focus", handleFocus);

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("focus", handleFocus);
    };
  }, [activeStudentId, studentLimitations]);

  // Handle preset reset when model changes
  const handleModelChange = (model: string) => {
    setModelSelected(model);
    setMacrociclo(prev => ({
      ...prev,
      model,
      objective: prev.objective || studentObjective || "Hipertrofia"
    }));
    setActiveMesoIdx(0);
    setActiveWeekIdx(0);
    setSaveStatus("unsaved");
  };

  // Save to Firebase / Offline Local Cache
  const handleSave = async () => {
    if (!activeStudentId) return;
    setSaving(true);
    try {
      const data: PeriodizationData = {
        studentId: activeStudentId,
        macrociclo,
        mesociclos,
        microciclos,
        isAuditApproved,
        clinicalDossier: clinicalDossier || undefined,
        metrics: {
          height: studHeight,
          weight: studWeight,
          fatPercent: studFatPercent,
          muscleMass: studMuscleMass,
          freq: studFreq,
          duration: studDuration,
          avoid: studAvoid,
          preferences: studPreferences,
          equip: studEquip,
          postural: studPostural,
          history: studHistory,
          recovery: studRecovery,
          sleep: studSleep,
          stress: studStress,
          adherence: studAdherence,
          references: studReferences,
          priorityMuscles: studPriorityMuscles,
          maintenanceMuscles: studMaintenanceMuscles,
          division: studDivision,
          customDivisionText: studCustomDivisionText
        },
        lastUpdated: new Date().toISOString()
      };

      // 1. Always save to local storage (offline-first architecture)
      const localKey = `treinopro_periodization_${activeStudentId}`;
      localStorage.setItem(localKey, JSON.stringify(data));

      // 2. If authenticated, save to Firestore
      if (auth?.currentUser) {
        try {
          const docRef = doc(db, "periodizations", activeStudentId);
          await setDoc(docRef, data);
        } catch (firebaseErr: any) {
          console.error("[Periodização] Remote Firebase save failed:", firebaseErr);
          const errMsg = String(firebaseErr?.message || firebaseErr).toLowerCase();
          if (errMsg.includes("permission") || errMsg.includes("insufficient")) {
            try {
              handleFirestoreError(firebaseErr, OperationType.WRITE, `periodizations/${activeStudentId}`);
            } catch (reportedErr) {
              console.error("[Periodização] Handled Firestore error details:", reportedErr);
            }
          }
        }
      } else {
        console.log("[Periodização] Offline mode. Saved periodization locally.");
      }

      // 3. Sync current active week's exercises to standard student sheet & student app!
      if (onSaveWorkout && activeStudentId) {
        const activeMeso = mesociclos[activeMesoIdx] || null;
        const activeMesoWeeks = microciclos.filter(m => m.mesocycleId === activeMeso?.id);
        const currentWeek = activeMesoWeeks[activeWeekIdx];
        if (currentWeek && currentWeek.exercises && currentWeek.exercises.length > 0) {
          const mappedExs: Exercise[] = currentWeek.exercises.map((microEx, idx) => {
            const cleanDay = microEx.day ? microEx.day.replace("Treino ", "").trim().toUpperCase() : "A";
            return {
              id: `ex-period-${activeStudentId}-${idx}-${Date.now()}`,
              name: microEx.name,
              sets: microEx.sets,
              reps: microEx.reps,
              weight: microEx.load,
              notes: microEx.notes || `RPE: ${microEx.rpe} | RIR: ${microEx.rir} | Intervalo: ${microEx.rest}`,
              category: "musculacao",
              division: cleanDay,
              muscleGroup: microEx.muscleGroup
            };
          });
          const sheetName = `Periodização: ${activeMeso?.name || "Geral"} - Semana ${currentWeek.weekIndex}`;
          onSaveWorkout(activeStudentId, sheetName, mappedExs);
        }
      }

      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("clean"), 2500);
    } catch (err) {
      console.error("Failed to save periodization:", err);
      // Fallback: still show as saved locally so user experience is not degraded
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("clean"), 2500);
    } finally {
      setSaving(false);
    }
  };

  // Reorder Mesocycles
  const moveMesocycle = (index: number, direction: "up" | "down") => {
    if (direction === "up" && index === 0) return;
    if (direction === "down" && index === mesociclos.length - 1) return;

    const targetIdx = direction === "up" ? index - 1 : index + 1;
    const newMesos = [...mesociclos];
    const temp = newMesos[index];
    newMesos[index] = newMesos[targetIdx];
    newMesos[targetIdx] = temp;

    setMesociclos(newMesos);
    setSaveStatus("unsaved");
  };

  // Update specific fields
  const handleUpdateMeso = (index: number, fields: Partial<Mesociclo>) => {
    const updated = [...mesociclos];
    updated[index] = { ...updated[index], ...fields };
    setMesociclos(updated);
    setSaveStatus("unsaved");
  };

  const handleUpdateMicro = (weekIdx: number, fields: Partial<Microciclo>) => {
    const updated = [...microciclos];
    const matchIdx = updated.findIndex(m => m.weekIndex === weekIdx);
    if (matchIdx !== -1) {
      updated[matchIdx] = { ...updated[matchIdx], ...fields };
      setMicrociclos(updated);
      setSaveStatus("unsaved");
    }
  };

  const handleUpdateExercise = (weekIdx: number, exIdx: number, fields: Partial<MicroExercise>) => {
    const updated = [...microciclos];
    const matchIdx = updated.findIndex(m => m.weekIndex === weekIdx);
    if (matchIdx !== -1) {
      const exs = [...updated[matchIdx].exercises];
      exs[exIdx] = { ...exs[exIdx], ...fields };
      updated[matchIdx].exercises = exs;
      setMicrociclos(updated);
      setSaveStatus("unsaved");
    }
  };

  // Generate scientific Supercompensation data for charting
  const chartData = useMemo(() => {
    return microciclos.map(m => {
      const meso = mesociclos.find(c => c.id === m.mesocycleId);
      return {
        semana: `S${m.weekIndex}`,
        volume: m.weeklyVolume,
        fadiga: m.fatigue,
        recuperacao: m.recovery,
        intensidade: meso ? meso.intensidadeMedia : 70
      };
    });
  }, [microciclos, mesociclos]);

  const handleAutoHeal = () => {
    const healedPlan = auditAndAutoHeal(
      {
        macrociclo,
        mesociclos,
        microciclos
      },
      {
        avoid: studAvoid,
        sleep: studSleep,
        stress: studStress,
        recoveryScore
      }
    );

    setMesociclos(healedPlan.mesociclos as Mesociclo[]);
    setMicrociclos(healedPlan.microciclos as Microciclo[]);
    setAuditLog(healedPlan.auditLog || []);
    setIsAuditApproved(true);
    setSaveStatus("unsaved");
    setSuccessMessage("Auditoria aplicada pela Engine Central de Prescrição.");
  };

  // AI Prompt Call triggers
  const handleTriggerAI = async (promptType: "suggest" | "adjust_limitations" | "plateau" | "fatigue" | "custom") => {
    setIsAiGenerating(true);
    setShowAiModal(true);
    setAiResponse("");

    let customPrompt = "";
    if (promptType === "suggest") {
      customPrompt = `Sugerir uma periodização científica ideal para o aluno:
- Nome: ${studentName}
- Idade: ${studentAge || "Não informada"}
- Gênero: ${studentGender || "Não informado"}
- Objetivo: ${studentObjective || "Hipertrofia Geral"}
- Limitações: ${studentLimitations || "Nenhuma"}
- Fase Atual: ${studentPhase || "Intermediário"}
Monte uma sequência inteligente de mesociclos e semanas com volume, intensidade e fadiga baseados na ciência moderna.`;
    } else if (promptType === "adjust_limitations") {
      customPrompt = `O aluno ${studentName} está retornando de uma pausa/lesão ou tem limitações de quadril/ombro (${studentLimitations || "Sem limitações descritas"}). 
Ajuste a periodização atual para iniciar com menor impacto mecânico e regeneração nas primeiras semanas.`;
    } else if (promptType === "plateau") {
      customPrompt = `O aluno está enfrentando um platô de força ou volume no Supino e no Agachamento. 
Proponha ajustes de intensidade média, semanas de choque ou uma quebra de homeostase dinâmica.`;
    } else if (promptType === "fatigue") {
      customPrompt = `Fadiga sistêmica excessiva detectada na semana atual. 
Insira uma recomendação imediata de Deload na próxima semana e reduza o volume em 50% enquanto recalcula a curva de fadiga articular.`;
    } else if (promptType === "custom") {
      customPrompt = `Instrução customizada do professor: "${aiPrompt}".
Por favor, ajuste, explique ou recalcule o planejamento de periodização e treinos de acordo com essa instrução, respeitando rigorosamente a saúde fisiológica do aluno.`;
    }

    try {
      // Fetch server API for AI Periodization
      const response = await fetch("/api/generate-periodization", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          prompt: customPrompt,
          studentName,
          studentObjective,
          studentLimitations,
          periodizationModel: modelSelected,
          mesociclos,
          microciclos,
          metrics: {
            height: studHeight,
            weight: studWeight,
            fatPercent: studFatPercent,
            muscleMass: studMuscleMass,
            freq: studFreq,
            duration: studDuration,
            avoid: studAvoid,
            preferences: studPreferences,
            equip: studEquip,
            postural: studPostural,
            history: studHistory,
            recovery: studRecovery,
            sleep: studSleep,
            stress: studStress,
            adherence: studAdherence,
            references: studReferences,
            priorityMuscles: studPriorityMuscles,
            maintenanceMuscles: studMaintenanceMuscles,
            division: studDivision,
            customDivisionText: studCustomDivisionText
          }
        })
      });

      if (response.ok) {
        const data = await response.json();
        const explanation = data.explanation || "A Engine Central de Prescrição analisou o plano e está disponibilizando uma interpretação técnica.";
        setAiResponse(explanation);
        setCopilotSummary(explanation);
      } else {
        throw new Error("API call failed, falling back to algorithmic AI model");
      }
    } catch (err) {
      console.warn("AI Generation fell back to programmatic heuristics:", err);
      // Generate heuristic AI recommendation
      setTimeout(() => {
        const interpretation = buildCopilotInterpretation(
          {
            macrociclo,
            mesociclos,
            microciclos
          },
          {
            avoid: studAvoid,
            sleep: studSleep,
            stress: studStress,
            recoveryScore
          },
          `Por que este modelo foi escolhido?`
        );
        const explanation = `${interpretation.summary}\n\nRecomendações:\n- ${interpretation.recommendations.join('\n- ')}\n\nAlertas:\n- ${interpretation.alerts.join('\n- ')}`;

        setAiResponse(explanation);
        setCopilotSummary(explanation);
      }, 1500);
    } finally {
      setIsAiGenerating(false);
    }
  };

  const applyAiPeriodization = () => {
    setShowAiModal(false);
    setSuccessMessage("O Copilot apenas sugere e explica. A Engine Central continua sendo a única responsável por alterar a periodização.");
  };

  const handleGenerateDirectPeriodization = async () => {
    setIsAiGeneratingDirect(true);
    setSuccessMessage(null);
    setAiResponse("");

    try {
      const response = await fetch("/api/generate-periodization", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          studentName,
          studentObjective: studentObjective || "Hipertrofia",
          studentLimitations: studentLimitations || "Nenhuma",
          studentAge: studentAge || "Não informado",
          studentGender: studentGender || "Não informado",
          studentPhase: studentPhase || "Intermediário",
          periodizationModel: modelSelected,
          metrics: {
            height: studHeight,
            weight: studWeight,
            fatPercent: studFatPercent,
            muscleMass: studMuscleMass,
            freq: studFreq,
            duration: studDuration,
            avoid: studAvoid,
            preferences: studPreferences,
            equip: studEquip,
            postural: studPostural,
            history: studHistory,
            recovery: studRecovery,
            sleep: studSleep,
            stress: studStress,
            adherence: studAdherence,
            references: studReferences,
            priorityMuscles: studPriorityMuscles,
            maintenanceMuscles: studMaintenanceMuscles
          }
        })
      });

      if (response.ok) {
        const data = await response.json();
        const explanation = data.explanation || "A Engine Central de Prescrição respondeu com uma interpretação técnica válida.";
        setAiResponse(explanation);
        setCopilotSummary(explanation);
        setSuccessMessage(`✓ O Copilot interpretou o plano de ${studentName} sem alterar diretamente a periodização. A Engine Central continua responsável por qualquer alteração válida.`);
      } else {
        throw new Error("API call failed");
      }
    } catch (err) {
      console.warn("Direct generation failed, using engine-based explanation fallback:", err);
      setAiResponse(`Copilot Técnico — TreinoPro\n\nA Engine Central respondeu com uma explicação técnica baseada no plano ativo. Nenhuma alteração prescritiva foi aplicada diretamente.`);
      setCopilotSummary(`Copilot Técnico — TreinoPro\n\nA Engine Central respondeu com uma explicação técnica baseada no plano ativo. Nenhuma alteração prescritiva foi aplicada diretamente.`);
      setSuccessMessage(`✓ O Copilot explicou o plano de ${studentName} sem assumir a prescrição.`);
    } finally {
      setIsAiGeneratingDirect(false);
    }
  };

  const handleRecalculateSmartAdaptation = async (eventType: string) => {
    setIsRecalculating(true);
    setSuccessMessage(null);
    try {
      const response = await fetch("/api/generate-periodization", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          studentName,
          studentObjective: studentObjective || "Hipertrofia",
          studentLimitations: studentLimitations || "Nenhuma",
          studentAge: studentAge || "Não informado",
          studentGender: studentGender || "Não informado",
          periodizationModel: modelSelected,
          recalculateEvent: eventType,
          mesociclos,
          microciclos,
          metrics: {
            height: studHeight,
            weight: studWeight,
            fatPercent: studFatPercent,
            muscleMass: studMuscleMass,
            freq: studFreq,
            duration: studDuration,
            avoid: studAvoid,
            preferences: studPreferences,
            equip: studEquip,
            postural: studPostural,
            history: studHistory,
            recovery: studRecovery,
            sleep: studSleep,
            stress: studStress,
            adherence: studAdherence,
            references: studReferences,
            priorityMuscles: studPriorityMuscles,
            maintenanceMuscles: studMaintenanceMuscles
          }
        })
      });

      if (response.ok) {
        const data = await response.json();
        const explanation = data.explanation || `A Engine Central avaliou o evento "${eventType}" e devolveu uma interpretação técnica.`;
        setAiResponse(explanation);
        setCopilotSummary(explanation);
        setSuccessMessage(`✓ O Copilot interpretou a intercorrência de "${eventType}" sem substituir as decisões da Engine Central.`);
      }
    } catch (err) {
      console.error("Failed to run Stage 6 smart adaptation:", err);
    } finally {
      setIsRecalculating(false);
    }
  };

  const [isGeneratingWorkout, setIsGeneratingWorkout] = useState<boolean>(false);

  const handleGenerateWorkout = async () => {
    if (!activeStudentId) return;
    const currentWeek = activeMesoWeeks[activeWeekIdx];
    if (!currentWeek) return;
    
    setIsGeneratingWorkout(true);
    setSuccessMessage(null);

    const activeMeso = mesociclos[activeMesoIdx] || null;

    try {
      const response = await fetch("/api/generate-musculacao-workout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          periodizacaoModel: modelSelected,
          activeCycleTitle: activeMeso?.name || "Acúmulo de Volume",
          activeCycleVol: activeMeso?.volumePlanejado || `${currentWeek.weeklyVolume} séries semanais`,
          activeCycleTec: activeMeso?.estrategias || "Progressão de Carga",
          frequenciaSemanal: studFreq,
          selectedDivision: studDivision,
          customDivisionText: studCustomDivisionText,
          studentAge: studentAge,
          studentGender: studentGender,
          studentLimitations: studentLimitations,
          studentObjective: currentObjective,
          studentPhase: studentPhase,
          studentName: studentName,
          copilotRecommendations: copilotSummary || aiResponse || "",
          auditWarnings: auditLog || [],
          studentPostural: studPostural || "",
          studentSleep: studSleep || "",
          studentStress: studStress || ""
        })
      });

      if (!response.ok) {
        throw new Error("API call failed");
      }

      const data = await response.json();
      if (data && Array.isArray(data.workouts)) {
        const mappedExercises: MicroExercise[] = [];
        data.workouts.forEach((wk: any, wkIdx: number) => {
          const dayLetters = ["A", "B", "C", "D", "E", "F"];
          const letter = dayLetters[wkIdx] || String.fromCharCode(65 + wkIdx);
          const dayNameMapped = `Treino ${letter}`;
          
          if (Array.isArray(wk.exercises)) {
            wk.exercises.forEach((ex: any) => {
              mappedExercises.push({
                name: ex.name,
                sets: Number(ex.sets) || 3,
                reps: String(ex.reps || "8-12"),
                load: Number(ex.weight) || 20,
                rpe: 8,
                rir: 2,
                rest: "90s",
                notes: ex.notes || "",
                muscleGroup: ex.muscleGroup || "Geral",
                day: dayNameMapped
              });
            });
          }
        });

        const wkIndex = currentWeek.weekIndex;
        const currentMicros = [...microciclos];
        const idx = currentMicros.findIndex(m => m.weekIndex === wkIndex);
        if (idx !== -1) {
          currentMicros[idx].exercises = mappedExercises;
          setMicrociclos(currentMicros);
          setSaveStatus("unsaved");
          setSuccessMessage(`✓ Treino gerado pela IA com absoluto sucesso para a ${currentWeek.weekIndex}ª semana seguindo as regras de periodização!`);
        }
      }
    } catch (err) {
      console.warn("API direct generation failed, fallback to local algorithmic generator:", err);
      
      const dayLetters = ["A", "B", "C", "D", "E"];
      const fallbackExercises: MicroExercise[] = [];
      const groups = ["Peitoral", "Costas", "Quadríceps", "Isquiotibiais", "Deltoides", "Bíceps", "Tríceps"];
      const exercisesByGroup: Record<string, string[]> = {
        "Peitoral": ["Supino Reto com Halteres", "Supino Inclinado Articulado", "Crossover Polia Média"],
        "Costas": ["Puxada Alta Pronada", "Remada Cavalinho Articulada", "Pulldown na Polia"],
        "Quadríceps": ["Leg Press 45º", "Cadeira Extensora", "Agachamento Búlgaro"],
        "Isquiotibiais": ["Cadeira Flexora", "Mesa Flexora", "Stiff com Halteres"],
        "Deltoides": ["Elevação Lateral com Halteres", "Desenvolvimento com Halteres", "Crucifixo Inverso"],
        "Bíceps": ["Rosca Alternada com Halteres", "Rosca Martelo na Polia"],
        "Tríceps": ["Tríceps Corda na Polia", "Tríceps Testa com Halteres"]
      };

      const daysCount = Math.min(5, parseInt(studFreq) || 4);
      for (let d = 0; d < daysCount; d++) {
        const dayLetter = dayLetters[d];
        const dayLabel = `Treino ${dayLetter}`;
        
        const firstGroup = groups[(d * 2) % groups.length];
        const secondGroup = groups[(d * 2 + 1) % groups.length];
        
        const firstGroupExs = exercisesByGroup[firstGroup] || [];
        const secondGroupExs = exercisesByGroup[secondGroup] || [];
        
        fallbackExercises.push({
          name: "Mobilidade Dinâmica Articular",
          sets: 2,
          reps: "10-12",
          load: 0,
          rpe: 5,
          rir: 5,
          rest: "60s",
          notes: "Aquecimento focado nas articulações envolvidas no dia.",
          muscleGroup: "Geral",
          day: dayLabel
        });

        if (firstGroupExs[0]) {
          fallbackExercises.push({
            name: firstGroupExs[0],
            sets: 4,
            reps: "8-12",
            load: 20,
            rpe: 8,
            rir: 2,
            rest: "90s",
            notes: "Manter controle da fase excêntrica.",
            muscleGroup: firstGroup,
            day: dayLabel
          });
        }
        if (firstGroupExs[1]) {
          fallbackExercises.push({
            name: firstGroupExs[1],
            sets: 3,
            reps: "10-12",
            load: 15,
            rpe: 8,
            rir: 2,
            rest: "90s",
            notes: "Cadência controlada.",
            muscleGroup: firstGroup,
            day: dayLabel
          });
        }

        if (secondGroupExs[0]) {
          fallbackExercises.push({
            name: secondGroupExs[0],
            sets: 4,
            reps: "8-12",
            load: 20,
            rpe: 8,
            rir: 2,
            rest: "90s",
            notes: "Controle biomecânico preciso.",
            muscleGroup: secondGroup,
            day: dayLabel
          });
        }
        if (secondGroupExs[1]) {
          fallbackExercises.push({
            name: secondGroupExs[1],
            sets: 3,
            reps: "10-12",
            load: 15,
            rpe: 8,
            rir: 2,
            rest: "90s",
            notes: "Até a falha técnica.",
            muscleGroup: secondGroup,
            day: dayLabel
          });
        }
      }

      const wkIndex = currentWeek.weekIndex;
      const currentMicros = [...microciclos];
      const idx = currentMicros.findIndex(m => m.weekIndex === wkIndex);
      if (idx !== -1) {
        currentMicros[idx].exercises = fallbackExercises;
        setMicrociclos(currentMicros);
        setSaveStatus("unsaved");
        setSuccessMessage(`✓ Treino inteligente gerado localmente (fallback) para a ${currentWeek.weekIndex}ª semana.`);
      }
    } finally {
      setIsGeneratingWorkout(false);
    }
  };

  if (!activeStudentId) {
    return (
      <div className="glass-panel rounded-xl p-8 text-center text-[#b9cacb] font-mono">
        <Sliders className="w-12 h-12 text-[#00f2ff] mx-auto mb-4 animate-pulse" />
        <h3 className="text-sm font-bold uppercase tracking-wider">Módulo de Periodização Científica</h3>
        <p className="text-xs text-gray-500 mt-2 max-w-md mx-auto leading-relaxed">
          Selecione um aluno na barra lateral para carregar, planejar e acompanhar a sua periodização baseada nos princípios de MEV/MRV de Mike Israetel.
        </p>
      </div>
    );
  }

  const activeMeso = mesociclos[activeMesoIdx] || null;
  const activeMesoWeeks = microciclos.filter(m => m.mesocycleId === activeMeso?.id);

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Dynamic Status Notifications */}
      {successMessage && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-xl text-xs font-mono font-bold flex items-center justify-between animate-fade-in shadow-[0_0_15px_rgba(16,185,129,0.15)]">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-400 shrink-0 animate-bounce" />
            <span>{successMessage}</span>
          </div>
          <button onClick={() => setSuccessMessage(null)} className="text-[#10b981] hover:text-[#00f2ff] font-bold font-mono text-xs cursor-pointer">Fechar</button>
        </div>
      )}

      {saveStatus === "unsaved" && (
        <div className="p-4 bg-amber-500/10 border border-amber-500/30 text-amber-400 rounded-xl text-xs font-mono font-bold flex items-center justify-between animate-fade-in shadow-[0_0_15px_rgba(245,158,11,0.15)]">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 animate-bounce" />
            <span>Alterações pendentes. Salve antes de sair.</span>
          </div>
          <button onClick={handleSave} disabled={saving} className="px-3 py-1 bg-amber-500 text-black text-[10px] font-mono font-extrabold uppercase rounded shadow hover:bg-amber-400 transition-all cursor-pointer">
            {saving ? "Salvando..." : "Salvar Agora"}
          </button>
        </div>
      )}

      {/* Main Header Card */}
      <div className="bg-[#121315] border border-[#3a494b]/20 rounded-xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
        <div className="space-y-1">
          <h2 className="text-base font-extrabold text-white font-sans tracking-tight">
            Central de Periodização Científica — {studentName}
          </h2>
          <p className="text-xs text-gray-400 font-sans leading-relaxed">
            Prescrição contínua, orientada por decisões fisiológicas e de segurança biocomportamental.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 bg-gradient-to-r from-[#00f2ff] to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-black text-xs font-mono font-extrabold uppercase tracking-wider rounded-lg transition-all shadow-md cursor-pointer flex items-center gap-1.5"
          >
            <Save className="w-4 h-4" /> {saving ? "Salvando..." : "Salvar na Nuvem"}
          </button>
        </div>
      </div>

      {/* 8 SEQUENTIAL CLINICAL STAGES */}
      <Etapa1Identificacao
        studentName={studentName}
        studentObjective={studentObjective}
        studentLimitations={studentLimitations}
        studSleep={studSleep}
        studStress={studStress}
        studAdherence={studAdherence}
        activeMesoName={activeMeso?.name}
      />

      <Etapa2Diagnostico
        studHeight={studHeight}
        studWeight={studWeight}
        studFatPercent={studFatPercent}
        studMuscleMass={studMuscleMass}
        studAvoid={studAvoid}
        studPostural={studPostural}
        studHistory={studHistory}
        studRecovery={studRecovery}
        studSleep={studSleep}
        studStress={studStress}
        studAdherence={studAdherence}
        clinicalDossier={clinicalDossier}
      />

      <Etapa3Estrategia
        studFreq={studFreq}
        setStudFreq={setStudFreq}
        studDuration={studDuration}
        setStudDuration={setStudDuration}
        modelSelected={modelSelected}
        setModelSelected={setModelSelected}
        onModelChange={handleModelChange}
        onObjectiveChange={(newObj) => {
          setMacrociclo(prev => ({ ...prev, objective: newObj }));
          const preset = getPresetPeriodization(modelSelected, newObj);
          setMesociclos(preset.mesociclos);
          setMicrociclos(preset.microciclos);
          setIsAuditApproved(false);
          setSaveStatus("unsaved");
        }}
        macrocicloObjective={macrociclo.objective}
        studReferences={studReferences}
        setStudReferences={setStudReferences}
        studPriorityMuscles={studPriorityMuscles}
        setStudPriorityMuscles={setStudPriorityMuscles}
        studMaintenanceMuscles={studMaintenanceMuscles}
        setStudMaintenanceMuscles={setStudMaintenanceMuscles}
        studDivision={studDivision}
        setStudDivision={setStudDivision}
        studCustomDivisionText={studCustomDivisionText}
        setStudCustomDivisionText={setStudCustomDivisionText}
        onStrategicChange={() => {
          setIsAuditApproved(false);
          setSaveStatus("unsaved");
        }}
      />

      <Etapa4Planejamento
        chartData={chartData}
        modelSelected={modelSelected}
        onResetModel={() => {
          handleModelChange(modelSelected);
          setIsAuditApproved(false);
          setSaveStatus("unsaved");
        }}
      />

      <Etapa5Timeline
        mesociclos={mesociclos}
        activeMesoIdx={activeMesoIdx}
        setActiveMesoIdx={setActiveMesoIdx}
        activeMesoWeeks={activeMesoWeeks}
        activeWeekIdx={activeWeekIdx}
        setActiveWeekIdx={setActiveWeekIdx}
        handleUpdateMeso={handleUpdateMeso}
        handleUpdateMicro={handleUpdateMicro}
        onStrategicChange={() => {
          setIsAuditApproved(false);
          setSaveStatus("unsaved");
        }}
        studDuration={studDuration}
        setStudDuration={setStudDuration}
        modelSelected={modelSelected}
        onModelChange={handleModelChange}
        studReferences={studReferences}
        setStudReferences={setStudReferences}
        studDivision={studDivision}
        setStudDivision={setStudDivision}
        studCustomDivisionText={studCustomDivisionText}
        setStudCustomDivisionText={setStudCustomDivisionText}
      />

      <Etapa6Copilot
        onTriggerAI={handleTriggerAI}
        isAiGenerating={isAiGenerating}
        aiPrompt={aiPrompt}
        setAiPrompt={setAiPrompt}
        aiResponse={aiResponse}
        copilotSummary={copilotSummary}
      />

      <Etapa7Auditoria
        studAvoid={studAvoid}
        studSleep={studSleep}
        studStress={studStress}
        activeMesoWeeks={activeMesoWeeks}
        activeWeekIdx={activeWeekIdx}
        isAuditApproved={isAuditApproved}
        setIsAuditApproved={setIsAuditApproved}
        auditLog={auditLog}
        onAutoHeal={handleAutoHeal}
      />

      <Etapa8Construcao
        isAuditApproved={isAuditApproved}
        activeMesoWeeks={activeMesoWeeks}
        activeWeekIdx={activeWeekIdx}
        activeDayTab={activeDayTab}
        setActiveDayTab={setActiveDayTab}
        onGenerateWorkoutWithAI={handleGenerateWorkout}
        isGeneratingWorkoutWithAI={isGeneratingWorkout}
        onAddExercise={() => {
          const wkIndex = activeMesoWeeks[activeWeekIdx].weekIndex;
          const currentMicros = [...microciclos];
          const idx = currentMicros.findIndex(m => m.weekIndex === wkIndex);
          if (idx !== -1) {
            if (!currentMicros[idx].exercises) {
              currentMicros[idx].exercises = [];
            }
            currentMicros[idx].exercises.push({
              name: "Novo Exercício Estratégico",
              sets: 3,
              reps: "8-12",
              load: 20,
              rpe: 8,
              rir: 2,
              rest: "90s",
              notes: "Foco total na biomecânica de contração.",
              muscleGroup: "Peitoral",
              day: activeDayTab
            });
            setMicrociclos(currentMicros);
            setSaveStatus("unsaved");
          }
        }}
        onDeleteExercise={(masterIdx) => {
          const wkIndex = activeMesoWeeks[activeWeekIdx].weekIndex;
          const currentMicros = [...microciclos];
          const idx = currentMicros.findIndex(m => m.weekIndex === wkIndex);
          if (idx !== -1) {
            currentMicros[idx].exercises = currentMicros[idx].exercises.filter((_, i) => i !== masterIdx);
            setMicrociclos(currentMicros);
            setSaveStatus("unsaved");
          }
        }}
        onUpdateExercise={(masterIdx, fields) => {
          handleUpdateExercise(activeMesoWeeks[activeWeekIdx].weekIndex, masterIdx, fields);
        }}
      />

    </div>
  );
}

// Simple dummy X icon mapping for safety
function X({ h, w, className }: { h?: string; w?: string; className?: string }) {
  return (
    <svg 
      className={className} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2.5" 
      strokeLinecap="round" 
      strokeLinejoin="round"
      style={{ height: h ? `${parseInt(h)*4}px` : "16px", width: w ? `${parseInt(w)*4}px` : "16px" }}
    >
      <line x1="18" y1="6" x2="6" y2="18"></line>
      <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
  );
}
