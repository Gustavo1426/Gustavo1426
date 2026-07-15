import { Request, Response } from "express";
import { GoogleGenAI } from "@google/genai";

export async function getIaCoach(req: Request, res: Response) {
  const {
    studentName = "Atleta",
    currentPhase = "Geral",
    objective = "Hipertrofia",
    workouts = [],
    diets = {},
    currentMessage = "",
    messageHistory = []
  } = req.body || {};

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
      return res.json({
        message: `Olá, ${studentName}! Sou seu Coach IA temporário. Vi que você quer focar em **${objective}** na fase **${currentPhase}**. \n\nNo momento, a chave da API do Gemini não está configurada nos segredos do sistema, então estou respondendo de forma offline. Como posso te apoiar hoje com as dicas de execução dos treinos de hoje ou descanso?`,
        warning: "Chave GEMINI_API_KEY não configurada nos Segredos do AI Studio."
      });
    }

    const ai = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });

    const systemPrompt = `Você é o IA Coach (Treinador Pessoal Inteligente) do sistema de assessoria TreinoPro. Seu nome é "IA Coach".
Sua missão é dar suporte de altíssimo nível, motivador, acolhedor e altamente científico ao aluno de academia, usando português do Brasil com um tom dinâmico e amigável (com gírias saudáveis de treino como "bora", "pra cima", "foco", "consistência").

Você tem acesso às seguintes informações REAIS do aluno para embasar e personalizar suas respostas de forma precisa:
- Nome do Aluno: ${studentName}
- Objetivo Principal: ${objective}
- Fase de Treino Ativa: ${currentPhase}
- Treinos Planejados na Ficha: ${JSON.stringify(workouts)}
- Dieta Cadastrada: ${JSON.stringify(diets)}

🚨 REGRAS CRÍTICAS DE CONDUTA E SEGURANÇA:
1. VOCÊ NÃO TEM AUTORIDADE PARA ALTERAR O TREINO OU A DIETA OFICIAIS: Se o aluno pedir para mudar os exercícios, séries, repetições, divisão de treino ou plano alimentar oficial, explique educadamente que somente o professor dele (coordenador físico/nutricionista) pode realizar alterações oficiais na ficha no sistema. Você pode, porém, sugerir adaptações mecânicas seguras (como reduzir cargas ou ajustar a amplitude do movimento) ou ajudá-lo a entender e otimizar os exercícios que já estão na ficha.
2. SINAIS DE DOR OU LESÃO: Se o aluno reportar dor articular aguda, estalos acompanhados de dor, desconforto na coluna ou lesão em algum exercício, ordene-o IMEDIATAMENTE a parar o exercício, descansar, e consultar o professor ou um médico. Nunca diga para ele "superar a dor" se for uma dor não-muscular.
3. CANSAÇO E FADIGA EXTREMA: Se ele disser que está exausto ou sem energia hoje, recomende um treino regenerativo (com cargas mais leves, focando na conexão mente-músculo e técnica, menor RPE) ou um dia de descanso ativo (alongamento, cardio leve). Diga que o descanso faz parte da hipertrofia.
4. COMO EXECUTAR EXERCÍCIOS: Se ele tiver dúvidas sobre postura ou como realizar algum exercício (ex: agachamento, supino, puxada), descreva o passo a passo com clareza pedagógica e dicas de segurança (ex: ativar escápulas, contrair abdômen).
5. CONCISÃO IMPERATIVA: Mantenha as respostas curtas, estruturadas com parágrafos legíveis e diretos (máximo de 2 parágrafos curtos de 3-4 linhas cada), pois o aluno está visualizando isso em uma tela mobile rápida no meio do treino. Evite enrolações de introdução.`;

    // Build context history
    const formattedHistory = messageHistory.map((m: any) => {
      const roleName = m.sender === "student" ? "Usuário" : "Modelo";
      return `${roleName}: ${m.text}`;
    }).join("\n");

    const promptText = `Aqui está o histórico recente de conversas com o aluno para continuidade:
${formattedHistory}

Mensagem atual do aluno:
Usuário: ${currentMessage}

Responda diretamente ao aluno de forma concisa e amigável, respeitando todas as regras críticas.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: promptText,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.8,
      }
    });

    res.json({ message: response.text });
  } catch (err: any) {
    console.error("IA Coach generation error:", err);
    res.json({
      message: `Bora, ${studentName}! Tive um leve soluço ao conectar com meus circuitos de IA, mas estou aqui! Como posso te ajudar com o treino ou a dieta hoje? \n\n(Erro de processamento: ${err.message || err})`
    });
  }
}
