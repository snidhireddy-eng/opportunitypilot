import assert from 'node:assert/strict';
import test from 'node:test';
import type { ResearchAgentRequest, ResearchOutput } from '../../src/types/agent2.js';
import { runBenchmark } from '../src/services/benchmark.js';
import { parseStructuredResult } from '../src/services/researchAgent2.js';

const request: ResearchAgentRequest = {
  researchQuestion: 'Find scholarships for women in STEM',
  opportunityCategory: 'Scholarship',
  targetAudience: 'Undergraduate students in India',
  additionalRequirements: 'Open for applications in 2026',
};

const exampleOutput: ResearchOutput = {
  title: 'STEM scholarships',
  executiveSummary: 'Scholarship opportunities for undergraduate women in STEM.',
  keyFindings: [{ title: 'Application', detail: 'Check the scholarship application requirements.' }],
  eligibilityCriteria: ['Undergraduate women studying STEM'],
  deadlines: [{ name: 'Application deadline', date: '2026-10-01', detail: 'Confirm on the official page.' }],
  uncertainInformation: [],
  sources: [{ title: 'Official scholarship page', url: 'https://example.org/scholarship' }],
};

test('parses valid structured Agent 2 JSON', () => {
  const parsed = parseStructuredResult(
    JSON.stringify({
      title: 'STEM scholarships',
      executiveSummary: 'Research summary.',
      keyFindings: [{ title: 'Finding', detail: 'Evidence-backed detail.' }],
      eligibilityCriteria: ['Undergraduates'],
      deadlines: [],
      uncertainInformation: [],
    })
  );
  assert.equal(parsed.title, 'STEM scholarships');
  assert.equal(parsed.keyFindings.length, 1);
});

test('rejects malformed structured Agent 2 JSON', () => {
  assert.throws(() => parseStructuredResult('not json'));
  assert.throws(() => parseStructuredResult(JSON.stringify({ title: 'Missing required fields' })));
});

test('benchmarks two compatible outputs using the same request and leaves unsupported measures unavailable', async () => {
  const originalAgent1InputPrice = process.env.AGENT1_INPUT_USD_PER_MILLION;
  const originalAgent1OutputPrice = process.env.AGENT1_OUTPUT_USD_PER_MILLION;
  const originalGeminiInputPrice = process.env.GEMINI_INPUT_USD_PER_MILLION;
  const originalGeminiOutputPrice = process.env.GEMINI_OUTPUT_USD_PER_MILLION;
  delete process.env.AGENT1_INPUT_USD_PER_MILLION;
  delete process.env.AGENT1_OUTPUT_USD_PER_MILLION;
  delete process.env.GEMINI_INPUT_USD_PER_MILLION;
  delete process.env.GEMINI_OUTPUT_USD_PER_MILLION;

  const received: ResearchAgentRequest[] = [];
  try {
    const result = await runBenchmark(request, {
      agent1: async (input) => {
        received.push(input);
        return {
          research: exampleOutput,
          model: 'agent-one-test',
          usage: { promptTokens: 1000, responseTokens: 2000 },
        };
      },
      agent2: async (input) => {
        received.push(input);
        return {
          research: {
            ...exampleOutput,
            sources: [{ title: null, url: 'http://example.org/source' }],
          },
          model: 'gemini-test',
          usage: { promptTokens: 10, responseTokens: 20 },
        };
      },
    });

    assert.deepEqual(received, [request, request]);
    assert.deepEqual(result.agents.map((agent) => agent.status), ['completed', 'completed']);
    assert.equal(result.agents[0].scores.find((score) => score.metric === 'accuracy')?.score, null);
    assert.equal(result.agents[0].scores.find((score) => score.metric === 'cost')?.score, null);
    assert.equal(result.winners.sourceQuality, 'alpha');
    assert.equal(result.winners.accuracy, null);

    process.env.AGENT1_INPUT_USD_PER_MILLION = '2';
    process.env.AGENT1_OUTPUT_USD_PER_MILLION = '4';
    process.env.GEMINI_INPUT_USD_PER_MILLION = '10';
    process.env.GEMINI_OUTPUT_USD_PER_MILLION = '20';
    const pricedResult = await runBenchmark(request, {
      agent1: async () => ({
        research: exampleOutput,
        model: 'agent-one-test',
        usage: { promptTokens: 1000, responseTokens: 2000 },
      }),
      agent2: async () => ({
        research: exampleOutput,
        model: 'gemini-test',
        usage: { promptTokens: 10, responseTokens: 20 },
      }),
    });
    assert.equal(pricedResult.agents[0].scores.find((score) => score.metric === 'cost')?.score, 0.01);
    assert.equal(pricedResult.agents[1].scores.find((score) => score.metric === 'cost')?.score, 0.0005);
    assert.equal(pricedResult.winners.cost, 'beta');
  } finally {
    if (originalAgent1InputPrice === undefined) delete process.env.AGENT1_INPUT_USD_PER_MILLION;
    else process.env.AGENT1_INPUT_USD_PER_MILLION = originalAgent1InputPrice;
    if (originalAgent1OutputPrice === undefined) delete process.env.AGENT1_OUTPUT_USD_PER_MILLION;
    else process.env.AGENT1_OUTPUT_USD_PER_MILLION = originalAgent1OutputPrice;
    if (originalGeminiInputPrice === undefined) delete process.env.GEMINI_INPUT_USD_PER_MILLION;
    else process.env.GEMINI_INPUT_USD_PER_MILLION = originalGeminiInputPrice;
    if (originalGeminiOutputPrice === undefined) delete process.env.GEMINI_OUTPUT_USD_PER_MILLION;
    else process.env.GEMINI_OUTPUT_USD_PER_MILLION = originalGeminiOutputPrice;
  }
});
