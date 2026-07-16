/**
 * ============================================================================
 * WORKOUT ACADEMIA - BIOMECHANICS AI MODULE: FIREBASE CLOUD FUNCTIONS
 * ============================================================================
 */

import { onDocumentUpdated } from "firebase-functions/v2/firestore";
import * as admin from "firebase-admin";

// Caminho relativo para importar o orquestrador do motor biomecânico
import { processBiomechanicalAssessment } from "../../src/shared/modules/biomechanics-ai";

admin.initializeApp();

/**
 * Gatilho Automático: Escuta alterações no documento de avaliação postural do usuário.
 * Quando o status mudar para "processing" (que significa que a foto foi upada), a IA roda.
 */
export const runBiomechanicsPipeline = onDocumentUpdated(
  "users/{userId}/biomechanics/evaluations/{evaluationId}",
  async (event) => {
    const newValue = event.data?.after.data();
    const previousValue = event.data?.before.data();

    // Só roda se o status acabou de mudar para "processing"
    if (newValue?.status === "processing" && previousValue?.status !== "processing") {
      try {
        const userId = event.params.userId;
        const photoFrontUrl = newValue.photos?.front?.url;

        if (!photoFrontUrl) throw new Error("URL da foto frontal ausente.");

        // Busca o histórico do aluno para o Evolution Engine
        const historySnap = await admin.firestore()
          .collection(`users/${userId}/biomechanics/evaluations`)
          .where("status", "==", "completed")
          .orderBy("createdAt", "desc")
          .limit(1)
          .get();
        
        const previousAssessment = historySnap.empty ? undefined : historySnap.docs[0].data();

        // RODA O SEU GIGA-ARQUIVO DE INTELIGÊNCIA (Orquestrador do Pipeline)
        const result = await processBiomechanicalAssessment({
          userId: userId,
          studentName: newValue.studentName || "Aluno",
          photoUrl: photoFrontUrl,
          view: "front",
          previousAssessment: previousAssessment as any
        });

        // Salva o Laudo Final (IGB, Achados, Recomendações) de volta no Firestore
        await event.data?.after.ref.update({
          status: "completed",
          score: result.score,
          findings: result.findings,
          recommendations: result.recommendations,
          report: result.report,
          evolution: result.evolution || null,
          updatedAt: new Date().toISOString()
        });

        console.log(`Avaliação de ${userId} processada com sucesso! IGB: ${result.score.overall}`);

      } catch (error) {
        console.error("Falha no pipeline de IA:", error);
        await event.data?.after.ref.update({
          status: "failed",
          errorMessage: (error as Error).message
        });
      }
    }
  }
);
