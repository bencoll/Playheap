export type ColumnId = 'backlog' | 'up-next' | 'playing' | 'rotation' | 'done';

export type Platform = string;

export interface PlatformConfig {
  id: string;
  name: string;
  color: string;
  textColor: string;
}

export type { HltbSearchResult } from '../../lib/hltb-api';

export interface HltbData {
  hltbId: string;
  imageUrl: string;
  gameplayMain?: number;
  gameplayMainExtra?: number;
  gameplayCompletionist?: number;
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
  notes?: string;
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

export const DEFAULT_PLATFORM: PlatformConfig = {
  id: 'default',
  name: 'Unknown',
  color: '#E5E7EB',
  textColor: '#374151',
};

export const PLATFORMS: PlatformConfig[] = [
  { id: 'switch', name: 'Switch', color: '#FFE5E5', textColor: '#E60012' },
  {
    id: 'steam-deck',
    name: 'Steam Deck',
    color: '#E8E5F0',
    textColor: '#1A1A2E',
  },
  { id: 'steam', name: 'Steam', color: '#E5EEF5', textColor: '#1B2838' },
  { id: 'vr', name: 'VR', color: '#E5F5E8', textColor: '#16a34a' },
];

export const PLATFORM_MAP: Record<string, PlatformConfig> = Object.fromEntries(
  [...PLATFORMS, DEFAULT_PLATFORM].map((p) => [p.id, p])
);

export const COLUMN_CONFIG: { id: ColumnId; title: string }[] = [
  { id: 'backlog', title: 'Backlog' },
  { id: 'up-next', title: 'Up Next' },
  { id: 'playing', title: 'Playing' },
  { id: 'rotation', title: 'On Rotation' },
  { id: 'done', title: 'Done' },
];

export const DEFAULT_STATE: GameLibraryState = {
  games: {},
  columns: {
    backlog: { id: 'backlog', title: 'Backlog', gameIds: [] },
    'up-next': { id: 'up-next', title: 'Up Next', gameIds: [] },
    playing: { id: 'playing', title: 'Playing', gameIds: [] },
    rotation: { id: 'rotation', title: 'On Rotation', gameIds: [] },
    done: { id: 'done', title: 'Done', gameIds: [] },
  },
  tags: [],
};
