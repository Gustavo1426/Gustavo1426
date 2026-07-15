export interface AvaliacaoPostural {
  id: string;
  alunoId: string;
  data: string;
  fotos: {
    frente?: string;
    costas?: string;
    ladoDireito?: string;
    ladoEsquerdo?: string;
  };
  marcadores: any[];
  metricas: {
    simetria: number;
    ombro: number;
    pelve: number;
    cabeca: number;
    risco: number;
  };
  observacoes: string[];
}

const STORAGE_KEY = "workout_avaliacoes";

export function salvarAvaliacao(avaliacao: AvaliacaoPostural) {
  try {
    const avaliacoes = JSON.parse(
      localStorage.getItem(STORAGE_KEY) || "[]"
    );
    avaliacoes.push(avaliacao);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(avaliacoes));
    } catch (setItemError: any) {
      if (setItemError.name === "QuotaExceededError" || setItemError.code === 22) {
        console.warn("Storage quota exceeded in workout_avaliacoes. Evicting older photos to reclaim space...");
        // Keep the latest 3 evaluations with photos, remove base64 photos from older ones
        const optimized = avaliacoes.map((item: any, idx: number) => {
          if (idx < avaliacoes.length - 3) {
            return {
              ...item,
              fotos: {} // Strip out large base64 strings from older evaluations
            };
          }
          return item;
        });
        localStorage.setItem(STORAGE_KEY, JSON.stringify(optimized));
        console.log("Successfully saved evaluations after clearing older photo attachments.");
      } else {
        throw setItemError;
      }
    }
  } catch (error) {
    console.error("Erro ao salvar avaliação postural:", error);
  }
}

export function buscarAvaliacoesAluno(alunoId: string): AvaliacaoPostural[] {
  try {
    const avaliacoes = JSON.parse(
      localStorage.getItem(STORAGE_KEY) || "[]"
    );
    return avaliacoes.filter(
      (item: AvaliacaoPostural) => item.alunoId === alunoId
    );
  } catch (error) {
    console.error("Erro ao buscar avaliações do aluno:", error);
    return [];
  }
}
