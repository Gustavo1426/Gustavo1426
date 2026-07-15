async function generateWorkout(
AI,
input
){

// Normalize muscles structure to dictionary (Rule 1)
let musclesToSend = input.muscles;
if (musclesToSend && !Array.isArray(musclesToSend)) {
    // Already in dictionary format
} else if (Array.isArray(musclesToSend)) {
    const dict = {};
    musclesToSend.forEach(item => {
        dict[item.muscle] = {
            exerciseCount: item.exerciseCount,
            setsPerSession: item.sessions || []
        };
    });
    musclesToSend = dict;
} else if (input.targetVolume) {
    const dict = {};
    for (const muscle in input.targetVolume) {
        const target = input.targetVolume[muscle];
        const sessions = typeof target === 'object' && target !== null ? (target.sessions || []) : [];
        dict[muscle] = {
            exerciseCount: Math.max(1, Math.ceil((target.total || Number(target)) / 4)),
            setsPerSession: sessions
        };
    }
    musclesToSend = dict;
} else {
    musclesToSend = {};
}

const prompt=`
Você é um assistente especialista em musculação de alta fidelidade fisiológica. Sua única tarefa é escolher exercícios compatíveis para cada grupo muscular listado.

IMPORTANTE: Você NÃO decide o volume (séries, repetições, frequência). Você NÃO PODE adicionar séries, remover séries, aumentar volume, reduzir volume, alterar frequência, alterar distribuição semanal ou alterar prioridades. Toda a estrutura de volumes, sessões e quantidade de exercícios já foi calculada e você deve segui-la rigorosamente.

Parâmetros do Treino:
Dia: ${input.day}
Equipamentos disponíveis: ${(input.equipment || []).join(", ")}
Técnicas permitidas: ${(input.techniques || []).join(", ")}

Estrutura de Músculos a Treinar (Regra 1 — A IA NÃO DECIDE VOLUME):
${JSON.stringify(musclesToSend, null, 2)}

Regras Obrigatórias para a Seleção de Exercícios:
1. Para cada músculo na lista acima:
   - Selecione exatamente a quantidade de exercícios especificada em "exerciseCount".
   - Os exercícios selecionados devem focar no músculo correspondente. Use apenas exercícios reais e adequados do banco de dados comum de musculação.
2. É ESTRITAMENTE PROIBIDO incluir qualquer propriedade de volume ou séries na sua resposta (como "sets", "series", "volume", "reps"). Toda essa parte de séries e repetições será injetada posteriormente pelo motor físico do sistema.
3. Retorne APENAS um objeto JSON válido, sem explicações em markdown antes ou depois.

Schema de saída esperado:
{
  "exercises": [
    {
      "name": "Nome do Exercício",
      "primaryMuscle": "Nome do Músculo",
      "secondaryMuscles": ["Músculo Secundário 1", "Músculo Secundário 2"],
      "equipment": ["Equipamento"],
      "category": "composto ou isolado",
      "allowedTechniques": ["Técnica 1", "Técnica 2"]
    }
  ]
}
`;

const result=
await AI.generateContent(
prompt
);

return result.response.text();

}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        generateWorkout
    };
}
export { generateWorkout };
export default generateWorkout;
