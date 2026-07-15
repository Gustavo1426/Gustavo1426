import React, { useState, useEffect } from "react";
import { 
  Flame, 
  Trophy, 
  Award, 
  Plus, 
  Trash2, 
  Sparkles, 
  Check, 
  Zap, 
  Users, 
  Gift, 
  Search, 
  ArrowUp, 
  ShieldAlert, 
  Calendar,
  X,
  Edit2
} from "lucide-react";
import { Student } from "../../../types";

interface Challenge {
  id: string;
  title: string;
  description: string;
  badge: string;
  targetCount: number;
  xpReward: number;
  category: "consistency" | "load" | "attendance" | "special";
  endDate: string;
}

interface XpMultiplier {
  id: string;
  workoutType: string;
  multiplier: number;
  isActive: boolean;
  notes: string;
}

interface StudentGamification {
  studentId: string;
  level: number;
  xp: number;
  pointsNeeded: number;
  nextRank: string;
  streakDays: number;
}

interface GamificacaoViewProps {
  students: Student[];
  isLightTheme?: boolean;
}

export default function GamificacaoView({ students, isLightTheme = false }: GamificacaoViewProps) {
  // 1. Challenges State
  const [challenges, setChallenges] = useState<Challenge[]>(() => {
    const saved = localStorage.getItem("treinopro_challenges");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Error loading challenges", e);
      }
    }
    return [
      {
        id: "chal-1",
        title: "Guerreiro Consistente 🛡️",
        description: "Complete no mínimo 20 treinos na assessoria neste mês para ganhar o selo de Consistência.",
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
      },
      {
        id: "chal-3",
        title: "Foco Total Semanal 🔥",
        description: "Realize 5 check-ins fisiológicos seguidos no aplicativo de aluno.",
        badge: "SAÚDE DIÁRIA",
        targetCount: 5,
        xpReward: 300,
        category: "attendance",
        endDate: "24/07/2026"
      }
    ];
  });

  // 2. XP Multipliers State
  const [multipliers, setMultipliers] = useState<XpMultiplier[]>(() => {
    const saved = localStorage.getItem("treinopro_xp_multipliers");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Error loading multipliers", e);
      }
    }
    return [
      {
        id: "mult-1",
        workoutType: "Finais de Semana (Sáb/Dom)",
        multiplier: 1.5,
        isActive: true,
        notes: "Estimular treinos no sábado e domingo"
      },
      {
        id: "mult-2",
        workoutType: "Treinos de Membros Inferiores",
        multiplier: 2.0,
        isActive: true,
        notes: "Meta de grupo para focar em treinos de perna"
      },
      {
        id: "mult-3",
        workoutType: "Aeróbico / Cárdio Pós-Treino",
        multiplier: 1.2,
        isActive: false,
        notes: "Garantir o gasto calórico semanal"
      }
    ];
  });

  // 3. Student XP/Level mapping State
  const [gamificationData, setGamificationData] = useState<Record<string, StudentGamification>>(() => {
    const saved = localStorage.getItem("treinopro_students_gamification");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Error loading gamification data", e);
      }
    }
    
    // Seed initial values based on students
    const seeded: Record<string, StudentGamification> = {};
    students.forEach((s) => {
      // Create interesting distribution
      let level = 3;
      let xp = 1200;
      let streak = s.missedDays === 0 ? 8 : s.missedDays < 3 ? 4 : 0;
      
      if (s.email.includes("gustavo")) {
        level = 12;
        xp = 8450;
        streak = 18;
      } else if (s.name.includes("Patricia") || s.name.includes("Patrícia")) {
        level = 8;
        xp = 5200;
        streak = 12;
      } else if (s.name.includes("Lucas")) {
        level = 10;
        xp = 7100;
        streak = 15;
      } else if (s.name.includes("Sofia")) {
        level = 15;
        xp = 11450;
        streak = 24;
      }

      seeded[s.id] = {
        studentId: s.id,
        level,
        xp,
        pointsNeeded: level * 800 + 1000,
        nextRank: level >= 12 ? "Atleta Elite" : level >= 8 ? "Atleta Avançado" : "Atleta Praticante",
        streakDays: streak
      };
    });
    return seeded;
  });

  // Sync to localstorage
  useEffect(() => {
    localStorage.setItem("treinopro_challenges", JSON.stringify(challenges));
  }, [challenges]);

  useEffect(() => {
    localStorage.setItem("treinopro_xp_multipliers", JSON.stringify(multipliers));
  }, [multipliers]);

  useEffect(() => {
    localStorage.setItem("treinopro_students_gamification", JSON.stringify(gamificationData));
  }, [gamificationData]);

  // Modal States
  const [showCreateChallengeModal, setShowCreateChallengeModal] = useState(false);
  const [showRewardModal, setShowRewardModal] = useState<Student | null>(null);
  const [showXpAdjustModal, setShowXpAdjustModal] = useState<Student | null>(null);

  // Form States for New Challenge
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newBadge, setNewBadge] = useState("");
  const [newTarget, setNewTarget] = useState(15);
  const [newXp, setNewXp] = useState(500);
  const [newCategory, setNewCategory] = useState<"consistency" | "load" | "attendance" | "special">("consistency");
  const [newEndDate, setNewEndDate] = useState("");

  // Reward and XP Form States
  const [rewardSelection, setRewardSelection] = useState("shake");
  const [customRewardName, setCustomRewardName] = useState("");
  const [xpToAdjust, setXpToAdjust] = useState(250);
  const [isXpAdd, setIsXpAdd] = useState(true);

  // Search Filter
  const [rankingSearch, setRankingSearch] = useState("");

  // Handle Create Challenge
  const handleCreateChallenge = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newDescription) return;

    const newChal: Challenge = {
      id: `chal-${Date.now()}`,
      title: newTitle,
      description: newDescription,
      badge: newBadge.toUpperCase() || "GERAL",
      targetCount: Number(newTarget),
      xpReward: Number(newXp),
      category: newCategory,
      endDate: newEndDate || "Sem expiração"
    };

    setChallenges([...challenges, newChal]);
    setShowCreateChallengeModal(false);

    // Reset fields
    setNewTitle("");
    setNewDescription("");
    setNewBadge("");
    setNewTarget(15);
    setNewXp(500);
    setNewEndDate("");

    // Trigger general notification via a temporary toast/log or local state
    alert("Desafio Criado! Todos os alunos receberão o novo desafio em seus painéis de forma sincronizada.");
  };

  // Handle Delete Challenge
  const handleDeleteChallenge = (id: string) => {
    if (confirm("Tem certeza que deseja remover este desafio da assessoria?")) {
      setChallenges(challenges.filter(c => c.id !== id));
    }
  };

  // Toggle XP Multiplier status
  const handleToggleMultiplier = (id: string) => {
    setMultipliers(multipliers.map(m => m.id === id ? { ...m, isActive: !m.isActive } : m));
  };

  // Adjust Student XP manually
  const handleAdjustXp = (studentId: string) => {
    const current = gamificationData[studentId] || {
      studentId,
      level: 1,
      xp: 0,
      pointsNeeded: 1000,
      nextRank: "Atleta Iniciante",
      streakDays: 0
    };

    const adjustment = isXpAdd ? xpToAdjust : -xpToAdjust;
    let newXp = Math.max(0, current.xp + adjustment);
    
    // Simple level calculator: level starts at 1, every 1000 XP increases level
    let newLevel = Math.floor(newXp / 1000) + 1;
    if (newLevel < 1) newLevel = 1;

    setGamificationData(prev => ({
      ...prev,
      [studentId]: {
        ...current,
        xp: newXp,
        level: newLevel,
        pointsNeeded: newLevel * 1000,
        nextRank: newLevel >= 12 ? "Atleta Elite" : newLevel >= 8 ? "Atleta Avançado" : "Atleta Praticante"
      }
    }));

    // Raise custom event for Aluno view synchronisation
    window.dispatchEvent(new CustomEvent("treinopro_gamification_updated"));

    setShowXpAdjustModal(null);
    alert(`XP do aluno atualizado com sucesso! Novo saldo: ${newXp} XP.`);
  };

  // Grant Reward
  const handleGrantReward = (studentId: string, studentName: string) => {
    const rewardText = rewardSelection === "custom" 
      ? customRewardName 
      : rewardSelection === "shake" 
      ? "Coqueteleira Premium TreinoPro 🥤"
      : rewardSelection === "whey"
      ? "Dose de Whey Protein Concentrado 🍼"
      : rewardSelection === "discount"
      ? "Desconto de 10% na próxima mensalidade 💳"
      : "Acesso Liberado a Evento de Treino Especial 🏷️";

    if (!rewardText.trim()) return;

    // Simulate sending reward (store in notifications log or localized logs)
    const rewardLog = {
      id: `rew-${Date.now()}`,
      studentId,
      studentName,
      rewardText,
      grantedDate: new Date().toLocaleDateString("pt-BR")
    };

    const currentLogs = JSON.parse(localStorage.getItem("treinopro_granted_rewards") || "[]");
    localStorage.setItem("treinopro_granted_rewards", JSON.stringify([rewardLog, ...currentLogs]));

    // Notify student (simulated via local storage notifications for student app)
    const notificationKey = `notifications_${studentId}`;
    const studentNotifications = JSON.parse(localStorage.getItem(notificationKey) || "[]");
    const newNotif = {
      id: `notif-${Date.now()}`,
      title: "🎁 Parabéns! Você recebeu uma premiação!",
      message: `Seu coach concedeu uma recompensa real: ${rewardText}. Retire na recepção da assessoria.`,
      date: "Hoje",
      category: "conquistas"
    };
    localStorage.setItem(notificationKey, JSON.stringify([newNotif, ...studentNotifications]));

    window.dispatchEvent(new CustomEvent("treinopro_notifications_updated"));

    setShowRewardModal(null);
    setCustomRewardName("");
    alert(`Premiação "${rewardText}" concedida ao aluno ${studentName}! O aluno recebeu um alerta no celular.`);
  };

  // Computed ranking table of students
  const leaderboard = Object.values(gamificationData)
    .map((g: any) => {
      const student = students.find(s => s.id === g.studentId);
      return {
        ...g,
        name: student?.name || "Aluno Desconhecido",
        initials: student?.initials || "??",
        avatarColor: student?.avatarColor || "bg-gray-500",
        objective: student?.objective || "Geral",
        email: student?.email || ""
      };
    })
    // Filter by search query
    .filter(item => item.name.toLowerCase().includes(rankingSearch.toLowerCase()) || item.email.toLowerCase().includes(rankingSearch.toLowerCase()))
    .sort((a, b) => b.xp - a.xp);

  return (
    <div className="space-y-6">
      
      {/* HEADER SECTION */}
      <div className={`border rounded-2xl p-5 shadow-lg relative overflow-hidden transition-all ${
        isLightTheme 
          ? "bg-gradient-to-r from-purple-50 via-slate-50 to-purple-100/50 border-purple-200/60" 
          : "bg-gradient-to-r from-purple-900/10 via-[#1b1c1e] to-[#121315] border-purple-500/20"
      }`}>
        <div className="absolute right-0 top-0 w-36 h-36 bg-purple-500/5 rounded-full filter blur-3xl"></div>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative z-10">
          <div>
            <div className={`flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider ${
              isLightTheme ? "text-purple-600" : "text-purple-400"
            }`}>
              <Sparkles className={`w-4 h-4 animate-pulse ${isLightTheme ? "text-purple-600" : "text-purple-400"}`} />
              Gamificação e Engajamento de Alunos
            </div>
            <h1 className={`text-2xl font-black tracking-tight mt-1 ${
              isLightTheme ? "text-slate-900" : "text-white"
            }`}>
              Arena TreinoPro 🔥
            </h1>
            <p className={`text-xs mt-1.5 leading-relaxed max-w-2xl ${
              isLightTheme ? "text-slate-600" : "text-gray-400"
            }`}>
              Crie desafios, controle os multiplicadores de experiência (XP) da assessoria e motive seus alunos com premiações reais através do leaderboard de consistência.
            </p>
          </div>
          <button 
            onClick={() => setShowCreateChallengeModal(true)}
            className="px-4 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-mono font-bold text-xs rounded-xl flex items-center gap-2 cursor-pointer shadow-[0_4px_15px_rgba(147,51,234,0.3)] transition-all shrink-0"
          >
            <Plus className="w-4 h-4" />
            Criar Desafio Mensal
          </button>
        </div>

        {/* SUMMARY BENTO GRID STATS */}
        <div className={`grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6 pt-5 border-t font-mono ${
          isLightTheme ? "border-slate-200" : "border-[#3a494b]/10"
        }`}>
          <div className={`p-3.5 rounded-xl border space-y-1 ${
            isLightTheme ? "bg-white border-slate-200" : "bg-[#121315]/80 border-[#3a494b]/15"
          }`}>
            <span className={`text-[9px] uppercase font-bold ${
              isLightTheme ? "text-slate-400" : "text-gray-500"
            }`}>Alunos no Ranking</span>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-purple-500" />
              <span className={`text-lg font-extrabold leading-none ${
                isLightTheme ? "text-slate-900" : "text-white"
              }`}>{students.length}</span>
            </div>
          </div>
          <div className={`p-3.5 rounded-xl border space-y-1 ${
            isLightTheme ? "bg-white border-slate-200" : "bg-[#121315]/80 border-[#3a494b]/15"
          }`}>
            <span className={`text-[9px] uppercase font-bold ${
              isLightTheme ? "text-slate-400" : "text-gray-500"
            }`}>Desafios Ativos</span>
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-yellow-500" />
              <span className={`text-lg font-extrabold leading-none ${
                isLightTheme ? "text-slate-900" : "text-white"
              }`}>{challenges.length}</span>
            </div>
          </div>
          <div className={`p-3.5 rounded-xl border space-y-1 ${
            isLightTheme ? "bg-white border-slate-200" : "bg-[#121315]/80 border-[#3a494b]/15"
          }`}>
            <span className={`text-[9px] uppercase font-bold ${
              isLightTheme ? "text-slate-400" : "text-gray-500"
            }`}>Média de Frequência</span>
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-orange-500 animate-pulse" />
              <span className={`text-lg font-extrabold leading-none ${
                isLightTheme ? "text-slate-900" : "text-white"
              }`}>94.5%</span>
            </div>
          </div>
          <div className={`p-3.5 rounded-xl border space-y-1 ${
            isLightTheme ? "bg-white border-slate-200" : "bg-[#121315]/80 border-[#3a494b]/15"
          }`}>
            <span className={`text-[9px] uppercase font-bold ${
              isLightTheme ? "text-slate-400" : "text-gray-500"
            }`}>Multiplicador Atual</span>
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-cyan-500" />
              <span className={`text-lg font-extrabold leading-none ${
                isLightTheme ? "text-slate-900" : "text-white"
              }`}>2.0x Máx</span>
            </div>
          </div>
        </div>
      </div>

      {/* THREE LAYOUT COLUMNS GRID */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* SECTION 1 & 2: LEFT COLUMN (CHALLENGES & MULTIPLIERS) */}
        <div className="xl:col-span-2 space-y-6">
          
          {/* CHALLENGES CONTAINER */}
          <div className={`border rounded-2xl p-5 space-y-4 transition-all ${
            isLightTheme ? "bg-white border-slate-200" : "bg-[#151618] border-[#3a494b]/15"
          }`}>
            <div className={`flex justify-between items-center border-b pb-3 ${
              isLightTheme ? "border-slate-100" : "border-[#3a494b]/10"
            }`}>
              <h3 className={`text-sm font-extrabold font-mono flex items-center gap-2 uppercase tracking-wider ${
                isLightTheme ? "text-slate-800" : "text-white"
              }`}>
                <Trophy className="w-4.5 h-4.5 text-yellow-500" />
                Desafios Sazonais e Atividades
              </h3>
              <span className={`text-[9px] font-mono font-bold px-2.5 py-1 rounded-full border uppercase ${
                isLightTheme 
                  ? "bg-purple-50 text-purple-600 border-purple-200/50" 
                  : "bg-purple-500/10 text-purple-400 border-purple-500/20"
              }`}>
                {challenges.length} Disponíveis
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {challenges.map((chal) => (
                <div 
                  key={chal.id}
                  className={`p-4 rounded-xl flex flex-col justify-between space-y-3 transition-all group relative overflow-hidden border ${
                    isLightTheme 
                      ? "bg-slate-50/60 border-slate-200/80 hover:border-purple-300" 
                      : "bg-[#121315]/80 border-[#3a494b]/15 hover:border-purple-500/30"
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex justify-between items-start">
                      <span className={`px-2 py-0.5 rounded text-[8px] font-mono font-bold uppercase border ${
                        isLightTheme 
                          ? "bg-purple-50 text-purple-600 border-purple-200/50" 
                          : "bg-purple-950/40 text-purple-400 border-purple-500/30"
                      }`}>
                        {chal.badge}
                      </span>
                      <button 
                        onClick={() => handleDeleteChallenge(chal.id)}
                        className={`p-1 rounded-lg cursor-pointer transition-colors ${
                          isLightTheme ? "text-slate-400 hover:text-rose-500 hover:bg-rose-50" : "text-gray-500 hover:text-rose-400 hover:bg-rose-500/10"
                        }`}
                        title="Deletar Desafio"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div>
                      <h4 className={`font-extrabold text-xs tracking-tight ${
                        isLightTheme ? "text-slate-900" : "text-white"
                      }`}>{chal.title}</h4>
                      <p className={`text-[10px] mt-1.5 leading-relaxed font-sans ${
                        isLightTheme ? "text-slate-600" : "text-gray-400"
                      }`}>{chal.description}</p>
                    </div>
                  </div>

                  <div className={`pt-3 border-t flex justify-between items-center text-[10px] font-mono ${
                    isLightTheme ? "border-slate-100" : "border-[#3a494b]/10"
                  }`}>
                    <div className="space-y-0.5">
                      <p className={isLightTheme ? "text-slate-400" : "text-gray-500"}>Recompensa</p>
                      <p className={`font-extrabold ${isLightTheme ? "text-cyan-600" : "text-[#00f2ff]"}`}>+{chal.xpReward} XP</p>
                    </div>
                    <div className="text-right space-y-0.5">
                      <p className={isLightTheme ? "text-slate-400" : "text-gray-500"}>Expira em</p>
                      <p className={`font-bold ${isLightTheme ? "text-slate-700" : "text-white"}`}>{chal.endDate}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* XP MULTIPLIERS ENGINE */}
          <div className={`border rounded-2xl p-5 space-y-4 transition-all ${
            isLightTheme ? "bg-white border-slate-200" : "bg-[#151618] border-[#3a494b]/15"
          }`}>
            <div className={`border-b pb-3 ${
              isLightTheme ? "border-slate-100" : "border-[#3a494b]/10"
            }`}>
              <h3 className={`text-sm font-extrabold font-mono flex items-center gap-2 uppercase tracking-wider ${
                isLightTheme ? "text-slate-800" : "text-white"
              }`}>
                <Zap className="w-4.5 h-4.5 text-cyan-500 animate-pulse" />
                Regras e Multiplicadores de XP
              </h3>
              <p className={`text-[10px] mt-1 font-mono ${isLightTheme ? "text-slate-500" : "text-gray-500"}`}>Defina incentivos para os alunos cumprirem dias específicos de treino.</p>
            </div>

            <div className="space-y-3 font-mono text-xs">
              {multipliers.map((mult) => (
                <div 
                  key={mult.id}
                  className={`p-4 rounded-xl border flex flex-col sm:flex-row justify-between sm:items-center gap-3 transition-all ${
                    mult.isActive 
                      ? isLightTheme
                        ? "bg-cyan-50/40 border-cyan-200 shadow-sm"
                        : "bg-[#121315]/80 border-cyan-500/20 shadow-[0_0_10px_rgba(6,182,212,0.05)]" 
                      : isLightTheme
                      ? "bg-slate-50/40 border-slate-100 opacity-75"
                      : "bg-[#121315]/35 border-[#3a494b]/10 opacity-70"
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${
                        mult.isActive 
                          ? isLightTheme 
                            ? "bg-cyan-500 shadow-[0_0_6px_rgba(6,182,212,0.5)]" 
                            : "bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.8)]" 
                          : "bg-gray-400"
                      }`}></span>
                      <h4 className={`font-extrabold text-xs ${isLightTheme ? "text-slate-900" : "text-white"}`}>{mult.workoutType}</h4>
                    </div>
                    <p className={`text-[10px] leading-snug ${isLightTheme ? "text-slate-500" : "text-gray-500"}`}>{mult.notes}</p>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                    <div className={`px-3 py-1.5 rounded-lg border text-center ${
                      isLightTheme ? "bg-slate-50 border-slate-200" : "bg-[#1b1c1e] border-[#3a494b]/30"
                    }`}>
                      <span className={`text-[8px] block uppercase font-bold ${isLightTheme ? "text-slate-400" : "text-gray-500"}`}>Fator</span>
                      <span className="text-cyan-500 font-black text-xs">{mult.multiplier.toFixed(1)}x XP</span>
                    </div>

                    <button
                      onClick={() => handleToggleMultiplier(mult.id)}
                      className={`px-3 py-2 rounded-lg font-bold text-[9px] uppercase cursor-pointer transition-all ${
                        mult.isActive 
                          ? isLightTheme
                            ? "bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200"
                            : "bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20" 
                          : isLightTheme
                          ? "bg-cyan-50 hover:bg-cyan-100 text-cyan-600 border border-cyan-200"
                          : "bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/20"
                      }`}
                    >
                      {mult.isActive ? "Desativar" : "Ativar"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* SECTION 3: RIGHT COLUMN (GLOBAL LEADERBOARD / STUDENTS) */}
        <div className={`border rounded-2xl p-5 flex flex-col h-full space-y-4 transition-all ${
          isLightTheme ? "bg-white border-slate-200" : "bg-[#151618] border-[#3a494b]/15"
        }`}>
          <div className={`border-b pb-3 ${
            isLightTheme ? "border-slate-100" : "border-[#3a494b]/10"
          }`}>
            <h3 className={`text-sm font-extrabold font-mono flex items-center gap-2 uppercase tracking-wider ${
              isLightTheme ? "text-slate-800" : "text-white"
            }`}>
              <Award className="w-4.5 h-4.5 text-orange-500" />
              Ranking de Consistência Global
            </h3>
            <p className={`text-[10px] mt-1 font-mono ${isLightTheme ? "text-slate-500" : "text-gray-500"}`}>Leaderboard de XP integrado dos alunos ativos.</p>
          </div>

          {/* Search bar */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-2.5" />
            <input 
              type="text"
              value={rankingSearch}
              onChange={(e) => setRankingSearch(e.target.value)}
              placeholder="Buscar aluno por nome..."
              className={`w-full outline-none rounded-xl pl-9 pr-4 py-2 text-xs font-mono transition-all ${
                isLightTheme
                  ? "bg-slate-50 border border-slate-200 text-slate-900 focus:border-purple-500 placeholder-slate-400"
                  : "bg-[#121315] border border-[#3a494b]/30 text-white focus:border-purple-500 placeholder-gray-500"
              }`}
            />
          </div>

          {/* Leaderboard Table list */}
          <div className="flex-1 overflow-y-auto space-y-2.5 max-h-[500px] pr-1 scrollbar-none">
            {leaderboard.map((item, index) => {
              const position = index + 1;
              return (
                <div 
                  key={item.studentId}
                  className={`p-3 rounded-xl border flex justify-between items-center gap-3 transition-all ${
                    position === 1 
                      ? isLightTheme
                        ? "bg-gradient-to-r from-amber-50 to-amber-100/30 border-amber-200/60 shadow-sm"
                        : "bg-gradient-to-r from-yellow-500/10 to-[#121315] border-yellow-500/20" 
                      : position === 2
                      ? isLightTheme
                        ? "bg-gradient-to-r from-slate-100 to-slate-50/50 border-slate-200/60 shadow-sm"
                        : "bg-gradient-to-r from-gray-300/5 to-[#121315] border-gray-400/10"
                      : isLightTheme
                      ? "bg-slate-50/60 border-slate-200/50"
                      : "bg-[#121315]/40 border-[#3a494b]/10"
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center font-mono font-bold text-[9px] uppercase shrink-0 ${
                      position === 1 
                        ? isLightTheme
                          ? "bg-amber-100 text-amber-700 border border-amber-200"
                          : "bg-yellow-500/20 text-yellow-500 border border-yellow-500/30" 
                        : position === 2 
                        ? isLightTheme
                          ? "bg-slate-100 text-slate-700 border border-slate-200"
                          : "bg-gray-400/20 text-gray-300 border border-gray-400/30"
                        : position === 3
                        ? isLightTheme
                          ? "bg-amber-100/50 text-amber-850 border border-amber-200"
                          : "bg-amber-600/20 text-amber-500 border border-amber-600/30"
                        : isLightTheme
                        ? "bg-slate-100 text-slate-500 border border-slate-200/50"
                        : "bg-gray-800 text-gray-400 text-[8px]"
                    }`}>
                      {position}
                    </span>

                    <div className="min-w-0">
                      <p className={`font-extrabold text-xs truncate leading-none flex items-center gap-1 ${
                        isLightTheme ? "text-slate-800" : "text-white"
                      }`}>
                        {item.name.split(" ")[0]} 
                        {position === 1 && "🥇"}
                        {position === 2 && "🥈"}
                        {position === 3 && "🥉"}
                      </p>
                      <div className="flex items-center gap-1.5 font-mono text-[8px] text-gray-500 mt-1 leading-none">
                        <span>Nível {item.level}</span>
                        <span>•</span>
                        <span className={isLightTheme ? "text-purple-600 font-medium" : "text-[#ebb2ff]"}>{item.streakDays} dias de streak 🔥</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0 flex flex-col items-end gap-1.5 font-mono">
                    <div>
                      <p className={`font-black text-xs leading-none ${isLightTheme ? "text-purple-600" : "text-purple-400"}`}>{item.xp.toLocaleString("pt-BR")} XP</p>
                      <p className={`text-[8px] mt-0.5 leading-none ${isLightTheme ? "text-slate-500" : "text-gray-500"}`}>{item.nextRank}</p>
                    </div>

                    <div className="flex gap-1">
                      <button 
                        onClick={() => {
                          const student = students.find(s => s.id === item.studentId);
                          if(student) setShowRewardModal(student);
                        }}
                        className={`p-1.5 rounded-lg cursor-pointer transition-colors border ${
                          isLightTheme 
                            ? "bg-white hover:bg-purple-50 border-slate-200 text-purple-600 hover:text-purple-700" 
                            : "bg-[#1b1c1e] hover:bg-purple-600/20 border-[#3a494b]/30 hover:border-purple-500/40 text-purple-400 hover:text-purple-300"
                        }`}
                        title="Distribuir Premiação Real"
                      >
                        <Gift className="w-3.5 h-3.5" />
                      </button>
                      <button 
                        onClick={() => {
                          const student = students.find(s => s.id === item.studentId);
                          if(student) {
                            setXpToAdjust(250);
                            setIsXpAdd(true);
                            setShowXpAdjustModal(student);
                          }
                        }}
                        className={`p-1.5 rounded-lg cursor-pointer transition-colors border ${
                          isLightTheme 
                            ? "bg-white hover:bg-cyan-50 border-slate-200 text-cyan-600 hover:text-cyan-700" 
                            : "bg-[#1b1c1e] hover:bg-cyan-600/20 border-[#3a494b]/30 hover:border-cyan-500/40 text-cyan-400 hover:text-cyan-300"
                        }`}
                        title="Ajustar XP"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* CREATE CHALLENGE MODAL */}
      {showCreateChallengeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowCreateChallengeModal(false)}></div>
          <div className="bg-[#121315] border border-[#3a494b]/30 w-full max-w-md rounded-2xl p-5 shadow-2xl relative z-10 font-mono text-xs text-white">
            <div className="flex justify-between items-center border-b border-[#3a494b]/20 pb-3 mb-4">
              <h3 className="font-extrabold text-sm text-purple-400 flex items-center gap-1.5">
                <Trophy className="w-5 h-5" />
                Criar Desafio da Assessoria
              </h3>
              <button onClick={() => setShowCreateChallengeModal(false)} className="p-1 text-gray-500 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateChallenge} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-gray-400 font-bold uppercase text-[9px]">Título do Desafio</label>
                <input 
                  type="text"
                  required
                  placeholder="Ex: Guerreiro de Ferro"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-[#1b1c1e] border border-[#3a494b]/30 focus:border-purple-500 outline-none rounded-xl px-3 py-2.5 text-white"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-gray-400 font-bold uppercase text-[9px]">Selo / Badge de Identificação</label>
                <input 
                  type="text"
                  placeholder="Ex: AGOSTO SAZONAL"
                  value={newBadge}
                  onChange={(e) => setNewBadge(e.target.value)}
                  className="w-full bg-[#1b1c1e] border border-[#3a494b]/30 focus:border-purple-500 outline-none rounded-xl px-3 py-2.5 text-white"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-gray-400 font-bold uppercase text-[9px]">Descrição Completa (Regras)</label>
                <textarea 
                  required
                  placeholder="Explique detalhadamente como o aluno cumpre o desafio e qual a meta..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  rows={3}
                  className="w-full bg-[#1b1c1e] border border-[#3a494b]/30 focus:border-purple-500 outline-none rounded-xl px-3 py-2.5 text-white resize-none font-sans"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-gray-400 font-bold uppercase text-[9px]">XP de Recompensa</label>
                  <input 
                    type="number"
                    min="100"
                    max="5000"
                    value={newXp}
                    onChange={(e) => setNewXp(Number(e.target.value))}
                    className="w-full bg-[#1b1c1e] border border-[#3a494b]/30 focus:border-purple-500 outline-none rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-gray-400 font-bold uppercase text-[9px]">Meta (Vezes/Treinos)</label>
                  <input 
                    type="number"
                    min="1"
                    max="100"
                    value={newTarget}
                    onChange={(e) => setNewTarget(Number(e.target.value))}
                    className="w-full bg-[#1b1c1e] border border-[#3a494b]/30 focus:border-purple-500 outline-none rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-gray-400 font-bold uppercase text-[9px]">Categoria</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full bg-[#1b1c1e] border border-[#3a494b]/30 focus:border-purple-500 outline-none rounded-xl px-3 py-2 text-white"
                  >
                    <option value="consistency">Consistência (Treino)</option>
                    <option value="load">Aumento de Carga</option>
                    <option value="attendance">Frequência/Check-in</option>
                    <option value="special">Especial (Trimestral)</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-gray-400 font-bold uppercase text-[9px]">Data de Vencimento</label>
                  <input 
                    type="text"
                    placeholder="Ex: 31/08/2026"
                    value={newEndDate}
                    onChange={(e) => setNewEndDate(e.target.value)}
                    className="w-full bg-[#1b1c1e] border border-[#3a494b]/30 focus:border-purple-500 outline-none rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              <button 
                type="submit"
                className="w-full py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl shadow-lg transition-all cursor-pointer mt-2"
              >
                Publicar Desafio para Alunos 🚀
              </button>
            </form>
          </div>
        </div>
      )}

      {/* REWARD STUDENT MODAL */}
      {showRewardModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowRewardModal(null)}></div>
          <div className="bg-[#121315] border border-[#3a494b]/30 w-full max-w-sm rounded-2xl p-5 shadow-2xl relative z-10 font-mono text-xs text-white">
            <div className="flex justify-between items-center border-b border-[#3a494b]/20 pb-3 mb-4">
              <h3 className="font-extrabold text-sm text-yellow-500 flex items-center gap-1.5">
                <Gift className="w-5 h-5" />
                Premiar Aluno Realmente
              </h3>
              <button onClick={() => setShowRewardModal(null)} className="p-1 text-gray-500 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-[#1b1c1e] p-3 rounded-xl border border-[#3a494b]/15 text-center">
                <p className="text-gray-500 text-[10px]">Beneficiário:</p>
                <p className="font-black text-white text-sm mt-0.5">{showRewardModal.name}</p>
                <p className="text-[9px] text-[#ebb2ff] mt-1">Engajamento exemplar na assessoria</p>
              </div>

              <div className="space-y-1.5">
                <label className="text-gray-400 font-bold uppercase text-[9px]">Escolha a Premiação Física/Real</label>
                <select
                  value={rewardSelection}
                  onChange={(e) => setRewardSelection(e.target.value)}
                  className="w-full bg-[#1b1c1e] border border-[#3a494b]/30 focus:border-yellow-500 outline-none rounded-xl px-3 py-2.5 text-white"
                >
                  <option value="shake">🥤 Coqueteleira Premium TreinoPro</option>
                  <option value="whey">🍼 Dose de Whey Concentrado na recepção</option>
                  <option value="discount">💳 Desconto de 10% na próxima mensalidade</option>
                  <option value="event">🏷️ Ingresso de Treino Coletivo Especial</option>
                  <option value="custom">✍️ Premiação Customizada (Digitar abaixo)</option>
                </select>
              </div>

              {rewardSelection === "custom" && (
                <div className="space-y-1.5">
                  <label className="text-gray-400 font-bold uppercase text-[9px]">Nome do Prêmio Customizado</label>
                  <input 
                    type="text"
                    required
                    placeholder="Ex: Camiseta Exclusiva Dry-Fit TreinoPro"
                    value={customRewardName}
                    onChange={(e) => setCustomRewardName(e.target.value)}
                    className="w-full bg-[#1b1c1e] border border-[#3a494b]/30 focus:border-yellow-500 outline-none rounded-xl px-3 py-2.5 text-white"
                  />
                </div>
              )}

              <button 
                onClick={() => handleGrantReward(showRewardModal.id, showRewardModal.name)}
                className="w-full py-3 bg-yellow-500 hover:bg-yellow-400 text-[#002022] font-extrabold rounded-xl shadow-lg transition-all cursor-pointer"
              >
                Conceder Premiação! 🎁
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADJUST XP MODAL */}
      {showXpAdjustModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowXpAdjustModal(null)}></div>
          <div className="bg-[#121315] border border-[#3a494b]/30 w-full max-w-sm rounded-2xl p-5 shadow-2xl relative z-10 font-mono text-xs text-white">
            <div className="flex justify-between items-center border-b border-[#3a494b]/20 pb-3 mb-4">
              <h3 className="font-extrabold text-sm text-cyan-400 flex items-center gap-1.5">
                <Zap className="w-5 h-5 animate-pulse" />
                Ajustar Pontuação de XP
              </h3>
              <button onClick={() => setShowXpAdjustModal(null)} className="p-1 text-gray-500 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-[#1b1c1e] p-3 rounded-xl border border-[#3a494b]/15 text-center">
                <p className="text-gray-500 text-[10px]">Aluno:</p>
                <p className="font-black text-white text-sm mt-0.5">{showXpAdjustModal.name}</p>
                <p className="text-[9px] text-[#00f2ff] mt-1">
                  XP Atual: {gamificationData[showXpAdjustModal.id]?.xp || 0} XP
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-gray-400 font-bold uppercase text-[9px]">Operação</label>
                <div className="grid grid-cols-2 gap-2">
                  <button 
                    onClick={() => setIsXpAdd(true)}
                    className={`py-2 rounded-xl font-bold border transition-all cursor-pointer text-center ${
                      isXpAdd 
                        ? "bg-cyan-500/10 border-cyan-400 text-cyan-400" 
                        : "bg-[#1b1c1e] border-[#3a494b]/20 text-gray-400 hover:text-white"
                    }`}
                  >
                    Adicionar (+)
                  </button>
                  <button 
                    onClick={() => setIsXpAdd(false)}
                    className={`py-2 rounded-xl font-bold border transition-all cursor-pointer text-center ${
                      !isXpAdd 
                        ? "bg-rose-500/10 border-rose-400 text-rose-400" 
                        : "bg-[#1b1c1e] border-[#3a494b]/20 text-gray-400 hover:text-white"
                    }`}
                  >
                    Deduzir (-)
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-gray-400 font-bold uppercase text-[9px]">Quantidade de XP</label>
                <select
                  value={xpToAdjust}
                  onChange={(e) => setXpToAdjust(Number(e.target.value))}
                  className="w-full bg-[#1b1c1e] border border-[#3a494b]/30 focus:border-cyan-500 outline-none rounded-xl px-3 py-2.5 text-white"
                >
                  <option value="100">100 XP (Ação simples)</option>
                  <option value="250">250 XP (Conclusão de Treino)</option>
                  <option value="500">500 XP (Destaque da semana)</option>
                  <option value="1000">1000 XP (Desafio Mensal)</option>
                  <option value="2500">2500 XP (Super Conquista)</option>
                </select>
              </div>

              <button 
                onClick={() => handleAdjustXp(showXpAdjustModal.id)}
                className={`w-full py-3 font-extrabold rounded-xl shadow-lg transition-all cursor-pointer ${
                  isXpAdd 
                    ? "bg-cyan-400 hover:bg-cyan-300 text-[#002022]" 
                    : "bg-rose-500 hover:bg-rose-400 text-white"
                }`}
              >
                Confirmar Ajuste de XP ⚡
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
