import { tavily } from "@tavily/core";
import { GoogleGenAI } from "@google/genai";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });
  try {
    const { query } = req.body;
    const tvly = tavily({ apiKey: process.env.TAVILY_API_KEY });
    const search = await tvly.search(query, { maxResults: 5 });
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    const models = ["gemini-2.5-flash", "gemini-2.5-flash-lite"];
    const results = await Promise.all(
      models.map(async (model) => {
        const start = Date.now();
        const resAi = await ai.models.generateContent({
          model,
          contents: `Summarize key insights from:\n${JSON.stringify(search.results)}`,
        });
        return { model, latencyMs: Date.now() - start, output: resAi.text };
      })
    );

    res.status(200).json({ query, results });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
