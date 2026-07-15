/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Dumbbell, 
  User, 
  TrendingUp, 
  MessageSquare, 
  CreditCard, 
  ArrowLeft, 
  Flame, 
  CheckCircle, 
  Play, 
  Clock, 
  Camera,
  Info, 
  ChevronRight, 
  ChevronDown,
  ChevronUp,
  Plus, 
  Sparkles, 
  Send, 
  AlertTriangle, 
  Check, 
  X, 
  Phone, 
  FileText, 
  Music,
  Image as ImageIcon,
  Eye, 
  BookOpen, 
  Compass, 
  Volume2, 
  VolumeX, 
  Award, 
  Search, 
  ChevronLeft,
  DollarSign,
  Lock,
  RefreshCw,
  Zap,
  Activity,
  Heart,
  Bell,
  LogOut,
  Globe,
  Download,
  Shield,
  Calendar,
  Trophy,
  Brain,
  Smartphone,
  Sun,
  Moon
} from "lucide-react";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  AreaChart,
  Area
} from "recharts";
import { Student, Workout, Exercise, Diet, Meal, Payment, CoachSettings } from "../types";
import { auth } from "../shared/infrastructure/firebase/firebase";
import { 
  signInWithEmailAndPassword, 
  signOut, 
  sendPasswordResetEmail, 
  createUserWithEmailAndPassword 
} from "firebase/auth";

interface AppAlunoViewProps {
  students: Student[];
  workouts: Workout[];
  diets: Diet[];
  payments: Payment[];
  onBackToTrainer: () => void;
  onUpdateStudent: (student: Student) => void;
  onSaveWorkout: (workout: Workout) => void;
  coachSettings: CoachSettings;
  userRole?: "coach" | "aluno" | null;
}

// Default exercise details for the Exercise Library
const EXERCISE_LIBRARY_DATA = [
  {
    name: "Agachamento Livre",
    category: "Quadríceps",
    videoUrl: "https://images.unsplash.com/photo-1574680096145-d05b474e2155?auto=format&fit=crop&q=80&w=400",
    execution: [
      "Posicione a barra nos trapézios (não no pescoço) e mantenha os pés na largura dos ombros.",
      "Inicie o movimento projetando o quadril para trás, como se fosse sentar em uma cadeira.",
      "Desça até o quadril passar da linha dos joelhos (ou até onde conseguir manter a coluna neutra).",
      "Empurre o chão com os calcanhares para retornar à posição inicial, contraindo os glúteos."
    ],
    commonMistakes: "Projetar os joelhos para dentro (valgo dinâmico), tirar os calcanhares do chão e curvar a lombar (retroversão pélvica).",
    tips: "Mantenha o abdômen altamente contraído durante todo o movimento e foque o olhar ligeiramente à frente.",
    breathing: "Inspire na descida (fase excêntrica) e solte o ar na subida (fase concêntrica).",
    tempo: "3-0-1-0 (3s para descer, sem pausa embaixo, 1s para subir)."
  },
  {
    name: "Supino Reto",
    category: "Peitoral",
    videoUrl: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&q=80&w=400",
    execution: [
      "Deite-se no banco, apoie firmemente os pés no chão e faça uma leve ponte na lombar.",
      "Retraia as escápulas e apoie os ombros firmemente no estofado do banco.",
      "Segure a barra um pouco além da largura dos ombros e retire-a do suporte.",
      "Desça a barra de forma controlada até tocar suavemente a linha do mamilo.",
      "Empurre a barra para cima, estendendo os braços sem perder a retração escapular."
    ],
    commonMistakes: "Abrir demais os cotovelos (ângulo de 90° com o tronco), tirar as escápulas do banco no topo e bater a barra no peito.",
    tips: "Mantenha os cotovelos em um ângulo seguro de 45° a 60° em relação ao seu tronco para proteger os ombros.",
    breathing: "Inspire descendo a barra e expire na subida.",
    tempo: "3-1-1-0 (3s descendo, 1s de pausa no peito, 1s empurrando)."
  },
  {
    name: "Puxada Alta (Pulldown)",
    category: "Costas",
    videoUrl: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&q=80&w=400",
    execution: [
      "Ajuste o rolo de suporte para as pernas e segure a barra com pegada pronada aberta.",
      "Sente-se e estabilize os pés. Inicie o movimento deprimindo as escápulas (ombros para baixo).",
      "Puxe a barra em direção ao peito superior, inclinando o tronco ligeiramente para trás.",
      "Aperte as costas no final do movimento e retorne à posição inicial de forma controlada."
    ],
    commonMistakes: "Usar impulso excessivo do tronco (gangorra), puxar a barra atrás do pescoço ou curvar os ombros para frente.",
    tips: "Imagine que está puxando com os cotovelos e não com as mãos para maximizar a ativação do latíssimo do dorso.",
    breathing: "Solte o ar ao puxar (fase concêntrica) e inspire ao retornar à posição inicial.",
    tempo: "2-0-2-0 (2s para descer, 2s para subir)."
  },
  {
    name: "Cadeira Extensora",
    category: "Quadríceps",
    videoUrl: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&q=80&w=400",
    execution: [
      "Ajuste o encosto de forma que a articulação do joelho fique alinhada com o eixo da máquina.",
      "Posicione o rolo almofadado logo acima do tornozelo.",
      "Segure firme nos apoios laterais para travar o quadril contra o banco.",
      "Estenda os joelhos completamente, contraindo os quadríceps no topo por 1 segundo.",
      "Desça o peso de forma controlada até o ponto inicial, sem deixar as placas baterem."
    ],
    commonMistakes: "Tirar o quadril do banco durante a extensão, usar impulso excessivo e deixar o pé solto (mantenha flexão dorsal).",
    tips: "Faça uma contração de pico de 1s no topo da repetição para estimular as fibras musculares mais profundas.",
    breathing: "Expire ao estender as pernas e inspire ao retornar.",
    tempo: "3-1-2-0 (3s para descer, 1s de pausa no topo, 2s para subir)."
  }
];

export default function AppAlunoView({
  students,
  workouts,
  diets,
  payments,
  onBackToTrainer,
  onUpdateStudent,
  onSaveWorkout,
  coachSettings,
  userRole
}: AppAlunoViewProps) {
  
  const isCapacitor = typeof window !== "undefined" && (
    (window as any).Capacitor || 
    (window as any).hasOwnProperty("Capacitor") ||
    navigator.userAgent.includes("Capacitor")
  );

  const [usePhoneFrame, setUsePhoneFrame] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const frameParam = params.get("frame");
      if (frameParam === "true") return true;
      if (frameParam === "false") return false;
    }
    // If we are accessed directly as an athlete, don't show the simulated phone outline
    return userRole !== "aluno";
  });
  
  // Choose student to simulate
  const [simulatedStudentId, setSimulatedStudentId] = useState<string>(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const queryId = params.get("studentId") || params.get("alunoId");
      if (queryId) return queryId;
    }
    return students.length > 0 ? students[0].id : "stud-seeded-gustavo";
  });

  const activeStudent = students.find(s => s.id === simulatedStudentId) || students[0];

  const [syncCounter, setSyncCounter] = useState<number>(0);

  useEffect(() => {
    const handleSyncComplete = () => {
      setSyncCounter(prev => prev + 1);
    };
    window.addEventListener("treinopro_sync_completed", handleSyncComplete);
    return () => window.removeEventListener("treinopro_sync_completed", handleSyncComplete);
  }, []);

  useEffect(() => {
    import("../shared/infrastructure/sync/SyncManager").then(({ SyncManager }) => {
      SyncManager.getInstance().sync();
    }).catch(err => {
      console.warn("Failed to trigger SyncManager inside student app view:", err);
    });
  }, [simulatedStudentId]);

  const [isSimulatedOverdue, setIsSimulatedOverdue] = useState<boolean>(false);
  const [showDesafiosModal, setShowDesafiosModal] = useState<boolean>(false);

  // Check if student has any overdue payment in real payments list OR simulated overdue flag
  const hasOverduePayment = useMemo(() => {
    if (isSimulatedOverdue) return true;
    if (activeStudent?.status === "inactive") return true;
    return payments.some(p => p.studentId === activeStudent?.id && p.status === "overdue");
  }, [activeStudent?.id, payments, isSimulatedOverdue]);

  // Load dynamic student gamification parameters from common coach storage
  const activeStudentGamification = useMemo(() => {
    const saved = localStorage.getItem("treinopro_students_gamification");
    if (saved) {
      try {
        const data = JSON.parse(saved);
        if (data[activeStudent.id]) {
          return data[activeStudent.id];
        }
      } catch (e) { console.error(e); }
    }
    // Default fallback
    return {
      level: activeStudent.email.includes("gustavo") ? 12 : 5,
      xp: activeStudent.email.includes("gustavo") ? 8450 : 3400,
      pointsNeeded: activeStudent.email.includes("gustavo") ? 10000 : 5000,
      nextRank: activeStudent.email.includes("gustavo") ? "Atleta Elite" : "Atleta Praticante",
      streakDays: activeStudent.email.includes("gustavo") ? 18 : 6
    };
  }, [activeStudent.id, payments]);

  const dynamicRanking = useMemo(() => {
    const saved = localStorage.getItem("treinopro_students_gamification");
    let gamif: Record<string, any> = {};
    if (saved) {
      try { gamif = JSON.parse(saved); } catch (e) {}
    }
    
    // Merge with students array
    const list = students.map(s => {
      const g = gamif[s.id] || {
        level: s.email.includes("gustavo") ? 12 : 5,
        xp: s.email.includes("gustavo") ? 8450 : 3400,
        streakDays: s.email.includes("gustavo") ? 18 : 6
      };
      return {
        id: s.id,
        name: s.name,
        xp: g.xp,
        level: g.level,
        streakDays: g.streakDays,
        me: s.id === activeStudent.id
      };
    });

    // Add Sofia, Lucas, Patricia if they are not in the main list to keep the community feel
    const communityNames = ["Sofia Alencar", "Lucas Santos", "Patricia Lima"];
    communityNames.forEach(name => {
      if (!list.some(s => s.name.includes(name))) {
        let xp = name.includes("Sofia") ? 11450 : name.includes("Lucas") ? 7100 : 5200;
        let level = name.includes("Sofia") ? 15 : name.includes("Lucas") ? 10 : 8;
        let streak = name.includes("Sofia") ? 24 : name.includes("Lucas") ? 15 : 12;
        list.push({
          id: `community-${name}`,
          name,
          xp,
          level,
          streakDays: streak,
          me: false
        });
      }
    });

    return list.sort((a, b) => b.xp - a.xp);
  }, [students, activeStudent.id, payments]);

  // Load dynamic challenges configured by Coach
  const localChallenges = useMemo(() => {
    const saved = localStorage.getItem("treinopro_challenges");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Error reading challenges", e);
      }
    }
    return [
      {
        id: "chal-1",
        title: "Guerreiro Consistente 🛡️",
        description: "Complete no mínimo 20 treinos na assessoria neste mês para ganhar o selo de Consistência e 1.000 XP no ranking!",
        badge: "JULHO SAZONAL",
        targetCount: 20,
        xpReward: 1000,
        category: "consistency",
        endDate: "31/07/2026"
      },
      {
        id: "chal-2",
        title: "Carga Suprema 💪",
        description: "Aumente pelo menos 10% de carga média no Agachamento Livre neste trimestre.",
        badge: "FORÇA INTACTA",
        targetCount: 10,
        xpReward: 500,
        category: "load",
        endDate: "15/08/2026"
      }
    ];
  }, [activeStudent.id, showDesafiosModal]);

  // Student Auth Session
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    const saved = localStorage.getItem("treinopro_aluno_logged_in");
    return saved === "true";
  });
  const [loginEmail, setLoginEmail] = useState<string>("");
  const [loginPassword, setLoginPassword] = useState<string>("");
  const [loginError, setLoginError] = useState<string | null>(null);
  const [showPasswordRecovery, setShowPasswordRecovery] = useState<boolean>(false);
  const [recoveryEmail, setRecoveryEmail] = useState<string>("");
  const [recoveryMessage, setRecoveryMessage] = useState<string | null>(null);

  // Modal displays
  const [showCheckinModal, setShowCheckinModal] = useState<boolean>(false);
  const [showHistoryModal, setShowHistoryModal] = useState<boolean>(false);
  const [showCalendarModal, setShowCalendarModal] = useState<boolean>(false);
  const [showConquistasModal, setShowConquistasModal] = useState<boolean>(false);
  const [showRankingModal, setShowRankingModal] = useState<boolean>(false);
  const [showFinanceiroModal, setShowFinanceiroModal] = useState<boolean>(false);
  const [showInsightsModal, setShowInsightsModal] = useState<boolean>(false);
  const [showNotificationsModal, setShowNotificationsModal] = useState<boolean>(false);
  const [showInstallGuideModal, setShowInstallGuideModal] = useState<boolean>(false);

  // Chat extras
  const [chatSearchQuery, setChatSearchQuery] = useState<string>("");
  const [replyingMessage, setReplyingMessage] = useState<any | null>(null);
  const [isRecordingAudio, setIsRecordingAudio] = useState<boolean>(false);
  const [recordingSeconds, setRecordingSeconds] = useState<number>(0);
  const [showAttachmentMenu, setShowAttachmentMenu] = useState<boolean>(false);

  // Time-range filter for Evolution
  const [evolutionTimeRange, setEvolutionTimeRange] = useState<30 | 60 | 90 | 180>(90);
  const [evolutionTab, setEvolutionTab] = useState<"graficos" | "recordes" | "consistencia">("graficos");

  // Selected history entry for detail view
  const [selectedHistoryEntry, setSelectedHistoryEntry] = useState<any | null>(null);

  // Simulated student workouts history
  const [completedWorkoutsHistory, setCompletedWorkoutsHistory] = useState<any[]>(() => {
    const key = `completed_workouts_${simulatedStudentId}`;
    const saved = localStorage.getItem(key);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return [
      {
        id: "hist-1",
        name: "Treino A - Peitoral & Tríceps",
        date: "Hoje",
        duration: "52 min",
        volume: 11200,
        exercises: [
          { name: "Supino Reto", sets: "4 séries", bestWeight: "32kg" },
          { name: "Crucifixo Reto Halter", sets: "3 séries", bestWeight: "18kg" },
          { name: "Tríceps Corda", sets: "4 séries", bestWeight: "25kg" }
        ]
      },
      {
        id: "hist-2",
        name: "Treino B - Dorsais & Bíceps",
        date: "Ontem",
        duration: "47 min",
        volume: 9800,
        exercises: [
          { name: "Puxada Alta", sets: "4 séries", bestWeight: "50kg" },
          { name: "Remada Baixa", sets: "3 séries", bestWeight: "45kg" },
          { name: "Rosca Direta", sets: "3 séries", bestWeight: "14kg" }
        ]
      },
      {
        id: "hist-3",
        name: "Treino C - Membros Inferiores",
        date: "Semana passada",
        duration: "58 min",
        volume: 14600,
        exercises: [
          { name: "Agachamento Livre", sets: "4 séries", bestWeight: "80kg" },
          { name: "Cadeira Extensora", sets: "4 séries", bestWeight: "70kg" },
          { name: "Mesa Flexora", sets: "3 séries", bestWeight: "45kg" }
        ]
      }
    ];
  });

  // Daily Check-in values
  const [checkinValues, setCheckinValues] = useState({
    sleepHours: 8,
    sleepQuality: "normal",
    fatigue: 3,
    pain: 2,
    stress: 3,
    motivation: 8,
    weight: ""
  });

  // Simulator controls
  const [customCoachMessage, setCustomCoachMessage] = useState<string>("");
  const [showSimNotification, setShowSimNotification] = useState<string | null>(null);

  // App internal navigation
  const [activeSubTab, setActiveSubTab] = useState<"inicio" | "treino" | "evolucao" | "chat" | "perfil">("inicio");

  // Daily Check-in state
  const [hasDoneCheckinToday, setHasDoneCheckinToday] = useState<boolean>(false);
  const [streakDays, setStreakDays] = useState<number>(18); // set to 18 as per user mock specs

  // Active training execution state
  const [isExecutingWorkout, setIsExecutingWorkout] = useState<boolean>(false);
  const [activeExecutingWorkout, setActiveExecutingWorkout] = useState<Workout | null>(null);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState<number>(0);
  const [completedSets, setCompletedSets] = useState<Record<string, boolean>>({}); // key: exerciseId-setIndex (e.g. "ex1-0")
  const [recordedWeights, setRecordedWeights] = useState<Record<string, number>>({}); // key: exerciseId-setIndex
  const [recordedReps, setRecordedReps] = useState<Record<string, string>>({}); // key: exerciseId-setIndex
  const [recordedRPE, setRecordedRPE] = useState<Record<string, number>>({}); // key: exerciseId-setIndex
  const [recordedPain, setRecordedPain] = useState<Record<string, "none" | "mild" | "moderate" | "severe">>({}); // key: exerciseId
  const [workoutTimer, setWorkoutTimer] = useState<number>(0);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Confetti / Completion modal
  const [showCompletionModal, setShowCompletionModal] = useState<boolean>(false);
  const [completedWorkoutStats, setCompletedWorkoutStats] = useState<{
    totalTime: string;
    totalVolume: number;
    setsCompleted: number;
  } | null>(null);

  // Rest countdown timer state
  const [restTimer, setRestTimer] = useState<number | null>(null);
  const [restTimerMax, setRestTimerMax] = useState<number>(60);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const restIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Expanded workouts toggle (Option 1) and selected pre-workout detail view (Option 3)
  const [expandedWorkoutIds, setExpandedWorkoutIds] = useState<Record<string, boolean>>({});
  const [selectedPreWorkout, setSelectedPreWorkout] = useState<Workout | null>(null);

  // Exercise Library state
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedLibraryExercise, setSelectedLibraryExercise] = useState<typeof EXERCISE_LIBRARY_DATA[0] | null>(null);
  const [showLibraryDrawer, setShowLibraryDrawer] = useState<boolean>(false);

  // Before/after photo slider state (0 to 100 representing position)
  const [sliderPosition, setSliderPosition] = useState<number>(50);
  const [isDraggingSlider, setIsDraggingSlider] = useState<boolean>(false);

  // Postural analysis expand
  const [expandedLaudo, setExpandedLaudo] = useState<"antropo" | "postura" | null>(null);

  // AI Coach state
  const [chatMessages, setChatMessages] = useState<Array<{ sender: "student" | "coach" | "system", text: string, timestamp: string }>>([
    { 
      sender: "coach", 
      text: "Fala campeão! Sou seu Coach Virtual. Estou por dentro da sua ficha de treinos e dieta planejados pelo seu professor. Como posso te ajudar a voar hoje no treino?", 
      timestamp: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }) 
    }
  ]);
  const [inputMessage, setInputMessage] = useState<string>("");
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Professor Chat states
  const [chatMode, setChatMode] = useState<"ia" | "professor">("ia");
  const [profInputMessage, setProfInputMessage] = useState<string>("");
  const [professorHistories, setProfessorHistories] = useState<Record<string, any[]>>(() => {
    const saved = localStorage.getItem("treinopro_chat_histories");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return {};
  });

  // Keep chat histories synchronized with localStorage
  useEffect(() => {
    if (activeSubTab !== "chat") return;
    const interval = setInterval(() => {
      const saved = localStorage.getItem("treinopro_chat_histories");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setProfessorHistories(prev => {
            if (JSON.stringify(prev) !== saved) {
              return parsed;
            }
            return prev;
          });
        } catch (err) {
          console.error(err);
        }
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [activeSubTab]);

  // Interactive states for Aluno Profile
  const [expandedProfileSection, setExpandedProfileSection] = useState<string | null>(null);
  const [selectedEvaluation, setSelectedEvaluation] = useState<any | null>(null);
  const [profileNotifications, setProfileNotifications] = useState({
    treino: true,
    chat: true,
    pagamentos: true,
    conquistas: true,
    checkIn: true
  });
  const [appearanceMode, setAppearanceMode] = useState<"claro" | "escuro" | "auto">("escuro");
  const [uploadingReceipt, setUploadingReceipt] = useState<boolean>(false);
  const [receiptSent, setReceiptSent] = useState<boolean>(false);

  const toggleSection = (section: string) => {
    setExpandedProfileSection(prev => prev === section ? null : section);
  };


  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "treinopro_chat_histories" && e.newValue) {
        try {
          setProfessorHistories(JSON.parse(e.newValue));
        } catch (err) {
          console.error(err);
        }
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // --- CLIENT-SIDE PROP PROTECTION & ANTI-REVERSE ENGINEERING SYSTEM ---
  useEffect(() => {
    // 1. Prevent Right-Click to stop casual element inspection
    const preventContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };
    document.addEventListener("contextmenu", preventContextMenu);

    // 2. Block hotkeys for DevTools, View Source, and Page Saving
    const preventDevToolsKeys = (e: KeyboardEvent) => {
      // F12 key
      if (e.key === "F12" || e.keyCode === 123) {
        e.preventDefault();
        return;
      }
      // Ctrl+Shift+I or Cmd+Opt+I
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === "I" || e.key === "i" || e.keyCode === 73)) {
        e.preventDefault();
        return;
      }
      // Ctrl+Shift+J or Cmd+Opt+J
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === "J" || e.key === "j" || e.keyCode === 74)) {
        e.preventDefault();
        return;
      }
      // Ctrl+Shift+C or Cmd+Opt+C
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === "C" || e.key === "c" || e.keyCode === 67)) {
        e.preventDefault();
        return;
      }
      // Ctrl+U or Cmd+Opt+U (View Page Source)
      if ((e.ctrlKey || e.metaKey) && (e.key === "U" || e.key === "u" || e.keyCode === 85)) {
        e.preventDefault();
        return;
      }
      // Ctrl+S or Cmd+S (Save Page)
      if ((e.ctrlKey || e.metaKey) && (e.key === "S" || e.key === "s" || e.keyCode === 83)) {
        e.preventDefault();
        return;
      }
    };
    document.addEventListener("keydown", preventDevToolsKeys);

    // 3. Continuous anti-debugging background loop (pauses if DevTools is open)
    const debuggerInterval = setInterval(() => {
      const startTime = performance.now();
      // eslint-disable-next-line no-debugger
      debugger;
      const endTime = performance.now();
      if (endTime - startTime > 100) {
        console.warn("Segurança TreinoPro: DevTools detectado. Os dados dos alunos e código-fonte são protegidos intelectualmente!");
      }
    }, 800);

    return () => {
      document.removeEventListener("contextmenu", preventContextMenu);
      document.removeEventListener("keydown", preventDevToolsKeys);
      clearInterval(debuggerInterval);
    };
  }, []);

  // Handle Send Message to Professor
  const handleSendProfMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!profInputMessage.trim()) return;

    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

    const newMsg = {
      id: `m-${Date.now()}`,
      sender: "student",
      text: profInputMessage,
      timestamp: timeStr,
      status: "sent"
    };

    setProfessorHistories(prev => {
      const currentList = prev[simulatedStudentId] || [];
      const updated = {
        ...prev,
        [simulatedStudentId]: [...currentList, newMsg]
      };
      localStorage.setItem("treinopro_chat_histories", JSON.stringify(updated));
      return updated;
    });

    setProfInputMessage("");

    // Scroll to bottom
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  // Load custom data from simulated student
  const studentWorkouts = useMemo<Workout[]>(() => {
    const rawWorkouts = workouts.filter(w => w.studentId === simulatedStudentId);
    if (rawWorkouts.length === 0) return [];

    // Gather all exercises from all raw workouts of this student
    const allExercises = rawWorkouts.flatMap(w => w.exercises);

    // Group exercises by division
    // A division can be a letter like "A", "B", "C" or undefined (default to "A")
    const divisionsMap = new Map<string, Exercise[]>();
    allExercises.forEach(ex => {
      const div = (ex.division || "A").toUpperCase().trim();
      if (!divisionsMap.has(div)) {
        divisionsMap.set(div, []);
      }
      divisionsMap.get(div)!.push(ex);
    });

    // Sort the divisions alphabetically (A, B, C, D...)
    const sortedDivisions = Array.from(divisionsMap.keys()).sort();

    // Create a virtual Workout object for each division
    return sortedDivisions.map(div => {
      const exercisesInDiv = divisionsMap.get(div)!;
      // Find the muscle groups in this division to give it a nice name
      const muscleGroups = Array.from(new Set(exercisesInDiv.map(e => e.muscleGroup).filter(Boolean)));
      const muscleGroupStr = muscleGroups.slice(0, 2).join(" & ");
      const name = `Treino ${div}${muscleGroupStr ? ` - ${muscleGroupStr}` : ""}`;

      return {
        id: `virtual-workout-${div}`,
        studentId: simulatedStudentId,
        name: name,
        lastUpdated: rawWorkouts[0]?.lastUpdated || new Date().toLocaleDateString("pt-BR"),
        exercises: exercisesInDiv
      };
    });
  }, [workouts, simulatedStudentId]);

  const studentDiets = diets.find(d => d.studentId === simulatedStudentId);
  const studentPayments = payments.filter(p => p.studentId === simulatedStudentId);

  // Sound Synth Helper (Beeps when timer ends)
  const playRestCompleteSound = () => {
    if (!soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const playBeep = (freq: number, duration: number, delay: number) => {
        const osc = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        osc.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        osc.frequency.value = freq;
        gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime + delay);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + delay + duration);
        osc.start(audioCtx.currentTime + delay);
        osc.stop(audioCtx.currentTime + delay + duration);
      };
      // Play a happy 3-beep tone
      playBeep(587.33, 0.15, 0); // D5
      playBeep(659.25, 0.15, 0.15); // E5
      playBeep(880.00, 0.3, 0.3); // A5
    } catch (e) {
      console.warn("Audio Context beep failed: ", e);
    }
  };

  // Rest Timer logic
  useEffect(() => {
    if (restTimer !== null) {
      if (restTimer > 0) {
        restIntervalRef.current = setTimeout(() => {
          setRestTimer(restTimer - 1);
        }, 1000);
      } else {
        playRestCompleteSound();
        if (navigator.vibrate) {
          navigator.vibrate([100, 50, 100]); // Haptic vibration on end rest!
        }
        setRestTimer(null);
      }
    }
    return () => {
      if (restIntervalRef.current) clearTimeout(restIntervalRef.current);
    };
  }, [restTimer]);

  // Workout Timer logic
  useEffect(() => {
    if (isExecutingWorkout) {
      timerIntervalRef.current = setInterval(() => {
        setWorkoutTimer(prev => prev + 1);
      }, 1000);
    } else {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      setWorkoutTimer(0);
    }
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [isExecutingWorkout]);

  // Scroll Chat to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  // Handle active student change
  useEffect(() => {
    setHasDoneCheckinToday(false);
    setIsExecutingWorkout(false);
    setCompletedSets({});
    setRecordedWeights({});
    setRecordedReps({});
    setRecordedRPE({});
    setRecordedPain({});
    setRestTimer(null);
    setChatMessages([
      { 
        sender: "coach", 
        text: `Fala, ${activeStudent?.name || "Atleta"}! Sou seu Coach Virtual. Estou por dentro do seu foco em **${activeStudent?.objective || "Evolução"}** na fase **${activeStudent?.currentPhase || "Geral"}**. Como posso acelerar seus resultados hoje?`, 
        timestamp: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }) 
      }
    ]);
  }, [simulatedStudentId]);

  // Format workout duration (ss -> hh:mm:ss)
  const formatTime = (totalSecs: number) => {
    const hrs = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;
    return `${hrs > 0 ? hrs + ":" : ""}${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Start workout execution
  const handleStartWorkout = (workout: Workout) => {
    setActiveExecutingWorkout(workout);
    setIsExecutingWorkout(true);
    setCurrentExerciseIndex(0);
    setCompletedSets({});
    setRecordedPain({});
    setWorkoutTimer(0);
    // Auto-populate weight fields from current plan
    const initialWeights: Record<string, number> = {};
    const initialReps: Record<string, string> = {};
    const initialRPE: Record<string, number> = {};
    workout.exercises.forEach(ex => {
      for (let s = 0; s < ex.sets; s++) {
        const key = `${ex.id}-${s}`;
        initialWeights[key] = ex.weight;
        initialReps[key] = ex.reps;
        initialRPE[key] = 8; // default recommended safe RPE
      }
    });
    setRecordedWeights(initialWeights);
    setRecordedReps(initialReps);
    setRecordedRPE(initialRPE);
    setActiveSubTab("treino");
  };

  // Toggle set completion and trigger rest countdown
  const handleToggleSet = (exerciseId: string, setIndex: number, currentSetWeight: number) => {
    const key = `${exerciseId}-${setIndex}`;
    const wasCompleted = completedSets[key];
    setCompletedSets(prev => ({
      ...prev,
      [key]: !wasCompleted
    }));

    if (!wasCompleted) {
      // Trigger rest timer
      setRestTimerMax(60);
      setRestTimer(60);
    }
  };

  // Complete full workout
  const handleCompleteWorkout = () => {
    if (!activeExecutingWorkout) return;

    // Calc total tonnage / volume and stats
    let totalVolume = 0;
    let setsCompleted = 0;

    activeExecutingWorkout.exercises.forEach(ex => {
      for (let s = 0; s < ex.sets; s++) {
        const key = `${ex.id}-${s}`;
        if (completedSets[key]) {
          setsCompleted++;
          const weight = recordedWeights[key] || ex.weight;
          const repsStr = recordedReps[key] || ex.reps;
          const repsVal = parseInt(repsStr.replace(/[^0-9]/g, "")) || 10;
          totalVolume += (weight * repsVal);
        }
      }
    });

    setCompletedWorkoutStats({
      totalTime: formatTime(workoutTimer),
      totalVolume,
      setsCompleted
    });

    // Save workout history / update last training date on simulated student
    const updatedStudent = {
      ...activeStudent,
      lastTrainingDate: new Date().toISOString().split("T")[0],
      missedDays: 0
    };
    onUpdateStudent(updatedStudent);

    // Save student logs inside student weights map if they altered anything
    const updatedWorkout = { ...activeExecutingWorkout };
    updatedWorkout.exercises = updatedWorkout.exercises.map(ex => {
      const studentWeights: Record<number, number> = {};
      for (let s = 0; s < ex.sets; s++) {
        const key = `${ex.id}-${s}`;
        if (completedSets[key]) {
          studentWeights[s + 1] = recordedWeights[key] || ex.weight;
        }
      }
      return {
        ...ex,
        studentWeights
      };
    });

    // Merge the virtual exercises back into the student's main worksheet workout
    const mainWorkout = workouts.find(w => w.studentId === simulatedStudentId);
    if (mainWorkout) {
      const updatedExercises = mainWorkout.exercises.map(ex => {
        const updatedEx = updatedWorkout.exercises.find(e => e.id === ex.id);
        if (updatedEx) {
          return updatedEx;
        }
        return ex;
      });

      const updatedMainWorkout = {
        ...mainWorkout,
        exercises: updatedExercises
      };
      onSaveWorkout(updatedMainWorkout);
    } else {
      onSaveWorkout(updatedWorkout);
    }

    setIsExecutingWorkout(false);
    setShowCompletionModal(true);
    setStreakDays(prev => prev + 1);
  };

  // Handle Coach IA response
  const handleSendChatMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputMessage.trim() || isAiLoading) return;

    const userText = inputMessage;
    setInputMessage("");

    const newMsg = {
      sender: "student" as const,
      text: userText,
      timestamp: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
    };

    setChatMessages(prev => [...prev, newMsg]);
    setIsAiLoading(true);

    try {
      const history = chatMessages.map(m => ({
        sender: m.sender === "student" ? "student" : "coach",
        text: m.text
      }));

      const res = await fetch("/api/ia-coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentName: activeStudent.name,
          currentPhase: activeStudent.currentPhase,
          objective: activeStudent.objective,
          workouts: studentWorkouts,
          diets: studentDiets,
          currentMessage: userText,
          messageHistory: history
        })
      });

      const data = await res.json();
      setChatMessages(prev => [...prev, {
        sender: "coach" as const,
        text: data.message,
        timestamp: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
      }]);
    } catch (err: any) {
      console.error(err);
      setChatMessages(prev => [...prev, {
        sender: "coach" as const,
        text: `Bora, ${activeStudent.name}! Tive um soluço de conexão, mas me conta: o que você achou dos pesos de hoje?`,
        timestamp: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
      }]);
    } finally {
      setIsAiLoading(false);
    }
  };

  // Handle immediate Quick AI questions
  const triggerQuickQuestion = (question: string) => {
    setInputMessage(question);
    setTimeout(() => {
      // Simulate click
      const dummyForm = document.getElementById("chat-form");
      if (dummyForm) {
        dummyForm.dispatchEvent(new Event("submit", { cancelable: true, bubbles: true }));
      }
    }, 100);
  };

  // Dragging slider logic
  const handleSliderMove = (clientX: number, containerWidth: number, containerLeft: number) => {
    const position = ((clientX - containerLeft) / containerWidth) * 100;
    setSliderPosition(Math.max(0, Math.min(100, position)));
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    const container = e.currentTarget.getBoundingClientRect();
    if (e.touches[0]) {
      handleSliderMove(e.touches[0].clientX, container.width, container.left);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDraggingSlider) return;
    const container = e.currentTarget.getBoundingClientRect();
    handleSliderMove(e.clientX, container.width, container.left);
  };

  // Mock graphs data
  const chartsData = {
    weight: [
      { date: "05/05", peso: activeStudent.weight ? activeStudent.weight - 2.8 : 81.2, massaMagra: 65 },
      { date: "15/05", peso: activeStudent.weight ? activeStudent.weight - 1.9 : 82.1, massaMagra: 65.4 },
      { date: "25/05", peso: activeStudent.weight ? activeStudent.weight - 1.0 : 83.0, massaMagra: 66.1 },
      { date: "05/06", peso: activeStudent.weight ? activeStudent.weight - 0.4 : 83.6, massaMagra: 66.8 },
      { date: "15/06", peso: activeStudent.weight || 84.0, massaMagra: 67.2 }
    ],
    bf: [
      { date: "05/05", bf: 18.2 },
      { date: "15/05", bf: 17.5 },
      { date: "25/05", bf: 16.8 },
      { date: "05/06", bf: 15.9 },
      { date: "15/06", bf: 14.5 }
    ],
    volume: [
      { week: "Semana 1", volume: 9800 },
      { week: "Semana 2", volume: 10400 },
      { week: "Semana 3", volume: 11200 },
      { week: "Semana 4", volume: 12450 }
    ]
  };

  // Load postural evaluations from localStorage
  const latestPosturalEval = useMemo(() => {
    if (!activeStudent?.id) return null;
    try {
      const saved = localStorage.getItem(`treinopro_postural_evaluations_${activeStudent.id}`);
      if (saved) {
        const evals = JSON.parse(saved);
        if (Array.isArray(evals) && evals.length > 0) {
          // Sort by timestamp descending to get the newest first
          const sorted = [...evals].sort((a, b) => b.timestamp - a.timestamp);
          return sorted[0];
        }
      }
    } catch (e) {
      console.error("Error loading postural evaluations in student app:", e);
    }
    return null;
  }, [activeStudent?.id, syncCounter]);

  const [studentActivePostureView, setStudentActivePostureView] = useState<"front" | "back" | "right" | "left">("front");

  useEffect(() => {
    if (latestPosturalEval?.photos) {
      const firstAvailable = ["front", "back", "right", "left"].find(
        key => !!latestPosturalEval.photos[key]
      );
      if (firstAvailable) {
        setStudentActivePostureView(firstAvailable as any);
      }
    }
  }, [latestPosturalEval]);

  // Load physical evaluations from localStorage
  const physicalEvals = useMemo(() => {
    if (!activeStudent?.id) return [];
    try {
      const saved = localStorage.getItem(`coach_physical_evaluations_${activeStudent.id}`);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error("Error loading physical evaluations for student app:", e);
    }
    return [];
  }, [activeStudent?.id, syncCounter]);

  const latestPhysicalEval = useMemo(() => {
    if (physicalEvals.length === 0) return null;
    return [...physicalEvals].sort((a, b) => b.timestamp - a.timestamp)[0];
  }, [physicalEvals]);

  // Load physical evaluations from localStorage for evolution photo comparison
  const comparisonPhotos = useMemo(() => {
    if (!activeStudent?.id) {
      return {
        before: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&q=80&w=400",
        after: "https://images.unsplash.com/photo-1574680096145-d05b474e2155?auto=format&fit=crop&q=80&w=400",
        beforeDate: "Anterior",
        afterDate: "Atual",
        hasRealPhotos: false
      };
    }
    if (physicalEvals.length > 0) {
      // Filter evaluations that have at least fotoFrente
      const sorted = [...physicalEvals]
        .filter(e => e.fotoFrente)
        .sort((a, b) => a.timestamp - b.timestamp); // oldest to newest

      if (sorted.length >= 2) {
        return {
          before: sorted[0].fotoFrente,
          after: sorted[sorted.length - 1].fotoFrente,
          beforeDate: sorted[0].date || new Date(sorted[0].timestamp).toLocaleDateString("pt-BR"),
          afterDate: sorted[sorted.length - 1].date || new Date(sorted[sorted.length - 1].timestamp).toLocaleDateString("pt-BR"),
          hasRealPhotos: true
        };
      } else if (sorted.length === 1) {
        return {
          // If only one, use a seeded placeholder for the "before", and the new one for "after"
          before: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&q=80&w=400",
          after: sorted[0].fotoFrente,
          beforeDate: "Início",
          afterDate: sorted[0].date || new Date(sorted[0].timestamp).toLocaleDateString("pt-BR"),
          hasRealPhotos: true
        };
      }
    }
    return {
      before: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&q=80&w=400",
      after: "https://images.unsplash.com/photo-1574680096145-d05b474e2155?auto=format&fit=crop&q=80&w=400",
      beforeDate: "Anterior",
      afterDate: "Atual",
      hasRealPhotos: false
    };
  }, [activeStudent?.id, physicalEvals]);

  // Simulate pushing a new notification to student
  const triggerSimNotification = (msg: string) => {
    setShowSimNotification(msg);
    setTimeout(() => {
      setShowSimNotification(null);
    }, 6000);
  };

  const isLight = appearanceMode === "claro" || (appearanceMode === "auto" && typeof window !== "undefined" && window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches);
  const themeClass = isLight ? "light-theme student-app bg-[#f8f9ff] text-[#0b1c30]" : "dark-theme student-app bg-[#121414] text-[#e3e2e4]";

  // Responsive style helper tokens for light/dark theme support
  const bgBaseClass = isLight ? "bg-[#f4f5f7]" : "bg-[#121414]";
  const cardBgClass = isLight ? "bg-white border border-[#e4e5e7]" : "bg-[#1e2020] border border-[#343535]/20";
  const textTitleClass = isLight ? "text-[#121414]" : "text-white";
  const textBodyClass = isLight ? "text-[#4b5563]" : "text-[#e3e2e4]";
  const textMutedClass = isLight ? "text-[#6b7280]" : "text-gray-400";
  const borderSuttleClass = isLight ? "border-[#e4e5e7]" : "border-[#343535]/15";
  const bgSubtleClass = isLight ? "bg-black/5" : "bg-[#1e2020]/50";

  return (
    <div className={`min-h-screen flex flex-col relative overflow-hidden ${themeClass}`}>
      
      {/* Floating Exit Button for Coach in Full Screen Mode */}
      {!usePhoneFrame && userRole === "coach" && (
        <button
          onClick={() => setUsePhoneFrame(true)}
          className="fixed top-4 right-4 z-50 flex items-center gap-1.5 px-3 py-2 rounded-xl bg-black/85 border border-[#343535]/60 text-[#c3f400] hover:text-white text-xs font-mono shadow-2xl backdrop-blur-md cursor-pointer transition-all active:scale-95"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Voltar ao Simulador</span>
        </button>
      )}

      {/* BACKGROUND GRAPHICS */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-[#c3f400]/4 rounded-full filter blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#c3f400]/3 rounded-full filter blur-[120px] pointer-events-none"></div>

      {/* TOP DESKTOP HEADER ACTION BAR */}
      {usePhoneFrame && (
        <header className="w-full bg-[#1e2020]/95 border-b border-[#343535]/30 p-4 lg:p-6 flex items-center justify-between sticky top-0 z-30 backdrop-blur-xl">
          <div className="flex items-center gap-4">
            {!isCapacitor && (
              <button 
                onClick={onBackToTrainer}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[#343535]/50 hover:border-[#c3f400]/40 text-xs font-mono transition-all bg-[#121414]/80 text-[#b9cacb] hover:text-white cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4 text-[#c3f400]" />
                <span>Voltar ao Professor</span>
              </button>
            )}
            {!isCapacitor && <div className="hidden sm:block h-6 w-px bg-[#343535]/30"></div>}
            <div className="hidden sm:flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-[10px] font-mono uppercase text-gray-400">Modo de Simulação Ativo</span>
            </div>
          </div>

          {/* SIMULATOR QUICK CONTROLS (Floating header widget) */}
          <div className="flex items-center gap-2 max-w-xs md:max-w-md">
            <label className="text-[10px] font-mono text-[#b9cacb] uppercase hidden md:block">Simular Aluno:</label>
            <select 
              value={simulatedStudentId} 
              onChange={(e) => setSimulatedStudentId(e.target.value)}
              className="bg-[#252727] text-xs font-bold text-[#c3f400] border border-[#343535]/40 rounded-lg px-2.5 py-1.5 focus:border-[#c3f400] outline-none cursor-pointer"
            >
              {students.map(s => (
                <option key={s.id} value={s.id}>{s.name} ({s.objective})</option>
              ))}
            </select>
            <button
              onClick={() => setUsePhoneFrame(false)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#343535]/40 text-xs font-mono transition-all bg-[#252727] text-[#c3f400] hover:text-white cursor-pointer"
              title="Tela Cheia"
            >
              Tela Cheia 📱
            </button>
          </div>
        </header>
      )}

      {/* MAIN CONTAINER: SIMULATOR PANEL (Right/Left Split) */}
      <div className={usePhoneFrame 
        ? "flex-1 flex flex-col lg:flex-row p-4 lg:p-8 gap-6 overflow-hidden max-w-7xl mx-auto w-full"
        : "flex-1 flex flex-col w-full h-screen relative"
      }>
        
        {/* INTERACTIVE SIMULATION SIDE PANEL (Right on desktop, Bottom on Mobile) */}
        {usePhoneFrame && (
          <div className="flex-1 lg:max-w-md order-2 lg:order-1 flex flex-col gap-6">
          <div className="glass-panel rounded-2xl p-5 border border-[#343535]/20 space-y-5 bg-[#1e2020]/40 backdrop-blur-md">
            <div className="flex items-center justify-between border-b border-[#343535]/20 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#c3f400]" />
                <h3 className="font-bold text-sm text-white font-mono uppercase">Controles do Simulador</h3>
              </div>
              <span className="text-[9px] font-mono bg-[#c3f400]/10 text-[#c3f400] px-2 py-0.5 rounded-full border border-[#c3f400]/20">QA Tester</span>
            </div>

            {/* Quick action block */}
            <div className="space-y-4 text-xs font-mono">
              <p className="text-gray-400 text-[10px] leading-relaxed leading-normal">
                Use este painel para injetar ações em tempo real no aplicativo simulado ao lado. Útil para testar notificações, alertas do treinador e bloqueio financeiro.
              </p>

              {/* Toggle overdue status */}
              <div className="flex items-center justify-between bg-[#121414]/50 border border-[#343535]/20 rounded-xl p-3.5">
                <div>
                  <p className="font-bold text-[#e3e2e4] flex items-center gap-1">
                    <DollarSign className="w-3.5 h-3.5 text-amber-400" />
                    Simular Inadimplência
                  </p>
                  <span className="text-[9px] text-gray-500">Bloqueia tela de treinos</span>
                </div>
                <button
                  onClick={() => {
                    setIsSimulatedOverdue(!isSimulatedOverdue);
                    if(!isSimulatedOverdue) {
                      triggerSimNotification("Seu plano está suspenso por falta de pagamento. Contate a recepção.");
                    } else {
                      triggerSimNotification("Seu plano foi restabelecido! Bons treinos.");
                    }
                  }}
                  className={`px-3 py-1.5 rounded-lg border text-[10px] font-bold cursor-pointer transition-all ${
                    isSimulatedOverdue 
                      ? "bg-rose-500/10 border-rose-500/30 text-rose-400 shadow-[0_0_10px_rgba(244,63,94,0.1)]" 
                      : "bg-[#252727] border-[#343535]/40 text-[#b9cacb] hover:text-white"
                  }`}
                >
                  {isSimulatedOverdue ? "Bloqueado" : "Regular"}
                </button>
              </div>

              {/* Push Custom Notification */}
              <div className="space-y-2 bg-[#121414]/30 border border-[#343535]/15 rounded-xl p-3.5">
                <p className="font-bold text-[#e3e2e4] flex items-center gap-1.5 text-xs">
                  <Bell className="w-3.5 h-3.5 text-[#c3f400]" />
                  Enviar Alerta do Professor
                </p>
                <div className="flex gap-2">
                  <input 
                    type="text"
                    value={customCoachMessage}
                    onChange={(e) => setCustomCoachMessage(e.target.value)}
                    placeholder="Ex: Não fuja do cardio hoje, Gustavo!"
                    className="flex-1 bg-[#121414] border border-[#343535]/40 focus:border-[#c3f400] outline-none rounded-lg px-2.5 py-1.5 text-[10px] text-white"
                  />
                  <button
                    onClick={() => {
                      if(customCoachMessage.trim()){
                        triggerSimNotification(customCoachMessage);
                        setCustomCoachMessage("");
                      }
                    }}
                    className="px-3 py-1.5 rounded-lg bg-[#c3f400] text-[#121414] hover:shadow-[0_0_10px_rgba(0,242,255,0.3)] font-bold text-[10px] cursor-pointer"
                  >
                    Disparar
                  </button>
                </div>
              </div>

              {/* Instant Notification presets */}
              <div className="space-y-2">
                <p className="text-[10px] uppercase text-gray-500 font-bold">Simular Notificações em Lote:</p>
                <div className="grid grid-cols-2 gap-2 text-[9px]">
                  <button 
                    onClick={() => triggerSimNotification("Parabéns! Você alcançou um novo recorde de Carga no Supino Reto: 80kg! 🏆")}
                    className="p-2 border border-[#343535]/20 hover:border-[#c3f400]/30 hover:bg-[#1e2020] rounded-lg text-left text-gray-400 hover:text-white cursor-pointer"
                  >
                    Novo Recorde de Carga
                  </button>
                  <button 
                    onClick={() => triggerSimNotification("Seu professor atualizou sua ficha de treinos de hoje! 🔄")}
                    className="p-2 border border-[#343535]/20 hover:border-[#c3f400]/30 hover:bg-[#1e2020] rounded-lg text-left text-gray-400 hover:text-white cursor-pointer"
                  >
                    Ficha Atualizada
                  </button>
                  <button 
                    onClick={() => triggerSimNotification("Coach: Identifiquei fadiga alta nas pernas. Reduza o volume hoje. 💡")}
                    className="p-2 border border-[#343535]/20 hover:border-[#c3f400]/30 hover:bg-[#1e2020] rounded-lg text-left text-gray-400 hover:text-white cursor-pointer"
                  >
                    Dica Fisiológica
                  </button>
                  <button 
                    onClick={() => triggerSimNotification("Frequência de Junho: 100% de presença até aqui! Continue firme. 🔥")}
                    className="p-2 border border-[#343535]/20 hover:border-[#c3f400]/30 hover:bg-[#1e2020] rounded-lg text-left text-gray-400 hover:text-white cursor-pointer"
                  >
                    Parabéns Frequência
                  </button>
                </div>
              </div>

              {/* Reset simulator state */}
              <button
                onClick={() => {
                  setIsSimulatedOverdue(false);
                  setHasDoneCheckinToday(false);
                  setIsExecutingWorkout(false);
                  triggerSimNotification("Simulador redefinido para o padrão!");
                }}
                className="w-full py-2 bg-[#252727] text-center border border-[#343535]/30 rounded-xl hover:border-gray-500 transition-all text-[10px] text-gray-400 hover:text-white flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Resetar Estado de Simulação
              </button>
            </div>
          </div>

          {/* QUICK SUMMARY INFOCARD OF ACTIVE STUDENT */}
          <div className="glass-panel rounded-2xl p-5 border border-[#343535]/20 space-y-4 bg-[#1e2020]/20 font-mono text-xs">
            <h4 className="font-bold text-white uppercase text-[11px] tracking-wider">Metadados de Treino</h4>
            <div className="space-y-2 text-[10px] text-[#b9cacb]">
              <div className="flex justify-between border-b border-[#343535]/10 pb-1.5">
                <span>Nome:</span>
                <span className="text-[#c3f400] font-bold">{activeStudent.name}</span>
              </div>
              <div className="flex justify-between border-b border-[#343535]/10 pb-1.5">
                <span>Objetivo:</span>
                <span className="text-white font-bold">{activeStudent.objective}</span>
              </div>
              <div className="flex justify-between border-b border-[#343535]/10 pb-1.5">
                <span>Plano Contratado:</span>
                <span className="text-white font-bold">{activeStudent.plan}</span>
              </div>
              <div className="flex justify-between border-b border-[#343535]/10 pb-1.5">
                <span>Vencimento do Plano:</span>
                <span className="text-amber-400 font-bold">{activeStudent.renewalDueDate || "30 dias"}</span>
              </div>
              <div className="flex justify-between border-b border-[#343535]/10 pb-1.5">
                <span>Fase Atual:</span>
                <span className="text-white">{activeStudent.currentPhase}</span>
              </div>
              <div className="flex justify-between">
                <span>Treinos Cadastrados:</span>
                <span className="text-[#c3f400] font-bold">{studentWorkouts.length} divisões</span>
              </div>
            </div>
          </div>
        </div>
      )}

        {/* ULTRA-POLISHED PHONE VIEWPORT MOCKUP PANEL (Center / Left) */}
        <div className={usePhoneFrame 
          ? "flex-1 order-1 lg:order-2 flex justify-center items-start" 
          : "flex-1 flex flex-col w-full h-screen"
        }>
          
          <div className={usePhoneFrame
            ? `relative w-full max-w-[395px] h-[812px] rounded-[48px] border-[12px] border-[#1e1f21] shadow-[0_25px_60px_rgba(0,0,0,0.8),_0_0_0_2px_#343537] overflow-hidden flex flex-col transition-colors duration-300 select-none ${isLight ? "bg-[#f4f5f7]" : "bg-[#0c0d0e]"}`
            : `relative w-full h-screen pt-[env(safe-area-inset-top,0px)] pb-[env(safe-area-inset-bottom,0px)] overflow-hidden flex flex-col transition-colors duration-300 select-none ${isLight ? "bg-[#f4f5f7]" : "bg-[#0c0d0e]"}`
          }>
            
            {/* INTELLECTUAL PROPERTY SECURITY WATERMARK OVERLAY */}
            <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden opacity-[0.015] flex flex-wrap gap-x-12 gap-y-16 p-4 justify-around content-around select-none">
              {Array.from({ length: 24 }).map((_, i) => (
                <div 
                  key={i} 
                  className="text-[10px] font-mono font-black text-[#c3f400] -rotate-12 whitespace-nowrap uppercase tracking-widest"
                >
                  TREINOPRO - {activeStudent.name || "ATLETA"} - {activeStudent.email || "EXCLUSIVO"}
                </div>
              ))}
            </div>
            
            {/* SMARTPHONE HARDWARE ACCENTS: Speaker and Camera Punch Hole */}
            {usePhoneFrame && (
              <div className="absolute top-0 inset-x-0 h-8 bg-black z-50 flex items-center justify-between px-7">
                {/* Time */}
                <span className="text-white text-[11px] font-bold font-sans">09:41</span>
                {/* Camera punch notch */}
                <div className="w-[110px] h-[18px] bg-black rounded-full absolute left-1/2 -translate-x-1/2 top-2 flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-[#1a1a1a] border border-[#2a2a2a] ml-12"></div>
                </div>
                {/* Hardware icons */}
                <div className="flex items-center gap-1 text-[10px] text-white">
                  <span>5G</span>
                  <div className="w-4 h-2.5 border border-white rounded-sm p-0.5 flex items-center">
                    <div className="w-full h-full bg-white rounded-2xs"></div>
                  </div>
                </div>
              </div>
            )}

            {/* SIMULATOR PUSH NOTIFICATION SYSTEM BANNER (Glassmorphic Toast overlay) */}
            <AnimatePresence>
              {showSimNotification && (
                <motion.div 
                  initial={{ opacity: 0, y: -80, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -80, scale: 0.95 }}
                  className="absolute top-10 inset-x-3 z-50 bg-[#1e2020]/90 backdrop-blur-md border border-[#c3f400]/30 rounded-2xl p-3 shadow-2xl flex items-start gap-2.5 text-xs text-[#e3e2e4] leading-relaxed"
                >
                  <div className="w-8 h-8 rounded-full bg-[#c3f400]/15 border border-[#c3f400]/30 flex items-center justify-center shrink-0">
                    <Sparkles className="w-4 h-4 text-[#c3f400]" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between font-mono text-[9px] uppercase tracking-wider text-[#b9cacb]">
                      <span>TreinoPro Notificações</span>
                      <span>Agora</span>
                    </div>
                    <p className="font-semibold text-white text-[11px] mt-0.5">{showSimNotification}</p>
                  </div>
                  <button onClick={() => setShowSimNotification(null)} className="p-0.5 text-gray-500 hover:text-white cursor-pointer">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* IN-APP REST TIMER FLOATING OVERLAY BAR (Sticky bottom or top during execution) */}
            <AnimatePresence>
              {restTimer !== null && (
                <motion.div 
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 50 }}
                  className="absolute bottom-20 inset-x-3 z-40 bg-[#121414]/95 border border-[#c3f400]/40 rounded-2xl p-3.5 shadow-2xl flex items-center justify-between"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="relative w-9 h-9 flex items-center justify-center shrink-0">
                      {/* SVG circular loading */}
                      <svg className="w-full h-full transform -rotate-90">
                        <circle cx="18" cy="18" r="15" stroke="rgba(0, 242, 255, 0.15)" strokeWidth="3" fill="transparent" />
                        <circle cx="18" cy="18" r="15" stroke="#c3f400" strokeWidth="3" fill="transparent" 
                          strokeDasharray={`${2 * Math.PI * 15}`}
                          strokeDashoffset={`${2 * Math.PI * 15 * (1 - restTimer / restTimerMax)}`}
                          className="transition-all duration-1000"
                        />
                      </svg>
                      <Clock className="w-4 h-4 text-[#c3f400] absolute" />
                    </div>
                    <div>
                      <p className="text-[10px] font-mono text-[#c3f400] uppercase font-bold tracking-wider">Cronômetro de Descanso</p>
                      <p className="text-white text-base font-extrabold leading-none mt-0.5">{restTimer}s <span className="text-gray-400 text-xs">/ {restTimerMax}s</span></p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button 
                      onClick={() => setRestTimer(prev => prev ? prev + 15 : 15)}
                      className="px-2 py-1 rounded-lg bg-[#c3f400]/10 text-[#c3f400] hover:bg-[#c3f400]/20 text-[10px] font-mono font-bold cursor-pointer"
                    >
                      +15s
                    </button>
                    <button 
                      onClick={() => setRestTimer(null)}
                      className="p-1 rounded-lg bg-gray-800 text-gray-300 hover:text-white cursor-pointer"
                      title="Pular"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* IN-APP COMPLETED WORKOUT CONFETTI MODAL OVERLAY */}
            <AnimatePresence>
              {showCompletionModal && completedWorkoutStats && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-black/90 z-50 flex flex-col justify-center items-center p-6 text-center"
                >
                  <motion.div
                    initial={{ scale: 0.85, y: 30 }}
                    animate={{ scale: 1, y: 0 }}
                    className="space-y-6"
                  >
                    {/* Visual burst badge */}
                    <div className="relative w-24 h-24 mx-auto flex items-center justify-center">
                      <div className="absolute inset-0 primary-gradient rounded-full blur-xl opacity-30 animate-pulse"></div>
                      <div className="w-20 h-20 primary-gradient rounded-full flex items-center justify-center border-4 border-[#0e1011] shadow-xl">
                        <Award className="w-10 h-10 text-[#121414]" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h3 className="text-xl font-extrabold text-white tracking-tight">Treino Finalizado! 🏆</h3>
                      <p className="text-[#c3f400] font-mono text-xs font-bold uppercase tracking-wider">Metabolismo Ativado a 100%</p>
                      <p className="text-gray-400 text-[11px] leading-relaxed px-4">
                        Parabéns pela consistência, <b>{activeStudent.name}</b>! Você completou cada série prescrita com maestria.
                      </p>
                    </div>

                    {/* STATS DECK */}
                    <div className="grid grid-cols-3 gap-2.5 bg-[#1e2020]/60 border border-[#343535]/20 p-3.5 rounded-2xl font-mono text-center">
                      <div>
                        <p className="text-gray-500 text-[8px] uppercase tracking-wider">Duração</p>
                        <p className="text-[#c3f400] font-bold text-sm mt-0.5">{completedWorkoutStats.totalTime}</p>
                      </div>
                      <div className="border-x border-[#343535]/20 px-1">
                        <p className="text-gray-500 text-[8px] uppercase tracking-wider">Volume Total</p>
                        <p className="text-white font-bold text-sm mt-0.5">{completedWorkoutStats.totalVolume.toLocaleString()}kg</p>
                      </div>
                      <div>
                        <p className="text-gray-500 text-[8px] uppercase tracking-wider">Séries OK</p>
                        <p className="text-[#c3f400] font-bold text-sm mt-0.5">{completedWorkoutStats.setsCompleted}</p>
                      </div>
                    </div>

                    {/* Unlock Certificate Item */}
                    <div className="bg-[#c3f400]/5 border border-[#c3f400]/20 p-3 rounded-xl flex items-center gap-3 text-left">
                      <div className="p-2 rounded-lg bg-[#c3f400]/10 text-[#c3f400]">
                        <Award className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-400 leading-none">Você conquistou o selo</p>
                        <p className="text-white font-bold text-xs mt-1">Guerreiro de Aço (Streak +1) ⚔️</p>
                      </div>
                    </div>

                    <button
                      onClick={() => setShowCompletionModal(false)}
                      className="w-full py-3 primary-gradient text-[#121414] font-mono font-extrabold text-xs rounded-xl shadow-[0_0_20px_rgba(0,242,255,0.3)] active:scale-95 transition-all cursor-pointer"
                    >
                      Fechar e Ver Desempenho
                    </button>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* PAYMENT SUSPENSION / INADIMPLENCIA BLOCK SCREEN OVERLAY */}
            <AnimatePresence>
              {hasOverduePayment && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-[#0c0d0e]/95 z-50 flex flex-col justify-center items-center p-6 text-center"
                >
                  <motion.div
                    initial={{ scale: 0.9, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    className="space-y-6"
                  >
                    <div className="w-16 h-16 mx-auto rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
                      <Lock className="w-8 h-8" />
                    </div>

                    <div className="space-y-2">
                      <h3 className="text-lg font-bold text-white tracking-tight">Acesso Suspenso 🔒</h3>
                      <p className="text-rose-400 font-mono text-[10px] font-bold uppercase tracking-wider">Inadimplência Identificada</p>
                      <p className="text-gray-400 text-xs leading-relaxed px-3">
                        O acesso ao seu plano <b>{activeStudent?.plan || "TreinoPro"}</b> foi suspenso automaticamente devido a faturas em atraso.
                      </p>
                    </div>

                    {/* Customized friendly billing alert */}
                    <div className="bg-[#1e2020]/60 border border-[#343535]/25 p-4 rounded-xl text-left space-y-3 font-mono text-[11px]">
                      <div className="flex justify-between text-gray-400 border-b border-[#343535]/15 pb-1.5">
                        <span>Fatura em atraso:</span>
                        <span className="text-white font-bold">Plano {activeStudent?.plan}</span>
                      </div>
                      <div className="flex justify-between text-gray-400 border-b border-[#343535]/15 pb-1.5">
                        <span>Valor:</span>
                        <span className="text-[#c3f400] font-bold">
                          R$ {payments.find(p => p.studentId === activeStudent?.id && p.status === "overdue")?.amount?.toFixed(2) || "149,90"}
                        </span>
                      </div>
                      <p className="text-gray-500 text-[9px] leading-relaxed">
                        Para liberar seu acesso instantaneamente aos treinos, avaliações, dietas e check-ins, realize o pagamento via Pix copiando a chave abaixo.
                      </p>
                    </div>

                    {/* Payment buttons */}
                    <div className="space-y-2.5">
                      <button 
                        onClick={() => {
                          triggerSimNotification("Chave Pix Copiada! Faça o pagamento no seu banco. ⚡");
                        }}
                        className="w-full py-3 bg-[#c3f400] text-[#121414] font-mono font-bold text-xs rounded-xl flex items-center justify-center gap-2 hover:opacity-90 cursor-pointer"
                      >
                        <CreditCard className="w-4 h-4" />
                        Copiar Pix (Chave Aleatória)
                      </button>
                      <button 
                        onClick={() => {
                          setIsSimulatedOverdue(false);
                          // Clear all overdue payments for this student
                          const saved = localStorage.getItem("treinopro_payments");
                          let currentPayments = [...payments];
                          if (saved) {
                            try { currentPayments = JSON.parse(saved); } catch (e) {}
                          }
                          const updated = currentPayments.map(p => {
                            if (p.studentId === activeStudent.id && p.status === "overdue") {
                              return { ...p, status: "paid" as const, paidDate: new Date().toISOString().split("T")[0] };
                            }
                            return p;
                          });
                          localStorage.setItem("treinopro_payments", JSON.stringify(updated));
                          window.dispatchEvent(new CustomEvent("treinopro_payments_updated"));
                          triggerSimNotification("Acesso liberado com sucesso! Bons treinos. 🔥");
                        }}
                        className="w-full py-2.5 bg-[#252727] text-[#b9cacb] font-mono text-[10px] rounded-xl border border-[#343535]/40 hover:text-white cursor-pointer"
                      >
                        Simular Confirmação de Pagamento ✅
                      </button>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* PHONE MAIN APP VIEWPORTS CONTAINER (Based on activeSubTab) */}
            <div className={`flex-1 overflow-y-auto px-4 ${usePhoneFrame ? "pt-12" : "pt-6"} pb-24 relative z-10 scrollbar-none`}>
              
              {!isLoggedIn ? (
                <div className="flex flex-col justify-center items-stretch min-h-[580px] pt-4 pb-6 space-y-6">
                  {/* APP BRAND & ICON */}
                  <div className="text-center space-y-2.5">
                    <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-[#c3f400] to-[#c3f400] flex items-center justify-center mx-auto shadow-[0_0_20px_rgba(0,242,255,0.25)]">
                      <Dumbbell className="w-8 h-8 text-[#121414]" />
                    </div>
                    <div>
                      <h1 className="text-xl font-black text-white tracking-tight leading-none uppercase font-sans">TreinoPro <span className="text-[#c3f400] text-xs font-mono font-bold tracking-widest block mt-1">Connect Aluno</span></h1>
                      <p className="text-gray-400 text-[10px] font-mono tracking-wider mt-1.5">Sua evolução, monitorada de perto</p>
                    </div>
                  </div>

                  {/* LOGIN FORM CARDS */}
                  <div className="bg-[#1e2020] border border-[#343535]/25 rounded-3xl p-5 space-y-4 shadow-xl">
                    {showPasswordRecovery ? (
                      <div className="space-y-4">
                        <p className="text-[#c3f400] font-mono text-[9px] uppercase font-bold tracking-wider text-center">Recuperação de Senha</p>
                        {recoveryMessage && (
                          <div className="bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 rounded-xl p-2.5 text-center text-[10px] font-mono leading-relaxed">
                            {recoveryMessage}
                          </div>
                        )}
                        <div className="space-y-1.5 text-xs">
                          <label className="text-gray-400 font-mono font-bold text-[9px] uppercase">E-mail Cadastrado</label>
                          <input
                            type="email"
                            value={recoveryEmail}
                            onChange={(e) => {
                              setRecoveryEmail(e.target.value);
                              setRecoveryMessage(null);
                            }}
                            placeholder="ex: gustavo@treinopro.com"
                            className="w-full bg-[#252727] border border-[#343535]/30 focus:border-[#c3f400] rounded-xl px-3 py-2.5 text-white outline-none font-mono"
                          />
                        </div>
                        <button
                          onClick={async () => {
                            if (!recoveryEmail.trim()) {
                              setRecoveryMessage("⚠️ Por favor, digite seu e-mail.");
                              return;
                            }
                            try {
                              await sendPasswordResetEmail(auth, recoveryEmail.trim());
                              setRecoveryMessage("✅ Link de recuperação enviado para seu e-mail!");
                            } catch (error: any) {
                              setRecoveryMessage(`⚠️ Erro: ${error.message || error}`);
                            }
                          }}
                          className="w-full py-3 bg-gradient-to-tr from-[#c3f400] to-[#c3f400] text-[#121414] font-mono font-extrabold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-[0_4px_15px_rgba(235,178,255,0.2)] active:scale-95 transition-all cursor-pointer"
                        >
                          Enviar E-mail de Recuperação 📬
                        </button>
                        <button
                          onClick={() => {
                            setShowPasswordRecovery(false);
                            setRecoveryMessage(null);
                          }}
                          className="w-full text-center text-[10px] font-mono text-gray-400 hover:text-white transition-colors block mt-2 cursor-pointer"
                        >
                          ← Voltar para o Login
                        </button>
                      </div>
                    ) : (
                      <>
                        <p className="text-[#c3f400] font-mono text-[9px] uppercase font-bold tracking-wider text-center">Acesse sua Ficha de Treinos</p>
                        
                        {loginError && (
                          <div className="bg-rose-500/15 border border-rose-500/30 text-rose-400 rounded-xl p-2.5 text-center text-[10px] font-mono leading-relaxed">
                            ⚠️ {loginError}
                          </div>
                        )}

                        <div className="space-y-3 text-xs">
                          <div className="space-y-1.5">
                            <label className="text-gray-400 font-mono font-bold text-[9px] uppercase">E-mail Cadastrado</label>
                            <input
                              type="email"
                              value={loginEmail}
                              onChange={(e) => {
                                setLoginEmail(e.target.value);
                                setLoginError(null);
                              }}
                              placeholder="ex: gustavo@treinopro.com"
                              className="w-full bg-[#252727] border border-[#343535]/30 focus:border-[#c3f400] rounded-xl px-3 py-2.5 text-white outline-none font-mono"
                            />
                          </div>

                          <div className="space-y-1.5">
                            <div className="flex justify-between items-center">
                              <label className="text-gray-400 font-mono font-bold text-[9px] uppercase">Código de Acesso</label>
                              <span className="text-[8px] font-mono text-gray-500">Padrão: 123456</span>
                            </div>
                            <input
                              type="password"
                              value={loginPassword}
                              onChange={(e) => {
                                setLoginPassword(e.target.value);
                                setLoginError(null);
                              }}
                              placeholder="Digite seu código"
                              className="w-full bg-[#252727] border border-[#343535]/30 focus:border-[#c3f400] rounded-xl px-3 py-2.5 text-white outline-none font-mono tracking-widest"
                            />
                          </div>
                        </div>

                        <button
                          onClick={async () => {
                            if (!loginEmail.trim()) {
                              setLoginError("Por favor, digite seu e-mail cadastrado.");
                              return;
                            }
                            
                            const trimmedEmail = loginEmail.trim().toLowerCase();
                            const student = students.find(s => s.email.toLowerCase() === trimmedEmail);
                            
                            if (!student) {
                              setLoginError("E-mail não localizado na base do Professor. Verifique o cadastro do aluno.");
                              return;
                            }

                            // Verify the password set in the admin dashboard (defaulting to 123456)
                            const correctPassword = student.password || "123456";
                            if (loginPassword.trim() !== correctPassword) {
                              setLoginError("Código de acesso / senha incorreta. Verifique os dados cadastrados pelo professor.");
                              return;
                            }

                            // Try real Firebase authentication if password is provided
                            if (loginPassword.trim()) {
                              try {
                                console.log("[Auth] Attempting Firebase Auth login...");
                                await signInWithEmailAndPassword(auth, trimmedEmail, loginPassword);
                                console.log("[Auth] Firebase Auth login successful!");
                              } catch (authErr: any) {
                                console.warn("[Auth] Firebase Auth failed, trying dynamic registration or simulation fallback:", authErr);
                                // If user does not exist in Firebase Auth yet, let's register them dynamically so next time they can log in!
                                if (authErr.code === "auth/user-not-found" || authErr.code === "auth/invalid-credential" || authErr.code === "auth/invalid-login-credentials") {
                                  try {
                                    console.log("[Auth] User not in Auth base, registering dynamically...");
                                    await createUserWithEmailAndPassword(auth, trimmedEmail, loginPassword);
                                    console.log("[Auth] Dynamic registration successful!");
                                  } catch (regErr: any) {
                                    if (regErr?.code === "auth/operation-not-allowed") {
                                      console.warn("[Auth] Firebase Email/Password auth is disabled in the Firebase Console. Operating in client-side simulation fallback mode.");
                                    } else if (regErr?.code === "auth/network-request-failed") {
                                      console.warn("[Auth] Firebase dynamic registration network request failed (likely due to sandbox browser iframe constraints). Continuing in offline-local mode.");
                                    } else {
                                      console.error("[Auth] Dynamic registration failed:", regErr);
                                    }
                                  }
                                }
                              }
                            }

                            setSimulatedStudentId(student.id);
                            setIsLoggedIn(true);
                            localStorage.setItem("treinopro_aluno_logged_in", "true");
                            triggerSimNotification(`Seja bem-vindo de volta, ${student.name.split(" ")[0]}! 🔥`);
                          }}
                          className="w-full py-3 primary-gradient text-[#121414] font-mono font-extrabold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-[0_4px_15px_rgba(0,242,255,0.2)] active:scale-95 transition-all cursor-pointer"
                        >
                          Entrar no Aplicativo ⚡
                        </button>
                        
                        <button
                          onClick={() => {
                            setRecoveryEmail(loginEmail);
                            setShowPasswordRecovery(true);
                          }}
                          className="w-full text-center text-[10px] font-mono text-[#c3f400] hover:underline block mt-1 cursor-pointer"
                        >
                          Esqueceu seu código / Recuperar senha? 🔑
                        </button>
                      </>
                    )}
                  </div>

                  {/* QUICK 1-CLICK SELECTOR DEMO */}
                  {(!userRole || userRole === "coach") && (
                    <div className="space-y-2.5">
                      <p className="text-[9px] font-mono text-gray-500 uppercase tracking-wider text-center font-bold">Acesso Rápido para Testes (1-Clique)</p>
                      <div className="grid grid-cols-1 gap-2">
                        {students.map(s => (
                          <button
                            key={s.id}
                            onClick={() => {
                              setSimulatedStudentId(s.id);
                              setLoginEmail(s.email);
                              setLoginPassword(s.password || "123456");
                              setIsLoggedIn(true);
                              localStorage.setItem("treinopro_aluno_logged_in", "true");
                              triggerSimNotification(`Logado com sucesso como ${s.name}! 🔥`);
                            }}
                            className="p-3 bg-[#1e2020]/60 hover:bg-[#252727] border border-[#343535]/15 hover:border-[#c3f400]/40 rounded-xl text-left transition-all flex items-center justify-between cursor-pointer"
                          >
                            <div className="min-w-0">
                              <p className="font-extrabold text-white text-xs truncate leading-none">{s.name}</p>
                              <p className="text-[9px] font-mono text-[#c3f400] mt-1.5 leading-none">{s.objective} • {s.plan}</p>
                              <p className="text-[8px] font-mono text-gray-500 mt-1 truncate leading-none">{s.email}</p>
                            </div>
                            <span className="text-[9px] font-mono font-bold bg-[#c3f400]/10 text-[#c3f400] border border-[#c3f400]/20 px-2.5 py-1 rounded-full uppercase shrink-0">Simular ⚡</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  {/* TAB 1: INÍCIO (DASHBOARD) */}
                  {activeSubTab === "inicio" && (
                    <div className="space-y-5 pt-2">
                      
                      {/* PWA INSTALL BANNER / INFO TO REMOVE HTTP ADDRESS BAR */}
                      <div 
                        onClick={() => setShowInstallGuideModal(true)}
                        className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/20 hover:border-amber-500/40 rounded-2xl p-3.5 flex items-center gap-3 cursor-pointer transition-all hover:scale-[1.01] active:scale-[0.99] group shadow-[0_4px_12px_rgba(245,158,11,0.02)]"
                      >
                        <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-center text-amber-400 shrink-0 group-hover:scale-110 transition-transform">
                          <Smartphone className="w-5 h-5 animate-pulse" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[9px] font-mono text-amber-400 font-extrabold uppercase tracking-widest">Dica Premium</span>
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping"></span>
                          </div>
                          <h4 className={`text-[11px] font-extrabold ${textTitleClass} mt-0.5 flex items-center gap-1`}>
                            Como remover a barra superior "http://"?
                          </h4>
                          <p className={`text-[9px] ${textMutedClass} font-mono mt-0.5 leading-tight`}>
                            Toque aqui para instalar o app na tela inicial e rodar em Tela Cheia 📲
                          </p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-amber-400/70 group-hover:translate-x-0.5 transition-transform shrink-0" />
                      </div>
                      
                      {/* SMART GREETINGS HEADER */}
                      <div className={`${cardBgClass} rounded-2xl p-4 shadow-lg space-y-3.5 relative overflow-hidden`}>
                        <div className="absolute top-2 right-2 flex items-center gap-1.5 z-10">
                          {/* Alert notification indicator */}
                          <button
                            onClick={() => setShowNotificationsModal(true)}
                            className={`w-8 h-8 rounded-full border ${isLight ? "bg-[#f4f5f7] border-[#e4e5e7] text-[#121414]" : "bg-[#1c1d20] border-[#343535]/20 text-gray-400"} flex items-center justify-center hover:text-white transition-colors relative cursor-pointer`}
                          >
                            <Bell className="w-4 h-4" />
                            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#c3f400]"></span>
                          </button>
                          
                          {/* Photo display (Student + Professor avatars side by side) */}
                          <div className="flex -space-x-2">
                            <div className="w-7 h-7 rounded-full border border-[#c3f400]/40 bg-[#343535]/20 flex items-center justify-center font-mono text-[9px] font-bold text-[#c3f400] overflow-hidden">
                              {activeStudent.initials}
                            </div>
                            <div className="w-7 h-7 rounded-full border border-[#c3f400]/40 bg-[#343535]/20 overflow-hidden shrink-0">
                              <img src={coachSettings.avatarUrl} className="w-full h-full object-cover" />
                            </div>
                          </div>
                        </div>

                        <div>
                          <p className="text-[10px] font-mono text-[#c3f400] uppercase tracking-widest leading-none font-bold">IRON PULSE Smart Coach</p>
                          <h2 className={`text-base font-extrabold ${textTitleClass} tracking-tight leading-tight mt-1 font-display uppercase`}>
                            {(() => {
                              const hr = new Date().getHours();
                              if (hr >= 5 && hr < 12) return "Bom dia";
                              if (hr >= 12 && hr < 18) return "Boa tarde";
                              return "Boa noite";
                            })()}, {activeStudent.name.split(" ")[0]}!
                          </h2>
                          
                          {/* Health recovery dynamic calculations */}
                          <p className={`text-xs ${textBodyClass} font-semibold mt-2.5 flex items-center gap-1.5 leading-relaxed`}>
                            <Activity className="w-4 h-4 text-emerald-400 shrink-0" />
                            Seu corpo está <span className="text-emerald-400 font-bold">{!hasDoneCheckinToday ? 91 : Math.min(100, Math.max(30, 40 + checkinValues.sleepHours * 4 + (10 - checkinValues.fatigue) * 2))}%</span> recuperado.
                          </p>
                          <p className={`text-[10px] ${textMutedClass} font-mono mt-1 leading-snug`}>
                            💡 Hoje é um ótimo dia para treinar <span className="text-[#c3f400] font-bold">{activeStudent.objective === "Emagrecimento" ? "Membros Inferiores & Cárdio" : "Peitorais & Tríceps"}</span>.
                          </p>
                        </div>
                      </div>

                      {/* CARD PRINCIPAL: TREINO DE HOJE */}
                      <div className={`bg-gradient-to-r ${isLight ? "from-[#c3f400]/20 to-[#c3f400]/10 border-[#c3f400]/40" : "from-[#c3f400]/10 to-[#c3f400]/5 border-[#c3f400]/25"} border rounded-2xl p-4.5 space-y-4 relative overflow-hidden shadow-[0_4px_15px_rgba(0,0,242,0.05)]`}>
                        <div className="absolute top-0 right-0 w-24 h-24 bg-[#c3f400]/5 rounded-full filter blur-md"></div>
                        
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="flex items-center gap-1.5 text-[9px] font-mono text-[#c3f400] uppercase font-extrabold tracking-wider">
                              <Dumbbell className="w-3.5 h-3.5 text-[#c3f400]" />
                              Treino de Hoje Recomendado
                            </div>
                            <h3 className={`text-sm font-extrabold ${textTitleClass} mt-1.5 font-display uppercase`}>
                              {studentWorkouts.length > 0 ? studentWorkouts[0].name : "Treino A - Peitoral & Tríceps"}
                            </h3>
                            <p className={`${textMutedClass} text-[10px] font-mono mt-1`}>
                              ⏱️ {studentWorkouts.length > 0 ? "50 min" : "45 min"} • {studentWorkouts.length > 0 ? studentWorkouts[0].exercises.length : "5"} exercícios • volume previsto {studentWorkouts.length > 0 ? "11.200kg" : "9.800kg"}
                            </p>
                          </div>
                          <span className="text-[8px] font-mono bg-[#c3f400]/10 text-[#c3f400] border border-[#c3f400]/35 px-2 py-0.5 rounded font-bold uppercase shrink-0">Aba A</span>
                        </div>

                        <button
                          onClick={() => {
                            if (studentWorkouts.length > 0) {
                              handleStartWorkout(studentWorkouts[0]);
                            } else {
                              triggerSimNotification("Nenhum treino oficial cadastrado pelo professor ainda!");
                            }
                          }}
                          className="w-full py-2.5 primary-gradient text-[#121414] font-mono font-extrabold text-[11px] rounded-xl flex items-center justify-center gap-1.5 hover:shadow-[0_0_12px_rgba(0,242,255,0.25)] transition-all cursor-pointer active:scale-95"
                        >
                          <Play className="w-3.5 h-3.5 fill-[#121414]" />
                          Começar Treino Recomendado ⚡
                        </button>
                      </div>

                      {/* CARD RECOVERY STATUS BAR */}
                      <div 
                        onClick={() => setShowCheckinModal(true)}
                        className={`${cardBgClass} hover:border-[#c3f400]/40 rounded-2xl p-3.5 space-y-2.5 cursor-pointer transition-all`}
                      >
                        <div className="flex justify-between items-center text-[10px] font-mono">
                          <span className="font-bold text-[#c3f400] uppercase font-display tracking-wider">Fisiologia de Recuperação</span>
                          <span className="text-[9px] text-[#c3f400] flex items-center gap-0.5 font-bold">Registrar Check-in <ChevronRight className="w-3 h-3" /></span>
                        </div>

                        <div className="grid grid-cols-5 gap-1.5 text-center">
                          {[
                            { label: "Sono", val: `${checkinValues.sleepHours}h`, color: checkinValues.sleepHours >= 7 ? "text-emerald-400" : "text-amber-400" },
                            { label: "Fadiga", val: `${checkinValues.fatigue}/10`, color: checkinValues.fatigue < 6 ? "text-emerald-400" : "text-rose-400" },
                            { label: "Dor", val: `${checkinValues.pain}/10`, color: checkinValues.pain < 4 ? "text-emerald-400" : "text-amber-400" },
                            { label: "Estresse", val: `${checkinValues.stress}/10`, color: checkinValues.stress < 6 ? "text-emerald-400" : "text-amber-500" },
                            { label: "Motivação", val: `${checkinValues.motivation}/10`, color: "text-[#c3f400]" }
                          ].map((rec, i) => (
                            <div key={i} className={`${bgBaseClass} p-2 rounded-xl border ${borderSuttleClass} space-y-1`}>
                              <p className={`text-[8px] ${textMutedClass} font-mono font-semibold`}>{rec.label}</p>
                              <p className={`text-[10px] font-extrabold font-mono ${rec.color}`}>{rec.val}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* CARD EVOLUÇÃO (MINI GRÁFICO DE PESO) */}
                      <div 
                        onClick={() => setActiveSubTab("evolucao")}
                        className={`${cardBgClass} hover:border-[#c3f400]/40 rounded-2xl p-3.5 space-y-3 cursor-pointer transition-all`}
                      >
                        <div className="flex justify-between items-center text-[10px] font-mono">
                          <span className={`font-bold ${textMutedClass} uppercase font-display tracking-wider`}>Evolução de Composição</span>
                          <span className={`text-[8px] ${textMutedClass} font-bold`}>Ver Gráficos <ChevronRight className="w-3 h-3 inline" /></span>
                        </div>

                        <div className="grid grid-cols-3 gap-2 text-center">
                          <div className={`${bgBaseClass} p-2 rounded-xl border ${borderSuttleClass}`}>
                            <p className={`text-[8px] ${textMutedClass} font-mono`}>Peso Corporal</p>
                            <p className={`${textTitleClass} text-[11px] font-black mt-1 font-mono`}>{activeStudent.weight} kg</p>
                          </div>
                          <div className={`${bgBaseClass} p-2 rounded-xl border ${borderSuttleClass}`}>
                            <p className={`text-[8px] ${textMutedClass} font-mono`}>Gordura Corporal</p>
                            <p className="text-amber-400 text-[11px] font-black mt-1 font-mono">{activeStudent.bodyFat}%</p>
                          </div>
                          <div className={`${bgBaseClass} p-2 rounded-xl border ${borderSuttleClass}`}>
                            <p className={`text-[8px] ${textMutedClass} font-mono`}>Massa Muscular</p>
                            <p className="text-[#c3f400] text-[11px] font-black mt-1 font-mono">{activeStudent.muscleMass} kg</p>
                          </div>
                        </div>

                        {/* MINI GRAPH SPARKLINE DE PESO */}
                        <div className="pt-1.5">
                          <svg className="w-full h-8" viewBox="0 0 100 20" preserveAspectRatio="none">
                            <path
                              d="M 0,16 Q 15,10 30,13 T 60,6 T 100,2"
                              fill="none"
                              stroke="#c3f400"
                              strokeWidth="1.8"
                            />
                            <path
                              d="M 0,16 Q 15,10 30,13 T 60,6 T 100,2 L 100,20 L 0,20 Z"
                              fill="url(#sparkGrad)"
                              opacity="0.12"
                            />
                            <defs>
                              <linearGradient id="sparkGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#c3f400" />
                                <stop offset="100%" stopColor="#c3f400" stopOpacity="0" />
                              </linearGradient>
                            </defs>
                          </svg>
                          <div className={`flex justify-between items-center text-[7.5px] ${textMutedClass} font-mono pt-1`}>
                            <span>Maio 2026</span>
                            <span>Acompanhamento de Tendência Corporal</span>
                            <span>Julho 2026</span>
                          </div>
                        </div>
                      </div>

                      {/* CARD RECOMENDAÇÃO INTELIGENTE */}
                      <div className={`bg-[#c3f400]/5 border border-[#c3f400]/15 rounded-2xl p-3.5 flex gap-3 items-start`}>
                        <Sparkles className="w-4.5 h-4.5 text-[#c3f400] shrink-0 mt-0.5 animate-pulse" />
                        <div className="text-[10px] leading-relaxed">
                          <p className="text-[#c3f400] font-mono font-bold uppercase tracking-wider text-[8px]">Recomendação de Carga</p>
                          <p className={`${textBodyClass} mt-1`}>
                            "A análise biomecânica do seu Supino Reto sugere que você já está pronto para **aumentar 5% na carga** (cerca de +2kg de cada lado). Mantendo a cadência de descida de 3 segundos."
                          </p>
                        </div>
                      </div>

                      {/* TRIPLE QUICK METRICS GRID (Streak, Next Assessment, Alerts) */}
                      <div className="grid grid-cols-2 gap-3">
                        {/* Streak Card */}
                        <div 
                          onClick={() => setShowRankingModal(true)}
                          className={`${cardBgClass} rounded-2xl p-3 flex items-center gap-2.5 cursor-pointer hover:border-[#c3f400]/30 transition-all`}
                        >
                          <div className="w-8 h-8 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
                            <Flame className="w-4.5 h-4.5 text-amber-500 animate-pulse" />
                          </div>
                          <div>
                            <p className={`${textMutedClass} text-[8px] uppercase tracking-wider font-mono`}>Meu Streak</p>
                            <p className={`${textTitleClass} font-extrabold text-xs mt-0.5 font-display`}>{streakDays} dias 🔥</p>
                          </div>
                        </div>

                        {/* Next Assessment Card */}
                        <div 
                          onClick={() => setShowCalendarModal(true)}
                          className={`${cardBgClass} rounded-2xl p-3 flex items-center gap-2.5 cursor-pointer hover:border-[#c3f400]/30 transition-all`}
                        >
                          <div className="w-8 h-8 rounded-full bg-[#c3f400]/10 border border-[#c3f400]/20 flex items-center justify-center shrink-0">
                            <Calendar className="w-4.5 h-4.5 text-[#c3f400]" />
                          </div>
                          <div>
                            <p className={`${textMutedClass} text-[8px] uppercase tracking-wider font-mono`}>Prox. Avaliação</p>
                            <p className={`${textTitleClass} font-extrabold text-xs mt-0.5 font-display`}>15 de Julho 📅</p>
                          </div>
                        </div>
                      </div>

                      {/* ULTIMAS CONVERSAS COM PROFESSOR */}
                      <div 
                        onClick={() => {
                          setActiveSubTab("chat");
                        }}
                        className={`bg-[#c3f400]/5 border border-[#c3f400]/20 hover:border-[#c3f400]/45 rounded-2xl p-3.5 flex gap-3 cursor-pointer transition-all`}
                      >
                        <div className="w-9 h-9 rounded-full border border-[#c3f400]/30 object-cover shrink-0 overflow-hidden">
                          <img src={coachSettings.avatarUrl} className="w-full h-full object-cover" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className={`flex items-center justify-between text-[8px] font-mono ${textMutedClass} uppercase`}>
                            <span>Professor {coachSettings.name}</span>
                            <span>Há 1h</span>
                          </div>
                          <p className={`${textTitleClass} text-[11px] font-semibold mt-1 truncate`}>
                            "Não se esqueça de preencher todas as cargas hoje! Quero ver o progresso..."
                          </p>
                        </div>
                        <div className="w-2 h-2 rounded-full bg-[#c3f400] self-center shrink-0 animate-pulse"></div>
                      </div>

                      {/* BENTO GRID: UTILITIES / PORTAL DO ALUNO */}
                      <div className="space-y-2.5 pt-1.5">
                        <p className={`text-[9px] font-mono ${textMutedClass} uppercase tracking-widest font-extrabold font-display`}>Portal Aluno Connect</p>
                        
                        <div className="grid grid-cols-2 gap-2.5">
                          {/* 1. Check-in Diário */}
                          <button
                            onClick={() => setShowCheckinModal(true)}
                            className={`p-3 rounded-xl text-left transition-all flex items-center gap-3 cursor-pointer ${cardBgClass} hover:border-[#c3f400]/40`}
                          >
                            <div className="w-7 h-7 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-center shrink-0 text-rose-400">
                              <Heart className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                              <p className={`font-bold ${textTitleClass} text-[10.5px] leading-tight font-display uppercase`}>Check-in Diário</p>
                              <p className={`text-[8px] font-mono ${textMutedClass} mt-1 leading-none`}>Fisiologia</p>
                            </div>
                          </button>

                          {/* 2. Histórico de Treinos */}
                          <button
                            onClick={() => setShowHistoryModal(true)}
                            className={`p-3 rounded-xl text-left transition-all flex items-center gap-3 cursor-pointer ${cardBgClass} hover:border-[#c3f400]/40`}
                          >
                            <div className="w-7 h-7 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0 text-indigo-400">
                              <Clock className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                              <p className={`font-bold ${textTitleClass} text-[10.5px] leading-tight font-display uppercase`}>Meus Treinos</p>
                              <p className={`text-[8px] font-mono ${textMutedClass} mt-1 leading-none`}>Sessões</p>
                            </div>
                          </button>

                          {/* 3. Agenda Semanal */}
                          <button
                            onClick={() => setShowCalendarModal(true)}
                            className={`p-3 rounded-xl text-left transition-all flex items-center gap-3 cursor-pointer ${cardBgClass} hover:border-[#c3f400]/40`}
                          >
                            <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0 text-amber-500">
                              <Calendar className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                              <p className={`font-bold ${textTitleClass} text-[10.5px] leading-tight font-display uppercase`}>Minha Agenda</p>
                              <p className={`text-[8px] font-mono ${textMutedClass} mt-1 leading-none`}>Compromissos</p>
                            </div>
                          </button>

                          {/* 4. Conquistas & Selos */}
                          <button
                            onClick={() => setShowConquistasModal(true)}
                            className={`p-3 rounded-xl text-left transition-all flex items-center gap-3 cursor-pointer ${cardBgClass} hover:border-[#c3f400]/40`}
                          >
                            <div className="w-7 h-7 rounded-lg bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center shrink-0 text-yellow-500">
                              <Award className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                              <p className={`font-bold ${textTitleClass} text-[10.5px] leading-tight font-display uppercase`}>Conquistas</p>
                              <p className={`text-[8px] font-mono ${textMutedClass} mt-1 leading-none`}>Selos & Selos</p>
                            </div>
                          </button>

                          {/* 5. Ranking de Consistência */}
                          <button
                            onClick={() => setShowRankingModal(true)}
                            className={`p-3 rounded-xl text-left transition-all flex items-center gap-3 cursor-pointer ${cardBgClass} hover:border-[#c3f400]/40`}
                          >
                            <div className="w-7 h-7 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center shrink-0 text-orange-400">
                              <Flame className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                              <p className={`font-bold ${textTitleClass} text-[10.5px] leading-tight font-display uppercase`}>Ranking Alunos</p>
                              <p className={`text-[8px] font-mono ${textMutedClass} mt-1 leading-none`}>Leaderboard</p>
                            </div>
                          </button>

                          {/* 6. Desafios Mensais */}
                          <button
                            onClick={() => setShowDesafiosModal(true)}
                            className={`p-3 rounded-xl text-left transition-all flex items-center gap-3 cursor-pointer ${cardBgClass} hover:border-[#c3f400]/40`}
                          >
                            <div className="w-7 h-7 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center shrink-0 text-purple-400">
                              <Compass className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                              <p className={`font-bold ${textTitleClass} text-[10.5px] leading-tight font-display uppercase`}>Desafios</p>
                              <p className={`text-[8px] font-mono ${textMutedClass} mt-1 leading-none`}>Atividades</p>
                            </div>
                          </button>

                          {/* 7. Área Financeira */}
                          <button
                            onClick={() => setShowFinanceiroModal(true)}
                            className={`p-3 rounded-xl text-left transition-all flex items-center gap-3 cursor-pointer ${cardBgClass} hover:border-[#c3f400]/40`}
                          >
                            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0 text-emerald-400">
                              <CreditCard className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                              <p className={`font-bold ${textTitleClass} text-[10.5px] leading-tight font-display uppercase`}>Mensalidades</p>
                              <p className={`text-[8px] font-mono ${textMutedClass} mt-1 leading-none`}>Plano & Pix</p>
                            </div>
                          </button>

                          {/* 8. Insights de Performance */}
                          <button
                            onClick={() => setShowInsightsModal(true)}
                            className={`p-3 rounded-xl text-left transition-all flex items-center gap-3 cursor-pointer ${cardBgClass} hover:border-[#c3f400]/40`}
                          >
                            <div className="w-7 h-7 rounded-lg bg-[#c3f400]/10 border border-[#c3f400]/20 flex items-center justify-center shrink-0 text-[#c3f400]">
                              <Sparkles className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                              <p className={`font-bold ${textTitleClass} text-[10.5px] leading-tight font-display uppercase`}>Métricas do Treino</p>
                              <p className={`text-[8px] font-mono ${textMutedClass} mt-1 leading-none`}>Análises</p>
                            </div>
                          </button>
                        </div>
                      </div>

                    </div>
                  )}

                  {/* TAB 2: TREINAR (WORKOUT EXECUTIONS LIST & TIMER) */}
            {activeSubTab === "treino" && (
                <div className="space-y-4 pt-2">
                  
                  <div className={`flex items-center justify-between border-b ${borderSuttleClass} pb-2`}>
                    <h2 className={`text-sm font-extrabold ${textTitleClass} tracking-tight flex items-center gap-1.5 font-display uppercase tracking-wider`}>
                      <Dumbbell className="w-4 h-4 text-[#c3f400]" />
                      Ficha de Treinos
                    </h2>
                    {/* Library trigger */}
                    <button
                      onClick={() => setShowLibraryDrawer(true)}
                      className="flex items-center gap-1 text-[9px] font-mono text-[#c3f400] uppercase border border-[#c3f400]/20 px-2 py-1 rounded-lg hover:bg-[#c3f400]/10 cursor-pointer"
                    >
                      <BookOpen className="w-3 h-3" />
                      Biblioteca
                    </button>
                  </div>

                  {isExecutingWorkout && activeExecutingWorkout ? (
                    /* WORKOUT ACTIVE SESSION EXECUTION ENGINE */
                    <div className="space-y-4">
                      
                      {/* Active session top headers */}
                      <div className={`${cardBgClass} border-[#c3f400]/30 rounded-2xl p-3.5 flex justify-between items-center`}>
                        <div>
                          <span className="text-[8px] font-mono text-[#c3f400] uppercase font-bold tracking-widest">Execução Ativa</span>
                          <h3 className={`text-xs font-bold ${textTitleClass} mt-0.5 font-display uppercase`}>{activeExecutingWorkout.name}</h3>
                        </div>
                        <div className="text-right font-mono text-xs">
                          <p className={`${textMutedClass} text-[8px] uppercase`}>Tempo Decorrido</p>
                          <p className="text-[#c3f400] font-extrabold mt-0.5">{formatTime(workoutTimer)}</p>
                        </div>
                      </div>

                      {/* EXERCISES PAGED VIEWS */}
                      <div className={`flex items-center justify-between font-mono text-[10px] ${textMutedClass}`}>
                        <span>Exercício {currentExerciseIndex + 1} de {activeExecutingWorkout.exercises.length}</span>
                        <div className="flex gap-1.5">
                          <button
                            disabled={currentExerciseIndex === 0}
                            onClick={() => setCurrentExerciseIndex(prev => prev - 1)}
                            className={`p-1 rounded-lg ${isLight ? "bg-gray-200 text-gray-700" : "bg-gray-800 text-white"} disabled:opacity-30 cursor-pointer`}
                          >
                            <ChevronLeft className="w-4 h-4" />
                          </button>
                          <button
                            disabled={currentExerciseIndex === activeExecutingWorkout.exercises.length - 1}
                            onClick={() => setCurrentExerciseIndex(prev => prev + 1)}
                            className={`p-1 rounded-lg ${isLight ? "bg-gray-200 text-gray-700" : "bg-gray-800 text-white"} disabled:opacity-30 cursor-pointer`}
                          >
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* CURRENT EXERCISE DETAILS CARD */}
                      {activeExecutingWorkout.exercises[currentExerciseIndex] && (() => {
                        const ex = activeExecutingWorkout.exercises[currentExerciseIndex];
                        return (
                          <div className="space-y-4">
                            
                            {/* Exercise title & tips banner */}
                            <div className={`${cardBgClass} rounded-2xl p-4 space-y-2`}>
                              <h4 className={`text-sm font-bold ${textTitleClass} font-display uppercase`}>{ex.name}</h4>
                              <p className="text-[10px] text-[#c3f400] font-mono uppercase bg-[#c3f400]/5 border border-[#c3f400]/10 px-2 py-0.5 rounded inline-block">
                                Alvo: {ex.muscleGroup || "Musculatura"}
                              </p>
                              {ex.notes && (
                                <p className={`text-[10px] ${textMutedClass} italic bg-black/5 p-2.5 rounded-lg border ${borderSuttleClass} leading-relaxed`}>
                                  💡 <b>Dica do Professor:</b> {ex.notes}
                                </p>
                              )}
                              {ex.advancedTechnique && (
                                <div className="bg-[#c3f400]/10 border border-[#c3f400]/30 p-2.5 rounded-xl text-[10px] text-[#121414] dark:text-white flex items-center gap-2">
                                  <Sparkles className="w-4 h-4 text-[#c3f400] animate-pulse shrink-0" />
                                  <span>Técnica Avançada: <b className="text-[#c3f400]">{ex.advancedTechnique}</b> nas séries {ex.techniqueSetTarget ? ex.techniqueSetTarget.join(",") : "finais"}!</span>
                                </div>
                              )}
                            </div>

                            {/* SERIES RECORD ENGINE */}
                            <div className={`${cardBgClass} rounded-2xl p-3 space-y-2`}>
                              <div className={`grid grid-cols-5 text-[8px] font-mono ${textMutedClass} uppercase pb-1 text-center font-bold`}>
                                <span>Série</span>
                                <span>Meta</span>
                                <span>Peso (kg)</span>
                                <span>Reps</span>
                                <span>Check</span>
                              </div>

                              {Array.from({ length: ex.sets }).map((_, s) => {
                                const key = `${ex.id}-${s}`;
                                const isChecked = completedSets[key];
                                const weight = recordedWeights[key] || ex.weight;
                                const reps = recordedReps[key] || ex.reps;
                                const hasAdvTechOnThisSet = ex.advancedTechnique && ex.techniqueSetTarget?.includes(s + 1);

                                return (
                                  <div 
                                    key={s} 
                                    className={`grid grid-cols-5 gap-1 py-1.5 items-center text-center font-mono text-xs rounded-lg px-1 transition-all ${
                                      isChecked ? "bg-emerald-500/5 text-gray-400" : hasAdvTechOnThisSet ? "bg-[#c3f400]/5" : ""
                                    }`}
                                  >
                                    <span className="font-bold flex items-center justify-center gap-1">
                                      {s + 1}
                                      {hasAdvTechOnThisSet && <span className="w-1.5 h-1.5 rounded-full bg-[#c3f400]" title="Técnica Avançada!"></span>}
                                    </span>
                                    <span className={`text-[10px] ${textMutedClass}`}>{ex.weight}kg x {ex.reps}</span>
                                    
                                    {/* Weight input */}
                                    <input 
                                      type="number"
                                      value={weight}
                                      disabled={isChecked}
                                      onChange={(e) => setRecordedWeights({
                                        ...recordedWeights,
                                        [key]: parseFloat(e.target.value) || 0
                                      })}
                                      className={`bg-black/10 border ${borderSuttleClass} rounded px-1.5 py-0.5 text-center ${textTitleClass} text-[11px] font-bold focus:border-[#c3f400] outline-none`}
                                    />

                                    {/* Reps input */}
                                    <input 
                                      type="text"
                                      value={reps}
                                      disabled={isChecked}
                                      onChange={(e) => setRecordedReps({
                                        ...recordedReps,
                                        [key]: e.target.value
                                      })}
                                      className={`bg-black/10 border ${borderSuttleClass} rounded px-1 py-0.5 text-center ${textTitleClass} text-[11px] focus:border-[#c3f400] outline-none`}
                                    />

                                    {/* Completion checkbox checkmark */}
                                    <button
                                      onClick={() => handleToggleSet(ex.id, s, weight)}
                                      className={`w-6 h-6 mx-auto rounded-md flex items-center justify-center border transition-all cursor-pointer ${
                                        isChecked 
                                          ? "bg-emerald-500/20 border-emerald-500 text-emerald-400" 
                                          : `bg-black/10 ${borderSuttleClass} text-gray-400 hover:border-gray-500`
                                      }`}
                                    >
                                      {isChecked ? <Check className="w-4 h-4" /> : null}
                                    </button>
                                  </div>
                                );
                              })}
                            </div>

                            {/* RECORD PAIN OR DISCOMFORT */}
                            <div className={`${bgSubtleClass} border ${borderSuttleClass} rounded-2xl p-3 flex items-center justify-between text-xs font-mono`}>
                              <div>
                                <p className={`font-bold ${textTitleClass}`}>Registrar Dor Articular?</p>
                                <p className={`text-[8px] ${textMutedClass}`}>Avise o professor caso sinta desconfortos</p>
                              </div>
                              <select
                                value={recordedPain[ex.id] || "none"}
                                onChange={(e) => {
                                  const level = e.target.value as any;
                                  setRecordedPain({ ...recordedPain, [ex.id]: level });
                                  if (level !== "none") {
                                    triggerSimNotification(`Alerta de dor registrado (${level})! O professor será notificado.`);
                                  }
                                }}
                                className={`bg-black/10 text-[10px] ${textTitleClass} border ${borderSuttleClass} rounded-lg p-1.5 outline-none cursor-pointer`}
                              >
                                <option value="none" className={isLight ? "text-black" : "text-white"}>Nenhuma 🟢</option>
                                <option value="mild" className={isLight ? "text-black" : "text-white"}>Leve 🟡</option>
                                <option value="moderate" className={isLight ? "text-black" : "text-white"}>Moderada 🟠</option>
                                <option value="severe" className={isLight ? "text-black" : "text-white"}>Intensa 🔴</option>
                              </select>
                            </div>

                            {/* FINISH WORKOUT ACTION */}
                            <div className="flex gap-2.5 pt-2">
                              <button
                                onClick={() => {
                                  if (confirm("Deseja interromper este treino? O progresso de hoje será cancelado.")) {
                                    setIsExecutingWorkout(false);
                                  }
                                }}
                                className={`flex-1 py-3 ${cardBgClass} hover:bg-red-500/10 hover:text-red-400 rounded-xl text-center text-xs font-mono font-bold text-gray-400 transition-all cursor-pointer`}
                              >
                                Cancelar
                              </button>
                              <button
                                onClick={handleCompleteWorkout}
                                className="flex-[2.5] py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-[#121414] rounded-xl text-center text-xs font-mono font-extrabold shadow-[0_0_15px_rgba(16,185,129,0.25)] hover:opacity-95 active:scale-95 transition-all cursor-pointer"
                              >
                                Concluir Treino! 🎉
                              </button>
                            </div>

                          </div>
                        );
                      })()}

                    </div>
                  ) : (
                    /* WORKOUT DIVISION LIST (CHOOSE SHEET TO BEGIN) - OPTION 1 & OPTION 3 COMBINED */
                    <div className="space-y-4">
                      <p className={`text-[10px] ${textBodyClass} leading-relaxed font-mono`}>
                        Selecione um treino abaixo para ver os detalhes completos ou iniciar a execução interativa das séries.
                      </p>

                      {studentWorkouts.length > 0 ? (
                        <div className="space-y-3.5">
                          {studentWorkouts.map((workout) => {
                             const isExpanded = !!expandedWorkoutIds[workout.id];
                             const totalSets = workout.exercises.reduce((acc, ex) => acc + ex.sets, 0);
                             const uniqueMuscles = Array.from(new Set(workout.exercises.map(e => e.muscleGroup).filter(Boolean)));
                             const muscleFocus = uniqueMuscles.length > 0 ? uniqueMuscles.join(" & ") : "Geral";
                             const estDuration = Math.max(30, workout.exercises.length * 8 + 10);

                             return (
                               <div 
                                 key={workout.id} 
                                 onClick={() => setSelectedPreWorkout(workout)}
                                 className={`${cardBgClass} border-l-4 border-l-[#c3f400] hover:border-[#c3f400]/40 active:border-[#c3f400]/60 rounded-2xl p-4.5 space-y-3.5 transition-all duration-300 hover:translate-y-[-2px] cursor-pointer group relative overflow-hidden shadow-md`}
                               >
                                 {/* Glowing subtle decorative outline on hover */}
                                 <div className="absolute inset-0 bg-gradient-to-r from-[#c3f400]/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

                                 <div className="flex justify-between items-start gap-2">
                                   <div className="space-y-1.5 min-w-0">
                                     <span className="inline-flex items-center gap-1.5 text-[8.5px] font-mono font-bold tracking-wider text-[#c3f400] uppercase bg-[#c3f400]/5 border border-[#c3f400]/15 px-2.5 py-0.5 rounded-full">
                                       <span className="w-1.5 h-1.5 rounded-full bg-[#c3f400] shadow-[0_0_6px_#c3f400] animate-pulse"></span>
                                       {muscleFocus}
                                     </span>
                                     <h3 className={`font-extrabold text-sm ${textTitleClass} group-hover:text-[#c3f400] transition-colors pt-0.5 font-display uppercase tracking-tight`}>
                                       {workout.name}
                                     </h3>
                                     <p className={`text-[9px] font-mono ${textMutedClass}`}>Ficha atualizada em {workout.lastUpdated.split("T")[0]}</p>
                                   </div>
                                   <div className="flex flex-col items-end gap-1.5 shrink-0 text-right">
                                     <span className="text-[9.5px] font-mono bg-[#c3f400]/10 text-[#c3f400] border border-[#c3f400]/20 px-2.5 py-0.5 rounded-full font-extrabold">
                                       {workout.exercises.length} EXS
                                     </span>
                                     <span className={`text-[8.5px] font-mono ${textMutedClass} font-semibold`}>
                                       {totalSets} séries totais
                                     </span>
                                   </div>
                                 </div>

                                 {/* Modern Exercise Segment Progress Tracker */}
                                 <div className="space-y-1">
                                   <div className="flex justify-between items-center text-[8.5px] font-mono uppercase tracking-wider text-gray-500">
                                     <span>Estrutura de Treino</span>
                                     <span>{workout.exercises.length} exercícios</span>
                                   </div>
                                   <div className="flex gap-1 pt-0.5">
                                     {workout.exercises.map((_, i) => (
                                       <div key={i} className="h-1 flex-1 rounded-full bg-black/20 dark:bg-white/5 overflow-hidden">
                                         <div className="h-full w-full bg-[#c3f400] rounded-full opacity-80 group-hover:opacity-100 transition-opacity animate-pulse" />
                                       </div>
                                     ))}
                                   </div>
                                 </div>

                                 {/* Micro stats pills */}
                                 <div className={`flex flex-wrap items-center gap-2 border-t ${borderSuttleClass} pt-3 text-[10px] font-mono`}>
                                   <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-black/15 text-[#c3f400] border border-[#c3f400]/10 font-bold">
                                     <Clock className="w-3 h-3 text-[#c3f400]" />
                                     ~{estDuration} min
                                   </span>
                                   <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-black/15 text-emerald-400 border border-emerald-500/10 font-bold">
                                     <Dumbbell className="w-3 h-3 text-emerald-400" />
                                     RPE: 8-9
                                   </span>
                                   <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-black/15 text-blue-400 border border-blue-500/10 font-bold">
                                     <Zap className="w-3 h-3 text-blue-400 animate-pulse" />
                                     Intensidade Máxima
                                   </span>
                                 </div>

                                 {/* Inline Expander Controls (Option 1) */}
                                 <div className={`flex items-center justify-between gap-2 border-t ${borderSuttleClass} pt-2.5`}>
                                   <button
                                     onClick={(e) => {
                                       e.stopPropagation();
                                       setExpandedWorkoutIds(prev => ({ ...prev, [workout.id]: !prev[workout.id] }));
                                     }}
                                     className={`flex items-center gap-1 text-[10px] font-mono ${textMutedClass} hover:text-[#c3f400] transition-colors cursor-pointer py-1`}
                                   >
                                     {isExpanded ? (
                                       <>
                                         <ChevronUp className="w-3.5 h-3.5 text-[#c3f400]" />
                                         <span>Ocultar exercícios</span>
                                       </>
                                     ) : (
                                       <>
                                         <ChevronDown className="w-3.5 h-3.5 text-[#c3f400]" />
                                         <span>Ver exercícios ({workout.exercises.length})</span>
                                       </>
                                     )}
                                   </button>

                                   <div className="flex items-center gap-1 text-[10px] font-mono text-[#c3f400] group-hover:translate-x-1.5 transition-transform font-bold">
                                     <span>Iniciar Treino</span>
                                     <ChevronRight className="w-3.5 h-3.5" />
                                   </div>
                                 </div>

                                 {/* Collapsible list (Option 1 details) */}
                                 <AnimatePresence initial={false}>
                                   {isExpanded && (
                                     <motion.div
                                       initial={{ height: 0, opacity: 0 }}
                                       animate={{ height: "auto", opacity: 1 }}
                                       exit={{ height: 0, opacity: 0 }}
                                       transition={{ duration: 0.2 }}
                                       onClick={(e) => e.stopPropagation()}
                                       className={`overflow-hidden border-t ${borderSuttleClass} mt-2.5 pt-2`}
                                     >
                                       <div className={`${bgBaseClass} rounded-xl p-3 space-y-2.5 text-[10px] font-mono border ${borderSuttleClass}`}>
                                         {workout.exercises.map((ex, idx) => (
                                           <div key={idx} className={`flex justify-between items-center py-1 border-b last:border-b-0 border-[#343535]/10 ${textBodyClass}`}>
                                             <span className="truncate pr-2">
                                               <span className={`${textMutedClass} mr-1.5 font-bold`}>{idx + 1}.</span> {ex.name}
                                             </span>
                                             <span className={`${textMutedClass} text-[9.5px] shrink-0 font-bold`}>
                                               {ex.sets}x{ex.reps} <span className="text-[#c3f400]">({ex.weight}kg)</span>
                                             </span>
                                           </div>
                                         ))}
                                       </div>
                                     </motion.div>
                                   )}
                                 </AnimatePresence>
                               </div>
                             );
                           })}
                         </div>
                       ) : (
                         <div className={`p-10 border ${borderSuttleClass} rounded-2xl text-center space-y-3`}>
                           <Dumbbell className={`w-8 h-8 ${textMutedClass} mx-auto opacity-40 animate-bounce`} />
                           <p className={`text-xs ${textBodyClass} font-mono`}>Nenhuma divisão cadastrada para você pelo treinador ainda.</p>
                         </div>
                       )}
                     </div>
                  )}

                </div>
              )}

              {/* TAB 3: EVOLUÇÃO (TRACKING CHARTS, assessments & postural analyses) */}
              {activeSubTab === "evolucao" && (
                <div className="space-y-5 pt-2">
                  
                  <h2 className={`text-sm font-extrabold ${textTitleClass} tracking-tight flex items-center gap-1.5 border-b ${borderSuttleClass} pb-2 font-display uppercase tracking-wider`}>
                    <TrendingUp className="w-4 h-4 text-[#c3f400]" />
                    Sua Evolução Física
                  </h2>

                  {/* DOUBLE GRAPHS (Weight and BF%) */}
                  <div className="space-y-4">
                    
                    {/* Weight chart */}
                    <div className={`${cardBgClass} rounded-2xl p-3.5 space-y-2`}>
                      <p className="text-[10px] font-mono text-[#c3f400] uppercase font-bold">Histórico de Peso (kg)</p>
                      <div className="h-44 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={chartsData.weight} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                            <defs>
                              <linearGradient id="weightGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#c3f400" stopOpacity={0.2}/>
                                <stop offset="95%" stopColor="#c3f400" stopOpacity={0}/>
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke={isLight ? "rgba(0,0,0,0.05)" : "rgba(255,255,255,0.05)"} />
                            <XAxis dataKey="date" stroke="#6b7280" fontSize={8} tickLine={false} />
                            <YAxis stroke="#6b7280" fontSize={8} domain={["auto", "auto"]} tickLine={false} />
                            <Tooltip contentStyle={{ backgroundColor: isLight ? "#ffffff" : "#1e2020", border: isLight ? "1px solid rgba(0,0,0,0.1)" : "1px solid rgba(255,255,255,0.1)", color: isLight ? "#121414" : "#ffffff", fontSize: 10 }} />
                            <Area type="monotone" dataKey="peso" stroke="#c3f400" fillOpacity={1} fill="url(#weightGrad)" strokeWidth={2} />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* BF% Chart */}
                    <div className={`${cardBgClass} rounded-2xl p-3.5 space-y-2`}>
                      <p className="text-[10px] font-mono text-[#c3f400] uppercase font-bold">Gordura Corporal (BF%)</p>
                      <div className="h-44 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={chartsData.bf} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke={isLight ? "rgba(0,0,0,0.05)" : "rgba(255,255,255,0.05)"} />
                            <XAxis dataKey="date" stroke="#6b7280" fontSize={8} tickLine={false} />
                            <YAxis stroke="#6b7280" fontSize={8} tickLine={false} />
                            <Tooltip contentStyle={{ backgroundColor: isLight ? "#ffffff" : "#1e2020", border: isLight ? "1px solid rgba(0,0,0,0.1)" : "1px solid rgba(255,255,255,0.1)", color: isLight ? "#121414" : "#ffffff", fontSize: 10 }} />
                            <Line type="monotone" dataKey="bf" stroke="#c3f400" strokeWidth={2.5} dot={{ fill: "#c3f400" }} />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                  </div>

                  {/* BEFORE AFTER PHOTO COMPARISON SLIDER */}
                  <div className={`${cardBgClass} rounded-2xl p-3.5 space-y-3`}>
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-[10px] font-mono text-[#c3f400] uppercase font-bold">Comparador de Fotos de Evolução</p>
                        <p className={`text-[9px] ${textMutedClass} font-mono mt-0.5`}>Arraste a barra para comparar sua evolução</p>
                      </div>
                      {comparisonPhotos.hasRealPhotos && (
                        <span className="text-[8px] bg-[#c3f400]/10 text-[#c3f400] font-mono px-1.5 py-0.5 rounded font-bold uppercase tracking-wider animate-pulse">
                          Fotos do Aluno Sincronizadas
                        </span>
                      )}
                    </div>

                    <div 
                      className={`relative h-64 w-full rounded-xl overflow-hidden select-none cursor-ew-resize border ${borderSuttleClass}`}
                      onMouseMove={handleMouseMove}
                      onMouseDown={() => setIsDraggingSlider(true)}
                      onMouseUp={() => setIsDraggingSlider(false)}
                      onMouseLeave={() => setIsDraggingSlider(false)}
                      onTouchMove={handleTouchMove}
                    >
                      {/* Image Before (Left) */}
                      <img 
                        src={comparisonPhotos.before} 
                        alt="Antes" 
                        className="absolute inset-0 w-full h-full object-cover"
                      />

                      {/* Image After (Right - clipped based on sliderPosition) */}
                      <div 
                        className="absolute inset-y-0 right-0 overflow-hidden"
                        style={{ left: `${sliderPosition}%` }}
                      >
                        <img 
                          src={comparisonPhotos.after} 
                          alt="Depois" 
                          className="absolute inset-0 h-full object-cover"
                          style={{ width: "395px", maxWidth: "none", transform: `translateX(-${sliderPosition}%)` }}
                        />
                      </div>

                      {/* Slider Handle Divider Line */}
                      <div 
                        className="absolute inset-y-0 w-1 bg-[#c3f400] cursor-ew-resize shadow-[0_0_10px_#c3f400]"
                        style={{ left: `${sliderPosition}%` }}
                      >
                        {/* Interactive Handle handle center */}
                        <div className="w-7 h-7 rounded-full bg-black border-2 border-[#c3f400] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center shadow-lg">
                          <span className="text-[8px] font-bold text-[#c3f400]">↔</span>
                        </div>
                      </div>

                      {/* Overlays badges label */}
                      <span className="absolute bottom-2.5 left-2.5 bg-black/60 backdrop-blur-xs text-[9px] font-mono text-gray-300 px-2 py-0.5 rounded border border-white/10">ANTES ({comparisonPhotos.beforeDate})</span>
                      <span className="absolute bottom-2.5 right-2.5 bg-black/60 backdrop-blur-xs text-[9px] font-mono text-[#c3f400] px-2 py-0.5 rounded border border-[#c3f400]/30">DEPOIS ({comparisonPhotos.afterDate})</span>
                    </div>
                  </div>

                  {/* EXPANDABLE ASSESSMENT / POSTURAL REPORTS */}
                  <div className="space-y-3">
                    
                    {/* Antropometria Report summary */}
                    <div className={`${cardBgClass} rounded-2xl overflow-hidden`}>
                      <button
                        onClick={() => setExpandedLaudo(expandedLaudo === "antropo" ? null : "antropo")}
                        className="w-full p-4 flex items-center justify-between text-left cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-[#c3f400]/10 text-[#c3f400] flex items-center justify-center">
                            <FileText className="w-4 h-4" />
                          </div>
                          <div>
                            <h4 className={`text-xs font-bold ${textTitleClass} font-display uppercase`}>Avaliação Antropométrica</h4>
                            <p className={`text-[9px] ${textMutedClass} font-mono`}>Dobra cutâneas e perímetros</p>
                          </div>
                        </div>
                        <ChevronRight className={`w-4 h-4 ${textMutedClass} transition-transform ${expandedLaudo === "antropo" ? "rotate-90" : ""}`} />
                      </button>

                      <AnimatePresence>
                        {expandedLaudo === "antropo" && (
                          <motion.div 
                            initial={{ height: 0 }}
                            animate={{ height: "auto" }}
                            exit={{ height: 0 }}
                            className={`overflow-hidden border-t ${borderSuttleClass} ${bgBaseClass} font-mono text-[10px]`}
                          >
                            <div className={`p-4 space-y-2.5 leading-relaxed ${textBodyClass}`}>
                              <div className={`grid grid-cols-2 gap-2 border-b ${borderSuttleClass} pb-2`}>
                                <div>• Peitoral: <b className={textTitleClass}>12.5 mm</b></div>
                                <div>• Axilar Média: <b className={textTitleClass}>14.0 mm</b></div>
                                <div>• Tricep: <b className={textTitleClass}>9.5 mm</b></div>
                                <div>• Subescapular: <b className={textTitleClass}>15.0 mm</b></div>
                                <div>• Supra-ilíaca: <b className={textTitleClass}>18.5 mm</b></div>
                                <div>• Abdominal: <b className={textTitleClass}>22.0 mm</b></div>
                                <div>• Coxa: <b className={textTitleClass}>11.5 mm</b></div>
                              </div>
                              <p className="font-bold uppercase text-[9px] tracking-wider text-[#c3f400]">Percentuais Finais Calculados:</p>
                              <div className="flex justify-between">
                                <span>Gordura (BF%):</span>
                                <b className={textTitleClass}>{(activeStudent.weight ? 14.5 : 15).toFixed(1)}% (Faixa Ideal)</b>
                              </div>
                              <div className="flex justify-between">
                                <span>Massa Muscular Ativa:</span>
                                <b className={textTitleClass}>{(activeStudent.weight ? activeStudent.weight * 0.79 : 65).toFixed(1)} kg</b>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Postural Analysis Summary */}
                    <div className={`${cardBgClass} rounded-2xl overflow-hidden`}>
                      <button
                        onClick={() => setExpandedLaudo(expandedLaudo === "postura" ? null : "postura")}
                        className="w-full p-4 flex items-center justify-between text-left cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-[#c3f400]/10 text-[#c3f400] flex items-center justify-center">
                            <Activity className="w-4 h-4" />
                          </div>
                          <div>
                            <h4 className={`text-xs font-bold ${textTitleClass} font-display uppercase`}>Análise Postural Visual</h4>
                            <p className={`text-[9px] ${textMutedClass} font-mono`}>
                              {latestPosturalEval ? `Simetria ${latestPosturalEval.kpis?.simetria || 85}% • ${latestPosturalEval.date}` : "Simetrias e desvios biomecânicos"}
                            </p>
                          </div>
                        </div>
                        <ChevronRight className={`w-4 h-4 ${textMutedClass} transition-transform ${expandedLaudo === "postura" ? "rotate-90" : ""}`} />
                      </button>

                      <AnimatePresence>
                        {expandedLaudo === "postura" && (
                          <motion.div 
                            initial={{ height: 0 }}
                            animate={{ height: "auto" }}
                            exit={{ height: 0 }}
                            className={`overflow-hidden border-t ${borderSuttleClass} ${bgBaseClass} font-mono text-[10px]`}
                          >
                            <div className={`p-4 space-y-2.5 leading-relaxed ${textBodyClass}`}>
                              <p className={`font-bold ${textTitleClass} flex justify-between`}>
                                <span>Laudo Biomecânico qualitativo:</span>
                                {latestPosturalEval && <span className="text-[#c3f400] font-bold">({latestPosturalEval.date})</span>}
                              </p>
                              <div className="space-y-1.5">
                                <p>• <b>Cervical:</b> {latestPosturalEval ? latestPosturalEval.deviations?.cervical : "Leve anteriorização da cabeça (grau I), passível de correção com fortalecimento de romboides."}</p>
                                <p>• <b>Ombros:</b> {latestPosturalEval ? latestPosturalEval.deviations?.ombros : "Leve elevação do ombro esquerdo (~0.5cm) por tensão em trapézio."}</p>
                                <p>• <b>Lombar / Pelve:</b> {latestPosturalEval ? latestPosturalEval.deviations?.pelve : "Alinhamento dentro dos padrões normativos, sem báscula de bacia evidente."}</p>
                                <div className="mt-1 space-y-1">
                                  <span className="font-bold block text-white">• Recomendações / Exercícios Corretivos:</span>
                                  {latestPosturalEval ? (
                                    Array.isArray(latestPosturalEval.suggestions) ? (
                                      latestPosturalEval.suggestions.map((ex: any, idx: number) => (
                                        <div key={idx} className="pl-2 border-l border-[#c3f400]/40 py-0.5 mt-1">
                                          <p className="font-semibold text-white">• {ex.name} ({ex.sets}x{ex.reps})</p>
                                          <p className="text-[9px] text-gray-400 pl-2.5">{ex.description}</p>
                                          {ex.notes && <p className="text-[8px] text-amber-400/80 pl-2.5 italic">Obs: {ex.notes}</p>}
                                        </div>
                                      ))
                                    ) : typeof latestPosturalEval.suggestions === "string" ? (
                                      <p className="pl-2 border-l border-[#c3f400]/40 py-0.5 text-gray-300">{latestPosturalEval.suggestions}</p>
                                    ) : (
                                      <p className="pl-2 border-l border-[#c3f400]/40 py-0.5 text-gray-300">
                                        {Array.isArray(latestPosturalEval.observations)
                                          ? latestPosturalEval.observations.join(". ")
                                          : (latestPosturalEval.observations || latestPosturalEval.deviations?.joelhos || "Realizar alongamento de cadeia posterior nas sessões de flexibilidade pós-treino.")}
                                      </p>
                                    )
                                  ) : (
                                    <p className="pl-2 border-l border-[#c3f400]/40 py-0.5 text-gray-300">Realizar alongamento de cadeia posterior nas sessões de flexibilidade pós-treino.</p>
                                  )}
                                </div>
                                {latestPosturalEval?.observations && (
                                  <p className="mt-2 text-gray-400 italic">
                                    Obs: {Array.isArray(latestPosturalEval.observations)
                                      ? latestPosturalEval.observations.join(". ")
                                      : latestPosturalEval.observations}
                                  </p>
                                )}
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                  </div>

                </div>
              )}

              {/* TAB 4: CHAT DIRETO E IA COACH */}
              {activeSubTab === "chat" && (
                <div className="flex flex-col h-[640px] pt-2">
                  
                  {/* Chat header sub-navigation switch */}
                  <div className={`${cardBgClass} p-2.5 rounded-xl flex gap-1 justify-center`}>
                    <button 
                      onClick={() => setChatMode("ia")}
                      className={`flex-1 text-center py-1.5 rounded-lg font-mono font-bold text-[10px] cursor-pointer transition-all ${
                        chatMode === "ia" 
                          ? "bg-[#c3f400]/15 text-[#c3f400] border border-[#c3f400]/30 shadow-[0_0_10px_rgba(195,244,0,0.15)]" 
                          : `${textMutedClass} hover:${textTitleClass}`
                      }`}
                    >
                      Coach Virtual 🤖
                    </button>
                    <button 
                      onClick={() => setChatMode("professor")}
                      className={`flex-1 text-center py-1.5 rounded-lg font-mono font-bold text-[10px] cursor-pointer transition-all ${
                        chatMode === "professor" 
                          ? "bg-[#c3f400]/15 text-[#c3f400] border border-[#c3f400]/30 shadow-[0_0_10px_rgba(195,244,0,0.15)]" 
                          : `${textMutedClass} hover:${textTitleClass}`
                      }`}
                    >
                      Falar com Professor
                    </button>
                  </div>

                  {chatMode === "ia" ? (
                    <>
                      {/* MESSAGES VIEWPORT CONTAINER */}
                      <div className="flex-1 overflow-y-auto space-y-3.5 my-3.5 pr-1 scrollbar-none">
                        {chatMessages.map((msg, idx) => (
                          <div 
                            key={idx} 
                            className={`flex ${msg.sender === "student" ? "justify-end" : "justify-start"}`}
                          >
                            <div className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed ${
                              msg.sender === "student" 
                                ? "bg-[#c3f400] text-[#121414] font-semibold rounded-br-2xs" 
                                : `${bgSubtleClass} ${textTitleClass} border ${borderSuttleClass} rounded-bl-2xs`
                            }`}>
                              <p>{msg.text}</p>
                              <span className={`block text-[8px] font-mono text-right mt-1.5 ${
                                msg.sender === "student" ? "text-[#121414]/70" : textMutedClass
                              }`}>
                                {msg.timestamp}
                              </span>
                            </div>
                          </div>
                        ))}
                        {isAiLoading && (
                          <div className="flex justify-start">
                            <div className={`${bgSubtleClass} border ${borderSuttleClass} rounded-2xl rounded-bl-2xs p-3.5 flex items-center gap-2`}>
                              <div className="flex gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#c3f400] animate-bounce" style={{ animationDelay: "0ms" }}></span>
                                <span className="w-1.5 h-1.5 rounded-full bg-[#c3f400] animate-bounce" style={{ animationDelay: "150ms" }}></span>
                                <span className="w-1.5 h-1.5 rounded-full bg-[#c3f400] animate-bounce" style={{ animationDelay: "300ms" }}></span>
                              </div>
                              <span className={`text-[10px] font-mono ${textMutedClass} italic`}>Analisando fibras corporais...</span>
                            </div>
                          </div>
                        )}
                        <div ref={messagesEndRef} />
                      </div>

                      {/* QUICK CONTEXT SUGGESTIONS DRAWER */}
                      <div className="pb-3.5 overflow-x-auto flex gap-1.5 scrollbar-none shrink-0 font-mono text-[9px]">
                        {[
                          "Posso treinar hoje?",
                          "Esqueci como faz o agachamento",
                          "Estou com dor articular no joelho",
                          "Estou com fadiga de pernas",
                          "Qual descanso fazer?"
                        ].map((item, idx) => (
                          <button
                            key={idx}
                            onClick={() => triggerQuickQuestion(item)}
                            className={`px-2.5 py-1.5 bg-black/10 hover:bg-[#c3f400]/5 border ${borderSuttleClass} hover:border-[#c3f400]/40 ${textMutedClass} hover:text-[#c3f400] rounded-full whitespace-nowrap cursor-pointer transition-colors`}
                          >
                            {item}
                          </button>
                        ))}
                      </div>

                      {/* INPUT CONTROLLER FORM */}
                      <form 
                        id="chat-form"
                        onSubmit={handleSendChatMessage}
                        className="flex gap-2 shrink-0"
                      >
                        <input
                          type="text"
                          value={inputMessage}
                          onChange={(e) => setInputMessage(e.target.value)}
                          placeholder="Diga: 'Como executo supino?' ou 'Estou fadigado'..."
                          className={`flex-1 bg-black/10 border ${borderSuttleClass} focus:border-[#c3f400] rounded-xl px-3.5 py-2.5 text-xs ${textTitleClass} outline-none`}
                        />
                        <button
                          type="submit"
                          disabled={!inputMessage.trim() || isAiLoading}
                          className="w-11 h-11 rounded-xl bg-[#c3f400] text-[#121414] hover:shadow-[0_0_15px_rgba(195,244,0,0.3)] flex items-center justify-center shrink-0 active:scale-95 disabled:opacity-50 disabled:pointer-events-none transition-all cursor-pointer"
                        >
                          <Send className="w-4 h-4 fill-[#121414]" />
                        </button>
                      </form>
                    </>
                  ) : (
                    <>
                      {/* MESSAGES VIEWPORT CONTAINER (PROFESSOR CHAT) */}
                      <div className="flex-1 overflow-y-auto space-y-3.5 my-3.5 pr-1 scrollbar-none">
                        {(!professorHistories[simulatedStudentId] || professorHistories[simulatedStudentId].length === 0) ? (
                          <div className="flex flex-col items-center justify-center h-full text-center p-6 space-y-3">
                            <MessageSquare className={`w-8 h-8 ${textMutedClass} animate-pulse`} />
                            <p className={`text-xs ${textBodyClass} max-w-[200px]`}>
                              Nenhuma mensagem anterior com o Professor Rodrigo. Envie uma mensagem abaixo para iniciar a conversa!
                            </p>
                          </div>
                        ) : (
                          professorHistories[simulatedStudentId].map((msg, idx) => (
                            <div 
                              key={idx} 
                              className={`flex ${msg.sender === "student" ? "justify-end" : "justify-start"}`}
                            >
                              <div className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed ${
                                msg.sender === "student" 
                                  ? "bg-[#c3f400] text-[#121414] font-semibold rounded-br-2xs" 
                                  : `${bgSubtleClass} ${textTitleClass} border ${borderSuttleClass} rounded-bl-2xs`
                              }`}>
                                <p className="whitespace-pre-line font-sans font-medium">{msg.text}</p>
                                
                                {/* Attachment renderer inside Aluno view! */}
                                {msg.attachment && (
                                  <div className={`mt-3 p-2.5 rounded-xl ${bgBaseClass} border ${borderSuttleClass} flex items-center gap-3 ${textTitleClass}`}>
                                    <div className={`w-8 h-8 rounded ${cardBgClass} flex items-center justify-center border ${borderSuttleClass} shrink-0`}>
                                      {msg.attachment.type === "video" && <Play className="w-4 h-4 text-[#c3f400]" />}
                                      {msg.attachment.type === "audio" && <Music className="w-4 h-4 text-emerald-400" />}
                                      {msg.attachment.type === "pdf" && <FileText className="w-4 h-4 text-red-400" />}
                                      {msg.attachment.type === "photo" && <ImageIcon className="w-4 h-4 text-purple-400" />}
                                    </div>
                                    <div className="min-w-0 flex-1 font-mono text-[9px]">
                                      <p className={`font-bold ${textTitleClass} truncate`}>{msg.attachment.name}</p>
                                      <p className={`${textMutedClass}`}>
                                        {msg.attachment.size} {msg.attachment.duration && `| Duração: ${msg.attachment.duration}`}
                                      </p>
                                    </div>
                                    <button
                                      type="button"
                                      className={`bg-black/20 hover:bg-black/30 border ${borderSuttleClass} ${textTitleClass} text-[8px] px-2 py-1 rounded font-bold shrink-0`}
                                      onClick={() => triggerSimNotification(`Baixando ${msg.attachment?.name}...`)}
                                    >
                                      ABRIR
                                    </button>
                                  </div>
                                )}

                                <span className={`block text-[8px] font-mono text-right mt-1.5 ${
                                  msg.sender === "student" ? "text-[#121414]/70" : textMutedClass
                                }`}>
                                  {msg.timestamp}
                                </span>
                              </div>
                            </div>
                          ))
                        )}
                        <div ref={messagesEndRef} />
                      </div>

                      {/* QUICK CONTEXT SUGGESTIONS DRAWER FOR TRAINER */}
                      <div className="pb-3.5 overflow-x-auto flex gap-1.5 scrollbar-none shrink-0 font-mono text-[9px]">
                        {[
                          "Professor, ajusta minha carga?",
                          "Fiquei com dor no joelho ontem",
                          "Terminei o treino de hoje!",
                          "Dúvida sobre a dieta de hoje",
                          "Não vou conseguir treinar amanhã"
                        ].map((item, idx) => (
                          <button
                            key={idx}
                            onClick={() => setProfInputMessage(item)}
                            className={`px-2.5 py-1.5 bg-black/10 hover:bg-[#c3f400]/5 border ${borderSuttleClass} hover:border-[#c3f400]/40 ${textMutedClass} hover:text-[#c3f400] rounded-full whitespace-nowrap cursor-pointer transition-colors`}
                          >
                            {item}
                          </button>
                        ))}
                      </div>

                      {/* INPUT CONTROLLER FORM */}
                      <form 
                        id="chat-form-prof"
                        onSubmit={handleSendProfMessage}
                        className="flex gap-2 shrink-0"
                      >
                        <input
                          type="text"
                          value={profInputMessage}
                          onChange={(e) => setProfInputMessage(e.target.value)}
                          placeholder="Digite sua mensagem para o Professor Rodrigo..."
                          className={`flex-1 bg-black/10 border ${borderSuttleClass} focus:border-[#c3f400] rounded-xl px-3.5 py-2.5 text-xs ${textTitleClass} outline-none`}
                          autoFocus
                        />
                        <button
                          type="submit"
                          disabled={!profInputMessage.trim()}
                          className="w-11 h-11 rounded-xl bg-[#c3f400] text-[#121414] hover:shadow-[0_0_15px_rgba(195,244,0,0.3)] flex items-center justify-center shrink-0 active:scale-95 disabled:opacity-50 disabled:pointer-events-none transition-all cursor-pointer"
                        >
                          <Send className="w-4 h-4 fill-[#121414]" />
                        </button>
                      </form>
                    </>
                  )}

                </div>
              )}

              {/* TAB 5: PERFIL / DETALHADO E COMPLETO */}
              {activeSubTab === "perfil" && (
                <div className="space-y-5 pb-16 pt-2">
                  
                  {/* MAIN PROFILE CARD */}
                  <div className={`bg-gradient-to-b from-black/5 to-black/20 border ${borderSuttleClass} rounded-2xl p-5 text-center space-y-4 relative overflow-hidden shadow-xl`}>
                    {/* Glowing background highlights */}
                    <div className="absolute -top-12 -left-12 w-24 h-24 bg-[#c3f400]/5 rounded-full blur-2xl"></div>
                    <div className="absolute -top-12 -right-12 w-24 h-24 bg-[#c3f400]/5 rounded-full blur-2xl"></div>

                    {/* TOP HERO DETAILS */}
                    <div className="relative">
                      {/* Avatar with photo upload */}
                      <div className="relative w-20 h-20 mx-auto group">
                        <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-[#c3f400]/30 via-[#c3f400]/20 to-transparent border-2 border-[#c3f400]/50 flex items-center justify-center overflow-hidden font-mono text-2xl font-extrabold text-[#c3f400] shadow-[0_0_20px_rgba(195,244,0,0.15)] relative">
                          {activeStudent.photoUrl ? (
                            <img 
                              src={activeStudent.photoUrl} 
                              alt={activeStudent.name} 
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-cover" 
                            />
                          ) : (
                            activeStudent.initials
                          )}
                          
                          {/* Hover Overlay */}
                          <label 
                            htmlFor="student-photo-upload" 
                            className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                          >
                            <Camera className="w-5 h-5 text-[#c3f400]" />
                          </label>
                        </div>
                        
                        {/* Interactive edit button/badge */}
                        <label 
                          htmlFor="student-photo-upload" 
                          className="absolute -bottom-1 -right-1 bg-[#c3f400] text-[#121414] w-6 h-6 rounded-full border-2 border-[#121414] flex items-center justify-center cursor-pointer shadow-md hover:scale-110 active:scale-95 transition-all duration-200"
                          title="Alterar foto de perfil"
                        >
                          <Camera className="w-3.5 h-3.5" />
                        </label>
                        
                        <input 
                          type="file" 
                          id="student-photo-upload" 
                          accept="image/*" 
                          className="hidden" 
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onload = (event) => {
                                const base64 = event.target?.result as string;
                                onUpdateStudent({
                                  ...activeStudent,
                                  photoUrl: base64
                                });
                                triggerSimNotification("Sua foto de perfil foi atualizada e sincronizada com o Professor! 📸");
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                        />
                      </div>

                      {/* Name & Main Info */}
                      <div className="mt-3">
                        <h3 className={`text-base font-extrabold ${textTitleClass} flex items-center justify-center gap-1.5 font-display uppercase`}>
                          {activeStudent.name}
                          <span className="text-[10px] font-mono font-bold bg-[#c3f400]/10 text-[#c3f400] border border-[#c3f400]/30 px-2 py-0.5 rounded-full uppercase">
                            {activeStudent.objective || "Hipertrofia"}
                          </span>
                        </h3>
                        <p className="text-[10px] font-mono text-[#c3f400]/80 font-semibold mt-1">
                          Plano {activeStudent.plan || "Premium"} • Coach Rodrigo
                        </p>
                      </div>
                    </div>

                    {/* CORE STATS GRID */}
                    <div className={`grid grid-cols-2 gap-2 pt-3 border-t ${borderSuttleClass}`}>
                      <div className={`bg-black/10 rounded-xl p-2.5 border ${borderSuttleClass} text-center`}>
                        <span className={`text-[8px] font-mono ${textMutedClass} uppercase tracking-wider block`}>Aluno desde</span>
                        <span className={`text-[11px] font-mono ${textTitleClass} font-bold block mt-0.5`}>{activeStudent.joinedDate || "15/02/2026"}</span>
                      </div>
                      <div className={`bg-black/10 rounded-xl p-2.5 border ${borderSuttleClass} text-center flex items-center justify-center gap-1.5`}>
                        <Flame className="w-4 h-4 text-orange-400 shrink-0" />
                        <div className="text-left">
                          <span className={`text-[8px] font-mono ${textMutedClass} uppercase tracking-wider block`}>Streak Geral</span>
                          <span className="text-[11px] font-mono text-orange-400 font-bold block">87 dias seguidos</span>
                        </div>
                      </div>
                    </div>

                    {/* PREMIUM LEVEL BOX (XP GAMIFICATION) */}
                    <div className={`${bgSubtleClass} border ${borderSuttleClass} rounded-xl p-3.5 space-y-2 text-left relative overflow-hidden`}>
                      <div className="absolute right-2 top-2 bg-[#c3f400]/10 border border-[#c3f400]/30 rounded-lg px-2 py-0.5">
                        <span className="text-[8px] font-mono text-[#c3f400] font-extrabold">PRÓXIMO: {activeStudentGamification.nextRank}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="p-1 rounded-lg bg-orange-500/10 border border-orange-500/30">
                          <Flame className="w-5 h-5 text-orange-400" />
                        </div>
                        <div>
                          <span className={`text-xs font-extrabold ${textTitleClass}`}>Nível {activeStudentGamification.level}</span>
                          <p className={`text-[9px] ${textMutedClass} font-mono`}>
                            {activeStudentGamification.xp.toLocaleString("pt-BR")} / {activeStudentGamification.pointsNeeded.toLocaleString("pt-BR")} XP acumulados
                          </p>
                        </div>
                      </div>
                      
                      {/* XP Progress bar */}
                      <div className={`w-full bg-black/10 rounded-full h-2 overflow-hidden border ${borderSuttleClass}`}>
                        <div 
                          className="bg-gradient-to-r from-[#c3f400] to-[#c3f400] h-full rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(195,244,0,0.3)]"
                          style={{ width: `${Math.min(100, (activeStudentGamification.xp / activeStudentGamification.pointsNeeded) * 100)}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* RECOVERY STATUS BADGE */}
                    <div className={`flex justify-between items-center bg-black/5 border ${borderSuttleClass} rounded-xl p-2.5`}>
                      <span className={`text-[10px] font-mono ${textBodyClass}`}>Estado de Recuperação:</span>
                      <div className="flex items-center gap-1.5">
                        <span className="flex h-2 w-2 relative">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                        <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase tracking-wider">
                          🟢 Recuperado (Esmagar hoje!)
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* MEU RESUMO SECTION */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-1.5 px-1">
                      <Activity className="w-4 h-4 text-[#c3f400]" />
                      <h4 className={`text-xs font-extrabold ${textTitleClass} uppercase tracking-wider font-display`}>📊 Meu Resumo</h4>
                    </div>
                    <div className="grid grid-cols-2 gap-2 font-mono text-[10px]">
                      
                      {/* CARDS RÁPIDOS */}
                      <div className={`${cardBgClass} border ${borderSuttleClass} rounded-xl p-3 flex flex-col justify-between shadow-sm`}>
                        <span className={`${textMutedClass} text-[8px] uppercase`}>Peso Atual</span>
                        <div className="mt-1 flex items-baseline gap-1">
                          <span className={`${textTitleClass} font-extrabold text-sm`}>{activeStudent.weight || 84}</span>
                          <span className={`${textBodyClass} text-[9px]`}>kg</span>
                        </div>
                      </div>

                      <div className={`${cardBgClass} border ${borderSuttleClass} rounded-xl p-3 flex flex-col justify-between shadow-sm`}>
                        <span className={`${textMutedClass} text-[8px] uppercase`}>Gordura Corporal</span>
                        <div className="mt-1 flex items-baseline gap-1">
                          <span className="text-rose-400 font-extrabold text-sm">14.5</span>
                          <span className={`${textBodyClass} text-[9px]`}>%</span>
                        </div>
                      </div>

                      <div className={`${cardBgClass} border ${borderSuttleClass} rounded-xl p-3 flex flex-col justify-between shadow-sm`}>
                        <span className={`${textMutedClass} text-[8px] uppercase`}>Massa Muscular</span>
                        <div className="mt-1 flex items-baseline gap-1">
                          <span className="text-emerald-400 font-extrabold text-sm">66.1</span>
                          <span className={`${textBodyClass} text-[9px]`}>kg</span>
                        </div>
                      </div>

                      <div className={`${cardBgClass} border ${borderSuttleClass} rounded-xl p-3 flex flex-col justify-between shadow-sm`}>
                        <span className={`${textMutedClass} text-[8px] uppercase`}>Frequência do Mês</span>
                        <div className="mt-1 flex items-baseline gap-1">
                          <span className="text-[#c3f400] font-extrabold text-sm">95</span>
                          <span className={`${textBodyClass} text-[9px]`}>%</span>
                        </div>
                      </div>

                      <div className={`${cardBgClass} border ${borderSuttleClass} rounded-xl p-3 flex flex-col justify-between shadow-sm`}>
                        <span className={`${textMutedClass} text-[8px] uppercase`}>Treinos Concluídos</span>
                        <div className="mt-1 flex items-baseline gap-1">
                          <span className="text-[#c3f400] font-extrabold text-sm">42</span>
                          <span className={`${textBodyClass} text-[9px]`}>sessoes</span>
                        </div>
                      </div>

                      <div className={`${cardBgClass} border ${borderSuttleClass} rounded-xl p-3 flex flex-col justify-between shadow-sm`}>
                        <span className={`${textMutedClass} text-[8px] uppercase`}>Recordes Pessoais</span>
                        <div className="mt-1 flex items-baseline gap-1">
                          <span className="text-amber-400 font-extrabold text-sm">12</span>
                          <span className={`${textBodyClass} text-[9px]`}>PRs</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* DETAILED INTERACTIVE ACCORDIONS */}
                  <div className="space-y-2">
                    
                    {/* ACCORDION 1: MEU OBJETIVO */}
                    <div className={`${cardBgClass} border ${borderSuttleClass} rounded-xl overflow-hidden transition-all shadow-sm`}>
                      <button 
                        onClick={() => toggleSection("objetivo")}
                        className={`w-full px-4 py-3.5 flex justify-between items-center text-left text-xs font-bold ${textTitleClass} hover:bg-black/5 transition-colors cursor-pointer`}
                      >
                        <span className="flex items-center gap-2">
                          <Trophy className="w-4 h-4 text-amber-400" />
                          Objetivo Principal
                        </span>
                        <ChevronRight className={`w-4 h-4 ${textMutedClass} transition-transform ${expandedProfileSection === "objetivo" ? "rotate-90 text-[#c3f400]" : ""}`} />
                      </button>
                      
                      {expandedProfileSection === "objetivo" && (
                        <div className={`px-4 pb-4 pt-1 border-t ${borderSuttleClass} bg-black/5 font-mono text-[10px] ${textBodyClass} space-y-2`}>
                          <div className={`flex justify-between py-1 border-b ${borderSuttleClass}`}>
                            <span>Objetivo Principal</span>
                            <span className={`${textTitleClass} font-bold`}>{activeStudent.objective || "Hipertrofia"}</span>
                          </div>
                          <div className={`flex justify-between py-1 border-b ${borderSuttleClass}`}>
                            <span>Objetivo Secundário</span>
                            <span className={`${textTitleClass} font-bold`}>Definição Muscular & Performance</span>
                          </div>
                          <div className={`flex justify-between py-1 border-b ${borderSuttleClass}`}>
                            <span>Meta de Peso</span>
                            <span className="text-[#c3f400] font-bold">82.0 kg</span>
                          </div>
                          <div className={`flex justify-between py-1 border-b ${borderSuttleClass}`}>
                            <span>Meta de Gordura Corporal</span>
                            <span className="text-rose-400 font-bold">11.0%</span>
                          </div>
                          <div className="flex justify-between py-1">
                            <span>Meta de Massa Muscular</span>
                            <span className="text-emerald-400 font-bold">68.0 kg</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* ACCORDION 2: DADOS PESSOAIS */}
                    <div className={`${cardBgClass} border ${borderSuttleClass} rounded-xl overflow-hidden transition-all shadow-sm`}>
                      <button 
                        onClick={() => toggleSection("dados")}
                        className={`w-full px-4 py-3.5 flex justify-between items-center text-left text-xs font-bold ${textTitleClass} hover:bg-black/5 transition-colors cursor-pointer`}
                      >
                        <span className="flex items-center gap-2">
                          <User className="w-4 h-4 text-[#c3f400]" />
                          Dados Pessoais
                        </span>
                        <ChevronRight className={`w-4 h-4 ${textMutedClass} transition-transform ${expandedProfileSection === "dados" ? "rotate-90 text-[#c3f400]" : ""}`} />
                      </button>
                      
                      {expandedProfileSection === "dados" && (
                        <div className={`px-4 pb-4 pt-1 border-t ${borderSuttleClass} bg-black/5 font-mono text-[10px] ${textBodyClass} space-y-2`}>
                          <div className={`flex justify-between py-1 border-b ${borderSuttleClass}`}>
                            <span>Nome</span>
                            <span className={`${textTitleClass} font-bold`}>{activeStudent.name}</span>
                          </div>
                          <div className={`flex justify-between py-1 border-b ${borderSuttleClass}`}>
                            <span>Sexo</span>
                            <span className={`${textTitleClass} font-bold`}>Masculino</span>
                          </div>
                          <div className={`flex justify-between py-1 border-b ${borderSuttleClass}`}>
                            <span>Data de Nascimento</span>
                            <span className={`${textTitleClass} font-bold`}>14/05/1998</span>
                          </div>
                          <div className={`flex justify-between py-1 border-b ${borderSuttleClass}`}>
                            <span>Idade</span>
                            <span className={`${textTitleClass} font-bold`}>{activeStudent.age || 28} anos</span>
                          </div>
                          <div className={`flex justify-between py-1 border-b ${borderSuttleClass}`}>
                            <span>Altura</span>
                            <span className={`${textTitleClass} font-bold`}>{activeStudent.height || 184} cm</span>
                          </div>
                          <div className={`flex justify-between py-1 border-b ${borderSuttleClass}`}>
                            <span>Peso de Cadastro</span>
                            <span className={`${textTitleClass} font-bold`}>{activeStudent.weight || 84} kg</span>
                          </div>
                          <div className={`flex justify-between py-1 border-b ${borderSuttleClass}`}>
                            <span>E-mail</span>
                            <span className={`${textTitleClass} font-bold text-[9px]`}>{activeStudent.email}</span>
                          </div>
                          <div className="flex justify-between py-1">
                            <span>Telefone</span>
                            <span className={`${textTitleClass} font-bold`}>{activeStudent.phone}</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* ACCORDION 3: SAÚDE (ANAMNESE - LEITURA) */}
                    <div className={`${cardBgClass} border ${borderSuttleClass} rounded-xl overflow-hidden transition-all shadow-sm`}>
                      <button 
                        onClick={() => toggleSection("saude")}
                        className={`w-full px-4 py-3.5 flex justify-between items-center text-left text-xs font-bold ${textTitleClass} hover:bg-black/5 transition-colors cursor-pointer`}
                      >
                        <span className="flex items-center gap-2">
                          <Heart className="w-4 h-4 text-rose-500" />
                          Perfil de Saúde
                        </span>
                        <ChevronRight className={`w-4 h-4 ${textMutedClass} transition-transform ${expandedProfileSection === "saude" ? "rotate-90 text-[#c3f400]" : ""}`} />
                      </button>
                      
                      {expandedProfileSection === "saude" && (
                        <div className={`px-4 pb-4 pt-2 border-t ${borderSuttleClass} bg-black/5 font-mono text-[10px] ${textBodyClass} space-y-3`}>
                          <p className="text-[8px] bg-amber-500/10 text-amber-400 border border-amber-500/30 px-2 py-1 rounded-lg">
                            ⚠️ Os dados de anamnese são somente leitura para o aluno. Modificações só podem ser feitas pelo professor Rodrigo.
                          </p>

                          <div className="space-y-2">
                            <div>
                              <span className="font-extrabold block text-[9px] uppercase tracking-wider text-rose-400 font-display">Restrições</span>
                              <p className={`text-[10px] ${textTitleClass} mt-0.5`}>• Lombalgia Crônica</p>
                              <p className={`text-[10px] ${textTitleClass} mt-0.5`}>• Condromalácia Patelar Grau 1</p>
                            </div>
                            <div className={`border-t ${borderSuttleClass} pt-1.5`}>
                              <span className="font-extrabold block text-[9px] uppercase tracking-wider text-amber-400 font-display">Lesões</span>
                              <p className={`text-[10px] ${textTitleClass} mt-0.5`}>• Histórico de tendinite no ombro direito (recuperado)</p>
                            </div>
                            <div className={`border-t ${borderSuttleClass} pt-1.5`}>
                              <span className="font-extrabold block text-[9px] uppercase tracking-wider text-emerald-400 font-display">Doenças</span>
                              <p className={`text-[10px] ${textTitleClass} mt-0.5`}>• Hipertensão leve sob controle</p>
                            </div>
                            <div className={`border-t ${borderSuttleClass} pt-1.5`}>
                              <span className="font-extrabold block text-[9px] uppercase tracking-wider text-purple-400 font-display">Medicamentos</span>
                              <p className={`text-[10px] ${textTitleClass} mt-0.5`}>• Losartana (50mg / dia)</p>
                            </div>
                            <div className={`border-t ${borderSuttleClass} pt-1.5`}>
                              <span className={`font-extrabold block text-[9px] uppercase tracking-wider ${textMutedClass} font-display`}>Observações de Treino</span>
                              <p className={`text-[10px] ${textBodyClass} mt-0.5`}>Evitar impactos excessivos nos joelhos e focar em fortalecimento concêntrico controlado nos treinos de inferiores.</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* ACCORDION 4: MINHAS AVALIAÇÕES */}
                    <div className={`${cardBgClass} border ${borderSuttleClass} rounded-xl overflow-hidden transition-all shadow-sm`}>
                      <button 
                        onClick={() => toggleSection("avaliacoes")}
                        className={`w-full px-4 py-3.5 flex justify-between items-center text-left text-xs font-bold ${textTitleClass} hover:bg-black/5 transition-colors cursor-pointer`}
                      >
                        <span className="flex items-center gap-2">
                          <TrendingUp className="w-4 h-4 text-[#c3f400]" />
                          Avaliações Físicas
                        </span>
                        <ChevronRight className={`w-4 h-4 ${textMutedClass} transition-transform ${expandedProfileSection === "avaliacoes" ? "rotate-90 text-[#c3f400]" : ""}`} />
                      </button>
                      
                      {expandedProfileSection === "avaliacoes" && (
                        <div className={`px-3 pb-4 pt-2 border-t ${borderSuttleClass} bg-black/5 font-mono text-[10px] space-y-3`}>
                          
                          <div className="space-y-1.5">
                            {/* Eval 1 */}
                            <div 
                              onClick={() => setSelectedEvaluation(selectedEvaluation === "latest" ? null : "latest")}
                              className={`${bgSubtleClass} border ${borderSuttleClass} hover:border-[#c3f400]/50 rounded-xl p-3 cursor-pointer transition-all space-y-2`}
                            >
                              <div className="flex justify-between items-center">
                                <span className={`${textTitleClass} font-extrabold`}>
                                  {latestPhysicalEval ? `Avaliação Recente - ${latestPhysicalEval.date}` : "Avaliação Recente - 15/06/2026"}
                                </span>
                                <span className="text-[#c3f400] text-[9px]">Toque para ver</span>
                              </div>
                              <p className={`${textMutedClass} text-[9px]`}>Análise física e circunferências corporais realizadas.</p>
                              
                              {selectedEvaluation === "latest" && (
                                <div className={`pt-2.5 border-t ${borderSuttleClass} ${textBodyClass} space-y-2.5 text-[9px]`}>
                                  <div className={`grid grid-cols-2 gap-2 text-center ${textTitleClass}`}>
                                    <div className={`${bgBaseClass} p-2 border ${borderSuttleClass} rounded-lg`}>
                                      <p className={`text-[8px] ${textMutedClass} font-mono uppercase`}>Peso</p>
                                      <p className="text-xs font-bold mt-0.5">
                                        {latestPhysicalEval ? `${latestPhysicalEval.resultados?.peso?.toFixed(1) || activeStudent.weight || "84.0"} kg` : "84.0 kg"}
                                      </p>
                                    </div>
                                    <div className={`${bgBaseClass} p-2 border ${borderSuttleClass} rounded-lg`}>
                                      <p className={`text-[8px] ${textMutedClass} font-mono uppercase`}>IMC</p>
                                      <p className="text-xs font-bold mt-0.5">
                                        {latestPhysicalEval ? latestPhysicalEval.resultados?.imc?.toFixed(1) || "24.8" : "24.8"}
                                      </p>
                                    </div>
                                    <div className={`${bgBaseClass} p-2 border ${borderSuttleClass} rounded-lg`}>
                                      <p className={`text-[8px] ${textMutedClass} font-mono uppercase`}>Gordura Corporal</p>
                                      <p className="text-xs font-bold text-rose-400 mt-0.5">
                                        {latestPhysicalEval ? `${latestPhysicalEval.resultados?.percentualGordura?.toFixed(1) || "14.5"}%` : "14.5%"}
                                      </p>
                                    </div>
                                    <div className={`${bgBaseClass} p-2 border ${borderSuttleClass} rounded-lg`}>
                                      <p className={`text-[8px] ${textMutedClass} font-mono uppercase`}>Massa Magra</p>
                                      <p className="text-xs font-bold text-emerald-400 mt-0.5">
                                        {latestPhysicalEval ? `${latestPhysicalEval.resultados?.massaMagra?.toFixed(1) || "67.2"} kg` : "67.2 kg"}
                                      </p>
                                    </div>
                                  </div>
 
                                  <div className={`${bgBaseClass} p-2 rounded-lg border ${borderSuttleClass} space-y-1`}>
                                    <p className="font-bold text-[8px] uppercase mb-1.5 text-[#c3f400] font-display">Circunferências (cm)</p>
                                    <div className={`grid grid-cols-2 gap-1 text-[9px] ${textBodyClass}`}>
                                      <div>• Peitoral: <b className={textTitleClass}>{latestPhysicalEval?.perimetros?.torax || "104.0"}</b></div>
                                      <div>• Cintura: <b className={textTitleClass}>{latestPhysicalEval?.perimetros?.cintura || "82.0"}</b></div>
                                      <div>• Quadril: <b className={textTitleClass}>{latestPhysicalEval?.perimetros?.quadril || "98.0"}</b></div>
                                      <div>• Braço Dir: <b className={textTitleClass}>{latestPhysicalEval?.perimetros?.bracoD || "38.5"}</b></div>
                                      <div>• Braço Esq: <b className={textTitleClass}>{latestPhysicalEval?.perimetros?.bracoE || "38.2"}</b></div>
                                      <div>• Coxa Dir: <b className={textTitleClass}>{latestPhysicalEval?.perimetros?.coxaD || "61.0"}</b></div>
                                      <div>• Coxa Esq: <b className={textTitleClass}>{latestPhysicalEval?.perimetros?.coxaE || "60.5"}</b></div>
                                    </div>
                                  </div>
 
                                  <div className={`${bgBaseClass} p-2 rounded-lg border ${borderSuttleClass} space-y-1`}>
                                    <p className="font-bold text-[8px] uppercase mb-1.5 text-[#c3f400] font-display">Fotos Comparativas</p>
                                    <div className="grid grid-cols-3 gap-1">
                                      <div className={`${cardBgClass} border ${borderSuttleClass} rounded flex items-center justify-center text-[8px] ${textMutedClass} font-bold aspect-[3/4] overflow-hidden relative`}>
                                        {latestPhysicalEval?.fotoFrente ? (
                                          <img src={latestPhysicalEval.fotoFrente} alt="Frente" className="absolute inset-0 w-full h-full object-cover" />
                                        ) : (
                                          "Frontal"
                                        )}
                                      </div>
                                      <div className={`${cardBgClass} border ${borderSuttleClass} rounded flex items-center justify-center text-[8px] ${textMutedClass} font-bold aspect-[3/4] overflow-hidden relative`}>
                                        {latestPhysicalEval?.fotoLado ? (
                                          <img src={latestPhysicalEval.fotoLado} alt="Lateral" className="absolute inset-0 w-full h-full object-cover" />
                                        ) : (
                                          "Lateral"
                                        )}
                                      </div>
                                      <div className={`${cardBgClass} border ${borderSuttleClass} rounded flex items-center justify-center text-[8px] ${textMutedClass} font-bold aspect-[3/4] overflow-hidden relative`}>
                                        {latestPhysicalEval?.fotoCostas ? (
                                          <img src={latestPhysicalEval.fotoCostas} alt="Posterior" className="absolute inset-0 w-full h-full object-cover" />
                                        ) : (
                                          "Posterior"
                                        )}
                                      </div>
                                    </div>
                                  </div>
 
                                  <button 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      triggerSimNotification("Iniciando download do laudo de avaliação em PDF... 📥");
                                    }}
                                    className="w-full py-2 bg-[#c3f400] hover:bg-[#00d0db] text-black font-extrabold rounded-lg text-center transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm active:scale-95"
                                  >
                                    <Download className="w-3.5 h-3.5 text-black" />
                                    BAIXAR LAUDO COMPLETO (PDF)
                                  </button>
                                </div>
                              )}
                            </div>

                            {/* Eval 2 */}
                            <div className={`${bgSubtleClass} border ${borderSuttleClass} opacity-60 rounded-xl p-3 text-gray-500`}>
                              <div className="flex justify-between items-center">
                                <span className="font-extrabold text-[9px]">Avaliação Anterior - 15/04/2026</span>
                                <span className="text-[8px] uppercase font-bold text-gray-500">Histórico</span>
                              </div>
                              <p className="text-[8.5px] mt-0.5">Peso: 81.5 kg • Gordura: 15.2% • Massa Magra: 65.0 kg</p>
                            </div>

                          </div>
                        </div>
                      )}
                    </div>

                    {/* ACCORDION 5: MINHA POSTURA */}
                    <div className={`${cardBgClass} border ${borderSuttleClass} rounded-xl overflow-hidden transition-all shadow-sm`}>
                      <button 
                        onClick={() => toggleSection("postura")}
                        className={`w-full px-4 py-3.5 flex justify-between items-center text-left text-xs font-bold ${textTitleClass} hover:bg-black/5 transition-colors cursor-pointer`}
                      >
                        <span className="flex items-center gap-2">
                          <Activity className="w-4 h-4 text-[#c3f400]" />
                          Análise Postural
                        </span>
                        <ChevronRight className={`w-4 h-4 ${textMutedClass} transition-transform ${expandedProfileSection === "postura" ? "rotate-90 text-[#c3f400]" : ""}`} />
                      </button>
                      
                      {expandedProfileSection === "postura" && (
                        <div className={`px-4 pb-4 pt-2 border-t ${borderSuttleClass} bg-black/5 font-mono text-[10px] ${textBodyClass} space-y-3`}>
                          <div className={`${bgSubtleClass} border ${borderSuttleClass} rounded-xl p-3 space-y-2`}>
                            <div className={`flex justify-between border-b ${borderSuttleClass} pb-1`}>
                              <span>Última Avaliação Postural</span>
                              <span className={`${textTitleClass} font-bold`}>{latestPosturalEval ? latestPosturalEval.date : "15/06/2026"}</span>
                            </div>
                            <div className={`flex justify-between border-b ${borderSuttleClass} pb-1`}>
                              <span>Resultado Geral</span>
                              <span className="text-[#c3f400] font-bold">
                                {latestPosturalEval ? `Simetria: ${latestPosturalEval.kpis?.simetria || 85}%` : "Desvios Posturais Leves"}
                              </span>
                            </div>
                            <div className="space-y-1 pt-1">
                              <span className={`text-[8px] uppercase ${textMutedClass}`}>Desvios Posturais Identificados</span>
                              <p className={`${textTitleClass} text-[9px]`}>• Cervical: {latestPosturalEval ? latestPosturalEval.deviations?.cervical : "Escoliose lombar compensatória leve à direita"}</p>
                              <p className={`${textTitleClass} text-[9px]`}>• Ombros: {latestPosturalEval ? latestPosturalEval.deviations?.ombros : "Ligeira rotação anterior de quadril"}</p>
                              {latestPosturalEval?.deviations?.pelve && (
                                <p className={`${textTitleClass} text-[9px]`}>• Pelve: {latestPosturalEval.deviations.pelve}</p>
                              )}
                              {latestPosturalEval?.deviations?.joelhos && (
                                <p className={`${textTitleClass} text-[9px]`}>• Joelhos: {latestPosturalEval.deviations.joelhos}</p>
                              )}
                            </div>
                             <div className={`space-y-1.5 pt-1.5 border-t ${borderSuttleClass}`}>
                              <span className="text-[8px] uppercase text-[#c3f400] font-display">Recomendações Clínicas / Exercícios Corretivos</span>
                              <div className="space-y-1 mt-1">
                                {latestPosturalEval ? (
                                  Array.isArray(latestPosturalEval.suggestions) ? (
                                    latestPosturalEval.suggestions.map((ex: any, idx: number) => (
                                      <div key={idx} className="pl-2 border-l border-[#c3f400]/40 py-0.5">
                                        <p className="font-semibold text-white">• {ex.name} ({ex.sets}x{ex.reps})</p>
                                        <p className="text-[9px] text-gray-400 pl-2.5">{ex.description}</p>
                                        {ex.notes && <p className="text-[8px] text-amber-400/80 pl-2.5 italic">Obs: {ex.notes}</p>}
                                      </div>
                                    ))
                                  ) : typeof latestPosturalEval.suggestions === "string" ? (
                                    <p className="text-[9px] text-gray-300">{latestPosturalEval.suggestions}</p>
                                  ) : (
                                    <p className="text-[9px] text-gray-300">
                                      {Array.isArray(latestPosturalEval.observations)
                                        ? latestPosturalEval.observations.join(". ")
                                        : (latestPosturalEval.observations || "Focar em exercícios unilaterais de membros inferiores (afundo, leg press unilateral), fortalecimento intensivo de abdômen transverso e mobilidade diária de quadril.")}
                                    </p>
                                  )
                                ) : (
                                  <p className={`text-[9px] ${textBodyClass}`}>
                                    Focar em exercícios unilaterais de membros inferiores (afundo, leg press unilateral), fortalecimento intensivo de abdômen transverso e mobilidade diária de quadril.
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className={`space-y-2.5 ${bgBaseClass} p-3 rounded-lg border ${borderSuttleClass}`}>
                            <div className="flex justify-between items-center">
                              <span className="font-bold text-[8px] uppercase text-[#c3f400] font-display">Análise de Imagem (Anatômica)</span>
                              <span className="text-[7px] font-mono text-gray-400">Selecione a vista</span>
                            </div>

                            {latestPosturalEval ? (
                              <div className="space-y-2">
                                {/* Tab Buttons */}
                                <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-none">
                                  {[
                                    { id: "front", label: "Frente", photo: latestPosturalEval.photos?.front, markers: latestPosturalEval.markers?.front },
                                    { id: "back", label: "Costas", photo: latestPosturalEval.photos?.back, markers: latestPosturalEval.markers?.back },
                                    { id: "right", label: "Lateral D", photo: latestPosturalEval.photos?.right, markers: latestPosturalEval.markers?.right },
                                    { id: "left", label: "Lateral E", photo: latestPosturalEval.photos?.left, markers: latestPosturalEval.markers?.left },
                                  ].map(view => {
                                    const hasPhoto = !!view.photo;
                                    const isActive = studentActivePostureView === view.id;
                                    return (
                                      <button
                                        key={view.id}
                                        disabled={!hasPhoto}
                                        onClick={() => setStudentActivePostureView(view.id as any)}
                                        className={`px-2 py-1 text-[8px] rounded-lg font-bold uppercase transition-all duration-150 flex-1 min-w-[50px] cursor-pointer text-center ${
                                          !hasPhoto
                                            ? "opacity-20 cursor-not-allowed border border-transparent text-gray-600"
                                            : isActive
                                            ? "bg-[#c3f400] text-black shadow-sm"
                                            : "bg-[#252727] text-gray-400 border border-[#343535]/30 hover:text-white"
                                        }`}
                                      >
                                        {view.label}
                                      </button>
                                    );
                                  })}
                                </div>

                                {/* Selected View Container */}
                                {(() => {
                                  const currentViewData = [
                                    { id: "front", label: "Vista Frontal", photo: latestPosturalEval.photos?.front, markers: latestPosturalEval.markers?.front },
                                    { id: "back", label: "Vista Posterior", photo: latestPosturalEval.photos?.back, markers: latestPosturalEval.markers?.back },
                                    { id: "right", label: "Lateral Direira", photo: latestPosturalEval.photos?.right, markers: latestPosturalEval.markers?.right },
                                    { id: "left", label: "Lateral Esquerda", photo: latestPosturalEval.photos?.left, markers: latestPosturalEval.markers?.left },
                                  ].find(v => v.id === studentActivePostureView) || {
                                    id: "front",
                                    label: "Vista Frontal",
                                    photo: latestPosturalEval.photos?.front,
                                    markers: latestPosturalEval.markers?.front
                                  };

                                  const photoToShow = currentViewData.photo;
                                  const markersToShow = currentViewData.markers || [];

                                  return (
                                    <div className={`${cardBgClass} rounded-xl p-2 border ${borderSuttleClass}`}>
                                      <div className={`aspect-[3/4] max-w-[200px] mx-auto ${bgBaseClass} rounded-lg flex items-center justify-center font-bold ${textMutedClass} relative overflow-hidden`}>
                                        {photoToShow ? (
                                          <>
                                            <img 
                                              referrerPolicy="no-referrer"
                                              src={photoToShow} 
                                              alt={currentViewData.label} 
                                              className="absolute inset-0 w-full h-full object-fill" 
                                            />
                                            {markersToShow.map((m: any, idx: number) => (
                                              <div 
                                                key={m.id || `st-marker-${idx}`}
                                                className="absolute w-2 h-2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white shadow-md z-10 group"
                                                style={{ left: `${m.x}%`, top: `${m.y}%` }}
                                              >
                                                <div className={`w-full h-full rounded-full ${
                                                  m.type === 'error' ? 'bg-red-500 animate-pulse' : m.type === 'warning' ? 'bg-amber-500' : 'bg-[#c3f400]'
                                                }`} />
                                                <span className="absolute left-1/2 bottom-full mb-1 -translate-x-1/2 bg-black/95 text-white text-[7px] py-0.5 px-1.5 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none font-mono border border-gray-800 z-50">
                                                  {m.label}
                                                </span>
                                              </div>
                                            ))}
                                          </>
                                        ) : (
                                          <div className="text-center p-4">
                                            {/* Grid lines mockup */}
                                            <div className="absolute inset-y-0 left-1/2 w-0.5 bg-rose-500/10"></div>
                                            <div className="absolute inset-x-0 top-1/3 h-0.5 bg-emerald-500/10"></div>
                                            <div className="absolute inset-x-0 top-2/3 h-0.5 bg-emerald-500/10"></div>
                                            <p className="text-[10px] text-gray-500">Nenhuma foto salva para esta vista</p>
                                          </div>
                                        )}
                                      </div>
                                      <p className={`mt-1.5 text-center text-[10px] font-bold ${textTitleClass}`}>
                                        {currentViewData.label}
                                      </p>
                                    </div>
                                  );
                                })()}
                              </div>
                            ) : (
                              <p className={`text-[9px] text-center p-4 ${textMutedClass}`}>
                                Nenhuma avaliação postural registrada.
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* ACCORDION 6: CONQUISTAS */}
                    <div className={`${cardBgClass} border ${borderSuttleClass} rounded-xl overflow-hidden transition-all shadow-sm`}>
                      <button 
                        onClick={() => toggleSection("conquistas")}
                        className={`w-full px-4 py-3.5 flex justify-between items-center text-left text-xs font-bold ${textTitleClass} hover:bg-black/5 transition-colors cursor-pointer`}
                      >
                        <span className="flex items-center gap-2">
                          <Award className="w-4 h-4 text-amber-400" />
                          Conquistas
                        </span>
                        <ChevronRight className={`w-4 h-4 ${textMutedClass} transition-transform ${expandedProfileSection === "conquistas" ? "rotate-90 text-[#c3f400]" : ""}`} />
                      </button>
                      
                      {expandedProfileSection === "conquistas" && (
                        <div className={`px-3 pb-4 pt-2 border-t ${borderSuttleClass} bg-black/5 font-mono text-[9px] space-y-2`}>
                          <div className="grid grid-cols-2 gap-2">
                            
                            <div className={`${bgSubtleClass} p-2 rounded-xl border ${borderSuttleClass} flex items-start gap-2`}>
                              <Award className="w-6 h-6 text-amber-400 shrink-0 mt-0.5" />
                              <div>
                                <p className={`${textTitleClass} font-bold`}>Primeiro Treino</p>
                                <p className={`${textMutedClass} text-[8px] mt-0.5`}>Dado ao concluir o treino de abertura.</p>
                              </div>
                            </div>

                            <div className={`${bgSubtleClass} p-2 rounded-xl border ${borderSuttleClass} flex items-start gap-2`}>
                              <Award className="w-6 h-6 text-emerald-400 shrink-0 mt-0.5" />
                              <div>
                                <p className={`${textTitleClass} font-bold`}>30 Dias</p>
                                <p className={`${textMutedClass} text-[8px] mt-0.5`}>30 dias completos na plataforma.</p>
                              </div>
                            </div>

                            <div className={`${bgSubtleClass} p-2 rounded-xl border ${borderSuttleClass} flex items-start gap-2`}>
                              <Award className="w-6 h-6 text-[#c3f400] shrink-0 mt-0.5" />
                              <div>
                                <p className={`${textTitleClass} font-bold`}>100 Treinos</p>
                                <p className={`${textMutedClass} text-[8px] mt-0.5`}>Incrível marca de persistência!</p>
                              </div>
                            </div>

                            <div className={`${bgSubtleClass} p-2 rounded-xl border ${borderSuttleClass} flex items-start gap-2`}>
                              <Award className="w-6 h-6 text-rose-400 shrink-0 mt-0.5 animate-pulse" />
                              <div>
                                <p className={`${textTitleClass} font-bold`}>1 Tonelada</p>
                                <p className={`${textMutedClass} text-[8px] mt-0.5`}>Volume total em uma sessão.</p>
                              </div>
                            </div>

                            <div className={`${bgSubtleClass} p-2 rounded-xl border ${borderSuttleClass} flex items-start gap-2`}>
                              <Award className="w-6 h-6 text-[#c3f400] shrink-0 mt-0.5" />
                              <div>
                                <p className={`${textTitleClass} font-bold`}>Freq Perfeita</p>
                                <p className={`${textMutedClass} text-[8px] mt-0.5`}>Frequência mensal perfeita batida.</p>
                              </div>
                            </div>

                            <div className={`${bgSubtleClass} p-2 rounded-xl border ${borderSuttleClass} flex items-start gap-2`}>
                              <Award className="w-6 h-6 text-purple-400 shrink-0 mt-0.5" />
                              <div>
                                <p className={`${textTitleClass} font-bold`}>Foco Total</p>
                                <p className={`${textMutedClass} text-[8px] mt-0.5`}>Completou 30 dias seguidos.</p>
                              </div>
                            </div>

                          </div>
                        </div>
                      )}
                    </div>

                    {/* ACCORDION 7: CERTIFICADOS */}
                    <div className={`${cardBgClass} border ${borderSuttleClass} rounded-xl overflow-hidden transition-all shadow-sm`}>
                      <button 
                        onClick={() => toggleSection("certificados")}
                        className={`w-full px-4 py-3.5 flex justify-between items-center text-left text-xs font-bold ${textTitleClass} hover:bg-black/5 transition-colors cursor-pointer`}
                      >
                        <span className="flex items-center gap-2">
                          <Award className="w-4 h-4 text-purple-400" />
                          Certificados
                        </span>
                        <ChevronRight className={`w-4 h-4 ${textMutedClass} transition-transform ${expandedProfileSection === "certificados" ? "rotate-90 text-[#c3f400]" : ""}`} />
                      </button>
                      
                      {expandedProfileSection === "certificados" && (
                        <div className={`px-3 pb-4 pt-2 border-t ${borderSuttleClass} bg-black/5 font-mono text-[9px] space-y-2 ${textBodyClass}`}>
                          
                          <div className="space-y-1.5">
                            {[
                              { label: "Certificado de 30 Dias", sub: "Disponível para Download", active: true },
                              { label: "Certificado de 60 Dias", sub: "Disponível para Download", active: true },
                              { label: "Certificado de 90 Dias", sub: "Disponível para Download", active: true },
                              { label: "Certificado de 180 Dias", sub: "Alcançar 180 dias de consistência", active: false },
                              { label: "Certificado de 365 Dias", sub: "Alcançar 1 ano de consistência", active: false },
                            ].map((cert, index) => (
                              <div key={index} className={`${bgSubtleClass} border ${borderSuttleClass} rounded-xl p-3 flex justify-between items-center shadow-xs`}>
                                <div>
                                  <p className={`font-bold ${cert.active ? textTitleClass : "text-gray-400 opacity-50"}`}>{cert.label}</p>
                                  <p className={`${textMutedClass} text-[8px] mt-0.5`}>{cert.sub}</p>
                                </div>
                                {cert.active ? (
                                  <button 
                                    onClick={() => triggerSimNotification(`Gerando PDF do ${cert.label}... 📥`)}
                                    className="bg-[#c3f400]/10 hover:bg-[#c3f400] hover:text-black border border-[#c3f400]/30 text-[#c3f400] font-bold py-1 px-3.5 rounded-lg transition-all text-[9px] flex items-center gap-1 cursor-pointer"
                                  >
                                    <Download className="w-3.5 h-3.5" />
                                    Baixar
                                  </button>
                                ) : (
                                  <span className="text-[8px] text-gray-500 font-bold uppercase tracking-wider flex items-center gap-1">
                                    <Lock className="w-2.5 h-2.5" /> Pendente
                                  </span>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* ACCORDION 8: MEU PLANO (COM ALERTAS DE FATURA SE INADIMPLENTE) */}
                    <div className={`${cardBgClass} border ${borderSuttleClass} rounded-xl overflow-hidden transition-all shadow-sm`}>
                      <button 
                        onClick={() => toggleSection("plano")}
                        className={`w-full px-4 py-3.5 flex justify-between items-center text-left text-xs font-bold ${textTitleClass} hover:bg-black/5 transition-colors cursor-pointer`}
                      >
                        <span className="flex items-center gap-2">
                          <CreditCard className="w-4 h-4 text-emerald-400" />
                          Plano de Assinatura
                        </span>
                        <ChevronRight className={`w-4 h-4 ${textMutedClass} transition-transform ${expandedProfileSection === "plano" ? "rotate-90 text-[#c3f400]" : ""}`} />
                      </button>
                      
                      {expandedProfileSection === "plano" && (
                        <div className={`px-4 pb-4 pt-2 border-t ${borderSuttleClass} bg-black/5 font-mono text-[10px] space-y-3`}>
                          
                          {/* Simulated Overdue Visual Warning */}
                          {(isSimulatedOverdue || activeStudent.status === "pending_renewal") ? (
                            <div className="bg-rose-500/10 border-2 border-rose-500/30 rounded-xl p-3.5 space-y-3">
                              <div className="flex items-start gap-2">
                                <AlertTriangle className="w-6 h-6 text-rose-500 shrink-0 mt-0.5 animate-bounce" />
                                <div>
                                  <span className="text-white font-extrabold text-[11px] uppercase tracking-wider block">⚠️ Pendência de Mensalidade</span>
                                  <p className="text-gray-400 text-[9px] mt-0.5">Sua mensalidade está em aberto. Regularize para evitar bloqueio da planilha de treino.</p>
                                </div>
                              </div>

                              <div className={`bg-[#121414]/60 p-2.5 rounded-lg border ${borderSuttleClass} space-y-1 text-gray-400 text-[9.5px]`}>
                                <div className="flex justify-between">
                                  <span>Vencimento:</span>
                                  <span className="text-rose-400 font-bold">05/07</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Valor:</span>
                                  <span className={`font-bold ${textTitleClass}`}>R$ 129,00</span>
                                </div>
                              </div>

                              {/* Interactive Receipt Upload simulation */}
                              <div className="space-y-1.5">
                                {receiptSent ? (
                                  <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-2.5 text-center font-bold text-[9.5px] text-emerald-400 flex items-center justify-center gap-1.5">
                                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                                    Comprovante enviado com sucesso! O professor Rodrigo fará a validação.
                                  </div>
                                ) : (
                                  <div 
                                    onClick={() => {
                                      setUploadingReceipt(true);
                                      setTimeout(() => {
                                        setUploadingReceipt(false);
                                        setReceiptSent(true);
                                        triggerSimNotification("Comprovante enviado com sucesso ao professor Rodrigo! 🔥");
                                      }, 1800);
                                    }}
                                    className={`bg-[#1e2020]/80 border border-dashed ${borderSuttleClass} hover:border-[#c3f400] rounded-lg p-3 text-center cursor-pointer transition-all space-y-1 text-gray-400 hover:text-white`}
                                  >
                                    {uploadingReceipt ? (
                                      <div className="space-y-1.5">
                                        <div className="animate-spin w-4 h-4 border-2 border-[#c3f400] border-t-transparent rounded-full mx-auto"></div>
                                        <p className="text-[8px] font-mono text-[#c3f400]">Enviando arquivo...</p>
                                      </div>
                                    ) : (
                                      <>
                                        <p className="text-[9px] font-bold">📤 Enviar Comprovante</p>
                                        <p className="text-[8px] text-gray-500">Toque aqui para selecionar ou arrastar o comprovante Pix</p>
                                      </>
                                    )}
                                  </div>
                                )}

                                <button 
                                  onClick={() => {
                                    setActiveSubTab("chat");
                                    setChatMode("professor");
                                    triggerSimNotification("Redirecionado para o chat direto do Professor Rodrigo!");
                                  }}
                                  className="w-full py-2 bg-transparent hover:bg-white/5 border border-white/20 text-white font-bold rounded-lg text-center transition-all text-[9.5px] cursor-pointer"
                                >
                                  Falar com Professor
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-3 flex justify-between items-center">
                              <div className="space-y-0.5">
                                <span className="text-emerald-400 font-bold text-[10px] block">🟢 Status: Ativo / Regular</span>
                                <p className="text-[8px] text-gray-500">Nenhuma fatura em aberto.</p>
                              </div>
                              <span className="text-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full uppercase font-bold">OK</span>
                            </div>
                          )}

                          {/* GENERAL PLAN DATA */}
                          <div className={`${bgSubtleClass} border ${borderSuttleClass} rounded-xl p-3 text-gray-400 space-y-1.5`}>
                            <div className="flex justify-between">
                              <span>Plano Contratado</span>
                              <strong className={textTitleClass}>{activeStudent.plan || "Premium"}</strong>
                            </div>
                            <div className="flex justify-between">
                              <span>Valor Mensal</span>
                              <strong className={textTitleClass}>R$ 129,00</strong>
                            </div>
                            <div className="flex justify-between">
                              <span>Data de Início</span>
                              <strong className={textTitleClass}>{activeStudent.joinedDate || "15/02/2026"}</strong>
                            </div>
                            <div className="flex justify-between">
                              <span>Vencimento da Planilha</span>
                              <strong className="text-amber-400">{activeStudent.renewalDueDate || "15/07/2026"}</strong>
                            </div>
                            <div className={`flex justify-between pt-1 border-t ${borderSuttleClass}`}>
                              <span>Dias Restantes</span>
                              <span className="text-[#c3f400] font-bold">6 dias</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* ACCORDION 9: PREFERÊNCIAS */}
                    <div className={`${cardBgClass} border ${borderSuttleClass} rounded-xl overflow-hidden transition-all shadow-sm`}>
                      <button 
                        onClick={() => toggleSection("preferencias")}
                        className={`w-full px-4 py-3.5 flex justify-between items-center text-left text-xs font-bold ${textTitleClass} hover:bg-black/5 transition-colors cursor-pointer`}
                      >
                        <span className="flex items-center gap-2">
                          <Bell className="w-4 h-4 text-[#c3f400]" />
                          Preferências
                        </span>
                        <ChevronRight className={`w-4 h-4 ${textMutedClass} transition-transform ${expandedProfileSection === "preferencias" ? "rotate-90 text-[#c3f400]" : ""}`} />
                      </button>
                      
                      {expandedProfileSection === "preferencias" && (
                        <div className={`px-4 pb-4 pt-2 border-t ${borderSuttleClass} bg-black/5 font-mono text-[10px] space-y-3`}>
                          <p className={`text-[8px] ${textMutedClass} uppercase font-display`}>Receber Notificações push de:</p>
                          
                          <div className={`space-y-2 ${textTitleClass}`}>
                            {[
                              { key: "treino", label: "Treino (Ficha e atualizações)" },
                              { key: "chat", label: "Chat (Coach e Professor)" },
                              { key: "pagamentos", label: "Pagamentos (Vencimentos de faturas)" },
                              { key: "conquistas", label: "Conquistas (Desafios e troféus)" },
                              { key: "checkIn", label: "Check-in (Lembrete diário)" },
                            ].map((notif) => (
                              <label key={notif.key} className="flex items-center gap-2.5 cursor-pointer py-1 select-none">
                                <input 
                                  type="checkbox"
                                  checked={profileNotifications[notif.key as keyof typeof profileNotifications]}
                                  onChange={() => {
                                    setProfileNotifications(prev => ({
                                      ...prev,
                                      [notif.key]: !prev[notif.key as keyof typeof profileNotifications]
                                    }));
                                    triggerSimNotification(`Preferência de ${notif.key} atualizada!`);
                                  }}
                                  className={`w-4 h-4 rounded border-gray-400/40 text-[#c3f400] bg-black/10 focus:ring-0 cursor-pointer`}
                                />
                                <span className={`text-[10px] ${textBodyClass} font-bold`}>{notif.label}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* ACCORDION 10: APARÊNCIA */}
                    <div className={`${cardBgClass} border ${borderSuttleClass} rounded-xl overflow-hidden transition-all shadow-sm`}>
                      <button 
                        onClick={() => toggleSection("aparencia")}
                        className={`w-full px-4 py-3.5 flex justify-between items-center text-left text-xs font-bold ${textTitleClass} hover:bg-black/5 transition-colors cursor-pointer`}
                      >
                        <span className="flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-amber-300" />
                          Aparência & Tema
                        </span>
                        <ChevronRight className={`w-4 h-4 ${textMutedClass} transition-transform ${expandedProfileSection === "aparencia" ? "rotate-90 text-[#c3f400]" : ""}`} />
                      </button>
                      
                      {expandedProfileSection === "aparencia" && (
                        <div className={`px-4 pb-4 pt-2 border-t ${borderSuttleClass} bg-black/5 font-mono text-[10px] space-y-3`}>
                          <p className={`text-[8px] ${textMutedClass} uppercase font-display`}>Tema do Aplicativo</p>
                          
                          <div className="grid grid-cols-3 gap-2">
                            {[
                              { key: "claro" as const, label: "Claro", icon: Sun },
                              { key: "escuro" as const, label: "Escuro", icon: Moon },
                              { key: "auto" as const, label: "Auto", icon: Smartphone },
                            ].map((theme) => {
                              const Icon = theme.icon;
                              return (
                                <button
                                  key={theme.key}
                                  onClick={() => {
                                    setAppearanceMode(theme.key);
                                    triggerSimNotification(`Modo de aparência definido para: ${theme.label}`);
                                  }}
                                  className={`py-2 rounded-xl text-[9px] font-bold border transition-all cursor-pointer flex flex-col items-center justify-center gap-1 ${
                                    appearanceMode === theme.key 
                                      ? "bg-[#c3f400]/10 border-[#c3f400] text-[#c3f400] shadow-[0_0_10px_rgba(195,244,0,0.15)]" 
                                      : `${bgSubtleClass} border-gray-400/20 ${textBodyClass} hover:text-black hover:border-gray-400/40 dark:hover:text-white`
                                  }`}
                                >
                                  <Icon className="w-3.5 h-3.5" />
                                  <span>{theme.label}</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* ACCORDION 11: PRIVACIDADE */}
                    <div className={`${cardBgClass} border ${borderSuttleClass} rounded-xl overflow-hidden transition-all shadow-sm`}>
                      <button 
                        onClick={() => toggleSection("privacidade")}
                        className={`w-full px-4 py-3.5 flex justify-between items-center text-left text-xs font-bold ${textTitleClass} hover:bg-black/5 transition-colors cursor-pointer`}
                      >
                        <span className="flex items-center gap-2">
                          <Shield className="w-4 h-4 text-blue-400" />
                          Privacidade & LGPD
                        </span>
                        <ChevronRight className={`w-4 h-4 ${textMutedClass} transition-transform ${expandedProfileSection === "privacidade" ? "rotate-90 text-[#c3f400]" : ""}`} />
                      </button>
                      
                      {expandedProfileSection === "privacidade" && (
                        <div className={`px-4 pb-4 pt-2 border-t ${borderSuttleClass} bg-black/5 font-mono text-[9px] ${textBodyClass} space-y-3`}>
                          <div className="space-y-1">
                            <p className={`${textTitleClass} font-bold text-[10px]`}>Política LGPD & Proteção de Dados</p>
                            <p className={`${textMutedClass} leading-relaxed text-[8.5px]`}>Seus dados pessoais, fichas de avaliação e planejamento físico são processados de forma privada e segura, e apenas você e seu professor direto possuem acesso às informações.</p>
                          </div>

                          <div className="grid grid-cols-2 gap-2 pt-1">
                            <button 
                              onClick={() => triggerSimNotification("Solicitação de exportação de dados recebida! Um link em formato JSON será enviado ao seu e-mail registrado. 📩")}
                              className={`py-2 px-3 ${bgSubtleClass} border ${borderSuttleClass} rounded-xl ${textTitleClass} hover:opacity-85 font-bold text-[9px] transition-all cursor-pointer text-center active:scale-95`}
                            >
                              Exportar Dados
                            </button>
                            <button 
                              onClick={() => triggerSimNotification("Sua solicitação de exclusão de conta foi registrada. O professor Rodrigo foi notificado e responderá em até 48 horas. ⚠️")}
                              className={`py-2 px-3 ${bgSubtleClass} hover:bg-rose-500/10 border border-rose-500/20 hover:border-rose-500/40 rounded-xl text-rose-400 font-bold text-[9px] transition-all cursor-pointer text-center active:scale-95`}
                            >
                              Excluir Conta
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* ACCORDION 12: SUPORTE */}
                    <div className={`${cardBgClass} border ${borderSuttleClass} rounded-xl overflow-hidden transition-all shadow-sm`}>
                      <button 
                        onClick={() => toggleSection("suporte")}
                        className={`w-full px-4 py-3.5 flex justify-between items-center text-left text-xs font-bold ${textTitleClass} hover:bg-black/5 transition-colors cursor-pointer`}
                      >
                        <span className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-emerald-400" />
                          Suporte Técnico
                        </span>
                        <ChevronRight className={`w-4 h-4 ${textMutedClass} transition-transform ${expandedProfileSection === "suporte" ? "rotate-90 text-[#c3f400]" : ""}`} />
                      </button>
                      
                      {expandedProfileSection === "suporte" && (
                        <div className={`px-4 pb-4 pt-2 border-t ${borderSuttleClass} bg-black/5 font-mono text-[9px] ${textBodyClass} space-y-3`}>
                          <div className="space-y-1.5">
                            <div className={`flex justify-between items-center py-1 border-b ${borderSuttleClass}`}>
                              <span>WhatsApp do Professor</span>
                              <a href="https://wa.me/5511999999999" target="_blank" rel="noopener noreferrer" className="text-emerald-400 font-bold hover:underline">(11) 99999-9999</a>
                            </div>
                            <div className={`flex justify-between items-center py-1 border-b ${borderSuttleClass}`}>
                              <span>E-mail Direto</span>
                              <span className={`${textTitleClass} font-bold`}>suporte@treinopro.com.br</span>
                            </div>
                            <div className="flex justify-between items-center py-1">
                              <span>Telefone de Contato</span>
                              <span className={`${textTitleClass} font-bold`}>0800-400-9000</span>
                            </div>
                          </div>

                          <div className={`space-y-2 pt-1 border-t ${borderSuttleClass}`}>
                            <p className={`${textTitleClass} font-extrabold text-[10px]`}>Perguntas Frequentes (FAQ)</p>
                            <div className={`${bgSubtleClass} p-2 rounded-lg border ${borderSuttleClass} space-y-1.5 text-[8.5px]`}>
                              <p className={`${textTitleClass} font-bold`}>Q: Como funciona o cálculo de XP?</p>
                              <p className={textMutedClass}>R: Cada treino concluído rende 250 XP. Check-ins diários dão 50 XP adicionais.</p>
                              
                              <p className={`${textTitleClass} font-bold pt-1.5 border-t ${borderSuttleClass}`}>Q: Onde vejo minhas cargas antigas?</p>
                              <p className={textMutedClass}>R: Vá na aba "Evolução" para acompanhar as curvas de carga de cada exercício.</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* ACCORDION 13: SOBRE */}
                    <div className={`${cardBgClass} border ${borderSuttleClass} rounded-xl overflow-hidden transition-all shadow-sm`}>
                      <button 
                        onClick={() => toggleSection("sobre")}
                        className={`w-full px-4 py-3.5 flex justify-between items-center text-left text-xs font-bold ${textTitleClass} hover:bg-black/5 transition-colors cursor-pointer`}
                      >
                        <span className="flex items-center gap-2">
                          <Info className="w-4 h-4 text-gray-400" />
                          Sobre o TreinoPro
                        </span>
                        <ChevronRight className={`w-4 h-4 ${textMutedClass} transition-transform ${expandedProfileSection === "sobre" ? "rotate-90 text-[#c3f400]" : ""}`} />
                      </button>
                      
                      {expandedProfileSection === "sobre" && (
                        <div className={`px-4 pb-4 pt-2 border-t ${borderSuttleClass} bg-black/5 font-mono text-[9px] ${textBodyClass} space-y-1.5`}>
                          <div className="flex justify-between">
                            <span>Versão do Aplicativo</span>
                            <span className={`${textTitleClass} font-bold`}>v1.8.4</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Última Atualização</span>
                            <span className={`${textTitleClass} font-bold`}>09/07/2026</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Licença de Uso</span>
                            <span className={`${textTitleClass} font-bold`}>Exclusiva TreinoPro</span>
                          </div>
                          <p className="text-[8px] text-gray-600 mt-2 text-center">© 2026 TreinoPro • Todos os direitos reservados.</p>
                        </div>
                      )}
                    </div>

                  </div>

                  {/* LOGOUT & INTERFACE SWITCH BUTTONS */}
                  <div className="pt-3 space-y-2">
                    <button
                      onClick={async () => {
                        try {
                          await signOut(auth);
                        } catch (err) {
                          console.error("Firebase signOut failed:", err);
                        }
                        setIsLoggedIn(false);
                        localStorage.removeItem("treinopro_aluno_logged_in");
                        triggerSimNotification("Sua sessão foi encerrada com sucesso! 🚪");
                      }}
                      className="w-full py-3 bg-rose-500/10 hover:bg-rose-500 hover:text-white border border-rose-500/20 text-rose-400 font-extrabold rounded-2xl text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg active:scale-95"
                    >
                      <LogOut className="w-4 h-4 shrink-0" />
                      SAIR DA MINHA CONTA 🚪
                    </button>

                    {!isCapacitor && (
                      <button
                        onClick={() => {
                          triggerSimNotification("Retornando ao Painel Administrativo do Professor...");
                          setTimeout(() => {
                            onBackToTrainer();
                          }, 500);
                        }}
                        className="w-full py-3 bg-gray-500/10 hover:bg-gray-500 hover:text-white border border-gray-500/20 text-gray-400 font-extrabold rounded-2xl text-xs transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                      >
                        Voltar ao Painel do Professor 💻
                      </button>
                    )}
                  </div>

                </div>
              )}

                </>
              )}
            </div>

            {/* REALISTIC HOME BAR CAP hardware indicator bottom */}
            {usePhoneFrame && (
              <div className="absolute bottom-2 inset-x-0 h-1.5 bg-white/20 w-32 mx-auto rounded-full z-45 pointer-events-none"></div>
            )}

            {/* MOBILE INTERACTIVE NAVIGATION BOT BAR (MD3 Style bottom menu tabs) */}
            {isLoggedIn && !isExecutingWorkout && (
              <nav className={`absolute inset-x-3 h-14 bg-[#1e2020]/90 backdrop-blur-md border border-[#343535]/50 rounded-2xl z-40 flex justify-between items-center px-4 shadow-lg ${
                usePhoneFrame ? "bottom-4" : "bottom-[calc(1rem+env(safe-area-inset-bottom,0px))]"
              }`}>
                {[
                  { tab: "inicio" as const, icon: Compass, label: "Início" },
                  { tab: "treino" as const, icon: Dumbbell, label: "Treinar" },
                  { tab: "evolucao" as const, icon: TrendingUp, label: "Evolução" },
                  { tab: "chat" as const, icon: MessageSquare, label: "Coach" },
                  { tab: "perfil" as const, icon: User, label: "Perfil" }
                ].map((item) => {
                  const Icon = item.icon;
                  const isSelected = activeSubTab === item.tab;
                  return (
                    <button
                      key={item.tab}
                      onClick={() => {
                        if(isExecutingWorkout && item.tab !== "treino") {
                          triggerSimNotification("Conclua ou cancele o treino atual antes de navegar!");
                          return;
                        }
                        setActiveSubTab(item.tab);
                      }}
                      className={`flex flex-col items-center justify-center p-1.5 transition-all cursor-pointer ${
                        isSelected 
                          ? "text-[#c3f400] scale-110 font-bold" 
                          : "text-[#b9cacb] hover:text-white"
                      }`}
                    >
                      <Icon className="w-4.5 h-4.5" />
                      <span className="text-[8px] font-mono mt-1 tracking-tight leading-none">{item.label}</span>
                    </button>
                  );
                })}
              </nav>
            )}

          </div>

        </div>

      </div>

      {/* ALL ALUNO CONNECT INTERACTIVE UTILITIES MODALS (BENTO ACCESS) */}
      <AnimatePresence>
        {/* 1. DAILY CHECK-IN DIÁRIO MODAL */}
        {showCheckinModal && (
          <div className="fixed inset-0 z-50 flex items-end lg:items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowCheckinModal(false)}></div>
            <motion.div
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100%", opacity: 0 }}
              className="bg-[#121414] border border-[#343535]/30 w-full max-w-md rounded-t-3xl lg:rounded-2xl p-5 shadow-2xl relative z-10 max-h-[90vh] flex flex-col overflow-y-auto scrollbar-none"
            >
              <div className="flex justify-between items-center border-b border-[#343535]/20 pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <Heart className="w-5 h-5 text-rose-500 animate-pulse" />
                  <h3 className="font-extrabold text-sm font-mono text-white">Check-in Diário de Recuperação</h3>
                </div>
                <button onClick={() => setShowCheckinModal(false)} className="p-1 text-gray-500 hover:text-white cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4 text-xs font-sans">
                {/* Sleep Hours */}
                <div className="space-y-1.5 bg-[#252727] p-3 rounded-xl border border-[#343535]/10">
                  <div className="flex justify-between font-mono font-bold text-[10px] text-gray-400">
                    <span>🛌 HORAS DE SONO</span>
                    <span className="text-[#c3f400]">{checkinValues.sleepHours} horas</span>
                  </div>
                  <input
                    type="range"
                    min="4"
                    max="12"
                    value={checkinValues.sleepHours}
                    onChange={(e) => setCheckinValues(prev => ({ ...prev, sleepHours: parseInt(e.target.value) }))}
                    className="w-full h-1.5 bg-[#121414] rounded-lg appearance-none cursor-pointer accent-[#c3f400]"
                  />
                </div>

                {/* Sleep Quality */}
                <div className="space-y-2 bg-[#252727] p-3 rounded-xl border border-[#343535]/10">
                  <p className="font-mono font-bold text-[10px] text-gray-400 uppercase">Qualidade do Sono</p>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { val: "ruim", label: "😴 Ruim" },
                      { val: "normal", label: "😐 Normal" },
                      { val: "excelente", label: "😊 Excelente" }
                    ].map(item => (
                      <button
                        key={item.val}
                        onClick={() => setCheckinValues(prev => ({ ...prev, sleepQuality: item.val }))}
                        className={`py-2 text-[10px] rounded-lg border font-mono font-bold cursor-pointer transition-all ${
                          checkinValues.sleepQuality === item.val
                            ? "bg-[#c3f400]/10 border-[#c3f400]/40 text-[#c3f400]"
                            : "bg-[#121414]/40 border-[#343535]/20 text-gray-400 hover:text-white"
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Fatigue & Pain Range inputs */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5 bg-[#252727] p-3 rounded-xl border border-[#343535]/10">
                    <div className="flex justify-between font-mono font-bold text-[9px] text-gray-400">
                      <span>⚡ FADIGA GERAL</span>
                      <span className={checkinValues.fatigue > 7 ? "text-rose-400" : "text-emerald-400"}>{checkinValues.fatigue}/10</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={checkinValues.fatigue}
                      onChange={(e) => setCheckinValues(prev => ({ ...prev, fatigue: parseInt(e.target.value) }))}
                      className="w-full h-1 bg-[#121414] rounded-lg appearance-none cursor-pointer accent-amber-400"
                    />
                  </div>

                  <div className="space-y-1.5 bg-[#252727] p-3 rounded-xl border border-[#343535]/10">
                    <div className="flex justify-between font-mono font-bold text-[9px] text-gray-400">
                      <span>🦴 DOR ARTICULAR</span>
                      <span className={checkinValues.pain > 5 ? "text-rose-400" : "text-emerald-400"}>{checkinValues.pain}/10</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={checkinValues.pain}
                      onChange={(e) => setCheckinValues(prev => ({ ...prev, pain: parseInt(e.target.value) }))}
                      className="w-full h-1 bg-[#121414] rounded-lg appearance-none cursor-pointer accent-rose-400"
                    />
                  </div>
                </div>

                {/* Stress & Motivation Range inputs */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5 bg-[#252727] p-3 rounded-xl border border-[#343535]/10">
                    <div className="flex justify-between font-mono font-bold text-[9px] text-gray-400">
                      <span>🧠 ESTRESSE MENTAL</span>
                      <span className={checkinValues.stress > 7 ? "text-rose-400" : "text-emerald-400"}>{checkinValues.stress}/10</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={checkinValues.stress}
                      onChange={(e) => setCheckinValues(prev => ({ ...prev, stress: parseInt(e.target.value) }))}
                      className="w-full h-1 bg-[#121414] rounded-lg appearance-none cursor-pointer accent-amber-500"
                    />
                  </div>

                  <div className="space-y-1.5 bg-[#252727] p-3 rounded-xl border border-[#343535]/10">
                    <div className="flex justify-between font-mono font-bold text-[9px] text-gray-400">
                      <span>🔥 MOTIVAÇÃO</span>
                      <span className="text-[#c3f400]">{checkinValues.motivation}/10</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={checkinValues.motivation}
                      onChange={(e) => setCheckinValues(prev => ({ ...prev, motivation: parseInt(e.target.value) }))}
                      className="w-full h-1 bg-[#121414] rounded-lg appearance-none cursor-pointer accent-[#c3f400]"
                    />
                  </div>
                </div>

                {/* Optional Weight Input */}
                <div className="space-y-1.5 bg-[#252727] p-3 rounded-xl border border-[#343535]/10">
                  <label className="text-gray-400 font-mono font-bold text-[9px] uppercase">Peso Atual do Dia (Opcional)</label>
                  <input
                    type="text"
                    value={checkinValues.weight}
                    onChange={(e) => setCheckinValues(prev => ({ ...prev, weight: e.target.value }))}
                    placeholder="ex: 84.5 (deixe em branco para manter)"
                    className="w-full bg-[#121414] border border-[#343535]/20 focus:border-[#c3f400] rounded-lg px-3 py-2 text-white outline-none font-mono"
                  />
                </div>

                <button
                  onClick={() => {
                    setHasDoneCheckinToday(true);
                    localStorage.setItem(`checkin_done_today_${simulatedStudentId}`, "true");
                    
                    // If weight is supplied, update active student weight
                    if (checkinValues.weight && !isNaN(parseFloat(checkinValues.weight))) {
                      const updated = { ...activeStudent, weight: parseFloat(checkinValues.weight) };
                      onUpdateStudent(updated);
                    }

                    setShowCheckinModal(false);
                    triggerSimNotification("Check-in gravado com sucesso! Recovery Score redefinido cientificamente.");
                  }}
                  className="w-full py-3 primary-gradient text-[#121414] font-mono font-extrabold text-xs rounded-xl shadow-[0_0_15px_rgba(0,242,255,0.25)] hover:opacity-90 active:scale-95 cursor-pointer"
                >
                  Confirmar e Registrar Check-in ⚡
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* 2. HISTÓRICO DE TREINOS MODAL */}
        {showHistoryModal && (
          <div className="fixed inset-0 z-50 flex items-end lg:items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowHistoryModal(false)}></div>
            <motion.div
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100%", opacity: 0 }}
              className="bg-[#121414] border border-[#343535]/30 w-full max-w-md rounded-t-3xl lg:rounded-2xl p-5 shadow-2xl relative z-10 max-h-[90vh] flex flex-col overflow-hidden"
            >
              <div className="flex justify-between items-center border-b border-[#343535]/20 pb-3 mb-3 shrink-0">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-[#c3f400]" />
                  <h3 className="font-extrabold text-sm font-mono text-white">Histórico de Sessões</h3>
                </div>
                <button onClick={() => setShowHistoryModal(false)} className="p-1 text-gray-500 hover:text-white cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto space-y-3 pr-1 scrollbar-none">
                {selectedHistoryEntry ? (
                  /* History drilldown view */
                  <div className="space-y-4">
                    <button
                      onClick={() => setSelectedHistoryEntry(null)}
                      className="flex items-center gap-1 text-[10px] text-[#c3f400] font-mono cursor-pointer border border-[#c3f400]/20 px-2 py-1 rounded"
                    >
                      <ArrowLeft className="w-3 h-3" /> Voltar ao Histórico
                    </button>
                    <div className="bg-[#252727] p-4 rounded-2xl border border-[#343535]/15 space-y-3">
                      <div>
                        <h4 className="font-extrabold text-white text-xs leading-snug">{selectedHistoryEntry.name}</h4>
                        <p className="text-gray-500 text-[9px] font-mono mt-1">Concluído em: {selectedHistoryEntry.date} • Duração {selectedHistoryEntry.duration}</p>
                      </div>
                      <div className="h-px bg-[#343535]/15"></div>
                      <div className="space-y-3 text-xs leading-relaxed">
                        <p className="font-bold text-[#c3f400] font-mono text-[9px] uppercase tracking-wider">Cargas e Séries Executadas:</p>
                        {selectedHistoryEntry.exercises.map((ex: any, idx: number) => (
                          <div key={idx} className="flex justify-between items-center bg-[#121414]/60 p-2.5 rounded-xl border border-white/5 font-mono text-[10px]">
                            <div>
                              <p className="font-bold text-white leading-snug">{ex.name}</p>
                              <p className="text-gray-500 text-[8px] mt-0.5">{ex.sets}</p>
                            </div>
                            <span className="text-[#c3f400] font-bold bg-[#c3f400]/10 border border-[#c3f400]/25 px-2 py-0.5 rounded-md">{ex.bestWeight}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  completedWorkoutsHistory.map((entry) => (
                    <div
                      key={entry.id}
                      onClick={() => setSelectedHistoryEntry(entry)}
                      className="bg-[#252727]/60 hover:bg-[#252727] border border-[#343535]/15 rounded-2xl p-4 flex justify-between items-center cursor-pointer transition-all"
                    >
                      <div>
                        <span className="text-[8px] font-mono bg-[#c3f400]/10 text-[#c3f400] px-2 py-0.5 rounded-full border border-[#c3f400]/20 uppercase font-bold">{entry.date}</span>
                        <h4 className="font-bold text-white text-xs mt-2">{entry.name}</h4>
                        <p className="text-gray-400 text-[10px] font-mono mt-1">{entry.duration} • {entry.volume.toLocaleString()}kg total</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-500 shrink-0" />
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </div>
        )}

        {/* 3. AGENDA SEMANAL MODAL */}
        {showCalendarModal && (
          <div className="fixed inset-0 z-50 flex items-end lg:items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowCalendarModal(false)}></div>
            <motion.div
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100%", opacity: 0 }}
              className="bg-[#121414] border border-[#343535]/30 w-full max-w-md rounded-t-3xl lg:rounded-2xl p-5 shadow-2xl relative z-10 max-h-[90vh] flex flex-col overflow-y-auto scrollbar-none"
            >
              <div className="flex justify-between items-center border-b border-[#343535]/20 pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-amber-500" />
                  <h3 className="font-extrabold text-sm font-mono text-white">Agenda & Agendamentos</h3>
                </div>
                <button onClick={() => setShowCalendarModal(false)} className="p-1 text-gray-500 hover:text-white cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4 text-xs font-mono">
                {/* Visual Calendar Header strip */}
                <div className="bg-[#252727] p-3 rounded-2xl border border-[#343535]/15 text-center">
                  <p className="text-[#c3f400] font-bold text-[10px] uppercase">Julho de 2026</p>
                  <div className="grid grid-cols-7 gap-1 mt-3">
                    {["D","S","T","Q","Q","S","S"].map((d, i) => <span key={i} className="text-gray-600 text-[8px] font-bold">{d}</span>)}
                    {Array.from({ length: 31 }).map((_, i) => {
                      const dayNum = i + 1;
                      const isToday = dayNum === 9; // assume today is July 9th
                      return (
                        <div
                          key={i}
                          className={`p-1.5 rounded-lg text-[9px] font-bold transition-all ${
                            isToday
                              ? "bg-[#c3f400] text-[#121414] shadow-[0_0_10px_rgba(0,242,255,0.4)]"
                              : dayNum === 15
                              ? "border border-amber-500/40 text-amber-500"
                              : "text-gray-400 hover:text-white"
                          }`}
                        >
                          {dayNum}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Schedulings Lists */}
                <div className="space-y-2 text-[10px]">
                  <p className="text-gray-500 font-bold uppercase tracking-wider text-[8px]">Compromissos Agendados</p>
                  
                  <div className="bg-[#252727]/60 border border-[#343535]/15 rounded-xl p-3 flex gap-3 items-center">
                    <div className="w-8 h-8 rounded-full bg-[#c3f400]/10 text-[#c3f400] flex items-center justify-center shrink-0">
                      <Dumbbell className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-extrabold text-white leading-snug">Treino A - Peito & Tríceps</p>
                      <p className="text-gray-500 text-[8px] mt-0.5">Hoje • Horário Sugerido: 19:30</p>
                    </div>
                  </div>

                  <div className="bg-[#252727]/60 border border-[#343535]/15 rounded-xl p-3 flex gap-3 items-center">
                    <div className="w-8 h-8 rounded-full bg-[#c3f400]/10 text-[#c3f400] flex items-center justify-center shrink-0">
                      <Activity className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-extrabold text-white leading-snug">Check-in Corporal Diário</p>
                      <p className="text-gray-500 text-[8px] mt-0.5">Amanhã • Horário Sugerido: 07:00 (Jejum)</p>
                    </div>
                  </div>

                  <div className="bg-[#252727]/60 border border-amber-500/25 rounded-xl p-3 flex gap-3 items-center">
                    <div className="w-8 h-8 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
                      <Calendar className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-extrabold text-white leading-snug">Avaliação Física Semestral</p>
                      <p className="text-amber-500 text-[8px] mt-0.5">15 de Julho (Próxima quarta) • Presencial</p>
                    </div>
                  </div>
                </div>

                <p className="text-[8px] text-gray-500 leading-relaxed text-center italic">
                  *Para reagendar avaliações, mande uma mensagem no Chat direto com seu professor Rodrigo.
                </p>
              </div>
            </motion.div>
          </div>
        )}

        {/* 4. CONQUISTAS & CERTIFICADOS MODAL */}
        {showConquistasModal && (
          <div className="fixed inset-0 z-50 flex items-end lg:items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowConquistasModal(false)}></div>
            <motion.div
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100%", opacity: 0 }}
              className="bg-[#121414] border border-[#343535]/30 w-full max-w-md rounded-t-3xl lg:rounded-2xl p-5 shadow-2xl relative z-10 max-h-[90vh] flex flex-col overflow-y-auto scrollbar-none"
            >
              <div className="flex justify-between items-center border-b border-[#343535]/20 pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-yellow-500" />
                  <h3 className="font-extrabold text-sm font-mono text-white">Conquistas & Selos</h3>
                </div>
                <button onClick={() => setShowConquistasModal(false)} className="p-1 text-gray-500 hover:text-white cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4 text-xs font-sans">
                {/* Badges Grid */}
                <div className="grid grid-cols-2 gap-2.5">
                  {[
                    { title: "⚔️ Guerreiro de Aço", desc: "Completou o primeiro treino", ok: true },
                    { title: "🔥 Fênix Consistente", desc: "Alcançou 15 dias de streak", ok: true },
                    { title: "🏋️‍♂️ Titã Mecânico", desc: "Subiu carga em 3 exercícios", ok: true },
                    { title: "🧠 Músculo Inteligente", desc: "Fez 5 perguntas ao Coach", ok: true },
                    { title: "💧 Hidrogod", desc: "Bebeu 3L água por 7 dias", ok: false },
                    { title: "🏆 Lendário", desc: "Alcançou 100 treinos", ok: false }
                  ].map((badge, i) => (
                    <div
                      key={i}
                      className={`p-3 rounded-2xl border text-center space-y-1 ${
                        badge.ok
                          ? "bg-gradient-to-b from-[#252727] to-[#121414] border-yellow-500/25 text-white"
                          : "bg-[#1e2020]/40 border-[#343535]/15 text-gray-500"
                      }`}
                    >
                      <p className="font-bold text-[11px] truncate leading-none">{badge.title}</p>
                      <p className="text-[9px] text-gray-500 font-mono leading-tight pt-1">{badge.desc}</p>
                      <span className={`inline-block text-[8px] font-mono px-2 py-0.5 rounded-full mt-2 font-bold ${badge.ok ? "bg-yellow-500/10 text-yellow-500" : "bg-gray-800 text-gray-600"}`}>
                        {badge.ok ? "UNLOCKED 🏆" : "LOCKED 🔒"}
                      </span>
                    </div>
                  ))}
                </div>

                {/* PDF Certification Downloads */}
                <div className="space-y-2 pt-3 border-t border-[#343535]/15">
                  <p className="text-gray-500 font-mono font-bold uppercase tracking-wider text-[8px]">Certificados de Consistência (PDF)</p>
                  
                  <div className="bg-[#252727] border border-[#343535]/20 rounded-xl p-3 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-white text-[11px] leading-snug">Certificado de 30 Dias</p>
                      <p className="text-[9px] text-[#c3f400] font-mono mt-0.5">Liberado • 100% Completo</p>
                    </div>
                    <button
                      onClick={() => triggerSimNotification("Baixando Certificado de Consistência (30 dias).pdf... 📄")}
                      className="p-2 bg-[#c3f400]/10 hover:bg-[#c3f400]/20 text-[#c3f400] rounded-lg border border-[#c3f400]/30 cursor-pointer"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="bg-[#252727] border border-[#343535]/20 rounded-xl p-3 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-white text-[11px] leading-snug">Certificado de 90 Dias</p>
                      <p className="text-[9px] text-gray-500 font-mono mt-0.5">Progresso • {streakDays}/90 dias</p>
                    </div>
                    <button
                      disabled
                      className="p-2 bg-gray-800 text-gray-600 rounded-lg border border-gray-700 opacity-50"
                    >
                      <Lock className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* 5. RANKING DE CONSISTÊNCIA MODAL */}
        {showRankingModal && (
          <div className="fixed inset-0 z-50 flex items-end lg:items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowRankingModal(false)}></div>
            <motion.div
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100%", opacity: 0 }}
              className="bg-[#121414] border border-[#343535]/30 w-full max-w-md rounded-t-3xl lg:rounded-2xl p-5 shadow-2xl relative z-10 max-h-[90vh] flex flex-col overflow-y-auto scrollbar-none"
            >
              <div className="flex justify-between items-center border-b border-[#343535]/20 pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <Flame className="w-5 h-5 text-orange-500 animate-pulse" />
                  <h3 className="font-extrabold text-sm font-mono text-white">Ranking de Consistência</h3>
                </div>
                <button onClick={() => setShowRankingModal(false)} className="p-1 text-gray-500 hover:text-white cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4 text-xs font-mono">
                <p className="text-gray-400 text-[10px] leading-relaxed">
                  Mostra a consistência acumulada dos alunos da Assessoria. Treine, faça check-ins e suba de posição!
                </p>

                {/* Leaderboard */}
                <div className="space-y-2">
                  {dynamicRanking.map((student, i) => {
                    const rank = i + 1;
                    return (
                      <div
                        key={student.id}
                        className={`p-3 rounded-xl border flex justify-between items-center ${
                          student.me
                            ? "bg-gradient-to-r from-[#c3f400]/10 to-[#c3f400]/5 border-[#c3f400]/30 shadow-[0_0_8px_rgba(0,242,255,0.15)]"
                            : "bg-[#252727]/60 border-[#343535]/15"
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] ${
                            rank === 1 ? "bg-yellow-500/20 text-yellow-500" : rank === 2 ? "bg-[#c3f400]/20 text-[#c3f400]" : "bg-gray-800 text-gray-500"
                          }`}>{rank}</span>
                          <p className="font-bold text-white text-xs leading-none">
                            {student.name} {student.me ? "(Você) ⚡" : ""}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-[#c3f400] text-[10px] leading-none">{student.xp.toLocaleString("pt-BR")} pts</p>
                          <p className="text-gray-500 text-[8px] mt-1">{student.streakDays} dias de streak 🔥</p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Privacy toggle option */}
                <div className="bg-[#252727] p-3.5 rounded-xl border border-[#343535]/15 flex justify-between items-center mt-2">
                  <div>
                    <p className="text-white font-bold text-[10px]">Participar do Ranking Público</p>
                    <p className="text-gray-500 text-[8px] mt-0.5">Seu perfil visível para outros alunos da assessoria.</p>
                  </div>
                  <input type="checkbox" defaultChecked className="accent-[#c3f400] h-4 w-4 cursor-pointer" />
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* 6. DESAFIOS SAZONAIS MODAL */}
        {showDesafiosModal && (
          <div className="fixed inset-0 z-50 flex items-end lg:items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowDesafiosModal(false)}></div>
            <motion.div
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100%", opacity: 0 }}
              className="bg-[#121414] border border-[#343535]/30 w-full max-w-md rounded-t-3xl lg:rounded-2xl p-5 shadow-2xl relative z-10 max-h-[90vh] flex flex-col overflow-y-auto scrollbar-none"
            >
              <div className="flex justify-between items-center border-b border-[#343535]/20 pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <Compass className="w-5 h-5 text-purple-400" />
                  <h3 className="font-extrabold text-sm font-mono text-white">Desafios da Comunidade</h3>
                </div>
                <button onClick={() => setShowDesafiosModal(false)} className="p-1 text-gray-500 hover:text-white cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4 text-xs font-sans">
                {localChallenges.map((chal: any, i: number) => {
                  const currentProgress = chal.category === "consistency" 
                    ? activeStudentGamification.streakDays 
                    : chal.category === "attendance"
                    ? Math.min(chal.targetCount, Math.floor(activeStudentGamification.streakDays / 3))
                    : Math.min(chal.targetCount, Math.floor(chal.targetCount * 0.6));
                  
                  const isCompleted = currentProgress >= chal.targetCount;

                  return (
                    <div 
                      key={chal.id || i}
                      className={`p-4 rounded-2xl border space-y-3 transition-all ${
                        isCompleted 
                          ? "bg-gradient-to-r from-emerald-950/30 to-[#121414] border-emerald-500/30"
                          : i === 0 
                          ? "bg-gradient-to-r from-purple-950/40 to-[#121414] border-[#c3f400]/30"
                          : "bg-[#252727] border-[#343535]/15"
                      }`}
                    >
                      <div>
                        <div className="flex justify-between items-center">
                          <span className="bg-[#c3f400]/10 text-[#c3f400] border border-[#c3f400]/30 px-2 py-0.5 rounded text-[8px] font-mono uppercase font-bold">
                            {chal.badge || "JULHO SAZONAL"}
                          </span>
                          {isCompleted && (
                            <span className="bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded text-[8px] font-mono font-bold uppercase">
                              Concluído! 🎉
                            </span>
                          )}
                        </div>
                        <h4 className="font-extrabold text-white text-xs mt-2">{chal.title}</h4>
                        <p className="text-gray-400 text-[10px] mt-1 leading-relaxed">{chal.description}</p>
                      </div>
                      
                      {/* Progress Bar */}
                      <div className="space-y-1.5 font-mono text-[9px] text-gray-500">
                        <div className="flex justify-between font-bold">
                          <span>Progresso atual</span>
                          <span className={isCompleted ? "text-emerald-400" : "text-[#c3f400]"}>
                            {currentProgress}/{chal.targetCount} {chal.category === "consistency" ? "treinos" : "atividades"}
                          </span>
                        </div>
                        <div className="w-full h-1.5 bg-[#121414] rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all ${isCompleted ? "bg-emerald-400" : "bg-gradient-to-r from-purple-500 to-[#c3f400]"}`} 
                            style={{ width: `${Math.min(100, (currentProgress / chal.targetCount) * 100)}%` }}
                          ></div>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          if (isCompleted) {
                            triggerSimNotification(`Recompensa de +${chal.xpReward} XP reivindicada com sucesso! 🎁`);
                          } else {
                            triggerSimNotification("Siga firme! Continue treinando para liberar sua recompensa.");
                          }
                        }}
                        className={`w-full py-2.5 rounded-xl font-mono text-[10px] font-extrabold cursor-pointer transition-all ${
                          isCompleted 
                            ? "bg-emerald-500 hover:bg-emerald-400 text-[#121414]" 
                            : "bg-[#1e2020] border border-[#343535]/30 text-gray-400 hover:text-white"
                        }`}
                      >
                        {isCompleted ? "Reivindicar Recompensa! 🎁" : `Complete para ganhar +${chal.xpReward} XP`}
                      </button>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </div>
        )}

        {/* 7. ÁREA FINANCEIRA MODAL */}
        {showFinanceiroModal && (
          <div className="fixed inset-0 z-50 flex items-end lg:items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowFinanceiroModal(false)}></div>
            <motion.div
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100%", opacity: 0 }}
              className="bg-[#121414] border border-[#343535]/30 w-full max-w-md rounded-t-3xl lg:rounded-2xl p-5 shadow-2xl relative z-10 max-h-[90vh] flex flex-col overflow-y-auto scrollbar-none"
            >
              <div className="flex justify-between items-center border-b border-[#343535]/20 pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-[#c3f400]" />
                  <h3 className="font-extrabold text-sm font-mono text-white">Área Financeira</h3>
                </div>
                <button onClick={() => setShowFinanceiroModal(false)} className="p-1 text-gray-500 hover:text-white cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4 text-xs font-mono">
                {/* Current plan card */}
                <div className="bg-gradient-to-r from-emerald-950/20 to-[#121414] p-4 rounded-2xl border border-emerald-500/25 space-y-3.5">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-gray-500 text-[8px] uppercase tracking-wider">PLANO CONTRATADO</p>
                      <h4 className="text-sm font-black text-white mt-1">Mensal Premium Plus ⚡</h4>
                    </div>
                    <span className="text-[9px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/20 font-bold uppercase">🟢 ATIVO</span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-[10px] text-gray-400 pt-2 border-t border-[#343535]/15">
                    <div>
                      <span>Valor:</span>
                      <p className="text-white font-extrabold">R$ 149,90 / mês</p>
                    </div>
                    <div>
                      <span>Próximo Vencimento:</span>
                      <p className="text-[#c3f400] font-extrabold">15/08/2026</p>
                    </div>
                  </div>
                </div>

                {/* Simulated testing tools */}
                <div className="bg-amber-500/5 border border-amber-500/20 p-3.5 rounded-xl space-y-2">
                  <p className="text-amber-500 text-[9px] font-bold uppercase flex items-center gap-1">⚠️ AMBIENTE DE TESTES / PROFESSOR:</p>
                  <p className="text-gray-400 text-[9.5px] leading-relaxed">
                    Você pode simular o bloqueio financeiro (atraso de mensalidade) no app do aluno para ver o comportamento do overlay de restrição de tela.
                  </p>
                  <button
                    onClick={() => {
                      setIsSimulatedOverdue(true);
                      setShowFinanceiroModal(false);
                      triggerSimNotification("Simulação de inadimplência financeira ativada! Tela bloqueada.");
                    }}
                    className="w-full py-2 bg-amber-500/10 hover:bg-amber-500 hover:text-black border border-amber-500/30 text-amber-500 font-extrabold rounded-lg text-[9px] transition-all cursor-pointer"
                  >
                    Simular Mensalidade Atrasada (Bloquear App) 🛑
                  </button>
                </div>

                {/* History of receipts */}
                <div className="space-y-2">
                  <p className="text-gray-500 text-[8px] uppercase tracking-wider font-bold">Histórico de Mensalidades</p>
                  
                  {[
                    { title: "Mensalidade Julho", date: "15/07/2026", cost: "R$ 149,90", ok: true },
                    { title: "Mensalidade Junho", date: "15/06/2026", cost: "R$ 149,90", ok: true },
                    { title: "Mensalidade Maio", date: "15/05/2026", cost: "R$ 149,90", ok: true }
                  ].map((inv, idx) => (
                    <div key={idx} className="bg-[#252727]/60 border border-[#343535]/15 rounded-xl p-3 flex justify-between items-center text-[10px]">
                      <div>
                        <p className="font-bold text-white">{inv.title}</p>
                        <p className="text-gray-500 text-[8px] mt-0.5">{inv.date} • Pix</p>
                      </div>
                      <div className="text-right flex items-center gap-2">
                        <span className="text-emerald-400 font-bold">{inv.cost}</span>
                        <span className="text-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-bold">PAGO</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* 8. IA INSIGHTS MODAL */}
        {showInsightsModal && (
          <div className="fixed inset-0 z-50 flex items-end lg:items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowInsightsModal(false)}></div>
            <motion.div
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100%", opacity: 0 }}
              className="bg-[#121414] border border-[#343535]/30 w-full max-w-md rounded-t-3xl lg:rounded-2xl p-5 shadow-2xl relative z-10 max-h-[90vh] flex flex-col overflow-y-auto scrollbar-none"
            >
              <div className="flex justify-between items-center border-b border-[#343535]/20 pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-[#c3f400] animate-pulse" />
                  <h3 className="font-extrabold text-sm font-mono text-white">Performance Insights</h3>
                </div>
                <button onClick={() => setShowInsightsModal(false)} className="p-1 text-gray-500 hover:text-white cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4 text-xs font-sans">
                <p className="text-gray-400 text-[10px] leading-relaxed font-mono">
                  Seu comportamento mecânico e consistência de hábitos analisados de ponta a ponta pela inteligência analítica.
                </p>

                {/* Analytics Block */}
                <div className="space-y-3">
                  <div className="bg-[#252727] p-3.5 rounded-2xl border border-[#343535]/15 space-y-1">
                    <p className="text-[#c3f400] font-mono font-bold text-[9px] uppercase">📈 TAXA DE CONSISTÊNCIA DE TREINO</p>
                    <p className="text-white text-xs leading-relaxed mt-1">
                      Sua frequência este mês subiu <b>18%</b> em relação ao mês anterior! Parabéns pela adesão às fichas de treino.
                    </p>
                  </div>

                  <div className="bg-[#252727] p-3.5 rounded-2xl border border-[#343535]/15 space-y-1">
                    <p className="text-[#c3f400] font-mono font-bold text-[9px] uppercase">⚡ PROGRESSÃO DE FORÇA MECÂNICA</p>
                    <p className="text-white text-xs leading-relaxed mt-1">
                      Sua carga média de agachamento livre progrediu <b>12kg</b> nas últimas 6 semanas. A técnica de contração está excelente.
                    </p>
                  </div>

                  <div className="bg-[#252727] p-3.5 rounded-2xl border border-[#343535]/15 space-y-1">
                    <p className="text-rose-400 font-mono font-bold text-[9px] uppercase">🛌 ANÁLISE CORRELAÇÃO DE SONO</p>
                    <p className="text-white text-xs leading-relaxed mt-1">
                      Aviso: Sua taxa de recuperação cai em média <b>22%</b> em dias que você registra menos de 6 horas de sono no check-in.
                    </p>
                  </div>

                  <div className="bg-[#252727] p-3.5 rounded-2xl border border-[#343535]/15 space-y-1">
                    <p className="text-emerald-400 font-mono font-bold text-[9px] uppercase">⚖ COMPOSIÇÃO CORPORAL ESTIMADA</p>
                    <p className="text-white text-xs leading-relaxed mt-1">
                      Ganhos de aproximadamente <b>1.8kg de massa magra</b> e redução de <b>2.1kg de gordura pura</b> estimada nos últimos 60 dias de dieta.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* 9. NOTIFICAÇÕES MODAL */}
        {showNotificationsModal && (
          <div className="fixed inset-0 z-50 flex items-end lg:items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowNotificationsModal(false)}></div>
            <motion.div
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100%", opacity: 0 }}
              className="bg-[#121414] border border-[#343535]/30 w-full max-w-md rounded-t-3xl lg:rounded-2xl p-5 shadow-2xl relative z-10 max-h-[90vh] flex flex-col overflow-y-auto scrollbar-none"
            >
              <div className="flex justify-between items-center border-b border-[#343535]/20 pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <Bell className="w-5 h-5 text-[#c3f400]" />
                  <h3 className="font-extrabold text-sm font-mono text-white">Alertas & Notificações</h3>
                </div>
                <button onClick={() => setShowNotificationsModal(false)} className="p-1 text-gray-500 hover:text-white cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3">
                {[
                  { title: "Ficha Atualizada! 🏋️‍♂️", text: "Professor Rodrigo atualizou sua divisão B de dorsal/bíceps hoje de manhã.", date: "Há 2 horas", unread: true },
                  { title: "Relatório de Postura Pronto 📊", text: "Sua análise postural por fotos já está disponível no seu Perfil.", date: "Ontem", unread: true },
                  { title: "Vencimento de Fatura 💳", text: "A fatura do seu plano vence em 6 dias (15 de Julho). Clique para ver o Pix.", date: "Há 3 dias", unread: false },
                  { title: "Selo Desbloqueado! 🏆", text: "Você desbloqueou o selo 'Fênix Consistente' por bater 15 dias de streak!", date: "Há 5 dias", unread: false }
                ].map((notif, idx) => (
                  <div
                    key={idx}
                    className={`p-3.5 rounded-2xl border text-xs relative ${
                      notif.unread
                        ? "bg-[#252727] border-[#c3f400]/30 shadow-[0_0_8px_rgba(0,242,255,0.05)]"
                        : "bg-[#1e2020]/50 border-[#343535]/15 text-gray-400"
                    }`}
                  >
                    {notif.unread && <span className="absolute top-3.5 right-3.5 w-2 h-2 rounded-full bg-[#c3f400]"></span>}
                    <h4 className="font-extrabold text-white text-[11px] leading-tight pr-4">{notif.title}</h4>
                    <p className="text-[10px] text-gray-400 mt-1 leading-relaxed">{notif.text}</p>
                    <span className="block text-[8px] font-mono text-gray-500 mt-2">{notif.date}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        )}

        {/* 10. PRE-WORKOUT DETAILS & EXECUTION MODAL (OPTION 3) */}
        {selectedPreWorkout && (
          <div className="fixed inset-0 z-50 flex items-end lg:items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/85 backdrop-blur-sm" onClick={() => setSelectedPreWorkout(null)}></div>
            <motion.div
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100%", opacity: 0 }}
              className="bg-[#121414] border border-[#343535]/30 w-full max-w-md rounded-t-3xl lg:rounded-2xl p-5 shadow-2xl relative z-10 max-h-[90vh] flex flex-col overflow-hidden"
            >
              {/* Header */}
              <div className="flex justify-between items-center border-b border-[#343535]/20 pb-3 mb-4 shrink-0">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-[#c3f400]/10 border border-[#c3f400]/20 flex items-center justify-center">
                    <Dumbbell className="w-4 h-4 text-[#c3f400]" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm font-sans text-white">{selectedPreWorkout.name}</h3>
                    <p className="text-[9px] font-mono text-gray-500">Divisão de Treino Prescrita</p>
                  </div>
                </div>
                <button onClick={() => setSelectedPreWorkout(null)} className="p-1.5 rounded-lg bg-gray-800/40 text-gray-400 hover:text-white cursor-pointer transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Scrollable details panel */}
              <div className="flex-1 overflow-y-auto scrollbar-none space-y-4 pr-1">
                {/* Stats grid */}
                <div className="grid grid-cols-3 gap-2.5">
                  <div className="bg-[#1e2020] border border-[#343535]/15 rounded-xl p-2.5 text-center">
                    <p className="text-gray-500 text-[8px] font-mono uppercase tracking-wider">Exercícios</p>
                    <p className="text-white text-base font-bold font-mono mt-0.5">{selectedPreWorkout.exercises.length}</p>
                  </div>
                  <div className="bg-[#1e2020] border border-[#343535]/15 rounded-xl p-2.5 text-center">
                    <p className="text-gray-500 text-[8px] font-mono uppercase tracking-wider">Séries Totais</p>
                    <p className="text-[#c3f400] text-base font-bold font-mono mt-0.5">
                      {selectedPreWorkout.exercises.reduce((acc, ex) => acc + ex.sets, 0)}
                    </p>
                  </div>
                  <div className="bg-[#1e2020] border border-[#343535]/15 rounded-xl p-2.5 text-center">
                    <p className="text-gray-500 text-[8px] font-mono uppercase tracking-wider">Tempo Est.</p>
                    <p className="text-[#c3f400] text-base font-bold font-mono mt-0.5">
                      ~{Math.max(30, selectedPreWorkout.exercises.length * 8 + 10)}m
                    </p>
                  </div>
                </div>

                {/* Focus muscles bar */}
                <div className="bg-[#1e2020]/60 border border-[#343535]/10 rounded-xl p-2.5 flex items-center justify-between text-[11px] font-sans">
                  <span className="text-gray-400">Foco biomecânico principal:</span>
                  <span className="text-white font-mono font-bold text-[10px] bg-[#c3f400]/10 text-[#c3f400] border border-[#c3f400]/20 px-2 py-0.5 rounded-md">
                    {Array.from(new Set(selectedPreWorkout.exercises.map(e => e.muscleGroup).filter(Boolean))).join(" & ") || "Geral"}
                  </span>
                </div>

                {/* Exercises list */}
                <div className="space-y-2.5">
                  <p className="text-[10px] font-mono text-gray-500 uppercase tracking-wider">Roteiro Fisiológico</p>
                  {selectedPreWorkout.exercises.map((ex, idx) => (
                    <div key={ex.id || idx} className="bg-[#1e2020] border border-[#343535]/15 hover:border-[#343535]/30 rounded-2xl p-3.5 space-y-2.5 transition-colors">
                      <div className="flex justify-between items-start gap-2">
                        <div>
                          <h4 className="text-xs font-bold text-white leading-tight">
                            <span className="text-gray-500 mr-1.5 font-mono">{idx + 1}.</span>
                            {ex.name}
                          </h4>
                          <span className="text-[8.5px] font-mono uppercase tracking-wider text-gray-500 mt-1 block">
                            Foco: {ex.muscleGroup || "Musculatura"}
                          </span>
                        </div>
                        <span className="text-[10px] font-mono font-extrabold text-white bg-[#121414] border border-[#343535]/30 px-2 py-1 rounded-lg shrink-0">
                          {ex.sets}s × {ex.reps} reps
                        </span>
                      </div>

                      {/* Load, Rest and Tech row */}
                      <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-mono">
                        <span className="bg-[#121414] border border-[#343535]/15 text-gray-400 px-2 py-0.5 rounded-md">
                          Carga: <b className="text-[#c3f400]">{ex.weight} kg</b>
                        </span>
                        <span className="bg-[#121414] border border-[#343535]/15 text-gray-400 px-2 py-0.5 rounded-md">
                          Intervalo: {ex.restSeconds || 60}s
                        </span>
                        {ex.advancedTechnique && (
                          <span className="bg-[#c3f400]/10 border border-[#c3f400]/25 text-[#c3f400] px-2 py-0.5 rounded-md font-bold flex items-center gap-1">
                            <Sparkles className="w-3 h-3" />
                            {ex.advancedTechnique}
                          </span>
                        )}
                      </div>

                      {/* Coach notes if present */}
                      {ex.notes && (
                        <div className="bg-[#121414]/40 border-l-2 border-[#c3f400]/30 p-2 rounded-lg text-[10px] text-gray-400 leading-relaxed italic">
                          💡 {ex.notes}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Warm up note */}
                <div className="bg-amber-500/5 border border-amber-500/25 rounded-xl p-3 flex gap-2.5 items-start text-[10px] leading-relaxed text-amber-300">
                  <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5 animate-pulse" />
                  <div>
                    <p className="font-bold">Protocolo de Aquecimento Sugerido:</p>
                    <p className="text-gray-400 mt-0.5">Sugerimos realizar de 1 a 2 séries de pirâmide com 50% da carga final de trabalho antes dos exercícios multiarticulares pesados para lubrificação articular segura.</p>
                  </div>
                </div>
              </div>

              {/* Bottom Sticky Action Trigger */}
              <div className="border-t border-[#343535]/20 pt-3 mt-4 shrink-0 flex gap-2">
                <button
                  onClick={() => setSelectedPreWorkout(null)}
                  className="flex-1 py-3 bg-gray-900 border border-[#343535]/30 rounded-xl text-center text-xs font-mono font-bold text-gray-400 hover:text-white transition-colors cursor-pointer"
                >
                  Voltar
                </button>
                <button
                  onClick={() => {
                    if (selectedPreWorkout) {
                      handleStartWorkout(selectedPreWorkout);
                      setSelectedPreWorkout(null);
                    }
                  }}
                  className="flex-[2] py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-[#121414] rounded-xl text-center text-xs font-mono font-extrabold shadow-[0_0_15px_rgba(16,185,129,0.25)] hover:shadow-[0_0_20px_rgba(16,185,129,0.4)] active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Play className="w-3.5 h-3.5 fill-[#121414]" />
                  Iniciar Treino Interativo
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* EXERCISES LIBRARY DRAWER MODAL OVERLAY */}
      <AnimatePresence>
        {showLibraryDrawer && (
          <div className="fixed inset-0 z-50 flex items-end lg:items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/75 backdrop-blur-xs" onClick={() => setShowLibraryDrawer(false)}></div>
            
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              className="bg-[#121414] border border-[#343535]/30 w-full max-w-lg rounded-t-3xl lg:rounded-2xl p-5 shadow-2xl relative z-10 max-h-[85vh] flex flex-col overflow-hidden"
            >
              
              {/* Drawer handle for mobile */}
              <div className="w-12 h-1.5 bg-[#343535]/40 mx-auto rounded-full mb-3 shrink-0 lg:hidden"></div>

              {/* Header */}
              <div className="flex justify-between items-center border-b border-[#343535]/20 pb-3 shrink-0">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-[#c3f400]" />
                  <h3 className="font-extrabold text-sm font-mono text-white">Biblioteca de Exercícios</h3>
                </div>
                <button onClick={() => setShowLibraryDrawer(false)} className="p-1 text-gray-500 hover:text-white cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Filter search bar */}
              <div className="relative my-3 shrink-0">
                <Search className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input 
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar exercício ou grupo muscular..."
                  className="w-full bg-[#252727] border border-[#343535]/30 focus:border-[#c3f400] outline-none rounded-xl pl-9 pr-4 py-2 text-xs text-white font-mono"
                />
              </div>

              {/* Exercises grid list */}
              <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 scrollbar-thin">
                {selectedLibraryExercise ? (
                  /* SINGLE EXERCISE FULL DETAILS VIEW */
                  <div className="space-y-4">
                    <button
                      onClick={() => setSelectedLibraryExercise(null)}
                      className="flex items-center gap-1 text-[10px] text-[#c3f400] font-mono cursor-pointer border border-[#c3f400]/20 px-2 py-1 rounded"
                    >
                      <ArrowLeft className="w-3 h-3" /> Voltar à Lista
                    </button>

                    <div className="relative h-44 rounded-xl overflow-hidden border border-[#343535]/10 bg-black">
                      <img src={selectedLibraryExercise.videoUrl} className="w-full h-full object-cover opacity-85" />
                      <span className="absolute bottom-2.5 left-2.5 bg-black/60 text-[9px] font-mono px-2 py-0.5 rounded text-[#c3f400]">
                        {selectedLibraryExercise.category}
                      </span>
                    </div>

                    <div className="space-y-3 text-xs leading-relaxed">
                      <h4 className="text-sm font-bold text-white">{selectedLibraryExercise.name}</h4>
                      
                      <div className="space-y-1 bg-[#252727] p-3 rounded-xl border border-[#343535]/15">
                        <p className="font-bold text-[#c3f400] text-[10px] uppercase font-mono">Guia de Execução Correta:</p>
                        <ol className="list-decimal pl-4 space-y-1 text-gray-300 text-[11px]">
                          {selectedLibraryExercise.execution.map((step, idx) => (
                            <li key={idx}>{step}</li>
                          ))}
                        </ol>
                      </div>

                      <p className="text-[11px] text-gray-300">
                        ⚠️ <b>Erros Comuns:</b> <span className="text-rose-400">{selectedLibraryExercise.commonMistakes}</span>
                      </p>

                      <p className="text-[11px] text-gray-300">
                        💡 <b>Dica do Coach:</b> <span className="text-emerald-400">{selectedLibraryExercise.tips}</span>
                      </p>

                      <div className="grid grid-cols-2 gap-2 text-[10px] font-mono border-t border-[#343535]/10 pt-2 text-gray-400">
                        <div>
                          <span>Respiração:</span>
                          <p className="text-white font-bold">{selectedLibraryExercise.breathing}</p>
                        </div>
                        <div>
                          <span>Cadência recomendada:</span>
                          <p className="text-white font-bold">{selectedLibraryExercise.tempo}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* LIST OF ALL EXERCISES FILTERED */
                  (() => {
                    const filtered = EXERCISE_LIBRARY_DATA.filter(ex => 
                      ex.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                      ex.category.toLowerCase().includes(searchQuery.toLowerCase())
                    );
                    if (filtered.length === 0) {
                      return <p className="text-center text-xs text-gray-400 font-mono py-10">Nenhum exercício encontrado.</p>;
                    }
                    return filtered.map((ex, idx) => (
                      <div 
                        key={idx}
                        onClick={() => setSelectedLibraryExercise(ex)}
                        className="bg-[#252727] border border-[#343535]/15 hover:border-[#c3f400]/30 rounded-xl p-3 flex gap-3 cursor-pointer items-center transition-all hover:bg-[#1e2020]"
                      >
                        <img src={ex.videoUrl} className="w-12 h-12 rounded-lg object-cover shrink-0" />
                        <div className="flex-1">
                          <h4 className="text-xs font-bold text-white leading-snug">{ex.name}</h4>
                          <span className="text-[9px] font-mono text-[#c3f400] uppercase mt-0.5 inline-block">{ex.category}</span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-500" />
                      </div>
                    ));
                  })()
                )}
              </div>

            </motion.div>
          </div>
        )}

        {/* PWA INSTALLATION / HIDE HTTP NAVIGATION BAR GUIDE */}
        {showInstallGuideModal && (
          <div className="fixed inset-0 z-50 flex items-end lg:items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/85 backdrop-blur-sm" onClick={() => setShowInstallGuideModal(false)}></div>
            <motion.div
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100%", opacity: 0 }}
              className="bg-[#121414] border border-[#343535]/30 w-full max-w-md rounded-t-3xl lg:rounded-2xl p-5 shadow-2xl relative z-10 max-h-[90vh] flex flex-col overflow-y-auto scrollbar-none animate-in fade-in slide-in-from-bottom duration-300"
            >
              <div className="flex justify-between items-center border-b border-[#343535]/20 pb-3 mb-4 shrink-0">
                <div className="flex items-center gap-2">
                  <Smartphone className="w-5 h-5 text-[#c3f400]" />
                  <h3 className="font-extrabold text-sm font-sans text-white">Instalar App (Remover Barra HTTP)</h3>
                </div>
                <button onClick={() => setShowInstallGuideModal(false)} className="p-1.5 rounded-lg bg-[#252727] text-gray-400 hover:text-white cursor-pointer transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-4 text-xs leading-relaxed text-gray-300">
                <p className="font-mono text-[10px] text-gray-400 leading-normal">
                  Se você está visualizando o site no navegador, a barra de navegação superior/inferior (onde fica o "http://...") continuará visível. Para rodar em <strong className="text-white">Tela Cheia</strong> como um aplicativo de verdade, instale-o na tela inicial do seu celular seguindo as instruções abaixo:
                </p>

                {/* iOS Instructions */}
                <div className="bg-[#1c1d1d] border border-[#343535]/30 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center gap-2 border-b border-[#343535]/20 pb-2">
                    <span className="text-xs bg-[#c3f400] text-black font-extrabold px-2 py-0.5 rounded-md font-mono">iOS</span>
                    <span className="font-bold text-white text-xs">No iPhone (Safari)</span>
                  </div>
                  <ol className="list-decimal list-inside space-y-2 font-mono text-[10px] text-gray-300">
                    <li>Abra o Safari e acesse o link enviado pelo professor.</li>
                    <li>
                      Toque no botão de <strong className="text-white">Compartilhar</strong> (ícone de quadrado com uma seta para cima <span className="inline-flex items-center justify-center w-5 h-5 bg-gray-800 rounded text-gray-200">📤</span> na barra inferior do Safari).
                    </li>
                    <li> Role as opções para baixo e toque em <strong className="text-[#c3f400]">"Adicionar à Tela de Início"</strong>.</li>
                    <li>Toque em <strong className="text-white">"Adicionar"</strong> no canto superior direito.</li>
                    <li>Pronto! Agora abra o app através do novo ícone criado na tela do seu iPhone. Ele abrirá sem nenhuma barra do navegador!</li>
                  </ol>
                </div>

                {/* Android Instructions */}
                <div className="bg-[#1c1d1d] border border-[#343535]/30 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center gap-2 border-b border-[#343535]/20 pb-2">
                    <span className="text-xs bg-cyan-400 text-black font-extrabold px-2 py-0.5 rounded-md font-mono">Android</span>
                    <span className="font-bold text-white text-xs">No Android (Chrome)</span>
                  </div>
                  <ol className="list-decimal list-inside space-y-2 font-mono text-[10px] text-gray-300">
                    <li>Abra o Chrome e acesse o link enviado pelo professor.</li>
                    <li>
                      Toque nos <strong className="text-white">três pontinhos (⋮)</strong> no canto superior direito do Chrome.
                    </li>
                    <li>Selecione a opção <strong className="text-[#c3f400]">"Instalar aplicativo"</strong> ou <strong className="text-[#c3f400]">"Adicionar à tela inicial"</strong>.</li>
                    <li>Confirme tocando em <strong className="text-white">"Instalar"</strong> ou <strong className="text-white">"Adicionar"</strong>.</li>
                    <li>Pronto! Agora abra o aplicativo pelo ícone que apareceu na tela inicial do seu celular para rodar em tela cheia de alto desempenho!</li>
                  </ol>
                </div>

                <button
                  onClick={() => setShowInstallGuideModal(false)}
                  className="w-full py-3 bg-[#c3f400] hover:bg-[#aacc00] text-black font-extrabold rounded-2xl text-xs transition-all cursor-pointer shadow-lg active:scale-95 uppercase tracking-wider font-mono mt-2"
                >
                  Entendi, vou instalar! 👍
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
