import { TagFilter } from '../TagFilter';
import styles from './Header.module.css';

interface HeaderProps {
  onAddGame: () => void;
  onManageTags: () => void;
  activeTagFilters: string[];
  onTagFiltersChange: (filters: string[]) => void;
}

export function Header({
  onAddGame,
  onManageTags,
  activeTagFilters,
  onTagFiltersChange,
}: HeaderProps) {
  return (
    <header className={styles.header}>
      <div className={styles.titleWrapper}>
        <div className={styles.logo}>
          <svg
            className={styles.logoIcon}
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polygon points="5 3 19 12 5 21 5 3" />
          </svg>
        </div>
        <h1 className={styles.title}>Playheap</h1>
      </div>
      <div className={styles.actions}>
        <TagFilter
          activeFilters={activeTagFilters}
          onFiltersChange={onTagFiltersChange}
        />
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
