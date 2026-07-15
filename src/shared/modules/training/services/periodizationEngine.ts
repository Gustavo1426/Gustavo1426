export interface PeriodizationStrategy {
  frequency: string;
  duration: string;
  model: string;
  objective: string;
  references: string;
  priorityMuscles: string;
  maintenanceMuscles: string;
  division: string;
}

export interface PeriodizationContext {
  avoid?: string;
  sleep?: string;
  stress?: string;
  recoveryScore?: number;
}

export interface CopilotInterpretation {
  summary: string;
  recommendations: string[];
  alerts: string[];
  appliesDirectly: boolean;
  evidence: string[];
}

export interface PersistentPeriodizationPlan {
  macrociclo: {
    id: string;
    name: string;
    objective: string;
    durationMonths: number;
    startDate: string;
    endDate: string;
    notes: string;
    status: 'Planejado' | 'Em andamento' | 'Concluído';
    model: string;
  };
  mesociclos: Array<{
    id: string;
    name: string;
    objective: string;
    weeks: number;
    volumePlanejado: string;
    intensidadeMedia: number;
    estrategias: string;
    deload: boolean;
  }>;
  microciclos: Array<{
    weekIndex: number;
    mesocycleId: string;
    division: string;
    weeklyVolume: number;
    fatigue: number;
    recovery: number;
    notes: string;
    exercises: Array<{
      name: string;
      sets: number;
      reps: string;
      load: number;
      rpe: number;
      rir: number;
      rest: string;
      notes?: string;
      muscleGroup: string;
      day?: string;
    }>;
  }>;
}

const toWeekCount = (frequency: string) => {
  const number = parseInt(frequency, 10);
  if (!Number.isNaN(number)) return number;
  if (frequency.includes('6')) return 6;
  if (frequency.includes('5')) return 5;
  if (frequency.includes('4')) return 4;
  return 3;
};

export function buildPeriodizationPlan(strategy: PeriodizationStrategy): PersistentPeriodizationPlan {
  const weeksPerMesocycle = 4;
  const mesocycleCount = 3;

  const model = strategy.model || "Periodização Linear";
  const duration = strategy.duration || "60 minutos";
  const ref = strategy.references || "";
  const division = strategy.division || "📐 ABC Tradicional";

  // Base volumes dependent on session duration
  // 45 minutes -> 8-12 sets
  // 60 minutes -> 12-16 sets
  // 90 minutes -> 16-22 sets
  let baseVolMin = 10;
  let baseVolMax = 14;
  if (duration.includes("45")) {
    baseVolMin = 8;
    baseVolMax = 12;
  } else if (duration.includes("90")) {
    baseVolMin = 16;
    baseVolMax = 22;
  }

  // Strategies dependent on references
  let defaultStrategies = [
    "Progressão linear de carga e volume",
    "Estabilização de carga e aumento de densidade",
    "Pico de intensidade com técnicas avançadas e Deload final"
  ];

  if (ref.includes("Israetel") || ref.includes("Schoenfeld")) {
    defaultStrategies = [
      "Hipertrofia - Progressão do volume de MEV para MAV",
      "Especialização - Sobrecarga progressiva próxima ao MRV com Drop-sets",
      "Pico de Intensidade - Myo-reps, Rest-Pause e Deload regenerativo na última semana"
    ];
  } else if (ref.includes("Bompa")) {
    defaultStrategies = [
      "Adaptação Anatômica - Fortalecimento de tendões e ligamentos",
      "Hipertrofia Crônica - Incremento de volume muscular absoluto",
      "Força Máxima - Alta carga de tensão mecânica e transição"
    ];
  } else if (ref.includes("Poliquin")) {
    defaultStrategies = [
      "Acumulação - Maior volume, menor intensidade, andamento lento",
      "Intensificação - Menor volume, maior intensidade, cadência explosiva",
      "Realização - Supercompensação e pico neuromuscular"
    ];
  }

  const mesociclos = Array.from({ length: mesocycleCount }, (_, idx) => {
    let name = "";
    let objective = "";
    let volumePlanejado = "";
    let intensidadeMedia = 70;
    let deload = false;

    if (model.includes("Linear")) {
      name = idx === 0 ? "Meso 1: Adaptação & Base" : idx === 1 ? "Meso 2: Hipertrofia Progressiva" : "Meso 3: Pico de Força & Volume";
      objective = idx === 0 ? "Adaptação neuromuscular" : idx === 1 ? "Acúmulo de volume tensionante" : "Pico de intensidade mecânica";
      volumePlanejado = idx === 0 ? `${baseVolMin}-${baseVolMin + 2} séries` : idx === 1 ? `${baseVolMin + 2}-${baseVolMax} séries` : `${baseVolMax}-${baseVolMax + 4} séries`;
      intensidadeMedia = idx === 0 ? 65 : idx === 1 ? 75 : 85;
      deload = idx === 2;
    } else if (model.includes("Ondulatória")) {
      name = idx === 0 ? "Meso 1: Ondulação de Volume" : idx === 1 ? "Meso 2: Ondulação de Intensidade" : "Meso 3: Ondulação Mista / Choque";
      objective = idx === 0 ? "Alternância de volume semanal" : idx === 1 ? "Flutuação de intensidade neuromuscular" : "Pico de choque fisiológico";
      volumePlanejado = idx === 0 ? `${baseVolMin + 1}-${baseVolMax} séries` : idx === 1 ? `${baseVolMin}-${baseVolMax - 1} séries` : `${baseVolMin + 2}-${baseVolMax + 2} séries`;
      intensidadeMedia = idx === 0 ? 70 : idx === 1 ? 80 : 78;
      deload = idx === 2;
    } else if (model.includes("Reversa")) {
      name = idx === 0 ? "Meso 1: Pico de Volume" : idx === 1 ? "Meso 2: Consolidação" : "Meso 3: Transição Intensiva";
      objective = idx === 0 ? "Máximo acúmulo de volume" : idx === 1 ? "Ajuste de intensidade ascendente" : "Carga máxima e volume reduzido";
      volumePlanejado = idx === 0 ? `${baseVolMax}-${baseVolMax + 4} séries` : idx === 1 ? `${baseVolMin + 2}-${baseVolMax} séries` : `${baseVolMin}-${baseVolMin + 2} séries`;
      intensidadeMedia = idx === 0 ? 60 : idx === 1 ? 72 : 84;
      deload = idx === 2;
    } else { // Blocos
      name = idx === 0 ? "Meso 1: Bloco Acumulação" : idx === 1 ? "Meso 2: Bloco Intensificação" : "Meso 3: Bloco Realização / Deload";
      objective = idx === 0 ? "Alta densidade e volume elevado" : idx === 1 ? "Alta intensidade e tensão mecânica" : "Supercompensação metabólica";
      volumePlanejado = idx === 0 ? `${baseVolMax}-${baseVolMax + 3} séries` : idx === 1 ? `${baseVolMin + 2}-${baseVolMax} séries` : `${baseVolMin}-${baseVolMin + 2} séries`;
      intensidadeMedia = idx === 0 ? 68 : idx === 1 ? 82 : 72;
      deload = idx === 2;
    }

    return {
      id: `meso-${idx + 1}`,
      name,
      objective,
      weeks: weeksPerMesocycle,
      volumePlanejado,
      intensidadeMedia,
      estrategias: defaultStrategies[idx],
      deload
    };
  });

  const microciclos: PersistentPeriodizationPlan['microciclos'] = [];
  let weekIndex = 1;

  mesociclos.forEach((meso, mesoIndex) => {
    for (let week = 1; week <= meso.weeks; week += 1) {
      const isDeload = meso.deload && week === meso.weeks;
      let weeklyVolume = 10;
      let fatigue = 5;
      let recovery = 7;
      const freqNum = toWeekCount(strategy.frequency);

      if (isDeload) {
        weeklyVolume = Math.round(baseVolMin * 0.7);
        fatigue = 3;
        recovery = 9;
      } else {
        if (model.includes("Linear")) {
          weeklyVolume = Math.round(baseVolMin + mesoIndex * 2 + (week - 1));
          fatigue = Math.min(9, 4 + mesoIndex + week);
          recovery = Math.max(4, 9 - week - mesoIndex);
        } else if (model.includes("Ondulatória")) {
          const wavePattern = [0, 3, -2, 2];
          const waveAdjustment = wavePattern[(week - 1) % 4];
          weeklyVolume = Math.round(baseVolMin + mesoIndex * 1.5 + waveAdjustment + (freqNum - 4));
          fatigue = Math.min(9, 5 + waveAdjustment);
          recovery = Math.max(4, 9 - fatigue);
        } else if (model.includes("Reversa")) {
          weeklyVolume = Math.round(baseVolMax - mesoIndex * 3 - (week - 1));
          fatigue = Math.min(9, 7 - mesoIndex + Math.round(week / 2));
          recovery = Math.max(4, 5 + mesoIndex);
        } else { // Blocos
          if (mesoIndex === 0) {
            weeklyVolume = Math.round(baseVolMax + (week - 1));
            fatigue = Math.min(9, 5 + week);
            recovery = Math.max(4, 8 - week);
          } else if (mesoIndex === 1) {
            weeklyVolume = Math.round(baseVolMin + 2 - Math.round(week / 2));
            fatigue = Math.min(9, 6 + Math.round(week / 2));
            recovery = Math.max(4, 7 - Math.round(week / 2));
          } else {
            weeklyVolume = Math.round(baseVolMin - Math.round(week / 2));
            fatigue = Math.max(3, 5 - week);
            recovery = Math.min(10, 7 + week);
          }
        }
      }

      weeklyVolume = Math.max(4, weeklyVolume);

      const muscleList = strategy.priorityMuscles ? strategy.priorityMuscles.split(',').map(m => m.trim()) : ["Peitoral", "Dorsal"];
      const primaryMuscle = muscleList[0] || "Peitoral";
      const secondaryMuscle = muscleList[1] || "Costas";

      let weekNotes = "";
      if (isDeload) {
        weekNotes = `Semana de Deload. Foco em recuperação ativa, regeneração articular e supercompensação de glicogênio de acordo com as diretrizes de ${strategy.references || "TreinoPro"}.`;
      } else {
        weekNotes = `Semana ${week} focada no modelo ${model}. Divisão de treino activa: ${division}. Foco estratégico em prioridades: ${strategy.priorityMuscles || "Músculos gerais"}. Tempo por sessão planejado para ${duration}.`;
      }

      microciclos.push({
        weekIndex,
        mesocycleId: meso.id,
        division,
        weeklyVolume,
        fatigue,
        recovery,
        notes: weekNotes,
        exercises: [
          {
            name: `Supino com Halteres (Foco ${primaryMuscle})`,
            sets: isDeload ? 2 : Math.max(3, Math.round(weeklyVolume / 4)),
            reps: isDeload ? '8' : '8-12',
            load: isDeload ? 12 : 18 + mesoIndex * 4,
            rpe: isDeload ? 6 : 8,
            rir: isDeload ? 4 : 2,
            rest: '90s',
            notes: `Foco em amplitude máxima (Full ROM) e cadência excêntrica controlada para hipertrofia de ${primaryMuscle}.`,
            muscleGroup: primaryMuscle,
            day: 'Treino A'
          },
          {
            name: `Puxada Alta na Polia (Foco ${secondaryMuscle})`,
            sets: isDeload ? 2 : Math.max(3, Math.round(weeklyVolume / 4)),
            reps: isDeload ? '8' : '8-12',
            load: isDeload ? 12 : 16 + mesoIndex * 4,
            rpe: isDeload ? 6 : 8,
            rir: isDeload ? 4 : 2,
            rest: '90s',
            notes: `Estiramento máximo na excêntrica para estimular a hipertrofia mediada pelo estiramento de ${secondaryMuscle}.`,
            muscleGroup: secondaryMuscle,
            day: 'Treino B'
          }
        ]
      });
      weekIndex += 1;
    }
  });

  return {
    macrociclo: {
      id: 'macro-1',
      name: 'Macrociclo de Desenvolvimento Integrado',
      objective: strategy.objective,
      durationMonths: 3,
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      notes: `Planejado com tempo de sessão de ${duration}, divisão de treino ${division}, e fundamentado metodologicamente em ${strategy.references}.`,
      status: 'Em andamento',
      model
    },
    mesociclos,
    microciclos
  };
}

export function auditAndAutoHeal(plan: PersistentPeriodizationPlan, context: PeriodizationContext) {
  const auditLog: string[] = [];
  const microciclos = plan.microciclos.map((micro) => {
    let adjusted = { ...micro };
    const avoidText = (context.avoid || '').toLowerCase();
    const sleepText = (context.sleep || '').toLowerCase();
    const stressText = (context.stress || '').toLowerCase();
    const recoveryScore = context.recoveryScore ?? 80;

    if (avoidText.includes('ombro') && adjusted.exercises.some((ex) => ex.name.toLowerCase().includes('supino'))) {
      adjusted.exercises = adjusted.exercises.filter((ex) => !ex.name.toLowerCase().includes('supino'));
      adjusted.exercises.push({
        name: 'Peck Deck',
        sets: 2,
        reps: '10-12',
        load: 12,
        rpe: 7,
        rir: 3,
        rest: '60s',
        notes: 'Exercício substituído para reduzir risco no ombro.',
        muscleGroup: 'Peitoral'
      });
      auditLog.push(`Exercício substituído em ${adjusted.weekIndex} para reduzir risco biomecânico.`);
    }

    if ((sleepText.includes('restrito') || stressText.includes('elevado')) && adjusted.weeklyVolume > 14) {
      adjusted.weeklyVolume = Math.max(8, Math.round(adjusted.weeklyVolume * 0.8));
      adjusted.recovery = Math.max(adjusted.recovery, 8);
      auditLog.push(`Volume semanal reduzido em ${adjusted.weekIndex} para preservar recuperação.`);
    }

    if (recoveryScore < 60) {
      adjusted.weeklyVolume = Math.max(8, adjusted.weeklyVolume - 2);
      adjusted.fatigue = Math.max(3, adjusted.fatigue - 1);
      auditLog.push(`Recuperação baixa detectada; volume ajustado em ${adjusted.weekIndex}.`);
    }

    return adjusted;
  });

  return {
    ...plan,
    microciclos,
    auditLog
  };
}

export function buildCopilotInterpretation(
  plan: PersistentPeriodizationPlan,
  context: PeriodizationContext,
  question: string
): CopilotInterpretation {
  const currentWeek = plan.microciclos[plan.microciclos.length - 1] || plan.microciclos[0];
  const recoveryScore = context.recoveryScore ?? 80;
  const alerts: string[] = [];
  const recommendations: string[] = [];
  const evidence: string[] = [];

  if (currentWeek?.weeklyVolume && currentWeek.weeklyVolume > 14) {
    alerts.push('Volume acima do recuperável para a semana atual.');
    evidence.push(`Volume semanal estimado em ${currentWeek.weeklyVolume} séries.`);
    recommendations.push('Sugiro reduzir a frequência para três dias para preservar recuperação.');
  }

  if ((context.sleep || '').toLowerCase().includes('restrito') || (context.stress || '').toLowerCase().includes('elevado')) {
    alerts.push('Recuperação comprometida com base em sono e estresse.');
    evidence.push('A auditoria da Engine considera sono restrito e estresse elevado.');
    recommendations.push('Sugiro priorizar recuperação e reduzir volume de membros mais exigidos.');
  }

  if (recoveryScore < 60) {
    alerts.push('Recuperação global abaixo do ideal.');
    evidence.push(`Recovery Score estimado em ${recoveryScore}%.`);
    recommendations.push('Sugiro manter um deload na próxima semana.');
  }

  const summary = [
    'Esta resposta foi construída exclusivamente a partir dos dados gerados pela Engine Central de Prescrição.',
    `A pergunta recebida foi: ${question}`,
    `A Engine identificou ${alerts.length > 0 ? alerts.length : 1} ponto(s) de atenção e ${recommendations.length} recomendação(ões).`,
    'Nenhuma alteração foi aplicada diretamente; o copilot apenas interpreta e comunica.'
  ].join(' ');

  return {
    summary,
    recommendations,
    alerts,
    appliesDirectly: false,
    evidence
  };
}
