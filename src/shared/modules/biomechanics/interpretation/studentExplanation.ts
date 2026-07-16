/**
 * ============================================================================
 * WORKOUT ACADEMIA - BIOMECHANICS AI MODULE: STUDENT EXPLANATION OVERVIEW
 * ============================================================================
 */

/**
 * Gera a introdução humanizada e motivadora para o Aluno.
 */
export function getStudentGeneralOverview(score: number): string {
  if (score >= 90) {
    return "Excelente! Seu corpo mostra uma excelente organização natural para treinar. Nosso foco será lapidar seus detalhes técnicos para buscar o máximo de performance.";
  }
  
  return "Sua avaliação mostra alguns pontos que podemos melhorar. O nosso objetivo agora não é fazer você treinar menos, mas sim treinar melhor, respeitando e blindando as articulações do seu corpo.";
}
