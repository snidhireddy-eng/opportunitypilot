import { Router } from 'express';
import { generateGeminiContent } from '../services/gemini.js';

const router = Router();

router.post('/test', async (request, response) => {
  const prompt =
    typeof request.body?.prompt === 'string' && request.body.prompt.trim()
      ? request.body.prompt.trim()
      : 'Reply with the exact text: Gemini connection successful.';

  if (prompt.length > 2000) {
    response.status(400).json({ error: 'The test prompt must be 2000 characters or fewer.' });
    return;
  }

  try {
    const result = await generateGeminiContent(prompt);
    response.json(result);
  } catch (error) {
    console.error('Gemini test request failed:', error);
    const configured = Boolean(process.env.GEMINI_API_KEY?.trim());
    response.status(configured ? 502 : 503).json({
      error: configured
        ? 'Gemini request failed. Check server logs and try again.'
        : 'Gemini is not configured. Set GEMINI_API_KEY in the backend environment.',
    });
  }
});

export default router;
