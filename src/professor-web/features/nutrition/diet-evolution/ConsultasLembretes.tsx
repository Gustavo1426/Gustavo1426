import React, { useState } from "react";
import { 
  Calendar, 
  Clock, 
  MessageSquare, 
  Plus, 
  Save, 
  User, 
  Bell,
  Trash2
} from "lucide-react";
import { Student } from "../../../../types";
import ConfirmModal from "../../../../shared/presentation/components/ConfirmModal";

interface Appointment {
  id: string;
  studentName: string;
  date: string;
  time: string;
  objective: string;
}

interface ConsultasLembretesProps {
  students: Student[];
  currentStudent: Student;
}

export default function ConsultasLembretes({
  students,
  currentStudent
}: ConsultasLembretesProps) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  // Form states
  const [selectedStudentId, setSelectedStudentId] = useState(currentStudent.id);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [objective, setObjective] = useState("Avaliação Física Inicial");

  // Modal states
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [appToDelete, setAppToDelete] = useState<string | null>(null);
  const [appInfoToDelete, setAppInfoToDelete] = useState("");

  const handleAddAppointment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!date || !time) return;

    const studentObj = students.find(s => s.id === selectedStudentId);
    const name = studentObj ? studentObj.name : currentStudent.name;

    const newApp: Appointment = {
      id: `a-${Date.now()}`,
      studentName: name,
      date,
      time,
      objective
    };

    setAppointments([newApp, ...appointments]);
    setDate("");
    setTime("");
    alert("Consulta agendada com sucesso!");
  };

  const handleRemoveAppointmentClick = (id: string) => {
    const app = appointments.find(a => a.id === id);
    const appInfo = app ? `${app.objective} com ${app.studentName}` : "este agendamento";
    setAppToDelete(id);
    setAppInfoToDelete(appInfo);
    setIsConfirmOpen(true);
  };

  const confirmDeleteAppointment = () => {
    if (appToDelete) {
      setAppointments(appointments.filter(a => a.id !== appToDelete));
    }
    setIsConfirmOpen(false);
    setAppToDelete(null);
  };

  const triggerReminderMessage = (app: Appointment) => {
    const text = `Olá, *${app.studentName}*! Passando para lembrar do nosso compromisso de *${app.objective}* agendado para o dia *${app.date.split("-").reverse().join("/")}* às *${app.time}h*. Confirma sua presença? Aguardo você! ⚡💪`;
    
    // Copy to clipboard
    navigator.clipboard.writeText(text);
    
    // Alert with option to redirect
    const confirmRedirect = window.confirm(
      `Mensagem de lembrete copiada para a área de transferência!\n\n"${text}"\n\nDeseja abrir o WhatsApp Web para disparar a mensagem?`
    );
    
    if (confirmRedirect) {
      const formattedPhone = "5511999999999"; // Default or dynamic if available
      window.open(`https://web.whatsapp.com/send?text=${encodeURIComponent(text)}`, "_blank");
    }
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-[#3a494b]/20 pb-4">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          <Calendar className="w-5 h-5 text-purple-400" /> Consultas e Lembretes
        </h3>
        <p className="text-xs text-[#b9cacb] mt-1 font-mono">
          Agenda Nova Consulta | Gestão de horários de atendimento
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Agenda Nova Consulta */}
        <div className="glass-panel p-5 rounded-xl space-y-4">
          <h4 className="font-mono text-xs font-bold uppercase tracking-wider text-[#ccff00] flex items-center gap-1.5">
            <Plus className="w-4 h-4" /> Agenda Nova Consulta
          </h4>

          <form onSubmit={handleAddAppointment} className="space-y-4 font-mono text-xs">
            <div>
              <label className="block text-gray-400 text-[10px] mb-1">Selecione o Aluno</label>
              <select
                value={selectedStudentId}
                onChange={e => setSelectedStudentId(e.target.value)}
                className="w-full bg-[#121315] border border-gray-800 text-white p-2 rounded-lg text-xs"
              >
                {students.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-gray-400 text-[10px] mb-1">Data</label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  className="w-full bg-[#121315] border border-gray-800 text-white p-2 rounded-lg text-center text-xs"
                />
              </div>
              <div>
                <label className="block text-gray-400 text-[10px] mb-1">Hora</label>
                <input
                  type="time"
                  required
                  value={time}
                  onChange={e => setTime(e.target.value)}
                  className="w-full bg-[#121315] border border-gray-800 text-white p-2 rounded-lg text-center text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-400 text-[10px] mb-1">Objetivo</label>
              <select
                value={objective}
                onChange={e => setObjective(e.target.value)}
                className="w-full bg-[#121315] border border-gray-800 text-white p-2 rounded-lg text-xs"
              >
                <option value="Avaliação Física Inicial">Avaliação Física Inicial</option>
                <option value="Ajuste de Dieta">Ajuste de Dieta</option>
                <option value="Consultoria Periódica">Consultoria Periódica</option>
                <option value="Reavaliação Corporal">Reavaliação Corporal</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full bg-[#ccff00] hover:bg-[#bce600] text-black py-2.5 rounded-xl font-bold uppercase tracking-wider text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Save className="w-4 h-4" /> Salvar Consulta
            </button>
          </form>
        </div>

        {/* Consultas Agendadas e Lembretes */}
        <div className="glass-panel p-5 rounded-xl space-y-4">
          <h4 className="font-mono text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
            <Bell className="w-4 h-4" /> Consultas Agendadas e Lembretes
          </h4>
          <p className="text-[11px] text-gray-500 font-mono">
            Mensagens automáticas de lembretes prontas para disparo via WhatsApp.
          </p>

          <div className="space-y-3 font-mono text-xs">
            {appointments.length === 0 ? (
              <div className="text-center p-8 text-gray-500 border border-dashed border-gray-800 rounded-xl">
                Nenhum compromisso agendado.
              </div>
            ) : (
              appointments.map(app => {
                // formatting date for display: e.g. 2026-06-25 -> 25/06/2026
                const dateDisplay = app.date.includes("-") 
                  ? app.date.split("-").reverse().join("/") 
                  : app.date;
                return (
                  <div key={app.id} className="bg-[#121315] p-3.5 rounded-xl border border-gray-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-cyan-500/10 transition-all">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <User className="w-3.5 h-3.5 text-cyan-400" />
                        <span className="font-bold text-white">{app.studentName}</span>
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-gray-400">
                        <Calendar className="w-3 h-3" />
                        <span>{dateDisplay}</span>
                        <span>às</span>
                        <Clock className="w-3 h-3 ml-1" />
                        <span className="text-[#ccff00] font-bold">{app.time} h</span>
                        <span className="text-gray-600">|</span>
                        <span>{app.objective}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <button
                        onClick={() => triggerReminderMessage(app)}
                        className="bg-cyan-950 hover:bg-cyan-500 text-cyan-400 hover:text-black font-bold px-3 py-1.5 rounded-lg text-[10px] uppercase tracking-wider transition-all flex items-center gap-1 cursor-pointer"
                        title="Enviar lembrete"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        Disparar mensagem
                      </button>
                      <button
                        onClick={() => handleRemoveAppointmentClick(app.id)}
                        className="text-gray-500 hover:text-red-400 p-1.5 rounded hover:bg-red-500/5 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>

      <ConfirmModal
        isOpen={isConfirmOpen}
        title="Desmarcar Consulta"
        message={`Deseja realmente desmarcar/excluir o agendamento de "${appInfoToDelete}"? Esta ação não pode ser desfeita.`}
        confirmLabel="Desmarcar"
        cancelLabel="Voltar"
        onConfirm={confirmDeleteAppointment}
        onCancel={() => {
          setIsConfirmOpen(false);
          setAppToDelete(null);
        }}
        variant="danger"
      />
    </div>
  );
}
