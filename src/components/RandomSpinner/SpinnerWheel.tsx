import type { Game } from '../../types';
import styles from './RandomSpinner.module.css';

interface SpinnerWheelProps {
  games: Game[];
  winner: Game | null;
  hasNoFilteredGames: boolean;
  translateY: number;
}

export function SpinnerWheel({
  games,
  winner,
  hasNoFilteredGames,
  translateY,
}: SpinnerWheelProps) {
  return (
    <div
      className={`${styles.wheelContainer} ${winner ? styles.winner : ''} ${hasNoFilteredGames ? styles.noGames : ''}`}
    >
      <div className={styles.pointer} />
      <div className={styles.pointerRight} />
      <div className={styles.selectionLine} />
      <div
        className={styles.wheel}
        style={{
          transform: `translateY(${translateY}px)`,
        }}
      >
        {games.map((game, index) => (
          <div key={`${game.id}-${index}`} className={styles.gameItem}>
            {game.hltb?.imageUrl ? (
              <img
                src={game.hltb.imageUrl}
                alt=""
                className={styles.gameImage}
              />
            ) : (
              <div className={styles.gameImagePlaceholder}>
                <svg
                  className={styles.placeholderIcon}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="2" y="6" width="20" height="12" rx="2" />
                  <path d="M6 12h.01M10 12h.01" />
                  <path d="M14 10v4M18 10v4M16 12h4" />
                </svg>
              </div>
            )}
            <span className={styles.gameTitle}>{game.title}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
