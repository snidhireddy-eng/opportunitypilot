import { tavily } from "@tavily/core";
import { GoogleGenAI } from "@google/genai";

const CONFIGS = [
  {
    key: "alpha",
    name: "Gemini 3.8 Flash",
    model: "gemini-3.8-flash",
  },
  {
    key: "beta",
    name: "Gemini 3.5 Flash-Lite",
    model: "gemini-3.5-flash-lite",
  }
];

const REQUIRED_SECTIONS = [
  "Executive Summary",
  "Key Findings",
  "Eligibility and Fit",
  "Application Steps",
  "Deadlines and Dates",
  "Sources and Caveats"
];

const STOP_WORDS = new Set([
  "about", "after", "also", "among", "available", "based", "before",
  "being", "between", "could", "from", "have", "into", "more", "most",
  "other", "please", "should", "that", "their", "there", "these", "they",
  "this", "those", "through", "under", "using", "what", "when", "where",
  "which", "with", "would", "your"
]);

function withTimeout(promise, milliseconds, label) {
  let timeoutId;
  const timeout = new Promise((_, reject) => {
    timeoutId = setTimeout(() => reject(new Error(`${label} timed out after ${Math.round(milliseconds / 1000)} seconds.`)), milliseconds);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timeoutId));
}

function text(value, maxLength = 3000) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

function questionTerms(value) {
  return [...new Set(
    (value.toLowerCase().match(/[a-z0-9]{3,}/g) || [])
      .filter((term) => !STOP_WORDS.has(term))
  )];
}

function scoreRelevance(input, output) {
  const terms = questionTerms(input);
  if (!terms.length || !output) return null;
  const normalizedOutput = output.toLowerCase();
  return Math.round(
    terms.filter((term) => normalizedOutput.includes(term)).length / terms.length * 100
  );
}

function extractSection(markdown, heading) {
  const lines = markdown.split(/\r?\n/);
  const headingIndex = lines.findIndex((line) =>
    new RegExp("^#{1,6}\\s+" + heading.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "\\s*$", "i").test(line.trim())
  );
  if (headingIndex < 0) return "";
  const content = [];
  for (let index = headingIndex + 1; index < lines.length; index += 1) {
    if (/^#{1,6}\s+/.test(lines[index].trim())) break;
    content.push(lines[index]);
  }
  return content.join("\n").trim();
}

function listItems(section) {
  return section
    .split(/\r?\n/)
    .map((line) => line.replace(/^\s*(?:[-*•]|\d+[.)])\s*/, "").trim())
    .filter(Boolean);
}

function scoreCitationValidity(output, sources) {
  const citations = [...output.matchAll(/\[Source:\s*([^\]]+)\]/gi)];
  if (!citations.length) return 0;
  const knownTitles = new Set(
    sources.map((source) => (source.title || "").trim().toLowerCase()).filter(Boolean)
  );
  const validCount = citations.filter((match) =>
    knownTitles.has(match[1].trim().toLowerCase())
  ).length;
  return Math.round((validCount / citations.length) * 100);
}

function estimateCost() {
  // Do not guess model-specific prices; show cost as unavailable until verified.
  return null;
}

function buildScores({ cfg, output, executionMs, sources, usage, status }) {
  const relevance = status === "completed" ? scoreRelevance(cfg.inputText, output) : null;
  const sectionCount = REQUIRED_SECTIONS.filter((heading) =>
    new RegExp("^#{1,6}\\s+" + heading.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "\\s*$", "im").test(output)
  ).length;
  const completeness = status === "completed"
    ? Math.round(sectionCount / REQUIRED_SECTIONS.length * 100)
    : null;
  const sourceQuality = status === "completed" && sources.length
    ? Math.round(sources.filter((source) => source.title && /^https:\/\//i.test(source.url)).length / sources.length * 100)
    : status === "completed" ? 0 : null;
  const citationValidity = status === "completed" ? scoreCitationValidity(output, sources) : null;
  const cost = status === "completed" && usage ? estimateCost(cfg, usage) : null;

  const availableQualityScores = [relevance, completeness, sourceQuality].filter(
    (score) => typeof score === "number"
  );

  return {
    scores: [
      { metric: "accuracy", score: null, unit: "/100" },
      { metric: "relevance", score: relevance, unit: "/100" },
      { metric: "completeness", score: completeness, unit: "/100" },
      { metric: "sourceQuality", score: sourceQuality, unit: "/100" },
      { metric: "citationValidity", score: citationValidity, unit: "/100" },
      { metric: "responseTime", score: status === "completed" ? executionMs : null, unit: "ms" },
      { metric: "cost", score: cost, unit: "$" },
      { metric: "reliability", score: status === "completed" ? 100 : 0, unit: "/100" }
    ],
    // Do not combine heuristic checks into an overall quality score.
    overall: null
  };
}

async function runAgent(ai, config, question, category, audience, requirements, sources) {
  const start = Date.now();
  const asOfDate = new Date().toISOString().slice(0, 10);
  const prompt = `Research the opportunity below using the supplied live web sources. Both models receive the same task and sources.
Research date (UTC): ${asOfDate}. Treat this as the current date when evaluating deadlines and event status.

Research question: ${question}
Opportunity category: ${category || "Not specified"}
Target audience: ${audience || "Not specified"}
Additional requirements: ${requirements || "None"}

Instructions:
- Use only the supplied sources for factual claims.
- After each factual claim, add a citation in exactly this format: [Source: exact source title]. The title must exactly match one supplied source title.
- Never cite a source that was not supplied. If no source supports a claim, state that evidence is unavailable.
- Do not invent eligibility rules, dates, fees, or application links.
- Verify whether registration is currently open using explicit dates or status statements in the supplied sources.
- Treat an application deadline or event end date earlier than the research date as expired; do not describe that opportunity as currently open.
- If dates are missing, conflicting, or unclear, label the status "Unverified" rather than assuming it is upcoming or open.
- Clearly separate currently open opportunities, upcoming opportunities not yet open, expired opportunities, and unverified opportunities.
- Say "Not stated in the available sources" when evidence is missing.
- Tailor the findings to the target audience.
- Use exactly these Markdown headings:
## Executive Summary
## Key Findings
## Eligibility and Fit
## Application Steps
## Deadlines and Dates
## Sources and Caveats

Live research sources:
${JSON.stringify(sources)}`;

  const cfg = { ...config, inputText: [question, category, audience, requirements].filter(Boolean).join(" ") };

  try {
    const response = await withTimeout(
      ai.models.generateContent({
        model: config.model,
        contents: prompt
      }),
      40000,
      `${config.name} request`
    );
    const executionMs = Date.now() - start;
    const output = response.text || "";
    if (!output.trim()) throw new Error("The model returned an empty response.");

    const usage = response.usageMetadata || {};
    const sourceList = sources
      .filter((source) => typeof source.url === "string" && /^https?:\/\//i.test(source.url))
      .map((source) => ({ title: source.title || null, url: source.url }));
    const keyFindings = listItems(extractSection(output, "Key Findings")).map((detail, index) => ({
      title: `Finding ${index + 1}`,
      detail
    }));
    const eligibilityCriteria = listItems(extractSection(output, "Eligibility and Fit"));
    const applicationSteps = listItems(extractSection(output, "Application Steps"));
    const deadlineItems = listItems(extractSection(output, "Deadlines and Dates"));
    const scores = buildScores({
      cfg,
      output,
      executionMs,
      sources: sourceList,
      usage,
      status: "completed"
    });

    return {
      key: config.key,
      name: config.name,
      tagline: config.model,
      status: "completed",
      model: config.model,
      research: {
        title: question,
        executiveSummary: extractSection(output, "Executive Summary") || output,
        keyFindings,
        eligibilityCriteria,
        applicationSteps,
        deadlines: deadlineItems.map((detail, index) => ({
          name: `Date or deadline ${index + 1}`,
          date: "See details",
          detail
        })),
        uncertainInformation: [
          "Accuracy is not independently verified. Check the linked sources before relying on eligibility or deadline details."
        ],
        sources: sourceList
      },
      usage: {
        promptTokens: usage.promptTokenCount,
        responseTokens: (usage.candidatesTokenCount || 0) + (usage.thoughtsTokenCount || 0),
        totalTokens: usage.totalTokenCount
      },
      executionMs,
      ...scores
    };
  } catch (error) {
    const executionMs = Date.now() - start;
    return {
      key: config.key,
      name: config.name,
      tagline: config.model,
      status: "failed",
      error: String(error?.message || error).slice(0, 500),
      model: config.model,
      research: null,
      usage: null,
      executionMs,
      ...buildScores({
        cfg,
        output: "",
        executionMs,
        sources: [],
        usage: null,
        status: "failed"
      })
    };
  }
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });

  try {
    if (!process.env.TAVILY_API_KEY || !process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        error: "Server configuration is incomplete. Check the required API environment variables in Vercel."
      });
    }

    const body = req.body || {};
    const question = text(body.researchQuestion || body.query || body.topic, 2000);
    const category = text(body.opportunityCategory, 120);
    const audience = text(body.targetAudience, 300);
    const requirements = text(body.additionalRequirements, 3000);

    if (!question) return res.status(400).json({ error: "Enter a research question." });

    const tvly = tavily({ apiKey: process.env.TAVILY_API_KEY });
    const searchDate = new Date().toISOString().slice(0, 10);
    const searchQuery = [
      question,
      category,
      audience,
      "upcoming current opportunities registration open deadlines",
      searchDate.slice(0, 4)
    ].filter(Boolean).join(" ");
    let sources = [];
    let researchWarning = null;
    try {
      const search = await withTimeout(
        tvly.search(searchQuery, { maxResults: 8 }),
        10000,
        "Tavily research"
      );
      sources = Array.isArray(search.results) ? search.results : [];
      if (!sources.length) researchWarning = "Tavily returned no sources. Agents must identify unsupported facts rather than invent evidence.";
    } catch (searchError) {
      researchWarning = `Tavily research unavailable: ${String(searchError?.message || searchError).slice(0, 240)}. Agents will run without live sources and must disclose evidence gaps.`;
    }
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    const settledAgents = await Promise.allSettled(
      CONFIGS.map((config) =>
        runAgent(ai, config, question, category, audience, requirements, sources)
      )
    );

    // Preserve one result per configured agent even if an unexpected error escapes runAgent.
    const agents = settledAgents.map((result, index) => {
      if (result.status === "fulfilled") return result.value;

      const config = CONFIGS[index];
      const executionMs = 0;
      const cfg = {
        inputText: [question, category, audience, requirements].filter(Boolean).join(" ")
      };
      return {
        key: config.key,
        name: config.name,
        tagline: config.model,
        status: "failed",
        error: String(result.reason?.message || result.reason || "Agent execution failed.").slice(0, 500),
        model: config.model,
        research: null,
        usage: null,
        executionMs,
        ...buildScores({
          cfg,
          output: "",
          executionMs,
          sources: [],
          usage: null,
          status: "failed"
        })
      };
    });

    const metricKeys = ["accuracy", "relevance", "completeness", "sourceQuality", "citationValidity", "responseTime", "cost", "reliability"];
    const winners = {};
    for (const metric of metricKeys) {
      const a = agents[0].scores.find((score) => score.metric === metric)?.score;
      const b = agents[1].scores.find((score) => score.metric === metric)?.score;
      if (a === null || b === null || a === undefined || b === undefined) {
        winners[metric] = null;
      } else if (a === b) {
        winners[metric] = "tie";
      } else {
        const lowerIsBetter = metric === "responseTime" || metric === "cost";
        winners[metric] = lowerIsBetter
          ? (a < b ? "alpha" : "beta")
          : (a > b ? "alpha" : "beta");
      }
    }

    return res.status(200).json({
      researchQuestion: question,
      completedAt: new Date().toISOString(),
      rubric: "Both models receive identical inputs and Tavily sources. Relevance is a keyword-overlap heuristic; completeness checks for six required headings; source quality checks for titled HTTPS links; citation validity checks whether cited titles match supplied sources (not whether claims are true); response time is measured request duration; reliability records request success. Cost is unavailable until current model-specific prices are verified. Accuracy requires independent fact-checking and is not scored.",
      agents,
      winners
    });
  } catch (error) {
    const message = String(error?.message || error);
    const status = /429|RESOURCE_EXHAUSTED|503|UNAVAILABLE|high demand|overloaded/i.test(message) ? 503 : 500;
    return res.status(status).json({
      error: status === 503
        ? "A connected research or Gemini model service is temporarily unavailable or rate-limited. Wait 30–60 seconds and retry. If it keeps failing, check the Vercel Function Logs for /api/benchmark."
        : /TAVILY_API_KEY|GEMINI_API_KEY/.test(message)
          ? "Server configuration is incomplete. In Vercel, add TAVILY_API_KEY and GEMINI_API_KEY under Project Settings → Environment Variables, then redeploy. Never put these keys in frontend code."
          : `Live benchmark failed: ${message}. Open Vercel → Deployments → latest deployment → Functions/Logs and inspect the /api/benchmark invocation.`
    });
  }
}
