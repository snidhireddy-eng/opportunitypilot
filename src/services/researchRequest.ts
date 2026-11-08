import type { ResearchAgentRequest } from '../types/agent2.js';

export function validateResearchAgentRequest(value: unknown): value is ResearchAgentRequest {
  if (!value || typeof value !== 'object') return false;
  const request = value as Record<string, unknown>;
  return (
    typeof request.researchQuestion === 'string' &&
    request.researchQuestion.trim().length > 0 &&
    request.researchQuestion.length <= 2000 &&
    typeof request.opportunityCategory === 'string' &&
    request.opportunityCategory.trim().length > 0 &&
    request.opportunityCategory.length <= 120 &&
    typeof request.targetAudience === 'string' &&
    request.targetAudience.trim().length > 0 &&
    request.targetAudience.length <= 300 &&
    (request.additionalRequirements === undefined ||
      (typeof request.additionalRequirements === 'string' &&
        request.additionalRequirements.length <= 3000))
  );
}
