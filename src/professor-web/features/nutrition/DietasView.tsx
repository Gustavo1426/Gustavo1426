import React, { useState, useMemo } from "react";
import { 
  Utensils, 
  ClipboardList, 
  Apple, 
  Users, 
  TrendingUp, 
  Calendar, 
  MessageSquare,
  Activity,
  Check,
  ChevronRight,
  Plus
} from "lucide-react";
import { Student, Diet, Meal } from "../../../types";

// Import modular sub-components
import DietaFlexibilidade from "./diet-evolution/DietaFlexibilidade";
import AvaliacaoCorporal from "./diet-evolution/AvaliacaoCorporal";
import HistoricoEvolucao from "./diet-evolution/HistoricoEvolucao";
import AnamneseClinica from "./diet-evolution/AnamneseClinica";
import ConsultasLembretes from "./diet-evolution/ConsultasLembretes";
import EnviarLaudo from "./diet-evolution/EnviarLaudo";
import AnalisePosturalView from "../postural/AnalisePosturalView";

interface DietasViewProps {
  students: Student[];
  diets: Diet[];
  selectedStudentId: string | null;
  onSaveDiet: (studentId: string, calorieTarget: number, proteinTarget: number, carbsTarget: number, fatTarget: number, meals: Meal[]) => void;
  onSelectStudent: (studentId: string) => void;
  onUpdateStudent?: (student: Student) => void;
}

// 🆕 Stepper definition matching the refactored wizard design
const WIZARD_STEPS = [
  { id: "avaliacao", label: "1. Avaliação Física", icon: Users, color: "text-cyan-400" },
  { id: "analise-postural", label: "2. Análise Postural", icon: Activity, color: "text-[#00f2ff]" },
  { id: "dieta-flex", label: "3. Dieta & Flexibilidade", icon: Apple, color: "text-green-400" },
  { id: "historico", label: "4. Histórico & Evolução", icon: TrendingUp, color: "text-amber-400" },
  { id: "laudo", label: "5. Laudo", icon: MessageSquare, color: "text-emerald-400" }
];

export default function DietasView({
  students,
  diets,
  selectedStudentId,
  onSaveDiet,
  onSelectStudent,
  onUpdateStudent
}: DietasViewProps) {
  
  // Local state for selected student id
  const activeStudentId = selectedStudentId || (students[0]?.id ?? "");

  // 🆕 Refactored Wizard flow: starts at Avaliação Física
  const [activeSubTab, setActiveSubTab] = useState<string>("avaliacao");

  const [isFormMode, setIsFormMode] = useState(false);
  const [triggerResetCount, setTriggerResetCount] = useState(0);

  // Find active student object
  const currentStudent = useMemo(() => {
    return students.find(s => s.id === activeStudentId) || students[0] || null;
  }, [students, activeStudentId]);

  // Find active diet for student
  const activeDiet = useMemo(() => {
    return diets.find(d => d.studentId === activeStudentId) || null;
  }, [diets, activeStudentId]);

  // Helper to get active step index
  const activeStepIndex = useMemo(() => {
    return WIZARD_STEPS.findIndex(step => step.id === activeSubTab);
  }, [activeSubTab]);

  // Advance callback to go to next step
  const handleAdvanceStep = (currentTabId: string) => {
    const currentIndex = WIZARD_STEPS.findIndex(s => s.id === currentTabId);
    if (currentIndex !== -1 && currentIndex < WIZARD_STEPS.length - 1) {
      setActiveSubTab(WIZARD_STEPS[currentIndex + 1].id);
      setIsFormMode(false);
    }
  };

  // Propagation for BF, weight, height and date update
  const handleUpdateStudentBF = (studentId: string, bf: number, weight?: number, height?: number, date?: string) => {
    if (currentStudent && onUpdateStudent) {
      onUpdateStudent({
        ...currentStudent,
        weight: weight !== undefined ? weight : currentStudent.weight,
        height: height !== undefined ? (height > 3 ? height / 100 : height) : currentStudent.height,
        hasPhysicalEvaluation: true,
        physicalEvaluationDate: date || new Date().toLocaleDateString("pt-BR", { month: "2-digit", year: "numeric" })
      });
    }
  };

  return (
    <div id="dietas-view" className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-[#e3e2e4] tracking-tight">Dieta/Evolução</h2>
          <p className="text-[#b9cacb] text-sm font-mono">Ficha clínica completa, composição de dobras e laudo postural inteligente.</p>
        </div>
      </div>

      {/* Card Padrão Unificado de Informações do Aluno */}
      <div className="glass-panel p-6 rounded-2xl bg-[#1b1c1e]/45 border border-gray-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-xl">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-cyan-500/10 rounded-2xl border border-cyan-500/15 mt-1 shrink-0">
            <Activity className="w-6 h-6 text-cyan-400" />
          </div>
          <div className="flex-1">
            <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase tracking-wider block">
              Mapeamento & Prontuário Médico
            </span>
            <div className="flex flex-wrap items-center gap-2 mt-1">
              <h3 className="text-xl font-bold text-white tracking-tight">
                {currentStudent ? currentStudent.name : "Nenhum Aluno Selecionado"}
              </h3>
              {currentStudent && (
                <>
                  <span className="text-xs text-gray-400 font-mono">
                    ({currentStudent.gender === "masculino" ? "M" : "F"}, {currentStudent.age} anos)
                  </span>
                  <div className="flex flex-wrap items-center gap-1.5 ml-1">
                    <span className="bg-[#ccff00]/10 text-[#ccff00] text-[10px] font-mono px-2 py-0.5 rounded border border-[#ccff00]/20 font-bold uppercase">
                      {currentStudent.plan}
                    </span>
                    <span className="bg-[#121315] text-[#b9cacb] text-[10px] font-mono px-2 py-0.5 rounded border border-gray-800 font-medium">
                      Objetivo: {currentStudent.currentPhase}
                    </span>
                  </div>
                </>
              )}
            </div>
            <p className="text-xs text-gray-400 font-sans mt-1.5 max-w-2xl">
              Ficha clínica, antropometria, predição de risco cardiovascular e evolução postural com inteligência artificial.
            </p>
          </div>
        </div>

        {/* Controles Unificados de Seleção e Ações Rápidas */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto md:self-center">
          <div className="flex flex-col w-full sm:w-auto">
            <label className="text-[10px] font-mono text-gray-500 uppercase font-bold mb-1">Selecionar Aluno</label>
            <select
              value={activeStudentId}
              onChange={(e) => {
                onSelectStudent(e.target.value);
                setIsFormMode(false);
              }}
              className="bg-gray-900 border border-gray-800 text-white rounded-xl text-xs px-4 py-2 focus:outline-none focus:border-[#ccff00]/40 cursor-pointer font-mono h-9"
            >
              {students.length === 0 ? (
                <option value="">Nenhum aluno cadastrado</option>
              ) : (
                students.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))
              )}
            </select>
          </div>

          {/* Botões contextuais baseados no sub-tab ativo */}
          {activeSubTab === "avaliacao" && !isFormMode && (
            <div className="flex items-center gap-2 w-full sm:w-auto mt-4 sm:mt-0">
              <button
                type="button"
                onClick={() => {
                  setTriggerResetCount(prev => prev + 1);
                  setIsFormMode(true);
                }}
                className="px-4 py-2 bg-[#ccff00] hover:bg-[#b8e600] text-black font-mono text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 h-9 shrink-0 shadow-lg shadow-[#ccff00]/10"
              >
                <Plus className="w-4 h-4 stroke-[3]" /> Nova Avaliação
              </button>
              <button
                type="button"
                onClick={() => handleAdvanceStep("avaliacao")}
                className="px-4 py-2 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 font-mono text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 h-9 shrink-0"
              >
                Laudo Postural <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {currentStudent ? (
        <div className="space-y-6 max-w-[1176.23px] w-full mx-auto">
          
          {/* 🆕 STATE-OF-THE-ART INTERACTIVE BENTO STEPPERS & UTILITIES */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
              {WIZARD_STEPS.map((step, idx) => {
                const isCompleted = idx < activeStepIndex;
                const isActive = idx === activeStepIndex;
                const Icon = step.icon;

                let statusText = "Aguardando";
                let statusColor = "text-gray-500 bg-gray-500/5 border-gray-500/10";
                if (isActive) {
                  statusText = "Ativo";
                  statusColor = "text-[#ccff00] bg-[#ccff00]/10 border-[#ccff00]/30 animate-pulse";
                } else if (isCompleted) {
                  statusText = "Pronto";
                  statusColor = "text-emerald-500 bg-emerald-500/10 border-emerald-500/20";
                }

                return (
                  <button
                    key={step.id}
                    type="button"
                    onClick={() => {
                      setActiveSubTab(step.id);
                      setIsFormMode(false);
                    }}
                    className={`flex flex-col justify-between items-start p-4 rounded-xl border transition-all text-left cursor-pointer hover:scale-[1.02] group relative overflow-hidden ${
                      isActive 
                        ? "bg-[#1b1c1e] text-white border-[#ccff00] shadow-[0_0_15px_rgba(204,255,0,0.15)]" 
                        : isCompleted
                          ? "bg-[#ccff00]/5 text-[#ccff00] border-[#ccff00]/20 hover:border-[#ccff00]/40"
                          : "bg-[#121315]/40 text-gray-400 border-[#3a494b]/20 hover:border-gray-500/30"
                    }`}
                  >
                    {isActive && (
                      <div className="absolute -right-6 -top-6 w-16 h-16 bg-[#ccff00]/10 rounded-full blur-xl pointer-events-none"></div>
                    )}

                    <div className="flex items-center justify-between w-full mb-3">
                      <div className={`p-2 rounded-lg ${
                        isActive 
                          ? "bg-[#ccff00] text-black" 
                          : isCompleted
                            ? "bg-[#ccff00]/10 text-[#00bc7d]"
                            : "bg-[#121315] text-gray-500 group-hover:text-gray-300"
                      } transition-colors`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className={`text-[9px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${statusColor}`}>
                        {statusText}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] font-mono text-[#b9cacb] opacity-60 block mb-0.5 uppercase">
                        Etapa 0{idx + 1}
                      </span>
                      <h3 className={`text-xs font-bold tracking-tight transition-colors ${
                        isActive ? "text-white" : "text-[#e3e2e4] group-hover:text-white"
                      }`}>
                        {step.label.split(". ")[1]}
                      </h3>
                    </div>

                    {/* Progress tracking line in card footer */}
                    <div className="w-full h-1 bg-black/20 rounded-full mt-3.5 overflow-hidden">
                      <div className={`h-full transition-all duration-500 ${
                        isActive 
                          ? "w-1/2 bg-[#ccff00]" 
                          : isCompleted
                            ? "w-full bg-emerald-500"
                            : "w-0 bg-transparent"
                      }`} />
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Sub-bar for Appointments & quick indicators */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 bg-[#121315]/30 border border-[#3a494b]/10 rounded-xl">
              <div className="flex items-center gap-2 font-mono text-[10px] text-[#b9cacb]">
                <span className="w-2 h-2 rounded-full bg-[#ccff00] animate-pulse"></span>
                <span>Complete todas as etapas sequencialmente para emitir o laudo de evolução inteligente do aluno.</span>
              </div>
              <button
                type="button"
                onClick={() => setActiveSubTab("consultas")}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold border transition-all cursor-pointer shrink-0 ${
                  activeSubTab === "consultas"
                    ? "bg-[#1b1c1e] text-[#00f2ff] border-[#00f2ff]/40 shadow-[0_0_10px_rgba(0,242,255,0.1)]"
                    : "bg-[#121315]/60 text-[#ccff00] border-[#ccff00]/20 hover:border-[#ccff00]/40"
                }`}
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Consultas, Notas & Lembretes</span>
              </button>
            </div>
          </div>

          {/* Active sub-tab content render */}
          <div className="bg-[#121315]/10 rounded-2xl p-1">
            {activeSubTab === "dieta-flex" && (
              <DietaFlexibilidade 
                currentStudent={currentStudent}
                activeDiet={activeDiet}
                onSaveDiet={onSaveDiet}
                onSaveAndAdvance={() => handleAdvanceStep("dieta-flex")}
              />
            )}

            {activeSubTab === "avaliacao" && (
              <AvaliacaoCorporal 
                currentStudent={currentStudent}
                students={students}
                onSelectStudent={onSelectStudent}
                onUpdateStudentBF={handleUpdateStudentBF}
                onSaveAndAdvance={() => handleAdvanceStep("avaliacao")}
                isFormMode={isFormMode}
                onSetIsFormMode={setIsFormMode}
                triggerResetCount={triggerResetCount}
              />
            )}

            {activeSubTab === "analise-postural" && (
              <AnalisePosturalView 
                students={students}
                selectedStudentId={currentStudent.id}
                onSelectStudent={onSelectStudent}
                isEmbedded={true}
                onSaveAndAdvance={() => handleAdvanceStep("analise-postural")}
              />
            )}

            {activeSubTab === "historico" && (
              <HistoricoEvolucao 
                currentStudent={currentStudent}
                onAdvance={() => handleAdvanceStep("historico")}
              />
            )}

            {activeSubTab === "consultas" && (
              <ConsultasLembretes 
                students={students}
                currentStudent={currentStudent}
              />
            )}

            {activeSubTab === "laudo" && (
              <EnviarLaudo 
                currentStudent={currentStudent}
                activeDiet={activeDiet}
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

    </div>
  );
}
