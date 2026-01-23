import { useCallback, useMemo, type ReactNode } from 'react';
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

// Migration: add rotation column if missing (for existing localStorage data)
function migrateState(state: GameLibraryState): GameLibraryState {
  if (!state.columns.rotation) {
    return {
      ...state,
      columns: {
        ...state.columns,
        rotation: { id: 'rotation', title: 'On Rotation', gameIds: [] },
      },
    };
  }
  return state;
}

export function GameLibraryProvider({ children }: { children: ReactNode }) {
  const [rawState, setRawState] = useLocalStorage<GameLibraryState>(
    STORAGE_KEY,
    DEFAULT_STATE
  );

  // Apply migrations synchronously
  const state = useMemo(() => migrateState(rawState), [rawState]);

  // Persist migrated state if it changed
  const setState = useCallback(
    (updater: GameLibraryState | ((prev: GameLibraryState) => GameLibraryState)) => {
      setRawState((prev) => {
        const migrated = migrateState(prev);
        const next = typeof updater === 'function' ? updater(migrated) : updater;
        return next;
      });
    },
    [setRawState]
  );

  const addGame = useCallback(
    (
      title: string,
      platforms: Platform[],
      hltb?: HltbData,
      tags?: string[]
    ) => {
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
        ...(tags && tags.length > 0 && { tags }),
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
      updates: Partial<
        Pick<Game, 'title' | 'platforms' | 'hltb' | 'tags' | 'notes'>
      >
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

  const addTag = useCallback(
    (name: string) => {
      const trimmedName = name.trim();
      if (!trimmedName) return;

      setState((prev) => {
        // Ensure tags array exists and check for duplicates
        const existingTags = prev.tags || [];
        if (existingTags.includes(trimmedName)) return prev;

        return {
          ...prev,
          tags: [...existingTags, trimmedName],
        };
      });
    },
    [setState]
  );

  const deleteTag = useCallback(
    (name: string) => {
      setState((prev) => {
        const existingTags = prev.tags || [];
        if (!existingTags.includes(name)) return prev;

        // Remove tag from global list
        const newTags = existingTags.filter((t) => t !== name);

        // Remove tag from all games that have it
        const updatedGames: Record<string, Game> = {};
        for (const [id, game] of Object.entries(prev.games)) {
          if (game.tags?.includes(name)) {
            updatedGames[id] = {
              ...game,
              tags: game.tags.filter((t) => t !== name),
              updatedAt: Date.now(),
            };
          } else {
            updatedGames[id] = game;
          }
        }

        return {
          ...prev,
          tags: newTags,
          games: updatedGames,
        };
      });
    },
    [setState]
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
        addTag,
        deleteTag,
      }}
    >
      {children}
    </GameLibraryContext.Provider>
  );
}
