import type { HltbSearchResult } from '../types';

export async function searchGames(query: string): Promise<HltbSearchResult[]> {
  const response = await fetch(`/api/hltb/search?q=${encodeURIComponent(query)}`);

  if (!response.ok) {
    throw new Error('Failed to search HLTB');
  }

  return response.json();
}
