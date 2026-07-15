import React from "react";
import { 
  User, Sparkles, Check, Brain, Sliders, Activity, Calendar, 
  Plus, Trash2, ArrowUp, ArrowDown, HelpCircle, Info, 
  AlertTriangle, Lightbulb, Send, Lock
} from "lucide-react";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, 
  Legend, ResponsiveContainer, LineChart, Line 
} from "recharts";
import { Macrociclo, Mesociclo, Microciclo, MicroExercise } from "../PeriodizacaoCientifica";

// --- ETAPA 1: IDENTIFICAÇÃO DO ALUNO ---
interface Stage1Props {
  studentName: string;
  studentObjective: string;
  studentLimitations: string;
  studSleep: string;
  studStress: string;
  studAdherence: string;
  activeMesoName?: string;
}

export const Etapa1Identificacao: React.FC<Stage1Props> = ({
  studentName,
  studentObjective,
  studentLimitations,
  studSleep,
  studStress,
  studAdherence,
  activeMesoName
}) => {
  // Dynamic Recovery Score based on lifestyle habits
  const recoveryScore = React.useMemo(() => {
    let score = 80;
    const sleepLower = studSleep.toLowerCase();
    const stressLower = studStress.toLowerCase();
    const adherenceLower = studAdherence.toLowerCase();

    if (sleepLower.includes("restrita") || sleepLower.includes("insônia")) score -= 15;
    if (sleepLower.includes("excelente") || sleepLower.includes("7-8h")) score += 10;
    if (stressLower.includes("elevado") || stressLower.includes("alto")) score -= 10;
    if (adherenceLower.includes("altíssima") || adherenceLower.includes("atleta")) score += 5;

    return Math.min(98, Math.max(40, score));
  }, [studSleep, studStress, studAdherence]);

  return (
    <div className="bg-[#121315] border border-[#3a494b]/20 rounded-xl p-5 space-y-4 shadow-xl" id="stage-1-card">
      <div className="flex items-center justify-between border-b border-[#3a494b]/10 pb-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-500/10 rounded-lg text-indigo-400">
            <User className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-mono font-bold text-indigo-400 uppercase tracking-wider">Etapa 1</span>
            <h3 className="text-sm font-extrabold text-white font-sans tracking-tight">Identificação do Aluno</h3>
          </div>
        </div>
        <span className="px-2.5 py-0.5 rounded-full text-[9px] font-bold font-mono bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
          Sincronizado
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="p-4 bg-[#161719] border border-[#3a494b]/15 rounded-xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-extrabold text-sm uppercase shadow-inner">
            {studentName.split(" ").map(n => n[0]).slice(0, 2).join("")}
          </div>
          <div className="space-y-0.5">
            <h4 className="text-xs font-bold text-white font-sans">{studentName}</h4>
            <span className="text-[10px] text-gray-400 block font-sans">Objetivo: {studentObjective || "Não informado"}</span>
            <span className="inline-flex items-center gap-1.5 text-[9px] text-emerald-400 font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded-md mt-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Ativo
            </span>
          </div>
        </div>

        <div className="p-4 bg-[#161719] border border-[#3a494b]/15 rounded-xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-gray-400 font-mono uppercase font-bold tracking-wider">Score de Recuperação</span>
            <span className={`text-[10px] font-mono font-bold ${recoveryScore > 75 ? 'text-emerald-400' : 'text-amber-400'}`}>
              {recoveryScore}%
            </span>
          </div>
          <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-1000 ${recoveryScore > 75 ? 'bg-emerald-400' : 'bg-amber-400'}`} 
              style={{ width: `${recoveryScore}%` }} 
            />
          </div>
          <span className="text-[9px] text-gray-400 block leading-relaxed font-sans">
            {recoveryScore > 75 
              ? "✓ Alta tolerância a volume. Apto a mesociclos de sobrecarga metabólica." 
              : "⚠ Recuperação moderada. Atenção para não exceder o MRV (Volume Máximo Recuperável)."}
          </span>
        </div>

        <div className="p-4 bg-[#161719] border border-[#3a494b]/15 rounded-xl grid grid-cols-2 gap-2 text-center">
          <div className="p-2 bg-[#121315] border border-[#3a494b]/10 rounded-lg">
            <span className="text-[8px] text-gray-500 font-mono uppercase block">Última Avaliação</span>
            <span className="text-[10px] text-white font-mono font-bold block mt-1">12/06/2026</span>
          </div>
          <div className="p-2 bg-[#121315] border border-[#3a494b]/10 rounded-lg">
            <span className="text-[8px] text-gray-500 font-mono uppercase block">Mesociclo Ativo</span>
            <span className="text-[10px] text-indigo-400 font-mono font-bold block mt-1 truncate">{activeMesoName || "Nenhum"}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- ETAPA 2: DIAGNÓSTICO CLÍNICO ---
interface Stage2Props {
  studHeight: number;
  studWeight: number;
  studFatPercent: number;
  studMuscleMass: number;
  studAvoid: string;
  studPostural: string;
  studHistory: string;
  studRecovery: string;
  studSleep: string;
  studStress: string;
  studAdherence: string;
  clinicalDossier: any;
}

export const Etapa2Diagnostico: React.FC<Stage2Props> = ({
  studHeight,
  studWeight,
  studFatPercent,
  studMuscleMass,
  studAvoid,
  studPostural,
  studHistory,
  studRecovery,
  studSleep,
  studStress,
  studAdherence,
  clinicalDossier
}) => {
  const dossierSections = [
    { label: "Cadastro", value: "Consumido automaticamente em tempo real" },
    { label: "Avaliação Física", value: `${studHeight} cm • ${studWeight} kg • ${studFatPercent}% BF • ${studMuscleMass} kg massa muscular` },
    { label: "Bioimpedância", value: "Aplicada via sincronização contínua do contexto clínico do aluno" },
    { label: "Questionários / PAR-Q", value: `${studSleep} • ${studStress} • ${studAdherence}` },
    { label: "Anamnese", value: `${studHistory} • ${studRecovery}` },
    { label: "Avaliação Postural / Biomecânica", value: studPostural },
    { label: "Relatórios da IA", value: clinicalDossier ? "Painel atualizado automaticamente pelas últimas análises da Engine" : "Aguardando atualização do módulo de IA" }
  ];

  return (
    <div className="bg-[#121315] border border-[#3a494b]/20 rounded-xl p-5 space-y-4 shadow-xl" id="stage-2-card">
      <div className="flex items-center justify-between border-b border-[#3a494b]/10 pb-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-[#00f2ff]/10 rounded-lg text-[#00f2ff]">
            <Activity className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <span className="text-[10px] font-mono font-bold text-[#00f2ff] uppercase tracking-wider">Etapa 2</span>
            <h3 className="text-sm font-extrabold text-white font-sans tracking-tight">Diagnóstico Clínico — Painel de Leitura</h3>
          </div>
        </div>
        <span className="px-2.5 py-0.5 rounded-full text-[9px] font-bold font-mono bg-[#00f2ff]/10 text-[#00f2ff] border border-[#00f2ff]/20">
          Autossincronizado
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-3 bg-[#161719] border border-[#3a494b]/10 rounded-xl">
          <span className="text-[8px] text-gray-500 font-mono uppercase block">Altura</span>
          <span className="text-xs font-mono font-bold text-white mt-1 block">{studHeight} cm</span>
        </div>
        <div className="p-3 bg-[#161719] border border-[#3a494b]/10 rounded-xl">
          <span className="text-[8px] text-gray-500 font-mono uppercase block">Peso Corporal</span>
          <span className="text-xs font-mono font-bold text-white mt-1 block">{studWeight} kg</span>
        </div>
        <div className="p-3 bg-[#161719] border border-[#3a494b]/10 rounded-xl">
          <span className="text-[8px] text-gray-500 font-mono uppercase block">Gordura Corporal</span>
          <span className="text-xs font-mono font-bold text-white mt-1 block">{studFatPercent}% BF</span>
        </div>
        <div className="p-3 bg-[#161719] border border-[#3a494b]/10 rounded-xl">
          <span className="text-[8px] text-gray-500 font-mono uppercase block">Massa Muscular</span>
          <span className="text-xs font-mono font-bold text-white mt-1 block">{studMuscleMass} kg</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 bg-[#161719] border border-[#3a494b]/15 rounded-xl space-y-3">
          <h4 className="text-[10px] font-mono font-bold text-[#00f2ff] uppercase tracking-wider">Restrições & Histórico</h4>
          <div className="space-y-2.5 text-[10px] leading-relaxed">
            <div>
              <span className="text-gray-500 font-mono block">Evitar Exercícios:</span>
              <p className="text-white font-sans mt-0.5 font-medium">{studAvoid}</p>
            </div>
            <div>
              <span className="text-gray-500 font-mono block">Avaliação Postural:</span>
              <p className="text-white font-sans mt-0.5 font-medium">{studPostural}</p>
            </div>
            <div>
              <span className="text-gray-500 font-mono block">Histórico de Cargas:</span>
              <p className="text-white font-sans mt-0.5 font-medium">{studHistory}</p>
            </div>
            <div>
              <span className="text-gray-500 font-mono block">Histórico de Lesões:</span>
              <p className="text-white font-sans mt-0.5 font-medium">{studRecovery}</p>
            </div>
          </div>
        </div>

        <div className="p-4 bg-[#161719] border border-[#3a494b]/15 rounded-xl space-y-3">
          <h4 className="text-[10px] font-mono font-bold text-[#00f2ff] uppercase tracking-wider">Hábitos de Vida & Regeneração</h4>
          <div className="space-y-2.5 text-[10px] leading-relaxed">
            <div>
              <span className="text-gray-500 font-mono block">Qualidade de Sono:</span>
              <p className="text-white font-sans mt-0.5 font-medium">{studSleep}</p>
            </div>
            <div>
              <span className="text-gray-500 font-mono block">Nível de Estresse:</span>
              <p className="text-white font-sans mt-0.5 font-medium">{studStress}</p>
            </div>
            <div>
              <span className="text-gray-500 font-mono block">Aderência Esperada:</span>
              <p className="text-white font-sans mt-0.5 font-medium">{studAdherence}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="border border-[#3a494b]/20 rounded-xl bg-[#0e1012] overflow-hidden">
        <div className="p-4 border-b border-[#3a494b]/15 bg-[#121315]">
          <h4 className="text-[10px] font-mono font-bold text-[#00f2ff] uppercase tracking-wider">Painel de Leitura Clínica</h4>
          <p className="text-[9px] text-gray-500">Todos os campos são consumidos automaticamente a partir dos módulos clínicos, físicos e de IA.</p>
        </div>

        <div className="p-4 space-y-3">
          {dossierSections.map((section) => (
            <div key={section.label} className="p-3 bg-[#121315] border border-[#3a494b]/10 rounded-xl">
              <span className="text-[8px] font-mono font-bold text-[#00f2ff] uppercase tracking-wider block">{section.label}</span>
              <p className="text-[10px] text-gray-300 font-sans mt-1 leading-relaxed">{section.value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// --- ETAPA 3: ESTRATÉGIA DO PROFESSOR ---
interface Stage3Props {
  studFreq: string;
  setStudFreq: (val: string) => void;
  studDuration: string;
  setStudDuration: (val: string) => void;
  modelSelected: string;
  setModelSelected: (val: string) => void;
  onModelChange: (model: string) => void;
  onObjectiveChange: (obj: string) => void;
  macrocicloObjective: string;
  studReferences: string;
  setStudReferences: (val: string) => void;
  studPriorityMuscles: string;
  setStudPriorityMuscles: (val: string) => void;
  studMaintenanceMuscles: string;
  setStudMaintenanceMuscles: (val: string) => void;
  studDivision: string;
  setStudDivision: (val: string) => void;
  studCustomDivisionText: string;
  setStudCustomDivisionText: (val: string) => void;
  onStrategicChange: () => void;
}

export const Etapa3Estrategia: React.FC<Stage3Props> = ({
  studFreq,
  setStudFreq,
  studDuration,
  setStudDuration,
  modelSelected,
  setModelSelected,
  onModelChange,
  onObjectiveChange,
  macrocicloObjective,
  studReferences,
  setStudReferences,
  studPriorityMuscles,
  setStudPriorityMuscles,
  studMaintenanceMuscles,
  setStudMaintenanceMuscles,
  studDivision,
  setStudDivision,
  studCustomDivisionText,
  setStudCustomDivisionText,
  onStrategicChange
}) => {
  const handleFreqSelect = (freq: string) => {
    setStudFreq(freq);
    let divisionSuggestion = studDivision;
    if (freq.includes("3")) divisionSuggestion = "📐 ABC Tradicional";
    else if (freq.includes("4")) divisionSuggestion = "⚖️ Superior / Inferior";
    else if (freq.includes("5")) divisionSuggestion = "⚡ ABCD Especialização";
    else if (freq.includes("6")) divisionSuggestion = "⚡ ABCDE Avançado";
    setStudDivision(divisionSuggestion);
    onStrategicChange();
  };

  const models = ["Periodização Linear", "Ondulatória Semanal", "Periodização Reversa", "Blocos (Acumulação/Intensificação)"];
  const divisions = [
    "📐 ABC Tradicional", "⚖️ Superior / Inferior", "⚡ ABCD Especialização", 
    "⚡ ABCDE Avançado", "🌍 Corpo Inteiro", "🔁 Empurrar / Puxar / Pernas", 
    "🏆 Arnold Split", "🛠️ Personalizada"
  ];

  return (
    <div className="bg-[#121315] border border-amber-500/20 rounded-xl p-5 space-y-4 shadow-xl" id="stage-3-card">
      <div className="flex items-center justify-between border-b border-[#3a494b]/10 pb-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-amber-500/10 rounded-lg text-amber-400">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-wider">Etapa 3</span>
            <h3 className="text-sm font-extrabold text-white font-sans tracking-tight">Estratégia do Professor (Tomada de Decisão)</h3>
          </div>
        </div>
        <span className="px-2.5 py-0.5 rounded-full text-[9px] font-bold font-mono bg-amber-500/10 text-amber-400 border border-amber-500/20">
          Configurável
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Left Side Inputs */}
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-gray-400 text-[10px] font-mono uppercase font-bold tracking-wider">Frequência Semanal</label>
            <div className="grid grid-cols-4 gap-2">
              {["3 dias", "4 dias", "5 dias", "6 dias"].map(f => (
                <button
                  key={f}
                  onClick={() => handleFreqSelect(f + " por semana")}
                  className={`py-2 rounded-lg text-[10px] font-mono font-bold transition-all border cursor-pointer ${
                    studFreq.startsWith(f)
                      ? "bg-amber-500/20 border-amber-500 text-amber-400 shadow-md"
                      : "bg-[#161719] border-[#3a494b]/15 text-gray-400 hover:text-white"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-gray-400 text-[10px] font-mono uppercase font-bold tracking-wider">Tempo por Sessão</label>
              <select
                value={studDuration}
                onChange={(e) => { setStudDuration(e.target.value); onStrategicChange(); }}
                className="w-full bg-[#161719] border border-[#3a494b]/15 focus:border-amber-500 text-white p-2.5 rounded-lg text-xs font-sans outline-none cursor-pointer"
              >
                <option value="45 minutos">45 Minutos</option>
                <option value="60 minutos">60 Minutos</option>
                <option value="90 minutos">90 Minutos</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-gray-400 text-[10px] font-mono uppercase font-bold tracking-wider">Modelo de Periodização</label>
              <select
                value={modelSelected}
                onChange={(e) => { onModelChange(e.target.value); onStrategicChange(); }}
                className="w-full bg-[#161719] border border-[#3a494b]/15 focus:border-amber-500 text-white p-2.5 rounded-lg text-xs font-sans outline-none cursor-pointer"
              >
                {models.map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-gray-400 text-[10px] font-mono uppercase font-bold tracking-wider">Objetivo Geral do Macrociclo</label>
            <input
              type="text"
              value={macrocicloObjective}
              onChange={(e) => onObjectiveChange(e.target.value)}
              placeholder="Ex: Hipertrofia Miofibrilar e Força Dinâmica"
              className="w-full bg-[#161719] border border-[#3a494b]/15 focus:border-amber-500 text-white p-2.5 rounded-lg text-xs font-sans outline-none"
            />
          </div>
        </div>

        {/* Right Side Inputs */}
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-gray-400 text-[10px] font-mono uppercase font-bold tracking-wider">Referências Metodológicas</label>
            <select
              value={studReferences}
              onChange={(e) => { setStudReferences(e.target.value); onStrategicChange(); }}
              className="w-full bg-[#161719] border border-[#3a494b]/15 focus:border-amber-500 text-white p-2.5 rounded-lg text-xs font-sans outline-none cursor-pointer"
            >
              <option value="Diretrizes de Brad Schoenfeld (2020), Mike Israetel (MEV/MRV)">Diretrizes Brad Schoenfeld (2020) & Israetel (MEV/MRV)</option>
              <option value="Periodização de Tudor Bompa (Força/Hipertrofia)">Periodização de Tudor Bompa (Força/Hipertrofia)</option>
              <option value="Método de Poliquin (Acumulação/Intensificação)">Método de Poliquin (Acumulação/Intensificação)</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-gray-400 text-[10px] font-mono uppercase font-bold tracking-wider">Músculos Foco (Prioridade)</label>
              <input
                type="text"
                value={studPriorityMuscles}
                onChange={(e) => { setStudPriorityMuscles(e.target.value); onStrategicChange(); }}
                className="w-full bg-[#161719] border border-[#3a494b]/15 focus:border-amber-500 text-white p-2.5 rounded-lg text-xs font-sans outline-none"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-gray-400 text-[10px] font-mono uppercase font-bold tracking-wider">Músculos Manutenção</label>
              <input
                type="text"
                value={studMaintenanceMuscles}
                onChange={(e) => { setStudMaintenanceMuscles(e.target.value); onStrategicChange(); }}
                className="w-full bg-[#161719] border border-[#3a494b]/15 focus:border-amber-500 text-white p-2.5 rounded-lg text-xs font-sans outline-none"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-gray-400 text-[10px] font-mono uppercase font-bold tracking-wider">Divisão de Treino Sugerida</label>
            <select
              value={studDivision}
              onChange={(e) => { setStudDivision(e.target.value); onStrategicChange(); }}
              className="w-full bg-[#161719] border border-[#3a494b]/15 focus:border-amber-500 text-white p-2.5 rounded-lg text-xs font-sans outline-none cursor-pointer"
            >
              {divisions.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          {studDivision === "🛠️ Personalizada" && (
            <div className="space-y-1.5 animate-fade-in">
              <textarea
                value={studCustomDivisionText}
                onChange={(e) => { setStudCustomDivisionText(e.target.value); onStrategicChange(); }}
                rows={2}
                placeholder="Ex: Dia A: Costas/Bíceps, Dia B: Peito/Ombros..."
                className="w-full bg-[#161719] border border-[#3a494b]/15 focus:border-amber-500 text-white p-2 rounded-lg text-xs font-sans outline-none resize-none"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// --- ETAPA 4: PLANEJAMENTO AUTOMÁTICO (CURVAS DE CARGA) ---
interface Stage4Props {
  chartData: any[];
  modelSelected: string;
  onResetModel: () => void;
}

export const Etapa4Planejamento: React.FC<Stage4Props> = ({
  chartData,
  modelSelected,
  onResetModel
}) => {
  return (
    <div className="bg-[#121315] border border-blue-500/20 rounded-xl p-5 space-y-4 shadow-xl" id="stage-4-card">
      <div className="flex items-center justify-between border-b border-[#3a494b]/10 pb-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-500/10 rounded-lg text-blue-400">
            <Brain className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <span className="text-[10px] font-mono font-bold text-blue-400 uppercase tracking-wider">Etapa 4</span>
            <h3 className="text-sm font-extrabold text-white font-sans tracking-tight">Planejamento Científico (Parâmetros da Engine)</h3>
          </div>
        </div>
        <button
          onClick={onResetModel}
          className="px-2.5 py-1 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 text-blue-400 rounded-lg text-[9px] font-mono font-bold uppercase transition-all cursor-pointer"
        >
          Regerar Base
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
        <div className="p-3 bg-[#161719] border border-[#3a494b]/10 rounded-xl">
          <span className="text-[8px] text-gray-500 font-mono uppercase block">Modelo Ativo</span>
          <span className="text-[11px] font-mono font-bold text-white mt-1 block truncate">{modelSelected}</span>
        </div>
        <div className="p-3 bg-[#161719] border border-[#3a494b]/10 rounded-xl">
          <span className="text-[8px] text-gray-500 font-mono uppercase block">Tempo Total</span>
          <span className="text-[11px] font-mono font-bold text-blue-400 mt-1 block">{chartData.length} Semanas</span>
        </div>
        <div className="p-3 bg-[#161719] border border-[#3a494b]/10 rounded-xl">
          <span className="text-[8px] text-gray-500 font-mono uppercase block">Intensidade Média</span>
          <span className="text-[11px] font-mono font-bold text-white mt-1 block">75-85% 1RM</span>
        </div>
        <div className="p-3 bg-[#161719] border border-[#3a494b]/10 rounded-xl">
          <span className="text-[8px] text-gray-500 font-mono uppercase block">Regeneração (Deload)</span>
          <span className="text-[11px] font-mono font-bold text-emerald-400 mt-1 block">1 Semana Injetada</span>
        </div>
      </div>

      {/* Recharts Area Curve */}
      <div className="bg-[#161719] border border-[#3a494b]/10 rounded-xl p-4">
        <h4 className="text-[10px] font-mono font-bold text-blue-400 uppercase tracking-wider mb-3">Curva Teórica de Fadiga vs Recuperação vs Carga</h4>
        <div className="h-44 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
              <defs>
                <linearGradient id="colorVol" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00f2ff" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#00f2ff" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorFad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ec4899" stopOpacity={0.15}/>
                  <stop offset="95%" stopColor="#ec4899" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#242c2d" />
              <XAxis dataKey="semana" stroke="#5a6c6e" fontSize={9} />
              <YAxis stroke="#5a6c6e" fontSize={9} />
              <Tooltip contentStyle={{ backgroundColor: "#121315", borderColor: "#3a494b", fontSize: 9 }} />
              <Legend wrapperStyle={{ fontSize: 9, pt: 10 }} />
              <Area type="monotone" dataKey="volume" stroke="#00f2ff" fillOpacity={1} fill="url(#colorVol)" name="Volume (Séries)" strokeWidth={2} />
              <Area type="monotone" dataKey="fadiga" stroke="#ec4899" fillOpacity={1} fill="url(#colorFad)" name="Fadiga Fisiológica" />
              <Line type="monotone" dataKey="recuperacao" stroke="#10b981" strokeWidth={1.5} name="Capacidade Recuperativa" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

// --- ETAPA 5: TIMELINE DA PERIODIZAÇÃO ---
interface Stage5Props {
  mesociclos: Mesociclo[];
  activeMesoIdx: number;
  setActiveMesoIdx: (idx: number) => void;
  activeMesoWeeks: Microciclo[];
  activeWeekIdx: number;
  setActiveWeekIdx: (idx: number) => void;
  handleUpdateMeso: (idx: number, fields: Partial<Mesociclo>) => void;
  handleUpdateMicro: (weekIdx: number, fields: Partial<Microciclo>) => void;
  onStrategicChange: () => void;
  studDuration: string;
  setStudDuration: (val: string) => void;
  modelSelected: string;
  onModelChange: (model: string) => void;
  studReferences: string;
  setStudReferences: (val: string) => void;
  studDivision: string;
  setStudDivision: (val: string) => void;
  studCustomDivisionText?: string;
  setStudCustomDivisionText?: (val: string) => void;
}

export const Etapa5Timeline: React.FC<Stage5Props> = ({
  mesociclos,
  activeMesoIdx,
  setActiveMesoIdx,
  activeMesoWeeks,
  activeWeekIdx,
  setActiveWeekIdx,
  handleUpdateMeso,
  handleUpdateMicro,
  onStrategicChange,
  studDuration,
  setStudDuration,
  modelSelected,
  onModelChange,
  studReferences,
  setStudReferences,
  studDivision,
  setStudDivision,
  studCustomDivisionText = "",
  setStudCustomDivisionText
}) => {
  const activeMeso = mesociclos[activeMesoIdx] || null;
  const currentWeek = activeMesoWeeks[activeWeekIdx] || null;

  return (
    <div className="bg-[#121315] border border-indigo-500/20 rounded-xl p-5 space-y-4 shadow-xl" id="stage-5-card">
      <div className="flex items-center justify-between border-b border-[#3a494b]/10 pb-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-500/10 rounded-lg text-indigo-400">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-mono font-bold text-indigo-400 uppercase tracking-wider">Etapa 5</span>
            <h3 className="text-sm font-extrabold text-white font-sans tracking-tight">Timeline da Periodização (Estrutura de Fases)</h3>
          </div>
        </div>
      </div>

      {/* Parâmetros do Planejamento - Editáveis diretamente no Timeline */}
      <div className="bg-[#161719] border border-[#3a494b]/15 p-4 rounded-xl space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-1 border-b border-[#3a494b]/10 pb-2">
          <div className="flex items-center gap-2">
            <span className="text-[9px] font-mono font-bold text-amber-400 uppercase tracking-wider bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/10">
              ⚙️ Parâmetros do Planejamento
            </span>
          </div>
          <span className="text-[10px] text-gray-400 font-sans">
            Altere os parâmetros básicos para recalcular dinamicamente a periodização científica.
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-1">
          {/* Tempo por Sessão */}
          <div className="space-y-1">
            <label className="block text-gray-400 text-[9px] font-mono uppercase font-bold tracking-wider">Tempo por Sessão</label>
            <select
              value={studDuration}
              onChange={(e) => { setStudDuration(e.target.value); onStrategicChange(); }}
              className="w-full bg-[#121315] border border-[#3a494b]/15 focus:border-indigo-500 text-white p-2 rounded-lg text-xs font-sans outline-none cursor-pointer transition-colors"
            >
              <option value="45 minutos">45 Minutos</option>
              <option value="60 minutos">60 Minutos</option>
              <option value="90 minutos">90 Minutos</option>
            </select>
          </div>

          {/* Modelo de Periodização */}
          <div className="space-y-1">
            <label className="block text-gray-400 text-[9px] font-mono uppercase font-bold tracking-wider">Modelo de Periodização</label>
            <select
              value={modelSelected}
              onChange={(e) => { onModelChange(e.target.value); onStrategicChange(); }}
              className="w-full bg-[#121315] border border-[#3a494b]/15 focus:border-indigo-500 text-white p-2 rounded-lg text-xs font-sans outline-none cursor-pointer transition-colors"
            >
              <option value="Periodização Linear">Periodização Linear</option>
              <option value="Ondulatória Semanal">Ondulatória Semanal</option>
              <option value="Periodização Reversa">Periodização Reversa</option>
              <option value="Blocos (Acumulação/Intensificação)">Blocos (Acumulação/Intensificação)</option>
            </select>
          </div>

          {/* Diretrizes Metodológicas */}
          <div className="space-y-1">
            <label className="block text-gray-400 text-[9px] font-mono uppercase font-bold tracking-wider">Diretrizes Metodológicas</label>
            <select
              value={studReferences}
              onChange={(e) => { setStudReferences(e.target.value); onStrategicChange(); }}
              className="w-full bg-[#121315] border border-[#3a494b]/15 focus:border-indigo-500 text-white p-2 rounded-lg text-xs font-sans outline-none cursor-pointer transition-colors"
            >
              <option value="Diretrizes de Brad Schoenfeld (2020), Mike Israetel (MEV/MRV)">Diretrizes Brad Schoenfeld (2020) & Israetel (MEV/MRV)</option>
              <option value="Periodização de Tudor Bompa (Força/Hipertrofia)">Periodização de Tudor Bompa (Força/Hipertrofia)</option>
              <option value="Método de Poliquin (Acumulação/Intensificação)">Método de Poliquin (Acumulação/Intensificação)</option>
            </select>
          </div>

          {/* Divisão de Treino Sugerida */}
          <div className="space-y-1">
            <label className="block text-gray-400 text-[9px] font-mono uppercase font-bold tracking-wider">Divisão de Treino</label>
            <select
              value={studDivision}
              onChange={(e) => { setStudDivision(e.target.value); onStrategicChange(); }}
              className="w-full bg-[#121315] border border-[#3a494b]/15 focus:border-indigo-500 text-white p-2 rounded-lg text-xs font-sans outline-none cursor-pointer transition-colors"
            >
              <option value="📐 ABC Tradicional">📐 ABC Tradicional</option>
              <option value="⚖️ Superior / Inferior">⚖️ Superior / Inferior</option>
              <option value="⚡ ABCD Especialização">⚡ ABCD Especialização</option>
              <option value="⚡ ABCDE Avançado">⚡ ABCDE Avançado</option>
              <option value="🌍 Corpo Inteiro">🌍 Corpo Inteiro</option>
              <option value="🔁 Empurrar / Puxar / Pernas">🔁 Empurrar / Puxar / Pernas</option>
              <option value="🏆 Arnold Split">🏆 Arnold Split</option>
              <option value="🛠️ Personalizada">🛠️ Personalizada</option>
            </select>
          </div>
        </div>

        {studDivision === "🛠️ Personalizada" && setStudCustomDivisionText && (
          <div className="space-y-1.5 pt-2 border-t border-[#3a494b]/10 animate-fade-in">
            <label className="block text-gray-400 text-[9px] font-mono uppercase font-bold tracking-wider">Detalhamento da Divisão Personalizada</label>
            <textarea
              value={studCustomDivisionText}
              onChange={(e) => { setStudCustomDivisionText(e.target.value); onStrategicChange(); }}
              rows={2}
              placeholder="Ex: Dia A: Costas/Bíceps, Dia B: Peito/Ombros..."
              className="w-full bg-[#121315] border border-[#3a494b]/15 focus:border-indigo-500 text-white p-2.5 rounded-lg text-xs font-sans outline-none resize-none transition-colors"
            />
          </div>
        )}
      </div>

      {/* Mesociclo blocks */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {mesociclos.map((meso, idx) => (
          <div
            key={meso.id}
            onClick={() => { setActiveMesoIdx(idx); setActiveWeekIdx(0); }}
            className={`p-3.5 rounded-xl border transition-all cursor-pointer space-y-2 ${
              activeMesoIdx === idx
                ? "bg-indigo-500/10 border-indigo-500/50 shadow-md shadow-indigo-500/5"
                : "bg-[#161719] border-[#3a494b]/10 hover:border-[#3a494b]/30"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-mono font-bold text-gray-500">MESO {idx + 1}</span>
              <span className="text-[8px] font-mono text-indigo-400 font-bold bg-indigo-500/10 px-1.5 py-0.5 rounded-md">
                {meso.weeks} semanas
              </span>
            </div>
            <div>
              <h4 className="text-[11px] font-extrabold text-white truncate">{meso.name}</h4>
              <span className="text-[9px] text-gray-400 truncate block mt-0.5">{meso.objective}</span>
              {meso.estrategias && (
                <span className="text-[8.5px] text-amber-400/90 font-mono block mt-1 leading-tight truncate bg-amber-500/5 px-1 py-0.5 rounded border border-amber-500/10">
                  ⚡ {meso.estrategias}
                </span>
              )}
            </div>
            <div className="pt-1.5 border-t border-[#3a494b]/10 flex items-center justify-between gap-1 text-[8px] font-mono text-gray-500">
              <span>Vol: {meso.volumePlanejado}</span>
              <span>Intensidade: {meso.intensidadeMedia}%</span>
            </div>
          </div>
        ))}
      </div>

      {/* Week Selector row */}
      {activeMeso && (
        <div className="bg-[#161719] p-4 border border-[#3a494b]/10 rounded-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#3a494b]/10 pb-2.5 gap-2">
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-mono font-bold text-indigo-400 uppercase tracking-wider bg-indigo-500/10 px-2 py-0.5 rounded">
                {activeMeso.name}
              </span>
              <span className="text-[10px] text-gray-400 font-sans">Navegue pelas semanas:</span>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-[8px] text-gray-500 font-mono uppercase whitespace-nowrap">Estratégias / Técnicas:</span>
              <input
                type="text"
                value={activeMeso.estrategias || ""}
                onChange={(e) => {
                  handleUpdateMeso(activeMesoIdx, { estrategias: e.target.value });
                  onStrategicChange();
                }}
                placeholder="Ex: Progressão de carga, Drop-set, Rest-Pause"
                className="bg-[#121315] border border-[#3a494b]/20 hover:border-indigo-500/30 focus:border-indigo-500 text-[10px] text-white px-2 py-1 rounded outline-none w-full sm:w-64 transition-all font-sans"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {activeMesoWeeks.map((week, idx) => (
              <button
                key={week.weekIndex}
                onClick={() => setActiveWeekIdx(idx)}
                className={`px-3 py-2 rounded-xl text-[10px] font-mono font-extrabold flex flex-col items-center min-w-16 transition-all border cursor-pointer ${
                  activeWeekIdx === idx
                    ? "bg-indigo-500/20 border-indigo-500 text-indigo-300"
                    : "bg-[#121315] border-[#3a494b]/10 text-gray-500 hover:text-white"
                }`}
              >
                <span>S{week.weekIndex}</span>
                <span className="text-[7.5px] font-mono text-gray-500 mt-0.5">Vol: {week.weeklyVolume}</span>
              </button>
            ))}
          </div>

          {currentWeek && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
              <div className="space-y-3.5">
                <div className="grid grid-cols-2 gap-3 text-[10px]">
                  <div className="bg-[#121315] p-2.5 rounded-lg border border-[#3a494b]/10 space-y-1">
                    <span className="text-gray-500 font-mono text-[8px] uppercase block">Meta de Volume (Séries)</span>
                    <input
                      type="number"
                      value={currentWeek.weeklyVolume === 0 ? "" : currentWeek.weeklyVolume}
                      onChange={(e) => {
                        const val = e.target.value === "" ? 0 : parseInt(e.target.value);
                        handleUpdateMicro(currentWeek.weekIndex, { weeklyVolume: isNaN(val) ? 0 : val });
                        onStrategicChange();
                      }}
                      className="w-full bg-[#161719] border border-[#3a494b]/10 text-white font-mono p-1 rounded outline-none"
                    />
                  </div>
                  <div className="bg-[#121315] p-2.5 rounded-lg border border-[#3a494b]/10 space-y-1">
                    <span className="text-gray-500 font-mono text-[8px] uppercase block">Fadiga Fisiológica</span>
                    <input
                      type="number"
                      value={currentWeek.fatigue === 0 ? "" : currentWeek.fatigue}
                      onChange={(e) => {
                        const val = e.target.value === "" ? 0 : parseInt(e.target.value);
                        handleUpdateMicro(currentWeek.weekIndex, { fatigue: isNaN(val) ? 0 : val });
                        onStrategicChange();
                      }}
                      className="w-full bg-[#161719] border border-[#3a494b]/10 text-white font-mono p-1 rounded outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <span className="text-[8px] text-gray-500 font-mono uppercase block">Notas Fisiológicas da Semana</span>
                <textarea
                  value={currentWeek.notes || ""}
                  onChange={(e) => {
                    handleUpdateMicro(currentWeek.weekIndex, { notes: e.target.value });
                    onStrategicChange();
                  }}
                  rows={2}
                  className="w-full bg-[#121315] border border-[#3a494b]/10 text-xs text-white p-2.5 rounded-lg outline-none resize-none font-sans"
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// --- ETAPA 6: AI PERIODIZATION COPILOT ---
interface Stage6Props {
  onTriggerAI: (type: "suggest" | "adjust_limitations" | "plateau" | "fatigue" | "custom") => void;
  isAiGenerating: boolean;
  aiPrompt: string;
  setAiPrompt: (val: string) => void;
  aiResponse: string;
  copilotSummary: string;
}

export const Etapa6Copilot: React.FC<Stage6Props> = ({
  onTriggerAI,
  isAiGenerating,
  aiPrompt,
  setAiPrompt,
  aiResponse,
  copilotSummary
}) => {
  return (
    <div className="bg-gradient-to-br from-[#121820] to-[#161d26] border border-[#00f2ff]/30 rounded-xl p-5 space-y-4 shadow-xl animate-fade-in" id="stage-6-card">
      <div className="flex items-center justify-between border-b border-[#00f2ff]/10 pb-2.5">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-[#00f2ff] animate-pulse" />
          <div>
            <span className="text-[10px] font-mono font-bold text-[#00f2ff] uppercase tracking-wider">Etapa 6</span>
            <h3 className="text-sm font-extrabold text-white font-sans tracking-tight">AI Periodization Copilot (Consultor Clínico)</h3>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <span className="text-[9px] font-mono text-gray-400 block uppercase font-bold tracking-wider">Atalhos de Consulta Inteligente</span>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => onTriggerAI("suggest")}
            disabled={isAiGenerating}
            className="px-2.5 py-1.5 bg-[#161719] border border-[#3a494b]/20 hover:border-[#00f2ff]/30 text-white hover:text-[#00f2ff] text-[9.5px] font-mono rounded-lg transition-all flex items-center gap-1 cursor-pointer"
          >
            <Lightbulb className="w-3 h-3 text-[#00f2ff]" /> Por que este modelo?
          </button>
          <button
            onClick={() => onTriggerAI("adjust_limitations")}
            disabled={isAiGenerating}
            className="px-2.5 py-1.5 bg-[#161719] border border-[#3a494b]/20 hover:border-[#00f2ff]/30 text-white hover:text-[#00f2ff] text-[9.5px] font-mono rounded-lg transition-all flex items-center gap-1 cursor-pointer"
          >
            <AlertTriangle className="w-3 h-3 text-[#00f2ff]" /> Quais os riscos biomecânicos?
          </button>
          <button
            onClick={() => onTriggerAI("fatigue")}
            disabled={isAiGenerating}
            className="px-2.5 py-1.5 bg-[#161719] border border-[#3a494b]/20 hover:border-[#00f2ff]/30 text-white hover:text-[#00f2ff] text-[9.5px] font-mono rounded-lg transition-all flex items-center gap-1 cursor-pointer"
          >
            <Info className="w-3 h-3 text-[#00f2ff]" /> Justificar Deload
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <div className="rounded-xl border border-[#00f2ff]/20 bg-[#0e1012] p-3 text-[10px] text-gray-300 font-sans leading-relaxed">
          <span className="text-[9px] font-mono font-bold text-[#00f2ff] uppercase tracking-wider block mb-1">Função do Copilot</span>
          {copilotSummary || "O Copilot explica as decisões da Engine Central sem assumir a prescrição. Ele atua como consultor técnico e auditor clínico."}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
            placeholder="Pergunte ao Copilot (Ex: Explique a distribuição de volume semanal...)"
            className="flex-1 bg-[#121315] border border-[#3a494b]/30 focus:border-[#00f2ff] text-xs text-white px-3 py-2 rounded-lg outline-none"
          />
          <button
            onClick={() => onTriggerAI("custom")}
            disabled={isAiGenerating || !aiPrompt.trim()}
            className="px-4 py-2 bg-gradient-to-r from-[#00f2ff] to-cyan-500 text-black font-extrabold text-xs font-mono uppercase tracking-wider rounded-lg transition-all flex items-center gap-1 cursor-pointer disabled:opacity-40"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {isAiGenerating && (
        <div className="p-4 bg-[#121315] border border-[#00f2ff]/10 rounded-xl text-center space-y-2">
          <div className="w-5 h-5 border-2 border-t-[#00f2ff] border-[#00f2ff]/20 rounded-full animate-spin mx-auto" />
          <span className="text-[10px] text-gray-400 font-mono block">AI Copilot analisando biometria e restrições biomecânicas...</span>
        </div>
      )}

      {aiResponse && !isAiGenerating && (
        <div className="p-4 bg-[#0e1012] border border-[#00f2ff]/20 rounded-xl space-y-3 shadow-inner">
          <div className="flex items-center justify-between border-b border-[#00f2ff]/10 pb-1.5">
            <span className="text-[9px] font-mono text-[#00f2ff] font-bold">TreinoPro Copilot AI</span>
            <span className="text-[8px] font-mono text-gray-500">Respondido em tempo real</span>
          </div>
          <div className="text-[10px] text-gray-300 font-sans leading-relaxed whitespace-pre-wrap">
            {aiResponse}
          </div>
        </div>
      )}
    </div>
  );
};

// --- ETAPA 7: AUDITORIA DE SEGURANÇA CIENTÍFICA ---
interface Stage7Props {
  studAvoid: string;
  studSleep: string;
  studStress: string;
  activeMesoWeeks: Microciclo[];
  activeWeekIdx: number;
  isAuditApproved: boolean;
  setIsAuditApproved: (val: boolean) => void;
  auditLog: string[];
  onAutoHeal: () => void;
}

export const Etapa7Auditoria: React.FC<Stage7Props> = ({
  studAvoid,
  studSleep,
  studStress,
  activeMesoWeeks,
  activeWeekIdx,
  isAuditApproved,
  setIsAuditApproved,
  auditLog,
  onAutoHeal
}) => {
  const currentWeek = activeMesoWeeks[activeWeekIdx] || null;

  // Real-time calculated checks
  const runChecks = React.useMemo(() => {
    const checks = {
      volumeSafe: true,
      avoidanceSafe: true,
      recoverySafe: true,
      equipmentSafe: true,
      warnings: [] as string[]
    };

    if (currentWeek) {
      // 1. Volume guidelines (Mike Israetel)
      if (currentWeek.weeklyVolume < 8) {
        checks.volumeSafe = false;
        checks.warnings.push("Volume semanal abaixo de 8 séries (estímulo de MEV insuficiente para sinalização anabólica).");
      } else if (currentWeek.weeklyVolume > 24) {
        checks.volumeSafe = false;
        checks.warnings.push("Volume semanal ultrapassa 24 séries (pode colidir com o MRV e induzir exaustão crônica).");
      } else if (currentWeek.weeklyVolume >= 16) {
        checks.warnings.push(`Recomendação de Intensidade (${currentWeek.weeklyVolume} séries): Para volumes elevados (≥16 séries), é indicado o uso estratégico de Técnicas Avançadas (ex: Drop-sets, Rest-Pause, Myo-reps) para densificar o treino sem estender excessivamente o tempo da sessão. Garanta amplitude total (Full ROM) e cadência excêntrica controlada (3-4s) para otimizar a hipertrofia mediada pelo estiramento muscular (Stretched-Mediated Hypertrophy).`);
      }

      // 2. Avoidance collision scanner
      const avoidList = studAvoid.toLowerCase();
      const hasAvoidTerms = avoidList && avoidList !== "nenhuma" && !avoidList.includes("sem contraindicações");
      
      if (hasAvoidTerms && currentWeek.exercises) {
        const avoids = avoidList.split(",").map(t => t.trim());
        currentWeek.exercises.forEach(ex => {
          const nameLower = ex.name.toLowerCase();
          avoids.forEach(t => {
            if (t.length > 3 && nameLower.includes(t)) {
              checks.avoidanceSafe = false;
              checks.warnings.push(`Incoerência Clínica: O exercício "${ex.name}" infringe a contraindicação de evitar "${t}".`);
            }
          });
          // Common postural risks (Spinal loading/compression axial)
          const spineRisk = avoidList.includes("axial") || avoidList.includes("coluna") || avoidList.includes("lombar") || avoidList.includes("hernia");
          if (spineRisk && (nameLower.includes("agachamento costas") || nameLower.includes("agachamento livre") || nameLower.includes("levantamento terra"))) {
            checks.avoidanceSafe = false;
            checks.warnings.push(`Risco de Compressão: Exercício "${ex.name}" oferece forças de compressão axial desaconselhadas.`);
          }
        });
      }

      // 3. Recovery balance (sleep vs fatigue)
      const sleepRestricted = studSleep.toLowerCase().includes("restrita") || studSleep.toLowerCase().includes("insônia");
      const stressHigh = studStress.toLowerCase().includes("elevado") || studStress.toLowerCase().includes("alto");
      if ((sleepRestricted || stressHigh) && currentWeek.weeklyVolume > 16) {
        checks.recoverySafe = false;
        checks.warnings.push(`Sobrecarga no SNC: Volume elevado (${currentWeek.weeklyVolume} séries) em cenário de sono restrito ou estresse elevado.`);
      }
    }

    return checks;
  }, [currentWeek, studAvoid, studSleep, studStress]);

  const allClear = runChecks.volumeSafe && runChecks.avoidanceSafe && runChecks.recoverySafe;

  return (
    <div className={`bg-[#121315] border rounded-xl p-5 space-y-4 shadow-xl transition-all ${isAuditApproved ? 'border-emerald-500/30' : 'border-red-500/20 bg-red-500/5'}`} id="stage-7-card">
      <div className="flex items-center justify-between border-b border-[#3a494b]/10 pb-3">
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-lg ${isAuditApproved ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
            <AlertTriangle className={`w-5 h-5 ${!isAuditApproved ? 'animate-bounce' : ''}`} />
          </div>
          <div>
            <span className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-wider">Etapa 7</span>
            <h3 className="text-sm font-extrabold text-white font-sans tracking-tight">Validação e Auditoria Fisiológica (Análise Crítica)</h3>
          </div>
        </div>
        <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold font-mono border ${
          isAuditApproved 
            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" 
            : "bg-red-500/10 text-red-400 border-red-500/20"
        }`}>
          {isAuditApproved ? "APROVADA" : "PENDENTE DE REVISÃO"}
        </span>
      </div>

      <div className="space-y-3.5">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="p-3 bg-[#161719] border border-[#3a494b]/10 rounded-xl flex items-center justify-between">
            <span className="text-[10px] text-gray-400 font-sans">1. Volume MEV/MRV</span>
            <span className={`text-[10px] font-mono font-bold ${runChecks.volumeSafe ? 'text-emerald-400' : 'text-amber-400'}`}>
              {runChecks.volumeSafe ? "✓ Conforme" : "⚠ Crítico"}
            </span>
          </div>
          <div className="p-3 bg-[#161719] border border-[#3a494b]/10 rounded-xl flex items-center justify-between">
            <span className="text-[10px] text-gray-400 font-sans">2. Contraindicações</span>
            <span className={`text-[10px] font-mono font-bold ${runChecks.avoidanceSafe ? 'text-emerald-400' : 'text-amber-400'}`}>
              {runChecks.avoidanceSafe ? "✓ Sem Conflitos" : "⚠ Conflito de IA"}
            </span>
          </div>
          <div className="p-3 bg-[#161719] border border-[#3a494b]/10 rounded-xl flex items-center justify-between">
            <span className="text-[10px] text-gray-400 font-sans">3. Janela de Recuperação</span>
            <span className={`text-[10px] font-mono font-bold ${runChecks.recoverySafe ? 'text-emerald-400' : 'text-amber-400'}`}>
              {runChecks.recoverySafe ? "✓ Equilibrada" : "⚠ Sobrecarga SNC"}
            </span>
          </div>
        </div>

        {/* Warnings List */}
        {runChecks.warnings.length > 0 && (
          <div className="p-3.5 bg-amber-500/5 border border-amber-500/20 rounded-xl space-y-1.5">
            <span className="text-[9px] font-mono font-bold text-amber-500 uppercase tracking-wider block">Incoerências Clínicas Detectadas:</span>
            <ul className="space-y-1 text-[9.5px] text-gray-300 font-sans list-disc pl-4 leading-relaxed">
              {runChecks.warnings.map((w, idx) => (
                <li key={idx} className="marker:text-amber-500">{w}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Audit Log / Applied Actions */}
        {auditLog.length > 0 && (
          <div className="p-3.5 bg-emerald-500/5 border border-emerald-500/20 rounded-xl space-y-1.5">
            <span className="text-[9px] font-mono font-bold text-emerald-400 uppercase tracking-wider block">Ações Preventivas Aplicadas (Healed Logs):</span>
            <ul className="space-y-1 text-[9.5px] text-gray-300 font-sans list-disc pl-4 leading-relaxed">
              {auditLog.map((log, idx) => (
                <li key={idx} className="marker:text-emerald-400">{log}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-2">
          {!allClear && (
            <button
              onClick={onAutoHeal}
              className="w-full sm:w-auto px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-[10.5px] font-mono uppercase rounded-lg transition-all shadow-md cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Sliders className="w-3.5 h-3.5" /> Corrigir Automaticamente (Auto-Heal)
            </button>
          )}

          <button
            onClick={() => setIsAuditApproved(true)}
            className={`w-full sm:w-auto px-4 py-2 text-black font-extrabold text-[10.5px] font-mono uppercase rounded-lg transition-all shadow-md cursor-pointer flex items-center justify-center gap-1.5 ${
              isAuditApproved 
                ? "bg-emerald-500/20 border border-emerald-500 text-emerald-400 hover:bg-emerald-500 hover:text-black" 
                : "bg-[#10b981] hover:bg-emerald-400"
            }`}
          >
            <Check className="w-3.5 h-3.5" /> {isAuditApproved ? "Auditoria Aprovada ✓" : "Aprovar Auditoria de Carga"}
          </button>
        </div>
      </div>
    </div>
  );
};

// --- ETAPA 8: CONSTRUÇÃO DOS TREINOS (EXERCISE BUILDER) ---
interface Stage8Props {
  isAuditApproved: boolean;
  activeMesoWeeks: Microciclo[];
  activeWeekIdx: number;
  activeDayTab: string;
  setActiveDayTab: (day: string) => void;
  onAddExercise: () => void;
  onDeleteExercise: (idx: number) => void;
  onUpdateExercise: (idx: number, fields: Partial<MicroExercise>) => void;
  onGenerateWorkoutWithAI?: () => void;
  isGeneratingWorkoutWithAI?: boolean;
}

export const Etapa8Construcao: React.FC<Stage8Props> = ({
  isAuditApproved,
  activeMesoWeeks,
  activeWeekIdx,
  activeDayTab,
  setActiveDayTab,
  onAddExercise,
  onDeleteExercise,
  onUpdateExercise,
  onGenerateWorkoutWithAI,
  isGeneratingWorkoutWithAI
}) => {
  const currentWeek = activeMesoWeeks[activeWeekIdx] || null;
  const dayTabs = ["Treino A", "Treino B", "Treino C", "Treino D", "Treino E"];

  if (!isAuditApproved) {
    return (
      <div className="bg-[#121315]/80 border border-[#3a494b]/20 rounded-xl p-10 text-center space-y-4 shadow-xl relative overflow-hidden" id="stage-8-card-locked">
        <div className="absolute inset-0 bg-[#0e1012]/40 backdrop-blur-sm flex flex-col items-center justify-center p-6">
          <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-full animate-pulse mb-3">
            <Lock className="w-8 h-8" />
          </div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-white">🔒 Montagem de Treinos Bloqueada</h3>
          <p className="text-xs text-gray-500 mt-2 max-w-sm leading-relaxed">
            Por favor, execute e aprove a **Auditoria de Segurança Científica (Etapa 7)** acima para garantir que a distribuição de volume e a biomecânica estejam seguras antes de liberar o editor detalhado.
          </p>
        </div>
        <div className="opacity-10 space-y-4 filter blur-[2px]">
          <div className="h-10 bg-gray-700 rounded" />
          <div className="h-32 bg-gray-700 rounded" />
        </div>
      </div>
    );
  }

  const allExs = currentWeek?.exercises || [];
  const exercisesForDay = allExs.filter(ex => ex.day === activeDayTab);

  return (
    <div className="bg-[#121315] border border-emerald-500/30 rounded-xl p-5 space-y-5 shadow-xl animate-fade-in" id="stage-8-card">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-[#3a494b]/10 pb-3 gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-500/10 rounded-lg text-emerald-400">
            <Check className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-wider">Etapa 8</span>
            <h3 className="text-sm font-extrabold text-white font-sans tracking-tight">Prescrição e Construção dos Treinos (Habilitado)</h3>
          </div>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          {onGenerateWorkoutWithAI && (
            <button
              onClick={onGenerateWorkoutWithAI}
              disabled={isGeneratingWorkoutWithAI}
              className="px-3 py-1.5 bg-gradient-to-r from-[#00f2ff]/10 to-emerald-500/10 hover:from-[#00f2ff]/20 hover:to-emerald-500/20 border border-emerald-500/40 text-emerald-400 rounded-lg text-[10px] font-mono font-bold uppercase transition-all cursor-pointer flex items-center gap-1.5 shadow-[0_0_15px_rgba(16,185,129,0.1)] disabled:opacity-50 shrink-0"
            >
              <Sparkles className={`w-3.5 h-3.5 text-emerald-400 ${isGeneratingWorkoutWithAI ? "animate-spin" : ""}`} />
              {isGeneratingWorkoutWithAI ? "Gerando..." : "Gerar por IA"}
            </button>
          )}
          <button
            onClick={onAddExercise}
            className="px-3 py-1.5 bg-[#10b981]/10 hover:bg-[#10b981]/20 border border-[#10b981]/30 text-[#10b981] rounded-lg text-[10px] font-mono font-bold uppercase transition-all cursor-pointer flex items-center gap-1 whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5" /> Adicionar Exercício
          </button>
        </div>
      </div>

      {/* Day Selector Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none border-b border-[#3a494b]/10">
        {dayTabs.map(day => {
          const count = allExs.filter(ex => ex.day === day).length;
          return (
            <button
              key={day}
              onClick={() => setActiveDayTab(day)}
              className={`px-4 py-2 rounded-xl text-[10.5px] font-mono font-bold whitespace-nowrap transition-all border cursor-pointer ${
                activeDayTab === day
                  ? "bg-[#10b981]/10 border-[#10b981]/40 text-[#10b981]"
                  : "bg-transparent border-transparent text-gray-500 hover:text-white"
              }`}
            >
              {day} <span className="ml-1 text-[8px] font-mono bg-[#161719] px-1.5 py-0.5 rounded-full text-gray-400">{count}</span>
            </button>
          );
        })}
      </div>

      {/* Exercise list */}
      <div className="space-y-3">
        {exercisesForDay.length > 0 ? (
          exercisesForDay.map((ex, idx) => {
            // Find its index in the master array
            const masterIdx = allExs.findIndex(item => item === ex);
            return (
              <div key={idx} className="p-4 bg-[#161719] border border-[#3a494b]/15 rounded-xl space-y-3 shadow-inner">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-3 w-full">
                    <input
                      type="text"
                      value={ex.name}
                      onChange={(e) => onUpdateExercise(masterIdx, { name: e.target.value })}
                      placeholder="Nome do Exercício"
                      className="bg-[#121315] border border-[#3a494b]/15 text-xs text-white p-2 rounded-lg outline-none"
                    />
                    <select
                      value={ex.muscleGroup}
                      onChange={(e) => onUpdateExercise(masterIdx, { muscleGroup: e.target.value })}
                      className="bg-[#121315] border border-[#3a494b]/15 text-xs text-white p-2 rounded-lg outline-none cursor-pointer"
                    >
                      {["Peitoral", "Costas", "Quadríceps", "Isquiotibiais", "Deltoides", "Bíceps", "Tríceps", "Panturrilhas", "Abdômen"].map(m => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                    <select
                      value={ex.day || "Treino A"}
                      onChange={(e) => onUpdateExercise(masterIdx, { day: e.target.value })}
                      className="bg-[#121315] border border-[#3a494b]/15 text-xs text-white p-2 rounded-lg outline-none cursor-pointer"
                    >
                      {dayTabs.map(d => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>
                  <button
                    onClick={() => onDeleteExercise(masterIdx)}
                    className="p-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 rounded-lg shrink-0 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  <div className="space-y-1 text-[9px] font-mono text-gray-500">
                    <span>Séries</span>
                    <input
                      type="number"
                      value={ex.sets}
                      onChange={(e) => onUpdateExercise(masterIdx, { sets: parseInt(e.target.value) || 3 })}
                      className="w-full bg-[#121315] border border-[#3a494b]/10 text-white font-mono p-1.5 rounded outline-none text-xs"
                    />
                  </div>
                  <div className="space-y-1 text-[9px] font-mono text-gray-500">
                    <span>Reps</span>
                    <input
                      type="text"
                      value={ex.reps}
                      onChange={(e) => onUpdateExercise(masterIdx, { reps: e.target.value })}
                      className="w-full bg-[#121315] border border-[#3a494b]/10 text-white font-mono p-1.5 rounded outline-none text-xs"
                    />
                  </div>
                  <div className="space-y-1 text-[9px] font-mono text-gray-500">
                    <span>Carga (kg)</span>
                    <input
                      type="number"
                      value={ex.load}
                      onChange={(e) => onUpdateExercise(masterIdx, { load: parseInt(e.target.value) || 0 })}
                      className="w-full bg-[#121315] border border-[#3a494b]/10 text-white font-mono p-1.5 rounded outline-none text-xs"
                    />
                  </div>
                  <div className="space-y-1 text-[9px] font-mono text-gray-500">
                    <span>RPE / RIR</span>
                    <div className="flex gap-1.5">
                      <input
                        type="number"
                        value={ex.rpe}
                        onChange={(e) => onUpdateExercise(masterIdx, { rpe: parseInt(e.target.value) || 8 })}
                        placeholder="RPE"
                        className="w-1/2 bg-[#121315] border border-[#3a494b]/10 text-white font-mono p-1.5 rounded outline-none text-xs text-center"
                      />
                      <input
                        type="number"
                        value={ex.rir}
                        onChange={(e) => onUpdateExercise(masterIdx, { rir: parseInt(e.target.value) || 2 })}
                        placeholder="RIR"
                        className="w-1/2 bg-[#121315] border border-[#3a494b]/10 text-white font-mono p-1.5 rounded outline-none text-xs text-center"
                      />
                    </div>
                  </div>
                  <div className="space-y-1 text-[9px] font-mono text-gray-500 col-span-2 sm:col-span-1">
                    <span>Intervalo</span>
                    <input
                      type="text"
                      value={ex.rest}
                      onChange={(e) => onUpdateExercise(masterIdx, { rest: e.target.value })}
                      className="w-full bg-[#121315] border border-[#3a494b]/10 text-white font-mono p-1.5 rounded outline-none text-xs"
                    />
                  </div>
                </div>

                <div className="space-y-1 text-[9px] font-mono text-gray-500">
                  <span>Instruções Fisiológicas do Exercício</span>
                  <input
                    type="text"
                    value={ex.notes || ""}
                    onChange={(e) => onUpdateExercise(masterIdx, { notes: e.target.value })}
                    className="w-full bg-[#121315] border border-[#3a494b]/10 text-xs text-white p-2 rounded-lg outline-none font-sans"
                  />
                </div>
              </div>
            );
          })
        ) : (
          <div className="p-6 text-center bg-[#161719] border border-dashed border-[#3a494b]/20 rounded-xl text-gray-500 text-xs font-sans">
            Nenhum exercício registrado para o {activeDayTab} neste microciclo. Clique em "+ Adicionar Exercício" acima para cadastrar.
          </div>
        )}
      </div>
    </div>
  );
};
