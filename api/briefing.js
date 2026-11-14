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
    const interviewContext = /intern|interview|sde|software engineer|job/i.test(`${meetingType || ""} ${purpose || ""} ${personRole || ""}`)
      ? "early careers software engineering internship hiring process interview preparation official careers"
      : "company official announcements recent news";
    const search = await tvly.search(`${searchCompany} ${personName || ""} ${personRole || ""} ${interviewContext}`, { maxResults: 10 });
    const relevantResults = selectRelevantSources(search.results, company || "");
    const sources = relevantResults.map((r) => ({ title: r.title || null, url: r.url, sourceType: r.sourceType, publishedDate: r.published_date || null }));
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const prompt = `Create a practical, fact-grounded meeting briefing for:
Company: ${company || "Not provided"}
Person: ${personName || "Not provided"}
Role: ${personRole || "Not provided"}
Meeting type: ${meetingType || "Not provided"}
Purpose: ${purpose || "Not provided"}
Background: ${background || "Not provided"}
Goals: ${goals || "Not provided"}

Use only the relevant, quality-filtered research sources below. Do not use outside assumptions to fill gaps. Every company-specific factual claim in Executive Summary, Recent Developments, and Important Insights must be supported by one of these sources; cite it inline using its exact title in the format [Source: exact source title]. If no source supports a claim, omit it or clearly label it as unverified. Prefer official company sources for company announcements and established news publishers for independent reporting. Do not cite a source for a claim it does not support. If the filtered source list is empty, say that reliable relevant sources could not be found and do not invent recent developments.

Personalisation rules:
- Treat the user's background and goals only as information they explicitly provided. Do not infer their skill level, years of experience, project history, achievements, frameworks, tools, certifications, teamwork, or professional experience.
- If the background contains only a technology or language name (for example, "Java"), describe it only as a stated area of learning or familiarity. Do not present the user as an experienced Java developer or claim they have built production systems.
- In Personalised Talking Points, separate confirmed user-provided facts from optional suggestions. Phrase unconfirmed items as possibilities the user could discuss only if they are true.
- Put missing details needed for stronger personalisation under Information Gaps. Never fill those gaps with assumptions.

${JSON.stringify(relevantResults)}

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
