import React from "react";

export interface QuestionarioEstresseResponse {
  [key: string]: number;
}

export const ESTRESSE_QUESTIONS = [
  { id: "estresse_1", label: "Sente irritabilidade ou impaciência com frequência elevada?" },
  { id: "estresse_2", label: "Dificuldade para relaxar ou desligar-se das preocupações diárias?" },
  { id: "estresse_3", label: "Sente tensões musculares constantes, dores de cabeça ou bruxismo?" },
  { id: "estresse_4", label: "Sentimento de estar sobrecarregado(a) ou sem controle sobre as obrigações?" },
  { id: "estresse_5", label: "Sintomas físicos como taquicardia, azia ou sudorese fria sem motivo físico aparente?" },
  { id: "estresse_6", label: "Falta de motivação ou apatia para realizar tarefas cotidianas ou treinar?" }
];

export function getEstresseClassification(score: number) {
  if (score <= 10) {
    return { text: "Baixo", color: "text-green-400", bg: "bg-green-500/10", border: "border-green-500/30" };
  } else if (score <= 20) {
    return { text: "Moderado", color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/30" };
  } else {
    return { text: "Alto / Crítico", color: "text-rose-500", bg: "bg-rose-500/10", border: "border-rose-500/30" };
  }
}

interface QuestionarioEstresseViewProps {
  answers: QuestionarioEstresseResponse;
  onChange?: (answers: QuestionarioEstresseResponse) => void;
  isReadOnly?: boolean;
}

export default function QuestionarioEstresseView({
  answers,
  onChange,
  isReadOnly = false
}: QuestionarioEstresseViewProps) {
  const handleSelect = (id: string, value: number) => {
    if (isReadOnly || !onChange) return;
    onChange({
      ...answers,
      [id]: value
    });
  };

  const score = Object.keys(answers)
    .filter(key => key.startsWith("estresse_"))
    .reduce((acc, key) => acc + (answers[key] || 0), 0);

  const classification = getEstresseClassification(score);

  const options = [
    { label: "Nunca", value: 1 },
    { label: "Raramente", value: 2 },
    { label: "Às vezes", value: 3 },
    { label: "Frequentemente", value: 4 },
    { label: "Sempre", value: 5 }
  ];

  return (
    <div className="space-y-6">
      <div className={`p-4 rounded-xl border ${classification.bg} ${classification.border} flex justify-between items-center`}>
        <div>
          <span className="text-gray-400 font-mono text-xs block uppercase tracking-wider">Pontuação de Estresse</span>
          <span className="text-white font-mono text-xl font-bold">{score} pts</span>
        </div>
        <div className="text-right">
          <span className="text-gray-400 font-mono text-xs block uppercase tracking-wider">Nível Percebido</span>
          <span className={`font-mono text-lg font-bold ${classification.color}`}>{classification.text}</span>
        </div>
      </div>

      <div className="space-y-4">
        {ESTRESSE_QUESTIONS.map((q) => {
          const currentValue = answers[q.id] ?? 1;
          return (
            <div key={q.id} className="bg-[#121314] border border-gray-900 rounded-xl p-4">
              <label className="text-gray-300 font-mono text-xs font-semibold block mb-3 leading-relaxed">
                {q.label}
              </label>
              <div className="flex flex-wrap gap-2">
                {options.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    disabled={isReadOnly}
                    onClick={() => handleSelect(q.id, opt.value)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all cursor-pointer ${
                      currentValue === opt.value
                        ? "bg-[#ccff00] text-black font-bold"
                        : "bg-[#1b1c1e] text-gray-400 hover:text-white border border-gray-850"
                    }`}
                  >
                    {opt.label}
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
