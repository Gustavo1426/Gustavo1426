import { DobrasData, PerimetrosData } from "@/src/professor-web/features/nutrition/diet-evolution/AntropometriaView";

interface CalcProps {
  sexo: "masculino" | "feminino";
  idade: number;
  peso: number;
  altura: number; // cm
  dobras: DobrasData;
  perimetros: PerimetrosData;
}

export interface ResultadoAntropometria {
  percentualGordura: number;
  densidadeCorporal: number;
  massaGorda: number;
  massaMagra: number;
  imc: number;
  rcq: number;
  tmb: number;
  soma3: number;
  soma7: number;
}

export function calcularAntropometria(
  dados: CalcProps
): ResultadoAntropometria {
  const {
    sexo,
    idade,
    peso,
    altura,
    dobras,
    perimetros
  } = dados;

  // ===== SOMAS =====
  const soma3Homem =
    (dobras.peitoral || 0) +
    (dobras.abdomen || 0) +
    (dobras.coxa || 0);

  const soma3Mulher =
    (dobras.triceps || 0) +
    (dobras.suprailiaca || 0) +
    (dobras.coxa || 0);

  const soma7 =
    (dobras.peitoral || 0) +
    (dobras.mediaAxilar || 0) +
    (dobras.triceps || 0) +
    (dobras.subescapular || 0) +
    (dobras.abdomen || 0) +
    (dobras.suprailiaca || 0) +
    (dobras.coxa || 0);

  let dc = 1;

  // ===== JACKSON & POLLOCK 7 =====
  if (sexo === "masculino") {
    dc =
      1.112 -
      (0.00043499 * soma7) +
      (0.00000055 * Math.pow(soma7, 2)) -
      (0.00028826 * idade);
  } else {
    dc =
      1.097 -
      (0.00046971 * soma7) +
      (0.00000056 * Math.pow(soma7, 2)) -
      (0.00012828 * idade);
  }

  // Fallback to prevent division by zero or negative density
  if (dc <= 0.5) dc = 1.0;

  // ===== SIRI =====
  let percentualGordura = (495 / dc) - 450;
  if (percentualGordura < 2) percentualGordura = 2;
  if (percentualGordura > 60) percentualGordura = 60;

  // ===== PESO GORDO =====
  const massaGorda = peso * (percentualGordura / 100);

  // ===== MASSA MAGRA =====
  const massaMagra = Math.max(0, peso - massaGorda);

  // ===== IMC =====
  const alturaM = altura / 100;
  const imc = alturaM > 0 ? peso / (alturaM * alturaM) : 0;

  // ===== RCQ =====
  // Use "cintura" and "quadril" from perimetros
  const rcq = (perimetros?.cintura || 0) / (perimetros?.quadril || 1);

  // ===== HARRIS BENEDICT =====
  let tmb = 0;
  if (sexo === "masculino") {
    tmb =
      66 +
      (13.7 * peso) +
      (5 * altura) -
      (6.8 * idade);
  } else {
    tmb =
      655 +
      (9.6 * peso) +
      (1.8 * altura) -
      (4.7 * idade);
  }

  return {
    percentualGordura: Number(percentualGordura.toFixed(1)),
    densidadeCorporal: Number(dc.toFixed(3)),
    massaGorda: Number(massaGorda.toFixed(1)),
    massaMagra: Number(massaMagra.toFixed(1)),
    imc: Number(imc.toFixed(1)),
    rcq: Number(rcq.toFixed(2)),
    tmb: Number(Math.max(0, tmb).toFixed(0)),
    soma3: sexo === "masculino" ? soma3Homem : soma3Mulher,
    soma7
  };
}
