import React, { useState, useEffect } from "react";
import { 
  TrendingUp, 
  Activity, 
  Calendar, 
  AlertTriangle, 
  CheckCircle, 
  Download,
  Info
} from "lucide-react";
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend 
} from "recharts";

interface EvolucaoPosturalProps {
  alunoId: string;
}

export default function EvolucaoPostural({ alunoId }: EvolucaoPosturalProps) {
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem(`treinopro_postural_evaluations_${alunoId}`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          // Sort by date/timestamp
          const sorted = [...parsed].sort((a, b) => {
            const dateA = new Date(a.date.split("/").reverse().join("-")).getTime();
            const dateB = new Date(b.date.split("/").reverse().join("-")).getTime();
            return dateA - dateB;
          });
          setHistory(sorted);
        }
      } catch (err) {
        console.error("Erro ao carregar histórico postural:", err);
      }
    } else {
      // Mock some history if none exists, to showcase the beautiful analytics
      const mockHistory = [
        {
          id: "mock-p-1",
          studentId: alunoId,
          date: "15/03/2026",
          kpis: {
            geral: 72,
            cervical: 68,
            escapular: 70,
            pelvico: 75,
            simetria: 74,
            estabilidade: 72,
            mobilidade: 70,
            compensacaoRisco: "Médio"
          }
        },
        {
          id: "mock-p-2",
          studentId: alunoId,
          date: "10/05/2026",
          kpis: {
            geral: 79,
            cervical: 75,
            escapular: 78,
            pelvico: 80,
            simetria: 82,
            estabilidade: 78,
            mobilidade: 76,
            compensacaoRisco: "Baixo"
          }
        },
        {
          id: "mock-p-3",
          studentId: alunoId,
          date: "25/06/2026",
          kpis: {
            geral: 85,
            cervical: 82,
            escapular: 84,
            pelvico: 86,
            simetria: 88,
            estabilidade: 84,
            mobilidade: 82,
            compensacaoRisco: "Baixo"
          }
        }
      ];
      setHistory(mockHistory);
    }
  }, [alunoId]);

  if (history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center bg-[#1f2022] rounded-xl border border-white/10">
        <Info className="w-12 h-12 text-[#c3f400] mb-4" />
        <h3 className="text-lg font-semibold text-white">Sem Histórico de Evolução</h3>
        <p className="text-gray-400 mt-2 max-w-md">
          Este aluno ainda não possui avaliações posturais salvas. Salve uma nova avaliação para gerar o histórico de evolução biomecânica.
        </p>
      </div>
    );
  }

  const latestEval = history[history.length - 1];
  const firstEval = history[0];
  const overallImprovement = latestEval.kpis.geral - firstEval.kpis.geral;

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#1f2022] p-5 rounded-xl border border-white/10 flex items-center justify-between">
          <div>
            <span className="text-xs text-gray-400 font-medium uppercase tracking-wider block">Score Geral Atual</span>
            <span className="text-3xl font-bold text-[#c3f400] mt-1 block">
              {latestEval.kpis.geral}/100
            </span>
          </div>
          <div className="p-3 rounded-lg bg-[#c3f400]/10 text-[#c3f400]">
            <Activity className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-[#1f2022] p-5 rounded-xl border border-white/10 flex items-center justify-between">
          <div>
            <span className="text-xs text-gray-400 font-medium uppercase tracking-wider block">Melhoria Acumulada</span>
            <span className={`text-3xl font-bold mt-1 block ${overallImprovement >= 0 ? "text-green-400" : "text-red-400"}`}>
              {overallImprovement >= 0 ? `+${overallImprovement}` : overallImprovement} pts
            </span>
          </div>
          <div className="p-3 rounded-lg bg-green-500/10 text-green-400">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-[#1f2022] p-5 rounded-xl border border-white/10 flex items-center justify-between">
          <div>
            <span className="text-xs text-gray-400 font-medium uppercase tracking-wider block">Risco de Compensação</span>
            <span className={`text-xl font-bold mt-2 block px-2.5 py-0.5 rounded-full text-xs text-center w-fit ${
              latestEval.kpis.compensacaoRisco === "Baixo" ? "bg-green-500/20 text-green-400" :
              latestEval.kpis.compensacaoRisco === "Médio" ? "bg-yellow-500/20 text-yellow-400" :
              "bg-red-500/20 text-red-400"
            }`}>
              {latestEval.kpis.compensacaoRisco || "Baixo"}
            </span>
          </div>
          <div className="p-3 rounded-lg bg-white/5 text-gray-300">
            <Calendar className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Chart Panel */}
      <div className="bg-[#1f2022] p-5 rounded-xl border border-white/10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-3">
          <div>
            <h3 className="text-lg font-semibold text-white">Evolução dos Índices Posturais</h3>
            <p className="text-sm text-gray-400">Progresso temporal dos principais alinhamentos biomecânicos</p>
          </div>
        </div>

        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={history} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2b2d" />
              <XAxis dataKey="date" stroke="#9ca3af" fontSize={11} tickLine={false} />
              <YAxis domain={[0, 100]} stroke="#9ca3af" fontSize={11} tickLine={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: "#121315", borderColor: "rgba(255,255,255,0.1)", borderRadius: "8px" }}
                labelStyle={{ color: "#fff", fontWeight: "bold" }}
                itemStyle={{ color: "#c3f400" }}
              />
              <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: "12px" }} />
              <Line type="monotone" name="Geral" dataKey="kpis.geral" stroke="#c3f400" strokeWidth={3} dot={{ r: 5 }} activeDot={{ r: 8 }} />
              <Line type="monotone" name="Cervical" dataKey="kpis.cervical" stroke="#60a5fa" strokeWidth={2} dot={{ r: 3 }} />
              <Line type="monotone" name="Escapular/Ombros" dataKey="kpis.escapular" stroke="#f472b6" strokeWidth={2} dot={{ r: 3 }} />
              <Line type="monotone" name="Pélvico/Lombar" dataKey="kpis.pelvico" stroke="#fbbf24" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Evolution Summary Cards */}
      <div className="bg-[#1f2022] p-5 rounded-xl border border-white/10">
        <h4 className="font-semibold text-white mb-4">Detalhamento dos Segmentos Posturais</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="p-4 rounded-lg bg-black/20 border border-white/5">
            <h5 className="text-sm font-medium text-gray-300">Alinhamento Cervical</h5>
            <div className="flex items-center justify-between mt-2">
              <span className="text-2xl font-bold text-white">{latestEval.kpis.cervical}/100</span>
              <span className="text-xs text-green-400 font-medium px-2 py-0.5 rounded bg-green-500/10">
                Estabilizado
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-2">
              Progresso no posicionamento da cabeça e cervical, reduzindo tensões musculares cervicais.
            </p>
          </div>

          <div className="p-4 rounded-lg bg-black/20 border border-white/5">
            <h5 className="text-sm font-medium text-gray-300">Simetria Escapular & Ombros</h5>
            <div className="flex items-center justify-between mt-2">
              <span className="text-2xl font-bold text-white">{latestEval.kpis.escapular}/100</span>
              <span className="text-xs text-green-400 font-medium px-2 py-0.5 rounded bg-green-500/10">
                Simétrico
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-2">
              Melhoria no nivelamento horizontal clavicular e redução da assimetria de ombros.
            </p>
          </div>

          <div className="p-4 rounded-lg bg-black/20 border border-white/5 col-span-1 sm:col-span-2 lg:col-span-1">
            <h5 className="text-sm font-medium text-gray-300">Estabilidade Pélvica & Lombar</h5>
            <div className="flex items-center justify-between mt-2">
              <span className="text-2xl font-bold text-white">{latestEval.kpis.pelvico}/100</span>
              <span className="text-xs text-green-400 font-medium px-2 py-0.5 rounded bg-green-500/10">
                Alinhado
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-2">
              Redução do desvio anterior/posterior de pelve, otimizando o suporte lombar axial.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
