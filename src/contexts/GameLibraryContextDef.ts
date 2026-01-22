import { createContext } from 'react';
import type {
  Game,
  GameLibraryState,
  Platform,
  ColumnId,
  HltbData,
} from '../types';

export interface GameLibraryContextValue {
  state: GameLibraryState;
  addGame: (title: string, platforms: Platform[], hltb?: HltbData) => string;
  updateGame: (
    id: string,
    updates: Partial<Pick<Game, 'title' | 'platforms' | 'hltb'>>
  ) => void;
  deleteGame: (id: string) => void;
  moveGame: (
    gameId: string,
    targetColumnId: ColumnId,
    targetIndex: number
  ) => void;
  getGamesForColumn: (columnId: ColumnId) => Game[];
}

export const GameLibraryContext = createContext<GameLibraryContextValue | null>(
  null
);
