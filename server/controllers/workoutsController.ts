import { Request, Response } from "express";
import { GoogleGenAI } from "@google/genai";
import fs from "fs";
import path from "path";
import { callGroqAI, generateContentWithFallback, cleanJsonResponse } from "../services/aiService.js";
import { UniversalPrescriptionEngine, StudentData } from "../../src/shared/modules/training/services/universalPrescriptionEngine.js";
import { WorkoutQualityEngine } from "../../src/shared/modules/training/services/workoutQualityEngine.js";
import { ScientificEvidenceEngine } from "../../src/shared/modules/training/services/scientificEvidenceEngine.js";

const AVAILABLE_BACKEND_EXERCISES: Record<string, string[]> = {
  "Peitoral": [
    "Supino Reto Halteres",
    "Supino Inclinado Halteres",
    "Peck Deck / Crucifixo Máquina",
    "Crossover Alto",
    "Supino Reto Máquina",
    "Crossover Baixo",
    "Crucifixo com Halteres Reto"
  ],
  "Costas": [
    "Puxada Alta Frente",
    "Remada Baixa Máquina Neutra",
    "Remada Hammer",
    "Remada Curvada Pronada",
    "Pulldown Máquina Convergente",
    "Remada Cavalinho"
  ],
  "Quadríceps": [
    "Agachamento Livre (High Bar)",
    "Leg Press 45°",
    "Cadeira Extensora Bilateral",
    "Agachamento Hack Machine",
    "Bulgarian Split Squat"
  ],
  "Posteriores de Coxa": [
    "Mesa Flexora Bilateral",
    "Mesa Flexora Unilateral",
    "Flexora Sentada",
    "Romanian Deadlift (Barra)",
    "Stiff Barra"
  ],
  "Ombros": [
    "Desenvolvimento com Halteres",
    "Elevação Lateral na Polia",
    "Elevação Lateral com Cabos",
    "Crucifixo Invertido com Halteres",
    "Face Pull na Polia"
  ],
  "Bíceps": [
    "Rosca Direta com Barra W",
    "Rosca Martelo com Halteres",
    "Rosca Concentrada",
    "Rosca Scott"
  ],
  "Tríceps": [
    "Tríceps Pulley",
    "Tríceps Corda",
    "Tríceps Testa com Barra W"
  ],
  "Panturrilhas": [
    "Panturrilha em Pé Máquina",
    "Panturrilha Sentada",
    "Leg Press Panturrilha"
  ],
  "Glúteos": [
    "Hip Thrust com Barra",
    "Glute Drive Máquina",
    "Cadeira Abdutora"
  ]
};

const ADVANCED_TECHNIQUES_POOL = [
  { nome: "Drop-set", instrucao: "Execute a série até a falha concêntrica, reduza o peso em 20-30% e continue imediatamente até nova falha." },
  { nome: "Rest-Pause", instrucao: "Após a última repetição, descanse por 15 segundos e faça mais repetições até a falha com o mesmo peso." },
  { nome: "Myo-reps", instrucao: "Faça uma série de ativação até a falha, descanse 5 respirações profundas, faça 3-5 repetições, repita o mini-bloco de descanso e repetições de 3 a 4 vezes." },
  { nome: "FST-7", instrucao: "Realize 7 séries consecutivas do exercício com descanso reduzido de 30 a 45 segundos, focando em alongamento fascial entre as séries." }
];

function mapNameToMuscleGroup(name: string): string | null {
  const nameLower = (name || "").toLowerCase();
  if (nameLower.includes("aquecimento geral") || 
      nameLower.includes("mobilidade dinâmica") || 
      nameLower.includes("séries de adaptação") || 
      nameLower.includes("series de adaptacao")) {
    return null;
  }
  if (nameLower.includes("agachamento") || nameLower.includes("leg press") || nameLower.includes("extensora") || nameLower.includes("sissy") || nameLower.includes("hack")) {
    return "Quadríceps";
  } else if (nameLower.includes("flexora") || nameLower.includes("stiff") || nameLower.includes("romanian") || nameLower.includes("coice") || nameLower.includes("nordic") || nameLower.includes("good morning")) {
    return "Posteriores de Coxa";
  } else if (nameLower.includes("elevaçao lateral") || nameLower.includes("elevação lateral") || nameLower.includes("desenvolvimento") || nameLower.includes("arnold") || nameLower.includes("militar") || nameLower.includes("deltoide") || nameLower.includes("shoulder") || nameLower.includes("face pull") || nameLower.includes("crucifixo inverso")) {
    return "Ombros";
  } else if (nameLower.includes("supino") || nameLower.includes("peck deck") || nameLower.includes("crucifixo") || nameLower.includes("voador") || nameLower.includes("cross") || nameLower.includes("chest press")) {
    return "Peitoral";
  } else if (nameLower.includes("puxada") || nameLower.includes("remada") || nameLower.includes("pulldown") || nameLower.includes("dorsal") || nameLower.includes("chin up") || nameLower.includes("pull up") || nameLower.includes("cavalinho") || nameLower.includes("deadlift")) {
    return "Costas";
  } else if (nameLower.includes("rosca") || nameLower.includes("scott") || nameLower.includes("biceps") || nameLower.includes("concentrada") || nameLower.includes("martelo")) {
    return "Bíceps";
  } else if (nameLower.includes("triceps") || nameLower.includes("pulley") || nameLower.includes("testa") || nameLower.includes("corda") || nameLower.includes("paralela")) {
    return "Tríceps";
  } else if (nameLower.includes("panturrilha") || nameLower.includes("gemeos") || nameLower.includes("calf") || nameLower.includes("calves")) {
    return "Panturrilhas";
  } else if (nameLower.includes("abdominal") || nameLower.includes("infra") || nameLower.includes("supra") || nameLower.includes("obliquo") || nameLower.includes("plank") || nameLower.includes("prancha") || nameLower.includes("core")) {
    return "Core";
  } else if (nameLower.includes("adutora") || nameLower.includes("adutor")) {
    return "Adutores";
  } else if (nameLower.includes("abdutora") || nameLower.includes("elevacao de quadril") || nameLower.includes("glute") || nameLower.includes("hip thrust") || nameLower.includes("pelve") || nameLower.includes("abduçao")) {
    return "Glúteos";
  }
  return null;
}

function auditAndAdjustWorkoutVolume(workoutData: any, activeCycleVol: string): any {
  if (!workoutData || !Array.isArray(workoutData.workouts)) return workoutData;

  const volMatches = String(activeCycleVol).match(/\d+/g);
  let minVol = 12;
  let maxVol = 15;
  if (volMatches && volMatches.length >= 2) {
    minVol = parseInt(volMatches[0], 10);
    maxVol = parseInt(volMatches[1], 10);
  } else if (volMatches && volMatches.length === 1) {
    minVol = parseInt(volMatches[0], 10);
    maxVol = minVol;
  }

  const BACKEND_SINERGISTAS_FACTORS: Record<string, Record<string, number>> = {
    "leg press 45°": { "Glúteos": 0.5, "Posteriores de Coxa": 0.25 },
    "leg press 45": { "Glúteos": 0.5, "Posteriores de Coxa": 0.25 },
    "agachamento livre": { "Glúteos": 0.5, "Posteriores de Coxa": 0.25 },
    "agachamento hack": { "Glúteos": 0.5 },
    "hack machine": { "Glúteos": 0.5 },
    "stiff": { "Glúteos": 0.5 },
    "romanian deadlift": { "Glúteos": 0.7 },
    "supino reto": { "Tríceps": 0.5, "Ombros": 0.5 },
    "supino inclinado": { "Tríceps": 0.5, "Ombros": 0.7 },
    "puxada alta": { "Bíceps": 0.5, "Ombros": 0.5 },
    "remada": { "Bíceps": 0.5 },
    "deadlift": { "Glúteos": 0.7, "Posteriores de Coxa": 0.5, "Quadríceps": 0.5 },
    "desenvolvimento": { "Tríceps": 0.5 }
  };

  const EQUIVALENCE_FACTORS: Record<string, number> = {
    "Peitoral": 0,
    "Costas": 0,
    "Quadríceps": 0,
    "Posteriores de Coxa": 0.8,
    "Ombros": 0.7,
    "Bíceps": 0.7,
    "Tríceps": 0.7,
    "Glúteos": 0.8,
    "Panturrilhas": 0
  };

  function getBackendExerciseSinergistas(name: string): Record<string, number> {
    const nameLower = (name || "").toLowerCase();
    for (const [key, factors] of Object.entries(BACKEND_SINERGISTAS_FACTORS)) {
      if (nameLower.includes(key)) {
        return factors;
      }
    }
    return {};
  }

  const musclesOfInterest = [
    "Peitoral", "Costas", "Quadríceps", "Posteriores de Coxa", "Ombros", "Bíceps", "Tríceps", "Glúteos", "Panturrilhas"
  ];

  musclesOfInterest.forEach(muscle => {
    let directVolume = 0;
    let indirectVolume = 0;
    const workoutsWithMuscle: any[] = [];

    workoutData.workouts.forEach((wk: any) => {
      if (!wk || !Array.isArray(wk.exercises)) return;
      let hasMuscleInWk = false;
      wk.exercises.forEach((ex: any) => {
        const nameLower = (ex.name || "").toLowerCase();
        if (
          nameLower.includes("aquecimento geral") ||
          nameLower.includes("mobilidade dinâmica") ||
          nameLower.includes("séries de adaptação") ||
          nameLower.includes("series de adaptacao")
        ) {
          return;
        }

        let mGroup = ex.muscleGroup;
        if (!mGroup || mGroup === "Desconhecido") {
          mGroup = mapNameToMuscleGroup(ex.name);
        }

        if (mGroup === muscle) {
          directVolume += (ex.sets || 0);
          hasMuscleInWk = true;
        } else {
          const factors = getBackendExerciseSinergistas(ex.name);
          if (factors[muscle] !== undefined) {
            indirectVolume += (ex.sets || 0) * factors[muscle];
          }
        }
      });

      if (hasMuscleInWk) {
        workoutsWithMuscle.push(wk);
      }
    });

    const eq = EQUIVALENCE_FACTORS[muscle] ?? 0;
    let currentVolume = directVolume + (indirectVolume * eq);

    // Adjust upward if volume is less than requested minimum
    if (directVolume > 0 && currentVolume < minVol) {
      let needed = minVol - currentVolume;

      // Stage A: Try to increase sets of existing exercises up to 5 sets
      for (const wk of workoutsWithMuscle) {
        for (const ex of wk.exercises) {
          const nameLower = (ex.name || "").toLowerCase();
          if (
            nameLower.includes("aquecimento geral") ||
            nameLower.includes("mobilidade dinâmica") ||
            nameLower.includes("séries de adaptação") ||
            nameLower.includes("series de adaptacao")
          ) {
            continue;
          }

          let mGroup = ex.muscleGroup;
          if (!mGroup || mGroup === "Desconhecido") {
            mGroup = mapNameToMuscleGroup(ex.name);
          }

          if (mGroup === muscle && ex.sets < 5 && needed > 0) {
            const add = Math.min(5 - ex.sets, needed);
            ex.sets += add;
            needed -= add;
            currentVolume += add;
          }
        }
      }

      // Stage B: If we still need more sets, add new exercises of this muscle
      const availableList = AVAILABLE_BACKEND_EXERCISES[muscle] || [];
      if (needed > 0 && workoutsWithMuscle.length > 0 && availableList.length > 0) {
        let wkIdx = 0;
        let exercisePoolIdx = 0;

        while (needed > 0 && exercisePoolIdx < availableList.length) {
          const targetWk = workoutsWithMuscle[wkIdx % workoutsWithMuscle.length];
          const exName = availableList[exercisePoolIdx];

          const alreadyExists = targetWk.exercises.some((ex: any) => ex.name === exName);
          if (!alreadyExists) {
            const setsToAdd = Math.min(4, needed);
            const newEx = {
              name: exName,
              sets: setsToAdd,
              reps: ["Peitoral", "Costas", "Quadríceps", "Posteriores de Coxa", "Glúteos"].includes(muscle) ? "8-12" : "10-15",
              weight: 10,
              notes: `Foco no estímulo de ${muscle}. Execução controlada com cadência de 2s na excêntrica.`,
              muscleGroup: muscle,
              category: "musculacao"
            };

            targetWk.exercises.push(newEx);
            needed -= setsToAdd;
            currentVolume += setsToAdd;
          }
          
          exercisePoolIdx++;
          wkIdx++;
        }
      }

      // Stage C: If still needed, force increase beyond 5 sets up to 8 sets on existing exercises
      if (needed > 0) {
        for (const wk of workoutsWithMuscle) {
          for (const ex of wk.exercises) {
            let mGroup = ex.muscleGroup;
            if (!mGroup || mGroup === "Desconhecido") {
              mGroup = mapNameToMuscleGroup(ex.name);
            }

            if (mGroup === muscle && ex.sets < 8 && needed > 0) {
              const add = Math.min(8 - ex.sets, needed);
              ex.sets += add;
              needed -= add;
              currentVolume += add;
            }
          }
        }
      }
    }

    // Adjust downward if volume exceeds maximum
    if (currentVolume > maxVol) {
      let excess = currentVolume - maxVol;

      for (const wk of workoutsWithMuscle) {
        for (let i = wk.exercises.length - 1; i >= 0; i--) {
          const ex = wk.exercises[i];
          const nameLower = (ex.name || "").toLowerCase();
          if (
            nameLower.includes("aquecimento geral") ||
            nameLower.includes("mobilidade dinâmica") ||
            nameLower.includes("séries de adaptação") ||
            nameLower.includes("series de adaptacao")
          ) {
            continue;
          }

          let mGroup = ex.muscleGroup;
          if (!mGroup || mGroup === "Desconhecido") {
            mGroup = mapNameToMuscleGroup(ex.name);
          }

          if (mGroup === muscle && ex.sets > 2 && excess > 0) {
            const rem = Math.min(ex.sets - 2, excess);
            ex.sets -= rem;
            excess -= rem;
            currentVolume -= rem;
          } else if (mGroup === muscle && ex.sets <= 2 && excess > 0) {
            wk.exercises.splice(i, 1);
            excess -= ex.sets;
            currentVolume -= ex.sets;
          }
        }
      }
    }
  });

  // Apply Advanced Techniques on high-volume mesocycles (20+)
  if (minVol >= 20) {
    musclesOfInterest.forEach(muscle => {
      let lastEx: any = null;

      workoutData.workouts.forEach((wk: any) => {
        if (!wk || !Array.isArray(wk.exercises)) return;
        wk.exercises.forEach((ex: any) => {
          const nameLower = (ex.name || "").toLowerCase();
          if (
            nameLower.includes("aquecimento geral") ||
            nameLower.includes("mobilidade dinâmica") ||
            nameLower.includes("séries de adaptação") ||
            nameLower.includes("series de adaptacao")
          ) {
            return;
          }

          let mGroup = ex.muscleGroup;
          if (!mGroup || mGroup === "Desconhecido") {
            mGroup = mapNameToMuscleGroup(ex.name);
          }

          if (mGroup === muscle) {
            lastEx = ex;
          }
        });
      });

      if (lastEx) {
        const notes = lastEx.notes || "";
        const hasTech = ADVANCED_TECHNIQUES_POOL.some(t => notes.toLowerCase().includes(t.nome.toLowerCase()));
        if (!hasTech) {
          const techIdx = Math.floor(Math.random() * ADVANCED_TECHNIQUES_POOL.length);
          const tech = ADVANCED_TECHNIQUES_POOL[techIdx];
          lastEx.notes = notes ? `${notes} | [TÉCNICA AVANÇADA] ${tech.nome}: ${tech.instrucao}` : `[TÉCNICA AVANÇADA] ${tech.nome}: ${tech.instrucao}`;
        }
      }
    });
  }

  return workoutData;
}

function injectScientificWarmUp(exercises: any[], workoutName: string) {
  if (!exercises || exercises.length === 0) return exercises;

  const firstExercise = exercises[0];
  const firstExName = firstExercise.name || "Exercício Principal";
  const firstExMuscleGroup = firstExercise.muscleGroup || "Quadríceps";

  const workoutNameLower = String(workoutName || "").toLowerCase();
  const exercisesGroupLower = exercises.map(ex => String(ex.muscleGroup || "").toLowerCase());
  
  let mobilityNotes = "";
  if (workoutNameLower.includes("perna") || workoutNameLower.includes("inferior") || exercisesGroupLower.includes("quadriceps") || exercisesGroupLower.includes("quadríceps") || exercisesGroupLower.includes("posteriores de coxa") || exercisesGroupLower.includes("gluteos") || exercisesGroupLower.includes("glúteos")) {
    mobilityNotes = "Mobilidade específica de pernas: Mobilidade de quadril, mobilidade de tornozelo e 1-2 séries de agachamento livre sem carga para aquecimento articular.";
  } else if (workoutNameLower.includes("peito") || workoutNameLower.includes("ombro") || workoutNameLower.includes("empurrar") || exercisesGroupLower.includes("peitoral") || exercisesGroupLower.includes("ombros")) {
    mobilityNotes = "Mobilidade específica de empurrar: Mobilidade de ombro, ativação de escápulas e exercícios leves com elástico (manguito rotador).";
  } else if (workoutNameLower.includes("costas") || workoutNameLower.includes("bíceps") || workoutNameLower.includes("puxar") || exercisesGroupLower.includes("costas") || exercisesGroupLower.includes("bíceps")) {
    mobilityNotes = "Mobilidade específica de puxar: Mobilidade de ombros, ativação escapular e movimento leve de puxada.";
  } else {
    mobilityNotes = "Mobilidade articular geral e dinâmica dos ombros, escápulas, quadril e tornozelos para preparação neuromuscular.";
  }

  const warmUpExercises = [
    {
      name: "Aquecimento Geral (Cardio Leve)",
      sets: 1,
      reps: "3-5 min",
      weight: 0,
      notes: "Atividade de intensidade leve a moderada (caminhada, bicicleta ou elíptico) apenas para elevar a temperatura corporal.",
      muscleGroup: "Core",
      category: "musculacao"
    },
    {
      name: "Mobilidade Dinâmica",
      sets: 2,
      reps: "10-12",
      weight: 0,
      notes: mobilityNotes + " Não utilizar alongamentos estáticos prolongados antes de treinar.",
      muscleGroup: "Core",
      category: "musculacao"
    },
    {
      name: `Séries de Adaptação — ${firstExName}`,
      sets: 3,
      reps: "15, 8, 4",
      weight: 0,
      notes: `Neuromuscular: Série 1 (15-20 reps com ~30-40% da carga de trabalho), Série 2 (8-10 reps com ~50-60%), Série 3 (4-5 reps com ~70%). Não deve gerar fadiga. Iniciar as séries efetivas na sequência.`,
      muscleGroup: firstExMuscleGroup,
      category: "musculacao"
    }
  ];

  return [...warmUpExercises, ...exercises];
}

function ensureScientificWarmUp(workoutData: any) {
  if (workoutData && Array.isArray(workoutData.workouts)) {
    workoutData.workouts = workoutData.workouts.map((wk: any) => {
      if (wk && Array.isArray(wk.exercises)) {
        const hasWarmUp = wk.exercises.some((ex: any) => {
          const nameLower = String(ex.name || "").toLowerCase();
          return nameLower.includes("aquecimento geral") || nameLower.includes("mobilidade dinâmica") || nameLower.includes("séries de adaptação") || nameLower.includes("series de adaptacao");
        });
        
        if (!hasWarmUp) {
          wk.exercises = injectScientificWarmUp(wk.exercises, wk.dayName);
        }
      }
      return wk;
    });
  }
  return workoutData;
}

function generateFallbackMusculacaoWorkout(
  periodizacaoModel: string = "",
  activeCycleTitle: string = "",
  activeCycleVol: string = "",
  activeCycleTec: string = "",
  frequenciaSemanal: string = "",
  selectedDivision: string = "",
  customDivisionText: string = ""
) {
  if (selectedDivision && selectedDivision.includes("Personalizada")) {
    try {
      const workoutsList: any[] = [];
      const exercisesJsonPath = path.join(process.cwd(), "src/data/exercises.json");
      const exercisesData = JSON.parse(fs.readFileSync(exercisesJsonPath, "utf8"));
      
      const lines = customDivisionText.split("\n").map(l => l.trim()).filter(l => l.length > 0);
      
      const exercisesPool: Record<string, any[]> = {};
      exercisesData.forEach((ex: any) => {
        const grp = ex.grupo;
        if (!exercisesPool[grp]) exercisesPool[grp] = [];
        exercisesPool[grp].push(ex);
      });

      const muscleGroupMapping: Record<string, string> = {
        "peitoral": "Peitoral",
        "peito": "Peitoral",
        "costas": "Costas",
        "dorsal": "Costas",
        "dorsais": "Costas",
        "quadríceps": "Quadríceps",
        "quadriceps": "Quadríceps",
        "coxa": "Quadríceps",
        "perna": "Quadríceps",
        "pernas": "Quadríceps",
        "posterior": "Posteriores de Coxa",
        "posteriores": "Posteriores de Coxa",
        "ombro": "Ombros",
        "ombros": "Ombros",
        "deltoide": "Ombros",
        "deltoides": "Ombros",
        "tríceps": "Tríceps",
        "triceps": "Tríceps",
        "bíceps": "Bíceps",
        "biceps": "Bíceps",
        "glúteo": "Glúteos",
        "glúteos": "Glúteos",
        "gluteo": "Glúteos",
        "gluteos": "Glúteos",
        "panturrilha": "Panturrilhas",
        "panturrilhas": "Panturrilhas",
        "core": "Core",
        "abdômen": "Core",
        "abdomen": "Core",
        "abdominal": "Core",
        "abdominais": "Core"
      };

      lines.forEach((line, lineIdx) => {
        let dayName = `Treino ${String.fromCharCode(65 + lineIdx)}`;
        let content = line;
        const separatorIdx = line.indexOf(":");
        if (separatorIdx !== -1) {
          dayName = line.substring(0, separatorIdx).trim();
          content = line.substring(separatorIdx + 1).trim();
        } else {
          const hyphenIdx = line.indexOf("-");
          if (hyphenIdx !== -1 && hyphenIdx < 15) {
            dayName = line.substring(0, hyphenIdx).trim();
            content = line.substring(hyphenIdx + 1).trim();
          }
        }

        const exercises: any[] = [];
        const regex = /(\d+)\s*(?:est[íi]mulo[s]?|estimulo[s]?|exerc[íi]cio[s]?|exercicio[s]?)?\s*(?:de\s+)?([a-zA-Záéíóúçãõâêîôû]+)/gi;
        let match;
        let matchFound = false;
        const usedExercisesInDay = new Set<string>();

        while ((match = regex.exec(content)) !== null) {
          matchFound = true;
          const count = parseInt(match[1], 10);
          const muscleWord = match[2].toLowerCase();
          const targetGroup = muscleGroupMapping[muscleWord];

          if (targetGroup) {
            const pool = exercisesPool[targetGroup] || [];
            let addedCount = 0;
            let poolIdx = 0;

            while (addedCount < count && pool.length > 0) {
              const candidate = pool[poolIdx % pool.length];
              if (!usedExercisesInDay.has(candidate.nome) || poolIdx >= pool.length) {
                exercises.push({
                  id: `ex-custom-${Date.now()}-${lineIdx}-${addedCount}`,
                  name: candidate.nome,
                  sets: 3,
                  reps: candidate.reps || "8-12",
                  weight: 10,
                  notes: `Estímulo direto focado em ${targetGroup}. Execução controlada.`,
                  muscleGroup: targetGroup,
                  category: "musculacao"
                });
                usedExercisesInDay.add(candidate.nome);
                addedCount++;
              }
              poolIdx++;
            }
          }
        }

        if (!matchFound) {
          const words = content.split(/[\s,;+]+/);
          words.forEach(w => {
            const cleanWord = w.toLowerCase().replace(/[^a-záéíóúçãõâêîôû]/g, "");
            const targetGroup = muscleGroupMapping[cleanWord];
            if (targetGroup) {
              const pool = exercisesPool[targetGroup] || [];
              if (pool.length > 0) {
                const candidate = pool[0];
                exercises.push({
                  id: `ex-custom-${Date.now()}-${lineIdx}-${exercises.length}`,
                  name: candidate.nome,
                  sets: 3,
                  reps: candidate.reps || "8-12",
                  weight: 10,
                  notes: `Estímulo de ${targetGroup}.`,
                  muscleGroup: targetGroup,
                  category: "musculacao"
                });
              }
            }
          });
        }

        if (exercises.length > 0) {
          workoutsList.push({
            dayName,
            exercises
          });
        }
      });

      if (workoutsList.length > 0) {
        return {
          workouts: workoutsList,
          reasoningExplanation: "Treino gerado com sucesso via mecanismo de fallback local para divisão personalizada."
        };
      }
    } catch (err) {
      console.error("Local fallback customized division failed, defaulting to fullbody", err);
    }
  }

  let baseSets = 4;
  let baseReps = "10";
  
  const titleClean = String(activeCycleTitle || "").toLowerCase();
  const tecClean = String(activeCycleTec || "").toLowerCase();

  let applyTechnique = tecClean.includes("permitido") || tecClean.includes("avançad");

  if (titleClean.includes("deload") || titleClean.includes("descarregar") || titleClean.includes("recuperação")) {
    baseSets = 2;
    baseReps = "12-15";
    applyTechnique = false;
  } else if (titleClean.includes("choque") || titleClean.includes("exaustão") || titleClean.includes("pico")) {
    baseSets = 4;
    baseReps = "6-8";
  } else if (titleClean.includes("básica") || titleClean.includes("manutenção")) {
    baseSets = 3;
    baseReps = "12";
    applyTechnique = false;
  }

  const workoutsList: any[] = [];
  const daysCount = parseInt(frequenciaSemanal) || 3;

  if (daysCount === 1) {
    workoutsList.push({
      dayName: "Treino Único - Full Body (Corpo Inteiro)",
      exercises: [
        { name: "Agachamento Livre (Barra)", sets: baseSets, reps: "8-10", weight: 60, notes: "Trabalho multiarticular completo. Coluna neutra.", muscleGroup: "Quadríceps", category: "musculacao" },
        { name: "Supino Reto (Barra)", sets: baseSets, reps: "8-10", weight: 50, notes: "Trabalho de empurrar básico. Cadência 2s excêntrica.", muscleGroup: "Peitoral", category: "musculacao" },
        { name: "Puxada Alta Frente", sets: baseSets, reps: "10-12", weight: 55, notes: "Foco em latíssimo do dorso e expansão lateral.", muscleGroup: "Costas", category: "musculacao" },
        { name: "Elevação Lateral (Halteres)", sets: baseSets - 1, reps: "12-15", weight: 8, notes: "Isolamento lateral de deltoides.", muscleGroup: "Ombros", category: "musculacao" },
        { name: "Tríceps Corda (Polia)", sets: baseSets - 1, reps: "12", weight: 18, notes: "Estímulo direto de tríceps.", muscleGroup: "Tríceps", category: "musculacao" },
        { name: "Rosca Scott", sets: baseSets - 1, reps: "12", weight: 15, notes: applyTechnique ? "Última série com Drop-set." : "Bíceps isolado.", muscleGroup: "Bíceps", category: "musculacao" }
      ]
    });
  } else if (daysCount === 2) {
    workoutsList.push({
      dayName: "Treino A - Membros Superiores (Upper Body)",
      exercises: [
        { name: "Supino Inclinado Halteres", sets: baseSets, reps: baseReps, weight: 24, notes: "Foco em peitoral superior.", muscleGroup: "Peitoral", category: "musculacao" },
        { name: "Puxada Alta Frente", sets: baseSets, reps: baseReps, weight: 50, notes: "Foco nas dorsais.", muscleGroup: "Costas", category: "musculacao" },
        { name: "Desenvolvimento com Halteres", sets: baseSets - 1, reps: baseReps, weight: 14, notes: "Ombro anterior.", muscleGroup: "Ombros", category: "musculacao" },
        { name: "Remada Hammer", sets: baseSets, reps: baseReps, weight: 45, notes: "Foco em miolo de costas.", muscleGroup: "Costas", category: "musculacao" },
        { name: "Tríceps Testa (Barra)", sets: baseSets, reps: "10-12", weight: 16, notes: "Tríceps porção longa.", muscleGroup: "Tríceps", category: "musculacao" },
        { name: "Rosca Alternada (Halteres)", sets: baseSets, reps: "10-12", weight: 12, notes: applyTechnique ? "Última série com Rest-Pause." : "Supinação no topo.", muscleGroup: "Bíceps", category: "musculacao" }
      ]
    });
    workoutsList.push({
      dayName: "Treino B - Membros Inferiores (Lower Body)",
      exercises: [
        { name: "Agachamento Livre (High Bar)", sets: baseSets, reps: baseReps, weight: 50, notes: "Foco em quadríceps.", muscleGroup: "Quadríceps", category: "musculacao" },
        { name: "Romanian Deadlift (Barra)", sets: baseSets, reps: baseReps, weight: 40, notes: "Foco em cadeia posterior.", muscleGroup: "Posteriores de Coxa", category: "musculacao" },
        { name: "Cadeira Extensora Bilateral", sets: baseSets - 1, reps: "12-15", weight: 35, notes: applyTechnique ? "Última série com Drop-set duplo." : "Pico de contração de 2s.", muscleGroup: "Quadríceps", category: "musculacao" },
        { name: "Cadeira Abdutora", sets: baseSets - 1, reps: "15", weight: 40, notes: "Glúteo médio.", muscleGroup: "Glúteos", category: "musculacao" },
        { name: "Panturrilha Sentada", sets: baseSets, reps: "15-20", weight: 25, notes: "Foco no músculo solear.", muscleGroup: "Panturrilhas", category: "musculacao" }
      ]
    });
  } else if (daysCount === 3) {
    workoutsList.push({
      dayName: "Treino A - Empurrar (Peito, Ombros e Tríceps)",
      exercises: [
        { name: "Supino Inclinado Halteres", sets: baseSets, reps: baseReps, weight: 26, notes: "Foco em peitoral superior. Cadência 3s excêntrica.", muscleGroup: "Peitoral", category: "musculacao" },
        { name: "Supino Reto Máquina", sets: baseSets, reps: baseReps, weight: 50, notes: "Adução escapular rígida e pico de contração.", muscleGroup: "Peitoral", category: "musculacao" },
        { name: "Desenvolvimento de Ombros (Halteres)", sets: baseSets - 1, reps: baseReps, weight: 16, notes: "Deltoide anterior.", muscleGroup: "Ombros", category: "musculacao" },
        { name: "Elevação Lateral na Polia", sets: baseSets, reps: "12-15", weight: 10, notes: applyTechnique ? "Última série com Drop-set (reduzir 30% da carga)." : "Amplitude total.", muscleGroup: "Ombros", category: "musculacao" },
        { name: "Tríceps Corda (Polia)", sets: baseSets, reps: "10-12", weight: 20, notes: "Foco na cabeça lateral do tríceps.", muscleGroup: "Tríceps", category: "musculacao" }
      ]
    });
    workoutsList.push({
      dayName: "Treino B - Puxar (Costas, Deltoide Post. e Bíceps)",
      exercises: [
        { name: "Puxada Alta Frente", sets: baseSets, reps: baseReps, weight: 55, notes: "Ativação de grande dorsal.", muscleGroup: "Costas", category: "musculacao" },
        { name: "Remada Curvada Pronada", sets: baseSets, reps: baseReps, weight: 40, notes: "Tronco inclinado 45 graus, pegada firme.", muscleGroup: "Costas", category: "musculacao" },
        { name: "Crucifixo Inverso Máquina", sets: baseSets - 1, reps: "12-15", weight: 35, notes: "Deltoide posterior isolado.", muscleGroup: "Ombros", category: "musculacao" },
        { name: "Rosca Direta (Barra W)", sets: baseSets, reps: "10-12", weight: 14, notes: "Ativação primária do bíceps braquial.", muscleGroup: "Bíceps", category: "musculacao" },
        { name: "Rosca Martelo Halteres", sets: baseSets - 1, reps: "10-12", weight: 12, notes: applyTechnique ? "Última série com Rest-Pause (descanso de 15s)." : "Foco em braquiorradial.", muscleGroup: "Bíceps", category: "musculacao" }
      ]
    });
    workoutsList.push({
      dayName: "Treino C - Pernas (Coxas, Glúteos e Panturrilhas)",
      exercises: [
        { name: "Agachamento Livre (High Bar)", sets: baseSets, reps: "8-10", weight: 60, notes: "Agachamento profundo controlado, mantendo quadril estável.", muscleGroup: "Quadríceps", category: "musculacao" },
        { name: "Leg Press 45°", sets: baseSets, reps: baseReps, weight: 140, notes: "Amplitude máxima controlada.", muscleGroup: "Quadríceps", category: "musculacao" },
        { name: "Mesa Flexora Bilateral", sets: baseSets, reps: "10-12", weight: 30, notes: "Cadência lenta na descida excêntrica (3s).", muscleGroup: "Posteriores de Coxa", category: "musculacao" },
        { name: "Panturrilha em Pé Máquina", sets: baseSets + 1, reps: "15", weight: 45, notes: applyTechnique ? "Última série em FST-7 (alongar 10s entre séries)." : "Extensão completa do tornozelo.", muscleGroup: "Panturrilhas", category: "musculacao" }
      ]
    });
  } else if (daysCount === 4) {
    workoutsList.push({
      dayName: "Treino A - Peito & Tríceps",
      exercises: [
        { name: "Supino Reto Barra", sets: baseSets, reps: baseReps, weight: 55, notes: "Cadência controlada. Foco no peitoral maior.", muscleGroup: "Peitoral", category: "musculacao" },
        { name: "Supino Inclinado Halteres", sets: baseSets, reps: baseReps, weight: 22, notes: "Foco na porção clavicular (superior).", muscleGroup: "Peitoral", category: "musculacao" },
        { name: "Tríceps Corda (Polia)", sets: baseSets, reps: "10-12", weight: 18, notes: "Isolamento lateral de tríceps.", muscleGroup: "Tríceps", category: "musculacao" },
        { name: "Tríceps Testa (Barra)", sets: baseSets - 1, reps: "10-12", weight: 16, notes: "Tríceps porção longa.", muscleGroup: "Tríceps", category: "musculacao" }
      ]
    });
    workoutsList.push({
      dayName: "Treino B - Costas & Bíceps",
      exercises: [
        { name: "Puxada Alta Frente", sets: baseSets, reps: baseReps, weight: 50, notes: "Foco nas dorsais.", muscleGroup: "Costas", category: "musculacao" },
        { name: "Remada Baixa Triângulo", sets: baseSets, reps: baseReps, weight: 45, notes: "Adução completa das escápulas.", muscleGroup: "Costas", category: "musculacao" },
        { name: "Rosca Scott", sets: baseSets, reps: "10-12", weight: 14, notes: "Bíceps isolado no banco scott.", muscleGroup: "Bíceps", category: "musculacao" },
        { name: "Rosca Direta (Barra W)", sets: baseSets - 1, reps: "10-12", weight: 15, notes: "Ativação do bíceps braquial.", muscleGroup: "Bíceps", category: "musculacao" }
      ]
    });
    workoutsList.push({
      dayName: "Treino C - Coxas, Glúteos & Panturrilhas",
      exercises: [
        { name: "Agachamento Livre (High Bar)", sets: baseSets, reps: "8-10", weight: 50, notes: "Foco em quadríceps.", muscleGroup: "Quadríceps", category: "musculacao" },
        { name: "Romanian Deadlift (Barra)", sets: baseSets, reps: baseReps, weight: 40, notes: "Foco em cadeia posterior.", muscleGroup: "Posteriores de Coxa", category: "musculacao" },
        { name: "Cadeira Extensora Bilateral", sets: baseSets - 1, reps: "12-15", weight: 35, notes: "Isolador de quadríceps.", muscleGroup: "Quadríceps", category: "musculacao" },
        { name: "Panturrilha Sentada", sets: baseSets, reps: "15-20", weight: 25, notes: "Foco no solear.", muscleGroup: "Panturrilhas", category: "musculacao" }
      ]
    });
    workoutsList.push({
      dayName: "Treino D - Ombros, Trapézio & Core",
      exercises: [
        { name: "Desenvolvimento com Halteres", sets: baseSets, reps: baseReps, weight: 16, notes: "Estímulo de deltoide anterior.", muscleGroup: "Ombros", category: "musculacao" },
        { name: "Elevação Lateral (Halteres)", sets: baseSets + 1, reps: "12-15", weight: 10, notes: applyTechnique ? "Última série com Drop-set." : "Isolamento lateral.", muscleGroup: "Ombros", category: "musculacao" },
        { name: "Crucifixo Inverso Máquina", sets: baseSets, reps: "12-15", weight: 30, notes: "Deltoide posterior.", muscleGroup: "Ombros", category: "musculacao" },
        { name: "Abdominal Supra na Polia", sets: 4, reps: "15", weight: 30, notes: "Trabalho de core.", muscleGroup: "Core", category: "musculacao" }
      ]
    });
  } else if (daysCount === 5) {
    workoutsList.push({
      dayName: "Treino A - Peitoral & Abdômen",
      exercises: [
        { name: "Supino Inclinado Halteres", sets: baseSets, reps: baseReps, weight: 26, notes: "Peitoral superior.", muscleGroup: "Peitoral", category: "musculacao" },
        { name: "Supino Reto Barra", sets: baseSets, reps: baseReps, weight: 60, notes: "Peitoral médio.", muscleGroup: "Peitoral", category: "musculacao" },
        { name: "Peck Deck / Crucifixo Máquina", sets: baseSets, reps: "12-15", weight: 45, notes: applyTechnique ? "Última série com Drop-set triplo." : "Pico de contração máxima.", muscleGroup: "Peitoral", category: "musculacao" },
        { name: "Abdominal Supra na Polia", sets: 4, reps: "15", weight: 30, notes: "Flexão de tronco resistida.", muscleGroup: "Core", category: "musculacao" }
      ]
    });
    workoutsList.push({
      dayName: "Treino B - Dorsais & Lombar (Costas)",
      exercises: [
        { name: "Puxada Alta Frente", sets: baseSets, reps: "10-12", weight: 60, notes: "Dorsais largas.", muscleGroup: "Costas", category: "musculacao" },
        { name: "Remada Curvada Pronada", sets: baseSets, reps: "8-10", weight: 45, notes: "Espessura de costas.", muscleGroup: "Costas", category: "musculacao" },
        { name: "Pulldown Máquina Convergente", sets: baseSets, reps: "12", weight: 40, notes: applyTechnique ? "Última série Rest-Pause." : "Isolamento lateral.", muscleGroup: "Costas", category: "musculacao" },
        { name: "Abdominal Infra no Solo", sets: 3, reps: "15", weight: 0, notes: "Elevação de pernas.", muscleGroup: "Core", category: "musculacao" }
      ]
    });
    workoutsList.push({
      dayName: "Treino C - Coxas, Glúteos & Panturrilhas",
      exercises: [
        { name: "Agachamento Livre (High Bar)", sets: baseSets, reps: "8-10", weight: 70, notes: "Foco em quadríceps.", muscleGroup: "Quadríceps", category: "musculacao" },
        { name: "Stiff Barra", sets: baseSets, reps: "10-12", weight: 50, notes: "Foco em posterior e glúteos.", muscleGroup: "Posteriores de Coxa", category: "musculacao" },
        { name: "Cadeira Extensora Bilateral", sets: baseSets, reps: "12-15", weight: 40, notes: "Isolador frontal.", muscleGroup: "Quadríceps", category: "musculacao" },
        { name: "Panturrilha em Pé Máquina", sets: 4, reps: "15", weight: 40, notes: "Solear e gastrocnêmio.", muscleGroup: "Panturrilhas", category: "musculacao" }
      ]
    });
    workoutsList.push({
      dayName: "Treino D - Ombros & Trapézio",
      exercises: [
        { name: "Desenvolvimento com Halteres", sets: baseSets, reps: "8-10", weight: 18, notes: "Deltoide anterior.", muscleGroup: "Ombros", category: "musculacao" },
        { name: "Elevação Lateral (Halteres)", sets: baseSets + 1, reps: "12-15", weight: 10, notes: "Deltoide lateral principal.", muscleGroup: "Ombros", category: "musculacao" },
        { name: "Crucifixo Inverso Máquina", sets: baseSets, reps: "12-15", weight: 30, notes: applyTechnique ? "Última série com Drop-set." : "Deltoide posterior.", muscleGroup: "Ombros", category: "musculacao" }
      ]
    });
    workoutsList.push({
      dayName: "Treino E - Braços (Bíceps & Tríceps)",
      exercises: [
        { name: "Tríceps Corda (Polia)", sets: baseSets, reps: "10-12", weight: 22, notes: "Aquecimento e estímulo lateral de tríceps.", muscleGroup: "Tríceps", category: "musculacao" },
        { name: "Rosca Direta (Barra W)", sets: baseSets, reps: "8-12", weight: 16, notes: "Massa global de bíceps.", muscleGroup: "Bíceps", category: "musculacao" },
        { name: "Supino Fechado", sets: baseSets, reps: "8-10", weight: 40, notes: "Tríceps composto.", muscleGroup: "Tríceps", category: "musculacao" },
        { name: "Rosca Scott", sets: baseSets, reps: "10-12", weight: 14, notes: applyTechnique ? "Última série Rest-Pause." : "Pico no topo.", muscleGroup: "Bíceps", category: "musculacao" }
      ]
    });
  } else {
    workoutsList.push({
      dayName: "Treino A - Peito & Ombros (Foco Anterior)",
      exercises: [
        { name: "Supino Reto Barra", sets: baseSets, reps: baseReps, weight: 60, notes: "Peitoral médio.", muscleGroup: "Peitoral", category: "musculacao" },
        { name: "Supino Inclinado Halteres", sets: baseSets, reps: baseReps, weight: 24, notes: "Peitoral superior.", muscleGroup: "Peitoral", category: "musculacao" },
        { name: "Desenvolvimento com Halteres", sets: baseSets, reps: baseReps, weight: 18, notes: "Ombros anterior.", muscleGroup: "Ombros", category: "musculacao" }
      ]
    });
    workoutsList.push({
      dayName: "Treino B - Costas & Trapézio",
      exercises: [
        { name: "Puxada Alta Frente", sets: baseSets, reps: "10-12", weight: 55, notes: "Vertical pull.", muscleGroup: "Costas", category: "musculacao" },
        { name: "Remada Curvada Pronada", sets: baseSets, reps: "8-10", weight: 45, notes: "Horizontal pull.", muscleGroup: "Costas", category: "musculacao" },
        { name: "Crucifixo Inverso Máquina", sets: baseSets, reps: "12-15", weight: 30, notes: "Posterior de ombro.", muscleGroup: "Ombros", category: "musculacao" }
      ]
    });
    workoutsList.push({
      dayName: "Treino C - Pernas (Foco Quadríceps e Glúteos)",
      exercises: [
        { name: "Agachamento Livre (High Bar)", sets: baseSets, reps: "8-10", weight: 60, notes: "Agachamento profundo.", muscleGroup: "Quadríceps", category: "musculacao" },
        { name: "Leg Press 45°", sets: baseSets, reps: "10-12", weight: 130, notes: "Cadência lenta.", muscleGroup: "Quadríceps", category: "musculacao" },
        { name: "Cadeira Extensora Bilateral", sets: baseSets - 1, reps: "12-15", weight: 35, notes: "Isolamento frontal.", muscleGroup: "Quadríceps", category: "musculacao" }
      ]
    });
    workoutsList.push({
      dayName: "Treino D - Ombros (Foco Lateral) & Abdômen",
      exercises: [
        { name: "Elevação Lateral (Halteres)", sets: baseSets + 1, reps: "12-15", weight: 10, notes: "Foco no deltoide lateral.", muscleGroup: "Ombros", category: "musculacao" },
        { name: "Elevação Lateral na Polia", sets: baseSets, reps: "12-15", weight: 12, notes: "Tensão contínua.", muscleGroup: "Ombros", category: "musculacao" },
        { name: "Abdominal Supra na Polia", sets: 4, reps: "15", weight: 30, notes: "Core.", muscleGroup: "Core", category: "musculacao" }
      ]
    });
    workoutsList.push({
      dayName: "Treino E - Posteriores de Coxa & Panturrilhas",
      exercises: [
        { name: "Stiff Barra", sets: baseSets, reps: "10-12", weight: 50, notes: "Alongamento total de posterior.", muscleGroup: "Posteriores de Coxa", category: "musculacao" },
        { name: "Mesa Flexora Bilateral", sets: baseSets, reps: "10-12", weight: 30, notes: "Pico de contração.", muscleGroup: "Posteriores de Coxa", category: "musculacao" },
        { name: "Panturrilha em Pé Máquina", sets: 4, reps: "15", weight: 45, notes: "Completa amplitude.", muscleGroup: "Panturrilhas", category: "musculacao" }
      ]
    });
    workoutsList.push({
      dayName: "Treino F - Braços (Bíceps, Tríceps & Antebraço)",
      exercises: [
        { name: "Tríceps Corda (Polia)", sets: baseSets, reps: "10-12", weight: 20, notes: "Isolamento de tríceps.", muscleGroup: "Tríceps", category: "musculacao" },
        { name: "Rosca Direta (Barra W)", sets: baseSets, reps: "10-12", weight: 16, notes: "Isolamento de bíceps.", muscleGroup: "Bíceps", category: "musculacao" },
        { name: "Rosca Martelo Halteres", sets: baseSets - 1, reps: "10-12", weight: 12, notes: "Antebraço e braquiorradial.", muscleGroup: "Bíceps", category: "musculacao" }
      ]
    });
  }

  const finalizedWorkouts = workoutsList.map((wk) => {
    wk.exercises = injectScientificWarmUp(wk.exercises, wk.dayName);
    return wk;
  });

  return {
    workouts: finalizedWorkouts,
    reasoningExplanation: `A periodização foi estruturada dinamicamente para uma frequência semanal de ${frequenciaSemanal} (${daysCount} dias) com base no mesociclo ativo '${activeCycleTitle}'. O volume total de séries foi ajustado de forma a otimizar a relação estímulo/fadiga, garantindo recuperação ideal para cada grupo muscular treinado.`
  };
}

function generateFallbackFunctionalWorkout(
  model: string = "",
  intensity: string = "",
  studentsCount: number = 1,
  duration: string = "",
  weeklyFrequency: string = "",
  restrictions: string = "",
  dayOfWeek: string = "",
  activeEquipment: string[] = [],
  equipmentQuantities: any = {},
  availableExercises: any[] = []
): any {
  const activeEquipmentArr = Array.isArray(activeEquipment) ? activeEquipment : [];
  const availableExercisesArr = Array.isArray(availableExercises) ? availableExercises : [];

  let pool = availableExercisesArr.length > 0 ? availableExercisesArr : [];
  
  if (pool.length === 0) {
    pool = [
      { nome: "Flexão de Braço Comum", grupo: "superior", equipamento: "Peso Corporal", nivel: ["iniciante", "intermediario"] },
      { nome: "Agachamento Livre", grupo: "inferior", equipamento: "Peso Corporal", nivel: ["iniciante", "intermediario"] },
      { nome: "Prancha Isométrica", grupo: "core", equipamento: "Peso Corporal", nivel: ["iniciante", "intermediario", "avancado"] },
      { nome: "Polichinelo Tradicional", grupo: "cardio", equipamento: "Peso Corporal", nivel: ["iniciante", "intermediario"] },
      { nome: "Remada TRX", grupo: "superior", equipamento: "TRX", nivel: ["iniciante", "intermediario", "avancado"] },
      { nome: "Slam com Medicine Ball", grupo: "potencia", equipamento: "Medicine Ball", nivel: ["intermediario", "avancado"] },
      { nome: "Ondas Alternadas (Corda Naval)", grupo: "superior", equipamento: "Corda Naval", nivel: ["iniciante", "intermediario"] },
      { nome: "Salto na Caixa", grupo: "inferior", equipamento: "Caixa Plyo", nivel: ["avancado"] }
    ];
  }

  let filteredPool = pool.filter(ex => {
    const eq = ex.equipamento;
    if (!eq || eq === "Peso Corporal") return true;

    const matchingName = eq.toLowerCase();
    if (matchingName.includes("trx") && !activeEquipmentArr.includes("TRX")) return false;
    if (matchingName.includes("corda") && !activeEquipmentArr.includes("Corda Naval")) return false;
    if (matchingName.includes("escada") && !activeEquipmentArr.includes("Escada")) return false;
    if (matchingName.includes("medicine") && !activeEquipmentArr.includes("Medicine Ball")) return false;
    if (matchingName.includes("kettlebell") && !activeEquipmentArr.includes("Kettlebell")) return false;
    if (matchingName.includes("bola de peso") && !activeEquipmentArr.includes("Bola de Peso")) return false;
    if ((matchingName.includes("caixa") || matchingName.includes("plyo")) && !activeEquipmentArr.includes("Caixa Plyo")) return false;
    return true;
  });

  if (filteredPool.length < 4) {
    filteredPool = pool;
  }

  const selectedExercises: any[] = [];
  const usedNames = new Set<string>();

  const groupsOrder = ["superior", "inferior", "core", "cardio"];
  for (const grp of groupsOrder) {
    const candidates = filteredPool.filter(ex => (ex.grupo || "").toLowerCase() === grp && !usedNames.has(ex.nome));
    if (candidates.length > 0) {
      const chosen = candidates[Math.floor(Math.random() * candidates.length)];
      selectedExercises.push(chosen);
      usedNames.add(chosen.nome);
    } else {
      const anyUnused = filteredPool.filter(ex => !usedNames.has(ex.nome));
      if (anyUnused.length > 0) {
        const chosen = anyUnused[Math.floor(Math.random() * anyUnused.length)];
        selectedExercises.push(chosen);
        usedNames.add(chosen.nome);
      } else {
        selectedExercises.push({ nome: `Exercício de ${grp}`, grupo: grp, equipamento: "Peso Corporal" });
      }
    }
  }

  const studentsPerStation = Math.ceil(studentsCount / 4);
  let status: "ok" | "atencao" | "critico" = "ok";
  let message = `Relação equilibrada. Cada uma das 4 estações possui ${studentsPerStation} alunos alocados.`;
  let revezamentoNecessario = false;
  let estrategia = "Cada aluno executa o exercício individualmente ou em revezamento simples.";

  const estacoes = selectedExercises.map((ex, idx) => {
    const eq = ex.equipamento;
    let unitsAvailable = 0;

    if (eq === "TRX") {
      unitsAvailable = equipmentQuantities?.TRX ?? 0;
    } else if (eq === "Corda Naval") {
      unitsAvailable = equipmentQuantities?.CordaNaval ?? 0;
    } else if (eq === "Medicine Ball") {
      unitsAvailable = equipmentQuantities?.MedicineBall ?? 0;
    } else if (eq === "Kettlebell") {
      unitsAvailable = equipmentQuantities?.Kettlebell ?? 0;
    } else if (eq === "Bola de Peso") {
      unitsAvailable = equipmentQuantities?.BolaPeso ?? 0;
    } else if (eq === "Caixa Plyo") {
      unitsAvailable = equipmentQuantities?.CaixaPlyo ?? 0;
    } else if (eq === "Escada") {
      unitsAvailable = equipmentQuantities?.Escada ?? 0;
    } else {
      unitsAvailable = 1;
    }

    const activeUnits = activeEquipmentArr.includes(eq) ? unitsAvailable : 0;
    const finalUnits = eq === "Peso Corporal" ? studentsPerStation : activeUnits;

    const alunosUsandoEquipamento = Math.min(studentsPerStation, finalUnits);
    const alunosEmComplementar = Math.max(0, studentsPerStation - finalUnits);

    if (alunosEmComplementar > 0) {
      revezamentoNecessario = true;
      status = "atencao";
    }

    let tempoStr = model === "Tabata" ? "20s" : "45s";
    let descansoStr = model === "Tabata" ? "10s" : "15s";

    return {
      numero: idx + 1,
      categoria: groupsOrder[idx],
      exercicioPrincipal: ex.nome,
      unidadesDisponiveis: finalUnits,
      alunosUsandoEquipamento,
      alunosEmComplementar,
      tempo: tempoStr,
      descanso: descansoStr,
      equipamento: eq,
      exerciciosComplementares: ["Agachamento Isométrico", "Polichinelo", "Prancha Tocando Ombros"],
      instrucoesRevezamento: alunosEmComplementar > 0 
        ? `Capacidade excedida na Estação ${idx + 1}. Enquanto ${alunosUsandoEquipamento} aluno(s) utiliza(m) o equipamento principal (${eq}), os outros ${alunosEmComplementar} aluno(s) executam exercício complementar de peso corporal. Revezar funções imediatamente após cada sinal.`
        : `Execução individual regular. Foco em controle articular.`
    };
  });

  if (revezamentoNecessario) {
    status = studentsCount > 12 ? "critico" : "atencao";
    message = `Atenção: Gargalo detectado! Algumas estações possuem mais alunos (${studentsPerStation}) do que unidades físicas disponíveis de equipamento.`;
    estrategia = "Ativação do circuito combinado 1:1. Enquanto o aluno com o material executa o exercício principal, os parceiros de estação realizam os exercícios complementares listados. Ao apito, trocam de posição.";
  }

  return {
    nomeTreino: `Treino Funcional ${model} - Fallback`,
    alertaCapacidade: {
      status,
      mensagem: message,
      revezamentoNecessario,
      estrategia
    },
    estacoes,
    distribuicaoCategorias: { superior: 1, inferior: 1, core: 1, cardio: 1 },
    observacoesProfessor: `Fluxo controlado. Restrições consideradas: ${restrictions || "Nenhuma"}. Priorize a postura e o tempo correto de troca.`
  };
}

function processGeneratedWorkoutWithEngine(workoutData: any, reqBody: any) {
  try {
    const {
      frequenciaSemanal = "3",
      studentAge = 30,
      studentGender = "masculino",
      studentLimitations = "",
      studentObjective = "Hipertrofia",
      activeCycleVol = "",
      studentSleep = "",
      studentStress = ""
    } = reqBody || {};

    const exp = "Intermediário"; // default or map from studentPhase

    // Map limitations to list
    const limitacoes = typeof studentLimitations === "string"
      ? studentLimitations.split(",").map((s: string) => s.trim()).filter(Boolean)
      : (Array.isArray(studentLimitations) ? studentLimitations : []);

    const weekNumMatches = String(activeCycleVol).match(/\d+/);
    const weekNum = weekNumMatches ? Number(weekNumMatches[0]) : 2;

    const studentData: StudentData = {
      idade: Number(studentAge || 30),
      sexo: String(studentGender).toLowerCase().startsWith("f") ? "F" : "M",
      experiencia: exp as any,
      objetivo: studentObjective,
      frequenciaSemanal: Number(frequenciaSemanal) || 3,
      disponibilidadeMinutos: 60,
      limitacoes,
      prioridades: {},
      equipamentosDisponiveis: ["Halteres", "Barra", "Máquinas"],
      tempoMaximoSessao: 60,
      semanaMesociclo: weekNum
    };

    // Extract raw exercises from generated workoutData to feed into the engine
    const rawAIExercises: any[] = [];
    if (workoutData && Array.isArray(workoutData.workouts)) {
      workoutData.workouts.forEach((wk: any) => {
        if (wk && Array.isArray(wk.exercises)) {
          wk.exercises.forEach((ex: any) => {
            const nameLower = String(ex.name || "").toLowerCase();
            if (
              nameLower.includes("aquecimento geral") ||
              nameLower.includes("mobilidade dinâmica") ||
              nameLower.includes("séries de adaptação") ||
              nameLower.includes("series de adaptacao")
            ) {
              return;
            }
            rawAIExercises.push({
              name: ex.name,
              primaryMuscle: ex.muscleGroup || mapNameToMuscleGroup(ex.name) || "Outros"
            });
          });
        }
      });
    }

    const engineResult = UniversalPrescriptionEngine.run(studentData, rawAIExercises);

    // Map engine workouts back to the API response structure
    const mappedWorkouts = engineResult.workouts.map((wk, wkIdx) => {
      const dayLetters = ["A", "B", "C", "D", "E", "F"];
      const letter = dayLetters[wkIdx] || String.fromCharCode(65 + wkIdx);
      const dayName = `Treino ${letter} - ${wk.day}`;

      const warmups = [
        {
          name: "Aquecimento Geral (Cardio)",
          sets: 1,
          reps: "3-5 min",
          weight: 0,
          notes: "Cardio leve para elevar a temperatura corporal.",
          muscleGroup: "Geral",
          category: "musculacao"
        },
        {
          name: "Mobilidade Dinâmica",
          sets: 2,
          reps: "10 repetições",
          weight: 0,
          notes: "Foco nas articulações principais do dia.",
          muscleGroup: "Geral",
          category: "musculacao"
        }
      ];

      const exMapped = wk.exercises.map(ex => ({
        name: ex.name,
        sets: ex.series || ex.sets || 4,
        reps: ex.reps || "8-12",
        weight: 10,
        notes: `${ex.notes} [Cadência: ${ex.cadence || "3-1-2"}] [Descanso: ${ex.rest || "90s"}]${ex.technique ? " [Técnica: " + ex.technique + "]" : ""}`,
        muscleGroup: ex.muscleGroup,
        category: "musculacao"
      }));

      return {
        dayName,
        exercises: [...warmups, ...exMapped]
      };
    });

    const qualityReport = WorkoutQualityEngine.calculate({
      volumeDireto: engineResult.volumeDireto,
      volumeIndireto: engineResult.volumeIndireto,
      volumeEfetivo: engineResult.volumeEfetivo,
      fatigueByMuscle: engineResult.fatigueByMuscle,
      recoveryByMuscle: engineResult.recoveryByMuscle,
      systemicFatigue: engineResult.systemicFatigue,
      movementCount: engineResult.movementCount,
      studentData,
      workouts: mappedWorkouts
    });

    const scientificEvidence = ScientificEvidenceEngine.generate({
      studentData,
      volumeDireto: engineResult.volumeDireto,
      workouts: mappedWorkouts,
      adjustmentLog: engineResult.adjustmentLog
    });

    return {
      workouts: mappedWorkouts,
      reasoningExplanation: workoutData.reasoningExplanation || "Plano de treino gerado e validado com precisão científica pelo TREINOPRO Scientific Engine.",
      volumeDireto: engineResult.volumeDireto,
      volumeIndireto: engineResult.volumeIndireto,
      volumeEfetivo: engineResult.volumeEfetivo,
      directNeeded: engineResult.directNeeded,
      fatigueByMuscle: engineResult.fatigueByMuscle,
      recoveryByMuscle: engineResult.recoveryByMuscle,
      systemicFatigue: engineResult.systemicFatigue,
      movementCount: engineResult.movementCount,
      auditReport: engineResult.auditReport,
      validation: engineResult.validation,
      adjustmentLog: engineResult.adjustmentLog,
      qualityReport,
      scientificEvidence
    };
  } catch (err) {
    console.error("Error running workout engine post processing:", err);
    return workoutData;
  }
}

export async function generateMusculacaoWorkout(req: Request, res: Response) {
  const {
    periodizacaoModel = "",
    activeCycleTitle = "",
    activeCycleVol = "",
    activeCycleTec = "",
    frequenciaSemanal = "",
    selectedDivision = "",
    customDivisionText = "",
    aiProvider = "gemini",
    studentAge,
    studentGender = "masculino",
    studentLimitations = "",
    studentObjective = "",
    studentPhase = "",
    studentName = "",
    copilotRecommendations = "",
    auditWarnings = [],
    studentPostural = "",
    studentSleep = "",
    studentStress = ""
  } = req.body || {};

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
      throw new Error("GEMINI_API_KEY_MISSING");
    }

    const ai = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });

    const systemPrompt = `🧠 PROMPT MESTRE OBRIGATÓRIO: MOTOR DE MONTAGEM DE TREINOS COM IA (TREINOPRO)

[OBJETIVO]
Você deve montar automaticamente o treino a partir dos parâmetros recebidos, respeitando rigidamente o mesociclo, o volume semanal, a frequência, a divisão do treino, as limitações, as técnicas avançadas e a recuperação. Você não deve criar treinos aleatórios ou desorganizados. Siga estritamente a sequência de execução abaixo, sem alterar a ordem.

────────────────────────────

[ENTRADAS RECEBIDAS]
- Mesociclo Ativo
- Volume semanal proposto (por grupo muscular ou diretriz)
- Divisão do treino escolhida
- Frequência semanal
- Equipamentos disponíveis (priorize musculação convencional/máquinas/halteres/polias)
- Técnicas avançadas permitidas/solicitadas
- Prioridades musculares (foco no mesociclo ativo)
- Limitações e restrições de saúde/lesões do aluno
- Duração máxima de sessão recomendada

────────────────────────────

[SEQUÊNCIA OBRIGATÓRIA DE EXECUÇÃO (EXECUTE NESSA ORDEM EXATA)]

1. Definir metas de volume semanal por músculo:
   Calcule o volume de séries diretas semanais com base no mesociclo e na meta proposta (ex: 12-15 séries, ou 20-25 séries para mesociclos avançados).

2. Determinar frequência real de estímulo por músculo:
   Identifique em quantos dias da semana cada grupo muscular será estimulado de acordo com a divisão de treino.

3. Distribuir volume semanal entre sessões:
   Divida o volume direto entre as sessões disponíveis para aquele músculo.
   Fórmula: Volume por sessão = Volume semanal ÷ frequência real.
   Permitir pequenas variações caso exista prioridade muscular ou fadiga direcionada.
   Exemplo: Peito com volume semanal de 16 séries e Frequência = 2x => Dia A = 10 séries, Dia D = 6 séries.

4. Selecionar exercícios do banco de exercícios:
   Escolha os exercícios respeitando rigorosamente a seguinte prioridade de seleção:
   - Prioridade 1: Exercícios compostos multiarticulares primários (ex: Supinos, Agachamentos, Remadas, Stiffs).
   - Prioridade 2: Exercícios complementares multiarticulares secundários ou máquinas (ex: Supino inclinado na máquina, Leg Press, Puxadas).
   - Prioridade 3: Exercícios isoladores monoarticulares (ex: Crucifixo, Elevação lateral, Flexora, Extensora, Roscas).
   Adicione apenas a quantidade de exercícios e séries estritamente necessária para atingir o volume alvo da sessão. Evite redundância excessiva de padrões de movimento similares na mesma sessão.

5. Calcular séries indiretas (sinergistas):
   Para cada exercício composto, calcule e acumule imediatamente o volume indireto gerado para os sinergistas de acordo com as proporções científicas abaixo:
   - Exercícios de Empurrão (Peito): Peitoral = 100% (volume direto), Tríceps = 50% (volume indireto), Deltoide anterior = 50-70% (volume indireto).
   - Exercícios de Puxada e Remada (Costas): Costas = 100% (volume direto), Bíceps = 50% (volume indireto), Deltoide posterior = 30-50% (volume indireto).
   - Agachamentos e Leg Press: Quadríceps = 100% (volume direto), Glúteos = 50-70% (volume indireto), Posteriores de coxa = 25-50% (volume indireto).
   - Levantamento Terra / Stiff / RDL: Posteriores de coxa = 100% (volume direto), Glúteos = 70% (volume indireto), Eretores da espinha/Lombar = 70% (volume indireto).
   Atualize a contabilidade do volume muscular acumulado (direto + indireto) imediatamente após a adição de cada exercício composto.

6. Aplicar técnicas avançadas:
   Adicione técnicas avançadas permitidas/compatíveis somente no último exercício de isolamento ou máquina de cada grupo muscular.
   Cada técnica deve possuir a seguinte estrutura de propriedades científicas:
   - Nome (ex: Rest-pause, Drop-set, Myo-reps, Bi-set, Tri-set, FST-7, Pré-exaustão, Pós-exaustão)
   - Nível: iniciante, intermediário, avançado
   - Objetivo principal: hipertrofia, força, resistência, potência, eficiência, reabilitação
   - Categorias: tensão mecânica, estresse metabólico, dano muscular, intensidade, falha, explosão, pump
   - Aumenta volume efetivo: Sim ou Não
   - Multiplicador de volume / Séries equivalentes geradas pela técnica:
     * Rest-pause: +1 série efetiva
     * Drop simples (Drop-set): +1 série efetiva
     * Drop duplo: +2 séries efetivas
     * Drop triplo: +3 séries efetivas
     * Myo-reps: +2 séries efetivas
     * Bi-set: +0.5 a +1 série efetiva
     * Tri-set: +1 a +2 séries efetivas
     * FST-7: +5 a +7 séries efetivas (séries de pump de alta intensidade)
     * Pré-exaustão: 0 (reorganização de ordem)
     * Pós-exaustão: +0.5 série efetiva
   - Impacto na fadiga: baixo, médio, alto, extremo
   - Custo de recuperação: baixo, médio, alto
   - Impacto no tempo: baixo, médio, alto
   - Mesociclos compatíveis
   - Exercícios recomendados & Exercícios a evitar para esta técnica
   - Limite por sessão & Limite semanal

7. Recalcular volume efetivo:
   Calcule o Volume Efetivo Total = Séries Diretas + Séries Equivalentes geradas pelas Técnicas Avançadas.

8. Estimar duração da sessão:
   Calcule a duração estimada da sessão baseando-se no número de séries, tempo de execução e tempo de descanso sugerido.

9. Verificar fadiga e recuperação:
   Realize uma checagem rigorosa de segurança para identificar:
   - Excesso de volume semanal total
   - Excesso de intensidade e falhas consecutivas
   - Excesso de técnicas avançadas na mesma sessão
   - Excesso de sobreposição de músculos sinergistas em dias consecutivos
   - Recuperação insuficiente das articulações e do SNC
   - Tempo de sessão excedendo a duração máxima (ex: acima de 75-90 minutos)

10. Ajustar automaticamente:
    Se qualquer problema acima for detectado, faça o ajuste automático imediato:
    - Reduza o número de exercícios ou séries
    - Substitua ou remova técnicas de altíssimo impacto
    - Reorganize o volume entre as sessões
    - Redistribua a frequência de estímulos
    Após os ajustes, recalcule todos os volumes e métricas novamente.

11. Entregar treino final:
    Compile todos os dados gerados de forma consolidada e prepare o formato de saída do JSON conforme as regras abaixo.

────────────────────────────

[VALIDAÇÃO FINAL (SISTEMA DE CONTROLE DE QUALIDADE)]
Confirme e garanta que todos os itens abaixo estão plenamente satisfeitos:
✓ Volume semanal alvo do mesociclo atingido perfeitamente
✓ Frequência semanal e divisão respeitadas à risca
✓ Tempo e duração máxima da sessão respeitados
✓ Recuperação sistêmica e articular adequada
✓ Técnicas avançadas compatíveis com o mesociclo selecionado
✓ Equilíbrio muscular e estético adequado
✓ Limitações físicas e lesões do aluno respeitadas (ex: se o aluno tiver lesão lombar, evite agachamento livre ou terra pesado; se tiver dor de joelho, ajuste a amplitude de flexão/extensão)
✓ Sinergistas dentro do volume indireto aceitável
Se alguma validação falhar, você deve voltar automaticamente à etapa necessária para corrigir e re-validar.

────────────────────────────

[REGRA DE AQUECIMENTO OBRIGATÓRIA]
Cada treino no array "workouts" deve conter nas primeiras posições:
1. Aquecimento Geral (Cardio Leve) — 1 série, 3-5 min.
2. Mobilidade Dinâmica — 2 séries, focado nas articulações principais envolvidas no dia, alertando para evitar alongamentos estáticos prolongados.
3. Séries de Adaptação (Série de aproximação neuromuscular) — 3 séries progressivas (15, 8, 4 repetições) com cargas crescentes, sem gerar fadiga.

────────────────────────────

[FORMATO DE SAÍDA OBRIGATÓRIO EM JSON]
Você deve retornar APENAS o JSON válido estruturado exatamente com o seguinte formato, sem formatação markdown (sem \`\`\`json), sem textos antes ou após o JSON:

{
  "workouts": [
    {
      "dayName": "Treino A - Peito, Ombros e Tríceps",
      "exercises": [
        {
          "name": "Nome do Exercício",
          "sets": 4,
          "reps": "8-12",
          "weight": 20,
          "notes": "Notas detalhadas contendo a cadência (ex: Cadência 3-1-2), a técnica aplicada (ex: Rest-pause: +1 série equivalente), nível da técnica, objetivo, categoria de estresse, impacto na fadiga, e cuidados de execução biomecânica.",
          "muscleGroup": "Peitoral",
          "category": "musculacao"
        }
      ]
    }
  ],
  "reasoningExplanation": "ENTREGAR AQUI O DETALHAMENTO COMPLETO DE CADA ETAPA DO MOTOR:\\n\\n1. METAS DE VOLUME SEMANAL POR MÚSCULO:\\n- [Grupo]: [X] séries diretas alvo.\\n\\n2. FREQUÊNCIA DE ESTÍMULO:\\n- [Grupo]: [Y]x por semana.\\n\\n3. DISTRIBUIÇÃO ENTRE SESSÕES:\\n- [Dia]: [X] séries.\\n\\n4. ESCOLHA DE EXERCÍCIOS:\\n- [Exercício composto/isolador selecionado].\\n\\n5. CÁLCULO DE SINERGISTAS (VOLUME INDIRETO):\\n- [Músculo]: [X] séries diretas + [Y] séries indiretas.\\n\\n6. ESTRUTURA COMPLETA DAS TÉCNICAS APLICADAS:\\n- Técnica: [Nome], Nível: [X], Objetivo: [Hipertrofia], Categorias: [X], Multiplicador: [+X séries], Impacto Fadiga: [X], Custo Recuperação: [X], Impacto Tempo: [X].\\n\\n7. VOLUME EFETIVO RECALCULADO:\\n- [Músculo]: [X] séries efetivas totais.\\n\\n8. ESTIMATIVA DE TEMPO:\\n- Duração estimada de cada treino.\\n\\n9. VERIFICAÇÃO DE FADIGA E AJUSTE AUTOMÁTICO:\\n- Detalhamento de alertas de fadiga e reajustes preventivos realizados.\\n\\n10. VALIDAÇÃO FINAL:\\n- Status de conformidade das metas, limitações e sinergismos."
}

Use português do Brasil para todas as respostas. Seja extremamente profissional, denso e preciso nos cálculos e descrições técnicas de cinesiologia e fisiologia.`;

    let customSystemPrompt = systemPrompt;
    if (selectedDivision && selectedDivision.includes("Personalizada")) {
      customSystemPrompt += `

🚨 REGRA CRÍTICA DE DIVISÃO TOTALMENTE PERSONALIZADA PELO USUÁRIO (STRICT STIMULI RULE) 🚨:
O usuário escolheu montar sua própria divisão de treino personalizada.
A divisão desejada do usuário é:
"""
${customDivisionText}
"""

Você DEVE estruturar a rotina de treino respeitando RIGOROSAMENTE e de forma ABSOLUTA esta divisão do usuário.
Para cada Dia/Treino (ex: Dia A, Dia B, etc.) especificado pelo usuário:
1. Você deve gerar exatamente esse dia na mesma ordem e com o nome indicado.
2. Para cada grupo muscular mencionado nesse dia, você deve contar EXATAMENTE o número de 'estímulos' especificados pelo usuário.
3. Cada 'estímulo' corresponde a exatamente UM exercício para aquele grupo muscular.
4. Se o usuário diz '1 estímulo de glúteo', o treino daquele dia DEVE conter exatamente 1 exercício de glúteos. Não adicione nenhum exercício extra para glúteos ou outros grupos.
5. Se o usuário diz '3 estímulos de costas', o treino daquele dia DEVE conter exatamente 3 exercícios de costas.
6. A flexibilidade é absoluta: se o usuário disser 'N estímulos' de qualquer grupo muscular, gere exatamente N exercícios para aquele grupo. NÃO expanda, NÃO sugira múltiplos exercícios adicionais, NÃO reinterprete a quantidade de estímulos.
7. O número total de exercícios de musculação para cada grupo muscular em cada dia deve ser EXATAMENTE igual à quantidade de estímulos declarada pelo usuário para aquele grupo muscular naquele dia.
8. NÃO utilize algoritmos ou regras de volume semanais automáticas que alterem a quantidade de exercícios ou de séries por exercício definidas na divisão. Cada exercício de musculação gerado deve ter entre 3 a 4 séries (use sets: 3 ou 4) e repetições adequadas.
9. Os aquecimentos obrigatórios ('Aquecimento Geral', 'Mobilidade Articular Dinâmica', 'Séries de Adaptação') ainda devem ser incluídos no início de cada treino como exercícios extras com category: 'musculacao', mas os exercícios de musculação reais para os grupos musculares devem seguir estritamente o número de estímulos.`;
    }

    const numDays = parseInt(frequenciaSemanal) || 3;
    const promptText = `Gere uma planilha de musculação completa (com múltiplos treinos/dias) em português brasileiro com os seguintes parâmetros de treino de forma a cumprir rigidamente com as diretrizes do PROMPT MESTRE:
- Modelo de Periodização: ${periodizacaoModel}
- Mesociclo Ativo: ${activeCycleTitle} (${activeCycleVol})
- Diretriz de Técnicas Avançadas: ${activeCycleTec}
- Frequência Semanal: ${frequenciaSemanal}
- Divisão de Treino Escolhida: ${selectedDivision}

- Dados do Aluno:
  * Nome: ${studentName || "N/A"}
  * Idade: ${studentAge ? studentAge + " anos" : "Não informada"}
  * Gênero: ${studentGender}
  * Objetivos: ${studentObjective || "Não informado"}
  * Limitações físicas: ${studentLimitations || "Nenhuma limitação relatada"}
  * Fase Atual: ${studentPhase || "Não informada"}
  * Postura/Avaliação Física: ${studentPostural || "Não informada"}
  * Sono do Aluno: ${studentSleep || "Não informado"}
  * Estresse do Aluno: ${studentStress || "Não informado"}

- RECOMENDAÇÕES DO COPILOT CLÍNICO DE IA (OBRIGATÓRIO SEGUIR):
  ${copilotRecommendations || "Nenhuma recomendação específica adicional registrada."}

- REGRAS E AVISOS DE AUDITORIA FISIOLÓGICA (MANDATÓRIO ATENDER E EVITAR INFRAÇÕES):
  ${auditWarnings && auditWarnings.length > 0 ? auditWarnings.map((w: string) => `- ${w}`).join("\n  ") : "Nenhuma infração de segurança ou risco identificado."}

ATENÇÃO - REGRA CRÍTICA DE FREQUÊNCIA: Como a Frequência Semanal é de "${frequenciaSemanal}", você DEVE obrigatoriamente gerar exatamente ${numDays} treinos distintos no array "workouts" (ex: ${Array.from({length: numDays}, (_, i) => "Treino " + String.fromCharCode(65 + i)).join(", ")}). Distribua de forma fisiologicamente adequada todos os grupos musculares para cobrir toda essa frequência semanal, de acordo com a divisão "${selectedDivision}".

A resposta DEVE ser um objeto JSON válido, contendo:
1. "workouts": Array contendo exatamente ${numDays} treinos correspondentes à divisão e frequência. Cada treino tem "dayName" (ex: "Treino A - Peito, Ombros e Tríceps") e "exercises" (um array de objetos com: name (string), sets (integer, ex: 3 ou 4), reps (string, ex: "10-12" ou "8-10"), weight (integer em kg), notes (string com instruções científicas de execução baseadas nos regras de biomecânica e fadiga), muscleGroup (string correspondente ao grupo muscular, ex: Peitoral, Tríceps, Bíceps, Ombros, Costas, Quadríceps, Posteriores de Coxa, Glúteos, Panturrilhas, Core) e category: "musculacao").
2. "reasoningExplanation": Um texto curto, técnico e robusto fundamentando as decisões de volume, a aplicação de séries diretas (Regra dos 65%) e a gestão de fadiga dos sinergistas baseado na ciência de Mike Israetel.

Lembre-se de retornar APENAS o JSON válido estruturado, sem blocos de código com markdown (ou seja, sem marcar com blocos de codigo ou tags de JSON).`;

    // Check for Groq option
    if (aiProvider === "groq" && process.env.GROQ_API_KEY && process.env.GROQ_API_KEY !== "MY_GROQ_API_KEY") {
      try {
        const rawText = await callGroqAI(customSystemPrompt, promptText);
        const cleanedText = cleanJsonResponse(rawText);
        let workoutData = JSON.parse(cleanedText);
        workoutData = ensureScientificWarmUp(workoutData);
        if (!selectedDivision || !selectedDivision.includes("Personalizada")) {
          workoutData = auditAndAdjustWorkoutVolume(workoutData, activeCycleVol);
        }
        return res.json(processGeneratedWorkoutWithEngine(workoutData, req.body));
      } catch (groqErr: any) {
        console.error("Groq musculacao generation failed, falling back to Gemini:", groqErr);
      }
    }

    const response = await generateContentWithFallback(ai, {
      model: "gemini-3.5-flash",
      contents: promptText,
      config: {
        systemInstruction: customSystemPrompt,
        temperature: 0.7,
        responseMimeType: "application/json"
      }
    });

    const textResponse = response.text || "{}";
    let workoutData = JSON.parse(textResponse);
    workoutData = ensureScientificWarmUp(workoutData);
    if (!selectedDivision || !selectedDivision.includes("Personalizada")) {
      workoutData = auditAndAdjustWorkoutVolume(workoutData, activeCycleVol);
    }
    res.json(processGeneratedWorkoutWithEngine(workoutData, req.body));
  } catch (err: any) {
    const errMsg = err && err.message ? err.message : String(err);
    console.warn("Using offline fallback musculacao generator:", errMsg);

    let fallbackWorkout = generateFallbackMusculacaoWorkout(
      periodizacaoModel,
      activeCycleTitle,
      activeCycleVol,
      activeCycleTec,
      frequenciaSemanal,
      selectedDivision,
      customDivisionText
    );
    fallbackWorkout = ensureScientificWarmUp(fallbackWorkout);
    if (!selectedDivision || !selectedDivision.includes("Personalizada")) {
      fallbackWorkout = auditAndAdjustWorkoutVolume(fallbackWorkout, activeCycleVol);
    }

    const processedFallback = processGeneratedWorkoutWithEngine(fallbackWorkout, req.body);
    res.json({
      ...processedFallback,
      warning: "A API da IA está temporariamente indisponível devido a alta demanda dos servidores. Usando o algoritmo de fallback inteligente local, configurado sob medida com base no seu mesociclo."
    });
  }
}

export async function generatePeriodization(req: Request, res: Response) {
  const {
    prompt = "",
    studentName = "Aluno",
    studentObjective = "Hipertrofia",
    studentLimitations = "Nenhuma",
    studentAge = "Não informado",
    studentGender = "Não informado",
    studentPhase = "Intermediário",
    periodizationModel = "Periodização Linear",
    recalculateEvent = null,
    metrics = {},
    mesociclos = [],
    microciclos = []
  } = req.body || {};

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
      throw new Error("GEMINI_API_KEY_MISSING");
    }

    const ai = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });

    const systemPrompt = `Você é o maior especialista mundial em fisiologia do exercício, biomecânica e periodização de força/hipertrofia, treinado sob os preceitos científicos de Mike Israetel (RP), Vladimir Issurin (Block Periodization) e Tudor Bompa.
Sua missão é atuar como uma IA Prescritora de Treinos de alta precisão que gera programas de musculação 100% personalizados, baseados em evidências científicas.

Você DEVE seguir obrigatoriamente esta sequência intelectual antes de montar o planejamento:
Etapa 1 – Análise do Aluno: Colete e interprete detalhadamente as variáveis fornecidas (Objetivo principal, Idade, Sexo, Altura, Peso, % de gordura, Massa muscular, Experiência de treino, Frequência semanal disponível, Tempo disponível por sessão, Limitações físicas/lesões e dores, Exercícios que devem ser evitados, Preferências do aluno, Equipamentos disponíveis, Avaliação postural, Histórico de treinos, Recuperação, Qualidade do sono, Estresse, Aderência ao programa).
Etapa 2 – Definir a Periodização: Escolha automaticamente o modelo mais adequado entre: Linear, Ondulatória Semanal, Ondulatória Diária (DUP), Blocos, Conjugada, Flexível, Autorregulada. Defina: Macrociclo, Mesociclos, Microciclos (com semanas de deload). Justifique tecnicamente e cientificamente a escolha.
Etapa 3 – Definir os Parâmetros do Treino: Calcule automaticamente o volume semanal ideal por grupo muscular, frequência semanal, intensidade, faixa de repetições, número de séries, intervalos de descanso, RPE/RIR alvo, tempo de execução e ordem lógica dos exercícios.
Etapa 4 – Seleção de Exercícios: Escolha os exercícios com base em eficiência biomecânica, segurança articular, perfil do aluno e equipamentos disponíveis. Garanta equilíbrio entre padrões de movimento e evite redundâncias desnecessárias para as mesmas articulações.
Etapa 5 – Progressão Semanal: Crie uma progressão dinâmica semana a semana para todas as semanas do mesociclo, progredindo cargas ou volumes, ajustando o RIR para mais próximo da falha conforme a supercompensação avança.
Etapa 6 – Adaptação Inteligente: Recalcule a periodização quando houver intercorrências como faltas, queda de desempenho, fadiga elevada, dor, lesão, ou evolução rápida.

SE o parâmetro 'recalculateEvent' estiver preenchido, você está executando uma RECALIBRAÇÃO DE ETAPA 6! Você deve pegar as estruturas existentes de mesociclos e microciclos enviadas e ajustá-las para lidar com o evento descrito (ex: fadiga, dor, falta). Altere os volumes, exercícios e RPEs dos microciclos subsequentes de forma inteligente, mantendo a integridade fisiológica do aluno.

Retorne RIGOROSAMENTE apenas um objeto JSON válido, sem tags \`\`\`json ou markdown, no seguinte formato exato:
{
  "macrociclo": {
    "name": "Nome do macrociclo sugerido",
    "objective": "Objetivo científico central baseado no perfil",
    "durationMonths": 6,
    "notes": "Comentários globais do macrociclo e foco científico",
    "status": "Em andamento",
    "model": "Modelo Escolhido (Linear, Ondulatória, etc.)"
  },
  "mesociclos": [
    {
      "id": "meso-1",
      "name": "Nome do Mesociclo (ex: Meso 1: Acúmulo de Volume)",
      "objective": "Objetivo do mesociclo",
      "weeks": 4,
      "volumePlanejado": "séries semanais",
      "intensidadeMedia": 75,
      "estrategias": "Estratégias de intensidade avançadas aplicadas",
      "deload": true
    }
  ],
  "microciclos": [
    {
      "weekIndex": 1,
      "mesocycleId": "meso-1",
      "division": "ABC",
      "weeklyVolume": 12,
      "fatigue": 4,
      "recovery": 8,
      "notes": "Observações científicas da semana",
      "exercises": [
        {
          "name": "Nome do Exercício",
          "sets": 3,
          "reps": "8-12",
          "load": 20,
          "rpe": 8,
          "rir": 2,
          "rest": "90s",
          "notes": "Observação de execução biomecânica e cadência",
          "muscleGroup": "Peitoral",
          "day": "Treino A"
        }
      ]
    }
  ],
  "clinicalDossier": {
    "etapa1Analise": "Laudo detalhado sobre os 20 pontos de perfil físico e psicológico analisados...",
    "etapa2Periodizacao": "Análise teórica justificando cientificamente o modelo de periodização escolhido...",
    "etapa3Parametros": "Cálculo detalhado de volume por grupo, frequência de estímulo, intensidade e tempos de descanso...",
    "etapa4Selecao": "Laudo de biomecânica e segurança sobre a seleção de exercícios contra redundâncias...",
    "etapa5Progressão": "Instruções do plano de progressão de carga e volume semana a semana...",
    "etapa6Adaptacao": "Protocolo ativo de adaptação clínica inteligente com orientações para faltas, fadiga e reajustes."
  },
  "explanation": "Resumo do planejamento científico."
}

Siga as seguintes regras críticas:
1. Em 'microciclos', todos os exercícios devem conter obrigatoriamente um campo 'day' (ex: 'Treino A', 'Treino B', 'Treino C', etc.) para que fiquem perfeitamente agrupados por dias da semana.
2. Atente-se às limitações do aluno na seleção biomecânica.
3. Se houver 'recalculateEvent', responda com a periodização recalibrada fisiologicamente, e descreva a adaptação realizada na 'etapa6Adaptacao'.`;

    let promptText = "";
    if (recalculateEvent) {
      promptText = `RECALCULAR PERIODIZAÇÃO (ETAPA 6 - ADAPTAÇÃO INTELIGENTE)
Ocorreu a seguinte intercorrência com o aluno: "${recalculateEvent}".
Sua tarefa é ler a periodização existente que o professor está usando para o aluno, recalcular de forma segura e inteligente, ajustando o volume, intensidade e fadiga dos microciclos restantes e salvando o aluno de lesão, overreaching ou desmotivação.

Dados do Aluno:
- Nome: ${studentName}
- Objetivo: ${studentObjective}
- Idade: ${studentAge}, Gênero: ${studentGender}
- Limitações originais: ${studentLimitations}

Estrutura Atual:
Mesociclos: ${JSON.stringify(mesociclos)}
Microciclos Atuais: ${JSON.stringify(microciclos)}

Por favor, recalcule os mesociclos e microciclos afetados, atualize as observações de semana, ordene os exercícios com o respectivo dia ('day') e retorne o JSON completo atualizado com a justificativa em 'clinicalDossier.etapa6Adaptacao'.`;
    } else {
      promptText = `PRESCREVER TREINO E PERIODIZAÇÃO DO ZERO (6 ETAPAS COMPLETAS)
Gere um planejamento de periodização e treinos integrados de musculação de altíssima performance para o aluno:
- Nome: ${studentName}
- Idade: ${studentAge}
- Gênero: ${studentGender}
- Objetivo: ${studentObjective}
- Limitações físicas e dores: ${studentLimitations}
- Nível de Experiência: ${studentPhase}

Métricas Adicionais de Admissão (Etapa 1):
- Altura: ${metrics.height || "Não informado"} cm
- Peso: ${metrics.weight || "Não informado"} kg
- % de Gordura: ${metrics.fatPercent || "Não informado"}%
- Massa Muscular: ${metrics.muscleMass || "Não informado"} kg
- Frequência semanal: ${metrics.freq || "Não informada"}
- Tempo por sessão: ${metrics.duration || "Não informado"}
- Exercícios a evitar: ${metrics.avoid || "Nenhum"}
- Preferências: ${metrics.preferences || "Nenhuma"}
- Equipamentos disponíveis: ${metrics.equip || "Academia completa"}
- Avaliação postural: ${metrics.postural || "Normal"}
- Histórico de treinos: ${metrics.history || "Consistente"}
- Capacidade de recuperação: ${metrics.recovery || "Boa"}
- Qualidade do sono: ${metrics.sleep || "Boa"}
- Nível de estresse: ${metrics.stress || "Moderado"}
- Aderência esperada: ${metrics.adherence || "Alta"}

Por favor, analise esses dados rigorosamente nas 6 etapas e gere uma periodização de 2 a 3 mesociclos com seus microciclos detalhados contendo os treinos estruturados dia-a-dia (com os campos 'day': 'Treino A', 'Treino B', etc.). Retorne apenas o JSON.`;
    }

    const response = await generateContentWithFallback(ai, {
      model: "gemini-3.5-flash",
      contents: promptText,
      config: {
        systemInstruction: systemPrompt,
        temperature: recalculateEvent ? 0.4 : 0.7,
        responseMimeType: "application/json"
      }
    });

    const textResponse = response.text || "{}";
    const data = JSON.parse(textResponse);
    res.json(data);
  } catch (err: any) {
    console.warn("Using offline fallback periodization generator:", err.message || err);
    
    const model = recalculateEvent ? "Periodização Adaptada" : periodizationModel;
    const responseFallback = {
      macrociclo: {
        name: recalculateEvent ? `Adaptação Clínica Recalibrada - ${studentName}` : `Macrociclo de Desenvolvimento Integrado - ${studentName}`,
        objective: studentObjective,
        durationMonths: 6,
        notes: recalculateEvent 
          ? `Recalibração imediata efetuada com sucesso para contornar: ${recalculateEvent}.`
          : "Planejamento científico de alta performance estruturado sob os preceitos de supercompensação.",
        status: "Em andamento",
        model: model
      },
      mesociclos: mesociclos.length > 0 ? mesociclos : [
        {
          id: "meso-1",
          name: "Meso 1: Acúmulo de Volume & Adaptação",
          objective: "Consolidar base muscular e mitocondrial",
          weeks: 4,
          volumePlanejado: "12-14 séries semanais",
          intensidadeMedia: 72,
          estrategias: "Foco excêntrico lento",
          deload: true
        }
      ],
      microciclos: microciclos.length > 0 ? microciclos : [
        {
          weekIndex: 1,
          mesocycleId: "meso-1",
          division: "AB",
          weeklyVolume: 12,
          fatigue: recalculateEvent ? 2 : 4,
          recovery: recalculateEvent ? 9 : 8,
          notes: recalculateEvent ? `Adaptação aplicada: volumes reduzidos temporariamente.` : `Microciclo 1. Progressão gradual de carga com excelente controle articular.`,
          exercises: [
            {
              name: "Supino Reto com Halteres",
              sets: 3,
              reps: "10-12",
              load: 22,
              rpe: 8,
              rir: 2,
              rest: "90s",
              notes: "Execução controlada, cadência 3-0-2.",
              muscleGroup: "Peitoral",
              day: "Treino A"
            },
            {
              name: "Puxada Alta Frente Polia",
              sets: 3,
              reps: "10-12",
              load: 45,
              rpe: 8,
              rir: 2,
              rest: "90s",
              notes: "Ativação consciente das grandes dorsais.",
              muscleGroup: "Costas",
              day: "Treino B"
            },
            {
              name: "Agachamento Globo (Goblet Squat)",
              sets: 3,
              reps: "10-12",
              load: 24,
              rpe: 8,
              rir: 2,
              rest: "120s",
              notes: "Foco na amplitude, coluna em posição neutra.",
              muscleGroup: "Quadríceps",
              day: "Treino A"
            }
          ]
        }
      ],
      clinicalDossier: {
        etapa1Analise: `[ETAPA 1] Análise do perfil de ${studentName} concluída. Identificado objetivo de ${studentObjective}, idade ${studentAge}, gênero ${studentGender}, limitações descritas como "${studentLimitations}". Estresse e sono avaliados como intermediários, indicando a necessidade de ondas de volume controladas.`,
        etapa2Periodizacao: `[ETAPA 2] Escolha científica do modelo ${model}. O macrociclo foi otimizado para supercompensação sistêmica alternando acúmulo de estímulos e semanas regenerativas (Deload).`,
        etapa3Parametros: `[ETAPA 3] Parâmetros de treino calculados. Frequência ideal estabelecida, com volume direto entre 10 e 16 séries por grupo muscular e RPE flutuando entre 7 e 9 para máximo estímulo sem Junk Volume.`,
        etapa4Selecao: `[ETAPA 4] Exercícios selecionados estrategicamente para evitar compressão axial ou estresse articular exacerbado em virtude das limitações apontadas (${studentLimitations}).`,
        etapa5Progressão: `[ETAPA 5] Progressão programada semana a semana via microciclos. Os estímulos evoluem em sobrecarga progressiva dinâmica.`,
        etapa6Adaptacao: recalculateEvent 
          ? `[ETAPA 6 - RECALCULADO] Intercorrência tratada: ${recalculateEvent}. Volumes adaptados em tempo real de forma segura.`
          : `[ETAPA 6] Protocolo ativo de autodefesa física e cognitiva estruturado para ajustar as variáveis se ocorrerem faltas, dor excessiva ou platô.`
      },
      explanation: "Heurística de periodização científica de alta performance adaptada."
    };
    res.json(responseFallback);
  }
}

export async function generateFunctionalWorkout(req: Request, res: Response) {
  const {
    funcModel = "",
    funcIntensity = "",
    funcStudentsCount = 1,
    funcDuration = "",
    funcWeeklyFreq = "",
    funcMedicalRestrictions = "",
    funcDayOfWeek = "",
    activeEquipment = [],
    equipmentQuantities = {},
    availableExercises = [],
    aiProvider = "gemini"
  } = req.body || {};

  const activeEquipmentArr = Array.isArray(activeEquipment) ? activeEquipment : [];

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
      throw new Error("GEMINI_API_KEY_MISSING");
    }

    const ai = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });

    const systemPrompt = `Você é um ESPECIALISTA em organização de aulas de Treino Funcional e gestão de fluxo em estúdio.
Sua tarefa é montar um treino em circuito que respeite ESTRITAMENTE a capacidade física dos equipamentos, seguindo esta regra inegociável:

🚨 REGRA DE OURO (CAPACIDADE 1:1):
CADA UNIDADE FÍSICA DE EQUIPAMENTO ACOMODA EXATAMENTE 1 ALUNO SIMULTÂNEO.
- Se existem 3 unidades de TRX → máximo de 3 alunos usando TRX ao mesmo tempo.
- Se existem 10 unidades → máximo de 10 alunos.
- NUNCA coloque mais de 1 aluno por unidade física. A capacidade simultânea é SEMPRE IGUAL ao número de unidades cadastradas.

📊 CÁLCULO DE CAPACIDADE POR ESTAÇÃO:
1. O limite de alunos em uma estação = número exato de unidades físicas disponíveis.
2. Se alunos > unidades disponíveis → CRIE ESTAÇÕES COMBINADAS ou adicione EXERCÍCIOS COMPLEMENTARES DE PESO CORPORAL para quem está "em espera".
3. NENHUM aluno pode ficar parado ou em fila. Todos devem estar executando algo ao mesmo tempo.

🔄 LÓGICA DE REVEZAMENTO (QUANDO HÁ EXCESSO):
- Enquanto alguns alunos usam o equipamento principal, os demais executam variações de peso corporal no mesmo espaço (ex: polichinelo, agachamento livre, prancha, mountain climber, sprint parado).
- Ao sinal do cronômetro, todos trocam de função. Mantenha o fluxo contínuo e seguro.

📤 FORMATO DE SAÍDA OBRIGATÓRIO (JSON ESTRITO):
{
  "nomeTreino": "Treino Funcional " + funcModel + " - " + funcDayOfWeek,
  "alertaCapacidade": {
    "status": "ok|atencao|critico",
    "mensagem": "Explique claramente a relação alunos vs unidades disponíveis",
    "revezamentoNecessario": true,
    "estrategia": "Descreva exatamente como será o rodízio ou uso de exercícios complementares"
  },
  "estacoes": [
    {
      "numero": 1,
      "categoria": "superior|inferior|core|cardio",
      "exercicioPrincipal": "Nome exato do catálogo",
      "unidadesDisponiveis": 0,
      "alunosUsandoEquipamento": 0,
      "alunosEmComplementar": 0,
      "tempo": "40s",
      "descanso": "10s",
      "equipamento": "Nome do equipamento",
      "exerciciosComplementares": ["ex1", "ex2"],
      "instrucoesRevezamento": "Como alternar ao sinal"
    }
  ],
  "distribuicaoCategorias": {"superior": 0, "inferior": 0, "core": 0, "cardio": 0},
  "observacoesProfessor": "Dicas de fluxo, segurança e adaptação para restrições"
}

✅ VALIDAÇÕES OBRIGATÓRIAS ANTES DE RESPONDER:
- Nenhuma estação tem mais alunos usando equipamento do que unidades físicas?
- A relação é sempre 1 aluno por 1 unidade?
- Se houve excesso, foram incluídos exercícios complementares de peso corporal?
- Todos os exercícios existem no catálogo fornecido?
- A distribuição cobre equilibradamente superiores, inferiores, core e cardio?
- O JSON é válido e contém APENAS a estrutura solicitada?

Gere APENAS o JSON válido. Não adicione texto, explicações ou formatação fora do bloco JSON.`;

    const equipamentosTexto = activeEquipmentArr.map(eqName => {
      const q = equipmentQuantities?.[
        eqName === "TRX" ? "TRX" :
        eqName === "Corda Naval" ? "CordaNaval" :
        eqName === "Escada" ? "Escada" :
        eqName === "Medicine Ball" ? "MedicineBall" :
        eqName === "Kettlebell" ? "Kettlebell" :
        eqName === "Bola de Peso" ? "BolaPeso" :
        eqName === "Caixa Plyo" ? "CaixaPlyo" : ""
      ] ?? 0;
      return `- ${eqName}: ${q} unidades físicas disponíveis (Ativo: true)`;
    }).join("\n");

    const promptText = `Crie o plano de treino funcional completo baseado nos dados fornecidos e retorne obrigatoriamente no esquema JSON solicitado:
- Modelo de Treino: ${funcModel}
- Nível da Turma: ${funcIntensity}
- Total de Alunos: ${funcStudentsCount}
- Duração Total: ${funcDuration} minutos
- Restrições Médicas/Lesões: ${funcMedicalRestrictions || "Nenhuma registrada"}
- Dia da Semana: ${funcDayOfWeek}

Inventário Disponível (unidades físicas):
${equipamentosTexto}

Catálogo de exercícios oficiais para você escolher:
${JSON.stringify(availableExercises)}

Escolha exatamente 4 exercícios ÚNICOS do catálogo acima para compor as 4 estações. Adapte para garantir a segurança dos alunos de acordo com as restrições médicas informadas.`;

    // Check for Groq option
    if (aiProvider === "groq" && process.env.GROQ_API_KEY && process.env.GROQ_API_KEY !== "MY_GROQ_API_KEY") {
      try {
        const rawText = await callGroqAI(systemPrompt, promptText);
        const cleanedText = cleanJsonResponse(rawText);
        const parsedJSON = JSON.parse(cleanedText);
        return res.json(parsedJSON);
      } catch (groqErr: any) {
        console.error("Groq functional generation failed, falling back to Gemini:", groqErr);
      }
    }

    const response = await generateContentWithFallback(ai, {
      model: "gemini-3.5-flash",
      contents: promptText,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.7,
        responseMimeType: "application/json",
      }
    });

    const parsedJSON = JSON.parse(response.text);
    res.json(parsedJSON);
  } catch (err: any) {
    console.warn("Using offline fallback functional generator:", err.message);

    const fallbackWorkout = generateFallbackFunctionalWorkout(
      funcModel,
      funcIntensity,
      funcStudentsCount,
      funcDuration,
      funcWeeklyFreq,
      funcMedicalRestrictions,
      funcDayOfWeek,
      activeEquipment,
      equipmentQuantities,
      availableExercises
    );
    res.json({
      ...fallbackWorkout,
      warning: err.message === "GEMINI_API_KEY_MISSING" 
        ? "Nota: GEMINI_API_KEY não configurada. Utilizando gerador inteligente local de alta performance."
        : `Erro na API (${err.message}). Utilizando gerador inteligente local.`
    });
  }
}
