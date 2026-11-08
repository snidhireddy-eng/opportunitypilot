import 'dotenv/config';
import express from 'express';
import agent2Router from './routes/agent2.js';
import benchmarkRouter from './routes/benchmark.js';
import geminiRouter from './routes/gemini.js';

const app = express();
const port = Number(process.env.PORT ?? 3001);

if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error('PORT must be a valid TCP port number.');
}

app.use(express.json({ limit: '1mb' }));
app.get('/api/health', (_request, response) => {
  response.json({ status: 'ok', geminiConfigured: Boolean(process.env.GEMINI_API_KEY?.trim()) });
});
app.use('/api/gemini', geminiRouter);
app.use('/api/research/agent2', agent2Router);
app.use('/api/benchmark', benchmarkRouter);
app.use((error: unknown, _request: express.Request, response: express.Response, next: express.NextFunction) => {
  console.error('API request failed:', error);
  void next;
  response.status(400).json({ error: 'The request could not be processed.' });
});

app.listen(port, () => {
  console.log(`OpportunityPilot API listening on http://localhost:${port}`);
});
