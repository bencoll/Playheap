import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type {
  Game,
  GameLibraryState,
  Platform,
  ColumnId,
  HltbData,
  Column,
} from '../types';
import { COLUMN_CONFIG } from '../types';
import { GameLibraryContext } from './GameLibraryContextDef';
import { useAuth } from './useAuth';
import {
  deleteGameRow,
  fetchGamesWithTags,
  insertGame,
  moveGameRpc,
  updateGameRow,
} from '../lib/db/games';
import type { GameWithPosition } from '../lib/db/mappers';
import {
  deleteTagByName,
  fetchTags,
  setGameTags,
  upsertTag,
  type TagRecord,
} from '../lib/db/tags';

interface InternalState {
  games: GameWithPosition[];
  tags: TagRecord[];
}

const EMPTY_STATE: InternalState = { games: [], tags: [] };

function buildPublicState(internal: InternalState): GameLibraryState {
  const gamesById: Record<string, Game> = {};
  for (const game of internal.games) {
    gamesById[game.id] = game;
  }

  const columns = {} as Record<ColumnId, Column>;
  for (const { id, title } of COLUMN_CONFIG) {
    columns[id] = { id, title, gameIds: [] };
  }

  const sorted = [...internal.games].sort((a, b) => a.position - b.position);
  for (const game of sorted) {
    const col = columns[game.columnId];
    if (col) col.gameIds.push(game.id);
  }

  return {
    games: gamesById,
    columns,
    tags: internal.tags.map((t) => t.name),
  };
}

function maxPositionFor(
  games: GameWithPosition[],
  columnId: ColumnId
): number {
  let max = -1;
  for (const g of games) {
    if (g.columnId === columnId && g.position > max) max = g.position;
  }
  return max;
}

function applyMove(
  games: GameWithPosition[],
  gameId: string,
  targetColumnId: ColumnId,
  targetIndex: number
): GameWithPosition[] {
  const game = games.find((g) => g.id === gameId);
  if (!game) return games;

  const sourceColumnId = game.columnId;
  const sourcePos = game.position;
  const now = Date.now();

  if (sourceColumnId === targetColumnId) {
    if (targetIndex === sourcePos) return games;

    return games.map((g) => {
      if (g.id === gameId) {
        return { ...g, position: targetIndex, updatedAt: now };
      }
      if (g.columnId !== sourceColumnId) return g;

      if (targetIndex > sourcePos) {
        if (g.position > sourcePos && g.position <= targetIndex) {
          return { ...g, position: g.position - 1 };
        }
      } else {
        if (g.position >= targetIndex && g.position < sourcePos) {
          return { ...g, position: g.position + 1 };
        }
      }
      return g;
    });
  }

  return games.map((g) => {
    if (g.id === gameId) {
      return {
        ...g,
        columnId: targetColumnId,
        position: targetIndex,
        updatedAt: now,
      };
    }
    if (g.columnId === sourceColumnId && g.position > sourcePos) {
      return { ...g, position: g.position - 1 };
    }
    if (g.columnId === targetColumnId && g.position >= targetIndex) {
      return { ...g, position: g.position + 1 };
    }
    return g;
  });
}

export function GameLibraryProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const userId = user?.id ?? null;

  const [internal, setInternal] = useState<InternalState>(EMPTY_STATE);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setInternal(EMPTY_STATE);
      setLoading(false);
      setError(null);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    (async () => {
      try {
        const [games, tags] = await Promise.all([
          fetchGamesWithTags(),
          fetchTags(),
        ]);
        if (cancelled) return;
        setInternal({ games, tags });
      } catch (e) {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : String(e));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [userId]);

  const state = useMemo(() => buildPublicState(internal), [internal]);

  const mutate = useCallback(
    async (
      apply: (prev: InternalState) => InternalState,
      remote: () => Promise<void>
    ) => {
      let snapshot: InternalState | null = null;
      setInternal((prev) => {
        snapshot = prev;
        return apply(prev);
      });
      try {
        await remote();
      } catch (e) {
        if (snapshot) setInternal(snapshot);
        const message = e instanceof Error ? e.message : String(e);
        setError(message);
        console.error('mutation failed:', e);
      }
    },
    []
  );

  const addGame = useCallback(
    (
      title: string,
      platforms: Platform[],
      hltb?: HltbData,
      tags?: string[]
    ) => {
      if (!userId) return '';
      const id = crypto.randomUUID();
      const now = Date.now();
      const baseGame: Game = {
        id,
        title,
        columnId: 'backlog',
        platforms,
        createdAt: now,
        updatedAt: now,
        ...(hltb && { hltb }),
        ...(tags && tags.length > 0 && { tags }),
      };

      let assignedPosition = 0;
      void mutate(
        (prev) => {
          assignedPosition = maxPositionFor(prev.games, 'backlog') + 1;
          const newGame: GameWithPosition = {
            ...baseGame,
            position: assignedPosition,
          };
          return { ...prev, games: [...prev.games, newGame] };
        },
        async () => {
          await insertGame(baseGame, userId, assignedPosition);
          if (tags && tags.length > 0) {
            await setGameTags(id, [], tags, userId);
          }
        }
      );

      return id;
    },
    [mutate, userId]
  );

  const updateGame = useCallback(
    (
      id: string,
      updates: Partial<
        Pick<Game, 'title' | 'platforms' | 'hltb' | 'tags' | 'notes'>
      >
    ) => {
      if (!userId) return;

      let oldTags: string[] = [];
      void mutate(
        (prev) => {
          const existing = prev.games.find((g) => g.id === id);
          if (!existing) return prev;
          oldTags = existing.tags ?? [];
          const merged: GameWithPosition = {
            ...existing,
            ...updates,
            updatedAt: Date.now(),
          };
          if (merged.tags && merged.tags.length === 0) {
            delete (merged as { tags?: string[] }).tags;
          }
          return {
            ...prev,
            games: prev.games.map((g) => (g.id === id ? merged : g)),
          };
        },
        async () => {
          const { tags: nextTags, ...rest } = updates;
          await updateGameRow(id, rest);
          if (nextTags !== undefined) {
            await setGameTags(id, oldTags, nextTags ?? [], userId);
          }
        }
      );
    },
    [mutate, userId]
  );

  const deleteGame = useCallback(
    (id: string) => {
      void mutate(
        (prev) => ({
          ...prev,
          games: prev.games.filter((g) => g.id !== id),
        }),
        async () => {
          await deleteGameRow(id);
        }
      );
    },
    [mutate]
  );

  const moveGame = useCallback(
    (gameId: string, targetColumnId: ColumnId, targetIndex: number) => {
      void mutate(
        (prev) => ({
          ...prev,
          games: applyMove(prev.games, gameId, targetColumnId, targetIndex),
        }),
        async () => {
          await moveGameRpc(gameId, targetColumnId, targetIndex);
        }
      );
    },
    [mutate]
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
      if (!userId) return;
      const trimmed = name.trim();
      if (!trimmed) return;

      void mutate(
        (prev) => {
          if (prev.tags.some((t) => t.name === trimmed)) return prev;
          return {
            ...prev,
            tags: [...prev.tags, { id: `temp-${trimmed}`, name: trimmed }],
          };
        },
        async () => {
          const created = await upsertTag(trimmed, userId);
          setInternal((prev) => ({
            ...prev,
            tags: prev.tags.map((t) => (t.name === trimmed ? created : t)),
          }));
        }
      );
    },
    [mutate, userId]
  );

  const deleteTag = useCallback(
    (name: string) => {
      void mutate(
        (prev) => ({
          ...prev,
          tags: prev.tags.filter((t) => t.name !== name),
          games: prev.games.map((g) =>
            g.tags?.includes(name)
              ? {
                  ...g,
                  tags: g.tags.filter((t) => t !== name),
                  updatedAt: Date.now(),
                }
              : g
          ),
        }),
        async () => {
          await deleteTagByName(name);
        }
      );
    },
    [mutate]
  );

  return (
    <GameLibraryContext.Provider
      value={{
        state,
        loading,
        error,
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
