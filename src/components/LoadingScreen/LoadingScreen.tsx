import styles from './LoadingScreen.module.css';

export function LoadingScreen() {
  return (
    <div className={styles.container} role="status" aria-label="Loading">
      <div className={styles.spinner} />
    </div>
  );
}
