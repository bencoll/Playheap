const HLTB_BASE_URL = 'https://howlongtobeat.com';
const HLTB_API_URL = `${HLTB_BASE_URL}/api/bleed`;
const HLTB_INIT_URL = `${HLTB_API_URL}/init`;
const HLTB_REFERER = `${HLTB_BASE_URL}/`;

const hltbHeaders: Record<string, string> = {
  'User-Agent':
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  Accept: '*/*',
  Referer: HLTB_REFERER,
};

export interface HltbSearchResult {
  id: string;
  name: string;
  imageUrl: string;
  gameplayMain: number;
  gameplayMainExtra: number;
  gameplayCompletionist: number;
}

interface HltbAuthData {
  token: string;
  hpKey: string;
  hpVal: string;
}

async function getAuthData(): Promise<HltbAuthData> {
  const response = await fetch(`${HLTB_INIT_URL}?t=${Date.now()}`, {
    headers: hltbHeaders,
  });

  if (!response.ok) {
    throw new Error(`Failed to get auth data: ${response.status}`);
  }

  const data = (await response.json()) as Record<string, unknown>;
  if (!data.token) {
    throw new Error('No token in init response');
  }
  if (!data.hpKey) {
    throw new Error('No hpKey in init response');
  }
  if (!data.hpVal) {
    throw new Error('No hpVal in init response');
  }

  const { token, hpKey, hpVal } = data;

  return { token: String(token), hpKey: String(hpKey), hpVal: String(hpVal) };
}

export async function searchHltb(query: string): Promise<HltbSearchResult[]> {
  const { token, hpKey, hpVal } = await getAuthData();

  const payload: Record<string, unknown> = {
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
        rangeTime: { min: null, max: null },
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

  if (hpKey) {
    payload[hpKey] = hpVal;
  }

  const response = await fetch(HLTB_API_URL, {
    method: 'POST',
    headers: {
      ...hltbHeaders,
      'Content-Type': 'application/json',
      Origin: HLTB_BASE_URL,
      'x-auth-token': token,
      'x-hp-key': hpKey,
      'x-hp-val': hpVal,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`HLTB search failed with status ${response.status}`);
  }

  const data = (await response.json()) as {
    data?: Record<string, unknown>[];
  };
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
