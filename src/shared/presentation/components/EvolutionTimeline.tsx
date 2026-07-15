import React from "react";
import { PhysicalEvaluation } from "../../../professor-web/features/nutrition/diet-evolution/AvaliacaoCorporal";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface EvolutionTimelineProps {
  evaluations: PhysicalEvaluation[];
}

export default function EvolutionTimeline({
  evaluations,
}: EvolutionTimelineProps) {
  if (evaluations.length < 2) {
    return (
      <div className="bg-[#121315] border border-gray-800 rounded-xl p-4 text-center">
        <p className="text-gray-500 text-xs font-mono">
          Necessário pelo menos 2 avaliações para comparar evolução
        </p>
      </div>
    );
  }

  const sortedEvals = [...evaluations].sort(
    (a, b) => a.timestamp - b.timestamp
  );

  const calculateChange = (current: number, previous: number) => {
    const change = current - previous;
    const percentChange = ((change / previous) * 100).toFixed(1);
    return { change, percentChange };
  };

  const getTrendIcon = (change: number) => {
    if (change > 0) return <TrendingUp className="w-3 h-3 text-green-400" />;
    if (change < 0) return <TrendingDown className="w-3 h-3 text-red-400" />;
    return <Minus className="w-3 h-3 text-gray-400" />;
  };

  const getTrendColor = (change: number, isPositive: boolean = true) => {
    if (isPositive) {
      return change > 0 ? "text-green-400" : change < 0 ? "text-red-400" : "text-gray-400";
    }
    return change > 0 ? "text-red-400" : change < 0 ? "text-green-400" : "text-gray-400";
  };

  return (
    <div className="bg-[#121315] border border-gray-800 rounded-xl p-4 space-y-4">
      <h3 className="text-sm font-mono font-bold text-white flex items-center gap-2">
        📊 Linha do Tempo de Evolução
      </h3>

      <div className="space-y-3">
        {sortedEvals.map((ev, index) => {
          const isLatest = index === sortedEvals.length - 1;
          const previousEval = index > 0 ? sortedEvals[index - 1] : null;

          const bfChange = previousEval
            ? calculateChange(ev.resultados.percentualGordura, previousEval.resultados.percentualGordura)
            : null;
          const muscleChange = previousEval
            ? calculateChange(ev.resultados.massaMagra, previousEval.resultados.massaMagra)
            : null;
          const weightChange = previousEval
            ? calculateChange(ev.resultados.peso, previousEval.resultados.peso)
            : null;

          return (
            <div key={ev.id} className="relative">
              {index < sortedEvals.length - 1 && (
                <div className="absolute left-4 top-12 bottom-0 w-0.5 bg-gray-800" />
              )}

              <div
                className={`relative pl-10 ${
                  isLatest ? "bg-cyan-500/5 border border-cyan-500/20 rounded-lg p-3" : ""
                }`}
              >
                <div className="absolute left-0 top-0 w-8 h-8 rounded-full bg-cyan-500/20 border-2 border-cyan-500 flex items-center justify-center">
                  <span className="text-xs font-mono font-bold text-cyan-400">
                    {index + 1}
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-mono font-bold text-white">
                        {ev.date}
                      </p>
                      <p className="text-[9px] text-gray-500 font-mono">
                        {ev.protocolo}
                      </p>
                    </div>
                    {isLatest && (
                      <span className="bg-cyan-500/10 text-cyan-400 px-2 py-0.5 rounded text-[8px] font-mono font-bold uppercase border border-cyan-500/20">
                        Atual
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div className="bg-black/40 p-2 rounded">
                      <p className="text-[8px] text-gray-500 font-mono uppercase">
                        % Gordura
                      </p>
                      <p className="text-sm font-bold text-cyan-400">
                        {ev.resultados.percentualGordura}%
                      </p>
                      {bfChange && (
                        <div className={`flex items-center gap-1 ${getTrendColor(bfChange.change, false)}`}>
                          {getTrendIcon(bfChange.change)}
                          <span className="text-[9px] font-mono">
                            {bfChange.change > 0 ? "+" : ""}
                            {bfChange.change.toFixed(1)}%
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="bg-black/40 p-2 rounded">
                      <p className="text-[8px] text-gray-500 font-mono uppercase">
                        Massa Magra
                      </p>
                      <p className="text-sm font-bold text-green-400">
                        {ev.resultados.massaMagra} kg
                      </p>
                      {muscleChange && (
                        <div className={`flex items-center gap-1 ${getTrendColor(muscleChange.change, true)}`}>
                          {getTrendIcon(muscleChange.change)}
                          <span className="text-[9px] font-mono">
                            {muscleChange.change > 0 ? "+" : ""}
                            {muscleChange.change.toFixed(1)} kg
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="bg-black/40 p-2 rounded">
                      <p className="text-[8px] text-gray-500 font-mono uppercase">
                        Peso
                      </p>
                      <p className="text-sm font-bold text-white">
                        {ev.resultados.peso} kg
                      </p>
                      {weightChange && (
                        <div className={`flex items-center gap-1 ${getTrendColor(weightChange.change, true)}`}>
                          {getTrendIcon(weightChange.change)}
                          <span className="text-[9px] font-mono">
                            {weightChange.change > 0 ? "+" : ""}
                            {weightChange.change.toFixed(1)} kg
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {ev.fotoFrente && (
                    <div className="flex gap-2 pt-2">
                      {[ev.fotoFrente, ev.fotoLado, ev.fotoCostas]
                        .filter(Boolean)
                        .map((foto, idx) => (
                          <img
                            key={idx}
                            src={foto}
                            alt={`Avaliação ${ev.date}`}
                            className="w-16 h-16 object-cover rounded border border-gray-800"
                          />
                        ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}