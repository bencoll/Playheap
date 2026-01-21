import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import type { Column as ColumnType, Game } from '../../types';
import { GameCard } from '../GameCard';
import styles from './Column.module.css';

interface ColumnProps {
  column: ColumnType;
  games: Game[];
  onEditGame: (game: Game) => void;
  onDeleteGame: (id: string) => void;
}

export function Column({ column, games, onEditGame, onDeleteGame }: ColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
  });

  return (
    <div className={styles.column}>
      <div className={styles.header}>
        <h3 className={styles.title}>{column.title}</h3>
        <span className={styles.count}>{games.length}</span>
      </div>
      <div
        ref={setNodeRef}
        className={`${styles.cardList} ${isOver ? styles.over : ''}`}
      >
        <SortableContext
          items={games.map((g) => g.id)}
          strategy={verticalListSortingStrategy}
        >
          {games.map((game) => (
            <GameCard
              key={game.id}
              game={game}
              onEdit={onEditGame}
              onDelete={onDeleteGame}
            />
          ))}
        </SortableContext>
        {games.length === 0 && (
          <div className={styles.empty}>
            No games yet
          </div>
        )}
      </div>
    </div>
  );
}
