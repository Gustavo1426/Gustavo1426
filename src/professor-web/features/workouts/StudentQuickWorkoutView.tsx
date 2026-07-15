/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useRef } from "react";
import { 
  X, Play, Pause, RotateCcw, Check, Share2, Award, Clock, ArrowLeft, Sparkles, Dumbbell, ClipboardList, Info, ChevronRight, MessageSquare, Phone
} from "lucide-react";
import { Student, Workout, Exercise } from "../../../types";
import { ADVANCED_TECHNIQUES_INFO } from "../dashboard/DashboardView";

interface StudentQuickWorkoutViewProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student;
  allWorkouts: Workout[];
  currentDraftExercises?: Exercise[];
  workoutNameDraft?: string;
  onSaveWorkout?: (studentId: string, name: string, exercises: Exercise[]) => void;
}

export default function StudentQuickWorkoutView({
  isOpen,
  onClose,
  student,
  allWorkouts,
  currentDraftExercises = [],
  workoutNameDraft = "Treino Rascunho",
  onSaveWorkout
}: StudentQuickWorkoutViewProps) {
  // Filter workouts for this specific student
  const savedWorkouts = useMemo(() => {
    return allWorkouts.filter(w => w.studentId === student.id);
  }, [allWorkouts, student.id]);

  // Combine draft exercises with saved workouts as available options
  const workoutsOptions = useMemo(() => {
    const list: { id: string; name: string; exercises: Exercise[]; isDraft?: boolean }[] = [];
    
    // Add draft if there are exercises in it
    if (currentDraftExercises && currentDraftExercises.length > 0) {
      list.push({
        id: "draft",
        name: `📝 ${workoutNameDraft} (Editando)`,
        exercises: currentDraftExercises,
        isDraft: true
      });
    }

    // Add saved workouts
    savedWorkouts.forEach(w => {
      list.push({
        id: w.id,
        name: `💪 ${w.name}`,
        exercises: w.exercises || []
      });
    });

    return list;
  }, [currentDraftExercises, savedWorkouts, workoutNameDraft]);

  // State for active workout view inside the phone
  const [selectedWorkoutIdx, setSelectedWorkoutIdx] = useState<number>(0);
  
  // Set first available workout on load or change
  useEffect(() => {
    if (workoutsOptions.length > 0) {
      setSelectedWorkoutIdx(0);
    }
  }, [workoutsOptions]);

  const activeWorkout = workoutsOptions[selectedWorkoutIdx];

  // Rest Timer State
  const [restTime, setRestTime] = useState<number>(90); // default 90s
  const [timerLeft, setTimerLeft] = useState<number>(0);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const [timerMax, setTimerMax] = useState<number>(90);

  // Workout Session State
  const [isWorkoutStarted, setIsWorkoutStarted] = useState<boolean>(false);
  const [sessionTime, setSessionTime] = useState<number>(0);
  const [completedSets, setCompletedSets] = useState<Record<string, boolean>>({});
  const [expandedExercise, setExpandedExercise] = useState<string | null>(null);
  const [showCelebration, setShowCelebration] = useState<boolean>(false);

  // Division and dynamic weight states
  const [studentDivisionTab, setStudentDivisionTab] = useState<string>("A");
  const [studentWeightsState, setStudentWeightsState] = useState<Record<string, number>>({});
  const [selectedStudentTechniqueHelp, setSelectedStudentTechniqueHelp] = useState<string | null>(null);

  // Dynamic available divisions
  const availableDivisions = useMemo(() => {
    if (!activeWorkout || !activeWorkout.exercises) return ["A"];
    const divs = new Set<string>();
    activeWorkout.exercises.forEach(ex => {
      divs.add(ex.division || "A");
    });
    divs.add("A");
    return Array.from(divs).sort();
  }, [activeWorkout]);

  // Exercises of active workout filtered by selected division
  const activeDivisionExercises = useMemo(() => {
    if (!activeWorkout || !activeWorkout.exercises) return [];
    return activeWorkout.exercises.filter(ex => (ex.division || "A") === studentDivisionTab);
  }, [activeWorkout, studentDivisionTab]);

  // Load saved student weights when activeWorkout changes
  useEffect(() => {
    if (activeWorkout && activeWorkout.exercises) {
      const initialWeights: Record<string, number> = {};
      activeWorkout.exercises.forEach(ex => {
        if (ex.studentWeights) {
          Object.entries(ex.studentWeights).forEach(([setIdx, w]) => {
            initialWeights[`${ex.id}-${Number(setIdx) - 1}`] = w as number;
          });
        } else if (ex.weight > 0) {
          for (let i = 0; i < ex.sets; i++) {
            initialWeights[`${ex.id}-${i}`] = ex.weight;
          }
        }
      });
      setStudentWeightsState(initialWeights);
    }
  }, [activeWorkout]);

  // Handle changing weight for a set
  const handleWeightChange = (exerciseId: string, setIdx: number, val: string) => {
    const num = Math.max(0, parseFloat(val) || 0);
    setStudentWeightsState(prev => ({
      ...prev,
      [`${exerciseId}-${setIdx}`]: num
    }));
  };

  // Refs for timers
  const restTimerRef = useRef<NodeJS.Timeout | null>(null);
  const sessionTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Rest Timer Effect
  useEffect(() => {
    if (isTimerRunning && timerLeft > 0) {
      restTimerRef.current = setTimeout(() => {
        setTimerLeft(prev => prev - 1);
      }, 1000);
    } else if (timerLeft === 0 && isTimerRunning) {
      setIsTimerRunning(false);
      // Play a subtle sound or vibration notification if supported
      if ("vibrate" in navigator) {
        navigator.vibrate([100, 50, 100]);
      }
    }

    return () => {
      if (restTimerRef.current) clearTimeout(restTimerRef.current);
    };
  }, [isTimerRunning, timerLeft]);

  // Session Duration Timer Effect
  useEffect(() => {
    if (isWorkoutStarted) {
      sessionTimerRef.current = setInterval(() => {
        setSessionTime(prev => prev + 1);
      }, 1000);
    } else {
      if (sessionTimerRef.current) clearInterval(sessionTimerRef.current);
    }

    return () => {
      if (sessionTimerRef.current) clearInterval(sessionTimerRef.current);
    };
  }, [isWorkoutStarted]);

  // Format session time (MM:SS or HH:MM:SS)
  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    const pad = (num: number) => String(num).padStart(2, "0");
    if (hours > 0) {
      return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
    }
    return `${pad(minutes)}:${pad(seconds)}`;
  };

  // Auto start rest timer when checking a set
  const handleToggleSet = (exerciseId: string, setIdx: number) => {
    const key = `${exerciseId}-${setIdx}`;
    const newState = !completedSets[key];
    
    setCompletedSets(prev => ({
      ...prev,
      [key]: newState
    }));

    if (newState) {
      // Start rest timer automatically (defaulting to 90s, or any customized amount)
      setTimerLeft(restTime);
      setTimerMax(restTime);
      setIsTimerRunning(true);
    }
  };

  const handleStartWorkout = () => {
    setIsWorkoutStarted(true);
    setSessionTime(0);
    setCompletedSets({});
    setShowCelebration(false);
    // Expand first exercise of active division automatically
    if (activeDivisionExercises.length > 0) {
      setExpandedExercise(activeDivisionExercises[0].id);
    }
  };

  const handleFinishWorkout = () => {
    setIsWorkoutStarted(false);
    setShowCelebration(true);

    // Save student weights back to the workout exercises
    if (onSaveWorkout && activeWorkout && activeWorkout.id !== "draft") {
      const updatedExercises = (activeWorkout.exercises || []).map(ex => {
        const setWeights: Record<number, number> = {};
        for (let i = 0; i < ex.sets; i++) {
          const key = `${ex.id}-${i}`;
          const wt = studentWeightsState[key];
          if (wt !== undefined && wt > 0) {
            setWeights[i + 1] = wt; // 1-indexed
          }
        }
        return {
          ...ex,
          studentWeights: Object.keys(setWeights).length > 0 ? setWeights : ex.studentWeights
        };
      });
      
      onSaveWorkout(student.id, activeWorkout.name.replace(/📝 |💪 /, ""), updatedExercises);
    }
  };

  // Compute stats for completed session
  const totalCompletedSetsCount = useMemo(() => {
    return Object.values(completedSets).filter(Boolean).length;
  }, [completedSets]);

  // Copy shareable WhatsApp text optimized for quick view
  const handleShareWorkout = () => {
    if (!activeWorkout) return;

    let text = `*🏋️‍♂️ Foco no Treino - ${student.name}* \n`;
    text += `*Treino:* ${activeWorkout.name.replace(/📝 |💪 /, "")}\n`;
    text += `*Fase:* ${student.currentPhase}\n`;
    text += `------------------------------------\n\n`;

    activeWorkout.exercises.forEach((ex, idx) => {
      text += `*${idx + 1}. ${ex.name}*\n`;
      text += `   • Séries: *${ex.sets}* | Reps: *${ex.reps}*\n`;
      if (ex.weight > 0) text += `   • Carga: *${ex.weight} kg*\n`;
      if (ex.notes) text += `   • Dica: _${ex.notes}_\n`;
      text += `\n`;
    });

    text += `------------------------------------\n`;
    text += `📱 Abra no painel para cronometrar e marcar suas séries! Bons treinos! 🔥`;

    navigator.clipboard.writeText(text);
    alert("Treino formatado e copiado com sucesso! Agora você pode colar no WhatsApp do seu aluno.");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4">
      {/* Container Grid */}
      <div className="w-full max-w-5xl bg-[#121315]/95 border border-[#3a494b]/30 rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row h-auto md:h-[82vh] max-h-[900px]">
        
        {/* Left column: Trainer Instructions & Quick Actions */}
        <div className="w-full md:w-2/5 p-6 border-b md:border-b-0 md:border-r border-[#3a494b]/20 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#00f2ff] bg-[#00f2ff]/10 px-2.5 py-1 rounded border border-[#00f2ff]/20">
                Visualização do Aluno
              </span>
              <button 
                onClick={onClose}
                className="p-1 rounded-lg bg-[#1f2022] hover:bg-red-500/10 text-gray-400 hover:text-red-400 transition-all cursor-pointer md:hidden"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="space-y-1">
              <h3 className="text-xl font-extrabold text-white font-sans tracking-tight">📱 Modo Foco no Treino</h3>
              <p className="text-xs text-[#b9cacb] leading-relaxed">
                Este é o simulador premium do aplicativo do aluno. Uma tela única, vertical, sem distrações, ideal para acompanhamento das séries e cargas dentro da academia.
              </p>
            </div>

            <div className="glass-panel p-4 rounded-xl space-y-3 border border-[#3a494b]/20 bg-[#161719]/40">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#ebb2ff]" /> Recursos Premium inclusos:
              </h4>
              <ul className="text-[11px] text-[#b9cacb] space-y-2 font-sans">
                <li className="flex items-start gap-2">
                  <span className="text-[#00f2ff]">✓</span>
                  <span><b>Sem Rolagem Excessiva</b>: Visualização limpa e focada no exercício ativo.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#00f2ff]">✓</span>
                  <span><b>Cronômetro de Descanso Automático</b>: Dispara ao marcar qualquer série como concluída.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#00f2ff]">✓</span>
                  <span><b>Checklist Interativo</b>: Mantém o aluno engajado série por série.</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="space-y-3 pt-4 border-t border-[#3a494b]/10">
            <div className="space-y-1.5">
              <p className="text-[10px] text-[#b9cacb] font-mono uppercase tracking-wider">Ações de Compartilhamento</p>
              <button
                type="button"
                onClick={handleShareWorkout}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#25d366]/10 hover:bg-[#25d366]/20 border border-[#25d366]/30 text-[#25d366] text-xs font-extrabold font-mono uppercase tracking-wider transition-all cursor-pointer shadow-[0_0_12px_rgba(37,211,102,0.05)]"
              >
                <MessageSquare className="w-4 h-4" /> Enviar Treino p/ WhatsApp
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-full text-center py-2.5 text-xs text-[#b9cacb] hover:text-white hover:bg-[#1f2022] rounded-xl font-mono border border-transparent hover:border-[#3a494b]/30 transition-all cursor-pointer"
            >
              Fechar Visualizador
            </button>
          </div>
        </div>

        {/* Right column: Interactive Smartphone Preview */}
        <div className="w-full md:w-3/5 bg-[#0b0c0d] flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          
          {/* Realistic iPhone mockup shell */}
          <div className="w-full max-w-[360px] aspect-[9/19] rounded-[42px] border-[10px] border-[#202224] bg-[#121315] shadow-2xl relative overflow-hidden flex flex-col ring-4 ring-[#191b1c] ring-offset-2 ring-offset-black">
            
            {/* Top Speaker/Notch Notch */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-6 bg-[#202224] rounded-b-2xl z-40 flex items-center justify-center gap-1.5">
              <div className="w-8 h-1 bg-black/60 rounded-full"></div>
              <div className="w-2.5 h-2.5 bg-black/80 rounded-full border border-gray-900"></div>
            </div>

            {/* Simulated App Header */}
            <div className="bg-[#161719] border-b border-[#3a494b]/15 pt-8 pb-3 px-4 flex items-center justify-between relative z-10 shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-[#00f2ff] to-[#ebb2ff] flex items-center justify-center">
                  <span className="text-[10px] font-extrabold text-black font-mono">TP</span>
                </div>
                <div>
                  <h4 className="text-xs font-black text-white font-mono leading-none">TREINO PRO</h4>
                  <p className="text-[9px] text-[#00f2ff] font-mono uppercase mt-0.5 tracking-wider">Atleta: {student.initials}</p>
                </div>
              </div>
              <span className="text-[10px] font-mono text-[#b9cacb] bg-[#1f2022] px-2 py-0.5 rounded border border-[#3a494b]/15">
                {student.currentPhase}
              </span>
            </div>

            {/* Smartphone Scrollable Viewport */}
            <div className="flex-1 overflow-y-auto p-3.5 space-y-4 relative bg-[#0e0f11]">
              
              {/* Workout sheet select if multiple sheets exist */}
              {workoutsOptions.length > 1 && !isWorkoutStarted && !showCelebration && (
                <div className="space-y-1.5">
                  <label className="block text-[9px] font-mono uppercase tracking-wider text-[#b9cacb] px-1">Selecionar Ficha de Treino:</label>
                  <div className="grid grid-cols-1 gap-1.5">
                    {workoutsOptions.map((w, idx) => (
                      <button
                        key={w.id}
                        onClick={() => setSelectedWorkoutIdx(idx)}
                        className={`text-left p-2.5 rounded-xl border text-[11px] font-mono transition-all cursor-pointer flex items-center justify-between ${
                          selectedWorkoutIdx === idx
                            ? "bg-[#00f2ff]/10 border-[#00f2ff] text-white font-extrabold"
                            : "bg-[#161719] border-[#3a494b]/20 text-[#b9cacb] hover:text-white hover:border-[#3a494b]/40"
                        }`}
                      >
                        <span className="truncate max-w-[210px]">{w.name}</span>
                        <ChevronRight className="w-3.5 h-3.5 text-[#00f2ff] shrink-0" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Celebration Screen */}
              {showCelebration ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-4 space-y-6 animate-fade-in my-auto py-12">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-[#ebb2ff] to-[#00f2ff] flex items-center justify-center shadow-[0_0_20px_rgba(0,242,255,0.2)]">
                    <Award className="w-8 h-8 text-black" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-lg font-black text-white font-mono uppercase tracking-wider">Treino Concluído!</h3>
                    <p className="text-xs text-[#b9cacb] leading-relaxed">
                      Excelente trabalho, <b>{student.name}</b>! Você completou suas séries com consistência e dedicação hoje.
                    </p>
                  </div>

                  <div className="w-full bg-[#161719] border border-[#3a494b]/20 rounded-2xl p-4 grid grid-cols-2 gap-3 font-mono text-left">
                    <div>
                      <span className="block text-[8px] text-[#b9cacb]/55 uppercase">Tempo Total</span>
                      <span className="text-sm font-bold text-[#00f2ff]">{formatTime(sessionTime)}</span>
                    </div>
                    <div>
                      <span className="block text-[8px] text-[#b9cacb]/55 uppercase">Séries Feitas</span>
                      <span className="text-sm font-bold text-[#ebb2ff]">{totalCompletedSetsCount} séries</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowCelebration(false)}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#00f2ff] to-[#ebb2ff] text-black font-extrabold font-mono text-xs uppercase tracking-wider shadow-lg hover:brightness-110 transition-all cursor-pointer"
                  >
                    Voltar para o Treino
                  </button>
                </div>
              ) : !activeWorkout || activeWorkout.exercises.length === 0 ? (
                <div className="flex flex-col items-center justify-center text-center p-6 space-y-3 h-full justify-self-center py-20">
                  <ClipboardList className="w-10 h-10 text-gray-600 border-dashed border p-2 rounded-full border-gray-700" />
                  <p className="text-xs font-mono text-gray-400">Nenhum exercício carregado neste treino.</p>
                </div>
              ) : !isWorkoutStarted ? (
                /* Workout Start Screen */
                <div className="space-y-5 animate-fade-in py-4">
                  {/* Division tabs inside smartphone */}
                  {availableDivisions.length > 1 && (
                    <div className="space-y-1.5">
                      <span className="text-[8px] font-mono uppercase tracking-wider text-[#b9cacb]/85 px-1 block">DIVISÃO DE TREINO</span>
                      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                        {availableDivisions.map((div) => {
                          const isSel = studentDivisionTab === div;
                          const count = (activeWorkout.exercises || []).filter(ex => (ex.division || "A") === div).length;
                          return (
                            <button
                              key={div}
                              type="button"
                              onClick={() => setStudentDivisionTab(div)}
                              className={`px-3 py-2 rounded-xl border text-[10px] font-extrabold uppercase transition-all cursor-pointer flex items-center gap-1.5 shrink-0 font-mono ${
                                isSel
                                  ? "bg-[#00f2ff]/10 border-[#00f2ff] text-[#00f2ff]"
                                  : "bg-[#161719]/80 border-[#3a494b]/15 text-gray-400 hover:text-white"
                              }`}
                            >
                              <span>TREINO {div}</span>
                              <span className={`px-1.5 py-0.5 rounded-full text-[8px] font-black ${isSel ? "bg-[#00f2ff]/20 text-[#00f2ff]" : "bg-black/30 text-gray-500"}`}>{count}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <div className="p-4 bg-gradient-to-br from-[#121315] to-[#161719] border border-[#3a494b]/20 rounded-2xl space-y-3">
                    <span className="text-[8px] font-mono text-[#00f2ff] border border-[#00f2ff]/30 px-1.5 py-0.5 rounded bg-[#00f2ff]/5 uppercase tracking-widest">Ficha Ativa</span>
                    <h3 className="text-base font-black text-white leading-tight font-sans mt-1">
                      {activeWorkout.name.replace(/📝 |💪 /, "")}
                    </h3>
                    <div className="flex items-center gap-2.5 text-[10px] font-mono text-[#b9cacb]">
                      <span className="flex items-center gap-1">
                        <Dumbbell className="w-3.5 h-3.5 text-[#ebb2ff]" /> {activeDivisionExercises.length} Exercícios no Treino {studentDivisionTab}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <button
                      type="button"
                      onClick={handleStartWorkout}
                      disabled={activeDivisionExercises.length === 0}
                      className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[#00f2ff] disabled:opacity-50 text-black font-extrabold font-mono text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(0,242,255,0.2)] hover:bg-[#33f4ff] transition-all cursor-pointer"
                    >
                      <Play className="w-4 h-4 fill-black" /> Iniciar Treino {studentDivisionTab} Agora
                    </button>
                  </div>

                  <div className="space-y-3 pt-2">
                    <p className="text-[9px] font-mono uppercase tracking-wider text-[#b9cacb] px-1">Exercícios Planejados:</p>
                    <div className="space-y-2">
                      {activeDivisionExercises.length === 0 ? (
                        <p className="text-[10px] font-mono text-gray-500 p-4 bg-[#161719] rounded-xl text-center">Nenhum exercício cadastrado na divisão {studentDivisionTab}</p>
                      ) : (
                        activeDivisionExercises.map((ex, i) => (
                          <div key={ex.id} className="p-3 bg-[#161719] border border-[#3a494b]/10 rounded-xl flex items-center justify-between">
                            <div className="min-w-0">
                              <span className="text-[9px] font-mono text-[#ebb2ff] font-extrabold block">EXERCÍCIO {i + 1}</span>
                              <span className="text-xs font-extrabold text-white truncate block mt-0.5">{ex.name}</span>
                              {ex.advancedTechnique && (
                                <span className="inline-block text-[8px] font-black uppercase text-purple-400 bg-purple-950/40 border border-purple-500/20 px-1 py-0.5 rounded mt-1">
                                  ⚡ {ex.advancedTechnique}
                                </span>
                              )}
                            </div>
                            <div className="text-right shrink-0 font-mono text-[10px] text-[#b9cacb]">
                              <p className="font-extrabold text-[#00f2ff]">{ex.sets} séries</p>
                              <p className="text-[9px] mt-0.5">{ex.reps} reps</p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                /* Active Workout Session screen */
                <div className="space-y-4 animate-fade-in pb-16">
                  
                  {/* Active Session Status Panel */}
                  <div className="p-3 bg-[#161719] border border-[#3a494b]/20 rounded-2xl flex items-center justify-between font-mono text-[11px] shrink-0 sticky top-0 z-20 shadow-md">
                    <div className="flex items-center gap-2">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                      </span>
                      <span className="font-extrabold text-white">EM TREINO</span>
                    </div>
                    <div className="flex items-center gap-1.5 font-bold">
                      <Clock className="w-3.5 h-3.5 text-[#00f2ff]" />
                      <span className="text-white">{formatTime(sessionTime)}</span>
                    </div>
                    <button
                      type="button"
                      onClick={handleFinishWorkout}
                      className="px-2.5 py-1 rounded-lg bg-green-500 hover:bg-green-600 text-black font-extrabold text-[9px] uppercase transition-all cursor-pointer"
                    >
                      Finalizar
                    </button>
                  </div>

                  {/* REST TIMER SUB-PANEL */}
                  <div className="p-3 bg-black/50 border border-[#00f2ff]/20 rounded-2xl space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-[#00f2ff]" />
                        <span className="text-[10px] font-mono uppercase font-bold text-white">Cronômetro de Descanso</span>
                      </div>
                      
                      <div className="flex items-center gap-1 bg-[#121315] border border-[#3a494b]/20 px-2 py-1 rounded">
                        <span className="text-[8px] font-mono text-gray-400 uppercase">Tempo Alvo:</span>
                        <select
                          value={restTime}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            setRestTime(val);
                            if (isTimerRunning) {
                              setTimerLeft(val);
                              setTimerMax(val);
                            }
                          }}
                          className="bg-transparent text-white font-mono text-[9px] font-extrabold border-none outline-none cursor-pointer p-0"
                        >
                          <option value="30" className="bg-[#121315]">30s</option>
                          <option value="45" className="bg-[#121315]">45s</option>
                          <option value="60" className="bg-[#121315]">60s</option>
                          <option value="90" className="bg-[#121315]">90s</option>
                          <option value="120" className="bg-[#121315]">2 min</option>
                          <option value="150" className="bg-[#121315]">2:30 min</option>
                          <option value="180" className="bg-[#121315]">3 min</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-3">
                      {/* Timer Display Progress Bar */}
                      <div className="flex-1 bg-[#161719] h-7 rounded-lg border border-[#3a494b]/20 relative overflow-hidden flex items-center justify-center font-mono">
                        <div 
                          className="absolute left-0 top-0 bottom-0 bg-[#00f2ff]/10 transition-all duration-1000"
                          style={{ width: timerLeft > 0 ? `${(timerLeft / timerMax) * 100}%` : "0%" }}
                        ></div>
                        <span className={`text-xs font-black relative z-10 ${timerLeft > 0 ? "text-[#00f2ff]" : "text-[#b9cacb]"}`}>
                          {timerLeft > 0 ? `Descansando... ${timerLeft}s` : "Aguardando próxima série..."}
                        </span>
                      </div>

                      {/* Timer control buttons */}
                      <div className="flex gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => {
                            if (timerLeft > 0) {
                              setIsTimerRunning(!isTimerRunning);
                            } else {
                              setTimerLeft(restTime);
                              setTimerMax(restTime);
                              setIsTimerRunning(true);
                            }
                          }}
                          className="p-1.5 rounded-lg bg-[#161719] border border-[#3a494b]/20 text-white hover:border-[#00f2ff] cursor-pointer"
                        >
                          {isTimerRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setTimerLeft(0);
                            setIsTimerRunning(false);
                          }}
                          className="p-1.5 rounded-lg bg-[#161719] border border-[#3a494b]/20 text-gray-400 hover:text-white cursor-pointer"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* ACTIVE EXERCISE FEED CARD LIST */}
                  <div className="space-y-3">
                    {activeDivisionExercises.map((ex, index) => {
                      const isExpanded = expandedExercise === ex.id;
                      const hasTech = !!ex.advancedTechnique;
                      
                      // Calculate completed sets for this exercise
                      let completedCount = 0;
                      for (let i = 0; i < ex.sets; i++) {
                        if (completedSets[`${ex.id}-${i}`]) {
                          completedCount++;
                        }
                      }
                      const isAllCompleted = completedCount === ex.sets;

                      return (
                        <div 
                          key={ex.id}
                          className={`border rounded-2xl transition-all overflow-hidden ${
                            isAllCompleted
                              ? "bg-black/30 border-[#25d366]/20 opacity-80"
                              : hasTech
                              ? "bg-[#161719] border-[#bf5af2]/40 shadow-[0_0_15px_rgba(191,90,242,0.1)]"
                              : isExpanded
                              ? "bg-[#161719] border-[#00f2ff]/30 shadow-[0_4px_12px_rgba(0,0,242,0.04)]"
                              : "bg-[#121315]/80 border-[#3a494b]/10 hover:border-[#3a494b]/30"
                          }`}
                        >
                          {/* Accordion header */}
                          <div 
                            onClick={() => setExpandedExercise(isExpanded ? null : ex.id)}
                            className="p-3.5 flex flex-col gap-2 cursor-pointer select-none"
                          >
                            <div className="flex items-center justify-between w-full">
                              <div className="min-w-0 pr-2">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span className={`text-[8px] font-mono font-extrabold px-1.5 py-0.5 rounded ${
                                    isAllCompleted 
                                      ? "bg-green-500/10 text-[#25d366] border border-[#25d366]/20" 
                                      : "bg-[#ebb2ff]/10 text-[#ebb2ff]"
                                  }`}>
                                    EX {index + 1}
                                  </span>
                                  {isAllCompleted && (
                                    <span className="text-[10px] text-[#25d366] font-mono font-bold">✓ Feito</span>
                                  )}
                                  {hasTech && (
                                    <span 
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedStudentTechniqueHelp(selectedStudentTechniqueHelp === ex.id ? null : ex.id);
                                      }}
                                      className="text-[8px] font-black uppercase bg-[#bf5af2]/10 text-[#d683ff] border border-[#bf5af2]/30 px-1.5 py-0.5 rounded flex items-center gap-1 hover:bg-[#bf5af2]/20 transition-all cursor-pointer"
                                    >
                                      ⚡ {ex.advancedTechnique}
                                      <Info className="w-2.5 h-2.5 text-[#d683ff]/80" />
                                    </span>
                                  )}
                                </div>
                                <h4 className="text-xs font-black text-white font-sans mt-1.5 truncate">{ex.name}</h4>
                                <p className="text-[10px] font-mono text-[#b9cacb]/80 mt-0.5">
                                  {ex.sets} séries × {ex.reps} {ex.division ? `| Divisão ${ex.division}` : ""}
                                </p>
                              </div>

                              <div className="text-right shrink-0 flex items-center gap-2">
                                <div className="font-mono text-[9px] text-[#b9cacb] bg-[#121315] border border-[#3a494b]/15 px-2 py-1 rounded-lg">
                                  <span className="font-bold text-white">{completedCount}</span>/{ex.sets} sets
                                </div>
                                <ChevronRight className={`w-3.5 h-3.5 text-gray-500 transition-transform ${isExpanded ? "rotate-90 text-[#00f2ff]" : ""}`} />
                              </div>
                            </div>

                            {/* Option 3: Instructional Technique Help Tooltip directly inside the accordion */}
                            {selectedStudentTechniqueHelp === ex.id && hasTech && ADVANCED_TECHNIQUES_INFO[ex.advancedTechnique!] && (
                              <div 
                                onClick={(e) => e.stopPropagation()} 
                                className="mt-2 p-3 bg-gradient-to-br from-[#1b1222] to-[#120d19] border border-[#bf5af2]/30 rounded-xl space-y-2 text-[10px] text-gray-300 font-mono animate-fade-in relative shadow-lg"
                              >
                                <div className="flex items-center justify-between border-b border-[#bf5af2]/20 pb-1.5">
                                  <span className="text-[#d683ff] font-extrabold flex items-center gap-1">
                                    📖 Guia de Execução: {ex.advancedTechnique}
                                  </span>
                                  <button 
                                    type="button"
                                    onClick={() => setSelectedStudentTechniqueHelp(null)}
                                    className="p-0.5 text-gray-400 hover:text-white rounded"
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                </div>
                                <p className="text-gray-300 leading-normal">{ADVANCED_TECHNIQUES_INFO[ex.advancedTechnique!].description}</p>
                                <div className="space-y-1 bg-black/30 p-2 rounded border border-[#bf5af2]/10 text-[9px]">
                                  {ADVANCED_TECHNIQUES_INFO[ex.advancedTechnique!].steps.split("\n").map((step, sIdx) => (
                                    <p key={sIdx} className="text-[#d683ff]">{step}</p>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Expanded interactive series panel */}
                          {isExpanded && (
                            <div className="px-3.5 pb-4 pt-1.5 border-t border-[#3a494b]/10 bg-[#0e0f11]/60 space-y-3 font-mono text-[11px] animate-fade-in">
                              
                              {/* Exercise notes/tips */}
                              {ex.notes && (
                                <div className="p-2.5 rounded-xl bg-[#161719]/80 border border-[#3a494b]/15 text-[10px] text-[#b9cacb] leading-normal flex gap-1.5">
                                  <Info className="w-3.5 h-3.5 text-[#ebb2ff] shrink-0 mt-0.5" />
                                  <span>{ex.notes}</span>
                                </div>
                              )}

                              {/* Interactive sets checklist */}
                              <div className="space-y-1.5">
                                <div className="grid grid-cols-12 gap-1 text-[8px] uppercase tracking-wider text-gray-400 font-bold px-1 pb-1">
                                  <span className="col-span-2 text-center">Set</span>
                                  <span className="col-span-4">Meta</span>
                                  <span className="col-span-3">Carga</span>
                                  <span className="col-span-3 text-right">Feito</span>
                                </div>

                                {Array.from({ length: ex.sets }).map((_, i) => {
                                  const isSetCompleted = !!completedSets[`${ex.id}-${i}`];
                                  const isTargetSet = ex.techniqueSetTarget?.[i + 1];
                                  return (
                                    <div 
                                      key={i}
                                      onClick={() => handleToggleSet(ex.id, i)}
                                      className={`grid grid-cols-12 gap-1 py-1.5 px-2 rounded-lg items-center border transition-all cursor-pointer ${
                                        isSetCompleted
                                          ? "bg-[#25d366]/5 border-[#25d366]/20 text-white"
                                          : isTargetSet
                                          ? "bg-[#bf5af2]/5 border-[#bf5af2]/25 text-white shadow-[inset_0_0_10px_rgba(191,90,242,0.05)]"
                                          : "bg-[#161719]/40 border-[#3a494b]/10 text-gray-300 hover:bg-[#161719]"
                                      }`}
                                    >
                                      <span className="col-span-2 text-center text-[10px] font-bold text-gray-400">{i + 1}</span>
                                      
                                      <span className="col-span-4 text-[10px] font-bold flex flex-col">
                                        <span>{ex.reps} reps</span>
                                        {isTargetSet && (
                                          <span className="text-[7px] text-[#d683ff] uppercase font-black tracking-tighter mt-0.5">
                                            🔥 Técnica
                                          </span>
                                        )}
                                      </span>

                                      {/* Interactive student weight (kg) input */}
                                      <div 
                                        className="col-span-3 flex items-center gap-1" 
                                        onClick={(e) => e.stopPropagation()}
                                      >
                                        <input
                                          type="text"
                                          inputMode="decimal"
                                          placeholder="—"
                                          value={studentWeightsState[`${ex.id}-${i}`] ?? ""}
                                          onChange={(e) => handleWeightChange(ex.id, i, e.target.value)}
                                          className="w-12 h-6 bg-black/40 border border-[#3a494b]/30 text-[#00f2ff] font-bold font-mono text-[10px] text-center rounded focus:border-[#00f2ff] outline-none"
                                        />
                                        <span className="text-[8px] text-gray-500 font-bold uppercase">kg</span>
                                      </div>

                                      <div className="col-span-3 flex justify-end">
                                        <div className={`w-4 h-4 rounded flex items-center justify-center border transition-all ${
                                          isSetCompleted 
                                            ? "bg-[#25d366] border-[#25d366] text-black" 
                                            : isTargetSet
                                            ? "border-[#bf5af2]/60 hover:border-[#bf5af2]"
                                            : "border-gray-600"
                                        }`}>
                                          {isSetCompleted && <Check className="w-3 h-3 stroke-[3]" />}
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                </div>
              )}

            </div>

            {/* Simulative Smartphone Home Indicator */}
            <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-32 h-1 bg-[#202224] rounded-full z-40 shrink-0"></div>

          </div>

        </div>

      </div>
    </div>
  );
}
