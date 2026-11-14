# OpportunityPilot

**An Opportunity Research and AI Agent Benchmarking Platform**

## About the Project

OpportunityPilot is a React frontend with Vercel serverless API routes and a local Express development backend. It supports live meeting preparation, Tavily-powered opportunity research, and comparison of two Gemini models.

The project aims to bring meeting preparation and AI agent evaluation together in one platform.

## Problem Statement

Preparing for interviews, internships, networking sessions, and professional meetings requires collecting information and organising relevant questions and talking points.

OpportunityPilot is being developed to simplify this preparation process through a structured platform.

## Current Features

The following features are implemented in the current frontend:

- **Home Page:** Introduces OpportunityPilot, its purpose, workflow, and planned capabilities.
- **Preparation Form:** Allows users to enter company or organisation details, meeting information, purpose, personal background, and additional goals.
- **Form Validation:** Required fields are validated before submission.
- **Preparation Summary:** Displays a frontend confirmation of the submitted preparation details.
- **Navigation:** Provides navigation between the main project pages.
- **Responsive Layout:** Uses a responsive frontend layout.
- **Research Agent 2:** Uses the Google Gemini JavaScript SDK with Google Search grounding through the backend.
- **Live Benchmarking:** The deployed Vercel endpoint sends the same task and Tavily sources to Gemini 3.8 Flash and Gemini 3.5 Flash-Lite, then compares their results with transparent checks. The separate local Express backend supports an optional external Agent 1 adapter.

## Pages

| Page | Current Status |
|---|---|
| Home | Implemented |
| Prepare | Frontend form implemented |
| Meeting Briefing | Live Tavily + Gemini API route; requires server-side API keys |
| Agent Benchmarking | Live comparison of Gemini 3.8 Flash and Gemini 3.5 Flash-Lite, with independent failure reporting |
| About | Project information |

## Technology Stack

- React 18
- TypeScript
- Vite
- Tailwind CSS
- React Router DOM
- Lucide React
- Node.js + Express
- Google Gemini API (`@google/genai`)

## Project Setup

### Prerequisites

- Node.js
- npm

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/snidhireddy-eng/opportunitypilot.git
   ```

2. Navigate into the project directory:

   ```bash
   cd opportunitypilot
   ```

3. Install dependencies:

   ```bash
   npm install
   ```

4. Create `.env` from `.env.example` and set `GEMINI_API_KEY`. Keep this file private; the key is only used by the backend.

5. Start the backend in one terminal:

   ```bash
   npm run server:dev
   ```

6. Start the frontend in another terminal:

   ```bash
   npm run dev
   ```

7. Open the local URL displayed in your terminal. Vite forwards `/api` requests to the backend on port 3001.

### Available Commands

| Command | Purpose |
|---|---|
| `npm run dev` | Starts development server |
| `npm run server:dev` | Starts the Express API with file watching |
| `npm run server:start` | Starts the Express API |
| `npm run build` | Builds the frontend |
| `npm run lint` | Runs ESLint |
| `npm run typecheck` | Checks frontend and backend TypeScript types |
| `npm test` | Runs structured-output and benchmark tests |
| `npm run preview` | Previews production build |

### API Endpoints

- `GET /api/health` reports whether the backend is running and Gemini is configured.
- `POST /api/gemini/test` makes a simple Gemini request; an optional JSON body can include a `prompt`.
- `POST /api/research/agent2` runs Research Agent 2. Required JSON fields: `researchQuestion`, `opportunityCategory`, and `targetAudience`; `additionalRequirements` is optional.
- `POST /api/benchmark` sends the exact same request to both agents and returns results, scores, and winners. If Agent 1 or Gemini is not configured, its status and scores are reported as unavailable rather than fabricated.
- The Benchmark page also has a **Run Agent 2 only** action for independent Agent 2 testing.

### Research Agent 1 Adapter Contract

Research Agent 1 is not included in this repository. When Person 2 provides an HTTP endpoint, set `AGENT1_API_URL` (and optionally `AGENT1_API_KEY`) in `.env`. The adapter sends the same four input fields as Research Agent 2 and expects JSON with:

- `title`, `executiveSummary`
- `keyFindings`: array of `{ "title", "detail" }`
- `eligibilityCriteria`: string array
- `deadlines`: array of `{ "name", "date", "detail" }`
- `uncertainInformation`: string array
- `sources`: array of `{ "title", "url" }`
- Optional `model` and `usage` (`promptTokens`, `responseTokens`, `totalTokens`)

Execution time is measured by the adapter, not accepted from the agent. Source URLs must be HTTP(S). Coordinate this shape and the shared request fields with Person 2 before connecting their endpoint.

For cost calculation, configure both `GEMINI_INPUT_USD_PER_MILLION` and `GEMINI_OUTPUT_USD_PER_MILLION`; Agent 1 has corresponding `AGENT1_...` variables. Leave prices unset to show cost as unavailable. Accuracy is also unavailable until independent reference evidence is supplied. The live completeness, relevance, and source-quality scores are explicitly limited to structural/query-term/metadata checks and are not fact-checks.

## Current Development Status

The deployed Vercel app includes a live meeting-briefing endpoint (`api/briefing.js`), a standalone research endpoint (`api/research/agent2.js`), and a two-model benchmark endpoint (`api/benchmark.js`). These require server-side `TAVILY_API_KEY` and `GEMINI_API_KEY` values. Gemini provider availability can vary; a 503 response is a temporary provider failure, not a successful model result. The benchmark reports individual agent failures without discarding the other result. Factual accuracy is not independently scored, citation validity checks source-title traceability rather than truth, and API cost remains unavailable until verified model pricing is configured. Illustrative example content is clearly separated from live results.

## Project Goal

The goal is to develop OpportunityPilot into a platform that can generate research-backed meeting preparation briefings and evaluate AI agents using measurable performance criteria.

---

**Project:** OpportunityPilot  
**Status:** Deployed app with live Tavily research and Gemini-powered briefing and benchmarking APIs
**Hackathon:** Global AI Hackathon 2026
