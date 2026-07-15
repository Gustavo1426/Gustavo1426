import { Student, Workout, Diet, Payment, CoachSettings } from "../types";

export const INITIAL_STUDENTS: Student[] = [
  {
    id: "stud-seeded-gustavo",
    name: "Gustavo Mangabeira",
    email: "gustavoworkout85@gmail.com",
    phone: "(11) 99999-1111",
    plan: "Platinum",
    status: "active",
    avatarColor: "from-blue-500 to-indigo-600",
    initials: "GM",
    missedDays: 2,
    renewalDays: 45,
    lastTrainingDate: "2026-07-11",
    currentPhase: "Hipertrofia",
    joinedDate: "2026-01-10",
    weight: 78.5,
    height: 178,
    age: 26,
    gender: "masculino",
    limitations: "Leve desconforto no joelho esquerdo ao agachar",
    observations: "Focado em ganho de massa magra e melhora de simetria nos membros inferiores",
    objective: "Ganho de Massa",
    hasPhysicalEvaluation: true,
    physicalEvaluationDate: "2026-06-20",
    renewalDueDate: "2026-08-27",
    bodyFat: 12.5,
    muscleMass: 40.2
  },
  {
    id: "stud-seeded-camila",
    name: "Camila Fernandes",
    email: "camila.f@email.com",
    phone: "(11) 98888-2222",
    plan: "Elite Performance",
    status: "active",
    avatarColor: "from-pink-500 to-rose-600",
    initials: "CF",
    missedDays: 0,
    renewalDays: 12,
    lastTrainingDate: "2026-07-13",
    currentPhase: "Definição",
    joinedDate: "2025-09-15",
    weight: 62.0,
    height: 165,
    age: 29,
    gender: "feminino",
    limitations: "Nenhuma limitação relatada",
    observations: "Constância excelente, responde muito bem a treinos de alta densidade",
    objective: "Definição Muscular",
    hasPhysicalEvaluation: true,
    physicalEvaluationDate: "2026-07-02",
    renewalDueDate: "2026-07-25",
    bodyFat: 18.2,
    muscleMass: 27.5
  },
  {
    id: "stud-seeded-ricardo",
    name: "Ricardo Oliveira",
    email: "ricardo.oliveira@email.com",
    phone: "(11) 97777-3333",
    plan: "Basic",
    status: "active",
    avatarColor: "from-amber-500 to-orange-600",
    initials: "RO",
    missedDays: 6,
    renewalDays: 2,
    lastTrainingDate: "2026-07-07",
    currentPhase: "Adaptação",
    joinedDate: "2026-05-18",
    weight: 84.5,
    height: 182,
    age: 34,
    gender: "masculino",
    limitations: "Leve fisgada na porção anterior do deltoide",
    observations: "Retornando aos treinos após período de viagens frequentes",
    objective: "Recondicionamento",
    hasPhysicalEvaluation: true,
    physicalEvaluationDate: "2026-05-20",
    renewalDueDate: "2026-07-15",
    bodyFat: 21.4,
    muscleMass: 38.1
  }
];

export const INITIAL_WORKOUTS: Workout[] = [
  {
    id: "workout-gustavo-a",
    studentId: "stud-seeded-gustavo",
    name: "Treino A - Peito & Tríceps",
    lastUpdated: "2026-07-10",
    exercises: [
      {
        id: "ex-g-1",
        name: "Supino Reto com Barra",
        sets: 4,
        reps: "8-10",
        weight: 35,
        muscleGroup: "Peito",
        category: "musculacao"
      },
      {
        id: "ex-g-2",
        name: "Crucifixo Inclinado com Halteres",
        sets: 3,
        reps: "10-12",
        weight: 22,
        muscleGroup: "Peito",
        category: "musculacao"
      },
      {
        id: "ex-g-3",
        name: "Tríceps Pulley",
        sets: 4,
        reps: "12",
        weight: 25,
        muscleGroup: "Tríceps",
        category: "musculacao"
      }
    ]
  },
  {
    id: "workout-camila-a",
    studentId: "stud-seeded-camila",
    name: "Treino A - Quadríceps & Glúteos",
    lastUpdated: "2026-07-02",
    exercises: [
      {
        id: "ex-c-1",
        name: "Agachamento Livre",
        sets: 4,
        reps: "10",
        weight: 40,
        muscleGroup: "Quadríceps",
        category: "musculacao",
        advancedTechnique: "Ponto Zero"
      },
      {
        id: "ex-c-2",
        name: "Leg Press 45º",
        sets: 4,
        reps: "12",
        weight: 120,
        muscleGroup: "Quadríceps",
        category: "musculacao"
      },
      {
        id: "ex-c-3",
        name: "Elevação Pélvica",
        sets: 4,
        reps: "10-12",
        weight: 60,
        muscleGroup: "Glúteos",
        category: "musculacao"
      }
    ]
  },
  {
    id: "workout-ricardo-a",
    studentId: "stud-seeded-ricardo",
    name: "Treino A - Dorsal & Bíceps",
    lastUpdated: "2026-05-19",
    exercises: [
      {
        id: "ex-r-1",
        name: "Puxada Alta",
        sets: 4,
        reps: "10-12",
        weight: 55,
        muscleGroup: "Costas",
        category: "musculacao"
      },
      {
        id: "ex-r-2",
        name: "Remada Curvada com Barra",
        sets: 3,
        reps: "10",
        weight: 30,
        muscleGroup: "Costas",
        category: "musculacao"
      },
      {
        id: "ex-r-3",
        name: "Rosca Direta",
        sets: 3,
        reps: "12",
        weight: 12,
        muscleGroup: "Bíceps",
        category: "musculacao"
      }
    ]
  }
];

export const INITIAL_DIETS: Diet[] = [
  {
    id: "diet-seeded-gustavo",
    studentId: "stud-seeded-gustavo",
    calorieTarget: 2900,
    proteinTarget: 165,
    carbsTarget: 380,
    fatTarget: 75,
    lastUpdated: "2026-06-21",
    meals: [
      {
        id: "m-g-diet-1",
        name: "Café da Manhã",
        time: "07:30",
        foods: ["4 Ovos mexidos", "3 Fatias de pão de forma", "1 Banana", "30g de Aveia"],
        protein: 32,
        carbs: 65,
        fat: 22
      },
      {
        id: "m-g-diet-2",
        name: "Almoço",
        time: "12:30",
        foods: ["200g de Peito de frango grelhado", "300g de Arroz branco", "100g de Feijão carioca", "Salada à vontade"],
        protein: 64,
        carbs: 95,
        fat: 10
      },
      {
        id: "m-g-diet-3",
        name: "Lanche da Tarde",
        time: "16:00",
        foods: ["30g de Whey Protein", "40g de Aveia em flocos", "20g de Pasta de amendoim"],
        protein: 30,
        carbs: 35,
        fat: 15
      },
      {
        id: "m-g-diet-4",
        name: "Jantar",
        time: "20:00",
        foods: ["200g de Carne moída magra (patinho)", "300g de Mandioca cozida", "Legumes no vapor"],
        protein: 58,
        carbs: 90,
        fat: 14
      }
    ]
  },
  {
    id: "diet-seeded-camila",
    studentId: "stud-seeded-camila",
    calorieTarget: 1800,
    proteinTarget: 130,
    carbsTarget: 180,
    fatTarget: 50,
    lastUpdated: "2026-07-03",
    meals: [
      {
        id: "m-c-diet-1",
        name: "Desjejum",
        time: "07:00",
        foods: ["3 Ovos inteiros", "1 Fatia de pão integral", "1 Mamão papaia pequeno"],
        protein: 24,
        carbs: 25,
        fat: 16
      },
      {
        id: "m-c-diet-2",
        name: "Almoço",
        time: "12:00",
        foods: ["150g de Filé de peixe (tilápia)", "150g de Batata doce cozida", "Mix de folhas verdes", "1 colher de sopa de Azeite"],
        protein: 35,
        carbs: 30,
        fat: 13
      },
      {
        id: "m-c-diet-3",
        name: "Lanche da Tarde",
        time: "15:30",
        foods: ["150g de Iogurte desnatado", "30g de Whey Protein", "15g de Amêndoas"],
        protein: 33,
        carbs: 12,
        fat: 9
      },
      {
        id: "m-c-diet-4",
        name: "Jantar",
        time: "19:30",
        foods: ["120g de Peito de frango desfiado", "150g de Arroz integral", "Brócolis e cenoura grelhados"],
        protein: 38,
        carbs: 40,
        fat: 6
      }
    ]
  },
  {
    id: "diet-seeded-ricardo",
    studentId: "stud-seeded-ricardo",
    calorieTarget: 2200,
    proteinTarget: 155,
    carbsTarget: 240,
    fatTarget: 70,
    lastUpdated: "2026-05-20",
    meals: [
      {
        id: "m-r-diet-1",
        name: "Café da Manhã",
        time: "08:00",
        foods: ["3 Ovos inteiros mexidos", "2 Fatias de pão de forma", "Café sem açúcar"],
        protein: 22,
        carbs: 28,
        fat: 16
      },
      {
        id: "m-r-diet-2",
        name: "Almoço",
        time: "13:00",
        foods: ["180g de Filé de peito de frango", "250g de Arroz branco", "100g de Feijão", "Salada de tomate"],
        protein: 55,
        carbs: 75,
        fat: 10
      },
      {
        id: "m-r-diet-3",
        name: "Lanche da Tarde",
        time: "17:00",
        foods: ["2 fatias de pão integral", "60g de Atum sólido", "1 fatia de Queijo minas frescal"],
        protein: 25,
        carbs: 28,
        fat: 12
      },
      {
        id: "m-r-diet-4",
        name: "Jantar",
        time: "21:00",
        foods: ["150g de Carne bovina grelhada", "200g de Batata inglesa cozida", "Legumes cozidos"],
        protein: 42,
        carbs: 45,
        fat: 14
      }
    ]
  }
];

export const INITIAL_PAYMENTS: Payment[] = [
  {
    id: "pay-seeded-gustavo-1",
    studentId: "stud-seeded-gustavo",
    studentName: "Gustavo Mangabeira",
    amount: 299.90,
    dueDate: "2026-08-27",
    status: "paid",
    paidDate: "2026-07-27",
    plan: "Platinum"
  },
  {
    id: "pay-seeded-camila-1",
    studentId: "stud-seeded-camila",
    studentName: "Camila Fernandes",
    amount: 499.90,
    dueDate: "2026-07-25",
    status: "pending",
    plan: "Elite Performance"
  },
  {
    id: "pay-seeded-ricardo-1",
    studentId: "stud-seeded-ricardo",
    studentName: "Ricardo Oliveira",
    amount: 149.90,
    dueDate: "2026-07-15",
    status: "overdue",
    plan: "Basic"
  }
];

export const INITIAL_COACH_SETTINGS: CoachSettings = {
  name: "Coach Rodrigo",
  email: "rodrigo.coach@treinopro.com.br",
  avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=256&auto=format&fit=crop",
  monthlyGoal: 5000,
  aiTone: "motivating",
  aiProvider: "gemini",
  accessPassword: "123"
};
