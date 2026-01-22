import { useState } from 'react';
import type {
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
} from '@dnd-kit/core';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
} from '@dnd-kit/core';
import type { Game, ColumnId } from '../../types';
import { COLUMN_CONFIG } from '../../types';
import { useGameLibrary } from '../../contexts/GameLibraryContext';
import { Column } from '../Column';
import { GameCard } from '../GameCard';
import styles from './Board.module.css';

interface BoardProps {
  onEditGame: (game: Game) => void;
  onDeleteGame: (id: string) => void;
}

export function Board({ onEditGame, onDeleteGame }: BoardProps) {
  const { state, moveGame, getGamesForColumn } = useGameLibrary();
  const [activeGame, setActiveGame] = useState<Game | null>(null);
  const [overColumnId, setOverColumnId] = useState<ColumnId | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const game = state.games[active.id as string];
    if (game) {
      setActiveGame(game);
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over || !activeGame) return;

    // Ignore if we're over ourselves
    if (over.id === active.id) return;

    // Determine which column we're over and at what index
    let targetColumnId: ColumnId | null = null;
    let targetIndex: number | null = null;

    // Check if over a column directly
    if (COLUMN_CONFIG.some((col) => col.id === over.id)) {
      targetColumnId = over.id as ColumnId;
      targetIndex = getGamesForColumn(targetColumnId).length; // End of column
    } else {
      // Over a game card - find its column and position
      const overGame = state.games[over.id as string];
      if (overGame) {
        targetColumnId = overGame.columnId;
        const columnGames = getGamesForColumn(targetColumnId);
        targetIndex = columnGames.findIndex((g) => g.id === over.id);
        if (targetIndex === -1) {
          targetIndex = columnGames.length;
        }
      }
    }

    // Update state if we're in a different column than the source
    // Only update if values actually changed to prevent infinite loops
    if (targetColumnId && targetColumnId !== activeGame.columnId) {
      if (targetColumnId !== overColumnId || targetIndex !== overIndex) {
        setOverColumnId(targetColumnId);
        setOverIndex(targetIndex);
      }
    } else if (overColumnId !== null) {
      setOverColumnId(null);
      setOverIndex(null);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    // Capture the current over state before clearing it
    const finalOverColumnId = overColumnId;
    const finalOverIndex = overIndex;

    setActiveGame(null);
    setOverColumnId(null);
    setOverIndex(null);

    if (!over) return;

    const gameId = active.id as string;
    const game = state.games[gameId];
    if (!game) return;

    // Determine target column
    let targetColumnId: ColumnId;
    let targetIndex: number;

    // If we were dragging to a different column, use the tracked state
    if (finalOverColumnId && finalOverIndex !== null) {
      targetColumnId = finalOverColumnId;
      targetIndex = finalOverIndex;
    } else if (COLUMN_CONFIG.some((col) => col.id === over.id)) {
      // Dropped over a column directly
      targetColumnId = over.id as ColumnId;
      targetIndex = getGamesForColumn(targetColumnId).length;
    } else {
      // Dropped over another game in the same column
      const overGame = state.games[over.id as string];
      if (!overGame) return;

      targetColumnId = overGame.columnId;
      const columnGames = getGamesForColumn(targetColumnId);
      targetIndex = columnGames.findIndex((g) => g.id === over.id);

      if (targetIndex === -1) {
        targetIndex = columnGames.length;
      }
    }

    // Only move if position changed
    if (
      game.columnId !== targetColumnId ||
      getGamesForColumn(game.columnId).findIndex((g) => g.id === gameId) !==
        targetIndex
    ) {
      moveGame(gameId, targetColumnId, targetIndex);
    }
  };

  // Build games arrays with drag preview logic
  const getGamesWithDragPreview = (columnId: ColumnId): Game[] => {
    const games = getGamesForColumn(columnId);

    if (!activeGame || !overColumnId) {
      return games;
    }

    // If this is the source column, remove the dragged game
    if (columnId === activeGame.columnId) {
      return games.filter((g) => g.id !== activeGame.id);
    }

    // If this is the target column, insert the dragged game at the appropriate position
    if (columnId === overColumnId) {
      const insertIndex = overIndex ?? games.length;
      const result = [...games];
      result.splice(insertIndex, 0, activeGame);
      return result;
    }

    return games;
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className={styles.board}>
        {COLUMN_CONFIG.map((columnConfig) => {
          const column = state.columns[columnConfig.id];
          const games = getGamesWithDragPreview(columnConfig.id);
          return (
            <Column
              key={column.id}
              column={column}
              games={games}
              onEditGame={onEditGame}
              onDeleteGame={onDeleteGame}
            />
          );
        })}
      </div>
      <DragOverlay>
        {activeGame ? (
          <GameCard
            game={activeGame}
            onEdit={() => {}}
            onDelete={() => {}}
            isDragging
          />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
