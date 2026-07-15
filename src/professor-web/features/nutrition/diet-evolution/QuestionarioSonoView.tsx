import React from "react";

export interface QuestionarioSonoResponse {
  [key: string]: boolean;
}

export const SONO_QUESTIONS = [
  { id: "sono_1", label: "Dificuldade para iniciar o sono (demora mais de 30 minutos para dormir)?" },
  { id: "sono_2", label: "Despertares noturnos frequentes (acorda várias vezes durante a noite)?" },
  { id: "sono_3", label: "Despertar precoce (acorda antes do horário desejado e não consegue voltar a dormir)?" },
  { id: "sono_4", label: "Sono não-restaurador (sente cansaço ou fadiga mesmo após dormir a noite toda)?" },
  { id: "sono_5", label: "Dificuldade de concentração ou sonolência excessiva durante o dia?" },
  { id: "sono_6", label: "Ronco alto frequente ou pausas na respiração relatadas por terceiros (suspeita de apneia)?" },
  { id: "sono_7", label: "Uso recorrente de medicamentos, chás ou substâncias para conseguir induzir o sono?" }
];

export function getSonoClassification(score: number) {
  if (score <= 3) {
    return { text: "Excelente", color: "text-green-400", bg: "bg-green-500/10", border: "border-green-500/30" };
  } else if (score <= 9) {
    return { text: "Moderada / Atenção", color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/30" };
  } else {
    return { text: "Crítica / Ruim", color: "text-rose-500", bg: "bg-rose-500/10", border: "border-rose-500/30" };
  }
}

interface QuestionarioSonoViewProps {
  answers: QuestionarioSonoResponse;
  onChange?: (answers: QuestionarioSonoResponse) => void;
  isReadOnly?: boolean;
}

export default function QuestionarioSonoView({
  answers,
  onChange,
  isReadOnly = false
}: QuestionarioSonoViewProps) {
  const handleToggle = (id: string) => {
    if (isReadOnly || !onChange) return;
    onChange({
      ...answers,
      [id]: !answers[id]
    });
  };

  const sleepSimCount = Object.keys(answers).filter(key => key.startsWith("sono_") && answers[key] === true).length;
  const score = sleepSimCount * 3;
  const classification = getSonoClassification(score);

  return (
    <div className="space-y-6">
      <div className={`p-4 rounded-xl border ${classification.bg} ${classification.border} flex justify-between items-center`}>
        <div>
          <span className="text-gray-400 font-mono text-xs block uppercase tracking-wider">Pontos de Alerta</span>
          <span className="text-white font-mono text-xl font-bold">{score} pts</span>
        </div>
        <div className="text-right">
          <span className="text-gray-400 font-mono text-xs block uppercase tracking-wider">Qualidade de Sono</span>
          <span className={`font-mono text-lg font-bold ${classification.color}`}>{classification.text}</span>
        </div>
      </div>

      <div className="space-y-3">
        {SONO_QUESTIONS.map((q) => {
          const isChecked = answers[q.id] === true;
          return (
            <div
              key={q.id}
              onClick={() => handleToggle(q.id)}
              className={`p-4 rounded-xl border transition-all flex items-center justify-between cursor-pointer ${
                isChecked
                  ? "bg-amber-500/5 border-amber-500/30 text-white"
                  : "bg-[#121314] border-gray-900 text-gray-400 hover:text-gray-200"
              }`}
            >
              <span className="font-mono text-xs leading-relaxed max-w-[85%]">{q.label}</span>
              <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${
                isChecked ? "bg-amber-500 border-amber-500 text-black" : "border-gray-800"
              }`}>
                {isChecked && (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-3.5 h-3.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
