import styles from './Header.module.css';

interface HeaderProps {
  onAddGame: () => void;
}

export function Header({ onAddGame }: HeaderProps) {
  return (
    <header className={styles.header}>
      <div className={styles.titleWrapper}>
        <div className={styles.logo}>
          <svg className={styles.logoIcon} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="5 3 19 12 5 21 5 3" />
          </svg>
        </div>
        <h1 className={styles.title}>Playheap</h1>
      </div>
      <button className={styles.addButton} onClick={onAddGame}>
        <svg className={styles.addButtonIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
        Add Game
      </button>
    </header>
  );
}
