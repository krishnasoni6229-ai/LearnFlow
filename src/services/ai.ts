import { CourseItem } from '../types/course';
import { storage } from '../utils/storage';

const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';
const MODEL = 'gpt-4o-mini';
const REQUEST_TIMEOUT_MS = 15000;

const SEARCH_CACHE_PREFIX = 'lf_ai_search_';
const RECS_CACHE_PREFIX = 'lf_ai_recs_';

// In-memory caches for ultra-fast session navigation
const searchCacheInMemory = new Map<string, number[]>();
const recsCacheInMemory = new Map<string, CourseItem[]>();

function getApiKey(): string | null {
  const key = process.env.EXPO_PUBLIC_OPENAI_API_KEY;
  return key && key.length > 10 ? key : null;
}

/**
 * Wraps a promise with a timeout so AI calls never hang indefinitely.
 */
function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  const timeout = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error(`Request timed out after ${ms}ms`)), ms)
  );
  return Promise.race([promise, timeout]);
}

/**
 * Makes a direct fetch call to the OpenAI Chat Completions endpoint.
 * Using fetch() directly avoids the React Native environment issues
 * caused by the openai SDK's internal XMLHttpRequest/fetch polyfill detection.
 */
async function chatCompletion(
  systemPrompt: string,
  userPrompt: string,
  temperature = 0.1,
  jsonMode = false
): Promise<string> {
  const apiKey = getApiKey();
  if (!apiKey) throw new Error('OpenAI API key not configured.');

  const response = await withTimeout(
    fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: MODEL,
        temperature,
        max_tokens: 150,
        response_format: jsonMode ? { type: 'json_object' } : undefined,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
      }),
    }),
    REQUEST_TIMEOUT_MS
  );

  if (!response.ok) {
    const body = await response.text().catch(() => '');
    throw new Error(`OpenAI API error ${response.status}: ${body}`);
  }

  const json = await response.json();
  const content: string = json?.choices?.[0]?.message?.content ?? '[]';
  return content.trim();
}

/**
 * Safely parses a JSON array or object-wrapped JSON array from the model's response.
 * Strips any markdown code fences the model may have added.
 */
function parseJsonResponse<T>(raw: string, keyName: string): T[] {
  try {
    const clean = raw.replace(/```json/gi, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(clean);
    if (Array.isArray(parsed)) return parsed;
    if (parsed && typeof parsed === 'object' && Array.isArray(parsed[keyName])) {
      return parsed[keyName];
    }
    return [];
  } catch {
    return [];
  }
}

export const aiService = {
  /**
   * Semantically searches courses based on the user's query via OpenAI.
   * Falls back to local keyword search if AI is unavailable or fails.
   */
  async semanticSearch(query: string, courses: CourseItem[]): Promise<number[]> {
    const q = query.toLowerCase().trim();
    if (!q) return [];

    const apiKey = getApiKey();
    if (!apiKey) {
      console.warn('OpenAI API Key is missing. Using local fallback search.');
      return this.fallbackSearch(query, courses);
    }

    // 1. Check in-memory cache for instantaneous lookup
    if (searchCacheInMemory.has(q)) {
      return searchCacheInMemory.get(q)!;
    }

    // 2. Check AsyncStorage persistent cache to survive app restarts
    const cacheKey = `${SEARCH_CACHE_PREFIX}${q}`;
    try {
      const cached = await storage.getData(cacheKey);
      if (Array.isArray(cached)) {
        searchCacheInMemory.set(q, cached);
        return cached;
      }
    } catch (e) {
      console.warn('Error reading semantic search cache from storage:', e);
    }

    try {
      // Lightweight catalog to minimise token usage
      const courseCatalog = courses.map((c) => ({
        id: c.id,
        title: c.title,
        category: c.category,
        description: c.description.substring(0, 120),
      }));

      const systemPrompt = `You are an AI-powered semantic search engine for an e-learning platform.
Analyze the user's query and the course catalog. Return a JSON object with a single key "matchingIds" containing an array of course IDs that are semantically relevant to the query.
Example output format: {"matchingIds": [1, 5, 12]}
Ensure that ONLY valid JSON is returned. If no courses are relevant, return {"matchingIds": []}.`;

      const userPrompt = `Query: "${query}"\nCourses: ${JSON.stringify(courseCatalog)}`;

      const raw = await chatCompletion(systemPrompt, userPrompt, 0.1, true);
      const ids = parseJsonResponse<number>(raw, 'matchingIds');

      // 3. Update both caches
      searchCacheInMemory.set(q, ids);
      storage.setData(cacheKey, ids).catch((err) =>
        console.warn('Error saving semantic search cache to storage:', err)
      );

      return ids;
    } catch (error) {
      console.warn('AI Semantic Search failed, using fallback:', error);
      return this.fallbackSearch(query, courses);
    }
  },

  /**
   * Generates personalised course recommendations based on the user's history.
   * Returns an empty array (silently) if AI is unavailable.
   */
  async getRecommendations(
    userHistoryIds: number[],
    allCourses: CourseItem[],
    limit = 3
  ): Promise<CourseItem[]> {
    const apiKey = getApiKey();
    if (!apiKey || userHistoryIds.length === 0) return [];

    const historyKey = [...new Set(userHistoryIds)].sort().join(',');
    if (!historyKey) return [];

    // 1. Check in-memory cache for instantaneous lookup
    if (recsCacheInMemory.has(historyKey)) {
      return recsCacheInMemory.get(historyKey)!;
    }

    // 2. Check AsyncStorage persistent cache to survive app restarts
    const cacheKey = `${RECS_CACHE_PREFIX}${historyKey}`;
    try {
      const cached = await storage.getData(cacheKey);
      if (Array.isArray(cached)) {
        // Hydrate from full courses list to ensure complete data objects
        const hydrated = allCourses.filter((c) => cached.includes(c.id)).slice(0, limit);
        recsCacheInMemory.set(historyKey, hydrated);
        return hydrated;
      }
    } catch (e) {
      console.warn('Error reading recommendations cache from storage:', e);
    }

    try {
      const historyCourses = allCourses.filter((c) => userHistoryIds.includes(c.id));
      const availableCourses = allCourses.filter((c) => !userHistoryIds.includes(c.id));

      if (availableCourses.length === 0) return [];

      const historyCatalog = historyCourses.map((c) => ({
        title: c.title,
        category: c.category,
      }));
      const availableCatalog = availableCourses.map((c) => ({
        id: c.id,
        title: c.title,
        category: c.category,
      }));

      const systemPrompt = `You are a personalized e-learning recommendation engine.
Given the courses the user has bookmarked or enrolled in, recommend exactly ${limit} courses from the available list.
Return a JSON object with a single key "recommendedIds" containing an array of recommended course IDs.
Example output format: {"recommendedIds": [3, 7, 9]}
Ensure that ONLY valid JSON is returned.`;

      const userPrompt = `User likes: ${JSON.stringify(historyCatalog)}\nAvailable: ${JSON.stringify(availableCatalog)}`;

      const raw = await chatCompletion(systemPrompt, userPrompt, 0.3, true);
      const recommendedIds = parseJsonResponse<number>(raw, 'recommendedIds');

      const recommendedCourses = allCourses
        .filter((c) => recommendedIds.includes(c.id))
        .slice(0, limit);

      // 3. Save recommendations to caches (IDs for storage, Full items for in-memory)
      recsCacheInMemory.set(historyKey, recommendedCourses);
      const recommendedIdsList = recommendedCourses.map((c) => c.id);
      storage.setData(cacheKey, recommendedIdsList).catch((err) =>
        console.warn('Error saving recommendations cache to storage:', err)
      );

      return recommendedCourses;
    } catch (error) {
      console.warn('AI Recommendations failed:', error);
      return [];
    }
  },

  /**
   * Local keyword fallback — used when OpenAI is unavailable or fails.
   */
  fallbackSearch(query: string, courses: CourseItem[]): number[] {
    const q = query.toLowerCase().trim();
    if (!q) return courses.map((c) => c.id);
    return courses
      .filter(
        (c) =>
          c.title.toLowerCase().includes(q) ||
          c.category.toLowerCase().includes(q) ||
          c.description.toLowerCase().includes(q)
      )
      .map((c) => c.id);
  },
};
