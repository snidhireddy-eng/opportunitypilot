import { tavily } from "@tavily/core";
import { GoogleGenAI } from "@google/genai";

const CONFIGS = [
  { key: "alpha", name: "Gemini 3.8 Flash", model: "gemini-3.8-flash" },
  { key: "beta", name: "Gemini 3.5 Flash-Lite", model: "gemini-3.5-flash-lite" }
];

function scoreRelevance(question, text) {
  const terms = question.toLowerCase().match(/[a-z0-9]{4,}/g) || [];
  const unique = [...new Set(terms)];
  if (!unique.length) return null;
  const body = text.toLowerCase();
  return Math.round(unique.filter((term) => body.includes(term)).length / unique.length * 100);
}

async function runAgent(ai, cfg, question, sources) {
  const start = Date.now();
  const prompt = `Answer the research question using the sources. Be specific, distinguish verified facts from uncertainty, and do not invent details.
Question: ${question}
Sources: ${JSON.stringify(sources)}`;
  try {
    const response = await ai.models.generateContent({ model: cfg.model, contents: prompt });
    const executionMs = Date.now() - start;
    const output = response.text || "";
    const usage = response.usageMetadata || {};
    const sourceList = sources.map((r) => ({ title: r.title || null, url: r.url }));
    const hasStructure = /\n|\.|\?|!/.test(output);
    const relevance = scoreRelevance(question, output);
    const sourceQuality = sourceList.length
      ? Math.round(sourceList.filter((s) => s.title && /^https:\/\//i.test(s.url)).length / sourceList.length * 100)
      : 0;
    return {
      key: cfg.key,
      name: cfg.name,
      tagline: cfg.model,
      status: "completed",
      error: undefined,
      model: cfg.model,
      research: {
        title: question,
        executiveSummary: output,
        keyFindings: [],
        eligibilityCriteria: [],
        deadlines: [],
        uncertainInformation: ["Automated relevance and source-metadata checks are not independent factual verification."],
        sources: sourceList
      },
      usage: {
        promptTokens: usage.promptTokenCount,
        responseTokens: usage.candidatesTokenCount,
        totalTokens: usage.totalTokenCount
      },
      executionMs,
      scores: [
        { metric: "accuracy", score: null, unit: "/100" },
        { metric: "relevance", score: relevance, unit: "/100" },
        { metric: "completeness", score: hasStructure ? 100 : 0, unit: "/100" },
        { metric: "sourceQuality", score: sourceQuality, unit: "/100" },
        { metric: "responseTime", score: executionMs, unit: "ms" },
        { metric: "cost", score: null, unit: "$" },
        { metric: "reliability", score: 100, unit: "/100" }
      ],
      overall: relevance === null ? null : Math.round((relevance + (hasStructure ? 100 : 0) + sourceQuality) / 3)
    };
  } catch (error) {
    return {
      key: cfg.key,
      name: cfg.name,
      tagline: cfg.model,
      status: "failed",
      error: String(error?.message || error).slice(0, 500),
      model: cfg.model,
      research: null,
      usage: null,
      executionMs: Date.now() - start,
      scores: [
        { metric: "accuracy", score: null, unit: "/100" },
        { metric: "relevance", score: null, unit: "/100" },
        { metric: "completeness", score: null, unit: "/100" },
        { metric: "sourceQuality", score: null, unit: "/100" },
        { metric: "responseTime", score: Date.now() - start, unit: "ms" },
        { metric: "cost", score: null, unit: "$" },
        { metric: "reliability", score: 0, unit: "/100" }
      ],
      overall: null
    };
  }
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });
  try {
    if (!process.env.TAVILY_API_KEY || !process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: "Server configuration is incomplete. Check required API environment variables in Vercel." });
    }
    const body = req.body || {};
    const question = body.researchQuestion || body.query || body.topic;
    if (!question?.trim()) return res.status(400).json({ error: "Enter a research question." });
    const tvly = tavily({ apiKey: process.env.TAVILY_API_KEY });
    const search = await tvly.search(question, { maxResults: 5 });
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const agents = await Promise.all(CONFIGS.map((cfg) => runAgent(ai, cfg, question, search.results || [])));
    const metricKeys = ["accuracy", "relevance", "completeness", "sourceQuality", "responseTime", "cost", "reliability"];
    const winners = {};
    for (const metric of metricKeys) {
      const a = agents[0].scores.find((s) => s.metric === metric)?.score;
      const b = agents[1].scores.find((s) => s.metric === metric)?.score;
      if (a === null || b === null || a === undefined || b === undefined) winners[metric] = null;
      else if (a === b) winners[metric] = "tie";
      else winners[metric] = (metric === "responseTime" || metric === "cost") ? (a < b ? "alpha" : "beta") : (a > b ? "alpha" : "beta");
    }
    return res.status(200).json({
      researchQuestion: question,
      completedAt: new Date().toISOString(),
      rubric: "Live latency, deterministic question-term relevance, response structure, source metadata, and request success are measured. Accuracy and cost are unavailable because no independent fact-check or verified token pricing is configured.",
      agents,
      winners
    });
  } catch (err) {
    return res.status(500).json({ error: String(err?.message || err) });
  }
}
