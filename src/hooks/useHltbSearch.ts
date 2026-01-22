import { useState, useCallback, useRef, useEffect } from 'react';
import type { HltbSearchResult } from '../types';
import { searchGames } from '../services/hltbService';

const DEBOUNCE_MS = 300;

export function useHltbSearch() {
  const [results, setResults] = useState<HltbSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const clearResults = useCallback(() => {
    setResults([]);
    setError(null);
  }, []);

  const search = useCallback((query: string) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    if (!query.trim()) {
      clearResults();
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    timeoutRef.current = setTimeout(async () => {
      abortControllerRef.current = new AbortController();

      try {
        const searchResults = await searchGames(query);
        setResults(searchResults);
      } catch (err) {
        if (err instanceof Error && err.name !== 'AbortError') {
          setError('Failed to search games');
        }
      } finally {
        setIsLoading(false);
      }
    }, DEBOUNCE_MS);
  }, [clearResults]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    results,
    isLoading,
    error,
    search,
    clearResults,
  };
}
