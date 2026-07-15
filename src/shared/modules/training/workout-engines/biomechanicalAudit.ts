/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface AuditExercise {
  name: string;
  sets: number;
  reps: string;
  muscleGroup: string;
  weight?: number;
  notes?: string;
}

export interface AuditWorkout {
  name: string;
  exercises: AuditExercise[];
}

export interface BiomechanicalClassification {
  pushPull: "Push" | "Pull" | "Neutral";
  horizVert: "Horizontal" | "Vertical" | "Neutral";
  kneeHip: "Knee" | "Hip" | "Neutral";
  unilateral: "Unilateral" | "Bilateral";
  plane: "Sagital" | "Frontal" | "Transversal";
  pattern: string;
}

export interface AuditRedundancy {
  workoutName: string;
  pattern: string;
  exercises: string[];
  severity: "Baixo" | "Médio" | "Alto";
  recommendation: string;
}

export interface BiomechanicalAuditReport {
  score: number;
  rating: "Excelente" | "Bom" | "Regular" | "Crítico";
  colorClass: string;
  dominance: {
    upperBody: string;
    lowerBody: string;
    overall: string;
  };
  metrics: {
    pushVolume: number;
    pullVolume: number;
    pushPullRatio: number;
    horizontalVolume: number;
    verticalVolume: number;
    horizVertRatio: number;
    kneeVolume: number;
    hipVolume: number;
    kneeHipRatio: number;
    unilateralVolume: number;
    bilateralVolume: number;
    unilateralRatio: number;
  };
  planes: {
    sagittalVolume: number;
    frontalVolume: number;
    transverseVolume: number;
    sagittalPct: number;
    frontalPct: number;
    transversePct: number;
  };
  patterns: Record<string, number>;
  redundancies: AuditRedundancy[];
  recommendations: string[];
}

/**
 * Classifies an individual exercise based on its name and muscle group.
 * Follows strict kinesiology and biomechanics rules.
 */
export function classifyExercise(name: string, muscleGroup: string): BiomechanicalClassification {
  const n = name.toLowerCase();
  const mg = (muscleGroup || "").toLowerCase();

  let pushPull: "Push" | "Pull" | "Neutral" = "Neutral";
  let horizVert: "Horizontal" | "Vertical" | "Neutral" = "Neutral";
  let kneeHip: "Knee" | "Hip" | "Neutral" = "Neutral";
  let unilateral: "Unilateral" | "Bilateral" = "Bilateral";
  let plane: "Sagital" | "Frontal" | "Transversal" = "Sagital";
  let pattern = "Outros";

  // 1. Unilateral vs Bilateral
  if (
    n.includes("unilateral") ||
    n.includes("lunge") ||
    n.includes("avanco") ||
    n.includes("avanço") ||
    n.includes("búlgaro") ||
    n.includes("bulgarian") ||
    n.includes("passada") ||
    n.includes("concentrada") ||
    n.includes("one arm") ||
    n.includes("single leg") ||
    n.includes("coice") ||
    n.includes("pistol") ||
    n.includes("step-up") ||
    n.includes("passo")
  ) {
    unilateral = "Unilateral";
  }

  // 2. Knee vs Hip Dominance (Lower Body)
  const isLower = [
    "quadríceps",
    "quadriceps",
    "posteriores de coxas",
    "posteriores de coxa",
    "posteriores",
    "glúteos",
    "gluteos",
    "panturrilhas",
    "panturrilha",
    "adutores",
    "abdutores"
  ].some(g => mg.includes(g));

  if (isLower) {
    if (
      n.includes("agachamento") ||
      n.includes("squat") ||
      n.includes("leg press") ||
      n.includes("hack") ||
      n.includes("extensora") ||
      n.includes("sissy") ||
      n.includes("lunge") ||
      n.includes("avanço") ||
      n.includes("avanco") ||
      n.includes("bulgarian") ||
      n.includes("búlgaro") ||
      n.includes("passada") ||
      n.includes("step-up")
    ) {
      kneeHip = "Knee";
      pattern = "Dominante de Joelho";
      plane = "Sagital";
      pushPull = "Push";
    } else if (
      n.includes("flexora") ||
      n.includes("curl") ||
      n.includes("stiff") ||
      n.includes("deadlift") ||
      n.includes("romanian") ||
      n.includes("thrust") ||
      n.includes("drive") ||
      n.includes("coice") ||
      n.includes("abdutora") ||
      n.includes("abdução") ||
      n.includes("good morning") ||
      n.includes("raise") ||
      n.includes("elevação de quadril")
    ) {
      kneeHip = "Hip";
      pattern = "Dominante de Quadril";
      pushPull = "Pull";

      if (n.includes("abdutora") || n.includes("abdução")) {
        plane = "Frontal";
      } else {
        plane = "Sagital";
      }
    } else {
      // Panturrilhas etc
      plane = "Sagital";
      pushPull = "Push";
      pattern = "Extensão de Tornozelo";
    }
  }

  // 3. Push vs Pull & Horizontal vs Vertical (Upper Body)
  const isUpper = [
    "peitoral",
    "costas",
    "ombros",
    "ombro",
    "bíceps",
    "biceps",
    "tríceps",
    "triceps"
  ].some(g => mg.includes(g));

  if (isUpper) {
    if (
      mg.includes("peitoral") ||
      mg.includes("tríceps") ||
      mg.includes("triceps") ||
      (mg.includes("ombros") && 
       !n.includes("crucifixo invertido") && 
       !n.includes("crucifixo inverso") && 
       !n.includes("face pull") && 
       !n.includes("posterior"))
    ) {
      pushPull = "Push";

      if (
        n.includes("supino reto") ||
        n.includes("crucifixo reto") ||
        n.includes("voador") ||
        n.includes("peck deck") ||
        n.includes("chest press") ||
        (n.includes("crossover") && !n.includes("baixo"))
      ) {
        horizVert = "Horizontal";
        plane = "Transversal";
        pattern = "Empurrar Horizontal";
      } else if (
        n.includes("desenvolvimento") ||
        n.includes("arnold") ||
        n.includes("militar") ||
        n.includes("shoulder press") ||
        n.includes("elevação lateral") ||
        n.includes("elevaçao lateral") ||
        n.includes("lateral raise")
      ) {
        horizVert = "Vertical";
        plane = n.includes("elevação") || n.includes("lateral") ? "Frontal" : "Sagital";
        pattern = "Empurrar Vertical";
      } else if (n.includes("inclinado") || n.includes("declinado")) {
        horizVert = "Horizontal";
        plane = "Transversal";
        pattern = n.includes("inclinado") ? "Empurrar Inclinado" : "Empurrar Declinado";
      } else {
        horizVert = "Horizontal";
        plane = "Sagital"; // like triceps pushdowns
        pattern = "Extensão de Cotovelo";
      }
    } else if (
      mg.includes("costas") ||
      mg.includes("bíceps") ||
      mg.includes("biceps") ||
      (mg.includes("ombros") && 
       (n.includes("crucifixo invertido") || 
        n.includes("crucifixo inverso") || 
        n.includes("face pull") || 
        n.includes("posterior")))
    ) {
      pushPull = "Pull";

      if (
        n.includes("remada") ||
        n.includes("cavalinho") ||
        n.includes("t-bar") ||
        n.includes("row") ||
        n.includes("crucifixo invertido") ||
        n.includes("crucifixo inverso")
      ) {
        horizVert = "Horizontal";
        plane = n.includes("crucifixo") ? "Transversal" : "Sagital";
        pattern = "Puxar Horizontal";
      } else if (
        n.includes("puxada") ||
        n.includes("pulldown") ||
        n.includes("chin up") ||
        n.includes("pull up") ||
        n.includes("face pull")
      ) {
        horizVert = "Vertical";
        plane = n.includes("puxada") || n.includes("pull up") ? "Frontal" : "Transversal";
        pattern = "Puxar Vertical";
      } else {
        horizVert = "Horizontal";
        plane = "Sagital"; // like biceps curl
        pattern = "Flexão de Cotovelo";
      }
    }
  }

  // Core Defaults
  if (mg.includes("core") || mg.includes("abdominal") || mg.includes("lombar")) {
    plane = "Sagital";
    pushPull = "Neutral";
    pattern = "Estabilização de Core";
  }

  return { pushPull, horizVert, kneeHip, unilateral, plane, pattern };
}

export class BiomechanicalAuditEngine {
  /**
   * Evaluates the workouts list to provide a highly detailed biomechanical analysis.
   * Calculations are fully deterministic and cached based on strict math.
   */
  public static audit(workouts: AuditWorkout[]): BiomechanicalAuditReport {
    // 1. Volumes Counters (measured in total sets)
    let pushVolume = 0;
    let pullVolume = 0;
    let horizontalVolume = 0;
    let verticalVolume = 0;
    let kneeVolume = 0;
    let hipVolume = 0;
    let unilateralVolume = 0;
    let bilateralVolume = 0;

    let sagittalVolume = 0;
    let frontalVolume = 0;
    let transverseVolume = 0;

    const patterns: Record<string, number> = {};
    const redundancies: AuditRedundancy[] = [];

    // Helper to group exercises in each workout to detect redundancies
    workouts.forEach(wk => {
      const workoutExercises = wk.exercises || [];
      const patternExercisesMap: Record<string, string[]> = {};

      workoutExercises.forEach(ex => {
        const sets = ex.sets || 4;
        const cls = classifyExercise(ex.name, ex.muscleGroup);

        // Track pattern volumes
        patterns[cls.pattern] = (patterns[cls.pattern] || 0) + sets;

        // Push x Pull
        if (cls.pushPull === "Push") pushVolume += sets;
        if (cls.pushPull === "Pull") pullVolume += sets;

        // Horizontal x Vertical
        if (cls.horizVert === "Horizontal") horizontalVolume += sets;
        if (cls.horizVert === "Vertical") verticalVolume += sets;

        // Knee x Hip
        if (cls.kneeHip === "Knee") kneeVolume += sets;
        if (cls.kneeHip === "Hip") hipVolume += sets;

        // Unilateral x Bilateral
        if (cls.unilateral === "Unilateral") {
          unilateralVolume += sets;
        } else {
          bilateralVolume += sets;
        }

        // Planes of movement
        if (cls.plane === "Sagital") sagittalVolume += sets;
        if (cls.plane === "Frontal") frontalVolume += sets;
        if (cls.plane === "Transversal") transverseVolume += sets;

        // Group by exercise base pattern to check for redundancies in the same workout
        // Let's define fine-grained redundancy patterns (e.g. Supino Plano)
        let redKey = "";
        const lowerName = ex.name.toLowerCase();
        if (lowerName.includes("supino reto") || lowerName.includes("chest press") || (lowerName.includes("crucifixo") && lowerName.includes("reto"))) {
          redKey = "Supino Plano Horizontal";
        } else if (lowerName.includes("supino inclinado") || (lowerName.includes("crucifixo") && lowerName.includes("inclinado"))) {
          redKey = "Trabalho Inclinado Superior";
        } else if (lowerName.includes("agachamento") || lowerName.includes("leg press") || lowerName.includes("hack")) {
          redKey = "Leg Press e Agachamentos (Empurradores Multiarticulares)";
        } else if (lowerName.includes("puxada") && lowerName.includes("alta")) {
          redKey = "Puxada Vertical Aberta";
        } else if (lowerName.includes("flexora")) {
          redKey = "Flexão de Joelho Isolada";
        } else if (lowerName.includes("stiff") || lowerName.includes("romanian")) {
          redKey = "Extensão Quadril Semiflexionado";
        }

        if (redKey) {
          if (!patternExercisesMap[redKey]) {
            patternExercisesMap[redKey] = [];
          }
          patternExercisesMap[redKey].push(ex.name);
        }
      });

      // Detect redundancies
      Object.entries(patternExercisesMap).forEach(([pattern, exercises]) => {
        if (exercises.length >= 3) {
          redundancies.push({
            workoutName: wk.name,
            pattern,
            exercises,
            severity: "Alto",
            recommendation: `Substituir pelo menos um dos exercícios (${exercises.join(", ")}) por outro que explore um vetor ou plano mecânico diferente (ex: mudar de reto para inclinado, ou trocar composto por isolador de vetor oposto).`
          });
        } else if (exercises.length === 2) {
          redundancies.push({
            workoutName: wk.name,
            pattern,
            exercises,
            severity: "Médio",
            recommendation: `Considere otimizar: Você possui dois exercícios de padrão idêntico (${exercises.join(" e ")}). O estímulo mecânico pode estar saturado.`
          });
        }
      });
    });

    // 2. Calculations & Ratios
    const pushPullRatio = pullVolume > 0 ? Number((pushVolume / pullVolume).toFixed(2)) : pushVolume;
    const horizVertRatio = verticalVolume > 0 ? Number((horizontalVolume / verticalVolume).toFixed(2)) : horizontalVolume;
    const kneeHipRatio = hipVolume > 0 ? Number((kneeVolume / hipVolume).toFixed(2)) : kneeVolume;
    
    const totalVolume = sagittalVolume + frontalVolume + transverseVolume;
    const sagittalPct = totalVolume > 0 ? Math.round((sagittalVolume / totalVolume) * 100) : 0;
    const frontalPct = totalVolume > 0 ? Math.round((frontalVolume / totalVolume) * 100) : 0;
    const transversePct = totalVolume > 0 ? Math.round((transverseVolume / totalVolume) * 100) : 0;

    const totalSets = unilateralVolume + bilateralVolume;
    const unilateralRatio = totalSets > 0 ? Number((unilateralVolume / totalSets).toFixed(2)) : 0;

    // 3. Dominance Analysis
    let upperBodyDom = "Equilibrado";
    if (pushVolume > pullVolume * 1.4) {
      upperBodyDom = "Dominância de Empurrar (Anterior)";
    } else if (pullVolume > pushVolume * 1.4) {
      upperBodyDom = "Dominância de Puxar (Posterior)";
    }

    let lowerBodyDom = "Equilibrado";
    if (kneeVolume > hipVolume * 1.4) {
      lowerBodyDom = "Dominância de Joelho (Quadríceps)";
    } else if (hipVolume > kneeVolume * 1.4) {
      lowerBodyDom = "Dominância de Quadril (Posterior/Glúteos)";
    }

    let overallDom = "Estrutura Simétrica";
    if (sagittalPct > 70) {
      overallDom = "Hiper-dominância Sagital (Estímulo Unidirecional)";
    } else if (pushPullRatio > 1.8 && kneeHipRatio > 1.8) {
      overallDom = "Dominância de Cadeia Anterior (Empurradores)";
    } else if (pushPullRatio < 0.6 && kneeHipRatio < 0.6) {
      overallDom = "Dominância de Cadeia Posterior (Puxadores)";
    }

    // 4. Biomechanical Score Formulation
    let score = 100;
    const recommendations: string[] = [];

    // Push x Pull Check (Optimal range: 0.8 to 1.3)
    if (pushVolume > 0 && pullVolume > 0) {
      if (pushPullRatio > 1.5 || pushPullRatio < 0.6) {
        score -= 12;
        recommendations.push(
          pushPullRatio > 1.5
            ? "A proporção de exercícios de Empurrar é significativamente maior que a de Puxar. Adicione séries de remadas ou puxadas para evitar dores nos ombros e desvios posturais."
            : "Treino com foco acentuado em Puxar. Considere elevar ligeiramente o volume de peitorais/deltoide anterior se o foco for simetria estética."
        );
      } else if (pushPullRatio > 1.25 || pushPullRatio < 0.8) {
        score -= 5;
        recommendations.push("Proporção Empurrar/Puxar está aceitável, mas pode ser otimizada para a proporção ideal de 1:1.");
      }
    }

    // Horizontal x Vertical Check (Optimal range: 0.7 to 1.5)
    if (horizontalVolume > 0 && verticalVolume > 0) {
      if (horizVertRatio > 2.0 || horizVertRatio < 0.5) {
        score -= 10;
        recommendations.push(
          horizVertRatio > 2.0
            ? "Grande dominância de movimentos Horizontais (Supinos/Remadas) em relação aos Verticais (Puxadas/Desenvolvimentos). Adicione variações verticais."
            : "Excesso de movimentos Verticais. Adicione remadas horizontais ou supinos para preenchimento de caixa torácica e espessura de dorsais."
        );
      }
    }

    // Knee x Hip Check (Optimal range: 0.8 to 1.4)
    if (kneeVolume > 0 && hipVolume > 0) {
      if (kneeHipRatio > 1.8 || kneeHipRatio < 0.5) {
        score -= 12;
        recommendations.push(
          kneeHipRatio > 1.8
            ? "Foco descompensado em Joelho Dominante (Quadríceps). Adicione exercícios de Quadril Dominante (Stiff/Mesa Flexora/Hip Thrust) para evitar estresse patelar patológico."
            : "Foco excessivo em Quadril Dominante (Glúteos/Isquiotibiais). Considere ajustar o volume de quadríceps se buscar equilíbrio estrutural de coxa."
        );
      } else if (kneeHipRatio > 1.4 || kneeHipRatio < 0.7) {
        score -= 4;
        recommendations.push("Pequeno desbalanço de coxa. Ajuste fino do volume de quadríceps ou posteriores ajudará no alinhamento.");
      }
    }

    // Unilateral Ratio Check (Ideally >= 15% of the total sets to prevent bilateral compensation)
    if (unilateralRatio < 0.15) {
      score -= 6;
      recommendations.push("Baixo volume de trabalho Unilateral (atualmente " + Math.round(unilateralRatio * 100) + "%). Adicione exercícios unilaterais para equalizar forças e estabilizar articulações.");
    }

    // Plane Distribution Check (Must avoid sagittal hyper-dominance)
    if (sagittalPct > 70) {
      score -= 8;
      recommendations.push("Hiper-dominância do Plano Sagital (" + sagittalPct + "%). O corpo humano move-se em múltiplos planos. Injete elevações laterais (frontal) ou rotações/crucifixos (transversal) para reequilibrar.");
    }

    // Redundancies penalty
    redundancies.forEach(red => {
      if (red.severity === "Alto") {
        score -= 8;
      } else {
        score -= 4;
      }
    });

    score = Math.max(20, Math.min(100, Math.round(score)));

    // Determinar Rating
    let rating: "Excelente" | "Bom" | "Regular" | "Crítico" = "Excelente";
    let colorClass = "text-[#00f2ff] border-[#00f2ff]/20 bg-[#00f2ff]/5";
    if (score < 60) {
      rating = "Crítico";
      colorClass = "text-red-400 border-red-500/20 bg-red-500/5";
    } else if (score < 75) {
      rating = "Regular";
      colorClass = "text-amber-400 border-amber-500/20 bg-amber-500/5";
    } else if (score < 90) {
      rating = "Bom";
      colorClass = "text-yellow-400 border-yellow-500/20 bg-yellow-500/5";
    }

    if (recommendations.length === 0) {
      recommendations.push("Perfeição biomecânica atingida! Relações volumétricas, vetores articulares e planos de movimento estão sob calibração científica impecável.");
    }

    return {
      score,
      rating,
      colorClass,
      dominance: {
        upperBody: upperBodyDom,
        lowerBody: lowerBodyDom,
        overall: overallDom
      },
      metrics: {
        pushVolume,
        pullVolume,
        pushPullRatio,
        horizontalVolume,
        verticalVolume,
        horizVertRatio,
        kneeVolume,
        hipVolume,
        kneeHipRatio,
        unilateralVolume,
        bilateralVolume,
        unilateralRatio
      },
      planes: {
        sagittalVolume,
        frontalVolume,
        transverseVolume,
        sagittalPct,
        frontalPct,
        transversePct
      },
      patterns,
      redundancies,
      recommendations
    };
  }
}
