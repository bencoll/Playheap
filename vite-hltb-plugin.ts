import type { Plugin } from 'vite';

const HLTB_BASE_URL = 'https://howlongtobeat.com';
const HLTB_SEARCH_URL = `${HLTB_BASE_URL}/api/search`;
const HLTB_INIT_URL = `${HLTB_BASE_URL}/api/search/init`;
const HLTB_REFERER = `${HLTB_BASE_URL}/`;

interface HltbSearchResult {
  id: string;
  name: string;
  imageUrl: string;
  gameplayMain: number;
  gameplayMainExtra: number;
  gameplayCompletionist: number;
}

const headers = {
  'User-Agent':
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  Accept: '*/*',
  Referer: HLTB_REFERER,
};

async function getAuthToken(): Promise<string> {
  const response = await fetch(`${HLTB_INIT_URL}?t=${Date.now()}`, {
    headers,
  });

  if (!response.ok) {
    throw new Error(`Failed to get auth token: ${response.status}`);
  }

  const data = (await response.json()) as { token?: string };
  if (!data.token) {
    throw new Error('No token in init response');
  }

  return data.token;
}

async function searchHltb(query: string): Promise<HltbSearchResult[]> {
  const token = await getAuthToken();

  const payload = {
    searchType: 'games',
    searchTerms: query.split(' '),
    searchPage: 1,
    size: 20,
    searchOptions: {
      games: {
        userId: 0,
        platform: '',
        sortCategory: 'popular',
        rangeCategory: 'main',
        rangeTime: { min: 0, max: 0 },
        gameplay: { perspective: '', flow: '', genre: '', difficulty: '' },
        rangeYear: { min: '', max: '' },
        modifier: '',
      },
      users: { sortCategory: 'postcount' },
      lists: { sortCategory: 'follows' },
      filter: '',
      sort: 0,
      randomizer: 0,
    },
    useCache: true,
  };

  const response = await fetch(HLTB_SEARCH_URL, {
    method: 'POST',
    headers: {
      ...headers,
      'Content-Type': 'application/json',
      'x-auth-token': token,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`HLTB search failed with status ${response.status}`);
  }

  const data = (await response.json()) as { data?: Record<string, unknown>[] };
  const games = data.data || [];

  return games.map((game: Record<string, unknown>) => ({
    id: String(game.game_id),
    name: String(game.game_name || ''),
    imageUrl: game.game_image
      ? `${HLTB_BASE_URL}/games/${game.game_image}`
      : '',
    gameplayMain: Number(game.comp_main) || 0,
    gameplayMainExtra: Number(game.comp_plus) || 0,
    gameplayCompletionist: Number(game.comp_100) || 0,
  }));
}

export function hltbPlugin(): Plugin {
  return {
    name: 'hltb-proxy',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith('/api/hltb/search')) {
          return next();
        }

        const url = new URL(req.url, 'http://localhost');
        const query = url.searchParams.get('q');

        if (!query) {
          res.statusCode = 400;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: 'Missing query parameter' }));
          return;
        }

        try {
          const results = await searchHltb(query);
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify(results));
        } catch (error) {
          console.error('HLTB search error:', error);
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: 'Failed to search HLTB' }));
        }
      });
    },
  };
}
