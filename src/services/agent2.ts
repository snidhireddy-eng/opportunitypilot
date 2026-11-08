import type { ResearchAgentRequest, ResearchAgentResult } from '@/types/agent2';

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object';
}

function isResearchAgentResult(value: unknown): value is ResearchAgentResult {
  if (!isRecord(value)) return false;
  return (
    value.agent === 'agent2' &&
    typeof value.title === 'string' &&
    typeof value.executiveSummary === 'string' &&
    Array.isArray(value.keyFindings) &&
    value.keyFindings.every(
      (finding) =>
        isRecord(finding) &&
        typeof finding.title === 'string' &&
        typeof finding.detail === 'string'
    ) &&
    Array.isArray(value.eligibilityCriteria) &&
    value.eligibilityCriteria.every((item) => typeof item === 'string') &&
    Array.isArray(value.deadlines) &&
    value.deadlines.every(
      (deadline) =>
        isRecord(deadline) &&
        typeof deadline.name === 'string' &&
        typeof deadline.date === 'string' &&
        typeof deadline.detail === 'string'
    ) &&
    Array.isArray(value.uncertainInformation) &&
    value.uncertainInformation.every((item) => typeof item === 'string') &&
    Array.isArray(value.sources) &&
    value.sources.every(
      (source) =>
        isRecord(source) &&
        (source.title === null || typeof source.title === 'string') &&
        typeof source.url === 'string'
    ) &&
    (value.status === 'completed' || value.status === 'partial') &&
    typeof value.executionMs === 'number' &&
    Number.isFinite(value.executionMs) &&
    typeof value.model === 'string' &&
    (value.usage === null || isRecord(value.usage))
  );
}

export async function researchWithAgent2(
  input: ResearchAgentRequest,
  signal?: AbortSignal
): Promise<ResearchAgentResult> {
  let response: Response;
  try {
    response = await fetch('/api/research/agent2', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
      signal,
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') throw error;
    throw new Error('Could not reach the research service. Confirm the backend is running and try again.');
  }

  const payload: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    const message =
      payload && typeof payload === 'object' && 'error' in payload && typeof payload.error === 'string'
        ? payload.error
        : 'Research Agent 2 failed to complete the request.';
    throw new Error(message);
  }

  if (!isResearchAgentResult(payload)) {
    throw new Error('The research service returned an invalid response.');
  }

  return payload;
}
