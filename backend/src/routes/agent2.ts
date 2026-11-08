import { Router } from 'express';
import type { ResearchAgentRequest } from '../../../src/types/agent2.js';
import { validateResearchAgentRequest } from '../../../src/services/researchRequest.js';
import { runResearchAgent2 } from '../services/researchAgent2.js';

const router = Router();

router.post('/', async (request, response) => {
  if (!validateResearchAgentRequest(request.body)) {
    response.status(400).json({
      error:
        'Provide a research question, opportunity category, and target audience within the supported length limits.',
    });
    return;
  }

  try {
    const result = await runResearchAgent2(request.body as ResearchAgentRequest);
    response.json(result);
  } catch (error) {
    console.error('Research Agent 2 request failed:', error);
    const configured = Boolean(process.env.GEMINI_API_KEY?.trim());
    const status = configured ? 502 : 503;
    response.status(status).json({
      error: configured
        ? 'Research Agent 2 could not complete the request. Check server logs.'
        : 'Gemini is not configured. Set GEMINI_API_KEY in the backend environment.',
    });
  }
});

export default router;
