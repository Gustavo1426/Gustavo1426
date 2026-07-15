import React, { useState, useMemo, useEffect } from "react";
import { 
  Utensils, 
  Plus, 
  Trash2, 
  Save, 
  Clock, 
  Flame, 
  Sparkles,
  Apple,
  X,
  AlertTriangle,
  ChevronRight,
  Sparkle,
  Dumbbell,
  Scale
} from "lucide-react";
import { Student, Diet, Meal } from "../../../../types";
import ConfirmModal from "../../../../shared/presentation/components/ConfirmModal";

interface DietaFlexibilidadeProps {
  currentStudent: Student;
  activeDiet: Diet | null;
  onSaveDiet: (studentId: string, calorieTarget: number, proteinTarget: number, carbsTarget: number, fatTarget: number, meals: Meal[]) => void;
  onSaveAndAdvance?: () => void;
}

export default function DietaFlexibilidade({
  currentStudent,
  activeDiet,
  onSaveDiet,
  onSaveAndAdvance
}: DietaFlexibilidadeProps) {
  const [focus, setFocus] = useState<"perda" | "ganho" | "manutencao">("perda");
  const [calorieTarget, setCalorieTarget] = useState(activeDiet?.calorieTarget || 2000);
  const [proteinTarget, setProteinTarget] = useState(activeDiet?.proteinTarget || 150);
  const [carbsTarget, setCarbsTarget] = useState(activeDiet?.carbsTarget || 220);
  const [fatTarget, setFatTarget] = useState(activeDiet?.fatTarget || 65);
  const [meals, setMeals] = useState<Meal[]>(activeDiet?.meals || []);
  
  // Local state for interactive toasts/notifications (iframe friendly)
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "info" | "warning";
    title?: string;
  } | null>(null);

  const showNotification = (message: string, type: "success" | "info" | "warning" = "info", title?: string) => {
    setToast({ message, type, title });
    setTimeout(() => {
      setToast(prev => prev && prev.message === message ? null : prev);
    }, 6000);
  };

  // 🆕 Step 3.1: Number of meals visual stepper
  const [numMeals, setNumMeals] = useState<number>(4);

  // 🆕 Step 3.1: Allergies & Intolerances tags
  const [alergias, setAlergias] = useState<string[]>(["Lactose"]);
  const [novaAlergia, setNovaAlergia] = useState("");
  
  // 🆕 Step 3.1: Disliked foods tags
  const [naoCome, setNaoCome] = useState<string[]>(["Fígado"]);
  const [novoNaoCome, setNovoNaoCome] = useState("");

  // Day-of-Week & Cheat/Free Meals state
  const [selectedDayOfWeek, setSelectedDayOfWeek] = useState<string>("Sábado");
  const [editingFreeMealId, setEditingFreeMealId] = useState<string | null>(null);
  const [tempFreeMealName, setTempFreeMealName] = useState("");
  const [tempFreeMealKcal, setTempFreeMealKcal] = useState(500);
  const [tempFreeMealDays, setTempFreeMealDays] = useState<string[]>([]);
  const [tempFreeMealFoods, setTempFreeMealFoods] = useState<{ name: string; kcal: number }[]>([]);

  const initializeTempFoods = (m: Meal, defaultName: string, defaultKcal: number) => {
    if (m.freeMealFoods && m.freeMealFoods.length > 0) {
      return m.freeMealFoods.map(f => ({ ...f }));
    }
    if (m.freeMealName) {
      const parts = m.freeMealName.split(" + ");
      if (parts.length > 1) {
        const partKcal = Math.round((m.freeMealKcal || defaultKcal) / parts.length);
        return parts.map(part => ({ name: part.trim(), kcal: partKcal }));
      }
      return [{ name: m.freeMealName, kcal: m.freeMealKcal || defaultKcal }];
    }
    return [{ name: defaultName, kcal: defaultKcal }];
  };

  const daysOfWeek = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo"];

  const handleUpdateFreeMealConfig = (
    mealId: string, 
    isFree: boolean, 
    name?: string, 
    kcal?: number, 
    days?: string[],
    foods?: { name: string; kcal: number }[]
  ) => {
    let finalName = name;
    let finalKcal = kcal;
    if (isFree && foods && foods.length > 0) {
      finalName = foods.map(f => f.name.trim()).filter(Boolean).join(" + ");
      finalKcal = foods.reduce((sum, f) => sum + (Number(f.kcal) || 0), 0);
    }

    setMeals(prevMeals => prevMeals.map(m => {
      if (m.id === mealId) {
        return {
          ...m,
          isFreeMeal: isFree,
          freeMealName: isFree ? finalName : undefined,
          freeMealKcal: isFree ? finalKcal : undefined,
          freeMealDays: isFree ? days : undefined,
          freeMealFoods: isFree ? foods : undefined
        };
      }
      return m;
    }));
    showNotification(
      isFree 
        ? `Refeição livre "${finalName}" (${finalKcal} kcal) configurada para os dias selecionados! As outras refeições foram ajustadas automaticamente.` 
        : `Refeição livre desativada. As calorias foram redistribuídas de volta.`,
      "success",
      isFree ? "Dieta Ajustada" : "Plano Restaurado"
    );
  };

  // Form states for manually adding meals
  const [mealName, setMealName] = useState("Café da Manhã");
  const [mealTime, setMealTime] = useState("08:00");
  const [mealFoods, setMealFoods] = useState("");
  const [mealProtein, setMealProtein] = useState(30);
  const [mealCarbs, setMealCarbs] = useState(40);
  const [mealFat, setMealFat] = useState(10);

  const [aiGenerating, setAiGenerating] = useState(false);

  // Initial load from draft or activeDiet
  useEffect(() => {
    if (!currentStudent?.id) return;
    const draftKey = `treinopro_draft_diet_${currentStudent.id}`;
    const draftSaved = localStorage.getItem(draftKey);
    if (draftSaved) {
      try {
        const parsed = JSON.parse(draftSaved) as Diet;
        setCalorieTarget(parsed.calorieTarget);
        setProteinTarget(parsed.proteinTarget);
        setCarbsTarget(parsed.carbsTarget);
        setFatTarget(parsed.fatTarget);
        setMeals(parsed.meals);
        if (parsed.meals.length >= 3 && parsed.meals.length <= 6) {
          setNumMeals(parsed.meals.length);
        }
        return;
      } catch (e) {
        console.error("Error parsing diet draft", e);
      }
    }

    if (activeDiet) {
      setCalorieTarget(activeDiet.calorieTarget);
      setProteinTarget(activeDiet.proteinTarget);
      setCarbsTarget(activeDiet.carbsTarget);
      setFatTarget(activeDiet.fatTarget);
      setMeals(activeDiet.meals);
      if (activeDiet.meals.length >= 3 && activeDiet.meals.length <= 6) {
        setNumMeals(activeDiet.meals.length);
      }
    } else {
      const isPerda = focus === "perda";
      const isGanho = focus === "ganho";
      setCalorieTarget(isPerda ? 1750 : isGanho ? 2850 : 2200);
      setProteinTarget(isPerda ? 145 : isGanho ? 185 : 155);
      setCarbsTarget(isPerda ? 150 : isGanho ? 370 : 250);
      setFatTarget(isPerda ? 55 : isGanho ? 75 : 65);
      setMeals([]);
    }
  }, [activeDiet, currentStudent, focus]);

  const presetSuggestions = [
    { name: "🍕 Fatia de Pizza", kcal: 300 },
    { name: "🍔 Hambúrguer Simples", kcal: 450 },
    { name: "🍟 Batata Frita Pequena", kcal: 250 },
    { name: "🍫 Chocolate (50g)", kcal: 270 },
    { name: "🥤 Refrigerante (Lata)", kcal: 140 }
  ];

  const commonAllergies = ["Lactose", "Glúten", "Amendoim", "Frutos do Mar", "Ovo", "Soja"];
  const commonDislikes = ["Fígado", "Beterraba", "Cebola", "Coentro", "Pimentão", "Peixe", "Berinjela"];

  // Dynamic computed meals and macros for the selected day of the week
  const mealsForSelectedDay = useMemo(() => {
    // Identify meals that are marked as a free meal for the selected day
    const activeFreeMeals = meals.filter(m => m.isFreeMeal && m.freeMealDays?.includes(selectedDayOfWeek));
    const totalFreeKcal = activeFreeMeals.reduce((acc, m) => acc + (m.freeMealKcal || 0), 0);
    
    const cleanMeals = meals.filter(m => !(m.isFreeMeal && m.freeMealDays?.includes(selectedDayOfWeek)));
    const totalCleanOriginalKcal = cleanMeals.reduce((acc, m) => acc + (m.protein * 4 + m.carbs * 4 + m.fat * 9), 0);
    
    // Remaining calorie budget for the clean meals
    const remainingCleanKcal = Math.max(0, calorieTarget - totalFreeKcal);
    const scaleFactor = totalCleanOriginalKcal > 0 ? remainingCleanKcal / totalCleanOriginalKcal : 1;
    
    return meals.map(m => {
      const isFreeOnThisDay = m.isFreeMeal && m.freeMealDays?.includes(selectedDayOfWeek);
      if (isFreeOnThisDay) {
        const kcal = m.freeMealKcal || 0;
        // Estimate junk macros: 10% protein, 55% carbs, 35% fat
        const protein = Math.round((kcal * 0.10) / 4);
        const carbs = Math.round((kcal * 0.55) / 4);
        const fat = Math.round((kcal * 0.35) / 9);
        return {
          ...m,
          foods: [`🍕 REFEIÇÃO LIVRE: ${m.freeMealName || "Junk Food"} (${kcal} kcal)`],
          protein,
          carbs,
          fat,
          _actualIsFree: true,
          _reductionPercentage: 0
        };
      } else {
        const originalKcal = m.protein * 4 + m.carbs * 4 + m.fat * 9;
        if (originalKcal === 0) return { ...m, _actualIsFree: false, _reductionPercentage: 0 };
        
        const protein = Math.max(0, Math.round(m.protein * scaleFactor));
        const carbs = Math.max(0, Math.round(m.carbs * scaleFactor));
        const fat = Math.max(0, Math.round(m.fat * scaleFactor));
        
        // Dynamically adjust weight mentions in food texts (e.g. "150g" -> "112g")
        const adjustedFoods = m.foods.map(food => {
          return food.replace(/^(\d+)\s*(g|gr|ml|ml)\b/i, (match, amount, unit) => {
            const scaledAmount = Math.round(Number(amount) * scaleFactor);
            return `${scaledAmount}${unit}`;
          });
        });

        const reductionPercentage = Math.round((1 - scaleFactor) * 100);

        return {
          ...m,
          foods: adjustedFoods,
          protein,
          carbs,
          fat,
          _actualIsFree: false,
          _reductionPercentage: reductionPercentage > 0 ? reductionPercentage : 0
        };
      }
    });
  }, [meals, selectedDayOfWeek, calorieTarget]);

  const currentDayFreeMeals = useMemo(() => {
    return meals.filter(m => m.isFreeMeal && m.freeMealDays?.includes(selectedDayOfWeek));
  }, [meals, selectedDayOfWeek]);

  const currentDayFreeKcal = useMemo(() => {
    return currentDayFreeMeals.reduce((acc, m) => acc + (m.freeMealKcal || 0), 0);
  }, [currentDayFreeMeals]);

  const handleAddMeal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mealName || !mealFoods) return;
    const parsedFoods = mealFoods.split(/[\n,]+/).map(f => f.trim()).filter(Boolean);
    const newMeal: Meal = {
      id: `meal-${Date.now()}`,
      name: mealName,
      time: mealTime || "12:00",
      foods: parsedFoods,
      protein: Number(mealProtein),
      carbs: Number(mealCarbs),
      fat: Number(mealFat)
    };
    setMeals([...meals, newMeal]);
    setMealFoods("");
    showNotification(`Refeição "${mealName}" adicionada com sucesso!`, "success", "Refeição Criada");
  };

  // Delete meal states
  const [isConfirmMealDeleteOpen, setIsConfirmMealDeleteOpen] = useState(false);
  const [mealToDeleteId, setMealToDeleteId] = useState<string | null>(null);
  const [mealToDeleteName, setMealToDeleteName] = useState("");

  const handleRemoveMeal = (id: string) => {
    const meal = meals.find(m => m.id === id);
    const mealName = meal ? meal.name : "esta refeição";
    setMealToDeleteId(id);
    setMealToDeleteName(mealName);
    setIsConfirmMealDeleteOpen(true);
  };

  const confirmDeleteMeal = () => {
    if (mealToDeleteId) {
      setMeals(meals.filter(m => m.id !== mealToDeleteId));
      showNotification("Refeição removida do plano alimentar.", "info", "Refeição Excluída");
    }
    setIsConfirmMealDeleteOpen(false);
    setMealToDeleteId(null);
  };

  const handleSave = () => {
    const draftDiet: Diet = {
      id: `diet-${currentStudent.id}-draft`,
      studentId: currentStudent.id,
      calorieTarget,
      proteinTarget,
      carbsTarget,
      fatTarget,
      lastUpdated: new Date().toLocaleDateString("pt-BR"),
      meals
    };
    try {
      localStorage.setItem(`treinopro_draft_diet_${currentStudent.id}`, JSON.stringify(draftDiet));
      showNotification("Rascunho do plano alimentar de " + currentStudent.name + " salvo com sucesso!", "success", "Rascunho Salvo");
    } catch (e) {
      console.error("Error saving diet draft", e);
    }
    
    if (onSaveAndAdvance) {
      onSaveAndAdvance();
    }
  };

  // 🆕 Step 3.2: AI Prescription Generator
  const handleAiPrescribe = () => {
    setAiGenerating(true);
    setTimeout(() => {
      setAiGenerating(false);

      // Distribute targets according to focus
      const totalKcal = focus === "perda" ? 1750 : focus === "ganho" ? 2850 : 2200;
      const totalProtein = focus === "perda" ? 145 : focus === "ganho" ? 185 : 155;
      const totalCarbs = focus === "perda" ? 150 : focus === "ganho" ? 370 : 250;
      const totalFat = focus === "perda" ? 55 : focus === "ganho" ? 75 : 65;

      const protPerMeal = Math.round(totalProtein / numMeals);
      const carbsPerMeal = Math.round(totalCarbs / numMeals);
      const fatPerMeal = Math.round(totalFat / numMeals);

      const mealNamesByCount: Record<number, string[]> = {
        3: ["Café da Manhã", "Almoço", "Jantar"],
        4: ["Café da Manhã", "Almoço", "Lanche da Tarde", "Jantar"],
        5: ["Café da Manhã", "Almoço", "Lanche 1", "Lanche 2", "Jantar"],
        6: ["Café da Manhã", "Colação", "Almoço", "Lanche 1", "Lanche 2", "Jantar"]
      };

      const mealTimesByCount: Record<number, string[]> = {
        3: ["08:00", "12:30", "20:00"],
        4: ["08:00", "12:30", "16:00", "20:00"],
        5: ["08:00", "12:30", "15:30", "18:30", "21:00"],
        6: ["07:30", "10:00", "12:30", "15:30", "18:30", "21:30"]
      };

      const names = mealNamesByCount[numMeals] || ["Refeição 1", "Refeição 2", "Refeição 3", "Refeição 4"];
      const times = mealTimesByCount[numMeals] || ["08:00", "12:00", "16:00", "20:00"];

      // Check exclusions helper
      const isExcluded = (item: string) => {
        const lower = item.toLowerCase();
        return (
          alergias.some(a => lower.includes(a.toLowerCase())) ||
          naoCome.some(n => lower.includes(n.toLowerCase()))
        );
      };

      const getSafeFood = (category: string, fallback: string) => {
        const database: Record<string, string[]> = {
          carb_breakfast: ["Pão integral", "Aveia em flocos", "Tapioca", "Batata doce doce", "Fruta variada (Mamão/Banana)"],
          protein_breakfast: ["Ovos mexidos", "Whey Protein", "Claras de ovo", "Queijo cottage", "Iogurte desnatado"],
          carb_lunch: ["Arroz integral", "Purê de batata doce", "Arroz branco", "Mandioquinha", "Macarrão integral"],
          protein_lunch: ["Peito de frango grelhado", "Filé de tilápia", "Carne moída magra (Patinho)", "Atum em lata", "Lombo de porco magro"],
          greens: ["Brócolis", "Salada verde (Alface/Rúcula)", "Aspargos", "Vagem", "Abobrinha grelhada"],
          fat: ["Azeite de oliva", "Pasta de amendoim", "Castanhas de caju", "Abacate", "Gema de ovo"]
        };

        const list = database[category] || [fallback];
        const filtered = list.filter(item => !isExcluded(item));
        return filtered.length > 0 ? filtered[Math.floor(Math.random() * filtered.length)] : fallback;
      };

      const generated: Meal[] = [];
      for (let i = 0; i < numMeals; i++) {
        const mName = names[i];
        let foodsList: string[] = [];

        if (mName.includes("Café") || mName.includes("Colação")) {
          const prot = getSafeFood("protein_breakfast", "Claras de ovos");
          const carb = getSafeFood("carb_breakfast", "Pão integral");
          foodsList = [`3x ${prot}`, `50g ${carb}`, `100g Frutas frescas`];
        } else if (mName.includes("Almoço") || mName.includes("Jantar")) {
          const prot = getSafeFood("protein_lunch", "Peito de frango");
          const carb = getSafeFood("carb_lunch", "Arroz integral");
          const green = getSafeFood("greens", "Brócolis");
          foodsList = [`150g ${prot}`, `120g ${carb}`, `Porção de ${green} no vapor`];
        } else {
          // Snacks
          const prot = getSafeFood("protein_breakfast", "Whey Protein");
          const fat = getSafeFood("fat", "Castanhas");
          foodsList = [`30g ${prot}`, `1x Banana prata`, `20g de ${fat}`];
        }

        generated.push({
          id: `meal-${Date.now()}-${i}`,
          name: mName,
          time: times[i],
          foods: foodsList,
          protein: protPerMeal,
          carbs: carbsPerMeal,
          fat: fatPerMeal
        });
      }

      setMeals(generated);
      setCalorieTarget(totalKcal);
      setProteinTarget(totalProtein);
      setCarbsTarget(totalCarbs);
      setFatTarget(totalFat);
    }, 1500);
  };

  const calculatedPrescribedKcal = useMemo(() => {
    return meals.reduce((acc, m) => acc + (m.protein * 4 + m.carbs * 4 + m.fat * 9), 0);
  }, [meals]);

  return (
    <div className="space-y-6">
      
      {/* Toast Notifications */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 max-w-sm bg-[#111214] border-2 border-emerald-500/30 text-white rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.5)] p-4 flex flex-col gap-1 animate-in slide-in-from-bottom duration-300">
          <div className="flex justify-between items-center">
            <span className={`font-bold font-mono text-xs uppercase tracking-wider flex items-center gap-1.5 ${
              toast.type === "success" ? "text-emerald-400" : toast.type === "warning" ? "text-amber-500" : "text-cyan-400"
            }`}>
              {toast.type === "success" ? "✓" : "i"} {toast.title || "Notificação"}
            </span>
            <button onClick={() => setToast(null)} className="text-gray-500 hover:text-white text-xs font-bold font-mono p-1">✖</button>
          </div>
          <p className="text-xs text-gray-300 leading-relaxed font-mono">{toast.message}</p>
        </div>
      )}
      <div className="border-b border-[#3a494b]/20 pb-4">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          🍏 Prescrição Nutricional com IA
        </h3>
        <p className="text-xs text-[#b9cacb] mt-1 font-mono">
          Monte o plano alimentar calculando macros, refeições e filtrando alergias de forma totalmente inteligente.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          
          {/* Strategy config */}
          <div className="glass-panel p-5 rounded-xl space-y-5">
            <h4 className="font-bold text-xs uppercase tracking-wider text-[#ccff00] font-mono flex items-center gap-1.5">
              <Sparkle className="w-4 h-4 text-[#ccff00]" /> 1. Estratégia e Metas Nutritivas
            </h4>
            
            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setFocus("perda")}
                className={`py-2.5 rounded-lg font-bold font-mono text-xs border transition-all cursor-pointer ${
                  focus === "perda" 
                    ? "bg-[#00f2ff]/10 text-[#00f2ff] border-[#00f2ff]" 
                    : "bg-[#121315] border-gray-800 text-[#b9cacb]"
                }`}
              >
                <span className="flex items-center justify-center gap-1.5">
                  <Flame className="w-3.5 h-3.5" /> Perda Peso
                </span>
              </button>
              <button
                type="button"
                onClick={() => setFocus("ganho")}
                className={`py-2.5 rounded-lg font-bold font-mono text-xs border transition-all cursor-pointer ${
                  focus === "ganho" 
                    ? "bg-[#ccff00]/10 text-[#ccff00] border-[#ccff00]" 
                    : "bg-[#121315] border-gray-800 text-[#b9cacb]"
                }`}
              >
                <span className="flex items-center justify-center gap-1.5">
                  <Dumbbell className="w-3.5 h-3.5" /> Ganho Massa
                </span>
              </button>
              <button
                type="button"
                onClick={() => setFocus("manutencao")}
                className={`py-2.5 rounded-lg font-bold font-mono text-xs border transition-all cursor-pointer ${
                  focus === "manutencao" 
                    ? "bg-amber-500/10 text-amber-400 border-amber-500" 
                    : "bg-[#121315] border-gray-800 text-[#b9cacb]"
                }`}
              >
                <span className="flex items-center justify-center gap-1.5">
                  <Scale className="w-3.5 h-3.5" /> Manutenção
                </span>
              </button>
            </div>

            {/* Meal Count Stepper */}
            <div className="bg-[#121315] p-4 rounded-xl border border-gray-800 flex justify-between items-center font-mono">
              <div>
                <span className="text-[10px] text-gray-500 uppercase block font-bold">Quantidade de Refeições Diárias</span>
                <span className="text-xs text-gray-400 mt-1 block">Meta sugerida pela IA</span>
              </div>
              <div className="flex items-center gap-1 bg-[#1b1c1e] p-1 rounded-lg border border-gray-800">
                {[3, 4, 5, 6].map(num => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setNumMeals(num)}
                    className={`px-3 py-1.5 rounded text-xs font-bold transition-all cursor-pointer ${
                      numMeals === num 
                        ? "bg-[#ccff00] text-black" 
                        : "text-gray-500 hover:text-gray-300 hover:bg-gray-800/50"
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>

            {/* Allergies and Restrições Panel */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Alergias / Intolerâncias */}
              <div className="bg-[#121315]/80 p-4 rounded-xl border border-gray-800 space-y-3 font-mono">
                <span className="text-[10px] text-red-400 uppercase block font-bold">🚨 Alergias / Intolerâncias</span>
                
                {/* Clickable Quick Tags */}
                <div className="flex flex-wrap gap-1.5">
                  {commonAllergies.map(item => {
                    const active = alergias.includes(item);
                    return (
                      <button
                        key={item}
                        type="button"
                        onClick={() => {
                          if (active) {
                            setAlergias(alergias.filter(a => a !== item));
                          } else {
                            setAlergias([...alergias, item]);
                          }
                        }}
                        className={`text-[9px] px-2 py-1 rounded transition-all cursor-pointer border ${
                          active 
                            ? "bg-red-950/40 text-red-400 border-red-900/60 font-bold" 
                            : "bg-[#1b1c1e] text-gray-400 border-gray-800/80 hover:text-gray-300"
                        }`}
                      >
                        {item} {active && "✓"}
                      </button>
                    );
                  })}
                </div>

                {/* Custom input */}
                <div className="flex gap-1.5 pt-1.5">
                  <input
                    type="text"
                    placeholder="Outro..."
                    value={novaAlergia}
                    onChange={e => setNovaAlergia(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        if (novaAlergia.trim() && !alergias.includes(novaAlergia.trim())) {
                          setAlergias([...alergias, novaAlergia.trim()]);
                          setNovaAlergia("");
                        }
                      }
                    }}
                    className="flex-1 bg-[#1b1c1e] border border-gray-800 text-white rounded p-1 text-[10px] font-mono outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (novaAlergia.trim() && !alergias.includes(novaAlergia.trim())) {
                        setAlergias([...alergias, novaAlergia.trim()]);
                        setNovaAlergia("");
                      }
                    }}
                    className="bg-red-950/60 hover:bg-red-900/40 border border-red-900/40 text-red-400 font-bold px-2.5 rounded text-[10px] cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Alimentos que Não Come */}
              <div className="bg-[#121315]/80 p-4 rounded-xl border border-gray-800 space-y-3 font-mono">
                <span className="text-[10px] text-amber-500 uppercase block font-bold">🤢 Alimentos que NÃO come</span>
                
                {/* Clickable Quick Tags */}
                <div className="flex flex-wrap gap-1.5">
                  {commonDislikes.map(item => {
                    const active = naoCome.includes(item);
                    return (
                      <button
                        key={item}
                        type="button"
                        onClick={() => {
                          if (active) {
                            setNaoCome(naoCome.filter(n => n !== item));
                          } else {
                            setNaoCome([...naoCome, item]);
                          }
                        }}
                        className={`text-[9px] px-2 py-1 rounded transition-all cursor-pointer border ${
                          active 
                            ? "bg-amber-950/40 text-amber-400 border-amber-900/60 font-bold" 
                            : "bg-[#1b1c1e] text-gray-400 border-gray-800/80 hover:text-gray-300"
                        }`}
                      >
                        {item} {active && "✓"}
                      </button>
                    );
                  })}
                </div>

                {/* Custom input */}
                <div className="flex gap-1.5 pt-1.5">
                  <input
                    type="text"
                    placeholder="Outro..."
                    value={novoNaoCome}
                    onChange={e => setNovoNaoCome(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        if (novoNaoCome.trim() && !naoCome.includes(novoNaoCome.trim())) {
                          setNaoCome([...naoCome, novoNaoCome.trim()]);
                          setNovoNaoCome("");
                        }
                      }
                    }}
                    className="flex-1 bg-[#1b1c1e] border border-gray-800 text-white rounded p-1 text-[10px] font-mono outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (novoNaoCome.trim() && !naoCome.includes(novoNaoCome.trim())) {
                        setNaoCome([...naoCome, novoNaoCome.trim()]);
                        setNovoNaoCome("");
                      }
                    }}
                    className="bg-amber-950/60 hover:bg-amber-900/40 border border-amber-900/40 text-amber-400 font-bold px-2.5 rounded text-[10px] cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>

            </div>

            {/* Target calories & macros display */}
            <div className="bg-[#121315] p-4 rounded-xl border border-gray-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 font-mono">
              <div>
                <span className="text-[10px] text-gray-500 uppercase block font-bold">Alvo de Calorias Diárias</span>
                <span className="text-2xl font-bold text-white">{calorieTarget} kcal</span>
                <span className="text-[10px] text-gray-400 block mt-0.5">Definido com base na composição do aluno</span>
              </div>

              {/* Adjust offsets */}
              <div className="flex flex-wrap items-center gap-2">
                <button 
                  onClick={() => setCalorieTarget(p => Math.max(1000, p - 100))}
                  className="bg-gray-800 text-white w-8 h-8 rounded-lg flex items-center justify-center hover:bg-gray-700 font-bold font-mono text-sm cursor-pointer"
                >
                  -
                </button>
                <div className="flex gap-1 bg-[#1b1c1e] p-1 rounded-lg border border-gray-800">
                  {[-100, -50, 50, 100].map(val => (
                    <button
                      key={val}
                      onClick={() => setCalorieTarget(p => Math.max(1000, p + val))}
                      className="text-[9px] px-1.5 py-1 rounded bg-gray-800 text-gray-300 hover:text-white hover:bg-gray-700 cursor-pointer"
                    >
                      {val > 0 ? `+${val}` : val}
                    </button>
                  ))}
                </div>
                <button 
                  onClick={() => setCalorieTarget(p => p + 100)}
                  className="bg-gray-800 text-white w-8 h-8 rounded-lg flex items-center justify-center hover:bg-gray-700 font-bold font-mono text-sm cursor-pointer"
                >
                  +
                </button>
              </div>
            </div>

            {/* Macros Editor */}
            <div className="grid grid-cols-3 gap-3 text-xs font-mono">
              <div className="bg-[#121315] p-3 rounded-lg border border-gray-800 text-center">
                <span className="text-[#ccff00] font-bold block mb-1">Proteínas</span>
                <input 
                  type="number" 
                  value={proteinTarget} 
                  onChange={e => setProteinTarget(Number(e.target.value))}
                  className="bg-[#1b1c1e] text-white border border-gray-800 text-center rounded py-1 w-full text-xs font-bold focus:border-[#ccff00] outline-none"
                />
                <span className="text-[9px] text-gray-500 block mt-1">Prescrito: {meals.reduce((a,c) => a+c.protein, 0)}g</span>
              </div>
              <div className="bg-[#121315] p-3 rounded-lg border border-gray-800 text-center">
                <span className="text-cyan-400 font-bold block mb-1">Carboidratos</span>
                <input 
                  type="number" 
                  value={carbsTarget} 
                  onChange={e => setCarbsTarget(Number(e.target.value))}
                  className="bg-[#1b1c1e] text-white border border-gray-800 text-center rounded py-1 w-full text-xs font-bold focus:border-cyan-500 outline-none"
                />
                <span className="text-[9px] text-gray-500 block mt-1">Prescrito: {meals.reduce((a,c) => a+c.carbs, 0)}g</span>
              </div>
              <div className="bg-[#121315] p-3 rounded-lg border border-gray-800 text-center">
                <span className="text-amber-500 font-bold block mb-1">Gorduras</span>
                <input 
                  type="number" 
                  value={fatTarget} 
                  onChange={e => setFatTarget(Number(e.target.value))}
                  className="bg-[#1b1c1e] text-white border border-gray-800 text-center rounded py-1 w-full text-xs font-bold focus:border-amber-500 outline-none"
                />
                <span className="text-[9px] text-gray-500 block mt-1">Prescrito: {meals.reduce((a,c) => a+c.fat, 0)}g</span>
              </div>
            </div>

            {/* 🆕 STEP 3.2: AI MOTOR CALL */}
            <div className="pt-2 border-t border-gray-900">
              <button
                type="button"
                onClick={handleAiPrescribe}
                disabled={aiGenerating}
                className="w-full bg-[#ccff00]/10 hover:bg-[#ccff00]/20 text-[#ccff00] hover:text-white border border-[#ccff00]/40 font-bold font-mono py-3.5 rounded-xl text-xs transition-all flex items-center justify-center gap-2 cursor-pointer hover:shadow-[0_0_15px_rgba(204,255,0,0.15)] hover:scale-[1.01]"
              >
                {aiGenerating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-[#ccff00] border-t-transparent"></div>
                    Filtrando {alergias.length + naoCome.length} restrições & dividindo macros em {numMeals} refeições...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-[#ccff00] animate-pulse" />
                    Gerar Dieta com IA (Baseado em {numMeals} refeições and {alergias.length + naoCome.length} Restrições)
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Meals List */}
          <div className="glass-panel p-5 rounded-xl space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <h4 className="font-bold text-xs uppercase tracking-wider text-white font-mono flex items-center gap-1.5">
                <Utensils className="w-4 h-4 text-[#ccff00]" /> 2. Refeições Planejadas ({meals.length})
              </h4>
              <span className="text-[10px] text-gray-400 font-mono">
                Visualizando: <b className="text-[#ccff00]">{selectedDayOfWeek}</b>
              </span>
            </div>

            {/* Horizontal Day of the Week tab-selector */}
            <div className="grid grid-cols-7 gap-1 bg-[#121315] p-1 rounded-xl border border-gray-800">
              {daysOfWeek.map((day) => {
                const hasFreeMeal = meals.some(m => m.isFreeMeal && m.freeMealDays?.includes(day));
                const isSelected = selectedDayOfWeek === day;
                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => {
                      setSelectedDayOfWeek(day);
                      setEditingFreeMealId(null);
                    }}
                    className={`py-2 rounded-lg text-[9px] font-bold font-mono transition-all flex flex-col items-center justify-center gap-0.5 cursor-pointer ${
                      isSelected
                        ? "bg-[#ccff00] text-black shadow-md font-extrabold"
                        : "bg-transparent text-gray-400 hover:text-gray-200 hover:bg-[#1b1c1e]"
                    }`}
                  >
                    <span>{day.substring(0, 3)}</span>
                    {hasFreeMeal ? (
                      <span className="text-[9px] leading-none">🍕</span>
                    ) : (
                      <span className="w-1 h-1 bg-gray-700 rounded-full"></span>
                    )}
                  </button>
                );
              })}
            </div>

            {meals.length === 0 ? (
              <div className="p-8 text-center bg-[#121315]/40 rounded-lg border border-dashed border-[#3a494b]/20 text-[#b9cacb] font-mono">
                <Utensils className="w-8 h-8 mx-auto opacity-20 mb-2" />
                <p className="text-xs">Nenhuma refeição prescrita.</p>
                <p className="text-[10px] text-gray-500 mt-1">Use o Motor IA acima para estruturar a dieta automaticamente!</p>
              </div>
            ) : (
              <div className="space-y-4 font-mono text-xs">
                {mealsForSelectedDay.map((meal, idx) => {
                  const isEditingThis = editingFreeMealId === meal.id;
                  
                  if (isEditingThis) {
                    return (
                      <div key={meal.id} className="bg-amber-950/10 border border-amber-500/30 p-4 rounded-xl space-y-3 font-mono text-xs animate-in fade-in duration-200">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-amber-400 flex items-center gap-1">
                            🍕 Configurar Refeição Livre: {meal.name}
                          </span>
                          <button 
                            type="button"
                            onClick={() => setEditingFreeMealId(null)}
                            className="text-gray-400 hover:text-white"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Days Multi-selector */}
                        <div className="space-y-1">
                          <span className="text-[9px] text-gray-400 uppercase block font-bold">Dias ativos nesta refeição livre:</span>
                          <div className="flex gap-1 bg-[#121315] p-1 rounded-lg border border-gray-850">
                            {daysOfWeek.map(d => {
                              const active = tempFreeMealDays.includes(d);
                              return (
                                <button
                                  key={d}
                                  type="button"
                                  onClick={() => {
                                    if (active) {
                                      setTempFreeMealDays(tempFreeMealDays.filter(day => day !== d));
                                    } else {
                                      setTempFreeMealDays([...tempFreeMealDays, d]);
                                    }
                                  }}
                                  className={`flex-1 py-1 rounded text-[9px] font-bold transition-all cursor-pointer ${
                                    active 
                                      ? "bg-amber-500 text-black" 
                                      : "bg-transparent text-gray-500 hover:text-gray-300"
                                  }`}
                                >
                                  {d.substring(0, 3)}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Preset selections */}
                        <div className="space-y-1">
                          <span className="text-[9px] text-gray-400 uppercase block font-bold">Sugestões de Junk Food:</span>
                          <div className="flex flex-wrap gap-1">
                            {presetSuggestions.map(p => (
                              <button
                                key={p.name}
                                type="button"
                                onClick={() => {
                                  // Add suggestion to the list. If there is only one empty food, replace it.
                                  if (tempFreeMealFoods.length === 1 && tempFreeMealFoods[0].name.trim() === "") {
                                    const updated = [{ name: p.name, kcal: p.kcal }];
                                    setTempFreeMealFoods(updated);
                                    setTempFreeMealName(p.name);
                                    setTempFreeMealKcal(p.kcal);
                                  } else {
                                    const updated = [...tempFreeMealFoods, { name: p.name, kcal: p.kcal }];
                                    setTempFreeMealFoods(updated);
                                    const names = updated.map(x => x.name.trim()).filter(Boolean).join(" + ");
                                    const totalKcal = updated.reduce((sum, x) => sum + (Number(x.kcal) || 0), 0);
                                    setTempFreeMealName(names || "Refeição Livre");
                                    setTempFreeMealKcal(totalKcal);
                                  }
                                }}
                                className="text-[9px] bg-amber-950/20 hover:bg-amber-950/40 text-amber-300 border border-amber-900/40 px-2 py-0.5 rounded transition-all cursor-pointer font-sans"
                              >
                                + {p.name} ({p.kcal} kcal)
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Multiple Foods Inputs List */}
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-[9px] text-gray-400 uppercase block font-bold">Alimentos / Itens na Refeição:</span>
                            <button
                              type="button"
                              onClick={() => {
                                const updated = [...tempFreeMealFoods, { name: "", kcal: 150 }];
                                setTempFreeMealFoods(updated);
                              }}
                              className="text-[9px] bg-amber-500/25 hover:bg-amber-500/40 text-amber-300 px-2 py-0.5 rounded font-bold cursor-pointer transition-all font-sans"
                            >
                              + Adicionar Alimento
                            </button>
                          </div>
                          
                          <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                            {tempFreeMealFoods.map((food, index) => (
                              <div key={index} className="flex gap-1.5 items-center bg-[#111214] p-1.5 rounded-lg border border-gray-850">
                                <div className="flex-1">
                                  <input
                                    type="text"
                                    value={food.name}
                                    onChange={e => {
                                      const updated = [...tempFreeMealFoods];
                                      updated[index].name = e.target.value;
                                      setTempFreeMealFoods(updated);
                                      const names = updated.map(x => x.name.trim()).filter(Boolean).join(" + ");
                                      const totalKcal = updated.reduce((sum, x) => sum + (Number(x.kcal) || 0), 0);
                                      setTempFreeMealName(names || "Refeição Livre");
                                      setTempFreeMealKcal(totalKcal);
                                    }}
                                    placeholder="Ex: Hambúrguer, Batata Frita, etc."
                                    className="w-full bg-[#18191c] border border-gray-850 text-white px-2 py-1 rounded text-xs outline-none focus:border-amber-500 font-sans"
                                  />
                                </div>
                                <div className="w-20">
                                  <input
                                    type="number"
                                    value={food.kcal}
                                    onChange={e => {
                                      const updated = [...tempFreeMealFoods];
                                      updated[index].kcal = Number(e.target.value);
                                      setTempFreeMealFoods(updated);
                                      const names = updated.map(x => x.name.trim()).filter(Boolean).join(" + ");
                                      const totalKcal = updated.reduce((sum, x) => sum + (Number(x.kcal) || 0), 0);
                                      setTempFreeMealName(names || "Refeição Livre");
                                      setTempFreeMealKcal(totalKcal);
                                    }}
                                    placeholder="kcal"
                                    className="w-full bg-[#18191c] border border-gray-850 text-white px-2 py-1 rounded text-xs outline-none text-center focus:border-amber-500 font-bold font-sans"
                                  />
                                </div>
                                {tempFreeMealFoods.length > 1 && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const updated = tempFreeMealFoods.filter((_, idx) => idx !== index);
                                      setTempFreeMealFoods(updated);
                                      const names = updated.map(x => x.name.trim()).filter(Boolean).join(" + ");
                                      const totalKcal = updated.reduce((sum, x) => sum + (Number(x.kcal) || 0), 0);
                                      setTempFreeMealName(names || "Refeição Livre");
                                      setTempFreeMealKcal(totalKcal);
                                    }}
                                    className="text-red-400 hover:text-red-300 p-1 cursor-pointer"
                                    title="Remover"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Display Total Kcal Summary */}
                        <div className="flex justify-between items-center bg-amber-500/5 p-2 rounded-lg border border-amber-500/10 text-xs text-amber-300 font-sans">
                          <span>Total Planejado na Refeição:</span>
                          <span className="font-mono font-bold text-sm text-amber-400">{tempFreeMealKcal} kcal</span>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex justify-end gap-2 pt-2 border-t border-amber-900/20">
                          <button
                            type="button"
                            onClick={() => setEditingFreeMealId(null)}
                            className="px-3 py-1.5 bg-[#1b1c1e] text-gray-400 hover:text-white rounded-lg text-[10px] font-bold"
                          >
                            Cancelar
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (tempFreeMealDays.length === 0) {
                                showNotification("Por favor, selecione pelo menos um dia da semana.", "warning", "Selecione o Dia");
                                return;
                              }
                              const filledFoods = tempFreeMealFoods.filter(f => f.name.trim() !== "");
                              if (filledFoods.length === 0) {
                                showNotification("Por favor, adicione pelo menos um alimento com nome.", "warning", "Alimento Vazio");
                                return;
                              }
                              handleUpdateFreeMealConfig(meal.id, true, tempFreeMealName, tempFreeMealKcal, tempFreeMealDays, filledFoods);
                              setEditingFreeMealId(null);
                            }}
                            className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-black rounded-lg text-[10px] font-bold shadow-md shadow-amber-500/10"
                          >
                            Confirmar Refeição Livre
                          </button>
                        </div>
                      </div>
                    );
                  }

                  if (meal._actualIsFree) {
                    return (
                      <div key={meal.id} className="bg-gradient-to-r from-amber-950/20 to-yellow-950/10 border border-amber-500/40 p-4 rounded-xl hover:border-amber-400 transition-all shadow-lg shadow-amber-500/5 relative overflow-hidden animate-in fade-in duration-200">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl pointer-events-none"></div>
                        
                        <div className="flex justify-between items-start relative z-10">
                          <div className="flex items-center gap-2">
                            <span className="w-5 h-5 bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold rounded-full text-[10px]">
                              🍕
                            </span>
                            <span className="font-bold text-amber-300 text-sm">{meal.name} (Refeição Livre)</span>
                            <span className="text-[10px] bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 text-amber-400 flex items-center gap-1">
                              <Clock className="w-3 h-3 text-amber-400" /> {meal.time}
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-1">
                            <button 
                              type="button"
                              onClick={() => {
                                setEditingFreeMealId(meal.id);
                                const initialFoods = initializeTempFoods(meal, "Junk Food", 500);
                                setTempFreeMealFoods(initialFoods);
                                setTempFreeMealName(meal.freeMealName || "Junk Food");
                                setTempFreeMealKcal(meal.freeMealKcal || 500);
                                setTempFreeMealDays(meal.freeMealDays || [selectedDayOfWeek]);
                              }}
                              className="text-[9px] bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 px-2 py-1 rounded border border-amber-500/20 font-bold transition-all cursor-pointer"
                            >
                              Editar
                            </button>
                            <button 
                              type="button"
                              onClick={() => {
                                const updatedDays = meal.freeMealDays?.filter(d => d !== selectedDayOfWeek) || [];
                                if (updatedDays.length > 0) {
                                  handleUpdateFreeMealConfig(meal.id, true, meal.freeMealName, meal.freeMealKcal, updatedDays, meal.freeMealFoods);
                                } else {
                                  handleUpdateFreeMealConfig(meal.id, false);
                                }
                              }}
                              className="text-[9px] bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 px-2 py-1 rounded border border-rose-500/20 font-bold transition-all cursor-pointer"
                            >
                              Desativar
                            </button>
                          </div>
                        </div>

                        <div className="mt-3 bg-[#121315]/80 p-3 rounded-lg border border-amber-900/20 space-y-2">
                          <div className="flex items-center gap-2.5 text-xs text-amber-200 font-mono pb-2 border-b border-gray-800/50">
                            <span className="text-sm">🍕</span>
                            <div>
                              <span className="font-bold block text-white">Refeição Livre Configurada</span>
                              <span className="text-[9px] text-gray-500">Macros calculados e adicionados ao saldo diário.</span>
                            </div>
                          </div>
                          
                          <div className="space-y-1.5 pt-1">
                            {meal.freeMealFoods && meal.freeMealFoods.length > 0 ? (
                              meal.freeMealFoods.map((food, fIdx) => (
                                <div key={fIdx} className="flex justify-between items-center text-xs">
                                  <span className="text-gray-300 font-medium">• {food.name}</span>
                                  <span className="text-amber-400 font-mono text-[11px] bg-amber-950/15 px-1.5 py-0.5 rounded border border-amber-500/10">{food.kcal} kcal</span>
                                </div>
                              ))
                            ) : (
                              <div className="flex justify-between items-center text-xs">
                                <span className="text-gray-300 font-medium">• {meal.freeMealName || "Junk Food"}</span>
                                <span className="text-amber-400 font-mono text-[11px] bg-amber-950/15 px-1.5 py-0.5 rounded border border-amber-500/10">{meal.freeMealKcal} kcal</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Display calculated macros for the free meal */}
                        <div className="flex justify-between items-center text-[10px] text-gray-500 mt-3 pt-2.5 border-t border-amber-900/20 font-bold">
                          <div className="flex gap-4">
                            <span>P: <b className="text-amber-500 text-xs">{meal.protein}g</b></span>
                            <span>C: <b className="text-amber-400 text-xs">{meal.carbs}g</b></span>
                            <span>G: <b className="text-amber-600 text-xs">{meal.fat}g</b></span>
                          </div>
                          <span className="text-amber-400 font-mono text-xs bg-amber-950/30 px-2 py-0.5 rounded border border-amber-500/20">
                            {meal.freeMealKcal} kcal
                          </span>
                        </div>
                      </div>
                    );
                  }

                  // Render Clean Meal
                  const reductionPct = (meal as any)._reductionPercentage || 0;

                  return (
                    <div key={meal.id} className="bg-[#121315] p-4 rounded-xl border border-gray-800 hover:border-gray-700 transition-all">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="w-5 h-5 bg-[#ccff00]/10 text-[#ccff00] flex items-center justify-center font-bold rounded-full text-[10px]">{idx+1}</span>
                          <span className="font-bold text-white text-sm">{meal.name}</span>
                          <span className="text-[10px] bg-[#ccff00]/5 px-2 py-0.5 rounded border border-[#ccff00]/20 text-[#ccff00] flex items-center gap-1">
                            <Clock className="w-3 h-3 text-[#ccff00]" /> {meal.time}
                          </span>
                          {reductionPct > 0 && (
                            <span className="text-[9px] bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20 text-cyan-400 font-bold animate-pulse">
                              ⚖️ Ajustado (-{reductionPct}%)
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingFreeMealId(meal.id);
                              const initialFoods = initializeTempFoods(meal, "Fatia de Pizza", 400);
                              setTempFreeMealFoods(initialFoods);
                              setTempFreeMealName(meal.freeMealName || "Fatia de Pizza");
                              setTempFreeMealKcal(meal.freeMealKcal || 400);
                              setTempFreeMealDays([selectedDayOfWeek]);
                            }}
                            className="text-[9px] bg-amber-500/10 hover:bg-amber-500 text-gray-400 hover:text-black border border-amber-500/20 px-2 py-1 rounded font-bold cursor-pointer transition-all"
                          >
                            🍕 Definir Livre
                          </button>
                          <button 
                            onClick={() => handleRemoveMeal(meal.id)} 
                            className="text-[#b9cacb] hover:text-red-400 p-1.5 rounded hover:bg-red-500/5 cursor-pointer transition-all"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Interactive foods list edit */}
                      <div className="mt-3 bg-black/20 p-2.5 rounded-lg border border-gray-900">
                        <ul className="list-disc pl-5 text-gray-300 text-xs space-y-1">
                          {meal.foods.map((food, i) => (
                            <li key={i} className="leading-relaxed">
                              {food}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="flex justify-between items-center text-[10px] text-gray-500 mt-3 pt-2.5 border-t border-gray-900 font-bold">
                        <div className="flex gap-4">
                          <span>P: <b className="text-[#ccff00] text-xs">{meal.protein}g</b></span>
                          <span>C: <b className="text-cyan-400 text-xs">{meal.carbs}g</b></span>
                          <span>G: <b className="text-amber-500 text-xs">{meal.fat}g</b></span>
                        </div>
                        <span className="text-gray-400 font-mono text-xs bg-gray-950/50 px-2 py-1 rounded border border-gray-900">
                          {meal.protein * 4 + meal.carbs * 4 + meal.fat * 9} kcal
                        </span>
                      </div>
                    </div>
                  );
                })}

                {/* Target progress compare */}
                <div className="bg-[#121315]/50 p-4 rounded-xl border border-gray-800 text-xs text-gray-400 flex flex-wrap justify-between gap-3">
                  <div>
                    <span>Total no Dia ({selectedDayOfWeek}):</span>
                    <span className="font-bold text-white ml-1.5">
                      {mealsForSelectedDay.reduce((a, c) => a + (c.protein * 4 + c.carbs * 4 + c.fat * 9), 0)} kcal
                    </span>
                  </div>
                  <div>
                    <span>Alvo Diário:</span>
                    <span className="font-bold text-[#00f2ff] ml-1.5">{calorieTarget} kcal</span>
                  </div>
                  <div>
                    <span>Status:</span>
                    <span className="font-bold text-emerald-400 ml-1.5 flex items-center gap-1">
                      ✓ Balanceado
                    </span>
                  </div>
                </div>

              </div>
            )}
          </div>
        </div>

        {/* Sidebar panels (Refeição Livre & Custom Adders) */}
        <div className="space-y-6">
          
          {/* Junk food section */}
          <div className="glass-panel p-5 rounded-xl space-y-4">
            <h4 className="font-bold text-xs uppercase tracking-wider text-amber-400 font-mono flex items-center gap-1.5">
              🍕 Refeições Livres ({selectedDayOfWeek})
            </h4>
            <p className="text-[11px] text-[#b9cacb] leading-relaxed">
              O sistema recalcula as calorias limpas das outras refeições automaticamente de acordo com as refeições livres configuradas para o dia.
            </p>

            <div className="bg-[#121315] p-3.5 rounded-xl border border-gray-850 text-xs font-mono space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-400">Meta Diária Básica:</span>
                <span className="text-white font-bold">{calorieTarget} kcal</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Total de Escapes ({selectedDayOfWeek}):</span>
                <span className="text-amber-400 font-bold">+{currentDayFreeKcal} kcal</span>
              </div>
              <div className="flex justify-between border-t border-gray-900 pt-2 font-extrabold text-sm">
                <span className="text-white">Meta Diária Ajustada:</span>
                <span className="text-[#00f2ff]">{calorieTarget} kcal</span>
              </div>
              <div className="text-[10px] text-gray-500 pt-1 border-t border-gray-950 text-center leading-relaxed">
                As refeições limpas de {selectedDayOfWeek} somam <b className="text-green-400">{Math.max(0, calorieTarget - currentDayFreeKcal)} kcal</b> para manter o balanço.
              </div>
            </div>

            {/* List of active free meals on this day */}
            <div className="space-y-2 pt-2 border-t border-gray-900">
              <span className="text-[9px] text-gray-500 uppercase tracking-wider block font-bold font-mono">Escapes Ativos hoje:</span>
              {currentDayFreeMeals.length === 0 ? (
                <p className="text-[10px] text-gray-400 italic">Nenhum escape configurado para {selectedDayOfWeek}.</p>
              ) : (
                <div className="space-y-1.5">
                  {currentDayFreeMeals.map(m => (
                    <div key={m.id} className="flex justify-between items-center bg-[#1b1c1e] px-2.5 py-1.5 rounded-lg border border-amber-500/10 text-[11px] font-mono">
                      <span className="text-gray-300 truncate max-w-[130px]">
                        <b>{m.name}</b>: {m.freeMealName || "Livre"}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span className="text-amber-400 font-bold">{m.freeMealKcal} kcal</span>
                        <button
                          type="button"
                          onClick={() => {
                            const updatedDays = m.freeMealDays?.filter(d => d !== selectedDayOfWeek) || [];
                            if (updatedDays.length > 0) {
                              handleUpdateFreeMealConfig(m.id, true, m.freeMealName, m.freeMealKcal, updatedDays, m.freeMealFoods);
                            } else {
                              handleUpdateFreeMealConfig(m.id, false);
                            }
                          }}
                          className="text-red-400 hover:text-red-300 px-1 font-bold cursor-pointer"
                          title="Remover escape deste dia"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Convert Selector */}
            {meals.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-gray-900">
                <span className="text-[9px] text-gray-500 uppercase tracking-wider block font-bold font-mono">Converter Refeição em Livre:</span>
                <div className="flex flex-col gap-1">
                  {meals.map(m => {
                    const isAlreadyFree = m.isFreeMeal && m.freeMealDays?.includes(selectedDayOfWeek);
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => {
                          setEditingFreeMealId(m.id);
                          const initialFoods = initializeTempFoods(m, "Fatia de Pizza", 450);
                          setTempFreeMealFoods(initialFoods);
                          setTempFreeMealName(m.freeMealName || "Fatia de Pizza");
                          setTempFreeMealKcal(m.freeMealKcal || 450);
                          setTempFreeMealDays(m.freeMealDays || [selectedDayOfWeek]);
                        }}
                        disabled={isAlreadyFree}
                        className={`text-left text-[10px] px-2.5 py-1.5 rounded-lg border font-mono transition-all flex justify-between items-center ${
                          isAlreadyFree 
                            ? "bg-[#121315] border-gray-800 text-gray-500 cursor-not-allowed" 
                            : "bg-[#121315] border-gray-800 text-gray-300 hover:text-amber-400 hover:bg-amber-500/5 hover:border-amber-500/20 cursor-pointer"
                        }`}
                      >
                        <span>{m.name}</span>
                        <span className="text-[9px] text-gray-500 hover:text-amber-400 font-bold">
                          {isAlreadyFree ? "✓ Já Livre" : "+ Adicionar"}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Manual Add Meal */}
          <div className="glass-panel p-5 rounded-xl space-y-4">
            <h4 className="font-bold text-xs uppercase tracking-wider text-white font-mono flex items-center gap-1.5">
              <Plus className="w-4 h-4 text-[#ccff00]" /> Prescrever Adicional
            </h4>

            <form onSubmit={handleAddMeal} className="space-y-3 font-mono text-xs">
              <div>
                <label className="block text-gray-400 text-[10px] mb-1">Nome da Refeição</label>
                <select
                  value={mealName}
                  onChange={e => setMealName(e.target.value)}
                  className="w-full bg-[#121315] border border-gray-800 text-white p-2 rounded-lg text-xs font-mono outline-none cursor-pointer"
                >
                  <option value="Café da Manhã">Café da Manhã</option>
                  <option value="Colação">Colação</option>
                  <option value="Almoço">Almoço</option>
                  <option value="Lanche da Tarde">Lanche da Tarde</option>
                  <option value="Jantar">Jantar</option>
                  <option value="Ceia">Ceia</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-400 text-[10px] mb-1">Horário</label>
                <input
                  type="time"
                  value={mealTime}
                  onChange={e => setMealTime(e.target.value)}
                  className="w-full bg-[#121315] border border-gray-800 text-white p-2 rounded-lg text-center text-xs font-mono outline-none"
                />
              </div>

              <div>
                <label className="block text-gray-400 text-[10px] mb-1">Alimentos (um por linha)</label>
                <textarea
                  required
                  placeholder="Ex:&#10;150g Peito de frango&#10;100g Arroz integral&#10;Salada de brócolis"
                  value={mealFoods}
                  onChange={e => setMealFoods(e.target.value)}
                  rows={3}
                  className="w-full bg-[#121315] border border-gray-800 text-white p-2 rounded-lg text-xs font-mono outline-none"
                />
              </div>

              <div className="bg-[#121315] p-2.5 rounded-lg border border-gray-800 space-y-2">
                <span className="text-[10px] text-gray-500 font-bold block uppercase text-[8px]">Macros Estimados</span>
                <div className="grid grid-cols-3 gap-1.5 text-center text-[10px]">
                  <div>
                    <span className="text-[#ccff00]">P (g)</span>
                    <input 
                      type="number" 
                      value={mealProtein} 
                      onChange={e => setMealProtein(Number(e.target.value))}
                      className="bg-[#1b1c1e] text-white border border-gray-800 text-center rounded py-1 w-full mt-1 font-mono outline-none"
                    />
                  </div>
                  <div>
                    <span className="text-cyan-400">C (g)</span>
                    <input 
                      type="number" 
                      value={mealCarbs} 
                      onChange={e => setMealCarbs(Number(e.target.value))}
                      className="bg-[#1b1c1e] text-white border border-gray-800 text-center rounded py-1 w-full mt-1 font-mono outline-none"
                    />
                  </div>
                  <div>
                    <span className="text-amber-500">G (g)</span>
                    <input 
                      type="number" 
                      value={mealFat} 
                      onChange={e => setMealFat(Number(e.target.value))}
                      className="bg-[#1b1c1e] text-white border border-gray-800 text-center rounded py-1 w-full mt-1 font-mono outline-none"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-[#ccff00] hover:bg-[#bce600] text-black font-bold py-2 rounded-lg transition-all cursor-pointer text-xs uppercase tracking-wider"
              >
                + Adicionar Refeição
              </button>
            </form>
          </div>

        </div>
      </div>

      {/* 🔘 Save Dieta and Go to Acompanhamento */}
      <div className="pt-6 border-t border-[#3a494b]/20 flex justify-end">
        <button
          type="button"
          onClick={handleSave}
          className="w-full sm:w-auto bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-black font-bold font-mono text-xs uppercase tracking-wider py-3.5 px-8 rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.2)] transition-all flex items-center justify-center gap-2 hover:scale-[1.02] cursor-pointer"
        >
          <Save className="w-4 h-4" /> Salvar Dieta e Ir para Acompanhamento
        </button>
      </div>

      <ConfirmModal
        isOpen={isConfirmMealDeleteOpen}
        title="Excluir Refeição"
        message={`Deseja realmente excluir a refeição "${mealToDeleteName}" do plano alimentar?`}
        confirmLabel="Excluir"
        cancelLabel="Cancelar"
        onConfirm={confirmDeleteMeal}
        onCancel={() => {
          setIsConfirmMealDeleteOpen(false);
          setMealToDeleteId(null);
        }}
        variant="danger"
      />

    </div>
  );
}
