import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../../contexts/useAuth';
import styles from './UserMenu.module.css';

interface UserMenuProps {
  onOpenLogin: () => void;
}

export function UserMenu({ onOpenLogin }: UserMenuProps) {
  const { user, loading, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleKey);
    };
  }, [open]);

  if (loading) {
    return <div className={styles.placeholder} aria-hidden="true" />;
  }

  if (!user) {
    return (
      <button
        type="button"
        className={styles.loginButton}
        onClick={onOpenLogin}
      >
        Log In
      </button>
    );
  }

  const label = user.email ?? 'Account';
  const initial = (user.email ?? '?').charAt(0).toUpperCase();

  return (
    <div className={styles.container} ref={containerRef}>
      <button
        type="button"
        className={styles.trigger}
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Account menu for ${label}`}
      >
        <span className={styles.avatar} aria-hidden="true">
          {initial}
        </span>
      </button>

      {open && (
        <div className={styles.menu} role="menu">
          <div className={styles.menuHeader}>{label}</div>
          <button
            type="button"
            role="menuitem"
            className={styles.menuItem}
            onClick={async () => {
              setOpen(false);
              await signOut();
            }}
          >
            Log Out
          </button>
        </div>
      )}
    </div>
  );
}
