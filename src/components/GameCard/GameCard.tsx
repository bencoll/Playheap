import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Game } from '../../types';
import { PLATFORMS } from '../../types';
import { PlatformBadge } from '../PlatformBadge';
import styles from './GameCard.module.css';

interface GameCardProps {
  game: Game;
  onEdit: (game: Game) => void;
  onDelete: (id: string) => void;
  isDragging?: boolean;
}

export function GameCard({ game, onEdit, onDelete, isDragging }: GameCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ id: game.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const primaryPlatform = game.platforms[0];
  const platformConfig = primaryPlatform
    ? PLATFORMS.find((p) => p.id === primaryPlatform)
    : null;

  const borderColor = platformConfig
    ? platformConfig.id === 'switch'
      ? 'var(--color-switch-border)'
      : platformConfig.id === 'steam-deck'
      ? 'var(--color-steam-deck-border)'
      : 'var(--color-steam-border)'
    : 'transparent';

  return (
    <div
      ref={setNodeRef}
      style={{ ...style, borderLeftColor: borderColor }}
      className={`${styles.card} ${(isDragging || isSortableDragging) ? styles.dragging : ''}`}
      {...attributes}
      {...listeners}
    >
      <div className={styles.content}>
        <h4 className={styles.title}>{game.title}</h4>
        {game.platforms.length > 0 && (
          <div className={styles.platforms}>
            {game.platforms.map((platform) => (
              <PlatformBadge key={platform} platform={platform} />
            ))}
          </div>
        )}
      </div>
      <div className={styles.actions}>
        <button
          className={styles.actionButton}
          onClick={(e) => {
            e.stopPropagation();
            onEdit(game);
          }}
          aria-label="Edit game"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
          </svg>
        </button>
        <button
          className={styles.actionButton}
          onClick={(e) => {
            e.stopPropagation();
            onDelete(game.id);
          }}
          aria-label="Delete game"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
          </svg>
        </button>
      </div>
    </div>
  );
}
