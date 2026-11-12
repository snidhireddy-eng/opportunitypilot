import { tavily } from "@tavily/core";
import { GoogleGenAI } from "@google/genai";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });
  try {
    const { company } = req.body;
    const tvly = tavily({ apiKey: process.env.TAVILY_API_KEY });
    const search = await tvly.search(`${company} company overview recent news`, { maxResults: 5 });

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const reply = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Write a structured pre-meeting briefing for ${company} using:\n${JSON.stringify(search.results)}`,
    });

    res.status(200).json({ briefing: reply.text, sources: search.results });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
