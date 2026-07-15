import { GoogleGenAI } from "@google/genai";

// Helper function to call the Groq API
export async function callGroqAI(systemPrompt: string, promptText: string, images: string[] = []): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey || apiKey === "MY_GROQ_API_KEY") {
    throw new Error("A chave GROQ_API_KEY não está configurada nos segredos ou variáveis de ambiente.");
  }

  const isVision = images.length > 0;
  // Use Llama 3.2 11B Vision for images, Llama 3.3 70B Versatile for high-end text & JSON
  const model = isVision ? "llama-3.2-11b-vision-preview" : "llama-3.3-70b-versatile";

  const contentArray: any[] = [{ type: "text", text: promptText }];
  for (const img of images) {
    if (img) {
      let urlStr = img;
      if (!img.startsWith("data:")) {
        urlStr = `data:image/jpeg;base64,${img}`;
      }
      contentArray.push({
        type: "image_url",
        image_url: {
          url: urlStr
        }
      });
    }
  }

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: isVision ? contentArray : promptText }
      ],
      temperature: isVision ? 0.2 : 0.7
    })
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Erro na API Groq (Status ${response.status}): ${errText}`);
  }

  const result = await response.json() as any;
  const text = result.choices?.[0]?.message?.content || "";
  return text;
}

// Utility to clean markdown formatting from JSON responses
export function cleanJsonResponse(text: string): string {
  let cleaned = text.trim();
  if (cleaned.startsWith("```json")) {
    cleaned = cleaned.substring(7);
  } else if (cleaned.startsWith("```")) {
    cleaned = cleaned.substring(3);
  }
  if (cleaned.endsWith("```")) {
    cleaned = cleaned.substring(0, cleaned.length - 3);
  }
  return cleaned.trim();
}

// Helper function to call the Gemini API with automatic retry and model fallback
export async function generateContentWithFallback(
  ai: any,
  params: {
    model: string;
    contents: any;
    config?: any;
  }
): Promise<any> {
  const modelsToTry = Array.from(new Set([
    params.model, 
    "gemini-3.5-flash", 
    "gemini-flash-latest", 
    "gemini-3.1-flash-lite"
  ]));
  let lastError: any = null;

  for (const modelName of modelsToTry) {
    const attempts = 3; // 3 attempts per model name
    for (let attempt = 1; attempt <= attempts; attempt++) {
      try {
        console.log(`Attempting Gemini generateContent with model: ${modelName} (attempt ${attempt}/${attempts})`);
        const response = await ai.models.generateContent({
          ...params,
          model: modelName
        });
        return response;
      } catch (err: any) {
        lastError = err;
        const errStr = String(err.message || JSON.stringify(err) || err || "").toLowerCase();
        console.warn(`Gemini API call on model ${modelName} failed (attempt ${attempt}/${attempts}):`, err.message || err);
        
        const isUnavailableOrOverloaded = 
          errStr.includes("503") || 
          errStr.includes("unavailable") || 
          errStr.includes("high demand") || 
          errStr.includes("overloaded") || 
          errStr.includes("resource_exhausted") || 
          errStr.includes("429");

        if (isUnavailableOrOverloaded) {
          console.warn(`Model ${modelName} is unavailable or overloaded. Skipping remaining attempts for this model and trying next fallback model immediately...`);
          break; // Break the attempts loop for this model and proceed to the next model in modelsToTry
        }

        if (attempt < attempts) {
          // Progressive backoff delay: 1s, then 2s
          const delay = attempt * 1000;
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
  }

  throw lastError;
}
