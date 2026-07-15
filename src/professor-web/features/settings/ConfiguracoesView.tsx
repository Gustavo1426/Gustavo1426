/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { SyncManager } from "../../../shared/infrastructure/sync/SyncManager";
import { 
  Settings, 
  User, 
  Sparkles, 
  Target, 
  Mail, 
  Link, 
  Flame, 
  ShieldAlert,
  Save,
  Brain,
  Dumbbell,
  Plus,
  Trash2,
  Search,
  ArrowLeft,
  Check,
  Zap,
  Clock,
  Users,
  Activity,
  Copy,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { CoachSettings } from "../../../types";
import { INITIAL_FUNCTIONAL_EXERCISES, FunctionalExercise } from "@/src/data/functionalExercises";
import ConfirmModal from "../../../shared/presentation/components/ConfirmModal";
import { MASTER_PROMPT } from "../workouts/TreinosView";

interface ConfiguracoesViewProps {
  settings: CoachSettings;
  onSaveSettings: (settings: CoachSettings) => void;
}

interface MusculacaoExercise {
  nome: string;
  grupo: string;
  tipo: "Composto" | "Isolado";
  reps: string;
  sinergistas?: string[];
  desativado?: boolean;
  observacoes?: string;
}

const AVAILABLE_MUSCLES = [
  "Adutores",
  "Bíceps",
  "Core",
  "Costas",
  "Eretores da Espinha",
  "Glúteos",
  "Ombros",
  "Panturrilhas",
  "Peitoral",
  "Posteriores de Coxa",
  "Quadríceps",
  "Tríceps",
  "cardio",
  "core",
  "fullbody",
  "inferior",
  "potencia",
  "superior"
];

const DEFAULT_MUSCULACAO_EXERCISES: MusculacaoExercise[] = [
  { nome: "Leg Press 45°", grupo: "Quadríceps", tipo: "Composto", reps: "8-15", sinergistas: ["Glúteos", "Posteriores de Coxa", "Adutores"], desativado: false },
  { nome: "Leg Press Horizontal", grupo: "Quadríceps", tipo: "Composto", reps: "8-15", sinergistas: ["Glúteos", "Adutores"], desativado: false },
  { nome: "Cadeira Extensora Bilateral", grupo: "Quadríceps", tipo: "Isolado", reps: "10-20", sinergistas: [], desativado: false },
  { nome: "Cadeira Extensora Unilateral", grupo: "Quadríceps", tipo: "Isolado", reps: "10-20", sinergistas: [], desativado: false },
  { nome: "Agachamento Livre (High Bar)", grupo: "Quadríceps", tipo: "Composto", reps: "5-10", sinergistas: ["Glúteos", "Posteriores de Coxa", "Adutores", "Eretores da Espinha"], desativado: false },
  { nome: "Agachamento Livre (Low Bar)", grupo: "Quadríceps", tipo: "Composto", reps: "5-10", sinergistas: ["Glúteos", "Posteriores de Coxa", "Adutores", "Eretores da Espinha"], desativado: false },
  { nome: "Front Squat", grupo: "Quadríceps", tipo: "Composto", reps: "5-10", sinergistas: ["Glúteos", "Core", "Adutores", "Eretores da Espinha"], desativado: false },
  { nome: "Agachamento no Smith", grupo: "Quadríceps", tipo: "Composto", reps: "8-15", sinergistas: ["Glúteos", "Adutores", "Eretores da Espinha"], desativado: false },
  { nome: "Agachamento Hack Machine", grupo: "Quadríceps", tipo: "Composto", reps: "8-15", sinergistas: ["Glúteos", "Adutores"], desativado: false },
  { nome: "Bulgarian Split Squat", grupo: "Quadríceps", tipo: "Composto", reps: "8-15", sinergistas: ["Glúteos", "Adutores", "Eretores da Espinha"], desativado: false },
  { nome: "Leg Press Unilateral", grupo: "Quadríceps", tipo: "Composto", reps: "8-15", sinergistas: ["Glúteos", "Adutores"], desativado: false },
  { nome: "Lunge com Halteres", grupo: "Quadríceps", tipo: "Composto", reps: "10-15", sinergistas: ["Glúteos", "Posteriores de Coxa", "Adutores", "Eretores da Espinha"], desativado: false },
  { nome: "Sissy Squat", grupo: "Quadríceps", tipo: "Isolado", reps: "10-20", sinergistas: [], desativado: false },
  { nome: "Mesa Flexora Bilateral", grupo: "Posteriores de Coxa", tipo: "Isolado", reps: "8-15", sinergistas: [], desativado: false },
  { nome: "Mesa Flexora Unilateral", grupo: "Posteriores de Coxa", tipo: "Isolado", reps: "8-15", sinergistas: [], desativado: false },
  { nome: "Flexora Sentada", grupo: "Posteriores de Coxa", tipo: "Isolado", reps: "8-15", sinergistas: [], desativado: false },
  { nome: "Stiff Barra", grupo: "Posteriores de Coxa", tipo: "Composto", reps: "8-12", sinergistas: ["Glúteos", "Eretores da Espinha", "Adutores"], desativado: false },
  { nome: "Romanian Deadlift (Barra)", grupo: "Posteriores de Coxa", tipo: "Composto", reps: "8-12", sinergistas: ["Glúteos", "Eretores da Espinha", "Adutores"], desativado: false },
  { nome: "Romanian Deadlift (Halteres)", grupo: "Posteriores de Coxa", tipo: "Composto", reps: "8-12", sinergistas: ["Glúteos", "Eretores da Espinha"], desativado: false },
  { nome: "Glute Ham Raise", grupo: "Posteriores de Coxa", tipo: "Composto", reps: "6-12", sinergistas: ["Glúteos"], desativado: false },
  { nome: "Nordic Curl", grupo: "Posteriores de Coxa", tipo: "Isolado", reps: "5-10", sinergistas: [], desativado: false },
  { nome: "Hip Thrust com Barra", grupo: "Glúteos", tipo: "Composto", reps: "8-15", sinergistas: ["Posteriores de Coxa"], desativado: false },
  { nome: "Hip Thrust Máquina", grupo: "Glúteos", tipo: "Composto", reps: "8-15", sinergistas: ["Posteriores de Coxa"], desativado: false },
  { nome: "Glute Drive Máquina", grupo: "Glúteos", tipo: "Isolado", reps: "10-20", sinergistas: [], desativado: false },
  { nome: "Cadeira Abdutora", grupo: "Glúteos", tipo: "Isolado", reps: "12-20", sinergistas: [], desativado: false },
  { nome: "Agachamento Sumô com Halteres", grupo: "Glúteos", tipo: "Composto", reps: "10-15", sinergistas: ["Quadríceps", "Adutores", "Eretores da Espinha"], desativado: false },
  { nome: "Panturrilha em Pé Máquina", grupo: "Panturrilhas", tipo: "Isolado", reps: "10-20", sinergistas: [], desativado: false },
  { nome: "Panturrilha Sentada", grupo: "Panturrilhas", tipo: "Isolado", reps: "10-20", sinergistas: [], desativado: false },
  { nome: "Leg Press Panturrilha", grupo: "Panturrilhas", tipo: "Isolado", reps: "10-20", sinergistas: [], desativado: false },
  { nome: "Unilateral Calf Raise", grupo: "Panturrilhas", tipo: "Isolado", reps: "10-20", sinergistas: [], desativado: false },
  { nome: "Supino Reto Barra", grupo: "Peitoral", tipo: "Composto", reps: "6-12", sinergistas: ["Tríceps", "Ombros"], desativado: false },
  { nome: "Supino Reto Halteres", grupo: "Peitoral", tipo: "Composto", reps: "8-15", sinergistas: ["Tríceps", "Ombros"], desativado: false },
  { nome: "Supino Reto Máquina", grupo: "Peitoral", tipo: "Composto", reps: "8-15", sinergistas: ["Tríceps", "Ombros"], desativado: false },
  { nome: "Supino Inclinado Barra", grupo: "Peitoral", tipo: "Composto", reps: "6-12", sinergistas: ["Tríceps", "Ombros"], desativado: false },
  { nome: "Supino Inclinado Halteres", grupo: "Peitoral", tipo: "Composto", reps: "8-15", sinergistas: ["Tríceps", "Ombros"], desativado: false },
  { nome: "Supino Inclinado Convergente", grupo: "Peitoral", tipo: "Composto", reps: "8-15", sinergistas: ["Tríceps", "Ombros"], desativado: false },
  { nome: "Peck Deck / Crucifixo Máquina", grupo: "Peitoral", tipo: "Isolado", reps: "10-20", sinergistas: [], desativado: false },
  { nome: "Crossover Alto", grupo: "Peitoral", tipo: "Isolado", reps: "10-20", sinergistas: [], desativado: false },
  { nome: "Crossover Baixo", grupo: "Peitoral", tipo: "Isolado", reps: "10-20", sinergistas: [], desativado: false },
  { nome: "Crucifixo com Halteres Reto", grupo: "Peitoral", tipo: "Isolado", reps: "10-20", sinergistas: [], desativado: false },
  { nome: "Crucifixo com Halteres Inclinado", grupo: "Peitoral", tipo: "Isolado", reps: "10-20", sinergistas: [], desativado: false },
  { nome: "Puxada Alta Frente", grupo: "Costas", tipo: "Composto", reps: "8-15", sinergistas: ["Bíceps", "Ombros"], desativado: false },
  { nome: "Puxada Alta Neutra", grupo: "Costas", tipo: "Composto", reps: "8-15", sinergistas: ["Bíceps"], desativado: false },
  { nome: "Puxada Alta Supinada", grupo: "Costas", tipo: "Composto", reps: "8-15", sinergistas: ["Bíceps"], desativado: false },
  { nome: "Puxada Unilateral", grupo: "Costas", tipo: "Composto", reps: "8-15", sinergistas: ["Bíceps"], desativado: false },
  { nome: "Remada Baixa Máquina Neutra", grupo: "Costas", tipo: "Composto", reps: "8-15", sinergistas: ["Bíceps"], desativado: false },
  { nome: "Remada Hammer", grupo: "Costas", tipo: "Composto", reps: "8-15", sinergistas: ["Bíceps"], desativado: false },
  { nome: "Remada T-Bar", grupo: "Costas", tipo: "Composto", reps: "8-12", sinergistas: ["Bíceps", "Eretores da Espinha"], desativado: false },
  { nome: "Remada Curvada Pronada", grupo: "Costas", tipo: "Composto", reps: "6-12", sinergistas: ["Bíceps", "Ombros", "Eretores da Espinha"], desativado: false },
  { nome: "Remada Unilateral com Halter", grupo: "Costas", tipo: "Composto", reps: "8-15", sinergistas: ["Bíceps", "Eretores da Espinha"], desativado: false },
  { nome: "Deadlift", grupo: "Costas", tipo: "Composto", reps: "3-8", sinergistas: ["Glúteos", "Posteriores de Coxa", "Quadríceps", "Eretores da Espinha", "Adutores"], desativado: false },
  { nome: "Pulldown Máquina Convergente", grupo: "Costas", tipo: "Composto", reps: "8-15", sinergistas: ["Bíceps"], desativado: false },
  { nome: "Desenvolvimento Máquina", grupo: "Ombros", tipo: "Composto", reps: "8-15", sinergistas: ["Tríceps"], desativado: false },
  { nome: "Desenvolvimento Convergente", grupo: "Ombros", tipo: "Composto", reps: "8-15", sinergistas: ["Tríceps"], desativado: false },
  { nome: "Military Press Barra", grupo: "Ombros", tipo: "Composto", reps: "5-10", sinergistas: ["Tríceps", "Peitoral"], desativado: false },
  { nome: "Arnold Press", grupo: "Ombros", tipo: "Composto", reps: "8-15", sinergistas: ["Tríceps"], desativado: false },
  { nome: "Desenvolvimento com Halteres", grupo: "Ombros", tipo: "Composto", reps: "8-15", sinergistas: ["Tríceps"], desativado: false },
  { nome: "Elevação Lateral Máquina", grupo: "Ombros", tipo: "Isolado", reps: "12-20", sinergistas: [], desativado: false },
  { nome: "Elevação Lateral Halteres", grupo: "Ombros", tipo: "Isolado", reps: "12-20", sinergistas: [], desativado: false },
  { nome: "Elevação Lateral Cabo", grupo: "Ombros", tipo: "Isolado", reps: "12-20", sinergistas: [], desativado: false },
  { nome: "Crucifixo Inverso Máquina", grupo: "Ombros", tipo: "Isolado", reps: "12-20", sinergistas: ["Costas"], desativado: false },
  { nome: "Face Pull", grupo: "Ombros", tipo: "Isolado", reps: "12-20", sinergistas: ["Costas"], desativado: false },
  { nome: "Shrug Barra", grupo: "Ombros", tipo: "Isolado", reps: "10-15", sinergistas: [], desativado: false },
  { nome: "Banco Scott Barra W", grupo: "Bíceps", tipo: "Isolado", reps: "8-15", sinergistas: [], desativado: false },
  { nome: "Banco Scott Máquina", grupo: "Bíceps", tipo: "Isolado", reps: "8-15", sinergistas: [], desativado: false },
  { nome: "Rosca Direta Barra Reta", grupo: "Bíceps", tipo: "Isolado", reps: "8-15", sinergistas: [], desativado: false },
  { nome: "Rosca Direta Barra W", grupo: "Bíceps", tipo: "Isolado", reps: "8-15", sinergistas: [], desativado: false },
  { nome: "Rosca Alternada", grupo: "Bíceps", tipo: "Isolado", reps: "8-15", sinergistas: [], desativado: false },
  { nome: "Rosca Martelo", grupo: "Bíceps", tipo: "Isolado", reps: "8-15", sinergistas: [], desativado: false },
  { nome: "Rosca Concentrada", grupo: "Bíceps", tipo: "Isolado", reps: "10-15", sinergistas: [], desativado: false },
  { nome: "Rosca no Cabo Baixo", grupo: "Bíceps", tipo: "Isolado", reps: "10-15", sinergistas: [], desativado: false },
  { nome: "Tríceps Testa Máquina", grupo: "Tríceps", tipo: "Isolado", reps: "8-15", sinergistas: [], desativado: false },
  { nome: "Tríceps Pulley Barra", grupo: "Tríceps", tipo: "Isolado", reps: "8-15", sinergistas: [], desativado: false },
  { nome: "Tríceps Pulley Corda", grupo: "Tríceps", tipo: "Isolado", reps: "10-20", sinergistas: [], desativado: false },
  { nome: "Tríceps Pulley Pegada Invertida", grupo: "Tríceps", tipo: "Isolado", reps: "10-20", sinergistas: [], desativado: false },
  { nome: "Tríceps Máquina Convergente", grupo: "Tríceps", tipo: "Isolado", reps: "8-15", sinergistas: [], desativado: false },
  { nome: "Extensão Unilateral Cabo", grupo: "Tríceps", tipo: "Isolado", reps: "10-20", sinergistas: [], desativado: false },
  { nome: "Tríceps Testa Barra W", grupo: "Tríceps", tipo: "Isolado", reps: "8-15", sinergistas: [], desativado: false },
  { nome: "Supino Fechado", grupo: "Tríceps", tipo: "Composto", reps: "6-12", sinergistas: ["Peitoral", "Ombros"], desativado: false },
  { nome: "Extensão Acima da Cabeça Unilateral", grupo: "Tríceps", tipo: "Isolado", reps: "10-20", sinergistas: [], desativado: false },
  { nome: "Abdominal Crunch Máquina", grupo: "Core", tipo: "Isolado", reps: "12-20", sinergistas: [], desativado: false },
  { nome: "Abdominal Cabo Alto", grupo: "Core", tipo: "Isolado", reps: "12-20", sinergistas: [], desativado: false },
  { nome: "Ab Wheel Rollout", grupo: "Core", tipo: "Composto", reps: "8-15", sinergistas: [], desativado: false },
  { nome: "Hanging Leg Raise", grupo: "Core", tipo: "Composto", reps: "10-15", sinergistas: [], desativado: false },
  { nome: "Prancha Abdominal", grupo: "Core", tipo: "Isolado", reps: "30-60s", sinergistas: ["Ombros"], desativado: false },
  { nome: "Cadeira Adutora", grupo: "Adutores", tipo: "Isolado", reps: "12-20", sinergistas: [], desativado: false },
  { nome: "Crossover de Adutores no Cabo", grupo: "Adutores", tipo: "Isolado", reps: "12-15", sinergistas: [], desativado: false },
  { nome: "Hyperextension (Banco Romano)", grupo: "Eretores da Espinha", tipo: "Composto", reps: "10-15", sinergistas: ["Glúteos", "Posteriores de Coxa"], desativado: false },
  { nome: "Good Morning com Barra", grupo: "Eretores da Espinha", tipo: "Composto", reps: "8-12", sinergistas: ["Posteriores de Coxa", "Glúteos", "Adutores"], desativado: false }
];

export default function ConfiguracoesView({
  settings,
  onSaveSettings
}: ConfiguracoesViewProps) {
  
  // Tabs: "profile", "musculacao", "funcional", "pdf"
  const [activeTab, setActiveTab] = useState<"profile" | "musculacao" | "funcional" | "pdf">("profile");

  const [showPrompt, setShowPrompt] = useState(false);
  const [copied, setCopied] = useState(false);

  // Consulting configuration states
  const [consultingConfig, setConsultingConfig] = useState({
    logoText: "TREINOPRO",
    slogan: "PLATAFORMA INTELIGENTE DE PERFORMANCE",
    companyName: "ACADEMIA TREINOPRO LTDA",
    address: "Av. Paulista, 1000 - Bela Vista - Sao Paulo / SP",
    phone: "(11) 98888-7777",
    email: "suporte@treinopro.com.br",
    website: "www.treinopro.com.br",
    qrLink: typeof window !== "undefined" ? (window.location.origin + "/?role=aluno") : "treinopro.com.br/aluno",
    evaluatorName: "Prof. Gustavo Workout",
    evaluatorCref: "054112-G/SP",
    shortName: "",
    themeId: "blue" as "blue" | "emerald" | "crimson" | "purple" | "amber" | "slate"
  });

  // Toast notifications state for replacing native alert() in sandbox iframes
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "info" | "warning";
    title?: string;
  } | null>(null);

  const showNotification = (message: string, type: "success" | "info" | "warning" = "info", title?: string) => {
    setToast({ message, type, title });
    setTimeout(() => {
      setToast(prev => prev && prev.message === message ? null : prev);
    }, 6000);
  };

  // Firebase Sync states
  const [syncStatus, setSyncStatus] = useState(() => SyncManager.getInstance().getSyncStatus());
  const [isSyncingRemote, setIsSyncingRemote] = useState(false);

  const handleManualSync = async () => {
    setIsSyncingRemote(true);
    try {
      const success = await SyncManager.getInstance().sync();
      if (success) {
        showNotification("Sincronização com Firebase Firestore concluída com sucesso!", "success", "Nuvem Sincronizada");
      } else {
        showNotification("A sincronização falhou. Verifique sua conexão.", "warning", "Erro de Sincronização");
      }
    } catch (err) {
      console.error(err);
      showNotification("Ocorreu um erro durante a sincronização.", "warning", "Erro");
    } finally {
      setIsSyncingRemote(false);
      setSyncStatus(SyncManager.getInstance().getSyncStatus());
    }
  };

  useEffect(() => {
    const handleSyncComplete = () => {
      setSyncStatus(SyncManager.getInstance().getSyncStatus());
    };
    window.addEventListener("treinopro_sync_completed", handleSyncComplete);
    return () => window.removeEventListener("treinopro_sync_completed", handleSyncComplete);
  }, []);

  // ConfirmModal states
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [deleteType, setDeleteType] = useState<"functional" | "musculacao" | null>(null);
  const [deleteTargetName, setDeleteTargetName] = useState("");

  const confirmDeleteExercise = () => {
    if (deleteType === "functional") {
      const updatedList = functionalExercises.filter(ex => ex.nome !== deleteTargetName);
      setFunctionalExercises(updatedList);
      localStorage.setItem("TreinoPro_Functional_Exercises", JSON.stringify(updatedList));
    } else if (deleteType === "musculacao") {
      const updatedList = musculacaoExercises.filter(ex => ex.nome !== deleteTargetName);
      setMusculacaoExercises(updatedList);
      localStorage.setItem("TreinoPro_Musculacao_Exercises", JSON.stringify(updatedList));
    }
    setIsConfirmDeleteOpen(false);
    setDeleteType(null);
    setDeleteTargetName("");
  };

  // Local form states
  const [name, setName] = useState(settings.name);
  const [email, setEmail] = useState(settings.email);
  const [avatarUrl, setAvatarUrl] = useState(settings.avatarUrl);
  const [monthlyGoal, setMonthlyGoal] = useState(settings.monthlyGoal);
  const [aiTone, setAiTone] = useState<"motivating" | "strict" | "academic" | "friendly">(settings.aiTone);
  const [aiProvider, setAiProvider] = useState<"gemini" | "groq">(settings.aiProvider || "gemini");
  const [accessPassword, setAccessPassword] = useState(settings.accessPassword || "admin");
  const [instagram, setInstagram] = useState(settings.instagram || "");
  const [whatsapp, setWhatsapp] = useState(settings.whatsapp || "");
  const [businessHoursStart, setBusinessHoursStart] = useState(settings.businessHoursStart || "06:00");
  const [businessHoursEnd, setBusinessHoursEnd] = useState(settings.businessHoursEnd || "22:00");

  // Exercise states
  const [functionalExercises, setFunctionalExercises] = useState<FunctionalExercise[]>([]);
  const [musculacaoExercises, setMusculacaoExercises] = useState<MusculacaoExercise[]>([]);

  // Filtering states for functional exercises
  const [funcEquipFilter, setFuncEquipFilter] = useState<string>("Todos");
  const [funcGroupFilter, setFuncGroupFilter] = useState<string>("Todos");
  const [funcSearch, setFuncSearch] = useState<string>("");

  // Filtering states for musculacao exercises
  const [muscGroupFilter, setMuscGroupFilter] = useState<string>("Todos");
  const [muscSearch, setMuscSearch] = useState<string>("");

  // Add functional exercise form state
  const [showAddFuncForm, setShowAddFuncForm] = useState(false);
  const [newFuncName, setNewFuncName] = useState("");
  const [newFuncGroup, setNewFuncGroup] = useState<"superior" | "inferior" | "core" | "potencia" | "fullbody" | "cardio">("superior");
  const [newFuncCategory, setNewFuncCategory] = useState<"força" | "potência" | "cardio" | "agilidade" | "resistência">("força");
  const [newFuncEquip, setNewFuncEquip] = useState<"TRX" | "Corda Naval" | "Escada" | "Medicine Ball" | "Chapéus" | "Cones" | "Peso Corporal" | "Combinado">("TRX");
  const [newFuncLevels, setNewFuncLevels] = useState<string[]>(["iniciante"]);
  const [newFuncImpact, setNewFuncImpact] = useState<"baixo" | "medio" | "alto">("baixo");
  const [newFuncTime, setNewFuncTime] = useState("40s");
  const [newFuncStudents, setNewFuncStudents] = useState<"1 aluno" | "ilimitado">("1 aluno");
  const [newFuncTagsInput, setNewFuncTagsInput] = useState("");

  // Add musculacao exercise form state
  const [showAddMuscForm, setShowAddMuscForm] = useState(false);
  const [newMuscName, setNewMuscName] = useState("");
  const [newMuscGroup, setNewMuscGroup] = useState("");
  const [newMuscType, setNewMuscType] = useState<"Composto" | "Isolado">("Composto");
  const [newMuscSinergistas, setNewMuscSinergistas] = useState<string[]>([]);
  const [newMuscReps, setNewMuscReps] = useState("");
  const [newMuscNotes, setNewMuscNotes] = useState("");

  // Load from localStorage or defaults
  useEffect(() => {
    const storedFunc = localStorage.getItem("TreinoPro_Functional_Exercises");
    if (storedFunc) {
      setFunctionalExercises(JSON.parse(storedFunc));
    } else {
      setFunctionalExercises(INITIAL_FUNCTIONAL_EXERCISES);
      localStorage.setItem("TreinoPro_Functional_Exercises", JSON.stringify(INITIAL_FUNCTIONAL_EXERCISES));
    }

    const storedMusc = localStorage.getItem("TreinoPro_Musculacao_Exercises");
    if (storedMusc) {
      const parsed = JSON.parse(storedMusc);
      if (Array.isArray(parsed) && parsed.length >= 50) {
        setMusculacaoExercises(parsed);
      } else {
        // Upgrade to the new comprehensive list of 89 exercises
        setMusculacaoExercises(DEFAULT_MUSCULACAO_EXERCISES);
        localStorage.setItem("TreinoPro_Musculacao_Exercises", JSON.stringify(DEFAULT_MUSCULACAO_EXERCISES));
      }
    } else {
      setMusculacaoExercises(DEFAULT_MUSCULACAO_EXERCISES);
      localStorage.setItem("TreinoPro_Musculacao_Exercises", JSON.stringify(DEFAULT_MUSCULACAO_EXERCISES));
    }

    const storedPdfConfig = localStorage.getItem("treinopro_consultoria_config");
    if (storedPdfConfig) {
      try {
        const parsed = JSON.parse(storedPdfConfig);
        setConsultingConfig(prev => ({
          logoText: parsed.logoText || "TREINOPRO",
          slogan: parsed.slogan || "PLATAFORMA INTELIGENTE DE PERFORMANCE",
          companyName: parsed.companyName || "ACADEMIA TREINOPRO LTDA",
          address: parsed.address !== undefined ? parsed.address : "Av. Paulista, 1000 - Bela Vista - Sao Paulo / SP",
          phone: parsed.phone || "(11) 98888-7777",
          email: parsed.email || "suporte@treinopro.com.br",
          website: parsed.website !== undefined ? parsed.website : "www.treinopro.com.br",
          qrLink: parsed.qrLink && parsed.qrLink !== "treinopro.com.br/aluno" ? parsed.qrLink : (typeof window !== "undefined" ? (window.location.origin + "/?role=aluno") : "treinopro.com.br/aluno"),
          evaluatorName: parsed.evaluatorName || "Prof. Gustavo Workout",
          evaluatorCref: parsed.evaluatorCref || "054112-G/SP",
          shortName: parsed.shortName || "",
          themeId: parsed.themeId || "blue"
        }));
      } catch (e) {
        console.error("Erro ao carregar configuracoes da consultoria:", e);
      }
    }
  }, []);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings({
      name,
      email,
      avatarUrl,
      monthlyGoal: Number(monthlyGoal),
      aiTone,
      aiProvider,
      accessPassword,
      instagram,
      whatsapp,
      businessHoursStart,
      businessHoursEnd
    });
    showNotification("Configurações do perfil atualizadas com sucesso!", "success", "Sucesso");
  };

  // Add functional exercise handler
  const handleAddFunctional = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFuncName.trim()) return;

    const tagsArray = newFuncTagsInput
      ? newFuncTagsInput.split(",").map(t => t.trim().toLowerCase()).filter(Boolean)
      : [newFuncGroup, newFuncCategory];

    const newItem: FunctionalExercise = {
      nome: newFuncName.trim(),
      grupo: newFuncGroup,
      categoria: newFuncCategory,
      equipamento: newFuncEquip,
      nivel: newFuncLevels as any[],
      impacto: newFuncImpact,
      tempo: newFuncTime || "40s",
      alunos: newFuncStudents,
      tags: tagsArray
    };

    const updatedList = [newItem, ...functionalExercises];
    setFunctionalExercises(updatedList);
    localStorage.setItem("TreinoPro_Functional_Exercises", JSON.stringify(updatedList));

    // Reset Form
    setNewFuncName("");
    setNewFuncTagsInput("");
    setShowAddFuncForm(false);
    showNotification(`Exercício "${newItem.nome}" adicionado ao banco funcional!`, "success", "Exercício Adicionado");
  };

  // Delete functional exercise handler
  const handleDeleteFunctional = (nome: string) => {
    setDeleteType("functional");
    setDeleteTargetName(nome);
    setIsConfirmDeleteOpen(true);
  };

  // Add musculacao exercise handler
  const handleAddMusculacao = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMuscName.trim()) return;

    const newItem: MusculacaoExercise = {
      nome: newMuscName.trim(),
      grupo: newMuscGroup || "Sem Grupo",
      tipo: newMuscType,
      reps: newMuscReps || "8-12",
      sinergistas: newMuscSinergistas,
      desativado: false,
      observacoes: newMuscNotes.trim() || undefined
    };

    const updatedList = [newItem, ...musculacaoExercises];
    setMusculacaoExercises(updatedList);
    localStorage.setItem("TreinoPro_Musculacao_Exercises", JSON.stringify(updatedList));

    // Reset
    setNewMuscName("");
    setNewMuscGroup("");
    setNewMuscType("Composto");
    setNewMuscSinergistas([]);
    setNewMuscReps("");
    setNewMuscNotes("");
    setShowAddMuscForm(false);
    showNotification(`Exercício "${newItem.nome}" adicionado ao banco de musculação!`, "success", "Exercício Adicionado");
  };

  // Toggle musculacao exercise activation/deactivation
  const handleToggleMusculacao = (nome: string) => {
    const updatedList = musculacaoExercises.map(ex => {
      if (ex.nome === nome) {
        return { ...ex, desativado: !ex.desativado };
      }
      return ex;
    });
    setMusculacaoExercises(updatedList);
    localStorage.setItem("TreinoPro_Musculacao_Exercises", JSON.stringify(updatedList));
  };

  // Delete musculacao exercise handler
  const handleDeleteMusculacao = (nome: string) => {
    setDeleteType("musculacao");
    setDeleteTargetName(nome);
    setIsConfirmDeleteOpen(true);
  };

  // Counts for KPIs
  const totalFunc = functionalExercises.length;
  const trxFunc = functionalExercises.filter(ex => ex.equipamento === "TRX").length;
  const cordaFunc = functionalExercises.filter(ex => ex.equipamento === "Corda Naval").length;
  const escadaFunc = functionalExercises.filter(ex => ex.equipamento === "Escada").length;
  const medicineFunc = functionalExercises.filter(ex => ex.equipamento === "Medicine Ball").length;
  const pesoCorpFunc = totalFunc - trxFunc - cordaFunc - escadaFunc - medicineFunc;

  // Filter functional list
  const filteredFunctional = functionalExercises.filter(ex => {
    const matchesSearch = ex.nome.toLowerCase().includes(funcSearch.toLowerCase()) || 
                          ex.tags.some(t => t.toLowerCase().includes(funcSearch.toLowerCase()));
    
    const matchesEquip = funcEquipFilter === "Todos" || ex.equipamento === funcEquipFilter;
    const matchesGroup = funcGroupFilter === "Todos" || ex.grupo === funcGroupFilter;

    return matchesSearch && matchesEquip && matchesGroup;
  });

  // Filter musculacao list
  const filteredMusculacao = musculacaoExercises.filter(ex => {
    const matchesSearch = ex.nome.toLowerCase().includes(muscSearch.toLowerCase());
    const matchesGroup = muscGroupFilter === "Todos" || ex.grupo === muscGroupFilter;
    return matchesSearch && matchesGroup;
  });

  return (
    <div id="configuracoes-view" className="space-y-6">

      {/* Toast Notification Container */}
      {toast && (
        <div className={`fixed top-4 right-4 z-[9999] max-w-sm p-4 rounded-xl border flex items-start gap-3 shadow-2xl overflow-hidden animate-fade-in ${
          toast.type === "success" 
            ? "bg-emerald-950/90 border-emerald-500/30 text-white shadow-[0_0_20px_rgba(16,185,129,0.2)]" 
            : toast.type === "warning" 
            ? "bg-amber-950/90 border-amber-500/30 text-white shadow-[0_0_20px_rgba(245,158,11,0.2)]" 
            : "bg-cyan-950/90 border-cyan-500/30 text-white shadow-[0_0_20px_rgba(6,182,212,0.2)]"
        }`}>
          <div className="text-xl shrink-0 mt-0.5">
            {toast.type === "success" ? "✅" : toast.type === "warning" ? "⚠️" : "ℹ️"}
          </div>
          <div className="flex-1 font-mono text-xs">
            {toast.title && <p className={`font-extrabold uppercase tracking-wider mb-1 ${
              toast.type === "success" ? "text-emerald-400" : toast.type === "warning" ? "text-amber-400" : "text-cyan-400"
            }`}>{toast.title}</p>}
            <p className="leading-relaxed whitespace-pre-line text-gray-200">{toast.message}</p>
          </div>
          <button 
            type="button"
            onClick={() => setToast(null)}
            className="text-gray-400 hover:text-white font-bold text-xs p-1 shrink-0 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}
      
      {/* Header section with 2 main toggle buttons */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#3a494b]/20 pb-4">
        <div>
          <h2 className="text-3xl font-extrabold text-[#e3e2e4] tracking-tight">Configurações do Sistema</h2>
          <p className="text-[#b9cacb] text-sm">Gerencie o perfil do treinador, meta financeira e cadastre novos exercícios personalizados.</p>
        </div>

        {/* The 2 requested action buttons plus standard profile toggle */}
        <div className="flex flex-wrap gap-2">
          <button
            id="btn-perfil"
            onClick={() => setActiveTab("profile")}
            className={`px-4 py-2.5 rounded-lg font-mono text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === "profile" 
                ? "bg-[#1f2123] border border-[#00f2ff]/50 text-[#00f2ff] shadow-[0_0_15px_rgba(0,242,255,0.15)]"
                : "bg-[#1b1c1e]/60 border border-[#3a494b]/20 text-[#b9cacb] hover:text-white"
            }`}
          >
            <User className="w-3.5 h-3.5" />
            Perfil & IA
          </button>
          <button
            id="btn-musculacao-config"
            onClick={() => setActiveTab("musculacao")}
            className={`px-4 py-2.5 rounded-lg font-mono text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === "musculacao" 
                ? "bg-[#1f2123] border border-[#00f2ff]/50 text-[#00f2ff] shadow-[0_0_15px_rgba(0,242,255,0.15)]"
                : "bg-[#1b1c1e]/60 border border-[#3a494b]/20 text-[#b9cacb] hover:text-white"
            }`}
          >
            <Dumbbell className="w-3.5 h-3.5" />
            Exercícios Musculação
          </button>
          <button
            id="btn-funcional-config"
            onClick={() => setActiveTab("funcional")}
            className={`px-4 py-2.5 rounded-lg font-mono text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === "funcional" 
                ? "bg-[#1f2123] border border-[#ebb2ff]/50 text-[#ebb2ff] shadow-[0_0_15px_rgba(235,178,255,0.15)]"
                : "bg-[#1b1c1e]/60 border border-[#3a494b]/20 text-[#b9cacb] hover:text-white"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Exercícios Funcional
          </button>
          <button
            id="btn-pdf-config"
            onClick={() => setActiveTab("pdf")}
            className={`px-4 py-2.5 rounded-lg font-mono text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === "pdf" 
                ? "bg-[#1f2123] border border-cyan-400/50 text-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.15)]"
                : "bg-[#1b1c1e]/60 border border-[#3a494b]/20 text-[#b9cacb] hover:text-white"
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            Personalizar PDF
          </button>
        </div>
      </div>

      {/* 1. PROFILE SECTION */}
      {activeTab === "profile" && (
        <form onSubmit={handleSaveProfile} className="grid grid-cols-1 lg:grid-cols-3 gap-6 font-mono text-xs">
          {/* Profile Card & Bio Editor */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* General Bio Section */}
            <div className="glass-panel p-5 rounded-xl space-y-4">
              <h3 className="text-xs font-bold text-[#e3e2e4] uppercase tracking-wider border-b border-[#3a494b]/20 pb-2 flex items-center gap-2">
                <User className="w-4 h-4 text-[#00f2ff]" /> Perfil do Treinador
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#b9cacb] font-bold mb-1.5 uppercase tracking-wider text-[10px]">
                    Nome de Exibição
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-[#1b1c1e] border border-[#3a494b]/40 focus:border-[#00f2ff] text-white px-3 py-2 rounded-lg outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[#b9cacb] font-bold mb-1.5 uppercase tracking-wider text-[10px]">
                    E-mail de Contato
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-[#1b1c1e] border border-[#3a494b]/40 focus:border-[#00f2ff] text-white px-3 py-2 rounded-lg outline-none transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#b9cacb] font-bold mb-1.5 uppercase tracking-wider text-[10px]">
                    URL da Foto de Perfil (Avatar)
                  </label>
                  <input
                    type="text"
                    value={avatarUrl}
                    onChange={(e) => setAvatarUrl(e.target.value)}
                    className="w-full bg-[#1b1c1e] border border-[#3a494b]/40 focus:border-[#00f2ff] text-white px-3 py-2 rounded-lg outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[#b9cacb] font-bold mb-1.5 uppercase tracking-wider text-[10px]">
                    Senha de Acesso do Coach (Web)
                  </label>
                  <input
                    type="password"
                    required
                    value={accessPassword}
                    onChange={(e) => setAccessPassword(e.target.value)}
                    className="w-full bg-[#1b1c1e] border border-[#3a494b]/40 focus:border-[#00f2ff] text-white px-3 py-2 rounded-lg outline-none transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Social Media & Brand Section */}
            <div className="glass-panel p-5 rounded-xl space-y-4">
              <h3 className="text-xs font-bold text-[#e3e2e4] uppercase tracking-wider border-b border-[#3a494b]/20 pb-2 flex items-center gap-2">
                <Link className="w-4 h-4 text-[#00f2ff]" /> Redes Sociais & Contato
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#b9cacb] font-bold mb-1.5 uppercase tracking-wider text-[10px]">
                    Usuário do Instagram
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: @gustavoworkout"
                    value={instagram}
                    onChange={(e) => setInstagram(e.target.value)}
                    className="w-full bg-[#1b1c1e] border border-[#3a494b]/40 focus:border-[#00f2ff] text-white px-3 py-2 rounded-lg outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[#b9cacb] font-bold mb-1.5 uppercase tracking-wider text-[10px]">
                    WhatsApp de Suporte
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: 11999999999"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    className="w-full bg-[#1b1c1e] border border-[#3a494b]/40 focus:border-[#00f2ff] text-white px-3 py-2 rounded-lg outline-none transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Business hours section */}
            <div className="glass-panel p-5 rounded-xl space-y-4">
              <h3 className="text-xs font-bold text-[#e3e2e4] uppercase tracking-wider border-b border-[#3a494b]/20 pb-2 flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#ebb2ff]" /> Horário de Atendimento
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#b9cacb] font-bold mb-1.5 uppercase tracking-wider text-[10px]">
                    Início do Expediente
                  </label>
                  <input
                    type="time"
                    value={businessHoursStart}
                    onChange={(e) => setBusinessHoursStart(e.target.value)}
                    className="w-full bg-[#1b1c1e] border border-[#3a494b]/40 focus:border-[#00f2ff] text-white px-3 py-2 rounded-lg outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[#b9cacb] font-bold mb-1.5 uppercase tracking-wider text-[10px]">
                    Fim do Expediente
                  </label>
                  <input
                    type="time"
                    value={businessHoursEnd}
                    onChange={(e) => setBusinessHoursEnd(e.target.value)}
                    className="w-full bg-[#1b1c1e] border border-[#3a494b]/40 focus:border-[#00f2ff] text-white px-3 py-2 rounded-lg outline-none transition-all"
                  />
                </div>
              </div>
              <p className="text-[10px] text-gray-500">
                Seus alunos receberão avisos automáticos caso enviem mensagens fora do período configurado.
              </p>
            </div>

            {/* Business configuration */}
            <div className="glass-panel p-5 rounded-xl space-y-4">
              <h3 className="text-xs font-bold text-[#e3e2e4] uppercase tracking-wider border-b border-[#3a494b]/20 pb-2 flex items-center gap-2">
                <Target className="w-4 h-4 text-[#ebb2ff]" /> Metas de Negócio
              </h3>

              <div>
                <label className="block text-[#b9cacb] font-bold mb-1.5 uppercase tracking-wider text-[10px]">
                  Meta de Faturamento Mensal (R$)
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  value={monthlyGoal}
                  onChange={(e) => setMonthlyGoal(Number(e.target.value))}
                  className="w-full bg-[#1b1c1e] border border-[#3a494b]/40 focus:border-[#00f2ff] text-white px-3 py-2 rounded-lg outline-none transition-all max-w-sm"
                />
                <p className="text-[10px] text-gray-500 mt-1.5">
                  Esta meta é exibida na barra de evolução financeira do seu dashboard.
                </p>
              </div>
            </div>

            {/* Firebase Cloud Sync Configuration */}
            <div className="glass-panel p-5 rounded-xl space-y-4">
              <h3 className="text-xs font-bold text-[#e3e2e4] uppercase tracking-wider border-b border-[#3a494b]/20 pb-2 flex items-center gap-2">
                <Activity className="w-4 h-4 text-[#00f2ff]" /> Nuvem Firebase & Sincronização
              </h3>
              <div className="space-y-3.5">
                <p className="text-[11px] text-[#b9cacb] leading-relaxed font-sans">
                  Seus dados locais (alunos, treinos, dietas, faturamento, chat e gamificação) são armazenados no navegador e sincronizados de forma bidirecional na nuvem do Firebase Firestore.
                </p>

                <div className="bg-[#1b1c1e] p-3 rounded-lg border border-[#3a494b]/15 text-[10px] text-[#b9cacb] space-y-1.5 font-mono">
                  <div className="flex justify-between items-center">
                    <span>Status de Conectividade:</span>
                    <span className={navigator.onLine ? "text-emerald-400 font-bold" : "text-amber-400 font-bold"}>
                      {navigator.onLine ? "ONLINE ●" : "OFFLINE ●"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Última Sincronização:</span>
                    <span className="text-white font-bold">{syncStatus.lastSynced ? new Date(syncStatus.lastSynced).toLocaleString("pt-BR") : "Nunca"}</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleManualSync}
                  disabled={isSyncingRemote}
                  className="w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-[#00f2ff] to-[#00a2ff] text-[#002022] font-mono font-bold text-xs rounded-lg hover:shadow-[0_0_15px_rgba(0,242,255,0.3)] hover:opacity-95 active:scale-95 transition-all disabled:opacity-50 disabled:pointer-events-none cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>{isSyncingRemote ? "🔄" : "☁️"}</span>
                  {isSyncingRemote ? "Sincronizando..." : "Sincronizar com Firebase"}
                </button>
              </div>
            </div>

            {/* 🧠 PROMPT MESTRE DE IA (TREINOPRO) - CARD COLAPSÁVEL */}
            <div className="glass-panel p-5 rounded-xl border border-[#00f2ff]/30 bg-[#121315]/80 space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between gap-4 cursor-pointer select-none" onClick={() => setShowPrompt(!showPrompt)}>
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded bg-[#00f2ff]/10 flex items-center justify-center border border-[#00f2ff]/20">
                    <Brain className="w-4 h-4 text-[#00f2ff] animate-pulse" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-extrabold text-sm text-[#e3e2e4] flex flex-wrap items-center gap-2">
                      PROMPT MESTRE: ARQUITETURA DE VOLUME (TREINOPRO)
                      <span className="bg-[#ccff00]/20 text-[#ebb2ff] text-[9px] px-1.5 py-0.5 rounded border border-[#ccff00]/30">IA ATIVA</span>
                    </h3>
                    <p className="text-[10px] text-[#b9cacb] mt-0.5 truncate">Use este prompt no ChatGPT/Gemini para estruturar treinos com precisão científica de Mike Israetel.</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigator.clipboard.writeText(MASTER_PROMPT);
                      setCopied(true);
                      setTimeout(() => setCopied(false), 2000);
                    }}
                    className="px-3 py-1.5 rounded bg-[#1f2123] hover:bg-[#ccff00] text-[#00f2ff] hover:text-white border border-[#00f2ff]/30 hover:border-transparent transition-all flex items-center gap-1 cursor-pointer text-[10px] font-bold"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3 h-3 text-green-400" />
                        Copiado!
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        Copiar Prompt
                      </>
                    )}
                  </button>
                  <div className="text-[#b9cacb] hover:text-white transition-colors p-1">
                    {showPrompt ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </div>
              </div>

              {showPrompt && (
                <div className="pt-3 border-t border-[#3a494b]/20 space-y-3">
                  <p className="text-[11px] text-[#b9cacb] font-sans leading-relaxed">
                    Instruções de uso: Copie o prompt abaixo e cole no seu modelo de linguagem favorito (como Gemini Advanced, ChatGPT Plus ou Claude). Ele programará a IA para se comportar como o maior especialista mundial em periodização e biomecânica, gerando treinos perfeitos baseados nos dados que você fornecer.
                  </p>
                  <div className="relative">
                    <pre className="bg-[#0c0d0e] border border-[#3a494b]/30 rounded-lg p-3 text-[10px] leading-relaxed text-gray-300 max-h-72 overflow-y-auto whitespace-pre-wrap font-mono select-all">
                      {MASTER_PROMPT}
                    </pre>
                    <div className="absolute top-2 right-2">
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(MASTER_PROMPT);
                          setCopied(true);
                          setTimeout(() => setCopied(false), 2000);
                        }}
                        className="bg-[#1c1d1f]/90 hover:bg-[#ccff00] text-white p-1.5 rounded border border-gray-700/50 hover:border-transparent transition-all shadow-md cursor-pointer"
                        title="Copiar texto"
                      >
                        {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: AI Settings & Tones */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Provedor de IA */}
            <div className="glass-panel p-5 rounded-xl space-y-4">
              <h3 className="text-xs font-bold text-[#e3e2e4] uppercase tracking-wider border-b border-[#3a494b]/20 pb-2 flex items-center gap-2">
                <Zap className="w-4 h-4 text-[#00f2ff]" /> Provedor de Inteligência Artificial
              </h3>
              <div className="space-y-3">
                <p className="text-[11px] text-[#b9cacb] leading-relaxed font-sans">
                  Selecione qual provedor de IA deseja utilizar para gerar mensagens de WhatsApp, laudos anatômicos e periodizações de treino:
                </p>

                {/* Google Gemini */}
                <label className="flex items-start gap-3 p-2.5 rounded-lg border border-[#3a494b]/15 bg-[#1b1c1e] hover:border-[#00f2ff]/40 transition-all cursor-pointer">
                  <input
                    type="radio"
                    name="aiProvider"
                    value="gemini"
                    checked={aiProvider === "gemini"}
                    onChange={() => setAiProvider("gemini")}
                    className="mt-0.5 text-[#00f2ff] focus:ring-0 cursor-pointer"
                  />
                  <div>
                    <span className="font-bold text-[#e3e2e4] block">Google Gemini</span>
                    <span className="text-[10px] text-gray-400 block mt-0.5 leading-relaxed font-mono">
                      Modelo padrão do sistema para visão computacional de postura e geração de treinos.
                    </span>
                  </div>
                </label>

                {/* Groq API */}
                <label className="flex items-start gap-3 p-2.5 rounded-lg border border-[#3a494b]/15 bg-[#1b1c1e] hover:border-[#ebb2ff]/40 transition-all cursor-pointer">
                  <input
                    type="radio"
                    name="aiProvider"
                    value="groq"
                    checked={aiProvider === "groq"}
                    onChange={() => setAiProvider("groq")}
                    className="mt-0.5 text-[#ebb2ff] focus:ring-0 cursor-pointer"
                  />
                  <div>
                    <span className="font-bold text-[#e3e2e4] block">Groq API (Llama 3.3)</span>
                    <span className="text-[10px] text-gray-400 block mt-0.5 leading-relaxed font-mono">
                      Processamento de altíssima velocidade e raciocínio de elite usando Llama-3.3-70b.
                    </span>
                  </div>
                </label>
              </div>
            </div>
            
            <div className="glass-panel p-5 rounded-xl space-y-4">
              <h3 className="text-xs font-bold text-[#e3e2e4] uppercase tracking-wider border-b border-[#3a494b]/20 pb-2 flex items-center gap-2">
                <Brain className="w-4 h-4 text-[#ebb2ff]" /> Personalidade do AI Assistente
              </h3>

              <div className="space-y-3">
                <p className="text-[11px] text-[#b9cacb] leading-relaxed font-sans">
                  Escolha o tom de comunicação que a Inteligência Artificial utilizará para formular os textos sugeridos de WhatsApp para os atletas:
                </p>

                {/* Motivador */}
                <label className="flex items-start gap-3 p-2.5 rounded-lg border border-[#3a494b]/15 bg-[#1b1c1e] hover:border-[#00f2ff]/40 transition-all cursor-pointer">
                  <input
                    type="radio"
                    name="aiTone"
                    value="motivating"
                    checked={aiTone === "motivating"}
                    onChange={() => setAiTone("motivating")}
                    className="mt-0.5 text-[#00f2ff] focus:ring-0 cursor-pointer"
                  />
                  <div>
                    <span className="font-bold text-[#e3e2e4] block">Motivador</span>
                    <span className="text-[10px] text-gray-400 block mt-0.5 leading-relaxed">
                      Alta energia, gírias fitness e jargões esportivos motivacionais positivos.
                    </span>
                  </div>
                </label>

                {/* Disciplinar / Exigente */}
                <label className="flex items-start gap-3 p-2.5 rounded-lg border border-[#3a494b]/15 bg-[#1b1c1e] hover:border-[#00f2ff]/40 transition-all cursor-pointer">
                  <input
                    type="radio"
                    name="aiTone"
                    value="strict"
                    checked={aiTone === "strict"}
                    onChange={() => setAiTone("strict")}
                    className="mt-0.5 text-[#00f2ff] focus:ring-0 cursor-pointer"
                  />
                  <div>
                    <span className="font-bold text-[#e3e2e4] block">Disciplinar (Exigente)</span>
                    <span className="text-[10px] text-gray-400 block mt-0.5 leading-relaxed">
                      Firme, direto, cobrando responsabilidade e consistência absoluta.
                    </span>
                  </div>
                </label>

                {/* Científico */}
                <label className="flex items-start gap-3 p-2.5 rounded-lg border border-[#3a494b]/15 bg-[#1b1c1e] hover:border-[#00f2ff]/40 transition-all cursor-pointer">
                  <input
                    type="radio"
                    name="aiTone"
                    value="academic"
                    checked={aiTone === "academic"}
                    onChange={() => setAiTone("academic")}
                    className="mt-0.5 text-[#00f2ff] focus:ring-0 cursor-pointer"
                  />
                  <div>
                    <span className="font-bold text-[#e3e2e4] block">Científico / Fisiológico</span>
                    <span className="text-[10px] text-gray-400 block mt-0.5 leading-relaxed">
                      Termos metabólicos, de síntese proteica e adaptações fisiológicas esportivas.
                    </span>
                  </div>
                </label>

                {/* Amigável */}
                <label className="flex items-start gap-3 p-2.5 rounded-lg border border-[#3a494b]/15 bg-[#1b1c1e] hover:border-[#00f2ff]/40 transition-all cursor-pointer">
                  <input
                    type="radio"
                    name="aiTone"
                    value="friendly"
                    checked={aiTone === "friendly"}
                    onChange={() => setAiTone("friendly")}
                    className="mt-0.5 text-[#00f2ff] focus:ring-0 cursor-pointer"
                  />
                  <div>
                    <span className="font-bold text-[#e3e2e4] block">Acolhedor (Empático)</span>
                    <span className="text-[10px] text-gray-400 block mt-0.5 leading-relaxed">
                      Muito compreensivo, apoiando flexibilidade e super amigável.
                    </span>
                  </div>
                </label>
              </div>
            </div>

            <button
              type="submit"
              className="w-full primary-gradient text-on-primary-fixed py-3 px-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:shadow-[0_0_20px_rgba(0,242,255,0.25)] active:scale-95 transition-all cursor-pointer"
            >
              <Save className="w-4 h-4" />
              Salvar Configurações
            </button>
          </div>
        </form>
      )}

      {/* 2. MUSCULACAO EXERCISES SECTION */}
      {activeTab === "musculacao" && (
        <div className="space-y-6 font-mono text-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h3 className="text-sm font-bold text-[#e3e2e4] uppercase tracking-wider flex items-center gap-2">
              <Dumbbell className="w-5 h-5 text-[#00f2ff]" />
              Banco de Exercícios de Musculação Tradicional
            </h3>
            
            <button
              onClick={() => setShowAddMuscForm(!showAddMuscForm)}
              className="bg-[#00f2ff]/10 border border-[#00f2ff]/30 text-[#00f2ff] hover:bg-[#00f2ff]/20 px-3 py-2 rounded-lg font-bold flex items-center gap-1 transition-all cursor-pointer"
            >
              {showAddMuscForm ? <ArrowLeft className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
              {showAddMuscForm ? "Cancelar" : "Novo Exercício"}
            </button>
          </div>

          {showAddMuscForm && (
            <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
              <div className="bg-[#151719] border border-[#3a494b]/40 rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 font-mono text-xs text-white space-y-4">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-[#3a494b]/20 pb-3">
                  <h4 className="text-sm font-extrabold text-[#e3e2e4] uppercase tracking-wider flex items-center gap-1.5">
                    <Dumbbell className="w-4 h-4 text-[#00f2ff]" />
                    Novo Exercício (Musculação)
                  </h4>
                  <button
                    type="button"
                    onClick={() => setShowAddMuscForm(false)}
                    className="text-gray-400 hover:text-white text-lg font-bold"
                  >
                    ✕
                  </button>
                </div>

                {/* Form Content */}
                <form onSubmit={handleAddMusculacao} className="space-y-4">
                  {/* Nome do Exercício */}
                  <div>
                    <label className="block text-[#b9cacb] font-bold mb-1 uppercase tracking-wider text-[10px]">
                      Nome do Exercício *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Agachamento Livre"
                      value={newMuscName}
                      onChange={(e) => setNewMuscName(e.target.value)}
                      className="w-full bg-[#1b1c1e] border border-[#3a494b]/40 text-white px-3 py-2 rounded-lg outline-none focus:border-[#00f2ff] font-mono text-xs"
                    />
                  </div>

                  {/* Grupo Muscular Primário */}
                  <div>
                    <label className="block text-[#b9cacb] font-bold mb-1 uppercase tracking-wider text-[10px]">
                      Grupo Muscular Primário *
                    </label>
                    <select
                      required
                      value={newMuscGroup}
                      onChange={(e) => setNewMuscGroup(e.target.value)}
                      className="w-full bg-[#1b1c1e] border border-[#3a494b]/40 text-white px-3 py-2 rounded-lg outline-none focus:border-[#00f2ff] font-mono text-xs"
                    >
                      <option value="">Selecione...</option>
                      {AVAILABLE_MUSCLES.map(m => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                  </div>

                  {/* Tipo */}
                  <div>
                    <label className="block text-[#b9cacb] font-bold mb-1 uppercase tracking-wider text-[10px]">
                      Tipo *
                    </label>
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2 cursor-pointer text-gray-300 hover:text-white">
                        <input
                          type="radio"
                          name="muscType"
                          value="Composto"
                          checked={newMuscType === "Composto"}
                          onChange={() => setNewMuscType("Composto")}
                          className="text-[#00f2ff] focus:ring-0 cursor-pointer"
                        />
                        Composto
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer text-gray-300 hover:text-white">
                        <input
                          type="radio"
                          name="muscType"
                          value="Isolado"
                          checked={newMuscType === "Isolado"}
                          onChange={() => setNewMuscType("Isolado")}
                          className="text-[#00f2ff] focus:ring-0 cursor-pointer"
                        />
                        Isolado
                      </label>
                    </div>
                  </div>

                  {/* Sinergistas (compostos) */}
                  <div>
                    <label className="block text-[#b9cacb] font-bold mb-1.5 uppercase tracking-wider text-[10px]">
                      Sinergistas (compostos)
                    </label>
                    <div className="grid grid-cols-2 gap-2 bg-[#1b1c1e]/40 p-3 rounded-lg border border-[#3a494b]/15 max-h-[160px] overflow-y-auto">
                      {AVAILABLE_MUSCLES.map(m => {
                        const checked = newMuscSinergistas.includes(m);
                        return (
                          <label key={m} className="flex items-center gap-2 cursor-pointer text-gray-300 hover:text-white select-none">
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setNewMuscSinergistas([...newMuscSinergistas, m]);
                                } else {
                                  setNewMuscSinergistas(newMuscSinergistas.filter(x => x !== m));
                                }
                              }}
                              className="rounded border-[#3a494b]/40 text-[#00f2ff] focus:ring-0 cursor-pointer"
                            />
                            <span>{m}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  {/* Faixa de Repetições */}
                  <div>
                    <label className="block text-[#b9cacb] font-bold mb-1 uppercase tracking-wider text-[10px]">
                      Faixa de Repetições *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: 8-12"
                      value={newMuscReps}
                      onChange={(e) => setNewMuscReps(e.target.value)}
                      className="w-full bg-[#1b1c1e] border border-[#3a494b]/40 text-white px-3 py-2 rounded-lg outline-none focus:border-[#00f2ff] font-mono text-xs"
                    />
                  </div>

                  {/* Observações */}
                  <div>
                    <label className="block text-[#b9cacb] font-bold mb-1 uppercase tracking-wider text-[10px]">
                      Observações (opcional)
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: Foco em contração máxima"
                      value={newMuscNotes}
                      onChange={(e) => setNewMuscNotes(e.target.value)}
                      className="w-full bg-[#1b1c1e] border border-[#3a494b]/40 text-white px-3 py-2 rounded-lg outline-none focus:border-[#00f2ff] font-mono text-xs"
                    />
                  </div>

                  {/* Buttons */}
                  <div className="flex justify-end gap-2 pt-2 border-t border-[#3a494b]/20">
                    <button
                      type="button"
                      onClick={() => setShowAddMuscForm(false)}
                      className="px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-[#b9cacb] hover:text-white transition-all cursor-pointer font-bold"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-lg bg-[#00f2ff] text-black hover:brightness-110 active:scale-95 transition-all cursor-pointer font-bold flex items-center gap-1"
                    >
                      <Save className="w-3.5 h-3.5" />
                      Salvar
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Filters & Search */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-[#121315]/40 p-4 rounded-xl border border-[#3a494b]/10">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-500" />
              <input
                type="text"
                placeholder="Buscar exercício..."
                value={muscSearch}
                onChange={(e) => setMuscSearch(e.target.value)}
                className="w-full bg-[#1b1c1e] pl-9 pr-3 py-2 rounded-lg border border-[#3a494b]/20 text-white outline-none focus:border-[#00f2ff]"
              />
            </div>

            <div>
              <select
                value={muscGroupFilter}
                onChange={(e) => setMuscGroupFilter(e.target.value)}
                className="w-full bg-[#1b1c1e] px-3 py-2 rounded-lg border border-[#3a494b]/20 text-white outline-none focus:border-[#00f2ff]"
              >
                <option value="Todos">Todos os Grupos</option>
                {AVAILABLE_MUSCLES.map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>

            <div className="text-right text-[#b9cacb] flex items-center justify-end px-2">
              <span>Mostrando <b>{filteredMusculacao.length}</b> de <b>{musculacaoExercises.length}</b> exercícios</span>
            </div>
          </div>

          {/* Muscle List Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredMusculacao.map((ex, index) => (
              <div
                key={index}
                className={`bg-[#1b1c1e]/90 hover:bg-[#1f2123] p-4 rounded-xl border transition-all duration-300 flex flex-col justify-between space-y-3 group ${
                  ex.desativado 
                    ? "opacity-50 border-[#3a494b]/10" 
                    : "border-[#3a494b]/20 hover:border-[#00f2ff]/40 hover:scale-[1.01] hover:shadow-[0_4px_20px_rgba(0,242,255,0.06)]"
                }`}
              >
                <div className="space-y-1.5">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className={`font-bold text-sm leading-tight transition-colors ${
                      ex.desativado 
                        ? "text-gray-500 line-through" 
                        : "text-[#e3e2e4] group-hover:text-[#00f2ff]"
                    }`}>
                      {ex.nome}
                    </h4>
                    
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => handleToggleMusculacao(ex.nome)}
                        className={`text-[9px] font-bold px-2 py-0.5 rounded transition-all cursor-pointer flex items-center gap-0.5 ${
                          ex.desativado 
                            ? "bg-[#00f2ff]/10 border border-[#00f2ff]/30 text-[#00f2ff] hover:bg-[#00f2ff]/20" 
                            : "bg-red-500/5 border border-red-500/20 text-red-400 hover:bg-red-500/15"
                        }`}
                        title={ex.desativado ? "Ativar exercício" : "Desativar temporariamente"}
                      >
                        <span>{ex.desativado ? "Ativar" : "⊘ Desativar"}</span>
                      </button>

                      <button
                        onClick={() => handleDeleteMusculacao(ex.nome)}
                        className="text-gray-500 hover:text-red-400 p-1 rounded hover:bg-gray-800/40 transition-all cursor-pointer"
                        title="Excluir exercício permanentemente"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  
                  {ex.observacoes ? (
                    <p className="text-[10px] text-gray-400 italic line-clamp-2">
                      Obs: {ex.observacoes}
                    </p>
                  ) : (
                    <p className="text-[10px] text-gray-500 italic">Sem observações adicionais</p>
                  )}
                </div>

                {/* Sinergistas / Tipo Details Section */}
                <div className="grid grid-cols-2 gap-2 py-2 border-t border-b border-[#3a494b]/10">
                  <div className="flex flex-col">
                    <span className="text-[9px] text-gray-500 uppercase tracking-wider font-semibold">Tipo</span>
                    <span className="text-[10px] text-gray-300 font-bold flex items-center gap-1">
                      🛠️ {ex.tipo}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[9px] text-gray-500 uppercase tracking-wider font-semibold">Sinergistas</span>
                    <span className="text-[10px] text-gray-300 font-bold truncate" title={ex.sinergistas?.join(", ") || "Nenhum"}>
                      🤝 {ex.sinergistas && ex.sinergistas.length > 0 ? ex.sinergistas.join(", ") : "Nenhum"}
                    </span>
                  </div>
                </div>

                {/* Badges footer */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  <span className="bg-[#00f2ff]/10 text-[#00f2ff] border border-[#00f2ff]/20 px-2.5 py-0.5 rounded-full text-[10px] font-bold">
                    🎯 {ex.grupo}
                  </span>
                  <span className="bg-[#121315] text-[#b9cacb] border border-[#3a494b]/20 px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono">
                    ⚙️ {ex.tipo}
                  </span>
                  <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono">
                    🔢 {ex.reps}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. FUNCTIONAL EXERCISES SECTION (CRITICAL USER REQUEST) */}
      {activeTab === "funcional" && (
        <div className="space-y-6 font-mono text-xs">
          
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h3 className="text-sm font-bold text-[#e3e2e4] uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#ebb2ff]" />
              Banco de Exercícios Funcionais Oficiais
            </h3>
            
            <button
              onClick={() => setShowAddFuncForm(!showAddFuncForm)}
              className="bg-[#ebb2ff]/10 border border-[#ebb2ff]/30 text-[#ebb2ff] hover:bg-[#ebb2ff]/20 px-3 py-2 rounded-lg font-bold flex items-center gap-1 transition-all cursor-pointer"
            >
              {showAddFuncForm ? <ArrowLeft className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
              {showAddFuncForm ? "Cancelar" : "Novo Exercício Funcional"}
            </button>
          </div>

          {/* STATS BANNER / KPIs (EXACTLY AS SPECIFIED IN USER REQUEST) */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
            <div className="glass-panel p-4 rounded-xl border border-[#3a494b]/20 flex flex-col justify-between hover:scale-[1.02] transition-transform">
              <span className="text-[10px] text-[#b9cacb] uppercase tracking-wider">Total</span>
              <span className="text-2xl font-black text-[#ebb2ff]">{totalFunc}</span>
            </div>
            <div className="glass-panel p-4 rounded-xl border border-[#3a494b]/20 flex flex-col justify-between hover:scale-[1.02] transition-transform">
              <span className="text-[10px] text-[#b9cacb] uppercase tracking-wider">TRX</span>
              <span className="text-2xl font-black text-white">{trxFunc}</span>
            </div>
            <div className="glass-panel p-4 rounded-xl border border-[#3a494b]/20 flex flex-col justify-between hover:scale-[1.02] transition-transform">
              <span className="text-[10px] text-[#b9cacb] uppercase tracking-wider">Corda</span>
              <span className="text-2xl font-black text-white">{cordaFunc}</span>
            </div>
            <div className="glass-panel p-4 rounded-xl border border-[#3a494b]/20 flex flex-col justify-between hover:scale-[1.02] transition-transform">
              <span className="text-[10px] text-[#b9cacb] uppercase tracking-wider">Escada</span>
              <span className="text-2xl font-black text-white">{escadaFunc}</span>
            </div>
            <div className="glass-panel p-4 rounded-xl border border-[#3a494b]/20 flex flex-col justify-between hover:scale-[1.02] transition-transform">
              <span className="text-[10px] text-[#b9cacb] uppercase tracking-wider">Medicine</span>
              <span className="text-2xl font-black text-white">{medicineFunc}</span>
            </div>
            <div className="glass-panel p-4 rounded-xl border border-[#3a494b]/20 flex flex-col justify-between hover:scale-[1.02] transition-transform">
              <span className="text-[10px] text-[#b9cacb] uppercase tracking-wider">Peso Corp.</span>
              <span className="text-2xl font-black text-white">{pesoCorpFunc}</span>
            </div>
          </div>

          {/* ADD NEW EXERCISE FORM WITH PRE-DETERMINED SCHEMAS */}
          {showAddFuncForm && (
            <form onSubmit={handleAddFunctional} className="glass-panel p-5 rounded-xl space-y-4 border border-[#ebb2ff]/20">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider border-b border-[#3a494b]/20 pb-2">
                Cadastrar Novo Exercício Funcional
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[#b9cacb] font-bold mb-1 uppercase tracking-wider text-[10px]">Nome do Exercício</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: TRX Remada"
                    value={newFuncName}
                    onChange={(e) => setNewFuncName(e.target.value)}
                    className="w-full bg-[#1b1c1e] border border-[#3a494b]/40 text-white px-3 py-2 rounded-lg outline-none focus:border-[#ebb2ff]"
                  />
                </div>

                <div>
                  <label className="block text-[#b9cacb] font-bold mb-1 uppercase tracking-wider text-[10px]">Grupo Muscular</label>
                  <select
                    value={newFuncGroup}
                    onChange={(e) => setNewFuncGroup(e.target.value as any)}
                    className="w-full bg-[#1b1c1e] border border-[#3a494b]/40 text-white px-3 py-2 rounded-lg outline-none focus:border-[#ebb2ff]"
                  >
                    <option value="superior">superior</option>
                    <option value="inferior">inferior</option>
                    <option value="core">core</option>
                    <option value="potencia">potencia</option>
                    <option value="fullbody">fullbody</option>
                    <option value="cardio">cardio</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[#b9cacb] font-bold mb-1 uppercase tracking-wider text-[10px]">Categoria</label>
                  <select
                    value={newFuncCategory}
                    onChange={(e) => setNewFuncCategory(e.target.value as any)}
                    className="w-full bg-[#1b1c1e] border border-[#3a494b]/40 text-white px-3 py-2 rounded-lg outline-none focus:border-[#ebb2ff]"
                  >
                    <option value="força">força</option>
                    <option value="potência">potência</option>
                    <option value="cardio">cardio</option>
                    <option value="agilidade">agilidade</option>
                    <option value="resistência">resistência</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[#b9cacb] font-bold mb-1 uppercase tracking-wider text-[10px]">Equipamento</label>
                  <select
                    value={newFuncEquip}
                    onChange={(e) => setNewFuncEquip(e.target.value as any)}
                    className="w-full bg-[#1b1c1e] border border-[#3a494b]/40 text-white px-3 py-2 rounded-lg outline-none focus:border-[#ebb2ff]"
                  >
                    <option value="TRX">TRX</option>
                    <option value="Corda Naval">Corda Naval</option>
                    <option value="Escada">Escada</option>
                    <option value="Medicine Ball">Medicine Ball</option>
                    <option value="Chapéus">Chapéus</option>
                    <option value="Cones">Cones</option>
                    <option value="Peso Corporal">Peso Corporal</option>
                    <option value="Combinado">Combinado</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[#b9cacb] font-bold mb-1 uppercase tracking-wider text-[10px]">Nível de Dificuldade</label>
                  <div className="flex gap-3 py-2">
                    {["iniciante", "intermediario", "avancado"].map((lvl) => (
                      <label key={lvl} className="flex items-center gap-1.5 cursor-pointer text-white">
                        <input
                          type="checkbox"
                          checked={newFuncLevels.includes(lvl)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setNewFuncLevels([...newFuncLevels, lvl]);
                            } else {
                              setNewFuncLevels(newFuncLevels.filter(l => l !== lvl));
                            }
                          }}
                          className="rounded text-[#ebb2ff] focus:ring-0 cursor-pointer"
                        />
                        <span className="capitalize text-[10px]">{lvl}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[#b9cacb] font-bold mb-1 uppercase tracking-wider text-[10px]">Impacto Articular</label>
                  <select
                    value={newFuncImpact}
                    onChange={(e) => setNewFuncImpact(e.target.value as any)}
                    className="w-full bg-[#1b1c1e] border border-[#3a494b]/40 text-white px-3 py-2 rounded-lg outline-none focus:border-[#ebb2ff]"
                  >
                    <option value="baixo">baixo</option>
                    <option value="medio">medio</option>
                    <option value="alto">alto</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[#b9cacb] font-bold mb-1 uppercase tracking-wider text-[10px]">Tempo Ativo Recomendado</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: 40s"
                    value={newFuncTime}
                    onChange={(e) => setNewFuncTime(e.target.value)}
                    className="w-full bg-[#1b1c1e] border border-[#3a494b]/40 text-white px-3 py-2 rounded-lg outline-none focus:border-[#ebb2ff]"
                  />
                </div>

                <div>
                  <label className="block text-[#b9cacb] font-bold mb-1 uppercase tracking-wider text-[10px]">Alunos Simultâneos</label>
                  <select
                    value={newFuncStudents}
                    onChange={(e) => setNewFuncStudents(e.target.value as any)}
                    className="w-full bg-[#1b1c1e] border border-[#3a494b]/40 text-white px-3 py-2 rounded-lg outline-none focus:border-[#ebb2ff]"
                  >
                    <option value="1 aluno">1 aluno</option>
                    <option value="ilimitado">ilimitado</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[#b9cacb] font-bold mb-1 uppercase tracking-wider text-[10px]">Tags Extras (separadas por vírgula)</label>
                  <input
                    type="text"
                    placeholder="Ex: braço, reabilitação"
                    value={newFuncTagsInput}
                    onChange={(e) => setNewFuncTagsInput(e.target.value)}
                    className="w-full bg-[#1b1c1e] border border-[#3a494b]/40 text-white px-3 py-2 rounded-lg outline-none focus:border-[#ebb2ff]"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="bg-[#ebb2ff] text-black font-black px-6 py-2.5 rounded-lg flex items-center justify-center gap-1.5 hover:shadow-[0_0_15px_rgba(235,178,255,0.25)] active:scale-95 transition-all cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  Salvar Exercício Funcional
                </button>
              </div>
            </form>
          )}

          {/* SEARCH AND FILTERS CARD */}
          <div className="glass-panel p-5 rounded-xl space-y-4">
            
            {/* Search Input */}
            <div>
              <label className="block text-[#b9cacb] font-bold mb-2 uppercase tracking-wider text-[10px]">
                Busca de Exercícios
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-500" />
                <input
                  type="text"
                  placeholder="🔍 Buscar exercício funcional..."
                  value={funcSearch}
                  onChange={(e) => setFuncSearch(e.target.value)}
                  className="w-full bg-[#1b1c1e] pl-9 pr-3 py-2.5 rounded-lg border border-[#3a494b]/30 text-white outline-none focus:border-[#ebb2ff]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Filter 1: Por Equipamento */}
              <div>
                <label className="block text-[#b9cacb] font-bold mb-2 uppercase tracking-wider text-[10px]">
                  Por Equipamento
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    "Todos",
                    "TRX",
                    "Corda Naval",
                    "Escada",
                    "Medicine Ball",
                    "Chapéus",
                    "Cones",
                    "Peso Corporal",
                    "Combinado"
                  ].map((eq) => (
                    <button
                      key={eq}
                      type="button"
                      onClick={() => setFuncEquipFilter(eq)}
                      className={`px-3 py-1.5 rounded text-[11px] font-bold transition-all border cursor-pointer ${
                        funcEquipFilter === eq 
                          ? "bg-[#ebb2ff] text-black border-[#ebb2ff]" 
                          : "bg-[#121315] text-[#b9cacb] border-[#3a494b]/20 hover:border-[#ebb2ff]/30"
                      }`}
                    >
                      {eq}
                    </button>
                  ))}
                </div>
              </div>

              {/* Filter 2: Por Grupo Muscular */}
              <div>
                <label className="block text-[#b9cacb] font-bold mb-2 uppercase tracking-wider text-[10px]">
                  Por Grupo Muscular
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    "Todos",
                    "superior",
                    "inferior",
                    "core",
                    "potencia",
                    "fullbody",
                    "cardio"
                  ].map((gp) => (
                    <button
                      key={gp}
                      type="button"
                      onClick={() => setFuncGroupFilter(gp)}
                      className={`px-3 py-1.5 rounded text-[11px] font-bold transition-all border cursor-pointer ${
                        funcGroupFilter === gp 
                          ? "bg-[#ebb2ff] text-black border-[#ebb2ff]" 
                          : "bg-[#121315] text-[#b9cacb] border-[#3a494b]/20 hover:border-[#ebb2ff]/30"
                      }`}
                    >
                      {gp}
                    </button>
                  ))}
                </div>
              </div>

            </div>

            <div className="text-right text-[#b9cacb] border-t border-[#3a494b]/10 pt-3">
              <span>Exibindo <b>{filteredFunctional.length}</b> de <b>{functionalExercises.length}</b> exercícios no catálogo funcional</span>
            </div>

          </div>

          {/* FUNCTIONAL EXERCISE LIST GRID (WITH STANDARD DETAILED CARD LAYOUT) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredFunctional.map((ex, idx) => (
              <div 
                key={idx}
                className="bg-[#1b1c1e]/90 hover:bg-[#1f2123] p-4 rounded-xl border border-[#00696f] flex flex-col justify-between hover:scale-[1.01] hover:shadow-[0_4px_20px_rgba(0,105,111,0.15)] transition-all duration-300 space-y-3 group"
              >
                <div className="space-y-1.5">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-bold text-white text-sm leading-tight group-hover:text-[#ebb2ff] transition-colors">{ex.nome}</h4>
                    <button
                      onClick={() => handleDeleteFunctional(ex.nome)}
                      className="text-gray-500 hover:text-red-400 p-1 rounded hover:bg-gray-800/40 transition-all cursor-pointer shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <span className="text-[10px] text-gray-400 font-mono font-bold block">⚙️ {ex.equipamento}</span>
                </div>

                {/* Attributes grid section */}
                <div className="grid grid-cols-3 gap-2 py-2 border-t border-b border-[#3a494b]/10">
                  <div className="flex flex-col">
                    <span className="text-[9px] text-gray-500 uppercase tracking-wider font-semibold">Foco</span>
                    <span className="text-[10px] text-gray-300 font-bold flex items-center gap-1">
                      🎯 {ex.grupo}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[9px] text-gray-500 uppercase tracking-wider font-semibold">Capacidade</span>
                    <span className="text-[10px] text-gray-300 font-bold flex items-center gap-1">
                      👥 {ex.alunos}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[9px] text-gray-500 uppercase tracking-wider font-semibold">Tempo</span>
                    <span className="text-[10px] text-gray-300 font-bold flex items-center gap-1">
                      ⏱ {ex.tempo}
                    </span>
                  </div>
                </div>

                {/* Badges footer */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  <span className="bg-[#ebb2ff]/10 text-[#ebb2ff] border border-[#ebb2ff]/20 px-2.5 py-0.5 rounded-full text-[10px] font-bold">
                    ⚡ {ex.categoria}
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                    ex.impacto === "baixo" ? "bg-green-950/30 text-green-400 border-green-900/30" : 
                    ex.impacto === "medio" ? "bg-yellow-950/30 text-yellow-400 border-yellow-900/30" : 
                    "bg-red-950/30 text-red-400 border-red-900/30"
                  }`}>
                    🟢 Impacto {ex.impacto}
                  </span>
                  
                  {ex.nivel.map(lvl => (
                    <span key={lvl} className="bg-purple-500/10 text-purple-300 border border-purple-500/20 px-2.5 py-0.5 rounded-full text-[10px] font-bold">
                      {lvl}
                    </span>
                  ))}

                  {ex.tags.map((tag, tagIdx) => (
                    <span key={tagIdx} className="bg-gray-800/60 text-gray-400 px-2.5 py-0.5 rounded-full text-[10px]">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>

        </div>
      )}

      {/* 4. PDF CUSTOMIZATION SECTION */}
      {activeTab === "pdf" && (
        <form onSubmit={(e) => {
          e.preventDefault();
          try {
            localStorage.setItem("treinopro_consultoria_config", JSON.stringify(consultingConfig));
            showNotification("Configurações da consultoria (PDF) salvas com sucesso!", "success", "Sucesso");
          } catch (err) {
            console.error(err);
            showNotification("Erro ao salvar configurações do PDF.", "warning", "Erro");
          }
        }} className="space-y-6 font-mono text-xs">
          
          <div className="glass-panel p-6 rounded-xl space-y-4">
            <h3 className="text-sm font-bold text-cyan-400 uppercase tracking-wider border-b border-[#3a494b]/20 pb-2 flex items-center gap-2">
              <Settings className="w-5 h-5" /> Personalizar Dados & Design da Consultoria (PDF)
            </h3>
            
            <p className="text-xs text-[#b9cacb] leading-relaxed font-sans">
              Personalize o relatório de avaliação física de 13 páginas gerado em PDF com seus dados de identificação profissional, contatos da sua marca e o esquema de cores que melhor combina com a sua identidade visual.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              {/* Evaluator Name */}
              <div className="space-y-1.5">
                <label className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Seu Nome Completo</label>
                <input
                  type="text"
                  value={consultingConfig.evaluatorName}
                  onChange={(e) => setConsultingConfig({ ...consultingConfig, evaluatorName: e.target.value })}
                  className="w-full bg-[#1b1c1e] border border-[#3a494b]/40 focus:border-cyan-500 rounded-xl px-3 py-2 text-white outline-none transition-all"
                  placeholder="Prof. Gustavo Workout"
                  required
                />
              </div>

              {/* Evaluator CREF */}
              <div className="space-y-1.5">
                <label className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Seu Registro CREF</label>
                <input
                  type="text"
                  value={consultingConfig.evaluatorCref}
                  onChange={(e) => setConsultingConfig({ ...consultingConfig, evaluatorCref: e.target.value })}
                  className="w-full bg-[#1b1c1e] border border-[#3a494b]/40 focus:border-cyan-500 rounded-xl px-3 py-2 text-white outline-none transition-all"
                  placeholder="054112-G/SP"
                  required
                />
              </div>

              {/* Como prefere ser chamado / Assinatura */}
              <div className="space-y-1.5 md:col-span-2 bg-[#121315] p-3 rounded-xl border border-[#3a494b]/20">
                <label className="text-[10px] text-cyan-400 uppercase font-bold tracking-wider block">Como prefere ser chamado / Assinatura (Mensagens & Laudo)</label>
                <input
                  type="text"
                  value={consultingConfig.shortName || ""}
                  onChange={(e) => setConsultingConfig({ ...consultingConfig, shortName: e.target.value })}
                  className="w-full bg-[#1b1c1e] border border-[#3a494b]/40 focus:border-cyan-500 rounded-xl px-3 py-2 text-white outline-none transition-all mt-1"
                  placeholder="Ex: Gustavo (Deixe em branco para usar seu nome completo)"
                />
                <p className="text-[9px] text-[#b9cacb] font-sans mt-1 leading-relaxed">
                  Insira o nome pelo qual deseja assinar as mensagens de WhatsApp geradas por IA e os laudos técnicos (ex: usar apenas <strong>&quot;Gustavo&quot;</strong> ou <strong>&quot;Rodrigo&quot;</strong> em vez do nome completo ou títulos como <strong>&quot;Personal Mangabeira&quot;</strong> ou <strong>&quot;Prof. Gustavo Workout&quot;</strong>). Se deixado em branco, o sistema usará o nome completo.
                </p>
              </div>

              {/* Logo Text */}
              <div className="space-y-1.5">
                <label className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Nome da Marca (Topo/Logo)</label>
                <input
                  type="text"
                  value={consultingConfig.logoText}
                  onChange={(e) => setConsultingConfig({ ...consultingConfig, logoText: e.target.value })}
                  className="w-full bg-[#1b1c1e] border border-[#3a494b]/40 focus:border-cyan-500 rounded-xl px-3 py-2 text-white outline-none transition-all"
                  placeholder="TREINOPRO"
                  required
                />
              </div>

              {/* Slogan */}
              <div className="space-y-1.5">
                <label className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Slogan da Consultoria</label>
                <input
                  type="text"
                  value={consultingConfig.slogan}
                  onChange={(e) => setConsultingConfig({ ...consultingConfig, slogan: e.target.value })}
                  className="w-full bg-[#1b1c1e] border border-[#3a494b]/40 focus:border-cyan-500 rounded-xl px-3 py-2 text-white outline-none transition-all"
                  placeholder="PLATAFORMA INTELIGENTE DE PERFORMANCE"
                  required
                />
              </div>

              {/* Company Name */}
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Razão Social / Nome da Empresa</label>
                <input
                  type="text"
                  value={consultingConfig.companyName}
                  onChange={(e) => setConsultingConfig({ ...consultingConfig, companyName: e.target.value })}
                  className="w-full bg-[#1b1c1e] border border-[#3a494b]/40 focus:border-cyan-500 rounded-xl px-3 py-2 text-white outline-none transition-all"
                  placeholder="ACADEMIA TREINOPRO LTDA"
                  required
                />
              </div>

              {/* Address */}
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Endereço de Atendimento / Comercial (Opcional)</label>
                <input
                  type="text"
                  value={consultingConfig.address}
                  onChange={(e) => setConsultingConfig({ ...consultingConfig, address: e.target.value })}
                  className="w-full bg-[#1b1c1e] border border-[#3a494b]/40 focus:border-cyan-500 rounded-xl px-3 py-2 text-white outline-none transition-all text-xs"
                  placeholder="Deixe em branco se for atendimento online (ex: Consultoria Online)"
                />
                <p className="text-[9px] text-gray-500 font-sans">Se deixado em branco, o PDF exibirá automaticamente &quot;Atendimento &amp; Consultoria Online&quot;.</p>
              </div>

              {/* Phone */}
              <div className="space-y-1.5">
                <label className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Telefone / WhatsApp</label>
                <input
                  type="text"
                  value={consultingConfig.phone}
                  onChange={(e) => setConsultingConfig({ ...consultingConfig, phone: e.target.value })}
                  className="w-full bg-[#1b1c1e] border border-[#3a494b]/40 focus:border-cyan-500 rounded-xl px-3 py-2 text-white outline-none transition-all text-xs"
                  placeholder="(11) 98888-7777"
                  required
                />
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <label className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Email de Contato</label>
                <input
                  type="email"
                  value={consultingConfig.email}
                  onChange={(e) => setConsultingConfig({ ...consultingConfig, email: e.target.value })}
                  className="w-full bg-[#1b1c1e] border border-[#3a494b]/40 focus:border-cyan-500 rounded-xl px-3 py-2 text-white outline-none transition-all text-xs"
                  placeholder="suporte@treinopro.com.br"
                  required
                />
              </div>

              {/* Website */}
              <div className="space-y-1.5">
                <label className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Site Oficial / Linktree (Opcional)</label>
                <input
                  type="text"
                  value={consultingConfig.website}
                  onChange={(e) => setConsultingConfig({ ...consultingConfig, website: e.target.value })}
                  className="w-full bg-[#1b1c1e] border border-[#3a494b]/40 focus:border-cyan-500 rounded-xl px-3 py-2 text-white outline-none transition-all text-xs"
                  placeholder="www.treinopro.com.br"
                />
                <p className="text-[9px] text-gray-500 font-sans">Se deixado em branco, será omitido dos rodapés do PDF.</p>
              </div>

              {/* QR Link */}
              <div className="space-y-1.5">
                <label className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Link de Verificação (Selo QR)</label>
                <input
                  type="text"
                  value={consultingConfig.qrLink}
                  onChange={(e) => setConsultingConfig({ ...consultingConfig, qrLink: e.target.value })}
                  className="w-full bg-[#1b1c1e] border border-[#3a494b]/40 focus:border-cyan-500 rounded-xl px-3 py-2 text-white outline-none transition-all"
                  placeholder="treinopro.com.br/aluno"
                  required
                />
                <button
                  type="button"
                  onClick={() => {
                    const dynamicUrl = typeof window !== "undefined" ? (window.location.origin + "/?role=aluno") : "https://treinopro.com.br/aluno";
                    navigator.clipboard.writeText(dynamicUrl);
                    showNotification("Link de acesso direto do aluno copiado para a área de transferência! Envie pelo WhatsApp para seus alunos.", "success");
                  }}
                  className="mt-1.5 inline-flex items-center gap-1.5 text-[10px] text-cyan-400 hover:text-cyan-300 font-mono font-bold tracking-wider hover:underline"
                >
                  <span>📋 COPIAR LINK PORTAL DO ALUNO</span>
                </button>
              </div>
            </div>

            {/* Identidade Visual / Cores */}
            <div className="space-y-3 pt-4 border-t border-[#3a494b]/15">
              <label className="text-[10px] text-gray-400 uppercase font-bold block tracking-wider">Identidade Visual (Paleta de Cores do PDF)</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[
                  { id: "blue", label: "Azul Slate (Clássico)", bg: "bg-blue-600" },
                  { id: "emerald", label: "Verde Bio (Saúde)", bg: "bg-emerald-600" },
                  { id: "crimson", label: "Vermelho Force (Força)", bg: "bg-red-600" },
                  { id: "purple", label: "Roxo Zen (Mental)", bg: "bg-purple-600" },
                  { id: "amber", label: "Ouro Premium (Premium)", bg: "bg-amber-600" },
                  { id: "slate", label: "Grafite Steel (Tech)", bg: "bg-slate-600" }
                ].map((theme) => (
                  <button
                    key={theme.id}
                    type="button"
                    onClick={() => setConsultingConfig({ ...consultingConfig, themeId: theme.id as any })}
                    className={`flex items-center gap-2.5 p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      consultingConfig.themeId === theme.id
                        ? "border-cyan-450 bg-cyan-950/10 text-white shadow-[0_0_15px_rgba(34,211,238,0.1)]"
                        : "border-[#3a494b]/20 bg-[#161719]/40 text-gray-400 hover:border-gray-700"
                    }`}
                  >
                    <span className={`w-3.5 h-3.5 rounded-full ${theme.bg} shrink-0`}></span>
                    <span className="text-[11px] font-sans font-medium truncate">{theme.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end pt-4 border-t border-[#3a494b]/15">
              <button
                type="submit"
                className="px-6 py-3 bg-cyan-500 hover:bg-cyan-400 text-black font-bold rounded-xl transition-all flex items-center gap-2 active:scale-95 cursor-pointer hover:shadow-[0_0_20px_rgba(34,211,238,0.25)]"
              >
                <Save className="w-4 h-4" /> Salvar Personalização do PDF
              </button>
            </div>
          </div>
        </form>
      )}

      <ConfirmModal
        isOpen={isConfirmDeleteOpen}
        title="Remover Exercício do Banco"
        message={`Deseja realmente remover o exercício "${deleteTargetName}" do banco de dados? Esta ação é permanente e removerá o exercício das listas de prescrição.`}
        confirmLabel="Remover"
        cancelLabel="Cancelar"
        onConfirm={confirmDeleteExercise}
        onCancel={() => {
          setIsConfirmDeleteOpen(false);
          setDeleteType(null);
          setDeleteTargetName("");
        }}
        variant="danger"
      />

    </div>
  );
}
