import { tavily } from "@tavily/core";
import { GoogleGenAI } from "@google/genai";

// Prefer the model already confirmed to work; use Gemini 3.8 only as a fallback.
const MODELS = ["gemini-3.5-flash-lite", "gemini-3.8-flash"];

const OFFICIAL_DOMAINS_BY_COMPANY = {
  tcs: ["tcs.com", "tata.com"],
  google: ["google.com", "blog.google", "about.google", "abc.xyz"],
};

const TRUSTED_NEWS_DOMAINS = [
  "reuters.com",
  "bloomberg.com",
  "ft.com",
  "wsj.com",
  "bbc.com",
  "cnbc.com",
  "economictimes.indiatimes.com",
  "m.economictimes.com",
  "business-standard.com",
  "livemint.com",
  "thehindu.com",
  "indianexpress.com",
];

function normalizeText(value = "") {
  return String(value).toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function getCompanySearchName(company = "") {
  const normalized = normalizeText(company);
  return normalized === "tcs" ? "Tata Consultancy Services (TCS)" : company;
}

function isAllowedDomain(hostname, domains = []) {
  return domains.some((domain) => hostname === domain || hostname.endsWith("." + domain));
}

function selectRelevantSources(results, company) {
  const normalizedCompany = normalizeText(company);
  const isTcs = normalizedCompany === "tcs" || normalizedCompany === "tata consultancy services";
  const isGoogle = normalizedCompany === "google" || normalizedCompany === "google llc";
  const officialDomains = isTcs ? OFFICIAL_DOMAINS_BY_COMPANY.tcs : isGoogle ? OFFICIAL_DOMAINS_BY_COMPANY.google : [];
  const companyPhrase = isTcs ? "tata consultancy services" : normalizedCompany;
  const companyTokens = companyPhrase.split(" ").filter((token) => token.length > 2);
  const ranked = (results || []).flatMap((result) => {
    try {
      const hostname = new URL(result.url).hostname.toLowerCase().replace(/^www\./, "");
      const text = normalizeText([result.title || "", result.content || "", hostname].join(" "));
      const matchesCompany = isTcs
        ? text.includes("tata consultancy services") || isAllowedDomain(hostname, officialDomains)
        : isGoogle
          ? text.includes("google") || isAllowedDomain(hostname, officialDomains)
          : text.includes(companyPhrase) || (companyTokens.length > 1 && companyTokens.every((token) => text.includes(token)));
      const isOfficial = isAllowedDomain(hostname, officialDomains);
      const isTrustedNews = isAllowedDomain(hostname, TRUSTED_NEWS_DOMAINS);
      if (!matchesCompany || (!isOfficial && !isTrustedNews)) return [];
      return [{
        ...result,
        sourceType: isOfficial ? "Official company source" : "Established news source",
        sourceRank: isOfficial ? 2 : 1,
      }];
    } catch {
      return [];
    }
  });

  return ranked
    .sort((a, b) => b.sourceRank - a.sourceRank || (Number(b.score) || 0) - (Number(a.score) || 0))
    .slice(0, 6);
}

function withTimeout(promise, milliseconds, label) {
  let timeoutId;
  const timeout = new Promise((_, reject) => {
    timeoutId = setTimeout(() => reject(new Error(`${label} timed out after ${Math.round(milliseconds / 1000)} seconds.`)), milliseconds);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timeoutId));
}

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
    const searchCompany = getCompanySearchName(company || "");
    const isInterview = /intern|interview|sde|software engineer|job/i.test(`${meetingType || ""} ${purpose || ""} ${personRole || ""}`);
    const searchQueries = [
      `${searchCompany} official company overview products services`,
      isInterview
        ? `${searchCompany} official careers ${personRole || ""} ${purpose || ""} student internship eligibility academic year application process`
        : `${searchCompany} official announcements recent developments ${new Date().getFullYear()}`,
    ];
    const searchResults = await Promise.allSettled(
      searchQueries.map((query) =>
        withTimeout(tvly.search(query, { maxResults: 6 }), 9000, "Tavily research")
      )
    );
    const combinedResults = searchResults.flatMap((result) =>
      result.status === "fulfilled" && Array.isArray(result.value.results)
        ? result.value.results
        : []
    );
    const uniqueResults = [...new Map(
      combinedResults.filter((result) => result?.url).map((result) => [result.url, result])
    ).values()];
    const relevantResults = selectRelevantSources(uniqueResults, company || "");
    const sources = relevantResults.map((r) => ({
      title: r.title || null,
      url: r.url,
      sourceType: r.sourceType,
      publishedDate: r.published_date || null
    }));
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const prompt = `Create a practical, fact-grounded meeting briefing. The audience is the person preparing for the meeting, not the company. Keep the writing specific, useful and concise.

MEETING DETAILS
Company: ${company || "Not provided"}
Person: ${personName || "Not provided"}
Person's role: ${personRole || "Not provided"}
Meeting type: ${meetingType || "Not provided"}
Purpose: ${purpose || "Not provided"}
User background: ${background || "Not provided"}
User goals: ${goals || "Not provided"}

RESEARCH RULES
- Use only the research sources supplied at the end. Do not use outside assumptions to fill gaps.
- Company Background must explain the organisation itself: what it does, its main products/services or business areas, and relevant context. Do not repeat the user's background or meeting form here.
- Include 3–5 concrete company facts when sources support them. Cite each factual claim inline with the exact source title: [Source: exact source title].
- Role and Internship Context must focus on the named role and opportunity. For internships, look for official academic-year, graduation-year, location and application requirements. Do not infer eligibility.
- Recent Developments must contain dated, genuinely recent company developments only when a supplied source supports them. If none are found, say so plainly; do not fill the section with generic career-page information.
- Key Insights must explain what the research means for this meeting. Separate sourced facts from clearly labelled preparation advice. Avoid generic statements such as merely saying the company has a careers page.
- Prefer official company and official careers sources. Use established news publishers only for independent reporting. Do not cite a source for a claim it does not support.
- If no source supports a requested fact, say "Not confirmed in the available sources" and add it to Information Gaps.
- Do not imply that a first-year student is eligible for a specific internship unless an included official source explicitly confirms it. Make eligibility verification the first suggested action when it is unknown.

PERSONALISATION RULES
- Use only details explicitly supplied by the user. Do not invent experience, achievements, skills, GPA, certifications, teamwork or technical knowledge.
- If the user says they are learning Java, describe Java as a current learning area, not professional proficiency.
- Reflect projects accurately as projects the user says they built; do not invent implementation details, impact, tools or results.
- For an HR/recruiting contact, ask practical questions about academic eligibility, graduation year, application windows, selection stages, assessment format, location and application process. Do not ask HR detailed engineering questions.
- Include 3–5 suggested questions, prioritised for the stated contact.
- Personalised Talking Points must contain 3–5 concise bullets. Every bullet must have a non-empty label and useful detail on the same line, such as "Confirmed background:", "Project detail to prepare:", or "Optional (only if true):". Do not use empty labels or repeat the same detail.
- Put missing information needed for stronger preparation under Information Gaps.

RESEARCH SOURCES
${JSON.stringify(relevantResults)}

Use exactly these Markdown headings:
## Company Background
## Role and Internship Context
## Recent Developments
## Key Insights
## Suggested Questions
## Personalised Talking Points
## Information Gaps`;

    let reply;
    let selectedModel = null;
    let lastError;
    for (const model of MODELS) {
      try {
        const timeoutMs = model === MODELS[0] ? 38000 : 10000;
        reply = await withTimeout(
          ai.models.generateContent({ model, contents: prompt }),
          timeoutMs,
          `${model} briefing request`
        );
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
