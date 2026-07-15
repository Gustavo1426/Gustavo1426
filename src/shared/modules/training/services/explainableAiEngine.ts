/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface ExerciseBiomechanics {
  name: string;
  primaryMuscles: string;
  synergists: string;
  stability: string;
  resistanceCurve: string;
  sfr: string; // Stimulus-to-Fatigue Ratio (e.g. "9/10")
  choiceReason: string;
  substituteReason: string;
  contraindications: string;
  biomechanicalAdvantages: string;
}

export class ExplainableAiEngine {
  private static readonly database: Record<string, Partial<ExerciseBiomechanics>> = {
    "supino": {
      primaryMuscles: "Peitoral Maior (Fibras Esternocostais e Claviculares)",
      synergists: "Deltoide Anterior, Tríceps Braquial, Coracobraquial",
      stability: "Média-Alta (Estável devido ao apoio no banco, mas exige coordenação bilateral)",
      resistanceCurve: "Descendente (Mais difícil na porção inicial/alongada, fica mais fácil no final/encurtada)",
      sfr: "8.5/10 (Alto estímulo global, mas gera fadiga moderada no tríceps e deltoide)",
      choiceReason: "Escolhido como construtor de base para sobrecarga progressiva pesada na cadeia anterior de membros superiores.",
      substituteReason: "Pode ser substituído por Supino com Halteres se houver assimetrias, ou Supino em Máquina se houver limitação de estabilidade de ombro.",
      contraindications: "Evitar ou limitar amplitude em casos de lesão ativa de manguito rotador ou instabilidade anterior de ombro.",
      biomechanicalAdvantages: "Permite maior carregamento absoluto de carga (tensão mecânica pura) em comparação com qualquer variante com halteres ou cabos."
    },
    "crucifixo": {
      primaryMuscles: "Peitoral Maior (Foco em Fibras Esternais / Alongamento)",
      synergists: "Deltoide Anterior, Bíceps Braquial (Cabeça Curta - estabilização)",
      stability: "Média (Exige controle na fase de máximo alongamento)",
      resistanceCurve: "Descendente em halteres (tensão zera no topo); Plana/Constante em cabos e máquinas",
      sfr: "9/10 (Excelente isolamento do peitoral com baixíssima fadiga sistêmica e de tríceps)",
      choiceReason: "Selecionado para expor o peitoral a um estímulo de alongamento sob carga, crucial para hipertrofia mediada por estiramento.",
      substituteReason: "Substituir por Crucifixo Máquina (Peck Deck) para manter tensão constante no final da contração.",
      contraindications: "Evitar abdução horizontal excessiva em alunos com frouxidão ligamentar ou histórico de luxação glenoumeral.",
      biomechanicalAdvantages: "Isola o peitoral maior eliminando a participação do tríceps braquial, ideal para técnicas de pré/pós-exaustão."
    },
    "remada": {
      primaryMuscles: "Latíssimo do Dorso, Redondo Maior, Trapézio (Fibras Médias e Inferiores), Romboides",
      synergists: "Bíceps Braquial, Braquiorradial, Deltoide Posterior",
      stability: "Alta se apoiada (máquina), Baixa se livre (curvada livre)",
      resistanceCurve: "Plana (Tensão consistente, mas exige força máxima na contração final)",
      sfr: "9/10 se apoiada (máximo foco no dorso com baixo estresse lombar)",
      choiceReason: "Selecionado para desenvolver espessura do dorso e promover equilíbrio postural contra os movimentos de empurrar.",
      substituteReason: "Pode ser substituída por Remada Unilateral com Halteres (Serrote) para maior liberdade articular, ou Remada Máquina para máxima estabilidade.",
      contraindications: "Remadas livres devem ser evitadas em alunos com hérnia discal lombar ativa ou dor lombar inespecífica.",
      biomechanicalAdvantages: "O alinhamento dos cabos/alças permite puxar no plano exato das fibras do latíssimo do dorso, maximizando o recrutamento."
    },
    "puxada": {
      primaryMuscles: "Latíssimo do Dorso (Foco em Fibras Ilíacas e Costais), Redondo Maior",
      synergists: "Bíceps Braquial, Braquial, Braquiorradial, Deltoide Posterior",
      stability: "Alta (Apoio de coxa na polia fixa o quadril verticalmente)",
      resistanceCurve: "Ascendente para Descendente (Mais pesada na porção média, exige ativação escapular inicial)",
      sfr: "8.5/10 (Altíssimo estímulo para largura de costas com fadiga controlada)",
      choiceReason: "Escolhido para focar no plano de adução vertical de ombro, enfatizando a porção lateral do latíssimo do dorso.",
      substituteReason: "Pode ser substituído por Barra Fixa (Pull-up) se o aluno tiver excelente relação força/peso corporal, ou Puxada Unilateral para ajuste de vetor unilateral.",
      contraindications: "Evitar puxada por trás do pescoço devido ao estresse nocivo na cápsula anterior do ombro e cervical.",
      biomechanicalAdvantages: "Excelente controle de carga que permite sobrecarga progressiva mesmo para alunos que ainda não realizam barra fixa."
    },
    "agachamento": {
      primaryMuscles: "Quadríceps (Vasto Lateral, Medial, Intermédio e Reto Femoral), Glúteo Máximo",
      synergists: "Adutor Magno, Posteriores de Coxa, Eretores da Espinha, Sóleo",
      stability: "Baixa-Média (Exige forte ativação de core, eretores e estabilizadores de quadril)",
      resistanceCurve: "Descendente (Curva de parábola: ponto mais difícil no 'buraco' a 90 graus)",
      sfr: "7.5/10 (Estímulo hipertrófico gigante, porém com altíssimo custo de fadiga sistêmica)",
      choiceReason: "Prescrito como o exercício rei para membros inferiores, gerando alta tensão mecânica e densidade mineral óssea.",
      substituteReason: "Substituir por Leg Press 45 para isolar as pernas reduzindo a fadiga sistêmica e lombar, ou Agachamento Búlgaro para foco unilateral.",
      contraindications: "Evitar agachamento livre pesado em alunos com discopatias lombares agudas ou condromalácia patelar grau IV sem acompanhamento.",
      biomechanicalAdvantages: "Recrutamento massivo de cadeias musculares integradas e estímulo de estabilização do core em cadeia cinética fechada."
    },
    "leg press": {
      primaryMuscles: "Quadríceps, Glúteo Máximo",
      synergists: "Adutor Magno, Posteriores de Coxa",
      stability: "Alta (O tronco fica totalmente apoiado no encosto anatômico)",
      resistanceCurve: "Descendente (Fica mais leve próximo à extensão completa)",
      sfr: "9.5/10 (Estímulo massivo de quadríceps com fadiga sistêmica muito menor que o agachamento livre)",
      choiceReason: "Prescrito para acumular volume de alta qualidade para quadríceps com segurança, eliminando o fator limitante lombar.",
      substituteReason: "Substituir por Cadeira Extensora para isolamento puro de quadríceps, ou Agachamento Hack para maior amplitude de joelho.",
      contraindications: "Evitar retroversão pélvica no final da descida para proteger a coluna lombo-sacra.",
      biomechanicalAdvantages: "Permite angulações seguras de joelho e posicionamento de pés flexível para enfatizar diferentes porções das coxas."
    },
    "extensora": {
      primaryMuscles: "Quadríceps (Vasto Lateral, Medial, Intermédio e com destaque para o Reto Femoral)",
      synergists: "Nenhum (Isolamento puro de joelho)",
      stability: "Alta (Apoio completo de banco e travas laterais para as mãos)",
      resistanceCurve: "Plana (Tensão constante, pico de contração máxima com joelhos estendidos)",
      sfr: "9/10 (Excelente isolamento do quadríceps com fadiga sistêmica nula)",
      choiceReason: "Escolhido por ser o único exercício capaz de recrutar o reto femoral em encurtamento completo (por não estender o quadril).",
      substituteReason: "Substituir por Avanço/Passada se desejar estímulo dinâmico, ou Sissy Squat para alongamento extremo de quadríceps.",
      contraindications: "Evitar cargas excessivas em fases iniciais de pós-operatório de LCA ou dor fêmoro-patelar severa.",
      biomechanicalAdvantages: "Tensão de pico máxima na posição de encurtamento, complementando perfeitamente exercícios como agachamento e leg press."
    },
    "flexora": {
      primaryMuscles: "Isquiotibiais (Bíceps Femoral - Cabeça Longa e Curta, Semitendíneo, Semimembranáceo)",
      synergists: "Gastrocnêmio, Sartório, Grácil",
      stability: "Alta (Mesa ou cadeira com fixadores pélvicos)",
      resistanceCurve: "Plana/Constante (Máximo torque na metade do arco de movimento)",
      sfr: "9/10 (Isolamento impecável de posteriores com zero fadiga na coluna lombar)",
      choiceReason: "Prescrito para isolar a flexão de joelho dos isquiotibiais, gerando hipertrofia balanceada e prevenindo estiramentos.",
      substituteReason: "Mesa Flexora pode ser substituída por Cadeira Flexora (que alonga mais os posteriores por fletir o quadril).",
      contraindications: "Evitar hiperextensão lombar compensatória durante a fase concêntrica máxima.",
      biomechanicalAdvantages: "A cadeira flexora posiciona os isquiotibiais em insuficiência ativa moderada, gerando maior tensão de estiramento."
    },
    "stiff": {
      primaryMuscles: "Posteriores de Coxa, Glúteo Máximo",
      synergists: "Eretores da Espinha, Adutor Magno, Trapézio (Estabilização escapular)",
      stability: "Média-Baixa (Exige controle fino de dobradiça de quadril sem flexionar joelhos)",
      resistanceCurve: "Descendente (Extremamente difícil na porção alongada inferior)",
      sfr: "8/10 (Estímulo de alongamento fenomenal, mas fadiga de eretores de espinha alta)",
      choiceReason: "Escolhido para explorar a hipertrofia mediada por alongamento ativo nos isquiotibiais via dobradiça de quadril.",
      substituteReason: "Substituir por Flexão de Quadril no Cabo (Pull-through) se precisar reduzir estresse lombar, ou Flexão de Pernas deitado.",
      contraindications: "Evitar em alunos com falta de mobilidade de quadril que compensam flexionando a coluna lombar.",
      biomechanicalAdvantages: "Coloca os posteriores em alongamento extremo sob tensão mecânica máxima, estímulo padrão-ouro para hipertrofia."
    },
    "biceps": {
      primaryMuscles: "Bíceps Braquial (Cabeça Longa e Curta), Braquial, Braquiorradial",
      synergists: "Pronador Redondo, Flexor Superficial dos Dedos",
      stability: "Média (Exige controle postural do tronco para evitar balanço)",
      resistanceCurve: "Depende da variação (Cabo: constante; Halteres em pé: pico aos 90°; Scott: pico inicial)",
      sfr: "9/10 (Estímulo direto focado no braço com fadiga sistêmica desprezível)",
      choiceReason: "Prescrito para compensar e complementar o estímulo indireto recebido nos treinos de puxar/costas.",
      substituteReason: "Rosca Direta pode ser substituída por Rosca Martelo (foco em braquial e braquiorradial) ou Rosca Scott (foco em pico concêntrico).",
      contraindications: "Evitar extensão violenta do cotovelo na mesa Scott para proteger o tendão distal do bíceps.",
      biomechanicalAdvantages: "Variar a inclinação do ombro (ex: Rosca no banco inclinado) altera o comprimento inicial do bíceps, focando na cabeça longa."
    },
    "triceps": {
      primaryMuscles: "Tríceps Braquial (Cabeça Lateral, Medial e Longa)",
      synergists: "Ancôneo",
      stability: "Alta (Especialmente quando executado na polia com apoio)",
      resistanceCurve: "Plana em polias (Tensão constante de início ao fim)",
      sfr: "9/10 (Isolamento biomecânico excelente, baixo estresse sistêmico)",
      choiceReason: "Prescrito para atingir todas as porções do tríceps, compensando o volume de empurrar.",
      substituteReason: "Tríceps Pulley pode ser substituído por Tríceps Testa para alongar a cabeça longa, ou Tríceps Francês.",
      contraindications: "Evitar excesso de carga na variante testa se o aluno apresentar tendinite quadricipital ou epicondilite.",
      biomechanicalAdvantages: "A polia permite manter o vetor de força a 90 graus em relação ao antebraço no pico de contração, gerando estímulo perfeito."
    },
    "ombro": {
      primaryMuscles: "Deltoide Lateral, Deltoide Anterior, Deltoide Posterior",
      synergists: "Trapézio, Supraespinal, Serrátil Anterior",
      stability: "Média (Exige estabilização escapular constante)",
      resistanceCurve: "Halteres: Ascendente (Mais pesado no topo); Cabos: Totalmente plana/constante",
      sfr: "9/10 (Indispensável para o aspecto de 'ombros em 3D' e saúde articular)",
      choiceReason: "Prescrito para alargar a cintura escapular e blindar a articulação glenoumeral.",
      substituteReason: "Elevação Lateral com Halteres pode ser substituída por Elevação Lateral no Cabo para tensão na porção alongada.",
      contraindications: "Evitar elevações frontais/laterais acima de 90° em alunos com síndrome do impacto do ombro.",
      biomechanicalAdvantages: "Isolar as porções do deltoide permite esculpir os ombros sem sobrecarregar o tríceps, mantendo o estresse sistêmico baixo."
    }
  };

  /**
   * Returns a complete, detailed biomechanical and explanatory AI profile
   * for any exercise name, mapping synonyms to our structured database.
   */
  public static getBiomechanics(exerciseName: string): ExerciseBiomechanics {
    const nameLower = exerciseName.toLowerCase();
    
    // Find matching profile in database based on keywords
    let matchKey = "supino"; // default fallback
    for (const key of Object.keys(this.database)) {
      if (nameLower.includes(key)) {
        matchKey = key;
        break;
      }
    }

    // Default template for unmapped exercises
    const fallbackProfile: Partial<ExerciseBiomechanics> = {
      primaryMuscles: "Músculos específicos do grupo-alvo selecionado.",
      synergists: "Musculaturas estabilizadoras sinergistas acessórias.",
      stability: "Alta-Média (Estrutura biomecânica de movimento guiada ou semi-guiada para segurança)",
      resistanceCurve: "Plana (Distribuição de carga equilibrada ao longo de toda a amplitude de movimento)",
      sfr: "9/10 (Excelente relação Estímulo/Fadiga devido ao isolamento tensional preciso)",
      choiceReason: `Selecionado de forma personalizada para preencher as necessidades de volume semanal sem sobrecarregar articulações sinergistas concorrentes.`,
      substituteReason: "Pode ser substituído por outra variação de polia ou halteres com padrão de movimento equivalente.",
      contraindications: "Executar com cadência controlada e amplitude confortável dentro da mobilidade individual do aluno.",
      biomechanicalAdvantages: "Permite isolamento focal do músculo-alvo com mínimo recrutamento de estabilizadores centrais exauridos."
    };

    const dbProfile = this.database[matchKey] || fallbackProfile;

    return {
      name: exerciseName,
      primaryMuscles: dbProfile.primaryMuscles || fallbackProfile.primaryMuscles!,
      synergists: dbProfile.synergists || fallbackProfile.synergists!,
      stability: dbProfile.stability || fallbackProfile.stability!,
      resistanceCurve: dbProfile.resistanceCurve || fallbackProfile.resistanceCurve!,
      sfr: dbProfile.sfr || fallbackProfile.sfr!,
      choiceReason: dbProfile.choiceReason || fallbackProfile.choiceReason!,
      substituteReason: dbProfile.substituteReason || fallbackProfile.substituteReason!,
      contraindications: dbProfile.contraindications || fallbackProfile.contraindications!,
      biomechanicalAdvantages: dbProfile.biomechanicalAdvantages || fallbackProfile.biomechanicalAdvantages!
    };
  }
}
