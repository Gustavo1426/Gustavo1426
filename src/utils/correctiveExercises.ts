export interface CorrectiveExercise {
  name: string;
  description: string;
  target: string;
  sets: number;
  reps: string;
  notes: string;
}

export const CORRECTIVE_EXERCISES: Record<string, CorrectiveExercise[]> = {
  cifose: [
    {
      name: "Remada Curvada com Pegada Aberta",
      description: "Foco em retração escapular e fortalecimento de romboides e trapézio médio/inferior.",
      target: "Costas Superior / Romboides",
      sets: 3,
      reps: "12-15",
      notes: "Ênfase em juntar as escápulas no final do movimento, segurando por 2 segundos.",
    },
    {
      name: "Face Pull",
      description: "Fortalecimento de deltoide posterior, manguito rotador e rotadores externos.",
      target: "Deltoide Posterior / Manguito",
      sets: 3,
      reps: "15-20",
      notes: "Manter cotovelos altos e puxar a corda em direção à testa, abrindo as mãos.",
    },
    {
      name: "Extensão Torácica no Foam Roller",
      description: "Mobilidade da coluna torácica e descompressão da cifose torácica.",
      target: "Mobilidade Torácica",
      sets: 2,
      reps: "10-12 respirações",
      notes: "Apoie o foam roller nas costas e faça a extensão do tronco sem hiperestender a lombar.",
    },
  ],
  lordose: [
    {
      name: "Prancha Abdominal Estática",
      description: "Fortalecimento de core anterior para corrigir a inclinação pélvica anterior.",
      target: "Core / Reto Abdominal",
      sets: 3,
      reps: "30-45 segundos",
      notes: "Mantenha o quadril alinhado e o glúteo contraído, evitando que a lombar curve para baixo.",
    },
    {
      name: "Alongamento de Flexores de Quadril (Psoas)",
      description: "Alongamento ativo do psoas e reto femoral para reduzir a tração sobre a pelve.",
      target: "Flexores do Quadril",
      sets: 3,
      reps: "30 segundos por lado",
      notes: "Posição de afundo com o joelho no chão. Contraia o glúteo do lado alongado para maximizar o efeito.",
    },
    {
      name: "Elevação Pélvica (Glute Bridge)",
      description: "Fortalecimento de glúteos e posterior de coxa para retroversão pélvica.",
      target: "Glúteos / Posteriores",
      sets: 3,
      reps: "15",
      notes: "Suba o quadril empurrando pelos calcanhares e faça uma contração forte do glúteo no topo.",
    },
  ],
  escoliose: [
    {
      name: "Prancha Lateral (Side Plank)",
      description: "Trabalho assimétrico de quadrado lombar e oblíquos para estabilização lateral.",
      target: "Core Lateral / Oblíquos",
      sets: 3,
      reps: "20-30 segundos por lado",
      notes: "Foque na sustentação e alinhamento do quadril, insistindo um pouco mais no lado mais fraco.",
    },
    {
      name: "Alongamento em Latíssimo do Dorso Lateral",
      description: "Alongamento unilateral para aliviar a tensão no lado côncavo da curva.",
      target: "Latíssimo do Dorso",
      sets: 3,
      reps: "30 segundos",
      notes: "Segure em um suporte firme, projete o quadril para o lado oposto e sinta o alongamento lateral.",
    },
    {
      name: "Dead Bug Unilateral",
      description: "Estabilização rotacional e coordenação contralateral do core.",
      target: "Estabilização de Core",
      sets: 3,
      reps: "10 de cada lado",
      notes: "Mantenha a lombar 100% colada no chão durante todo o movimento dos braços e pernas.",
    },
  ],
  ombros: [
    {
      name: "Alongamento de Peitoral na Parede",
      description: "Alívio da hipertonicidade do peitoral maior e menor que traciona os ombros para frente.",
      target: "Peitoral Maior e Menor",
      sets: 3,
      reps: "30 segundos por lado",
      notes: "Apoie o cotovelo a 90 graus na parede e gire o tronco suavemente para o lado oposto.",
    },
    {
      name: "Deslizamento de Parede (Wall Slides)",
      description: "Ativação de trapézio inferior, romboides e rotadores externos.",
      target: "Escápulas / Ombros",
      sets: 3,
      reps: "12",
      notes: "Costas e braços totalmente colados na parede. Suba e desça os braços mantendo os pontos de contato.",
    },
    {
      name: "YTWL Isométrico",
      description: "Ativação da musculatura postural posterior da cintura escapular.",
      target: "Estabilizadores Escapulares",
      sets: 2,
      reps: "15 segundos por posição",
      notes: "Deitado de bruços, faça as formas das letras Y, T, W e L com os braços, contraindo as escápulas.",
    },
  ],
  valgo: [
    {
      name: "Clamshell (Ostra) com Mini Band",
      description: "Fortalecimento de glúteo médio para evitar o colapso medial do joelho.",
      target: "Glúteo Médio / Rotadores Externos",
      sets: 3,
      reps: "15-20 por lado",
      notes: "Deitado de lado com joelhos dobrados, abra o joelho superior sem girar o quadril para trás.",
    },
    {
      name: "Agachamento com Mini Band nos Joelhos",
      description: "Feedback tátil para forçar a abdução ativa do quadril durante o agachamento.",
      target: "Glúteos / Quadríceps",
      sets: 3,
      reps: "12-15",
      notes: "Empurre os joelhos contra a faixa elástica o tempo todo, impedindo que eles entrem (valguizem).",
    },
    {
      name: "Adução de Quadril e Mobilidade de Tornozelo",
      description: "Melhora da flexão dorsal do tornozelo, cuja limitação frequentemente causa o valgo dinâmico.",
      target: "Mobilidade de Tornozelo / Sóleo",
      sets: 3,
      reps: "12 por lado",
      notes: "Avanço ajoelhado projetando o joelho à frente da linha dos dedos sem tirar o calcanhar do chão.",
    },
  ],
};

export function getCorrectiveExercises(scanResult: string): CorrectiveExercise[] {
  if (!scanResult) return [];

  const text = scanResult.toLowerCase();
  const matchedExercises: CorrectiveExercise[] = [];
  const addedNames = new Set<string>();

  // Auxiliar para evitar duplicados
  const addUnique = (exercisesList: CorrectiveExercise[]) => {
    exercisesList.forEach((ex) => {
      if (!addedNames.has(ex.name)) {
        matchedExercises.push(ex);
        addedNames.add(ex.name);
      }
    });
  };

  if (text.includes("cifose") || text.includes("hipercifose") || text.includes("dorso curvo") || text.includes("corcunda")) {
    addUnique(CORRECTIVE_EXERCISES.cifose);
  }

  if (text.includes("lordose") || text.includes("hiperlordose") || text.includes("anteversão") || text.includes("pelve")) {
    addUnique(CORRECTIVE_EXERCISES.lordose);
  }

  if (text.includes("escoliose") || text.includes("desvio lateral") || text.includes("assimétrico") || text.includes("quadrado lombar")) {
    addUnique(CORRECTIVE_EXERCISES.escoliose);
  }

  if (text.includes("ombro") || text.includes("ombros") || text.includes("protuso") || text.includes("protusão") || text.includes("enrolado")) {
    addUnique(CORRECTIVE_EXERCISES.ombros);
  }

  if (text.includes("valgo") || text.includes("joelho") || text.includes("joelhos") || text.includes("abdução") || text.includes("colapso")) {
    addUnique(CORRECTIVE_EXERCISES.valgo);
  }

  // Se nenhum caso específico combinou, ou se quisermos garantir alguns gerais quando houver qualquer resultado
  if (matchedExercises.length === 0) {
    // Retorna um mix genérico excelente para postura geral (mobilidade torácica, ativação de escápulas e core)
    return [
      CORRECTIVE_EXERCISES.ombros[1], // Wall slides
      CORRECTIVE_EXERCISES.cifose[2],  // Extensão Torácica no Roller
      CORRECTIVE_EXERCISES.lordose[0], // Prancha abdominal
    ];
  }

  return matchedExercises;
}
