/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from "react";
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Clock, 
  User, 
  CheckCircle, 
  Activity, 
  Sparkles,
  Trash2,
  Bell,
  Dumbbell,
  Shield,
  FileText
} from "lucide-react";
import { Student } from "../../../types";

interface CalendarEvent {
  id: string;
  studentId: string;
  studentName: string;
  type: "workout" | "checkin" | "assessment" | "appointment" | "reminder";
  title: string;
  date: string; // YYYY-MM-DD
  time?: string;
  description?: string;
}

interface CalendarioViewProps {
  students: Student[];
}

export default function CalendarioView({ students }: CalendarioViewProps) {
  // We represent July 2026 as the active month (since current local time is July 2026)
  const [currentYear, setCurrentYear] = useState(2026);
  const [currentMonth, setCurrentMonth] = useState(6); // 0-indexed (6 = July)
  const [selectedDate, setSelectedDate] = useState<string>("2026-07-09");
  
  // Local state for interactive events
  const [events, setEvents] = useState<CalendarEvent[]>([
    {
      id: "ev-1",
      studentId: "stud-seeded-gustavo",
      studentName: "Gustavo Silva",
      type: "appointment",
      title: "Avaliação Antropométrica",
      date: "2026-07-09",
      time: "10:00",
      description: "Reavaliação corporal periódica de dobras e perímetros."
    },
    {
      id: "ev-2",
      studentId: "stud-seeded-camila",
      studentName: "Camila Fernandes",
      type: "checkin",
      title: "Check-in: Treino A concluído",
      date: "2026-07-09",
      time: "08:15",
      description: "Sentiu excelente estimulação no glúteo. Carga de elevação pélvica subiu de 120kg para 130kg."
    },
    {
      id: "ev-3",
      studentId: "stud-seeded-ricardo",
      studentName: "Ricardo Oliveira",
      type: "workout",
      title: "Novo Treino C (Pull) Enviado",
      date: "2026-07-08",
      time: "14:30",
      description: "Treino reestruturado com inclusão de Rest-Pause no Pulldown."
    },
    {
      id: "ev-4",
      studentId: "stud-seeded-gustavo",
      studentName: "Gustavo Silva",
      type: "assessment",
      title: "Laudo Postural Concluído",
      date: "2026-07-07",
      time: "11:00",
      description: "Identificado leve valgismo dinâmico sob carga."
    },
    {
      id: "ev-5",
      studentId: "stud-seeded-camila",
      studentName: "Camila Fernandes",
      type: "reminder",
      title: "Cobrar fotos de evolução postural",
      date: "2026-07-11",
      time: "09:00",
      description: "Lembrete automático para acompanhamento quinzenal de simetria escapular."
    },
    {
      id: "ev-6",
      studentId: "stud-seeded-ricardo",
      studentName: "Ricardo Oliveira",
      type: "appointment",
      title: "Consulta de Alinhamento de Metas",
      date: "2026-07-15",
      time: "19:30",
      description: "Ajuste na periodização nutricional para a nova fase de ganho de massa."
    }
  ]);

  // Form states for adding appointment
  const [showAddModal, setShowAddModal] = useState(false);
  const [newEventStudentId, setNewEventStudentId] = useState(students[0]?.id || "");
  const [newEventType, setNewEventType] = useState<"workout" | "checkin" | "assessment" | "appointment" | "reminder">("appointment");
  const [newEventTitle, setNewEventTitle] = useState("");
  const [newEventDate, setNewEventDate] = useState("2026-07-09");
  const [newEventTime, setNewEventTime] = useState("14:00");
  const [newEventDesc, setNewEventDesc] = useState("");

  const monthNames = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(prev => prev - 1);
    } else {
      setCurrentMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(prev => prev + 1);
    } else {
      setCurrentMonth(prev => prev + 1);
    }
  };

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDayIndex = getFirstDayOfMonth(currentYear, currentMonth);

  const daysGrid = useMemo(() => {
    const grid = [];
    // Pad previous month days
    const prevMonthDays = getDaysInMonth(currentYear, currentMonth - 1 < 0 ? 11 : currentMonth - 1);
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      grid.push({
        day: prevMonthDays - i,
        isCurrentMonth: false,
        dateString: "" // Empty so we don't display events on padded days
      });
    }
    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      const monthStr = String(currentMonth + 1).padStart(2, '0');
      const dayStr = String(i).padStart(2, '0');
      grid.push({
        day: i,
        isCurrentMonth: true,
        dateString: `${currentYear}-${monthStr}-${dayStr}`
      });
    }
    // Pad next month days to complete grid
    const totalCells = 42; // 6 rows of 7 days
    const remainingCells = totalCells - grid.length;
    for (let i = 1; i <= remainingCells; i++) {
      grid.push({
        day: i,
        isCurrentMonth: false,
        dateString: ""
      });
    }
    return grid;
  }, [currentYear, currentMonth, daysInMonth, firstDayIndex]);

  // Handle Event Submit
  const handleAddEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEventTitle.trim()) return;

    const studentObj = students.find(s => s.id === newEventStudentId);
    const studentName = studentObj ? studentObj.name : "Professor / Geral";

    const newEv: CalendarEvent = {
      id: `ev-${Date.now()}`,
      studentId: newEventStudentId,
      studentName,
      type: newEventType,
      title: newEventTitle,
      date: newEventDate,
      time: newEventTime,
      description: newEventDesc
    };

    setEvents(prev => [...prev, newEv]);
    setShowAddModal(false);
    setNewEventTitle("");
    setNewEventDesc("");
  };

  const handleDeleteEvent = (id: string) => {
    setEvents(prev => prev.filter(ev => ev.id !== id));
  };

  const selectedDayEvents = useMemo(() => {
    return events.filter(ev => ev.date === selectedDate);
  }, [events, selectedDate]);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black tracking-tight uppercase flex items-center gap-2 text-white">
            <span className="bg-[#00f2ff] w-1.5 h-7 rounded-full inline-block"></span>
            Agenda & Calendário
          </h2>
          <p className="text-[#b9cacb] text-sm mt-1">
            Monitore consultas presenciais, treinos recém-enviados, check-ins feitos e lembretes importantes.
          </p>
        </div>

        <button
          onClick={() => {
            setNewEventDate(selectedDate);
            setShowAddModal(true);
          }}
          className="bg-gradient-to-r from-[#00f2ff] to-[#ccff00] text-black py-2.5 px-5 rounded-xl font-black flex items-center justify-center gap-2 hover:shadow-[0_0_20px_rgba(0,242,255,0.4)] hover:scale-[1.03] transition-all active:scale-95 text-xs uppercase tracking-wider cursor-pointer"
        >
          <Plus className="w-4 h-4 text-black stroke-[3px]" />
          Agendar Compromisso
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left/Middle: The Month Grid */}
        <div className="lg:col-span-2 glass-panel p-5 rounded-2xl border border-white/5 bg-[#17181a]/95">
          {/* Calendar Month Control */}
          <div className="flex items-center justify-between border-b border-[#3a494b]/20 pb-4 mb-4">
            <h3 className="font-mono text-base font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-[#00f2ff]" />
              {monthNames[currentMonth]} {currentYear}
            </h3>
            
            <div className="flex gap-2">
              <button
                onClick={handlePrevMonth}
                className="p-1.5 rounded-lg bg-[#1b1c1e] text-[#b9cacb] hover:text-white border border-[#3a494b]/30 hover:border-[#3a494b]/60 transition-all cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={handleNextMonth}
                className="p-1.5 rounded-lg bg-[#1b1c1e] text-[#b9cacb] hover:text-white border border-[#3a494b]/30 hover:border-[#3a494b]/60 transition-all cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Weekday headers */}
          <div className="grid grid-cols-7 gap-1 text-center font-mono text-[10px] text-[#b9cacb]/60 uppercase tracking-widest font-black mb-2">
            <div>Dom</div>
            <div>Seg</div>
            <div>Ter</div>
            <div>Qua</div>
            <div>Qui</div>
            <div>Sex</div>
            <div>Sáb</div>
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-2">
            {daysGrid.map((cell, index) => {
              const isSelected = cell.dateString === selectedDate;
              const hasEvents = cell.dateString ? events.some(ev => ev.date === cell.dateString) : false;
              const dayEvents = cell.dateString ? events.filter(ev => ev.date === cell.dateString) : [];

              return (
                <div
                  key={index}
                  onClick={() => cell.dateString && setSelectedDate(cell.dateString)}
                  className={`h-24 p-2 rounded-xl border flex flex-col justify-between transition-all relative cursor-pointer ${
                    !cell.isCurrentMonth
                      ? "opacity-20 bg-transparent border-transparent pointer-events-none"
                      : isSelected
                      ? "bg-[#00f2ff]/10 border-[#00f2ff] shadow-[0_0_15px_rgba(0,242,255,0.15)] text-[#00f2ff]"
                      : "bg-[#111214] border-white/5 hover:border-[#3a494b]/60 hover:bg-[#1b1c1e]"
                  }`}
                >
                  <span className={`font-mono text-xs font-bold ${isSelected ? "text-[#00f2ff]" : "text-white/80"}`}>
                    {cell.day}
                  </span>

                  {/* Micro event tags */}
                  {cell.isCurrentMonth && dayEvents.length > 0 && (
                    <div className="flex flex-wrap gap-1 max-h-12 overflow-hidden">
                      {dayEvents.map(ev => {
                        let dotColor = "bg-blue-500";
                        if (ev.type === "workout") dotColor = "bg-[#ccff00]";
                        if (ev.type === "checkin") dotColor = "bg-emerald-500";
                        if (ev.type === "assessment") dotColor = "bg-purple-500";
                        if (ev.type === "reminder") dotColor = "bg-amber-500";

                        return (
                          <span
                            key={ev.id}
                            className={`w-1.5 h-1.5 rounded-full ${dotColor}`}
                            title={`${ev.studentName}: ${ev.title}`}
                          />
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Pane: Day events list */}
        <div className="glass-panel p-5 rounded-2xl border border-white/5 bg-[#17181a]/95 flex flex-col">
          <div className="border-b border-[#3a494b]/20 pb-4 mb-4">
            <h3 className="font-mono text-sm font-extrabold text-[#00f2ff] uppercase tracking-wider">
              {new Date(selectedDate + "T00:00:00").toLocaleDateString("pt-BR", {
                weekday: "long",
                day: "numeric",
                month: "long"
              })}
            </h3>
            <p className="text-[10px] text-[#b9cacb] font-mono uppercase tracking-wide mt-1">
              {selectedDayEvents.length} atividades agendadas
            </p>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3.5 pr-1 max-h-[400px]">
            {selectedDayEvents.length === 0 ? (
              <div className="text-center py-12 text-[#b9cacb]/40 space-y-2">
                <CalendarIcon className="w-8 h-8 mx-auto stroke-1" />
                <p className="text-xs font-mono uppercase">Sem compromissos nesta data.</p>
              </div>
            ) : (
              selectedDayEvents.map(ev => {
                let badgeColor = "border-blue-500/30 text-blue-400 bg-blue-500/5";
                let icon = <Clock className="w-3.5 h-3.5 text-blue-400" />;

                if (ev.type === "workout") {
                  badgeColor = "border-[#ccff00]/30 text-[#ccff00] bg-[#ccff00]/5";
                  icon = <Dumbbell className="w-3.5 h-3.5 text-[#ccff00]" />;
                } else if (ev.type === "checkin") {
                  badgeColor = "border-emerald-500/30 text-emerald-400 bg-emerald-500/5";
                  icon = <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />;
                } else if (ev.type === "assessment") {
                  badgeColor = "border-purple-500/30 text-purple-400 bg-purple-500/5";
                  icon = <Shield className="w-3.5 h-3.5 text-purple-400" />;
                } else if (ev.type === "reminder") {
                  badgeColor = "border-amber-500/30 text-amber-400 bg-amber-500/5";
                  icon = <Bell className="w-3.5 h-3.5 text-amber-400" />;
                }

                return (
                  <div
                    key={ev.id}
                    className="p-3.5 rounded-xl bg-[#111214] border border-white/5 space-y-2 hover:border-[#3a494b]/60 transition-all relative group"
                  >
                    <div className="flex justify-between items-start gap-2">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase tracking-wide border flex items-center gap-1 ${badgeColor}`}>
                        {icon}
                        {ev.type === "workout" ? "Treino" : ev.type === "checkin" ? "Check-in" : ev.type === "assessment" ? "Avaliação" : ev.type === "appointment" ? "Consulta" : "Lembrete"}
                      </span>
                      
                      <button
                        onClick={() => handleDeleteEvent(ev.id)}
                        className="text-gray-500 hover:text-red-400 p-1 rounded hover:bg-gray-800/40 transition-all cursor-pointer opacity-0 group-hover:opacity-100"
                        title="Remover compromisso"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="space-y-1">
                      <h4 className="font-bold text-xs text-[#e3e2e4]">{ev.title}</h4>
                      {ev.time && (
                        <p className="text-[10px] text-[#00f2ff] font-mono flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {ev.time}h
                        </p>
                      )}
                      <p className="text-[10px] text-[#b9cacb] font-mono">Aluno: <strong>{ev.studentName}</strong></p>
                      {ev.description && (
                        <p className="text-[11px] text-[#b9cacb]/80 leading-relaxed font-sans bg-[#121315]/40 p-2 rounded border border-white/5 mt-1.5">
                          {ev.description}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>

      {/* Add Appointment Modal Overlay */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="glass-panel w-full max-w-md rounded-2xl relative shadow-[0_0_40px_rgba(0,242,255,0.25)] overflow-hidden">
            <div className="p-5 border-b border-[#3a494b]/20 bg-[#161719]/80 flex items-center justify-between">
              <h3 className="font-extrabold text-sm text-white uppercase tracking-wider font-mono flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#00f2ff]" />
                Agendar Novo Compromisso
              </h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddEvent} className="p-5 space-y-4 font-mono text-xs">
              <div>
                <label className="block text-gray-400 text-[10px] mb-1">Selecione o Aluno</label>
                <select
                  value={newEventStudentId}
                  onChange={e => setNewEventStudentId(e.target.value)}
                  className="w-full bg-[#121315] border border-gray-800 text-white p-2.5 rounded-xl text-xs"
                >
                  <option value="general">Professor / Geral</option>
                  {students.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-400 text-[10px] mb-1">Tipo de Evento</label>
                  <select
                    value={newEventType}
                    onChange={e => setNewEventType(e.target.value as any)}
                    className="w-full bg-[#121315] border border-gray-800 text-white p-2.5 rounded-xl text-xs"
                  >
                    <option value="appointment">Consulta</option>
                    <option value="reminder">Lembrete</option>
                    <option value="workout">Treino Enviado</option>
                    <option value="checkin">Check-in</option>
                    <option value="assessment">Avaliação</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-400 text-[10px] mb-1">Hora</label>
                  <input
                    type="time"
                    required
                    value={newEventTime}
                    onChange={e => setNewEventTime(e.target.value)}
                    className="w-full bg-[#121315] border border-gray-800 text-white p-2.5 rounded-xl text-center text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3">
                <div>
                  <label className="block text-gray-400 text-[10px] mb-1">Data</label>
                  <input
                    type="date"
                    required
                    value={newEventDate}
                    onChange={e => setNewEventDate(e.target.value)}
                    className="w-full bg-[#121315] border border-gray-800 text-white p-2.5 rounded-xl text-center text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-400 text-[10px] mb-1">Título do Compromisso</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Treino de Perna Presencial ou Reavaliação"
                  value={newEventTitle}
                  onChange={e => setNewEventTitle(e.target.value)}
                  className="w-full bg-[#121315] border border-gray-800 text-white p-2.5 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block text-gray-400 text-[10px] mb-1">Observações / Descrição</label>
                <textarea
                  placeholder="Instruções adicionais para a consulta"
                  value={newEventDesc}
                  onChange={e => setNewEventDesc(e.target.value)}
                  className="w-full bg-[#121315] border border-gray-800 text-white p-2.5 rounded-xl text-xs h-20 resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-[#00f2ff] to-[#ccff00] text-black py-3 rounded-xl font-black text-center text-xs uppercase tracking-wider hover:shadow-[0_0_20px_rgba(0,242,255,0.4)] transition-all cursor-pointer"
              >
                Salvar Compromisso
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// Inline fallback for close modal button
function X({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}
