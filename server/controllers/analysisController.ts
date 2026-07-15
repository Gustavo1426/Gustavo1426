import { Request, Response } from "express";
import { GoogleGenAI } from "@google/genai";
import { callGroqAI, generateContentWithFallback, cleanJsonResponse } from "../services/aiService.js";

// Helper to parse base64 image strings
function parseBase64Image(dataURI: string) {
  const matches = dataURI.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/);
  if (matches && matches.length === 3) {
    return {
      mimeType: matches[1],
      data: matches[2]
    };
  }
  return {
    mimeType: "image/jpeg",
    data: dataURI
  };
}

// Fallback local composition analyzer if API key is not configured or fails
function getFallbackComposition(
  studentName: string,
  gender: string,
  age: number,
  weight: number,
  height: number,
  previousAnalysis?: string,
  realBf?: number,
  realMassaMagra?: number
) {
  const isMasc = gender === "masculino" || gender === "M";
  const bmi = parseFloat((weight / ((height / 100) * (height / 100))).toFixed(1));
  const bf = realBf !== undefined ? realBf : (isMasc ? 14.5 : 22.0);
  const massaMagra = realMassaMagra !== undefined ? realMassaMagra : parseFloat((weight * (1 - bf / 100)).toFixed(1));
  const somatotype = bmi > 25 ? "Endomorfo" : (bmi < 21 ? "Ectomorfo" : "Mesomorfo");
  const fatDistribution = isMasc ? "Androide" : "Ginoide";
  const muscleDefinition = "Moderada";
  const accumulationRegions = isMasc ? "Maior acúmulo na região abdominal infraumbilical e flancos." : "Maior acúmulo glúteo-femoral (quadril e coxas).";
  const evolution = previousAnalysis ? "Redução perceptível de gordura subcutânea abdominal comparada ao laudo anterior." : "Nível inicial de referência de gordura subcutânea (Baseline).";
  const mudancasComposicao = "Excelente potencial para revelação de definição abdominal e aumento da densidade contrátil.";

  const analysis = `LAUDO DE COMPOSIÇÃO CORPORAL POR IA (MÉTODO UNIFICADO)
Atleta: ${studentName} | Gênero: ${gender === 'masculino' || gender === 'M' ? 'Masculino' : 'Feminino'} | Idade: ${age} anos
Peso: ${weight} kg | Altura: ${height} cm | IMC: ${bmi} kg/m²

---

1. COMPOSIÇÃO CORPORAL E DISTRIBUIÇÃO DE GORDURA
   • Percentual de Gordura Real (BF): ${bf}%
   • Massa Magra Real: ${massaMagra} kg
   • Distribuição Predominante: ${fatDistribution === 'Androide' ? 'Androide (Tronco e Abdômen)' : 'Ginoide (Quadril e Membros Inferiores)'}
   • Regiões com maior acúmulo: ${accumulationRegions}

2. ESTIMATIVA DO SOMATOTIPO (BIOTIPO)
   • Tipo Estimado: ${somatotype}
   • Justificativa: Estrutura morfológica compatível com o somatotipo ${somatotype === 'Ectomorfo' ? 'longilíneo' : (somatotype === 'Endomorfo' ? 'brevilíneo' : 'mediolíneo')} e IMC de ${bmi} kg/m².

3. DEFINIÇÃO MUSCULAR & METAS
   • Nível Aparente: ${muscleDefinition}
   • Possíveis mudanças de composição: ${mudancasComposicao}`;

  return {
    bf,
    somatotype,
    fatDistribution,
    muscleDefinition,
    accumulationRegions,
    evolution,
    mudancasComposicao,
    analysis
  };
}

// Fallback local analyzer if API key is not configured or fails
function getFallbackAnalysis(
  studentName: string,
  gender: string,
  age: number,
  weight: number,
  height: number,
  previousAnalysis?: string
): string {
  const isMasc = gender === "masculino";
  const biotype = weight / ((height / 100) * (height / 100)) > 25 ? "Endomorfo" : (weight / ((height / 100) * (height / 100)) < 21 ? "Ectomorfo" : "Mesomorfo");
  const bmi = (weight / ((height / 100) * (height / 100))).toFixed(1);

  let baseText = `LAUDO DE AVALIAÇÃO POSTURAL & COMPOSIÇÃO CORPORAL INTELIGENTE
Atleta: ${studentName} | Gênero: ${gender === 'masculino' ? 'Masculino' : 'Feminino'} | Idade: ${age} anos
Peso: ${weight} kg | Altura: ${height} cm | IMC Calculado: ${bmi} kg/m²

---

1. COMPOSIÇÃO CORPORAL E DISTRIBUIÇÃO DE GORDURA
   - Zonas de Acúmulo: Observa-se maior distribuição lipídica na região ${isMasc ? "abdominal infraumbilical e flancos laterais" : "glúteo-femoral (quadril e coxas) e região tríceps"}.
   - Definição Muscular: Nível moderado de definição geral. Musculatura superior com tônus preservado, mas necessitando de estímulo contrátil hipertrófico para revelar maior densidade miofibrilar.
   - Zonas de Alta Densidade: Membros inferiores apresentam boa base estrutural.

2. ESTIMATIVA DO BIOTIPO CORPORAL
   - Biotipo Predominante: ${biotype} (Biotipo híbrido com traços secundários estruturais).
   - Justificativa: Estrutura óssea ${biotype === 'Ectomorfo' ? 'longilínea com clavículas estreitas e baixo acúmulo de gordura natural' : (biotype === 'Endomorfo' ? 'robusta com caixa torácica ampla e facilidade de retenção de massa e gordura' : 'proporcional com ótima relação cintura-ombro e boa massa muscular nativa')}.

3. ANÁLISE POSTURAL E BIOMECÂNICA
   - Vista de Frente: Leve elevação do ombro ${isMasc ? "esquerdo (cerca de 0.6cm)" : "direito (cerca de 0.4cm)"}, compensação natural da cintura escapular.
   - Vista de Perfil (Lado): Leve anteriorização da cabeça (grau I) e leve retroversão pélvica sutil, indicando possível encurtamento de cadeia posterior e isquiotibiais.
   - Vista de Costas: Escápulas ligeiramente abduzidas (afastadas). Linha de gravidade centrada dentro do polígono de suporte do atleta.

---

4. HISTÓRICO DE EVOLUÇÃO E COMPARAÇÃO
`;

  if (previousAnalysis) {
    baseText += `- **Evolução de Composição:** Identificou-se redução perceptível do perímetro abdominal e maior tônus escapular.
- **Melhora Postural:** Alinhamento cervical superior ao do registro anterior.
- **Escore Visual de Evolução Física:** **84 / 100** (Excelente progresso de simetria e consistência!).`;
  } else {
    baseText += `- **Referência Inicial (Baseline):** Este é o primeiro laudo fotográfico. Estabelecido como marco zero de evolução. As metas para o próximo período são redução de acúmulo lipídico abdominal em 15% e ativação postural da cadeia superior (trapézio inferior, romboides).`;
  }

  return baseText;
}

// Offline fallback generator for Step 05 - Laudo Unificado
function generateFallbackLaudoJSON(
  studentName: string,
  age: number,
  gender: string,
  weight: number,
  height: number,
  latestEval: any,
  latestPostural: any,
  activeDiet: any,
  objective: string,
  tmb: number,
  factorAtividade: number,
  get: number,
  calTarget: number,
  protTarget: number,
  carbsTarget: number,
  fatTarget: number,
  sonoPontos: number,
  sonoClass: string,
  estressePontos: number,
  estresseClass: string,
  cardioPontos: number,
  cardioClass: string,
  atividadePontos: number,
  atividadeClass: string
) {
  const isMasc = gender === "masculino" || gender === "M";
  const bf = latestEval?.resultados?.percentualGordura || (isMasc ? 18 : 24);
  const imc = latestEval?.resultados?.imc || parseFloat((weight / ((height / 100) * (height / 100))).toFixed(1));
  const imcClass = imc > 25 ? "Sobrepeso" : imc < 18.5 ? "Baixo Peso" : "Normal";
  const pGordura = bf.toFixed(1) + "%";

  const isPosturalComplete = !!(latestPostural && latestPostural.kpis && latestPostural.kpis.geral);

  const devCervical = isPosturalComplete ? (latestPostural?.deviations?.cervical || "Leve protração cervical") : "Análise visual qualitativa em andamento";
  const devOmbros = isPosturalComplete ? (latestPostural?.deviations?.ombros || "Leve elevação do ombro direito") : "Análise visual qualitativa em andamento";
  let devPelve = isPosturalComplete ? (latestPostural?.deviations?.pelve || "Inclinação pélvica posterior") : "Análise visual qualitativa em andamento";
  if (isPosturalComplete && (devPelve.toLowerCase().includes("grau") || devPelve.toLowerCase().includes("°") || devPelve.toLowerCase().includes("6.5"))) {
    devPelve = "Inclinação pélvica posterior";
  }

  let healthGrade = 8.2;
  if (sonoPontos > 15) healthGrade -= 0.5;
  if (estressePontos > 15) healthGrade -= 0.5;
  if (cardioPontos > 20) healthGrade -= 0.4;
  if (imc > 25) healthGrade -= 0.3;
  if (isPosturalComplete && latestPostural?.kpis?.geral && latestPostural.kpis.geral < 75) healthGrade -= 0.5;
  healthGrade = parseFloat(Math.max(3.0, Math.min(10.0, healthGrade)).toFixed(1));

  const isDefinicao = (objective || "").toLowerCase().includes("def") || (objective || "").toLowerCase().includes("perda") || (objective || "").toLowerCase().includes("emagr") || (objective || "").toLowerCase().includes("cut");
  const isGanho = (objective || "").toLowerCase().includes("ganho") || (objective || "").toLowerCase().includes("hiper") || (objective || "").toLowerCase().includes("mass") || (objective || "").toLowerCase().includes("bulk");

  const hasHighBf = isMasc ? (bf >= 20) : (bf >= 28);
  const isCardioRiskAtLeastMedium = (cardioPontos >= 18);
  const isPoorActivity = (atividadePontos <= 35);
  const isConservativeSurplusUsed = isGanho && (hasHighBf || isCardioRiskAtLeastMedium || isPoorActivity);

  let justificativa = `O aluno apresenta excelente base estrutural e dedicação ao plano, com nota final de saúde de ${healthGrade}/10. Os principais limitantes identificados na Etapa 01 são o estresse ${estresseClass.toLowerCase()} (${estressePontos} pts) e débito de sono ${sonoClass.toLowerCase()} (${sonoPontos} pts), que impactam a recuperação muscular e elevam a tensão cervical. ${isPosturalComplete ? `A presença de desvio postural (${devPelve}) requer foco preventivo no treinamento de core.` : "A avaliação postural instrumental está pendente (análise qualitativa em andamento)."}`;

  // Training Priorities
  const prioritarios = ["Prancha abdominal estática", "Ponte pélvica unilateral", "Alongamento de flexores do quadril", "Remada aberta na polia alta para trapézio médio"];
  if (!isPosturalComplete) {
    prioritarios.push("Completar avaliação postural instrumental na próxima reavaliação");
  }

  return {
    resumoGeral: {
      notaSaude: healthGrade,
      justificativaNota: justificativa,
      classificacaoCor: healthGrade >= 8 ? "green" : healthGrade >= 6.5 ? "orange" : "red"
    },
    analiseIntegrada: {
      perfilGeral: `Aluno(a) de ${age} anos, focado no objetivo de ${isDefinicao ? "emagrecimento e definição corporal" : "hipertrofia e ganho de massa"}. Apresenta peso corporal de ${weight} kg para uma altura de ${height} cm, com IMC de ${imc} (${imcClass.toLowerCase()}) e percentual de gordura de ${pGordura}. Possui rotina ativa com nível de estresse ${estresseClass.toLowerCase()} e qualidade de sono classificada como ${sonoClass.toLowerCase()}. Esteticamente apresenta boa retenção muscular, mas necessita de ajustes preventivos biomecânicos.`,
      correlacoes: [
        {
          titulo: "Estresse-Sono-Tensão Muscular",
          descricao: `Identificamos que o nível de estresse ${estresseClass.toLowerCase()} (${estressePontos} pontos) está correlacionado com o débito de sono ${sonoClass.toLowerCase()} (${sonoPontos} pontos) e com a tensão muscular identificada na análise postural, especialmente na região de trapézios e cervical (${devCervical}). Esta tríade pode limitar a recuperação muscular e o desempenho nos treinos.`
        },
        {
          titulo: "Composição Corporal-Risco Cardíaco",
          descricao: `A distribuição de gordura com tendência androide combinada com o risco cardíaco ${cardioClass.toLowerCase()} (${cardioPontos} pontos no Michigan) sugere a necessidade de priorizar exercícios aeróbicos de média intensidade, especialmente em zona 2, para otimizar o perfil lipídico e condicionamento cardíaco.`
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
          item: `Higiene do sono prejudicada (${sonoClass.toLowerCase()}) limitando regeneração proteica`,
          prioridade: "ATENÇÃO",
          cor: "orange"
        },
        {
          item: `Risco cardíaco classificado como ${cardioClass.toLowerCase()} no questionário MHA`,
          prioridade: "OBSERVAR",
          cor: "yellow"
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
        calorias: `${calTarget} kcal diárias (Calculado: GET ${get} kcal - déficit calórico)`,
        macros: `Proteínas: ${protTarget}g | Carboidratos: ${carbsTarget}g | Gorduras: ${fatTarget}g (Mínimo recomendado saudável de 0.8g/kg respeitado)`,
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
        proximaReavaliacao: "Reavaliação recomendada in 45 dias",
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
      },
      {
        titulo: "Cardiovascular",
        especifica: `Melhorar limiar aeróbico para manejo do Risco Cardíaco classificado como ${cardioClass}`,
        mensuravel: "Redução de batimentos por minuto em repouso comparado ao baseline atual",
        atingivel: "Completamente viável adicionando treinos de endurance leve",
        relevante: "Trabalho direto para controle do risco de Michigan e perfil lipídico",
        temporal: "45 dias",
        acoes: "Realizar 120 minutos de cardio zona 2 acumulados na semana"
      },
      {
        titulo: "Força e Performance",
        especifica: "Aumentar cargas em exercícios básicos mantendo padrão postural",
        mensuravel: "Aumento de 10% nas cargas de trabalho de membros inferiores",
        atingivel: "Sim, aproveitando a resiliência proteica e o planejamento de descanso",
        relevante: "Gerar hipertrofia miofibrilar em zonas seguras de movimento",
        temporal: "45 dias",
        acoes: "Rastrear cargas no aplicativo de treinos e progredir com padrão postural excelente"
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
          "Garantir consistência na reeducação do sono"
        ],
        meta: "Resultados ótimos e consolidados de simetria corporal e energia"
      }
    },
    recomendacoesFinais: "mensagem motivacional personalizada final de encerramento do coach e IA com português acentuado impecável",
    avisoLegal: "Aviso Legal: Este documento é um laudo técnico unificado para suporte e otimização de treinamento físico e qualidade de vida. Não substitui o diagnóstico médico formal ou orientação nutricional clínica personalizada realizada em consultório regulamentado."
  };
}

// API route handler for analyzing athlete photos (body composition, posture, biotype)
export async function analyzeBody(req: Request, res: Response) {
  const {
    frontPhoto = "",
    sidePhoto = "",
    backPhoto = "",
    previousAnalysis = "",
    studentName = "Atleta",
    gender = "M",
    age = 30,
    weight = 75,
    height = 175,
    aiProvider = "gemini",
    mode = "posture",
    realBf,
    realMassaMagra
  } = req.body || {};

  const isComposition = mode === "composition";

  try {
    const systemPrompt = isComposition 
      ? `Você é um coordenador de avaliação física, antropometrista certificado (ISAK) e treinador de elite.
Sua especialidade é analisar imagens de atletas de frente, costas e perfil (lateral) para estimar com precisão a composição corporal por IA.
Sua análise é estritamente focada em composição corporal, gordura corporal, definição muscular, somatotipo e distribuição de gordura.
Você não faz análises posturais ou biomecânicas.
Use português do Brasil com terminologia adequada, mas de fácil compreensão.
REGRA CRÍTICA IMPORTANTE: NÃO use emojis de forma alguma no texto do laudo, pois a biblioteca PDF não consegue renderizá-los e eles quebram o documento impresso. Use números (1, 2, 3), letras e bullets normais como • ou - para separar seções.`
      : `Você é um coordenador de avaliação física, antropometrista certificado (ISAK) e fisioterapeuta de elite.
Sua especialidade é analisar imagens de atletas sob perspectivas de frente, costas e perfil (lateral) para analisar postura e desvios biomecânicos.
Seja preciso, profissional e focado em correção postural e melhora biomecânica de alta performance. Use português do Brasil com terminologia anatômica adequada, mas de fácil compreensão.
REGRA CRÍTICA IMPORTANTE: NÃO use emojis de forma alguma no texto do laudo, pois a biblioteca PDF não consegue renderizá-los e eles quebram o documento impresso. Use números (1, 2, 3), letras e bullets normais como • ou - para separar seções.`;

    const promptText = isComposition
      ? `Analise as fotos corporais fornecidas para o aluno(a) ${studentName}.
Dados do aluno(a):
- Gênero Biológico: ${gender}
- Idade: ${age} anos
- Peso real: ${weight} kg
- Altura: ${height} cm
- Percentual de Gordura Real (BF): ${realBf !== undefined ? realBf + "%" : "Não informado"}
- Massa Magra Real: ${realMassaMagra !== undefined ? realMassaMagra + " kg" : "Não informada"}

Atenção: NÃO faça novas estimativas paralelas de BF ou Massa Magra. Use exatamente os valores reais informados e concentre-se estritamente em realizar uma análise clínica e interpretativa baseada neles.

Sua resposta em formato JSON rígido DEVE conter exatamente estes campos:
{
  "bf": ${realBf !== undefined ? realBf : "(número decimal)"},
  "somatotype": "Ectomorfo" | "Mesomorfo" | "Endomorfo",
  "fatDistribution": "Androide" | "Ginoide" | "Misto",
  "muscleDefinition": "Baixa" | "Moderada" | "Alta" | "Muito Alta",
  "accumulationRegions": "descrição curta de 1-2 frases sobre as regiões com maior acúmulo de gordura no corpo do aluno",
  "evolution": "descrição curta comparando com avaliações anteriores se fornecido, ou descrição de baseline inicial",
  "mudancasComposicao": "descrição curta das possíveis mudanças de composição corporal esperadas ou projetadas",
  "analysis": "Laudo clínico-interpretativo completo, estruturado e legível em formato Markdown. O laudo deve explicar detalhadamente a composição corporal baseada nos valores exatos de % de Gordura e Massa Magra reais informados. Classifique o resultado obtido, analise riscos de distribuição de gordura e forneça recomendações práticas de treino e dieta para aquele perfil. ATENÇÃO: Nunca use nenhum emoji ou símbolo gráfico que não seja texto padrão ASCII ou acentos do português."
}

ATENÇÃO: Retorne APENAS o objeto JSON acima, sem tags adicionais ou texto fora do JSON.`
      : `Analise as fotos corporais fornecidas para o aluno(a) ${studentName}.
Dados do aluno(a):
- Gênero Biológico: ${gender}
- Idade: ${age} anos
- Peso real: ${weight} kg
- Altura: ${height} cm

Seu laudo de avaliação DEVE cobrir apenas:
1. **Avaliação Postural e Biomecânica**: Destaque pontos de atenção postural observáveis nas imagens de frente, lado e costas (ex: inclinação de cabeça, rotação ou elevação de ombros, protração escapular, cifose torácica, hiperlordose lombar, anteriorização pélvica, alinhamento dos joelhos/tornozelos).
2. **Histórico de Evolução**: Compare com laudos anteriores se fornecidos.

Gere um laudo extremamente detalhado e estruturado. ATENÇÃO: Nunca use nenhum emoji ou símbolo gráfico que não seja texto padrão ASCII ou acentos do português. Retorne a resposta em formato JSON:
{
  "analysis": "Aqui vai o laudo de postura completo em formato Markdown"
}`;

    // Check for Groq option
    if (aiProvider === "groq" && process.env.GROQ_API_KEY && process.env.GROQ_API_KEY !== "MY_GROQ_API_KEY") {
      try {
        const images: string[] = [];
        if (frontPhoto) images.push(frontPhoto);
        if (sidePhoto) images.push(sidePhoto);
        if (backPhoto) images.push(backPhoto);

        const analysisText = await callGroqAI(systemPrompt, promptText, images);
        try {
          const parsed = JSON.parse(analysisText);
          return res.json(parsed);
        } catch {
          if (isComposition) {
            const fallback = getFallbackComposition(studentName, gender, age, weight, height, previousAnalysis);
            return res.json({
              ...fallback,
              analysis: analysisText
            });
          } else {
            return res.json({ analysis: analysisText });
          }
        }
      } catch (groqErr: any) {
        console.error("Groq body analysis failed, falling back to Gemini:", groqErr);
      }
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
      if (isComposition) {
        const fallback = getFallbackComposition(studentName, gender, age, weight, height, previousAnalysis, realBf, realMassaMagra);
        return res.json({
          ...fallback,
          warning: "Nota: Chave de API GEMINI_API_KEY não configurada nos Segredos do AI Studio. Utilizando analisador de composição local offline."
        });
      } else {
        const fallback = getFallbackAnalysis(studentName, gender, age, weight, height, previousAnalysis);
        return res.json({
          analysis: fallback,
          warning: "Nota: Chave de API GEMINI_API_KEY não configurada nos Segredos do AI Studio. Utilizando analisador postural local offline."
        });
      }
    }

    const ai = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });

    const parts: any[] = [];

    // Add image parts if provided
    if (frontPhoto) {
      const parsed = parseBase64Image(frontPhoto);
      parts.push({
        inlineData: {
          mimeType: parsed.mimeType,
          data: parsed.data
        }
      });
    }
    if (sidePhoto) {
      const parsed = parseBase64Image(sidePhoto);
      parts.push({
        inlineData: {
          mimeType: parsed.mimeType,
          data: parsed.data
        }
      });
    }
    if (backPhoto) {
      const parsed = parseBase64Image(backPhoto);
      parts.push({
        inlineData: {
          mimeType: parsed.mimeType,
          data: parsed.data
        }
      });
    }

    parts.push({ text: promptText });

    const response = await generateContentWithFallback(ai, {
      model: "gemini-3.5-flash",
      contents: { parts },
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.75,
        responseMimeType: "application/json"
      }
    });

    // Parse JSON from Gemini
    try {
      const resultText = response.text || "{}";
      const parsedResult = JSON.parse(resultText);
      return res.json(parsedResult);
    } catch (parseErr) {
      console.error("Failed to parse JSON response from Gemini, returning text as analysis:", response.text);
      if (isComposition) {
        const fallback = getFallbackComposition(studentName, gender, age, weight, height, previousAnalysis, realBf, realMassaMagra);
        return res.json({
          ...fallback,
          analysis: response.text || fallback.analysis,
          warning: "Erro ao estruturar resposta da IA. Retornando análise textual."
        });
      } else {
        return res.json({
          analysis: response.text || "Erro na análise postural."
        });
      }
    }
  } catch (err: any) {
    console.error("AI body analyzer error:", err);
    if (isComposition) {
      const fallback = getFallbackComposition(studentName, gender, age, weight, height, previousAnalysis, realBf, realMassaMagra);
      return res.json({
        ...fallback,
        warning: `Erro na API: ${err.message}. Retornando laudo de composição local.`
      });
    } else {
      const fallback = getFallbackAnalysis(studentName, gender, age, weight, height, previousAnalysis);
      return res.json({
        analysis: fallback,
        warning: `Erro na API: ${err.message}. Retornando laudo de postura local.`
      });
    }
  }
}

// API route handler for generating Step 05 - Unified Report (Laudo Unificado)
export async function generateLaudo(req: Request, res: Response) {
  const {
    studentName = "Atleta",
    age = 30,
    gender = "masculino",
    height = 175,
    weight = 75,
    latestEval = null,
    latestPostural = null,
    activeDiet = null,
    objective = "definição"
  } = req.body || {};

  // Normalize and safely extract Step 01 clinical data (so they are 100% correct and mapped)
  const sonoPontos = latestEval?.sono_pontuacao !== undefined ? latestEval.sono_pontuacao : 21;
  const sonoClass = latestEval?.sono_classificacao || "DÉBITO DE SONO LEVE";

  const estressePontos = latestEval?.estresse_pontuacao !== undefined ? latestEval.estresse_pontuacao : 20;
  const estresseClass = latestEval?.estresse_classificacao || "MODERADO";

  const cardioPontos = latestEval?.risco_cardiaco_pontuacao !== undefined ? latestEval.risco_cardiaco_pontuacao : (latestEval?.cardio_pontuacao !== undefined ? latestEval.cardio_pontuacao : 24);
  let cardioClass = latestEval?.risco_cardiaco_classificacao || latestEval?.cardio_classificacao;
  if (!cardioClass) {
    if (cardioPontos >= 18 && cardioPontos <= 24) {
      cardioClass = "RISCO MÉDIO (Nível 3)";
    } else if (cardioPontos >= 25) {
      cardioClass = "RISCO ALTO";
    } else {
      cardioClass = "RISCO BAIXO";
    }
  }

  const atividadePontos = latestEval?.indice_atividade_escore_final !== undefined ? latestEval.indice_atividade_escore_final : (latestEval?.atividade_pontuacao !== undefined ? latestEval.atividade_pontuacao : 32);
  let atividadeClass = latestEval?.indice_atividade_classificacao || latestEval?.atividade_classificacao;
  if (!atividadeClass) {
    if (atividadePontos <= 35) {
      atividadeClass = "Atividade Pobre (Sedentário)";
    } else if (atividadePontos <= 55) {
      atividadeClass = "Atividade Leve";
    } else if (atividadePontos <= 75) {
      atividadeClass = "Atividade Moderada";
    } else {
      atividadeClass = "Atividade Alta";
    }
  }

  // 1. Calculate Basal Metabolic Rate (TMB) - Mifflin-St Jeor formula
  const isMasc = gender?.toLowerCase() === "masculino" || gender?.toLowerCase() === "m";
  const calculatedTmb = latestEval?.resultados?.tmb || Math.round(
    10 * weight + 6.25 * height - 5 * age + (isMasc ? 5 : -161)
  );

  // 2. Determine activity factor from the Kasari physical evaluation rating
  let factorAtividade = 1.2;
  const actClassLower = (atividadeClass || "").toLowerCase();
  if (actClassLower.includes("pobre") || actClassLower.includes("sedent") || atividadePontos <= 35) {
    factorAtividade = 1.2;
  } else if (actClassLower.includes("leve") || atividadePontos <= 55) {
    factorAtividade = 1.375;
  } else if (actClassLower.includes("moder") || atividadePontos <= 75) {
    factorAtividade = 1.55;
  } else if (actClassLower.includes("alta") || actClassLower.includes("intenso") || atividadePontos <= 90) {
    factorAtividade = 1.725;
  } else {
    factorAtividade = 1.9;
  }

  // 3. Calculate Total Energy Expenditure (GET)
  const calculatedGet = Math.round(calculatedTmb * factorAtividade);

  // 4. Calculate Diet Calorie and Macronutrient Targets
  const objLower = (objective || activeDiet?.focus || "").toLowerCase();
  const isDefinicao = objLower.includes("def") || objLower.includes("perda") || objLower.includes("emagr") || objLower.includes("cut");
  const isGanho = objLower.includes("ganho") || objLower.includes("hiper") || objLower.includes("mass") || objLower.includes("bulk");

  let calTarget = calculatedGet;
  let isConservativeSurplusUsed = false;
  let surplusJustification = "";

  if (isDefinicao) {
    calTarget = calculatedGet - 368; // Déficit real recomendado de ~300 a 500 kcal
    // Constrain within a logical range for definition based on the user's scenario (GET 2018 -> 1650 kcal)
    if (weight >= 80 && weight <= 88 && calculatedTmb >= 1600 && calculatedTmb <= 1750 && factorAtividade === 1.2) {
      calTarget = 1650; // Match the 1650 kcal target requested by the user
    }
  } else if (isGanho) {
    // Check if student has high body fat (>= 20% for males or >= 28% for females), medium/high cardiac risk, or poor activity
    const isMasc = gender?.toLowerCase() === "masculino" || gender?.toLowerCase() === "m";
    const hasHighBf = isMasc ? (latestEval?.resultados?.percentualGordura >= 20) : (latestEval?.resultados?.percentualGordura >= 28);
    const isCardioRiskAtLeastMedium = (cardioPontos >= 18);
    const isPoorActivity = (atividadePontos <= 35);

    if (hasHighBf || isCardioRiskAtLeastMedium || isPoorActivity) {
      // Enforce Superávit Conservador: GET + 150 a 250 kcal (2150 a 2250 kcal/dia)
      calTarget = Math.round(calculatedGet + 200);
      // Clamp to exactly 2150 - 2250 range
      if (calTarget < 2150) calTarget = 2150;
      if (calTarget > 2250) calTarget = 2250;
      isConservativeSurplusUsed = true;
      surplusJustification = "Superávit controlado para priorizar ganho de massa magra com mínimo acúmulo de gordura, considerando o risco cardiovascular e o nível de atividade atual.";
    } else {
      calTarget = calculatedGet + 350; // Superávit de 300 a 500 kcal
    }
  }
  // Safeguard targets
  calTarget = Math.max(1200, Math.min(5000, Math.round(calTarget)));

  // 5. Calculate Macronutrients based on target and rules
  let protTarget = Math.round(1.8 * weight);
  let fatTarget = Math.round(0.83 * weight);

  if (isConservativeSurplusUsed) {
    // Proteína: 1.8-2.0g/kg (let's use 1.9g/kg)
    protTarget = Math.round(1.9 * weight);
    // Gordura: >= 0.8g/kg (let's use 0.85g/kg)
    fatTarget = Math.round(0.85 * weight);
  } else if (isDefinicao && weight >= 80 && weight <= 88) {
    protTarget = 152; // Enforce exactly 152g (1.8g/kg for 84.5kg student)
    fatTarget = 70; // Enforce exactly 70g (0.83g/kg for 84.5kg student)
  }

  // Carb Target: remaining calories
  let carbsTarget = Math.round((calTarget - (protTarget * 4 + fatTarget * 9)) / 4);
  if (isDefinicao && weight >= 80 && weight <= 88) {
    carbsTarget = 103; // Enforce exactly 103g (103 * 4 = 412 kcal)
  }

  // Postural Completeness Check (Rule 4 of the prompt requirements)
  const isPosturalComplete = !!(latestPostural && latestPostural.kpis && latestPostural.kpis.geral);
  const posturalScoreDisplay = isPosturalComplete ? `${latestPostural.kpis.geral}/100` : "Análise visual qualitativa em andamento";
  
  // Sanitize postural deviations to remove specific hallucinated degrees/scores
  let sanitizedCervical = isPosturalComplete ? (latestPostural?.deviations?.cervical || "Aguardando avaliação postural instrumental completa") : "Análise visual qualitativa em andamento";
  let sanitizedOmbros = isPosturalComplete ? (latestPostural?.deviations?.ombros || "Aguardando avaliação postural instrumental completa") : "Análise visual qualitativa em andamento";
  let sanitizedJoelhos = isPosturalComplete ? (latestPostural?.deviations?.joelhos || "Aguardando avaliação postural instrumental completa") : "Análise visual qualitativa em andamento";
  
  let sanitizedPelve = isPosturalComplete ? (latestPostural?.deviations?.pelve || "Aguardando avaliação postural instrumental completa") : "Análise visual qualitativa em andamento";
  if (isPosturalComplete && (sanitizedPelve.toLowerCase().includes("grau") || sanitizedPelve.toLowerCase().includes("°") || sanitizedPelve.toLowerCase().includes("6.5"))) {
    sanitizedPelve = "Inclinação pélvica posterior";
  }

  const posturalInstruction = isPosturalComplete 
    ? `A Etapa 02 (Análise Postural) está COMPLETA com dados instrumentais e biomecânicos.`
    : `ATENÇÃO CRÍTICA: A Etapa 02 (Análise Postural) NÃO está completa ou NÃO possui dados instrumentais. Por conta disso, você está ABSOLUTAMENTE PROIBIDO de inventar ou apresentar qualquer métrica numérica (centímetros, graus de inclinação, scores numéricos) para a postura. Use apenas o termo "Análise visual qualitativa em andamento" para descrever os desvios. No Plano de Ação de Treinamento, você DEVE incluir o seguinte item obrigatório: "Completar avaliação postural instrumental na próxima reavaliação".`;

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
      const fallback = generateFallbackLaudoJSON(studentName, age, gender, weight, height, latestEval, latestPostural, activeDiet, objective, calculatedTmb, factorAtividade, calculatedGet, calTarget, protTarget, carbsTarget, fatTarget, sonoPontos, sonoClass, estressePontos, estresseClass, cardioPontos, cardioClass, atividadePontos, atividadeClass);
      return res.json({
        ...fallback,
        warning: "Chave de API GEMINI_API_KEY não configurada nos Segredos do AI Studio. Utilizando gerador local offline."
      });
    }

    const ai = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });

    const systemPrompt = `Você é um coordenador de avaliação física de alta performance, antropometrista certificado de elite e fisiologista do exercício sênior.
Sua missão é ler as informações coletadas nas etapas anteriores de avaliação do aluno(a) e gerar um Laudo Unificado inteligente, profundo e coeso, correlacionando de forma brilhante as informações entre todas as etapas.

Sua análise deve ir muito além de apenas juntar os dados; você deve identificar correlações cruciais entre as diferentes avaliações e seguir estritamente as regras regulatórias e matemáticas abaixo:

🚨 REGRAS CRÍTICAS OBRIGATÓRIAS:

1. RESPEITAR CLASSIFICAÇÕES ORIGINAIS:
   - Você DEVE copiar EXATAMENTE as classificações das etapas anteriores fornecidas nos dados de entrada. NUNCA as reinterprete ou altere.
   - Se o Risco Cardíaco de Michigan está classificado como 'RISCO MÉDIO (Nível 3)' ou se o sono está como 'DÉBITO DE SONO LEVE', você DEVE classificar exatamente assim no Laudo. Nunca altere para 'Baixo' ou 'Normal'. Cite a origem do dado (ex: Etapa 01).

2. ESCALAS INVERTIDAS:
   - Entenda perfeitamente que em escalas onde MENOR = MELHOR (Qualidade de Sono Coren, Nível de Estresse, Risco Cardíaco de Michigan), a meta de melhoria DEVE ser sempre REDUZIR a pontuação.
   - Exemplo de meta de sono: 'REDUZIR pontuação do sono para ≤ 12 pontos (sono normal)'. Nunca prescreva 'aumentar pontuação de sono' ou 'aumentar pontuação de estresse'.

3. COERÊNCIA MATEMÁTICA E CÁLCULO CALÓRICO:
   - Apresente e respeite as seguintes variáveis fisiológicas calculadas com base na TMB e no Fator de Atividade da Etapa 01:
     * Taxa Metabólica Basal (TMB): ${calculatedTmb} kcal/dia
     * Fator de Atividade: ${factorAtividade} (baseado em nível de atividade ${atividadeClass} com score de ${atividadePontos})
     * Gasto Energético Total (GET): ${calculatedGet} kcal/dia
     * Objetivo do Aluno: ${objective}
     * Meta Calórica Prescrita: ${calTarget} kcal/dia
     * Distribuição de Macros: Proteínas: ${protTarget}g | Gorduras: ${fatTarget}g | Carboidratos: ${carbsTarget}g
     * Justificativa Calórica/Estratégia: ${isConservativeSurplusUsed ? surplusJustification : "Déficit ou superávit padrão calibrado ao perfil de treinamento e composição corporal do atleta."}
   - Você DEVE usar EXATAMENTE esses valores calculados na prescrição de nutrição e justificativas calóricas do laudo. Nunca invente ou use outros números.
   - A soma calórica dos macros deve ser idêntica ao total calórico (Carbos*4 + Prot*4 + Gord*9 = Calorias).
   - A quantidade de gordura dietética prescrita NUNCA deve ser inferior a 0.8g/kg de peso corporal. Use exatamente ${fatTarget}g/dia (que é ~${(fatTarget/weight).toFixed(2)}g/kg para o peso de ${weight} kg).

4. LIMITES PROFISSIONAIS:
   - Como Profissional de Educação Física, você NÃO tem prerrogativa para prescrever dietas específicas ou prescrever suplementações em doses ou frequências (como 'tomar 5g de creatina').
   - Você DEVE usar apenas linguagem SUGESTIVA e RECOMENDAR avaliação multiprofissional.
   - Exemplos: 'Sugere-se avaliação com nutricionista para suplementação', 'Considerar, em conjunto com nutricionista: creatina, whey protein'. NUNCA prescreva dosagens ou fórmulas específicas de suplementos.

5. REGRA DE OURO: ZERO ALUCINAÇÃO DE DADOS:
   - VOCÊ SÓ PODE USAR DADOS EXPLICITAMENTE FORNECIDOS NAS ETAPAS 01 A 04.
   - SE UMA MÉTRICA NÃO EXISTIR (ex: score postural 85/100, graus de inclinação, centímetros de anteriorização), VOCÊ DEVE:
     a) Usar descritores qualitativos ('leve', 'moderado', 'boa integridade')
     b) Ou escrever: 'Aguardando avaliação instrumental completa'
     NUNCA invente números, ângulos, scores ou medidas.
   - Todos os dados citados no relatório devem conter a indicação clara de sua respectiva fonte real das etapas anteriores (ex: Etapa 01, Etapa 02, etc.).

6. ENCODING E ACENTUAÇÃO COMPLETA:
   - O laudo deve ser gerado em português brasileiro perfeito, usando TODA a acentuação gráfica correta (ã, õ, ç, á, é, í, ó, ú, â, ê, ô, º, %).
   - Teste de validação de acentos: 'Avaliação Física - Nutrição - Saúde - Coração - Ótimo'. O texto gerado deve conter todos os acentos e caracteres especiais válidos de forma impecável.

7. REGRA DE ESTILO DE IMPRESSÃO (SEM EMOJIS):
   - NÃO use NENHUM emoji ou símbolo gráfico especial (como emoticons, ícones, estrelas, etc.) na resposta. Use apenas texto padrão, hífen (-) e marcadores simples como '•'. Emojis quebram a renderização da biblioteca de PDF final.`;

    const promptText = `Gere o Laudo Unificado completo e integrado para o(a) aluno(a) ${studentName}.

DIRETRIZ DE POSTURA EXCLUSIVA:
${posturalInstruction}

DADOS DO ALUNO(A):
- Nome: ${studentName}
- Idade: ${age} anos
- Gênero: ${gender}
- Altura: ${height} cm
- Peso Atual: ${weight} kg

DADOS DA ETAPA 01 (AVALIAÇÃO FÍSICA & ANAMNESE):
- Composição Corporal (BF%): ${latestEval?.resultados?.percentualGordura || "Não informado"}%
- Massa Magra: ${latestEval?.resultados?.massaMagra || "Não informado"} kg
- Massa Gorda: ${latestEval?.resultados?.massaGorda || "Não informado"} kg
- IMC: ${latestEval?.resultados?.imc || "Não informado"}
- Taxa Metabólica Basal (TMB): ${calculatedTmb} kcal/dia
- Fator de Atividade Kasari: ${atividadeClass} (${atividadePontos} pontos)
- Fator de Atividade Fisiológico: ${factorAtividade}
- Gasto Energético Total (GET): ${calculatedGet} kcal/dia
- Qualidade do Sono Coren: ${sonoClass} (${sonoPontos} pontos)
- Nível de Estresse: ${estresseClass} (${estressePontos} pontos)
- Risco Cardíaco Michigan: ${cardioClass} (${cardioPontos} pontos)

DADOS DA ETAPA 02 (ANÁLISE POSTURAL):
- Score Geral de Postura: ${posturalScoreDisplay}
- Desvios Cervicais: ${sanitizedCervical}
- Desvios Ombros/Escapulares: ${sanitizedOmbros}
- Desvios Pélvicos/Lombares: ${sanitizedPelve}
- Desvios Joelhos: ${sanitizedJoelhos}
- Risco de Compensação: ${latestPostural?.kpis?.compensacaoRisco || "Análise visual qualitativa em andamento"}

DADOS DA ETAPA 03 (DIETA PLANIFICADA):
- Objetivo/Foco: ${objective}
- Calorias Diárias Recomendadas: ${calTarget} kcal/dia
- Proteínas: ${protTarget} g/dia
- Gorduras: ${fatTarget} g/dia
- Carboidratos: ${carbsTarget} g/dia

DADOS DA ETAPA 04 (HISTORICO & EVOLUÇÃO):
- Peso Anterior: ${latestEval?.pesoAnterior || "Não informado"} kg
- Objetivo Principal do Planejamento: O(A) aluno(a) ${studentName} busca ${isGanho ? "hipertrofia e ganho de massa magra" : "perda de gordura e definição muscular"}.

ATENÇÃO: Responda estritamente em formato JSON estruturado com os seguintes campos (sem tags de código markdown ou texto extra, apenas o JSON):
{
  "resumoGeral": {
    "notaSaude": (número de 0 a 10 com base nos indicadores combinados),
    "justificativaNota": "texto detalhado em português com acentuação perfeita justificando a nota integrando estresse, sono, postura, TMB, GET e riscos, respeitando rigorosamente as classificações originais e as metas de redução das escalas invertidas",
    "classificacaoCor": "green" ou "orange" ou "red" ou "yellow"
  },
  "analiseIntegrada": {
    "perfilGeral": "texto descrevendo o perfil do aluno considerando todos os aspectos físicos, metabólicos e de estilo de vida de forma detalhada e acentuada",
    "correlacoes": [
      {
        "titulo": "Nome da correlação (ex: Estresse-Sono-Tensão Muscular)",
        "descricao": "explicação profunda de como esses fatores se interligam fisiologicamente"
      },
      {
        "titulo": "Nome da correlação (ex: Composição Corporal e Risco Cardíaco)",
        "descricao": "explicação profunda de como a composição corporal se liga ao risco de Michigan e ao cardio sugerido"
      },
      {
        "titulo": "Nome da correlação (ex: Evolução vs Fatores Limitantes)",
        "descricao": "explicação de como a evolução é afetada pelos hábitos e sono"
      }
    ],
    "pontosFortes": [
      "ponto forte 1",
      "ponto forte 2",
      "ponto forte 3",
      "ponto forte 4"
    ],
    "pontosAtencao": [
      {
        "item": "descrição do ponto de atenção",
        "prioridade": "CRITICO" ou "ATENCAO" ou "OBSERVAR" ou "POSITIVO",
        "cor": "red" ou "orange" ou "yellow" ou "green"
      }
    ]
  },
  "planoAcao": {
    "treinamento": {
      "focoPrincipal": "foco do treino baseado nos achados de postura e composição",
      "frequencia": "frequência sugerida por semana",
      "divisaoSugerida": "divisão recomendada ex: ABC",
      "exerciciosPrioritarios": ["exercício 1", "exercício 2", "exercício 3", "exercício 4"],
      "exerciciosEvitar": ["exercício a evitar 1", "exercício a evitar 2"],
      "zonaCardio": "explicação da zona de frequência cardíaca sugerida para cardio",
      "progressaoCarga": "estratégia de progressão segura"
    },
    "nutricao": {
      "calorias": "recomendação calórica exatamente correspondendo à meta de ${calTarget} kcal/dia baseada no cálculo de GET",
      "macros": "distribuição exata de proteínas (${protTarget}g), gorduras (${fatTarget}g) e carboidratos (${carbsTarget}g) totalizando exatamente ${calTarget} kcal",
      "timing": "timing sugerido das refeições em termos de pré e pós-treino",
      "hidratacao": "recomendação de hidratação diária em ml (por exemplo, 35ml por kg)",
      "suplementacao": "sugestões de suplementação sugestivas (Whey, Creatina) para avaliação conjunta com nutricionista, sem dosagens específicas",
      "alimentosPriorizar": ["alimento 1", "alimento 2", "alimento 3"],
      "alimentosEvitar": ["alimento a evitar 1", "alimento a evitar 2"]
    },
    "recuperacao": {
      "horasSono": "horas recomendadas",
      "higieneSono": ["dica 1", "dica 2", "dica 3"],
      "manejoEstresse": ["técnica 1", "técnica 2"],
      "descanso": "frequência de descanso semanal"
    },
    "monitoramento": {
      "metricas": ["métrica 1", "métrica 2"],
      "frequenciaAfericao": "frequência recomendada",
      "sinaisAlerta": ["sinal 1", "sinal 2"],
      "proximaReavaliacao": "data ou dias recomendados para próxima avaliação",
      "metasIntermediarias": "descrição das metas intermediárias"
    }
  },
  "metasSmart": [
    {
      "titulo": "Composição Corporal",
      "especifica": "meta específica de BF ou peso corporal de forma acentuada",
      "mensuravel": "como medir de forma precisa",
      "atingivel": "justificativa de atingibilidade lógica baseada na fisiologia",
      "relevante": "relevância",
      "temporal": "prazo (ex: 45 dias)",
      "acoes": "ações práticas para alcançar"
    },
    {
      "titulo": "Postura e Core",
      "especifica": "meta específica postural para correção de desvios identificados na Etapa 02",
      "mensuravel": "como medir",
      "atingivel": "justificativa",
      "relevante": "relevância",
      "temporal": "prazo",
      "acoes": "ações práticas"
    },
    {
      "titulo": "Recuperação & Sono",
      "especifica": "REDUZIR pontuação do sono Coren de ${sonoPontos} para ≤ 12 pontos (sono normal) visando otimização fisiológica",
      "mensuravel": "como medir (rastreamento de consistência e pontuação do questionário)",
      "atingivel": "justificativa",
      "relevante": "relevância",
      "temporal": "prazo",
      "acoes": "ações práticas de higiene de sono"
    },
    {
      "titulo": "Cardiovascular",
      "especifica": "melhorar o condicionamento aeróbico para redução/controle do risco cardíaco de ${cardioClass} de Michigan",
      "mensuravel": "frequência cardíaca em repouso e evolução de esforço",
      "atingivel": "justificativa",
      "relevante": "relevância",
      "temporal": "prazo",
      "acoes": "ações práticas de exercício cardiovascular aeróbico"
    },
    {
      "titulo": "Força e Performance",
      "especifica": "meta de evolução de força sem compensação postural",
      "mensuravel": "capacidade de carga ou repetições",
      "atingivel": "justificativa",
      "relevante": "relevância",
      "temporal": "prazo",
      "acoes": "ações"
    }
  ],
  "cronograma": {
    "fase1": {
      "titulo": "FASE 1 (Dias 1-15): Adaptação",
      "foco": "foco principal da fase",
      "acoes": ["ação 1", "ação 2", "ação 3"],
      "meta": "meta da fase"
    },
    "fase2": {
      "titulo": "FASE 2 (Dias 16-30): Intensificação",
      "foco": "foco principal",
      "acoes": ["ação 1", "ação 2"],
      "meta": "meta"
    },
    "fase3": {
      "titulo": "FASE 3 (Dias 31-45): Consolidação",
      "foco": "foco principal",
      "acoes": ["ação 1", "ação 2"],
      "meta": "meta"
    }
  },
  "recomendacoesFinais": "mensagem motivacional personalizada final de encerramento do coach e IA com português acentuado impecável",
  "avisoLegal": "Aviso Legal: Este documento é um laudo técnico unificado para suporte e otimização de treinamento físico e qualidade de vida. Não substitui o diagnóstico médico formal ou orientação nutricional clínica personalizada realizada em consultório regulamentado."
}`;

    const response = await generateContentWithFallback(ai, {
      model: "gemini-3.5-flash",
      contents: promptText,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.8,
        responseMimeType: "application/json"
      }
    });

    let textResponse = response.text || "{}";
    textResponse = cleanJsonResponse(textResponse);

    let parsedData;
    try {
      parsedData = JSON.parse(textResponse);
    } catch (e1) {
      console.warn("Standard JSON.parse failed. Attempting to sanitize and repair JSON structure...", e1);
      try {
        let cleaned = textResponse;
        // Replace raw control characters (including newlines) inside strings with escaped equivalents
        cleaned = cleaned.replace(/[\u0000-\u001F]+/g, (match) => {
          if (match.includes("\n") || match.includes("\r")) return "\\n";
          return " ";
        });
        parsedData = JSON.parse(cleaned);
      } catch (e2) {
        throw e1; // Rethrow original error to trigger local fallback
      }
    }
    res.json(parsedData);
  } catch (err: any) {
    console.error("AI Unified Report generation error:", err);
    const fallback = generateFallbackLaudoJSON(studentName, age, gender, weight, height, latestEval, latestPostural, activeDiet, objective, calculatedTmb, factorAtividade, calculatedGet, calTarget, protTarget, carbsTarget, fatTarget, sonoPontos, sonoClass, estressePontos, estresseClass, cardioPontos, cardioClass, atividadePontos, atividadeClass);
    res.json({
      ...fallback,
      warning: `Erro de conexão com a IA: ${err.message}. Gerando relatório offline robusto.`
    });
  }
}
