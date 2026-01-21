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
    <div className={styles.column} data-column={column.id}>
      <div className={styles.header}>
        <div className={styles.titleWrapper}>
          <div className={styles.statusDot} />
          <h3 className={styles.title}>{column.title}</h3>
        </div>
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
          {games.map((game, index) => (
            <GameCard
              key={game.id}
              game={game}
              onEdit={onEditGame}
              onDelete={onDeleteGame}
              index={index}
            />
          ))}
        </SortableContext>
        {games.length === 0 && (
          <div className={styles.empty}>
            <svg className={styles.emptyIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="2" y="4" width="20" height="16" rx="2" />
              <path d="M10 4v4h4V4" />
              <line x1="6" y1="12" x2="18" y2="12" />
              <line x1="6" y1="16" x2="14" y2="16" />
            </svg>
            <span className={styles.emptyText}>Drop games here</span>
          </div>
        )}
      </div>
    </div>
  );
}
