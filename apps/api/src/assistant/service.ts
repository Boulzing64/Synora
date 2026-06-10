import OpenAI from "openai";

const fallbackAnswer =
  "Assistant IA non configure. Ajoute OPENAI_API_KEY dans Render pour activer les reponses IA.";

export async function askSynoraAssistant(message: string) {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return fallbackAnswer;
  }

  const client = new OpenAI({
    apiKey,
  });

  const response = await client.responses.create({
    model: process.env.OPENAI_MODEL ?? "gpt-4.1-mini",
    instructions:
      "Tu es l'assistant utilisateur SYNORA. Reponds simplement, en francais par defaut, pour aider a utiliser le dashboard, le wallet, la reputation, les rewards SYN et Base Sepolia. Ne demande jamais de cle privee.",
    input: message,
  });

  return response.output_text;
}