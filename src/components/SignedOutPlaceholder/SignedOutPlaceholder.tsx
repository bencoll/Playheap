import styles from './SignedOutPlaceholder.module.css';

interface SignedOutPlaceholderProps {
  onOpenLogin: () => void;
}

export function SignedOutPlaceholder({
  onOpenLogin,
}: SignedOutPlaceholderProps) {
  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h2 className={styles.title}>Sign in to your library</h2>
        <p className={styles.message}>
          Your games, tags, and progress are stored in your account. Sign in or
          create one to get started.
        </p>
        <button
          type="button"
          className={styles.button}
          onClick={onOpenLogin}
        >
          Sign in
        </button>
      </div>
    </div>
  );
}
