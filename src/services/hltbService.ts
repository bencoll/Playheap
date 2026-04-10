import type { HltbSearchResult } from '../types';

function getSearchUrl(query: string): string {
  const encodedQuery = encodeURIComponent(query);

  if (import.meta.env.DEV) {
    return `/api/hltb/search?q=${encodedQuery}`;
  }

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  return `${supabaseUrl}/functions/v1/hltb-search?q=${encodedQuery}`;
}

export async function searchGames(query: string): Promise<HltbSearchResult[]> {
  const response = await fetch(getSearchUrl(query));

  if (!response.ok) {
    throw new Error('Failed to search HLTB');
  }

  return response.json();
}
