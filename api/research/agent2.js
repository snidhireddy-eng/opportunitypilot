import { tavily } from "@tavily/core";
import { GoogleGenAI } from "@google/genai";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });
  try {
    const start = Date.now();
    const question = req.body.researchQuestion || req.body.query || req.body.topic || "Research topic";
    const tvly = tavily({ apiKey: process.env.TAVILY_API_KEY });
    const search = await tvly.search(question, { maxResults: 5 });

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const prompt = `Analyze "${question}" using these sources:\n${JSON.stringify(search.results)}\n\nReturn ONLY valid JSON with these exact keys:\n{"title":"string","executiveSummary":"string","keyFindings":[{"title":"string","detail":"string"}],"eligibilityCriteria":["string"],"deadlines":[{"name":"string","date":"string","detail":"string"}],"uncertainInformation":["string"]}`;

    const reply = await ai.models.generateContent({
      model: "gemini-3.5-flash-lite",
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });

    const parsed = JSON.parse(reply.text);
    res.status(200).json({
      agent: "agent2",
      title: parsed.title || question,
      executiveSummary: parsed.executiveSummary || "",
      keyFindings: Array.isArray(parsed.keyFindings) ? parsed.keyFindings : [],
      eligibilityCriteria: Array.isArray(parsed.eligibilityCriteria) ? parsed.eligibilityCriteria : [],
      deadlines: Array.isArray(parsed.deadlines) ? parsed.deadlines : [],
      uncertainInformation: Array.isArray(parsed.uncertainInformation) ? parsed.uncertainInformation : [],
      sources: search.results.map((r) => ({ title: r.title || null, url: r.url })),
      status: "completed",
      executionMs: Date.now() - start,
      model: "gemini-3.5-flash-lite",
      usage: null
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
