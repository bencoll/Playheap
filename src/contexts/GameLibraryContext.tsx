import { useCallback, type ReactNode } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import type {
  Game,
  GameLibraryState,
  Platform,
  ColumnId,
  HltbData,
} from '../types';
import { DEFAULT_STATE } from '../types';
import { GameLibraryContext } from './GameLibraryContextDef';

const STORAGE_KEY = 'game-library';

export function GameLibraryProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useLocalStorage<GameLibraryState>(
    STORAGE_KEY,
    DEFAULT_STATE
  );

  const addGame = useCallback(
    (title: string, platforms: Platform[], hltb?: HltbData) => {
      const id = crypto.randomUUID();
      const now = Date.now();
      const newGame: Game = {
        id,
        title,
        columnId: 'backlog',
        platforms,
        createdAt: now,
        updatedAt: now,
        ...(hltb && { hltb }),
      };

      setState((prev) => ({
        ...prev,
        games: { ...prev.games, [id]: newGame },
        columns: {
          ...prev.columns,
          backlog: {
            ...prev.columns.backlog,
            gameIds: [...prev.columns.backlog.gameIds, id],
          },
        },
      }));

      return id;
    },
    [setState]
  );

  const updateGame = useCallback(
    (
      id: string,
      updates: Partial<Pick<Game, 'title' | 'platforms' | 'hltb'>>
    ) => {
      setState((prev) => {
        const game = prev.games[id];
        if (!game) return prev;

        return {
          ...prev,
          games: {
            ...prev.games,
            [id]: {
              ...game,
              ...updates,
              updatedAt: Date.now(),
            },
          },
        };
      });
    },
    [setState]
  );

  const deleteGame = useCallback(
    (id: string) => {
      setState((prev) => {
        const game = prev.games[id];
        if (!game) return prev;

        const { [id]: _, ...remainingGames } = prev.games;
        const column = prev.columns[game.columnId];

        return {
          ...prev,
          games: remainingGames,
          columns: {
            ...prev.columns,
            [game.columnId]: {
              ...column,
              gameIds: column.gameIds.filter((gid) => gid !== id),
            },
          },
        };
      });
    },
    [setState]
  );

  const moveGame = useCallback(
    (gameId: string, targetColumnId: ColumnId, targetIndex: number) => {
      setState((prev) => {
        const game = prev.games[gameId];
        if (!game) return prev;

        const sourceColumnId = game.columnId;
        const sourceColumn = prev.columns[sourceColumnId];
        const targetColumn = prev.columns[targetColumnId];

        const newSourceGameIds = sourceColumn.gameIds.filter(
          (id) => id !== gameId
        );

        let newTargetGameIds: string[];
        if (sourceColumnId === targetColumnId) {
          newTargetGameIds = [...newSourceGameIds];
          newTargetGameIds.splice(targetIndex, 0, gameId);
        } else {
          newTargetGameIds = [...targetColumn.gameIds];
          newTargetGameIds.splice(targetIndex, 0, gameId);
        }

        return {
          ...prev,
          games: {
            ...prev.games,
            [gameId]: {
              ...game,
              columnId: targetColumnId,
              updatedAt: Date.now(),
            },
          },
          columns: {
            ...prev.columns,
            [sourceColumnId]: {
              ...sourceColumn,
              gameIds:
                sourceColumnId === targetColumnId
                  ? newTargetGameIds
                  : newSourceGameIds,
            },
            ...(sourceColumnId !== targetColumnId && {
              [targetColumnId]: {
                ...targetColumn,
                gameIds: newTargetGameIds,
              },
            }),
          },
        };
      });
    },
    [setState]
  );

  const getGamesForColumn = useCallback(
    (columnId: ColumnId): Game[] => {
      const column = state.columns[columnId];
      return column.gameIds.map((id) => state.games[id]).filter(Boolean);
    },
    [state]
  );

  return (
    <GameLibraryContext.Provider
      value={{
        state,
        addGame,
        updateGame,
        deleteGame,
        moveGame,
        getGamesForColumn,
      }}
    >
      {children}
    </GameLibraryContext.Provider>
  );
}
