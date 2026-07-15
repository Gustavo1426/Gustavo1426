/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Student {
  id: string;
  name: string;
  email: string;
  phone: string;
  plan: string;
  status: "active" | "inactive" | "pending_renewal";
  avatarColor: string;
  initials: string;
  missedDays: number; // Days since last workout
  renewalDays: number; // Days until plan renewal
  lastTrainingDate: string;
  currentPhase: string; // e.g., "Hipertrofia", "Definição", "Adaptação"
  joinedDate: string;
  weight?: number;
  height?: number;
  age?: number;
  birthDate?: string;
  gender?: "masculino" | "feminino";
  limitations?: string;
  observations?: string;
  objective?: string;
  workoutUpdatedDate?: string; // Date of last workout sheet update
  physicalEvaluationDate?: string; // Date of last physical evaluation
  hasPhysicalEvaluation?: boolean;
  renewalDueDate?: string; // Plan expiration date
  bodyFat?: number;
  muscleMass?: number;
  password?: string;
  photoUrl?: string;
}

export interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: string; // e.g., "12", "10-12", "FALHA"
  weight: number; // in kg
  notes?: string;
  category?: "musculacao" | "funcional";
  division?: string; // e.g., "A", "B", "C", "D"
  muscleGroup?: string; // e.g., "Quadríceps", "Costas"
  advancedTechnique?: string; // e.g., "Drop-set", "Rest-pause", "Bi-set", "Super-série", "FST-7", "Ponto Zero", etc.
  techniqueSetTarget?: number[]; // indices of sets (1-indexed) where the advanced technique is applied, e.g. [4] for 4th set
  studentWeights?: Record<number, number>; // student-filled weights per set index (1-indexed), e.g. {1: 15, 2: 15, 3: 17}
}

export interface Workout {
  id: string;
  studentId: string;
  name: string; // e.g., "Treino A - Superior"
  lastUpdated: string;
  exercises: Exercise[];
}

export interface Meal {
  id: string;
  name: string; // e.g., "Café da Manhã"
  time: string; // e.g., "08:00"
  foods: string[]; // e.g., ["3 Ovos inteiros", "1 Banana", "30g Aveia"]
  protein: number; // estimated protein in grams
  carbs: number; // estimated carbs in grams
  fat: number; // estimated fat in grams
  isFreeMeal?: boolean;
  freeMealKcal?: number;
  freeMealName?: string;
  freeMealDays?: string[]; // e.g., ["Sábado", "Domingo"]
  freeMealFoods?: { name: string; kcal: number }[];
}

export interface Diet {
  id: string;
  studentId: string;
  calorieTarget: number;
  proteinTarget: number;
  carbsTarget: number;
  fatTarget: number;
  lastUpdated: string;
  meals: Meal[];
}

export interface Payment {
  id: string;
  studentId: string;
  studentName: string;
  amount: number;
  dueDate: string;
  status: "paid" | "pending" | "overdue";
  paidDate?: string;
  plan: string;
}

export interface CoachSettings {
  name: string;
  email: string;
  avatarUrl: string;
  monthlyGoal: number;
  aiTone: "motivating" | "strict" | "academic" | "friendly";
  aiProvider?: "gemini" | "groq";
  accessPassword?: string;
  instagram?: string;
  whatsapp?: string;
  businessHoursStart?: string;
  businessHoursEnd?: string;
}

export interface Plan {
  id: string;
  name: string;
  price: number;
}
