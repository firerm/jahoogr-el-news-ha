import { GoogleGenAI, Type } from "@google/genai";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const findRssFeed = async (query: string): Promise<{ url: string; name: string } | null> => {
  if (!apiKey) {
    console.warn("No API Key provided");
    return null;
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Find the most likely RSS feed URL for "${query}". Return a JSON object with the 'url' and a suggested short 'name' for the integration (PascalCase, no spaces).`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            url: { type: Type.STRING },
            name: { type: Type.STRING }
          },
          required: ["url", "name"]
        }
      }
    });

    const text = response.text;
    if (!text) return null;
    return JSON.parse(text);
  } catch (error) {
    console.error("Gemini lookup failed:", error);
    return null;
  }
};