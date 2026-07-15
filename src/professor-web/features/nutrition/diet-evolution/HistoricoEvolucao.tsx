import React, { useState, useMemo, useEffect } from "react";
import { 
  TrendingUp, 
  Calendar, 
  Plus, 
  Activity, 
  ChevronRight,
  Sparkles,
  ArrowRight,
  Scale,
  Percent,
  Download,
  Share2,
  GitCompare,
  ArrowUpRight,
  ArrowDownRight,
  BookOpen
} from "lucide-react";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from "recharts";
import { Student } from "../../../../types";
import { PhysicalEvaluation } from "./AvaliacaoCorporal";

interface HistoricoEvolucaoProps {
  currentStudent: Student;
  onAdvance?: () => void;
}

export default function HistoricoEvolucao({
  currentStudent,
  onAdvance
}: HistoricoEvolucaoProps) {
  // Load saved evaluations list
  const [evaluations, setEvaluations] = useState<PhysicalEvaluation[]>([]);

  // Selection states for comparison
  const [monthA, setMonthA] = useState<string>("");
  const [monthB, setMonthB] = useState<string>("");

  // Synchronize on mount and student change
  useEffect(() => {
    if (currentStudent) {
      const saved = localStorage.getItem(`coach_physical_evaluations_${currentStudent.id}`);
      if (saved) {
        const parsed: PhysicalEvaluation[] = JSON.parse(saved);
        setEvaluations(parsed);
        // Automatically select the last two unique evaluations to compare
        if (parsed.length >= 2) {
          setMonthA(parsed[parsed.length - 1].id); // oldest
          setMonthB(parsed[0].id); // newest
        } else if (parsed.length === 1) {
          setMonthB(parsed[0].id);
        }
      } else {
        // Fallback or seed
        const seeded = getSeededEvaluations(currentStudent);
        localStorage.setItem(`coach_physical_evaluations_${currentStudent.id}`, JSON.stringify(seeded));
        setEvaluations(seeded);
        if (seeded.length >= 2) {
          setMonthA(seeded[seeded.length - 1].id); // oldest
          setMonthB(seeded[0].id); // newest
        }
      }
    }
  }, [currentStudent]);

  // Seed generator function (same structure as AvaliacaoCorporal for parity)
  function getSeededEvaluations(student: Student): PhysicalEvaluation[] {
    return [
      {
        id: "eval-seeded-3",
        userId: student.id,
        date: "06/2026",
        timestamp: Date.now(),
        protocolo: "Jackson & Pollock 3 Dobras",
        dobras: { peitoral: 11, abdomen: 17, coxa: 14 },
        resultados: {
          peso: student.weight || 68,
          percentualGordura: 13.8,
          percentualMassaMuscular: 44.5,
          massaGorda: parseFloat(((student.weight || 68) * 0.138).toFixed(1)),
          massaMagra: parseFloat(((student.weight || 68) * 0.862).toFixed(1)),
          imc: parseFloat(((student.weight || 68) / Math.pow((student.height || 175) / 100, 2)).toFixed(1)),
          tmb: 1620,
          get: 2510
        },
        fotoFrente: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&q=80&w=400",
        fotoLado: "https://images.unsplash.com/photo-1507398941214-572c25f4b1dc?auto=format&fit=crop&q=80&w=400",
        fotoCostas: "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?auto=format&fit=crop&q=80&w=400",
        analiseIA: "📊 **ANÁLISE CORPORAL INTELIGENTE (LINHA BASE)**\n\n• **Biotipo Predominante:** Mesomorfo com boa simetria biacromial.\n• **Postura:** Leve inclinação escapular direita (~0.5cm). Cervical alinhada com grau mínimo de protração.\n• **Evolução:** Nível de gordura subcutânea controlado. Linhas abdominais transversas começando a marcar."
      },
      {
        id: "eval-seeded-2",
        userId: student.id,
        date: "05/2026",
        timestamp: Date.now() - 30 * 24 * 60 * 60 * 1000,
        protocolo: "Jackson & Pollock 3 Dobras",
        dobras: { peitoral: 13, abdomen: 19, coxa: 16 },
        resultados: {
          peso: (student.weight || 68) + 1.8,
          percentualGordura: 15.2,
          percentualMassaMuscular: 43.1,
          massaGorda: parseFloat((((student.weight || 68) + 1.8) * 0.152).toFixed(1)),
          massaMagra: parseFloat((((student.weight || 68) + 1.8) * 0.848).toFixed(1)),
          imc: parseFloat((((student.weight || 68) + 1.8) / Math.pow((student.height || 175) / 100, 2)).toFixed(1)),
          tmb: 1640,
          get: 2542
        },
        fotoFrente: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&q=80&w=400",
        fotoLado: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&q=80&w=400",
        fotoCostas: "https://images.unsplash.com/photo-1507398941214-572c25f4b1dc?auto=format&fit=crop&q=80&w=400",
        analiseIA: "Laudo anterior de referência. Maior retenção em região abdominal e infraumbilical."
      },
      {
        id: "eval-seeded-1",
        userId: student.id,
        date: "04/2026",
        timestamp: Date.now() - 60 * 24 * 60 * 60 * 1000,
        protocolo: "Jackson & Pollock 3 Dobras",
        dobras: { peitoral: 15, abdomen: 21, coxa: 18 },
        resultados: {
          peso: (student.weight || 68) + 3.5,
          percentualGordura: 16.5,
          percentualMassaMuscular: 42.0,
          massaGorda: parseFloat((((student.weight || 68) + 3.5) * 0.165).toFixed(1)),
          massaMagra: parseFloat((((student.weight || 68) + 3.5) * 0.835).toFixed(1)),
          imc: parseFloat((((student.weight || 68) + 3.5) / Math.pow((student.height || 175) / 100, 2)).toFixed(1)),
          tmb: 1660,
          get: 2573
        },
        fotoFrente: "https://images.unsplash.com/photo-1507398941214-572c25f4b1dc?auto=format&fit=crop&q=80&w=400",
        fotoLado: "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?auto=format&fit=crop&q=80&w=400",
        fotoCostas: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&q=80&w=400",
        analiseIA: "Laudo inicial de referência. Baseline de postura e gordura corporal."
      }
    ];
  }

  // Sorting evaluations chronologically (oldest first) for the chart
  const chronologicalEvaluations = useMemo(() => {
    return [...evaluations].sort((a, b) => {
      // Parse dates "MM/YYYY" to sort
      const [mA, yA] = a.date.split("/").map(Number);
      const [mB, yB] = b.date.split("/").map(Number);
      if (yA !== yB) return yA - yB;
      return mA - mB;
    });
  }, [evaluations]);

  // Chart data format
  const chartData = useMemo(() => {
    return chronologicalEvaluations.map(record => ({
      name: record.date,
      "Peso (kg)": record.resultados.peso,
      "Gordura (%)": record.resultados.percentualGordura,
      "Massa Muscular (%)": record.resultados.percentualMassaMuscular
    }));
  }, [chronologicalEvaluations]);

  // Pick evaluations selected for comparison
  const selectedEvalA = useMemo(() => {
    return evaluations.find(e => e.id === monthA) || null;
  }, [evaluations, monthA]);

  const selectedEvalB = useMemo(() => {
    return evaluations.find(e => e.id === monthB) || null;
  }, [evaluations, monthB]);

  // Compute differences between periods
  const comparisonResults = useMemo(() => {
    if (!selectedEvalA || !selectedEvalB) return null;

    const resA = selectedEvalA.resultados;
    const resB = selectedEvalB.resultados;

    // We do B - A (assuming B is chronological newer)
    const deltaWeight = resB.peso - resA.peso;
    const deltaFat = resB.percentualGordura - resA.percentualGordura;
    const deltaMuscle = resB.percentualMassaMuscular - resA.percentualMassaMuscular;
    const deltaImc = resB.imc - resA.imc;

    return {
      weight: {
        valA: resA.peso,
        valB: resB.peso,
        diff: parseFloat(deltaWeight.toFixed(2)),
        isGood: deltaWeight <= 0 // weight loss generally favored or neutral
      },
      fat: {
        valA: resA.percentualGordura,
        valB: resB.percentualGordura,
        diff: parseFloat(deltaFat.toFixed(2)),
        isGood: deltaFat < 0 // reducing fat is positive
      },
      muscle: {
        valA: resA.percentualMassaMuscular,
        valB: resB.percentualMassaMuscular,
        diff: parseFloat(deltaMuscle.toFixed(2)),
        isGood: deltaMuscle > 0 // increasing muscle is positive
      },
      imc: {
        valA: resA.imc,
        valB: resB.imc,
        diff: parseFloat(deltaImc.toFixed(2)),
        isGood: deltaImc <= 0
      }
    };
  }, [selectedEvalA, selectedEvalB]);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `Evolução Física de ${currentStudent.name}`,
        text: `Confira os resultados e laudos físicos atualizados de ${currentStudent.name} no app.`,
        url: window.location.href,
      }).catch(console.error);
    } else {
      alert("A partilha de link foi copiada para sua área de transferência!");
      navigator.clipboard.writeText(window.location.href);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Tab Header */}
      <div className="border-b border-[#3a494b]/20 pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <TrendingUp className="text-amber-400 w-5 h-5" /> Histórico & Evolução Física
          </h3>
          <p className="text-xs text-[#b9cacb] mt-1 font-mono">
            Linha do tempo e análise de composição corporal comparativa mês a mês.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleShare}
            className="bg-black hover:bg-gray-800 text-gray-300 font-bold px-4 py-2 rounded-xl text-xs font-mono uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer border border-gray-800"
          >
            <Share2 className="w-4 h-4" /> Compartilhar
          </button>
        </div>
      </div>

      {/* Grid: Charts and Comparisons */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left column: Timeline vertical structure */}
        <div className="lg:col-span-1 space-y-6">
          <div className="glass-panel p-5 rounded-xl space-y-4">
            <h4 className="font-mono text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-amber-400" /> Linha do Tempo ({chronologicalEvaluations.length} meses)
            </h4>

            {chronologicalEvaluations.length === 0 ? (
              <div className="text-center py-8 text-gray-500 font-mono text-xs uppercase">
                Aguardando avaliações salvas
              </div>
            ) : (
              <div className="relative pl-6 space-y-6 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-gradient-to-b before:from-amber-400 before:via-[#ccff00] before:to-gray-800">
                {chronologicalEvaluations.map((evalItem, index) => (
                  <div key={evalItem.id} className="relative group space-y-2">
                    {/* Circle Node */}
                    <span className="absolute -left-[20px] top-1.5 w-2.5 h-2.5 rounded-full bg-amber-400 border-2 border-black group-hover:scale-125 transition-transform"></span>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-white font-mono uppercase tracking-wider">Mês: {evalItem.date}</span>
                      <span className="text-[9px] bg-gray-950 text-gray-500 font-mono px-2 py-0.5 rounded border border-gray-900">{evalItem.protocolo}</span>
                    </div>

                    <div className="bg-[#121315] p-3 rounded-xl border border-gray-850 space-y-1.5 font-mono text-[10px] text-gray-400">
                      <div className="grid grid-cols-3 gap-1">
                        <div>Peso: <b className="text-white text-xs block">{evalItem.resultados.peso} kg</b></div>
                        <div>Gordura: <b className="text-amber-400 text-xs block">{evalItem.resultados.percentualGordura}%</b></div>
                        <div>Músculo: <b className="text-green-400 text-xs block">{evalItem.resultados.percentualMassaMuscular}%</b></div>
                      </div>
                      <div className="text-[9px] text-gray-600 line-clamp-1 border-t border-gray-950 pt-1 mt-1 font-sans">
                        {evalItem.analiseIA || "Sem laudo postural IA anexado"}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right column: Compare & Interactive Charts */}
        <div className="lg:col-span-2 space-y-6">

          {/* Interactive Month Selector Comparison Panel */}
          <div className="glass-panel p-5 rounded-xl space-y-6">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 border-b border-gray-900 pb-3">
              <h4 className="font-mono text-xs font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
                <GitCompare className="w-4 h-4 text-amber-400 animate-pulse" /> Comparativo Lado a Lado
              </h4>
              
              {/* Dropdowns selectors */}
              <div className="flex items-center gap-2 font-mono text-[11px]">
                <div className="flex items-center gap-1">
                  <span className="text-gray-500">Mês A:</span>
                  <select
                    value={monthA}
                    onChange={e => setMonthA(e.target.value)}
                    className="bg-black border border-gray-850 text-white px-2 py-1 rounded cursor-pointer outline-none text-[11px]"
                  >
                    <option value="">Selecione...</option>
                    {evaluations.map(ev => (
                      <option key={ev.id} value={ev.id}>{ev.date}</option>
                    ))}
                  </select>
                </div>
                <div className="text-gray-600 font-bold">vs</div>
                <div className="flex items-center gap-1">
                  <span className="text-[#00f2ff]">Mês B:</span>
                  <select
                    value={monthB}
                    onChange={e => setMonthB(e.target.value)}
                    className="bg-black border border-gray-850 text-white px-2 py-1 rounded cursor-pointer outline-none text-[11px]"
                  >
                    <option value="">Selecione...</option>
                    {evaluations.map(ev => (
                      <option key={ev.id} value={ev.id}>{ev.date}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {(!selectedEvalA || !selectedEvalB) ? (
              <div className="text-center py-12 text-gray-500 font-mono text-xs uppercase leading-relaxed">
                Selecione duas avaliações nos seletores acima para comparar imagens, métricas corporais e percentual de diferença entre os períodos.
              </div>
            ) : (
              <div className="space-y-6">
                
                {/* Photo Grid Comparison */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Photo Month A */}
                  <div className="bg-[#121315] p-3.5 rounded-xl border border-gray-850 text-center space-y-3">
                    <span className="text-[10px] text-gray-500 uppercase font-bold font-mono block">Antes (Referência {selectedEvalA.date})</span>
                    <div className="grid grid-cols-3 gap-1.5">
                      {selectedEvalA.fotoFrente ? (
                        <div className="aspect-square bg-black rounded-lg overflow-hidden relative">
                          <img src={selectedEvalA.fotoFrente} alt="Frente" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          <span className="absolute bottom-1 right-1 bg-black/60 text-[7px] text-white font-bold font-mono px-1">FRENTE</span>
                        </div>
                      ) : (
                        <div className="aspect-square bg-gray-950 flex items-center justify-center text-[8px] text-gray-600 font-mono">N/A</div>
                      )}
                      {selectedEvalA.fotoLado ? (
                        <div className="aspect-square bg-black rounded-lg overflow-hidden relative">
                          <img src={selectedEvalA.fotoLado} alt="Lado" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          <span className="absolute bottom-1 right-1 bg-black/60 text-[7px] text-white font-bold font-mono px-1">LADO</span>
                        </div>
                      ) : (
                        <div className="aspect-square bg-gray-950 flex items-center justify-center text-[8px] text-gray-600 font-mono">N/A</div>
                      )}
                      {selectedEvalA.fotoCostas ? (
                        <div className="aspect-square bg-black rounded-lg overflow-hidden relative">
                          <img src={selectedEvalA.fotoCostas} alt="Costas" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          <span className="absolute bottom-1 right-1 bg-black/60 text-[7px] text-white font-bold font-mono px-1">COSTAS</span>
                        </div>
                      ) : (
                        <div className="aspect-square bg-gray-950 flex items-center justify-center text-[8px] text-gray-600 font-mono">N/A</div>
                      )}
                    </div>
                  </div>

                  {/* Photo Month B */}
                  <div className="bg-[#121315] p-3.5 rounded-xl border border-gray-850 text-center space-y-3">
                    <span className="text-[10px] text-cyan-400 uppercase font-bold font-mono block">Depois (Resultado {selectedEvalB.date})</span>
                    <div className="grid grid-cols-3 gap-1.5">
                      {selectedEvalB.fotoFrente ? (
                        <div className="aspect-square bg-black rounded-lg overflow-hidden relative">
                          <img src={selectedEvalB.fotoFrente} alt="Frente" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          <span className="absolute bottom-1 right-1 bg-black/60 text-[7px] text-white font-bold font-mono px-1">FRENTE</span>
                        </div>
                      ) : (
                        <div className="aspect-square bg-gray-950 flex items-center justify-center text-[8px] text-gray-600 font-mono">N/A</div>
                      )}
                      {selectedEvalB.fotoLado ? (
                        <div className="aspect-square bg-black rounded-lg overflow-hidden relative">
                          <img src={selectedEvalB.fotoLado} alt="Lado" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          <span className="absolute bottom-1 right-1 bg-black/60 text-[7px] text-white font-bold font-mono px-1">LADO</span>
                        </div>
                      ) : (
                        <div className="aspect-square bg-gray-950 flex items-center justify-center text-[8px] text-gray-600 font-mono">N/A</div>
                      )}
                      {selectedEvalB.fotoCostas ? (
                        <div className="aspect-square bg-black rounded-lg overflow-hidden relative">
                          <img src={selectedEvalB.fotoCostas} alt="Costas" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          <span className="absolute bottom-1 right-1 bg-black/60 text-[7px] text-white font-bold font-mono px-1">COSTAS</span>
                        </div>
                      ) : (
                        <div className="aspect-square bg-gray-950 flex items-center justify-center text-[8px] text-gray-600 font-mono">N/A</div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Numerical Comparison Metrics with deltas */}
                {comparisonResults && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 font-mono text-xs">
                    
                    {/* WEIGHT COMPARISON */}
                    <div className="bg-black/30 p-3 rounded-xl border border-gray-850 space-y-1 text-center">
                      <span className="text-[9px] text-gray-500 uppercase font-bold">Peso Total</span>
                      <div className="flex items-center justify-center gap-1.5 pt-0.5">
                        <span className="text-gray-400">{comparisonResults.weight.valA}</span>
                        <ArrowRight className="w-3 h-3 text-gray-600" />
                        <span className="text-white font-bold">{comparisonResults.weight.valB} kg</span>
                      </div>
                      <div className={`text-[10px] font-bold flex items-center justify-center gap-0.5 pt-1 ${comparisonResults.weight.diff <= 0 ? "text-emerald-400" : "text-amber-500"}`}>
                        {comparisonResults.weight.diff <= 0 ? (
                          <ArrowDownRight className="w-3.5 h-3.5" />
                        ) : (
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        )}
                        <span>{comparisonResults.weight.diff > 0 ? `+${comparisonResults.weight.diff}` : comparisonResults.weight.diff} kg</span>
                      </div>
                    </div>

                    {/* FAT COMPARISON */}
                    <div className="bg-black/30 p-3 rounded-xl border border-gray-850 space-y-1 text-center">
                      <span className="text-[9px] text-gray-500 uppercase font-bold">% Gordura (BF)</span>
                      <div className="flex items-center justify-center gap-1.5 pt-0.5">
                        <span className="text-gray-400">{comparisonResults.fat.valA}%</span>
                        <ArrowRight className="w-3 h-3 text-gray-600" />
                        <span className="text-white font-bold">{comparisonResults.fat.valB}%</span>
                      </div>
                      <div className={`text-[10px] font-bold flex items-center justify-center gap-0.5 pt-1 ${comparisonResults.fat.diff <= 0 ? "text-emerald-400" : "text-red-400"}`}>
                        {comparisonResults.fat.diff <= 0 ? (
                          <ArrowDownRight className="w-3.5 h-3.5" />
                        ) : (
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        )}
                        <span>{comparisonResults.fat.diff > 0 ? `+${comparisonResults.fat.diff}` : comparisonResults.fat.diff} pp</span>
                      </div>
                    </div>

                    {/* MUSCLE COMPARISON */}
                    <div className="bg-black/30 p-3 rounded-xl border border-gray-850 space-y-1 text-center">
                      <span className="text-[9px] text-gray-500 uppercase font-bold">Massa Muscular</span>
                      <div className="flex items-center justify-center gap-1.5 pt-0.5">
                        <span className="text-gray-400">{comparisonResults.muscle.valA}%</span>
                        <ArrowRight className="w-3 h-3 text-gray-600" />
                        <span className="text-white font-bold">{comparisonResults.muscle.valB}%</span>
                      </div>
                      <div className={`text-[10px] font-bold flex items-center justify-center gap-0.5 pt-1 ${comparisonResults.muscle.diff >= 0 ? "text-emerald-400" : "text-amber-500"}`}>
                        {comparisonResults.muscle.diff >= 0 ? (
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        ) : (
                          <ArrowDownRight className="w-3.5 h-3.5" />
                        )}
                        <span>{comparisonResults.muscle.diff > 0 ? `+${comparisonResults.muscle.diff}` : comparisonResults.muscle.diff}%</span>
                      </div>
                    </div>

                    {/* IMC COMPARISON */}
                    <div className="bg-black/30 p-3 rounded-xl border border-gray-850 space-y-1 text-center">
                      <span className="text-[9px] text-gray-500 uppercase font-bold">Índice IMC</span>
                      <div className="flex items-center justify-center gap-1.5 pt-0.5">
                        <span className="text-gray-400">{comparisonResults.imc.valA}</span>
                        <ArrowRight className="w-3 h-3 text-gray-600" />
                        <span className="text-white font-bold">{comparisonResults.imc.valB}</span>
                      </div>
                      <div className={`text-[10px] font-bold flex items-center justify-center gap-0.5 pt-1 ${comparisonResults.imc.diff <= 0 ? "text-emerald-400" : "text-amber-500"}`}>
                        {comparisonResults.imc.diff <= 0 ? (
                          <ArrowDownRight className="w-3.5 h-3.5" />
                        ) : (
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        )}
                        <span>{comparisonResults.imc.diff > 0 ? `+${comparisonResults.imc.diff}` : comparisonResults.imc.diff}</span>
                      </div>
                    </div>

                  </div>
                )}

                {/* Show laudo comparison snippet if B has laudo */}
                {selectedEvalB.analiseIA && (
                  <div className="p-3.5 bg-[#121315] border border-gray-850 rounded-xl space-y-1.5 font-mono text-xs">
                    <span className="text-[10px] text-gray-400 font-bold uppercase block">Laudo Inteligente do Período {selectedEvalB.date}:</span>
                    <p className="text-[10px] text-gray-300 leading-relaxed whitespace-pre-wrap max-h-[140px] overflow-y-auto bg-black/45 p-2 rounded border border-gray-900">
                      {selectedEvalB.analiseIA}
                    </p>
                  </div>
                )}

              </div>
            )}
          </div>

          {/* Interactive Trend charts of Weight, Fat %, Muscle % */}
          {chartData.length > 0 && (
            <div className="glass-panel p-5 rounded-xl space-y-4">
              <h4 className="font-mono text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-amber-400" /> Evolução Histórica (Curva de Progresso)
              </h4>
              
              <div className="h-64 w-full font-mono text-[10px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2a393b" opacity={0.15} />
                    <XAxis dataKey="name" stroke="#b9cacb" />
                    <YAxis yAxisId="left" stroke="#ccff00" />
                    <YAxis yAxisId="right" orientation="right" stroke="#00f2ff" />
                    <Tooltip contentStyle={{ backgroundColor: "#121315", borderColor: "#1f2022", color: "white" }} />
                    <Legend iconType="circle" />
                    <Line yAxisId="left" type="monotone" dataKey="Peso (kg)" stroke="#ccff00" strokeWidth={3} name="Peso (kg)" activeDot={{ r: 8 }} />
                    <Line yAxisId="right" type="monotone" dataKey="Gordura (%)" stroke="#00f2ff" strokeWidth={2.5} name="Gordura (%)" />
                    <Line yAxisId="right" type="monotone" dataKey="Massa Muscular (%)" stroke="#10b981" strokeWidth={2} name="Massa Muscular (%)" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

        </div>

      </div>

      {/* 🔘 Unified Advance to Laudo Button */}
      <div className="pt-6 border-t border-[#3a494b]/20 flex justify-end">
        <button
          type="button"
          onClick={() => {
            if (onAdvance) onAdvance();
          }}
          className="w-full sm:w-auto bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-black font-bold font-mono text-xs uppercase tracking-wider py-3.5 px-8 rounded-xl shadow-[0_0_20px_rgba(245,158,11,0.2)] transition-all flex items-center justify-center gap-2 hover:scale-[1.02] cursor-pointer"
        >
          Avançar para Emitir Laudo <ArrowRight className="w-4 h-4 text-black" />
        </button>
      </div>

    </div>
  );
}
