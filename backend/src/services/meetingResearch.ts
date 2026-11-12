
import { tavily } from '@tavily/core';

export type MeetingResearchRequest = {
  companyOrPerson: string;
  meetingPurpose: string;
};

export type MeetingResearchSource = {
  title: string;
  url: string;
  publishedDate: string;
  content: string;
};

export type MeetingResearchResult = {
  sources: MeetingResearchSource[];
  searchQuery: string;
  searchedAt: string;
};

function getTavilyClient() {
  const apiKey = process.env.TAVILY_API_KEY?.trim();

  if (!apiKey) {
    throw new Error('TAVILY_API_KEY is missing from the backend .env file.');
  }

  return tavily({ apiKey });
}

export async function researchMeeting(
  input: MeetingResearchRequest
): Promise<MeetingResearchResult> {
  const companyOrPerson = input.companyOrPerson.trim();
  const meetingPurpose = input.meetingPurpose.trim();

  if (!companyOrPerson) {
    throw new Error('A company or person is required.');
  }

  const query = `
    ${companyOrPerson} latest news from the last 30 days:
    company announcements, product launches, hiring updates,
    business developments, partnerships, and developments related to:
    ${meetingPurpose}
  `;

  console.log(`Searching Tavily for: ${companyOrPerson}`);

  const client = getTavilyClient();

  const response = await client.search(query, {
    topic: 'news',
    timeRange: 'month',
    searchDepth: 'advanced',
    maxResults: 10,
    includeRawContent: 'markdown',
    includePublishedDate: true,
  });

  if (!response.results || response.results.length === 0) {
    throw new Error('Tavily did not return any search results.');
  }

  const relevantArticles: MeetingResearchSource[] = [];
  const seenUrls = new Set<string>();

  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - 30);

  const companyTerms = companyOrPerson
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((term) => term.length > 2);

  const usefulKeywords = [
    'news',
    'announcement',
    'launch',
    'product',
    'business',
    'revenue',
    'earnings',
    'hiring',
    'partnership',
    'technology',
    'artificial intelligence',
    'research',
    'development',
    'leadership',
    'expansion',
  ];

  for (const result of response.results) {
    const title = String(result.title || '');
    const url = String(result.url || '');
    const snippet = String(result.content || '');
    const rawContent = String(result.rawContent || '');
    const publishedDate = String(result.publishedDate || '');

    if (!url || !publishedDate) {
      continue;
    }

    const parsedDate = new Date(publishedDate);

    if (
      Number.isNaN(parsedDate.getTime()) ||
      parsedDate < cutoffDate ||
      parsedDate > new Date()
    ) {
      continue;
    }

    const normalizedUrl = url
      .split('#')[0]
      .split('?')[0]
      .replace(/\/+$/, '')
      .toLowerCase();

    if (seenUrls.has(normalizedUrl)) {
      continue;
    }

    const articleContent =
      rawContent.trim().length > snippet.trim().length
        ? rawContent
        : snippet;

    if (articleContent.trim().length < 150) {
      continue;
    }

    const searchableText = (
      title + ' ' + articleContent.slice(0, 5000)
    ).toLowerCase();

    const mentionsTarget = companyTerms.some((term) =>
      searchableText.includes(term)
    );

    if (!mentionsTarget) {
      continue;
    }

    const hasUsefulTopic = usefulKeywords.some((keyword) =>
      searchableText.includes(keyword)
    );

    if (!hasUsefulTopic) {
      continue;
    }

    seenUrls.add(normalizedUrl);

    relevantArticles.push({
      title,
      url,
      publishedDate,
      content: articleContent,
    });
  }

  console.log('Tavily search completed.');
  console.log('Relevant articles:', relevantArticles.length);

  return {
    sources: relevantArticles,
    searchQuery: query.trim(),
    searchedAt: new Date().toISOString(),
  };
}
