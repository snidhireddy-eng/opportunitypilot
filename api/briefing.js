import { tavily } from "@tavily/core";
import { GoogleGenAI } from "@google/genai";

// Prefer the model already confirmed to work; use Gemini 3.8 only as a fallback.
const MODELS = ["gemini-3.5-flash-lite", "gemini-3.8-flash"];

function isTemporary(error) {
  const message = String(error?.message || error);
  return /503|UNAVAILABLE|429|RESOURCE_EXHAUSTED|high demand|overloaded/i.test(message);
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ success: false, error: "POST only" });
  try {
    const { company, personName, personRole, meetingType, purpose, background, goals } = req.body || {};
    if (!process.env.TAVILY_API_KEY || !process.env.GEMINI_API_KEY) {
      return res.status(500).json({ success: false, error: "Server configuration is incomplete. Check the required API environment variables in Vercel." });
    }
    if (!company?.trim() && !personName?.trim()) {
      return res.status(400).json({ success: false, error: "Please provide a company or person name." });
    }

    const tvly = tavily({ apiKey: process.env.TAVILY_API_KEY });
    const search = await tvly.search(`${company || ""} ${personName || ""} ${personRole || ""} company overview recent news`, { maxResults: 5 });
    const sources = (search.results || []).map((r) => ({ title: r.title || null, url: r.url }));
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const prompt = `Create a practical, fact-grounded meeting briefing for:
Company: ${company || "Not provided"}
Person: ${personName || "Not provided"}
Role: ${personRole || "Not provided"}
Meeting type: ${meetingType || "Not provided"}
Purpose: ${purpose || "Not provided"}
Background: ${background || "Not provided"}
Goals: ${goals || "Not provided"}

Use the live research sources below. Do not invent facts. Clearly mark missing information.

Personalisation rules:
- Treat the user's background and goals only as information they explicitly provided. Do not infer their skill level, years of experience, project history, achievements, frameworks, tools, certifications, teamwork, or professional experience.
- If the background contains only a technology or language name (for example, "Java"), describe it only as a stated area of learning or familiarity. Do not present the user as an experienced Java developer or claim they have built production systems.
- In Personalised Talking Points, separate confirmed user-provided facts from optional suggestions. Phrase unconfirmed items as possibilities the user could discuss only if they are true.
- Put missing details needed for stronger personalisation under Information Gaps. Never fill those gaps with assumptions.

${JSON.stringify(search.results || [])}

Use exactly these Markdown headings:
## Executive Summary
## Recent Developments
## Important Insights
## Suggested Questions
## Personalised Talking Points
## Information Gaps`;

    let reply;
    let selectedModel = null;
    let lastError;
    for (const model of MODELS) {
      try {
        reply = await ai.models.generateContent({ model, contents: prompt });
        selectedModel = model;
        break;
      } catch (error) {
        lastError = error;
        if (!isTemporary(error) || model === MODELS[MODELS.length - 1]) throw error;
      }
    }
    if (!reply?.text) throw lastError || new Error("The AI model returned an empty briefing.");
    return res.status(200).json({
      success: true,
      briefing: reply.text,
      sources,
      model: selectedModel || reply.modelVersion || "Unknown model"
    });
  } catch (err) {
    const message = String(err?.message || err);
    const status = /503|UNAVAILABLE|high demand|overloaded/i.test(message) ? 503 : 500;
    return res.status(status).json({ success: false, error: status === 503 ? "Both Gemini models are temporarily unavailable. Please retry in a few minutes." : message });
  }
}
