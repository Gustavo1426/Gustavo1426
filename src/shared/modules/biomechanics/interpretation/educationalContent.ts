/**
 * ============================================================================
 * WORKOUT ACADEMIA - BIOMECHANICS AI MODULE: EDUCATIONAL CONTENT
 * ============================================================================
 */

/**
 * Produz a tradução do achado em conteúdo amigável e focado em bem-estar.
 */
export function generateEducationalContent(findingId: string): string {
  switch (findingId) {
    case "shoulder_anteriorization":
      return "Seus ombros apresentam uma tendência a ficar um pouco mais posicionados para frente. Vamos trabalhar com exercícios que ajudem a equilibrar sua musculatura das costas e melhorar a qualidade do seu movimento.";
    case "knee_valgus_tendency":
      return "Seus joelhos mostram uma leve tendência a se aproximarem ao agachar. Vamos focar em exercícios para fortalecer as laterais do seu quadril e manter seus movimentos sempre firmes e seguros.";
    case "anterior_pelvic_tilt":
      return "Sua bacia apresenta uma inclinação que acentua a curva da sua lombar. Trabalharemos bastante o fortalecimento do abdômen e do bumbum para dar estabilidade para as suas costas.";
    default:
      return "Identificamos um padrão de movimento que pode ser facilmente lapidado. A ideia não é apenas treinar mais forte, mas treinar de forma mais inteligente para proteger suas articulações.";
  }
}
