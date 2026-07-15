/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Student, Exercise } from "../../../../types";

export interface CoachResponse {
  answer: string;
  actionableTip: string;
  motivationLevel: "HIGH" | "RESTORATIVE" | "CAUTIOUS";
}

/**
 * AI Coach Engine providing real-time personalized guidance directly to
 * the student during their workout sessions.
 */
export class CoachEngine {
  private static instance: CoachEngine;

  private constructor() {}

  public static getInstance(): CoachEngine {
    if (!CoachEngine.instance) {
      CoachEngine.instance = new CoachEngine();
    }
    return CoachEngine.instance;
  }

  /**
   * Responds to common athlete questions by checking their personal context,
   * active workouts, sleep, and physical conditions.
   */
  public answerQuestion(
    question: string,
    student: Student,
    todaysExercises: Exercise[],
    sleepHours: number = 8,
    dailyWaterIntakeLiters: number = 2,
    waterGoalLiters: number = 3.5
  ): CoachResponse {
    const q = question.toLowerCase();
    
    // --- QUESTION 1: SLEEP / FATIGUE ("Dormi mal. O que muda?") ---
    if (q.includes("dormi") || q.includes("sono") || q.includes("cansad") || q.includes("fadiga")) {
      if (sleepHours < 6) {
        return {
          answer: `Olá ${student.name}! Como seu sono foi de apenas ${sleepHours} horas, seu sistema nervoso central (SNC) não se recuperou plenamente e sua taxa de re-síntese de glicogênio muscular está reduzida. Treinar até a falha absoluta hoje pode sobrecarregar suas articulações e elevar o cortisol de forma prejudicial.`,
          actionableTip: "Mantenha o treino planejado, mas reduza a intensidade (RPE alvo 7-8). Evite séries até a falha total e adicione 1 minuto extra de repouso entre as séries pesadas.",
          motivationLevel: "RESTORATIVE"
        };
      }
      return {
        answer: `Fala ${student.name}! Com ${sleepHours}h de sono, sua regeneração celular foi excelente. Seus hormônios anabólicos e estoques de ATP estão totalmente restaurados para o treino de hoje!`,
        actionableTip: "Bora focar em máxima contração excêntrica hoje! Se sentir confiança, tente subir de 1 a 2kg nos exercícios multiarticulares.",
        motivationLevel: "HIGH"
      };
    }

    // --- QUESTION 2: LOAD PROGRESSION ("Hoje devo aumentar carga?") ---
    if (q.includes("carga") || q.includes("peso") || q.includes("aumentar") || q.includes("progredir")) {
      const primaryExercise = todaysExercises[0];
      const exerciseName = primaryExercise ? primaryExercise.name : "seus exercícios";
      
      return {
        answer: `Para saber se deve progredir hoje em ${exerciseName}, avalie sua última série. Se você conseguiu completar todas as repetições prescritas mantendo a postura perfeita e sentiu que conseguiria fazer mais 2 repetições extras se quisesse (RPE ≤ 8), seu corpo já se adaptou a esse peso!`,
        actionableTip: `Tente um incremento conservador de 2kg a 4kg totais em ${exerciseName} hoje. Caso sinta a técnica falhar, volte à carga anterior imediatamente.`,
        motivationLevel: "HIGH"
      };
    }

    // --- QUESTION 3: EXERCISE TECHNIQUE ("Como faço este exercício?") ---
    if (q.includes("como faco") || q.includes("executar") || q.includes("tecnica") || q.includes("postura")) {
      let exerciseName = "Agachamento";
      let tips = "Mantenha o abdômen totalmente contraído, joelhos apontando na direção dos dedos dos pés e evite que a bacia gire para dentro no final da descida (retroversão pélvica).";
      
      // Match specific keywords
      if (q.includes("supino")) {
        exerciseName = "Supino Reto";
        tips = "Mantenha as escápulas em adução total (fechadas atrás), apoie firmemente os pés no chão e controle a descida da barra até a linha do peito inferior, sem deixar os cotovelos passarem da linha dos ombros.";
      } else if (q.includes("puxada") || q.includes("costas")) {
        exerciseName = "Puxada Alta";
        tips = "Puxe o triângulo ou barra direcionando os cotovelos para baixo e para trás (esmagando o dedão imaginário sob as axilas). Mantenha o peito aberto e não incline o tronco excessivamente.";
      } else if (q.includes("leg")) {
        exerciseName = "Leg Press 45º";
        tips = "Posicione os pés de forma confortável na plataforma, destrave com segurança e desça até que as coxas façam cerca de 90º com os joelhos. NÃO retire a região lombar/sacral do encosto sob hipótese alguma!";
      }

      return {
        answer: `A execução ideal do **${exerciseName}** exige controle motor preciso para maximizar o recrutamento das fibras musculares alvo e afastar o risco de lesões articulares.`,
        actionableTip: tips,
        motivationLevel: "HIGH"
      };
    }

    // --- QUESTION 4: WATER INTAKE ("Quanto de água falta hoje?") ---
    if (q.includes("agua") || q.includes("hidratacao") || q.includes("beber")) {
      const remaining = Math.max(0, parseFloat((waterGoalLiters - dailyWaterIntakeLiters).toFixed(1)));
      if (remaining > 0) {
        return {
          answer: `A hidratação ideal é o combustível da hipertrofia. O músculo é composto por 70% de água; um músculo desidratado perde até 15% de sua força contrátil e fica propenso a cãibras. Seu consumo atual é de ${dailyWaterIntakeLiters}L.`,
          actionableTip: `Falta beber exatamente **${remaining} Litros** hoje para atingir sua meta metabólica de ${waterGoalLiters}L. Beba 2 copos de 300ml até o início do treino!`,
          motivationLevel: "RESTORATIVE"
        };
      }
      return {
        answer: `Excelente trabalho de hidratação, ${student.name}! Você já alcançou sua meta diária de ${waterGoalLiters}L de água.`,
        actionableTip: "Continue bebendo em pequenos goles durante as séries para repor os eletrólitos perdidos pelo suor.",
        motivationLevel: "HIGH"
      };
    }

    // --- QUESTION 5: HOME WORKOUT ("Treino em casa hoje?") ---
    if (q.includes("casa") || q.includes("viajar") || q.includes("sem academia")) {
      return {
        answer: `Sim, é totalmente possível treinar em casa e manter os estímulos de hipertrofia! Substituiremos a sobrecarga externa de ferro pelo estresse mecânico gerado pelo peso corporal (calistenia), focando em maior tempo sob tensão (cadência super lenta de 4s na descida).`,
        actionableTip: "Faça flexões de braço no solo (ou com mãos apoiadas no sofá), agachamento livre lento e afundo unilateral. Faça séries até a falha muscular completa.",
        motivationLevel: "RESTORATIVE"
      };
    }

    // --- QUESTION 6: PROGRESS TO GOAL ("Quanto falta para minha meta?") ---
    if (q.includes("meta") || q.includes("objetivo") || q.includes("progresso") || q.includes("evolu")) {
      const targetBf = student.gender === "feminino" ? 18 : 10;
      const currentBf = student.bodyFat || 14.5;
      const diff = Math.max(0, currentBf - targetBf);

      if (diff > 0) {
        return {
          answer: `Seu progresso tem sido fantástico, ${student.name}! Para atingir sua meta de condicionamento estético avançado (BF de referência de ${targetBf}%), faltam aproximadamente ${diff.toFixed(1)}% de gordura corporal.`,
          actionableTip: "Mantenha a consistência impecável de 4 treinos por semana e siga rigorosamente o plano alimentar (especialmente a restrição de refeições livres de meio de semana). Cada dia conta!",
          motivationLevel: "HIGH"
        };
      }
      return {
        answer: `Parabéns extraordinários, ${student.name}! Seus índices antropométricos atuais já alcançaram os padrões de elite compatíveis com sua meta!`,
        actionableTip: "Seu foco agora deve ser na manutenção da densidade muscular adquirida e refinamento das simetrias musculares finas.",
        motivationLevel: "HIGH"
      };
    }

    // --- DEFAULT RESPONSE ---
    return {
      answer: `Fala, ${student.name}! Sou seu IA Coach pessoal. Estou aqui para responder qualquer dúvida sobre postura, técnicas de intensidade (como drop-sets ou rest-pause), nutrição, hidratação ou cansaço para que você extraia 100% de performance de cada repetição hoje!`,
      actionableTip: "Você pode me perguntar coisas como: 'Dormi mal. O que muda?', 'Como faço agachamento?', ou 'Hoje devo aumentar carga no supino?'. Bora esmagar!",
      motivationLevel: "HIGH"
    };
  }
}
