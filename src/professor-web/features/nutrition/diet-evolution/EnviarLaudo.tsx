import React, { useState, useMemo, useEffect } from "react";
import { 
  MessageSquare, 
  Copy, 
  CheckCircle, 
  Send, 
  TrendingDown, 
  TrendingUp, 
  Heart,
  FileText,
  Sparkles,
  Brain,
  Award,
  ShieldAlert,
  Zap,
  Edit3,
  Check,
  Printer,
  ArrowRight,
  Loader2,
  Calendar,
  ClipboardList,
  RefreshCw,
  Trash2,
  FileDown,
  Scale
} from "lucide-react";
import { Student, Diet } from "../../../../types";
import { PhysicalEvaluation } from "./AvaliacaoCorporal";
import { PosturalEvaluation } from "../../postural/AnalisePosturalView";
import { jsPDF } from "jspdf";

interface EnviarLaudoProps {
  currentStudent: Student;
  activeDiet: Diet | null;
}

export default function EnviarLaudo({
  currentStudent,
  activeDiet
}: EnviarLaudoProps) {
  const [activeTab, setActiveTab] = useState<"dashboard" | "interactive" | "whatsapp" | "history">("dashboard");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState("");
  const [generationProgress, setGenerationProgress] = useState(0);
  const [report, setReport] = useState<any | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [editedReport, setEditedReport] = useState<any | null>(null);
  const [historyList, setHistoryList] = useState<any[]>([]);
  const [warningMessage, setWarningMessage] = useState<string | null>(null);
  const [confirmedGender, setConfirmedGender] = useState<"masculino" | "feminino">("masculino");
  const [showGenderInconsistencyAlert, setShowGenderInconsistencyAlert] = useState(false);

  // Biological gender validation on load/student change
  useEffect(() => {
    if (!currentStudent) return;

    // 1. Determine base gender
    let baseGender: "masculino" | "feminino" = "masculino";
    if (currentStudent.gender === "masculino" || currentStudent.gender === "feminino") {
      baseGender = currentStudent.gender;
    } else {
      // derive from name or email
      const nameLower = currentStudent.name.trim().toLowerCase();
      const firstWord = nameLower.split(" ")[0];
      const isMasc = !firstWord.endsWith("a");
      baseGender = isMasc ? "masculino" : "feminino";
    }

    // 2. Inconsistency detection
    const firstWord = currentStudent.name.trim().split(" ")[0].toLowerCase();
    const endingInA = firstWord.endsWith("a") || firstWord.endsWith("as");
    const endingInOMasc = firstWord.endsWith("o") || firstWord.endsWith("os") || firstWord.endsWith("r") || firstWord.endsWith("u") || firstWord.endsWith("i") || firstWord.endsWith("e");
    
    // Exception names
    const commonMaleWithA = ["luca", "jean", "felipe", "andre", "henrique", "guilherme", "gabriel", "rafael", "daniel", "samuel"];
    const commonFemaleWithOMasc = ["solange", "regina", "raquel", "ester", "ruth", "yasmin", "beatriz", "alice", "carol"];

    let hasInconsistency = false;
    if (baseGender === "feminino" && (endingInOMasc || commonMaleWithA.includes(firstWord)) && !commonFemaleWithOMasc.includes(firstWord)) {
      hasInconsistency = true;
    } else if (baseGender === "masculino" && (endingInA || commonFemaleWithOMasc.includes(firstWord)) && !commonMaleWithA.includes(firstWord)) {
      hasInconsistency = true;
    }

    setConfirmedGender(baseGender);
    setShowGenderInconsistencyAlert(hasInconsistency);
  }, [currentStudent]);

  const handleConfirmGender = (gender: "masculino" | "feminino") => {
    setConfirmedGender(gender);
    setShowGenderInconsistencyAlert(false);

    // Save/update student in localStorage so it's permanently set!
    try {
      const saved = localStorage.getItem("treinopro_students");
      if (saved) {
        const parsed = JSON.parse(saved) as Student[];
        const updated = parsed.map(s => {
          if (s.id === currentStudent?.id) {
            return { ...s, gender };
          }
          return s;
        });
        localStorage.setItem("treinopro_students", JSON.stringify(updated));
        // Notify the parent component and other observers to sync the state
        window.dispatchEvent(new Event("treinopro_student_updated"));
      }
    } catch (e) {
      console.error("Error persisting confirmed gender:", e);
    }
  };

  // Load physical evaluations from localStorage
  const physicalEvaluations = useMemo(() => {
    if (!currentStudent?.id) return [];
    try {
      const saved = localStorage.getItem(`coach_physical_evaluations_${currentStudent.id}`);
      if (saved) {
        return JSON.parse(saved) as PhysicalEvaluation[];
      }
    } catch (e) {
      console.error("Error loading physical evaluations", e);
    }
    return [];
  }, [currentStudent]);

  // Retrieve latest physical evaluation
  const latestEval = useMemo(() => {
    if (physicalEvaluations.length === 0) return null;
    return [...physicalEvaluations].sort((a, b) => b.timestamp - a.timestamp)[0];
  }, [physicalEvaluations]);

  // Load postural evaluations from localStorage
  const posturalEvaluations = useMemo(() => {
    if (!currentStudent?.id) return [];
    try {
      const saved = localStorage.getItem(`treinopro_postural_evaluations_${currentStudent.id}`);
      let list = saved ? (JSON.parse(saved) as PosturalEvaluation[]) : [];
      
      // Also look for draft
      const draft = localStorage.getItem(`treinopro_draft_postural_eval_${currentStudent.id}`);
      if (draft) {
        const parsedDraft = JSON.parse(draft) as PosturalEvaluation;
        if (!list.some(x => x.id === parsedDraft.id)) {
          list = [parsedDraft, ...list];
        }
      }
      return list;
    } catch (e) {
      console.error("Error loading postural evaluations", e);
    }
    return [];
  }, [currentStudent]);

  // Retrieve latest postural evaluation
  const latestPostural = useMemo(() => {
    if (posturalEvaluations.length === 0) return null;
    const sorted = [...posturalEvaluations].sort((a, b) => b.timestamp - a.timestamp);
    const item = sorted[0];
    if (item && item.aiReport) {
      return {
        ...item,
        aiReport: sanitizePosturalReport(item.aiReport)
      };
    }
    return item;
  }, [posturalEvaluations]);

  // Resolve active diet checking both prop and draft
  const resolvedDiet = useMemo(() => {
    if (!currentStudent?.id) return activeDiet;
    try {
      const draftSaved = localStorage.getItem(`treinopro_draft_diet_${currentStudent.id}`);
      if (draftSaved) {
        return JSON.parse(draftSaved) as Diet;
      }
    } catch (e) {
      console.error("Error loading diet draft in EnviarLaudo", e);
    }
    return activeDiet;
  }, [currentStudent, activeDiet]);

  // Load saved Unified Reports from localStorage
  const loadReportsHistory = () => {
    if (!currentStudent?.id) return;
    try {
      const saved = localStorage.getItem(`treinopro_unified_laudos_${currentStudent.id}`);
      if (saved) {
        setHistoryList(JSON.parse(saved));
      } else {
        setHistoryList([]);
      }
    } catch (e) {
      console.error("Error loading saved unified reports", e);
    }
  };

  useEffect(() => {
    loadReportsHistory();
    // Reset states on student change
    setReport(null);
    setEditedReport(null);
    setActiveTab("dashboard");
    setWarningMessage(null);
  }, [currentStudent]);

  // Local client-side fallback generator for step 5 (Laudo Unificado)
  const getLocalFallbackLaudo = (
    studentName: string,
    age: number,
    gender: string,
    height: number,
    weight: number,
    latestEval: any,
    latestPostural: any,
    activeDiet: any,
    objective: string
  ) => {
    const isMasc = gender === "masculino" || gender === "M";
    const bf = latestEval?.resultados?.percentualGordura || (isMasc ? 18 : 24);
    const imc = latestEval?.resultados?.imc || parseFloat((weight / ((height / 100) * (height / 100))).toFixed(1));
    const imcClass = imc > 25 ? "Sobrepeso" : imc < 18.5 ? "Baixo Peso" : "Normal";
    const pGordura = bf.toFixed(1) + "%";

    const isPosturalComplete = !!(latestPostural && latestPostural.kpis && latestPostural.kpis.geral);

    const devCervical = isPosturalComplete ? (latestPostural?.deviations?.cervical || "Leve protração cervical") : "Análise visual qualitativa em andamento";
    const devOmbros = isPosturalComplete ? (latestPostural?.deviations?.ombros || "Leve elevação do ombro direito") : "Análise visual qualitativa em andamento";
    let devPelve = isPosturalComplete ? (latestPostural?.deviations?.pelve || "Inclinação pélvica posterior") : "Análise visual qualitativa em andamento";

    let healthGrade = 8.2;
    const sonoPontos = latestEval?.sono_pontuacao !== undefined ? latestEval.sono_pontuacao : 21;
    const sonoClass = latestEval?.sono_classificacao || "DÉBITO DE SONO LEVE";
    const estressePontos = latestEval?.estresse_pontuacao !== undefined ? latestEval.estresse_pontuacao : 20;
    const estresseClass = latestEval?.estresse_classificacao || "MODERADO";
    const cardioPontos = latestEval?.risco_cardiaco_pontuacao !== undefined ? latestEval.risco_cardiaco_pontuacao : 24;
    const cardioClass = latestEval?.risco_cardiaco_classificacao || "RISCO MÉDIO (Nível 3)";

    if (sonoPontos > 15) healthGrade -= 0.5;
    if (estressePontos > 15) healthGrade -= 0.5;
    if (cardioPontos > 20) healthGrade -= 0.4;
    if (imc > 25) healthGrade -= 0.3;
    if (isPosturalComplete && latestPostural?.kpis?.geral && latestPostural.kpis.geral < 75) healthGrade -= 0.5;
    healthGrade = parseFloat(Math.max(3.0, Math.min(10.0, healthGrade)).toFixed(1));

    const calTarget = activeDiet?.calorieTarget || 2000;
    const protTarget = activeDiet?.proteinTarget || 150;
    const carbsTarget = activeDiet?.carbsTarget || 180;
    const fatTarget = activeDiet?.fatTarget || 70;

    const prioritarios = ["Prancha abdominal estática", "Ponte pélvica unilateral", "Alongamento de flexores do quadril", "Remada aberta na polia alta para trapézio médio"];
    if (!isPosturalComplete) {
      prioritarios.push("Completar avaliação postural instrumental na próxima reavaliação");
    }

    return {
      resumoGeral: {
        notaSaude: healthGrade,
        justificativaNota: `O aluno ${studentName} apresenta excelente base estrutural e dedicação ao plano, com nota final de saúde de ${healthGrade}/10. Os principais limitantes identificados na Etapa 01 são o estresse ${estresseClass.toLowerCase()} (${estressePontos} pts) e débito de sono ${sonoClass.toLowerCase()} (${sonoPontos} pts), que impactam a recuperação muscular e elevam a tensão cervical. ${isPosturalComplete ? `A presença de desvio postural (${devPelve}) requer foco preventivo no treinamento de core.` : "A avaliação postural instrumental está pendente (análise qualitativa em andamento)."}`,
        classificacaoCor: healthGrade >= 8 ? "green" : healthGrade >= 6.5 ? "orange" : "red"
      },
      analiseIntegrada: {
        perfilGeral: `Aluno(a) de ${age} anos, focado no objetivo de ${objective}. Apresenta peso corporal de ${weight} kg para uma altura de ${height} cm, com IMC de ${imc} (${imcClass}) e percentual de gordura de ${pGordura}. Possui rotina ativa com nível de estresse ${estresseClass} e qualidade de sono classificada como ${sonoClass}. Esteticamente apresenta boa retenção muscular, mas necessita de ajustes preventivos biomecânicos.`,
        correlacoes: [
          {
            titulo: "Estresse-Sono-Tensão Muscular",
            descricao: `Identificamos que o nível de estresse ${estresseClass} (${estressePontos} pontos) está correlacionado com o débito de sono ${sonoClass} (${sonoPontos} pontos) e com a tensão muscular identificada na análise postural, especialmente na região de trapézios e cervical (${devCervical}). Esta tríade pode limitar a recuperação muscular e o desempenho nos treinos.`
          },
          {
            titulo: "Composição Corporal-Risco Cardíaco",
            descricao: `A distribuição de gordura com tendência androide combinada com o risco cardíaco ${cardioClass} (${cardioPontos} pontos no Michigan) sugere a necessidade de priorizar exercícios aeróbicos de média intensidade, especialmente em zona 2, para otimizar o perfil lipídico e condicionamento cardíaco.`
          },
          {
            titulo: "Evolução Positiva x Fatores Limitantes",
            descricao: `Apesar dos déficits de sono e estresse moderado, o aluno apresenta evolução de tônus favorável, indicando boa resiliência fisiológica e excelente adesão ao programa. Otimizar a higiene de sono pode potencializar em até 30% os ganhos hipertróficos futuros.`
          }
        ],
        pontosFortes: [
          "Ótima resposta de densidade muscular e aderência da pele",
          "Alta resiliência fisiológica e metabólica para o plano de treino",
          "Adesão nutricional consistente com controle inteligente de macros",
          "Frequência e engajamento acima da média nas atividades semanais"
        ],
        pontosAtencao: [
          {
            item: "Tensão na região cervical e trapézios devido a estresse acumulado",
            prioridade: "ATENÇÃO",
            cor: "orange"
          },
          {
            item: isPosturalComplete ? `Instabilidade e desvios pélvicos (inclinação pélvica posterior) exigindo fortalecimento de core` : "Avaliação postural instrumental pendente de dados",
            prioridade: "CRÍTICO",
            cor: "red"
          },
          {
            item: `Higiene do sono prejudicada (${sonoClass}) limitando regeneração proteica`,
            prioridade: "ATENÇÃO",
            cor: "orange"
          }
        ]
      },
      planoAcao: {
        treinamento: {
          focoPrincipal: isPosturalComplete 
            ? `Fortalecimento de core, correção de desvios posturais identificados na Etapa 02 (${devPelve}) e condicionamento aeróbico de zona 2`
            : "Fortalecimento preventivo de core, condicionamento aeróbico e agendamento de avaliação instrumental completa",
          frequencia: "4 a 5 vezes por semana",
          divisaoSugerida: "ABC de alta intensidade ou ABCD split",
          exerciciosPrioritarios: prioritarios,
          exerciciosEvitar: ["Desenvolvimento militar em pé com carga máxima", "Agachamento livre sem cinturão de proteção", "Abdominal supra tradicional excessivo"],
          zonaCardio: "Frequência Cardíaca de Zona 2 (60% a 70% da FC Max - aprox. 120-135 BPM)",
          progressaoCarga: "Foco em progressão de repetições em reserva (RIR 2) com controle estrito da fase excêntrica"
        },
        nutricao: {
          calorias: `${calTarget} kcal diárias`,
          macros: `Proteínas: ${protTarget}g | Carboidratos: ${carbsTarget}g | Gorduras: ${fatTarget}g`,
          timing: "Maior ingestão de carboidratos nas refeições pré e pós-treino para maximizar glicogênio",
          hidratacao: `${Math.round(weight * 35)} ml por dia (35ml por kg de peso)`,
          suplementacao: "Sugere-se avaliação com nutricionista para suplementação. Considerar, em conjunto com nutricionista: creatina, whey protein.",
          alimentosPriorizar: ["Peito de frango", "Ovos", "Aveia em flocos", "Arroz integral", "Banana", "Brócolis", "Azeite de oliva"],
          alimentosEvitar: ["Frituras", "Açúcares simples em excesso antes do treino", "Bebidas alcoólicas que prejudicam o sono"]
        },
        recuperacao: {
          horasSono: "7 a 8 horas recomendadas",
          higieneSono: [
            "Desligar telas e luzes fortes 1 hora antes de deitar",
            "Evitar cafeína e estimulantes após as 16h",
            "Manter o quarto totalmente escuro e em temperatura agradável"
          ],
          manejoEstresse: [
            "Sessões diárias de respiração diafragmática (5 minutos)",
            "Pausas ativas de alongamento a cada 2 horas de trabalho sentado",
            "Uso de fitoterápicos leves como chá de camomila ou melissa à noite"
          ],
          descanso: "Mínimo de 2 dias de descanso total por semana para regeneração do sistema nervoso central"
        },
        monitoramento: {
          metricas: ["Peso em jejum", "Circunferência abdominal", "Qualidade do sono", "BPM em repouso"],
          frequenciaAfericao: "Aferição de peso 2x por semana e fotos corporais a cada 15 dias",
          sinaisAlerta: ["Dores articulares agudas", "Fadiga crônica ao acordar", "Perda repentina de rendimento de carga"],
          proximaReavaliacao: "Reavaliação recomendada em 45 dias",
          metasIntermediarias: "Reduzir 1cm de linha de cintura a cada 15 dias e manter constância de 90% da dieta"
        }
      },
      metasSmart: [
        {
          titulo: "Composição Corporal",
          especifica: `Reduzir percentual de gordura de ${bf}% para ${(bf - 2.0).toFixed(1)}%`,
          mensuravel: "Perda de aproximadamente 1.5kg de gordura corporal líquida",
          atingivel: "Totalmente atingível com déficit calórico controlado e zona 2",
          relevante: "Alinha com a meta de definição muscular e controle do risco cardíaco",
          temporal: "45 dias",
          acoes: "Manter déficit calórico diário controlado + 3 sessões de cardio semanais"
        },
        {
          titulo: "Postura e Core",
          especifica: `Trabalhar na correção de desvios posturais identificados na Etapa 02 (inclinação pélvica posterior)`,
          mensuravel: "Melhora de estabilidade nos testes estáticos e redução de desconforto",
          atingivel: "Sim, através de ativação diária do transverso do abdômen (Vacuum)",
          relevante: "Prevenir lesões e garantir simetria biomecânica nos exercícios básicos",
          temporal: "45 dias",
          acoes: "Realizar 3 sessões de Vacuum abdominal em jejum + fortalecimento específico de core"
        },
        {
          titulo: "Recuperação & Sono",
          especifica: `REDUZIR pontuação do sono (Coren) de ${sonoPontos} para ≤ 12 pontos (sono normal)`,
          mensuravel: "Atingir média de 7.5 horas de sono por noite rastreadas",
          atingivel: "Sim, adotando o protocolo estrito de higiene do sono",
          relevante: "Reduzir estresse sistêmico e otimizar liberação natural de hormônios regenerativos",
          temporal: "45 dias",
          acoes: "Interromper uso de smartphone à noite e buscar avaliação de higiene do sono"
        }
      ],
      cronograma: {
        fase1: {
          titulo: "FASE 1 (Dias 1-15): Adaptação",
          foco: "Ativação de core, ajuste metabólico e estabelecimento da higiene do sono",
          acoes: [
            "Introduzir rotina de core e mobilidade pré-treino",
            "Consistência de 100% nas calorias e macros sugeridos",
            "Iniciar higiene do sono desligando telas às 22h"
          ],
          meta: "Estabilização postural e redução primária de retenção hídrica"
        },
        fase2: {
          titulo: "FASE 2 (Dias 16-30): Intensificação",
          foco: "Progressão de carga de treino, aumento da intensidade do cardio e consolidação de hábitos",
          acoes: [
            "Progredir cargas nos exercícios prioritários de força",
            "Aumentar cardio para 4x por semana (30 minutos)",
            "Adicionar técnicas de manejo de estresse na rotina de trabalho"
          ],
          meta: "Redução perceptível de medidas abdominais e aumento de força geral"
        },
        fase3: {
          titulo: "FASE 3 (Dias 31-45): Consolidação",
          foco: "Maximização hipertrófica/emagrecimento e consolidação biomecânica",
          acoes: [
            "Realizar treinos com foco em repetições sob fadiga controlada",
            "Manter foco na zona 2 e hidratação excelente de 35ml/kg",
            "Garantir reavaliação fotográfica e postural no dia 45"
          ],
          meta: "Bater a meta de % de gordura e apresentar alinhamento escapular reabilitado"
        }
      },
      recomendacoesFinais: `Parabéns pela dedicação nesta jornada de evolução! Este laudo unificado mostra que você tem um potencial genético e físico fantástico. Ajustando os pequenos detalhes de sono, estresse e prevenção postural, seus resultados de performance estética e saúde geral serão incomparáveis. Continue focado no plano, confie no processo e conte 100% com o suporte do TreinoPro AI!`,
      avisoLegal: "Aviso Legal: Este documento é um laudo técnico unificado para suporte e otimização de treinamento físico e qualidade de vida. Não substitui o diagnóstico médico formal ou orientação nutricional clínica personalizada realizada em consultório regulamentado."
    };
  };

  // Trigger Gemini AI Generation with structured steps
  const handleGenerateReport = async () => {
    setIsGenerating(true);
    setWarningMessage(null);
    
    const steps = [
      "Consolidando dados de composicao corporal (Etapa 1)...",
      "Interpretando questionarios de sono, estresse e risco cardiaco (Etapa 1)...",
      "Processando marcadores anatomicos e desvios de postura (Etapa 2)...",
      "Mapeando macronutrientes, metas e restricoes alimentares (Etapa 3)...",
      "Analisando historico evolutivo e taxa de ganho/perda (Etapa 4)...",
      "Correlacionando limitantes com IA e definindo metas SMART...",
      "Formatando laudo integrado e gerando cronograma de 45 dias..."
    ];

    let currentStepIndex = 0;
    setGenerationStep(steps[0]);
    setGenerationProgress(10);

    const interval = setInterval(() => {
      currentStepIndex++;
      if (currentStepIndex < steps.length) {
        setGenerationStep(steps[currentStepIndex]);
        setGenerationProgress((currentStepIndex + 1) * 12);
      }
    }, 1200);

    try {
      const response = await fetch("/api/generate-laudo", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          studentName: currentStudent.name,
          age: currentStudent.age || 30,
          gender: confirmedGender,
          height: currentStudent.height || 175,
          weight: currentStudent.weight || 75,
          latestEval: latestEval,
          latestPostural: latestPostural,
          activeDiet: resolvedDiet,
          objective: currentStudent.currentPhase || currentStudent.objective || "definição"
        })
      });

      clearInterval(interval);
      setGenerationProgress(95);

      if (!response.ok) {
        throw new Error("Erro de resposta do servidor.");
      }

      const data = await response.json();
      if (data.warning) {
        setWarningMessage(data.warning);
      }

      setReport(data);
      setEditedReport(JSON.parse(JSON.stringify(data))); // Deep copy
      setActiveTab("interactive");
    } catch (error: any) {
      console.error("Failed to generate report:", error);
      setWarningMessage("Nota: Erro de comunicação com o servidor. Gerando laudo local offline integrado.");
      
      try {
        // Try to fetch standard offline fallback from endpoint as a first fallback
        const mockResponse = await fetch("/api/generate-laudo", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            studentName: currentStudent.name,
            age: currentStudent.age || 30,
            gender: confirmedGender,
            height: currentStudent.height || 175,
            weight: currentStudent.weight || 75,
            latestEval: null,
            latestPostural: null,
            activeDiet: null
          })
        });
        
        if (mockResponse.ok) {
          const data = await mockResponse.json();
          setReport(data);
          setEditedReport(JSON.parse(JSON.stringify(data)));
        } else {
          throw new Error("Mock response fetch failed.");
        }
      } catch (innerErr) {
        // Ultimate client-side backup - completely offline/local JS, 100% fail-proof!
        console.warn("Server is offline. Generating completely local client-side fallback.", innerErr);
        const data = getLocalFallbackLaudo(
          currentStudent.name,
          currentStudent.age || 30,
          confirmedGender,
          currentStudent.height || 175,
          currentStudent.weight || 75,
          latestEval,
          latestPostural,
          resolvedDiet,
          currentStudent.currentPhase || currentStudent.objective || "definição"
        );
        setReport(data);
        setEditedReport(JSON.parse(JSON.stringify(data)));
      }
      
      setActiveTab("interactive");
    } finally {
      clearInterval(interval);
      setIsGenerating(false);
    }
  };

  // Save changes from Edit Mode
  const handleSaveChanges = () => {
    setReport(editedReport);
    setEditMode(false);
  };

  // Save the report to Student History
  const handleSaveToHistory = () => {
    if (!report || !currentStudent?.id) return;
    
    try {
      // 1. Promote physical evaluation drafts (isRascunho: true -> false)
      try {
        const physicalSaved = localStorage.getItem(`coach_physical_evaluations_${currentStudent.id}`);
        if (physicalSaved) {
          const physicalList = JSON.parse(physicalSaved) as any[];
          let updated = false;
          const finalizedList = physicalList.map(rec => {
            if (rec.isRascunho) {
              updated = true;
              return { ...rec, isRascunho: false };
            }
            return rec;
          });
          if (updated) {
            localStorage.setItem(`coach_physical_evaluations_${currentStudent.id}`, JSON.stringify(finalizedList));
          }
        }
      } catch (e) {
        console.error("Error committing physical evaluation drafts:", e);
      }

      // 2. Promote postural evaluation drafts from treinopro_draft_postural_eval_${currentStudent.id}
      try {
        const posturalDraftStr = localStorage.getItem(`treinopro_draft_postural_eval_${currentStudent.id}`);
        if (posturalDraftStr) {
          const posturalDraft = JSON.parse(posturalDraftStr);
          const mainHistoryStr = localStorage.getItem(`treinopro_postural_evaluations_${currentStudent.id}`);
          let mainHistory = mainHistoryStr ? JSON.parse(mainHistoryStr) : [];
          
          mainHistory = mainHistory.filter((item: any) => item.id !== posturalDraft.id && item.id !== `postural-${currentStudent.id}-final`);
          
          const finalPostural = {
            ...posturalDraft,
            id: `postural-${currentStudent.id}-${Date.now()}`
          };
          
          mainHistory.unshift(finalPostural);
          localStorage.setItem(`treinopro_postural_evaluations_${currentStudent.id}`, JSON.stringify(mainHistory));
          
          // Save to SQL mock database table "avaliacoes_posturais"
          try {
            const dbStr = localStorage.getItem("treinopro_avaliacoes_posturais_db") || "[]";
            const db = JSON.parse(dbStr);
            
            const newDbRecord = {
              id: finalPostural.id,
              aluno_id: currentStudent.id,
              avaliacao_fisica_id: `fisica-eval-fk-${Date.now()}`,
              data_avaliacao: finalPostural.date,
              fotos_urls: JSON.stringify(finalPostural.photos),
              analise_ia: JSON.stringify(finalPostural.kpis),
              desvios_posturais: JSON.stringify(finalPostural.deviations),
              testes_especificos: JSON.stringify([
                { nome: "Overhead Squat Test", resultado: "Déficit funcional pélvico leve" },
                { nome: "Thomas Test", resultado: "Encurtamento leve flexor de quadril" }
              ]),
              risco_lesao: finalPostural.kpis.compensacaoRisco.toLowerCase(),
              regioes_risco: JSON.stringify((finalPostural.kpis.geral ?? 0) < 80 ? ["Cintura Escapular", "Lombar"] : ["Cervical", "Torácica"]),
              recomendacoes: JSON.stringify(finalPostural.suggestions),
              laudo_narrativo: finalPostural.aiReport || "Sem laudo narrativo disponível.",
              observacoes: JSON.stringify(finalPostural.observations),
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            };
            
            db.push(newDbRecord);
            localStorage.setItem("treinopro_avaliacoes_posturais_db", JSON.stringify(db));
          } catch (dbErr) {
            console.error("Error writing finalized postural to db:", dbErr);
          }
          
          localStorage.removeItem(`treinopro_draft_postural_eval_${currentStudent.id}`);
        }
      } catch (e) {
        console.error("Error committing postural draft:", e);
      }

      // 3. Promote diet drafts from treinopro_draft_diet_${currentStudent.id} to main diets list
      try {
        const dietDraftStr = localStorage.getItem(`treinopro_draft_diet_${currentStudent.id}`);
        if (dietDraftStr) {
          const dietDraft = JSON.parse(dietDraftStr);
          const dietsSaved = localStorage.getItem("treinopro_diets");
          let dietsList = dietsSaved ? JSON.parse(dietsSaved) : [];
          
          // Remove any existing diet for this student
          dietsList = dietsList.filter((d: any) => d.studentId !== currentStudent.id);
          
          const finalDiet = {
            ...dietDraft,
            id: `diet-${currentStudent.id}-${Date.now()}` // assign a real finalized diet ID
          };
          
          dietsList.unshift(finalDiet);
          localStorage.setItem("treinopro_diets", JSON.stringify(dietsList));
          localStorage.removeItem(`treinopro_draft_diet_${currentStudent.id}`);
          
          // Dispatch custom event to notify App.tsx to reload diets
          window.dispatchEvent(new Event("treinopro_diets_updated"));
        }
      } catch (e) {
        console.error("Error committing diet draft:", e);
      }

      const newSavedReport = {
        id: `report-${Date.now()}`,
        date: new Date().toLocaleDateString("pt-BR"),
        timestamp: Date.now(),
        data: report
      };

      const existingSaved = localStorage.getItem(`treinopro_unified_laudos_${currentStudent.id}`);
      let list = [];
      if (existingSaved) {
        list = JSON.parse(existingSaved);
      }
      
      list.unshift(newSavedReport);
      localStorage.setItem(`treinopro_unified_laudos_${currentStudent.id}`, JSON.stringify(list));
      setHistoryList(list);
      alert("Laudo Unificado e etapas associadas salvos no prontuario de " + currentStudent.name + " com sucesso!");
    } catch (e) {
      console.error("Error saving report", e);
    }
  };

  // Delete a saved report from history
  const handleDeleteReport = (reportId: string) => {
    if (!window.confirm("Deseja realmente excluir este laudo do historico?")) return;
    try {
      const updated = historyList.filter(r => r.id !== reportId);
      localStorage.setItem(`treinopro_unified_laudos_${currentStudent.id}`, JSON.stringify(updated));
      setHistoryList(updated);
    } catch (e) {
      console.error("Error deleting report", e);
    }
  };

  // Load a saved report from history
  const handleLoadReport = (savedReport: any) => {
    setReport(savedReport.data);
    setEditedReport(JSON.parse(JSON.stringify(savedReport.data)));
    setActiveTab("interactive");
    setEditMode(false);
    setWarningMessage(null);
  };

  // Raw text compiler for WhatsApp sharing (no special unicode icons as it's cleaner)
  const whatsAppText = useMemo(() => {
    if (!report) return "";
    const p = report;
    
    let text = `📋 *LAUDO INTEGRADO DE EVOLUCAO - TREINOPRO AI*\n\n`;
    text += `*Atleta:* ${currentStudent.name}\n`;
    text += `*Objetivo:* ${currentStudent.currentPhase || currentStudent.objective || "Nao informado"}\n`;
    text += `*Nota de Saude:* ${p.resumoGeral?.notaSaude}/10\n\n`;
    
    text += `*1. RESUMO EXECUTIVO:*\n${p.resumoGeral?.justificativaNota}\n\n`;
    
    text += `*2. ANALISE INTEGRADA:*\n${p.analiseIntegrada?.perfilGeral}\n\n`;
    
    text += `*CORRELACOES FISIOLOGICAS:*`;
    p.analiseIntegrada?.correlacoes?.forEach((c: any) => {
      text += `\n• *${c.titulo}:* ${c.descricao}`;
    });
    text += `\n\n`;

    if (latestPostural?.aiReport) {
      text += `*LAUDO POSTURAL INTELIGENTE (IA):*\n${latestPostural.aiReport}\n\n`;
    }

    text += `*PONTOS DE ATENCAO:*`;
    p.analiseIntegrada?.pontosAtencao?.forEach((pt: any) => {
      text += `\n- [${pt.prioridade}] ${pt.item}`;
    });
    text += `\n\n`;

    text += `*3. PLANO DE ACAO (45 DIAS):*\n`;
    text += `*TREINAMENTO:* ${p.planoAcao?.treinamento?.focoPrincipal}\n`;
    text += `• Frequencia: ${p.planoAcao?.treinamento?.frequencia}\n`;
    text += `• Divisao: ${p.planoAcao?.treinamento?.divisaoSugerida}\n`;
    text += `• Exercicios Prioritarios: ${p.planoAcao?.treinamento?.exerciciosPrioritarios?.join(", ")}\n`;
    text += `• Exercicios a Evitar: ${p.planoAcao?.treinamento?.exerciciosEvitar?.join(", ")}\n\n`;

    text += `*NUTRICAO:* ${p.planoAcao?.nutricao?.calorias}\n`;
    text += `• Macros: ${p.planoAcao?.nutricao?.macros}\n`;
    text += `• Alimentos a Priorizar: ${p.planoAcao?.nutricao?.alimentosPriorizar?.join(", ")}\n\n`;

    text += `*RECUPERACAO:*\n`;
    text += `• Sono Recomendado: ${p.planoAcao?.recuperacao?.horasSono}\n`;
    text += `• Higiene do Sono: ${p.planoAcao?.recuperacao?.higieneSono?.join(", ")}\n\n`;

    text += `*4. CRONOGRAMA DE EVOLUCAO:*\n`;
    text += `• *${p.cronograma?.fase1?.titulo}:* ${p.cronograma?.fase1?.foco} (${p.cronograma?.fase1?.meta})\n`;
    text += `• *${p.cronograma?.fase2?.titulo}:* ${p.cronograma?.fase2?.foco} (${p.cronograma?.fase2?.meta})\n`;
    text += `• *${p.cronograma?.fase3?.titulo}:* ${p.cronograma?.fase3?.foco} (${p.cronograma?.fase3?.meta})\n\n`;

    text += `*Recomendacoes Finais:* ${p.recomendacoesFinais}\n\n`;
    text += `_Focado nos seus resultados. Vamos pra cima!_ 🔥`;

    return text;
  }, [report, currentStudent, resolvedDiet, latestPostural]);

  const handleCopyWhatsApp = () => {
    navigator.clipboard.writeText(whatsAppText);
    alert("Texto formatado para WhatsApp copiado!");
  };

  const handleSendWhatsApp = () => {
    const formattedPhone = currentStudent.phone?.replace(/\D/g, "") || "5511999999999";
    window.open(`https://api.whatsapp.com/send?phone=${formattedPhone}&text=${encodeURIComponent(whatsAppText)}`, "_blank");
  };

  // High-fidelity Multi-page PDF Generator using jsPDF with zero emojis (ASCII text strictly)
  const handleDownloadPDF = () => {
    if (!report) return;
    const doc = new jsPDF("p", "mm", "a4");
    const p = report;

    // Carrega configuracao de consultoria do localStorage
    let config = {
      logoText: "TREINOPRO",
      slogan: "PLATAFORMA INTELIGENTE DE PERFORMANCE",
      companyName: "ACADEMIA TREINOPRO LTDA",
      address: "Av. Paulista, 1000 - Bela Vista - Sao Paulo / SP",
      phone: "(11) 98888-7777",
      email: "suporte@treinopro.com.br",
      website: "www.treinopro.com.br",
      qrLink: typeof window !== "undefined" ? (window.location.origin + "/?role=aluno") : "treinopro.com.br/aluno",
      evaluatorName: "Prof. Gustavo Workout",
      evaluatorCref: "054112-G/SP",
      themeId: "blue"
    };

    try {
      const savedConfig = localStorage.getItem("treinopro_consultoria_config");
      if (savedConfig) {
        const parsed = JSON.parse(savedConfig);
        config = {
          logoText: parsed.logoText || config.logoText,
          slogan: parsed.slogan || config.slogan,
          companyName: parsed.companyName || config.companyName,
          address: parsed.address !== undefined ? parsed.address : config.address,
          phone: parsed.phone || config.phone,
          email: parsed.email || config.email,
          website: parsed.website !== undefined ? parsed.website : config.website,
          qrLink: parsed.qrLink || config.qrLink,
          evaluatorName: parsed.evaluatorName || config.evaluatorName,
          evaluatorCref: parsed.evaluatorCref || config.evaluatorCref,
          themeId: parsed.themeId || config.themeId
        };
      }
    } catch (e) {
      console.error("Erro ao carregar configuracoes da consultoria no PDF:", e);
    }

    // Cores da Identidade Visual baseada no Tema Selecionado
    let primaryThemeColor = [15, 23, 42];      // Slate 900
    let primaryLightThemeColor = [30, 41, 59]; // Slate 800
    let accentThemeColor = [13, 148, 136];     // Teal 600

    if (config.themeId === "blue") {
      primaryThemeColor = [30, 58, 138];
      primaryLightThemeColor = [59, 130, 246];
      accentThemeColor = [30, 58, 138];
    } else if (config.themeId === "emerald") {
      primaryThemeColor = [6, 78, 59];
      primaryLightThemeColor = [16, 185, 129];
      accentThemeColor = [6, 78, 59];
    } else if (config.themeId === "crimson") {
      primaryThemeColor = [127, 29, 29];
      primaryLightThemeColor = [220, 38, 38];
      accentThemeColor = [127, 29, 29];
    } else if (config.themeId === "purple") {
      primaryThemeColor = [88, 28, 135];
      primaryLightThemeColor = [139, 92, 246];
      accentThemeColor = [88, 28, 135];
    } else if (config.themeId === "amber") {
      primaryThemeColor = [120, 53, 4];
      primaryLightThemeColor = [217, 119, 6];
      accentThemeColor = [120, 53, 4];
    } else if (config.themeId === "slate") {
      primaryThemeColor = [30, 41, 59];
      primaryLightThemeColor = [100, 116, 139];
      accentThemeColor = [30, 41, 59];
    }

    // Premium Color Palette
    const COLORS = {
      primary: primaryThemeColor,
      primaryLight: primaryLightThemeColor,
      accent: accentThemeColor,
      accentLight: [204, 255, 0], // Neon Green/Yellow
      bgLight: [248, 250, 252],   // Slate 50
      textDark: [15, 23, 42],     // Slate 900
      textMedium: [71, 85, 105],  // Slate 600
      textLight: [148, 163, 184], // Slate 400
      alertCriticalBg: [254, 226, 226], // Rose 100
      alertCriticalText: [153, 27, 27], // Rose 800
      alertCriticalIndicator: [239, 68, 68], // Rose 500
      alertWarningBg: [254, 243, 199], // Amber 100
      alertWarningText: [146, 64, 14], // Amber 800
      alertWarningIndicator: [245, 158, 11] // Amber 500
    };

    // Helper to sanitize text (strictly remove emojis, clean invisible characters, normalize accents, and remove ligatures)
    const sanitizeText = (text: string): string => {
      if (!text) return "";
      
      let limpo = text
        .replace(/\u200b/g, "") // zero-width space
        .replace(/\u00ad/g, "") // soft hyphen
        .replace(/\u2011/g, "-") // non-breaking hyphen
        .replace(/\u2013/g, "-") // en dash
        .replace(/\u2014/g, "-") // em dash
        .replace(/\u2018/g, "'") // left single quote
        .replace(/\u2019/g, "'") // right single quote
        .replace(/\u201c/g, '"') // left double quote
        .replace(/\u201d/g, '"') // right double quote
        .replace(/\ufb01/g, "fi") // ligadura fi
        .replace(/\ufb02/g, "fl") // ligadura fl
        .replace(/\ufb03/g, "ffi") // ligadura ffi
        .replace(/\ufb04/g, "ffl") // ligadura ffl
        // Remove emojis e caracteres especiais nao-ASCII decorativos
        .replace(/[\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD00-\uDFFF]/g, "");

      // Decompor caracteres acentuados para retirar os acentos que quebram a fonte padrao do jsPDF
      limpo = limpo.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

      // Substituir cedilhas e caracteres especificos
      limpo = limpo
        .replace(/[çÇ]/g, (match) => match === 'ç' ? 'c' : 'C')
        .replace(/[æÆ]/g, "ae")
        .replace(/[œŒ]/g, "oe")
        .replace(/[ß]/g, "ss")
        .replace(/[øØ]/g, "o")
        .replace(/[“”]/g, '"')
        .replace(/[‘’]/g, "'")
        .replace(/•/g, "-")
        .trim();

      // Filtrar estritamente para manter apenas caracteres ASCII imprimiveis padrao de 7 bits
      return limpo.replace(/[^\x09\x0A\x0D\x20-\x7E]/g, "");
    };

    // Wrapper para doc.text que limpa automaticamente todo texto para evitar encoding quebrado ou caracteres invisiveis
    const originalDocText = doc.text.bind(doc);
    doc.text = (text: any, x: number, y: number, options?: any) => {
      if (typeof text === "string") {
        return originalDocText(sanitizeText(text), x, y, options);
      } else if (Array.isArray(text)) {
        const cleanedLines = text.map(line => typeof line === "string" ? sanitizeText(line) : line);
        return originalDocText(cleanedLines, x, y, options);
      }
      return originalDocText(text, x, y, options);
    };

    // Helper for multi-page safe text wrapping
    const writeTextWrapped = (text: string, x: number, y: number, maxWidth: number, fontSize = 10, fontStyle = "normal", color = COLORS.textMedium, lineHeight = 5.5) => {
      doc.setFont("helvetica", fontStyle);
      doc.setFontSize(fontSize);
      doc.setTextColor(color[0], color[1], color[2]);
      
      const lines = doc.splitTextToSize(sanitizeText(text) || "", maxWidth);
      for (let i = 0; i < lines.length; i++) {
        if (y > 260) {
          doc.addPage();
          y = 25;
          doc.setFont("helvetica", fontStyle);
          doc.setFontSize(fontSize);
          doc.setTextColor(color[0], color[1], color[2]);
        }
        doc.text(lines[i], x, y);
        y += lineHeight;
      }
      return y;
    };

    // PAGE 1: BRAND HEADER & ATHLETE INFO & GENERAL SUMMARY
    doc.setFillColor(COLORS.primary[0], COLORS.primary[1], COLORS.primary[2]);
    doc.rect(0, 0, 210, 48, "F");

    // Accent line below the dark header
    doc.setFillColor(COLORS.accent[0], COLORS.accent[1], COLORS.accent[2]);
    doc.rect(0, 45, 210, 3, "F");

    // Header Titles
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.setTextColor(255, 255, 255);
    doc.text(config.logoText.toUpperCase(), 20, 18);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(COLORS.accentLight[0], COLORS.accentLight[1], COLORS.accentLight[2]);
    doc.text(config.slogan.toUpperCase(), 20, 25);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(190, 200, 210);
    doc.text("LAUDO INTEGRADO DE EVOLUCAO E PERFORMANCE", 20, 34);

    // Right Side Metadata
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(255, 255, 255);
    doc.text("DOCUMENTO OFICIAL", 145, 18);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(180, 180, 180);
    doc.text(`EMISSAO: ${new Date().toLocaleDateString("pt-BR")}`, 145, 24);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(COLORS.accentLight[0], COLORS.accentLight[1], COLORS.accentLight[2]);
    doc.text("STATUS: ATIVO", 145, 30);

    // 1. Athlete Information Rounded Card
    doc.setFillColor(COLORS.bgLight[0], COLORS.bgLight[1], COLORS.bgLight[2]);
    doc.roundedRect(20, 56, 170, 38, 4, 4, "F");
    
    // Teal vertical block on the left
    doc.setFillColor(COLORS.accent[0], COLORS.accent[1], COLORS.accent[2]);
    doc.rect(20, 56, 3, 38, "F");

    // Info Content
    // Col 1 (x=27)
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(COLORS.textLight[0], COLORS.textLight[1], COLORS.textLight[2]);
    doc.text("ATLETA", 27, 65);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(COLORS.textDark[0], COLORS.textDark[1], COLORS.textDark[2]);
    doc.text(currentStudent.name.toUpperCase(), 27, 70);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(COLORS.textLight[0], COLORS.textLight[1], COLORS.textLight[2]);
    doc.text("IDADE", 27, 80);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(COLORS.primaryLight[0], COLORS.primaryLight[1], COLORS.primaryLight[2]);
    doc.text(`${currentStudent.age || 30} ANOS`, 27, 85);

    // Col 2 (x=90)
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(COLORS.textLight[0], COLORS.textLight[1], COLORS.textLight[2]);
    doc.text("ALTURA", 90, 65);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(COLORS.textDark[0], COLORS.textDark[1], COLORS.textDark[2]);
    doc.text(`${currentStudent.height || 175} CM`, 90, 70);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(COLORS.textLight[0], COLORS.textLight[1], COLORS.textLight[2]);
    doc.text("PESO ATUAL", 90, 80);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(COLORS.textDark[0], COLORS.textDark[1], COLORS.textDark[2]);
    doc.text(`${currentStudent.weight || 75} KG`, 90, 85);

    // Col 3 (x=140)
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(COLORS.textLight[0], COLORS.textLight[1], COLORS.textLight[2]);
    doc.text("FOCO PRINCIPAL", 140, 65);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(COLORS.accent[0], COLORS.accent[1], COLORS.accent[2]);
    doc.text((currentStudent.currentPhase || currentStudent.objective || "PERFORMANCE").toUpperCase(), 140, 70);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(COLORS.textLight[0], COLORS.textLight[1], COLORS.textLight[2]);
    doc.text("CONTATO", 140, 80);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(COLORS.textDark[0], COLORS.textDark[1], COLORS.textDark[2]);
    doc.text(currentStudent.phone || "NAO INFORMADO", 140, 85);

    let y = 104;

    // Bento Score Card Left side / Summary Right side
    // Score background card
    doc.setFillColor(241, 245, 249);
    doc.roundedRect(20, y, 42, 40, 4, 4, "F");

    // Top Dark Label bar on Score
    doc.setFillColor(COLORS.primary[0], COLORS.primary[1], COLORS.primary[2]);
    doc.roundedRect(20, y, 42, 10, 2, 2, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(255, 255, 255);
    doc.text("SCORE GLOBAL", 41, y + 6.5, { align: "center" });

    // The Score Big Numbers
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.setTextColor(COLORS.primary[0], COLORS.primary[1], COLORS.primary[2]);
    doc.text(`${p.resumoGeral?.notaSaude}`, 41, y + 25, { align: "center" });

    // Score categorization pill below the number
    const isRatingGreen = p.resumoGeral?.classificacaoCor === "green";
    const ratingColor = isRatingGreen ? [16, 185, 129] : [245, 158, 11];
    const ratingLabel = isRatingGreen ? "EXCELENTE" : "ATENCAO";

    doc.setFillColor(ratingColor[0], ratingColor[1], ratingColor[2]);
    doc.roundedRect(25, y + 30, 32, 6.5, 3.2, 3.2, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    doc.setTextColor(255, 255, 255);
    doc.text(ratingLabel, 41, y + 34.5, { align: "center" });

    // Summary Text on Right side
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(COLORS.textDark[0], COLORS.textDark[1], COLORS.textDark[2]);
    doc.text("1. RESUMO EXECUTIVO DO FISIOLOGISTA", 68, y + 6);

    // Underline indicator
    doc.setDrawColor(COLORS.accent[0], COLORS.accent[1], COLORS.accent[2]);
    doc.setLineWidth(0.5);
    doc.line(68, y + 8, 115, y + 8);

    y = writeTextWrapped(p.resumoGeral?.justificativaNota, 68, y + 15, 122, 9.5, "normal", COLORS.textMedium, 5.5);

    // --- NEW PAGE 2: COMPOSICAO CORPORAL & ANTROPOMETRIA ---
    if (latestEval) {
      doc.addPage();
      let cy = 25;
      
      doc.setFillColor(COLORS.accent[0], COLORS.accent[1], COLORS.accent[2]);
      doc.rect(20, cy, 4, 8, "F");
      cy = writeTextWrapped("2. AVALIACAO DA COMPOSICAO CORPORAL", 27, cy + 6, 163, 14, "bold", COLORS.textDark);
      cy += 5;

      // Draw general result cards: Weight, % Fat, Muscle, Fat Mass, IMC, TMB, GET
      const r = latestEval.resultados;
      const metrics = [
        { label: "PESO CORPORAL", val: `${r.peso || currentStudent.weight || 75} KG`, sub: "" },
        { label: "PERCENTUAL GORDURA", val: `${r.percentualGordura || 15} %`, sub: `Massa Gorda: ${r.massaGorda || 11} kg` },
        { label: "MASSA MUSCULAR", val: `${r.percentualMassaMuscular || 42} %`, sub: `Massa Magra: ${r.massaMagra || 64} kg` },
        { label: "INDICE IMC", val: `${r.imc || 24} kg/m2`, sub: `Classif: Normal` },
        { label: "METABOLISMO (TMB)", val: `${r.tmb || 1750} Kcal`, sub: `GET: ${r.get || 2400} Kcal` }
      ];

      // Draw horizontal metric row
      let mx = 20;
      metrics.forEach((m) => {
        doc.setFillColor(COLORS.bgLight[0], COLORS.bgLight[1], COLORS.bgLight[2]);
        doc.roundedRect(mx, cy, 32, 22, 3, 3, "F");
        doc.setDrawColor(229, 231, 235);
        doc.setLineWidth(0.3);
        doc.roundedRect(mx, cy, 32, 22, 3, 3, "D");

        doc.setFont("helvetica", "bold");
        doc.setFontSize(6.5);
        doc.setTextColor(COLORS.textLight[0], COLORS.textLight[1], COLORS.textLight[2]);
        doc.text(m.label, mx + 16, cy + 5, { align: "center" });

        doc.setFont("helvetica", "bold");
        doc.setFontSize(10.5);
        doc.setTextColor(COLORS.primary[0], COLORS.primary[1], COLORS.primary[2]);
        doc.text(m.val, mx + 16, cy + 12, { align: "center" });

        // Format subtext to fit well inside the cards (especially for PESO CORPORAL)
        let subText = m.sub;
        if (m.label === "PESO CORPORAL") {
          subText = "";
        }

        // Adjust font size dynamically based on length to completely avoid overflow
        let currentFontSize = 6;
        if (subText.length > 20) {
          currentFontSize = 5;
        } else if (subText.length > 15) {
          currentFontSize = 5.5;
        }

        doc.setFont("helvetica", "normal");
        doc.setFontSize(currentFontSize);
        doc.setTextColor(COLORS.textMedium[0], COLORS.textMedium[1], COLORS.textMedium[2]);
        doc.text(subText, mx + 16, cy + 18, { align: "center" });

        mx += 34;
      });

      cy += 28;

      // Two columns: Left (Dobras Cutaneas), Right (Perimetros)
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(COLORS.textDark[0], COLORS.textDark[1], COLORS.textDark[2]);
      doc.text("TABELA DE DOBRAS CUTANEAS (MM)", 20, cy);
      doc.text("TABELA DE PERIMETROS CORPORAIS (CM)", 108, cy);
      cy += 3;

      // Dobras table
      const dobrasList = [
        { l: "Subescapular", v: latestEval.dobras?.subescapular || "-" },
        { l: "Triceps", v: latestEval.dobras?.triceps || "-" },
        { l: "Biceps", v: latestEval.dobras?.biceps || "-" },
        { l: "Peitoral", v: latestEval.dobras?.peitoral || "-" },
        { l: "Media Axilar", v: latestEval.dobras?.mediaAxilar || "-" },
        { l: "Suprailiaca", v: latestEval.dobras?.suprailiaca || "-" },
        { l: "Abdomen", v: latestEval.dobras?.abdomen || "-" },
        { l: "Coxa", v: latestEval.dobras?.coxa || "-" },
        { l: "Panturrilha", v: latestEval.dobras?.panturrilha || "-" }
      ];

      // Perimetros table
      const pData = latestEval.perimetros;
      const perimetrosList = pData ? [
        { l: "Pescoco", v: pData.pescoco || "-" },
        { l: "Ombros", v: pData.ombros || "-" },
        { l: "Torax", v: pData.torax || "-" },
        { l: "Cintura", v: pData.cintura || "-" },
        { l: "Abdomen", v: pData.abdomen || "-" },
        { l: "Quadril", v: pData.quadril || "-" },
        { l: "Braco D (Contraido)", v: pData.bracoD || "-" },
        { l: "Braco E (Contraido)", v: pData.bracoE || "-" },
        { l: "Antebraco D", v: pData.antebracoD || "-" },
        { l: "Coxa D", v: pData.coxaD || "-" },
        { l: "Panturrilha D", v: pData.panturrilhaD || "-" }
      ] : [
        { l: "Torax", v: "-" },
        { l: "Cintura", v: "-" },
        { l: "Abdomen", v: "-" },
        { l: "Quadril", v: "-" },
        { l: "Braco Direito", v: "-" },
        { l: "Braco Esquerdo", v: "-" },
        { l: "Coxa Direita", v: "-" },
        { l: "Coxa Esquerda", v: "-" }
      ];

      // Draw tables in a grid style
      let tableY = cy;
      
      // Dobras col background
      doc.setFillColor(COLORS.bgLight[0], COLORS.bgLight[1], COLORS.bgLight[2]);
      doc.roundedRect(20, tableY, 80, 80, 2, 2, "F");
      
      let dy = tableY + 6;
      dobrasList.forEach((d) => {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8.5);
        doc.setTextColor(COLORS.textMedium[0], COLORS.textMedium[1], COLORS.textMedium[2]);
        doc.text(d.l, 25, dy);
        
        doc.setFont("helvetica", "bold");
        doc.setTextColor(COLORS.primary[0], COLORS.primary[1], COLORS.primary[2]);
        doc.text(`${d.v} mm`, 90, dy, { align: "right" });
        
        // draw dotted divider
        doc.setDrawColor(220, 225, 230);
        doc.setLineWidth(0.1);
        doc.line(25, dy + 2, 90, dy + 2);
        
        dy += 8;
      });

      // Perimetros col background
      doc.setFillColor(COLORS.bgLight[0], COLORS.bgLight[1], COLORS.bgLight[2]);
      doc.roundedRect(108, tableY, 82, 80, 2, 2, "F");

      let py = tableY + 6;
      perimetrosList.forEach((per) => {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.setTextColor(COLORS.textMedium[0], COLORS.textMedium[1], COLORS.textMedium[2]);
        doc.text(per.l, 113, py);
        
        doc.setFont("helvetica", "bold");
        doc.setTextColor(COLORS.primary[0], COLORS.primary[1], COLORS.primary[2]);
        doc.text(`${per.v} cm`, 182, py, { align: "right" });
        
        // draw dotted divider
        doc.setDrawColor(220, 225, 230);
        doc.setLineWidth(0.1);
        doc.line(113, py + 1.5, 182, py + 1.5);
        
        py += 6.5;
      });

      // Visual progress / Somatotipo card at bottom of compostion page
      cy = tableY + 85;

      const somatotipo = r.somatotipo || "Meso-Endomorfo";
      const acumulo = r.regioesAcumulo || "Predominio na regiao central e abdominal";
      const mudancas = r.mudancasComposicao || "Evolucao favoravel com preservacao de massa magra.";

      const somatotipoFullText = `Somatotipo Predominante: ${somatotipo}`;
      const acumuloFullText = `Regioes de Acumulo: ${acumulo}`;
      const mudancasFullText = `Evolucao: ${mudancas}`;

      const maxWidth = 158; // 170 - 12 (margins of 6mm on each side)
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      
      const linesSomatotipo = doc.splitTextToSize(sanitizeText(somatotipoFullText), maxWidth);
      const linesAcumulo = doc.splitTextToSize(sanitizeText(acumuloFullText), maxWidth);
      const linesMudancas = doc.splitTextToSize(sanitizeText(mudancasFullText), maxWidth);

      const totalLinesCount = linesSomatotipo.length + linesAcumulo.length + linesMudancas.length;
      const lineHeight = 4.2;
      const cardHeight = 11 + (totalLinesCount * lineHeight) + 4; // 11 padding top, 4 padding bottom

      doc.setFillColor(241, 245, 249);
      doc.roundedRect(20, cy, 170, cardHeight, 4, 4, "F");
      doc.setFillColor(COLORS.accent[0], COLORS.accent[1], COLORS.accent[2]);
      doc.rect(20, cy, 3, cardHeight, "F");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(COLORS.primary[0], COLORS.primary[1], COLORS.primary[2]);
      doc.text("ANALISE SOMATOTIPICA & ACUMULO DE GORDURA", 26, cy + 6);

      let textY = cy + 11;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(COLORS.textMedium[0], COLORS.textMedium[1], COLORS.textMedium[2]);

      // Draw Somatotipo lines
      linesSomatotipo.forEach((line: string) => {
        doc.text(line, 26, textY);
        textY += lineHeight;
      });
      
      // Draw Acumulo lines
      linesAcumulo.forEach((line: string) => {
        doc.text(line, 26, textY);
        textY += lineHeight;
      });

      // Draw Mudancas lines
      linesMudancas.forEach((line: string) => {
        doc.text(line, 26, textY);
        textY += lineHeight;
      });
    }

    // --- NEW PAGE 3: MAPEAMENTO POSTURAL & BIOMECANICA ---
    if (latestPostural) {
      doc.addPage();
      let py = 25;

      doc.setFillColor(COLORS.accent[0], COLORS.accent[1], COLORS.accent[2]);
      doc.rect(20, py, 4, 8, "F");
      py = writeTextWrapped("3. LAUDO DE BIOMECANICA POSTURAL (IA)", 27, py + 6, 163, 14, "bold", COLORS.textDark);
      py += 5;

      // KPIs row for posture alignment
      const k = latestPostural.kpis;
      const posturalKPIs = [
        { label: "ALINHAMENTO GERAL", val: `${k.geral || 85} %`, sub: `Risco: ${k.compensacaoRisco || "Baixo"}` },
        { label: "POSTURA CERVICAL", val: `${k.cervical || 80} %`, sub: "Cabeca/Pescoco" },
        { label: "POSTURA ESCAPULAR", val: `${k.escapular || 85} %`, sub: "Ombros/Clavicula" },
        { label: "EQUILIBRIO PELVICO", val: `${k.pelvico || 90} %`, sub: "Simetria Quadril" },
        { label: "SIMETRIA BILATERAL", val: `${k.simetria || 88} %`, sub: "Ombro/Pelve" }
      ];

      // Draw horizontal postural row
      let px = 20;
      posturalKPIs.forEach((kpi) => {
        doc.setFillColor(COLORS.bgLight[0], COLORS.bgLight[1], COLORS.bgLight[2]);
        doc.roundedRect(px, py, 32, 22, 3, 3, "F");
        doc.setDrawColor(229, 231, 235);
        doc.setLineWidth(0.3);
        doc.roundedRect(px, py, 32, 22, 3, 3, "D");

        doc.setFont("helvetica", "bold");
        doc.setFontSize(6.5);
        doc.setTextColor(COLORS.textLight[0], COLORS.textLight[1], COLORS.textLight[2]);
        doc.text(kpi.label, px + 16, py + 5, { align: "center" });

        doc.setFont("helvetica", "bold");
        doc.setFontSize(10.5);
        doc.setTextColor(COLORS.primary[0], COLORS.primary[1], COLORS.primary[2]);
        doc.text(kpi.val, px + 16, py + 12, { align: "center" });

        doc.setFont("helvetica", "normal");
        doc.setFontSize(6);
        doc.setTextColor(COLORS.textMedium[0], COLORS.textMedium[1], COLORS.textMedium[2]);
        doc.text(kpi.sub, px + 16, py + 18, { align: "center" });

        px += 34;
      });

      py += 28;

      // Add Postural Photos Front & Side side-by-side with overlaid points
      const fPhoto = latestPostural.photos?.front;
      const rPhoto = latestPostural.photos?.right || latestPostural.photos?.left || latestPostural.photos?.back;

      // Front Photo Column
      if (fPhoto) {
        doc.setDrawColor(200, 205, 210);
        doc.setLineWidth(0.4);
        doc.roundedRect(29, py, 62, 92, 1, 1, "D");
        
        try {
          doc.addImage(fPhoto, "JPEG", 30, py + 1, 60, 90);
        } catch (err) {
          console.error("Error drawing front photo in PDF", err);
          doc.setFont("helvetica", "italic");
          doc.setFontSize(8);
          doc.setTextColor(150, 150, 150);
          doc.text("[Imagem Frontal]", 60, py + 45, { align: "center" });
        }

        // Overlay markers for Front
        if (latestPostural.markers?.front) {
          latestPostural.markers.front.forEach((m: any) => {
            const mx = 30 + (m.x / 100) * 60;
            const my = (py + 1) + (m.y / 100) * 90;
            
            // Draw marker dot
            if (m.type === "error") doc.setFillColor(239, 68, 68);
            else if (m.type === "warning") doc.setFillColor(245, 158, 11);
            else doc.setFillColor(COLORS.accent[0], COLORS.accent[1], COLORS.accent[2]);
            
            doc.setDrawColor(255, 255, 255);
            doc.setLineWidth(0.2);
            doc.circle(mx, my, 1.2, "FD");
          });
        }

        doc.setFont("helvetica", "bold");
        doc.setFontSize(8.5);
        doc.setTextColor(COLORS.textDark[0], COLORS.textDark[1], COLORS.textDark[2]);
        doc.text("VISTA FRONTAL ANTERIOR", 60, py + 97, { align: "center" });
      } else {
        doc.setFillColor(COLORS.bgLight[0], COLORS.bgLight[1], COLORS.bgLight[2]);
        doc.roundedRect(29, py, 62, 92, 2, 2, "F");
        doc.setFont("helvetica", "italic");
        doc.setFontSize(8.5);
        doc.setTextColor(150, 150, 150);
        doc.text("FOTO FRONTAL NAO DISPONIVEL", 60, py + 46, { align: "center" });
      }

      // Side Photo Column
      if (rPhoto) {
        doc.setDrawColor(200, 205, 210);
        doc.setLineWidth(0.4);
        doc.roundedRect(119, py, 62, 92, 1, 1, "D");

        try {
          doc.addImage(rPhoto, "JPEG", 120, py + 1, 60, 90);
        } catch (err) {
          console.error("Error drawing side photo in PDF", err);
          doc.setFont("helvetica", "italic");
          doc.setFontSize(8);
          doc.setTextColor(150, 150, 150);
          doc.text("[Imagem Lateral]", 150, py + 45, { align: "center" });
        }

        // Overlay markers for Side
        const sideMarkers = latestPostural.markers?.right || latestPostural.markers?.left || latestPostural.markers?.back;
        if (sideMarkers) {
          sideMarkers.forEach((m: any) => {
            const mx = 120 + (m.x / 100) * 60;
            const my = (py + 1) + (m.y / 100) * 90;
            
            // Draw marker dot
            if (m.type === "error") doc.setFillColor(239, 68, 68);
            else if (m.type === "warning") doc.setFillColor(245, 158, 11);
            else doc.setFillColor(COLORS.accent[0], COLORS.accent[1], COLORS.accent[2]);

            doc.setDrawColor(255, 255, 255);
            doc.setLineWidth(0.2);
            doc.circle(mx, my, 1.2, "FD");
          });
        }

        doc.setFont("helvetica", "bold");
        doc.setFontSize(8.5);
        doc.setTextColor(COLORS.textDark[0], COLORS.textDark[1], COLORS.textDark[2]);
        doc.text("VISTA LATERAL COBERTA", 150, py + 97, { align: "center" });
      } else {
        doc.setFillColor(COLORS.bgLight[0], COLORS.bgLight[1], COLORS.bgLight[2]);
        doc.roundedRect(119, py, 62, 92, 2, 2, "F");
        doc.setFont("helvetica", "italic");
        doc.setFontSize(8.5);
        doc.setTextColor(150, 150, 150);
        doc.text("FOTO LATERAL NAO DISPONIVEL", 150, py + 46, { align: "center" });
      }

      py += 103;

      // Quick diagnostic text at bottom of postural mapping
      doc.setFillColor(241, 245, 249);
      doc.roundedRect(20, py, 170, 18, 4, 4, "F");
      doc.setFillColor(COLORS.accent[0], COLORS.accent[1], COLORS.accent[2]);
      doc.rect(20, py, 3, 18, "F");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(8.5);
      doc.setTextColor(COLORS.primary[0], COLORS.primary[1], COLORS.primary[2]);
      doc.text("LAUDO BIOMECANICO RESUMIDO", 26, py + 5.5);

      const dor = latestPostural.answers?.dorAtual === "Sim" ? `Paciente relata dor no local: ${latestPostural.answers?.localDor}` : "Sem queixas de dores posturais no momento";
      const nivel = `Nivel de Atividade: ${latestPostural.answers?.nivelTreino || "Intermediario"}  |  Tempo Sentado: ${latestPostural.answers?.tempoSentado || 6} horas/dia`;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      doc.setTextColor(COLORS.textMedium[0], COLORS.textMedium[1], COLORS.textMedium[2]);
      doc.text(`${dor}  |  ${nivel}`, 26, py + 12);

      if (latestPostural.aiReport) {
        py += 24;
        if (py > 220) {
          doc.addPage();
          py = 25;
        }
        doc.setFillColor(COLORS.accent[0], COLORS.accent[1], COLORS.accent[2]);
        doc.rect(20, py, 4, 6, "F");
        py = writeTextWrapped("PARECER TECNICO POSTURAL (LAUDO INTELIGENTE)", 26, py + 4.5, 163, 9.5, "bold", COLORS.textDark);
        py += 3;
        py = writeTextWrapped(latestPostural.aiReport, 20, py, 170, 8, "normal", COLORS.textMedium, 4.5);
      }
    }

    // PAGE 4: INTEGRATED ANALYSIS AND CROSS PHYSIOLOGICAL CORRELATIONS
    doc.addPage();
    y = 25;

    // Header Title
    doc.setFillColor(COLORS.accent[0], COLORS.accent[1], COLORS.accent[2]);
    doc.rect(20, y, 4, 8, "F");
    y = writeTextWrapped("4. ANALISE INTEGRADA E CORRELACOES FISIOLOGICAS", 27, y + 6, 163, 14, "bold", COLORS.textDark);
    y += 5;

    // Comprehensive Profile Card
    const profileText = p.analiseIntegrada?.perfilGeral;
    const profileLines = doc.splitTextToSize(profileText || "", 160);
    const profileHeight = (profileLines.length * 5) + 12;

    doc.setFillColor(COLORS.bgLight[0], COLORS.bgLight[1], COLORS.bgLight[2]);
    doc.roundedRect(20, y, 170, profileHeight, 4, 4, "F");
    doc.setFillColor(COLORS.accent[0], COLORS.accent[1], COLORS.accent[2]);
    doc.rect(20, y, 2.5, profileHeight, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(COLORS.accent[0], COLORS.accent[1], COLORS.accent[2]);
    doc.text("PERFIL FISIOLOGICO COMPREENSIVO", 25, y + 6);

    writeTextWrapped(profileText, 25, y + 12, 160, 9.5, "normal", COLORS.textMedium, 5);
    y += profileHeight + 8;

    // Title for correlations
    y = writeTextWrapped("CORRELACOES MULTISISTEMICAS IDENTIFICADAS", 20, y, 170, 11, "bold", COLORS.textDark);
    y += 3;

    // Correlations list as custom styled panels
    p.analiseIntegrada?.correlacoes?.forEach((corr: any) => {
      const tituloText = corr.titulo;
      const descText = corr.descricao;
      const titleLines = doc.splitTextToSize(tituloText || "", 160);
      const descLines = doc.splitTextToSize(descText || "", 160);
      const totalHeight = (titleLines.length * 5) + (descLines.length * 4.5) + 9;
      
      if (y + totalHeight > 260) {
        doc.addPage();
        y = 25;
      }
      
      doc.setFillColor(250, 251, 252);
      doc.roundedRect(20, y, 170, totalHeight, 3, 3, "F");
      doc.setFillColor(COLORS.accent[0], COLORS.accent[1], COLORS.accent[2]);
      doc.rect(20, y, 2, totalHeight, "F");
      
      y = writeTextWrapped(tituloText, 25, y + 5, 160, 9.5, "bold", COLORS.textDark, 5);
      y = writeTextWrapped(descText, 25, y + 1, 160, 8.5, "normal", COLORS.textMedium, 4.5);
      y += 4.5;
    });

    y += 4;
    
    // Attention points title
    if (y + 15 > 260) {
      doc.addPage();
      y = 25;
    }
    y = writeTextWrapped("PONTOS DE ATENCAO E ADVERTENCIAS CLINICAS", 20, y, 170, 11, "bold", COLORS.textDark);
    y += 3;

    // Alert panels
    p.analiseIntegrada?.pontosAtencao?.forEach((pnt: any) => {
      const isCritico = pnt.prioridade === "CRITICO";
      const bg = isCritico ? COLORS.alertCriticalBg : COLORS.alertWarningBg;
      const textCol = isCritico ? COLORS.alertCriticalText : COLORS.alertWarningText;
      const indicator = isCritico ? COLORS.alertCriticalIndicator : COLORS.alertWarningIndicator;
      
      const itemText = pnt.item;
      const lines = doc.splitTextToSize(`[${pnt.prioridade}] ${itemText}`, 155);
      const cardHeight = Math.max(12, lines.length * 5 + 6);
      
      if (y + cardHeight > 260) {
        doc.addPage();
        y = 25;
      }
      
      doc.setFillColor(bg[0], bg[1], bg[2]);
      doc.roundedRect(20, y, 170, cardHeight, 3, 3, "F");
      doc.setFillColor(indicator[0], indicator[1], indicator[2]);
      doc.rect(20, y, 2.5, cardHeight, "F");
      
      y = writeTextWrapped(`[${pnt.prioridade}] ${itemText}`, 25, y + 5, 155, 9, "normal", textCol, 5);
      y += 4;
    });

    // PAGE 3: THE 45-DAY INTEGRATED ACTION PLAN
    doc.addPage();
    y = 25;

    doc.setFillColor(COLORS.accent[0], COLORS.accent[1], COLORS.accent[2]);
    doc.rect(20, y, 4, 8, "F");
    y = writeTextWrapped("5. PLANO DE ACAO INTEGRADO (45 DIAS)", 27, y + 6, 163, 14, "bold", COLORS.textDark);
    y += 5;

    // Pillar A: Treinamento
    if (p.planoAcao?.treinamento) {
      const train = p.planoAcao.treinamento;
      const cardY = y;
      
      doc.setFillColor(COLORS.bgLight[0], COLORS.bgLight[1], COLORS.bgLight[2]);
      doc.roundedRect(20, y, 170, 52, 4, 4, "F");
      doc.setFillColor(COLORS.accent[0], COLORS.accent[1], COLORS.accent[2]);
      doc.rect(20, y, 3, 52, "F");
      
      y = writeTextWrapped("PILAR A: TREINAMENTO FISICO COMPREENSIVO", 26, y + 5, 160, 10.5, "bold", COLORS.accent);
      y = writeTextWrapped(`Foco Principal: ${train.focoPrincipal}`, 26, y + 2, 160, 9, "normal", COLORS.textMedium, 4.5);
      y = writeTextWrapped(`Frequencia: ${train.frequencia} | Divisao: ${train.divisaoSugerida}`, 26, y + 1, 160, 8.5, "normal", COLORS.textMedium, 4.5);
      y = writeTextWrapped(`Exercicios Prioritarios: ${train.exerciciosPrioritarios ? train.exerciciosPrioritarios.join(", ") : ""}`, 26, y + 1, 160, 8.5, "normal", COLORS.textMedium, 4.5);
      y = writeTextWrapped(`Exercicios a Evitar: ${train.exerciciosEvitar ? train.exerciciosEvitar.join(", ") : ""}`, 26, y + 1, 160, 8.5, "bold", COLORS.alertCriticalText, 4.5);
      y = writeTextWrapped(`Zona de Cardio Alvo: ${train.zonaCardio}`, 26, y + 1, 160, 8.5, "normal", COLORS.textMedium, 4.5);
      y = cardY + 56;
    }

    // Pillar B: Nutricao
    if (p.planoAcao?.nutricao) {
      const nutr = p.planoAcao.nutricao;
      const cardY = y;
      
      if (y + 48 > 260) {
        doc.addPage();
        y = 25;
      }
      
      doc.setFillColor(COLORS.bgLight[0], COLORS.bgLight[1], COLORS.bgLight[2]);
      doc.roundedRect(20, y, 170, 44, 4, 4, "F");
      doc.setFillColor(COLORS.accent[0], COLORS.accent[1], COLORS.accent[2]);
      doc.rect(20, y, 3, 44, "F");
      
      y = writeTextWrapped("PILAR B: SUPORTE NUTRICIONAL & MACRONUTRIENTES", 26, y + 5, 160, 10.5, "bold", COLORS.accent);
      y = writeTextWrapped(`Metas Caloricas: ${nutr.calorias}`, 26, y + 2, 160, 9, "normal", COLORS.textMedium, 4.5);
      y = writeTextWrapped(`Distribuicao de Macros: ${nutr.macros}`, 26, y + 1, 160, 8.5, "normal", COLORS.textMedium, 4.5);
      y = writeTextWrapped(`Suplementacao Recomendada: ${nutr.suplementacao}`, 26, y + 1, 160, 8.5, "normal", COLORS.textMedium, 4.5);
      y = writeTextWrapped(`Meta de Hidratacao: ${nutr.hidratacao}`, 26, y + 1, 160, 8.5, "normal", COLORS.textMedium, 4.5);
      y = Math.max(y, cardY + 48);
    }

    // Pillar C: Recuperacao
    if (p.planoAcao?.recuperacao) {
      const rec = p.planoAcao.recuperacao;
      const cardY = y;
      
      if (y + 42 > 260) {
        doc.addPage();
        y = 25;
      }
      
      doc.setFillColor(COLORS.bgLight[0], COLORS.bgLight[1], COLORS.bgLight[2]);
      doc.roundedRect(20, y, 170, 38, 4, 4, "F");
      doc.setFillColor(COLORS.accent[0], COLORS.accent[1], COLORS.accent[2]);
      doc.rect(20, y, 3, 38, "F");
      
      y = writeTextWrapped("PILAR C: RECUPERACAO, SONO & HIGIENE MENTAL", 26, y + 5, 160, 10.5, "bold", COLORS.accent);
      y = writeTextWrapped(`Sono Sugerido: ${rec.horasSono}`, 26, y + 2, 160, 9, "normal", COLORS.textMedium, 4.5);
      y = writeTextWrapped(`Higiene do Sono: ${rec.higieneSono ? rec.higieneSono.join(" / ") : ""}`, 26, y + 1, 160, 8.5, "normal", COLORS.textMedium, 4.5);
      y = writeTextWrapped(`Controle de Estresse: ${rec.manejoEstresse ? rec.manejoEstresse.join(" / ") : ""}`, 26, y + 1, 160, 8.5, "normal", COLORS.textMedium, 4.5);
      y = Math.max(y, cardY + 42);
    }

    // Pillar D: Monitoramento
    if (p.planoAcao?.monitoramento) {
      const mon = p.planoAcao.monitoramento;
      const cardY = y;
      
      if (y + 44 > 260) {
        doc.addPage();
        y = 25;
      }
      
      doc.setFillColor(COLORS.bgLight[0], COLORS.bgLight[1], COLORS.bgLight[2]);
      doc.roundedRect(20, y, 170, 40, 4, 4, "F");
      doc.setFillColor(COLORS.accent[0], COLORS.accent[1], COLORS.accent[2]);
      doc.rect(20, y, 3, 40, "F");
      
      y = writeTextWrapped("PILAR D: RASTREAMENTO E PREVENCAO DE LESOES", 26, y + 5, 160, 10.5, "bold", COLORS.accent);
      y = writeTextWrapped(`Metricas Chave: ${mon.metricas ? mon.metricas.join(", ") : ""}`, 26, y + 2, 160, 9, "normal", COLORS.textMedium, 4.5);
      y = writeTextWrapped(`Sinais de Alerta: ${mon.sinaisAlerta ? mon.sinaisAlerta.join(", ") : ""}`, 26, y + 1, 160, 8.5, "bold", COLORS.alertCriticalText, 4.5);
      y = writeTextWrapped(`Proxima Reavaliacao Clinica: ${mon.proximaReavaliacao}`, 26, y + 1, 160, 8.5, "normal", COLORS.textMedium, 4.5);
      y = Math.max(y, cardY + 44);
    }

    // PAGE 4: CRONOGRAMA & RECOMENDACOES
    doc.addPage();
    y = 25;

    doc.setFillColor(COLORS.accent[0], COLORS.accent[1], COLORS.accent[2]);
    doc.rect(20, y, 4, 8, "F");
    y = writeTextWrapped("6. CRONOGRAMA EVOLUTIVO DE 45 DIAS", 27, y + 6, 163, 14, "bold", COLORS.textDark);
    y += 5;

    const phaseConfig = [
      { key: "fase1", title: "FASE 1: ADAPTACAO & SINCRONIZACAO METABOLICA (DIAS 01-15)", color: COLORS.accent },
      { key: "fase2", title: "FASE 2: PROGRESSAO TENSIONAL & CONSOLIDACAO (DIAS 16-30)", color: COLORS.accent },
      { key: "fase3", title: "FASE 3: INTENSIFICACAO & PEAK PERFORMANCE (DIAS 31-45)", color: COLORS.primary }
    ];

    phaseConfig.forEach((pCfg) => {
      const fase = (p.cronograma as any)?.[pCfg.key];
      if (!fase) return;
      
      const cardY = y;
      const titleText = pCfg.title;
      const focoText = `Foco Estrategico: ${fase.foco}`;
      const metaText = `Meta Metrica: ${fase.meta}`;
      const acoesText = `Acoes Operacionais: ${fase.acoes ? fase.acoes.join("  /  ") : ""}`;
      
      const linesFoco = doc.splitTextToSize(focoText, 160);
      const linesMeta = doc.splitTextToSize(metaText, 160);
      const linesAcoes = doc.splitTextToSize(acoesText, 160);
      const heightPhase = (linesFoco.length * 4.5) + (linesMeta.length * 4.5) + (linesAcoes.length * 4.5) + 14;
      
      if (y + heightPhase > 260) {
        doc.addPage();
        y = 25;
      }
      
      doc.setFillColor(COLORS.bgLight[0], COLORS.bgLight[1], COLORS.bgLight[2]);
      doc.roundedRect(20, y, 170, heightPhase, 3, 3, "F");
      
      // Top colored bar for Phase header
      doc.setFillColor(pCfg.color[0], pCfg.color[1], pCfg.color[2]);
      doc.roundedRect(20, y, 170, 8, 3, 3, "F");
      doc.rect(20, y + 5, 170, 3, "F"); // cover rounded bottom
      
      y = writeTextWrapped(titleText, 25, y + 5.5, 160, 9.5, "bold", [255, 255, 255], 5);
      y += 3;
      y = writeTextWrapped(focoText, 25, y, 160, 8.5, "normal", COLORS.textMedium, 4.5);
      y = writeTextWrapped(metaText, 25, y, 160, 8.5, "bold", COLORS.accent, 4.5);
      y = writeTextWrapped(acoesText, 25, y, 160, 8.5, "normal", COLORS.textMedium, 4.5);
      
      y = Math.max(y, cardY + heightPhase) + 5;
    });

    // 5. RECOMENDACOES FINAIS
    if (p.recomendacoesFinais) {
      if (y + 35 > 260) {
        doc.addPage();
        y = 25;
      }
      
      y = writeTextWrapped("7. CONSIDERACOES E RECOMENDACOES DO FISIOLOGISTA", 20, y, 170, 11, "bold", COLORS.textDark);
      y += 2;
      y = writeTextWrapped(p.recomendacoesFinais, 20, y, 170, 9, "normal", COLORS.textMedium, 4.5);
      y += 6;
    }

    // AVISO LEGAL
    if (y + 20 > 260) {
      doc.addPage();
      y = 25;
    }
    y = writeTextWrapped("AVISO LEGAL", 20, y, 170, 8, "bold", COLORS.textLight);
    y = writeTextWrapped(p.avisoLegal || "Este laudo biomecanico e metabolico inteligente e de carater informativo e consultivo. Nao substitui consulta ortopedica ou cardiologica clinica.", 20, y, 170, 7.5, "normal", COLORS.textLight, 4);

    // DYNAMIC HEADER & FOOTER ON ALL PAGES WITH TOTAL COUNT
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      
      // Page numbers & border in footer on all pages
      doc.setDrawColor(229, 231, 235);
      doc.setLineWidth(0.3);
      doc.line(20, 278, 190, 278);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      doc.setTextColor(COLORS.textLight[0], COLORS.textLight[1], COLORS.textLight[2]);
      doc.text(`${config.companyName.toUpperCase()} • LAUDO DE DESEMPENHO CLINICO INTEGRADO`, 20, 283);
      doc.text(`Pagina ${i} de ${pageCount}`, 173, 283);

      // Header on all pages except the first one
      if (i > 1) {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(8);
        doc.setTextColor(COLORS.primaryLight[0], COLORS.primaryLight[1], COLORS.primaryLight[2]);
        doc.text(config.logoText.toUpperCase(), 20, 14);
        
        doc.setFont("helvetica", "normal");
        doc.setFontSize(7.5);
        doc.setTextColor(COLORS.textLight[0], COLORS.textLight[1], COLORS.textLight[2]);
        doc.text("•  LAUDO DE PERFORMANCE INTEGRADO", 20 + config.logoText.length * 2.2, 14);
        
        doc.setDrawColor(229, 231, 235);
        doc.setLineWidth(0.3);
        doc.line(20, 16, 190, 16);
      }
    }

    doc.save(`Laudo_Unificado_${currentStudent.name.replace(/\s+/g, "_")}.pdf`);
  };

  return (
    <div className="space-y-6">
      
      {/* 📌 Context Subheader */}
      <div className="border-b border-[#3a494b]/20 pb-4">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          📋 Etapa 05 - Laudo Unificado
        </h3>
        <p className="text-xs text-[#b9cacb] mt-1 font-mono">
          Consolide a composicao fisica (Etapa 1), desvios posturais (Etapa 2), planejamento nutricional (Etapa 3) e comparativos historicos (Etapa 4) em um laudo mestre para o aluno.
        </p>
      </div>

      {/* Warning message from local fallback if Gemini key missing */}
      {warningMessage && (
        <div className="bg-amber-950/30 border border-amber-800/50 p-4 rounded-xl flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="text-xs font-mono text-amber-200">
            <span className="font-bold">Aviso do Sistema: </span>
            {warningMessage}
          </div>
        </div>
      )}

      {/* Gender inconsistency confirmation alert */}
      {showGenderInconsistencyAlert && (
        <div className="bg-rose-950/40 border border-rose-800/60 p-5 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h5 className="font-bold text-sm text-rose-200">
                Inconsistência de Sexo Biológico Detectada!
              </h5>
              <p className="text-xs text-rose-300 font-mono leading-relaxed max-w-2xl">
                Identificamos uma possível divergência entre o primeiro nome do atleta (<span className="text-[#ccff00] font-bold">{currentStudent.name}</span>) e o sexo biológico derivado. Confirme o sexo biológico abaixo para garantir que todas as equações fisiológicas (TMB, RCQ, Gordura Corporal, etc.) gerem resultados perfeitamente precisos.
              </p>
            </div>
          </div>
          <div className="flex gap-2.5 shrink-0 self-end md:self-auto">
            <button
              onClick={() => handleConfirmGender("masculino")}
              className="bg-[#1b1c1e] hover:bg-[#343537] text-white border border-[#3a494b]/40 py-2 px-4 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer"
            >
              Confirmar Masculino ♂
            </button>
            <button
              onClick={() => handleConfirmGender("feminino")}
              className="bg-rose-600 hover:bg-rose-500 text-white py-2 px-4 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer shadow-[0_0_15px_rgba(244,63,94,0.2)]"
            >
              Confirmar Feminino ♀
            </button>
          </div>
        </div>
      )}

      {/* Tabs Menu */}
      <div className="flex flex-wrap gap-2 border-b border-gray-900 pb-3">
        <button
          onClick={() => setActiveTab("dashboard")}
          className={`px-4 py-2 rounded-lg text-xs font-bold font-mono transition-all cursor-pointer ${
            activeTab === "dashboard" 
              ? "bg-[#ccff00] text-black" 
              : "bg-[#1b1c1e] text-[#b9cacb] hover:text-white border border-gray-800"
          }`}
        >
          🔍 Auditoria das Etapas 1 a 4
        </button>

        <button
          onClick={() => {
            if (report) setActiveTab("interactive");
            else alert("Por favor, clique em 'Gerar Laudo Unificado com IA' primeiro!");
          }}
          disabled={!report}
          className={`px-4 py-2 rounded-lg text-xs font-bold font-mono transition-all cursor-pointer flex items-center gap-1.5 ${
            !report ? "opacity-50 cursor-not-allowed" : ""
          } ${
            activeTab === "interactive" 
              ? "bg-cyan-500 text-black" 
              : "bg-[#1b1c1e] text-[#b9cacb] hover:text-white border border-gray-800"
          }`}
        >
          <Brain className="w-4 h-4" /> Relatorio Interativo
        </button>

        <button
          onClick={() => {
            if (report) setActiveTab("whatsapp");
            else alert("Por favor, clique em 'Gerar Laudo Unificado com IA' primeiro!");
          }}
          disabled={!report}
          className={`px-4 py-2 rounded-lg text-xs font-bold font-mono transition-all cursor-pointer flex items-center gap-1.5 ${
            !report ? "opacity-50 cursor-not-allowed" : ""
          } ${
            activeTab === "whatsapp" 
              ? "bg-emerald-500 text-black" 
              : "bg-[#1b1c1e] text-[#b9cacb] hover:text-white border border-gray-800"
          }`}
        >
          <MessageSquare className="w-4 h-4" /> Compartilhar WhatsApp
        </button>

        <button
          onClick={() => setActiveTab("history")}
          className={`px-4 py-2 rounded-lg text-xs font-bold font-mono transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === "history" 
              ? "bg-purple-600 text-white" 
              : "bg-[#1b1c1e] text-[#b9cacb] hover:text-white border border-gray-800"
          }`}
        >
          <Calendar className="w-4 h-4" /> Prontuario ({historyList.length})
        </button>
      </div>

      {/* CONTENT PAGES */}

      {/* PAGE 1: AUDIT DASHBOARD */}
      {activeTab === "dashboard" && (
        <div className="space-y-6">
          
          {/* Audit Alert */}
          <div className="bg-[#1b1c1e] border border-[#3a494b]/20 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2">
              <span className="text-[10px] uppercase font-mono font-bold text-[#ccff00] bg-[#ccff00]/10 border border-[#ccff00]/25 px-2.5 py-1 rounded">
                Pronto para Unificacao
              </span>
              <h4 className="text-lg font-bold text-white">
                Compilado Fisiologico Unificado
              </h4>
              <p className="text-xs text-[#b9cacb] max-w-xl leading-relaxed">
                Clique no botao ao lado para que a IA analise as 4 etapas anteriores de forma integrada, cruzando de forma brilhante dados biomecanicos, clinicos, nutricionais e evolutivos do prontuario de <span className="text-[#ccff00] font-bold">{currentStudent.name}</span>.
              </p>
            </div>

            <button
              onClick={handleGenerateReport}
              disabled={isGenerating}
              className="w-full md:w-auto bg-gradient-to-r from-[#ccff00] to-emerald-500 hover:from-[#bce600] hover:to-emerald-400 text-black font-extrabold font-mono text-xs uppercase tracking-wider py-4 px-8 rounded-xl transition-all hover:scale-[1.02] flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(204,255,0,0.15)] cursor-pointer shrink-0"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Gerando com IA...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Gerar Laudo Unificado
                </>
              )}
            </button>
          </div>

          {/* Steps summary grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Box 1: Composition & Health Audit */}
            <div className="glass-panel p-5 rounded-2xl border border-gray-800 space-y-4">
              <h4 className="font-mono text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5 border-b border-gray-900 pb-2">
                <ClipboardList className="w-4 h-4" /> Etapa 01: Composicao & Fatores Clinicos
              </h4>
              
              {latestEval ? (
                <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                  <div className="bg-[#121315]/50 p-2.5 rounded-lg border border-gray-900">
                    <span className="text-gray-500 text-[10px] block">Peso Atual</span>
                    <span className="text-white font-bold">{latestEval.resultados.peso} kg</span>
                  </div>
                  <div className="bg-[#121315]/50 p-2.5 rounded-lg border border-gray-900">
                    <span className="text-gray-500 text-[10px] block">BF % (Dobra)</span>
                    <span className="text-cyan-400 font-bold">{latestEval.resultados.percentualGordura}%</span>
                  </div>
                  <div className="bg-[#121315]/50 p-2.5 rounded-lg border border-gray-900">
                    <span className="text-gray-500 text-[10px] block">Sono (Coren)</span>
                    <span className="text-purple-400 font-bold text-[10px] truncate">{latestEval.sono_classificacao || "Nao aferido"}</span>
                  </div>
                  <div className="bg-[#121315]/50 p-2.5 rounded-lg border border-gray-900">
                    <span className="text-gray-500 text-[10px] block">Estresse</span>
                    <span className="text-red-400 font-bold text-[10px] truncate">{latestEval.estresse_classificacao || "Nao aferido"}</span>
                  </div>
                  <div className="bg-[#121315]/50 p-2.5 rounded-lg border border-gray-900">
                    <span className="text-gray-500 text-[10px] block">Risco Cardiaco</span>
                    <span className="text-amber-400 font-bold text-[10px] truncate">{latestEval.risco_cardiaco_classificacao || latestEval.cardio_classificacao || "Nao aferido"}</span>
                  </div>
                  <div className="bg-[#121315]/50 p-2.5 rounded-lg border border-gray-900">
                    <span className="text-gray-500 text-[10px] block">Nivel de Atividade</span>
                    <span className="text-green-400 font-bold text-[10px] truncate">{latestEval.indice_atividade_classificacao || latestEval.atividade_classificacao || "Nao aferido"}</span>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-yellow-950/10 border border-yellow-900/30 rounded-xl text-center text-xs text-yellow-500 font-mono">
                  Nenhuma avaliacao fisica da Etapa 1 encontrada. A IA utilizara parametros basais recomendados do perfil.
                </div>
              )}
            </div>

            {/* Box 2: Biomechanical Posture Audit */}
            <div className="glass-panel p-5 rounded-2xl border border-gray-800 space-y-4">
              <h4 className="font-mono text-xs font-bold uppercase tracking-wider text-[#00f2ff] flex items-center gap-1.5 border-b border-gray-900 pb-2">
                <TrendingUp className="w-4 h-4" /> Etapa 02: Avaliacao Biomecanica & Postura
              </h4>

              {latestPostural ? (
                <div className="space-y-3 font-mono text-xs">
                  <div className="flex justify-between items-center bg-[#121315]/50 p-3 rounded-lg border border-gray-900">
                    <span className="text-gray-400">Score Postural Geral</span>
                    <span className="text-lg font-bold text-[#00f2ff]">{latestPostural.kpis.geral} / 100</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[10px]">
                    <div className="bg-[#121315]/30 p-2 rounded border border-gray-900">
                      <span className="text-gray-500 block">Cervical</span>
                      <span className="text-white truncate block">{latestPostural.deviations.cervical || "Normal"}</span>
                    </div>
                    <div className="bg-[#121315]/30 p-2 rounded border border-gray-900">
                      <span className="text-gray-500 block">Ombros</span>
                      <span className="text-white truncate block">{latestPostural.deviations.ombros || "Normal"}</span>
                    </div>
                    <div className="bg-[#121315]/30 p-2 rounded border border-gray-900">
                      <span className="text-gray-500 block">Pelve/Lombar</span>
                      <span className="text-white truncate block">{latestPostural.deviations.pelve || "Normal"}</span>
                    </div>
                    <div className="bg-[#121315]/30 p-2 rounded border border-gray-900">
                      <span className="text-gray-500 block">Joelhos</span>
                      <span className="text-white truncate block">{latestPostural.deviations.joelhos || "Normal"}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-yellow-950/10 border border-yellow-900/30 rounded-xl text-center text-xs text-yellow-500 font-mono">
                  Nenhuma analise postural da Etapa 2 encontrada. Recomenda-se realizar o esqueleto fotostatico.
                </div>
              )}
            </div>

            {/* Box 3: Dietary Audit */}
            <div className="glass-panel p-5 rounded-2xl border border-gray-800 space-y-4">
              <h4 className="font-mono text-xs font-bold uppercase tracking-wider text-green-400 flex items-center gap-1.5 border-b border-gray-900 pb-2">
                <Heart className="w-4 h-4" /> Etapa 03: Alvo Nutricional & Macros
              </h4>

              {resolvedDiet ? (
                <div className="space-y-3 font-mono text-xs">
                  <div className="flex justify-between items-center bg-[#121315]/50 p-2.5 rounded-lg border border-gray-900">
                    <span className="text-gray-400">Calorias Recomendadas</span>
                    <span className="text-sm font-bold text-green-400">{resolvedDiet.calorieTarget} kcal</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center text-[10px]">
                    <div className="bg-[#121315]/30 p-2 rounded border border-gray-900">
                      <span className="text-gray-500 block">Proteinas</span>
                      <span className="text-[#ccff00] font-bold">{resolvedDiet.proteinTarget}g</span>
                    </div>
                    <div className="bg-[#121315]/30 p-2 rounded border border-gray-900">
                      <span className="text-gray-500 block">Carboidratos</span>
                      <span className="text-cyan-400 font-bold">{resolvedDiet.carbsTarget}g</span>
                    </div>
                    <div className="bg-[#121315]/30 p-2 rounded border border-gray-900">
                      <span className="text-gray-500 block">Gorduras</span>
                      <span className="text-amber-500 font-bold">{resolvedDiet.fatTarget}g</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-yellow-950/10 border border-yellow-900/30 rounded-xl text-center text-xs text-yellow-500 font-mono">
                  Nenhuma prescricao de macros da Etapa 3 ativa. A IA estimara a cota de calorias basais baseada no objetivo.
                </div>
              )}
            </div>

            {/* Box 4: Evolution Audit */}
            <div className="glass-panel p-5 rounded-2xl border border-gray-800 space-y-4">
              <h4 className="font-mono text-xs font-bold uppercase tracking-wider text-amber-500 flex items-center gap-1.5 border-b border-gray-900 pb-2">
                <Award className="w-4 h-4" /> Etapa 04: Evolucao & Comparativos
              </h4>

              <div className="bg-[#121315]/50 p-4 rounded-xl border border-gray-900 text-xs font-mono space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-500">Total de Registros:</span>
                  <span className="text-white font-bold">{physicalEvaluations.length} avaliacoes</span>
                </div>
                {physicalEvaluations.length > 1 ? (
                  <div className="text-[10px] text-green-400 leading-relaxed border-t border-gray-900 pt-2">
                    Historico detectado com sucesso. O gerador extraira as variacoes reais de peso e BF para formular a velocidade metabolica.
                  </div>
                ) : (
                  <div className="text-[10px] text-gray-400 leading-relaxed border-t border-gray-900 pt-2">
                    Primeiro registro coletado (baseline inicial). Estabelecido como marco zero para mensuracao e comparacao em 45 dias.
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* LOADING STATE */}
      {isGenerating && (
        <div className="bg-[#1b1c1e] border border-cyan-800/30 rounded-2xl p-8 text-center space-y-6">
          <div className="relative w-16 h-16 mx-auto">
            <Loader2 className="w-16 h-16 text-cyan-400 animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center font-bold text-[10px] text-cyan-400 font-mono">
              {generationProgress}%
            </div>
          </div>
          <div className="space-y-2 max-w-md mx-auto">
            <h4 className="font-bold text-white text-sm font-mono flex items-center justify-center gap-2">
              <Sparkles className="w-4.5 h-4.5 text-cyan-400 animate-pulse" />
              Sincronizando Motores de Fisiologia AI
            </h4>
            <p className="text-xs text-cyan-300 font-mono">
              {generationStep}
            </p>
          </div>
          <div className="w-full max-w-sm mx-auto bg-gray-950 h-1.5 rounded-full overflow-hidden">
            <div 
              className="bg-cyan-400 h-full transition-all duration-500"
              style={{ width: `${generationProgress}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* PAGE 2: INTERACTIVE DASHBOARD REPORT */}
      {activeTab === "interactive" && report && (
        <div className="space-y-6">
          
          {/* Action buttons bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#1b1c1e] p-4 rounded-xl border border-gray-800">
            <div className="flex flex-wrap items-center gap-2.5">
              <button
                onClick={handleDownloadPDF}
                className="bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 text-black px-4 py-2.5 rounded-lg text-xs font-bold font-mono uppercase tracking-wider flex items-center gap-1.5 transition-all hover:scale-[1.01] cursor-pointer"
              >
                <FileDown className="w-4 h-4" /> Exportar PDF Oficial
              </button>

              <button
                onClick={handleSaveToHistory}
                className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2.5 rounded-lg text-xs font-bold font-mono uppercase tracking-wider flex items-center gap-1.5 transition-all hover:scale-[1.01] cursor-pointer"
              >
                <Check className="w-4 h-4" /> Arquivar Prontuario
              </button>
            </div>

            <button
              onClick={() => {
                if (editMode) {
                  handleSaveChanges();
                } else {
                  setEditMode(true);
                }
              }}
              className={`px-4 py-2.5 rounded-lg text-xs font-bold font-mono uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer ${
                editMode 
                  ? "bg-[#ccff00] text-black hover:bg-[#bce600]" 
                  : "bg-gray-800 text-white hover:bg-gray-700"
              }`}
            >
              {editMode ? (
                <>
                  <Check className="w-4 h-4" /> Salvar Edicoes
                </>
              ) : (
                <>
                  <Edit3 className="w-4 h-4" /> Habilitar Modo Edicao
                </>
              )}
            </button>
          </div>

          {/* EDITABLE REPORT WORKFLOW */}
          <div className="space-y-6">
            
            {/* Section 1: Executive Summary */}
            <div className="glass-panel p-6 rounded-2xl border border-gray-800 space-y-4">
              <div className="flex items-center justify-between border-b border-gray-900 pb-2.5">
                <h4 className="font-mono text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                  <Award className="w-4 h-4" /> 1. Resumo Executivo & Escore de Saude
                </h4>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-gray-500 font-mono">Status: Aprovado</span>
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-center">
                
                {/* Note display */}
                <div className="md:col-span-1 text-center bg-[#121315]/80 p-5 rounded-xl border border-gray-900 space-y-2">
                  <span className="text-[9px] uppercase font-bold text-gray-500 block font-mono">Escore Integrado</span>
                  
                  {editMode ? (
                    <input 
                      type="number"
                      step="0.1"
                      min="0"
                      max="10"
                      value={editedReport.resumoGeral.notaSaude}
                      onChange={e => setEditedReport({
                        ...editedReport,
                        resumoGeral: { ...editedReport.resumoGeral, notaSaude: parseFloat(e.target.value) }
                      })}
                      className="bg-[#1b1c1e] text-cyan-400 text-3xl font-bold font-mono text-center border border-gray-800 rounded py-1.5 w-24 mx-auto outline-none"
                    />
                  ) : (
                    <div className="text-4xl font-extrabold text-[#ccff00] font-mono">
                      {report.resumoGeral.notaSaude} <span className="text-xs text-gray-500">/10</span>
                    </div>
                  )}

                  <div className="w-full bg-gray-900 h-2 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${
                        report.resumoGeral.classificacaoCor === "green" 
                          ? "bg-emerald-500" 
                          : report.resumoGeral.classificacaoCor === "red" 
                            ? "bg-red-500" 
                            : "bg-amber-500"
                      }`}
                      style={{ width: `${(editedReport?.resumoGeral?.notaSaude || report.resumoGeral.notaSaude) * 10}%` }}
                    ></div>
                  </div>
                </div>

                {/* Justification display */}
                <div className="md:col-span-3 space-y-1">
                  <span className="text-[9px] uppercase font-bold text-gray-500 block font-mono">Parecer de Clinica e Biomecanica</span>
                  
                  {editMode ? (
                    <textarea
                      rows={4}
                      value={editedReport.resumoGeral.justificativaNota}
                      onChange={e => setEditedReport({
                        ...editedReport,
                        resumoGeral: { ...editedReport.resumoGeral, justificativaNota: e.target.value }
                      })}
                      className="w-full bg-[#1b1c1e] border border-gray-800 text-white p-3 rounded-lg text-xs font-mono outline-none"
                    />
                  ) : (
                    <p className="text-xs text-gray-300 leading-relaxed">
                      {report.resumoGeral.justificativaNota}
                    </p>
                  )}
                </div>

              </div>
            </div>

            {/* Section 2: Composição Corporal & Antropometria Recente */}
            <div className="glass-panel p-6 rounded-2xl border border-gray-800 space-y-5">
              <h4 className="font-mono text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5 border-b border-gray-900 pb-2.5">
                <Scale className="w-4 h-4 text-cyan-400" /> 2. Composição Corporal & Antropometria Recente
              </h4>

              {latestEval ? (
                <div className="space-y-6">
                  {/* Metric Cards Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    <div className="bg-[#121315]/60 p-4 rounded-xl border border-gray-900 space-y-1 font-mono text-xs">
                      <span className="text-[9px] text-gray-500 block uppercase">Peso Atual</span>
                      <p className="text-white text-lg font-extrabold">{latestEval.resultados.peso || currentStudent.weight || 75} kg</p>
                      <span className="text-[8px] text-gray-600">Fisiologia</span>
                    </div>
                    <div className="bg-[#121315]/60 p-4 rounded-xl border border-gray-900 space-y-1 font-mono text-xs">
                      <span className="text-[9px] text-gray-500 block uppercase">% Gordura (BF)</span>
                      <p className="text-cyan-400 text-lg font-extrabold">{latestEval.resultados.percentualGordura || 15} %</p>
                      <span className="text-[8px] text-gray-500 font-sans">Massa Gorda: {latestEval.resultados.massaGorda || 11} kg</span>
                    </div>
                    <div className="bg-[#121315]/60 p-4 rounded-xl border border-gray-900 space-y-1 font-mono text-xs">
                      <span className="text-[9px] text-gray-500 block uppercase">% Massa Muscular</span>
                      <p className="text-emerald-400 text-lg font-extrabold">{latestEval.resultados.percentualMassaMuscular || 42} %</p>
                      <span className="text-[8px] text-gray-500 font-sans">Massa Magra: {latestEval.resultados.massaMagra || 64} kg</span>
                    </div>
                    <div className="bg-[#121315]/60 p-4 rounded-xl border border-gray-900 space-y-1 font-mono text-xs">
                      <span className="text-[9px] text-gray-500 block uppercase">Índice IMC</span>
                      <p className="text-amber-400 text-lg font-extrabold">{latestEval.resultados.imc || 24}</p>
                      <span className="text-[8px] text-gray-600">Geral</span>
                    </div>
                    <div className="bg-[#121315]/60 p-4 rounded-xl border border-gray-900 col-span-2 md:col-span-4 lg:col-span-1 space-y-1 font-mono text-xs">
                      <span className="text-[9px] text-gray-500 block uppercase">Metabolismo Basal (TMB)</span>
                      <p className="text-[#ccff00] text-sm font-extrabold">{latestEval.resultados.tmb || 1750} kcal</p>
                      <span className="text-[8px] text-gray-500 font-sans">GET: {latestEval.resultados.get || 2400} kcal</span>
                    </div>
                  </div>

                  {/* Dobras and Perimetros grid side-by-side */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-[#121315]/40 p-4 rounded-xl border border-gray-900 space-y-3">
                      <span className="text-[9px] font-mono font-bold text-gray-400 block uppercase border-b border-gray-900 pb-1.5">Dobras Cutâneas (mm)</span>
                      <div className="grid grid-cols-2 gap-3 font-mono text-xs">
                        <div className="flex justify-between p-1.5 bg-black/20 rounded border border-gray-900">
                          <span className="text-gray-500">Peitoral</span>
                          <span className="text-white font-bold">{latestEval.dobras.peitoral || "-"} mm</span>
                        </div>
                        <div className="flex justify-between p-1.5 bg-black/20 rounded border border-gray-900">
                          <span className="text-gray-500">Tríceps</span>
                          <span className="text-white font-bold">{latestEval.dobras.triceps || "-"} mm</span>
                        </div>
                        <div className="flex justify-between p-1.5 bg-black/20 rounded border border-gray-900">
                          <span className="text-gray-500">Bíceps</span>
                          <span className="text-white font-bold">{latestEval.dobras.biceps || "-"} mm</span>
                        </div>
                        <div className="flex justify-between p-1.5 bg-black/20 rounded border border-gray-900">
                          <span className="text-gray-500">Subescapular</span>
                          <span className="text-white font-bold">{latestEval.dobras.subescapular || "-"} mm</span>
                        </div>
                        <div className="flex justify-between p-1.5 bg-black/20 rounded border border-gray-900">
                          <span className="text-gray-500">Axilar Média</span>
                          <span className="text-white font-bold">{latestEval.dobras.mediaAxilar || "-"} mm</span>
                        </div>
                        <div className="flex justify-between p-1.5 bg-black/20 rounded border border-gray-900">
                          <span className="text-gray-500">Suprailíaca</span>
                          <span className="text-white font-bold">{latestEval.dobras.suprailiaca || "-"} mm</span>
                        </div>
                        <div className="flex justify-between p-1.5 bg-black/20 rounded border border-gray-900">
                          <span className="text-gray-500">Abdominal</span>
                          <span className="text-white font-bold">{latestEval.dobras.abdomen || "-"} mm</span>
                        </div>
                        <div className="flex justify-between p-1.5 bg-black/20 rounded border border-gray-900">
                          <span className="text-gray-500">Coxa</span>
                          <span className="text-white font-bold">{latestEval.dobras.coxa || "-"} mm</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-[#121315]/40 p-4 rounded-xl border border-gray-900 space-y-3">
                      <span className="text-[9px] font-mono font-bold text-gray-400 block uppercase border-b border-gray-900 pb-1.5">Perímetros Principais (cm)</span>
                      {latestEval.perimetros ? (
                        <div className="grid grid-cols-2 gap-3 font-mono text-xs">
                          <div className="flex justify-between p-1.5 bg-black/20 rounded border border-gray-900">
                            <span className="text-gray-500">Tórax</span>
                            <span className="text-cyan-400 font-bold">{latestEval.perimetros.torax || "-"} cm</span>
                          </div>
                          <div className="flex justify-between p-1.5 bg-black/20 rounded border border-gray-900">
                            <span className="text-gray-500">Cintura</span>
                            <span className="text-cyan-400 font-bold">{latestEval.perimetros.cintura || "-"} cm</span>
                          </div>
                          <div className="flex justify-between p-1.5 bg-black/20 rounded border border-gray-900">
                            <span className="text-gray-500">Abdômen</span>
                            <span className="text-cyan-400 font-bold">{latestEval.perimetros.abdomen || "-"} cm</span>
                          </div>
                          <div className="flex justify-between p-1.5 bg-black/20 rounded border border-gray-900">
                            <span className="text-gray-500">Quadril</span>
                            <span className="text-cyan-400 font-bold">{latestEval.perimetros.quadril || "-"} cm</span>
                          </div>
                          <div className="flex justify-between p-1.5 bg-black/20 rounded border border-gray-900">
                            <span className="text-gray-500">Braço D</span>
                            <span className="text-cyan-400 font-bold">{latestEval.perimetros.bracoD || "-"} cm</span>
                          </div>
                          <div className="flex justify-between p-1.5 bg-black/20 rounded border border-gray-900">
                            <span className="text-gray-500">Braço E</span>
                            <span className="text-cyan-400 font-bold">{latestEval.perimetros.bracoE || "-"} cm</span>
                          </div>
                          <div className="flex justify-between p-1.5 bg-black/20 rounded border border-gray-900">
                            <span className="text-gray-500">Coxa D</span>
                            <span className="text-cyan-400 font-bold">{latestEval.perimetros.coxaD || "-"} cm</span>
                          </div>
                          <div className="flex justify-between p-1.5 bg-black/20 rounded border border-gray-900">
                            <span className="text-gray-500">Panturrilha D</span>
                            <span className="text-cyan-400 font-bold">{latestEval.perimetros.panturrilhaD || "-"} cm</span>
                          </div>
                        </div>
                      ) : (
                        <p className="text-xs text-gray-500 font-mono italic">Nenhum perímetro registrado na avaliação.</p>
                      )}
                    </div>
                  </div>

                  {latestEval.resultados.somatotipo && (
                    <div className="bg-[#121315]/20 p-4 rounded-xl border border-gray-900 font-mono text-xs flex flex-col md:flex-row justify-between gap-4">
                      <div>
                        <span className="text-[8px] text-gray-500 block uppercase">Somatotipo Predominante</span>
                        <p className="text-white font-bold text-[11px]">{latestEval.resultados.somatotipo}</p>
                      </div>
                      <div>
                        <span className="text-[8px] text-gray-500 block uppercase">Distribuição de Gordura</span>
                        <p className="text-white text-[11px]">{latestEval.resultados.distribuicaoGordura || "Equilibrada"}</p>
                      </div>
                      <div>
                        <span className="text-[8px] text-gray-500 block uppercase">Modificações</span>
                        <p className="text-white text-[11px]">{latestEval.resultados.mudancasComposicao || "Evolução clínica dentro do planejado"}</p>
                      </div>
                    </div>
                  )}

                </div>
              ) : (
                <div className="p-4 bg-gray-900/30 rounded-xl border border-gray-800 text-center font-mono text-xs text-gray-500">
                  Nenhuma avaliação de composição corporal recente ativa. Acesse a aba "Avaliação Corporal" para inserir dobras e perímetros.
                </div>
              )}
            </div>

            {/* Section 3: Mapeamento Postural & Biomecânica (Only if latestPostural exists) */}
            <div className="glass-panel p-6 rounded-2xl border border-gray-800 space-y-5">
              <h4 className="font-mono text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5 border-b border-gray-900 pb-2.5">
                <Heart className="w-4 h-4 text-cyan-400" /> 3. Laudo de Biomecânica Postural (IA)
              </h4>

              {latestPostural ? (
                <div className="space-y-6">
                  {/* Postural KPIs */}
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    <div className="bg-[#121315]/60 p-4 rounded-xl border border-gray-900 space-y-1 font-mono text-xs">
                      <span className="text-[9px] text-gray-500 block uppercase">Score Alinhamento</span>
                      <p className="text-[#ccff00] text-lg font-extrabold">{latestPostural.kpis.geral || 85}%</p>
                      <span className="text-[8px] text-gray-500">Risco: {latestPostural.kpis.compensacaoRisco || "Baixo"}</span>
                    </div>
                    <div className="bg-[#121315]/60 p-4 rounded-xl border border-gray-900 space-y-1 font-mono text-xs">
                      <span className="text-[9px] text-gray-500 block uppercase">Cervical</span>
                      <p className="text-white text-lg font-extrabold">{latestPostural.kpis.cervical || 80}%</p>
                      <span className="text-[8px] text-gray-500 font-sans">Simetria cabeça</span>
                    </div>
                    <div className="bg-[#121315]/60 p-4 rounded-xl border border-gray-900 space-y-1 font-mono text-xs">
                      <span className="text-[9px] text-gray-500 block uppercase">Escapular</span>
                      <p className="text-white text-lg font-extrabold">{latestPostural.kpis.escapular || 85}%</p>
                      <span className="text-[8px] text-gray-500 font-sans">Simetria ombros</span>
                    </div>
                    <div className="bg-[#121315]/60 p-4 rounded-xl border border-gray-900 space-y-1 font-mono text-xs">
                      <span className="text-[9px] text-gray-500 block uppercase">Pélvico</span>
                      <p className="text-white text-lg font-extrabold">{latestPostural.kpis.pelvico || 90}%</p>
                      <span className="text-[8px] text-gray-500 font-sans">Simetria quadril</span>
                    </div>
                    <div className="bg-[#121315]/60 p-4 rounded-xl border border-gray-900 space-y-1 font-mono text-xs col-span-2 md:col-span-4 lg:col-span-1">
                      <span className="text-[9px] text-gray-500 block uppercase">Simetria Bilateral</span>
                      <p className="text-cyan-400 text-lg font-extrabold">{latestPostural.kpis.simetria || 88}%</p>
                      <span className="text-[8px] text-gray-500 font-sans">Distorção lateral</span>
                    </div>
                  </div>

                  {/* Visual photos with absolute markers overlaid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start justify-items-center">
                    
                    {/* Front Photo Card */}
                    <div className="space-y-3 text-center">
                      <span className="text-[9px] uppercase font-bold text-gray-400 block font-mono">Vista Frontal Anterior</span>
                      {latestPostural.photos.front ? (
                        <div className="relative inline-block w-full max-w-[260px] rounded-xl overflow-hidden border border-gray-800 shadow-xl">
                          <img src={latestPostural.photos.front} className="w-full h-auto object-cover" alt="Frontal" />
                          {latestPostural.markers.front?.map((m: any) => (
                            <div 
                              key={m.id}
                              className={`absolute w-2.5 h-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white shadow-lg cursor-help group`}
                              style={{ left: `${m.x}%`, top: `${m.y}%` }}
                            >
                              <div className={`w-full h-full rounded-full ${
                                m.type === 'error' ? 'bg-red-500 animate-pulse' : m.type === 'warning' ? 'bg-amber-500' : 'bg-cyan-400'
                              }`} />
                              <span className="absolute left-1/2 bottom-full mb-1 -translate-x-1/2 scale-0 group-hover:scale-100 transition-all bg-black/90 text-white text-[8px] font-mono py-0.5 px-1 rounded whitespace-nowrap z-50 pointer-events-none">
                                {m.label}
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="w-[260px] h-[340px] bg-[#121315]/60 rounded-xl border border-gray-900 flex items-center justify-center font-mono text-xs text-gray-600 italic">
                          Sem foto frontal
                        </div>
                      )}
                    </div>

                    {/* Side/Right Photo Card */}
                    <div className="space-y-3 text-center">
                      <span className="text-[9px] uppercase font-bold text-gray-400 block font-mono">Vista Lateral Coberta</span>
                      {latestPostural.photos.right || latestPostural.photos.left || latestPostural.photos.back ? (
                        <div className="relative inline-block w-full max-w-[260px] rounded-xl overflow-hidden border border-gray-800 shadow-xl">
                          <img 
                            src={latestPostural.photos.right || latestPostural.photos.left || latestPostural.photos.back || ""} 
                            className="w-full h-auto object-cover" 
                            alt="Lateral" 
                          />
                          {(latestPostural.markers.right || latestPostural.markers.left || latestPostural.markers.back)?.map((m: any) => (
                            <div 
                              key={m.id}
                              className="absolute w-2.5 h-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white shadow-lg cursor-help group"
                              style={{ left: `${m.x}%`, top: `${m.y}%` }}
                            >
                              <div className={`w-full h-full rounded-full ${
                                m.type === 'error' ? 'bg-red-500 animate-pulse' : m.type === 'warning' ? 'bg-amber-500' : 'bg-cyan-400'
                              }`} />
                              <span className="absolute left-1/2 bottom-full mb-1 -translate-x-1/2 scale-0 group-hover:scale-100 transition-all bg-black/90 text-white text-[8px] font-mono py-0.5 px-1 rounded whitespace-nowrap z-50 pointer-events-none">
                                {m.label}
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="w-[260px] h-[340px] bg-[#121315]/60 rounded-xl border border-gray-900 flex items-center justify-center font-mono text-xs text-gray-600 italic">
                          Sem foto lateral
                        </div>
                      )}
                    </div>

                  </div>

                  {/* AI Postural Narrative Report (Laudo Postural Inteligente) */}
                  {latestPostural.aiReport && (
                    <div className="bg-[#121315]/40 p-5 rounded-xl border border-gray-900 space-y-3 font-mono mt-6">
                      <div className="flex items-center gap-1.5 text-[11px] font-bold text-cyan-400 uppercase border-b border-gray-900 pb-2">
                        <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse" /> Parecer Técnico Postural e Alinhamento (Laudo Inteligente)
                      </div>
                      <div className="text-[11px] text-gray-350 leading-relaxed whitespace-pre-wrap max-h-[300px] overflow-y-auto pr-2 bg-black/20 p-4 rounded-lg border border-gray-950">
                        {latestPostural.aiReport}
                      </div>
                    </div>
                  )}

                </div>
              ) : (
                <div className="p-4 bg-gray-900/30 rounded-xl border border-gray-800 text-center font-mono text-xs text-gray-500">
                  Nenhum laudo postural recente ativo. Acesse a aba "Laudo Postural (IA)" para mapear desvios e marcadores.
                </div>
              )}
            </div>

            {/* Section 4: Integrated Analysis & Correlations */}
            <div className="glass-panel p-6 rounded-2xl border border-gray-800 space-y-5">
              <h4 className="font-mono text-xs font-bold uppercase tracking-wider text-[#00f2ff] flex items-center gap-1.5 border-b border-gray-900 pb-2.5">
                <Brain className="w-4 h-4" /> 4. Analise de Correlações Fisiológicas
              </h4>

              <div className="space-y-4">
                <div className="space-y-1">
                  <span className="text-[9px] uppercase font-bold text-gray-500 block font-mono">Perfil Fisiopatológico do Aluno</span>
                  {editMode ? (
                    <textarea
                      rows={3}
                      value={editedReport.analiseIntegrada.perfilGeral}
                      onChange={e => setEditedReport({
                        ...editedReport,
                        analiseIntegrada: { ...editedReport.analiseIntegrada, perfilGeral: e.target.value }
                      })}
                      className="w-full bg-[#1b1c1e] border border-gray-800 text-white p-3 rounded-lg text-xs font-mono outline-none"
                    />
                  ) : (
                    <p className="text-xs text-gray-300 leading-relaxed font-mono">
                      {report.analiseIntegrada.perfilGeral}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  {report.analiseIntegrada.correlacoes?.map((c: any, index: number) => (
                    <div key={index} className="bg-[#121315]/60 p-4 rounded-xl border border-gray-900 space-y-2">
                      <div className="font-bold text-xs text-cyan-400 flex items-center gap-1">
                        <Zap className="w-3.5 h-3.5" />
                        {editMode ? (
                          <input 
                            type="text"
                            value={editedReport.analiseIntegrada.correlacoes[index].titulo}
                            onChange={e => {
                              const newCorr = [...editedReport.analiseIntegrada.correlacoes];
                              newCorr[index].titulo = e.target.value;
                              setEditedReport({
                                ...editedReport,
                                analiseIntegrada: { ...editedReport.analiseIntegrada, correlacoes: newCorr }
                              });
                            }}
                            className="bg-[#1b1c1e] text-white border border-gray-800 rounded px-1 w-full text-xs font-mono outline-none"
                          />
                        ) : (
                          <span>{c.titulo}</span>
                        )}
                      </div>

                      {editMode ? (
                        <textarea
                          rows={4}
                          value={editedReport.analiseIntegrada.correlacoes[index].descricao}
                          onChange={e => {
                            const newCorr = [...editedReport.analiseIntegrada.correlacoes];
                            newCorr[index].descricao = e.target.value;
                            setEditedReport({
                              ...editedReport,
                              analiseIntegrada: { ...editedReport.analiseIntegrada, correlacoes: newCorr }
                            });
                          }}
                          className="w-full bg-[#1b1c1e] border border-gray-800 text-white p-1.5 rounded text-[11px] font-mono outline-none"
                        />
                      ) : (
                        <p className="text-[11px] text-gray-400 leading-relaxed">
                          {c.descricao}
                        </p>
                      )}
                    </div>
                  ))}
                </div>

                {/* Strengths & Red flags */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                  <div className="bg-[#121315]/40 p-4 rounded-xl border border-gray-900 space-y-2">
                    <span className="text-[9px] uppercase font-bold text-green-400 block font-mono">Pontos Fortes Biologicos</span>
                    <ul className="space-y-1.5">
                      {report.analiseIntegrada.pontosFortes?.map((pnt: string, index: number) => (
                        <li key={index} className="flex items-start gap-2 text-xs text-gray-300 leading-relaxed font-mono">
                          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full shrink-0 mt-2"></span>
                          <span>{pnt}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-[#121315]/40 p-4 rounded-xl border border-gray-900 space-y-2">
                    <span className="text-[9px] uppercase font-bold text-red-400 block font-mono">Pontos de Atencao Mecanica/Clinica</span>
                    <ul className="space-y-2">
                      {report.analiseIntegrada.pontosAtencao?.map((pnt: any, index: number) => (
                        <li key={index} className="flex items-start justify-between gap-3 text-xs leading-relaxed font-mono">
                          <div className="flex items-start gap-2 text-gray-300">
                            <span className="w-1.5 h-1.5 bg-red-500 rounded-full shrink-0 mt-2"></span>
                            <span>{pnt.item}</span>
                          </div>
                          <span className={`text-[8px] border px-1.5 py-0.5 rounded font-bold uppercase shrink-0 ${
                            pnt.prioridade === "CRITICO" 
                              ? "bg-red-950/40 text-red-400 border-red-800/40" 
                              : "bg-amber-950/40 text-amber-400 border-amber-800/40"
                          }`}>
                            {pnt.prioridade}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

              </div>
            </div>

            {/* Section 3: Action Plan Bento Grid */}
            <div className="glass-panel p-6 rounded-2xl border border-gray-800 space-y-4">
              <h4 className="font-mono text-xs font-bold uppercase tracking-wider text-green-400 flex items-center gap-1.5 border-b border-gray-900 pb-2.5">
                <ShieldAlert className="w-4 h-4" /> 5. Plano de Ação Estruturado (45 dias)
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                
                {/* Training block */}
                <div className="bg-[#121315]/60 p-4 rounded-xl border border-gray-900 space-y-3 font-mono text-xs">
                  <span className="text-[9px] uppercase font-bold text-cyan-400 block">Pilar A: Treino & Core</span>
                  
                  <div className="space-y-2">
                    <div>
                      <span className="text-[8px] text-gray-500 block">Foco Biomecanico</span>
                      <p className="text-white text-[11px] leading-relaxed font-bold">{report.planoAcao.treinamento.focoPrincipal}</p>
                    </div>
                    <div>
                      <span className="text-[8px] text-gray-500 block">Frequencia / Divisao</span>
                      <p className="text-[#b9cacb] text-[11px]">{report.planoAcao.treinamento.frequencia} • {report.planoAcao.treinamento.divisaoSugerida}</p>
                    </div>
                    <div>
                      <span className="text-[8px] text-red-500 block">Evitar Clinicamente</span>
                      <p className="text-red-400 text-[10px] leading-relaxed">{report.planoAcao.treinamento.exerciciosEvitar?.join(", ")}</p>
                    </div>
                  </div>
                </div>

                {/* Nutrition block */}
                <div className="bg-[#121315]/60 p-4 rounded-xl border border-gray-900 space-y-3 font-mono text-xs">
                  <span className="text-[9px] uppercase font-bold text-green-400 block">Pilar B: Nutricao & Alvos</span>
                  
                  <div className="space-y-2">
                    <div>
                      <span className="text-[8px] text-gray-500 block">Calorias Diarias</span>
                      <p className="text-white text-[11px] leading-relaxed font-bold">{report.planoAcao.nutricao.calorias}</p>
                    </div>
                    <div>
                      <span className="text-[8px] text-gray-500 block">Proteina/Carbo/Fat</span>
                      <p className="text-[#b9cacb] text-[11px]">{report.planoAcao.nutricao.macros}</p>
                    </div>
                    <div>
                      <span className="text-[8px] text-gray-500 block">Suplementacao Alvo</span>
                      <p className="text-[#b9cacb] text-[10px] leading-relaxed">{report.planoAcao.nutricao.suplementacao}</p>
                    </div>
                  </div>
                </div>

                {/* Recovery block */}
                <div className="bg-[#121315]/60 p-4 rounded-xl border border-gray-900 space-y-3 font-mono text-xs">
                  <span className="text-[9px] uppercase font-bold text-purple-400 block">Pilar C: Sono & Recuperacao</span>
                  
                  <div className="space-y-2">
                    <div>
                      <span className="text-[8px] text-gray-500 block">Sono Recomendado</span>
                      <p className="text-white text-[11px] leading-relaxed font-bold">{report.planoAcao.recuperacao.horasSono}</p>
                    </div>
                    <div>
                      <span className="text-[8px] text-gray-500 block">Higiene do Sono</span>
                      <p className="text-[#b9cacb] text-[10px] leading-relaxed truncate">{report.planoAcao.recuperacao.higieneSono?.slice(0,2).join(", ")}</p>
                    </div>
                    <div>
                      <span className="text-[8px] text-gray-500 block">Manejo Stress</span>
                      <p className="text-[#b9cacb] text-[10px] leading-relaxed">{report.planoAcao.recuperacao.manejoEstresse?.slice(0,2).join(", ")}</p>
                    </div>
                  </div>
                </div>

                {/* Monitoring block */}
                <div className="bg-[#121315]/60 p-4 rounded-xl border border-gray-900 space-y-3 font-mono text-xs">
                  <span className="text-[9px] uppercase font-bold text-amber-500 block">Pilar D: Monitoramento</span>
                  
                  <div className="space-y-2">
                    <div>
                      <span className="text-[8px] text-gray-500 block">Metricas de Controle</span>
                      <p className="text-white text-[11px] leading-relaxed font-bold truncate">{report.planoAcao.monitoramento.metricas?.join(", ")}</p>
                    </div>
                    <div>
                      <span className="text-[8px] text-red-500 block">Sinais de Alerta</span>
                      <p className="text-red-400 text-[10px] leading-relaxed truncate">{report.planoAcao.monitoramento.sinaisAlerta?.join(", ")}</p>
                    </div>
                    <div>
                      <span className="text-[8px] text-gray-500 block">Reavaliacao</span>
                      <p className="text-amber-400 text-[11px] font-bold">{report.planoAcao.monitoramento.proximaReavaliacao}</p>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* Section 4: 5 SMART Goals */}
            <div className="glass-panel p-6 rounded-2xl border border-gray-800 space-y-4">
              <h4 className="font-mono text-xs font-bold uppercase tracking-wider text-white flex items-center gap-1.5 border-b border-gray-900 pb-2.5">
                <CheckCircle className="w-4 h-4 text-[#ccff00]" /> 6. Cinco Metas SMART do Periodo
              </h4>

              <div className="space-y-4">
                {report.metasSmart?.map((m: any, idx: number) => (
                  <div key={idx} className="bg-[#121315]/40 p-4 rounded-xl border border-gray-900 space-y-2 font-mono text-xs">
                    <div className="flex justify-between items-center border-b border-gray-900 pb-1.5">
                      <span className="font-bold text-white uppercase text-[11px]">{idx+1}. {m.titulo}</span>
                      <span className="text-[9px] bg-[#ccff00]/10 text-[#ccff00] px-2 py-0.5 rounded border border-[#ccff00]/20 font-bold">{m.temporal}</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-[10px] text-gray-400">
                      <div>
                        <span className="text-[#ccff00] block text-[8px] uppercase">Especifica</span>
                        <p className="text-gray-300 leading-relaxed">{m.especifica}</p>
                      </div>
                      <div>
                        <span className="text-cyan-400 block text-[8px] uppercase">Mensuravel</span>
                        <p className="text-gray-300 leading-relaxed">{m.mensuravel}</p>
                      </div>
                      <div>
                        <span className="text-emerald-400 block text-[8px] uppercase">Atingivel</span>
                        <p className="text-gray-300 leading-relaxed">{m.atingivel}</p>
                      </div>
                      <div>
                        <span className="text-amber-400 block text-[8px] uppercase">Acoes de Execucao</span>
                        <p className="text-gray-200 font-bold leading-relaxed">{m.acoes}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Section 5: Timeline */}
            <div className="glass-panel p-6 rounded-2xl border border-gray-800 space-y-5">
              <h4 className="font-mono text-xs font-bold uppercase tracking-wider text-white flex items-center gap-1.5 border-b border-gray-900 pb-2.5">
                <Calendar className="w-4 h-4 text-[#ccff00]" /> 7. Cronograma de Periodização (45 Dias)
              </h4>

              <div className="relative border-l border-gray-800 ml-4 space-y-6">
                
                {/* Phase 1 */}
                <div className="relative pl-6">
                  <span className="absolute left-0 -translate-x-1/2 top-1.5 w-3.5 h-3.5 rounded-full bg-cyan-400 border-4 border-gray-950"></span>
                  <div className="space-y-1.5 font-mono text-xs">
                    <h5 className="font-extrabold text-white text-sm uppercase">{report.cronograma?.fase1?.titulo}</h5>
                    <p className="text-cyan-300 font-bold">Foco: {report.cronograma?.fase1?.foco}</p>
                    <ul className="space-y-1 text-gray-400 text-[11px]">
                      {report.cronograma?.fase1?.acoes?.map((a: string, i: number) => (
                        <li key={i}>- {a}</li>
                      ))}
                    </ul>
                    <p className="text-[11px] text-emerald-400 font-extrabold">Meta da Fase: {report.cronograma?.fase1?.meta}</p>
                  </div>
                </div>

                {/* Phase 2 */}
                <div className="relative pl-6">
                  <span className="absolute left-0 -translate-x-1/2 top-1.5 w-3.5 h-3.5 rounded-full bg-[#ccff00] border-4 border-gray-950"></span>
                  <div className="space-y-1.5 font-mono text-xs">
                    <h5 className="font-extrabold text-white text-sm uppercase">{report.cronograma?.fase2?.titulo}</h5>
                    <p className="text-[#ccff00] font-bold">Foco: {report.cronograma?.fase2?.foco}</p>
                    <ul className="space-y-1 text-gray-400 text-[11px]">
                      {report.cronograma?.fase2?.acoes?.map((a: string, i: number) => (
                        <li key={i}>- {a}</li>
                      ))}
                    </ul>
                    <p className="text-[11px] text-emerald-400 font-extrabold">Meta da Fase: {report.cronograma?.fase2?.meta}</p>
                  </div>
                </div>

                {/* Phase 3 */}
                <div className="relative pl-6">
                  <span className="absolute left-0 -translate-x-1/2 top-1.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border-4 border-gray-950"></span>
                  <div className="space-y-1.5 font-mono text-xs">
                    <h5 className="font-extrabold text-white text-sm uppercase">{report.cronograma?.fase3?.titulo}</h5>
                    <p className="text-emerald-400 font-bold">Foco: {report.cronograma?.fase3?.foco}</p>
                    <ul className="space-y-1 text-gray-400 text-[11px]">
                      {report.cronograma?.fase3?.acoes?.map((a: string, i: number) => (
                        <li key={i}>- {a}</li>
                      ))}
                    </ul>
                    <p className="text-[11px] text-emerald-400 font-extrabold">Meta da Fase: {report.cronograma?.fase3?.meta}</p>
                  </div>
                </div>

              </div>
            </div>

            {/* Motivational & Legals */}
            <div className="space-y-3 font-mono text-[10px] text-gray-500 p-2">
              <p className="leading-relaxed italic text-[11px] text-gray-400">
                "{report.recomendacoesFinais}"
              </p>
              <p className="leading-relaxed">
                {report.avisoLegal}
              </p>
            </div>

          </div>

        </div>
      )}

      {/* PAGE 3: WHATSAPP SHARING */}
      {activeTab === "whatsapp" && report && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Actions sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <div className="glass-panel p-5 rounded-2xl border border-gray-800 space-y-4 font-mono text-xs">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#ccff00]">
                Compartilhar Relatorio
              </h4>
              <p className="text-[#b9cacb] leading-relaxed text-[11px]">
                O laudo foi adaptado para uma marcacao limpa sem quebra de caracteres, otimizado para o app do WhatsApp de computadores ou celulares.
              </p>

              <div className="bg-[#121315]/80 p-4 rounded-xl border border-gray-800 space-y-2.5">
                <span className="text-[10px] uppercase font-bold text-gray-500 block">Facilidade de Envio:</span>
                <ul className="space-y-1.5 text-[11px] text-gray-300">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                    <span>Texto limpo sem caracteres especiais que quebram layouts.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                    <span>Redirecionamento instantaneo sem precisar ter o numero salvo.</span>
                  </li>
                </ul>
              </div>

              <div className="space-y-2 pt-2">
                <button
                  onClick={handleCopyWhatsApp}
                  className="w-full bg-[#1b1c1e] hover:bg-gray-800 text-white hover:text-cyan-400 border border-gray-800 py-3 rounded-xl font-bold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-all"
                >
                  <Copy className="w-4 h-4" /> Copiar Texto Prontuario
                </button>

                <button
                  onClick={handleSendWhatsApp}
                  className="w-full bg-emerald-950 hover:bg-emerald-600 text-emerald-400 hover:text-black border border-emerald-800/40 py-3 rounded-xl font-bold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-all"
                >
                  <MessageSquare className="w-4 h-4" /> Enviar p/ WhatsApp
                </button>
              </div>
            </div>
          </div>

          {/* Text preview box */}
          <div className="lg:col-span-2 glass-panel p-5 rounded-2xl border border-gray-800 space-y-4">
            <div className="flex justify-between items-center border-b border-gray-900 pb-2">
              <h4 className="font-mono text-xs font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-[#ccff00]" /> Preview de Envio de Texto
              </h4>
              <span className="text-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded font-mono font-bold">
                Formatacao Ativa
              </span>
            </div>

            <pre className="w-full bg-[#121315] text-gray-300 p-4 rounded-xl border border-gray-800 font-mono text-[11px] leading-relaxed whitespace-pre-wrap overflow-y-auto max-h-[460px]">
              {whatsAppText}
            </pre>
          </div>

        </div>
      )}

      {/* PAGE 4: SAVED REPORTS ARCHIVE (PRONTUARIO) */}
      {activeTab === "history" && (
        <div className="space-y-6">
          <div className="bg-[#1b1c1e] border border-gray-800 rounded-2xl p-6">
            <h4 className="font-mono text-xs font-bold uppercase tracking-wider text-purple-400 flex items-center gap-1.5 border-b border-gray-900 pb-3">
              <Calendar className="w-4 h-4" /> Historico de Laudos Unificados - {currentStudent.name}
            </h4>
            
            {historyList.length === 0 ? (
              <div className="p-8 text-center text-[#b9cacb] font-mono text-xs">
                Nenhum laudo unificado salvo no prontuario deste aluno ate o momento. 
                Utilize o gerador acima para consolidar o primeiro parecer oficial.
              </div>
            ) : (
              <div className="divide-y divide-gray-900 mt-2">
                {historyList.map((saved: any) => (
                  <div key={saved.id} className="py-4 flex items-center justify-between gap-4 font-mono text-xs">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-sm">Laudo Tecnico Integrado</span>
                        <span className="text-[10px] text-gray-500 bg-gray-900 px-2 py-0.5 rounded">{saved.date}</span>
                      </div>
                      <p className="text-[10px] text-gray-400 max-w-xl truncate">
                        {saved.data.resumoGeral?.justificativaNota || "Parecer clinico biomecanico de 45 dias."}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleLoadReport(saved)}
                        className="bg-cyan-950/40 text-cyan-400 border border-cyan-800/40 px-3 py-1.5 rounded hover:bg-cyan-500 hover:text-black cursor-pointer transition-all"
                      >
                        Visualizar
                      </button>
                      <button
                        onClick={() => handleDeleteReport(saved.id)}
                        className="bg-red-950/40 text-red-400 border border-red-800/40 p-1.5 rounded hover:bg-red-600 hover:text-black cursor-pointer transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}

export function sanitizePosturalReport(text: string | undefined): string {
  if (!text) return "";
  
  // Find "Recomendações Fisioterapêuticas" with any Markdown heading (#, ##, ###, ####) or simple text prefix,
  // and remove everything inside it up until the next header (starting with \n#) or the end of the text.
  // Case and accent-insensitive regex to handle various encodings and formats
  const regex = /(?:^|\n)[#\s]*Recomenda[cç][oõ]es\s+Fisioterap[eê]uticas[^\n]*([\s\S]*?)(?=\n\s*#+|$)/gi;
  let cleaned = text.replace(regex, "");
  
  // Safety check: if the heading is still present, strip everything from it to the end of the text
  const backupRegex = /(?:^|\n)[#\s]*Recomenda[cç][oõ]es\s+Fisioterap[eê]uticas[\s\S]*$/gi;
  if (backupRegex.test(cleaned)) {
    cleaned = cleaned.replace(backupRegex, "");
  }
  
  return cleaned.trim();
}
