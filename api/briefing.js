import { tavily } from "@tavily/core";
import { GoogleGenAI } from "@google/genai";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });
  try {
    const { company, personName, personRole, meetingType, purpose, background, goals } = req.body;
    const tvly = tavily({ apiKey: process.env.TAVILY_API_KEY });
    const search = await tvly.search(`${company} ${personName || ""} company overview recent news`, { maxResults: 5 });

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const prompt = `Write a meeting briefing for ${company} (Person: ${personName || "N/A"}, Role: ${personRole || "N/A"}, Meeting Type: ${meetingType || "N/A"}, Purpose: ${purpose || "N/A"}, Background: ${background || "N/A"}, Goals: ${goals || "N/A"}) using these sources:\n${JSON.stringify(search.results)}\n\nUse ONLY these exact markdown headings:\n## Executive Summary\n## Recent Developments\n## Important Insights\n## Suggested Questions\n## Personalised Talking Points\n## Information Gaps`;

    const reply = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: prompt,
    });

    res.status(200).json({ success: true, briefing: reply.text, sources: search.results });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}
