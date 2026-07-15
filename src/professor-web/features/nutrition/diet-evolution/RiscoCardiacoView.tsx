import React from "react";

export interface RiscoCardiacoResponse {
  idade: number;
  sexo: number;
  peso: number;
  atividade: number;
  tabagismo: number;
  pressao: number;
  historico: number;
  colesterol: number;
  diabetes: number;
}

export const RISCO_CARDIAC_QUESTIONS = [
  { id: "idade", label: "Idade", options: [{ label: "10-20 anos", value: 1 }, { label: "21-30 anos", value: 2 }, { label: "31-40 anos", value: 3 }, { label: "41-50 anos", value: 4 }, { label: "51+ anos", value: 5 }] },
  { id: "sexo", label: "Gênero Biológico", options: [{ label: "Feminino", value: 1 }, { label: "Masculino", value: 2 }] },
  { id: "peso", label: "Peso Corporal (Relação de Excesso)", options: [{ label: "No peso ideal", value: 1 }, { label: "Leve excesso de peso", value: 2 }, { label: "Excesso de peso moderado", value: 3 }, { label: "Obesidade grau I", value: 4 }, { label: "Obesidade grau II/III", value: 5 }] },
  { id: "atividade", label: "Nível de Atividade Física", options: [{ label: "Ativo (exercícios intensos diários)", value: 1 }, { label: "Moderado (3-4x por semana)", value: 2 }, { label: "Leve (1-2x por semana)", value: 3 }, { label: "Sedentário completo", value: 4 }] },
  { id: "tabagismo", label: "Hábito de Fumar (Tabagismo)", options: [{ label: "Não fumante", value: 1 }, { label: "Fumante ocasional / ex-fumante", value: 2 }, { label: "Até 10 cigarros/dia", value: 3 }, { label: "Mais de 10 cigarros/dia", value: 4 }, { label: "Mais de 20 cigarros/dia", value: 5 }] },
  { id: "pressao", label: "Pressão Arterial Sistólica", options: [{ label: "Normal (< 120 mmHg)", value: 1 }, { label: "Elevada (120-129 mmHg)", value: 2 }, { label: "Hipertensão Estágio 1 (130-139 mmHg)", value: 3 }, { label: "Hipertensão Estágio 2 (>= 140 mmHg)", value: 4 }] },
  { id: "historico", label: "Histórico Familiar de Infarto / AVC", options: [{ label: "Nenhum caso na família", value: 1 }, { label: "1 parente acima de 60 anos", value: 2 }, { label: "Mais de 1 parente acima de 60 anos", value: 3 }, { label: "1 parente abaixo de 60 anos", value: 4 }, { label: "Mais de 1 parente abaixo de 60 anos", value: 5 }] },
  { id: "colesterol", label: "Nível de Colesterol Total", options: [{ label: "Abaixo de 180 mg/dl", value: 1 }, { label: "180-200 mg/dl", value: 2 }, { label: "201-240 mg/dl", value: 3 }, { label: "Acima de 240 mg/dl", value: 4 }] },
  { id: "diabetes", label: "Glicemia / Diabetes", options: [{ label: "Normal (< 100 mg/dl)", value: 1 }, { label: "Pré-diabetes (100-125 mg/dl)", value: 2 }, { label: "Diabetes controlado", value: 3 }, { label: "Diabetes descontrolado", value: 4 }] }
];

export function getRiscoCardiacoClassification(score: number) {
  if (score <= 15) {
    return { text: "Risco Baixo", color: "text-green-400", bg: "bg-green-500/10", border: "border-green-500/30" };
  } else if (score <= 25) {
    return { text: "Risco Moderado", color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/30" };
  } else {
    return { text: "Risco Alto", color: "text-rose-500", bg: "bg-rose-500/10", border: "border-rose-500/30" };
  }
}

interface RiscoCardiacoViewProps {
  answers: RiscoCardiacoResponse;
  onChange?: (answers: RiscoCardiacoResponse) => void;
  isReadOnly?: boolean;
}

export default function RiscoCardiacoView({
  answers,
  onChange,
  isReadOnly = false
}: RiscoCardiacoViewProps) {
  const handleSelect = (key: keyof RiscoCardiacoResponse, value: number) => {
    if (isReadOnly || !onChange) return;
    onChange({
      ...answers,
      [key]: value
    });
  };

  const score = Object.values(answers).reduce((acc, val) => acc + (val || 0), 0);
  const classification = getRiscoCardiacoClassification(score);

  return (
    <div className="space-y-6">
      <div className={`p-4 rounded-xl border ${classification.bg} ${classification.border} flex justify-between items-center`}>
        <div>
          <span className="text-gray-400 font-mono text-xs block uppercase tracking-wider">Pontuação Total</span>
          <span className="text-white font-mono text-xl font-bold">{score} pts</span>
        </div>
        <div className="text-right">
          <span className="text-gray-400 font-mono text-xs block uppercase tracking-wider">Classificação de Risco</span>
          <span className={`font-mono text-lg font-bold ${classification.color}`}>{classification.text}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {RISCO_CARDIAC_QUESTIONS.map((q) => {
          const currentValue = answers[q.id as keyof RiscoCardiacoResponse] ?? 0;
          return (
            <div key={q.id} className="bg-[#121314] border border-gray-900 rounded-xl p-4 flex flex-col justify-between">
              <label className="text-gray-300 font-mono text-xs mb-3 font-semibold block">{q.label}</label>
              <div className="flex flex-wrap gap-2">
                {q.options.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    disabled={isReadOnly}
                    onClick={() => handleSelect(q.id as keyof RiscoCardiacoResponse, opt.value)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all cursor-pointer ${
                      currentValue === opt.value
                        ? "bg-[#ccff00] text-black font-bold"
                        : "bg-[#1b1c1e] text-gray-400 hover:text-white border border-gray-800"
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
