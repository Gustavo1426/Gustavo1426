import { Request, Response } from "express";
import { GoogleGenAI } from "@google/genai";
import { callGroqAI, generateContentWithFallback } from "../services/aiService.js";

function getFallbackMessage(studentName: string, reason: string, plan: string, phase: string, tone: string): string {
  const firstName = studentName.split(" ")[0];
  const lowerReason = reason.toLowerCase();
  
  if (lowerReason.includes("sem treinar") || lowerReason.includes("inatividade") || lowerReason.includes("5 dias")) {
    if (tone === "strict") {
      return `Fala, ${firstName}! Tudo bem?\n\nReparei que você deu uma sumida nos últimos 5 dias. O resultado vem com disciplina e consistência, não com desculpas. Bora reativar hoje e colocar essa fase de ${phase} para rodar? Qual o horário de treino hoje? Foco total! 👊`;
    }
    if (tone === "academic") {
      return `Olá, ${firstName}! Espero que esteja bem.\n\nNotamos uma ausência de estímulo de 5 dias nos treinos. Esse intervalo inicia o processo de destreino e perda de adaptações metabólicas. Para mantermos a sinalização hipertrófica activa na fase de ${phase}, é fundamental retomar as sessões. Como posso te auxiliar nisso?`;
    }
    if (tone === "friendly") {
      return `E aí, ${firstName}! Tudo bem por aí?\n\nSenti sua falta nos treinos nos últimos 5 dias! Sei bem como a rotina pode ficar uma loucura, mas lembre-se de separar um tempinho para você. Se precisar reajustar o volume da sua fase de ${phase}, me avisa. Estou aqui com você! ❤️`;
    }
    return `Fala, ${firstName}! Tudo certo?\n\nReparei que você deu uma sumida nos últimos 5 dias. Sei que a rotina aperta, mas bora retomar o ritmo para não perder a evolução incrível na fase de ${phase}?\n\nO treino de hoje já está liberado. Me dá um alô! 🚀`;
  }
  
  if (lowerReason.includes("vencimento") || lowerReason.includes("renovação") || lowerReason.includes("2 dias")) {
    return `Olá, ${firstName}! Passando para avisar que seu plano ${plan} vence em 2 dias. Como estamos tendo uma evolução fantástica no seu planejamento de ${phase}, gostaria de garantir sua vaga para o próximo ciclo de performance de forma ininterrupta.\n\nPosso te enviar o link para renovação? ⚡`;
  }
  
  return `E aí, ${firstName}! Meus parabéns por finalizar essa fase de ${phase}! Os seus resultados de consistência e ganho de força foram sensacionais nas últimas semanas.\n\nJá preparei todo o seu novo planejamento de treinos e macros da dieta focados no próximo objetivo. Amanhã de manhã já estará tudo liberado no seu app! 🔥`;
}

export async function generateMessage(req: Request, res: Response) {
  const {
    studentName = "Atleta",
    reason = "",
    plan = "",
    phase = "",
    tone = "",
    aiProvider = "gemini",
    coachName = "Coach Rodrigo"
  } = req.body || {};

  try {
    // Map tones to persona instruction rules
    let systemPrompt = `Você é um treinador esportivo (Coach de Elite) de alta performance. Seu nome de assinatura é ${coachName}. Você fala português brasileiro com gírias esportivas modernas, mas mantendo o respeito profissional. `;
    
    if (tone === "strict") {
      systemPrompt += "Seu tom é firme, cobrando disciplina, foco absoluto e consistência. Não aceita desculpas. Frases curtas e diretas.";
    } else if (tone === "academic") {
      systemPrompt += "Seu tom é científico e técnico. Explique os impactos metabólicos, ganho ou perda de estímulo miofibrilar, hipertrofia ou condicionamento com base em dados de forma simplificada e instrutiva.";
    } else if (tone === "friendly") {
      systemPrompt += "Seu tom é focado em empatia, acolhimento e amizade. Demonstre total apoio para encaixar os treinos na rotina cheia do aluno de forma leve.";
    } else {
      systemPrompt += "Seu tom é focado em alta energia, motivação explosiva, usando termos como 'bora', 'foco total', 'pra cima', 'evolução'.";
    }

    systemPrompt += " Escreva uma mensagem de WhatsApp curta, direta, estruturada com quebras de linha elegantes para facilitar a leitura rápida em telas mobile. Use emojis com moderação. Dirija-se ao aluno pelo primeiro nome de forma calorosa. NÃO use placeholders genéricos na resposta.";

    const promptText = `Escreva uma mensagem de WhatsApp personalizada para o aluno(a) ${studentName}.
A situação atual do aluno é:
- Motivo/Contexto do Alerta: ${reason}
- Plano Contratado: Plano ${plan}
- Fase de Treino Atual: ${phase}

Adapte a mensagem conforme o motivo:
- Se for inatividade (ex: sem treinar há 5 dias), mostre preocupação e estimule o retorno de forma condizente com seu tom.
- Se for vencimento de plano (ex: vence em 2 dias), lembre-o sobre renovação para garantir suporte contínuo e não perder ritmo de evolução.
- Se for ciclo finalizado (ex: finalizou fase de hipertrofia), comemore, parabenize pela consistência e diga que preparou o próximo desafio no app.

Gere apenas o texto final da mensagem, pronto para copiar ou enviar via WhatsApp.`;

    // Check for Groq option
    if (aiProvider === "groq" && process.env.GROQ_API_KEY && process.env.GROQ_API_KEY !== "MY_GROQ_API_KEY") {
      try {
        const message = await callGroqAI(systemPrompt, promptText);
        return res.json({ message });
      } catch (groqErr: any) {
        console.error("Groq generation failed, falling back to Gemini:", groqErr);
      }
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
      const fallbackMessage = getFallbackMessage(studentName, reason, plan, phase, tone);
      return res.json({
        message: fallbackMessage,
        warning: "Nota: Chave de API GEMINI_API_KEY ou GROQ_API_KEY não configurada nos Segredos do AI Studio. Utilizando gerador alternativo offline."
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

    const response = await generateContentWithFallback(ai, {
      model: "gemini-3.5-flash",
      contents: promptText,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.8,
      }
    });

    res.json({ message: response.text });
  } catch (err: any) {
    console.error("Error generating message:", err);
    const fallbackMessage = getFallbackMessage(studentName, reason, plan, phase, tone);
    res.json({
      message: fallbackMessage,
      warning: `Erro de conexão: ${err.message}. Utilizando gerador alternativo offline.`
    });
  }
}
