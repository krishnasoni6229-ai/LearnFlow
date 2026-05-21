import { useEffect, useRef, useState } from 'react';
import { CourseItem } from '../types/course';
import { aiService } from '../services/ai';

/**
 * Manages AI-powered semantic search and personalised recommendations
 * for the Discover screen.
 *
 * Key design decisions:
 * - Debounce search input (600ms) before firing any AI call.
 * - Guard `isSearchingAI` with a `.catch()` so it always resets even on error.
 * - Stabilise the `historyKey` for recommendations using a string join so
 *   the recommendations effect only re-runs when IDs actually change,
 *   not on every parent render.
 * - Use a `cancelled` flag (cleanup) to drop stale async results.
 */
export function useDiscoverAI(
  search: string,
  courses: CourseItem[],
  bookmarkIds: number[],
  enrolledIds: number[]
) {
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [isSearchingAI, setIsSearchingAI] = useState(false);
  const [aiMatchingIds, setAiMatchingIds] = useState<number[] | null>(null);
  const [aiRecommendations, setAiRecommendations] = useState<CourseItem[]>([]);

  // Track whether courses have been loaded at least once
  const coursesLoadedRef = useRef(false);
  if (courses.length > 0) coursesLoadedRef.current = true;

  // ── 1. Debounce search input ─────────────────────────────────────────────
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 600);
    return () => clearTimeout(t);
  }, [search]);

  // ── 2. Semantic & Local search (runs after debounce settles) ──────────────
  useEffect(() => {
    const query = debouncedSearch.trim();
    if (!query) {
      setAiMatchingIds(null);
      setIsSearchingAI(false);
      return;
    }
    if (!courses.length) return; // wait until courses load

    let cancelled = false;

    // 1. Immediately apply fast local fallback search so results update instantly (0ms)
    const localIds = aiService.fallbackSearch(query, courses);
    setAiMatchingIds(localIds);

    // 2. Guard: if query is very short (< 3 characters), skip expensive background AI search
    if (query.length < 3) {
      setIsSearchingAI(false);
      return;
    }

    // 3. Perform background AI semantic search and merge results smoothly
    setIsSearchingAI(true);

    aiService
      .semanticSearch(query, courses)
      .then((aiIds) => {
        if (!cancelled) {
          // Merge local and AI results, maintaining unique course IDs in order
          const combinedIds = Array.from(new Set([...localIds, ...aiIds]));
          setAiMatchingIds(combinedIds);
        }
      })
      .catch((err) => {
        // Log but never crash the UI, keeping existing local search results intact
        console.warn('useDiscoverAI — semantic search error:', err);
      })
      .finally(() => {
        if (!cancelled) setIsSearchingAI(false);
      });

    return () => {
      cancelled = true;
    };
  }, [debouncedSearch, courses]);

  // ── 3. Personalised recommendations ─────────────────────────────────────
  // Stabilise the history key so the effect only fires when IDs truly change,
  // not on every render due to array reference changes.
  const historyKey = [...new Set([...bookmarkIds, ...enrolledIds])]
    .sort()
    .join(',');

  useEffect(() => {
    if (!coursesLoadedRef.current || !historyKey) return;

    let cancelled = false;
    const historyIds = historyKey.split(',').map(Number).filter(Boolean);

    aiService
      .getRecommendations(historyIds, courses, 3)
      .then((recs) => {
        if (!cancelled) setAiRecommendations(recs);
      })
      .catch((err) => {
        console.warn('useDiscoverAI — recommendations error:', err);
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [historyKey, courses.length]); // courses.length — re-run only when the list size changes

  return { debouncedSearch, isSearchingAI, aiMatchingIds, aiRecommendations };
}
