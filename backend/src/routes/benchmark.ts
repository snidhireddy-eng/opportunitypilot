import { Router } from 'express';
import type { ResearchAgentRequest } from '../../../src/types/agent2.js';
import { validateResearchAgentRequest } from '../../../src/services/researchRequest.js';
import { runBenchmark } from '../services/benchmark.js';

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
    response.json(await runBenchmark(request.body as ResearchAgentRequest));
  } catch (error) {
    console.error('Benchmark request failed:', error);
    response.status(500).json({ error: 'The benchmark could not be completed. Check server logs.' });
  }
});

export default router;
