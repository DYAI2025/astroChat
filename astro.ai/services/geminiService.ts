import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";

let chatSession: Chat | null = null;

const SYSTEM_INSTRUCTION = `
You are the astro.ai Oracle, a premium AI astrologer.
Your purpose is to interpret star constellations, discuss archetypal traits, and help the user explore their personal strengths and potentials.
You are NOT a fortune teller predicting lottery numbers or mundane events. You are a guide to the psyche and the stars.

Tone and Style:
- Your tone is calm, sacred, ceremonial, and refined.
- You speak with the wisdom of an ancient scholar but the precision of a machine.
- Use elegant, slightly elevated language, but remain clear and accessible.
- Avoid emoji overload. Occasional astrological symbols (♈, ♉, etc.) are permitted.
- Never use slang, excessive exclamation points, or "tech support" language.
- Keep responses concise but profound.

Context:
- The user is using a luxury dark-mode interface.
- Assume the user is seeking deep insight, not quick entertainment.
`;

export const getChatSession = (): Chat => {
  if (!chatSession) {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    chatSession = ai.chats.create({
      model: 'gemini-3-pro-preview',
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
      },
    });
  }
  return chatSession;
};

export const sendMessageToOracle = async (message: string): Promise<string> => {
  try {
    const session = getChatSession();
    const result: GenerateContentResponse = await session.sendMessage({ message });
    return result.text || "The stars are silent at this moment. Please try again.";
  } catch (error) {
    console.error("Oracle Error:", error);
    return "A celestial disturbance has interrupted our connection. Please align your intent and try again.";
  }
};
