/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
import { 
  Dumbbell, 
  Users, 
  Utensils, 
  CreditCard, 
  Settings, 
  LayoutDashboard, 
  Plus, 
  Sparkles, 
  X, 
  Send, 
  Info,
  Loader2,
  Menu,
  Sun,
  Moon,
  Calendar,
  MessageSquare,
  FileText,
  Flame,
  CheckCircle2,
  AlertTriangle
} from "lucide-react";

import { Student, Workout, Exercise, Diet, Meal, Payment, CoachSettings, Plan } from "../types";
import { 
  INITIAL_STUDENTS, 
  INITIAL_WORKOUTS, 
  INITIAL_DIETS, 
  INITIAL_PAYMENTS, 
  INITIAL_COACH_SETTINGS 
} from "@/src/data/seed";

import DashboardView from "./features/dashboard/DashboardView";
import AlunosView from "./features/students/AlunosView";
import TreinosView from "./features/workouts/TreinosView";
import DietasView from "./features/nutrition/DietasView";
import FinanceiroView from "./features/finance/FinanceiroView";
import GamificacaoView from "./features/students/GamificacaoView";
import ConfiguracoesView from "./features/settings/ConfiguracoesView";
import CalendarioView from "./features/dashboard/CalendarioView";
import ChatView from "./features/chat/ChatView";
import RelatoriosView from "./features/reports/RelatoriosView";
import AppAlunoView from "../aluno-mobile/AppAluno";

export default function AppProfessor() {
  
  // Persistent States synced with localStorage
  const [students, setStudents] = useState<Student[]>(() => {
    const saved = localStorage.getItem("treinopro_students");
    if (saved) {
      const parsed = (JSON.parse(saved) as Student[]).filter(
        s => s.id !== "stud-seeded-camila" && s.id !== "stud-seeded-ricardo"
      );
      if (parsed.some(s => s.id === "stud-1" || s.id === "stud-2" || s.id === "stud-3")) {
        return INITIAL_STUDENTS;
      }
      if (!parsed.some(s => s.id === "stud-seeded-gustavo")) {
        return [...INITIAL_STUDENTS, ...parsed];
      }
      return parsed;
    }
    return INITIAL_STUDENTS;
  });

  const [workouts, setWorkouts] = useState<Workout[]>(() => {
    const saved = localStorage.getItem("treinopro_workouts");
    if (saved) {
      const parsed = JSON.parse(saved) as Workout[];
      return parsed.filter(w => !w.id.includes("seeded"));
    }
    return INITIAL_WORKOUTS;
  });

  const [diets, setDiets] = useState<Diet[]>(() => {
    const saved = localStorage.getItem("treinopro_diets");
    if (saved) {
      const parsed = (JSON.parse(saved) as Diet[]).filter(
        d => d.studentId !== "stud-seeded-camila" && d.studentId !== "stud-seeded-ricardo"
      );
      if (parsed.some(d => d.id === "diet-1" || d.id === "diet-2" || d.studentId === "stud-1")) {
        return INITIAL_DIETS;
      }
      if (!parsed.some(d => d.id === "diet-seeded-gustavo")) {
        return [...INITIAL_DIETS, ...parsed];
      }
      return parsed;
    }
    return INITIAL_DIETS;
  });

  const [payments, setPayments] = useState<Payment[]>(() => {
    const saved = localStorage.getItem("treinopro_payments");
    if (saved) {
      const parsed = (JSON.parse(saved) as Payment[]).filter(
        p => p.studentId !== "stud-seeded-camila" && p.studentId !== "stud-seeded-ricardo"
      );
      if (parsed.some(p => p.id === "pay-1" || p.id === "pay-2" || p.studentId === "stud-1")) {
        return INITIAL_PAYMENTS;
      }
      if (!parsed.some(p => p.id === "pay-seeded-gustavo-1")) {
        return [...INITIAL_PAYMENTS, ...parsed];
      }
      return parsed;
    }
    return INITIAL_PAYMENTS;
  });

  const [coachSettings, setCoachSettings] = useState<CoachSettings>(() => {
    const saved = localStorage.getItem("treinopro_settings");
    return saved ? JSON.parse(saved) : INITIAL_COACH_SETTINGS;
  });

  const [plans, setPlans] = useState<Plan[]>(() => {
    const saved = localStorage.getItem("treinopro_plans");
    return saved ? JSON.parse(saved) : [
      { id: "plan-1", name: "Basic", price: 149.90 },
      { id: "plan-2", name: "Platinum", price: 299.90 },
      { id: "plan-3", name: "Elite Performance", price: 499.90 }
    ];
  });

  // UI States
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [dashboardSection, setDashboardSection] = useState<"overview" | "alunos_ativos" | "vencimentos" | "faturamento" | "status_fichas_avaliacoes">("overview");
  const [globalSearch, setGlobalSearch] = useState<string>("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem("treinopro_theme");
    return saved ? saved === "dark" : false;
  });

  useEffect(() => {
    localStorage.setItem("treinopro_theme", isDarkMode ? "dark" : "light");
  }, [isDarkMode]);

  useEffect(() => {
    // Seed Gustavo's Anamnese details programmatically if missing
    const gustavoAnamneseKey = "anamnese_stud-seeded-gustavo";
    if (!localStorage.getItem(gustavoAnamneseKey)) {
      const gustavoAnamnese = {
        etnia: "Branca",
        sexoBio: "masculino",
        idade: 28,
        tipoSanguineo: "O+",
        fatorRh: "Positivo (+)",
        fcRepouso: 58,
        condicaoFisica: "Avançado",
        pressaoArt: "11/7",
        fumante: "Não",
        exFumante: "Não",
        doencasCronicas: "Nenhuma crônica. Histórico de asma na infância, hoje 100% controlada.",
        lesoesDores: "Leve encurtamento de posterior esquerdo, sob controle com alongamentos diários.",
        usaMedicamento: false,
        medicamentos: [],
        contatoNome: "Ana Paula Silva (Esposa)",
        contatoFone: "(11) 99999-8888",
        nutriNome: "Dr. Fernando Costa",
        nutriFone: "(11) 98888-7777",
        refeicoesDia: 5,
        ingestaoCalorica: 3200,
        gastoEnergetico: 3100,
        selectedObjetivos: ["Hipertrofia", "Ganho de Força"],
        horarioTreino: "Tarde (14h - 18h)",
        atividadesPreferidas: "Musculação avançada, corrida regenerativa aos finais de semana.",
        disponibilidadeDias: "Seg, Ter, Qua, Qui, Sex, Sáb",
        disponibilidadeHoras: "Das 16h às 17h30",
        observacoes: "Atleta muito disciplinado, mantendo excelente adesão nutricional e progressão de cargas.",
        cinturaRcq: 79,
        quadrilRcq: 94,
        parqAnswers: [false, false, false, false, false, false, false],
        mhaAgeGroup: 2,
        mhaGender: 4,
        mhaWeightDev: 2,
        mhaActivity: 1,
        mhaSmoking: 0,
        mhaSystolic: 2,
        mhaGenetics: 1,
        mhaCholesterol: 2,
        sleepAnswers: [false, false, false, false, false, false, false, false, false]
      };
      localStorage.setItem(gustavoAnamneseKey, JSON.stringify(gustavoAnamnese));
    }

    // Seed Camila's Anamnese details programmatically if missing
    const camilaAnamneseKey = "anamnese_stud-seeded-camila";
    if (!localStorage.getItem(camilaAnamneseKey)) {
      const camilaAnamnese = {
        etnia: "Branca",
        sexoBio: "feminino",
        idade: 25,
        tipoSanguineo: "A-",
        fatorRh: "Negativo (-)",
        fcRepouso: 62,
        condicaoFisica: "Intermediário",
        pressaoArt: "11/6",
        fumante: "Não",
        exFumante: "Não",
        doencasCronicas: "Nenhuma.",
        lesoesDores: "Leve desconforto patelar no joelho esquerdo em flexões profundas.",
        usaMedicamento: false,
        medicamentos: [],
        contatoNome: "Juliana Fernandes (Mãe)",
        contatoFone: "(21) 99999-1111",
        nutriNome: "Dra. Patrícia Lima",
        nutriFone: "(21) 98765-4321",
        refeicoesDia: 4,
        ingestaoCalorica: 1800,
        gastoEnergetico: 1950,
        selectedObjetivos: ["Definição", "Estética"],
        horarioTreino: "Manhã (06h - 12h)",
        atividadesPreferidas: "Cadeira Extensora, Agachamento Búlgaro, Cadeira Flexora, HIIT.",
        disponibilidadeDias: "Seg, Qua, Sex",
        disponibilidadeHoras: "Das 07h às 08h30",
        observacoes: "Foco total na definição muscular e redução gradual do percentual de gordura (BF).",
        cinturaRcq: 68,
        quadrilRcq: 96,
        parqAnswers: [false, false, false, false, false, false, false],
        mhaAgeGroup: 1,
        mhaGender: 2,
        mhaWeightDev: 1,
        mhaActivity: 2,
        mhaSmoking: 0,
        mhaSystolic: 1,
        mhaGenetics: 0,
        mhaCholesterol: 1,
        sleepAnswers: [false, false, false, false, false, false, false, false, false]
      };
      localStorage.setItem(camilaAnamneseKey, JSON.stringify(camilaAnamnese));
    }
  }, []);

  // AI Modal States
  const [aiModal, setAiModal] = useState<{
    isOpen: boolean;
    studentName: string;
    reason: string;
    plan: string;
    phase: string;
    generatedText: string;
    isLoading: boolean;
    warning?: string;
  }>({
    isOpen: false,
    studentName: "",
    reason: "",
    plan: "",
    phase: "",
    generatedText: "",
    isLoading: false
  });

  // Global Animated Toast Notification State
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "warning" | "info";
    title?: string;
  } | null>(null);

  useEffect(() => {
    // Intercept standard browser alerts to show a beautiful interactive Toast in iframe
    const originalAlert = window.alert;
    window.alert = (message: string) => {
      if (!message) return;
      
      let type: "success" | "warning" | "info" = "info";
      let title = "Notificação";

      const lower = message.toLowerCase();
      if (
        lower.includes("sucesso") || 
        lower.includes("salvo") || 
        lower.includes("concluído") || 
        lower.includes("concluida") ||
        lower.includes("adicionado") || 
        lower.includes("cadastrado") || 
        lower.includes("renovado") ||
        lower.includes("copiado") ||
        lower.includes("copiada")
      ) {
        type = "success";
        title = "Sucesso!";
      } else if (
        lower.includes("erro") || 
        lower.includes("falha") || 
        lower.includes("obrigatório") || 
        lower.includes("obrigatória") ||
        lower.includes("inválido") || 
        lower.includes("mínima") || 
        lower.includes("máxima") ||
        lower.includes("atenção") ||
        lower.includes("atencao") ||
        lower.includes("por favor")
      ) {
        type = "warning";
        title = "Atenção!";
      } else {
        type = "info";
        title = "Informativo";
      }

      setToast({ message, type, title });
    };

    return () => {
      window.alert = originalAlert;
    };
  }, []);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem("treinopro_students", JSON.stringify(students));
  }, [students]);

  useEffect(() => {
    // Migration: Ensure the main student is "Gustavo Mangabeira" with email "gustavoworkout85@gmail.com"
    let updated = false;
    const nextStudents = students.map(s => {
      if (s.id === "stud-seeded-gustavo" && (s.name !== "Gustavo Mangabeira" || s.email !== "gustavoworkout85@gmail.com")) {
        updated = true;
        return {
          ...s,
          name: "Gustavo Mangabeira",
          email: "gustavoworkout85@gmail.com",
          initials: "GM"
        };
      }
      return s;
    });
    if (updated) {
      setStudents(nextStudents);
    }
  }, [students]);

  useEffect(() => {
    localStorage.setItem("treinopro_workouts", JSON.stringify(workouts));
  }, [workouts]);

  useEffect(() => {
    localStorage.setItem("treinopro_diets", JSON.stringify(diets));
  }, [diets]);

  useEffect(() => {
    localStorage.setItem("treinopro_payments", JSON.stringify(payments));
  }, [payments]);

  useEffect(() => {
    // Migration: Ensure studentName in payments is "Gustavo Mangabeira"
    let updated = false;
    const nextPayments = payments.map(p => {
      if (p.studentId === "stud-seeded-gustavo" && p.studentName !== "Gustavo Mangabeira") {
        updated = true;
        return {
          ...p,
          studentName: "Gustavo Mangabeira"
        };
      }
      return p;
    });
    if (updated) {
      setPayments(nextPayments);
    }
  }, [payments]);

  useEffect(() => {
    localStorage.setItem("treinopro_settings", JSON.stringify(coachSettings));
  }, [coachSettings]);

  useEffect(() => {
    localStorage.setItem("treinopro_plans", JSON.stringify(plans));
  }, [plans]);

  // Synchronize students state when custom event is dispatched
  useEffect(() => {
    const handleStudentUpdated = () => {
      const saved = localStorage.getItem("treinopro_students");
      if (saved) {
        const parsed = (JSON.parse(saved) as Student[]).filter(
          s => s.id !== "stud-seeded-camila" && s.id !== "stud-seeded-ricardo"
        );
        setStudents(prev => {
          if (!parsed.some(s => s.id === "stud-seeded-gustavo")) {
            return [...INITIAL_STUDENTS, ...parsed];
          }
          return parsed;
        });
      }
    };
    window.addEventListener("treinopro_student_updated", handleStudentUpdated);
    return () => window.removeEventListener("treinopro_student_updated", handleStudentUpdated);
  }, []);

  useEffect(() => {
    const handlePaymentsUpdated = () => {
      const saved = localStorage.getItem("treinopro_payments");
      if (saved) {
        const parsed = (JSON.parse(saved) as Payment[]).filter(
          p => p.studentId !== "stud-seeded-camila" && p.studentId !== "stud-seeded-ricardo"
        );
        setPayments(parsed);
      }
    };
    window.addEventListener("treinopro_payments_updated", handlePaymentsUpdated);
    return () => window.removeEventListener("treinopro_payments_updated", handlePaymentsUpdated);
  }, []);

  useEffect(() => {
    const handleDietsUpdated = () => {
      const saved = localStorage.getItem("treinopro_diets");
      if (saved) {
        const parsed = (JSON.parse(saved) as Diet[]).filter(
          d => d.studentId !== "stud-seeded-camila" && d.studentId !== "stud-seeded-ricardo"
        );
        setDiets(parsed);
      }
    };
    window.addEventListener("treinopro_diets_updated", handleDietsUpdated);
    return () => window.removeEventListener("treinopro_diets_updated", handleDietsUpdated);
  }, []);

  // CRM Actions handlers
  const handleAddStudent = (newStudentData: Omit<Student, "id" | "avatarColor" | "initials" | "missedDays" | "renewalDays" | "lastTrainingDate" | "joinedDate">) => {
    const id = `stud-${Date.now()}`;
    const initials = newStudentData.name
      .split(" ")
      .map(part => part[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();

    const colors = [
      "bg-cyan-500/20 border-cyan-500 text-cyan-400",
      "bg-purple-500/20 border-purple-500 text-purple-400",
      "bg-emerald-500/20 border-emerald-500 text-emerald-400",
      "bg-pink-500/20 border-pink-500 text-pink-400",
      "bg-amber-500/20 border-amber-500 text-amber-400"
    ];
    const avatarColor = colors[Math.floor(Math.random() * colors.length)];

    const student: Student = {
      ...newStudentData,
      id,
      initials,
      avatarColor,
      missedDays: 0,
      renewalDays: 30,
      lastTrainingDate: new Date().toISOString().split("T")[0],
      joinedDate: new Date().toLocaleDateString("pt-BR")
    };

    setStudents([student, ...students]);

    // Add empty invoice payment item for bookkeeping
    const matchedPlan = plans.find(p => p.name === student.plan);
    const price = matchedPlan ? matchedPlan.price : 149.90;
    const payment: Payment = {
      id: `pay-${Date.now()}`,
      studentId: id,
      studentName: student.name,
      amount: price,
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      status: "pending",
      plan: student.plan
    };
    setPayments([payment, ...payments]);
  };

  const handleUpdateStudent = (updatedStudent: Student) => {
    setStudents(prev => prev.map(s => s.id === updatedStudent.id ? updatedStudent : s));
    setPayments(prev => prev.map(p => p.studentId === updatedStudent.id ? { ...p, studentName: updatedStudent.name, plan: updatedStudent.plan } : p));
  };

  const handleDeleteStudent = (id: string) => {
    setStudents(students.filter(s => s.id !== id));
    setWorkouts(workouts.filter(w => w.studentId !== id));
    setDiets(diets.filter(d => d.studentId !== id));
    setPayments(payments.filter(p => p.studentId !== id));
    if (selectedStudentId === id) {
      setSelectedStudentId(null);
    }
  };

  const handleDeleteWorkout = (studentId: string) => {
    setWorkouts(prev => prev.filter(w => w.studentId !== studentId));
    setStudents(prev => prev.map(s => {
      if (s.id === studentId) {
        const { workoutUpdatedDate, ...rest } = s;
        return rest as Student;
      }
      return s;
    }));
  };

  const handleSaveWorkout = (studentId: string, name: string, exercises: Exercise[]) => {
    const todayStr = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
    const existingIdx = workouts.findIndex(w => w.studentId === studentId);
    const updated: Workout = {
      id: existingIdx !== -1 ? workouts[existingIdx].id : `work-${Date.now()}`,
      studentId,
      name,
      lastUpdated: new Date().toLocaleDateString("pt-BR"),
      exercises
    };

    if (existingIdx !== -1) {
      const copy = [...workouts];
      copy[existingIdx] = updated;
      setWorkouts(copy);
    } else {
      setWorkouts([...workouts, updated]);
    }

    setStudents(prev => prev.map(s => {
      if (s.id === studentId) {
        return {
          ...s,
          workoutUpdatedDate: todayStr
        };
      }
      return s;
    }));
  };

  const handleSaveDiet = (studentId: string, calorieTarget: number, proteinTarget: number, carbsTarget: number, fatTarget: number, meals: Meal[]) => {
    const existingIdx = diets.findIndex(d => d.studentId === studentId);
    const updated: Diet = {
      id: existingIdx !== -1 ? diets[existingIdx].id : `diet-${Date.now()}`,
      studentId,
      calorieTarget,
      proteinTarget,
      carbsTarget,
      fatTarget,
      lastUpdated: new Date().toLocaleDateString("pt-BR"),
      meals
    };

    if (existingIdx !== -1) {
      const copy = [...diets];
      copy[existingIdx] = updated;
      setDiets(copy);
    } else {
      setDiets([...diets, updated]);
    }
  };

  // Toggle dynamic invoice status
  const handleTogglePaymentStatus = (paymentId: string) => {
    setPayments(payments.map(p => {
      if (p.id === paymentId) {
        const nextStatus = p.status === "paid" ? "pending" : "paid";
        return {
          ...p,
          status: nextStatus,
          paidDate: nextStatus === "paid" ? new Date().toISOString().split("T")[0] : undefined
        };
      }
      return p;
    }));
  };

  // Trigger Gemini dynamic AI text formulation
  const handleGenerateMessage = async (studentName: string, reason: string, plan: string, phase: string) => {
    setAiModal({
      isOpen: true,
      studentName,
      reason,
      plan,
      phase,
      generatedText: "Escrevendo mensagem customizada de alta performance via Inteligência Artificial...",
      isLoading: true
    });

    let finalCoachName = coachSettings.name;
    try {
      const storedPdfConfig = localStorage.getItem("treinopro_consultoria_config");
      if (storedPdfConfig) {
        const parsed = JSON.parse(storedPdfConfig);
        if (parsed.shortName && parsed.shortName.trim()) {
          finalCoachName = parsed.shortName.trim();
        } else if (parsed.evaluatorName && parsed.evaluatorName.trim()) {
          finalCoachName = parsed.evaluatorName.trim();
        }
      }
    } catch (e) {
      console.error(e);
    }

    try {
      const res = await fetch("/api/generate-message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentName,
          reason,
          plan,
          phase,
          tone: coachSettings.aiTone,
          aiProvider: coachSettings.aiProvider || "gemini",
          coachName: finalCoachName
        })
      });
      const data = await res.json();
      setAiModal(prev => ({
        ...prev,
        generatedText: data.message,
        warning: data.warning,
        isLoading: false
      }));
    } catch (err: any) {
      console.error(err);
      setAiModal(prev => ({
        ...prev,
        generatedText: "Desculpe, ocorreu um erro ao gerar a mensagem dinâmica com o Gemini. Você pode editar o texto de fallback livremente.",
        isLoading: false
      }));
    }
  };

  // Dispatch WhatsApp message
  const handleSendWhatsApp = () => {
    const activeStudent = students.find(s => s.name === aiModal.studentName);
    const phoneNum = activeStudent?.phone ? activeStudent.phone.replace(/[^0-9+]/g, "") : "";
    const text = aiModal.generatedText;
    const url = `https://api.whatsapp.com/send?phone=${phoneNum}&text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
    setAiModal(prev => ({ ...prev, isOpen: false }));
  };

  // Global search trigger
  const handleGlobalSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (globalSearch.trim()) {
      setActiveTab("alunos");
    }
  };

  if (activeTab === "aluno_app") {
    return (
      <AppAlunoView 
        students={students}
        workouts={workouts}
        diets={diets}
        payments={payments}
        onBackToTrainer={() => setActiveTab("dashboard")}
        onUpdateStudent={(updated) => {
          setStudents(prev => {
            const next = prev.map(s => s.id === updated.id ? updated : s);
            localStorage.setItem("treinopro_students", JSON.stringify(next));
            return next;
          });
        }}
        onSaveWorkout={(updated) => {
          setWorkouts(prev => {
            const next = prev.map(w => w.id === updated.id ? updated : w);
            localStorage.setItem("treinopro_workouts", JSON.stringify(next));
            return next;
          });
        }}
        coachSettings={coachSettings}
      />
    );
  }

  return (
    <div className={`flex min-h-screen bg-[#121315] text-[#e3e2e4] font-sans overflow-x-hidden selection:bg-[#00f2ff]/30 ${isDarkMode ? "dark-theme" : "light-theme"}`}>
      
      {/* Sidebar Navigation - Responsive Desktop */}
      <aside className="hidden lg:flex flex-col h-screen sticky top-0 w-64 bg-[#1f2022]/70 backdrop-blur-xl border-r border-[#3a494b]/30 z-40">
        
        {/* Logo Brand Header */}
        <div className="p-6">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 primary-gradient rounded flex items-center justify-center shadow-[0_0_15px_rgba(0,242,255,0.3)]">
              <Dumbbell className="w-5 h-5 text-[#002022]" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-[#00f2ff] tracking-tight leading-none">TreinoPro</h1>
              <span className="font-mono text-[9px] tracking-widest text-[#b9cacb] uppercase">Elite Coaching</span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5 font-mono text-xs">
            
            <button 
              onClick={() => { setActiveTab("dashboard"); setMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-[#00f2ff]/70 outline-none ${
                activeTab === "dashboard" 
                  ? "text-[#00dbe7] bg-[#00f2ff]/10 border-l-2 border-[#00dbe7] font-bold" 
                  : "text-[#b9cacb] hover:text-white hover:bg-[#343537]/50"
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard</span>
            </button>

            <button 
              onClick={() => { setActiveTab("alunos"); setSelectedStudentId(null); setMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-[#00f2ff]/70 outline-none ${
                activeTab === "alunos" 
                  ? "text-[#00dbe7] bg-[#00f2ff]/10 border-l-2 border-[#00dbe7] font-bold" 
                  : "text-[#b9cacb] hover:text-white hover:bg-[#343537]/50"
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Alunos</span>
            </button>

            <button 
              onClick={() => { setActiveTab("treinos"); setMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-[#00f2ff]/70 outline-none ${
                activeTab === "treinos" 
                  ? "text-[#00dbe7] bg-[#00f2ff]/10 border-l-2 border-[#00dbe7] font-bold" 
                  : "text-[#b9cacb] hover:text-white hover:bg-[#343537]/50"
              }`}
            >
              <Dumbbell className="w-4 h-4" />
              <span>Treinos</span>
            </button>

            <button 
              onClick={() => { setActiveTab("dietas"); setMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-[#00f2ff]/70 outline-none ${
                activeTab === "dietas" 
                  ? "text-[#00dbe7] bg-[#00f2ff]/10 border-l-2 border-[#00dbe7] font-bold" 
                  : "text-[#b9cacb] hover:text-white hover:bg-[#343537]/50"
              }`}
            >
              <Utensils className="w-4 h-4" />
              <span>Dieta/Evolução</span>
            </button>

            <button 
              onClick={() => { setActiveTab("financeiro"); setMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-[#00f2ff]/70 outline-none ${
                activeTab === "financeiro" 
                  ? "text-[#00dbe7] bg-[#00f2ff]/10 border-l-2 border-[#00dbe7] font-bold" 
                  : "text-[#b9cacb] hover:text-white hover:bg-[#343537]/50"
              }`}
            >
              <CreditCard className="w-4 h-4" />
              <span>Financeiro</span>
            </button>

            <button 
              onClick={() => { setActiveTab("calendario"); setMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-[#00f2ff]/70 outline-none ${
                activeTab === "calendario" 
                  ? "text-[#00dbe7] bg-[#00f2ff]/10 border-l-2 border-[#00dbe7] font-bold" 
                  : "text-[#b9cacb] hover:text-white hover:bg-[#343537]/50"
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>Calendário</span>
            </button>

            <button 
              onClick={() => { setActiveTab("chat"); setMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-[#00f2ff]/70 outline-none ${
                activeTab === "chat" 
                  ? "text-[#00dbe7] bg-[#00f2ff]/10 border-l-2 border-[#00dbe7] font-bold" 
                  : "text-[#b9cacb] hover:text-white hover:bg-[#343537]/50"
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span>Chat de Alunos</span>
            </button>

            <button 
              onClick={() => { setActiveTab("relatorios"); setMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-[#00f2ff]/70 outline-none ${
                activeTab === "relatorios" 
                  ? "text-[#00dbe7] bg-[#00f2ff]/10 border-l-2 border-[#00dbe7] font-bold" 
                  : "text-[#b9cacb] hover:text-white hover:bg-[#343537]/50"
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Relatórios (PDF)</span>
            </button>

            <button 
              onClick={() => { setActiveTab("gamificacao"); setMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-[#00f2ff]/70 outline-none ${
                activeTab === "gamificacao" 
                  ? "text-[#00dbe7] bg-[#00f2ff]/10 border-l-2 border-[#00dbe7] font-bold" 
                  : "text-[#b9cacb] hover:text-white hover:bg-[#343537]/50"
              }`}
            >
              <Flame className="w-4 h-4" />
              <span>Gamificação</span>
            </button>

            <button 
              onClick={() => { setActiveTab("configuracoes"); setMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-[#00f2ff]/70 outline-none ${
                activeTab === "configuracoes" 
                  ? "text-[#00dbe7] bg-[#00f2ff]/10 border-l-2 border-[#00dbe7] font-bold" 
                  : "text-[#b9cacb] hover:text-white hover:bg-[#343537]/50"
              }`}
            >
              <Settings className="w-4 h-4" />
              <span>Configurações</span>
            </button>

          </nav>
        </div>

        {/* Bottom Profile Widget */}
        <div className="mt-auto p-4 border-t border-[#3a494b]/20 space-y-3.5">
          {/* Theme/Appearance Toggle Widget */}
          <div className="flex items-center justify-between bg-[#121315]/40 border border-[#3a494b]/20 rounded-xl p-2 font-mono text-[10px]">
            <span className="text-[#b9cacb] pl-1 font-semibold uppercase tracking-wider">Aparência</span>
            <button
              type="button"
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#121315] text-[#e3e2e4] border border-[#3a494b]/30 hover:border-[#00f2ff]/50 transition-all cursor-pointer shadow-inner font-bold"
            >
              {isDarkMode ? (
                <>
                  <Sun className="w-3.5 h-3.5 text-amber-400" />
                  <span>Modo Claro</span>
                </>
              ) : (
                <>
                  <Moon className="w-3.5 h-3.5 text-[#ebb2ff]" />
                  <span>Modo Escuro</span>
                </>
              )}
            </button>
          </div>

          <button
            onClick={() => { setActiveTab("alunos"); setSelectedStudentId(null); }}
            className="w-full primary-gradient text-[#002022] py-2.5 px-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:opacity-90 active:scale-95 transition-all shadow-[0_0_15px_rgba(0,242,255,0.2)] text-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Novo Aluno
          </button>

          {/* Coach Identity info */}
          <div className="flex items-center gap-3 p-1">
            <img 
              alt="Coach Avatar" 
              src={coachSettings.avatarUrl}
              className="w-10 h-10 rounded-full border border-[#00f2ff]/30 object-cover"
            />
            <div className="overflow-hidden">
              <p className="font-bold text-xs text-[#e3e2e4] truncate leading-tight">{coachSettings.name}</p>
              <p className="text-[10px] text-[#b9cacb] truncate font-mono mt-0.5">{coachSettings.email}</p>
            </div>
          </div>
        </div>

      </aside>

      {/* Mobile Floating Drawer Trigger */}
      <button 
        type="button"
        onClick={() => setMobileMenuOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-40 bg-[#1f2022]/85 backdrop-blur-md hover:bg-[#1b1c1e] text-[#e3e2e4] p-2.5 rounded-xl border border-[#3a494b]/30 shadow-lg active:scale-95 transition-all cursor-pointer flex items-center justify-center"
        aria-label="Abrir Menu"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Mobile Header Bar & Drawer Toggle */}
      <div className="flex flex-col flex-1 min-w-0 relative lg:z-50">

        {/* Mobile Navigation Drawer Overlay */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)}></div>
            <aside className="absolute left-0 top-0 bottom-0 w-64 bg-[#121315] border-r border-[#3a494b]/30 p-6 flex flex-col justify-between">
              
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Dumbbell className="w-6 h-6 text-[#00f2ff]" />
                    <span className="font-bold text-lg text-white font-mono uppercase">TreinoPro</span>
                  </div>
                  <button onClick={() => setMobileMenuOpen(false)} className="p-1 text-gray-400 hover:text-white cursor-pointer">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <nav className="space-y-1 font-mono text-xs">
                  {["dashboard", "alunos", "treinos", "dietas", "financeiro", "calendario", "chat", "relatorios", "gamificacao", "configuracoes"].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => { 
                        setActiveTab(tab); 
                        if (tab === "alunos") {
                          setSelectedStudentId(null);
                        }
                        setMobileMenuOpen(false); 
                      }}
                      className={`w-full text-left px-4 py-3 rounded-lg capitalize transition-all cursor-pointer ${
                        activeTab === tab ? "bg-[#00f2ff]/10 text-[#00dbe7] font-bold" : "text-[#b9cacb] hover:bg-[#1b1c1e]"
                      }`}
                    >
                      {tab === "configuracoes" 
                        ? "Configurações" 
                        : tab === "dietas"
                        ? "Dieta/Evolução"
                        : tab === "financeiro"
                        ? "Financeiro"
                        : tab === "calendario"
                        ? "Calendário"
                        : tab === "chat"
                        ? "Chat de Alunos"
                        : tab === "relatorios"
                        ? "Relatórios (PDF)"
                        : tab === "gamificacao"
                        ? "Gamificação"
                        : tab}
                    </button>
                  ))}
                </nav>
              </div>

              {/* Mobile Drawer Footer with Theme Switcher */}
              <div className="space-y-4 pt-4 border-t border-[#3a494b]/20">
                <div className="flex items-center justify-between bg-[#121315]/40 border border-[#3a494b]/20 rounded-xl p-2 font-mono text-[10px]">
                  <span className="text-[#b9cacb] pl-1 font-semibold uppercase tracking-wider">Aparência</span>
                  <button
                    type="button"
                    onClick={() => setIsDarkMode(!isDarkMode)}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#121315] text-[#e3e2e4] border border-[#3a494b]/30 hover:border-[#00f2ff]/50 transition-all cursor-pointer shadow-inner font-bold"
                  >
                    {isDarkMode ? (
                      <>
                        <Sun className="w-3.5 h-3.5 text-amber-400" />
                        <span>Claro</span>
                      </>
                    ) : (
                      <>
                        <Moon className="w-3.5 h-3.5 text-[#ebb2ff]" />
                        <span>Escuro</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

            </aside>
          </div>
        )}

        {/* Main Canvas Viewport container */}
        <main className="flex-1 p-4 pt-20 lg:p-10 relative z-10 overflow-y-auto">
          
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.15 }}
            >
              {activeTab === "dashboard" && (
                <DashboardView 
                  students={students}
                  payments={payments}
                  workouts={workouts}
                  diets={diets}
                  onGenerateMessage={handleGenerateMessage}
                  onNavigateToTab={setActiveTab}
                  initialSection={dashboardSection}
                  initialStudentId={selectedStudentId}
                  onSectionChange={setDashboardSection}
                  onSaveWorkout={handleSaveWorkout}
                />
              )}

              {activeTab === "alunos" && (
                <AlunosView 
                  students={students}
                  plans={plans}
                  workouts={workouts}
                  diets={diets}
                  payments={payments}
                  selectedStudentId={selectedStudentId}
                  onSelectStudent={setSelectedStudentId}
                  onAddStudent={handleAddStudent}
                  onUpdateStudent={handleUpdateStudent}
                  onDeleteStudent={handleDeleteStudent}
                  onDeleteWorkout={handleDeleteWorkout}
                  onSaveWorkout={handleSaveWorkout}
                  onSelectStudentForWorkout={(id) => { setSelectedStudentId(id); setActiveTab("treinos"); }}
                  onSelectStudentForDiet={(id) => { setSelectedStudentId(id); setActiveTab("dietas"); }}
                />
              )}

              {activeTab === "treinos" && (
                <TreinosView 
                  students={students}
                  workouts={workouts}
                  selectedStudentId={selectedStudentId}
                  onSaveWorkout={handleSaveWorkout}
                  onSelectStudent={setSelectedStudentId}
                />
              )}

              {activeTab === "dietas" && (
                <DietasView 
                  students={students}
                  diets={diets}
                  selectedStudentId={selectedStudentId}
                  onSaveDiet={handleSaveDiet}
                  onSelectStudent={setSelectedStudentId}
                  onUpdateStudent={handleUpdateStudent}
                />
              )}

              {activeTab === "financeiro" && (
                <FinanceiroView 
                  payments={payments}
                  onTogglePaymentStatus={handleTogglePaymentStatus}
                  monthlyGoal={coachSettings.monthlyGoal}
                  plans={plans}
                  onUpdatePlans={setPlans}
                />
              )}

              {activeTab === "calendario" && (
                <CalendarioView 
                  students={students}
                />
              )}

              {activeTab === "chat" && (
                <ChatView 
                  students={students}
                />
              )}

              {activeTab === "relatorios" && (
                <RelatoriosView 
                  students={students}
                />
              )}

              {activeTab === "gamificacao" && (
                <GamificacaoView 
                  students={students}
                  isLightTheme={!isDarkMode}
                />
              )}

              {activeTab === "configuracoes" && (
                <ConfiguracoesView 
                  settings={coachSettings}
                  onSaveSettings={setCoachSettings}
                />
              )}
            </motion.div>
          </AnimatePresence>

        </main>

      </div>

      {/* AI Messages Modal Overlay */}
      {aiModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setAiModal(prev => ({ ...prev, isOpen: false }))}></div>
          
          <div className="glass-panel w-full max-w-lg rounded-xl relative shadow-[0_0_40px_rgba(182,1,248,0.25)] overflow-hidden">
            
            {/* Header */}
            <div className="p-5 border-b border-[#3a494b]/30 flex justify-between items-center bg-[#ccff00]/5">
              <div className="flex items-center gap-2.5">
                <Sparkles className="w-5 h-5 text-[#ebb2ff]" />
                <h3 className="font-bold text-base text-white font-mono">Sugestão de Mensagem IA</h3>
              </div>
              <button 
                onClick={() => setAiModal(prev => ({ ...prev, isOpen: false }))} 
                className="text-[#b9cacb] hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Message Body */}
            <div className="p-5 space-y-4 font-mono text-xs">
              
              {/* Recipient badge details */}
              <div className="bg-[#1b1c1e] p-2.5 rounded-lg border border-[#3a494b]/15 text-[10px] text-[#b9cacb] space-y-1">
                <p>Destinatário: <b className="text-[#e3e2e4]">{aiModal.studentName}</b></p>
                <p>Situação Mapeada: <span className="text-[#ebb2ff] font-bold">{aiModal.reason}</span></p>
              </div>

              {/* Text Area */}
              <div className="relative">
                {aiModal.isLoading ? (
                  <div className="h-44 bg-[#121315]/80 rounded-lg border border-[#3a494b]/30 flex flex-col items-center justify-center gap-3">
                    <Loader2 className="w-6 h-6 text-[#00f2ff] animate-spin" />
                    <span className="text-gray-400 text-[10px] animate-pulse">Sintetizando jargões de alta performance...</span>
                  </div>
                ) : (
                  <textarea
                    rows={7}
                    value={aiModal.generatedText}
                    onChange={(e) => setAiModal({ ...aiModal, generatedText: e.target.value })}
                    className="w-full bg-[#1b1c1e] border border-[#3a494b]/40 focus:border-[#ccff00] text-white px-3 py-2 rounded-lg outline-none transition-all text-[11px] leading-relaxed whitespace-pre-wrap"
                  ></textarea>
                )}
              </div>

              {/* API Warnings / Tips */}
              {aiModal.warning && (
                <div className="flex items-start gap-2 text-[9px] text-[#00dbe7] bg-[#00f2ff]/5 border border-[#00f2ff]/20 p-2.5 rounded-lg leading-relaxed">
                  <Info className="w-4.5 h-4.5 text-[#00dbe7] shrink-0 mt-0.5" />
                  <span>{aiModal.warning}</span>
                </div>
              )}

              <div className="flex items-center gap-1.5 text-[9px] text-gray-400 italic">
                <Info className="w-3.5 h-3.5" />
                <span>Esta mensagem foi gerada considerando a fase de <b>{aiModal.phase}</b> no {aiModal.plan}.</span>
              </div>

            </div>

            {/* Footer Buttons */}
            <div className="p-5 pt-0 flex gap-3">
              <button
                onClick={() => setAiModal(prev => ({ ...prev, isOpen: false }))}
                className="flex-1 px-4 py-3 rounded-xl border border-[#3a494b]/40 text-[#e3e2e4] font-bold text-xs hover:bg-[#343537] transition-all font-mono cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={handleSendWhatsApp}
                disabled={aiModal.isLoading}
                className="flex-[2] primary-gradient text-[#002022] px-4 py-3 rounded-xl font-mono font-bold text-xs flex items-center justify-center gap-2 hover:shadow-[0_0_15px_rgba(0,242,255,0.4)] active:scale-95 transition-all disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
              >
                <Send className="w-4 h-4" />
                Enviar via WhatsApp
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Global Animated Toast Notification System */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 350, damping: 30 }}
            className="fixed bottom-6 right-6 z-50 max-w-sm w-full bg-[#1b1c1e]/95 backdrop-blur-md border border-[#3a494b]/40 rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.5)] overflow-hidden pointer-events-auto"
            id="global-toast-notification"
          >
            <style>{`
              @keyframes progress-timer {
                from { width: 100%; }
                to { width: 0%; }
              }
            `}</style>
            <div className="p-4 flex gap-3.5 items-start">
              <div className="shrink-0 mt-0.5">
                {toast.type === "success" && (
                  <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/20">
                    <CheckCircle2 className="w-4.5 h-4.5" />
                  </div>
                )}
                {toast.type === "warning" && (
                  <div className="w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-400 border border-amber-500/20">
                    <AlertTriangle className="w-4.5 h-4.5" />
                  </div>
                )}
                {toast.type === "info" && (
                  <div className="w-8 h-8 rounded-full bg-[#00f2ff]/10 flex items-center justify-center text-[#00f2ff] border border-[#00f2ff]/20">
                    <Info className="w-4.5 h-4.5" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-xs font-mono font-bold tracking-wider uppercase mb-0.5 ${
                  toast.type === "success" ? "text-emerald-400" : toast.type === "warning" ? "text-amber-400" : "text-[#00f2ff]"
                }`}>
                  {toast.title}
                </p>
                <p className="text-[11px] text-[#b9cacb] leading-relaxed whitespace-pre-wrap font-sans">
                  {toast.message}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setToast(null)}
                className="shrink-0 p-1 text-gray-400 hover:text-white rounded-lg hover:bg-white/5 transition-all cursor-pointer"
                aria-label="Fechar"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            {/* Elegant progress timer bar */}
            <div 
              className={`h-1 bg-gradient-to-r ${
                toast.type === "success" 
                  ? "from-emerald-500 to-teal-400" 
                  : toast.type === "warning" 
                  ? "from-amber-500 to-orange-400" 
                  : "from-[#00f2ff] to-[#00dbe7]"
              }`} 
              style={{ animation: 'progress-timer 4000ms linear forwards' }} 
            />
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
