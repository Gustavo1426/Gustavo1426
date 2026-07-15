/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface CorrectiveExercise {
  name: string;
  target: string;
  sets: number;
  reps: string;
  description: string;
}

/**
 * Customizes and generates a professional corrective exercise list based on calculated biomechanical angles.
 */
export function recomendarExercicios(deviations: {
  cervicalAngle: number;
  shoulderAngle: number;
  pelvicAngle: number;
  kneeValgusVaro: "Valgo" | "Varo" | "Neutro";
  scolioticAngle: number;
}): CorrectiveExercise[] {
  const exercises: CorrectiveExercise[] = [];

  // 1. Forward Head / Cervical anteriorization
  if (deviations.cervicalAngle > 3.0) {
    exercises.push({
      name: "Chin Tuck (Retração Cervical profunda)",
      target: "Flexores profundos do pescoço",
      sets: 3,
      reps: "12-15 reps (sustentar 2s no pico)",
      description: "De pé ou encostado na parede, recolha o queixo alinhando a cervical sem inclinar a cabeça para baixo."
    });
  }

  // 2. Shoulder Elevation / Upper traps tightness
  if (deviations.shoulderAngle > 3.0) {
    exercises.push({
      name: "Y-Raise Prone (Elevação em Y de bruços)",
      target: "Trapézio inferior e romboides",
      sets: 3,
      reps: "10-12 reps",
      description: "Deitado de bruços em um banco ou colchonete, eleve os braços em formato de 'Y' focando na depressão escapular."
    });
    exercises.push({
      name: "Alongamento em Portal de Porta",
      target: "Peitoral maior e menor",
      sets: 3,
      reps: "30-40 segundos sustentados",
      description: "Apoie os antebraços nos portais de uma porta e projete suavemente o tronco à frente até sentir alongar a frente do tórax."
    });
  }

  // 3. Pelvic Lateral Tilt or Sagittal Deviation
  if (deviations.pelvicAngle > 3.0) {
    exercises.push({
      name: "Prancha Lateral com Abdução de Quadril",
      target: "Glúteo médio e quadrado lombar",
      sets: 3,
      reps: "10-12 reps de cada lado",
      description: "Fique de lado apoiando no antebraço e joelho flexionado, eleve o quadril e abduza a perna superior controladamente."
    });
    exercises.push({
      name: "Ponte Pélvica com Retroversão Ativa",
      target: "Glúteos e estabilidade lombo-pélvica",
      sets: 3,
      reps: "15 reps",
      description: "Deitado com joelhos dobrados, eleve o quadril contraindo abdômen e glúteos de forma a manter a pelve encaixada."
    });
  }

  // 4. Knee Valgus/Varus Tendency
  if (deviations.kneeValgusVaro === "Valgo") {
    exercises.push({
      name: "Clamshell (Ostra com Mini-Band nos Joelhos)",
      target: "Glúteo médio e rotadores externos",
      sets: 3,
      reps: "15-20 reps por lado",
      description: "Deitado de lado com joelhos a 90°, afaste um joelho do outro mantendo os calcanhares unidos."
    });
  } else if (deviations.kneeValgusVaro === "Varo") {
    exercises.push({
      name: "Adução de Quadril com Bola/Anel",
      target: "Adutores do quadril",
      sets: 3,
      reps: "15 reps (segurar 3s)",
      description: "Deitado com joelhos dobrados, pressione firmemente uma bola ou anel de Pilates entre os joelhos."
    });
  }

  // 5. Scoliotic deviation
  if (deviations.scolioticAngle > 4.0) {
    exercises.push({
      name: "Prancha Frontal com Toques nos Ombros",
      target: "Anti-rotação de core e estabilidade de tronco",
      sets: 3,
      reps: "20 toques totais alternados",
      description: "Em posição de prancha alta estável, tire uma mão e toque o ombro oposto sem oscilar os quadris."
    });
  }

  // Default maintenance routine if everything is aligned
  if (exercises.length === 0) {
    exercises.push({
      name: "Mobilidade Integrada de Tornozelo, Quadril e Torácica",
      target: "Mobilidade e flexibilidade global",
      sets: 2,
      reps: "10-12 reps de cada lado",
      description: "Agachamento profundo mantendo tronco ereto, seguido por rotações torácicas estendendo alternadamente os braços."
    });
  }

  return exercises;
}
