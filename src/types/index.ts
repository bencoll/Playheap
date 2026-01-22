export type ColumnId = 'backlog' | 'up-next' | 'playing' | 'finished';

export type Platform = 'switch' | 'steam-deck' | 'steam';

export interface PlatformConfig {
  id: Platform;
  name: string;
  color: string;
  textColor: string;
}

export interface HltbData {
  hltbId: string;
  imageUrl: string;
  gameplayMain?: number;
  gameplayMainExtra?: number;
  gameplayCompletionist?: number;
}

export interface HltbSearchResult {
  id: string;
  name: string;
  imageUrl: string;
  gameplayMain: number;
  gameplayMainExtra: number;
  gameplayCompletionist: number;
}

export interface Game {
  id: string;
  title: string;
  columnId: ColumnId;
  platforms: Platform[];
  createdAt: number;
  updatedAt: number;
  hltb?: HltbData;
  tags?: string[];
}

export interface Column {
  id: ColumnId;
  title: string;
  gameIds: string[];
}

export interface GameLibraryState {
  games: Record<string, Game>;
  columns: Record<ColumnId, Column>;
  tags: string[];
}

export const PLATFORMS: PlatformConfig[] = [
  { id: 'switch', name: 'Switch', color: '#FFE5E5', textColor: '#E60012' },
  {
    id: 'steam-deck',
    name: 'Steam Deck',
    color: '#E8E5F0',
    textColor: '#1A1A2E',
  },
  { id: 'steam', name: 'Steam', color: '#E5EEF5', textColor: '#1B2838' },
];

export const COLUMN_CONFIG: { id: ColumnId; title: string }[] = [
  { id: 'backlog', title: 'Backlog' },
  { id: 'up-next', title: 'Up Next' },
  { id: 'playing', title: 'Playing' },
  { id: 'finished', title: 'Finished' },
];

export const DEFAULT_STATE: GameLibraryState = {
  games: {},
  columns: {
    backlog: { id: 'backlog', title: 'Backlog', gameIds: [] },
    'up-next': { id: 'up-next', title: 'Up Next', gameIds: [] },
    playing: { id: 'playing', title: 'Playing', gameIds: [] },
    finished: { id: 'finished', title: 'Finished', gameIds: [] },
  },
  tags: [],
};
