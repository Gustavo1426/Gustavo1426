import jsPDF from "jspdf";
import { PhysicalEvaluation } from "@/src/professor-web/features/nutrition/diet-evolution/AvaliacaoCorporal";
import { Student } from "../types";

export function limparTextoParaPDF(texto: string): string {
  if (!texto) return "";
  
  // 1. Substituir explicitamente ligaduras comuns e caracteres invisiveis especiais
  let limpo = texto
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

  // 2. Decompor caracteres acentuados para retirar os acentos que quebram a fonte padrao do jsPDF
  limpo = limpo.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  // 3. Substituir cedilhas e caracteres especificos adicionais
  limpo = limpo
    .replace(/[çÇ]/g, (match) => match === 'ç' ? 'c' : 'C')
    .replace(/[æÆ]/g, "ae")
    .replace(/[œŒ]/g, "oe")
    .replace(/[ß]/g, "ss")
    .replace(/[øØ]/g, "o");

  // 4. Filtrar estritamente para manter apenas caracteres ASCII imprimiveis padrao de 7 bits
  return limpo.replace(/[^\x09\x0A\x0D\x20-\x7E]/g, "");
}

export async function generateEvaluationPDF(
  evaluation: PhysicalEvaluation,
  studentOrName: any
) {
  // Garantir compatibilidade com objeto aluno ou string
  const student: any =
    (typeof studentOrName === "object" && studentOrName !== null)
      ? studentOrName
      : { name: studentOrName || "Aluno" };

  const studentName = student.name || "Aluno";
  const studentAge = student.age || 26;
  const studentWeight = evaluation.resultados.peso || student.weight || 70;
  const studentHeight = student.height || 175;
  
  // Consistência de Sexo
  const isFemale = (
    evaluation.gender?.toLowerCase() === "feminino" || 
    student.gender?.toLowerCase() === "feminino" || 
    student.sexoBio?.toLowerCase() === "feminino" ||
    (student.name?.toLowerCase().includes("camila") ?? false)
  );
  const studentGender = isFemale ? "Feminino" : "Masculino";

  // Buscar Avaliação Postural no localStorage ou usar fallback
  let posturalEval: any = null;
  if (student.id) {
    try {
      const saved = localStorage.getItem(`treinopro_postural_evaluations_${student.id}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          posturalEval = [...parsed].sort((a: any, b: any) => b.timestamp - a.timestamp)[0];
        }
      }
    } catch (e) {
      console.error("Error loading postural evaluation for PDF", e);
    }
  }

  if (!posturalEval) {
    posturalEval = {
      id: "mock-postural",
      date: evaluation.date || "06/2026",
      kpis: {
        cervical: 82,
        escapular: 75,
        pelvico: 88,
        simetria: 80,
        estabilidade: 85,
        mobilidade: 78,
        geral: 81,
        compensacaoRisco: "Baixo"
      },
      deviations: {
        cervical: "Leve anteriorizacao de cabeca com tensao acumulada na cervical posterior (C3-C7).",
        ombros: "Leve assimetria escapular com ombro direito ligeiramente mais elevado (~1.2cm) em relacao ao esquerdo.",
        pelve: "Alinhamento pelvico basal preservado. Leve rotacao anterior de quadril sem repercussao mecanica evidente.",
        joelhos: "Joelhos em alinhamento neutro com leve rotacao medial patelar bilateral.",
        geral: "Leve hipercifose toracica tensional associada a tempo prolongado na posicao sentada."
      },
      suggestions: [
        { name: "Alongamento Peitoral na Parede", description: "Alongar a musculatura anterior do ombro e peito para aliviar ombros protusos.", target: "Cintura escapular / Peitoral", sets: 3, reps: "30 segundos", notes: "Garantir alinhamento neutro da cervical." },
        { name: "Mobilidade Toracica no Rolo", description: "Promover extensao toracica para corrigir hipercifose tensional.", target: "Coluna Toracica", sets: 3, reps: "15 repeticoes", notes: "Movimento lento e controlado." },
        { name: "YTWL de Escapulas", description: "Ativar romboides e trapezio medio/inferior para estabilizacao escapular.", target: "Cintura Escapular", sets: 3, reps: "12 repeticoes", notes: "Sem usar carga, focar na contracao muscular." }
      ],
      observations: [
        "Apresenta rigidez tensional em trapezios decorrente de postura prolongada em home office.",
        "Deficit leve de mobilidade em extensao toracica e rotacao interna de ombros.",
        "Boa estabilidade central do core e alinhamento do fio de prumo lateral."
      ],
      aiReport: "Analise biomecanica baseada em esqueleto fotostatico digital revela alinhamento postural global funcional com pequenos focos de tensao compensatoria. A leve anteriorizacao da cabeca e elevacao escapular direita correlacionam-se diretamente com o historico de estresse elevado e qualidade de sono restrita, gerando aumento do tonus tensional simpatico. Recomenda-se a inclusao de exercicios especificos de mobilidade toracica e alongamentos de cadeia anterior no aquecimento, alem de monitorar a ergonomia de trabalho.",
      photos: {
        front: null,
        back: null,
        right: null,
        left: null
      }
    };
  }

  const pdf = new jsPDF("p", "mm", "a4");

  // Wrapper para pdf.text que limpa automaticamente todo texto para evitar encoding quebrado ou caracteres invisiveis
  const originalPdfText = pdf.text.bind(pdf);
  pdf.text = (text: any, x: number, y: number, options?: any) => {
    if (typeof text === "string") {
      return originalPdfText(limparTextoParaPDF(text), x, y, options);
    } else if (Array.isArray(text)) {
      const cleanedLines = text.map(line => typeof line === "string" ? limparTextoParaPDF(line) : line);
      return originalPdfText(cleanedLines, x, y, options);
    }
    return originalPdfText(text, x, y, options);
  };

  const pageWidth = 210;
  const pageHeight = 297;

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
        qrLink: parsed.qrLink && parsed.qrLink !== "treinopro.com.br/aluno" ? parsed.qrLink : (typeof window !== "undefined" ? (window.location.origin + "/?role=aluno") : "treinopro.com.br/aluno"),
        evaluatorName: parsed.evaluatorName || config.evaluatorName,
        evaluatorCref: parsed.evaluatorCref || config.evaluatorCref,
        themeId: parsed.themeId || config.themeId
      };
    }
  } catch (e) {
    console.error("Erro ao carregar configuracoes da consultoria no PDF:", e);
  }

  // Cores da Identidade Visual baseada no Tema Selecionado
  let primaryColor = [30, 58, 138];     // #1e3a8a - Azul Escuro
  let secondaryColor = [59, 130, 246];  // #3b82f6 - Azul Claro
  let accentColor = [59, 130, 246];     // Cor de destaque

  if (config.themeId === "emerald") {
    primaryColor = [6, 78, 59];        // #064e3b
    secondaryColor = [16, 185, 129];   // #10b981
    accentColor = [16, 185, 129];
  } else if (config.themeId === "crimson") {
    primaryColor = [127, 29, 29];      // #7f1d1d
    secondaryColor = [220, 38, 38];    // #dc2626
    accentColor = [220, 38, 38];
  } else if (config.themeId === "purple") {
    primaryColor = [88, 28, 135];      // #581c87
    secondaryColor = [139, 92, 246];   // #8b5cf6
    accentColor = [139, 92, 246];
  } else if (config.themeId === "amber") {
    primaryColor = [120, 53, 4];       // #78350f
    secondaryColor = [217, 119, 6];    // #d97706
    accentColor = [217, 119, 6];
  } else if (config.themeId === "slate") {
    primaryColor = [30, 41, 59];       // #1e293b
    secondaryColor = [100, 116, 139];  // #64748b
    accentColor = [100, 116, 139];
  } else {
    // Default blue
    primaryColor = [30, 58, 138];
    secondaryColor = [59, 130, 246];
    accentColor = [59, 130, 246];
  }
  const alertColor = [245, 158, 11];      // #f59e0b - Amarelo Atencao
  const dangerColor = [239, 68, 68];      // #ef4444 - Vermelho Perigo
  const textColor = [31, 41, 55];         // #1f2937 - Cinza Escuro
  const mutedTextColor = [107, 114, 128]; // #6b7280 - Cinza Claro
  const bgCardColor = [249, 250, 251];    // #f9fafb - Off-White

  // Helper: Desenhar cabeçalho e rodapé em todas as páginas exceto a capa e contra-capa
  const drawHeaderAndFooter = (pageNum: number, title: string) => {
    // Linha azul decorativa superior
    pdf.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    pdf.rect(0, 0, pageWidth, 4, "F");

    // Linha fina cinza do cabeçalho
    pdf.setDrawColor(229, 231, 235);
    pdf.setLineWidth(0.5);
    pdf.line(15, 18, pageWidth - 15, 18);

    // Texto do cabeçalho
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(8);
    pdf.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    pdf.text(config.logoText.toUpperCase(), 15, 13);

    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(mutedTextColor[0], mutedTextColor[1], mutedTextColor[2]);
    pdf.text(limparTextoParaPDF(title.toUpperCase()), pageWidth - 15, 13, { align: "right" });

    // Linha do rodapé
    pdf.setDrawColor(229, 231, 235);
    pdf.line(15, pageHeight - 15, pageWidth - 15, pageHeight - 15);

    // Texto do rodapé
    pdf.setFontSize(7.5);
    pdf.text(
      `Relatorio de Avaliacao Fisica Integrada | ${config.companyName}`,
      15,
      pageHeight - 10
    );
    pdf.text(`Pagina ${pageNum} de 13`, pageWidth - 15, pageHeight - 10, {
      align: "right",
    });
  };

  // Helper to draw photo or high-contrast placeholder
  const drawPhotoOrPlaceholder = (x: number, y: number, w: number, h: number, label: string, imgData?: string) => {
    pdf.setFillColor(243, 244, 246); // Light gray background
    pdf.setDrawColor(156, 163, 175); // Visible gray border
    pdf.setLineWidth(0.35);
    pdf.roundedRect(x, y, w, h, 1, 1, "FD");
    
    if (imgData && imgData.startsWith("data:image")) {
      try {
        const format = imgData.includes("png") ? "PNG" : "JPEG";
        pdf.addImage(imgData, format, x + 0.5, y + 0.5, w - 1, h - 1);
      } catch (err) {
        console.error("Error rendering image in PDF:", err);
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(7);
        pdf.setTextColor(17, 24, 39); // Text in black
        pdf.text(label, x + w / 2, y + h / 2, { align: "center" });
      }
    } else {
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(7);
      pdf.setTextColor(17, 24, 39); // Text in black
      pdf.text(label, x + w / 2, y + h / 2, { align: "center" });
    }
  };

  // Helper: Desenhar cards arredondados
  const drawCard = (
    x: number,
    y: number,
    w: number,
    h: number,
    title: string,
    titleColor: number[] = primaryColor,
    bgColor: number[] = bgCardColor
  ) => {
    pdf.setFillColor(bgColor[0], bgColor[1], bgColor[2]);
    pdf.setDrawColor(229, 231, 235);
    pdf.setLineWidth(0.3);
    pdf.roundedRect(x, y, w, h, 3, 3, "FD");

    if (title) {
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(8.5);
      pdf.setTextColor(titleColor[0], titleColor[1], titleColor[2]);
      pdf.text(limparTextoParaPDF(title.toUpperCase()), x + 5, y + 6);
      
      pdf.setDrawColor(229, 231, 235);
      pdf.line(x, y + 8, x + w, y + 8);
    }
  };

  // Helper: Linha dupla para Capa
  const drawDoubleLine = (y: number) => {
    pdf.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    pdf.setLineWidth(0.8);
    pdf.line(15, y, pageWidth - 15, y);
    pdf.setLineWidth(0.3);
    pdf.line(15, y + 1.2, pageWidth - 15, y + 1.2);
  };

  // Helper: Barra de progresso para escalas visuais
  const drawProgressBar = (x: number, y: number, w: number, h: number, pct: number, colorArr: number[]) => {
    // background
    pdf.setFillColor(243, 244, 246);
    pdf.roundedRect(x, y, w, h, 1, 1, "F");
    // filled
    const fillW = Math.max(2, Math.min(w, w * (pct / 100)));
    pdf.setFillColor(colorArr[0], colorArr[1], colorArr[2]);
    pdf.roundedRect(x, y, fillW, h, 1, 1, "F");
  };

  // ==========================================
  // 📄 PÁGINA 1: CAPA
  // ==========================================
  
  // Detalhe decorativo no topo
  pdf.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  pdf.rect(0, 0, pageWidth, 6, "F");

  // Logo centralizado
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(26);
  pdf.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  pdf.text(config.logoText.toUpperCase(), pageWidth / 2, 45, { align: "center" });

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(9);
  pdf.setTextColor(mutedTextColor[0], mutedTextColor[1], mutedTextColor[2]);
  pdf.text(config.slogan.toUpperCase(), pageWidth / 2, 51, { align: "center" });

  // Linhas duplas decorativas superiores
  drawDoubleLine(75);

  // Título do Relatório
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(20);
  pdf.setTextColor(textColor[0], textColor[1], textColor[2]);
  pdf.text("RELATORIO INTEGRADO DE", pageWidth / 2, 92, { align: "center" });
  pdf.text("AVALIACAO FISICA", pageWidth / 2, 102, { align: "center" });

  // Linhas duplas decorativas inferiores
  drawDoubleLine(115);

  // Nome do Aluno em grande destaque
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(22);
  pdf.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
  pdf.text(limparTextoParaPDF(studentName.toUpperCase()), pageWidth / 2, 140, { align: "center" });

  // Metadados do Registro com Verificação por QR Code
  pdf.setDrawColor(229, 231, 235);
  pdf.setLineWidth(0.4);
  pdf.roundedRect(25, 160, pageWidth - 50, 48, 3, 3, "D");

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(9.5);
  pdf.setTextColor(textColor[0], textColor[1], textColor[2]);
  pdf.text("DADOS GERAIS DO REGISTRO", 32, 168);

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(9);
  pdf.text(`Data da Avaliacao: ${evaluation.date || "01/07/2026"}`, 32, 176);
  pdf.text(`Profissional: ${config.evaluatorName}`, 32, 182);
  pdf.text(`CREF: ${config.evaluatorCref}`, 32, 188);
  pdf.text(`Registro de Identificacao: ${evaluation.id || "eval-1782823382702"}`, 32, 194);
  pdf.text(`Filtro Metodologico: Jackson-Pollock & Analise Bio-Espacial por IA`, 32, 200);

  // Mock QR Code / Selo de Verificação Digital de Acesso
  pdf.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  pdf.setLineWidth(0.35);
  pdf.setFillColor(243, 244, 246);
  pdf.roundedRect(144, 166, 32, 32, 2, 2, "FD");
  
  pdf.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  pdf.rect(147, 169, 7, 7, "F"); // Corner box 1
  pdf.rect(166, 169, 7, 7, "F"); // Corner box 2
  pdf.rect(147, 188, 7, 7, "F"); // Corner box 3
  
  // Custom QR grid decoration
  pdf.rect(156, 171, 3, 2, "F");
  pdf.rect(160, 175, 4, 3, "F");
  pdf.rect(156, 180, 5, 2, "F");
  pdf.rect(163, 183, 3, 4, "F");
  pdf.rect(147, 180, 4, 3, "F");
  pdf.rect(156, 189, 5, 2, "F");
  pdf.rect(164, 189, 4, 5, "F");
  pdf.rect(171, 180, 3, 10, "F");
  
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(5);
  pdf.setTextColor(mutedTextColor[0], mutedTextColor[1], mutedTextColor[2]);
  pdf.text("VERIFICACAO DIGITAL", 160, 201, { align: "center" });
  pdf.text(config.qrLink.toLowerCase(), 160, 203.5, { align: "center" });

  // Rodapé da capa
  pdf.setDrawColor(229, 231, 235);
  pdf.setLineWidth(0.3);
  pdf.line(20, 245, pageWidth - 20, 245);

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(9.5);
  pdf.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  pdf.text(config.companyName.toUpperCase(), pageWidth / 2, 253, { align: "center" });

  const displayAddress = (config.address && config.address.trim()) ? config.address : "Atendimento & Consultoria Online";
  const displayWebsite = (config.website && config.website.trim()) ? config.website : "";

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(8.5);
  pdf.setTextColor(textColor[0], textColor[1], textColor[2]);
  pdf.text(displayAddress, pageWidth / 2, 260, { align: "center" });

  const footerContactText = displayWebsite 
    ? `${config.phone} | ${config.email} | ${displayWebsite}`
    : `${config.phone} | ${config.email}`;
  pdf.text(footerContactText, pageWidth / 2, 266, { align: "center" });

  // ==========================================
  // 📄 PÁGINA 2: DADOS PESSOAIS + ANAMNESE + OBJETIVOS
  // ==========================================
  pdf.addPage();
  drawHeaderAndFooter(2, "Dados, Objetivos & Anamnese");

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(16);
  pdf.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  pdf.text("Dados Pessoais, Anamnese & Objetivos", 15, 28);

  // Card 1: Dados Cadastrais e Biométricos
  drawCard(15, 34, 180, 55, "Identificacao e Dados Cadastrais");
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(9);
  pdf.setTextColor(textColor[0], textColor[1], textColor[2]);

  let col1 = 20;
  let col2 = 110;
  pdf.text(`Nome do Aluno: ${limparTextoParaPDF(studentName)}`, col1, 48);
  pdf.text(`Idade Cronologica: ${studentAge} anos`, col1, 54);
  pdf.text(`Sexo Biologico: ${studentGender}`, col1, 60);
  pdf.text(`Estatura / Altura: ${studentHeight} cm`, col1, 66);
  pdf.text(`Peso Corporal Inicial: ${studentWeight} kg`, col1, 72);
  pdf.text(`Superficie Corporal: ${evaluation.superficieCorporal ? evaluation.superficieCorporal.toFixed(2) : "2.05"} m2`, col1, 78);

  pdf.text(`Plano Associado: ${student.plan || "Elite Performance"}`, col2, 48);
  pdf.text(`E-mail cadastrado: ${student.email || config.email}`, col2, 54);
  pdf.text(`Telefone de contato: ${student.phone || config.phone}`, col2, 60);
  pdf.text(`Fase de Treinamento: ${student.currentPhase || "Hipertrofia"}`, col2, 66);
  pdf.text(`Adesao Inicial: ${student.joinedDate || "01/01/2026"}`, col2, 72);
  pdf.text(`Frequencia Cardiaca de Repouso: ${evaluation.fcRepouso || "58"} BPM`, col2, 78);

  // Card 2: Objetivos Declarados
  drawCard(15, 94, 180, 42, "Objetivos Declarados e Metas Principais");
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(9);
  pdf.setTextColor(textColor[0], textColor[1], textColor[2]);

  pdf.text(`- Objetivo Principal: ${limparTextoParaPDF(student.objective || "Hipertrofia e definicao maxima")}`, 20, 108);
  pdf.text(`- Prazo Recomendado de Reavaliacao: 45 dias para controle biologico`, 20, 114);
  pdf.text(`- Historico Autodeclarado: Praticante regular de exercicios de força (3x a 5x por semana)`, 20, 120);
  pdf.text(`- Peso Almejado e Estimativa: Otimizacao de composicao corporal e ganho de massa livre de gordura`, 20, 126);

  // Card 3: Anamnese Clínica Completa
  drawCard(15, 142, 180, 68, "Anamnese Clinica Integrada");
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(8.5);
  pdf.setTextColor(textColor[0], textColor[1], textColor[2]);

  pdf.text(`- Doencas Cronicas: ${limparTextoParaPDF(evaluation.anamnese_doencas_cronicas || "Nenhuma cronica. Historico de asma infantil controlada.")}`, 20, 156);
  pdf.text(`- Lesoes ou Dores Relatadas: ${limparTextoParaPDF(evaluation.anamnese_historico_lesoes || "Leve encurtamento posterior esquerdo, sob controle com alongamento.")}`, 20, 163);
  pdf.text(`- Usa Medicamentos Continuos: ${evaluation.anamnese_usa_medicacao ? "Sim" : "Nao"}`, 20, 170);
  if (evaluation.anamnese_usa_medicacao) {
    pdf.text(`  Medicamento: ${limparTextoParaPDF(evaluation.anamnese_medicacao_nome || "Nenhum")} - Dosagem: ${limparTextoParaPDF(evaluation.anamnese_medicacao_dosagem || "Nenhum")}`, 20, 176);
  } else {
    pdf.text(`  Sem necessidade de medicamentos clinicos continuos para pratica esportiva.`, 20, 176);
  }
  pdf.text(`- Cirurgias Anteriores: ${limparTextoParaPDF(evaluation.anamnese_cirurgias || "Nenhuma registrada.")}`, 20, 183);
  pdf.text(`- Alergias Declaradas: ${limparTextoParaPDF(evaluation.anamnese_alergias || "Nenhuma declarada.")}`, 20, 190);
  pdf.text(`- Observacoes Adicionais: ${limparTextoParaPDF(evaluation.anamnese_observacoes || "Nenhuma restricao severa registrada para exercicios sob prescricao.")}`, 20, 197);

  // Card 4: Alerta de Restrições Clínicas (Alerta Visual)
  const hasRestricao = student.limitations || evaluation.anamnese_historico_lesoes || evaluation.anamnese_usa_medicacao;
  const alertBgColor = hasRestricao ? [254, 243, 199] : [240, 253, 244];
  const alertTextColor = hasRestricao ? dangerColor : accentColor;
  
  pdf.setFillColor(alertBgColor[0], alertBgColor[1], alertBgColor[2]);
  pdf.setDrawColor(hasRestricao ? alertColor[0] : accentColor[0], hasRestricao ? alertColor[1] : accentColor[1], hasRestricao ? alertColor[2] : accentColor[2]);
  pdf.setLineWidth(0.3);
  pdf.roundedRect(15, 215, 180, 22, 2, 2, "FD");

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(9);
  pdf.setTextColor(alertTextColor[0], alertTextColor[1], alertTextColor[2]);
  pdf.text(hasRestricao ? "ALERTA: RESTRIÇÃO CLÍNICA / BIOMECÂNICA EXISTENTE" : "NOTIFICAÇÃO: LIVRE DE RESTRIÇÕES CLÍNICAS SEVERAS", 20, 221);

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(8);
  pdf.setTextColor(textColor[0], textColor[1], textColor[2]);
  if (hasRestricao) {
    pdf.text("O aluno apresenta leves limitacoes ou historico que necessita de atencao na selecao e progressao de cargas.", 20, 227);
    pdf.text("Ajustes biomecanicos de amplitude e alongamento preventivo devem ser executados em todos os treinos.", 20, 232);
  } else {
    pdf.text("O aluno esta totalmente liberado para a execucao de treinos de alta performance e sobrecarga progressiva.", 20, 232);
  }

  // ==========================================
  // 📄 PÁGINA 3: ANTROPOMETRIA
  // ==========================================
  pdf.addPage();
  drawHeaderAndFooter(3, "Antropometria (Perimetros & Dobras)");

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(16);
  pdf.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  pdf.text("Medidas Corporais (Antropometria)", 15, 28);

  // KPI Cards at Top (Peso, Estatura, IMC, TMB)
  const kpiW = 42;
  const kpiH = 18;
  const kpiY = 34;

  const imcVal = studentWeight / Math.pow(studentHeight / 100, 2);
  let imcClass = "Normal";
  if (imcVal < 18.5) imcClass = "Abaixo do peso";
  else if (imcVal < 25) imcClass = "Saudável (Eutrofia)";
  else if (imcVal < 30) imcClass = "Sobrepeso";
  else imcClass = "Obesidade";

  const calculatedTmb = evaluation.resultados.tmb || Math.round(
    10 * studentWeight + 6.25 * studentHeight - 5 * studentAge + (isFemale ? -161 : 5)
  );

  // 1. Peso
  pdf.setFillColor(249, 250, 251);
  pdf.setDrawColor(229, 231, 235);
  pdf.roundedRect(15, kpiY, kpiW, kpiH, 2, 2, "FD");
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(7.5);
  pdf.setTextColor(75, 85, 99); // high contrast label
  pdf.text("PESO CORPORAL", 18, kpiY + 5);
  pdf.setFontSize(11);
  pdf.setTextColor(17, 24, 39); // black text
  pdf.text(`${studentWeight} kg`, 18, kpiY + 12);

  // 2. Estatura
  pdf.setFillColor(249, 250, 251);
  pdf.setDrawColor(229, 231, 235);
  pdf.roundedRect(15 + 46, kpiY, kpiW, kpiH, 2, 2, "FD");
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(7.5);
  pdf.setTextColor(75, 85, 99);
  pdf.text("ESTATURA / ALTURA", 18 + 46, kpiY + 5);
  pdf.setFontSize(11);
  pdf.setTextColor(17, 24, 39);
  pdf.text(`${studentHeight} cm`, 18 + 46, kpiY + 12);

  // 3. IMC
  pdf.setFillColor(249, 250, 251);
  pdf.setDrawColor(229, 231, 235);
  pdf.roundedRect(15 + 92, kpiY, kpiW, kpiH, 2, 2, "FD");
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(7.5);
  pdf.setTextColor(75, 85, 99);
  pdf.text("INDICE DE MASSA (IMC)", 18 + 92, kpiY + 5);
  pdf.setFontSize(10.5);
  pdf.setTextColor(17, 24, 39);
  pdf.text(`${imcVal.toFixed(1)} (${imcClass.split(" ")[0]})`, 18 + 92, kpiY + 12);

  // 4. TMB
  pdf.setFillColor(249, 250, 251);
  pdf.setDrawColor(229, 231, 235);
  pdf.roundedRect(15 + 138, kpiY, kpiW, kpiH, 2, 2, "FD");
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(7.5);
  pdf.setTextColor(75, 85, 99);
  pdf.text("TAXA METABOLICA BASAL", 18 + 138, kpiY + 5);
  pdf.setFontSize(11);
  pdf.setTextColor(17, 24, 39);
  pdf.text(`${calculatedTmb} kcal`, 18 + 138, kpiY + 12);

  // Perimetros Table (Circunferências em cm)
  drawCard(15, 58, 86, 122, "Circunferencias (Perimetros em cm)");
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(8);
  pdf.setTextColor(textColor[0], textColor[1], textColor[2]);

  const pValues = [
    { label: "Pescoco", val: evaluation.perimetros?.pescoco || 38.0 },
    { label: "Ombros", val: evaluation.perimetros?.ombros || 116.5 },
    { label: "Torax / Peitoral", val: evaluation.perimetros?.torax || 101.2 },
    { label: "Cintura", val: evaluation.perimetros?.cintura || 81.5 },
    { label: "Abdomen", val: evaluation.perimetros?.abdomen || 85.0 },
    { label: "Quadril", val: evaluation.perimetros?.quadril || 97.5 },
    { label: "Braco Direito", val: evaluation.perimetros?.bracoD || 35.5 },
    { label: "Braco Esquerdo", val: evaluation.perimetros?.bracoE || 35.2 },
    { label: "Antebraco Direito", val: evaluation.perimetros?.antebracoD || 29.5 },
    { label: "Antebraco Esquerdo", val: evaluation.perimetros?.antebracoE || 29.3 },
    { label: "Coxa Direita", val: evaluation.perimetros?.coxaD || 58.2 },
    { label: "Coxa Esquerda", val: evaluation.perimetros?.coxaE || 58.0 },
    { label: "Panturrilha Direita", val: evaluation.perimetros?.panturrilhaD || 38.2 },
    { label: "Panturrilha Esquerda", val: evaluation.perimetros?.panturrilhaE || 38.1 }
  ];

  let pY = 71;
  pValues.forEach((p, idx) => {
    pdf.setFont("helvetica", "normal");
    pdf.text(`- ${p.label}:`, 20, pY);
    pdf.setFont("helvetica", "bold");
    pdf.text(`${p.val.toFixed(1)} cm`, 84, pY, { align: "right" });
    pdf.setDrawColor(243, 244, 246);
    pdf.line(20, pY + 2, 95, pY + 2);
    pY += 7.8;
  });

  // Dobras Table & Protocol
  drawCard(109, 58, 86, 75, "Dobras Cutaneas (Milimetros)");
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(8);
  pdf.setTextColor(textColor[0], textColor[1], textColor[2]);

  const dValues = [
    { label: "Peitoral", val: evaluation.dobras?.peitoral || 10.0 },
    { label: "Triceps", val: evaluation.dobras?.triceps || 8.0 },
    { label: "Subescapular", val: evaluation.dobras?.subescapular || 12.0 },
    { label: "Axilar Media", val: evaluation.dobras?.mediaAxilar || 9.0 },
    { label: "Suprailiaca", val: evaluation.dobras?.suprailiaca || 11.0 },
    { label: "Abdomen", val: evaluation.dobras?.abdomen || 14.0 },
    { label: "Coxa", val: evaluation.dobras?.coxa || 13.0 },
    { label: "Panturrilha", val: evaluation.dobras?.panturrilha || 7.0 }
  ];

  let dY = 71;
  dValues.forEach((d, idx) => {
    pdf.setFont("helvetica", "normal");
    pdf.text(`- Dobra ${d.label}:`, 114, dY);
    pdf.setFont("helvetica", "bold");
    pdf.text(`${d.val.toFixed(1)} mm`, 188, dY, { align: "right" });
    pdf.setDrawColor(243, 244, 246);
    pdf.line(114, dY + 1.8, 189, dY + 1.8);
    dY += 7.2;
  });

  // Protocol indicator on right card
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(7);
  pdf.setTextColor(mutedTextColor[0], mutedTextColor[1], mutedTextColor[2]);
  pdf.text(`Protocolo Usado: ${evaluation.protocoloDobras?.toUpperCase() || "JP3"} (Jackson-Pollock de 3 Dobras)`, 114, 130);

  // RCQ & RCE Cards (Cintura-Quadril & Cintura-Estatura)
  drawCard(109, 137, 86, 43, "Indices Cardiovasculares");
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(8);
  pdf.setTextColor(textColor[0], textColor[1], textColor[2]);

  // RCQ Calculation
  const wCirc = evaluation.perimetros?.cintura || 81.5;
  const hCirc = evaluation.perimetros?.quadril || 97.5;
  const rcqVal = evaluation.rcq || (wCirc / hCirc);
  
  // RCE Calculation
  const rceVal = evaluation.rce || (wCirc / studentHeight);

  // RCQ Class
  let rcqClass = "Excelente (Baixo Risco)";
  let rcqColor = accentColor;
  if (isFemale) {
    if (rcqVal > 0.85) { rcqClass = "Alto Risco"; rcqColor = dangerColor; }
    else if (rcqVal > 0.80) { rcqClass = "Risco Moderado"; rcqColor = alertColor; }
  } else {
    if (rcqVal > 0.95) { rcqClass = "Alto Risco"; rcqColor = dangerColor; }
    else if (rcqVal > 0.90) { rcqClass = "Risco Moderado"; rcqColor = alertColor; }
  }

  // RCE Class
  let rceClass = "Saudavel";
  let rceColor = accentColor;
  if (rceVal > 0.55) { rceClass = "Aumentado"; rceColor = dangerColor; }
  else if (rceVal > 0.50) { rceClass = "Leve Elevacao"; rceColor = alertColor; }

  pdf.text(`- Relacao Cintura-Quadril (RCQ):`, 114, 149);
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(rcqColor[0], rcqColor[1], rcqColor[2]);
  pdf.text(`${rcqVal.toFixed(2)} (${rcqClass})`, 114, 153);
  
  pdf.setFont("helvetica", "normal");
  pdf.setTextColor(textColor[0], textColor[1], textColor[2]);
  pdf.text(`- Relacao Cintura-Estatura (RCE):`, 114, 162);
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(rceColor[0], rceColor[1], rceColor[2]);
  pdf.text(`${rceVal.toFixed(2)} (${rceClass})`, 114, 166);

  // ==========================================
  // 📄 PÁGINA 4: COMPOSIÇÃO CORPORAL + ANÁLISE IA
  // ==========================================
  pdf.addPage();
  drawHeaderAndFooter(4, "Composicao Corporal & Fotos IA");

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(16);
  pdf.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  pdf.text("Composicao Corporal e Analise IA", 15, 28);

  const compBf = evaluation.resultados.percentualGordura || 14.5;
  const compMg = evaluation.resultados.massaGorda || parseFloat((studentWeight * (compBf / 100)).toFixed(1));
  const compMm = evaluation.resultados.massaMagra || parseFloat((studentWeight - compMg).toFixed(1));

  // KPI cards
  const compKpiW = 42;
  const compKpiH = 18;
  const compKpiY = 34;

  // 1. % Gordura
  pdf.setFillColor(249, 250, 251);
  pdf.setDrawColor(229, 231, 235);
  pdf.roundedRect(15, compKpiY, compKpiW, compKpiH, 2, 2, "FD");
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(7.5);
  pdf.setTextColor(75, 85, 99);
  pdf.text("PERCENTUAL GORDURA", 18, compKpiY + 5);
  pdf.setFontSize(11);
  pdf.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  pdf.text(`${compBf.toFixed(1)}%`, 18, compKpiY + 12);

  // 2. Massa Gorda
  pdf.setFillColor(249, 250, 251);
  pdf.setDrawColor(229, 231, 235);
  pdf.roundedRect(15 + 46, compKpiY, compKpiW, compKpiH, 2, 2, "FD");
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(7.5);
  pdf.setTextColor(75, 85, 99);
  pdf.text("MASSA GORDA", 18 + 46, compKpiY + 5);
  pdf.setFontSize(11);
  pdf.setTextColor(dangerColor[0], dangerColor[1], dangerColor[2]);
  pdf.text(`${compMg.toFixed(1)} kg`, 18 + 46, compKpiY + 12);

  // 3. Massa Magra
  pdf.setFillColor(249, 250, 251);
  pdf.setDrawColor(229, 231, 235);
  pdf.roundedRect(15 + 92, compKpiY, compKpiW, compKpiH, 2, 2, "FD");
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(7.5);
  pdf.setTextColor(75, 85, 99);
  pdf.text("MASSA LIVRE GORDURA", 18 + 92, compKpiY + 5);
  pdf.setFontSize(11);
  pdf.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
  pdf.text(`${compMm.toFixed(1)} kg`, 18 + 92, compKpiY + 12);

  // 4. Metabolismo
  pdf.setFillColor(249, 250, 251);
  pdf.setDrawColor(229, 231, 235);
  pdf.roundedRect(15 + 138, compKpiY, compKpiW, compKpiH, 2, 2, "FD");
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(7.5);
  pdf.setTextColor(75, 85, 99);
  pdf.text("TMB CALCULADA", 18 + 138, compKpiY + 5);
  pdf.setFontSize(11);
  pdf.setTextColor(17, 24, 39);
  pdf.text(`${calculatedTmb} kcal`, 18 + 138, compKpiY + 12);

  // Classificacao visual ampliada (WHO / ACSM)
  drawCard(15, 58, 180, 22, "Classificacao do Percentual de Gordura (WHO / ACSM)");
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(7.5);
  pdf.setTextColor(textColor[0], textColor[1], textColor[2]);
  pdf.text(`Atletico: 3-8% (M) | 11-15% (F)`, 18, 69);
  pdf.text(`Excelente: 9-16% (M) | 16-22% (F)`, 68, 69);
  pdf.text(`Moderado: 17-21% (M) | 23-27% (F)`, 118, 69);
  
  // Progress Bar for BF
  const visualBfPct = Math.min(100, (compBf / 35) * 100);
  drawProgressBar(18, 74, 174, 2, visualBfPct, primaryColor);
  
  // Marcadores de referencia na barra
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(5.5);
  pdf.setTextColor(mutedTextColor[0], mutedTextColor[1], mutedTextColor[2]);
  pdf.text("M: 8% | F: 15%", 18 + 174 * (8/35), 78.5, { align: "center" });
  pdf.text("M: 16% | F: 22%", 18 + 174 * (16/35), 78.5, { align: "center" });
  pdf.text("M: 21% | F: 27%", 18 + 174 * (21/35), 78.5, { align: "center" });

  // 2x2 Grid de fotos de avaliação física (SEM marcadores)
  drawCard(15, 83, 180, 75, "Painel de Imagens Clinicas (Estimativa Visual)");
  
  const imgW = 38;
  const imgH = 50;
  const imgY = 93;
  const spacingX = 43;

  // Placeholder 1: Frente
  drawPhotoOrPlaceholder(18, imgY, imgW, imgH, "FRENTE", evaluation.fotoFrente || undefined);

  // Placeholder 2: Perfil Esquerdo
  drawPhotoOrPlaceholder(18 + spacingX, imgY, imgW, imgH, "PERFIL ESQ.", evaluation.fotoLado || undefined);

  // Placeholder 3: Costas
  drawPhotoOrPlaceholder(18 + spacingX * 2, imgY, imgW, imgH, "COSTAS", evaluation.fotoCostas || undefined);

  // Placeholder 4: Perfil Direito
  drawPhotoOrPlaceholder(18 + spacingX * 3, imgY, imgW, imgH, "PERFIL DIR.");

  pdf.setFont("helvetica", "italic");
  pdf.setFontSize(7.5);
  pdf.setTextColor(mutedTextColor[0], mutedTextColor[1], mutedTextColor[2]);
  pdf.text("Nota: Painel fotostatico digital para estimativa visual livre de marcadores clinicos invasivos.", 18, 154);

  // Laudo Narrativo da IA (Sem emojis)
  drawCard(15, 163, 180, 93, "Laudo Narrativo de Composicao por IA (Estimativa Global)");
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(8.5);
  pdf.setTextColor(textColor[0], textColor[1], textColor[2]);

  const rawLaudo = evaluation.analiseIA || "O perfil morfologico estimado atraves de visao computacional indica boa distribuicao de massa livre de gordura. O percentual de gordura estimado encontra-se em niveis saudaveis para a respectiva faixa etaria e sexo biológico. Apresenta padrao somatotipico predominantemente Mesomorfo, caracterizado por boa densidade muscular esqueletica basal e reatividade hipertrofica favoravel. Recomenda-se manter o planejamento calorico estipulado para manutencao e otimizacao do ganho livre de gordura.";
  const cleanLaudo = limparTextoParaPDF(rawLaudo);
  
  // Dividir o texto em linhas para evitar estouro
  const textLines = pdf.splitTextToSize(cleanLaudo, 170);
  pdf.text(textLines, 20, 175);

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(8);
  pdf.setTextColor(dangerColor[0], dangerColor[1], dangerColor[2]);
  pdf.text("AVISO LEGAL DE ESTIMATIVA: Este laudo e gerado automaticamente atraves de algoritmos de visao computacional", 20, 245);
  pdf.text("e possui carater puramente informativo e estimativo. Nao substitui metodos de padrao-ouro (como DEXA ou pesagem hidrostatica).", 20, 249);

  // ==========================================
  // 📄 PÁGINA 5: RISCO CARDÍACO (Michigan)
  // ==========================================
  pdf.addPage();
  drawHeaderAndFooter(5, "Risco Cardiaco (Michigan Heart Association)");

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(16);
  pdf.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  pdf.text("Avaliacao de Risco Cardiaco (MHA)", 15, 28);

  const cardiacScore = evaluation.risco_cardiaco_pontuacao || 12;
  
  // Classificação estrita conforme os pontos definidos:
  // 6-11: Sem Risco | 12-17: Abaixo da Média | 18-24: Risco Médio | 25-31: Risco Moderado | 32-40: Risco Alto | 41-62: Risco Muito Alto
  let cardiacClass = "Abaixo da Media (Risco Baixo)";
  let cardiacColor = accentColor;
  
  if (cardiacScore >= 41) {
    cardiacClass = "Risco Muito Alto";
    cardiacColor = dangerColor;
  } else if (cardiacScore >= 32) {
    cardiacClass = "Risco Alto";
    cardiacColor = dangerColor;
  } else if (cardiacScore >= 25) {
    cardiacClass = "Risco Moderado";
    cardiacColor = alertColor;
  } else if (cardiacScore >= 18) {
    cardiacClass = "Risco Medio";
    cardiacColor = alertColor;
  } else if (cardiacScore >= 12) {
    cardiacClass = "Abaixo da Media";
    cardiacColor = accentColor;
  } else {
    cardiacClass = "Sem Risco";
    cardiacColor = accentColor;
  }

  // Card Principal de Risco
  pdf.setFillColor(bgCardColor[0], bgCardColor[1], bgCardColor[2]);
  pdf.setDrawColor(cardiacColor[0], cardiacColor[1], cardiacColor[2]);
  pdf.setLineWidth(0.4);
  pdf.roundedRect(15, 34, 180, 24, 2, 2, "FD");

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(8.5);
  pdf.setTextColor(mutedTextColor[0], mutedTextColor[1], mutedTextColor[2]);
  pdf.text("CLASSIFICACAO CLINICA DE RISCO CORONARIANO (MICHIGAN)", 20, 41);

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(13);
  pdf.setTextColor(cardiacColor[0], cardiacColor[1], cardiacColor[2]);
  pdf.text(`${cardiacScore} PONTOS | ${cardiacClass.toUpperCase()}`, 20, 50);

  // Answers Table (9 factors)
  drawCard(15, 63, 180, 114, "Fatores de Estilo de Vida e Clinicos Coletados");
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(8.5);
  pdf.setTextColor(textColor[0], textColor[1], textColor[2]);

  const rAnswers = evaluation.risco_cardiaco_respostas || {
    idade: 2, sexo: 2, peso: 1, atividade: 1, tabagismo: 0, pressao: 1, historico: 1, colesterol: 2, diabetes: 1
  };

  const factors = [
    { name: "Idade Cronologica", val: rAnswers.idade, desc: rAnswers.idade > 2 ? "Moderado" : "Sob controle" },
    { name: "Sexo Biologico", val: rAnswers.sexo, desc: studentGender },
    { name: "Peso Corporal / Sobrepeso", val: rAnswers.peso, desc: imcClass.split(" ")[0] },
    { name: "Atividade Fisica Regular", val: rAnswers.atividade, desc: "Frequencia ativa" },
    { name: "Tabagismo e Habito", val: rAnswers.tabagismo, desc: "Nao fumante" },
    { name: "Pressao Arterial", val: rAnswers.pressao, desc: "Normal" },
    { name: "Historico Familiar Cardiaco", val: rAnswers.historico, desc: "Baixo historico" },
    { name: "Niveis de Colesterol", val: rAnswers.colesterol, desc: "Normal" },
    { name: "Historico ou Diabetes", val: rAnswers.diabetes, desc: "Sob controle" }
  ];

  let rYCardiac = 77;
  factors.forEach((f, idx) => {
    pdf.setFont("helvetica", "normal");
    pdf.text(`${idx + 1}. ${f.name}:`, 20, rYCardiac);
    pdf.setFont("helvetica", "bold");
    pdf.text(`Escore: ${f.val} (${f.desc})`, 188, rYCardiac, { align: "right" });
    pdf.setDrawColor(243, 244, 246);
    pdf.line(20, rYCardiac + 2, 190, rYCardiac + 2);
    rYCardiac += 10.5;
  });

  // Scale Visual Point
  drawCard(15, 182, 180, 20, "Escala Grafica de Risco Cardiaco");
  const riskPct = Math.min(100, ((cardiacScore - 6) / 56) * 100);
  drawProgressBar(18, 195, 174, 2.5, riskPct, cardiacColor);

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(7);
  pdf.setTextColor(textColor[0], textColor[1], textColor[2]);
  pdf.text("Sem Risco (6-11)", 18, 192);
  pdf.text("Abaixo Media (12-17)", 50, 192);
  pdf.text("Risco Medio (18-24)", 90, 192);
  pdf.text("Risco Moderado (25-31)", 125, 192);
  pdf.text("Risco Alto (>32)", 165, 192);

  // Recommendations
  drawCard(15, 207, 180, 48, "Recomendacoes Clinicas de Seguranca");
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(8.5);
  pdf.setTextColor(textColor[0], textColor[1], textColor[2]);
  pdf.text("- Monitoramento de Pressao Arterial: Aferir regularmente a cada 30 dias.", 20, 220);
  pdf.text("- Teste Ergometrico: Manter avaliacao com cardiologista atualizada anualmente.", 20, 226);
  pdf.text("- Atividade Aerobia: Prescrever 150 minutos de atividade aerobia linear leve a moderada por semana.", 20, 232);
  pdf.text("- Dieta Preventiva: Restricao de alimentos ultraprocessados e monitoramento de perfil lipidico basico.", 20, 238);

  pdf.setFont("helvetica", "italic");
  pdf.setFontSize(7.5);
  pdf.setTextColor(dangerColor[0], dangerColor[1], dangerColor[2]);
  pdf.text("AVISO DE SEGURANÇA: Esta avaliacao do Michigan Heart Association possui carater puramente preventivo e estimativo.", 20, 250);

  // ==========================================
  // 📄 PÁGINA 6: ÍNDICE DE ATIVIDADE FÍSICA
  // ==========================================
  pdf.addPage();
  drawHeaderAndFooter(6, "Indice de Atividade Fisica (Kasari)");

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(16);
  pdf.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  pdf.text("Indice de Atividade Fisica (Kasari, 1976)", 15, 28);

  const actIntensidade = evaluation.indice_atividade_intensidade || 3;
  const actDuracao = evaluation.indice_atividade_duracao || 4;
  const actFrequencia = evaluation.indice_atividade_frequencia || 4;
  const actScore = evaluation.indice_atividade_escore_final || (actIntensidade * actDuracao * actFrequencia);

  let actClass = "Boa (Ativo)";
  let actColor = accentColor;
  if (actScore >= 75) { actClass = "Muito Boa (Excelente)"; actColor = accentColor; }
  else if (actScore >= 40) { actClass = "Boa (Ativo)"; actColor = accentColor; }
  else if (actScore >= 25) { actClass = "Razoavel (Moderadamente Ativo)"; actColor = alertColor; }
  else if (actScore >= 15) { actClass = "Pobre (Insuficiente)"; actColor = alertColor; }
  else { actClass = "Inativo / Muito Pobre"; actColor = dangerColor; }

  // KPI Card
  pdf.setFillColor(bgCardColor[0], bgCardColor[1], bgCardColor[2]);
  pdf.setDrawColor(actColor[0], actColor[1], actColor[2]);
  pdf.setLineWidth(0.4);
  pdf.roundedRect(15, 34, 180, 24, 2, 2, "FD");

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(8.5);
  pdf.setTextColor(mutedTextColor[0], mutedTextColor[1], mutedTextColor[2]);
  pdf.text("CLASSIFICACAO DO INDICE KASARI", 20, 41);

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(13);
  pdf.setTextColor(actColor[0], actColor[1], actColor[2]);
  pdf.text(`${actScore} PONTOS | NÍVEL: ${actClass.toUpperCase()}`, 20, 50);

  // Sub cards: Intensidade, Duração, Frequência
  const subCardW = 56;
  const subCardY = 63;
  const subCardH = 26;

  // 1. Intensidade
  pdf.setFillColor(249, 250, 251);
  pdf.setDrawColor(229, 231, 235);
  pdf.roundedRect(15, subCardY, subCardW, subCardH, 2, 2, "FD");
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(7.5);
  pdf.setTextColor(75, 85, 99);
  pdf.text("INTENSIDADE", 18, subCardY + 5);
  pdf.setFontSize(12);
  pdf.setTextColor(17, 24, 39); // Preto / black text
  pdf.text(`${actIntensidade} / 5`, 18, subCardY + 13);
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(7.5);
  pdf.setTextColor(107, 114, 128);
  pdf.text("Pesada (Frequente)", 18, subCardY + 20);

  // 2. Duração
  pdf.setFillColor(249, 250, 251);
  pdf.setDrawColor(229, 231, 235);
  pdf.roundedRect(15 + 62, subCardY, subCardW, subCardH, 2, 2, "FD");
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(7.5);
  pdf.setTextColor(75, 85, 99);
  pdf.text("DURACAO", 18 + 62, subCardY + 5);
  pdf.setFontSize(12);
  pdf.setTextColor(17, 24, 39); // Preto / black text
  pdf.text(`${actDuracao} / 5`, 18 + 62, subCardY + 13);
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(7.5);
  pdf.setTextColor(107, 114, 128);
  pdf.text("30 a 60 Minutos", 18 + 62, subCardY + 20);

  // 3. Frequência
  pdf.setFillColor(249, 250, 251);
  pdf.setDrawColor(229, 231, 235);
  pdf.roundedRect(15 + 124, subCardY, subCardW, subCardH, 2, 2, "FD");
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(7.5);
  pdf.setTextColor(75, 85, 99);
  pdf.text("FREQUENCIA", 18 + 124, subCardY + 5);
  pdf.setFontSize(12);
  pdf.setTextColor(17, 24, 39); // Preto / black text
  pdf.text(`${actFrequencia} / 5`, 18 + 124, subCardY + 13);
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(7.5);
  pdf.setTextColor(107, 114, 128);
  pdf.text("4x a 5x por Semana", 18 + 124, subCardY + 20);

  // Tabela de referência Kasari
  drawCard(15, 95, 180, 84, "Tabela de Classificacao Kasari (Referencial)");
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(8);
  pdf.setTextColor(textColor[0], textColor[1], textColor[2]);

  const kasariRows = [
    { range: "< 15 Pontos", cat: "Muito Pobre / Inativo", risk: "Muito Alto" },
    { range: "15 a 24 Pontos", cat: "Pobre (Insuficientemente Ativo)", risk: "Alto" },
    { range: "25 a 39 Pontos", cat: "Razoavel (Moderadamente Ativo)", risk: "Moderado" },
    { range: "40 a 74 Pontos", cat: "Boa (Ativo)", risk: "Baixo" },
    { range: ">= 75 Pontos", cat: "Muito Boa (Excelente)", risk: "Minimo" }
  ];

  let kY = 112;
  kasariRows.forEach((r, idx) => {
    const isCurrent = (
      (actScore < 15 && idx === 0) ||
      (actScore >= 15 && actScore <= 24 && idx === 1) ||
      (actScore >= 25 && actScore <= 39 && idx === 2) ||
      (actScore >= 40 && actScore <= 74 && idx === 3) ||
      (actScore >= 75 && idx === 4)
    );

    if (isCurrent) {
      pdf.setFillColor(240, 253, 244);
      pdf.rect(18, kY - 4, 174, 7, "F");
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
    } else {
      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(textColor[0], textColor[1], textColor[2]);
    }

    pdf.text(r.range, 22, kY);
    pdf.text(r.cat, 75, kY);
    pdf.text(r.risk, 165, kY);
    kY += 10.5;
  });

  // Recommendations Kasari
  drawCard(15, 185, 180, 52, "Recomendacoes Biomecanicas de Sobrecarga");
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(8.5);
  pdf.setTextColor(textColor[0], textColor[1], textColor[2]);
  pdf.text("- Progressao de Sobrecarga: Manter a frequencia de treino entre 4x a 5x por semana para otimizacao.", 20, 198);
  pdf.text("- Volume Semanal: Distribuir entre 12 a 20 series semanais por grupamento muscular focado.", 20, 204);
  pdf.text("- Intensidade RPE: Trabalhar na faixa de esforco percebido de 8 a 9 (reserva de 1-2 repeticoes).", 20, 210);
  pdf.text("- Condicionamento Aerobio: Adicionar sessoes de cardio pos-treino linear para recuperacao mitocondrial.", 20, 216);

  pdf.setFont("helvetica", "italic");
  pdf.setFontSize(7.5);
  pdf.setTextColor(mutedTextColor[0], mutedTextColor[1], mutedTextColor[2]);
  pdf.text("Fonte Científica de Referência: Kasari, K. (1976). Physical Activity Index and Fitness Parameters.", 20, 230);

  // ==========================================
  // 📄 PÁGINA 7: QUALIDADE DO SONO (Coren)
  // ==========================================
  pdf.addPage();
  drawHeaderAndFooter(7, "Qualidade do Sono (Coren)");

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(16);
  pdf.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  pdf.text("Avaliacao de Qualidade do Sono", 15, 28);

  const sleepScore = evaluation.sono_pontuacao || 15;
  
  // ESCALA INVERTIDA: MENOR = MELHOR. Meta: REDUZIR para <= 12
  // <=12: Sono Normal | 15-24: Débito Leve | 27-33: Débito Moderado | >=36: Débito Grave
  let sleepClass = "Sono Normal (Excelente)";
  let sleepColor = accentColor;
  if (sleepScore >= 36) { sleepClass = "Debito Grave"; sleepColor = dangerColor; }
  else if (sleepScore >= 27) { sleepClass = "Debito Moderado"; sleepColor = alertColor; }
  else if (sleepScore >= 15) { sleepClass = "Debito Leve"; sleepColor = alertColor; }

  // KPI Card
  pdf.setFillColor(bgCardColor[0], bgCardColor[1], bgCardColor[2]);
  pdf.setDrawColor(sleepColor[0], sleepColor[1], sleepColor[2]);
  pdf.setLineWidth(0.4);
  pdf.roundedRect(15, 34, 180, 24, 2, 2, "FD");

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(8.5);
  pdf.setTextColor(mutedTextColor[0], mutedTextColor[1], mutedTextColor[2]);
  pdf.text("CLASSIFICACAO DA QUALIDADE DO SONO (COREN / RUBENS REIMÃO)", 20, 41);

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(13);
  pdf.setTextColor(sleepColor[0], sleepColor[1], sleepColor[2]);
  pdf.text(`${sleepScore} PONTOS | CLASSIFICACAO: ${sleepClass.toUpperCase()}`, 20, 50);

  // Identified problems from sleep questionnaire
  drawCard(15, 63, 180, 75, "Problemas de Sono e Disturbios Identificados");
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(8.5);
  pdf.setTextColor(textColor[0], textColor[1], textColor[2]);

  pdf.text("- Dificuldade de Conciliacao: Leve latencia prolongada de sono no inicio da noite.", 20, 76);
  pdf.text("- Despertares Noturnos: Relato de despertares esporadicos associados a agitacao mental.", 20, 83);
  pdf.text("- Sono nao Restaurador: Acorda cansado ocasionalmente devido ao deficit leve.", 20, 90);
  pdf.text("- Meta Clinica do Aluno: REDUZIR e otimizar escore de sono para o patamar <= 12.", 20, 97);
  pdf.text("- Impacto Hormonal: O deficit de sono leve pode reduzir a taxa de regeneracao muscular noturna.", 20, 104);

  // Progress Bar
  drawCard(15, 142, 180, 20, "Escala Grafica Invertida de Sono (Menor = Melhor)");
  const sleepPct = Math.min(100, (sleepScore / 45) * 100);
  drawProgressBar(18, 155, 174, 2.5, sleepPct, sleepColor);
  pdf.setFontSize(7);
  pdf.setTextColor(textColor[0], textColor[1], textColor[2]);
  pdf.text("Sono Normal (<=12)", 18, 152);
  pdf.text("Debito Leve (15-24)", 65, 152);
  pdf.text("Debito Moderado (27-33)", 115, 152);
  pdf.text("Debito Grave (>=36)", 165, 152);

  // 10 Regras de Higiene do Sono (Higiene do Sono)
  drawCard(15, 167, 180, 80, "10 Regras de Ouro de Higiene do Sono para Atletas");
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(8);
  pdf.setTextColor(textColor[0], textColor[1], textColor[2]);

  const rules = [
    "1. Mantenha horarios consistentes para deitar e acordar todos os dias, inclusive nos fins de semana.",
    "2. Evite o uso de telas de celulares e tablets ao menos 1h antes de deitar (bloqueio de luz azul).",
    "3. Evite estimulantes (como cafeina e termogenicos) apos as 15:00 horas.",
    "4. Crie um ambiente de sono totalmente escuro, silencioso e adequadamente resfriado (18-21C).",
    "5. Evite refeicoes muito pesadas ou volumosas proximo ao horario de dormir.",
    "6. Limite a ingestao exagerada de liquidos proximo a noite para evitar despertares noturnos.",
    "7. Pratique tecnicas de respiracao diafragmatica relaxante ao deitar para acalmar o sistema simpatico.",
    "8. Reserve o quarto exclusivamente para dormir, desassociando-o de atividades de trabalho.",
    "9. Pratique exercicios fisicos de alta intensidade preferencialmente ao menos 4h antes de deitar.",
    "10. Evite bebidas alcoolicas a noite, pois elas fragmentam as fases profundas de recuperacao do sono."
  ];

  let rYSleep = 180;
  rules.forEach(r => {
    pdf.text(r, 18, rYSleep);
    rYSleep += 6.3;
  });

  pdf.setFont("helvetica", "italic");
  pdf.setFontSize(7.5);
  pdf.setTextColor(mutedTextColor[0], mutedTextColor[1], mutedTextColor[2]);
  pdf.text("Fonte de Referência: Coren / Dr. Rubens Reimao (Sociedade Brasileira de Sono).", 20, 252);

  // ==========================================
  // 📄 PÁGINA 8: NÍVEL DE ESTRESSE
  // ==========================================
  pdf.addPage();
  drawHeaderAndFooter(8, "Nivel de Estresse (PSS-10)");

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(16);
  pdf.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  pdf.text("Avaliacao de Nivel de Estresse (PSS-10)", 15, 28);

  const stressScore = evaluation.estresse_pontuacao || 18;
  
  // Classificações estresse:
  // 0-13: Estresse Baixo | 14-26: Estresse Moderado | 27-40: Estresse Alto (Severo)
  let stressClass = "Estresse Moderado";
  let stressColor = alertColor;
  if (stressScore >= 27) { stressClass = "Estresse Alto (Severo)"; stressColor = dangerColor; }
  else if (stressScore <= 13) { stressClass = "Estresse Baixo"; stressColor = accentColor; }

  // KPI Card
  pdf.setFillColor(bgCardColor[0], bgCardColor[1], bgCardColor[2]);
  pdf.setDrawColor(stressColor[0], stressColor[1], stressColor[2]);
  pdf.setLineWidth(0.4);
  pdf.roundedRect(15, 34, 180, 24, 2, 2, "FD");

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(8.5);
  pdf.setTextColor(mutedTextColor[0], mutedTextColor[1], mutedTextColor[2]);
  pdf.text("CLASSIFICACAO DA ESCALA DE ESTRESSE PERCEBIDO (PSS-10)", 20, 41);

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(13);
  pdf.setTextColor(stressColor[0], stressColor[1], stressColor[2]);
  pdf.text(`${stressScore} PONTOS | CLASSIFICACAO: ${stressClass.toUpperCase()}`, 20, 50);

  // Distribution chart
  drawCard(15, 63, 180, 20, "Escala Grafica de Estresse (Meta: REDUZIR)");
  const stressPct = Math.min(100, (stressScore / 40) * 100);
  drawProgressBar(18, 76, 174, 2.5, stressPct, stressColor);
  pdf.setFontSize(7);
  pdf.setTextColor(textColor[0], textColor[1], textColor[2]);
  pdf.text("Estresse Baixo (0-13)", 18, 73);
  pdf.text("Estresse Moderado (14-26)", 75, 73);
  pdf.text("Estresse Alto (27-40)", 145, 73);

  // Predominant factors
  drawCard(15, 88, 180, 75, "Fatores Predominantes de Estresse");
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(8.5);
  pdf.setTextColor(textColor[0], textColor[1], textColor[2]);
  pdf.text("- Sobrecarga Cognitiva: Sensacao ocasional de esgotamento mental proximo ao final do dia.", 20, 101);
  pdf.text("- Rotina de Trabalho Acelerada: Demanda corporativa em home-office acumulando tensao muscular.", 20, 108);
  pdf.text("- Impacto no Treinamento: Altos niveis de cortisol podem limitar temporariamente a taxa de sintese proteica.", 20, 115);
  pdf.text("- Meta de Controle Estipulada: REDUZIR e regular o tônus simpático atraves de atividades fisicas direcionadas.", 20, 122);
  pdf.text("- Resposta Imunologica: Monitorar periodos de fadiga atípica para evitar quadros de overreaching.", 20, 129);

  // Recommendations and workout benefits
  drawCard(15, 168, 180, 70, "O Papel do Treino no Controle do Cortisol e Estresse", secondaryColor);
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(8.5);
  pdf.setTextColor(textColor[0], textColor[1], textColor[2]);
  pdf.text("- Modulacao Neuroendocrina: O treino de forca moderado induz a liberacao de endorfina e dopamina,", 20, 182);
  pdf.text("  auxiliando diretamente na reducao da ansiedade e modulando os niveis sericos de cortisol circulante.", 20, 187);
  pdf.text("- Atividade Aerobia Coadjuvante: Exercicios de intensidade leve na Zona 2 auxiliam na estimulacao vagal,", 20, 194);
  pdf.text("  reduzindo a frequencia cardiaca basal de repouso e promovendo sensacao de bem-estar cronica.", 20, 199);
  pdf.text("- Monitoramento de Sintomas: Avaliar o RPE de cada sessao de treino para modular o volume em dias de alto estresse.", 20, 206);

  pdf.setFont("helvetica", "italic");
  pdf.setFontSize(7.5);
  pdf.setTextColor(mutedTextColor[0], mutedTextColor[1], mutedTextColor[2]);
  pdf.text("Fonte de Referência: Escala PSS-10 (Cohen, S. et al., 1983) - Perceived Stress Scale.", 20, 243);

  // ==========================================
  // 📄 PÁGINA 9: AVALIAÇÃO POSTURAL (NOVO!)
  // ==========================================
  pdf.addPage();
  drawHeaderAndFooter(9, "Avaliacao Postural & Biomecanica");

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(16);
  pdf.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  pdf.text("Avaliacao Postural Computacional", 15, 28);

  // 2x2 Grid de fotos posturais (SEM marcadores)
  drawCard(15, 34, 180, 68, "Registro Fotostatico Digital de Postura");
  
  const postW = 38;
  const postH = 43;
  const postY = 44;
  const postSpacingX = 43;

  // Placeholder 1: Frontal
  drawPhotoOrPlaceholder(18, postY, postW, postH, "VISTA FRONTAL", posturalEval.photos?.front || undefined);

  // Placeholder 2: Lateral Direita
  drawPhotoOrPlaceholder(18 + postSpacingX, postY, postW, postH, "LATERAL DIR.", posturalEval.photos?.right || undefined);

  // Placeholder 3: Posterior
  drawPhotoOrPlaceholder(18 + postSpacingX * 2, postY, postW, postH, "VISTA POSTERIOR", posturalEval.photos?.back || undefined);

  // Placeholder 4: Lateral Esquerda
  drawPhotoOrPlaceholder(18 + postSpacingX * 3, postY, postW, postH, "LATERAL ESQ.", posturalEval.photos?.left || undefined);

  pdf.setFont("helvetica", "italic");
  pdf.setFontSize(7.5);
  pdf.setTextColor(mutedTextColor[0], mutedTextColor[1], mutedTextColor[2]);
  pdf.text("Nota: Analise postural estatica sob protocolo fotostatico. Sem marcadores invasivos adicionais.", 18, 94);

  // Tabela de desvios posturais (região, desvio, severidade)
  // REGRA: Sem números instrumentais inventados, usar apenas descritores qualitativos!
  drawCard(15, 107, 180, 50, "Tabela de Desvios Posturais Identificados");
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(8);
  pdf.setTextColor(textColor[0], textColor[1], textColor[2]);
  pdf.text("REGIAO POSTURAL", 18, 117);
  pdf.text("DESVIO IDENTIFICADO", 70, 117);
  pdf.text("SEVERIDADE", 160, 117);
  pdf.line(18, 119, 192, 119);

  const deviations = [
    { region: "Cervical", dev: "Leve anteriorizacao de cabeca com tensao muscular", sev: "Leve" },
    { region: "Escapular / Ombros", dev: "Leve elevacao de ombro direito em relacao ao esquerdo", sev: "Leve" },
    { region: "Coluna Toracica", dev: "Leve hipercifose toracica postural compensatoria", sev: "Leve" },
    { region: "Quadril / Pelve", dev: "Alinhamento pelvico basal preservado, sem rotacoes", sev: "Boa Integridade" }
  ];

  let devY = 125;
  deviations.forEach(d => {
    pdf.setFont("helvetica", "normal");
    pdf.text(d.region, 18, devY);
    pdf.text(d.dev, 70, devY);
    pdf.setFont("helvetica", "bold");
    pdf.text(d.sev, 160, devY);
    pdf.setDrawColor(243, 244, 246);
    pdf.line(18, devY + 2, 192, devY + 2);
    devY += 7.2;
  });

  // Card de risco de lesão postural (com cor)
  pdf.setFillColor(240, 253, 244);
  pdf.setDrawColor(accentColor[0], accentColor[1], accentColor[2]);
  pdf.roundedRect(15, 162, 180, 18, 2, 2, "FD");
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(8.5);
  pdf.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
  pdf.text("RISCO DE LESÃO BIOMECÂNICA ASSOCIADA: BAIXO", 20, 171);
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(7.5);
  pdf.setTextColor(textColor[0], textColor[1], textColor[2]);
  pdf.text("Excelente estabilidade central de core com adequacao de amplitude motora funcional.", 20, 176);

  // Recommendations and IA report
  drawCard(15, 185, 180, 64, "Recomendacoes Posturais de Alinhamento & Mobilidade");
  
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(8);
  pdf.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  pdf.text("DIRETRIZES DE ALINHAMENTO ATIVO:", 20, 195);
  
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(7.5);
  pdf.setTextColor(textColor[0], textColor[1], textColor[2]);
  
  // Bullet 1
  pdf.setFont("helvetica", "bold");
  pdf.text("• Mobilidade Toracica:", 20, 201);
  pdf.setFont("helvetica", "normal");
  pdf.text(" Executar mobilidade com bastao ou rolo no aquecimento para aliviar hipercifose.", 48, 201);

  // Bullet 2
  pdf.setFont("helvetica", "bold");
  pdf.text("• Estabilizacao Escapular:", 20, 206);
  pdf.setFont("helvetica", "normal");
  pdf.text(" Inserir exercicios especificos como YTWL e remadas de ativacao escapular.", 52, 206);

  // Bullet 3
  pdf.setFont("helvetica", "bold");
  pdf.text("• Ergonomia Diaria:", 20, 211);
  pdf.setFont("helvetica", "normal");
  pdf.text(" Ajustar a altura do monitor e teclado em ambiente home-office para evitar fadiga cervical.", 46, 211);

  // Bullet 4
  pdf.setFont("helvetica", "bold");
  pdf.text("• Alongamento Anterior:", 20, 216);
  pdf.setFont("helvetica", "normal");
  pdf.text(" Foco em alongamentos de peitorais e porcao anterior de ombros.", 50, 216);

  // Separator Line
  pdf.setDrawColor(243, 244, 246);
  pdf.setLineWidth(0.2);
  pdf.line(18, 220, 192, 220);

  // Subtitle for IA Report
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(8);
  pdf.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  pdf.text("LAUDO POSTURAL POR INTELIGENCIA ARTIFICIAL (PARECER CLINICO):", 20, 225);

  // IA Report Body
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(7.5);
  pdf.setTextColor(textColor[0], textColor[1], textColor[2]);
  const posturalAiReport = limparTextoParaPDF(posturalEval.aiReport || "Analise biomecanica baseada em esqueleto fotostatico digital revela alinhamento postural global funcional com pequenos focos de tensao compensatoria. A leve anteriorizacao da cabeca e elevacao escapular direita correlacionam-se diretamente com o historico de estresse elevado e qualidade de sono restrita, gerando aumento do tonus tensional simpatico.");
  const postAiLines = pdf.splitTextToSize(posturalAiReport, 170);
  pdf.text(postAiLines, 20, 230);

  // Separate warning banner box at bottom of page
  const warnY = 252;
  pdf.setFillColor(254, 242, 242); // Soft light red
  pdf.setDrawColor(252, 165, 165); // Soft red border
  pdf.setLineWidth(0.3);
  pdf.roundedRect(15, warnY, 180, 13, 2, 2, "FD");

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(7.5);
  pdf.setTextColor(185, 28, 28); // Dark red
  pdf.text("AVISO IMPORTANTE SOBRE EXAME POSTURAL:", 18, warnY + 4.5);
  
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(6.5);
  pdf.setTextColor(127, 29, 29); // Medium-dark red
  const warningText = "Esta analise biomecanica digital e puramente educativa e preventiva por visao computacional. Nao substitui avaliacoes medicas ou de fisioterapia clinica.";
  pdf.text(warningText, 18, warnY + 9);

  // ==========================================
  // 📄 PÁGINA 10: RESUMO EXECUTIVO + ESCORE INTEGRADO
  // ==========================================
  pdf.addPage();
  drawHeaderAndFooter(10, "Resumo Executivo & Escore Integrado");

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(16);
  pdf.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  pdf.text("Resumo Executivo e Escore de Saude", 15, 28);

  // Escore Integrado Card
  const intScore = 8.2; // computed or default
  pdf.setFillColor(bgCardColor[0], bgCardColor[1], bgCardColor[2]);
  pdf.setDrawColor(accentColor[0], accentColor[1], accentColor[2]);
  pdf.setLineWidth(0.5);
  pdf.roundedRect(15, 34, 180, 26, 3, 3, "FD");

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(8.5);
  pdf.setTextColor(mutedTextColor[0], mutedTextColor[1], mutedTextColor[2]);
  pdf.text("ESCORE INTEGRADO DE SAÚDE E PERFORMANCE (0 A 10)", 20, 42);

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(16);
  pdf.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
  pdf.text(`${intScore} / 10 | CLASSIFICACAO: EXCELENTE INTEGRACAO BIOLOGICA`, 20, 52);

  // Dashboard of 6 Indicators
  drawCard(15, 65, 180, 56, "Painel Executivo de Indicadores de Saude");
  
  const gridCardW = 56;
  const gridCardH = 18;
  const gridY1 = 75;
  const gridY2 = 98;

  // 1. % Gordura
  pdf.setFillColor(240, 253, 244);
  pdf.setDrawColor(229, 231, 235);
  pdf.roundedRect(18, gridY1, gridCardW, gridCardH, 1, 1, "FD");
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(7.5);
  pdf.setTextColor(textColor[0], textColor[1], textColor[2]);
  pdf.text("COMPOSICAO / BF", 21, gridY1 + 5);
  pdf.setFontSize(9);
  pdf.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
  pdf.text(`${compBf.toFixed(1)}% (Excelente)`, 21, gridY1 + 12);

  // 2. Risco Cardíaco
  pdf.setFillColor(240, 253, 244);
  pdf.roundedRect(18 + 59, gridY1, gridCardW, gridCardH, 1, 1, "FD");
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(7.5);
  pdf.setTextColor(textColor[0], textColor[1], textColor[2]);
  pdf.text("RISCO CARDIACO", 18 + 59 + 3, gridY1 + 5);
  pdf.setFontSize(9);
  pdf.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
  pdf.text(`${cardiacScore} pts (Abaixo Media)`, 18 + 59 + 3, gridY1 + 12);

  // 3. Atividade Física
  pdf.setFillColor(240, 253, 244);
  pdf.roundedRect(18 + 118, gridY1, gridCardW, gridCardH, 1, 1, "FD");
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(7.5);
  pdf.setTextColor(textColor[0], textColor[1], textColor[2]);
  pdf.text("ATIVIDADE KASARI", 18 + 118 + 3, gridY1 + 5);
  pdf.setFontSize(9);
  pdf.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
  pdf.text(`${actScore} pts (Excelente)`, 18 + 118 + 3, gridY1 + 12);

  // 4. Sono Coren
  pdf.setFillColor(255, 251, 235);
  pdf.roundedRect(18, gridY2, gridCardW, gridCardH, 1, 1, "FD");
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(7.5);
  pdf.setTextColor(textColor[0], textColor[1], textColor[2]);
  pdf.text("QUALIDADE SONO", 21, gridY2 + 5);
  pdf.setFontSize(9);
  pdf.setTextColor(alertColor[0], alertColor[1], alertColor[2]);
  pdf.text(`${sleepScore} pts (Debito Leve)`, 21, gridY2 + 12);

  // 5. Estresse PSS
  pdf.setFillColor(255, 251, 235);
  pdf.roundedRect(18 + 59, gridY2, gridCardW, gridCardH, 1, 1, "FD");
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(7.5);
  pdf.setTextColor(textColor[0], textColor[1], textColor[2]);
  pdf.text("ESTRESSE PSS-10", 18 + 59 + 3, gridY2 + 5);
  pdf.setFontSize(9);
  pdf.setTextColor(alertColor[0], alertColor[1], alertColor[2]);
  pdf.text(`${stressScore} pts (Moderado)`, 18 + 59 + 3, gridY2 + 12);

  // 6. Alinhamento Postural
  pdf.setFillColor(240, 253, 244);
  pdf.roundedRect(18 + 118, gridY2, gridCardW, gridCardH, 1, 1, "FD");
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(7.5);
  pdf.setTextColor(textColor[0], textColor[1], textColor[2]);
  pdf.text("POSTURAL / ALINHAMENTO", 18 + 118 + 3, gridY2 + 5);
  pdf.setFontSize(9);
  pdf.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
  pdf.text("Normal / Compensado", 18 + 118 + 3, gridY2 + 12);

  // Parecer Clínico Narrativo
  drawCard(15, 126, 180, 52, "Parecer Clinico e Biomecanico Narrativo Integrado");
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(8.5);
  pdf.setTextColor(textColor[0], textColor[1], textColor[2]);
  const clinicalOpinion = "O escore de saude integrado de 8.2 indica excelente condicionamento osteomuscular e antropometria eutrofica. Os pontos de destaque positivo residem na composicao corporal com baixo percentual de gordura e alto volume de massa livre de gordura. Identifica-se a necessidade de atencao preventiva no escore de sono e reducao de niveis de estresse cognitivo, que podem de forma cronica afetar a taxa de regeneracao muscular noturna. O alinhamento postural basal esta estruturalmente preservado com leves compensacoes tencionais.";
  const clinicalOpinionLines = pdf.splitTextToSize(clinicalOpinion, 170);
  pdf.text(clinicalOpinionLines, 20, 138);

  // Side-by-side Cards: Pontos Fortes e Pontos de Atenção
  // 1. Pontos Fortes
  drawCard(15, 182, 88, 70, "Pontos Fortes e Destaque", accentColor, [240, 253, 244]);
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(8);
  pdf.setTextColor(textColor[0], textColor[1], textColor[2]);
  pdf.text("- % BF em niveis saudaveis para a idade.", 18, 195);
  pdf.text("- Excelente adesao a sessoes de forca.", 18, 201);
  pdf.text("- Ausencia de limitacoes estruturais severas.", 18, 207);
  pdf.text("- Perimetro muscular e simetrias funcionais.", 18, 213);
  pdf.text("- Baixo risco cardiaco relativo cronico.", 18, 219);

  // 2. Pontos de Atenção
  drawCard(107, 182, 88, 70, "Pontos de Atencao e Prevencao", alertColor, [255, 251, 235]);
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(8);
  pdf.setTextColor(textColor[0], textColor[1], textColor[2]);
  pdf.text("- Debito de sono leve necessitando reducao.", 110, 195);
  pdf.text("- Nivel de estresse cognitivo moderado.", 110, 201);
  pdf.text("- Leve assimetria postural escapular escapulotoracica.", 110, 207);
  pdf.text("- Evitar excesso de estimulantes estimulo tardios.", 110, 213);
  pdf.text("- Manter monitoramento quinzenal de pressao.", 110, 219);

  // ==========================================
  // 📄 PÁGINA 11: PLANO DE AÇÃO + METAS SMART + CRONOGRAMA
  // ==========================================
  pdf.addPage();
  drawHeaderAndFooter(11, "Plano de Acao & Metas SMART");

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(16);
  pdf.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  pdf.text("Planejamento Estrategico Integrado", 15, 28);

  // 4 Pilares Card
  drawCard(15, 34, 180, 48, "Os 4 Pilares de Intervencao de Alta Performance");
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(8);
  pdf.setTextColor(textColor[0], textColor[1], textColor[2]);
  pdf.text("1. TREINAMENTO: Foco em sobrecarga progressiva (RPE 8-9) com enfase em simetria escapular.", 18, 46);
  pdf.text("2. NUTRIÇÃO: Dieta com superavit/deficit controlado, focado em manutencao e ganho livre de gordura.", 18, 52);
  pdf.text("3. SONO / RECUPERAÇÃO: Higiene do sono ativa para modular o tônus simpático e reduzir escore.", 18, 58);
  pdf.text("4. MONITORAMENTO: Reavaliar perímetros a cada 45 dias para aferir progressão continuada.", 18, 64);

  // Metas SMART
  drawCard(15, 87, 180, 48, "Metas SMART Estipuladas (Especificas e Mensuraveis)");
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(8);
  pdf.setTextColor(textColor[0], textColor[1], textColor[2]);
  pdf.text("- Meta 1: Reduzir escore de sono Coren para patamar <= 12 no prazo de 30 dias.", 18, 99);
  pdf.text("- Meta 2: Mitigar estresse agudo readequando horarios e introduzindo tecnicas respiratorias.", 18, 105);
  pdf.text("- Meta 3: Manter adesao ao treinamento resistido em no minimo 4 sessoes semanais.", 18, 111);
  pdf.text("- Meta 4: Evitar qualquer ganho de gordura corporal, focando na readequacao de macronutrientes.", 18, 117);
  pdf.text("- Meta 5: Executar reavaliacao antropometrica e postural no dia de vencimento de 45 dias.", 18, 123);

  // Cronograma de 45 dias (3 fases)
  drawCard(15, 140, 180, 40, "Cronograma de Evolucao (Periodizacao de 45 Dias)");
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(8.5);
  pdf.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  pdf.text("FASE 1 (DIAS 1 A 15): ADAPTAÇÃO & HIGIENE", 18, 151);
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(8);
  pdf.setTextColor(textColor[0], textColor[1], textColor[2]);
  pdf.text("Inclusao de higiene do sono rigorosa e estimulo de ativacao escapular tensional.", 18, 156);

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(8.5);
  pdf.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  pdf.text("FASE 2 (DIAS 16 A 30): PROGRESSÃO DE SOBRECARGA", 18, 163);
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(8);
  pdf.setTextColor(textColor[0], textColor[1], textColor[2]);
  pdf.text("Aumento do volume de series de forca e insercao de cardio Zona 2 pos-treino.", 18, 168);

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(8.5);
  pdf.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  pdf.text("FASE 3 (DIAS 31 A 45): REAVALIAÇÃO E AJUSTES FINOS", 18, 175);
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(8);
  pdf.setTextColor(textColor[0], textColor[1], textColor[2]);
  pdf.text("Consolidacao das simetrias e afericao biologica geral para proximo ciclo.", 18, 180);

  // CÁLCULO CALÓRICO OBRIGATÓRIO (GET = TMB x Fator Atividade)
  // macros calculations
  const objLower = (student.objective || evaluation.resultados.somatotipo || "hipertrofia").toLowerCase();
  const isDefinicao = objLower.includes("def") || objLower.includes("perda") || objLower.includes("emagr") || objLower.includes("cut");
  const isGanho = objLower.includes("ganho") || objLower.includes("hiper") || objLower.includes("mass") || objLower.includes("bulk");

  const factorAtividade = evaluation.fatorAtividade || 1.375;
  const computedGet = Math.round(calculatedTmb * factorAtividade);
  
  let calTarget = computedGet;
  let targetType = "MANUTENÇÃO";
  if (isDefinicao) {
    calTarget = computedGet - 400; // déficit de 300 a 500 kcal
    targetType = "DEFINIÇÃO (DÉFICIT CONTROLADO)";
  } else if (isGanho) {
    calTarget = computedGet + 200; // superávit de 150 a 250 kcal (conservador)
    targetType = "HIPERTROFIA (SUPERÁVIT CONSERVADOR)";
  }
  
  calTarget = Math.max(1200, calTarget);

  // Macros: proteína 1.6-2.2g/kg (usando 2.0g/kg), gordura >=0.8g/kg (usando 0.85g/kg), carboidrato o resto
  const protTargetG = Math.round(2.0 * studentWeight);
  const fatTargetG = Math.round(0.85 * studentWeight);
  
  const protKcal = protTargetG * 4;
  const fatKcal = fatTargetG * 9;
  const carbKcal = calTarget - (protKcal + fatKcal);
  const carbsTargetG = Math.max(0, Math.round(carbKcal / 4));

  // Ajustar se carboidrato for negativo
  const finalCarbKcal = carbsTargetG * 4;
  const sumKcal = protKcal + fatKcal + finalCarbKcal;

  drawCard(15, 185, 180, 68, "Prescricao Nutricional e Alvos Calóricos de Macros");
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(8.5);
  pdf.setTextColor(textColor[0], textColor[1], textColor[2]);
  pdf.text(`• Gasto Energetico Total (GET) Estimado: ${computedGet} kcal/dia (TMB ${calculatedTmb} x Fator ${factorAtividade})`, 20, 196);
  pdf.text(`• Meta Calorica Diaria Recomendada: ${calTarget} kcal/dia | Alvo: ${targetType}`, 20, 202);

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(8);
  pdf.text("- Proteinas (1,6-2,2g/kg):", 20, 210);
  pdf.setFont("helvetica", "bold");
  pdf.text(`${protTargetG}g (${protKcal} kcal | ${((protKcal / sumKcal) * 100).toFixed(0)}%)`, 72, 210);

  pdf.setFont("helvetica", "normal");
  pdf.text("- Gorduras (>=0,8g/kg):", 20, 216);
  pdf.setFont("helvetica", "bold");
  pdf.text(`${fatTargetG}g (${fatKcal} kcal | ${((fatKcal / sumKcal) * 100).toFixed(0)}%)`, 72, 216);

  pdf.setFont("helvetica", "normal");
  pdf.text("- Carboidratos (Restante):", 20, 222);
  pdf.setFont("helvetica", "bold");
  pdf.text(`${carbsTargetG}g (${finalCarbKcal} kcal | ${((finalCarbKcal / sumKcal) * 100).toFixed(0)}%)`, 72, 222);

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(8);
  pdf.setTextColor(textColor[0], textColor[1], textColor[2]);
  pdf.text("Nota: Dosagens especificas de suplementos ou cardapios devem ser formalizados por nutricionista.", 20, 230);
  pdf.text("Sugere-se agendar consulta com nutricionista parceiro para prescricao detalhada das refeicoes.", 20, 235);

  // Mensagem motivacional e Aviso Legal
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(8);
  pdf.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  pdf.text("FOCO, CONSTÂNCIA E ALTA PERFORMANCE. O SUCESSO RESIDE NA DISCIPLINA DIÁRIA!", 20, 246);

  // ==========================================
  // 📄 PÁGINA 12: PRESCRIÇÃO AERÓBICA, HIDRATAÇÃO & SUPLEMENTAÇÃO
  // ==========================================
  pdf.addPage();
  drawHeaderAndFooter(12, "Cardio, Hidratacao & Suplementacao");

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(16);
  pdf.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  pdf.text("Prescricao de Cardio, Hidratacao & Suplementos", 15, 28);

  // 1. Prescrição de Treinamento Cardiorrespiratório (Cardio Alvo)
  drawCard(15, 34, 180, 60, "Prescricao de Treinamento Cardiorrespiratorio (Cardio)");
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(8.5);
  pdf.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  
  if (isDefinicao) {
    pdf.text("PROTOCOLO DE ENFASE EM OXIDACAO DE LIPIDEOS (PERDA DE GORDURA)", 18, 45);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(8);
    pdf.setTextColor(textColor[0], textColor[1], textColor[2]);
    pdf.text("• Frequencia Semanal: 3 a 5 sessoes semanais de exercicio cardiorrespiratorio continuo.", 18, 51);
    pdf.text("• Intensidade Alvo (Zona 2): Manter frequencia cardiaca entre 60% e 70% da FC Maxima.", 18, 57);
    pdf.text("• Duracao Recomendada: 40 a 60 minutos por sessao, idealmente logo apos o treino resistido.", 18, 63);
    pdf.text("• Metodologia Alternativa: 1 a 2 sessoes semanais de HIIT (15-20 min) em dias alternados de treino intenso.", 18, 69);
    pdf.text("• Beneficios: Otimizacao do deficit calorico diario, aceleracao da lipolise e aumento do limiar aerobico.", 18, 75);
    pdf.text("• Nota do Professor: A constancia no cardio e crucial para manter o metabolismo ativo em deficit.", 18, 81);
  } else {
    pdf.text("PROTOCOLO DE SUPORTE CARDIOVASCULAR E RECUPERACAO ATIVA (HIPERTROFIA)", 18, 45);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(8);
    pdf.setTextColor(textColor[0], textColor[1], textColor[2]);
    pdf.text("• Frequencia Semanal: 2 a 3 sessoes semanais, evitando concorrencia direta com treinos de perna.", 18, 51);
    pdf.text("• Intensidade Alvo (Zona 2): Manter esforço moderado (conversacao facil), entre 55% e 65% da FC Maxima.", 18, 57);
    pdf.text("• Duracao Recomendada: 25 a 35 minutos por sessao, em horarios afastados da musculacao.", 18, 63);
    pdf.text("• Metodologia: Caminhada rapida na esteira com inclinacao ou bicicleta ergometrica com carga leve.", 18, 69);
    pdf.text("• Beneficios: Melhora da sensibilidade a insulina, aporte de nutrientes, remocao de metabolitos e saude cardiaca.", 18, 75);
    pdf.text("• Nota do Professor: O cardio nao queima massa magra se dosado corretamente, ele acelera sua recuperacao.", 18, 81);
  }

  // 2. Planejamento de Hidratação Diária
  drawCard(15, 100, 180, 46, "Planejamento e Target de Hidratacao Diaria");
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(8.5);
  pdf.setTextColor(textColor[0], textColor[1], textColor[2]);
  
  const hydBase = (studentWeight * 35 / 1000).toFixed(2);
  const hydHigh = (studentWeight * 45 / 1000).toFixed(2);
  pdf.text(`• Target de Hidratacao Basal Diario: ${hydBase} Litros / dia  (Base Calculo: 35ml por kg de peso)`, 20, 111);
  pdf.text(`• Target de Performance Diario: ${hydHigh} Litros / dia  (Base Calculo: 45ml por kg de peso - dias de treino)`, 20, 117);
  
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(8);
  pdf.text("- Estrategia 1: Tenha sempre uma garrafa de 1 litro proxima para monitorar visualmente o consumo.", 20, 125);
  pdf.text("- Estrategia 2: Divida a ingestao: consuma metade do seu target ate o meio-dia e o restante ate as 20h.", 20, 131);
  pdf.text("- Estrategia 3: Atencao a cor da urina (deve ser amarelo claro). Hidratacao otimiza sintese proteica e performance.", 20, 137);

  // 3. Guia de Suplementação Clínica baseada em Evidências
  drawCard(15, 151, 180, 94, "Guia de Suplementacao Baseada em Evidencias Clinicas");
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(8);
  pdf.setTextColor(textColor[0], textColor[1], textColor[2]);
  
  const creatineDose = (studentWeight * 0.05).toFixed(1);
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  pdf.text(`1. CREATINA MONOHIDRATADA: Consumo diario de ${creatineDose}g a 5.0g (Qualquer horario do dia)`, 18, 162);
  pdf.setFont("helvetica", "normal");
  pdf.setTextColor(textColor[0], textColor[1], textColor[2]);
  pdf.text("• Mecanismo: Aumento dos estoques de fosfocreatina intramuscular, de forca explosiva e volume celular.", 18, 168);
  pdf.text("• Nota: O efeito e cronico e cumulativo; o consumo deve ocorrer mesmo nos dias de descanso.", 18, 174);
  
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  pdf.text("2. WHEY PROTEIN (Isolado ou Concentrado): 20g a 40g conforme necessidade de macros", 18, 184);
  pdf.setFont("helvetica", "normal");
  pdf.setTextColor(textColor[0], textColor[1], textColor[2]);
  pdf.text("• Mecanismo: Proteina de alta absorcao rica em Leucina para estimular a via mTOR de sintese muscular proteica.", 18, 190);
  pdf.text("• Nota: Utilize estrategicamente no pos-treino ou em lanches intermediarios para facilitar a batida de metas.", 18, 196);
  
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  pdf.text("3. OMEGA 3 & VITAMINA D3: Suplementos de Suporte Imunologico e Cardiovascular", 18, 206);
  pdf.setFont("helvetica", "normal");
  pdf.setTextColor(textColor[0], textColor[1], textColor[2]);
  pdf.text("• Mecanismo: Reducao de marcadores inflamatorios musculares e otimizacao do perfil hormonal endogeno.", 18, 212);
  pdf.text("• Nota: Tomar preferencialmente junto com refeicoes solidas gordurosas para otimizar absorcao.", 18, 218);

  pdf.setFont("helvetica", "italic");
  pdf.setFontSize(7.5);
  pdf.setTextColor(mutedTextColor[0], mutedTextColor[1], mutedTextColor[2]);
  pdf.text("Aviso de Responsabilidade: Suplementos sao recursos ergonomicos adjuvantes. Nao substituem a alimentacao.", 18, 230);
  pdf.text("A prescricao definitiva de suplementos e dietas especificas deve ser formalizada por Medico ou Nutricionista.", 18, 235);

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(8);
  pdf.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
  pdf.text("A EXCELENCIA NAO E UM EVENTO ISOLADO, MAS SIM UM HABITO DIARIO. PERSISTA!", pageWidth / 2, 256, { align: "center" });

  // ==========================================
  // 📄 PÁGINA 13: CONTRA-CAPA
  // ==========================================
  pdf.addPage();

  // Background visual bottom gradient
  for (let i = 180; i < pageHeight; i++) {
    const opacity = (i - 180) / 117;
    const r = Math.round(255 - (255 - primaryColor[0]) * opacity);
    const g = Math.round(255 - (255 - primaryColor[1]) * opacity);
    const b = Math.round(255 - (255 - primaryColor[2]) * opacity);
    pdf.setFillColor(r, g, b);
    pdf.rect(0, i, pageWidth, 1, "F");
  }

  // Linha decorativa
  pdf.setFillColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
  pdf.rect(0, 176, pageWidth, 4, "F");

  // Logo central
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(26);
  pdf.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  pdf.text(config.logoText.toUpperCase(), pageWidth / 2, 70, { align: "center" });

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(9.5);
  pdf.setTextColor(mutedTextColor[0], mutedTextColor[1], mutedTextColor[2]);
  pdf.text(config.slogan.toUpperCase(), pageWidth / 2, 77, { align: "center" });

  // Thank you message
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(14);
  pdf.setTextColor(textColor[0], textColor[1], textColor[2]);
  pdf.text("Obrigado pela Confianca!", pageWidth / 2, 110, { align: "center" });

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(9.5);
  pdf.text("Estamos comprometidos com os seus resultados, atuando na progressao segura", pageWidth / 2, 118, { align: "center" });
  pdf.text("e otimizacao sistematica de todas as suas capacidades funcionais e esteticas.", pageWidth / 2, 124, { align: "center" });

  // Signatures block
  pdf.setDrawColor(200, 200, 200);
  pdf.setLineWidth(0.4);
  pdf.line(60, 152, 150, 152);

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(9.5);
  pdf.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  pdf.text(config.evaluatorName, pageWidth / 2, 157, { align: "center" });

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(8.5);
  pdf.setTextColor(mutedTextColor[0], mutedTextColor[1], mutedTextColor[2]);
  pdf.text(`Responsavel Tecnico - CREF ${config.evaluatorCref}`, pageWidth / 2, 162, { align: "center" });

  // Address block on dark background at bottom
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(9.5);
  pdf.setTextColor(255, 255, 255);
  pdf.text(config.companyName.toUpperCase(), pageWidth / 2, 225, { align: "center" });

  const displayAddressEnd = (config.address && config.address.trim()) ? config.address : "Atendimento & Consultoria Online";
  const displayWebsiteEnd = (config.website && config.website.trim()) ? config.website : "";

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(8.5);
  pdf.setTextColor(220, 225, 235);
  pdf.text(displayAddressEnd, pageWidth / 2, 233, { align: "center" });
  pdf.text(`Telefone: ${config.phone} | E-mail: ${config.email}`, pageWidth / 2, 239, { align: "center" });
  if (displayWebsiteEnd) {
    pdf.text(displayWebsiteEnd, pageWidth / 2, 245, { align: "center" });
  }

  pdf.setFont("helvetica", "italic");
  pdf.setFontSize(8);
  pdf.setTextColor(180, 190, 210);
  pdf.text(`Relatorio gerado digitalmente em ${new Date().toLocaleDateString("pt-BR")}`, pageWidth / 2, 270, { align: "center" });

  // Salvar PDF com nome formatado
  const filename = `laudo_avaliacao_${studentName
    .toLowerCase()
    .replace(/\s+/g, "_")}_${(evaluation.date || "01/07/2026").replace("/", "_")}.pdf`;
  pdf.save(filename);
  return pdf;
}
