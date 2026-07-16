/**
 * ============================================================================
 * WORKOUT ACADEMIA - BIOMECHANICS AI MODULE: FULL PIPELINE INTEGRATION
 * ============================================================================
 */

import {
  runVisionEngine,
  runBodyAnalysisEngine,
  runBiomechanicalEngine,
  runScoringEngine,
  runRecommendationEngine,
  runReportEngine,
  runEvolutionEngine,
  HistoricalAssessment
} from "./biomechanics";

export interface ProcessBiomechanicalAssessmentInput {
  userId: string;
  studentName: string;
  photoUrl: string;
  view: "front" | "side" | "back";
  previousAssessment?: HistoricalAssessment;
}

/**
 * Orquestrador completo das 10 etapas da Inteligência Artificial Biomecânica da Workout Academia.
 * Cruza visão computacional (MediaPipe), modelagem de esqueleto, análise angular, scoring (IGB),
 * recomendações corretivas, geração de laudos técnicos/emocionais e evolução histórica.
 */
export async function processBiomechanicalAssessment(input: ProcessBiomechanicalAssessmentInput) {
  const { userId, studentName, photoUrl, view, previousAssessment } = input;

  console.log(`[BiomechanicsAI] Iniciando pipeline de processamento biomecânico para Aluno: ${studentName}...`);

  // Etapas 1-3: Captura de Imagem e Visão Computacional (MediaPipe / TensorFlow)
  console.log("[BiomechanicsAI] [Etapas 1-3] Processando Visão Computacional...");
  const visionResult = await runVisionEngine(
    `photo_${Date.now()}`,
    { imageUrl: photoUrl, view },
    1080,
    1920
  );

  // Etapa 4: Modelagem e Mapeamento Regional do Corpo (Body Analysis Engine)
  console.log("[BiomechanicsAI] [Etapa 4] Rodando análise antropométrica e angular do corpo...");
  const bodyAnalysis = await runBodyAnalysisEngine(visionResult.landmarks, view);

  // Etapa 5: Diagnóstico e Reconhecimento de Desvios (Biomechanical Engine)
  console.log("[BiomechanicsAI] [Etapa 5] Identificando desvios posturais e padrões de compensação...");
  const biomechResult = await runBiomechanicalEngine(bodyAnalysis);
  const { findings } = biomechResult;

  // Etapas 6-7: Cálculo de Notas e IGB (Scoring Engine)
  console.log("[BiomechanicsAI] [Etapas 6-7] Calculando pontuação de conformidade biomecânica (IGB)...");
  const score = runScoringEngine(bodyAnalysis, findings);

  // Etapa 8: Prescrição e Recomendações Corretivas (Recommendation Engine)
  console.log("[BiomechanicsAI] [Etapa 8] Gerando recomendações de treino corretivo, mobilidade e estabilidade...");
  const recommendations = await runRecommendationEngine(findings, score, bodyAnalysis);

  // Etapa 9: Geração do Relatório Pedagógico e Profissional (Report Engine)
  console.log("[BiomechanicsAI] [Etapa 9] Compilando laudo integrado (linguagem acessível e técnica)...");
  const report = await runReportEngine(
    userId,
    studentName,
    bodyAnalysis,
    findings,
    score,
    recommendations
  );

  // Etapa 10: Comparação de Evolução Histórica (Evolution Engine)
  let evolutionResult = null;
  if (previousAssessment) {
    console.log("[BiomechanicsAI] [Etapa 10] Cruzando dados históricos com a avaliação prévia...");
    const currentAsAssessment: HistoricalAssessment = {
      id: `eval_${Date.now()}`,
      date: new Date().toLocaleDateString("pt-BR"),
      score,
      bodyAnalysis,
      findings
    };
    
    try {
      evolutionResult = await runEvolutionEngine(previousAssessment, currentAsAssessment);
      console.log(`[BiomechanicsAI] Evolução concluída! Evolution Score de ${evolutionResult.evolutionScore.difference > 0 ? "+" : ""}${evolutionResult.evolutionScore.difference} pontos.`);
    } catch (evolutionError) {
      console.warn("[BiomechanicsAI] Falha ao processar evolução histórica. Ignorando silenciosamente:", evolutionError);
    }
  }

  console.log("[BiomechanicsAI] Processamento do pipeline concluído com sucesso!");

  return {
    score,
    findings,
    recommendations,
    report,
    evolution: evolutionResult
  };
}
