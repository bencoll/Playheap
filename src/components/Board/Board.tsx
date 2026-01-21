import { useState } from 'react';
import type { DragEndEvent, DragOverEvent, DragStartEvent } from '@dnd-kit/core';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from '@dnd-kit/core';
import type { Game, ColumnId } from '../../types';
import { COLUMN_CONFIG } from '../../types';
import { useGameLibrary } from '../../hooks/useGameLibrary';
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

  const handleDragOver = (_event: DragOverEvent) => {
    // Visual feedback handled by Column component
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveGame(null);

    if (!over) return;

    const gameId = active.id as string;
    const game = state.games[gameId];
    if (!game) return;

    // Determine target column
    let targetColumnId: ColumnId;
    let targetIndex: number;

    // Check if dropped over a column
    if (COLUMN_CONFIG.some((col) => col.id === over.id)) {
      targetColumnId = over.id as ColumnId;
      targetIndex = getGamesForColumn(targetColumnId).length;
    } else {
      // Dropped over another game
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
    if (game.columnId !== targetColumnId ||
        getGamesForColumn(game.columnId).findIndex((g) => g.id === gameId) !== targetIndex) {
      moveGame(gameId, targetColumnId, targetIndex);
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className={styles.board}>
        {COLUMN_CONFIG.map((columnConfig) => {
          const column = state.columns[columnConfig.id];
          const games = getGamesForColumn(columnConfig.id);
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
