import styles from './Header.module.css';

interface HeaderProps {
  onAddGame: () => void;
}

export function Header({ onAddGame }: HeaderProps) {
  return (
    <header className={styles.header}>
      <h1 className={styles.title}>Playheap</h1>
      <button className={styles.addButton} onClick={onAddGame}>
        Add Game
      </button>
    </header>
  );
}
