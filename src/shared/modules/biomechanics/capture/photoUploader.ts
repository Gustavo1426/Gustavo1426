/**
 * ============================================================================
 * WORKOUT ACADEMIA - BIOMECHANICS AI MODULE: PHOTO UPLOADER SERVICE
 * ============================================================================
 */

import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { doc, updateDoc } from "firebase/firestore";
import { db, storage, handleFirestoreError, OperationType } from "../../../infrastructure/firebase/firebase";

/**
 * Envia uma imagem para o Firebase Storage e salva a URL de referência no Firestore.
 * 
 * @param userId - ID do Aluno avaliado
 * @param evaluationId - ID da Avaliação atual
 * @param view - Vista da foto ("front" | "side" | "back")
 * @param imageFile - Arquivo File (HTML5) ou Blob da foto tirada pelo celular
 * @param sender - Quem está realizando o upload ("student" | "coach")
 * @returns Promise com a URL de download pública da imagem
 */
export async function handlePhotoUpload(
  userId: string,
  evaluationId: string,
  view: "front" | "side" | "back",
  imageFile: File | Blob,
  sender: "student" | "coach"
): Promise<string> {
  // 1. Define o caminho do arquivo no Storage: /users/{userId}/evaluations/{evaluationId}/{view}.jpg
  const storageRef = ref(storage, `users/${userId}/evaluations/${evaluationId}/${view}.jpg`);

  try {
    // 2. Faz o upload dos bytes da imagem
    console.log(`Iniciando upload da foto postural (${view})...`);
    const snapshot = await uploadBytes(storageRef, imageFile);
    
    // 3. Obtém a URL de acesso público que o app/web usarão para renderizar a imagem
    const downloadURL = await getDownloadURL(snapshot.ref);
    console.log("Upload concluído com sucesso! URL:", downloadURL);

    // 4. Salva a referência no Firestore no documento da avaliação correspondente
    const evaluationDocPath = `users/${userId}/biomechanics/evaluations/${evaluationId}`;
    const evaluationDocRef = doc(db, "users", userId, "biomechanics", "evaluations", evaluationId);
    
    try {
      await updateDoc(evaluationDocRef, {
        [`photos.${view}`]: {
          url: downloadURL,
          updatedAt: new Date().toISOString(),
          uploadedBy: sender
        }
      });
    } catch (firestoreError) {
      // Captura erros de permissão ou conexão do Firestore seguindo estritamente as diretrizes da Skill
      handleFirestoreError(firestoreError, OperationType.WRITE, evaluationDocPath);
    }

    return downloadURL;
  } catch (error) {
    console.error("Erro ao subir imagem postural para o Firebase:", error);
    throw error;
  }
}
