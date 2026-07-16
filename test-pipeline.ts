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
  ExerciseDatabase,
  processCapture,
  mapBody,
  analyzeBody,
  runBiomechanicsEngine,
  calculateBiomechanicalScore,
  runEvolutionEngine,
  buildIntegratedWorkout,
  runAdaptiveDecisionEngine,
  runAiCoachEngine,
  processStudentFeedback
} from "./src/shared/modules/biomechanics";

import {
  updateTwinFromWorkout,
  updateTwinFromAssessment,
  generateTwinInsights,
  DigitalTwin as DigitalTwinV3,
  WorkoutResultPayload,
  TwinInsight
} from "./src/shared/modules/digital-twin";

import {
  forecastFatigue,
  predictPlateau,
  simulateVolumeResponse,
  predictRetentionRisk,
  runPredictiveAnalyticsEngine,
  DigitalTwinMock,
  FatigueForecast,
  PlateauPrediction,
  VolumeResponseSimulation,
  ChurnPrediction,
  PredictiveReport
} from "./src/shared/modules/predictive-analytics";

import {
  evaluateDecisionResult,
  applyMemoryCorrection,
  executeDecisionFlow,
  type DecisionRecord,
  type PerformanceSnapshot,
  type StudentLearningProfile,
  type IntelligenceDecision,
  inferClinicalPath,
  clinicalNodes,
  clinicalEdges,
  type NodeType,
  type GraphNode,
  type EdgeRelation,
  type GraphEdge,
  type CorrectivePrescription,
  type ClinicalInference
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

    // ============================================================================
    // 📸 CAPTURE ENGINE (PHASE 1.2)
    // ============================================================================
    console.log("\n==================================================");
    console.log("📸 CAPTURE ENGINE (PHASE 1.2)");
    console.log("==================================================");

    const validTestImage = {
      id: "img_001",
      studentId: "student_abc",
      url: "https://example.com/front.jpg",
      width: 1080,
      height: 1920,
      qualityScore: 85,
      view: "front" as const,
      validated: false,
      createdAt: new Date()
    };

    console.log("🔍 Processando captura válida de foto...");
    const captureResult = await processCapture(validTestImage);
    console.log(`👉 Foto processada com sucesso!`);
    console.log(`   - Dimensões Normalizadas: ${captureResult.image.width}x${captureResult.image.height}`);
    console.log(`   - Formato de Saída: ${captureResult.image.format}`);
    console.log(`   - Score de Qualidade: ${captureResult.quality}/100`);
    if (captureResult.warnings.length > 0) {
      console.log(`   - Avisos: ${captureResult.warnings.join(", ")}`);
    }

    const invalidTestImage = {
      id: "img_002",
      studentId: "student_abc",
      url: "https://example.com/low_res.jpg",
      width: 640, // Abaixo de 720px
      height: 480, // Abaixo de 1280px
      qualityScore: 50,
      view: "back" as const,
      validated: false,
      createdAt: new Date()
    };

    console.log("\n🔍 Testando rejeição automática de foto de baixa resolução...");
    try {
      await processCapture(invalidTestImage);
      console.log("❌ ERRO: A foto de baixa resolução deveria ter sido rejeitada!");
    } catch (err: any) {
      console.log(`✅ Sucesso! Foto rejeitada como esperado:`);
      console.log(`   - Mensagem de Erro:\n${err.message}`);
    }

    // ============================================================================
    // 👁️ VISION ENGINE / BODY MAPPER (PHASE 1.3)
    // ============================================================================
    console.log("\n==================================================");
    console.log("👁️ VISION ENGINE / BODY MAPPER (PHASE 1.3)");
    console.log("==================================================");

    console.log("🔍 Mapeando pontos corporais da imagem frontal...");
    const bodyMapResult = await mapBody("https://example.com/front.jpg");
    console.log("👉 Pontos corporais detectados:");
    bodyMapResult.landmarks.points.forEach(p => {
      console.log(`   - ${p.name}: [x: ${p.x.toFixed(2)}, y: ${p.y.toFixed(2)}] (Confiança: ${Math.round(p.confidence * 100)}%)`);
    });

    console.log("\n👉 Relações geométricas do esqueleto construídas:");
    bodyMapResult.skeleton.segments.forEach(seg => {
      console.log(`   - Segmento: ${seg.from} ➔ ${seg.to}`);
      console.log(`     Comprimento vetorial normalizado: ${seg.length.toFixed(4)}`);
      console.log(`     Ângulo em relação à horizontal: ${seg.angle.toFixed(2)}°`);
    });

    console.log(`\n👉 Confiança geral do Mapeamento Corporal: ${Math.round(bodyMapResult.confidence * 100)}%`);

    // ============================================================================
    // 📊 BODY ANALYSIS ENGINE (PHASE 1.4)
    // ============================================================================
    console.log("\n==================================================");
    console.log("📊 BODY ANALYSIS ENGINE (PHASE 1.4)");
    console.log("==================================================");

    console.log("🔍 Analisando landmarks corporais e detectando desvios...");
    const analysisResult = analyzeBody(bodyMapResult.landmarks);

    console.log("👉 Alinhamentos:");
    analysisResult.alignment.forEach(align => {
      console.log(`   - ${align.region}: Desvio de ${align.deviation}° (Status: ${align.status})`);
    });

    console.log("\n👉 Simetrias:");
    analysisResult.symmetry.forEach(sym => {
      console.log(`   - Parte: ${sym.bodyPart}, Diferença: ${sym.difference}%, Gravidade: ${sym.severity}`);
    });

    console.log("\n👉 Mobilidades estimadas:");
    analysisResult.mobility.forEach(mob => {
      console.log(`   - Articulação: ${mob.joint}, Estimativa: ${mob.estimatedRange}°, Restrição: ${mob.restriction}`);
    });

    console.log("\n👉 Compensações biomecânicas identificadas:");
    analysisResult.compensations.forEach(comp => {
      console.log(`   - Movimento: ${comp.movement}`);
      console.log(`     Desvio: ${comp.finding}`);
      console.log(`     Possível causa: ${comp.possibleCause}`);
    });

    // ============================================================================
    // ⚙️ BIOMECHANICAL ENGINE (PHASE 1.5)
    // ============================================================================
    console.log("\n==================================================");
    console.log("⚙️ BIOMECHANICAL ENGINE (PHASE 1.5)");
    console.log("==================================================");

    console.log("🔍 Processando regras anatômicas, riscos e impactos de treino...");
    const biomechanicsReport = runBiomechanicsEngine(analysisResult);

    console.log(`👉 Risco Biomecânico Geral: ${biomechanicsReport.overallRisk.toUpperCase()}`);
    console.log(`👉 Quantidade de Regras Ativadas: ${biomechanicsReport.rawAnalysisCount}`);

    console.log("\n👉 Achados Clínicos (Findings):");
    biomechanicsReport.findings.forEach(finding => {
      console.log(`   - [${finding.ruleId}] ${finding.interpretation} (Gravidade: ${finding.severity.toUpperCase()})`);
    });

    console.log("\n👉 Impactos Práticos de Treinamento:");
    biomechanicsReport.trainingImpacts.forEach(impact => {
      console.log(`   - Categoria: ${impact.exerciseCategory}`);
      console.log(`     Consequência: ${impact.riskDescription}`);
      console.log(`     Recomendação: ${impact.recommendation}`);
    });

    // ============================================================================
    // ⚙️ SCORING ENGINE (PHASE 1.7)
    // ============================================================================
    console.log("\n==================================================");
    console.log("⚙️ SCORING ENGINE (PHASE 1.7)");
    console.log("==================================================");

    console.log("🔍 Calculando IGB (Índice Global Biomecânico) ponderado...");
    // Mapeia o resultado da Fase 1.4 (analysisResult) para ScoringAnalysisInput
    const scoringInput = {
      alignment: analysisResult.alignment.map(a => ({
        region: a.region,
        status: a.status as "normal" | "attention" | "critical"
      })),
      mobility: analysisResult.mobility.map(m => ({
        joint: m.joint,
        restriction: m.restriction as "none" | "moderate" | "high"
      })),
      symmetry: analysisResult.symmetry.map(s => ({
        bodyPart: s.bodyPart,
        difference: s.difference
      })),
      movements: [
        { name: "squat", qualityScore: 85 },
        { name: "push", qualityScore: 90 }
      ]
    };

    const scoringResult = calculateBiomechanicalScore(scoringInput);

    console.log(`👉 IGB Oficial (Global Score): ${scoringResult.globalScore}/100`);
    console.log(`👉 Nível de Risco Clínico/Operacional: ${scoringResult.riskLevel.toUpperCase()}`);
    console.log(`👉 Score de Postura: ${scoringResult.postureScore}/100`);
    console.log(`👉 Score de Mobilidade: ${scoringResult.mobilityScore}/100`);
    console.log(`👉 Score de Simetria: ${scoringResult.symmetryScore}/100`);
    console.log(`👉 Score de Movimento: ${scoringResult.movementScore}/100`);

    // ============================================================================
    // ⚙️ EVOLUTION ENGINE (PHASE 1.8)
    // ============================================================================
    console.log("\n==================================================");
    console.log("⚙️ EVOLUTION ENGINE (PHASE 1.8)");
    console.log("==================================================");

    console.log("🔍 Inicializando histórico de avaliações e executando análise de evolução...");

    // Histórico de avaliações (Simuladas)
    const historyAssessments = [
      {
        id: "eval_001",
        date: "2026-06-01T08:00:00Z",
        scores: {
          globalScore: 78,
          postureScore: 80,
          mobilityScore: 70,
          symmetryScore: 85,
          regional: {
            shoulder: 75,
            spine: 80,
            hip: 85,
            knee: 70,
            ankle: 65
          }
        },
        findings: [
          { ruleId: "ANKLE_LIMITATION", interpretation: "Limitação de dorsiflexão", region: "ankle" as const },
          { ruleId: "SHOULDER_ASYMMETRY", interpretation: "Desnível nos ombros", region: "shoulder" as const }
        ]
      }
    ];

    // Nova avaliação (Estado atualizado)
    const currentAssessment = {
      id: "eval_002",
      date: "2026-07-16T08:00:00Z",
      scores: {
        globalScore: 88, // Subiu!
        postureScore: 90,
        mobilityScore: 85,
        symmetryScore: 90,
        regional: {
          shoulder: 85, // Melhorou!
          spine: 85,
          hip: 88,
          knee: 80,
          ankle: 65 // Continua igual
        }
      },
      findings: [
        // ANKLE_LIMITATION persiste, SHOULDER_ASYMMETRY resolvido!
        { ruleId: "ANKLE_LIMITATION", interpretation: "Limitação de dorsiflexão", region: "ankle" as const }
      ]
    };

    const evolutionReport = runEvolutionEngine("aluno_teste_001", historyAssessments, currentAssessment);

    console.log(`👉 Aluno ID: ${evolutionReport.studentId}`);
    console.log(`👉 Dias entre Avaliações: ${evolutionReport.daysBetweenAssessments} dias`);

    console.log("\n📈 Evolução por Região Corporal (Regional Deltas):");
    evolutionReport.regionalEvolution.forEach(reg => {
      const statusIcon = reg.status === "improved" ? "✅" : reg.status === "worse" ? "⚠️" : "➡️";
      console.log(`   - [${reg.region.toUpperCase()}] Anterior: ${reg.before} | Atual: ${reg.after} | Delta: ${reg.delta >= 0 ? "+" : ""}${reg.delta} (${statusIcon} ${reg.status.toUpperCase()})`);
    });

    console.log("\n📅 Linha do Tempo Biomecânica (Timeline Events):");
    evolutionReport.timeline.events.forEach(event => {
      console.log(`   - [${event.date.split("T")[0]}] [${event.type.toUpperCase()}] ${event.title}: ${event.description}`);
    });

    console.log("\n⚡ Recomendações e Ajustes de Treino (Training Adaptation):");
    console.log(`   - Adicionar ao Treino:`, evolutionReport.trainingAdjustments.add);
    console.log(`   - Modificar no Treino:`, evolutionReport.trainingAdjustments.modify);
    console.log(`   - Pontos de Atenção:`, evolutionReport.trainingAdjustments.attentionPoints);

    // ============================================================================
    // ⚙️ TRAINING INTEGRATION ENGINE V2 (PHASE 2.0)
    // ============================================================================
    console.log("\n==================================================");
    console.log("⚙️ TRAINING INTEGRATION ENGINE V2 (PHASE 2.0)");
    console.log("==================================================");

    console.log("🔍 Inicializando plano de treino padrão e restrições...");

    const basePlan = {
      id: "plan_hipertrofia_001",
      focus: "hipertrofia",
      exercises: [
        { id: "bench_press_barbell", name: "Supino Reto com Barra", category: "push", tags: ["heavy_barbell_press", "chest"], sets: 4, reps: "8-10" },
        { id: "squat_barbell", name: "Agachamento Livre com Barra", category: "squat", tags: ["deep_squat", "quads"], sets: 4, reps: "8-10" },
        { id: "pull_up", name: "Puxada Frontal na Polia", category: "pull", tags: ["back", "latissimus"], sets: 3, reps: "10-12" }
      ]
    };

    const biomechanicalConstraints = [
      { ruleId: "ANKLE_LIMITATION", severity: "high" as const, region: "ankle", confidence: 0.95 },
      { ruleId: "SHOULDER_ASYMMETRY", severity: "medium" as const, region: "shoulder", confidence: 0.88 }
    ];

    const integratedResult = buildIntegratedWorkout(basePlan, biomechanicalConstraints);

    console.log(`👉 Plano Original: ${integratedResult.originalPlanId}`);

    console.log("\n🌡️ Aquecimento Inteligente (Smart Warmup Routine - 4 Fases):");
    integratedResult.smartWarmup.forEach((phase, i) => {
      console.log(`   - Fase ${i + 1}: [${phase.phase.toUpperCase()}] (${phase.duration} min)`);
      console.log(`     Exercícios:`, phase.exercises);
      console.log(`     Razão: ${phase.reason}`);
    });

    console.log("\n🏋️ Treino Adaptado e Seguro (Main Workout):");
    integratedResult.mainWorkout.forEach(ex => {
      console.log(`   - Exercício: ${ex.name} | Séries: ${ex.sets} | Reps: ${ex.reps} | Decisão: ${ex.decision.action.toUpperCase()}`);
      console.log(`     Motivo: ${ex.decision.reason} | Confiança: ${(ex.decision.confidence * 100).toFixed(0)}%`);
    });

    console.log("\n📋 Decisões do Sistema Registradas para Auditoria (System Decisions):");
    integratedResult.systemDecisions.forEach((dec, i) => {
      console.log(`   - Decisão ${i + 1}: [${dec.action.toUpperCase()}] Alvo: ${dec.target}`);
      console.log(`     Detalhes: ${dec.reason} (Confiança: ${(dec.confidence * 100).toFixed(0)}%)`);
    });

    // ============================================================================
    // ⚙️ ADAPTIVE DECISION ENGINE V3 (PHASE 2.1)
    // ============================================================================
    console.log("\n==================================================");
    console.log("⚙️ ADAPTIVE DECISION ENGINE V3 (PHASE 2.1)");
    console.log("==================================================");

    console.log("🔍 Testando a adaptação dinâmica com base no contexto do aluno...");

    const contextsToTest = [
      {
        name: "Cenário 1: Excelente prontidão, biomecânica e performance (Esperado: PUSH)",
        context: {
          readinessScore: 90,
          biomechanicalScore: 92,
          performanceScore: 88
        }
      },
      {
        name: "Cenário 2: Baixa prontidão e restrições acumuladas (Esperado: DELOAD)",
        context: {
          readinessScore: 40,
          biomechanicalScore: 50,
          performanceScore: 45
        }
      },
      {
        name: "Cenário 3: Equilíbrio geral de prontidão e postura (Esperado: MAINTAIN)",
        context: {
          readinessScore: 75,
          biomechanicalScore: 72,
          performanceScore: 70
        }
      }
    ];

    contextsToTest.forEach(scenario => {
      console.log(`\n🏃 ${scenario.name}`);
      const output = runAdaptiveDecisionEngine(scenario.context, ["shoulder_mobility", "core_stability"]);
      
      console.log(`👉 Score Final de Decisão (Weighted): ${output.decisionScore.finalScore}/100`);
      console.log(`👉 Diretriz do Dia recomendada: ${output.directive}`);
      console.log(`👉 Multiplicador de Volume: x${output.payload.volumeMultiplier}`);
      console.log(`👉 Multiplicador de Intensidade: x${output.payload.intensityMultiplier}`);
      console.log(`👉 RIR Target (Repetições em Reserva): ${output.payload.rirTarget}`);
      if (output.payload.exerciseRestrictions.length > 0) {
        console.log(`👉 Restrições de Exercício Ativas:`, output.payload.exerciseRestrictions);
      }
      console.log(`👉 Foco Prioritário:`, output.payload.priorityFocus);
    });

    // ============================================================================
    // ⚙️ AI COACH ENGINE V2 (PHASE 2.2)
    // ============================================================================
    console.log("\n==================================================");
    console.log("⚙️ AI COACH ENGINE V2 (PHASE 2.2)");
    console.log("==================================================");

    const studentProfile = {
      studentName: "Gustavo",
      trainingGoal: "Hipertrofia de Membros Superiores",
      weeksTraining: 12,
      previousEvolution: "ganho de força no agachamento",
      currentChallenge: "melhorar mobilidade de tornozelo"
    };

    console.log("🔍 Inicializando perfil do aluno e simulando interações com o AI Coach...");

    const testDirectives = ["PUSH", "DELOAD", "RECOVERY_ONLY"] as const;

    testDirectives.forEach(dir => {
      console.log(`\n🗣️ Testando diretriz de treino: ${dir}`);
      const coachOutput = runAiCoachEngine(dir, studentProfile, 21); // Testando no dia de ciclo 21

      console.log(`👉 Headline da Mensagem: ${coachOutput.message.headline}`);
      console.log(`👉 Corpo da Mensagem (Explainable AI): ${coachOutput.message.body}`);
      console.log(`👉 Botão de Ação: ${coachOutput.message.callToAction}`);
      
      if (coachOutput.pushNotificationTrigger) {
        console.log(`👉 Notificação Push Agendada (Dia do Ciclo ${21}):`);
        console.log(`   - Título: ${coachOutput.pushNotificationTrigger.title}`);
        console.log(`   - Corpo: ${coachOutput.pushNotificationTrigger.body}`);
        console.log(`   - Payload:`, coachOutput.pushNotificationTrigger.dataPayload);
      } else {
        console.log("👉 Sem gatilhos de notificação agendados.");
      }

      console.log(`👉 Registro de Histórico salvo: [ID: ${coachOutput.historyLog.id}] [Tipo: ${coachOutput.historyLog.type}]`);
    });

    // Testando o feedback loop
    console.log("\n💬 Enviando feedback do aluno:");
    const feedbackObj = {
      date: new Date().toISOString(),
      rating: 5 as const,
      feeling: "better" as const,
      comment: "Amei o treino adaptado hoje! Senti menos dor e me recuperei super rápido.",
      relatedDirective: "DELOAD"
    };
    processStudentFeedback(feedbackObj);

    // ============================================================================
    // 🧬 DIGITAL TWIN ENGINE V3 (PHASE 2.3)
    // ============================================================================
    console.log("\n==================================================");
    console.log("🧬 DIGITAL TWIN ENGINE V3 (PHASE 2.3)");
    console.log("==================================================");

    const initialTwin: DigitalTwinV3 = {
      studentId: "aluno_digital_twin_007",
      lastUpdated: new Date().toISOString(),
      reliability: {
        trainingSessionsAnalyzed: 65, // Acima do limiar de 60 para gerar insights
        monthsTracked: 3,
        confidenceScore: 62.5
      },
      biomechanics: {
        currentIgb: 80,
        igbHistory: [75, 78, 80],
        movementQualityScore: 82,
        mobilityTrend: "stable",
        persistentRestrictions: ["heavy_squat", "overhead_press"],
        resolvedRestrictions: ["bench_press_discomfort"],
        lastAssessmentDate: new Date().toISOString()
      },
      performance: {
        volumeTolerance: "medium",
        estimatedMRV: 15,
        strengthTrend: "improving",
        preferredRepRange: "8-12",
        historyOfPlateaus: 1,
        exerciseResponses: {
          "leg_press": {
            exercise: "Leg Press 45",
            response: "good",
            painResponse: 1,
            performanceGain: 5
          }
        }
      },
      recovery: {
        chronicFatigue: 35,
        baselineSleepQuality: 8,
        fatigueDecayRate: 1.5,
        averageRecoveryDays: 2,
        sleepSensitivity: 6,
        stressSensitivity: 4,
        injuryRiskScore: 20
      },
      behavior: {
        adherenceScore: 55, // Um pouco baixa para testar o alerta de evasão
        feedbackSentiment: 4,
        preferredExerciseTags: ["quadriceps", "hypertrophy"],
        dislikedExerciseTags: ["cardio"],
        engagementPhase: "engaged",
        communicationPreference: "whatsapp",
        motivationTrigger: "performance"
      }
    };

    console.log("🔍 Estado Inicial do Gêmeo Digital:");
    console.log(`👉 Id Aluno: ${initialTwin.studentId}`);
    console.log(`👉 Sessões Analisadas: ${initialTwin.reliability.trainingSessionsAnalyzed}`);
    console.log(`👉 Confiança da IA: ${initialTwin.reliability.confidenceScore}%`);
    console.log(`👉 Fadiga Crônica Inicial: ${initialTwin.recovery.chronicFatigue}`);
    console.log(`👉 MRV Estimado Inicial: ${initialTwin.performance.estimatedMRV}`);

    // Testando atualização pós-treino (updateTwinFromWorkout)
    console.log("\n🏋️ Simulando término de sessão de treino de alta intensidade...");
    const workoutPayload: WorkoutResultPayload = {
      effectiveVolume: 120,
      averageRpe: 9,
      averageRir: 1,
      mechanicalTension: 85,
      metabolicStress: 75,
      skippedExercises: [],
      feedbackFeeling: "better" // Sentiu-se melhor com alta tensão mecânica -> MRV deve aumentar
    };

    const twinAfterWorkout = updateTwinFromWorkout(initialTwin, workoutPayload);
    console.log("📈 Estado Atualizado Pós-Treino:");
    console.log(`👉 Sessões Analisadas: ${twinAfterWorkout.reliability.trainingSessionsAnalyzed}`);
    console.log(`👉 Confiança da IA: ${twinAfterWorkout.reliability.confidenceScore.toFixed(1)}%`);
    console.log(`👉 Fadiga Crônica Atualizada: ${twinAfterWorkout.recovery.chronicFatigue.toFixed(2)}`);
    console.log(`👉 MRV Estimado Atualizado: ${twinAfterWorkout.performance.estimatedMRV}`);
    console.log(`👉 Score de Adesão Comportamental: ${twinAfterWorkout.behavior.adherenceScore}`);

    // Testando atualização pós-avaliação (updateTwinFromAssessment)
    console.log("\n📋 Simulando nova reavaliação biomecânica...");
    const twinAfterAssessment = updateTwinFromAssessment(
      twinAfterWorkout,
      85, // Novo IGB de 85 (evolução em relação ao 80 anterior -> mobilidade trend: improving)
      90, // Novo score de movimento
      ["overhead_press"] // "heavy_squat" foi resolvida!
    );

    console.log("📈 Estado Atualizado Pós-Avaliação:");
    console.log(`👉 Novo IGB: ${twinAfterAssessment.biomechanics.currentIgb}`);
    console.log(`👉 Histórico de IGB: [${twinAfterAssessment.biomechanics.igbHistory.join(", ")}]`);
    console.log(`👉 Tendência de Mobilidade: ${twinAfterAssessment.biomechanics.mobilityTrend.toUpperCase()}`);
    console.log(`👉 Restrições Ativas: [${twinAfterAssessment.biomechanics.persistentRestrictions.join(", ")}]`);
    console.log(`👉 Restrições Resolvidas: [${twinAfterAssessment.biomechanics.resolvedRestrictions.join(", ")}]`);

    // Gerando insights preditivos e alertas inteligentes
    console.log("\n🔮 Executando Motor de Insights Preditivos (Insight Generator):");
    const insights = generateTwinInsights(twinAfterAssessment);
    if (insights.length > 0) {
      insights.forEach((ins, idx) => {
        console.log(`👉 [Insight #${idx + 1}] Categoria: ${ins.category.toUpperCase()}`);
        console.log(`   Mensagem: ${ins.message}`);
      });
    } else {
      console.log("👉 Nenhum insight gerado para o nível de maturidade e estado atual.");
    }

    // ============================================================================
    // 🔮 PREDICTIVE ANALYTICS ENGINE (PHASE 2.4)
    // ============================================================================
    console.log("\n==================================================");
    console.log("🔮 PREDICTIVE ANALYTICS ENGINE (PHASE 2.4)");
    console.log("==================================================");

    // Mock do gêmeo digital conforme a especificação
    const studentTwinMock: DigitalTwinMock = {
      recovery: {
        chronicFatigue: 45,
        fatigueDecayRate: 15 // Recupera bem
      },
      performance: {
        estimatedMRV: 18,
        historyOfPlateaus: 2,
        strengthTrend: "improving"
      },
      behavior: {
        adherenceScore: 82,
        engagementPhase: "engaged"
      }
    };

    console.log("🔍 Inicializando Gêmeo Digital Mockado para predição:");
    console.log(`👉 Fadiga Crônica Atual: ${studentTwinMock.recovery.chronicFatigue}`);
    console.log(`👉 MRV Estimado: ${studentTwinMock.performance.estimatedMRV} séries`);
    console.log(`👉 Adesão Comportamental: ${studentTwinMock.behavior.adherenceScore}%`);

    // 1. Testando Fadiga Base/Projeção (forecastFatigue)
    console.log("\n📉 Projeção de Fadiga (Fadiga em 7 & 14 dias):");
    const forecast = forecastFatigue(studentTwinMock, 20); // 20 séries planejadas (passa ligeiramente do MRV de 18)
    console.log(`👉 Fadiga prevista em 7 dias: ${forecast.predictedFatigueIn7Days}`);
    console.log(`👉 Fadiga prevista em 14 dias: ${forecast.predictedFatigueIn14Days}`);
    console.log(`👉 Dias para fadiga crítica (85%): ${forecast.timeToCriticalFatigueDays ?? "Estável (Sem risco)"}`);

    // 2. Testando Preditor de Estagnação (predictPlateau)
    console.log("\n🧱 Preditor de Estagnação (Plateau Predictor):");
    const plateau = predictPlateau(studentTwinMock, forecast);
    console.log(`👉 Probabilidade de Estagnação: ${(plateau.plateauProbability * 100).toFixed(0)}%`);
    console.log(`👉 Semanas estimadas até estagnar: ${plateau.estimatedWeeksUntilPlateau}`);
    console.log(`👉 Principal fator de risco: ${plateau.primaryRiskFactor}`);

    // 3. Testando Simulador What-If de Volume (simulateVolumeResponse)
    console.log("\n⚖️ Simulador What-If de Volume de Treino:");
    
    const simHigh = simulateVolumeResponse(studentTwinMock, 14, 2); // 14 + 2 = 16 séries (dentro do MRV de 18)
    console.log(`👉 Cenário A (Adicionar 2 séries ao volume atual de 14):`);
    console.log(`   - Benefício previsto: ${simHigh.predictedBenefit.toUpperCase()}`);
    console.log(`   - Pico de fadiga previsto: +${simHigh.predictedFatigueSpike}`);

    const simJunk = simulateVolumeResponse(studentTwinMock, 17, 1); // 17 + 1 = 18 séries (perto do MRV de 18, benefício marginal)
    console.log(`👉 Cenário B (Adicionar 1 série ao volume atual de 17):`);
    console.log(`   - Benefício previsto: ${simJunk.predictedBenefit.toUpperCase()}`);
    console.log(`   - Pico de fadiga previsto: +${simJunk.predictedFatigueSpike}`);

    const simNegative = simulateVolumeResponse(studentTwinMock, 17, 3); // 17 + 3 = 20 séries (ultrapassa o MRV de 18, overreaching)
    console.log(`👉 Cenário C (Adicionar 3 séries ao volume atual de 17 - Ultrapassa MRV!):`);
    console.log(`   - Benefício previsto: ${simNegative.predictedBenefit.toUpperCase()}`);
    console.log(`   - Pico de fadiga previsto: +${simNegative.predictedFatigueSpike}`);

    // 4. Testando Predição de Evasão (predictRetentionRisk)
    console.log("\n🚨 Análise de Risco de Evasão / Cancelamento:");
    const retentionSafe = predictRetentionRisk(studentTwinMock, plateau);
    console.log(`👉 Score de Risco de Cancelamento: ${retentionSafe.churnRiskScore}%`);
    console.log(`👉 Categoria de Risco: ${retentionSafe.riskCategory.toUpperCase()}`);
    console.log(`👉 Recomendação CXM: ${retentionSafe.cxmActionRecommended}`);

    // Simulando um aluno em estado crítico de adesão e estagnação
    const criticalTwin: DigitalTwinMock = {
      recovery: { chronicFatigue: 80, fatigueDecayRate: 8 },
      performance: { estimatedMRV: 12, historyOfPlateaus: 4, strengthTrend: "plateau" },
      behavior: { adherenceScore: 35, engagementPhase: "at_risk" }
    };
    const criticalForecast = forecastFatigue(criticalTwin, 16);
    const criticalPlateau = predictPlateau(criticalTwin, criticalForecast);
    const retentionCritical = predictRetentionRisk(criticalTwin, criticalPlateau);
    console.log(`\n👉 Cenário Crítico (Adesão de 35% e estagnação detectada):`);
    console.log(`   - Score de Risco de Cancelamento: ${retentionCritical.churnRiskScore}%`);
    console.log(`   - Categoria de Risco: ${retentionCritical.riskCategory.toUpperCase()}`);
    console.log(`   - Recomendação CXM: ${retentionCritical.cxmActionRecommended}`);

    // 5. Testando o Motor Mestre de Mesociclo (runPredictiveAnalyticsEngine)
    console.log("\n🔄 Execução do Motor Mestre de Planejamento de Mesociclo:");
    
    console.log("\n📝 Testando cenário padrão/saudável:");
    const normalReport = runPredictiveAnalyticsEngine(studentTwinMock, 15, "hypertrophy");
    console.log(`👉 Ação Recomendada: ${normalReport.mesocycleDecision.action.toUpperCase()}`);
    console.log(`👉 Fase Recomendada: ${normalReport.mesocycleDecision.recommendedNextPhase ?? "N/A"}`);
    console.log(`👉 Justificativa: ${normalReport.mesocycleDecision.justification}`);

    console.log("\n📝 Testando cenário de alta fadiga (Deload iminente):");
    const fatiguedTwin: DigitalTwinMock = {
      recovery: { chronicFatigue: 82, fatigueDecayRate: 10 },
      performance: { estimatedMRV: 14, historyOfPlateaus: 2, strengthTrend: "stable" },
      behavior: { adherenceScore: 90, engagementPhase: "engaged" }
    };
    const fatigueReport = runPredictiveAnalyticsEngine(fatiguedTwin, 18, "hypertrophy");
    console.log(`👉 Ação Recomendada: ${fatigueReport.mesocycleDecision.action.toUpperCase()}`);
    console.log(`👉 Fase Recomendada: ${fatigueReport.mesocycleDecision.recommendedNextPhase?.toUpperCase() ?? "N/A"}`);
    console.log(`👉 Justificativa: ${fatigueReport.mesocycleDecision.justification}`);

    console.log("\n📝 Testando cenário de estagnação prolongada (Transição para Força):");
    const stalledTwin: DigitalTwinMock = {
      recovery: { chronicFatigue: 40, fatigueDecayRate: 15 },
      performance: { estimatedMRV: 16, historyOfPlateaus: 4, strengthTrend: "plateau" },
      behavior: { adherenceScore: 95, engagementPhase: "engaged" }
    };
    const plateauReport = runPredictiveAnalyticsEngine(stalledTwin, 14, "hypertrophy");
    console.log(`👉 Ação Recomendada: ${plateauReport.mesocycleDecision.action.toUpperCase()}`);
    console.log(`👉 Fase Recomendada: ${plateauReport.mesocycleDecision.recommendedNextPhase?.toUpperCase() ?? "N/A"}`);
    console.log(`👉 Justificativa: ${plateauReport.mesocycleDecision.justification}`);

    // ============================================================================
    // 🧠 DECISION MEMORY ENGINE (PHASE 2.5.1)
    // ============================================================================
    console.log("\n==================================================");
    console.log("🧠 DECISION MEMORY ENGINE (PHASE 2.5.1)");
    console.log("==================================================");

    // 1. Teste de Avaliação de Feedback (evaluateDecisionResult)
    console.log("📋 Testando Avaliação de Resultados Pós-Decisão (14 dias):");
    const snapBefore: PerformanceSnapshot = { performanceScore: 70, fatigueLevel: 50, igbScore: 80 };
    
    const snapAfterSuccess: PerformanceSnapshot = { performanceScore: 75, fatigueLevel: 45, igbScore: 80 };
    const resultSuccess = evaluateDecisionResult(snapBefore, snapAfterSuccess);
    console.log(`👉 Caso A (Melhoria de Performance & Queda de Fadiga): ${resultSuccess.toUpperCase()} (Esperado: SUCCESS)`);

    const snapAfterFailure: PerformanceSnapshot = { performanceScore: 65, fatigueLevel: 55, igbScore: 80 };
    const resultFailure = evaluateDecisionResult(snapBefore, snapAfterFailure);
    console.log(`👉 Caso B (Piora de Performance & Aumento de Fadiga): ${resultFailure.toUpperCase()} (Esperado: FAILURE)`);

    const snapAfterNeutral: PerformanceSnapshot = { performanceScore: 72, fatigueLevel: 52, igbScore: 80 };
    const resultNeutral = evaluateDecisionResult(snapBefore, snapAfterNeutral);
    console.log(`👉 Caso C (Mudanças mistas/inconclusivas): ${resultNeutral.toUpperCase()} (Esperado: NEUTRAL)`);

    // 2. DNA de Treinamento - StudentLearningProfile
    const learningProfile: StudentLearningProfile = {
      studentId: "aluno_memory_twin_99",
      successfulActions: [
        { action: "INCREASE_VOLUME", frequency: 4 }, // Responde muito bem a aumento de volume
        { action: "DELOAD", frequency: 1 }
      ],
      failedActions: [
        { action: "CHANGE_EXERCISES", frequency: 3 }, // Sempre se confunde/machuca mudando exercícios
        { action: "INCREASE_VOLUME", frequency: 1 }
      ],
      personalThresholds: {
        maxVolumeTolerance: 18,
        fatigueBurnoutPoint: 75,
        optimalRir: 2
      }
    };

    console.log("\n🧬 Perfil de Aprendizado (DNA de Treinamento) do Aluno:");
    console.log(`👉 ID Aluno: ${learningProfile.studentId}`);
    console.log(`👉 Ações com histórico de sucesso: [${learningProfile.successfulActions.map(a => `${a.action} (x${a.frequency})`).join(", ")}]`);
    console.log(`👉 Ações com histórico de falhas: [${learningProfile.failedActions.map(a => `${a.action} (x${a.frequency})`).join(", ")}]`);

    // 3. Testando applyMemoryCorrection & executeDecisionFlow
    console.log("\n⚖️ Simulando aplicação do Motor de Correção via Memória:");

    // Caso A: Ação neutra sem histórico marcante
    const decisionNeutral: IntelligenceDecision = {
      action: "DELOAD",
      confidence: 0.80,
      reason: "Volume acumulado alto",
      category: "recovery"
    };
    const correctedNeutral = applyMemoryCorrection(decisionNeutral, learningProfile);
    console.log(`\n👉 Cenário 1: Decisão sem viés histórico forte (DELOAD)`);
    console.log(`   - Ação Recomendada: ${correctedNeutral.action}`);
    console.log(`   - Confiança: ${(correctedNeutral.confidence * 100).toFixed(0)}%`);
    console.log(`   - Justificativa: ${correctedNeutral.reason}`);

    // Caso B: Ação que falhou muito no passado (CHANGE_EXERCISES)
    const decisionFailed: IntelligenceDecision = {
      action: "CHANGE_EXERCISES",
      confidence: 0.75,
      reason: "Sugestão de variação técnica",
      category: "biomechanics"
    };
    const correctedFailed = applyMemoryCorrection(decisionFailed, learningProfile);
    console.log(`\n👉 Cenário 2: Decisão que falha frequentemente (CHANGE_EXERCISES)`);
    console.log(`   - Ação Recomendada: ${correctedFailed.action} (Esperado: MAINTAIN se confiança cair < 60%)`);
    console.log(`   - Confiança: ${(correctedFailed.confidence * 100).toFixed(0)}%`);
    console.log(`   - Justificativa: ${correctedFailed.reason}`);

    // Caso C: Ação com alto histórico de sucesso (INCREASE_VOLUME)
    const decisionSuccess: IntelligenceDecision = {
      action: "INCREASE_VOLUME",
      confidence: 0.80,
      reason: "Prontidão excelente",
      category: "performance"
    };
    const correctedSuccess = applyMemoryCorrection(decisionSuccess, learningProfile);
    console.log(`\n👉 Cenário 3: Decisão que funciona historicamente (INCREASE_VOLUME)`);
    console.log(`   - Ação Recomendada: ${correctedSuccess.action}`);
    console.log(`   - Confiança: ${(correctedSuccess.confidence * 100).toFixed(0)}% (Esperado: Recompensado com +15%)`);
    console.log(`   - Justificativa: ${correctedSuccess.reason}`);

    // 4. Testando executeDecisionFlow
    console.log("\n🔄 Executando executeDecisionFlow com fila de decisões:");
    const rawDecisions: IntelligenceDecision[] = [decisionSuccess, decisionFailed];
    const finalFlowDecision = executeDecisionFlow(rawDecisions, learningProfile);
    console.log(`👉 Decisão Final Escolhida & Corrigida: ${finalFlowDecision.action}`);
    console.log(`👉 Confiança Final: ${(finalFlowDecision.confidence * 100).toFixed(0)}%`);
    console.log(`👉 Justificativa Final: ${finalFlowDecision.reason}`);

    // ============================================================================
    // 🧬 KNOWLEDGE GRAPH ENGINE (PHASE 2.6)
    // ============================================================================
    console.log("\n==================================================");
    console.log("🧬 KNOWLEDGE GRAPH ENGINE (PHASE 2.6)");
    console.log("==================================================");

    console.log(`📊 Total de Nós no Grafo: ${clinicalNodes.length}`);
    console.log(`📊 Total de Conexões (Arestas): ${clinicalEdges.length}`);

    console.log("\n🔍 Efetuando inferência biomecânica para disfunção raiz: ANKLE_MOBILITY_DEFICIT");
    const inferenceResult = inferClinicalPath("ANKLE_MOBILITY_DEFICIT");

    console.log(`👉 Disfunção Raiz: ${inferenceResult.rootDysfunction}`);
    console.log(`👉 Cadeia Compensatória Detectada: [${inferenceResult.compensatoryChain.join(", ")}]`);
    console.log(`👉 Músculos Afetados (Inibidos): [${inferenceResult.affectedMuscles.inhibited.join(", ")}]`);
    console.log(`👉 Músculos Afetados (Hiperativos): [${inferenceResult.affectedMuscles.overactive.join(", ")}]`);
    console.log(`👉 Riscos Clínicos Associados: [${inferenceResult.clinicalRisks.join(", ")}]`);

    console.log("\n🏋️ Prescrições Corretivas com Dose Terapêutica Exata:");
    inferenceResult.prescriptions.forEach((prescription, idx) => {
      console.log(`👉 [Prescrição #${idx + 1}] Exercício: ${prescription.exerciseName} (${prescription.exerciseId})`);
      console.log(`   Dosagem: ${prescription.sets} séries x ${prescription.reps} | Fase: ${prescription.phase.toUpperCase()}`);
      console.log(`   Justificativa Técnica: ${prescription.rationale}`);
    });

  } catch (error) {
    console.error("❌ Falha no teste:", error);
  }
}

runTest();

