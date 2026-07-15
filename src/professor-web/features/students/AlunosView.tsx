/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from "react";
import { 
  Search, 
  UserPlus, 
  Filter, 
  Trash2, 
  Calendar, 
  Phone, 
  Mail, 
  User, 
  Activity, 
  Dumbbell, 
  Utensils, 
  X,
  Plus,
  Pencil,
  Info,
  Percent,
  Sparkles,
  CreditCard,
  Heart,
  Smile,
  FileText,
  Edit,
  TrendingUp,
  ChevronDown,
  ChevronUp,
  Save,
  ArrowLeft,
  RefreshCw,
  ArrowUpRight,
  Archive
} from "lucide-react";
import { Student, Plan, Workout, Diet, Payment, Meal, Exercise } from "../../../types";
import { AnimatePresence, motion } from "motion/react";
import { ADVANCED_TECHNIQUES_INFO } from "../dashboard/DashboardView";

interface AlunosViewProps {
  students: Student[];
  plans: Plan[];
  workouts: Workout[];
  diets: Diet[];
  payments: Payment[];
  selectedStudentId: string | null;
  onSelectStudent: (id: string | null) => void;
  onAddStudent: (student: Omit<Student, "id" | "avatarColor" | "initials" | "missedDays" | "renewalDays" | "lastTrainingDate" | "joinedDate">) => void;
  onUpdateStudent: (student: Student) => void;
  onDeleteStudent: (id: string) => void;
  onDeleteWorkout: (studentId: string) => void;
  onSaveWorkout?: (studentId: string, workoutName: string, exercises: Exercise[]) => void;
  onSelectStudentForWorkout: (studentId: string) => void;
  onSelectStudentForDiet: (studentId: string) => void;
}

export default function AlunosView({
  students,
  plans,
  workouts,
  diets,
  payments,
  selectedStudentId,
  onSelectStudent,
  onAddStudent,
  onUpdateStudent,
  onDeleteStudent,
  onDeleteWorkout,
  onSaveWorkout,
  onSelectStudentForWorkout,
  onSelectStudentForDiet
}: AlunosViewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<"all" | "active" | "inactive" | "pending_renewal">("all");
  
  const [isLightTheme, setIsLightTheme] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("treinopro_theme");
      if (saved) return saved === "light";
    }
    return false;
  });

  useEffect(() => {
    const checkTheme = () => {
      const saved = localStorage.getItem("treinopro_theme");
      setIsLightTheme(saved ? saved === "light" : false);
    };
    checkTheme();
    const interval = setInterval(checkTheme, 500);
    return () => clearInterval(interval);
  }, []);
  
  // 360 Athlete Space States
  const [active360Tab, setActive360Tab] = useState<"resumo" | "treino" | "dieta" | "avaliacao" | "financeiro">("resumo");
  const [activeDivisionTab, setActiveDivisionTab] = useState<string>("A");
  const [isEditingWorkout, setIsEditingWorkout] = useState(false);
  const [editedWorkoutName, setEditedWorkoutName] = useState("");
  const [editedExercises, setEditedExercises] = useState<Exercise[]>([]);
  const [selectedTechniqueHelp, setSelectedTechniqueHelp] = useState<string | null>(null);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  // Advanced States
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [newStatus, setNewStatus] = useState<"active" | "inactive" | "pending_renewal">("active");
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);
  const [selectedWorkoutDetail, setSelectedWorkoutDetail] = useState<Workout | null>(null);
  const [isDeleteWorkoutConfirmOpen, setIsDeleteWorkoutConfirmOpen] = useState(false);

  // Renewal plan state variables
  const [isRenewModalOpen, setIsRenewModalOpen] = useState(false);
  const [renewPlan, setRenewPlan] = useState("");
  const [renewPeriod, setRenewPeriod] = useState<"mensal" | "trimestral" | "semestral" | "anual">("mensal");
  const [renewValue, setRenewValue] = useState<number>(0);

  useEffect(() => {
    if (!isRenewModalOpen) return;
    const matched = plans.find(p => p.name === renewPlan);
    const planPrice = matched ? matched.price : 149.90;
    let multiplier = 1;
    if (renewPeriod === "trimestral") multiplier = 3;
    else if (renewPeriod === "semestral") multiplier = 6;
    else if (renewPeriod === "anual") multiplier = 12;
    setRenewValue(planPrice * multiplier);
  }, [renewPlan, renewPeriod, plans, isRenewModalOpen]);

  // Open Edit student form
  const handleOpenEdit = (student: Student) => {
    setEditingStudent(student);
    setNewName(student.name);
    setNewEmail(student.email);
    setNewPassword(student.password || "123456");
    setNewPhone(student.phone);
    setNewPlan(student.plan);
    setNewPhase(student.currentPhase);
    setNewWeight(student.weight ? String(student.weight) : "");
    setNewHeight(student.height ? String(student.height < 3 ? Math.round(student.height * 100) : student.height) : "");
    setNewAge(student.age ? String(student.age) : "");
    setNewBirthDate(student.birthDate || "");
    setNewGender(student.gender || "masculino");
    setNewStatus(student.status);
    setNewLimitations(student.limitations || "");
    setNewObservations(student.observations || "");
    setIsAddModalOpen(true);
  };

  const handleOpenAdd = () => {
    setEditingStudent(null);
    setNewName("");
    setNewEmail("");
    setNewPassword("123456");
    setNewPhone("");
    setNewPlan(plans[0]?.name || "Platinum");
    setNewPhase("Hipertrofia");
    setNewWeight("");
    setNewHeight("");
    setNewAge("");
    setNewBirthDate("");
    setNewGender("masculino");
    setNewStatus("active");
    setNewLimitations("");
    setNewObservations("");
    setIsAddModalOpen(true);
  };

  const handleCancelForm = () => {
    setIsAddModalOpen(false);
    setEditingStudent(null);
  };

  // Import students states
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importText, setImportText] = useState("");
  const [importError, setImportError] = useState<string | null>(null);

  const handleImportStudents = () => {
    try {
      setImportError(null);
      const text = importText.trim();
      if (!text) {
        setImportError("O campo de texto está vazio.");
        return;
      }

      let parsedStudents: any[] = [];

      // Try to parse as JSON first
      if (text.startsWith("[") || text.startsWith("{")) {
        const parsed = JSON.parse(text);
        parsedStudents = Array.isArray(parsed) ? parsed : [parsed];
      } else {
        // Fallback to CSV / Comma Separated lines
        // Expected columns: Nome, Email, Telefone, Plano, Fase, Limitacoes, Observacoes
        const lines = text.split("\n");
        lines.forEach((line, index) => {
          if (!line.trim()) return;
          const parts = line.split(",").map(p => p.trim());
          if (parts.length >= 2) {
            // Check if first line is headers
            if (index === 0 && (parts[0].toLowerCase().includes("nome") || parts[1].toLowerCase().includes("email"))) {
              return; // Skip header line
            }
            parsedStudents.push({
              name: parts[0],
              email: parts[1],
              phone: parts[2] || "+55 (11) 90000-0000",
              plan: parts[3] || "Platinum",
              currentPhase: parts[4] || "Hipertrofia",
              limitations: parts[5] || undefined,
              observations: parts[6] || undefined,
            });
          }
        });
      }

      if (parsedStudents.length === 0) {
        setImportError("Nenhum aluno válido pôde ser importado. Verifique o formato.");
        return;
      }

      // Add each student using onAddStudent
      parsedStudents.forEach(stud => {
        if (!stud.name || !stud.email) return;
        onAddStudent({
          name: stud.name,
          email: stud.email,
          phone: stud.phone || "+55 (11) 90000-0000",
          plan: stud.plan || "Platinum",
          status: "active",
          currentPhase: stud.currentPhase || "Hipertrofia",
          weight: stud.weight ? Number(stud.weight) : undefined,
          height: stud.height ? Number(stud.height) : undefined,
          age: stud.age ? Number(stud.age) : undefined,
          gender: stud.gender || "masculino",
          limitations: stud.limitations || undefined,
          observations: stud.observations || undefined
        });
      });

      // Reset state and close modal
      setImportText("");
      setIsImportModalOpen(false);
    } catch (err: any) {
      setImportError(`Erro ao processar os dados: ${err.message || err}`);
    }
  };

  // Reset states when selected student changes
  useEffect(() => {
    setIsConfirmingDelete(false);
    setIsEditingWorkout(false);
    setSelectedTechniqueHelp(null);
    setActiveDivisionTab("A");
  }, [selectedStudentId]);

  // Sync available students list with selected ID
  useEffect(() => {
    if (selectedStudentId && !students.some(s => s.id === selectedStudentId)) {
      onSelectStudent(null);
    }
  }, [students, selectedStudentId, onSelectStudent]);

  // Form states for new student
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newPlan, setNewPlan] = useState<string>(() => plans[0]?.name || "Platinum");
  const [newPhase, setNewPhase] = useState("Hipertrofia");
  const [newWeight, setNewWeight] = useState("");
  const [newHeight, setNewHeight] = useState("");
  const [newAge, setNewAge] = useState("");
  const [newBirthDate, setNewBirthDate] = useState("");
  const [newGender, setNewGender] = useState<"masculino" | "feminino">("masculino");
  const [newLimitations, setNewLimitations] = useState("");
  const [newObservations, setNewObservations] = useState("");

  // Calculate age from birth date helper
  const calculateAgeFromBirthDate = (birthDateStr: string) => {
    if (!birthDateStr) return "";
    const birthDateObj = new Date(birthDateStr);
    if (isNaN(birthDateObj.getTime())) return "";
    const today = new Date();
    let age = today.getFullYear() - birthDateObj.getFullYear();
    const monthDiff = today.getMonth() - birthDateObj.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDateObj.getDate())) {
      age--;
    }
    return String(age);
  };

  // Global exercise states for fast registration within sheets
  const [showAddGlobalExModal, setShowAddGlobalExModal] = useState(false);
  const [newGlobalExName, setNewGlobalExName] = useState("");
  const [newGlobalExGroup, setNewGlobalExGroup] = useState("Peitoral");
  const [newGlobalExType, setNewGlobalExType] = useState<"Composto" | "Isolado">("Composto");
  const [newGlobalExReps, setNewGlobalExReps] = useState("8-12");
  const [globalMuscExercises, setGlobalMuscExercises] = useState<string[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("TreinoPro_Musculacao_Exercises");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setGlobalMuscExercises(parsed.map((e: any) => e.nome));
        }
      }
    } catch (e) {
      console.error("Error loading global exercises suggestions:", e);
    }
  }, [isEditingWorkout]);

  const handleAddGlobalExercise = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGlobalExName.trim()) return;

    try {
      const stored = localStorage.getItem("TreinoPro_Musculacao_Exercises") || "[]";
      let list = JSON.parse(stored);
      if (!Array.isArray(list)) list = [];

      // Avoid duplicate names
      if (list.some((ex: any) => ex.nome.toLowerCase() === newGlobalExName.trim().toLowerCase())) {
        alert("Já existe um exercício com este nome no banco global!");
        return;
      }

      const newItem = {
        nome: newGlobalExName.trim(),
        grupo: newGlobalExGroup,
        tipo: newGlobalExType,
        reps: newGlobalExReps || "8-12",
        sinergistas: [],
        desativado: false
      };

      const updatedList = [newItem, ...list];
      localStorage.setItem("TreinoPro_Musculacao_Exercises", JSON.stringify(updatedList));
      
      // Update local state so suggestions update instantly
      setGlobalMuscExercises(updatedList.map((e: any) => e.nome));

      // Reset Form and close
      setNewGlobalExName("");
      setNewGlobalExGroup("Peitoral");
      setNewGlobalExType("Composto");
      setNewGlobalExReps("8-12");
      setShowAddGlobalExModal(false);

      alert(`Exercício "${newItem.nome}" cadastrado com sucesso no Banco Global!`);
    } catch (err) {
      console.error(err);
      alert("Houve um erro ao salvar o exercício.");
    }
  };

  const handleOpenRenewModal = () => {
    if (!selectedStudent) return;
    const initialPlan = selectedStudent.plan || plans[0]?.name || "";
    setRenewPlan(initialPlan);
    setRenewPeriod("mensal");
    
    // Calculate initial price
    const matched = plans.find(p => p.name === initialPlan);
    const initialPrice = matched ? matched.price : 149.90;
    setRenewValue(initialPrice);
    
    setIsRenewModalOpen(true);
  };

  const handleRenewPlan = () => {
    if (!selectedStudent) return;
    
    // 1. Base date logic (respect previous expiration if in the future)
    let baseDate = new Date();
    if (selectedStudent.renewalDueDate) {
      const prevDue = new Date(selectedStudent.renewalDueDate + "T00:00:00");
      if (prevDue > baseDate) {
        baseDate = prevDue;
      }
    }
    
    // 2. Add period to baseDate
    const newDueDate = new Date(baseDate);
    let daysToAdd = 30;
    if (renewPeriod === "trimestral") daysToAdd = 90;
    else if (renewPeriod === "semestral") daysToAdd = 180;
    else if (renewPeriod === "anual") daysToAdd = 365;
    
    newDueDate.setDate(newDueDate.getDate() + daysToAdd);
    const newDueDateStr = newDueDate.toISOString().split("T")[0];
    
    // 3. Calculate renewal days
    const today = new Date();
    today.setHours(0,0,0,0);
    const due = new Date(newDueDate);
    due.setHours(0,0,0,0);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
    
    // 4. Retrieve logged in Coach settings or name
    const coachSettingsStr = localStorage.getItem("treinopro_settings");
    const coachSettings = coachSettingsStr ? JSON.parse(coachSettingsStr) : null;
    const coachName = coachSettings?.name || "Admin/Coach";
    
    // 5. Renewal history record
    const newRenewalRecord = {
      id: `renewal-${Date.now()}`,
      date: new Date().toLocaleDateString("pt-BR"),
      plan: renewPlan,
      period: renewPeriod,
      amount: renewValue,
      dueDate: newDueDateStr,
      by: coachName
    };
    
    // 6. Update student
    const previousHistory = (selectedStudent as any).renewalsHistory || [];
    const updatedStudent: Student = {
      ...selectedStudent,
      plan: renewPlan,
      status: "active", // Updated automatically to active
      renewalDueDate: newDueDateStr,
      renewalDays: diffDays,
      renewalsHistory: [...previousHistory, newRenewalRecord] as any
    };
    
    onUpdateStudent(updatedStudent);
    
    // 7. Add new invoice / payment
    const newPayment: Payment = {
      id: `pay-renewal-${Date.now()}`,
      studentId: selectedStudent.id,
      studentName: selectedStudent.name,
      amount: renewValue,
      dueDate: newDueDateStr,
      status: "paid",
      paidDate: new Date().toISOString().split("T")[0],
      plan: renewPlan
    };
    
    const savedPaymentsStr = localStorage.getItem("treinopro_payments");
    const currentPayments: Payment[] = savedPaymentsStr ? JSON.parse(savedPaymentsStr) : payments;
    const updatedPayments = [newPayment, ...currentPayments];
    localStorage.setItem("treinopro_payments", JSON.stringify(updatedPayments));
    
    // Notify App.tsx to reload payments
    window.dispatchEvent(new Event("treinopro_payments_updated"));
    
    setIsRenewModalOpen(false);
    alert(`Plano renovado com sucesso para o atleta ${selectedStudent.name}! Novo vencimento: ${newDueDateStr}`);
  };

  // Filters students based on search and status tabs
  const filteredStudents = useMemo(() => {
    return students.filter(student => {
      const matchesSearch = student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            student.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            student.phone.includes(searchQuery);
      
      if (activeFilter === "all") return matchesSearch;
      return student.status === activeFilter && matchesSearch;
    });
  }, [students, searchQuery, activeFilter]);

  // Selected student full details
  const selectedStudent = useMemo(() => {
    if (!selectedStudentId) return null;
    return students.find(s => s.id === selectedStudentId) || null;
  }, [students, selectedStudentId]);

  // Calculate BMI
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newEmail) return;
    
    if (editingStudent) {
      onUpdateStudent({
        ...editingStudent,
        name: newName,
        email: newEmail,
        password: newPassword || "123456",
        phone: newPhone || "+55 (11) 90000-0000",
        plan: newPlan,
        currentPhase: newPhase || "Fase de Adaptação",
        weight: newWeight ? parseFloat(newWeight) : undefined,
        height: (() => {
          if (!newHeight) return undefined;
          const val = parseFloat(newHeight);
          return val < 3 ? Math.round(val * 100) : Math.round(val);
        })(),
        age: newAge ? parseInt(newAge) : undefined,
        birthDate: newBirthDate || undefined,
        gender: newGender,
        status: newStatus,
        limitations: newLimitations || undefined,
        observations: newObservations || undefined,
        initials: newName
          .split(" ")
          .map(part => part[0])
          .join("")
          .substring(0, 2)
          .toUpperCase()
      });
    } else {
      onAddStudent({
        name: newName,
        email: newEmail,
        password: newPassword || "123456",
        phone: newPhone || "+55 (11) 90000-0000",
        plan: newPlan,
        status: "active",
        currentPhase: newPhase || "Fase de Adaptação",
        weight: newWeight ? parseFloat(newWeight) : undefined,
        height: (() => {
          if (!newHeight) return undefined;
          const val = parseFloat(newHeight);
          return val < 3 ? Math.round(val * 100) : Math.round(val);
        })(),
        age: newAge ? parseInt(newAge) : undefined,
        birthDate: newBirthDate || undefined,
        gender: newGender,
        limitations: newLimitations || undefined,
        observations: newObservations || undefined
      });
    }

    // Reset fields
    setNewName("");
    setNewEmail("");
    setNewPassword("");
    setNewPhone("");
    setNewPlan(plans[0]?.name || "Platinum");
    setNewPhase("Hipertrofia");
    setNewWeight("");
    setNewHeight("");
    setNewAge("");
    setNewBirthDate("");
    setNewGender("masculino");
    setNewStatus("active");
    setNewLimitations("");
    setNewObservations("");
    setEditingStudent(null);
    setIsAddModalOpen(false);
  };

  const planBadgeClass = (plan: string) => {
    switch (plan) {
      case "Elite Performance":
        return "border-[#00f2ff]/40 text-[#00dbe7] bg-[#00f2ff]/5";
      case "Platinum":
        return "border-[#ebb2ff]/40 text-[#ebb2ff] bg-[#ccff00]/5";
      default:
        return "border-gray-500/40 text-gray-300 bg-gray-500/5";
    }
  };

  const statusBadgeClass = (status: string) => {
    switch (status) {
      case "active":
        return "border-emerald-500/30 text-emerald-400 bg-emerald-500/5";
      case "inactive":
        return "border-red-500/30 text-red-400 bg-red-500/5";
      default:
        return "border-amber-500/30 text-amber-400 bg-amber-500/5";
    }
  };

  const statusName = (status: string) => {
    switch (status) {
      case "active": return "Ativo";
      case "inactive": return "Inativo";
      default: return "Pendente";
    }
  };

  return (
    <div id="alunos-view" className="space-y-6">
      
      {!selectedStudent && (
        <>
          {/* Header Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className={`text-3xl font-black tracking-tight uppercase flex items-center gap-2 ${isLightTheme ? "text-gray-900" : "text-white"}`}>
            <span className="bg-[#00f2ff] w-1.5 h-7 rounded-full inline-block"></span>
            Gerenciamento de Alunos
          </h2>
          <p className={`${isLightTheme ? "text-gray-600" : "text-[#b9cacb]"} text-sm mt-1`}>Monitore a evolução, prescreva treinos e dietas e gerencie o status dos seus atletas.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <button
            onClick={() => setIsImportModalOpen(true)}
            className="border border-[#3a494b]/40 hover:border-[#00f2ff]/40 text-[#e3e2e4] py-2.5 px-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-[#343537]/20 transition-all text-xs uppercase tracking-wider cursor-pointer"
          >
            <Archive className="w-4 h-4" />
            Importar Alunos
          </button>
          
          <button
            onClick={handleOpenAdd}
            className="bg-gradient-to-r from-[#00f2ff] to-[#ccff00] text-black py-2.5 px-5 rounded-xl font-black flex items-center justify-center gap-2 hover:shadow-[0_0_20px_rgba(0,242,255,0.4)] hover:scale-[1.03] transition-all active:scale-95 text-xs uppercase tracking-wider cursor-pointer"
          >
            <UserPlus className="w-4 h-4 text-black stroke-[3px]" />
            Cadastrar Aluno
          </button>
        </div>
      </div>

      <div className="space-y-4">
        
        {/* Search & Filter Pills */}
        <div className={`glass-panel p-4 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 border ${
          isLightTheme ? "bg-white border-gray-200" : "bg-[#17181a]/90 border-white/5"
        } shadow-xl`}>
          <div className="relative group flex-1 max-w-md w-full">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#b9cacb]/60 group-focus-within:text-[#00f2ff] transition-colors" />
            <input
              type="text"
              placeholder="PROCURAR ATLETA..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full ${
                isLightTheme 
                  ? "bg-white border-gray-300 text-gray-900 focus:border-cyan-500/50" 
                  : "bg-[#0f1011] border-white/5 text-[#e3e2e4] focus:border-[#00f2ff]/50"
              } border focus:ring-1 focus:ring-[#00f2ff]/20 pl-11 pr-4 py-2.5 rounded-xl text-xs font-mono transition-all outline-none placeholder-[#b9cacb]/40 uppercase tracking-wider`}
            />
          </div>
          
          <div className="flex flex-wrap gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => setActiveFilter("all")}
              className={`px-3 py-1.5 rounded-lg text-[9px] font-mono font-black uppercase tracking-wider transition-all cursor-pointer ${
                activeFilter === "all"
                  ? "bg-[#00f2ff]/15 text-[#00f2ff] border border-[#00f2ff]/40 shadow-[0_0_10px_rgba(0,242,255,0.1)]"
                  : `${isLightTheme ? "bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200" : "bg-[#0f1011] text-[#b9cacb]/70 border-white/5 hover:text-white hover:bg-white/[0.03]"} border`
              }`}
            >
              Todos ({students.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter("active")}
              className={`px-3 py-1.5 rounded-lg text-[9px] font-mono font-black uppercase tracking-wider transition-all cursor-pointer ${
                activeFilter === "active"
                  ? "bg-[#00f2ff]/15 text-[#00dbe7] border border-[#00f2ff]/40 shadow-[0_0_10px_rgba(0,242,255,0.1)]"
                  : `${isLightTheme ? "bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200" : "bg-[#0f1011] text-[#b9cacb]/70 border-white/5 hover:text-white hover:bg-white/[0.03]"} border`
              }`}
            >
              Ativos ({students.filter(s => s.status === "active").length})
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter("inactive")}
              className={`px-3 py-1.5 rounded-lg text-[9px] font-mono font-black uppercase tracking-wider transition-all cursor-pointer ${
                activeFilter === "inactive"
                  ? "bg-red-500/10 text-red-400 border border-red-500/30"
                  : `${isLightTheme ? "bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200" : "bg-[#0f1011] text-[#b9cacb]/70 border-white/5 hover:text-white hover:bg-white/[0.03]"} border`
              }`}
            >
              Inativos ({students.filter(s => s.status === "inactive").length})
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter("pending_renewal")}
              className={`px-3 py-1.5 rounded-lg text-[9px] font-mono font-black uppercase tracking-wider transition-all cursor-pointer ${
                activeFilter === "pending_renewal"
                  ? "bg-amber-500/10 text-amber-400 border border-amber-500/30"
                  : `${isLightTheme ? "bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200" : "bg-[#0f1011] text-[#b9cacb]/70 border-white/5 hover:text-white hover:bg-white/[0.03]"} border`
              }`}
            >
              Renovação ({students.filter(s => s.status === "pending_renewal").length})
            </button>
          </div>
        </div>

        {/* Student Cards List - Stacked vertically and wider horizontally */}
        <div className="flex flex-col gap-3.5">
          {filteredStudents.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-10 md:p-14 text-center rounded-2xl border border-dashed transition-all ${
                isLightTheme 
                  ? "border-gray-200 bg-gray-50/50 text-gray-500" 
                  : "border-[#3a494b]/30 bg-[#161719]/40 text-[#b9cacb]"
              }`}
              id="empty-state-container"
            >
              <div className="relative mx-auto w-12 h-12 mb-4 flex items-center justify-center">
                <Search className={`w-8 h-8 opacity-40 ${isLightTheme ? "text-cyan-600" : "text-[#00f2ff]"}`} />
                <motion.div 
                  animate={{ scale: [1, 1.2, 1] }} 
                  transition={{ duration: 2, repeat: Infinity }}
                  className={`absolute inset-0 rounded-full opacity-10 ${isLightTheme ? "bg-cyan-500" : "bg-[#00f2ff]"}`}
                />
              </div>
              <h4 className="text-xs font-mono tracking-wider uppercase font-bold mb-1">
                Nenhum atleta encontrado
              </h4>
              <p className="text-[11px] font-sans opacity-70 max-w-xs mx-auto mb-5 leading-normal">
                Não encontramos correspondência para <span className={`font-mono font-bold ${isLightTheme ? "text-cyan-600" : "text-[#00f2ff]"}`}>"{searchQuery || activeFilter}"</span>. Verifique a digitação ou mude as abas de filtro.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-2 max-w-xs mx-auto">
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("");
                    setActiveFilter("all");
                  }}
                  className={`px-4 py-2 rounded-xl text-[10px] font-mono font-bold uppercase tracking-wider transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-cyan-400 outline-none ${
                    isLightTheme 
                      ? "bg-cyan-600 hover:bg-cyan-700 text-white shadow-sm" 
                      : "bg-[#00f2ff]/10 hover:bg-[#00f2ff]/20 text-[#00f2ff] border border-[#00f2ff]/30 shadow-[0_0_15px_rgba(0,242,255,0.05)]"
                  }`}
                >
                  Limpar Todos os Filtros
                </button>
              </div>
            </motion.div>
          ) : (
            filteredStudents.map(student => {
              const activePayment = payments.filter(p => p.studentId === student.id && p.status === "overdue").length > 0;
              
              // Status color classes for borders and glows
              let borderStatusClass = "";
              if (student.status === "active") {
                borderStatusClass = isLightTheme 
                  ? "border-l-4 border-l-cyan-500 border-y-gray-200 border-r-gray-200" 
                  : "border-l-4 border-l-[#00f2ff] border-y-white/5 border-r-white/5";
              } else if (student.status === "inactive") {
                borderStatusClass = isLightTheme
                  ? "border-l-4 border-l-red-500 border-y-gray-200 border-r-gray-200"
                  : "border-l-4 border-l-red-500 border-y-white/5 border-r-white/5";
              } else {
                borderStatusClass = isLightTheme
                  ? "border-l-4 border-l-amber-500 border-y-gray-200 border-r-gray-200"
                  : "border-l-4 border-l-amber-500 border-y-white/5 border-r-white/5";
              }

              return (
                <div
                  key={student.id}
                  onClick={() => {
                    onSelectStudent(student.id);
                  }}
                  className={`p-4 sm:p-5 rounded-2xl border cursor-pointer transition-all duration-300 hover:translate-x-1.5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm hover:shadow-lg relative overflow-hidden group ${borderStatusClass} ${
                    isLightTheme 
                      ? "bg-white hover:border-cyan-500/50 hover:bg-cyan-50/10" 
                      : "bg-[#141517] hover:border-[#00f2ff]/30 hover:bg-white/[0.01]"
                  }`}
                >
                  {/* Neon Glow Highlight on Hover */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#00f2ff]/2 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                  
                  {/* Left Side: Avatar & Name & Current Phase */}
                  <div className="flex items-center gap-4 min-w-0 relative z-10">
                    <div className="relative shrink-0">
                      {/* Avatar Frame with custom glow for active */}
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center overflow-hidden font-black text-xs border shadow-inner transition-all ${
                        student.status === "active"
                          ? isLightTheme
                            ? "border-cyan-500 bg-cyan-100/70 text-cyan-600 scale-105"
                            : "border-[#00f2ff]/60 bg-[#00f2ff]/10 text-white scale-105 shadow-[0_0_12px_rgba(0,242,255,0.25)]"
                          : isLightTheme
                            ? "border-gray-200 bg-gray-100 text-gray-700"
                            : "border-white/10 bg-[#0f1011] text-gray-300"
                      }`}>
                        {student.photoUrl ? (
                          <img 
                            src={student.photoUrl} 
                            alt={student.name} 
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover" 
                          />
                        ) : (
                          student.initials || student.name.substring(0, 2).toUpperCase()
                        )}
                      </div>
                      <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 ${isLightTheme ? "border-white" : "border-[#141517]"} ${
                        student.status === "active" 
                          ? "bg-emerald-500 animate-pulse" 
                          : student.status === "inactive" 
                          ? "bg-red-500" 
                          : "bg-amber-500"
                      }`} />
                    </div>

                    <div className="min-w-0">
                      <h4 className={`font-extrabold text-sm sm:text-base uppercase tracking-tight truncate flex items-center gap-1.5 ${isLightTheme ? "text-gray-900" : "text-[#e3e2e4]"}`}>
                        {student.name}
                        {activePayment && (
                          <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping inline-block" title="Mensalidade em atraso" />
                        )}
                      </h4>
                      <p className={`text-[10px] ${isLightTheme ? "text-cyan-600 font-bold" : "text-[#b9cacb]/70"} font-mono truncate mt-0.5 uppercase tracking-wider`}>
                        {student.currentPhase}
                      </p>
                    </div>
                  </div>

                  {/* Right Side: Metrics Grid, Plan Badge, and Action Link */}
                  <div className="flex flex-wrap items-center justify-between md:justify-end gap-4 relative z-10 shrink-0">
                    {/* Compact Metrics Grid */}
                    <div className="flex gap-2.5">
                      <div className={`px-2.5 py-1 rounded-lg border flex flex-col justify-center min-w-[54px] text-center ${
                        isLightTheme ? "bg-gray-50/70 border-gray-150" : "bg-[#0b0c0d] border-white/[0.04]"
                      }`}>
                        <span className="text-[7px] text-gray-500 block uppercase font-black tracking-widest leading-none">Peso</span>
                        <span className={`text-[11px] font-black font-mono mt-0.5 leading-none ${isLightTheme ? "text-gray-800" : "text-white"}`}>
                          {student.weight ? `${student.weight} kg` : "--"}
                        </span>
                      </div>
                      <div className={`px-2.5 py-1 rounded-lg border flex flex-col justify-center min-w-[54px] text-center ${
                        isLightTheme ? "bg-gray-50/70 border-gray-150" : "bg-[#0b0c0d] border-white/[0.04]"
                      }`}>
                        <span className="text-[7px] text-gray-500 block uppercase font-black tracking-widest leading-none">Alt</span>
                        <span className={`text-[11px] font-black font-mono mt-0.5 leading-none ${isLightTheme ? "text-gray-800" : "text-white"}`}>
                          {student.height ? `${student.height > 3 ? student.height : Math.round(student.height * 100)}cm` : "--"}
                        </span>
                      </div>
                      <div className={`px-2.5 py-1 rounded-lg border flex flex-col justify-center min-w-[50px] text-center ${
                        isLightTheme ? "bg-gray-50/70 border-gray-150" : "bg-[#0b0c0d] border-white/[0.04]"
                      }`}>
                        <span className="text-[7px] text-gray-500 block uppercase font-black tracking-widest leading-none">Idade</span>
                        <span className={`text-[11px] font-black font-mono mt-0.5 leading-none ${isLightTheme ? "text-gray-800" : "text-white"}`}>
                          {student.age ? `${student.age}a` : "--"}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className={`px-2.5 py-1 rounded text-[8px] border uppercase font-mono font-black tracking-wider shrink-0 shadow-sm ${planBadgeClass(student.plan)}`}>
                        {student.plan}
                      </span>
                      
                      {/* Action Arrow Text Link */}
                      <span className={`text-[9px] font-mono uppercase tracking-wider font-extrabold flex items-center gap-1 transition-all ${
                        isLightTheme 
                          ? "text-cyan-600 group-hover:text-cyan-700" 
                          : "text-[#00f2ff] group-hover:text-cyan-300"
                      }`}>
                        Espaço 360° <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

      </div>
    </>
  )}

      {/* 360 Athlete Space Embedded Cockpit - Replaced fullscreen modal to display inline inside the dashboard container */}
      {selectedStudent && (
        <div id="alunos-view-detail" className="space-y-6 animate-fade-in pb-10">
          
          {/* Back Arrow button with dynamic label */}
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => onSelectStudent(null)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-mono font-black uppercase tracking-wider transition-all border cursor-pointer ${
                isLightTheme
                  ? "bg-white border-gray-250 text-gray-700 hover:bg-gray-50 shadow-sm"
                  : "bg-[#0f1011] border-white/5 text-[#b9cacb] hover:text-white hover:bg-white/[0.03]"
              }`}
            >
              <ArrowLeft className="w-4 h-4 text-cyan-500" />
              <span>Voltar ao Gerenciamento de Alunos</span>
            </button>
          </div>

          {/* 360 Athlete Space Container */}
          <div className={`w-full flex flex-col rounded-3xl border shadow-[0_0_40px_rgba(0,242,255,0.08)] relative overflow-hidden z-10 transition-all duration-300 ${
            isLightTheme 
              ? "bg-white border-gray-250 text-gray-900 shadow-xl" 
              : "bg-[#111214] border-white/[0.08] text-white"
          }`}>
            
            {/* Premium Glow Highlight Behind Profile */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-[#00f2ff]/5 rounded-full blur-[120px] pointer-events-none" />

            {/* Athlete Profile Header with NO close button and NO duplicate renew button */}
            <div className={`flex flex-col sm:flex-row justify-between items-start sm:items-center gap-5 p-6 border-b ${
              isLightTheme ? "border-gray-200 bg-gray-50/50" : "border-white/[0.05] bg-[#0c0d0e]/65"
            } relative z-10 shrink-0`}>
              <div className="flex items-center gap-4">
                <div className={`w-14 h-14 rounded-full flex items-center justify-center overflow-hidden font-black text-lg border-2 shadow-lg ${
                  selectedStudent.status === "active" 
                    ? "border-emerald-500 bg-emerald-500/10 text-emerald-400" 
                    : "border-red-500 bg-red-500/10 text-red-400"
                }`}>
                  {selectedStudent.photoUrl ? (
                    <img 
                      src={selectedStudent.photoUrl} 
                      alt={selectedStudent.name} 
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover" 
                    />
                  ) : (
                    selectedStudent.initials
                  )}
                </div>
                <div>
                  <h3 className={`text-xl font-black uppercase tracking-tight flex items-center gap-2 ${
                    isLightTheme ? "text-gray-950" : "text-white"
                  }`}>
                    {selectedStudent.name}
                  </h3>
                  <p className={`text-[10px] font-mono font-black mt-0.5 tracking-wider uppercase ${
                    isLightTheme ? "text-cyan-600" : "text-[#00f2ff]"
                  }`}>
                    Espaço 360° do Atleta — {selectedStudent.currentPhase}
                  </p>
                </div>
              </div>

              {/* Status and Badges */}
              <div className="flex items-center gap-3">
                <span className={`px-2.5 py-1 rounded-lg text-[9px] border uppercase font-mono font-black tracking-wider shadow-sm ${planBadgeClass(selectedStudent.plan)}`}>
                  {selectedStudent.plan}
                </span>
                <span className={`px-2.5 py-1 rounded-lg text-[9px] border uppercase font-mono font-black tracking-wider shadow-sm ${statusBadgeClass(selectedStudent.status)}`}>
                  {statusName(selectedStudent.status)}
                </span>
              </div>
            </div>

            {/* Scrollable Cockpit Content */}
            <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 scrollbar-thin">
              {/* Cockpit Navigation Tabs - Premium Structured distributed Grid */}
              <div className={`grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 w-full gap-2 p-1.5 rounded-2xl font-mono text-[10px] font-black uppercase tracking-wider shrink-0 relative z-10 border ${
                isLightTheme 
                  ? "bg-gray-100/80 border-gray-200 shadow-inner" 
                  : "bg-[#0c0d0f]/95 border-white/[0.05] shadow-inner"
              }`}>
                {[
                  { id: "resumo", label: "Métricas & Perfil", icon: User },
                  { id: "treino", label: "Ficha de Treino", icon: Dumbbell },
                  { id: "dieta", label: "Dieta & Macros", icon: Utensils },
                  { id: "avaliacao", label: "Avaliações", icon: Activity },
                  { id: "financeiro", label: "Financeiro", icon: CreditCard },
                ].map((t) => {
                  const Icon = t.icon;
                  const isActive = active360Tab === t.id;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => {
                        setActive360Tab(t.id as any);
                        setIsEditingWorkout(false);
                      }}
                      className={`flex items-center gap-2 px-3.5 py-3 rounded-xl transition-all duration-200 cursor-pointer w-full justify-center whitespace-nowrap border text-center font-black ${
                        isActive
                          ? isLightTheme
                            ? "bg-white text-cyan-600 border-cyan-300 shadow-md"
                            : "bg-gradient-to-r from-[#00f2ff]/20 to-[#00f2ff]/5 text-[#00f2ff] border-[#00f2ff]/40 shadow-[0_0_15px_rgba(0,242,255,0.2)]"
                          : isLightTheme
                            ? "text-gray-500 hover:text-gray-900 hover:bg-white/60 border-transparent"
                            : "text-[#b9cacb]/70 hover:text-white hover:bg-white/[0.03] border-transparent"
                      }`}
                    >
                      <Icon className={`w-3.5 h-3.5 ${
                        isActive 
                          ? isLightTheme ? "text-cyan-600" : "text-[#00f2ff]" 
                          : isLightTheme ? "text-gray-400" : "text-[#b9cacb]/60"
                      }`} />
                      <span>{t.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Tab 1: Resumo & Métricas */}
              {active360Tab === "resumo" && (
                <div className="space-y-6 animate-fade-in font-mono text-xs relative z-10">
                  
                  {/* Two-Column Responsive Layout (Alternativa 2: Split Bento Grid) */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                    
                    {/* Left Column: Biometria & Composição Corporal (7/12) */}
                    <div className="lg:col-span-7 space-y-4">
                      <h4 className={`font-black uppercase tracking-wider text-[10px] pb-2 border-b flex items-center gap-2 ${
                        isLightTheme ? "text-gray-950 border-gray-200" : "text-white border-white/[0.05]"
                      }`}>
                        <Activity className="w-4 h-4 text-[#00f2ff]" /> Composição Corporal & Biometria
                      </h4>

                      <div className="grid grid-cols-2 gap-3">
                        {/* Weight */}
                        <div className={`p-4 rounded-2xl border transition-all duration-300 group ${
                          isLightTheme 
                            ? "bg-gray-50/80 border-gray-150 hover:border-cyan-500/30 hover:shadow-md" 
                            : "bg-gradient-to-br from-[#111213] to-[#1a1b1d] border-white/[0.04] hover:border-[#00f2ff]/30 hover:shadow-[0_0_15px_rgba(0,242,255,0.05)]"
                        }`}>
                          <div className="flex items-center gap-2 mb-1">
                            <Activity className={`w-3.5 h-3.5 ${isLightTheme ? "text-cyan-600" : "text-[#00f2ff]"}`} />
                            <span className={`text-[9px] block uppercase tracking-wider font-black ${
                              isLightTheme ? "text-gray-500" : "text-[#b9cacb]/50"
                            }`}>Massa Corporal</span>
                          </div>
                          <span className={`font-black text-xl block transition-colors ${
                            isLightTheme ? "text-gray-950 group-hover:text-cyan-600" : "text-white group-hover:text-[#00f2ff]"
                          }`}>{selectedStudent.weight ? `${selectedStudent.weight} kg` : "--"}</span>
                        </div>

                        {/* Height */}
                        <div className={`p-4 rounded-2xl border transition-all duration-300 group ${
                          isLightTheme 
                            ? "bg-gray-50/80 border-gray-150 hover:border-cyan-500/30 hover:shadow-md" 
                            : "bg-gradient-to-br from-[#111213] to-[#1a1b1d] border-white/[0.04] hover:border-[#00f2ff]/30 hover:shadow-[0_0_15px_rgba(0,242,255,0.05)]"
                        }`}>
                          <div className="flex items-center gap-2 mb-1">
                            <TrendingUp className={`w-3.5 h-3.5 ${isLightTheme ? "text-cyan-600" : "text-[#00f2ff]"}`} />
                            <span className={`text-[9px] block uppercase tracking-wider font-black ${
                              isLightTheme ? "text-gray-500" : "text-[#b9cacb]/50"
                            }`}>Estatura</span>
                          </div>
                          <span className={`font-black text-xl block transition-colors ${
                            isLightTheme ? "text-gray-950 group-hover:text-cyan-600" : "text-white group-hover:text-[#00f2ff]"
                          }`}>{selectedStudent.height ? `${selectedStudent.height > 3 ? selectedStudent.height : Math.round(selectedStudent.height * 100)} cm` : "--"}</span>
                        </div>

                        {/* Age */}
                        <div className={`p-4 rounded-2xl border transition-all duration-300 group flex flex-col justify-center min-h-[82px] ${
                          isLightTheme 
                            ? "bg-gray-50/80 border-gray-150 hover:border-cyan-500/30 hover:shadow-md" 
                            : "bg-gradient-to-br from-[#111213] to-[#1a1b1d] border-white/[0.04] hover:border-[#00f2ff]/30 hover:shadow-[0_0_15px_rgba(0,242,255,0.05)]"
                        }`}>
                          <div className="flex items-center gap-2 mb-1">
                            <Calendar className={`w-3.5 h-3.5 ${isLightTheme ? "text-cyan-600" : "text-[#00f2ff]"}`} />
                            <span className={`text-[9px] block uppercase tracking-wider font-black ${
                              isLightTheme ? "text-gray-500" : "text-[#b9cacb]/50"
                            }`}>Idade</span>
                          </div>
                          <span className={`font-black text-xl block transition-colors ${
                            isLightTheme ? "text-gray-950 group-hover:text-cyan-600" : "text-white group-hover:text-[#00f2ff]"
                          }`}>{selectedStudent.age ? `${selectedStudent.age} anos` : "--"}</span>
                          {selectedStudent.birthDate && (
                            <span className={`text-[10px] block mt-0.5 font-mono ${
                              isLightTheme ? "text-cyan-600" : "text-cyan-400/80"
                            }`}>
                              Nasc: {selectedStudent.birthDate.split("-").reverse().join("/")}
                            </span>
                          )}
                        </div>

                        {/* Gender */}
                        <div className={`p-4 rounded-2xl border transition-all duration-300 group ${
                          isLightTheme 
                            ? "bg-gray-50/80 border-gray-150 hover:border-cyan-500/30 hover:shadow-md" 
                            : "bg-gradient-to-br from-[#111213] to-[#1a1b1d] border-white/[0.04] hover:border-[#00f2ff]/30 hover:shadow-[0_0_15px_rgba(0,242,255,0.05)]"
                        }`}>
                          <div className="flex items-center gap-2 mb-1">
                            <User className={`w-3.5 h-3.5 ${isLightTheme ? "text-cyan-600" : "text-[#00f2ff]"}`} />
                            <span className={`text-[9px] block uppercase tracking-wider font-black ${
                              isLightTheme ? "text-gray-500" : "text-[#b9cacb]/50"
                            }`}>Gênero</span>
                          </div>
                          <span className={`font-black text-xl block capitalize transition-colors ${
                            isLightTheme ? "text-gray-950 group-hover:text-cyan-600" : "text-white group-hover:text-[#00f2ff]"
                          }`}>{selectedStudent.gender || "Masculino"}</span>
                        </div>
                      </div>

                      {/* BMI Gauge */}
                      {selectedStudent.weight && selectedStudent.height && (
                        <div className={`border p-4 rounded-2xl space-y-3 shadow-md ${
                          isLightTheme ? "bg-gray-50/50 border-gray-150" : "bg-[#0f1011] border-white/[0.04]"
                        }`}>
                          <div className="flex justify-between items-center text-xs flex-wrap gap-2">
                            <div className="flex items-center gap-2">
                              <span className={`font-bold uppercase tracking-wider text-[10px] ${
                                isLightTheme ? "text-gray-500" : "text-[#b9cacb]/70"
                              }`}>Índice de Massa Corporal (IMC):</span>
                              <span className={`font-black text-sm ${isLightTheme ? "text-gray-900" : "text-white"}`}>
                                {calculateBMI(selectedStudent.weight, selectedStudent.height)?.value}
                              </span>
                            </div>
                            <span className="text-emerald-400 font-black bg-emerald-500/10 px-2.5 py-1 rounded-lg text-[9px] border border-emerald-500/20 uppercase tracking-widest">
                              {calculateBMI(selectedStudent.weight, selectedStudent.height)?.category}
                            </span>
                          </div>
                          
                          {/* Interactive gauge spectrum line */}
                          <div className="relative pt-1.5 pb-1">
                            <div className="h-2 w-full rounded-full bg-gradient-to-r from-blue-400 via-emerald-400 to-red-400 flex overflow-hidden relative">
                              {/* Anchor pointer indicating student position */}
                              {(() => {
                                const bmiVal = parseFloat(calculateBMI(selectedStudent.weight!, selectedStudent.height!)?.value || "22");
                                // Scale from BMI 15 to 35
                                const percentage = Math.min(100, Math.max(0, ((bmiVal - 15) / 20) * 100));
                                return (
                                  <div 
                                    className={`absolute -top-1 h-4 w-4 rounded-full border-2 shadow-[0_0_8px_rgba(255,255,255,0.8)] -translate-x-1/2 transition-all duration-500 ${
                                      isLightTheme ? "bg-cyan-600 border-white" : "bg-white border-[#17181a]"
                                    }`}
                                    style={{ left: `${percentage}%` }}
                                  />
                                );
                              })()}
                            </div>
                            <div className={`flex justify-between text-[8px] font-bold uppercase tracking-wider pt-1.5 ${
                              isLightTheme ? "text-gray-400" : "text-[#b9cacb]/40"
                            }`}>
                              <span>Abaixo (18.5)</span>
                              <span>Ideal (24.9)</span>
                              <span>Sobrepeso (29.9)</span>
                              <span>Obesidade</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Right Column: Cadastro, Metas & Clínico (5/12) */}
                    <div className="lg:col-span-5 space-y-4">
                      {/* Account detail card */}
                      <div className={`p-4 rounded-2xl border space-y-3.5 shadow-md ${
                        isLightTheme ? "bg-gray-50/50 border-gray-150" : "bg-[#0f1011] border-white/[0.04]"
                      }`}>
                        <h4 className={`font-black uppercase tracking-wider text-[10px] pb-2 border-b flex items-center gap-2 ${
                          isLightTheme ? "text-gray-950 border-gray-250" : "text-[#e3e2e4] border-white/[0.04]"
                        }`}>
                          <Mail className="w-4 h-4 text-[#00f2ff]" /> Informações de Cadastro
                        </h4>
                        <div className="space-y-3">
                          <div className="flex items-start gap-2.5">
                            <Mail className="w-4 h-4 text-[#00f2ff] shrink-0 mt-0.5" />
                            <div className="space-y-0.5">
                              <span className={`text-[8px] block uppercase font-bold tracking-widest ${
                                isLightTheme ? "text-gray-400" : "text-gray-500"
                              }`}>E-mail</span>
                              <span className={`font-medium break-all ${isLightTheme ? "text-gray-800" : "text-[#b9cacb]"}`}>{selectedStudent.email}</span>
                            </div>
                          </div>
                          <div className="flex items-start gap-2.5">
                            <Phone className="w-4 h-4 text-[#00f2ff] shrink-0 mt-0.5" />
                            <div className="space-y-0.5">
                              <span className={`text-[8px] block uppercase font-bold tracking-widest ${
                                isLightTheme ? "text-gray-400" : "text-gray-500"
                              }`}>WhatsApp</span>
                              <span className={`font-medium ${isLightTheme ? "text-gray-800" : "text-[#b9cacb]"}`}>{selectedStudent.phone}</span>
                            </div>
                          </div>
                          <div className="flex items-start gap-2.5">
                            <Calendar className="w-4 h-4 text-[#00f2ff] shrink-0 mt-0.5" />
                            <div className="space-y-0.5">
                              <span className={`text-[8px] block uppercase font-bold tracking-widest ${
                                isLightTheme ? "text-gray-400" : "text-gray-500"
                              }`}>Data de Adesão</span>
                              <span className={`font-medium ${isLightTheme ? "text-gray-800" : "text-[#b9cacb]"}`}>{selectedStudent.joinedDate || "01/01/2026"}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Metas & Clínico vertical stack */}
                      <div className="space-y-3">
                        <div className={`p-4 rounded-2xl border space-y-2 hover:border-[#00f2ff]/20 transition-colors shadow-md ${
                          isLightTheme ? "bg-gray-50/50 border-gray-150" : "bg-[#0f1011] border-white/[0.04]"
                        }`}>
                          <h5 className={`font-black text-[10px] uppercase tracking-wider pb-1.5 border-b flex items-center gap-2 ${
                            isLightTheme ? "text-gray-950 border-gray-250" : "text-white border-white/[0.04]"
                          }`}>
                            <Smile className="w-4 h-4 text-[#00f2ff]" /> Planejamento e Metas
                          </h5>
                          <p className={`leading-relaxed text-[11px] italic mt-1 ${isLightTheme ? "text-gray-600" : "text-[#b9cacb]/90"}`}>
                            Direcionamento de alto desempenho focado em <span className="text-[#00f2ff] font-bold not-italic">{selectedStudent.currentPhase}</span>. Acompanhamento e ajuste semanal de cargas recomendados para progressão tensional.
                          </p>
                        </div>

                        <div className={`p-4 rounded-2xl border space-y-3.5 hover:border-[#ccff00]/20 transition-colors shadow-md ${
                          isLightTheme ? "bg-gray-50/50 border-gray-150" : "bg-[#0f1011] border-white/[0.04]"
                        }`}>
                          <h5 className="font-black text-[#ccff00] text-[10px] uppercase tracking-wider pb-1.5 border-b border-white/[0.04] flex items-center gap-2">
                            <Info className="w-4 h-4 text-[#ccff00]" /> Limitações & Observações Clínicas
                          </h5>
                          
                          <div className="space-y-2 font-mono text-[11px]">
                            <div>
                              <span className="text-gray-500 font-bold block uppercase text-[8px] tracking-widest">Limitações Físicas:</span>
                              <p className={isLightTheme ? "text-gray-700" : "text-[#b9cacb]/90"}>
                                {selectedStudent.limitations || "Nenhuma limitação articular ou lesão reportada pelo aluno."}
                              </p>
                            </div>

                            <div className="border-t border-white/[0.04] pt-2">
                              <span className="text-gray-500 font-bold block uppercase text-[8px] tracking-widest">Observações do Coach:</span>
                              <p className={isLightTheme ? "text-gray-700" : "text-[#b9cacb]/90"}>
                                {selectedStudent.observations || "Nenhuma observação cadastrada. Use Editar Atleta para adicionar notas clínicas de acompanhamento."}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>
              )}

              {/* Tab 2: Ficha de Treino */}
              {active360Tab === "treino" && (
                <div className="space-y-4 animate-fade-in relative z-10">
                  {(() => {
                    const studentWorkout = workouts.find(w => w.studentId === selectedStudent.id);
                    
                    if (!studentWorkout) {
                      return (
                        <div className={`text-center p-10 rounded-2xl border border-dashed space-y-4 font-mono ${
                          isLightTheme 
                            ? "bg-gray-50 border-gray-200 text-gray-500" 
                            : "bg-[#0f1011] border-white/[0.05] text-[#b9cacb]/70"
                        }`}>
                          <Dumbbell className="w-12 h-12 mx-auto text-[#00f2ff] opacity-30 animate-pulse" />
                          <p className="text-xs uppercase tracking-wider font-extrabold">Nenhuma ficha de musculação cadastrada para este atleta.</p>
                          <button
                            type="button"
                            onClick={() => onSelectStudentForWorkout(selectedStudent.id)}
                            className="bg-gradient-to-r from-[#00f2ff]/20 to-[#ccff00]/20 hover:from-[#00f2ff]/30 hover:to-[#ccff00]/30 text-white px-5 py-2.5 rounded-xl border border-[#00f2ff]/30 font-black text-xs uppercase tracking-wider transition-all cursor-pointer hover:scale-[1.02] active:scale-95"
                          >
                            Montar Nova Ficha de Treino com IA →
                          </button>
                        </div>
                      );
                    }

                    return (
                      <div className="space-y-4 font-mono text-xs">
                        <div className={`flex justify-between items-center px-4 py-3.5 rounded-2xl border flex-wrap gap-3 ${
                          isLightTheme ? "bg-gray-50 border-gray-200 text-gray-900" : "bg-[#0f1011] border-white/[0.04] text-white"
                        }`}>
                          <div>
                            <span className={`text-[8px] uppercase tracking-widest font-black px-2 py-0.5 rounded-md border ${
                              isLightTheme 
                                ? "bg-cyan-150 border-cyan-300 text-cyan-800" 
                                : "bg-[#00f2ff]/10 text-[#00f2ff] border-[#00f2ff]/25"
                            }`}>Ficha Prescrita</span>
                            <h4 className={`text-xs font-black mt-1.5 uppercase tracking-wider ${isLightTheme ? "text-gray-950" : "text-white"}`}>
                              {studentWorkout.name}
                            </h4>
                          </div>
                          
                          <div className="flex gap-2">
                            {isEditingWorkout ? (
                              <>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setIsEditingWorkout(false);
                                  }}
                                  className={`px-3 py-2 rounded-xl font-bold transition-all cursor-pointer text-[10px] ${
                                    isLightTheme ? "bg-gray-200 text-gray-700 hover:bg-gray-300" : "bg-gray-900 text-gray-300 hover:bg-gray-800 hover:text-white"
                                  }`}
                                >
                                  Cancelar
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (onSaveWorkout) {
                                      onSaveWorkout(selectedStudent.id, editedWorkoutName, editedExercises);
                                    }
                                    setIsEditingWorkout(false);
                                  }}
                                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black hover:shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all cursor-pointer text-[10px]"
                                >
                                  Salvar Ficha
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditedWorkoutName(studentWorkout.name);
                                    setEditedExercises([...(studentWorkout.exercises || [])]);
                                    setIsEditingWorkout(true);
                                  }}
                                  className={`px-3.5 py-2 rounded-xl font-black flex items-center gap-1.5 text-[10px] uppercase tracking-wider transition-all cursor-pointer border ${
                                    isLightTheme 
                                      ? "bg-white text-gray-700 border-gray-200 hover:border-cyan-500 hover:text-cyan-600" 
                                      : "bg-[#17181a] text-[#b9cacb] border-white/5 hover:border-[#00f2ff]/50 hover:text-[#00f2ff]"
                                  }`}
                                >
                                  <Pencil className="w-3.5 h-3.5 text-[#00f2ff]" /> Editar Ficha
                                </button>
                                <button
                                  type="button"
                                  onClick={() => onSelectStudentForWorkout(selectedStudent.id)}
                                  className={`px-3.5 py-2 rounded-xl font-black transition-all cursor-pointer flex items-center gap-1.5 text-[10px] uppercase tracking-wider ${
                                    isLightTheme
                                      ? "bg-cyan-500 hover:bg-cyan-600 text-white shadow-sm"
                                      : "bg-[#00f2ff]/10 hover:bg-[#00f2ff]/20 text-[#00f2ff] border border-[#00f2ff]/25"
                                  }`}
                                >
                                  <Sparkles className="w-3.5 h-3.5 text-white animate-pulse" /> IA Montador
                                </button>
                              </>
                            )}
                          </div>
                        </div>

                        {!isEditingWorkout ? (
                          <>
                            {/* Division tabs with high contrast */}
                            <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                              {["A", "B", "C", "D", "E"].map((div) => {
                                const count = (studentWorkout.exercises || []).filter(e => (e.division || "A") === div).length;
                                const isActive = activeDivisionTab === div;
                                return (
                                  <button
                                    key={div}
                                    type="button"
                                    onClick={() => setActiveDivisionTab(div)}
                                    className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer uppercase tracking-widest border ${
                                      isActive
                                        ? isLightTheme
                                          ? "bg-cyan-500/10 text-cyan-700 border-cyan-400/40 shadow-sm"
                                          : "bg-gradient-to-r from-[#00f2ff]/20 to-[#00f2ff]/5 text-[#00f2ff] border-[#00f2ff]/40 shadow-[0_0_10px_rgba(0,242,255,0.08)]"
                                        : isLightTheme
                                          ? "bg-gray-50 text-gray-500 border-gray-250 hover:bg-gray-100 hover:text-gray-900"
                                          : "bg-[#0f1011] text-[#b9cacb]/50 border-white/5 hover:text-white hover:bg-white/[0.01]"
                                    }`}
                                  >
                                    Ficha {div} <span className="text-[10px] font-mono opacity-50 px-1.5 py-0.5 rounded-md bg-black/10 dark:bg-[#17181a]">({count})</span>
                                  </button>
                                );
                              })}
                            </div>

                            {/* Active exercises list with premium visual hierarchy */}
                            {(() => {
                              const activeExercises = (studentWorkout.exercises || []).filter(e => (e.division || "A") === activeDivisionTab);
                              
                              if (activeExercises.length === 0) {
                                return (
                                  <div className={`text-center p-10 rounded-2xl border text-gray-500 italic ${
                                    isLightTheme ? "bg-gray-50 border-gray-200" : "bg-[#0f1011] border-white/[0.04]"
                                  }`}>
                                    Nenhum exercício prescrito para a divisão de Treino {activeDivisionTab}.
                                  </div>
                                );
                              }

                              return (
                                <div className="space-y-3.5 max-h-[380px] overflow-y-auto pr-1 scrollbar-thin">
                                  {activeExercises.map((ex, index) => {
                                    const hasTech = !!ex.advancedTechnique && ex.advancedTechnique !== "Nenhuma";
                                    
                                    // Customize technique border/card color profiles
                                    let techColorBg = isLightTheme ? "border-gray-200 bg-white shadow-sm" : "border-white/[0.05] bg-[#0f1011]";
                                    let badgeColor = isLightTheme ? "bg-gray-100 text-gray-600 border-gray-250" : "bg-gray-800 text-gray-400";
                                    if (hasTech) {
                                      if (ex.advancedTechnique.toLowerCase().includes("drop")) {
                                        techColorBg = isLightTheme 
                                          ? "border-red-300 bg-gradient-to-r from-red-500/[0.03] to-transparent shadow-sm"
                                          : "border-red-500/20 bg-gradient-to-r from-red-500/5 to-transparent shadow-[0_0_10px_rgba(239,68,68,0.03)]";
                                        badgeColor = isLightTheme 
                                          ? "bg-red-50 text-red-700 border-red-200" 
                                          : "bg-red-500/20 text-red-300 border-red-500/30";
                                      } else if (ex.advancedTechnique.toLowerCase().includes("rest")) {
                                        techColorBg = isLightTheme
                                          ? "border-purple-300 bg-gradient-to-r from-purple-500/[0.03] to-transparent shadow-sm"
                                          : "border-purple-500/20 bg-gradient-to-r from-purple-500/5 to-transparent shadow-[0_0_10px_rgba(168,85,247,0.03)]";
                                        badgeColor = isLightTheme
                                          ? "bg-purple-50 text-purple-700 border-purple-200"
                                          : "bg-purple-500/20 text-purple-300 border-purple-500/30";
                                      } else {
                                        techColorBg = isLightTheme
                                          ? "border-cyan-300 bg-gradient-to-r from-cyan-500/[0.03] to-transparent shadow-sm"
                                          : "border-[#00f2ff]/20 bg-gradient-to-r from-[#00f2ff]/5 to-transparent shadow-[0_0_10px_rgba(0,242,255,0.03)]";
                                        badgeColor = isLightTheme
                                          ? "bg-cyan-50 text-cyan-700 border-cyan-200"
                                          : "bg-[#00f2ff]/20 text-[#00dbe7] border-[#00f2ff]/30";
                                      }
                                    }

                                    return (
                                      <div
                                        key={ex.id}
                                        className={`p-4 rounded-2xl border transition-all duration-200 hover:scale-[1.005] ${techColorBg}`}
                                      >
                                        <div className={`flex justify-between items-start gap-3 border-b pb-2.5 ${
                                          isLightTheme ? "border-gray-200" : "border-white/[0.04]"
                                        }`}>
                                          <div>
                                            <div className="flex items-center gap-2 flex-wrap">
                                              <span className={`text-[9px] font-black border px-2 py-0.5 rounded-lg ${
                                                isLightTheme ? "bg-gray-100 text-gray-800 border-gray-200" : "bg-[#17181a] text-white border-white/5"
                                              }`}>
                                                {index + 1}
                                              </span>
                                              <h5 className={`font-extrabold text-xs uppercase tracking-wide ${isLightTheme ? "text-gray-950" : "text-white"}`}>{ex.name}</h5>
                                              {hasTech && (
                                                <span className={`px-2 py-0.5 rounded-lg border text-[8px] font-black uppercase tracking-widest flex items-center gap-1 ${badgeColor}`}>
                                                  ⚡ {ex.advancedTechnique}
                                                </span>
                                              )}
                                            </div>
                                            <p className={`text-[10px] italic mt-1 leading-normal ${
                                              isLightTheme ? "text-gray-600" : "text-[#b9cacb]/60"
                                            }`}>
                                              {ex.notes || "Foco total na contração e cadência controlada de 3:1:2."}
                                            </p>
                                          </div>

                                          <div className="text-right shrink-0">
                                            <p className={`font-black text-xs tracking-wider ${isLightTheme ? "text-cyan-700" : "text-[#00f2ff]"}`}>{ex.sets}s × {ex.reps}</p>
                                            {ex.studentWeights && Object.keys(ex.studentWeights).length > 0 ? (
                                              <div className={`text-[9px] font-mono mt-1 px-2 py-0.5 rounded-lg border inline-block font-black uppercase tracking-wider ${
                                                isLightTheme 
                                                  ? "bg-amber-50 text-amber-800 border-amber-200" 
                                                  : "bg-[#ccff00]/10 text-[#ccff00] border-[#ccff00]/20"
                                              }`}>
                                                Cargas: {Object.values(ex.studentWeights).join(" / ")} kg
                                              </div>
                                            ) : (
                                              <p className="text-gray-500 text-[9px] mt-1 font-bold">Sem cargas registradas</p>
                                            )}
                                          </div>
                                        </div>

                                        <div className="mt-2.5 flex items-center gap-1.5 flex-wrap">
                                          {Array.from({ length: ex.sets }).map((_, sIdx) => {
                                            const setNum = sIdx + 1;
                                            const isTarget = ex.techniqueSetTarget?.includes(setNum);
                                            return (
                                              <div
                                                key={sIdx}
                                                className={`px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-wider ${
                                                  isTarget
                                                    ? "bg-red-500/20 text-red-600 dark:text-red-300 border border-red-300 dark:border-red-500/40 animate-pulse"
                                                    : isLightTheme
                                                      ? "bg-gray-100 text-gray-500 border border-gray-200"
                                                      : "bg-[#17181a] text-gray-500 border border-white/[0.04]"
                                                }`}
                                              >
                                                Série {setNum} {isTarget && "🔥"}
                                              </div>
                                            );
                                          })}
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              );
                            })()}
                          </>
                        ) : (
                          /* Edit mode view */
                          <div className="space-y-3">
                            <div className={`p-4 rounded-2xl border space-y-3 ${
                              isLightTheme ? "bg-gray-50 border-gray-200" : "bg-[#121315] border-[#3a494b]/15"
                            }`}>
                              <div>
                                <label className={`text-[10px] block font-extrabold mb-1.5 uppercase tracking-wider ${
                                  isLightTheme ? "text-gray-600" : "text-[#b9cacb]"
                                }`}>Nome da Ficha</label>
                                <input
                                  type="text"
                                  value={editedWorkoutName}
                                  onChange={(e) => setEditedWorkoutName(e.target.value)}
                                  className={`w-full px-3 py-2 rounded-xl outline-none text-xs border font-bold transition-all ${
                                    isLightTheme 
                                      ? "bg-white text-gray-950 border-gray-300 focus:border-cyan-500" 
                                      : "bg-[#1b1c1e] text-white border-[#3a494b]/40 focus:border-[#00f2ff]"
                                  }`}
                                />
                              </div>
                            </div>

                            <div className="flex gap-1 overflow-x-auto">
                              {["A", "B", "C", "D", "E"].map((div) => {
                                const isActive = activeDivisionTab === div;
                                return (
                                  <button
                                    key={div}
                                    type="button"
                                    onClick={() => setActiveDivisionTab(div)}
                                    className={`px-3 py-2 rounded-xl font-black text-xs transition-all cursor-pointer ${
                                      isActive
                                        ? isLightTheme
                                          ? "bg-cyan-500 text-white shadow-sm"
                                          : "bg-[#00f2ff] text-black shadow-[0_0_10px_rgba(0,242,255,0.15)]"
                                        : isLightTheme
                                          ? "bg-gray-100 text-gray-500 hover:bg-gray-200"
                                          : "bg-[#1b1c1e] text-gray-400 hover:text-white"
                                    }`}
                                  >
                                    Ficha {div}
                                  </button>
                                );
                              })}
                            </div>

                            <div className="space-y-3 max-h-[280px] overflow-y-auto pr-1">
                              {editedExercises.filter(e => (e.division || "A") === activeDivisionTab).length === 0 ? (
                                <div className={`text-center p-6 rounded-xl italic text-gray-500 border border-dashed ${
                                  isLightTheme ? "bg-gray-50 border-gray-200" : "bg-[#121315]/30 border-white/5"
                                }`}>
                                  Nenhum exercício nesta divisão. Adicione um abaixo.
                                </div>
                              ) : (
                                editedExercises.map((ex, idx) => {
                                  if ((ex.division || "A") !== activeDivisionTab) return null;
                                  return (
                                    <div key={ex.id} className={`p-4 rounded-xl border space-y-3 ${
                                      isLightTheme ? "bg-gray-50/70 border-gray-250 shadow-sm" : "bg-[#121315] border-[#3a494b]/25"
                                    }`}>
                                      <div className="flex items-center justify-between">
                                        <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded ${
                                          isLightTheme ? "bg-gray-200 text-gray-800" : "bg-gray-800 text-white"
                                        }`}>Exercício {idx + 1}</span>
                                        <button
                                          type="button"
                                          onClick={() => {
                                            setEditedExercises(prev => prev.filter(eItem => eItem.id !== ex.id));
                                          }}
                                          className="text-red-500 hover:text-red-400 hover:underline text-[10px] font-black cursor-pointer uppercase tracking-wider"
                                        >
                                          Remover
                                        </button>
                                      </div>

                                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <div className="space-y-1">
                                          <label className={`text-[8px] block font-black uppercase tracking-widest ${isLightTheme ? "text-gray-500" : "text-[#b9cacb]/60"}`}>Nome do Exercício</label>
                                          <input
                                            type="text"
                                            list={`global-suggestions-${ex.id}`}
                                            value={ex.name}
                                            onChange={(e) => {
                                              const val = e.target.value;
                                              setEditedExercises(prev => prev.map(eItem => eItem.id === ex.id ? { ...eItem, name: val } : eItem));
                                            }}
                                            className={`px-2.5 py-1.5 rounded-lg w-full outline-none text-xs font-bold border transition-all ${
                                              isLightTheme 
                                                ? "bg-white text-gray-950 border-gray-300 focus:border-cyan-500" 
                                                : "bg-[#1b1c1e] text-white border-[#3a494b]/40 focus:border-[#00f2ff]"
                                            }`}
                                            placeholder="Nome do exercício..."
                                          />
                                        </div>
                                        <datalist id={`global-suggestions-${ex.id}`}>
                                          {globalMuscExercises.map((name, nIdx) => (
                                            <option key={nIdx} value={name} />
                                          ))}
                                        </datalist>

                                        <div className="grid grid-cols-2 gap-2">
                                          <div className="space-y-1">
                                            <label className={`text-[8px] block font-black uppercase tracking-widest ${isLightTheme ? "text-gray-500" : "text-[#b9cacb]/60"}`}>Séries</label>
                                            <input
                                              type="number"
                                              value={ex.sets}
                                              onChange={(e) => {
                                                const val = parseInt(e.target.value) || 3;
                                                setEditedExercises(prev => prev.map(eItem => eItem.id === ex.id ? { ...eItem, sets: val } : eItem));
                                              }}
                                              className={`px-2 py-1.5 rounded-lg w-full text-center text-xs font-mono font-bold border transition-all ${
                                                isLightTheme 
                                                  ? "bg-white text-gray-950 border-gray-300 focus:border-cyan-500" 
                                                  : "bg-[#1b1c1e] text-white border-[#3a494b]/40 focus:border-[#00f2ff]"
                                              }`}
                                              placeholder="Séries"
                                            />
                                          </div>
                                          <div className="space-y-1">
                                            <label className={`text-[8px] block font-black uppercase tracking-widest ${isLightTheme ? "text-gray-500" : "text-[#b9cacb]/60"}`}>Reps</label>
                                            <input
                                              type="text"
                                              value={ex.reps}
                                              onChange={(e) => {
                                                const val = e.target.value;
                                                setEditedExercises(prev => prev.map(eItem => eItem.id === ex.id ? { ...eItem, reps: val } : eItem));
                                              }}
                                              className={`px-2 py-1.5 rounded-lg w-full text-center text-xs font-mono font-bold border transition-all ${
                                                isLightTheme 
                                                  ? "bg-white text-gray-950 border-gray-300 focus:border-cyan-500" 
                                                  : "bg-[#1b1c1e] text-white border-[#3a494b]/40 focus:border-[#00f2ff]"
                                              }`}
                                              placeholder="Reps"
                                            />
                                          </div>
                                        </div>
                                      </div>

                                      <div className="space-y-1">
                                        <label className={`text-[8px] block font-black uppercase tracking-widest ${isLightTheme ? "text-gray-500" : "text-[#b9cacb]/60"}`}>Método Avançado (Selecione)</label>
                                        <select
                                          value={ex.advancedTechnique || "Nenhuma"}
                                          onChange={(e) => {
                                            const val = e.target.value;
                                            setEditedExercises(prev => prev.map(eItem => eItem.id === ex.id ? { ...eItem, advancedTechnique: val } : eItem));
                                          }}
                                          className={`px-2 py-1.5 rounded-lg w-full outline-none text-xs font-bold border transition-all ${
                                            isLightTheme 
                                              ? "bg-white text-gray-950 border-gray-300 focus:border-cyan-500" 
                                              : "bg-[#1b1c1e] text-white border-[#3a494b]/40 focus:border-[#00f2ff]"
                                          }`}
                                        >
                                          <option value="Nenhuma">Nenhuma</option>
                                          <option value="Drop-Set">Drop-Set</option>
                                          <option value="Rest-Pause">Rest-Pause</option>
                                          <option value="Bi-Set">Bi-Set</option>
                                          <option value="FST-7">FST-7</option>
                                          <option value="Pico de Contração">Pico de Contração</option>
                                          <option value="Excêntrica Lenta">Excêntrica Lenta</option>
                                        </select>
                                      </div>

                                      <div className="space-y-1">
                                        <label className={`text-[8px] block font-black uppercase tracking-widest ${isLightTheme ? "text-gray-500" : "text-[#b9cacb]/60"}`}>Instruções de Execução</label>
                                        <input
                                          type="text"
                                          value={ex.notes || ""}
                                          onChange={(e) => {
                                            const val = e.target.value;
                                            setEditedExercises(prev => prev.map(eItem => eItem.id === ex.id ? { ...eItem, notes: val } : eItem));
                                          }}
                                          className={`px-3 py-1.5 rounded-lg w-full outline-none text-xs border transition-all ${
                                            isLightTheme 
                                              ? "bg-white text-gray-950 border-gray-300 focus:border-cyan-500" 
                                              : "bg-[#1b1c1e] text-white border-[#3a494b]/40 focus:border-[#00f2ff]"
                                          }`}
                                          placeholder="Observações de execução do exercício..."
                                        />
                                      </div>
                                    </div>
                                  );
                                })
                              )}
                            </div>

                            <button
                              type="button"
                              onClick={() => {
                                const newEx: Exercise = {
                                  id: `ex-${Date.now()}-${Math.random()}`,
                                  name: "Novo Exercício",
                                  sets: 3,
                                  reps: "10-12",
                                  weight: 0,
                                  division: activeDivisionTab,
                                  notes: "",
                                  advancedTechnique: "Nenhuma"
                                };
                                setEditedExercises(prev => [...prev, newEx]);
                              }}
                              className={`w-full py-2.5 border border-dashed rounded-xl text-center font-black text-xs cursor-pointer transition-all hover:scale-[1.01] ${
                                isLightTheme
                                  ? "border-cyan-400 text-cyan-600 hover:bg-cyan-50/50"
                                  : "border-[#00f2ff]/30 text-[#00f2ff] hover:bg-[#00f2ff]/5"
                              }`}
                            >
                              + Adicionar Exercício na Ficha {activeDivisionTab}
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                setShowAddGlobalExModal(true);
                              }}
                              className={`w-full mt-2 py-2.5 border border-dashed rounded-xl text-center font-black text-xs cursor-pointer flex items-center justify-center gap-1.5 transition-all hover:scale-[1.01] ${
                                isLightTheme
                                  ? "border-amber-400 text-amber-600 hover:bg-amber-50/50"
                                  : "border-amber-500/30 text-amber-400 hover:bg-amber-500/5"
                              }`}
                            >
                              <span>✨</span>
                              <span>Cadastrar Exercício no Banco Global</span>
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* Tab 3: Dieta & Macros */}
              {active360Tab === "dieta" && (
                <div className="space-y-4 animate-fade-in font-mono text-xs relative z-10">
                  {(() => {
                    const studentDiet = diets.find(d => d.studentId === selectedStudent.id);
                    
                    if (!studentDiet) {
                      return (
                        <div className={`text-center p-10 rounded-2xl border border-dashed space-y-4 font-mono ${
                          isLightTheme 
                            ? "bg-gray-50 border-gray-200 text-gray-500" 
                            : "bg-[#0f1011] border-white/[0.05] text-[#b9cacb]/70"
                        }`}>
                          <Utensils className="w-12 h-12 mx-auto text-[#ccff00] opacity-30 animate-pulse" />
                          <p className="text-xs uppercase tracking-wider font-extrabold">Nenhuma prescrição de macros ou plano alimentar ativo.</p>
                          <button
                            type="button"
                            onClick={() => onSelectStudentForDiet(selectedStudent.id)}
                            className="bg-gradient-to-r from-[#00f2ff]/20 to-[#ccff00]/20 hover:from-[#00f2ff]/30 hover:to-[#ccff00]/30 text-white px-5 py-2.5 rounded-xl border border-[#ccff00]/30 font-black text-xs uppercase tracking-wider transition-all cursor-pointer hover:scale-[1.02] active:scale-95"
                          >
                            Prescrever Dieta com IA →
                          </button>
                        </div>
                      );
                    }

                    return (
                      <div className="space-y-4">
                        <div className={`p-5 rounded-2xl border ${
                          isLightTheme ? "bg-gray-50 border-gray-200" : "bg-[#0f1011] border-white/[0.04]"
                        }`}>
                          <div className={`flex justify-between items-center border-b pb-3 mb-4 flex-wrap gap-2 ${
                            isLightTheme ? "border-gray-200" : "border-white/[0.04]"
                          }`}>
                            <span className={`font-black text-[10px] uppercase tracking-wider ${isLightTheme ? "text-gray-900" : "text-white"}`}>Metas de Macronutrientes</span>
                            <span className={`text-xs font-black px-2.5 py-1 rounded-lg border tracking-wider ${
                              isLightTheme 
                                ? "bg-lime-100 text-lime-800 border-lime-300" 
                                : "bg-[#ccff00]/10 text-[#ccff00] border-[#ccff00]/20"
                            }`}>
                              {studentDiet.calorieTarget} KCAL / DIA
                            </span>
                          </div>

                          <div className="grid grid-cols-3 gap-3">
                            <div className={`p-3 rounded-xl border text-center ${
                              isLightTheme ? "bg-white border-gray-200 shadow-sm" : "bg-[#17181a] border-white/5"
                            }`}>
                              <span className="text-[8px] text-red-500 block uppercase font-black tracking-widest mb-1">Proteínas</span>
                              <span className={`font-black text-xs ${isLightTheme ? "text-gray-900" : "text-white"}`}>{studentDiet.proteinTarget || 160}g</span>
                            </div>
                            <div className={`p-3 rounded-xl border text-center ${
                              isLightTheme ? "bg-white border-gray-200 shadow-sm" : "bg-[#17181a] border-white/5"
                            }`}>
                              <span className="text-[8px] text-amber-600 block uppercase font-black tracking-widest mb-1">Carboidratos</span>
                              <span className={`font-black text-xs ${isLightTheme ? "text-gray-900" : "text-white"}`}>{studentDiet.carbsTarget || 220}g</span>
                            </div>
                            <div className={`p-3 rounded-xl border text-center ${
                              isLightTheme ? "bg-white border-gray-200 shadow-sm" : "bg-[#17181a] border-white/5"
                            }`}>
                              <span className="text-[8px] text-yellow-600 block uppercase font-black tracking-widest mb-1">Gorduras</span>
                              <span className={`font-black text-xs ${isLightTheme ? "text-gray-900" : "text-white"}`}>{studentDiet.fatTarget || 75}g</span>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <h4 className={`font-black uppercase text-[10px] tracking-wider pb-1.5 border-b flex items-center gap-2 ${
                            isLightTheme ? "text-gray-950 border-gray-200" : "text-white border-white/[0.04]"
                          }`}>
                            <Utensils className="w-4 h-4 text-lime-500 dark:text-[#ccff00]" /> Refeições Planejadas ({studentDiet.meals?.length || 0})
                          </h4>

                          <div className="space-y-2.5 max-h-[250px] overflow-y-auto pr-1 scrollbar-thin">
                            {(studentDiet.meals || []).map((m) => (
                              <div key={m.id} className={`p-3.5 rounded-xl border flex flex-col sm:flex-row justify-between gap-3 items-start sm:items-center ${
                                isLightTheme ? "bg-white border-gray-200 shadow-sm" : "bg-[#0f1011] border-white/[0.03]"
                              }`}>
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className={`text-[8px] px-2 py-0.5 rounded-md border font-black tracking-wider ${
                                      isLightTheme 
                                        ? "bg-lime-50 text-lime-800 border-lime-200" 
                                        : "bg-[#ccff00]/10 text-[#ccff00] border-[#ccff00]/25"
                                    }`}>{m.time}</span>
                                    <h5 className={`font-extrabold text-xs uppercase tracking-tight ${isLightTheme ? "text-gray-950" : "text-white"}`}>{m.name}</h5>
                                  </div>
                                  <p className={`text-[10px] leading-relaxed italic ${isLightTheme ? "text-gray-600" : "text-[#b9cacb]/80"}`}>{m.foods}</p>
                                </div>
                                <div className={`text-right shrink-0 border px-2.5 py-1 rounded-lg ${
                                  isLightTheme ? "bg-gray-50 border-gray-200" : "bg-[#17181a] border-white/5"
                                }`}>
                                  <p className={`text-[8px] font-bold uppercase tracking-widest ${isLightTheme ? "text-gray-500" : "text-[#b9cacb]/50"}`}>
                                    P: <span className={`font-black ${isLightTheme ? "text-gray-900" : "text-white"}`}>{m.protein || 30}g</span> | C: <span className={`font-black ${isLightTheme ? "text-gray-900" : "text-white"}`}>{m.carbs || 40}g</span> | G: <span className={`font-black ${isLightTheme ? "text-gray-900" : "text-white"}`}>{m.fat || 10}g</span>
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => onSelectStudentForDiet(selectedStudent.id)}
                          className={`w-full py-2.5 rounded-xl text-center font-black uppercase tracking-wider transition-colors cursor-pointer text-[10px] border ${
                            isLightTheme
                              ? "bg-lime-550 hover:bg-lime-600 text-white border-lime-600 shadow-sm"
                              : "bg-[#ccff00]/10 hover:bg-[#ccff00]/15 text-[#ccff00] border-[#ccff00]/25"
                          }`}
                        >
                          Acessar Diário de Nutrição e Consumo →
                        </button>
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* Tab 4: Histórico Físico & Avaliações */}
              {active360Tab === "avaliacao" && (
                <div className="space-y-4 animate-fade-in font-mono text-xs relative z-10">
                  {selectedStudent.hasPhysicalEvaluation ? (
                    <div className="space-y-4">
                      <div className={`p-4 rounded-2xl border ${
                        isLightTheme ? "bg-gray-50 border-gray-200" : "bg-[#0f1011] border-white/[0.04]"
                      }`}>
                        <div className="flex justify-between items-center mb-3 flex-wrap gap-2">
                          <span className={`font-black text-[10px] uppercase tracking-wider ${isLightTheme ? "text-gray-950" : "text-white"}`}>Histórico de Composição Corporal</span>
                          <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg border ${
                            isLightTheme
                              ? "bg-cyan-100 text-cyan-800 border-cyan-300"
                              : "bg-[#00f2ff]/10 text-[#00f2ff] border-[#00f2ff]/25"
                          }`}>Ativa</span>
                        </div>
                        <p className={`text-[10px] uppercase tracking-widest ${isLightTheme ? "text-gray-600" : "text-[#b9cacb]/60"}`}>Avaliação Realizada em: <b className={`${isLightTheme ? "text-gray-900" : "text-white"} font-black`}>{selectedStudent.physicalEvaluationDate}</b></p>
                        
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-4 text-center">
                          <div className={`p-3 rounded-xl border transition-all ${
                            isLightTheme 
                              ? "bg-white border-gray-200 hover:border-cyan-500/40 shadow-sm" 
                              : "bg-[#17181a] border-white/5 hover:border-[#00f2ff]/30"
                          }`}>
                            <span className="text-[8px] text-gray-500 block mb-1 uppercase font-black tracking-widest">Altura</span>
                            <span className={`font-black text-xs ${isLightTheme ? "text-gray-950" : "text-white"}`}>{selectedStudent.height ? `${selectedStudent.height > 3 ? selectedStudent.height : Math.round(selectedStudent.height * 100)} cm` : "--"}</span>
                          </div>
                          <div className={`p-3 rounded-xl border transition-all ${
                            isLightTheme 
                              ? "bg-white border-gray-200 hover:border-cyan-500/40 shadow-sm" 
                              : "bg-[#17181a] border-white/5 hover:border-[#00f2ff]/30"
                          }`}>
                            <span className="text-[8px] text-gray-500 block mb-1 uppercase font-black tracking-widest">Peso</span>
                            <span className={`font-black text-xs ${isLightTheme ? "text-gray-950" : "text-white"}`}>{selectedStudent.weight} kg</span>
                          </div>
                          <div className={`p-3 rounded-xl border transition-all ${
                            isLightTheme 
                              ? "bg-white border-gray-200 hover:border-cyan-500/40 shadow-sm" 
                              : "bg-[#17181a] border-white/5 hover:border-[#00f2ff]/30"
                          }`}>
                            <span className="text-[8px] text-gray-500 block mb-1 uppercase font-black tracking-widest">BF Estimado</span>
                            <span className={`font-black text-xs ${isLightTheme ? "text-cyan-700 font-extrabold" : "text-[#00f2ff]"}`}>13.8%</span>
                          </div>
                          <div className={`p-3 rounded-xl border transition-all ${
                            isLightTheme 
                              ? "bg-white border-gray-200 hover:border-cyan-500/40 shadow-sm" 
                              : "bg-[#17181a] border-white/5 hover:border-[#00f2ff]/30"
                          }`}>
                            <span className="text-[8px] text-gray-500 block mb-1 uppercase font-black tracking-widest">Massa Isenta</span>
                            <span className={`font-black text-xs ${isLightTheme ? "text-gray-950" : "text-white"}`}>{(selectedStudent.weight ? selectedStudent.weight * 0.862 : 72).toFixed(1)} kg</span>
                          </div>
                        </div>
                      </div>

                      <div className={`p-4 rounded-2xl border space-y-2 ${
                        isLightTheme ? "bg-gray-50 border-gray-200" : "bg-[#0f1011] border-white/[0.04]"
                      }`}>
                        <h4 className={`font-black uppercase tracking-wider text-[10px] pb-2 border-b flex items-center gap-2 ${
                          isLightTheme ? "text-gray-950 border-gray-200" : "text-[#e3e2e4] border-white/[0.04]"
                        }`}>
                          <Activity className="w-4 h-4 text-cyan-500 dark:text-[#00f2ff]" /> Diagnóstico Postural Computadorizado (IA)
                        </h4>
                        <div className={`flex justify-between items-center text-[10px] uppercase tracking-widest pt-1 ${
                          isLightTheme ? "text-gray-700" : "text-[#b9cacb]/80"
                        }`}>
                          <span>Simetria e Grade Angular:</span>
                          <span className="text-emerald-500 font-black uppercase bg-emerald-500/10 border border-emerald-500/25 px-2.5 py-0.5 rounded-md">Alinhado</span>
                        </div>
                        <p className={`text-[10px] leading-relaxed italic mt-1.5 ${
                          isLightTheme ? "text-gray-600" : "text-[#b9cacb]/60"
                        }`}>
                          Eixo biomecânico estável em relação à linha do fio de prumo. Leve rotação pélvica lateral identificada na leitura fotostática. Diretrizes de flexibilidade aplicadas.
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => onSelectStudentForDiet(selectedStudent.id)}
                        className={`w-full py-2.5 rounded-xl text-center font-black uppercase tracking-wider text-[10px] border ${
                          isLightTheme
                            ? "bg-cyan-500 hover:bg-cyan-600 text-white border-cyan-600 shadow-sm"
                            : "bg-[#00f2ff]/10 text-[#00f2ff] hover:bg-[#00f2ff]/15 border border-[#00f2ff]/25"
                        }`}
                      >
                        Iniciar Nova Análise Postural & Composição →
                      </button>
                    </div>
                  ) : (
                    <div className={`text-center p-10 rounded-2xl border border-dashed space-y-4 ${
                      isLightTheme 
                        ? "bg-gray-50 border-gray-200 text-gray-500" 
                        : "bg-[#0f1011] border-white/[0.05] text-[#b9cacb]/70"
                    }`}>
                      <Activity className="w-12 h-12 mx-auto text-[#00f2ff] opacity-30 animate-pulse" />
                      <p className="text-xs uppercase tracking-wider font-extrabold">Nenhuma avaliação corporal ou postural realizada.</p>
                      <button
                        type="button"
                        onClick={() => onSelectStudentForDiet(selectedStudent.id)}
                        className="bg-gradient-to-r from-[#00f2ff]/20 to-[#ccff00]/20 hover:from-[#00f2ff]/30 hover:to-[#ccff00]/30 text-white px-5 py-2.5 rounded-xl border border-[#00f2ff]/30 font-black text-xs uppercase tracking-wider transition-all cursor-pointer hover:scale-[1.02] active:scale-95"
                      >
                        Medir Composição Corporal & Postura IA →
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Tab 5: Mensalidades & Contratos */}
              {active360Tab === "financeiro" && (
                <div className="space-y-4 animate-fade-in font-mono text-xs relative z-10">
                  {(() => {
                    const studentPayments = payments.filter(p => p.studentId === selectedStudent.id);
                    const overduePayments = studentPayments.filter(p => p.status === "overdue");
                    const paidPayments = studentPayments.filter(p => p.status === "paid");
                    
                    return (
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-3">
                          <div className={`p-4 rounded-2xl border ${
                            isLightTheme ? "bg-gray-50 border-gray-200" : "bg-[#0f1011] border-white/[0.04]"
                          }`}>
                            <span className="text-[8px] text-gray-500 block uppercase mb-1 font-black tracking-widest">Cobranças Pagas</span>
                            <span className={`font-black text-sm ${isLightTheme ? "text-gray-900" : "text-white"}`}>{paidPayments.length} de {studentPayments.length}</span>
                          </div>
                          <div className={`p-4 rounded-2xl border ${
                            isLightTheme ? "bg-gray-50 border-gray-200" : "bg-[#0f1011] border-white/[0.04]"
                          }`}>
                            <span className="text-[8px] text-gray-500 block uppercase mb-1 font-black tracking-widest">Situação da Conta</span>
                            {overduePayments.length > 0 ? (
                              <span className="text-red-500 dark:text-red-400 font-black text-xs block uppercase tracking-widest animate-pulse">Débito em Atraso</span>
                            ) : (
                              <span className="text-emerald-600 dark:text-emerald-400 font-black text-xs block uppercase tracking-widest">Faturas em Dia</span>
                            )}
                          </div>
                        </div>

                        {/* Active Expiration & Renew button */}
                        <div className={`p-4 rounded-2xl border flex justify-between items-center gap-4 ${
                          isLightTheme 
                            ? "bg-gradient-to-r from-cyan-50 to-blue-50/55 border-cyan-200 shadow-sm" 
                            : "bg-gradient-to-r from-cyan-950/25 to-blue-950/25 border-cyan-500/10"
                        }`}>
                          <div>
                            <p className={`font-black text-xs uppercase tracking-tight ${isLightTheme ? "text-cyan-900" : "text-white"}`}>Status do Contrato Atual</p>
                            <p className={`text-xs font-bold mt-1.5 flex items-center gap-1.5 ${isLightTheme ? "text-cyan-700" : "text-cyan-400"}`}>
                              📅 Vence: {selectedStudent.renewalDueDate || "N/A"}
                              {selectedStudent.renewalDays !== undefined && (
                                <span className={`${isLightTheme ? "text-gray-500" : "text-gray-400"} text-[10px]`}>({selectedStudent.renewalDays} dias)</span>
                              )}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={handleOpenRenewModal}
                            className={`px-4 py-2.5 text-[10px] font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                              isLightTheme
                                ? "bg-cyan-600 hover:bg-cyan-500 text-white shadow-sm"
                                : "bg-cyan-500 hover:bg-cyan-400 text-black shadow-lg shadow-cyan-500/15"
                            }`}
                          >
                            <RefreshCw className="w-3.5 h-3.5 animate-spin-slow" />
                            Renovar Plano
                          </button>
                        </div>

                        <div className="space-y-2.5">
                          <h4 className={`font-black uppercase text-[10px] tracking-wider pb-1.5 border-b flex items-center gap-2 ${
                            isLightTheme ? "text-gray-950 border-gray-200" : "text-white border-white/[0.04]"
                          }`}>
                            <CreditCard className="w-4 h-4 text-cyan-500 dark:text-[#00f2ff]" /> Histórico de Transações
                          </h4>

                          {studentPayments.length === 0 ? (
                            <p className="text-gray-500 italic text-[10px] text-center p-6">Nenhuma cobrança registrada neste cadastro.</p>
                          ) : (
                            <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1 scrollbar-thin">
                              {studentPayments.map((p) => (
                                <div key={p.id} className={`p-3.5 rounded-xl border flex justify-between items-center gap-2 ${
                                  isLightTheme ? "bg-white border-gray-200 shadow-sm" : "bg-[#0f1011] border-white/[0.03]"
                                }`}>
                                  <div>
                                    <p className={`font-black text-xs uppercase tracking-tight ${isLightTheme ? "text-gray-900" : "text-white"}`}>Fatura - Plano {p.plan}</p>
                                    <p className="text-gray-500 text-[9px] mt-1 font-bold">Vence em: {p.dueDate}</p>
                                  </div>
                                  <div className="text-right shrink-0">
                                    <p className={`font-black text-xs ${isLightTheme ? "text-gray-900" : "text-white"}`}>R$ {p.amount.toFixed(2)}</p>
                                    <div className="mt-1">
                                      {p.status === "paid" ? (
                                        <span className="text-[8px] text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-lg font-black uppercase tracking-wider">Paga</span>
                                      ) : p.status === "overdue" ? (
                                        <span className="text-[8px] text-red-500 dark:text-red-400 bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded-lg font-black uppercase tracking-wider animate-pulse">Atrasada</span>
                                      ) : (
                                        <span className="text-[8px] text-amber-600 dark:text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-lg font-black uppercase tracking-wider">Pendente</span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Renewals History */}
                        {((selectedStudent as any).renewalsHistory && (selectedStudent as any).renewalsHistory.length > 0) && (
                          <div className={`space-y-2 pt-2 border-t ${
                            isLightTheme ? "border-gray-200" : "border-white/[0.03]"
                          }`}>
                            <h4 className={`font-black uppercase text-[10px] tracking-wider pb-1.5 border-b flex items-center gap-2 ${
                              isLightTheme ? "text-gray-950 border-gray-200" : "text-white border-white/[0.04]"
                            }`}>
                              <RefreshCw className="w-4 h-4 text-cyan-600 dark:text-cyan-400" /> Histórico de Renovações de Plano
                            </h4>
                            <div className="space-y-2 max-h-[140px] overflow-y-auto pr-1 scrollbar-thin">
                              {((selectedStudent as any).renewalsHistory as any[]).map((r, idx) => (
                                <div key={r.id || idx} className={`p-3 rounded-xl border flex justify-between items-center gap-2 text-[10px] ${
                                  isLightTheme ? "bg-gray-50 border-gray-200 shadow-sm" : "bg-[#0c0d0f] border-white/[0.02]"
                                }`}>
                                  <div>
                                    <p className="text-cyan-600 dark:text-cyan-400 font-bold uppercase">{r.plan} - {r.period}</p>
                                    <p className="text-gray-500 text-[8px] mt-0.5">Renovado: {r.date} por {r.by}</p>
                                  </div>
                                  <div className="text-right shrink-0">
                                    <p className={`font-bold ${isLightTheme ? "text-gray-950" : "text-white"}`}>R$ {r.amount.toFixed(2)}</p>
                                    <p className="text-gray-500 text-[8px] mt-0.5">Vence: {r.dueDate}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* Centralized Action Dashboard Buttons (Modern, Uniform) */}
              <div className={`pt-5 border-t relative z-10 ${
                isLightTheme ? "border-gray-200" : "border-white/[0.05]"
              }`}>
                <h4 className={`font-black uppercase tracking-wider text-[10px] pb-2 border-b font-mono flex items-center gap-2 ${
                  isLightTheme ? "text-gray-950 border-gray-200" : "text-[#e3e2e4] border-white/[0.04]"
                }`}>
                  <Edit className="w-4 h-4 text-cyan-500 dark:text-[#00f2ff]" /> Painel de Controle de Ações Rápidas
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-4">
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(selectedStudent)}
                    className={`flex flex-col items-center justify-center p-3.5 rounded-2xl border transition-all duration-200 group cursor-pointer hover:scale-[1.02] active:scale-[0.98] ${
                      isLightTheme 
                        ? "bg-gray-50 hover:bg-cyan-50/50 border-gray-200 hover:border-cyan-500/40 text-gray-900 hover:text-cyan-700" 
                        : "bg-[#0f1011] hover:bg-[#00f2ff]/5 border border-white/[0.04] hover:border-[#00f2ff]/40 text-[#e3e2e4] hover:text-[#00f2ff]"
                    }`}
                  >
                    <div className="w-9 h-9 rounded-xl bg-[#00f2ff]/5 group-hover:bg-[#00f2ff]/10 flex items-center justify-center mb-2 transition-colors">
                      <Pencil className="w-4 h-4 text-[#00f2ff] stroke-[2.5px]" />
                    </div>
                    <span className="font-black text-[9px] tracking-wider text-center uppercase">Editar Dados</span>
                    <span className={`text-[8px] mt-0.5 font-medium ${isLightTheme ? "text-gray-500" : "text-[#b9cacb]/40"}`}>CADASTRO</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onSelectStudentForWorkout(selectedStudent.id)}
                    className={`flex flex-col items-center justify-center p-3.5 rounded-2xl border transition-all duration-200 group cursor-pointer hover:scale-[1.02] active:scale-[0.98] ${
                      isLightTheme 
                        ? "bg-gray-50 hover:bg-cyan-50/50 border-gray-200 hover:border-cyan-500/40 text-gray-900 hover:text-cyan-700" 
                        : "bg-[#0f1011] hover:bg-[#00f2ff]/5 border border-white/[0.04] hover:border-[#00f2ff]/40 text-[#e3e2e4] hover:text-[#00f2ff]"
                    }`}
                  >
                    <div className="w-9 h-9 rounded-xl bg-[#00f2ff]/5 group-hover:bg-[#00f2ff]/10 flex items-center justify-center mb-2 transition-colors">
                      <Dumbbell className="w-4 h-4 text-[#00f2ff] stroke-[2.5px]" />
                    </div>
                    <span className="font-black text-[9px] tracking-wider text-center uppercase">Montar Treino</span>
                    <span className={`text-[8px] mt-0.5 font-medium ${isLightTheme ? "text-gray-500" : "text-[#b9cacb]/40"}`}>PLANILHA</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onSelectStudentForDiet(selectedStudent.id)}
                    className={`flex flex-col items-center justify-center p-3.5 rounded-2xl border transition-all duration-200 group cursor-pointer hover:scale-[1.02] active:scale-[0.98] ${
                      isLightTheme 
                        ? "bg-gray-50 hover:bg-lime-50/50 border-gray-200 hover:border-lime-500/40 text-gray-900 hover:text-lime-700" 
                        : "bg-[#0f1011] hover:bg-[#ccff00]/5 border border-white/[0.04] hover:border-[#ccff00]/40 text-[#e3e2e4] hover:text-[#ccff00]"
                    }`}
                  >
                    <div className="w-9 h-9 rounded-xl bg-[#ccff00]/5 group-hover:bg-[#ccff00]/10 flex items-center justify-center mb-2 transition-colors">
                      <Utensils className="w-4 h-4 text-[#ccff00] stroke-[2.5px]" />
                    </div>
                    <span className="font-black text-[9px] tracking-wider text-center uppercase">Ajustar Dieta</span>
                    <span className={`text-[8px] mt-0.5 font-medium ${isLightTheme ? "text-gray-500" : "text-[#b9cacb]/40"}`}>ALIMENTAÇÃO</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      onUpdateStudent({
                        ...selectedStudent,
                        status: selectedStudent.status === "active" ? "inactive" : "active"
                      });
                    }}
                    className={`flex flex-col items-center justify-center p-3.5 rounded-2xl border transition-all duration-200 group cursor-pointer hover:scale-[1.02] active:scale-[0.98] ${
                      isLightTheme 
                        ? "bg-gray-50 hover:bg-amber-50/50 border-gray-200 hover:border-amber-500/40 text-gray-900 hover:text-amber-700" 
                        : "bg-[#0f1011] hover:bg-amber-500/10 border border-white/[0.04] hover:border-amber-500/30 text-[#e3e2e4] hover:text-amber-400"
                    }`}
                  >
                    <div className="w-9 h-9 rounded-xl bg-amber-500/5 group-hover:bg-amber-500/15 flex items-center justify-center mb-2 transition-colors">
                      <Archive className="w-4 h-4 text-amber-500 stroke-[2.5px]" />
                    </div>
                    <span className="font-black text-[9px] tracking-wider text-center uppercase">
                      {selectedStudent.status === "active" ? "Arquivar Atleta" : "Desarquivar"}
                    </span>
                    <span className={`text-[8px] mt-0.5 font-medium ${isLightTheme ? "text-gray-500" : "text-[#b9cacb]/40"}`}>
                      {selectedStudent.status === "active" ? "DESATIVAR" : "ATIVAR"}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setStudentToDelete(selectedStudent)}
                    className={`flex flex-col items-center justify-center p-3.5 rounded-2xl border transition-all duration-200 group cursor-pointer hover:scale-[1.02] active:scale-[0.98] ${
                      isLightTheme 
                        ? "bg-gray-50 hover:bg-red-50 border-gray-200 hover:border-red-500/40 text-gray-900 hover:text-red-600" 
                        : "bg-[#0f1011] hover:bg-red-500/10 border border-white/[0.04] hover:border-red-500/30 text-[#e3e2e4] hover:text-red-400"
                    }`}
                  >
                    <div className="w-9 h-9 rounded-xl bg-red-500/5 group-hover:bg-red-500/15 flex items-center justify-center mb-2 transition-colors">
                      <Trash2 className="w-4 h-4 text-red-500 stroke-[2.5px]" />
                    </div>
                    <span className={`font-black text-[9px] tracking-wider text-center uppercase ${isLightTheme ? "text-red-600" : "text-red-400/90"}`}>Remover Aluno</span>
                    <span className={`text-[8px] mt-0.5 font-medium ${isLightTheme ? "text-red-400/50" : "text-red-400/40"}`}>EXCLUSÃO</span>
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Student Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleCancelForm}></div>
          
          <div className="glass-panel w-full max-w-lg rounded-xl relative shadow-[0_0_30px_rgba(0,242,255,0.1)] overflow-hidden">
            {/* Header */}
            <div className="p-5 border-b border-[#3a494b]/30 flex justify-between items-center bg-[#1f2022]/40">
              <div className="flex items-center gap-2">
                {editingStudent ? (
                  <Pencil className="w-4 h-4 text-[#00f2ff]" />
                ) : (
                  <UserPlus className="w-4 h-4 text-[#00f2ff]" />
                )}
                <h3 className="font-bold text-lg text-[#e3e2e4]">
                  {editingStudent ? "Editar Cadastro do Atleta" : "Cadastrar Novo Atleta"}
                </h3>
              </div>
              <button type="button" className="text-[#b9cacb] hover:text-[#e3e2e4] transition-colors" onClick={handleCancelForm}>
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4 font-mono text-xs">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#b9cacb] font-bold mb-1.5 uppercase tracking-wider text-[10px]">
                    Nome Completo *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Pedro Henrique"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full bg-[#1b1c1e] border border-[#3a494b]/40 focus:border-[#00f2ff] text-white px-3 py-2 rounded-lg outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[#b9cacb] font-bold mb-1.5 uppercase tracking-wider text-[10px]">
                    Telefone celular *
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: +55 (11) 98888-8888"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    className="w-full bg-[#1b1c1e] border border-[#3a494b]/40 focus:border-[#00f2ff] text-white px-3 py-2 rounded-lg outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#b9cacb] font-bold mb-1.5 uppercase tracking-wider text-[10px]">
                  E-mail do Atleta *
                </label>
                <input
                  type="email"
                  required
                  placeholder="Ex: pedro@email.com"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full bg-[#1b1c1e] border border-[#3a494b]/40 focus:border-[#00f2ff] text-white px-3 py-2 rounded-lg outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-[#b9cacb] font-bold mb-1.5 uppercase tracking-wider text-[10px]">
                  Senha do Aluno (Mín. 6 caracteres) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: 123456"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-[#1b1c1e] border border-[#3a494b]/40 focus:border-[#00f2ff] text-white px-3 py-2 rounded-lg outline-none transition-all"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-1">
                  <label className="block text-[#b9cacb] font-bold mb-1.5 uppercase tracking-wider text-[10px]">
                    Plano *
                  </label>
                  <select
                    value={newPlan}
                    onChange={(e) => setNewPlan(e.target.value)}
                    className="w-full bg-[#1b1c1e] border border-[#3a494b]/40 focus:border-[#00f2ff] text-white px-3 py-1.5 rounded-lg outline-none transition-all select-custom"
                  >
                    {plans.map(p => (
                      <option key={p.id} value={p.name}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-1">
                  <label className="block text-[#b9cacb] font-bold mb-1.5 uppercase tracking-wider text-[10px]">
                    Objetivo Inicial
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Hipertrofia..."
                    value={newPhase}
                    onChange={(e) => setNewPhase(e.target.value)}
                    className="w-full bg-[#1b1c1e] border border-[#3a494b]/40 focus:border-[#00f2ff] text-white px-3 py-1.5 rounded-lg outline-none transition-all"
                  />
                </div>

                <div className="sm:col-span-1">
                  <label className="block text-[#b9cacb] font-bold mb-1.5 uppercase tracking-wider text-[10px]">
                    Sexo Biológico *
                  </label>
                  <select
                    value={newGender}
                    onChange={(e) => setNewGender(e.target.value as "masculino" | "feminino")}
                    className="w-full bg-[#1b1c1e] border border-[#3a494b]/40 focus:border-[#00f2ff] text-white px-3 py-1.5 rounded-lg outline-none transition-all select-custom"
                  >
                    <option value="masculino">Masculino</option>
                    <option value="feminino">Feminino</option>
                  </select>
                </div>
              </div>

              {editingStudent && (
                <div className="pt-1">
                  <label className="block text-[#00f2ff] font-bold mb-1.5 uppercase tracking-wider text-[10px]">
                    Status de Matrícula *
                  </label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as "active" | "inactive" | "pending_renewal")}
                    className="w-full bg-[#1b1c1e] border border-[#00f2ff]/30 focus:border-[#00f2ff] text-[#00f2ff] font-bold px-3 py-2 rounded-lg outline-none transition-all select-custom"
                  >
                    <option value="active">Ativo (Em Dia)</option>
                    <option value="inactive">Inativo (Desativado)</option>
                    <option value="pending_renewal">Aguardando Renovação</option>
                  </select>
                </div>
              )}

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2">
                <div>
                  <label className="block text-[#b9cacb] font-bold mb-1.5 uppercase tracking-wider text-[10px]">
                    Peso (kg)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="Ex: 80.5"
                    value={newWeight}
                    onChange={(e) => setNewWeight(e.target.value)}
                    className="w-full bg-[#1b1c1e] border border-[#3a494b]/40 focus:border-[#00f2ff] text-white px-3 py-2 rounded-lg outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[#b9cacb] font-bold mb-1.5 uppercase tracking-wider text-[10px]">
                    Altura (cm)
                  </label>
                  <input
                    type="number"
                    step="1"
                    placeholder="Ex: 180"
                    value={newHeight}
                    onChange={(e) => setNewHeight(e.target.value)}
                    className="w-full bg-[#1b1c1e] border border-[#3a494b]/40 focus:border-[#00f2ff] text-white px-3 py-2 rounded-lg outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[#b9cacb] font-bold mb-1.5 uppercase tracking-wider text-[10px]">
                    Nascimento
                  </label>
                  <input
                    type="date"
                    value={newBirthDate}
                    onChange={(e) => {
                      const val = e.target.value;
                      setNewBirthDate(val);
                      if (val) {
                        const calculatedAge = calculateAgeFromBirthDate(val);
                        setNewAge(calculatedAge);
                      }
                    }}
                    className="w-full bg-[#1b1c1e] border border-[#3a494b]/40 focus:border-[#00f2ff] text-white px-3 py-2 rounded-lg outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[#b9cacb] font-bold mb-1.5 uppercase tracking-wider text-[10px]">
                    Idade (anos)
                  </label>
                  <input
                    type="number"
                    placeholder="Ex: 25"
                    value={newAge}
                    onChange={(e) => setNewAge(e.target.value)}
                    className="w-full bg-[#1b1c1e] border border-[#3a494b]/40 focus:border-[#00f2ff] text-white px-3 py-2 rounded-lg outline-none transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#b9cacb] font-bold mb-1.5 uppercase tracking-wider text-[10px]">
                    Limitações Físicas / Lesões
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Ex: Condromalácia patelar grau II no joelho esquerdo, hérnia de disco L4-L5."
                    value={newLimitations}
                    onChange={(e) => setNewLimitations(e.target.value)}
                    className="w-full bg-[#1b1c1e] border border-[#3a494b]/40 focus:border-[#00f2ff] text-white px-3 py-2 rounded-lg outline-none transition-all text-xs font-sans resize-none"
                  />
                </div>
                <div>
                  <label className="block text-[#b9cacb] font-bold mb-1.5 uppercase tracking-wider text-[10px]">
                    Observações Clínicas / Geral
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Ex: Aluno treina melhor pela manhã, foco em emagrecimento agressivo."
                    value={newObservations}
                    onChange={(e) => setNewObservations(e.target.value)}
                    className="w-full bg-[#1b1c1e] border border-[#3a494b]/40 focus:border-[#00f2ff] text-white px-3 py-2 rounded-lg outline-none transition-all text-xs font-sans resize-none"
                  />
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={handleCancelForm}
                  className="flex-1 px-4 py-2.5 rounded-lg border border-[#3a494b]/40 text-[#e3e2e4] font-bold hover:bg-[#343537] transition-all cursor-pointer text-center"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-[2] primary-gradient text-on-primary-fixed px-4 py-2.5 rounded-lg font-bold hover:shadow-[0_0_15px_rgba(0,242,255,0.4)] active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  {editingStudent ? (
                    <>
                      <Pencil className="w-4 h-4" />
                      Atualizar Atleta
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      Salvar Cadastro
                    </>
                  )}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Import Students Modal */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setIsImportModalOpen(false)}></div>
          
          <div className="glass-panel w-full max-w-xl rounded-xl relative shadow-[0_0_30px_rgba(0,242,255,0.15)] overflow-hidden">
            {/* Header */}
            <div className="p-5 border-b border-[#3a494b]/30 flex justify-between items-center bg-[#1f2022]/40">
              <div className="flex items-center gap-2">
                <Archive className="w-5 h-5 text-[#00f2ff]" />
                <h3 className="text-base font-extrabold text-white tracking-wider uppercase font-mono">
                  Importação Rápida de Alunos
                </h3>
              </div>
              <button
                onClick={() => setIsImportModalOpen(false)}
                className="text-gray-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              <p className="text-xs text-[#b9cacb]/90 font-mono leading-relaxed">
                Você pode importar múltiplos alunos simultaneamente colando um array JSON ou linhas formatadas em CSV (separadas por vírgula).
              </p>

              {/* Format Guidelines */}
              <div className="p-3.5 rounded-lg bg-[#111214] border border-white/5 space-y-2 font-mono text-[10px]">
                <p className="text-[#00f2ff] font-bold uppercase">Formatos Suportados:</p>
                <div className="space-y-1 text-gray-400">
                  <p><strong>1. CSV (Nome, Email, Telefone, Plano, Fase, Limitações, Observações)</strong></p>
                  <pre className="p-1.5 bg-black/45 rounded text-gray-300 overflow-x-auto text-[9px]">
                    Nome do Aluno, email@exemplo.com, +5511999999999, Platinum, Hipertrofia
                  </pre>
                  
                  <p className="pt-1"><strong>2. JSON Array</strong></p>
                  <pre className="p-1.5 bg-black/45 rounded text-gray-300 overflow-x-auto text-[9px] max-h-[70px]">
                    {`[\n  { "name": "Pedro", "email": "pedro@email.com", "plan": "Platinum" }\n]`}
                  </pre>
                </div>
              </div>

              {/* Error Alert */}
              {importError && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 font-mono text-[11px]">
                  ⚠️ {importError}
                </div>
              )}

              {/* Textarea */}
              <div className="space-y-1.5">
                <label className="block text-[#b9cacb] font-bold uppercase tracking-wider text-[10px] font-mono">
                  Cole os dados abaixo:
                </label>
                <textarea
                  rows={8}
                  placeholder="Nome do Aluno, email@exemplo.com, telefone..."
                  value={importText}
                  onChange={(e) => setImportText(e.target.value)}
                  className="w-full bg-[#1b1c1e] border border-[#3a494b]/40 focus:border-[#00f2ff] text-white px-3.5 py-3 rounded-lg outline-none transition-all font-mono text-xs resize-none"
                />
              </div>

              {/* Actions */}
              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsImportModalOpen(false)}
                  className="flex-1 px-4 py-2.5 rounded-lg border border-[#3a494b]/40 text-[#e3e2e4] font-bold hover:bg-[#343537] transition-all cursor-pointer text-center text-xs uppercase tracking-wider font-mono"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleImportStudents}
                  className="flex-[2] bg-gradient-to-r from-[#00f2ff] to-[#ccff00] text-black px-4 py-2.5 rounded-lg font-black hover:shadow-[0_0_15px_rgba(0,242,255,0.4)] active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer text-xs uppercase tracking-wider font-mono"
                >
                  <UserPlus className="w-4 h-4 text-black stroke-[3px]" />
                  Processar Importação
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* Premium Delete Confirmation Modal */}
      <AnimatePresence>
        {studentToDelete && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 bg-black/85 backdrop-blur-md"
              onClick={() => setStudentToDelete(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="glass-panel w-full max-w-md rounded-2xl relative shadow-[0_0_50px_rgba(239,68,68,0.25)] border border-red-500/20 overflow-hidden z-10"
            >
              <div className="p-6 text-center space-y-4">
                {/* Warning Icon Glow */}
                <div className="w-16 h-16 mx-auto bg-red-500/10 border border-red-500/30 rounded-full flex items-center justify-center text-red-500 shadow-[0_0_20px_rgba(239,68,68,0.2)]">
                  <Trash2 className="w-8 h-8" />
                </div>

                <div className="space-y-2">
                  <h3 className="text-xl font-extrabold text-white tracking-tight">Excluir Atleta?</h3>
                  <p className="text-sm text-gray-300 font-mono">
                    Você está prestes a remover <span className="text-red-400 font-bold">"{studentToDelete.name}"</span>.
                  </p>
                </div>

                <div className="bg-[#1b1c1e] p-4 rounded-xl border border-white/5 text-left text-xs font-mono text-gray-400 space-y-1.5 leading-relaxed">
                  <p className="text-red-400 font-bold mb-1">⚠️ ATENÇÃO: Esta ação é irreversível!</p>
                  <p>• Todos os treinos vinculados serão excluídos permanentemente.</p>
                  <p>• O histórico de dietas do atleta será apagado.</p>
                  <p>• Os lançamentos e mensalidades financeiras serão deletados.</p>
                </div>

                <div className="pt-2 grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setStudentToDelete(null)}
                    className="w-full bg-[#1b1c1e] hover:bg-[#343537] text-white border border-[#3a494b]/40 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer"
                  >
                    Manter Atleta
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onDeleteStudent(studentToDelete.id);
                      setStudentToDelete(null);
                    }}
                    className="w-full bg-red-600 hover:bg-red-500 text-white shadow-[0_0_15px_rgba(239,68,68,0.3)] hover:shadow-[0_0_25px_rgba(239,68,68,0.5)] py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer"
                  >
                    Excluir Permanentemente
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Premium Workout Detailed Modal */}
      <AnimatePresence>
        {selectedWorkoutDetail && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 bg-black/85 backdrop-blur-md"
              onClick={() => {
                setSelectedWorkoutDetail(null);
                setIsDeleteWorkoutConfirmOpen(false);
              }}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="glass-panel w-full max-w-xl rounded-2xl relative shadow-[0_0_50px_rgba(0,242,255,0.2)] border border-[#00f2ff]/20 overflow-hidden z-10"
            >
              {/* Header */}
              <div className="p-5 border-b border-[#3a494b]/30 flex justify-between items-center bg-[#1f2022]/40">
                <div className="flex items-center gap-2">
                  <Dumbbell className="w-5 h-5 text-[#00f2ff] animate-pulse" />
                  <div>
                    <h3 className="font-bold text-base text-[#e3e2e4]">
                      {selectedWorkoutDetail.name}
                    </h3>
                    <p className="text-[10px] text-gray-500 font-mono">
                      Última atualização: {selectedWorkoutDetail.lastUpdated}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  className="text-[#b9cacb] hover:text-[#e3e2e4] transition-colors cursor-pointer"
                  onClick={() => {
                    setSelectedWorkoutDetail(null);
                    setIsDeleteWorkoutConfirmOpen(false);
                  }}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Exercises List */}
              <div className="p-5 space-y-3 font-mono text-xs">
                <h4 className="text-[#00f2ff] font-bold uppercase tracking-wider text-[11px] pb-1 border-b border-[#3a494b]/10 mb-3">
                  Exercícios Prescritos ({selectedWorkoutDetail.exercises.length})
                </h4>
                
                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1 scrollbar-thin">
                  {selectedWorkoutDetail.exercises.map((exercise, index) => (
                    <div 
                      key={exercise.id || index}
                      className="bg-[#1b1c1e] p-3 rounded-xl border border-[#3a494b]/15 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:border-[#00f2ff]/30 transition-all"
                    >
                      <div className="space-y-1">
                        <span className="text-[10px] bg-[#00f2ff]/10 text-[#00dbe7] px-2 py-0.5 rounded font-bold uppercase">
                          Ex {index + 1}
                        </span>
                        <p className="text-white font-bold text-sm">{exercise.name}</p>
                        {exercise.notes && (
                          <p className="text-[10px] text-gray-400 italic">Obs: {exercise.notes}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-right">
                        <div className="bg-[#121315] px-2.5 py-1.5 rounded-lg border border-[#3a494b]/10">
                          <p className="text-gray-500 text-[9px] uppercase">Séries</p>
                          <p className="text-white font-bold text-xs">{exercise.sets}</p>
                        </div>
                        <div className="bg-[#121315] px-2.5 py-1.5 rounded-lg border border-[#3a494b]/10">
                          <p className="text-gray-500 text-[9px] uppercase">Reps</p>
                          <p className="text-white font-bold text-xs">{exercise.reps}</p>
                        </div>
                        <div className="bg-[#121315] px-2.5 py-1.5 rounded-lg border border-[#3a494b]/10">
                          <p className="text-gray-500 text-[9px] uppercase">Carga</p>
                          <p className="text-[#ebb2ff] font-bold text-xs">{exercise.weight} kg</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {isDeleteWorkoutConfirmOpen ? (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-red-500/10 border border-red-500/20 p-3 rounded-lg space-y-2 mt-4"
                  >
                    <p className="text-red-400 font-bold text-[11px]">
                      ⚠️ Tem certeza que deseja excluir este treino do atleta?
                    </p>
                    <p className="text-[10px] text-gray-400">
                      Esta ação desvinculará permanentemente esta planilha de exercícios.
                    </p>
                    <div className="flex gap-2 justify-end">
                      <button
                        type="button"
                        onClick={() => setIsDeleteWorkoutConfirmOpen(false)}
                        className="bg-[#1b1c1e] text-white border border-[#3a494b]/40 py-1 px-3 rounded text-[10px] font-bold cursor-pointer"
                      >
                        Não, cancelar
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          onDeleteWorkout(selectedWorkoutDetail.studentId);
                          setSelectedWorkoutDetail(null);
                          setIsDeleteWorkoutConfirmOpen(false);
                        }}
                        className="bg-red-600 hover:bg-red-500 text-white py-1 px-3 rounded text-[10px] font-bold cursor-pointer"
                      >
                        Sim, excluir treino
                      </button>
                    </div>
                  </motion.div>
                ) : null}
              </div>

              {/* Action Footer */}
              <div className="p-4 bg-[#1f2022]/20 border-t border-[#3a494b]/20 flex flex-col sm:flex-row gap-2 justify-between items-center">
                {!isDeleteWorkoutConfirmOpen ? (
                  <button
                    type="button"
                    onClick={() => setIsDeleteWorkoutConfirmOpen(true)}
                    className="w-full sm:w-auto bg-red-500/10 hover:bg-red-500/20 text-red-400 px-4 py-2 rounded-xl border border-red-500/20 hover:border-red-500/40 font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Excluir Treino
                  </button>
                ) : <div />}

                <div className="flex gap-2 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedWorkoutDetail(null);
                      onSelectStudentForWorkout(selectedWorkoutDetail.studentId);
                    }}
                    className="flex-1 sm:flex-initial bg-[#1b1c1e] hover:bg-[#00f2ff]/15 text-white hover:text-[#00dbe7] border border-[#3a494b]/40 hover:border-[#00f2ff]/40 px-4 py-2 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    Editar no Montador
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedWorkoutDetail(null);
                      setIsDeleteWorkoutConfirmOpen(false);
                    }}
                    className="flex-1 sm:flex-initial bg-[#00f2ff] hover:bg-[#00dbe7] text-black px-5 py-2 rounded-xl font-bold text-xs flex items-center justify-center transition-all cursor-pointer"
                  >
                    Fechar
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal: Cadastrar Novo Exercício Global */}
      <AnimatePresence>
        {showAddGlobalExModal && (
          <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#151719] border border-[#3a494b]/40 rounded-xl max-w-md w-full shadow-2xl p-6 font-mono text-xs text-white space-y-4"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-[#3a494b]/20 pb-3">
                <h4 className="text-sm font-extrabold text-[#e3e2e4] uppercase tracking-wider flex items-center gap-1.5">
                  <Dumbbell className="w-4 h-4 text-[#00f2ff]" />
                  Novo Exercício (Banco Global)
                </h4>
                <button
                  type="button"
                  onClick={() => setShowAddGlobalExModal(false)}
                  className="text-gray-400 hover:text-white text-lg font-bold"
                >
                  ✕
                </button>
              </div>

              {/* Form Content */}
              <form onSubmit={handleAddGlobalExercise} className="space-y-4 text-left">
                {/* Nome do Exercício */}
                <div className="space-y-1">
                  <label className="block text-[#b9cacb] font-bold uppercase tracking-wider text-[10px]">
                    Nome do Exercício *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Agachamento Sumô"
                    value={newGlobalExName}
                    onChange={(e) => setNewGlobalExName(e.target.value)}
                    className="w-full bg-[#1b1c1e] border border-[#3a494b]/40 text-white px-3 py-2 rounded-lg outline-none focus:border-[#00f2ff] font-mono text-xs"
                  />
                </div>

                {/* Grupo Muscular Primário */}
                <div className="space-y-1">
                  <label className="block text-[#b9cacb] font-bold uppercase tracking-wider text-[10px]">
                    Grupo Muscular Primário *
                  </label>
                  <select
                    required
                    value={newGlobalExGroup}
                    onChange={(e) => setNewGlobalExGroup(e.target.value)}
                    className="w-full bg-[#1b1c1e] border border-[#3a494b]/40 text-white px-3 py-2 rounded-lg outline-none focus:border-[#00f2ff] font-mono text-xs cursor-pointer"
                  >
                    {[
                      "Peitoral",
                      "Costas",
                      "Quadríceps",
                      "Posteriores de Coxa",
                      "Glúteos",
                      "Ombros",
                      "Bíceps",
                      "Tríceps",
                      "Core",
                      "Panturrilhas",
                      "Adutores",
                      "Eretores da Espinha"
                    ].map(m => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>

                {/* Tipo */}
                <div className="space-y-1">
                  <label className="block text-[#b9cacb] font-bold uppercase tracking-wider text-[10px]">
                    Tipo *
                  </label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer text-gray-300 hover:text-white select-none">
                      <input
                        type="radio"
                        name="globalMuscType"
                        value="Composto"
                        checked={newGlobalExType === "Composto"}
                        onChange={() => setNewGlobalExType("Composto")}
                        className="text-[#00f2ff] focus:ring-0 cursor-pointer"
                      />
                      Composto
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer text-gray-300 hover:text-white select-none">
                      <input
                        type="radio"
                        name="globalMuscType"
                        value="Isolado"
                        checked={newGlobalExType === "Isolado"}
                        onChange={() => setNewGlobalExType("Isolado")}
                        className="text-[#00f2ff] focus:ring-0 cursor-pointer"
                      />
                      Isolado
                    </label>
                  </div>
                </div>

                {/* Faixa de Repetições */}
                <div className="space-y-1">
                  <label className="block text-[#b9cacb] font-bold uppercase tracking-wider text-[10px]">
                    Faixa de Repetições Recomendada
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: 8-12"
                    value={newGlobalExReps}
                    onChange={(e) => setNewGlobalExReps(e.target.value)}
                    className="w-full bg-[#1b1c1e] border border-[#3a494b]/40 text-white px-3 py-2 rounded-lg outline-none focus:border-[#00f2ff] font-mono text-xs"
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-2 pt-3 border-t border-[#3a494b]/20">
                  <button
                    type="button"
                    onClick={() => setShowAddGlobalExModal(false)}
                    className="px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-[#b9cacb] hover:text-white transition-all cursor-pointer font-bold"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-[#00f2ff] text-black hover:brightness-110 active:scale-95 transition-all cursor-pointer font-bold flex items-center gap-1"
                  >
                    <Save className="w-3.5 h-3.5" />
                    Cadastrar
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal: Renovar Plano */}
      <AnimatePresence>
        {isRenewModalOpen && selectedStudent && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-[110] overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`border rounded-2xl max-w-md w-full p-6 font-mono text-xs space-y-5 transition-all duration-200 ${
                isLightTheme
                  ? "bg-white border-gray-200 text-gray-900 shadow-xl"
                  : "bg-[#111315] border-cyan-500/25 text-white shadow-[0_0_50px_rgba(0,242,255,0.15)]"
              }`}
            >
              {/* Header */}
              <div className={`flex items-center justify-between border-b pb-3 ${isLightTheme ? "border-gray-150" : "border-white/[0.04]"}`}>
                <h4 className={`text-sm font-extrabold uppercase tracking-wider flex items-center gap-1.5 ${isLightTheme ? "text-cyan-700" : "text-[#e3e2e4]"}`}>
                  <RefreshCw className={`w-4 h-4 ${isLightTheme ? "text-cyan-600" : "text-[#00f2ff]"}`} />
                  Renovação de Contrato / Plano
                </h4>
                <button
                  type="button"
                  onClick={() => setIsRenewModalOpen(false)}
                  className={`text-base font-bold transition-colors cursor-pointer ${isLightTheme ? "text-gray-400 hover:text-gray-900" : "text-gray-400 hover:text-white"}`}
                >
                  ✕
                </button>
              </div>

              {/* Atleta Info summary */}
              <div className={`p-3.5 rounded-xl border ${isLightTheme ? "bg-gray-50 border-gray-100" : "bg-[#0a0b0c] border-white/[0.02]"}`}>
                <p className={`text-[8px] uppercase font-black tracking-wider ${isLightTheme ? "text-gray-400" : "text-gray-500"}`}>Atleta Selecionado</p>
                <p className={`text-sm font-black mt-1 ${isLightTheme ? "text-gray-900" : "text-white"}`}>{selectedStudent.name}</p>
                <p className={`text-[10px] mt-1 ${isLightTheme ? "text-gray-600" : "text-gray-400"}`}>Plano Atual: <span className={isLightTheme ? "text-cyan-600 font-bold" : "text-cyan-400 font-bold"}>{selectedStudent.plan || "Nenhum"}</span></p>
                {selectedStudent.renewalDueDate && (
                  <p className={`text-[9px] mt-0.5 ${isLightTheme ? "text-gray-500" : "text-gray-400"}`}>Vencimento Atual: {selectedStudent.renewalDueDate}</p>
                )}
              </div>

              {/* Form fields */}
              <div className="space-y-4">
                {/* 1. Selecionar Plano */}
                <div className="space-y-1.5">
                  <label className={`block font-bold uppercase tracking-wider text-[10px] ${isLightTheme ? "text-gray-600" : "text-[#b9cacb]"}`}>
                    Novo Plano Escolhido
                  </label>
                  <select
                    value={renewPlan}
                    onChange={(e) => setRenewPlan(e.target.value)}
                    className={`w-full px-3 py-2.5 rounded-xl outline-none font-mono text-xs cursor-pointer border ${
                      isLightTheme
                        ? "bg-white border-gray-300 text-gray-900 focus:border-cyan-600"
                        : "bg-[#1b1c1e] border-white/10 text-white focus:border-[#00f2ff]"
                    }`}
                  >
                    {plans.map((p) => (
                      <option key={p.id} value={p.name} className={isLightTheme ? "text-gray-950 bg-white" : "text-white bg-[#1b1c1e]"}>
                        {p.name} - R$ {p.price.toFixed(2)}/mês
                      </option>
                    ))}
                  </select>
                </div>

                {/* 2. Selecionar Período */}
                <div className="space-y-1.5">
                  <label className={`block font-bold uppercase tracking-wider text-[10px] ${isLightTheme ? "text-gray-600" : "text-[#b9cacb]"}`}>
                    Período do Contrato
                  </label>
                  <select
                    value={renewPeriod}
                    onChange={(e) => setRenewPeriod(e.target.value as any)}
                    className={`w-full px-3 py-2.5 rounded-xl outline-none font-mono text-xs cursor-pointer border ${
                      isLightTheme
                        ? "bg-white border-gray-300 text-gray-900 focus:border-cyan-600"
                        : "bg-[#1b1c1e] border-white/10 text-white focus:border-[#00f2ff]"
                    }`}
                  >
                    <option value="mensal" className={isLightTheme ? "text-gray-950 bg-white" : "text-white bg-[#1b1c1e]"}>Mensal (1 Mês)</option>
                    <option value="trimestral" className={isLightTheme ? "text-gray-950 bg-white" : "text-white bg-[#1b1c1e]"}>Trimestral (3 Meses)</option>
                    <option value="semestral" className={isLightTheme ? "text-gray-950 bg-white" : "text-white bg-[#1b1c1e]"}>Semestral (6 Meses)</option>
                    <option value="anual" className={isLightTheme ? "text-gray-950 bg-white" : "text-white bg-[#1b1c1e]"}>Anual (12 Meses)</option>
                  </select>
                </div>

                {/* 3. Valor Ajustado */}
                <div className="space-y-1.5">
                  <label className={`block font-bold uppercase tracking-wider text-[10px] ${isLightTheme ? "text-gray-600" : "text-[#b9cacb]"}`}>
                    Valor Total da Renovação (R$)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={renewValue}
                    onChange={(e) => setRenewValue(Number(e.target.value))}
                    className={`w-full px-3 py-2.5 rounded-xl outline-none font-mono text-xs border ${
                      isLightTheme
                        ? "bg-white border-gray-300 text-gray-900 focus:border-cyan-600"
                        : "bg-[#1b1c1e] border-white/10 text-white focus:border-[#00f2ff]"
                    }`}
                  />
                  <p className="text-[9px] text-gray-500">
                    * Valor sugerido automaticamente com base no plano e período selecionados.
                  </p>
                </div>

                {/* Info Box: Auto calculated Dates */}
                <div className={`p-3.5 rounded-xl border text-left text-[10px] space-y-1 ${
                  isLightTheme
                    ? "bg-cyan-50/50 border-cyan-150 text-gray-700"
                    : "bg-gradient-to-r from-cyan-950/15 to-blue-950/15 border-cyan-500/10 text-gray-300"
                }`}>
                  <p className={`font-bold uppercase tracking-widest text-[8px] mb-1 ${isLightTheme ? "text-cyan-700 font-extrabold" : "text-cyan-400"}`}>
                    📊 Detalhes da Nova Vigência
                  </p>
                  <p>
                    • Data de Renovação:{" "}
                    <span className={`font-bold ${isLightTheme ? "text-gray-900" : "text-white"}`}>{new Date().toLocaleDateString("pt-BR")}</span>
                  </p>
                  <p>
                    • Novo Vencimento:{" "}
                    <span className={`font-bold ${isLightTheme ? "text-emerald-600" : "text-emerald-400"}`}>
                      {(() => {
                        let baseDate = new Date();
                        if (selectedStudent.renewalDueDate) {
                          const prevDue = new Date(selectedStudent.renewalDueDate + "T00:00:00");
                          if (prevDue > baseDate) {
                            baseDate = prevDue;
                          }
                        }
                        const newDueDate = new Date(baseDate);
                        let daysToAdd = 30;
                        if (renewPeriod === "trimestral") daysToAdd = 90;
                        else if (renewPeriod === "semestral") daysToAdd = 180;
                        else if (renewPeriod === "anual") daysToAdd = 365;
                        newDueDate.setDate(newDueDate.getDate() + daysToAdd);
                        return newDueDate.toISOString().split("T")[0];
                      })()}
                    </span>
                  </p>
                  <p className="text-gray-500 text-[9px] italic mt-1.5">
                    * Se o vencimento atual estiver no futuro, a vigência será somada a ele automaticamente.
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className={`flex justify-end gap-2.5 pt-3 border-t ${isLightTheme ? "border-gray-150" : "border-white/[0.04]"}`}>
                <button
                  type="button"
                  onClick={() => setIsRenewModalOpen(false)}
                  className={`px-4 py-2.5 rounded-xl transition-all cursor-pointer font-bold ${
                    isLightTheme
                      ? "bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-900"
                      : "bg-gray-800 hover:bg-gray-700 text-[#b9cacb] hover:text-white"
                  }`}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleRenewPlan}
                  className={`px-4 py-2.5 rounded-xl font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    isLightTheme
                      ? "bg-cyan-600 text-white hover:bg-cyan-700 shadow-sm active:scale-95"
                      : "bg-[#00f2ff] text-black hover:brightness-110 active:scale-95"
                  }`}
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Confirmar Renovação
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
