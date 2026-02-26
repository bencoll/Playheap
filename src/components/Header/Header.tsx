import { TagFilter } from '../TagFilter';
import styles from './Header.module.css';

interface HeaderProps {
  onAddGame: () => void;
  onManageTags: () => void;
  onRandomSpin: () => void;
  activeTagFilters: string[];
  onTagFiltersChange: (filters: string[]) => void;
}

export function Header({
  onAddGame,
  onManageTags,
  onRandomSpin,
  activeTagFilters,
  onTagFiltersChange,
}: HeaderProps) {
  return (
    <header className={styles.header}>
      <div className={styles.titleWrapper}>
        <div className={styles.logo}>
          <img src="/play-icon-cyan.svg" alt="play-icon-cyan" />
        </div>
        <h1 className={styles.title}>Playheap</h1>
      </div>
      <div className={styles.actions}>
        <TagFilter
          activeFilters={activeTagFilters}
          onFiltersChange={onTagFiltersChange}
        />
        <button
          className={styles.spinButton}
          onClick={onRandomSpin}
          title="Pick a random game from your backlog"
        >
          <svg
            className={styles.spinIcon}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="2" y="2" width="20" height="20" rx="2" />
            <circle cx="8" cy="8" r="1.5" fill="currentColor" />
            <circle cx="16" cy="8" r="1.5" fill="currentColor" />
            <circle cx="8" cy="16" r="1.5" fill="currentColor" />
            <circle cx="16" cy="16" r="1.5" fill="currentColor" />
            <circle cx="12" cy="12" r="1.5" fill="currentColor" />
          </svg>
          Spin
        </button>
        <button className={styles.manageTagsButton} onClick={onManageTags}>
          <svg
            className={styles.manageTagsIcon}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
            <line x1="7" y1="7" x2="7.01" y2="7" />
          </svg>
          Tags
        </button>
        <button className={styles.addButton} onClick={onAddGame}>
          <svg
            className={styles.addButtonIcon}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Add Game
        </button>
      </div>
    </header>
  );
}
