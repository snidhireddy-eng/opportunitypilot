import type { ResearchAgentRequest } from '@/types/agent2';
import type { BenchmarkRunResult } from '@/types/benchmark';

function isBenchmarkRunResult(value: unknown): value is BenchmarkRunResult {
  if (!value || typeof value !== 'object') return false;
  const result = value as Record<string, unknown>;
  if (
    typeof result.researchQuestion !== 'string' ||
    typeof result.completedAt !== 'string' ||
    typeof result.rubric !== 'string' ||
    !Array.isArray(result.agents) ||
    result.agents.length !== 2 ||
    !result.winners ||
    typeof result.winners !== 'object'
  ) {
    return false;
  }

  return result.agents.every((agent) => {
    if (!agent || typeof agent !== 'object') return false;
    const value = agent as Record<string, unknown>;
    return (
      (value.key === 'alpha' || value.key === 'beta') &&
      typeof value.name === 'string' &&
      (value.status === 'completed' ||
        value.status === 'not_configured' ||
        value.status === 'failed') &&
      Array.isArray(value.scores)
    );
  });
}

export async function runBenchmark(
  input: ResearchAgentRequest,
  signal?: AbortSignal
): Promise<BenchmarkRunResult> {
  let response: Response;
  try {
    response = await fetch('/api/benchmark', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
      signal,
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') throw error;
    throw new Error('Could not reach the benchmark service. Confirm the backend is running and try again.');
  }

  const responseText = await response.text();
  let payload: unknown = null;
  try {
    payload = JSON.parse(responseText);
  } catch {
    const detail = responseText.replace(/\\s+/g, ' ').trim().slice(0, 240);
    throw new Error(
      `Benchmark API returned a non-JSON response (HTTP ${response.status}). ${detail || 'The server returned an empty response.'}`
    );
  }

  if (!response.ok) {
    const message =
      payload && typeof payload === 'object' && 'error' in payload && typeof payload.error === 'string'
        ? payload.error
        : `The benchmark request failed (HTTP ${response.status}).`;
    throw new Error(message);
  }

  if (!isBenchmarkRunResult(payload)) {
    throw new Error('The benchmark service returned an invalid response.');
  }
  return payload;
}
