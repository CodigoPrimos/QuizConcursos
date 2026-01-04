
import { GoogleGenAI } from "@google/genai";

export const getAIExplanation = async (statement: string, correctAnswer: string): Promise<string> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    // Fix: Added thinkingConfig with thinkingBudget to accompany maxOutputTokens for Gemini 3 models
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Explique pedagogicamente por que a resposta "${correctAnswer}" está correta para a seguinte questão de concurso: "${statement}". Seja conciso e direto.`,
      config: {
        temperature: 0.7,
        maxOutputTokens: 250,
        thinkingConfig: { thinkingBudget: 100 },
      }
    });

    return response.text || "Não foi possível gerar uma explicação automática no momento.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Erro ao conectar com o assistente de IA.";
  }
};
