# OpportunityPilot 
### AI Opportunity Preparation & Benchmarking Platform

**Team:** Cognitive Engineering  
**Hackathon:** Global AI Hackathon 2026

## About the Project

OpportunityPilot is an AI-powered platform that combines opportunity research, personalised meeting preparation and AI model benchmarking.

It helps users prepare for interviews, internships, professional meetings and other opportunities through research-backed information and AI-generated insights.

## Features

### 1. AI Pre-Meeting Briefing

- Collects company, meeting and personal background details.
- Uses Tavily for live web research.
- Uses Google Gemini to generate a personalised briefing.
- Provides company background, role and internship context, recent developments and key insights.
- Generates suggested questions and personalised talking points.
- Identifies information gaps.
- Provides supporting research sources.
- Includes a printable briefing option.

### 2. AI Model Benchmarking

- Compares Gemini 3.6 Flash and Gemini 3.5 Flash-Lite.
- Sends both models the same research question, requirements and initial Tavily sources.
- Displays individual research outputs and performance metrics.
- Evaluates relevance, completeness, source quality and citation validity.
- Measures response time and request reliability.
- Performs an AI-assisted evidence check using independently retrieved Tavily sources.
- Reports individual model failures without fabricating results.

## Benchmarking Methodology

The deployed benchmark evaluates:

| Metric | Evaluation |
|---|---|
| Evidence Support | AI-assisted assessment of sampled claims against independent reference searches |
| Relevance | Keyword-overlap heuristic |
| Completeness | Presence of six required report sections |
| Source Quality | Titled HTTPS source links |
| Citation Validity | Matching citations against supplied source titles |
| Response Time | Model request execution time |
| Reliability | Successful request completion |
| API Cost | Unavailable until model-specific pricing is verified |

The evidence-support evaluation checks up to eight sampled claims per model. It is not a guarantee of factual accuracy. Structural and metadata checks should not be interpreted as independent fact verification.

## Technology Stack

- **Frontend:** React 18, TypeScript, Vite
- **Styling:** Tailwind CSS
- **Navigation:** React Router DOM
- **Backend:** Node.js, Express
- **AI Integration:** Google Gemini API
- **Research Integration:** Tavily API
- **Deployment:** Vercel

## Application Workflow

1. Enter company, meeting and personal details.
2. Submit the preparation form.
3. Tavily retrieves relevant research.
4. Gemini generates the personalised meeting briefing.
5. View the briefing, supporting sources and information gaps.
6. Open the benchmarking page.
7. Submit a research question and evaluation requirements.
8. Compare both Gemini models and their evaluation results.

## Project Structure

- `src/` – React frontend, pages, components and services.
- `api/` – Vercel serverless API endpoints.
- `backend/src/` – Local Express backend and services.
- `backend/test/` – Backend tests.

## Installation and Setup

### Prerequisites
- Node.js
- npm

### Clone the repository

```bash
git clone https://github.com/snidhireddy-eng/opportunitypilot.git
cd opportunitypilot
npm install
```

### Configure environment variables

Configure the following server-side variables for the deployed research and briefing endpoints:

- `GEMINI_API_KEY`
- `TAVILY_API_KEY`

Never expose API keys in frontend code or commit private environment files to GitHub.

### Run the local development environment

**Terminal 1 – Backend**

```bash
npm run server:dev
```

**Terminal 2 – Frontend**

```bash
npm run dev
```

Open the local URL displayed by Vite.

## Available Commands

| Command | Description |
|---|---|
| `npm run dev` | Starts Vite development server |
| `npm run server:dev` | Starts Express backend with file watching |
| `npm run server:start` | Starts Express backend |
| `npm run build` | Builds the frontend |
| `npm run lint` | Runs ESLint |
| `npm run typecheck` | Checks TypeScript types |
| `npm test` | Runs backend tests |
| `npm run preview` | Previews production build |

## Current Limitations

- Evidence support is based on a limited sample of claims.
- Evidence evaluation does not guarantee factual accuracy.
- Citation checks establish source-title traceability, not whether claims are true.
- API cost is unavailable until verified model pricing is configured.
- Gemini and Tavily service availability may affect live results.
- The local Express benchmarking architecture and deployed Vercel benchmarking implementation use different agent configurations.

## Future Scope

- Expand the range of supported AI models.
- Improve evidence verification.
- Enhance benchmarking metrics.
- Improve research coverage and personalisation.

## Project Links

- **GitHub Repository:** https://github.com/snidhireddy-eng/opportunitypilot
- **Live Application:** https://opportunitypilot.vercel.app

---

**OpportunityPilot | Built by Team Cognitive Engineering**  
Global AI Hackathon 2026
