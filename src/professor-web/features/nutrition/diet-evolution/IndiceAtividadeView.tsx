import React from "react";
import { Flame, Clock, Calendar } from "lucide-react";

export interface IndiceAtividadeResponse {
  intensidade: number;
  duracao: number;
  frequencia: number;
}

export function getIndiceAtividadeClassification(score: number) {
  if (score <= 10) {
    return { categoria: "Sedentário", color: "text-gray-400", bg: "bg-gray-500/10", border: "border-gray-500/30" };
  } else if (score <= 30) {
    return { categoria: "Moderadamente Ativo", color: "text-cyan-400", bg: "bg-cyan-500/10", border: "border-cyan-500/30" };
  } else if (score <= 60) {
    return { categoria: "Ativo", color: "text-green-400", bg: "bg-green-500/10", border: "border-green-500/30" };
  } else {
    return { categoria: "Muito Ativo / Atleta", color: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/30" };
  }
}

interface IndiceAtividadeViewProps {
  answers: IndiceAtividadeResponse;
  onChange?: (answers: IndiceAtividadeResponse) => void;
  isReadOnly?: boolean;
}

export default function IndiceAtividadeView({
  answers,
  onChange,
  isReadOnly = false
}: IndiceAtividadeViewProps) {
  const handleSelect = (key: keyof IndiceAtividadeResponse, value: number) => {
    if (isReadOnly || !onChange) return;
    onChange({
      ...answers,
      [key]: value
    });
  };

  const score = (answers.intensidade || 1) * (answers.duracao || 1) * (answers.frequencia || 1);
  const classification = getIndiceAtividadeClassification(score);

  const options = {
    intensidade: [
      { label: "Muito Leve (Ex: Caminhada lenta)", value: 1 },
      { label: "Leve (Ex: Trabalho doméstico, caminhada moderada)", value: 2 },
      { label: "Moderada (Ex: Musculação leve, ciclismo, corrida leve)", value: 3 },
      { label: "Vigorosa / Intensa (Ex: Musculação pesada, HIIT, natação)", value: 4 },
      { label: "Exaustiva (Ex: Competição esportiva, treinos de alta intensidade)", value: 5 }
    ],
    duracao: [
      { label: "Menos de 20 min", value: 1 },
      { label: "20 a 39 min", value: 2 },
      { label: "40 a 59 min", value: 3 },
      { label: "60 a 90 min", value: 4 },
      { label: "Mais de 90 min", value: 5 }
    ],
    frequencia: [
      { label: "Menos de 1x por semana", value: 1 },
      { label: "1 a 2x por semana", value: 2 },
      { label: "3 a 4x por semana", value: 3 },
      { label: "5 a 6x por semana", value: 4 },
      { label: "Diariamente (ou mais de 1x/dia)", value: 5 }
    ]
  };

  return (
    <div className="space-y-6">
      <div className={`p-4 rounded-xl border ${classification.bg} ${classification.border} flex justify-between items-center`}>
        <div>
          <span className="text-gray-400 font-mono text-xs block uppercase tracking-wider">Índice de Atividade</span>
          <span className="text-white font-mono text-xl font-bold">{score} pts</span>
        </div>
        <div className="text-right">
          <span className="text-gray-400 font-mono text-xs block uppercase tracking-wider">Perfil de Atividade</span>
          <span className={`font-mono text-lg font-bold ${classification.color}`}>{classification.categoria}</span>
        </div>
      </div>

      <div className="space-y-4">
        {([
          { key: "intensidade", label: "Intensidade das Atividades", icon: <Flame className="w-4 h-4 text-amber-500" /> },
          { key: "duracao", label: "Duração Média por Sessão", icon: <Clock className="w-4 h-4 text-cyan-500" /> },
          { key: "frequencia", label: "Frequência Semanal", icon: <Calendar className="w-4 h-4 text-purple-500" /> }
        ] as const).map((section) => {
          const currentValue = answers[section.key] ?? 1;
          return (
            <div key={section.key} className="bg-[#121314] border border-gray-900 rounded-xl p-5">
              <label className="text-gray-300 font-mono text-xs font-semibold flex items-center gap-1.5 mb-3 uppercase tracking-wide">
                {section.icon}
                <span>{section.label}</span>
              </label>
              <div className="flex flex-col gap-2">
                {options[section.key].map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    disabled={isReadOnly}
                    onClick={() => handleSelect(section.key, opt.value)}
                    className={`w-full text-left px-4 py-3 rounded-xl text-xs font-mono transition-all flex justify-between items-center cursor-pointer ${
                      currentValue === opt.value
                        ? "bg-[#ccff00] text-black font-bold"
                        : "bg-[#1b1c1e] text-gray-400 hover:text-white border border-gray-850"
                    }`}
                  >
                    <span>{opt.label}</span>
                    <span className="font-bold opacity-75">{opt.value} pts</span>
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
