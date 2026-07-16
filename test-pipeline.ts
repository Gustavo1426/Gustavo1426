/**
 * ============================================================================
 * WORKOUT ACADEMIA - BIOMECHANICS AI MODULE: TEST PIPELINE SCRIPT
 * ============================================================================
 */

import { processBiomechanicalAssessment } from "./src/shared/modules/biomechanics-ai";
import {
  runBiomechanicalIntegration,
  processStudentQuery,
  runDecisionIntelligenceEngine,
  KnowledgeGraphEngine,
  processTwinEvent,
  runPredictiveEngine,
  DigitalTwin,
  runAdaptiveLearningCycle,
  learningPipeline,
  uipEventBus,
  ApiGateway,
  findSmartSubstitute,
  calculateSessionMuscleLoad,
  runHumanAdaptationEngine,
  ExerciseDatabase
} from "./src/shared/modules/biomechanics";

async function runTest() {
  console.log("🚀 Iniciando Motor Biomecânico da Workout Academia...\n");

  try {
    const input = {
      userId: "aluno_teste_001",
      studentName: "Carlos Silva",
      photoUrl: "https://minha-url-falsa.com/foto.jpg", // A função de mock vai ignorar isso
      view: "front" as const
    };

    console.log("📸 Simulando foto do aluno Carlos Silva...");
    console.log("🧠 Processando 10 etapas da IA...\n");

    const t0 = performance.now();
    const result = await processBiomechanicalAssessment(input);
    const t1 = performance.now();

    console.log(`✅ Concluído em ${Math.round(t1 - t0)}ms!\n`);
    
    console.log("==================================================");
    console.log("📊 RESULTADO DA AVALIAÇÃO (IGB)");
    console.log("==================================================");
    console.log(`Nota IGB: ${result.score.overall}/100`);
    console.log(`Classificação: ${result.score.classification.toUpperCase()}`);
    console.log(`Feedback Aluno: "${result.report.studentSection.emotionalHeadline}"\n`);

    console.log("==================================================");
    console.log("⚠️ ACHADOS BIOMECÂNICOS & RECOMENDAÇÕES");
    console.log("==================================================");
    result.findings.forEach(f => {
      console.log(`- ${f.name} (Severidade: ${f.severity.toUpperCase()}, Confiança: ${Math.round(f.confidence * 100)}%)`);
      console.log(`  Músculos a liberar: ${f.suggestedMusclesToTarget?.release?.join(", ") || "Nenhum"}`);
      console.log(`  Músculos a fortalecer: ${f.suggestedMusclesToTarget?.strengthen?.join(", ") || "Nenhum"}`);
      console.log("");
    });

    console.log("==================================================");
    console.log("🏋️ ALERTAS PARA O WORKOUT ENGINE (ETAPA 11)");
    console.log("==================================================");
    result.recommendations.trainingAdjustments.attentionPoints.forEach(alert => {
      console.log(`🚨 ${alert}`);
    });

    console.log("\n==================================================");
    console.log("🔗 ADAPTAÇÃO DE TREINO E INTEGRAÇÃO (ETAPA 11)");
    console.log("==================================================");
    const originalExercises = [
      { id: "ex_1", name: "Supino Reto com Barra", tags: ["horizontal_push", "chest", "bilateral"], baseSets: 4 },
      { id: "ex_2", name: "Remada Baixa", tags: ["horizontal_pull", "back", "bilateral"], baseSets: 3 },
      { id: "ex_3", name: "Agachamento Livre", tags: ["heavy_squat", "lower_body_compound", "bilateral"], baseSets: 4 }
    ];

    const rawFindings = [
      { id: "shoulder_anteriorization", severity: "medium" as const },
      { id: "knee_valgus_tendency", severity: "high" as const }
    ];

    const adaptation = runBiomechanicalIntegration(originalExercises, rawFindings);
    console.log("📋 Exercícios Adaptados:");
    adaptation.adaptedExercises.forEach(ex => {
      console.log(`  - ${ex.name} | Séries: ${ex.adaptedSets} (Original: ${originalExercises.find(oe => oe.id === ex.id)?.baseSets})`);
      if (ex.biomechanicalWarning) console.log(`    ⚠️ ${ex.biomechanicalWarning}`);
    });
    console.log("\n🔥 Rotina de Ativação Pré-Treino:");
    adaptation.preWorkoutRoutine.forEach(act => console.log(`  - ${act}`));
    console.log("\n💬 Sumário do Treinador:");
    adaptation.coachSummary.forEach(sum => console.log(`  - ${sum}`));

    console.log("\n==================================================");
    console.log("🤖 CHAT ASSISTENTE INTELIGENTE AI COACH (ETAPA 12)");
    console.log("==================================================");
    const questions = [
      "Por que meu treino tem tanta remada?",
      "O que significa ombro anteriorizado?",
      "Posso aumentar a carga hoje?"
    ];

    for (const q of questions) {
      console.log(`👤 Aluno pergunta: "${q}"`);
      const coachResp = await processStudentQuery("aluno_teste_001", q);
      console.log(`🤖 AI Coach: "${coachResp.answer}"`);
      console.log(`📈 Motivação: "${coachResp.dataDrivenMotivation}"`);
      console.log(`💡 Recomendações do Sistema:`, coachResp.recommendations);
      if (coachResp.backgroundAlerts.length > 0) {
        console.log(`📢 Alertas de Segundo Plano:`);
        coachResp.backgroundAlerts.forEach(alert => console.log(`   [${alert.priority.toUpperCase()}] ${alert.messageToProfessor}`));
      }
      console.log("--------------------------------------------------");
    }

    console.log("\n==================================================");
    console.log("🧠 DECISION INTELLIGENCE ENGINE (ETAPA 13)");
    console.log("==================================================");
    console.log("Simulando tomada de decisão para objetivo de Hipertrofia...");
    const decision = await runDecisionIntelligenceEngine("aluno_teste_001", "HypertrophyPolicy");
    if (decision) {
      console.log(`🎯 Ação Decidida: ${decision.actionType}`);
      console.log(`💯 Confiança: ${decision.confidence}%`);
      console.log(`💬 Explicação Aluno: "${decision.explanationToStudent}"`);
      console.log(`👔 Explicação Professor: "${decision.explanationToCoach}"`);
      console.log(`📋 Resultado da Simulação Interna: ${decision.auditTrail.simulationResult}`);
    } else {
      console.log("⚠️ Decisão abortada por baixa confiança. Requer atenção humana.");
    }

    console.log("\n==================================================");
    console.log("🌐 ONTOLOGY & KNOWLEDGE GRAPH ENGINE (ETAPA 14)");
    console.log("==================================================");
    console.log("Analisando risco biomecânico para 'bench_press' (Supino Reto) sob Anteriorização de Ombros:");
    const riskAnalysis = KnowledgeGraphEngine.inferRiskForExercise("bench_press", ["shoulder_anteriorization"]);
    console.log(`👉 É seguro? ${riskAnalysis.isSafe ? "Sim" : "Não"}`);
    console.log("📋 Raciocínio Ontológico:");
    riskAnalysis.reasoning.forEach(r => console.log(`   - ${r}`));

    console.log("\nBuscando substitutos mais seguros para 'bench_press' sob Anteriorização de Ombros:");
    const alternatives = KnowledgeGraphEngine.findSaferAlternatives("bench_press", ["shoulder_anteriorization"]);
    alternatives.forEach(alt => {
      console.log(`   - ${alt.name} (Dificuldade: ${alt.difficulty}, Risco: ${alt.injuryRisk.toUpperCase()})`);
    });

    console.log("\nGerando estratégia corretiva para o padrão 'shoulder_anteriorization' e 'knee_valgus':");
    const corrective = KnowledgeGraphEngine.inferCorrectiveStrategy(["shoulder_anteriorization", "knee_valgus"]);
    console.log(`👉 Músculos alvo para ativação/reabilitação:`, corrective.targetMuscles);
    console.log("👉 Protocolos Recomendados:");
    corrective.suggestedProtocols.forEach(p => console.log(`   - ${p}`));

    // ============================================================================
    // 👥 DIGITAL TWIN ENGINE (ETAPA 15) & PREDICTIVE ANALYTICS ENGINE (ETAPA 16)
    // ============================================================================
    console.log("\n==================================================");
    console.log("👥 DIGITAL TWIN ENGINE (ETAPA 15)");
    console.log("==================================================");

    // Initial twin state mock
    let twin: DigitalTwin = {
      version: 1,
      lastUpdatedAt: new Date().toISOString(),
      identity: {
        id: "aluno_teste_001",
        name: "Carlos Silva",
        gender: "male",
        age: 28,
        heightCm: 178,
        experienceLevel: "intermediate"
      },
      body: {
        weightKg: 82.5,
        bodyFatPercentage: 18,
        leanMassKg: 67.6
      },
      training: {
        currentMesocycle: 2,
        currentMicrocycle: 3,
        weeklyFrequency: 5,
        weeklyVolumeSets: 18,
        adherencePercentage: 85,
        consistencyScore: 82
      },
      performance: {
        strengthProgressionRate: 4.5, // 4.5% de progressão
        prs: { "bench_press": 90, "squat": 120 },
        averageRIR: 2
      },
      recovery: {
        fatigueLevel: 45,
        readinessScore: 80,
        daysSinceLastDeload: 21,
        muscleSoreness: "low",
        sleepQuality: "good"
      },
      biomechanics: {
        igb: 80,
        activeFindings: ["shoulder_anteriorization"],
        activeRestrictions: [],
        lastAssessmentDate: new Date().toISOString()
      },
      goals: {
        primaryGoal: "hypertrophy"
      },
      prediction: {
        churnRisk: "low",
        injuryRisk: "low",
        expectedEvolutionTrend: "stable"
      },
      healthScore: {
        score: 80,
        breakdown: {
          biomechanics: 80,
          adherence: 85,
          performance: 90,
          recovery: 80,
          consistency: 82,
          bodyComp: 91
        }
      }
    };

    console.log(`Gêmeo Digital inicializado para ${twin.identity.name}:`);
    console.log(`👉 Health Score Geral: ${twin.healthScore.score}/100`);
    console.log(`👉 Tendência de Evolução: ${twin.prediction.expectedEvolutionTrend.toUpperCase()}`);

    console.log("\nSimulando a conclusão de um treino pesado (WORKOUT_COMPLETED)...");
    const result1 = await processTwinEvent(twin, {
      type: "WORKOUT_COMPLETED",
      payload: { volumeSets: 20, averageRIR: 1, perceivedExertion: 8 }
    });
    twin = result1.newTwinState;
    console.log(`👉 Novo Health Score após treino: ${twin.healthScore.score}/100`);
    console.log(`👉 Nível de Fadiga Atualizado: ${twin.recovery.fatigueLevel}`);
    console.log(`👉 Versão do Gêmeo: ${twin.version}`);
    console.log(`👉 Trigger do Snapshot: ${result1.snapshot.triggerEvent}`);

    console.log("\nSimulando uma nova avaliação biomecânica excelente (NEW_ASSESSMENT)...");
    const result2 = await processTwinEvent(twin, {
      type: "NEW_ASSESSMENT",
      payload: { newIgb: 92, activeFindings: [] }
    });
    twin = result2.newTwinState;
    console.log(`👉 IGB atualizado: ${twin.biomechanics.igb}`);
    console.log(`👉 Novo Health Score: ${twin.healthScore.score}/100`);
    console.log(`👉 Versão do Gêmeo: ${twin.version}`);

    console.log("\n==================================================");
    console.log("🔮 PREDICTIVE ANALYTICS ENGINE (ETAPA 16)");
    console.log("==================================================");
    const predictionContext = {
      digitalTwin: twin,
      workoutHistory: new Array(25).fill({ completed: true }), // 25 treinos para conferir confiança
      performanceHistory: [
        { date: "2026-06-15", prs: { "bench_press": 85 }, volume: 15 },
        { date: "2026-07-15", prs: { "bench_press": 90 }, volume: 18 }
      ],
      adherenceHistory: [
        { date: "2026-06", adherence: 80 },
        { date: "2026-07", adherence: 85 }
      ]
    };

    const projections = await runPredictiveEngine(predictionContext);
    console.log(`🎯 Risco de Churn: ${projections.risks.prediction.dropout}% (Confiança: ${projections.risks.confidence}%)`);
    console.log(`🎯 Risco de Lesão: ${projections.risks.prediction.injuryAttention}% (Confiança: ${projections.risks.confidence}%)`);
    console.log(`🎯 Projeção de Cargas (bench_press em 30 dias): ${projections.progression.prediction.expectedPrs30Days["bench_press"] || 0} kg`);
    console.log(`🎯 Probabilidade de Atingir Meta: ${projections.timeline.prediction.goalCompletionProbability}%`);
    console.log(`🎯 Recomendação de Transição de Mesociclo: ${projections.mesocycle.prediction.recommendTransition ? "Sim" : "Não"} (${projections.mesocycle.prediction.reason})`);
    
    console.log("📋 Recomendações Preditivas Geradas:");
    projections.recommendations.forEach(rec => console.log(`   - [${rec.trigger.toUpperCase()}] ${rec.action}`));

    // ============================================================================
    // 🧠 ADAPTIVE LEARNING ENGINE (ETAPA 17)
    // ============================================================================
    console.log("\n==================================================");
    console.log("🧠 ADAPTIVE LEARNING ENGINE (ETAPA 17)");
    console.log("==================================================");

    // Gerando outcomes suficientes (110) para ativar o pattern miner (>=50) e a hipótese (>=100)
    console.log("📊 Simulando a coleta de 110 resultados de treinos anonimizados...");
    const recentOutcomes = Array.from({ length: 110 }, (_, i) => ({
      decisionId: `dec_test_${i}`,
      date: new Date().toISOString(),
      studentId: `student_${i}`,
      cohortId: "cohort_hypertrophy_intermediate_30-45",
      strategyApplied: "CAX_tension_focus",
      expectedResult: "Biomechanics optimization and performance maintenance",
      actualResult: (i % 10 < 9 ? "positive" : "neutral") as "positive" | "neutral" | "negative", // 90% de taxa de sucesso
      metrics: { igbDelta: 3, adherenceDelta: 5, fatigueDelta: 8 }
    }));

    const cycleResult = await runAdaptiveLearningCycle(recentOutcomes);
    console.log(`👉 Resultados processados: ${cycleResult.processedOutcomes}`);
    console.log(`👉 Padrões minerados: ${cycleResult.patternsMined}`);
    console.log(`👉 Status: ${cycleResult.status}`);

    const hypotheses = learningPipeline.getActiveHypotheses();
    console.log(`👉 Hipóteses ativas geradas: ${hypotheses.length}`);
    if (hypotheses.length > 0) {
      const hyp = hypotheses[0];
      console.log(`   - ID: ${hyp.id}`);
      console.log(`   - Estratégia: ${hyp.strategyName}`);
      console.log(`   - Cohort: ${hyp.targetCohortId}`);
      console.log(`   - Status inicial: ${hyp.status}`);

      // Promover para validação (Shadow Mode)
      console.log("\n🧪 Promovendo hipótese para Validação (Shadow Mode)...");
      learningPipeline.promoteToValidation(hyp.id);
      console.log(`   - Novo Status: ${hyp.status}`);

      // Tentar aprovação sem assinatura válida (espera-se erro)
      console.log("\n🔒 Testando segurança: Tentativa de aprovação sem assinatura válida...");
      try {
        learningPipeline.approveToProduction(hyp.id, "coach_user_123");
      } catch (err: any) {
        console.log(`   - Retorno esperado de erro: ${err.message}`);
      }

      // Aprovar com assinatura válida
      console.log("\n✅ Aprovando hipótese em produção com assinatura Admin...");
      learningPipeline.approveToProduction(hyp.id, "admin_cax_cxm_gustavo");
      console.log(`   - Novo Status: ${hyp.status}`);

      // Demonstrando o Rollback de segurança
      console.log("\n⚠️ Simulando anomalia e disparando rollback de segurança...");
      learningPipeline.executeRollback(hyp.id, "Aumento inesperado de fadiga no grupo de teste.");
      console.log(`   - Status final após Rollback: ${hyp.status}`);
    }

    // ============================================================================
    // 📡 UNIFIED INTELLIGENCE PLATFORM (ETAPA 18)
    // ============================================================================
    console.log("\n==================================================");
    console.log("📡 UNIFIED INTELLIGENCE PLATFORM (ETAPA 18)");
    console.log("==================================================");

    console.log("🔌 Inicializando workflows e ouvintes do barramento de eventos...");

    console.log("📤 Enviando nova avaliação biomecânica via API Gateway...");
    const gatewayResponse = await ApiGateway.handleMobileAssessmentUpload({
      studentId: "aluno_teste_001",
      photoData: "base64_image_data_here"
    });
    console.log(`👉 Status da API: ${gatewayResponse.status}`);
    console.log(`👉 Mensagem do Gateway: "${gatewayResponse.message}"`);

    console.log("\n📡 Publicando evento direto de Alerta de Churn...");
    uipEventBus.publish({
      topic: "PREDICTION_ALERT",
      payload: { studentId: "aluno_teste_001", riskType: "churn", confidence: 85 }
    });

    // ============================================================================
    // 🏋️ EXERCISE INTELLIGENCE DATABASE (ETAPA 19)
    // ============================================================================
    console.log("\n==================================================");
    console.log("🏋️ EXERCISE INTELLIGENCE DATABASE (ETAPA 19)");
    console.log("==================================================");

    console.log("🔍 Buscando substituto inteligente para 'Supino Reto com Barra' (bench_press_barbell)...");
    const substitutes = findSmartSubstitute({
      targetExerciseId: "bench_press_barbell",
      availableEquipment: ["dumbbell"]
    });
    console.log(`👉 Encontrado(s) ${substitutes.length} substituto(s) compatível(is):`);
    substitutes.forEach(sub => {
      console.log(`   - Exercício: ${sub.exercise.name} (ID: ${sub.exercise.id}) | Similaridade DNA: ${Math.round(sub.similarityScore * 100)}%`);
    });

    console.log("\n📊 Calculando carga muscular efetiva para uma sessão de treino...");
    const sessionLoad = calculateSessionMuscleLoad([
      { exerciseId: "bench_press_barbell", sets: 4, reps: 10 },
      { exerciseId: "push_up", sets: 3, reps: 15 }
    ]);
    console.log("👉 Distribuição de volume muscular efetivo (com coeficientes de ativação):");
    Object.entries(sessionLoad.muscleVolumeDistribution).forEach(([muscle, vol]) => {
      console.log(`   - ${muscle}: ${vol.toFixed(1)} séries-reps efetivas`);
    });
    console.log(`👉 Fadiga sistêmica estimada no SNC: ${sessionLoad.estimatedSystemicFatigue}`);


    // ============================================================================
    // 🧬 HUMAN ADAPTATION ENGINE (ETAPA 20)
    // ============================================================================
    console.log("\n==================================================");
    console.log("🧬 HUMAN ADAPTATION ENGINE (ETAPA 20)");
    console.log("==================================================");

    console.log("⚡ Simulando resposta fisiológica à sessão de treino...");
    
    // Preparando o estado inicial do aluno
    const initialAdaptationState = {
      stimulus: { mechanicalTension: 0, metabolicStress: 0, neuromuscularDemand: 0, systemicStress: 0 },
      fatigue: { localFatigue: {}, systemicFatigue: 10, neuralFatigue: 5 },
      recovery: { muscleReadiness: {}, overallReadiness: 90 },
      capacity: { weeklyCapacitySets: 15, currentLoadSets: 0, remainingCapacity: 15 },
      learning: { movementLearningScore: 70, movementEfficiency: 75 },
      signature: { volumeResponse: "moderate" as const, frequencyResponse: "moderate" as const, technicalLearningRate: "average" as const, fatigueSensitivity: "moderate" as const },
      lastUpdated: new Date().toISOString()
    };

    const sessionData = {
      exercises: [
        {
          exerciseId: "bench_press_barbell",
          sets: 4,
          reps: 10,
          rir: 2, // Treino intenso, perto da falha
          dna: ExerciseDatabase["bench_press_barbell"].dna
        }
      ],
      durationMin: 45,
      perceivedExertion: 8 // Esforço alto
    };

    const adaptationResult = runHumanAdaptationEngine({
      session: sessionData,
      currentState: initialAdaptationState,
      historicalData: {
        igbDelta: 3,
        consistencyScore: 85,
        historicalProgress: 4,
        historicalFatigue: 30
      }
    });

    console.log("👉 Estímulo da Sessão Calculado:");
    console.log(`   - Tensão Mecânica: ${adaptationResult.stimulus.mechanicalTension}/100`);
    console.log(`   - Estresse Metabólico: ${adaptationResult.stimulus.metabolicStress}/100`);
    console.log(`   - Demanda Neuromuscular: ${adaptationResult.stimulus.neuromuscularDemand}/100`);
    console.log(`   - Estresse Sistêmico: ${adaptationResult.stimulus.systemicStress}/100`);

    console.log("👉 Estado de Fadiga e Recuperação Calculado:");
    console.log(`   - Fadiga Sistêmica: ${adaptationResult.fatigue.systemicFatigue}/100`);
    console.log(`   - Fadiga Neural: ${adaptationResult.fatigue.neuralFatigue}/100`);
    console.log(`   - Prontidão Geral (Readiness): ${adaptationResult.recovery.overallReadiness}/100`);

    console.log("👉 Capacidade Adaptativa Semanal:");
    console.log(`   - Teto Máximo Tolerado: ${adaptationResult.capacity.weeklyCapacitySets} séries`);
    console.log(`   - Saldo de Volume Restante: ${adaptationResult.capacity.remainingCapacity} séries`);

    console.log("👉 Evolução do Aprendizado Motor:");
    console.log(`   - Score de Estabilidade Técnica: ${adaptationResult.learning.movementLearningScore}/100`);
    console.log(`   - Eficiência de Movimento: ${adaptationResult.learning.movementEfficiency}/100`);

    console.log("👉 Assinatura de Adaptação Fisiológica Atualizada:");
    console.log(`   - Sensibilidade à Fadiga: ${adaptationResult.signature.fatigueSensitivity}`);
    console.log(`   - Resposta de Volume: ${adaptationResult.signature.volumeResponse}`);


  } catch (error) {
    console.error("❌ Falha no teste:", error);
  }
}

runTest();

