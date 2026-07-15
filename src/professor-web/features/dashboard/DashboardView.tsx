/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from "react";
import { 
  Users, 
  TrendingUp, 
  Calendar, 
  Sparkles, 
  ArrowRight, 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  Flame,
  Search,
  ArrowLeft,
  Phone,
  Mail,
  User,
  Activity,
  Dumbbell,
  Utensils,
  CreditCard,
  DollarSign,
  TrendingDown,
  ChevronRight,
  ShieldAlert,
  CalendarDays,
  Edit,
  Plus,
  Trash,
  Save,
  Info,
  X,
  ChevronLeft,
  Check,
  Trophy,
  MessageSquare,
  Target,
  Camera,
  Zap,
  Heart,
  Award
} from "lucide-react";
import { Student, Payment, Workout, Diet, Exercise } from "../../../types";

export const ADVANCED_TECHNIQUES_INFO: Record<string, { name: string; description: string; steps: string }> = {
  "Drop-set": {
    name: "Drop-set",
    description: "Redução de carga após a falha sem descanso para continuar o exercício.",
    steps: "1. Realize a série até a falha concêntrica.\n2. Reduza imediatamente a carga em 20% a 30%.\n3. Continue executando o exercício até a falha novamente, sem descansar."
  },
  "Rest-pause": {
    name: "Rest-pause",
    description: "Pausa curta de 10 a 15 segundos após a falha para realizar mais repetições.",
    steps: "1. Execute a série até a falha.\n2. Descanse por apenas 10 a 15 segundos.\n3. Pegue a mesma carga e faça o máximo de repetições possíveis até falhar de novo."
  },
  "Bi-set": {
    name: "Bi-set",
    description: "Dois exercícios diferentes realizados em sequência para o mesmo grupo muscular sem descanso.",
    steps: "1. Faça todas as repetições do primeiro exercício.\n2. Mude imediatamente para o segundo exercício sem descansar.\n3. Descanse apenas após concluir ambos."
  },
  "Tri-set": {
    name: "Tri-set",
    description: "Três exercícios diferentes realizados de forma consecutiva sem descanso.",
    steps: "1. Execute as repetições do primeiro exercício.\n2. Passe para o segundo e depois para o terceiro sem intervalo.\n3. Descanse somente após fechar a trilogia."
  },
  "Super-série": {
    name: "Super-série",
    description: "Agrupamento de dois exercícios antagonistas (músculos opostos, ex: Bíceps e Tríceps) sem pausa.",
    steps: "1. Execute o primeiro exercício para o músculo agonista.\n2. Execute imediatamente o segundo para o músculo antagonista.\n3. Descanse após os dois."
  },
  "FST-7": {
    name: "FST-7",
    description: "Fascia Stretch Training 7 - Alongamento da fáscia muscular com 7 séries e descansos curtíssimos.",
    steps: "1. Faça 7 séries do exercício com 30 a 45 segundos de descanso entre elas.\n2. Alongue o músculo trabalhado nos intervalos."
  },
  "Ponto Zero": {
    name: "Ponto Zero",
    description: "Isometria total de 1 a 2 segundos na posição de máximo alongamento muscular a cada repetição.",
    steps: "1. Desça o peso de forma controlada até o ponto de máximo alongamento.\n2. Faça uma pausa estática (isometria) completa de 2 segundos neste ponto zero.\n3. Suba o peso de forma explosiva."
  },
  "Falha Concêntrica": {
    name: "Falha Concêntrica",
    description: "Executar o movimento até ser incapaz de realizar a fase concêntrica (subida) com boa postura.",
    steps: "1. Execute o movimento mantendo a cadência controlada.\n2. Continue fazendo repetições até que o músculo não consiga mais completar a fase de contração sozinho."
  },
  "Pirâmide Crescente": {
    name: "Pirâmide Crescente",
    description: "Aumento progressivo de carga e redução de repetições a cada série do exercício.",
    steps: "1. Comece com carga moderada e repetições altas (ex: 12-15).\n2. Aumente a carga e faça menos repetições (ex: 10).\n3. Aumente a carga novamente para a série final de força (ex: 6-8)."
  }
};

interface DashboardViewProps {
  students: Student[];
  payments: Payment[];
  workouts: Workout[];
  diets: Diet[];
  onGenerateMessage: (studentName: string, reason: string, plan: string, phase: string) => void;
  onNavigateToTab: (tab: string) => void;
  initialSection?: SectionType;
  initialStudentId?: string | null;
  onSectionChange?: (section: SectionType) => void;
  onSaveWorkout?: (studentId: string, workoutName: string, exercises: Exercise[]) => void;
}

type SectionType = "overview" | "alunos_ativos" | "vencimentos" | "faturamento" | "status_fichas_avaliacoes";

export default function DashboardView({ 
  students, 
  payments, 
  workouts,
  diets,
  onGenerateMessage,
  onNavigateToTab,
  initialSection,
  initialStudentId,
  onSectionChange,
  onSaveWorkout
}: DashboardViewProps) {
  
  // Section Navigation state
  const [activeSection, rawSetActiveSection] = useState<SectionType>(initialSection || "overview");
  
  const setActiveSection = (section: SectionType) => {
    rawSetActiveSection(section);
    if (onSectionChange) {
      onSectionChange(section);
    }
  };
  
  // Drill-down states
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(initialStudentId || null);
  const [activeHistoryTab, setActiveHistoryTab] = useState<"treinos" | "avaliacoes" | "financeiro">("treinos");
  
  // Workout advanced editing states
  const [isEditingWorkout, setIsEditingWorkout] = useState(false);
  const [editedWorkoutName, setEditedWorkoutName] = useState("");
  const [editedExercises, setEditedExercises] = useState<Exercise[]>([]);
  const [activeDivisionTab, setActiveDivisionTab] = useState<string>("A");
  const [selectedTechniqueHelp, setSelectedTechniqueHelp] = useState<string | null>(null);
  
  // --- CO-PILOT STATE INTEGRATION ---
  const [selectedCopilotCategory, setSelectedCopilotCategory] = useState<string | null>(null);
  const [copilotSuccess, setCopilotSuccess] = useState<string | null>(null);
  const [copilotMessages, setCopilotMessages] = useState<Array<{id: string, studentId: string, name: string, message: string, aiReply: string, answered: boolean}>>([
    {
      id: "msg-1",
      studentId: "stud-seeded-gustavo",
      name: "Gustavo Silva",
      message: "Professor, posso substituir a Cadeira Extensora por Agachamento Hack hoje? Senti um incômodo leve no joelho.",
      aiReply: "Substituição aprovada via Biomecânica IA. O Agachamento Hack oferece alta estabilidade e reduz a força de cisalhamento patelar direto se feito com amplitude controlada. Execute com carga 15% menor e cadência excêntrica de 4 segundos.",
      answered: false
    },
    {
      id: "msg-2",
      studentId: "stud-seeded-camila",
      name: "Camila Fernandes",
      message: "Estou sentindo uma dor muscular tardia muito forte nas pernas do treino de terça. Posso pular o cárdio ou reduzir o treino hoje?",
      aiReply: "Análise de Recuperação IA: Dor muscular severa indica alto dano de microfibras. Recomendado repouso ativo hoje: 25 minutos de caminhada plana leve para aumentar o fluxo sanguíneo local e acelerar a recuperação. Evite treinar força sob fadiga articular ou muscular extrema.",
      answered: false
    }
  ]);
  const [confirmedProgressions, setConfirmedProgressions] = useState<string[]>([]);
  const [appliedDeloads, setAppliedDeloads] = useState<string[]>([]);
  const [appliedTechniques, setAppliedTechniques] = useState<string[]>([]);
  const [selectedTechnique, setSelectedTechnique] = useState<string>("Rest-Pause");
  const [completedLaudos, setCompletedLaudos] = useState<string[]>([]);
  
  // Custom states for Dashboard widgets
  const [tasks, setTasks] = useState<Array<{ id: string; text: string; completed: boolean }>>([
    { id: "t-1", text: "Montar treino C (Pernas) de Camila Fernandes", completed: false },
    { id: "t-2", text: "Analisar avaliação física postural de Gustavo Silva", completed: true },
    { id: "t-3", text: "Checar faturamento das mensalidades em atraso", completed: false },
    { id: "t-4", text: "Programar técnicas de intensificação para Ricardo Oliveira", completed: false }
  ]);
  const [newTaskText, setNewTaskText] = useState("");
  const [showAddTask, setShowAddTask] = useState(false);

  const [checkins, setCheckins] = useState([
    { id: "chk-1", studentName: "Camila Fernandes", time: "Hoje, 07:15", workout: "Treino A - Inferiores", feedback: "Glúteos esmagados! Sentiu excelente contração", feeling: "Ótimo", recovery: "9/10", sleep: "8h" },
    { id: "chk-2", studentName: "Gustavo Silva", time: "Ontem, 19:30", workout: "Treino B - Superiores", feedback: "Subiu carga no supino reto para 35kg/lado", feeling: "Cansado", recovery: "7/10", sleep: "7h" },
    { id: "chk-3", studentName: "Ricardo Oliveira", time: "Ontem, 15:45", workout: "Treino C - Ombros", feedback: "Sentiu leve fisgada na porção anterior do deltoide", feeling: "Regular", recovery: "5/10", sleep: "6h" }
  ]);

  const [intelligentAlerts, setIntelligentAlerts] = useState([
    { id: "alt-1", studentName: "Ricardo Oliveira", type: "Falta/Adesão", detail: "Sem treinar há 6 dias consecutivos (risco de abandono de 75%)", resolved: false },
    { id: "alt-2", studentName: "Gustavo Silva", type: "Dor/Articulação", detail: "Reportou dor de grau 7 no ombro durante crucifixo", resolved: false },
    { id: "alt-3", studentName: "Camila Fernandes", type: "Fadiga/Sono", detail: "Dormiu apenas 4h30 na última noite (recuperação prejudicada)", resolved: false },
    { id: "alt-4", studentName: "Ricardo Oliveira", type: "Queda de Performance", detail: "Carga do agachamento caiu de 100kg para 85kg", resolved: false }
  ]);
  
  React.useEffect(() => {
    if (initialSection) {
      rawSetActiveSection(initialSection);
    }
  }, [initialSection]);

  React.useEffect(() => {
    if (initialStudentId !== undefined) {
      setSelectedStudentId(initialStudentId);
    }
  }, [initialStudentId]);
  
  // Inner search states
  const [activeSearch, setActiveSearch] = useState("");
  const [billingSearch, setBillingSearch] = useState("");
  const [evalSearch, setEvalSearch] = useState("");

  // Helper to parse DD/MM/YYYY or YYYY-MM-DD safely
  const parseDateString = (dateStr?: string) => {
    if (!dateStr) return null;
    if (dateStr.includes("/")) {
      const parts = dateStr.split("/");
      if (parts.length === 3) {
        const day = parts[0];
        const month = parts[1];
        const year = parts[2];
        return new Date(`${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`);
      }
    }
    return new Date(dateStr);
  };

  // Reference Date for consistent "Days Remaining / Overdue" calculations: June 25, 2026
  const getDaysDiff = (dateStr?: string) => {
    if (!dateStr) return null;
    const refDate = new Date("2026-06-25");
    const targetDate = parseDateString(dateStr);
    if (!targetDate || isNaN(targetDate.getTime())) return null;
    const diffTime = targetDate.getTime() - refDate.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  // Helper to get actual workout date (either from workouts array or student metadata)
  const getStudentWorkoutDate = (studentId: string) => {
    const student = students.find(s => s.id === studentId);
    const workout = workouts.find(w => w.studentId === studentId);
    if (workout) {
      return workout.lastUpdated;
    }
    return student?.workoutUpdatedDate;
  };

  // ----------------------------------------------------
  // CALCULATIONS FOR MACRO KPI CARDS
  // ----------------------------------------------------

  // Card 1: Alunos Ativos
  const totalStudentsCount = students.length;
  const activeStudentsCount = students.filter(s => s.status === "active").length;
  const inactiveStudentsCount = students.filter(s => s.status === "inactive").length;
  const pendingRenewalCount = students.filter(s => s.status === "pending_renewal").length;
  const activePercentage = totalStudentsCount > 0 ? Math.round((activeStudentsCount / totalStudentsCount) * 100) : 0;

  // Função auxiliar para calcular taxa de adimplência de meses específicos em 2026
  const getPaymentMonthRate = (monthStr: string) => {
    const monthPayments = payments.filter(p => {
      if (!p.dueDate) return false;
      const parts = p.dueDate.split("-");
      return parts[0] === "2026" && parts[1] === monthStr;
    });
    if (monthPayments.length === 0) return 0;
    const paid = monthPayments.filter(p => p.status === "paid").length;
    return Math.round((paid / monthPayments.length) * 100);
  };

  const abrRate = useMemo(() => getPaymentMonthRate("04"), [payments]);
  const maiRate = useMemo(() => getPaymentMonthRate("05"), [payments]);
  const junRate = useMemo(() => {
    const paymentRate = getPaymentMonthRate("06");
    if (paymentRate > 0) return paymentRate;
    return activePercentage;
  }, [payments, activePercentage]);

  // Card 2: Vencimentos (Mensalidades pendentes, atrasadas e inadimplência)
  const overduePayments = useMemo(() => {
    return payments.filter(p => p.status === "overdue");
  }, [payments]);

  const dueSoonPayments = useMemo(() => {
    return payments.filter(p => {
      if (p.status !== "pending") return false;
      const days = getDaysDiff(p.dueDate);
      return days !== null && days >= 0 && days <= 7;
    });
  }, [payments]);

  const totalOverdueAmount = useMemo(() => {
    return overduePayments.reduce((sum, p) => sum + p.amount, 0);
  }, [overduePayments]);

  const totalPendingAmount = useMemo(() => {
    return payments.filter(p => p.status === "pending").reduce((sum, p) => sum + p.amount, 0);
  }, [payments]);

  // Inadimplência rate = (Overdue Count / Total Payments)
  const delinquencyRate = payments.length > 0 ? Math.round((overduePayments.length / payments.length) * 100) : 0;

  // Adimplência e Evasão dinâmicas a partir de dados reais cadastrados
  const complianceRate = payments.length > 0 ? 100 - delinquencyRate : 0;
  const churnRate = totalStudentsCount > 0 ? ((inactiveStudentsCount / totalStudentsCount) * 100).toFixed(1) : "0.0";

  // Card 3: Faturamento (Realizado, Previsto e Pendente)
  const faturamentoRealizado = useMemo(() => {
    return payments.filter(p => p.status === "paid").reduce((sum, p) => sum + p.amount, 0);
  }, [payments]);

  const faturamentoPrevisto = useMemo(() => {
    return payments.reduce((sum, p) => sum + p.amount, 0);
  }, [payments]);

  const faturamentoPendente = totalOverdueAmount + totalPendingAmount;

  // Card 4: Fichas e Avaliações expiradas ou pendentes
  const expiredAssessmentsStudents = useMemo(() => {
    return students.filter(s => {
      if (!s.hasPhysicalEvaluation || !s.physicalEvaluationDate) return false;
      const diff = getDaysDiff(s.physicalEvaluationDate);
      return diff !== null && diff < -30; // Over 30 days is expired
    });
  }, [students]);

  const studentsWithoutAssessment = useMemo(() => {
    return students.filter(s => !s.hasPhysicalEvaluation);
  }, [students]);

  const expiredWorkoutsStudents = useMemo(() => {
    return students.filter(s => {
      const workoutDate = getStudentWorkoutDate(s.id);
      if (!workoutDate) return true; // No workout date = needs action
      const diff = getDaysDiff(workoutDate);
      return diff !== null && diff < -60; // Over 60 days is outdated
    });
  }, [students, workouts]);

  const totalAlertsCount = expiredAssessmentsStudents.length + studentsWithoutAssessment.length + expiredWorkoutsStudents.length;

  // Format currency
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL"
    }).format(val);
  };

  // Real-time date and clock state
  const [currentDateTime, setCurrentDateTime] = useState(() => new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Dynamic current date representation (always current date)
  const currentDateString = useMemo(() => {
    const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' };
    return currentDateTime.toLocaleDateString('pt-BR', options);
  }, [currentDateTime]);

  // Dynamic current time representation
  const currentTimeString = useMemo(() => {
    return currentDateTime.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  }, [currentDateTime]);

  // Set default selected student when opening drilldowns
  const handleOpenSection = (section: SectionType) => {
    setActiveSection(section);
    if (onSectionChange) {
      onSectionChange(section);
    }
    if (section === "alunos_ativos" && students.length > 0 && !selectedStudentId) {
      setSelectedStudentId(students[0].id);
    }
  };

  // Get selected student object
  const currentSelectedStudent = useMemo(() => {
    if (!selectedStudentId) return students[0] || null;
    return students.find(s => s.id === selectedStudentId) || students[0] || null;
  }, [students, selectedStudentId]);

  // Selected student workout history
  const selectedStudentWorkout = useMemo(() => {
    if (!currentSelectedStudent) return null;
    return workouts.find(w => w.studentId === currentSelectedStudent.id) || null;
  }, [workouts, currentSelectedStudent]);

  // Selected student billing history
  const selectedStudentPayments = useMemo(() => {
    if (!currentSelectedStudent) return [];
    return payments.filter(p => p.studentId === currentSelectedStudent.id);
  }, [payments, currentSelectedStudent]);

  // Calculate BMI for drill-down
  const calculateBMI = (w?: number, h?: number) => {
    if (!w || !h || h === 0) return null;
    const hMeters = h > 3 ? h / 100 : h;
    const bmi = w / (hMeters * hMeters);
    let category = "";
    if (bmi < 18.5) category = "Abaixo do peso";
    else if (bmi < 25) category = "Peso normal";
    else if (bmi < 30) category = "Sobrepeso";
    else category = "Obesidade";
    return {
      value: bmi.toFixed(1),
      category
    };
  };

  // Dynamic recommendations computed entirely from actual registered data
  const recommendedActions = useMemo(() => {
    const actions: Array<{
      id: string;
      studentId: string;
      studentName: string;
      studentPlan: string;
      avatarColor: string;
      initials: string;
      context: string;
      module: "Alunos" | "Financeiro" | "Avaliações" | "Treinos";
      actionLabel: string;
      reason: string;
      currentPhase: string;
      iconType: "clock" | "alert" | "shield" | "dumbbell";
    }> = [];

    // 1. Overdue payments
    overduePayments.forEach(p => {
      const student = students.find(s => s.id === p.studentId);
      const daysDiff = getDaysDiff(p.dueDate);
      const overdueDays = daysDiff !== null ? Math.abs(daysDiff) : 0;
      actions.push({
        id: `pay-overdue-${p.id}`,
        studentId: p.studentId,
        studentName: p.studentName,
        studentPlan: p.plan || student?.plan || "Platinum",
        avatarColor: student?.avatarColor || "bg-pink-500/10 border-pink-500/30 text-pink-400",
        initials: student?.initials || p.studentName.substring(0, 2).toUpperCase(),
        context: `Mensalidade vencida há ${overdueDays} dias`,
        module: "Financeiro",
        actionLabel: "Cobrar IA",
        reason: `Cobrança amigável de mensalidade em atraso há ${overdueDays} dias.`,
        currentPhase: student?.currentPhase || "Hipertrofia",
        iconType: "alert"
      });
    });

    // 2. Inactive active students (missedDays >= 5)
    students.filter(s => s.status === "active" && s.missedDays >= 5).forEach(s => {
      actions.push({
        id: `stud-inactive-${s.id}`,
        studentId: s.id,
        studentName: s.name,
        studentPlan: s.plan,
        avatarColor: s.avatarColor || "bg-cyan-500/10 border-cyan-500/30 text-cyan-400",
        initials: s.initials,
        context: `Sem treinar há ${s.missedDays} dias (Risco Evasão)`,
        module: "Alunos",
        actionLabel: "Mensagem IA",
        reason: `Inatividade detectada: sem treinar há ${s.missedDays} dias. Chamar para retorno imediato.`,
        currentPhase: s.currentPhase || "Hipertrofia",
        iconType: "clock"
      });
    });

    // 3. Students without physical evaluation
    studentsWithoutAssessment.forEach(s => {
      actions.push({
        id: `stud-no-eval-${s.id}`,
        studentId: s.id,
        studentName: s.name,
        studentPlan: s.plan,
        avatarColor: s.avatarColor || "bg-purple-500/10 border-purple-500/30 text-purple-400",
        initials: s.initials,
        context: "Aluno sem avaliação física cadastrada",
        module: "Avaliações",
        actionLabel: "Avaliar IA",
        reason: "Solicitar agendamento da primeira avaliação física inicial.",
        currentPhase: s.currentPhase || "Hipertrofia",
        iconType: "shield"
      });
    });

    // 4. Students with expired physical evaluation
    expiredAssessmentsStudents.forEach(s => {
      const daysDiff = getDaysDiff(s.physicalEvaluationDate);
      const expiredDays = daysDiff !== null ? Math.abs(daysDiff) : 0;
      actions.push({
        id: `stud-eval-expired-${s.id}`,
        studentId: s.id,
        studentName: s.name,
        studentPlan: s.plan,
        avatarColor: s.avatarColor || "bg-purple-500/10 border-purple-500/30 text-purple-400",
        initials: s.initials,
        context: `Avaliação física vencida há ${expiredDays} dias`,
        module: "Avaliações",
        actionLabel: "Reavaliar IA",
        reason: `Solicitar agendamento de reavaliação física, já que a última foi feita há ${expiredDays} dias.`,
        currentPhase: s.currentPhase || "Hipertrofia",
        iconType: "shield"
      });
    });

    // 5. Students with expired/outdated workouts
    expiredWorkoutsStudents.forEach(s => {
      const workoutDate = getStudentWorkoutDate(s.id);
      const hasWorkoutDate = !!workoutDate;
      const daysDiff = getDaysDiff(workoutDate);
      const expiredDays = daysDiff !== null ? Math.abs(daysDiff) : 0;
      actions.push({
        id: `stud-workout-expired-${s.id}`,
        studentId: s.id,
        studentName: s.name,
        studentPlan: s.plan,
        avatarColor: s.avatarColor || "bg-amber-500/10 border-amber-500/30 text-amber-400",
        initials: s.initials,
        context: hasWorkoutDate ? `Ficha de treino desatualizada há ${expiredDays} dias` : "Sem ficha de treino ativa",
        module: "Treinos",
        actionLabel: "Prescrever IA",
        reason: hasWorkoutDate 
          ? "Sugerir agendamento ou enviar nova periodização, já que o treino atual está desatualizado." 
          : "Dar as boas-vindas e solicitar informações para montar a primeira ficha de treino personalizada.",
        currentPhase: s.currentPhase || "Hipertrofia",
        iconType: "dumbbell"
      });
    });

    return actions;
  }, [students, overduePayments, studentsWithoutAssessment, expiredAssessmentsStudents, expiredWorkoutsStudents]);

  return (
    <div className="space-y-6">
      
      {/* ---------------------------------------------------------------------- */}
      {/* SECTION 1: MACRO OVERVIEW (BENTO GRID + ACTIONS) */}
      {/* ---------------------------------------------------------------------- */}
      {activeSection === "overview" && (
        <div className="space-y-6 animate-fadeIn">
          {/* Welcome Header */}
          <section className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h2 className="text-3xl md:text-4xl font-extrabold text-[#e3e2e4] tracking-tight">
                Painel Geral
              </h2>
              <p className="text-[#b9cacb] max-w-xl mt-1 text-sm md:text-base">
                Bem-vindo de volta, Coach. Seus alunos estão com {activePercentage}% de engajamento ativo. Clique nos cards abaixo para controle detalhado.
              </p>
            </div>
            <div className="flex flex-col items-start md:items-end gap-2">
              <div className="flex items-center gap-2 text-xs md:text-sm text-[#00dbe7] bg-[#00f2ff]/5 px-4 py-2 rounded-full border border-[#00f2ff]/20 w-fit">
                <Calendar className="w-4 h-4" />
                <span className="font-mono font-medium">{currentDateString}</span>
              </div>
              <div className="flex items-center gap-2 text-xs md:text-sm text-[#ccff00] bg-[#ccff00]/5 px-4 py-1.5 rounded-full border border-[#ccff00]/20 w-fit md:self-end">
                <Clock className="w-3.5 h-3.5 animate-pulse" />
                <span className="font-mono font-bold tracking-wider">{currentTimeString}</span>
              </div>
            </div>
          </section>

          {/* ====================================================================== */}
          {/* CENTRAL DE INTELIGÊNCIA COPILOT (PAINEL DO PROFESSOR) */}
          {/* ====================================================================== */}
          <section className="glass-panel p-6 rounded-2xl border border-[#00f2ff]/20 bg-[#161719]/95 relative overflow-hidden shadow-[0_0_25px_rgba(0,242,255,0.05)]">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#00f2ff]/5 rounded-full blur-3xl -z-10 pointer-events-none" />
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#3a494b]/20 pb-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#00f2ff]/10 rounded-lg border border-[#00f2ff]/25 text-[#00dbe7] animate-pulse animate-duration-3000">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-[#e3e2e4] tracking-tight flex items-center gap-2">
                    Painel do Professor <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#00f2ff]/10 border border-[#00f2ff]/20 text-[#00dbe7]">MOTOR DE IA ATIVO</span>
                  </h3>
                  <p className="text-xs text-[#b9cacb]">
                    Seu Co-pilot de inteligência integrado. Clique em qualquer motor para tomar decisões em lote sem precisar digitar.
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-mono text-[#b9cacb] block">Métricas Atualizadas</span>
                <span className="text-xs font-mono font-bold text-emerald-400">● 10 Motores Conectados</span>
              </div>
            </div>

            {/* Grid of 10 Co-pilot categories */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              {/* Category 1: Desistência */}
              <button
                onClick={() => setSelectedCopilotCategory(selectedCopilotCategory === "desistencia" ? null : "desistencia")}
                className={`flex flex-col justify-between p-3.5 rounded-xl border transition-all text-left group cursor-pointer ${
                  selectedCopilotCategory === "desistencia"
                    ? "bg-[#ef4444]/10 border-[#ef4444] shadow-[0_0_15px_rgba(239,68,68,0.15)]"
                    : (students.filter(s => s.missedDays > 5 || s.status === "inactive").length || 1) > 0
                    ? "bg-[#ef4444]/5 border-[#ef4444]/40 hover:border-[#ef4444]/60 hover:bg-[#ef4444]/5 animate-pulse hover:animate-none shadow-[0_0_12px_rgba(239,68,68,0.2)]"
                    : "bg-[#1b1c1e] border-[#3a494b]/30 hover:border-[#ef4444]/60 hover:bg-[#ef4444]/5"
                }`}
              >
                <div className="flex items-start justify-between w-full">
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                  <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#ef4444]/10 text-red-400 border border-[#ef4444]/20">
                    Risco Alto
                  </span>
                </div>
                <div className="mt-3">
                  <h4 className="font-bold text-xs text-[#e3e2e4] leading-tight group-hover:text-red-400 transition-colors">Abandono</h4>
                  <p className="text-[10px] text-[#b9cacb] font-mono mt-0.5">
                    {students.filter(s => s.missedDays > 5 || s.status === "inactive").length || 1} Aluno(s)
                  </p>
                </div>
              </button>

              {/* Category 2: Fadiga */}
              <button
                onClick={() => setSelectedCopilotCategory(selectedCopilotCategory === "fadiga" ? null : "fadiga")}
                className={`flex flex-col justify-between p-3.5 rounded-xl border transition-all text-left group cursor-pointer ${
                  selectedCopilotCategory === "fadiga"
                    ? "bg-[#eab308]/10 border-[#eab308] shadow-[0_0_15px_rgba(234,179,8,0.15)]"
                    : (appliedDeloads.includes("camila-deload") ? 0 : 1) > 0
                    ? "bg-[#eab308]/5 border-[#eab308]/40 hover:border-[#eab308]/60 hover:bg-[#eab308]/5 animate-pulse hover:animate-none shadow-[0_0_12px_rgba(234,179,8,0.2)]"
                    : "bg-[#1b1c1e] border-[#3a494b]/30 hover:border-[#eab308]/60 hover:bg-[#eab308]/5"
                }`}
              >
                <div className="flex items-start justify-between w-full">
                  <Activity className="w-5 h-5 text-yellow-500" />
                  <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#eab308]/10 text-yellow-400 border border-[#eab308]/20">
                    Fadiga Alta
                  </span>
                </div>
                <div className="mt-3">
                  <h4 className="font-bold text-xs text-[#e3e2e4] leading-tight group-hover:text-yellow-400 transition-colors">Saturação/RPE</h4>
                  <p className="text-[10px] text-[#b9cacb] font-mono mt-0.5">
                    {appliedDeloads.includes("camila-deload") ? 0 : 1} Aluno(s)
                  </p>
                </div>
              </button>

              {/* Category 3: Recordes */}
              <button
                onClick={() => setSelectedCopilotCategory(selectedCopilotCategory === "recordes" ? null : "recordes")}
                className={`flex flex-col justify-between p-3.5 rounded-xl border transition-all text-left group cursor-pointer ${
                  selectedCopilotCategory === "recordes"
                    ? "bg-[#22c55e]/10 border-[#22c55e] shadow-[0_0_15px_rgba(34,197,94,0.15)]"
                    : "bg-[#1b1c1e] border-[#3a494b]/30 hover:border-[#22c55e]/60 hover:bg-[#22c55e]/5"
                }`}
              >
                <div className="flex items-start justify-between w-full">
                  <Trophy className="w-5 h-5 text-emerald-500" />
                  <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#22c55e]/10 text-emerald-400 border border-[#22c55e]/20">
                    Recordes!
                  </span>
                </div>
                <div className="mt-3">
                  <h4 className="font-bold text-xs text-[#e3e2e4] leading-tight group-hover:text-emerald-400 transition-colors">PRs Batidos</h4>
                  <p className="text-[10px] text-[#b9cacb] font-mono mt-0.5">
                    1 Aluno
                  </p>
                </div>
              </button>

              {/* Category 4: Evolução */}
              <button
                onClick={() => setSelectedCopilotCategory(selectedCopilotCategory === "evolucao" ? null : "evolucao")}
                className={`flex flex-col justify-between p-3.5 rounded-xl border transition-all text-left group cursor-pointer ${
                  selectedCopilotCategory === "evolucao"
                    ? "bg-[#3b82f6]/10 border-[#3b82f6] shadow-[0_0_15px_rgba(59,130,246,0.15)]"
                    : "bg-[#1b1c1e] border-[#3a494b]/30 hover:border-[#3b82f6]/60 hover:bg-[#3b82f6]/5"
                }`}
              >
                <div className="flex items-start justify-between w-full">
                  <TrendingUp className="w-5 h-5 text-blue-500" />
                  <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#3b82f6]/10 text-blue-400 border border-[#3b82f6]/20">
                    Evoluindo
                  </span>
                </div>
                <div className="mt-3">
                  <h4 className="font-bold text-xs text-[#e3e2e4] leading-tight group-hover:text-blue-400 transition-colors">Evolução</h4>
                  <p className="text-[10px] text-[#b9cacb] font-mono mt-0.5">
                    1 Aluno
                  </p>
                </div>
              </button>

              {/* Category 5: Estagnação */}
              <button
                onClick={() => setSelectedCopilotCategory(selectedCopilotCategory === "estagnado" ? null : "estagnado")}
                className={`flex flex-col justify-between p-3.5 rounded-xl border transition-all text-left group cursor-pointer ${
                  selectedCopilotCategory === "estagnado"
                    ? "bg-[#a855f7]/10 border-[#a855f7] shadow-[0_0_15px_rgba(168,85,247,0.15)]"
                    : (appliedTechniques.includes("ricardo-rest") ? 0 : 1) > 0
                    ? "bg-[#a855f7]/5 border-[#a855f7]/40 hover:border-[#a855f7]/60 hover:bg-[#a855f7]/5 animate-pulse hover:animate-none shadow-[0_0_12px_rgba(168,85,247,0.2)]"
                    : "bg-[#1b1c1e] border-[#3a494b]/30 hover:border-[#a855f7]/60 hover:bg-[#a855f7]/5"
                }`}
              >
                <div className="flex items-start justify-between w-full">
                  <TrendingDown className="w-5 h-5 text-purple-500" />
                  <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#a855f7]/10 text-purple-400 border border-[#a855f7]/20">
                    Platô
                  </span>
                </div>
                <div className="mt-3">
                  <h4 className="font-bold text-xs text-[#e3e2e4] leading-tight group-hover:text-purple-400 transition-colors">Estagnados</h4>
                  <p className="text-[10px] text-[#b9cacb] font-mono mt-0.5">
                    {appliedTechniques.includes("ricardo-rest") ? 0 : 1} Aluno(s)
                  </p>
                </div>
              </button>

              {/* Category 6: Mensagens */}
              <button
                onClick={() => setSelectedCopilotCategory(selectedCopilotCategory === "mensagens" ? null : "mensagens")}
                className={`flex flex-col justify-between p-3.5 rounded-xl border transition-all text-left group cursor-pointer ${
                  selectedCopilotCategory === "mensagens"
                    ? "bg-[#06b6d4]/10 border-[#06b6d4] shadow-[0_0_15px_rgba(6,182,212,0.15)]"
                    : (copilotMessages.filter(m => !m.answered).length) > 0
                    ? "bg-[#06b6d4]/5 border-[#06b6d4]/40 hover:border-[#06b6d4]/60 hover:bg-[#06b6d4]/5 animate-pulse hover:animate-none shadow-[0_0_12px_rgba(6,182,212,0.2)]"
                    : "bg-[#1b1c1e] border-[#3a494b]/30 hover:border-[#06b6d4]/60 hover:bg-[#06b6d4]/5"
                }`}
              >
                <div className="flex items-start justify-between w-full">
                  <MessageSquare className="w-5 h-5 text-cyan-500" />
                  <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#06b6d4]/10 text-cyan-400 border border-[#06b6d4]/20">
                    Mensagens
                  </span>
                </div>
                <div className="mt-3">
                  <h4 className="font-bold text-xs text-[#e3e2e4] leading-tight group-hover:text-cyan-400 transition-colors">Dúvidas Atletas</h4>
                  <p className="text-[10px] text-[#b9cacb] font-mono mt-0.5">
                    {copilotMessages.filter(m => !m.answered).length} Pendente(s)
                  </p>
                </div>
              </button>

              {/* Category 7: Fotos */}
              <button
                onClick={() => setSelectedCopilotCategory(selectedCopilotCategory === "fotos" ? null : "fotos")}
                className={`flex flex-col justify-between p-3.5 rounded-xl border transition-all text-left group cursor-pointer ${
                  selectedCopilotCategory === "fotos"
                    ? "bg-[#ec4899]/10 border-[#ec4899] shadow-[0_0_15px_rgba(236,72,153,0.15)]"
                    : (completedLaudos.includes("camila-postura") ? 0 : 1) > 0
                    ? "bg-[#ec4899]/5 border-[#ec4899]/40 hover:border-[#ec4899]/60 hover:bg-[#ec4899]/5 animate-pulse hover:animate-none shadow-[0_0_12px_rgba(236,72,153,0.2)]"
                    : "bg-[#1b1c1e] border-[#3a494b]/30 hover:border-[#ec4899]/60 hover:bg-[#ec4899]/5"
                }`}
              >
                <div className="flex items-start justify-between w-full">
                  <Camera className="w-5 h-5 text-pink-500" />
                  <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#ec4899]/10 text-pink-400 border border-[#ec4899]/20">
                    Postura
                  </span>
                </div>
                <div className="mt-3">
                  <h4 className="font-bold text-xs text-[#e3e2e4] leading-tight group-hover:text-pink-400 transition-colors">Postura/Laudo</h4>
                  <p className="text-[10px] text-[#b9cacb] font-mono mt-0.5">
                    {completedLaudos.includes("camila-postura") ? 0 : 1} Pendente(s)
                  </p>
                </div>
              </button>

              {/* Category 8: Frequência */}
              <button
                onClick={() => setSelectedCopilotCategory(selectedCopilotCategory === "frequencia" ? null : "frequencia")}
                className={`flex flex-col justify-between p-3.5 rounded-xl border transition-all text-left group cursor-pointer ${
                  selectedCopilotCategory === "frequencia"
                    ? "bg-[#f97316]/10 border-[#f97316] shadow-[0_0_15px_rgba(249,115,22,0.15)]"
                    : "bg-[#1b1c1e] border-[#3a494b]/30 hover:border-[#f97316]/60 hover:bg-[#f97316]/5"
                }`}
              >
                <div className="flex items-start justify-between w-full">
                  <Award className="w-5 h-5 text-orange-500" />
                  <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#f97316]/10 text-orange-400 border border-[#f97316]/20">
                    Elite
                  </span>
                </div>
                <div className="mt-3">
                  <h4 className="font-bold text-xs text-[#e3e2e4] leading-tight group-hover:text-orange-400 transition-colors">Presença Alta</h4>
                  <p className="text-[10px] text-[#b9cacb] font-mono mt-0.5">
                    {students.filter(s => s.missedDays === 0).length || 1} Aluno(s)
                  </p>
                </div>
              </button>

              {/* Category 9: Avaliações */}
              <button
                onClick={() => setSelectedCopilotCategory(selectedCopilotCategory === "avaliacoes" ? null : "avaliacoes")}
                className={`flex flex-col justify-between p-3.5 rounded-xl border transition-all text-left group cursor-pointer ${
                  selectedCopilotCategory === "avaliacoes"
                    ? "bg-[#14b8a6]/10 border-[#14b8a6] shadow-[0_0_15px_rgba(20,184,166,0.15)]"
                    : "bg-[#1b1c1e] border-[#3a494b]/30 hover:border-[#14b8a6]/60 hover:bg-[#14b8a6]/5"
                }`}
              >
                <div className="flex items-start justify-between w-full">
                  <Calendar className="w-5 h-5 text-teal-500" />
                  <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#14b8a6]/10 text-teal-400 border border-[#14b8a6]/20">
                    Fazer Hoje
                  </span>
                </div>
                <div className="mt-3">
                  <h4 className="font-bold text-xs text-[#e3e2e4] leading-tight group-hover:text-teal-400 transition-colors">Avaliações</h4>
                  <p className="text-[10px] text-[#b9cacb] font-mono mt-0.5">
                    1 Pendente
                  </p>
                </div>
              </button>

              {/* Category 10: Progresso Carga */}
              <button
                onClick={() => setSelectedCopilotCategory(selectedCopilotCategory === "progressao" ? null : "progressao")}
                className={`flex flex-col justify-between p-3.5 rounded-xl border transition-all text-left group cursor-pointer ${
                  selectedCopilotCategory === "progressao"
                    ? "bg-[#10b981]/10 border-[#10b981] shadow-[0_0_15px_rgba(16,185,129,0.15)]"
                    : "bg-[#1b1c1e] border-[#3a494b]/30 hover:border-[#10b981]/60 hover:bg-[#10b981]/5"
                }`}
              >
                <div className="flex items-start justify-between w-full">
                  <Target className="w-5 h-5 text-emerald-500" />
                  <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#10b981]/10 text-emerald-400 border border-[#10b981]/20">
                    Revisar
                  </span>
                </div>
                <div className="mt-3">
                  <h4 className="font-bold text-xs text-[#e3e2e4] leading-tight group-hover:text-emerald-400 transition-colors">Progresso Carga</h4>
                  <p className="text-[10px] text-[#b9cacb] font-mono mt-0.5">
                    {confirmedProgressions.includes("gustavo-prog") ? 0 : 1} Ficha(s)
                  </p>
                </div>
              </button>
            </div>

            {/* Success Action Alert */}
            {copilotSuccess && (
              <div className="mt-4 p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono rounded-lg flex items-center justify-between animate-fadeIn">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  <span>{copilotSuccess}</span>
                </div>
                <button onClick={() => setCopilotSuccess(null)} className="text-[#b9cacb] hover:text-white cursor-pointer">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* EXPANDED DETAILED CONTEXT-AWARE PANEL */}
            {selectedCopilotCategory && (
              <div className="mt-6 border-t border-[#3a494b]/20 pt-6 animate-slideDown">
                
                {/* --- 🔴 CATEGORY 1: RISCO DE ABANDONO --- */}
                {selectedCopilotCategory === "desistencia" && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-red-400">
                      <ShieldAlert className="w-5 h-5" />
                      <h4 className="font-extrabold text-sm uppercase tracking-wide font-mono">Motor de Adesão: Alunos com Risco Alto de Abandono</h4>
                    </div>
                    <p className="text-xs text-[#b9cacb]">
                      Nossa Inteligência Artificial correlaciona a inatividade com a quebra súbita da frequência média histórica para identificar evasões silenciosas.
                    </p>
                    
                    <div className="bg-[#1b1c1e] p-4 rounded-xl border border-[#3a494b]/25 space-y-4">
                      <div className="flex flex-col sm:flex-row justify-between gap-4 items-start sm:items-center">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center font-bold text-red-400">
                            RO
                          </div>
                          <div>
                            <h5 className="font-bold text-xs text-white">Ricardo Oliveira</h5>
                            <p className="text-[10px] text-[#b9cacb] font-mono">Plano Mensal • Treinando há 3 meses • Risco de Evasão: <span className="text-red-400 font-bold">85%</span></p>
                          </div>
                        </div>
                        <span className="text-[10px] font-mono bg-red-500/15 text-red-400 px-2 py-0.5 rounded border border-red-500/25">
                          Inativo há 8 dias
                        </span>
                      </div>
                      
                      <div className="bg-[#121315] p-3 rounded border border-red-500/10 text-xs space-y-1.5">
                        <span className="font-mono text-[9px] text-[#00f2ff] uppercase font-bold tracking-wider block">ANÁLISE COGNITIVA IA:</span>
                        <p className="text-[#b9cacb] font-mono text-[11px] leading-relaxed">
                          "Ricardo Oliveira treinou de forma impecável por 12 semanas. No entanto, quebrou abruptamente o padrão de 3 treinos semanais na última semana (0 presenças). O Motor de Adesão detectou que 75% dos alunos que apresentam esse padrão evadem na semana seguinte. Nenhuma justificativa cadastrada."
                        </p>
                      </div>

                      <div className="flex justify-end gap-2 pt-1">
                        <button
                          onClick={() => {
                            onGenerateMessage(
                              "Ricardo Oliveira",
                              "Ausência de treinos há mais de 8 dias sem justificativa.",
                              "Mensal",
                              "Força Máxima"
                            );
                            setCopilotSuccess("Mensagem de resgate de alta performance gerada para Ricardo Oliveira!");
                          }}
                          className="bg-red-500 hover:bg-red-600 text-white font-mono text-xs font-bold px-4 py-2 rounded-lg flex items-center gap-2 shadow-[0_0_15px_rgba(239,68,68,0.2)] transition-all cursor-pointer"
                        >
                          <Sparkles className="w-4 h-4" /> Gerar Mensagem de Resgate IA
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* --- 🟡 CATEGORY 2: FADIGA ELEVADA --- */}
                {selectedCopilotCategory === "fadiga" && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-yellow-400">
                      <Flame className="w-5 h-5" />
                      <h4 className="font-extrabold text-sm uppercase tracking-wide font-mono">Motor de Recuperação: Alunos com Fadiga Sistêmica Elevada</h4>
                    </div>
                    <p className="text-xs text-[#b9cacb]">
                      Análise que correlaciona o estresse mecânico cumulativo (tonelagem de treino), RPE relatado e qualidade do sono para evitar lesões musculoesqueléticas.
                    </p>

                    {appliedDeloads.includes("camila-deload") ? (
                      <div className="p-8 text-center bg-[#1b1c1e] rounded-xl border border-[#3a494b]/20">
                        <p className="text-xs text-emerald-400 font-mono">✓ Deload de 10% aplicado com sucesso ao treino de Camila Fernandes!</p>
                      </div>
                    ) : (
                      <div className="bg-[#1b1c1e] p-4 rounded-xl border border-[#3a494b]/25 space-y-4">
                        <div className="flex flex-col sm:flex-row justify-between gap-4 items-start sm:items-center">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-yellow-500/10 border border-yellow-500/30 flex items-center justify-center font-bold text-yellow-400">
                              CF
                            </div>
                            <div>
                              <h5 className="font-bold text-xs text-white">Camila Fernandes</h5>
                              <p className="text-[10px] text-[#b9cacb] font-mono">Plano Elite Performance • Fase: Definição Estética • Fadiga Muscular: <span className="text-yellow-400 font-bold">Crítica</span></p>
                            </div>
                          </div>
                          <span className="text-[10px] font-mono bg-yellow-500/15 text-yellow-400 px-2 py-0.5 rounded border border-yellow-500/25">
                            RPE Médio: 9.6 • Sono: &lt; 6h
                          </span>
                        </div>
                        
                        <div className="bg-[#121315] p-3 rounded border border-yellow-500/10 text-xs space-y-1.5">
                          <span className="font-mono text-[9px] text-[#00f2ff] uppercase font-bold tracking-wider block">DIAGNÓSTICO MOTOR DE FADIGA:</span>
                          <p className="text-[#b9cacb] font-mono text-[11px] leading-relaxed">
                            "Camila Fernandes apresenta leve dor patelar esquerda crônica. A tonelagem de treino de quadríceps atingiu 140% do seu MEV histórico com RPE constante de 10. O sono abaixo de 6 horas reduz a taxa de síntese e restauro colágeno. Há alto risco de tendinite patelar aguda se o volume de agachamento/leg press não for reduzido temporariamente."
                          </p>
                        </div>

                        <div className="flex justify-end gap-2 pt-1">
                          <button
                            onClick={() => {
                              // Dynamically perform a real Deload on Camila's active training session!
                              const camilaId = "stud-seeded-camila";
                              const camilaWorkout = workouts.find(w => w.studentId === camilaId);
                              if (camilaWorkout && onSaveWorkout) {
                                const updatedExercises = camilaWorkout.exercises.map(ex => {
                                  if (typeof ex.weight === 'number' && ex.weight > 0) {
                                    const newVal = Math.round(ex.weight * 0.9);
                                    return { ...ex, weight: newVal, notes: `${ex.notes || ""} [Deload IA -10% aplicado]` };
                                  }
                                  return ex;
                                });
                                onSaveWorkout(camilaId, camilaWorkout.name, updatedExercises);
                              }
                              setAppliedDeloads([...appliedDeloads, "camila-deload"]);
                              setCopilotSuccess("Deload de Volume aplicado com sucesso! A ficha de Camila Fernandes foi atualizada com redução de 10% na tonelagem.");
                            }}
                            className="bg-yellow-500 hover:bg-yellow-600 text-[#002022] font-mono text-xs font-bold px-4 py-2 rounded-lg flex items-center gap-2 shadow-[0_0_15px_rgba(234,179,8,0.2)] transition-all cursor-pointer"
                          >
                            <Sparkles className="w-4 h-4" /> Prescrever Deload IA (-10% Volume)
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* --- 🟢 CATEGORY 3: RECORDES BATIDOS --- */}
                {selectedCopilotCategory === "recordes" && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-emerald-400">
                      <TrendingUp className="w-5 h-5" />
                      <h4 className="font-extrabold text-sm uppercase tracking-wide font-mono">Motor de Força: Recordes Históricos (PRs) Batidos</h4>
                    </div>
                    <p className="text-xs text-[#b9cacb]">
                      Registra e isola incrementos de carga ou repetições para comemorar marcos com o aluno e impulsionar a dopamina.
                    </p>
                    
                    <div className="bg-[#1b1c1e] p-4 rounded-xl border border-[#3a494b]/25 space-y-4">
                      <div className="flex flex-col sm:flex-row justify-between gap-4 items-start sm:items-center">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center font-bold text-emerald-400">
                            GS
                          </div>
                          <div>
                            <h5 className="font-bold text-xs text-white">Gustavo Silva</h5>
                            <p className="text-[10px] text-[#b9cacb] font-mono">Plano Elite Performance • Fase: Hipertrofia Máxima</p>
                          </div>
                        </div>
                        <span className="text-[10px] font-mono bg-emerald-500/15 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/25">
                          Leg Press 45º: 220kg (+20kg)
                        </span>
                      </div>
                      
                      <div className="bg-[#121315] p-3 rounded border border-emerald-500/10 text-xs space-y-1.5">
                        <span className="font-mono text-[9px] text-[#00f2ff] uppercase font-bold tracking-wider block">REGISTRO DE RECORDES IA:</span>
                        <p className="text-[#b9cacb] font-mono text-[11px] leading-relaxed">
                          "Gustavo Silva executou ontem 4 séries de 10 repetições com 220kg no Leg Press 45º. O RPE foi registrado como 8, sugerindo que a velocidade concêntrica permaneceu alta. Essa é a maior carga histórica do aluno no exercício (+10% de ganho de força absoluta em 15 dias)."
                        </p>
                      </div>

                      <div className="flex justify-end gap-2 pt-1">
                        <button
                          onClick={() => {
                            onGenerateMessage(
                              "Gustavo Silva",
                              "Parabenização pelo novo recorde (PR) histórico de 220kg batido no Leg Press 45º.",
                              "Elite Performance",
                              "Hipertrofia Máxima"
                            );
                            setCopilotSuccess("Parabenização IA gerada com sucesso! Envie agora para o WhatsApp de Gustavo Silva.");
                          }}
                          className="bg-emerald-500 hover:bg-emerald-600 text-white font-mono text-xs font-bold px-4 py-2 rounded-lg flex items-center gap-2 shadow-[0_0_15px_rgba(34,197,94,0.2)] transition-all cursor-pointer"
                        >
                          <Sparkles className="w-4 h-4" /> Enviar Parabéns IA pelo Recorde
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* --- 📈 CATEGORY 4: QUEM EVOLUIU ESTA SEMANA --- */}
                {selectedCopilotCategory === "evolucao" && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-blue-400">
                      <TrendingUp className="w-5 h-5" />
                      <h4 className="font-extrabold text-sm uppercase tracking-wide font-mono">Motor de Evolução: Alunos em Evolução Acelerada</h4>
                    </div>
                    <p className="text-xs text-[#b9cacb]">
                      Analisa a reavaliação física e antropométrica comparativa para extrair o saldo metabólico preciso.
                    </p>
                    
                    <div className="bg-[#1b1c1e] p-4 rounded-xl border border-[#3a494b]/25 space-y-4">
                      <div className="flex flex-col sm:flex-row justify-between gap-4 items-start sm:items-center">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-blue-500/10 border border-blue-500/30 flex items-center justify-center font-bold text-blue-400">
                            GS
                          </div>
                          <div>
                            <h5 className="font-bold text-xs text-white">Gustavo Silva</h5>
                            <p className="text-[10px] text-[#b9cacb] font-mono">Plano Elite Performance • Evolução Física • Intervalo: 30 dias</p>
                          </div>
                        </div>
                        <span className="text-[10px] font-mono bg-blue-500/15 text-blue-400 px-2 py-0.5 rounded border border-blue-500/25">
                          -1.5% Gordura • +1.2kg Massa Magra
                        </span>
                      </div>
                      
                      <div className="bg-[#121315] p-3 rounded border border-blue-500/10 text-xs space-y-1.5">
                        <span className="font-mono text-[9px] text-[#00f2ff] uppercase font-bold tracking-wider block">ANÁLISE COMPARATIVA DE COMPOSIÇÃO:</span>
                        <p className="text-[#b9cacb] font-mono text-[11px] leading-relaxed">
                          "O Motor de Evolução identificou uma excelente taxa de recomposição corporal: redução de 1.5% de BF concomitante ao ganho de 1.2kg de massa magra livre de gordura. O rácio de ganho é de 0.8:1 (excelente eficiência metabólica). O planejamento nutricional de 3200 kcal está com excelente consistência calórica."
                        </p>
                      </div>

                      <div className="flex justify-end gap-2 pt-1">
                        <button
                          onClick={() => {
                            onGenerateMessage(
                              "Gustavo Silva",
                              "Envio de Relatório de Evolução Corporal: redução de 1.5% BF e ganho de 1.2kg massa magra com parabéns pela consistência na dieta.",
                              "Elite Performance",
                              "Hipertrofia Máxima"
                            );
                            setCopilotSuccess("Relatório de evolução estruturado gerado via IA!");
                          }}
                          className="bg-blue-500 hover:bg-blue-600 text-white font-mono text-xs font-bold px-4 py-2 rounded-lg flex items-center gap-2 shadow-[0_0_15px_rgba(59,130,246,0.2)] transition-all cursor-pointer"
                        >
                          <Sparkles className="w-4 h-4" /> Gerar Relatório de Evolução IA
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* --- 📉 CATEGORY 5: ESTAGNADOS --- */}
                {selectedCopilotCategory === "estagnado" && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-purple-400">
                      <TrendingDown className="w-5 h-5" />
                      <h4 className="font-extrabold text-sm uppercase tracking-wide font-mono">Motor de Biomecânica: Alunos Estagnados (Platô de Carga)</h4>
                    </div>
                    <p className="text-xs text-[#b9cacb]">
                      Rastreia platôs de carga (onde o aluno não consegue aumentar o volume nem peso há 4 treinos consecutivos). Sugere técnicas avançadas automáticas.
                    </p>

                    {appliedTechniques.includes("ricardo-rest") ? (
                      <div className="p-8 text-center bg-[#1b1c1e] rounded-xl border border-[#3a494b]/20">
                        <p className="text-xs text-emerald-400 font-mono">✓ Técnica {selectedTechnique} aplicada com sucesso ao treino de Ricardo Oliveira!</p>
                      </div>
                    ) : (
                      <div className="bg-[#1b1c1e] p-4 rounded-xl border border-[#3a494b]/25 space-y-4">
                        <div className="flex flex-col sm:flex-row justify-between gap-4 items-start sm:items-center">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-purple-500/10 border border-purple-500/30 flex items-center justify-center font-bold text-purple-400">
                              RO
                            </div>
                            <div>
                              <h5 className="font-bold text-xs text-white">Ricardo Oliveira</h5>
                              <p className="text-[10px] text-[#b9cacb] font-mono">Plano Mensal • Fase: Força Máxima • Estagnação: <span className="text-purple-400 font-bold">4 semanas</span></p>
                            </div>
                          </div>
                          <span className="text-[10px] font-mono bg-purple-500/15 text-purple-400 px-2 py-0.5 rounded border border-purple-500/25">
                            Supino Reto: 80kg (Travado)
                          </span>
                        </div>
                        
                        <div className="bg-[#121315] p-3 rounded border border-purple-500/10 text-xs space-y-1.5">
                          <span className="font-mono text-[9px] text-[#00f2ff] uppercase font-bold tracking-wider block">ANÁLISE DE PLATÔ NEUROMUSCULAR:</span>
                          <p className="text-[#b9cacb] font-mono text-[11px] leading-relaxed">
                            "Ricardo Oliveira está travado na carga de 80kg no Supino Reto para 6 repetições nas últimas 4 semanas. A taxa de recrutamento de unidades motoras atingiu platô adaptativo. O Motor de Biomecânica sugere introduzir uma técnica avançada para chocar o sistema neuromuscular."
                          </p>
                        </div>

                        {/* Seletor de Técnica Avançada */}
                        <div className="flex flex-col gap-2 bg-[#121315] p-3 rounded border border-[#3a494b]/20">
                          <label className="text-xs font-bold text-[#e3e2e4] flex items-center gap-1.5">
                            <Sparkles className="w-4 h-4 text-purple-400" />
                            <span>Escolha a Técnica Avançada a aplicar:</span>
                          </label>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-1">
                            {[
                              { id: "Rest-Pause", name: "Rest-Pause", desc: "Série até a falha, 15s descanso, repete" },
                              { id: "Drop-set", name: "Drop-set", desc: "Reduz 20-30% carga pós-falha e repete" },
                              { id: "Bi-set", name: "Bi-set", desc: "Dois exercícios conjugados sem descanso" },
                              { id: "FST-7", name: "FST-7", desc: "7 séries com 30s de descanso focado em fáscia" },
                              { id: "Ponto Zero", name: "Ponto Zero", desc: "Isometria de 1 a 2s na transição concêntrica" },
                              { id: "Super-série", name: "Super-série", desc: "Agrupamento antagonista ou sinergista" },
                              { id: "Cluster Set", name: "Cluster Set", desc: "Pequenas pausas intrasérie de 10-15s" },
                              { id: "SST", name: "SST", desc: "Estímulo de sarcoplasma com cargas regressivas" }
                            ].map((tech) => (
                              <button
                                key={tech.id}
                                type="button"
                                onClick={() => setSelectedTechnique(tech.id)}
                                className={`p-2 rounded-lg border text-left transition-all ${
                                  selectedTechnique === tech.id
                                    ? "bg-purple-500/25 border-purple-500 text-purple-300 shadow-[0_0_10px_rgba(168,85,247,0.15)]"
                                    : "bg-[#161719] border-[#3a494b]/30 hover:border-purple-500/50 text-[#b9cacb] hover:bg-[#1b1c1e]"
                                }`}
                              >
                                <span className="text-xs font-bold block">{tech.name}</span>
                                <span className="text-[9px] text-[#b9cacb] block leading-tight mt-0.5">{tech.desc}</span>
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="flex justify-end gap-2 pt-1">
                          <button
                            onClick={() => {
                              // Dynamically inject selectedTechnique into Ricardo's training
                              const ricardoId = "stud-seeded-ricardo";
                              const ricardoWorkout = workouts.find(w => w.studentId === ricardoId);
                              if (ricardoWorkout && onSaveWorkout) {
                                const updatedExercises = ricardoWorkout.exercises.map((ex, idx) => {
                                  if (idx === 0) {
                                    return { ...ex, advancedTechnique: selectedTechnique, notes: `${ex.notes || ""} [Técnica ${selectedTechnique} IA ativada para quebrar platô]` };
                                  }
                                  return ex;
                                });
                                onSaveWorkout(ricardoId, ricardoWorkout.name, updatedExercises);
                              }
                              setAppliedTechniques([...appliedTechniques, "ricardo-rest"]);
                              setCopilotSuccess(`Técnica ${selectedTechnique} aplicada com sucesso ao Supino Reto de Ricardo Oliveira na base de dados!`);
                            }}
                            className="bg-purple-500 hover:bg-purple-600 text-white font-mono text-xs font-bold px-4 py-2 rounded-lg flex items-center gap-2 shadow-[0_0_15px_rgba(168,85,247,0.2)] transition-all cursor-pointer"
                          >
                            <Sparkles className="w-4 h-4" /> Aplicar Técnica {selectedTechnique} IA
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* --- 💬 CATEGORY 6: MENSAGENS PENDENTES --- */}
                {selectedCopilotCategory === "mensagens" && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-cyan-400">
                      <Mail className="w-5 h-5" />
                      <h4 className="font-extrabold text-sm uppercase tracking-wide font-mono">Dúvidas Recebidas (Triagem IA Ativa)</h4>
                    </div>
                    <p className="text-xs text-[#b9cacb]">
                      Perguntas enviadas pelos alunos. A Inteligência Artificial analisa biomecanicamente a dúvida e sugere a resposta ideal para você aprovar em 1 clique.
                    </p>

                    <div className="space-y-3">
                      {copilotMessages.filter(m => !m.answered).length === 0 ? (
                        <div className="p-8 text-center bg-[#1b1c1e] rounded-xl border border-[#3a494b]/20">
                          <p className="text-xs text-emerald-400 font-mono">✓ Todas as mensagens de alunos respondidas com sucesso!</p>
                        </div>
                      ) : (
                        copilotMessages.filter(m => !m.answered).map(msg => (
                          <div key={msg.id} className="bg-[#1b1c1e] p-4 rounded-xl border border-[#3a494b]/20 space-y-3">
                            <div className="flex justify-between items-center border-b border-[#3a494b]/15 pb-2">
                              <span className="text-xs font-bold text-[#e3e2e4]">{msg.name}</span>
                              <span className="text-[9px] font-mono text-cyan-400 bg-cyan-500/10 px-1.5 py-0.5 rounded">Sugestão de Resposta IA Pronta</span>
                            </div>
                            <div className="text-xs space-y-1 text-[#b9cacb]">
                              <p className="italic bg-[#121315] p-2.5 rounded border border-[#3a494b]/10 text-[11px] font-mono">"{msg.message}"</p>
                            </div>
                            <div className="bg-[#121315] p-3 rounded border border-cyan-500/20 text-xs space-y-1.5 font-mono">
                              <span className="text-[9px] text-[#00f2ff] font-bold block uppercase tracking-wider">RESPOSTA COPILOT IA SUGERIDA:</span>
                              <p className="text-[#00f2ff] text-[11px] leading-relaxed">"{msg.aiReply}"</p>
                            </div>
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() => {
                                  // Mark as answered
                                  setCopilotMessages(copilotMessages.map(m => m.id === msg.id ? { ...m, answered: true } : m));
                                  setCopilotSuccess(`Resposta IA para ${msg.name} enviada e confirmada!`);
                                }}
                                className="bg-cyan-500 hover:bg-cyan-600 text-[#002022] font-mono text-[11px] font-bold px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer"
                              >
                                <CheckCircle className="w-4 h-4" /> Aprovar e Responder via WhatsApp
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}

                {/* --- 📷 CATEGORY 7: AVALIAÇÕES POSTURAIS --- */}
                {selectedCopilotCategory === "fotos" && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-pink-400">
                      <Activity className="w-5 h-5" />
                      <h4 className="font-extrabold text-sm uppercase tracking-wide font-mono">Motor de Postura: Fotos de Avaliação Aguardando Laudo</h4>
                    </div>
                    <p className="text-xs text-[#b9cacb]">
                      Fotos enviadas para reavaliação física periódica. O motor de visão computacional analisa os landmarks de postura para gerar o laudo corretivo.
                    </p>

                    {completedLaudos.includes("camila-postura") ? (
                      <div className="p-8 text-center bg-[#1b1c1e] rounded-xl border border-[#3a494b]/20 space-y-4">
                        <p className="text-xs text-emerald-400 font-mono">✓ Laudo Postural emitido e integrado ao perfil de Camila Fernandes!</p>
                        
                        <div className="bg-[#121315] p-4 rounded-lg text-left border border-emerald-500/30 space-y-3 font-mono text-xs">
                          <h5 className="font-bold text-[#e3e2e4] border-b border-white/10 pb-1 flex items-center justify-between">
                            <span>LAUDO POSTURAL CONCLUÍDO</span>
                            <span className="text-[10px] text-emerald-400">EMITIDO</span>
                          </h5>
                          <div className="grid grid-cols-2 gap-4 text-[11px] text-[#b9cacb]">
                            <div>
                              <span className="text-[9px] block text-white uppercase">Cervical (Ângulo):</span>
                              <span className="font-bold text-white">12.5º (Leve anteriorização)</span>
                            </div>
                            <div>
                              <span className="text-[9px] block text-white uppercase">Simetria de Ombros:</span>
                              <span className="font-bold text-red-400">Ombro direito elevado (+1.8cm)</span>
                            </div>
                            <div className="col-span-2 pt-2 border-t border-white/5">
                              <span className="text-[9px] block text-[#00f2ff] uppercase font-bold">RECOMENDAÇÃO DE EXERCÍCIOS CORRETIVOS IA:</span>
                              <p className="text-[#00f2ff] text-[10px] mt-1 leading-relaxed">
                                1. Alongamento de Trapézio Superior Esquerdo (3x30s)<br />
                                2. Remada Unilateral com foco na depressão escapular direita (3x12)<br />
                                3. Y-Raise com halteres leves para fortalecimento de trapézio inferior (3x15)
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-[#1b1c1e] p-4 rounded-xl border border-[#3a494b]/25 space-y-4">
                        <div className="flex flex-col sm:flex-row justify-between gap-4 items-start sm:items-center">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-pink-500/10 border border-pink-500/30 flex items-center justify-center font-bold text-pink-400">
                              CF
                            </div>
                            <div>
                              <h5 className="font-bold text-xs text-white">Camila Fernandes</h5>
                              <p className="text-[10px] text-[#b9cacb] font-mono">Reavaliação Postural • Plano Frontal (Anterior) • Enviado Hoje</p>
                            </div>
                          </div>
                          <span className="text-[10px] font-mono bg-pink-500/15 text-pink-400 px-2 py-0.5 rounded border border-pink-500/25">
                            Aguardando Análise
                          </span>
                        </div>
                        
                        {/* Interactive wireframe mockup simulating computer vision */}
                        <div className="relative aspect-video max-w-md mx-auto bg-[#121315] border border-[#3a494b]/30 rounded-lg overflow-hidden flex items-center justify-center">
                          <div className="absolute inset-0 bg-[radial-gradient(#3a494b_1px,transparent_1px)] [background-size:16px_16px] opacity-20" />
                          
                          {/* Skeleton bones wireframe overlay */}
                          <div className="relative z-10 w-44 h-52 border border-dashed border-[#00f2ff]/40 rounded-full flex flex-col items-center justify-center">
                            {/* Landmarks */}
                            <div className="absolute top-10 w-2.5 h-2.5 rounded-full bg-pink-500 animate-ping" />
                            <div className="absolute top-10 w-2 h-2 rounded-full bg-pink-500" /> {/* Cervical */}
                            
                            <div className="absolute top-16 left-12 w-2 h-2 rounded-full bg-[#00f2ff]" /> {/* Left shoulder */}
                            <div className="absolute top-18 right-12 w-2 h-2 rounded-full bg-red-400 animate-pulse" /> {/* Right shoulder (Higher!) */}
                            
                            {/* Line connecting shoulders */}
                            <div className="absolute top-17 left-13 right-13 h-[1.5px] bg-red-400 -rotate-3" />
                            
                            <div className="absolute top-28 left-14 w-2 h-2 rounded-full bg-[#00f2ff]" /> {/* Hip L */}
                            <div className="absolute top-28 right-14 w-2 h-2 rounded-full bg-[#00f2ff]" /> {/* Hip R */}
                            <div className="absolute top-28 left-15 right-15 h-[1.5px] bg-[#00f2ff]" />
                            
                            <span className="text-[9px] font-mono text-[#00f2ff] bg-[#121315]/90 border border-[#00f2ff]/20 px-1.5 py-0.5 rounded absolute bottom-4">
                              DESVIO DETECTADO: OMBRO DIREITO +1.8cm
                            </span>
                          </div>
                        </div>

                        <div className="flex justify-end gap-2 pt-1">
                          <button
                            onClick={() => {
                              setCompletedLaudos([...completedLaudos, "camila-postura"]);
                              setCopilotSuccess("Laudo Postural gerado com sucesso! Foram prescritos exercícios corretivos para a depressão de trapézio direito.");
                            }}
                            className="bg-pink-500 hover:bg-pink-600 text-white font-mono text-xs font-bold px-4 py-2 rounded-lg flex items-center gap-2 shadow-[0_0_15px_rgba(236,72,153,0.2)] transition-all cursor-pointer"
                          >
                            <Sparkles className="w-4 h-4" /> Interpretar Postura IA & Gerar Laudo
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* --- 🏆 CATEGORY 8: MAIOR FREQUÊNCIA --- */}
                {selectedCopilotCategory === "frequencia" && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-orange-400">
                      <TrendingUp className="w-5 h-5" />
                      <h4 className="font-extrabold text-sm uppercase tracking-wide font-mono">Motor de Consistência: Atletas Frequência de Elite (100%)</h4>
                    </div>
                    <p className="text-xs text-[#b9cacb]">
                      Alunos com adesão perfeita. Valorizar e blindar a motivação desses alunos garante retenção de longo prazo.
                    </p>
                    
                    <div className="bg-[#1b1c1e] p-4 rounded-xl border border-[#3a494b]/25 space-y-4">
                      <div className="flex flex-col sm:flex-row justify-between gap-4 items-start sm:items-center">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-orange-500/10 border border-orange-500/30 flex items-center justify-center font-bold text-orange-400">
                            GS
                          </div>
                          <div>
                            <h5 className="font-bold text-xs text-white">Gustavo Silva</h5>
                            <p className="text-[10px] text-[#b9cacb] font-mono">Plano Elite Performance • Presença na Semana: <span className="text-emerald-400 font-bold">100%</span></p>
                          </div>
                        </div>
                        <span className="text-[10px] font-mono bg-orange-500/15 text-orange-400 px-2 py-0.5 rounded border border-orange-500/25">
                          Streak: 15 treinos seguidos
                        </span>
                      </div>

                      <div className="flex justify-end gap-2 pt-1">
                        <button
                          onClick={() => {
                            onGenerateMessage(
                              "Gustavo Silva",
                              "Mensagem de elogio pela consistência perfeita de 100% de frequência de treino nas últimas semanas.",
                              "Elite Performance",
                              "Hipertrofia Máxima"
                            );
                            setCopilotSuccess("Elogio à consistência gerado via IA com sucesso!");
                          }}
                          className="bg-orange-500 hover:bg-orange-600 text-[#002022] font-mono text-xs font-bold px-4 py-2 rounded-lg flex items-center gap-2 shadow-[0_0_15px_rgba(249,115,22,0.2)] transition-all cursor-pointer"
                        >
                          <Sparkles className="w-4 h-4" /> Enviar Incentivo IA pela Consistência
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* --- 📆 CATEGORY 9: AVALIAÇÕES HOJE --- */}
                {selectedCopilotCategory === "avaliacoes" && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-teal-400">
                      <CalendarDays className="w-5 h-5" />
                      <h4 className="font-extrabold text-sm uppercase tracking-wide font-mono">Motor de Avaliação: Agenda de Avaliações Físicas Periódicas</h4>
                    </div>
                    <p className="text-xs text-[#b9cacb]">
                      Agenda de atualizações cadastrais necessárias para manter a dieta e a periodização corretas de acordo com a composição corporal atualizada.
                    </p>
                    
                    <div className="bg-[#1b1c1e] p-4 rounded-xl border border-[#3a494b]/25 space-y-4">
                      <div className="flex flex-col sm:flex-row justify-between gap-4 items-start sm:items-center">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-teal-500/10 border border-teal-500/30 flex items-center justify-center font-bold text-teal-400">
                            JS
                          </div>
                          <div>
                            <h5 className="font-bold text-xs text-white">Juliana Santos</h5>
                            <p className="text-[10px] text-[#b9cacb] font-mono">Plano Semestral • Faltando: <span className="text-teal-400 font-bold">Avaliação Inicial</span></p>
                          </div>
                        </div>
                        <span className="text-[10px] font-mono bg-teal-500/15 text-teal-400 px-2 py-0.5 rounded border border-teal-500/25">
                          Pendente há 3 dias
                        </span>
                      </div>

                      <div className="flex justify-end gap-2 pt-1">
                        <button
                          onClick={() => {
                            onGenerateMessage(
                              "Juliana Santos",
                              "Solicitação de fotos e dados para realizar a primeira Avaliação Corporal do plano semestral.",
                              "Semestral",
                              "Fase Adaptativa"
                            );
                            setCopilotSuccess("Solicitação de avaliação gerada via IA!");
                          }}
                          className="bg-teal-500 hover:bg-teal-600 text-white font-mono text-xs font-bold px-4 py-2 rounded-lg flex items-center gap-2 shadow-[0_0_15px_rgba(20,184,166,0.2)] transition-all cursor-pointer"
                        >
                          <Sparkles className="w-4 h-4" /> Solicitar Fotos e Medidas via IA
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* --- 🎯 CATEGORY 10: PROGRESSÃO DE CARGA --- */}
                {selectedCopilotCategory === "progressao" && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-[#10b981]">
                      <Dumbbell className="w-5 h-5" />
                      <h4 className="font-extrabold text-sm uppercase tracking-wide font-mono">Motor de Progressão de Carga: Ajuste de Sobrecarga Progressiva</h4>
                    </div>
                    <p className="text-xs text-[#b9cacb]">
                      O algoritmo analisa a facilidade percebida (RPE) e o cumprimento de todas as repetições de um exercício para sugerir incrementos matemáticos exatos de carga.
                    </p>

                    {confirmedProgressions.includes("gustavo-prog") ? (
                      <div className="p-8 text-center bg-[#1b1c1e] rounded-xl border border-[#3a494b]/20">
                        <p className="text-xs text-emerald-400 font-mono">✓ Cargas atualizadas com sucesso na ficha do aluno! Novas cargas ativas.</p>
                      </div>
                    ) : (
                      <div className="bg-[#1b1c1e] p-4 rounded-xl border border-[#3a494b]/25 space-y-4">
                        <div className="flex flex-col sm:flex-row justify-between gap-4 items-start sm:items-center">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center font-bold text-[#10b981]">
                              GS
                            </div>
                            <div>
                              <h5 className="font-bold text-xs text-white">Gustavo Silva</h5>
                              <p className="text-[10px] text-[#b9cacb] font-mono">Plano Elite Performance • Fase: Hipertrofia Máxima</p>
                            </div>
                          </div>
                          <span className="text-[10px] font-mono bg-emerald-500/15 text-emerald-400 px-2 py-0.5 rounded border border-[#10b981]/25">
                            Leg Press: +10kg • Supino: +5kg
                          </span>
                        </div>
                        
                        <div className="bg-[#121315] p-3 rounded border border-emerald-500/10 text-xs space-y-1.5">
                          <span className="font-mono text-[9px] text-[#00f2ff] uppercase font-bold tracking-wider block">RECOMENDAÇÃO AUTOMÁTICA DE PROGRESSÃO:</span>
                          <div className="text-[#b9cacb] font-mono text-[11px] space-y-1">
                            <p>"Gustavo Silva completou a meta de 4x10 com 200kg no Leg Press 45º registrando RPE 7. O Motor de Progressão sugere aumentar para **210kg (+5%)**."</p>
                            <p>"No Supino Reto, completou 4x8 com 80kg registrando RPE 7.5. O Motor de Progressão sugere aumentar para **85kg (+6.2%)**."</p>
                          </div>
                        </div>

                        <div className="flex justify-end gap-2 pt-1">
                          <button
                            onClick={() => {
                              // Perform real load progression update!
                              const gustavoId = "stud-seeded-gustavo";
                              const gustavoWorkout = workouts.find(w => w.studentId === gustavoId);
                              
                              // Check if a workout exists, otherwise create a default one
                              const exercisesToSave: Exercise[] = gustavoWorkout?.exercises || [
                                { id: "ex-1", name: "Supino Reto", sets: 4, reps: "8", weight: 80, advancedTechnique: "" },
                                { id: "ex-2", name: "Leg Press 45º", sets: 4, reps: "10", weight: 200, advancedTechnique: "" },
                                { id: "ex-3", name: "Puxada Alta", sets: 4, reps: "10", weight: 70, advancedTechnique: "" }
                              ];

                              const updatedExercises = exercisesToSave.map(ex => {
                                if (ex.name === "Supino Reto") {
                                  return { ...ex, weight: 85, notes: "Progresso automático IA (+5kg)" };
                                }
                                if (ex.name === "Leg Press 45º") {
                                  return { ...ex, weight: 210, notes: "Progresso automático IA (+10kg)" };
                                }
                                return ex;
                              });

                              if (onSaveWorkout) {
                                onSaveWorkout(gustavoId, gustavoWorkout?.name || "Ficha A - Hipertrofia Elite", updatedExercises);
                              }

                              setConfirmedProgressions([...confirmedProgressions, "gustavo-prog"]);
                              setCopilotSuccess("Progressão de carga confirmada e salva! Supino Reto ajustado para 85kg e Leg Press ajustado para 210kg na ficha de Gustavo Silva.");
                            }}
                            className="bg-emerald-500 hover:bg-emerald-600 text-white font-mono text-xs font-bold px-4 py-2 rounded-lg flex items-center gap-2 shadow-[0_0_15px_rgba(16,185,129,0.2)] transition-all cursor-pointer"
                          >
                            <Sparkles className="w-4 h-4" /> Confirmar e Aplicar Progressões IA
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

              </div>
            )}
          </section>

          {/* Bento Grid KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            
            {/* Card 1: Alunos Ativos */}
            <div 
              onClick={() => handleOpenSection("alunos_ativos")}
              className="glass-panel p-5 rounded-xl border-l-4 border-[#00f2ff] relative group overflow-hidden cursor-pointer hover:bg-[#1f2022]/80 transition-all hover:scale-[1.02] shadow-[0_4px_20px_rgba(0,0,0,0.15)] focus-within:ring-2 focus-within:ring-[#00f2ff]/30 outline-none"
            >
              <div className="absolute -right-4 -top-4 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity">
                <Users className="w-24 h-24 text-white" />
              </div>
              <p className="font-mono text-[10px] text-[#b9cacb] font-semibold tracking-wider uppercase mb-1 flex justify-between items-center">
                <span>ALUNOS ATIVOS</span>
                <span className="text-[#00f2ff] flex items-center gap-0.5 text-[9px] font-bold bg-[#00f2ff]/10 px-1.5 py-0.5 rounded-full">
                  +12.4%
                </span>
              </p>
              <div className="flex items-center justify-between mt-2">
                <div className="flex items-baseline gap-2">
                  <h3 className="font-mono text-4xl font-extrabold text-[#e3e2e4]">{activeStudentsCount}</h3>
                  <span className="text-[#00dbe7] font-mono text-[10px] font-semibold bg-[#00f2ff]/5 px-1.5 py-0.5 rounded">
                    de {totalStudentsCount}
                  </span>
                </div>
                <div className="shrink-0 pr-1">
                  <svg className="w-16 h-8 opacity-80" viewBox="0 0 100 30" aria-hidden="true">
                    <path d="M0,25 Q15,10 30,22 T60,5 T90,8 T100,2" fill="none" stroke="#00f2ff" strokeWidth="2.5" strokeLinecap="round" />
                  </svg>
                </div>
              </div>
              <p className="text-[10px] font-mono text-[#b9cacb] mt-3">
                {activePercentage}% ativos | {inactiveStudentsCount} inativos | {pendingRenewalCount} pendentes
              </p>
            </div>

            {/* Card 2: Vencimentos */}
            <div 
              onClick={() => handleOpenSection("vencimentos")}
              className="glass-panel p-5 rounded-xl border-l-4 border-amber-500 relative group overflow-hidden cursor-pointer hover:bg-[#1f2022]/80 transition-all hover:scale-[1.02] shadow-[0_4px_20px_rgba(0,0,0,0.15)] focus-within:ring-2 focus-within:ring-amber-500/30 outline-none"
            >
              <div className="absolute -right-4 -top-4 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity">
                <CreditCard className="w-24 h-24 text-white" />
              </div>
              <p className="font-mono text-[10px] text-[#b9cacb] font-semibold tracking-wider uppercase mb-1 flex justify-between items-center">
                <span>VENCIMENTOS</span>
                <span className="text-amber-400 flex items-center gap-0.5 text-[9px] font-bold bg-amber-500/10 px-1.5 py-0.5 rounded-full">
                  -3.1%
                </span>
              </p>
              <div className="flex items-center justify-between mt-2">
                <div className="flex items-baseline gap-2">
                  <h3 className="font-mono text-4xl font-extrabold text-amber-400">{overduePayments.length}</h3>
                  <span className="text-red-400 font-mono text-[10px] font-semibold">Atrasados</span>
                </div>
                <div className="shrink-0 pr-1">
                  <svg className="w-16 h-8 opacity-80" viewBox="0 0 100 30" aria-hidden="true">
                    <path d="M0,15 Q20,25 40,8 T80,22 T100,10" fill="none" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" />
                  </svg>
                </div>
              </div>
              <p className="text-[10px] font-mono text-[#b9cacb] mt-3 truncate">
                {dueSoonPayments.length} vencendo na semana | Taxa: {delinquencyRate}%
              </p>
            </div>

            {/* Card 3: Faturamento */}
            <div 
              onClick={() => handleOpenSection("faturamento")}
              className="glass-panel p-5 rounded-xl border-l-4 border-emerald-500 relative group overflow-hidden cursor-pointer hover:bg-[#1f2022]/80 transition-all hover:scale-[1.02] shadow-[0_4px_20px_rgba(0,0,0,0.15)] focus-within:ring-2 focus-within:ring-emerald-500/30 outline-none"
            >
              <div className="absolute -right-4 -top-4 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity">
                <TrendingUp className="w-24 h-24 text-white" />
              </div>
              <p className="font-mono text-[10px] text-[#b9cacb] font-semibold tracking-wider uppercase mb-1 flex justify-between items-center">
                <span>FATURAMENTO</span>
                <span className="text-emerald-400 flex items-center gap-0.5 text-[9px] font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded-full">
                  +18.7%
                </span>
              </p>
              <div className="flex items-center justify-between mt-2">
                <div className="flex items-baseline gap-1">
                  <h3 className="font-mono text-2xl xl:text-3xl font-extrabold text-emerald-400">{formatCurrency(faturamentoRealizado)}</h3>
                </div>
                <div className="shrink-0 pr-1">
                  <svg className="w-16 h-8 opacity-80" viewBox="0 0 100 30" aria-hidden="true">
                    <path d="M0,28 Q10,25 25,20 T50,15 T75,8 T100,2" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" />
                  </svg>
                </div>
              </div>
              <p className="text-[10px] font-mono text-[#b9cacb] mt-3">
                Previsto: {formatCurrency(faturamentoPrevisto)} | Pendente: {formatCurrency(faturamentoPendente)}
              </p>
            </div>

            {/* Card 4: Fichas e Avaliações */}
            <div 
              onClick={() => handleOpenSection("status_fichas_avaliacoes")}
              className="glass-panel p-5 rounded-xl border-l-4 border-purple-500 relative group overflow-hidden cursor-pointer hover:bg-[#1f2022]/80 transition-all hover:scale-[1.02] shadow-[0_4px_20px_rgba(0,0,0,0.15)] focus-within:ring-2 focus-within:ring-purple-500/30 outline-none"
            >
              <div className="absolute -right-4 -top-4 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity">
                <Flame className="w-24 h-24 text-white" />
              </div>
              <p className="font-mono text-[10px] text-[#b9cacb] font-semibold tracking-wider uppercase mb-1 flex justify-between items-center">
                <span>FICHAS & AVALIAÇÕES</span>
                <span className="text-purple-400 flex items-center gap-0.5 text-[9px] font-bold bg-purple-500/10 px-1.5 py-0.5 rounded-full">
                  Auto
                </span>
              </p>
              <div className="flex items-center justify-between mt-2">
                <div className="flex items-baseline gap-2">
                  <h3 className="font-mono text-4xl font-extrabold text-purple-400">{totalAlertsCount}</h3>
                  <span className="text-[#ebb2ff] font-mono text-[10px]">Alertas</span>
                </div>
                <div className="shrink-0 pr-1">
                  <svg className="w-16 h-8 opacity-80" viewBox="0 0 100 30" aria-hidden="true">
                    <path d="M0,5 L20,25 L40,10 L60,20 L80,5 L100,25" fill="none" stroke="#a855f7" strokeWidth="2.5" strokeLinecap="round" />
                  </svg>
                </div>
              </div>
              <p className="text-[10px] font-mono text-[#b9cacb] mt-3 truncate">
                {expiredAssessmentsStudents.length} aval. expiradas | {expiredWorkoutsStudents.length} treinos vencidos
              </p>
            </div>

          </div>

          {/* Core Dashboard Insights */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Recommendations Section */}
            <div className="lg:col-span-2 glass-panel rounded-xl overflow-hidden flex flex-col">
              <div className="p-5 border-b border-[#3a494b]/30 flex justify-between items-center bg-[#1f2022]/40">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded bg-[#ccff00]/20 flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-[#ebb2ff]" />
                  </div>
                  <h3 className="text-lg font-bold text-[#e3e2e4]">Ações Recomendadas via Inteligência Artificial</h3>
                </div>
                <span className="text-[9px] font-mono font-bold text-[#00f2ff] bg-[#00f2ff]/5 border border-[#00f2ff]/20 px-3 py-1 rounded-full uppercase tracking-wider">
                  IA ATIVA
                </span>
              </div>

              <div className="overflow-x-auto flex-1">
                <table className="w-full text-left font-mono text-xs">
                  <thead className="bg-[#292a2c]/60 text-[#b9cacb] border-b border-[#3a494b]/20">
                    <tr>
                      <th className="px-6 py-3.5 font-semibold tracking-wider">ALUNO</th>
                      <th className="px-6 py-3.5 font-semibold tracking-wider">MOTIVO / CONTEXTO</th>
                      <th className="px-6 py-3.5 font-semibold tracking-wider">MÓDULO</th>
                      <th className="px-6 py-3.5 font-semibold tracking-wider text-right">AÇÃO</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#3a494b]/10 bg-[#121315]/20">
                    
                    {recommendedActions.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-6 py-10 text-center text-[#b9cacb]">
                          <div className="flex flex-col items-center justify-center gap-2">
                            <CheckCircle className="w-8 h-8 text-emerald-400 opacity-60" />
                            <p className="font-bold text-sm text-[#e3e2e4]">Excelente trabalho, Coach!</p>
                            <p className="text-[11px] text-[#b9cacb]">Nenhuma recomendação no momento. Só aparecerá algo quando houver dados cadastrados com pendências.</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      recommendedActions.map(act => (
                        <tr key={act.id} className="hover:bg-white/[0.02] transition-colors group">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2.5">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${act.avatarColor}`}>
                                {act.initials}
                              </div>
                              <div>
                                <p className="font-bold text-[#e3e2e4]">{act.studentName}</p>
                                <p className="text-[10px] text-[#b9cacb]">Plano {act.studentPlan}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`${
                              act.iconType === "clock" ? "text-red-400" :
                              act.iconType === "alert" ? "text-amber-400" :
                              act.iconType === "shield" ? "text-purple-400" : "text-amber-400"
                            } font-semibold flex items-center gap-1`}>
                              {act.iconType === "clock" && <Clock className="w-3.5 h-3.5 inline text-red-500" />}
                              {act.iconType === "alert" && <AlertTriangle className="w-3.5 h-3.5 inline text-amber-500" />}
                              {act.iconType === "shield" && <ShieldAlert className="w-3.5 h-3.5 inline text-purple-400" />}
                              {act.iconType === "dumbbell" && <Dumbbell className="w-3.5 h-3.5 inline text-amber-400" />}
                              {act.context}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-0.5 rounded text-[10px] border uppercase tracking-wide font-bold ${
                              act.module === "Alunos" ? "border-cyan-500/30 text-cyan-400 bg-cyan-500/5" :
                              act.module === "Financeiro" ? "border-amber-500/30 text-amber-400 bg-amber-500/5" :
                              act.module === "Avaliações" ? "border-purple-500/30 text-purple-400 bg-purple-500/5" :
                              "border-amber-500/30 text-amber-400 bg-amber-500/5"
                            }`}>
                              {act.module}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button 
                              onClick={() => onGenerateMessage(
                                act.studentName, 
                                act.reason, 
                                act.studentPlan, 
                                act.currentPhase
                              )}
                              className="bg-[#343537] text-[#e3e2e4] hover:bg-[#00f2ff] hover:text-[#002022] px-3.5 py-1.5 rounded-lg transition-all font-bold text-[11px] uppercase tracking-wider group-hover:shadow-[0_0_10px_rgba(0,242,255,0.2)] cursor-pointer"
                            >
                              {act.actionLabel}
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Micro retention chart */}
            <div className="glass-panel rounded-xl flex flex-col p-5">
              <div className="mb-4">
                <h3 className="text-base font-bold text-[#e3e2e4]">Retenção Trimestral</h3>
                <p className="text-[#b9cacb] text-xs">Percentual de alunos ativos recorrentes</p>
              </div>

              <div className="flex-1 flex flex-col justify-between mt-2">
                <div className="grid grid-cols-2 gap-4 items-center">
                  
                  {/* Left: Bars */}
                  <div className="relative h-32 flex items-end justify-between px-1 pb-4 pt-2">
                    {/* BAR 1 */}
                    <div className="flex-1 flex flex-col items-center h-full justify-end relative group">
                      <div className="w-full max-w-[12px] bg-[#343537]/20 rounded-t relative overflow-hidden" style={{ height: `${abrRate}%` }}>
                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#ccff00] to-[#00f2ff] h-full rounded-t"></div>
                      </div>
                      <span className="text-[9px] font-mono text-[#b9cacb] mt-1">ABR ({abrRate}%)</span>
                    </div>

                    {/* BAR 2 */}
                    <div className="flex-1 flex flex-col items-center h-full justify-end relative group">
                      <div className="w-full max-w-[12px] bg-[#343537]/20 rounded-t relative overflow-hidden" style={{ height: `${maiRate}%` }}>
                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#ccff00] to-[#00f2ff] h-full rounded-t"></div>
                      </div>
                      <span className="text-[9px] font-mono text-[#b9cacb] mt-1">MAI ({maiRate}%)</span>
                    </div>

                    {/* BAR 3 */}
                    <div className="flex-1 flex flex-col items-center h-full justify-end relative group">
                      <div className="w-full max-w-[12px] bg-[#343537]/20 rounded-t relative overflow-hidden" style={{ height: `${junRate}%` }}>
                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-emerald-500 to-[#00f2ff] h-full rounded-t"></div>
                      </div>
                      <span className="text-[9px] font-mono text-[#00dbe7] font-bold mt-1">JUN ({junRate}%)</span>
                    </div>
                  </div>

                  {/* Right: Progress Ring (Adimplência / Engajamento) */}
                  <div className="flex flex-col items-center justify-center p-2">
                    <div className="relative w-20 h-20">
                      <svg viewBox="0 0 100 100" className="w-full h-full">
                        <defs>
                          <linearGradient id="thickProgressGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#00f2ff" stopOpacity="1" />
                            <stop offset="100%" stopColor="#ccff00" stopOpacity="1" />
                          </linearGradient>
                        </defs>
                        {/* Track circle */}
                        <circle cx="50" cy="50" r="40" fill="transparent" stroke="#eff4ff" strokeWidth="12" />
                        {/* Progress circle */}
                        <circle 
                          cx="50" 
                          cy="50" 
                          r="40" 
                          fill="transparent" 
                          stroke="url(#thickProgressGrad)" 
                          strokeWidth="12"
                          strokeDasharray="251.2" 
                          strokeDashoffset={251.2 * (1 - activePercentage / 100)} 
                          strokeLinecap="round" 
                          transform="rotate(-90 50 50)" 
                        />
                      </svg>
                      {/* Inside content */}
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="font-mono font-bold text-base text-white">{activePercentage}%</span>
                      </div>
                    </div>
                    <span className="text-[9px] font-mono text-[#b9cacb] mt-2 font-bold uppercase tracking-wider">ATIVIDADE</span>
                  </div>

                </div>

                <div className="border-t border-[#3a494b]/20 pt-3 space-y-2">
                  <div className="flex justify-between text-[11px] font-mono">
                    <span className="text-[#b9cacb]">Adimplência Atual</span>
                    <span className="text-emerald-400 font-bold">{complianceRate}%</span>
                  </div>
                  <div className="flex justify-between text-[11px] font-mono">
                    <span className="text-[#b9cacb]">Taxa de Evasão Geral</span>
                    <span className="text-red-400 font-bold">{churnRate}%</span>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Adicionais Premium: Check-ins, Aniversariantes, Tarefas e Alertas */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            
            {/* Bloco 1: Check-ins Recentes & Aniversariantes */}
            <div className="space-y-6">
              
              {/* Check-ins Recentes */}
              <div className="glass-panel p-5 rounded-xl border border-white/5 bg-[#17181a]/95">
                <div className="border-b border-[#3a494b]/20 pb-3 mb-4 flex justify-between items-center">
                  <h3 className="font-mono text-sm font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
                    <Activity className="w-4 h-4 text-[#00f2ff]" />
                    Check-ins Recentes dos Alunos
                  </h3>
                  <span className="text-[9px] font-mono font-bold text-emerald-400 bg-emerald-500/5 border border-emerald-500/20 px-2 py-0.5 rounded-full uppercase tracking-wider">
                    Hoje
                  </span>
                </div>

                <div className="space-y-3.5">
                  {checkins.map(chk => (
                    <div key={chk.id} className="p-3 rounded-xl bg-[#111214] border border-white/5 space-y-2 hover:border-[#3a494b]/40 transition-all">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-bold text-xs text-white">{chk.studentName}</p>
                          <p className="text-[10px] text-[#00f2ff] font-mono">{chk.workout}</p>
                        </div>
                        <span className="text-[9px] text-[#b9cacb]/50 font-mono">{chk.time}</span>
                      </div>
                      <p className="text-[11px] text-[#b9cacb]/90 italic font-sans bg-[#121315]/40 p-2 rounded border border-white/5">
                        "{chk.feedback}"
                      </p>
                      <div className="flex flex-wrap gap-2 text-[9px] font-mono text-[#b9cacb]/60">
                        <span className="bg-white/5 px-2 py-0.5 rounded border border-white/5">Disposição: <strong>{chk.feeling}</strong></span>
                        <span className="bg-white/5 px-2 py-0.5 rounded border border-white/5">Recuperação: <strong>{chk.recovery}</strong></span>
                        <span className="bg-white/5 px-2 py-0.5 rounded border border-white/5">Sono: <strong>{chk.sleep}</strong></span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Aniversariantes do Mês */}
              <div className="glass-panel p-5 rounded-xl border border-white/5 bg-[#17181a]/95">
                <div className="border-b border-[#3a494b]/20 pb-3 mb-3">
                  <h3 className="font-mono text-sm font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-[#00f2ff]" />
                    Aniversariantes do Mês (Julho)
                  </h3>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono text-xs">
                  <div className="p-3 rounded-xl bg-[#111214] border border-white/5 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-white">Camila Fernandes</p>
                      <p className="text-[10px] text-[#b9cacb]/60">Completa 26 anos</p>
                    </div>
                    <span className="bg-[#00f2ff]/10 text-[#00f2ff] border border-[#00f2ff]/20 px-2.5 py-1 rounded text-[10px] font-black">
                      12/07
                    </span>
                  </div>
                  
                  <div className="p-3 rounded-xl bg-[#111214] border border-white/5 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-white">Gustavo Silva</p>
                      <p className="text-[10px] text-[#b9cacb]/60">Completa 31 anos</p>
                    </div>
                    <span className="bg-white/5 text-white/50 border border-white/5 px-2.5 py-1 rounded text-[10px] font-bold">
                      28/07
                    </span>
                  </div>
                </div>
              </div>

            </div>

            {/* Bloco 2: Tarefas do Professor & Alertas Inteligentes */}
            <div className="space-y-6">
              
              {/* Quadro de Tarefas */}
              <div className="glass-panel p-5 rounded-xl border border-white/5 bg-[#17181a]/95 flex flex-col">
                <div className="border-b border-[#3a494b]/20 pb-3 mb-4 flex justify-between items-center">
                  <h3 className="font-mono text-sm font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-[#ccff00]" />
                    Minhas Tarefas & Pendências
                  </h3>
                  
                  <button
                    onClick={() => setShowAddTask(!showAddTask)}
                    className="p-1.5 rounded-lg bg-[#111214] border border-white/5 text-[#00f2ff] hover:text-white transition-all cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                {showAddTask && (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (!newTaskText.trim()) return;
                      setTasks([...tasks, { id: `t-${Date.now()}`, text: newTaskText, completed: false }]);
                      setNewTaskText("");
                      setShowAddTask(false);
                    }}
                    className="mb-4 flex gap-2 font-mono text-xs"
                  >
                    <input
                      type="text"
                      placeholder="Adicionar tarefa..."
                      value={newTaskText}
                      onChange={e => setNewTaskText(e.target.value)}
                      className="flex-1 bg-[#111214] border border-white/5 px-3 py-2 rounded-lg text-white text-xs outline-none focus:border-[#00f2ff]/40"
                    />
                    <button
                      type="submit"
                      className="bg-gradient-to-r from-[#00f2ff] to-[#ccff00] text-black px-3 rounded-lg font-black font-mono text-xs cursor-pointer"
                    >
                      OK
                    </button>
                  </form>
                )}

                <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
                  {tasks.map(task => (
                    <div
                      key={task.id}
                      className="p-3 rounded-xl bg-[#111214] border border-white/5 flex items-center justify-between gap-3 hover:bg-[#1b1c1e] transition-all"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <button
                          onClick={() => {
                            setTasks(tasks.map(t => t.id === task.id ? { ...t, completed: !t.completed } : t));
                          }}
                          className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 cursor-pointer ${
                            task.completed 
                              ? "bg-[#ccff00] border-[#ccff00] text-black" 
                              : "border-[#3a494b]/55 text-transparent"
                          }`}
                        >
                          <Check className="w-3 h-3 stroke-[3px]" />
                        </button>
                        <span className={`text-xs font-mono truncate ${task.completed ? "text-gray-500 line-through" : "text-[#e3e2e4]"}`}>
                          {task.text}
                        </span>
                      </div>

                      <button
                        onClick={() => setTasks(tasks.filter(t => t.id !== task.id))}
                        className="text-gray-600 hover:text-red-400 p-1 rounded hover:bg-gray-800/40 transition-all cursor-pointer"
                      >
                        <Trash className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Alertas Inteligentes */}
              <div className="glass-panel p-5 rounded-xl border border-white/5 bg-[#17181a]/95">
                <div className="border-b border-[#3a494b]/20 pb-3 mb-4 flex justify-between items-center">
                  <h3 className="font-mono text-sm font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-red-500" />
                    Alertas Clínicos & Alertas de Risco (IA)
                  </h3>
                  <span className="text-[9px] font-mono font-bold text-red-400 bg-red-500/5 border border-red-500/20 px-2 py-0.5 rounded-full uppercase tracking-wider">
                    Ação Necessária
                  </span>
                </div>

                <div className="space-y-3.5">
                  {intelligentAlerts.filter(alt => !alt.resolved).map(alt => (
                    <div key={alt.id} className="p-3 rounded-xl bg-red-500/5 border border-red-500/10 space-y-2 hover:bg-red-500/10 transition-all">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-bold text-xs text-white">{alt.studentName}</p>
                          <span className="text-[9px] text-red-400 font-mono uppercase tracking-wider font-extrabold">
                            🚨 {alt.type}
                          </span>
                        </div>
                        <button
                          onClick={() => {
                            setIntelligentAlerts(intelligentAlerts.map(a => a.id === alt.id ? { ...a, resolved: true } : a));
                          }}
                          className="text-[9px] font-mono font-bold bg-[#111214] text-[#ccff00] hover:text-white border border-white/5 hover:bg-[#ccff00] hover:text-black px-2.5 py-1 rounded-lg transition-all cursor-pointer"
                        >
                          CORRIGIR
                        </button>
                      </div>
                      <p className="text-[10px] font-mono text-[#b9cacb] leading-relaxed">
                        {alt.detail}
                      </p>
                    </div>
                  ))}
                  {intelligentAlerts.filter(alt => !alt.resolved).length === 0 && (
                    <div className="text-center py-6 text-gray-500 font-mono text-xs">
                      ✓ Todos os alertas de risco foram devidamente acompanhados!
                    </div>
                  )}
                </div>
              </div>

            </div>

          </div>

        </div>
      )}


      {/* ---------------------------------------------------------------------- */}
      {/* SECTION 2: ALUNOS ATIVOS (GESTÃO DE PRONTUÁRIO) */}
      {/* ---------------------------------------------------------------------- */}
      {activeSection === "alunos_ativos" && (
        <div className="space-y-6 animate-fadeIn">
          {/* Header Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#3a494b]/20 pb-4">
            <div>
              <button 
                onClick={() => setActiveSection("overview")}
                className="text-[#00dbe7] hover:text-white transition-colors flex items-center gap-1.5 text-xs font-bold uppercase font-mono mb-2"
              >
                <ArrowLeft className="w-4 h-4" /> Voltar ao Painel Geral
              </button>
              <h2 className="text-2xl font-extrabold text-[#e3e2e4] tracking-tight">
                Módulo de Alunos Ativos & Prontuário
              </h2>
              <p className="text-[#b9cacb] text-sm">
                Gestão completa de prontuários cadastrais, objetivos, limitações físicas e históricos.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            
            {/* Left Panel: Student Selection List */}
            <div className="lg:col-span-1 space-y-4">
              <div className="glass-panel p-4 rounded-xl space-y-3">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#b9cacb]" />
                  <input
                    type="text"
                    placeholder="Filtrar aluno pelo nome..."
                    value={activeSearch}
                    onChange={(e) => setActiveSearch(e.target.value)}
                    className="w-full bg-[#1b1c1e] border border-[#3a494b]/40 focus:border-[#00f2ff] text-[#e3e2e4] pl-10 pr-4 py-2 rounded-lg text-xs font-mono transition-all outline-none"
                  />
                </div>
              </div>

              {/* Student list container */}
              <div className="glass-panel rounded-xl overflow-hidden divide-y divide-[#3a494b]/10 max-h-[480px] overflow-y-auto">
                {students
                  .filter(s => s.name.toLowerCase().includes(activeSearch.toLowerCase()))
                  .map(student => {
                    const daysDiff = getDaysDiff(student.renewalDueDate);
                    return (
                      <div
                        key={student.id}
                        onClick={() => {
                          setSelectedStudentId(student.id);
                        }}
                        className={`p-4 cursor-pointer transition-all hover:bg-white/[0.01] ${
                          currentSelectedStudent?.id === student.id ? "bg-[#00f2ff]/5 border-l-4 border-[#00f2ff]" : "border-l-4 border-transparent"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs border ${student.avatarColor}`}>
                              {student.initials}
                            </div>
                            <div>
                              <h4 className="font-bold text-[#e3e2e4] text-xs leading-none">{student.name}</h4>
                              <span className="text-[10px] text-[#b9cacb] font-mono mt-1 block">{student.plan}</span>
                            </div>
                          </div>
                          
                          {/* Expiration countdown badge */}
                          <div className="text-right">
                            {daysDiff !== null ? (
                              daysDiff < 0 ? (
                                <span className="text-red-400 font-mono text-[10px] font-semibold bg-red-500/5 px-1.5 py-0.5 rounded border border-red-500/30">
                                  Atrasado há {Math.abs(daysDiff)} dias
                                </span>
                              ) : (
                                <span className="text-emerald-400 font-mono text-[10px] bg-emerald-500/5 px-1.5 py-0.5 rounded border border-emerald-500/20">
                                  Vence em {daysDiff} dias
                                </span>
                              )
                            ) : (
                              <span className="text-gray-400 font-mono text-[10px]">--</span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>

            {/* Right Panel: Detailed Student Profile Drill-down */}
            <div className="lg:col-span-2">
              {currentSelectedStudent ? (
                <div className="glass-panel rounded-xl p-6 space-y-6 animate-fadeIn">
                  
                  {/* Student Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#3a494b]/20">
                    <div className="flex items-center gap-4">
                      <div className={`w-14 h-14 rounded-full flex items-center justify-center font-bold text-lg border ${currentSelectedStudent.avatarColor}`}>
                        {currentSelectedStudent.initials}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-[#e3e2e4]">{currentSelectedStudent.name}</h3>
                        <p className="text-xs text-[#b9cacb] font-mono">Cadastrado em {currentSelectedStudent.joinedDate}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded text-xs border uppercase font-mono font-bold border-[#00f2ff]/30 text-[#00dbe7] bg-[#00f2ff]/5">
                        Plano {currentSelectedStudent.plan}
                      </span>
                    </div>
                  </div>

                  {/* Grid: Contato & Consultoria */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    
                    {/* Column 1: Dados Cadastrais */}
                    <div className="space-y-4">
                      <h4 className="text-xs text-white uppercase font-bold tracking-wider font-mono border-b border-[#3a494b]/15 pb-1">
                        Dados Cadastrais
                      </h4>
                      <div className="space-y-3 text-xs font-mono">
                        <div className="flex items-center gap-2 text-[#b9cacb]">
                          <Mail className="w-4 h-4 text-[#00f2ff] shrink-0" />
                          <span className="truncate">{currentSelectedStudent.email}</span>
                        </div>
                        <div className="flex items-center gap-2 text-[#b9cacb]">
                          <Phone className="w-4 h-4 text-[#00f2ff] shrink-0" />
                          <span>{currentSelectedStudent.phone}</span>
                        </div>
                        <div className="grid grid-cols-3 gap-2 pt-2">
                          <div className="bg-[#1b1c1e] p-2 rounded border border-[#3a494b]/10">
                            <span className="text-[9px] text-[#b9cacb] block">Peso</span>
                            <span className="text-white font-bold">{currentSelectedStudent.weight ? `${currentSelectedStudent.weight} kg` : "--"}</span>
                          </div>
                          <div className="bg-[#1b1c1e] p-2 rounded border border-[#3a494b]/10">
                            <span className="text-[9px] text-[#b9cacb] block">Altura</span>
                            <span className="text-white font-bold">{currentSelectedStudent.height ? `${currentSelectedStudent.height > 3 ? currentSelectedStudent.height : Math.round(currentSelectedStudent.height * 100)} cm` : "--"}</span>
                          </div>
                          <div className="bg-[#1b1c1e] p-2 rounded border border-[#3a494b]/10">
                            <span className="text-[9px] text-[#b9cacb] block">Idade</span>
                            <span className="text-white font-bold">{currentSelectedStudent.age ? `${currentSelectedStudent.age} anos` : "--"}</span>
                          </div>
                        </div>

                        {/* BMI */}
                        {currentSelectedStudent.weight && currentSelectedStudent.height && (
                          <div className="bg-[#00f2ff]/5 border border-[#00f2ff]/15 p-2 rounded text-[11px] flex justify-between items-center">
                            <span>IMC: <b className="text-[#00dbe7]">{calculateBMI(currentSelectedStudent.weight, currentSelectedStudent.height)?.value}</b></span>
                            <span className="text-gray-300 font-bold bg-[#121315] px-2 py-0.5 rounded text-[10px]">
                              {calculateBMI(currentSelectedStudent.weight, currentSelectedStudent.height)?.category}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Column 2: Consultoria & Limitações */}
                    <div className="space-y-4">
                      <h4 className="text-xs text-white uppercase font-bold tracking-wider font-mono border-b border-[#3a494b]/15 pb-1">
                        Planejamento e Saúde
                      </h4>
                      <div className="space-y-3 text-xs font-mono">
                        <div>
                          <span className="text-[#b9cacb] text-[10px] block">Objetivo</span>
                          <p className="text-white font-bold">{currentSelectedStudent.objective || "Hipertrofia e Tonificação Geral"}</p>
                        </div>
                        <div>
                          <span className="text-[#b9cacb] text-[10px] block">Limitações Físicas</span>
                          <p className="text-red-400 font-bold bg-red-500/5 px-2 py-1 rounded border border-red-500/10 mt-0.5">
                            {currentSelectedStudent.limitations || "Nenhuma limitação relatada"}
                          </p>
                        </div>
                        <div>
                          <span className="text-[#b9cacb] text-[10px] block">Observações do Aluno</span>
                          <p className="text-gray-300 italic">{currentSelectedStudent.observations || "Foco em consistência alimentar e progressão gradual."}</p>
                        </div>
                      </div>
                    </div>

                  </div>

                  {/* Alertas Inteligentes */}
                  <div className="space-y-3">
                    <h4 className="text-xs text-white uppercase font-bold tracking-wider font-mono">
                      Alertas de Acompanhamento
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono">
                      
                      {/* Alerta de Avaliação */}
                      <div className="bg-[#1b1c1e] p-3 rounded-lg border border-[#3a494b]/15 flex items-center justify-between">
                        <div>
                          <p className="text-gray-400 text-[10px]">Avaliação Física</p>
                          <p className="text-white font-bold mt-0.5">
                            {currentSelectedStudent.hasPhysicalEvaluation 
                              ? `Última: ${currentSelectedStudent.physicalEvaluationDate}` 
                              : "Nenhuma cadastrada"}
                          </p>
                        </div>
                        <div>
                          {currentSelectedStudent.hasPhysicalEvaluation ? (
                            getDaysDiff(currentSelectedStudent.physicalEvaluationDate) !== null && getDaysDiff(currentSelectedStudent.physicalEvaluationDate)! < -30 ? (
                              <span className="px-2 py-1 rounded text-[10px] bg-red-500/10 text-red-400 font-bold border border-red-500/20">Vencida</span>
                            ) : (
                              <span className="px-2 py-1 rounded text-[10px] bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/20">Em dia</span>
                            )
                          ) : (
                            <span className="px-2 py-1 rounded text-[10px] bg-amber-500/10 text-amber-400 font-bold border border-amber-500/20">Pendente</span>
                          )}
                        </div>
                      </div>

                      {/* Alerta de Ficha */}
                      <div className="bg-[#1b1c1e] p-3 rounded-lg border border-[#3a494b]/15 flex items-center justify-between">
                        <div>
                          <p className="text-gray-400 text-[10px]">Ficha de Treino</p>
                          <p className="text-white font-bold mt-0.5">
                            {getStudentWorkoutDate(currentSelectedStudent.id) 
                              ? `Atualizada em: ${getStudentWorkoutDate(currentSelectedStudent.id)}` 
                              : "Nunca atualizada"}
                          </p>
                        </div>
                        <div>
                          {getStudentWorkoutDate(currentSelectedStudent.id) ? (
                            getDaysDiff(getStudentWorkoutDate(currentSelectedStudent.id)) !== null && getDaysDiff(getStudentWorkoutDate(currentSelectedStudent.id))! < -60 ? (
                              <span className="px-2 py-1 rounded text-[10px] bg-red-500/10 text-red-400 font-bold border border-red-500/20">Defasada</span>
                            ) : (
                              <span className="px-2 py-1 rounded text-[10px] bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/20">Atualizada</span>
                            )
                          ) : (
                            <span className="px-2 py-1 rounded text-[10px] bg-amber-500/10 text-amber-400 font-bold border border-amber-500/20">Pendente</span>
                          )}
                        </div>
                      </div>

                    </div>
                  </div>

                  {/* Tabs: Histórico de Treinos, Avaliações e Financeiro */}
                  <div className="space-y-4 pt-2">
                    <div className="flex border-b border-[#3a494b]/20 text-xs font-mono font-bold">
                      <button
                        onClick={() => setActiveHistoryTab("treinos")}
                        className={`px-4 py-2 border-b-2 transition-all cursor-pointer ${
                          activeHistoryTab === "treinos" ? "border-[#00f2ff] text-[#00f2ff]" : "border-transparent text-gray-400 hover:text-white"
                        }`}
                      >
                        Treinos Prescritos
                      </button>
                      <button
                        onClick={() => setActiveHistoryTab("avaliacoes")}
                        className={`px-4 py-2 border-b-2 transition-all cursor-pointer ${
                          activeHistoryTab === "avaliacoes" ? "border-[#00f2ff] text-[#00f2ff]" : "border-transparent text-gray-400 hover:text-white"
                        }`}
                      >
                        Avaliações Físicas
                      </button>
                      <button
                        onClick={() => setActiveHistoryTab("financeiro")}
                        className={`px-4 py-2 border-b-2 transition-all cursor-pointer ${
                          activeHistoryTab === "financeiro" ? "border-[#00f2ff] text-[#00f2ff]" : "border-transparent text-gray-400 hover:text-white"
                        }`}
                      >
                        Histórico Financeiro
                      </button>
                    </div>

                    {/* Tab 1: Treinos */}
                    {activeHistoryTab === "treinos" && (
                      <div className="space-y-4 font-mono text-xs">
                        
                        {/* Division and Edit Actions Header */}
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-[#121315] p-3 rounded-xl border border-[#3a494b]/20">
                          {/* Division Select Tabs */}
                          <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none w-full sm:w-auto">
                            {["A", "B", "C", "D", "E"].map((div) => {
                              // Count exercises in this division (handling undefined as A)
                              const workoutSrc = isEditingWorkout ? editedExercises : (selectedStudentWorkout?.exercises || []);
                              const count = workoutSrc.filter(ex => (ex.division || "A") === div).length;
                              
                              const isSel = activeDivisionTab === div;
                              return (
                                <button
                                  key={div}
                                  onClick={() => setActiveDivisionTab(div)}
                                  className={`px-3 py-1.5 rounded-lg border text-[10px] font-extrabold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                                    isSel
                                      ? "bg-[#00f2ff]/10 border-[#00f2ff] text-white"
                                      : "bg-[#161719]/40 border-[#3a494b]/15 text-[#b9cacb] hover:text-white hover:border-[#3a494b]/30"
                                  }`}
                                >
                                  <span>Treino {div}</span>
                                  {count > 0 && (
                                    <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[8px] ${
                                      isSel ? "bg-[#00f2ff] text-black" : "bg-[#3a494b]/40 text-[#ebb2ff]"
                                    }`}>
                                      {count}
                                    </span>
                                  )}
                                </button>
                              );
                            })}
                          </div>

                          {/* Edit / View Mode Switcher */}
                          {selectedStudentWorkout && (
                            <button
                              type="button"
                              onClick={() => {
                                if (isEditingWorkout) {
                                  setIsEditingWorkout(false);
                                } else {
                                  setEditedWorkoutName(selectedStudentWorkout.name);
                                  setEditedExercises(selectedStudentWorkout.exercises || []);
                                  setIsEditingWorkout(true);
                                }
                              }}
                              className={`px-3.5 py-1.5 rounded-lg font-bold text-[10px] uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer border ${
                                isEditingWorkout
                                  ? "bg-red-500/15 border-red-500/40 text-red-400 hover:bg-red-500/25"
                                  : "bg-[#ccff00]/10 border-[#ccff00]/30 text-[#ccff00] hover:bg-[#ccff00]/20"
                              }`}
                            >
                              {isEditingWorkout ? (
                                <>
                                  <X className="w-3.5 h-3.5" />
                                  <span>Cancelar Edição</span>
                                </>
                              ) : (
                                <>
                                  <Edit className="w-3.5 h-3.5" />
                                  <span>Editar Treino ✏️</span>
                                </>
                              )}
                            </button>
                          )}
                        </div>

                        {/* WORKOUT INTERACTIVE VIEWER (READ-ONLY MODE) */}
                        {!isEditingWorkout ? (
                          selectedStudentWorkout ? (
                            <div className="space-y-4">
                              {/* Header info */}
                              <div className="bg-[#161719] px-4 py-3 rounded-xl border border-[#3a494b]/15 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                                <div>
                                  <span className="text-[8px] text-[#00f2ff] uppercase tracking-wider font-extrabold bg-[#00f2ff]/10 px-1.5 py-0.5 rounded">Ficha do Aluno</span>
                                  <h4 className="text-sm font-black text-white mt-1 uppercase tracking-tight">{selectedStudentWorkout.name}</h4>
                                </div>
                                <span className="text-[9px] text-[#b9cacb]/60">Atualizado em {selectedStudentWorkout.lastUpdated}</span>
                              </div>

                              {/* Filter exercises for the active division */}
                              {(() => {
                                const divisionExercises = (selectedStudentWorkout.exercises || []).filter(
                                  ex => (ex.division || "A") === activeDivisionTab
                                );

                                if (divisionExercises.length === 0) {
                                  return (
                                    <div className="text-center p-10 bg-[#161719]/40 rounded-xl border border-dashed border-[#3a494b]/15 text-[#b9cacb] space-y-2">
                                      <p className="text-xs">Nenhum exercício cadastrado no <b>Treino {activeDivisionTab}</b>.</p>
                                      <p className="text-[10px] text-gray-500">Mude de divisão acima ou clique em "Editar Treino" para adicionar.</p>
                                    </div>
                                  );
                                }

                                return (
                                  <div className="space-y-3">
                                    {divisionExercises.map((ex, index) => {
                                      const hasTech = !!ex.advancedTechnique && ex.advancedTechnique !== "Nenhuma";
                                      
                                      return (
                                        <div
                                          key={ex.id}
                                          className={`p-4 rounded-xl border transition-all ${
                                            hasTech
                                              ? "border-purple-500/40 bg-gradient-to-r from-[#1d1624] to-[#141517] shadow-[0_0_12px_rgba(168,85,247,0.08)] hover:border-purple-500/60"
                                              : "bg-[#1b1c1e] border-[#3a494b]/15 hover:border-[#3a494b]/30"
                                          }`}
                                        >
                                          {/* Exercise Header */}
                                          <div className="flex justify-between items-start gap-2 border-b border-[#3a494b]/10 pb-2">
                                            <div className="min-w-0">
                                              <div className="flex items-center gap-2 flex-wrap">
                                                <span className="text-[9px] font-extrabold text-white bg-gray-800 px-1.5 py-0.5 rounded">
                                                  {index + 1}
                                                </span>
                                                <h5 className="font-extrabold text-white text-[12px] truncate">{ex.name}</h5>
                                                
                                                {/* Advanced Technique Badge */}
                                                {hasTech && (
                                                  <div className="flex items-center gap-1 shrink-0">
                                                    <span className="px-1.5 py-0.5 rounded bg-purple-500/25 text-purple-300 border border-purple-500/30 text-[8px] font-black uppercase tracking-wider flex items-center gap-1">
                                                      <Flame className="w-2.5 h-2.5 text-purple-400" /> {ex.advancedTechnique}
                                                    </span>
                                                    <button
                                                      type="button"
                                                      onClick={() => setSelectedTechniqueHelp(
                                                        selectedTechniqueHelp === ex.id ? null : ex.id
                                                      )}
                                                      className="p-0.5 text-purple-400 hover:text-white hover:bg-purple-500/10 rounded transition-all cursor-pointer"
                                                      title="Como Executar?"
                                                    >
                                                      <Info className="w-3 h-3" />
                                                    </button>
                                                  </div>
                                                )}
                                              </div>

                                              {/* Custom description / notes */}
                                              <p className="text-[10px] text-gray-400 italic mt-1 leading-normal">
                                                {ex.notes || "Foco na amplitude máxima e cadência controlada."}
                                              </p>
                                            </div>

                                            {/* Reps/Sets Readout */}
                                            <div className="text-right shrink-0">
                                              <p className="text-[#00f2ff] font-extrabold text-[12px]">
                                                {ex.sets}s × {ex.reps}
                                              </p>
                                              
                                              {/* Check for student logged weight */}
                                              {ex.studentWeights && Object.keys(ex.studentWeights).length > 0 ? (
                                                <div className="text-[9px] text-[#25d366] font-mono mt-0.5 bg-[#25d366]/5 px-1.5 py-0.5 rounded border border-[#25d366]/10 inline-block">
                                                  Cargas: {Object.values(ex.studentWeights).join(" / ")} kg
                                                </div>
                                              ) : (
                                                <p className="text-gray-500 text-[9px] mt-0.5">Sem cargas salvas</p>
                                              )}
                                            </div>
                                          </div>

                                          {/* Step by Step Tooltip Expandable Card */}
                                          {selectedTechniqueHelp === ex.id && hasTech && ADVANCED_TECHNIQUES_INFO[ex.advancedTechnique!] && (
                                            <div className="mt-2.5 p-3 rounded-lg bg-purple-950/30 border border-purple-500/20 text-[10px] text-[#e3e2e4] space-y-1.5 animate-fade-in font-sans">
                                              <div className="flex justify-between items-center border-b border-purple-500/15 pb-1">
                                                <span className="font-extrabold text-[#ebb2ff] uppercase tracking-wider font-mono text-[9px]">
                                                  Guia Prático: {ex.advancedTechnique}
                                                </span>
                                                <button 
                                                  onClick={() => setSelectedTechniqueHelp(null)}
                                                  className="text-gray-400 hover:text-white"
                                                >
                                                  <X className="w-3 h-3" />
                                                </button>
                                              </div>
                                              <p className="font-medium text-[#b9cacb]">{ADVANCED_TECHNIQUES_INFO[ex.advancedTechnique!].description}</p>
                                              <div className="text-gray-300 space-y-1 leading-relaxed bg-black/20 p-2 rounded border border-purple-500/10">
                                                {ADVANCED_TECHNIQUES_INFO[ex.advancedTechnique!].steps.split("\n").map((step, sIdx) => (
                                                  <p key={sIdx}>{step}</p>
                                                ))}
                                              </div>
                                            </div>
                                          )}

                                          {/* Set Targets Render (Set Marker) */}
                                          <div className="mt-2.5 flex items-center gap-1.5 flex-wrap">
                                            <span className="text-[8px] text-[#b9cacb]/55 uppercase tracking-wider font-bold">Roteiro de Execução:</span>
                                            <div className="flex items-center gap-1 flex-wrap">
                                              {Array.from({ length: ex.sets }).map((_, sIdx) => {
                                                const setNum = sIdx + 1;
                                                const isTarget = ex.techniqueSetTarget?.includes(setNum);
                                                return (
                                                  <div
                                                    key={sIdx}
                                                    className={`px-2 py-0.5 rounded text-[9px] font-bold flex items-center gap-1 ${
                                                      isTarget
                                                        ? "bg-purple-500/20 text-purple-300 border border-purple-500/40 animate-pulse"
                                                        : "bg-gray-800 text-gray-400 border border-transparent"
                                                    }`}
                                                  >
                                                    <span>Série {setNum}</span>
                                                    {isTarget && (
                                                      <span className="text-[8px] text-purple-400 font-extrabold shrink-0 flex items-center gap-0.5">
                                                        [<Flame className="w-2 h-2 text-purple-400 inline-block" /> {ex.advancedTechnique}]
                                                      </span>
                                                    )}
                                                  </div>
                                                );
                                              })}
                                            </div>
                                          </div>

                                        </div>
                                      );
                                    })}
                                  </div>
                                );
                              })()}

                            </div>
                          ) : (
                            // Empty workout state
                            <div className="text-center p-8 bg-[#1b1c1e] rounded-xl border border-[#3a494b]/10 text-gray-400 space-y-4">
                              <p>Nenhuma ficha de treino ativa cadastrada para este aluno.</p>
                              <button
                                type="button"
                                onClick={() => {
                                  setEditedWorkoutName("Treino Integrado ABC");
                                  setEditedExercises([]);
                                  setIsEditingWorkout(true);
                                }}
                                className="px-5 py-2.5 rounded-lg bg-[#ccff00] hover:bg-[#a3cc00] text-black font-extrabold uppercase font-mono tracking-wider transition-all cursor-pointer text-xs"
                              >
                                Prescrever Primeiro Treino →
                              </button>
                            </div>
                          )
                        ) : (
                          
                          // WORKOUT EDITOR MODE (TEACHER PRESCRIBES OR EDITS)
                          <div className="space-y-4 bg-[#161719] p-4 rounded-xl border border-[#3a494b]/20">
                            
                            {/* Workout Metadata Row */}
                            <div className="space-y-1.5 border-b border-[#3a494b]/15 pb-3">
                              <label className="block text-[9px] text-[#b9cacb] font-bold uppercase tracking-wider">Nome da Ficha de Treino</label>
                              <input
                                type="text"
                                value={editedWorkoutName}
                                onChange={(e) => setEditedWorkoutName(e.target.value)}
                                placeholder="Ex: Treino Hipertrofia ABC - Avançado"
                                className="w-full bg-[#121315] border border-[#3a494b]/40 focus:border-[#00f2ff] text-white px-3 py-2 rounded-lg text-xs outline-none font-bold"
                              />
                            </div>

                            <div className="flex justify-between items-center pt-1.5">
                              <h5 className="font-extrabold text-[11px] text-[#00f2ff] uppercase tracking-wider">
                                Exercícios do Treino {activeDivisionTab} ({editedExercises.filter(ex => (ex.division || "A") === activeDivisionTab).length})
                              </h5>
                              <button
                                type="button"
                                onClick={() => {
                                  const newEx: Exercise = {
                                    id: `ex-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
                                    name: "Novo Exercício",
                                    sets: 4,
                                    reps: "12",
                                    weight: 0,
                                    notes: "",
                                    division: activeDivisionTab,
                                    category: "musculacao"
                                  };
                                  setEditedExercises(prev => [...prev, newEx]);
                                }}
                                className="px-2.5 py-1.5 rounded bg-[#00f2ff]/10 hover:bg-[#00f2ff]/20 text-[#00f2ff] font-extrabold text-[9px] border border-[#00f2ff]/20 flex items-center gap-1 transition-all cursor-pointer"
                              >
                                <Plus className="w-3.5 h-3.5" />
                                <span>Adicionar Exercício</span>
                              </button>
                            </div>

                            {/* Exercises List filter by current active division */}
                            {(() => {
                              const divisionEditList = editedExercises.filter(ex => (ex.division || "A") === activeDivisionTab);
                              
                              if (divisionEditList.length === 0) {
                                return (
                                  <div className="p-8 text-center bg-[#121315]/40 rounded-lg border border-dashed border-[#3a494b]/20 text-[#b9cacb] text-xs">
                                    Nenhum exercício neste Treino {activeDivisionTab} ainda.
                                    <p className="text-[10px] text-gray-500 mt-1">Clique no botão acima para adicionar um exercício.</p>
                                  </div>
                                );
                              }

                              return (
                                <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
                                  {divisionEditList.map((ex, idx) => {
                                    
                                    const updateField = (field: keyof Exercise, value: any) => {
                                      setEditedExercises(prev => prev.map(item => 
                                        item.id === ex.id ? { ...item, [field]: value } : item
                                      ));
                                    };

                                    return (
                                      <div 
                                        key={ex.id} 
                                        className="bg-[#121315] p-3.5 rounded-xl border border-[#3a494b]/25 space-y-3 relative hover:border-[#00f2ff]/30 transition-all"
                                      >
                                        
                                        {/* Remove button */}
                                        <button
                                          type="button"
                                          onClick={() => {
                                            setEditedExercises(prev => prev.filter(item => item.id !== ex.id));
                                          }}
                                          className="absolute top-3 right-3 text-red-400 hover:text-red-300 p-1.5 rounded hover:bg-red-500/10 cursor-pointer transition-all"
                                          title="Excluir Exercício"
                                        >
                                          <Trash className="w-3.5 h-3.5" />
                                        </button>

                                        {/* Exercise Row 1: Name and Division */}
                                        <div className="grid grid-cols-12 gap-2.5">
                                          <div className="col-span-8 space-y-1">
                                            <label className="block text-[8px] text-[#b9cacb] font-bold uppercase tracking-wider">Exercício {idx + 1}</label>
                                            <input
                                              type="text"
                                              value={ex.name}
                                              onChange={(e) => updateField("name", e.target.value)}
                                              placeholder="Ex: Supino Reto Halteres"
                                              className="w-full bg-[#1b1c1e] border border-[#3a494b]/40 focus:border-[#00f2ff] text-white px-2.5 py-1.5 rounded-lg text-xs outline-none font-bold"
                                            />
                                          </div>
                                          <div className="col-span-4 space-y-1">
                                            <label className="block text-[8px] text-[#b9cacb] font-bold uppercase tracking-wider">Divisão</label>
                                            <select
                                              value={ex.division || "A"}
                                              onChange={(e) => updateField("division", e.target.value)}
                                              className="w-full bg-[#1b1c1e] border border-[#3a494b]/40 focus:border-[#00f2ff] text-white px-2 py-1.5 rounded-lg text-xs outline-none font-bold"
                                            >
                                              <option value="A">Treino A</option>
                                              <option value="B">Treino B</option>
                                              <option value="C">Treino C</option>
                                              <option value="D">Treino D</option>
                                              <option value="E">Treino E</option>
                                            </select>
                                          </div>
                                        </div>

                                        {/* Row 2: Sets, Reps (NO WEIGHT INPUT FOR TEACHER!) */}
                                        <div className="grid grid-cols-2 gap-2.5">
                                          <div className="space-y-1">
                                            <label className="block text-[8px] text-[#b9cacb] font-bold uppercase tracking-wider">Séries</label>
                                            <input
                                              type="number"
                                              min="1"
                                              max="12"
                                              value={ex.sets}
                                              onChange={(e) => {
                                                const val = Math.max(1, parseInt(e.target.value) || 1);
                                                updateField("sets", val);
                                                // Adjust targets if they exceed the new sets size
                                                if (ex.techniqueSetTarget) {
                                                  updateField("techniqueSetTarget", ex.techniqueSetTarget.filter(s => s <= val));
                                                }
                                              }}
                                              className="w-full bg-[#1b1c1e] border border-[#3a494b]/40 focus:border-[#00f2ff] text-white px-2 py-1.5 rounded-lg text-xs outline-none font-mono text-center font-bold"
                                            />
                                          </div>
                                          <div className="space-y-1">
                                            <label className="block text-[8px] text-[#b9cacb] font-bold uppercase tracking-wider">Repetições</label>
                                            <input
                                              type="text"
                                              value={ex.reps}
                                              onChange={(e) => updateField("reps", e.target.value)}
                                              placeholder="Ex: 12, 10-12, ou FALHA"
                                              className="w-full bg-[#1b1c1e] border border-[#3a494b]/40 focus:border-[#00f2ff] text-white px-2 py-1.5 rounded-lg text-xs outline-none font-mono text-center font-bold"
                                            />
                                          </div>
                                        </div>

                                        {/* Advanced Techniques Selector */}
                                        <div className="space-y-1">
                                          <label className="block text-[8px] text-[#ebb2ff] font-bold uppercase tracking-wider">Técnica Avançada Especial</label>
                                          <select
                                            value={ex.advancedTechnique || "Nenhuma"}
                                            onChange={(e) => {
                                              const tech = e.target.value;
                                              updateField("advancedTechnique", tech);
                                              // Default target to the last series if none exists
                                              if (tech !== "Nenhuma" && (!ex.techniqueSetTarget || ex.techniqueSetTarget.length === 0)) {
                                                updateField("techniqueSetTarget", [ex.sets]); // last set by default
                                              }
                                            }}
                                            className="w-full bg-[#1b1c1e] border border-[#3a494b]/40 focus:border-[#00f2ff] text-white px-2 py-1.5 rounded-lg text-xs outline-none font-bold text-[#ebb2ff]"
                                          >
                                            <option value="Nenhuma">Nenhuma Técnica Aplicada</option>
                                            {Object.keys(ADVANCED_TECHNIQUES_INFO).map(k => (
                                              <option key={k} value={k}>{k}</option>
                                            ))}
                                          </select>
                                        </div>

                                        {/* Set Marker Buttons (only if advancedTechnique != Nenhuma) */}
                                        {ex.advancedTechnique && ex.advancedTechnique !== "Nenhuma" && (
                                          <div className="space-y-1.5 bg-purple-950/20 p-2 rounded-lg border border-purple-500/15">
                                            <span className="block text-[8px] text-purple-300 font-bold uppercase tracking-wider">
                                              Aplicar técnica na(s) série(s):
                                            </span>
                                            <div className="flex items-center gap-1.5 flex-wrap">
                                              {Array.from({ length: ex.sets }).map((_, sIdx) => {
                                                const setNum = sIdx + 1;
                                                const currentTargets = ex.techniqueSetTarget || [];
                                                const isTarget = currentTargets.includes(setNum);
                                                
                                                const toggleTarget = () => {
                                                  if (isTarget) {
                                                    updateField("techniqueSetTarget", currentTargets.filter(item => item !== setNum));
                                                  } else {
                                                    updateField("techniqueSetTarget", [...currentTargets, setNum]);
                                                  }
                                                };

                                                return (
                                                  <button
                                                    key={sIdx}
                                                    type="button"
                                                    onClick={toggleTarget}
                                                    className={`w-7 h-7 rounded-full text-[10px] font-mono font-extrabold transition-all cursor-pointer flex items-center justify-center border ${
                                                      isTarget
                                                        ? "bg-purple-500 text-black border-purple-400 shadow-[0_0_8px_rgba(168,85,247,0.3)] font-black"
                                                        : "bg-[#1b1c1e] text-gray-400 border-[#3a494b]/40 hover:text-white"
                                                    }`}
                                                  >
                                                    {setNum}
                                                  </button>
                                                );
                                              })}
                                            </div>
                                          </div>
                                        )}

                                        {/* Observações */}
                                        <div className="space-y-1">
                                          <label className="block text-[8px] text-[#b9cacb] font-bold uppercase tracking-wider">Observações / Cadência / Execução</label>
                                          <input
                                            type="text"
                                            value={ex.notes || ""}
                                            onChange={(e) => updateField("notes", e.target.value)}
                                            placeholder="Ex: Concentrar na contração de pico..."
                                            className="w-full bg-[#1b1c1e] border border-[#3a494b]/40 focus:border-[#00f2ff] text-white px-2.5 py-1.5 rounded-lg text-xs outline-none placeholder-[#b9cacb]/30"
                                          />
                                        </div>

                                      </div>
                                    );
                                  })}
                                </div>
                              );
                            })()}

                            {/* Editor Form Controls */}
                            <div className="flex items-center justify-end gap-2 border-t border-[#3a494b]/15 pt-3 mt-2">
                              <button
                                type="button"
                                onClick={() => setIsEditingWorkout(false)}
                                className="px-4 py-2 rounded-lg text-[#b9cacb] hover:text-white font-bold text-xs uppercase tracking-wider transition-all cursor-pointer hover:bg-gray-800"
                              >
                                Descartar
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  if (onSaveWorkout && currentSelectedStudent) {
                                    onSaveWorkout(currentSelectedStudent.id, editedWorkoutName, editedExercises);
                                  }
                                  setIsEditingWorkout(false);
                                }}
                                className="px-5 py-2.5 rounded-lg bg-[#ccff00] hover:bg-[#a3cc00] text-black font-extrabold text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1 shadow-md hover:shadow-[0_0_15px_rgba(204,255,0,0.2)]"
                              >
                                <Save className="w-4 h-4" />
                                <span>Salvar Treino</span>
                              </button>
                            </div>

                          </div>
                        )}

                      </div>
                    )}

                    {/* Tab 2: Avaliações */}
                    {activeHistoryTab === "avaliacoes" && (
                      <div className="space-y-3 font-mono text-xs">
                        {currentSelectedStudent.hasPhysicalEvaluation ? (
                          <div className="space-y-3">
                            {/* Latest log */}
                            <div className="bg-[#1b1c1e] p-4 rounded-lg border border-[#3a494b]/15">
                              <div className="flex justify-between items-center mb-2">
                                <span className="font-bold text-white">Avaliação Recente (Atual)</span>
                                <span className="text-[10px] text-emerald-400 bg-emerald-500/5 px-2 py-0.5 rounded border border-emerald-500/20">Ativa</span>
                              </div>
                              <p className="text-gray-400 text-[11px]">Data de Realização: <b>{currentSelectedStudent.physicalEvaluationDate}</b></p>
                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3 text-center">
                                <div className="bg-[#121315] p-2 rounded">
                                  <span className="text-[10px] text-gray-400 block">Massa Corporal</span>
                                  <span className="text-white font-bold text-sm">{currentSelectedStudent.weight} kg</span>
                                </div>
                                <div className="bg-[#121315] p-2 rounded">
                                  <span className="text-[10px] text-gray-400 block">Estatura</span>
                                  <span className="text-white font-bold text-sm">{currentSelectedStudent.height} m</span>
                                </div>
                                <div className="bg-[#121315] p-2 rounded">
                                  <span className="text-[10px] text-gray-400 block">BF Estimado</span>
                                  <span className="text-white font-bold text-sm">13.8%</span>
                                </div>
                                <div className="bg-[#121315] p-2 rounded">
                                  <span className="text-[10px] text-gray-400 block">Massa de Gordura</span>
                                  <span className="text-white font-bold text-sm">{(currentSelectedStudent.weight ? currentSelectedStudent.weight * 0.138 : 10).toFixed(1)} kg</span>
                                </div>
                              </div>
                            </div>

                            {/* Generated Past log for performance tracking */}
                            <div className="bg-[#1b1c1e]/40 p-4 rounded-lg border border-[#3a494b]/10 opacity-70">
                              <div className="flex justify-between items-center mb-2">
                                <span className="font-bold text-gray-300">Avaliação Anterior (3 meses atrás)</span>
                                <span className="text-[10px] text-gray-400">Histórico</span>
                              </div>
                              <p className="text-gray-400 text-[11px]">Data: <b>25/03/2026</b></p>
                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2 text-center text-gray-300">
                                <div className="bg-[#121315]/50 p-2 rounded">
                                  <span className="text-[9px] block">Massa</span>
                                  <span className="font-bold">{(currentSelectedStudent.weight ? currentSelectedStudent.weight * 1.04 : 85).toFixed(1)} kg</span>
                                </div>
                                <div className="bg-[#121315]/50 p-2 rounded">
                                  <span className="text-[9px] block">Estatura</span>
                                  <span className="font-bold">{currentSelectedStudent.height} m</span>
                                </div>
                                <div className="bg-[#121315]/50 p-2 rounded">
                                  <span className="text-[9px] block">BF</span>
                                  <span className="font-bold">16.2%</span>
                                </div>
                                <div className="bg-[#121315]/50 p-2 rounded">
                                  <span className="text-[9px] block">Massa G.</span>
                                  <span className="font-bold">{(currentSelectedStudent.weight ? currentSelectedStudent.weight * 1.04 * 0.162 : 12).toFixed(1)} kg</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="text-center p-6 bg-[#1b1c1e] rounded-lg border border-[#3a494b]/10 text-gray-400">
                            <p>Nenhuma avaliação física realizada ainda.</p>
                            <button
                              onClick={() => onGenerateMessage(
                                currentSelectedStudent.name,
                                "Agendamento da primeira avaliação física.",
                                currentSelectedStudent.plan,
                                currentSelectedStudent.currentPhase
                              )}
                              className="mt-3 text-[#00f2ff] text-[11px] font-bold hover:underline"
                            >
                              Solicitar Avaliação via WhatsApp →
                            </button>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Tab 3: Financeiro */}
                    {activeHistoryTab === "financeiro" && (
                      <div className="space-y-3 font-mono text-xs">
                        {selectedStudentPayments.length > 0 ? (
                          <div className="glass-panel rounded-lg overflow-hidden divide-y divide-[#3a494b]/15 border border-[#3a494b]/10">
                            {selectedStudentPayments.map(pay => (
                              <div key={pay.id} className="p-3 flex justify-between items-center text-[11px]">
                                <div>
                                  <p className="font-bold text-white">{pay.plan}</p>
                                  <p className="text-[10px] text-gray-400 mt-0.5">Vencimento: {pay.dueDate}</p>
                                </div>
                                <div className="text-right">
                                  <p className="font-bold text-white">{formatCurrency(pay.amount)}</p>
                                  <span className={`inline-block px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider mt-1 border ${
                                    pay.status === "paid" 
                                      ? "border-emerald-500/20 text-emerald-400 bg-emerald-500/5" 
                                      : pay.status === "overdue" 
                                      ? "border-red-500/20 text-red-400 bg-red-500/5" 
                                      : "border-amber-500/20 text-amber-400 bg-amber-500/5"
                                  }`}>
                                    {pay.status === "paid" ? "Pago" : pay.status === "overdue" ? "Em atraso" : "Pendente"}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center p-6 bg-[#1b1c1e] rounded-lg border border-[#3a494b]/10 text-gray-400">
                            <p>Sem histórico financeiro faturado para este aluno.</p>
                          </div>
                        )}
                      </div>
                    )}

                  </div>

                </div>
              ) : (
                <div className="glass-panel rounded-xl p-8 text-center text-gray-400 font-mono text-sm">
                  Selecione um aluno para exibir o prontuário de coach.
                </div>
              )}
            </div>

          </div>
        </div>
      )}


      {/* ---------------------------------------------------------------------- */}
      {/* SECTION 3: VENCIMENTOS E COBRANÇA DE INADIMPLÊNCIA */}
      {/* ---------------------------------------------------------------------- */}
      {activeSection === "vencimentos" && (
        <div className="space-y-6 animate-fadeIn">
          {/* Header Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#3a494b]/20 pb-4">
            <div>
              <button 
                onClick={() => setActiveSection("overview")}
                className="text-[#00dbe7] hover:text-white transition-colors flex items-center gap-1.5 text-xs font-bold uppercase font-mono mb-2"
              >
                <ArrowLeft className="w-4 h-4" /> Voltar ao Painel Geral
              </button>
              <h2 className="text-2xl font-extrabold text-[#e3e2e4] tracking-tight">
                Módulo de Vencimentos & Cobrança Ativa
              </h2>
              <p className="text-[#b9cacb] text-sm">
                Lista de mensalidades vencidas ou prestes a vencer. Acione as automações com Inteligência Artificial para reativar planos.
              </p>
            </div>
          </div>

          <div className="glass-panel p-4 rounded-xl">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#b9cacb]" />
              <input
                type="text"
                placeholder="Pesquisar por nome do aluno..."
                value={billingSearch}
                onChange={(e) => setEvalSearch(e.target.value)}
                className="w-full bg-[#1b1c1e] border border-[#3a494b]/40 focus:border-[#00f2ff] text-[#e3e2e4] pl-10 pr-4 py-2 rounded-lg text-xs font-mono transition-all outline-none"
              />
            </div>
          </div>

          {/* List panel */}
          <div className="glass-panel rounded-xl overflow-hidden">
            <div className="p-4 border-b border-[#3a494b]/20 bg-[#1f2022]/40 flex justify-between items-center text-xs font-mono">
              <span className="font-bold text-white uppercase tracking-wider">Atrasos e Próximas Renovações</span>
              <span className="text-red-400 font-bold bg-red-500/5 px-2 py-0.5 rounded border border-red-500/20">
                Inadimplência atual: {formatCurrency(totalOverdueAmount)} ({delinquencyRate}%)
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono text-xs">
                <thead className="bg-[#292a2c]/60 text-[#b9cacb] border-b border-[#3a494b]/20">
                  <tr>
                    <th className="px-6 py-3 font-semibold">ALUNO</th>
                    <th className="px-6 py-3 font-semibold">VALOR</th>
                    <th className="px-6 py-3 font-semibold">VENCIMENTO</th>
                    <th className="px-6 py-3 font-semibold">CRITICIDADE / STATUS</th>
                    <th className="px-6 py-3 font-semibold text-right">AÇÃO</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#3a494b]/10 bg-[#121315]/20">
                  {payments
                    .filter(p => p.status !== "paid" && p.studentName.toLowerCase().includes(billingSearch.toLowerCase()))
                    .map(pay => {
                      const daysDiff = getDaysDiff(pay.dueDate);
                      const isOverdue = pay.status === "overdue" || (daysDiff !== null && daysDiff < 0);
                      
                      return (
                        <tr key={pay.id} className="hover:bg-white/[0.01] transition-colors">
                          <td className="px-6 py-4">
                            <span className="font-bold text-[#e3e2e4]">{pay.studentName}</span>
                            <span className="block text-[10px] text-gray-400 mt-0.5">{pay.plan}</span>
                          </td>
                          <td className="px-6 py-4 font-bold text-white">
                            {formatCurrency(pay.amount)}
                          </td>
                          <td className="px-6 py-4 text-gray-300">
                            {pay.dueDate}
                          </td>
                          <td className="px-6 py-4">
                            {daysDiff !== null ? (
                              isOverdue ? (
                                <span className="px-2 py-1 rounded text-[10px] bg-red-500/10 text-red-400 font-bold border border-red-500/30">
                                  Atrasado há {Math.abs(daysDiff)} dias
                                </span>
                              ) : (
                                <span className="px-2 py-1 rounded text-[10px] bg-amber-500/10 text-amber-400 font-bold border border-amber-500/30">
                                  Vence em {daysDiff} dias
                                </span>
                              )
                            ) : (
                              <span className="text-gray-400">Pendente</span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button
                              onClick={() => {
                                const activeStudent = students.find(s => s.name === pay.studentName);
                                const phase = activeStudent ? activeStudent.currentPhase : "Condicionamento Físico";
                                const reason = isOverdue 
                                  ? `Mensalidade em atraso há ${Math.abs(daysDiff || 0)} dias. Chamar para cobrar renovação do plano ${pay.plan}.` 
                                  : `Renovação de plano ${pay.plan} com vencimento em ${daysDiff} dias.`;
                                
                                onGenerateMessage(pay.studentName, reason, pay.plan, phase);
                              }}
                              className="bg-[#00f2ff]/10 text-[#00dbe7] border border-[#00f2ff]/30 hover:bg-[#00f2ff] hover:text-[#002022] hover:border-[#00f2ff] px-3.5 py-1.5 rounded-lg transition-all font-bold text-[10px] uppercase tracking-wider cursor-pointer shadow-[0_0_10px_rgba(0,242,255,0.05)]"
                            >
                              Cobrança Inteligente IA
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}


      {/* ---------------------------------------------------------------------- */}
      {/* SECTION 4: FATURAMENTO & PREVISÃO FINANCEIRA */}
      {/* ---------------------------------------------------------------------- */}
      {activeSection === "faturamento" && (
        <div className="space-y-6 animate-fadeIn">
          {/* Header Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#3a494b]/20 pb-4">
            <div>
              <button 
                onClick={() => setActiveSection("overview")}
                className="text-[#00dbe7] hover:text-white transition-colors flex items-center gap-1.5 text-xs font-bold uppercase font-mono mb-2"
              >
                <ArrowLeft className="w-4 h-4" /> Voltar ao Painel Geral
              </button>
              <h2 className="text-2xl font-extrabold text-[#e3e2e4] tracking-tight">
                Análise de Faturamento & Provisões Financeiras
              </h2>
              <p className="text-[#b9cacb] text-sm">
                Monitore o faturamento consolidado realizado e projete receitas com base nas recorrências de contratos ativos.
              </p>
            </div>
          </div>

          {/* Indicators Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            
            <div className="glass-panel p-5 rounded-xl border-l-4 border-emerald-500">
              <p className="font-mono text-[10px] text-gray-400 uppercase tracking-wider font-bold">Faturamento Realizado</p>
              <h3 className="font-mono text-2xl xl:text-3xl font-extrabold text-emerald-400 mt-2">{formatCurrency(faturamentoRealizado)}</h3>
              <p className="text-[9px] font-mono text-gray-400 mt-2">Mensalidades recebidas no período</p>
            </div>

            <div className="glass-panel p-5 rounded-xl border-l-4 border-[#00f2ff]">
              <p className="font-mono text-[10px] text-gray-400 uppercase tracking-wider font-bold">Faturamento Previsto</p>
              <h3 className="font-mono text-2xl xl:text-3xl font-extrabold text-[#00dbe7] mt-2">{formatCurrency(faturamentoPrevisto)}</h3>
              <p className="text-[9px] font-mono text-gray-400 mt-2">Caso todos os contratos sejam quitados</p>
            </div>

            <div className="glass-panel p-5 rounded-xl border-l-4 border-red-500">
              <p className="font-mono text-[10px] text-gray-400 uppercase tracking-wider font-bold">Inadimplência Pendente</p>
              <h3 className="font-mono text-2xl xl:text-3xl font-extrabold text-red-400 mt-2">{formatCurrency(totalOverdueAmount)}</h3>
              <p className="text-[9px] font-mono text-gray-400 mt-2">Mensalidades vencidas e não pagas</p>
            </div>

            <div className="glass-panel p-5 rounded-xl border-l-4 border-purple-500">
              <p className="font-mono text-[10px] text-gray-400 uppercase tracking-wider font-bold">Renovações Recentes</p>
              <h3 className="font-mono text-2xl xl:text-3xl font-extrabold text-purple-400 mt-2">4</h3>
              <p className="text-[9px] font-mono text-gray-400 mt-2">Renovados nos últimos 15 dias</p>
            </div>

          </div>

          {/* Graphics layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Graphic 1: Trend Line Graph */}
            <div className="glass-panel rounded-xl p-5 space-y-4">
              <div>
                <h3 className="text-base font-bold text-white">Linha de Tendência de Receitas</h3>
                <p className="text-[11px] text-[#b9cacb]">Acompanhamento mensal de receita realizada nos últimos meses.</p>
              </div>

              {/* Responsive SVG Curve Line Chart */}
              <div className="relative pt-6">
                <svg viewBox="0 0 500 200" className="w-full h-48 overflow-visible font-mono text-[9px] text-gray-400">
                  <defs>
                    <linearGradient id="cyanGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#00f2ff" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="#00f2ff" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  
                  {/* Grid Lines */}
                  <line x1="40" y1="20" x2="480" y2="20" stroke="#3a494b" strokeOpacity="0.15" strokeDasharray="4" />
                  <line x1="40" y1="60" x2="480" y2="60" stroke="#3a494b" strokeOpacity="0.15" strokeDasharray="4" />
                  <line x1="40" y1="100" x2="480" y2="100" stroke="#3a494b" strokeOpacity="0.15" strokeDasharray="4" />
                  <line x1="40" y1="140" x2="480" y2="140" stroke="#3a494b" strokeOpacity="0.15" strokeDasharray="4" />
                  <line x1="40" y1="170" x2="480" y2="170" stroke="#3a494b" strokeOpacity="0.3" />

                  {/* Y Axis Marks */}
                  <text x="5" y="24" fill="#b9cacb">R$ 25k</text>
                  <text x="5" y="64" fill="#b9cacb">R$ 20k</text>
                  <text x="5" y="104" fill="#b9cacb">R$ 15k</text>
                  <text x="5" y="144" fill="#b9cacb">R$ 10k</text>
                  <text x="5" y="174" fill="#b9cacb">R$ 5k</text>

                  {/* Area Path */}
                  <path 
                    d="M 60,140 L 160,110 L 260,120 L 360,95 L 460,78 L 460,170 L 60,170 Z" 
                    fill="url(#cyanGradient)" 
                  />

                  {/* Line Path */}
                  <path 
                    d="M 60,140 L 160,110 L 260,120 L 360,95 L 460,78" 
                    fill="none" 
                    stroke="#00f2ff" 
                    strokeWidth="3.5" 
                    strokeLinecap="round" 
                  />

                  {/* Data Points */}
                  <circle cx="60" cy="140" r="5" fill="#121315" stroke="#00f2ff" strokeWidth="2.5" />
                  <circle cx="160" cy="110" r="5" fill="#121315" stroke="#00f2ff" strokeWidth="2.5" />
                  <circle cx="260" cy="120" r="5" fill="#121315" stroke="#00f2ff" strokeWidth="2.5" />
                  <circle cx="360" cy="95" r="5" fill="#121315" stroke="#00f2ff" strokeWidth="2.5" />
                  <circle cx="460" cy="78" r="5" fill="#00f2ff" stroke="#00dbe7" strokeWidth="2.5" />

                  {/* Labels below */}
                  <text x="45" y="190" fill="#b9cacb" fontWeight="bold">FEV</text>
                  <text x="145" y="190" fill="#b9cacb" fontWeight="bold">MAR</text>
                  <text x="245" y="190" fill="#b9cacb" fontWeight="bold">ABR</text>
                  <text x="345" y="190" fill="#b9cacb" fontWeight="bold">MAI</text>
                  <text x="445" y="190" fill="#00f2ff" fontWeight="bold">JUN</text>
                </svg>
              </div>
            </div>

            {/* Graphic 2: Expected vs Actual Bar Chart */}
            <div className="glass-panel rounded-xl p-5 space-y-4">
              <div>
                <h3 className="text-base font-bold text-white">Faturamento Real vs. Esperado</h3>
                <p className="text-[11px] text-[#b9cacb]">Acompanhamento e previsão baseado em contratos ativos (Bento view).</p>
              </div>

              {/* Bar graph */}
              <div className="relative pt-6">
                <svg viewBox="0 0 500 200" className="w-full h-48 overflow-visible font-mono text-[9px]">
                  {/* Grid Lines */}
                  <line x1="40" y1="20" x2="480" y2="20" stroke="#3a494b" strokeOpacity="0.1" />
                  <line x1="40" y1="70" x2="480" y2="70" stroke="#3a494b" strokeOpacity="0.1" />
                  <line x1="40" y1="120" x2="480" y2="120" stroke="#3a494b" strokeOpacity="0.1" />
                  <line x1="40" y1="170" x2="480" y2="170" stroke="#3a494b" strokeOpacity="0.3" />

                  {/* Bars representing MAR, ABR, MAI, JUN */}
                  {/* MAR */}
                  <rect x="70" y="80" width="16" height="90" fill="#ccff00" fillOpacity="0.4" rx="8" />
                  <rect x="90" y="88" width="16" height="82" fill="#00f2ff" fillOpacity="0.8" rx="8" />

                  {/* ABR */}
                  <rect x="170" y="60" width="16" height="110" fill="#ccff00" fillOpacity="0.4" rx="8" />
                  <rect x="190" y="65" width="16" height="105" fill="#00f2ff" fillOpacity="0.8" rx="8" />

                  {/* MAI */}
                  <rect x="270" y="50" width="16" height="120" fill="#ccff00" fillOpacity="0.4" rx="8" />
                  <rect x="290" y="52" width="16" height="118" fill="#00f2ff" fillOpacity="0.8" rx="8" />

                  {/* JUN */}
                  <rect x="370" y="30" width="16" height="140" fill="#ccff00" fillOpacity="0.4" rx="8" />
                  <rect x="390" y="34" width="16" height="136" fill="#00f2ff" rx="8" className="shadow-[0_0_10px_rgba(0,242,255,0.3)]" />

                  {/* Text label */}
                  <text x="75" y="185" fill="#b9cacb" fontWeight="bold">MAR</text>
                  <text x="175" y="185" fill="#b9cacb" fontWeight="bold">ABR</text>
                  <text x="275" y="185" fill="#b9cacb" fontWeight="bold">MAI</text>
                  <text x="375" y="185" fill="#00f2ff" fontWeight="bold">JUN</text>

                  {/* Legenda */}
                  <rect x="420" y="20" width="10" height="10" fill="#ccff00" fillOpacity="0.5" />
                  <text x="435" y="28" fill="#b9cacb">Esperado</text>
                  <rect x="420" y="35" width="10" height="10" fill="#00f2ff" />
                  <text x="435" y="43" fill="#b9cacb">Realizado</text>
                </svg>
              </div>
            </div>

          </div>
        </div>
      )}


      {/* ---------------------------------------------------------------------- */}
      {/* SECTION 5: STATUS DE FICHAS E AVALIAÇÕES */}
      {/* ---------------------------------------------------------------------- */}
      {activeSection === "status_fichas_avaliacoes" && (
        <div className="space-y-6 animate-fadeIn">
          {/* Header Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#3a494b]/20 pb-4">
            <div>
              <button 
                onClick={() => setActiveSection("overview")}
                className="text-[#00dbe7] hover:text-white transition-colors flex items-center gap-1.5 text-xs font-bold uppercase font-mono mb-2"
              >
                <ArrowLeft className="w-4 h-4" /> Voltar ao Painel Geral
              </button>
              <h2 className="text-2xl font-extrabold text-[#e3e2e4] tracking-tight">
                Módulo de Fichas de Treino & Avaliações
              </h2>
              <p className="text-[#b9cacb] text-sm">
                Monitore atrasos de reavaliação corporal periódica e defasagem temporal de fichas prescritas. Envie convites de atualização via IA.
              </p>
            </div>
          </div>

          <div className="glass-panel p-4 rounded-xl">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#b9cacb]" />
              <input
                type="text"
                placeholder="Pesquisar por nome do aluno..."
                value={evalSearch}
                onChange={(e) => setBillingSearch(e.target.value)}
                className="w-full bg-[#1b1c1e] border border-[#3a494b]/40 focus:border-[#00f2ff] text-[#e3e2e4] pl-10 pr-4 py-2 rounded-lg text-xs font-mono transition-all outline-none"
              />
            </div>
          </div>

          {/* Bento layout for the 3 alerts lists */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            
            {/* Box 1: Avaliações Vencidas (há mais de 30 dias) */}
            <div className="glass-panel rounded-xl overflow-hidden flex flex-col">
              <div className="p-4 border-b border-[#3a494b]/20 bg-red-500/5 flex justify-between items-center text-xs font-mono">
                <span className="font-bold text-red-400 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4" /> Avaliações Vencidas
                </span>
                <span className="bg-red-500/10 text-red-400 border border-red-500/20 px-2 py-0.5 rounded font-bold">
                  {expiredAssessmentsStudents.length}
                </span>
              </div>

              <div className="divide-y divide-[#3a494b]/15 max-h-[380px] overflow-y-auto p-3 space-y-3">
                {expiredAssessmentsStudents.map(student => {
                  const diff = getDaysDiff(student.physicalEvaluationDate);
                  return (
                    <div key={student.id} className="p-3 bg-[#1b1c1e]/60 rounded border border-red-500/10 font-mono text-xs space-y-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-bold text-[#e3e2e4]">{student.name}</p>
                          <p className="text-[10px] text-gray-400">Última avaliação: {student.physicalEvaluationDate}</p>
                        </div>
                        <span className="text-[10px] text-red-400 bg-red-500/5 px-1 rounded">
                          {Math.abs(diff || 0)}d atrasado
                        </span>
                      </div>
                      <button
                        onClick={() => onGenerateMessage(
                          student.name,
                          `Avaliação física expirada há ${Math.abs(diff || 0)} dias. Convidar amigavelmente para agendar reavaliação corporal técnica.`,
                          student.plan,
                          student.currentPhase
                        )}
                        className="w-full bg-[#343537] hover:bg-[#00f2ff] hover:text-[#002022] text-[10px] py-1.5 rounded font-bold uppercase tracking-wider transition-colors cursor-pointer"
                      >
                        Solicitar Avaliação IA
                      </button>
                    </div>
                  );
                })}
                {expiredAssessmentsStudents.length === 0 && (
                  <p className="text-gray-400 text-center py-6">Nenhum aluno com avaliação vencida.</p>
                )}
              </div>
            </div>

            {/* Box 2: Alunos sem Avaliação cadastrada */}
            <div className="glass-panel rounded-xl overflow-hidden flex flex-col">
              <div className="p-4 border-b border-[#3a494b]/20 bg-amber-500/5 flex justify-between items-center text-xs font-mono">
                <span className="font-bold text-amber-400 flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4" /> Alunos Sem Avaliação
                </span>
                <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded font-bold">
                  {studentsWithoutAssessment.length}
                </span>
              </div>

              <div className="divide-y divide-[#3a494b]/15 max-h-[380px] overflow-y-auto p-3 space-y-3">
                {studentsWithoutAssessment.map(student => (
                  <div key={student.id} className="p-3 bg-[#1b1c1e]/60 rounded border border-amber-500/10 font-mono text-xs space-y-2">
                    <div>
                      <p className="font-bold text-[#e3e2e4]">{student.name}</p>
                      <p className="text-[10px] text-amber-400">Novo aluno: aguardando avaliação inicial</p>
                    </div>
                    <button
                      onClick={() => onGenerateMessage(
                        student.name,
                        "Agendamento do prontuário corporal da primeira avaliação física para alinhamento dos novos treinos e metas.",
                        student.plan,
                        student.currentPhase
                      )}
                      className="w-full bg-[#343537] hover:bg-amber-400 hover:text-[#002022] text-[10px] py-1.5 rounded font-bold uppercase tracking-wider transition-colors cursor-pointer"
                    >
                      Agendar via IA
                    </button>
                  </div>
                ))}
                {studentsWithoutAssessment.length === 0 && (
                  <p className="text-gray-400 text-center py-6">Nenhum aluno aguardando avaliação física.</p>
                )}
              </div>
            </div>

            {/* Box 3: Fichas de Treino Vencidas (há mais de 60 dias) */}
            <div className="glass-panel rounded-xl overflow-hidden flex flex-col">
              <div className="p-4 border-b border-[#3a494b]/20 bg-purple-500/5 flex justify-between items-center text-xs font-mono">
                <span className="font-bold text-[#ebb2ff] flex items-center gap-1.5">
                  <Dumbbell className="w-4 h-4" /> Treinos Vencidos (+60d)
                </span>
                <span className="bg-purple-500/10 text-[#ebb2ff] border border-purple-500/20 px-2 py-0.5 rounded font-bold">
                  {expiredWorkoutsStudents.length}
                </span>
              </div>

              <div className="divide-y divide-[#3a494b]/15 max-h-[380px] overflow-y-auto p-3 space-y-3">
                {expiredWorkoutsStudents.map(student => {
                  const studentWorkoutDate = getStudentWorkoutDate(student.id);
                  const diff = getDaysDiff(studentWorkoutDate);
                  return (
                    <div key={student.id} className="p-3 bg-[#1b1c1e]/60 rounded border border-purple-500/10 font-mono text-xs space-y-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-bold text-[#e3e2e4]">{student.name}</p>
                          <p className="text-[10px] text-gray-400">Último treino: {studentWorkoutDate || "Nunca atualizado"}</p>
                        </div>
                        <span className="text-[10px] text-purple-400 bg-purple-500/5 px-1 rounded">
                          {diff !== null ? `${Math.abs(diff)}d antigo` : "Pendente"}
                        </span>
                      </div>
                      <button
                        onClick={() => onGenerateMessage(
                          student.name,
                          "Ficha de treino atualizada há bastante tempo. Convidar para renovar o ciclo de exercícios e propor novos desafios na musculação.",
                          student.plan,
                          student.currentPhase
                        )}
                        className="w-full bg-[#343537] hover:bg-[#ebb2ff] hover:text-[#002022] text-[10px] py-1.5 rounded font-bold uppercase tracking-wider transition-colors cursor-pointer"
                      >
                        Enviar Atualização IA
                      </button>
                    </div>
                  );
                })}
                {expiredWorkoutsStudents.length === 0 && (
                  <p className="text-gray-400 text-center py-6">Nenhum treino vencido pendente.</p>
                )}
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
