import { GoogleGenAI } from "@google/genai";

const getAiClient = () => {
    if (!process.env.API_KEY) {
        console.warn("API_KEY not set in environment.");
        return null;
    }
    return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export const analyzeClauseLegality = async (text: string): Promise<string> => {
    const ai = getAiClient();
    if (!ai) return "AI service unavailable: Missing API Key.";

    try {
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: `You are a senior legal editor. Analyze the following contract clause for ambiguity, passive voice, or potential loopholes. Keep it brief (under 50 words). Clause: "${text}"`,
        });
        return response.text || "No analysis generated.";
    } catch (error) {
        console.error("Gemini Error:", error);
        return "Failed to analyze clause.";
    }
};

export const summarizeVersionChanges = async (oldClauses: any[], newClauses: any[]): Promise<string> => {
    const ai = getAiClient();
    if (!ai) return "Manual version save (AI unavailable).";

    // Simple diff simulation for prompt
    const prompt = `Compare these two document states and summarize the key changes in one sentence for a legal audit log.
    
    Old State Summary: ${oldClauses.length} clauses.
    New State Summary: ${newClauses.length} clauses.
    
    Focus on general intent of changes (e.g. "Modified termination clause").`;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: prompt,
        });
        return response.text || "Version saved.";
    } catch (error) {
        console.error("Gemini Error:", error);
        return "Version saved successfully.";
    }
};
