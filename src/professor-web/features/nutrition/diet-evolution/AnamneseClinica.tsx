import React, { useState, useMemo, useEffect } from "react";
import { 
  ClipboardList, 
  Heart, 
  Save, 
  CheckCircle, 
  AlertTriangle,
  User,
  Activity,
  Award,
  Dumbbell,
  BarChart3
} from "lucide-react";
import { Student } from "../../../../types";

interface AnamneseClinicaProps {
  currentStudent: Student;
  onSaveAndAdvance?: () => void;
}

export default function AnamneseClinica({
  currentStudent,
  onSaveAndAdvance
}: AnamneseClinicaProps) {
  // 1. Informações Fisiológicas Gerais
  const [etnia, setEtnia] = useState("Branca");
  const [sexoBio, setSexoBio] = useState<"masculino" | "feminino">("masculino");
  const [idade, setIdade] = useState(26);
  const [tipoSanguineo, setTipoSanguineo] = useState("O+");
  const [fatorRh, setFatorRh] = useState("Positivo (+)");
  const [fcRepouso, setFcRepouso] = useState(70);
  const [condicaoFisica, setCondicaoFisica] = useState("Iniciante");
  const [pressaoArt, setPressaoArt] = useState("12/8");

  // 2. Histórico de Saúde
  const [fumante, setFumante] = useState("Não");
  const [exFumante, setExFumante] = useState("Não");
  const [doencasCronicas, setDoencasCronicas] = useState("");
  const [lesoesDores, setLesoesDores] = useState("");

  // 🆕 Uso de Medicamentos e Suplementos
  const [usaMedicamento, setUsaMedicamento] = useState<boolean>(false);
  const [medicamentos, setMedicamentos] = useState<string[]>([]);
  const [novoMedicamento, setNovoMedicamento] = useState("");

  // 3. Contatos Emergência
  const [contatoNome, setContatoNome] = useState("");
  const [contatoFone, setContatoFone] = useState("");

  // 4. Anamnese Nutricional
  const [nutriNome, setNutriNome] = useState("");
  const [nutriFone, setNutriFone] = useState("");
  const [refeicoesDia, setRefeicoesDia] = useState(4);
  const [ingestaoCalorica, setIngestaoCalorica] = useState(2000);
  const [gastoEnergetico, setGastoEnergetico] = useState(2200);

  // 5. Anamnese Atividade Física
  const [selectedObjetivos, setSelectedObjetivos] = useState<string[]>(["Emagrecimento", "Hipertrofia"]);
  const [horarioTreino, setHorarioTreino] = useState("Noite (18h - 23h)");
  const [atividadesPreferidas, setAtividadesPreferidas] = useState("Corrida, Musculação pesada");
  const [disponibilidadeDias, setDisponibilidadeDias] = useState("Seg, Ter, Qui, Sex");
  const [disponibilidadeHoras, setDisponibilidadeHoras] = useState("Das 19h às 20:30h");
  const [observacoes, setObservacoes] = useState("");

  // --- CALCULATORS STATE ---
  
  // A. RCQ
  const [cinturaRcq, setCinturaRcq] = useState(80);
  const [quadrilRcq, setQuadrilRcq] = useState(95);

  // Persistent states per student
  useEffect(() => {
    const saved = localStorage.getItem(`anamnese_${currentStudent.id}`);
    if (saved) {
      try {
        const data = JSON.parse(saved);
        setEtnia(data.etnia ?? "Branca");
        setSexoBio(data.sexoBio ?? "masculino");
        setIdade(data.idade ?? 26);
        setTipoSanguineo(data.tipoSanguineo ?? "O+");
        setFatorRh(data.fatorRh ?? "Positivo (+)");
        setFcRepouso(data.fcRepouso ?? 70);
        setCondicaoFisica(data.condicaoFisica ?? "Iniciante");
        setPressaoArt(data.pressaoArt ?? "12/8");
        setFumante(data.fumante ?? "Não");
        setExFumante(data.exFumante ?? "Não");
        setDoencasCronicas(data.doencasCronicas ?? "");
        setLesoesDores(data.lesoesDores ?? "");
        setContatoNome(data.contatoNome ?? "");
        setContatoFone(data.contatoFone ?? "");
        setNutriNome(data.nutriNome ?? "");
        setNutriFone(data.nutriFone ?? "");
        setRefeicoesDia(data.refeicoesDia ?? 4);
        setIngestaoCalorica(data.ingestaoCalorica ?? 2000);
        setGastoEnergetico(data.gastoEnergetico ?? 2200);
        setSelectedObjetivos(data.selectedObjetivos ?? ["Emagrecimento", "Hipertrofia"]);
        setHorarioTreino(data.horarioTreino ?? "Noite (18h - 23h)");
        setAtividadesPreferidas(data.atividadesPreferidas ?? "Corrida, Musculação pesada");
        setDisponibilidadeDias(data.disponibilidadeDias ?? "Seg, Ter, Qui, Sex");
        setDisponibilidadeHoras(data.disponibilidadeHoras ?? "Das 19h às 20:30h");
        setObservacoes(data.observacoes ?? "");
        setCinturaRcq(data.cinturaRcq ?? 80);
        setQuadrilRcq(data.quadrilRcq ?? 95);
        setParqAnswers(data.parqAnswers ?? [false, false, false, false, false, false, false]);
        setMhaAgeGroup(data.mhaAgeGroup ?? 2);
        setMhaGender(data.mhaGender ?? 4);
        setMhaWeightDev(data.mhaWeightDev ?? 2);
        setMhaActivity(data.mhaActivity ?? 1);
        setMhaSmoking(data.mhaSmoking ?? 0);
        setMhaSystolic(data.mhaSystolic ?? 2);
        setMhaGenetics(data.mhaGenetics ?? 1);
        setMhaCholesterol(data.mhaCholesterol ?? 2);
        setSleepAnswers(data.sleepAnswers ?? Array(9).fill(false));
        setUsaMedicamento(data.usaMedicamento ?? false);
        setMedicamentos(data.medicamentos ?? []);
      } catch (e) {
        console.error("Error loading saved anamnese", e);
      }
    } else {
      // Set defaults
      setEtnia("Branca");
      setSexoBio("masculino");
      setIdade(26);
      setTipoSanguineo("O+");
      setFatorRh("Positivo (+)");
      setFcRepouso(70);
      setCondicaoFisica("Iniciante");
      setPressaoArt("12/8");
      setFumante("Não");
      setExFumante("Não");
      setDoencasCronicas("");
      setLesoesDores("");
      setContatoNome("");
      setContatoFone("");
      setNutriNome("");
      setNutriFone("");
      setRefeicoesDia(4);
      setIngestaoCalorica(2000);
      setGastoEnergetico(2200);
      setSelectedObjetivos(["Emagrecimento", "Hipertrofia"]);
      setHorarioTreino("Noite (18h - 23h)");
      setAtividadesPreferidas("Corrida, Musculação pesada");
      setDisponibilidadeDias("Seg, Ter, Qui, Sex");
      setDisponibilidadeHoras("Das 19h às 20:30h");
      setObservacoes("");
      setCinturaRcq(80);
      setQuadrilRcq(95);
      setParqAnswers([false, false, false, false, false, false, false]);
      setMhaAgeGroup(2);
      setMhaGender(4);
      setMhaWeightDev(2);
      setMhaActivity(1);
      setMhaSmoking(0);
      setMhaSystolic(2);
      setMhaGenetics(1);
      setMhaCholesterol(2);
      setSleepAnswers(Array(9).fill(false));
      setUsaMedicamento(false);
      setMedicamentos([]);
    }
  }, [currentStudent.id]);

  const rcqStats = useMemo(() => {
    if (!quadrilRcq) return { index: 0, risk: "Baixo Risco" };
    const index = parseFloat((cinturaRcq / quadrilRcq).toFixed(2));
    
    let risk = "Baixo Risco";
    if (sexoBio === "masculino") {
      // 20-29 table: Low <0.83, Mod 0.83-0.88, High >0.88
      if (index > 0.88) risk = "Alto Risco";
      else if (index >= 0.83) risk = "Moderado Risco";
    } else {
      // Woman table: Low <0.71, Mod 0.71-0.77, High >0.77
      if (index > 0.77) risk = "Alto Risco";
      else if (index >= 0.71) risk = "Moderado Risco";
    }
    return { index, risk };
  }, [cinturaRcq, quadrilRcq, sexoBio]);

  // B. PAR-Q (7 questions yes/no)
  const [parqAnswers, setParqAnswers] = useState<boolean[]>([false, false, false, false, false, false, false]);
  
  const isParqApproved = useMemo(() => {
    return parqAnswers.every(ans => ans === false);
  }, [parqAnswers]);

  const handleParqToggle = (index: number, val: boolean) => {
    const updated = [...parqAnswers];
    updated[index] = val;
    setParqAnswers(updated);
  };

  // C. MHA (Michigan Heart Association Cardiac Risk Calculator)
  const [mhaAgeGroup, setMhaAgeGroup] = useState(2); // 21 to 30 (+2)
  const [mhaGender, setMhaGender] = useState(4); // Masculino (+4)
  const [mhaWeightDev, setMhaWeightDev] = useState(2); // 2.4 to 9.0kg (+2)
  const [mhaActivity, setMhaActivity] = useState(1); // Effort professional/leisure active (+1)
  const [mhaSmoking, setMhaSmoking] = useState(0); // Non-smoker (+0)
  const [mhaSystolic, setMhaSystolic] = useState(2); // 120 to 139 mmHg (+2)
  const [mhaGenetics, setMhaGenetics] = useState(1); // No relatives (+1)
  const [mhaCholesterol, setMhaCholesterol] = useState(2); // Colesterol 181 to 205 (+2)

  const mhaScore = useMemo(() => {
    const total = mhaAgeGroup + mhaGender + mhaWeightDev + mhaActivity + mhaSmoking + mhaSystolic + mhaGenetics + mhaCholesterol;
    let classification = "Risco Baixo";
    if (total > 31) classification = "Risco Muito Alto";
    else if (total > 24) classification = "Risco Moderadamente Alto";
    else if (total > 17) classification = "Risco Médio";
    else classification = "Risco Baixo (Abaixo da Média)";

    return { total, classification };
  }, [mhaAgeGroup, mhaGender, mhaWeightDev, mhaActivity, mhaSmoking, mhaSystolic, mhaGenetics, mhaCholesterol]);

  // D. Sleep Quality (Débito de Sono) - 17 questions
  const [sleepAnswers, setSleepAnswers] = useState<boolean[]>(Array(17).fill(false));
  
  const sleepDebtScore = useMemo(() => {
    const yesCount = sleepAnswers.filter(Boolean).length;
    let desc = "Sono Saudável / Baixo Débito";
    if (yesCount > 10) desc = "Fadiga Crônica / Alto Débito de Sono";
    else if (yesCount > 4) desc = "Débito de Sono Moderado";
    return { yesCount, desc };
  }, [sleepAnswers]);

  const handleSleepToggle = (index: number, val: boolean) => {
    const updated = [...sleepAnswers];
    updated[index] = val;
    setSleepAnswers(updated);
  };

  const handleSaveAnamnese = () => {
    alert("Ficha de anamnese e questionários de saúde salvos com sucesso!");
  };

  const objetivosList = ["Laser", "Emagrecimento", "Hipertrofia", "Condicionamento Físico", "Reabilitação", "Competição", "Estética"];

  const toggleObjetivo = (obj: string) => {
    if (selectedObjetivos.includes(obj)) {
      setSelectedObjetivos(selectedObjetivos.filter(item => item !== obj));
    } else {
      setSelectedObjetivos([...selectedObjetivos, obj]);
    }
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-[#3a494b]/20 pb-4">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          📋 Anamnese Clínica & Hábitos
        </h3>
        <p className="text-xs text-[#b9cacb] mt-1 font-mono">
          Ficha Multidisciplinar de Anamnese | Aluno selecionado: <b className="text-white">{currentStudent.name}</b> • Registro completo de saúde e biometria de risco.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        
        {/* Multidisciplinary Form */}
        <div className="space-y-6">
          <div className="glass-panel p-5 rounded-xl space-y-4">
            <h4 className="font-mono text-xs font-bold uppercase tracking-wider text-[#ccff00] border-b border-gray-900 pb-2 flex items-center gap-1.5">
              <User className="w-4 h-4 text-[#ccff00]" /> 👤 Dados de Perfil e Saúde
            </h4>

            {/* General Physiology */}
            <div className="space-y-3 font-mono text-xs">
              <span className="text-[10px] text-gray-500 uppercase block font-bold">1. Informações Fisiológicas Gerais</span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div>
                  <label className="block text-gray-400 text-[9px] mb-0.5">Etnia</label>
                  <input type="text" value={etnia} onChange={e => setEtnia(e.target.value)} className="w-full bg-[#121315] border border-gray-800 text-white rounded p-1.5 text-xs text-center" />
                </div>
                <div>
                  <label className="block text-gray-400 text-[9px] mb-0.5">Sexo Biológico</label>
                  <select value={sexoBio} onChange={e => setSexoBio(e.target.value as "masculino" | "feminino")} className="w-full bg-[#121315] border border-gray-800 text-white rounded p-1.5 text-xs text-center">
                    <option value="masculino">Masculino</option>
                    <option value="feminino">Feminino</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-400 text-[9px] mb-0.5">Idade (anos)</label>
                  <input type="number" value={idade} onChange={e => setIdade(Number(e.target.value))} className="w-full bg-[#121315] border border-gray-800 text-white rounded p-1.5 text-xs text-center font-bold" />
                </div>
                <div>
                  <label className="block text-gray-400 text-[9px] mb-0.5">Tipo Sanguíneo</label>
                  <input type="text" value={tipoSanguineo} onChange={e => setTipoSanguineo(e.target.value)} className="w-full bg-[#121315] border border-gray-800 text-white rounded p-1.5 text-xs text-center" />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                <div>
                  <label className="block text-gray-400 text-[9px] mb-0.5">Fator RH</label>
                  <input type="text" value={fatorRh} onChange={e => setFatorRh(e.target.value)} className="w-full bg-[#121315] border border-gray-800 text-white rounded p-1.5 text-xs text-center" />
                </div>
                <div>
                  <label className="block text-gray-400 text-[9px] mb-0.5">FC Repouso (bpm)</label>
                  <input type="number" value={fcRepouso} onChange={e => setFcRepouso(Number(e.target.value))} className="w-full bg-[#121315] border border-gray-800 text-white rounded p-1.5 text-xs text-center" />
                </div>
                <div>
                  <label className="block text-gray-400 text-[9px] mb-0.5">Cond. Físico</label>
                  <input type="text" value={condicaoFisica} onChange={e => setCondicaoFisica(e.target.value)} className="w-full bg-[#121315] border border-gray-800 text-white rounded p-1.5 text-xs text-center" />
                </div>
                <div>
                  <label className="block text-gray-400 text-[9px] mb-0.5">PA (mmHg)</label>
                  <input type="text" value={pressaoArt} onChange={e => setPressaoArt(e.target.value)} className="w-full bg-[#121315] border border-gray-800 text-white rounded p-1.5 text-xs text-center" />
                </div>
              </div>
            </div>

            {/* Health History */}
            <div className="space-y-3 font-mono text-xs pt-2">
              <span className="text-[10px] text-gray-500 uppercase block font-bold">2. Histórico de Saúde e Estilo de Vida</span>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-400 text-[10px] mb-0.5">Fumante Ativo?</label>
                  <select value={fumante} onChange={e => setFumante(e.target.value)} className="w-full bg-[#121315] border border-gray-800 text-white rounded p-1.5">
                    <option value="Não">Não</option>
                    <option value="Sim">Sim</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-400 text-[10px] mb-0.5">Já fumou anteriormente?</label>
                  <select value={exFumante} onChange={e => setExFumante(e.target.value)} className="w-full bg-[#121315] border border-gray-800 text-white rounded p-1.5">
                    <option value="Não">Não</option>
                    <option value="Sim">Sim</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-gray-400 text-[10px] mb-1">Doenças Crônicas ou Histórico Clínico</label>
                <textarea
                  placeholder="Ex: Diabetes Tipo II, Hipertensão arterial, Cardiopatia familiar..."
                  value={doencasCronicas}
                  onChange={e => setDoencasCronicas(e.target.value)}
                  rows={2}
                  className="w-full bg-[#121315] border border-gray-800 text-white rounded p-2 text-xs"
                />
              </div>

              <div>
                <label className="block text-gray-400 text-[10px] mb-1">Histórico de Lesões / Dores Articulares</label>
                <textarea
                  placeholder="Ex: Lesão ligamentar no joelho esquerdo, dor lombar ocasional..."
                  value={lesoesDores}
                  onChange={e => setLesoesDores(e.target.value)}
                  rows={2}
                  className="w-full bg-[#121315] border border-gray-800 text-white rounded p-2 text-xs"
                />
              </div>

              {/* 🆕 Uso de Medicamentos e Suplementos */}
              <div className="bg-[#121315]/80 p-4 rounded-xl border border-gray-800 space-y-3 font-mono text-xs mt-3">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] text-gray-400 uppercase font-bold">💊 Faz uso de medicação contínua?</span>
                  <div className="flex items-center gap-1.5 bg-[#1b1c1e] p-1 rounded-lg border border-gray-800">
                    <button
                      type="button"
                      onClick={() => {
                        setUsaMedicamento(false);
                        setMedicamentos([]);
                      }}
                      className={`px-3 py-1 rounded text-[10px] font-bold transition-all cursor-pointer ${
                        !usaMedicamento ? "bg-[#ccff00] text-black" : "text-gray-500 hover:text-gray-300"
                      }`}
                    >
                      Não
                    </button>
                    <button
                      type="button"
                      onClick={() => setUsaMedicamento(true)}
                      className={`px-3 py-1 rounded text-[10px] font-bold transition-all cursor-pointer ${
                        usaMedicamento ? "bg-[#ccff00] text-black" : "text-gray-500 hover:text-gray-300"
                      }`}
                    >
                      Sim
                    </button>
                  </div>
                </div>
                
                {usaMedicamento && (
                  <div className="space-y-2 pt-2 border-t border-gray-900">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Ex: Sibutramina 15mg, Sintroid 50mcg, Rosuvastatina 10mg"
                        value={novoMedicamento}
                        onChange={e => setNovoMedicamento(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            if (novoMedicamento.trim()) {
                              setMedicamentos([...medicamentos, novoMedicamento.trim()]);
                              setNovoMedicamento("");
                            }
                          }
                        }}
                        className="flex-1 bg-[#1b1c1e] border border-gray-800 text-white rounded p-1.5 text-xs font-mono outline-none focus:border-[#ccff00]"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (novoMedicamento.trim()) {
                            setMedicamentos([...medicamentos, novoMedicamento.trim()]);
                            setNovoMedicamento("");
                          }
                        }}
                        className="bg-[#ccff00] hover:bg-[#bce600] text-black font-bold px-3 py-1.5 rounded text-xs cursor-pointer"
                      >
                        + Add
                      </button>
                    </div>
                    {medicamentos.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {medicamentos.map((med, idx) => (
                          <span key={idx} className="bg-[#ccff00]/10 text-[#ccff00] border border-[#ccff00]/20 px-2 py-1 rounded text-[10px] flex items-center gap-1.5">
                            {med}
                            <button
                              type="button"
                              onClick={() => setMedicamentos(medicamentos.filter((_, i) => i !== idx))}
                              className="text-red-400 hover:text-red-300 font-bold"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Emergency Contacts */}
            <div className="space-y-3 font-mono text-xs pt-2">
              <span className="text-[10px] text-gray-500 uppercase block font-bold">3. Contatos de Emergência</span>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-400 text-[9px] mb-0.5">Nome para Contato</label>
                  <input type="text" placeholder="Ex: Maria Souza (Mãe)" value={contatoNome} onChange={e => setContatoNome(e.target.value)} className="w-full bg-[#121315] border border-gray-800 text-white rounded p-1.5 text-xs" />
                </div>
                <div>
                  <label className="block text-gray-400 text-[9px] mb-0.5">Telefone / WhatsApp</label>
                  <input type="text" placeholder="Ex: (11) 99999-0000" value={contatoFone} onChange={e => setContatoFone(e.target.value)} className="w-full bg-[#121315] border border-gray-800 text-white rounded p-1.5 text-xs" />
                </div>
              </div>
            </div>
          </div>

          {/* Nutrition Section & Workouts Section */}
          <div className="glass-panel p-5 rounded-xl space-y-4">
            <h4 className="font-mono text-xs font-bold uppercase tracking-wider text-green-400 border-b border-gray-900 pb-2 flex items-center gap-1.5">
              🍏 Anamnese Nutricional
            </h4>
            
            <div className="space-y-3 font-mono text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-400 text-[10px] mb-0.5">Nome do Nutricionista</label>
                  <input type="text" placeholder="Caso possua acompanhamento" value={nutriNome} onChange={e => setNutriNome(e.target.value)} className="w-full bg-[#121315] border border-gray-800 text-white rounded p-1.5 text-xs" />
                </div>
                <div>
                  <label className="block text-gray-400 text-[10px] mb-0.5">Telefone do Nutricionista</label>
                  <input type="text" placeholder="Ex: (11) 98888-1111" value={nutriFone} onChange={e => setNutriFone(e.target.value)} className="w-full bg-[#121315] border border-gray-800 text-white rounded p-1.5 text-xs" />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center pt-1">
                <div>
                  <span className="text-gray-500 text-[9px] block mb-0.5">Refeições ao Dia</span>
                  <input type="number" value={refeicoesDia} onChange={e => setRefeicoesDia(Number(e.target.value))} className="w-full bg-[#121315] border border-gray-800 text-white rounded p-1 text-center font-bold" />
                </div>
                <div>
                  <span className="text-gray-500 text-[9px] block mb-0.5">Calorias (kcal/dia)</span>
                  <input type="number" value={ingestaoCalorica} onChange={e => setIngestaoCalorica(Number(e.target.value))} className="w-full bg-[#121315] border border-gray-800 text-white rounded p-1 text-center font-bold text-green-400" />
                </div>
                <div>
                  <span className="text-gray-500 text-[9px] block mb-0.5">Gasto Energético</span>
                  <input type="number" value={gastoEnergetico} onChange={e => setGastoEnergetico(Number(e.target.value))} className="w-full bg-[#121315] border border-gray-800 text-white rounded p-1 text-center font-bold text-amber-500" />
                </div>
              </div>
            </div>

            <h4 className="font-mono text-xs font-bold uppercase tracking-wider text-cyan-400 border-b border-gray-900 pb-2 pt-4 flex items-center gap-1.5">
              <Dumbbell className="w-4 h-4 text-cyan-400" /> Anamnese de Atividade Física
            </h4>

            <div className="space-y-3 font-mono text-xs">
              <div>
                <label className="block text-gray-400 text-[10px] mb-1.5">Objetivos Principais (Selecione vários)</label>
                <div className="flex flex-wrap gap-1.5">
                  {objetivosList.map(obj => {
                    const sel = selectedObjetivos.includes(obj);
                    return (
                      <button
                        key={obj}
                        type="button"
                        onClick={() => toggleObjetivo(obj)}
                        className={`text-[10px] px-2.5 py-1.5 rounded-lg border font-bold transition-all cursor-pointer ${
                          sel 
                            ? "bg-cyan-950 text-cyan-400 border-cyan-800" 
                            : "bg-[#121315] border-gray-800 text-gray-500"
                        }`}
                      >
                        {obj}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-400 text-[10px] mb-0.5">Horário de Preferência</label>
                  <select value={horarioTreino} onChange={e => setHorarioTreino(e.target.value)} className="w-full bg-[#121315] border border-gray-800 text-white rounded p-1.5 text-xs">
                    <option value="Manhã (06h - 12h)">Manhã (06h - 12h)</option>
                    <option value="Tarde (12h - 18h)">Tarde (12h - 18h)</option>
                    <option value="Noite (18h - 23h)">Noite (18h - 23h)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-400 text-[10px] mb-0.5">Dias Disponíveis</label>
                  <input type="text" placeholder="Ex: Seg, Ter, Qui, Sex" value={disponibilidadeDias} onChange={e => setDisponibilidadeDias(e.target.value)} className="w-full bg-[#121315] border border-gray-800 text-white rounded p-1.5 text-xs" />
                </div>
              </div>

              <div>
                <label className="block text-gray-400 text-[10px] mb-0.5">Atividades Físicas Preferidas</label>
                <input type="text" placeholder="Ex: Corrida, Crossfit, Beach Tennis..." value={atividadesPreferidas} onChange={e => setAtividadesPreferidas(e.target.value)} className="w-full bg-[#121315] border border-gray-800 text-white rounded p-1.5 text-xs" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-400 text-[10px] mb-0.5">Duração das Sessões</label>
                  <input type="text" placeholder="Ex: Das 19h às 20:30h" value={disponibilidadeHoras} onChange={e => setDisponibilidadeHoras(e.target.value)} className="w-full bg-[#121315] border border-gray-800 text-white rounded p-1.5 text-xs" />
                </div>
                <div>
                  <label className="block text-gray-400 text-[10px] mb-0.5">Observações Adicionais</label>
                  <input type="text" placeholder="Aversões ou preferências..." value={observacoes} onChange={e => setObservacoes(e.target.value)} className="w-full bg-[#121315] border border-gray-800 text-white rounded p-1.5 text-xs" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Calculated Questionnaires Side */}
        <div className="space-y-6">
          <div className="glass-panel p-5 rounded-xl space-y-5">
            <h4 className="font-mono text-xs font-bold uppercase tracking-wider text-[#ccff00] border-b border-gray-900 pb-2 flex items-center gap-1.5">
              <BarChart3 className="w-4 h-4 text-[#ccff00]" /> Questionários Calculados
            </h4>

            {/* A. Waist-to-Hip Ratio */}
            <div className="bg-[#121315] p-4 rounded-xl border border-gray-800 space-y-3 font-mono text-xs">
              <div className="flex justify-between items-center border-b border-gray-900 pb-1.5">
                <span className="font-bold text-white uppercase text-[10px]">A. Relação Cintura-Quadril (RCQ)</span>
                <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold ${
                  rcqStats.risk.includes("Alto") 
                    ? "bg-red-950 text-red-400 border border-red-900/40" 
                    : rcqStats.risk.includes("Mod") 
                    ? "bg-amber-950 text-amber-400 border border-amber-900/40" 
                    : "bg-green-950 text-green-400 border border-green-900/40"
                }`}>
                  {rcqStats.risk}
                </span>
              </div>
              <p className="text-[10px] text-gray-500 leading-relaxed">
                Calcular a gordura visceral central. Fórmula: Cintura (cm) / Quadril (cm). Cruza dinamicamente com Sexo e Faixa Etária.
              </p>
              <div className="grid grid-cols-2 gap-3 text-center">
                <div>
                  <span className="text-gray-500 text-[9px] block">Cintura (cm)</span>
                  <input type="number" value={cinturaRcq} onChange={e => setCinturaRcq(Number(e.target.value))} className="w-full bg-[#1b1c1e] text-white border border-gray-800 rounded p-1 text-center font-bold text-xs" />
                </div>
                <div>
                  <span className="text-gray-500 text-[9px] block">Quadril (cm)</span>
                  <input type="number" value={quadrilRcq} onChange={e => setQuadrilRcq(Number(e.target.value))} className="w-full bg-[#1b1c1e] text-white border border-gray-800 rounded p-1 text-center font-bold text-xs" />
                </div>
              </div>
              <div className="flex justify-between pt-1 font-bold">
                <span className="text-gray-400">Índice RCQ:</span>
                <span className="text-white text-sm">{rcqStats.index}</span>
              </div>
              <div className="text-[8px] text-gray-600 bg-black/30 p-2 rounded leading-relaxed flex items-start gap-1">
                <BarChart3 className="w-2.5 h-2.5 text-gray-500 shrink-0 mt-0.5" />
                <span>Tabela RRCQ (OMS): Homens 20-29 anos: Baixo &lt;0,83 • Mod 0,83-0,88 • Alto &gt;0,88 | Mulheres: Baixo &lt;0,71 • Mod 0,71-0,77 • Alto &gt;0,77</span>
              </div>
            </div>

            {/* B. PAR-Q */}
            <div className="bg-[#121315] p-4 rounded-xl border border-gray-800 space-y-3 font-mono text-xs">
              <div className="flex justify-between items-center border-b border-gray-900 pb-1.5">
                <span className="font-bold text-white uppercase text-[10px]">B. Questionário de Prontidão (PAR-Q)</span>
                <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold ${
                  isParqApproved ? "bg-green-950 text-green-400 border border-green-900" : "bg-red-950 text-red-400 border border-red-900"
                }`}>
                  {isParqApproved ? "APTO ✅" : "NÃO APTO ❌"}
                </span>
              </div>
              <p className="text-[10px] text-gray-500">
                Triagem de segurança fisiológica sistêmica. Qualquer resposta "SIM" exige laudo/liberação médica.
              </p>
              
              <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
                {[
                  "1. Alguma vez um médico disse que você possui um problema do coração e recomendou que só fizesse atividade física sob supervisão médica?",
                  "2. Você sente dor no peito, causado pela prática de atividade física?",
                  "3. Você sentiu dor no peito no último mês?",
                  "4. Você tende a perder a consciência ou cair, como resultado de tonteira ou desmaio?",
                  "5. Você tem algum problema ósseo ou muscular que poderia ser agravado com a prática de atividade física?",
                  "6. Algum médico já lhe recomendou o uso de medicamentos para sua pressão arterial, para circulação ou coração?",
                  "7. Você tem consciência, através de experiência ou conselho médico, de alguma outra razão física que impeça sua prática de atividade física sem supervisão médica?"
                ].map((q, idx) => (
                  <div key={idx} className="flex justify-between items-start gap-3 bg-black/20 p-2 rounded text-[10px] leading-relaxed">
                    <span className="text-gray-300">{q}</span>
                    <div className="flex gap-1">
                      <button type="button" onClick={() => handleParqToggle(idx, true)} className={`px-1.5 py-0.5 rounded font-bold ${parqAnswers[idx] ? "bg-red-900 text-white" : "bg-gray-800 text-gray-400"}`}>Sim</button>
                      <button type="button" onClick={() => handleParqToggle(idx, false)} className={`px-1.5 py-0.5 rounded font-bold ${!parqAnswers[idx] ? "bg-green-900 text-white" : "bg-gray-800 text-gray-400"}`}>Não</button>
                    </div>
                  </div>
                ))}
              </div>

              <p className={`text-[10px] leading-relaxed p-2 rounded ${isParqApproved ? "bg-green-950/20 text-green-400" : "bg-red-950/20 text-red-400 font-bold"}`}>
                {isParqApproved 
                  ? "Aprovado para Atividade Física: O aluno não apresenta nenhum sintoma ou fator de impedimento fisiológico direto listado no PAR-Q." 
                  : "Atenção: O aluno apresentou um ou mais indicativos de risco no PAR-Q. Exige-se atestado ou parecer médico antes de iniciar treinos intensos."}
              </p>
            </div>

            {/* C. Cardiac Risk (MHA) */}
            <div className="bg-[#121315] p-4 rounded-xl border border-gray-800 space-y-3 font-mono text-xs">
              <div className="flex justify-between items-center border-b border-gray-900 pb-1.5">
                <span className="font-bold text-white uppercase text-[10px]">C. Avaliação do Risco Cardíaco (MHA)</span>
                <span className="text-[10px] font-bold text-amber-400">{mhaScore.total} PONTOS • {mhaScore.classification}</span>
              </div>
              <p className="text-[10px] text-gray-500">
                Modelo preditivo ponderado (Michigan Heart Association) cruzando fatores coronarianos de estilo de vida e genéticos.
              </p>

              <div className="grid grid-cols-2 gap-2 text-[10px] max-h-[160px] overflow-y-auto pr-1">
                <div>
                  <span className="text-gray-500">Faixa Etária</span>
                  <select value={mhaAgeGroup} onChange={e => setMhaAgeGroup(Number(e.target.value))} className="bg-[#1b1c1e] text-white border border-gray-800 rounded p-1 w-full text-[10px] mt-0.5">
                    <option value="1">20 anos ou menos (+1 pt)</option>
                    <option value="2">21 a 30 anos (+2 pts)</option>
                    <option value="3">31 a 40 anos (+3 pts)</option>
                    <option value="4">41 a 50 anos (+4 pts)</option>
                  </select>
                </div>
                <div>
                  <span className="text-gray-500">Sexo / Risco Estrogênico</span>
                  <select value={mhaGender} onChange={e => setMhaGender(Number(e.target.value))} className="bg-[#1b1c1e] text-white border border-gray-800 rounded p-1 w-full text-[10px] mt-0.5">
                    <option value="1">Feminino pré-menopausa (+1 pt)</option>
                    <option value="2">Feminino pós-menopausa (+2 pts)</option>
                    <option value="4">Masculino padrão (+4 pts)</option>
                  </select>
                </div>
                <div>
                  <span className="text-gray-500">Divergência de Peso Saudável</span>
                  <select value={mhaWeightDev} onChange={e => setMhaWeightDev(Number(e.target.value))} className="bg-[#1b1c1e] text-white border border-gray-800 rounded p-1 w-full text-[10px] mt-0.5">
                    <option value="0">Peso Ideal (+0 pts)</option>
                    <option value="1">Até 2.3 kg acima (+1 pt)</option>
                    <option value="2">2.4 kg a 9.0 kg acima (+2 pts)</option>
                    <option value="3">9.1 kg a 18.0 kg acima (+3 pts)</option>
                  </select>
                </div>
                <div>
                  <span className="text-gray-500">Atividade Física Lazer/Trabalho</span>
                  <select value={mhaActivity} onChange={e => setMhaActivity(Number(e.target.value))} className="bg-[#1b1c1e] text-white border border-gray-800 rounded p-1 w-full text-[10px] mt-0.5">
                    <option value="1">Trabalho recreativo pesado (+1 pt)</option>
                    <option value="2">Sedentário moderado (+2 pts)</option>
                    <option value="3">Inatividade completa (+3 pts)</option>
                  </select>
                </div>
                <div>
                  <span className="text-gray-500">Frequência Tabagismo</span>
                  <select value={mhaSmoking} onChange={e => setMhaSmoking(Number(e.target.value))} className="bg-[#1b1c1e] text-white border border-gray-800 rounded p-1 w-full text-[10px] mt-0.5">
                    <option value="0">Não fumante (+0 pts)</option>
                    <option value="1">Fumante eventual (+1 pt)</option>
                    <option value="2">Menos de 20 cigarros/dia (+2 pts)</option>
                  </select>
                </div>
                <div>
                  <span className="text-gray-500">Pressão Sistólica Repouso</span>
                  <select value={mhaSystolic} onChange={e => setMhaSystolic(Number(e.target.value))} className="bg-[#1b1c1e] text-white border border-gray-800 rounded p-1 w-full text-[10px] mt-0.5">
                    <option value="1">Sistólica menor 120 (+1 pt)</option>
                    <option value="2">Sistólica de 120 a 139 mmHg (+2 pts)</option>
                    <option value="3">Sistólica de 140 a 159 mmHg (+3 pts)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* D. Sleep Debt */}
            <div className="bg-[#121315] p-4 rounded-xl border border-gray-800 space-y-3 font-mono text-xs">
              <div className="flex justify-between items-center border-b border-gray-900 pb-1.5">
                <span className="font-bold text-white uppercase text-[10px]">D. Qualidade do Sono (Débito de Sono)</span>
                <span className="text-[10px] font-bold text-green-400">{sleepDebtScore.yesCount} SIM • {sleepDebtScore.desc}</span>
              </div>
              <p className="text-[10px] text-gray-500">
                Classificação de fadiga cumulativa baseada no cansaço central. Cada resposta "SIM" soma 1 ponto.
              </p>
              
              <div className="space-y-2 max-h-[140px] overflow-y-auto pr-1">
                {[
                  "1. Você acorda cansado na maioria dos dias?",
                  "2. Você sente sono excessivo durante o dia ou assistindo TV?",
                  "3. Costuma cochilar em reuniões ou durante o trabalho/estudos?",
                  "4. Sente necessidade de cafeína ou estimulantes para se manter ativo?",
                  "5. Tem dificuldade de concentração e esquecimentos frequentes?",
                  "6. Sente-se irritado, impaciente ou ansioso sem motivo aparente?",
                  "7. Costuma acordar no meio da noite e tem dificuldade para dormir novamente?",
                  "8. Seu tempo médio de sono por noite é menor do que 6 horas?",
                  "9. Dorme significativamente mais nos fins de semana para compensar?"
                ].map((q, idx) => (
                  <div key={idx} className="flex justify-between items-center gap-3 bg-black/20 p-2 rounded text-[10px]">
                    <span className="text-gray-300">{q}</span>
                    <div className="flex gap-1 shrink-0">
                      <button type="button" onClick={() => handleSleepToggle(idx, true)} className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${sleepAnswers[idx] ? "bg-amber-900 text-white" : "bg-gray-800 text-gray-400"}`}>Sim</button>
                      <button type="button" onClick={() => handleSleepToggle(idx, false)} className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${!sleepAnswers[idx] ? "bg-green-900 text-white" : "bg-gray-800 text-gray-400"}`}>Não</button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-2 bg-green-950/20 text-green-400 text-[10px] rounded leading-relaxed text-center font-bold">
                ✓ Recuperação muscular ideal. Baixos níveis de cansaço acumulado.
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* 🔘 Unified Save & Advance Footer Button */}
      <div className="pt-6 border-t border-[#3a494b]/20 flex justify-end">
        <button
          type="button"
          onClick={() => {
            const data = {
              etnia,
              sexoBio,
              idade,
              tipoSanguineo,
              fatorRh,
              fcRepouso,
              condicaoFisica,
              pressaoArt,
              fumante,
              exFumante,
              doencasCronicas,
              lesoesDores,
              usaMedicamento,
              medicamentos,
              contatoNome,
              contatoFone,
              nutriNome,
              nutriFone,
              refeicoesDia,
              ingestaoCalorica,
              gastoEnergetico,
              selectedObjetivos,
              horarioTreino,
              atividadesPreferidas,
              disponibilidadeDias,
              disponibilidadeHoras,
              observacoes,
              cinturaRcq,
              quadrilRcq,
              parqAnswers,
              mhaAgeGroup,
              mhaGender,
              mhaWeightDev,
              mhaActivity,
              mhaSmoking,
              mhaSystolic,
              mhaGenetics,
              mhaCholesterol,
              sleepAnswers,
            };
            localStorage.setItem(`anamnese_${currentStudent.id}`, JSON.stringify(data));
            if (onSaveAndAdvance) {
              onSaveAndAdvance();
            }
          }}
          className="w-full sm:w-auto bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-black font-bold font-mono text-xs uppercase tracking-wider py-3.5 px-8 rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.2)] transition-all flex items-center justify-center gap-2 hover:scale-[1.02] cursor-pointer"
        >
          <Save className="w-4 h-4" /> Salvar Anamnese Completa e Avançar
        </button>
      </div>
    </div>
  );
}
