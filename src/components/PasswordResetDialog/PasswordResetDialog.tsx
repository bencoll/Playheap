import { useState } from 'react';
import { useAuth } from '../../contexts/useAuth';
import { useFocusTrap } from '../../hooks/useFocusTrap';
import { CloseIcon } from '../icons/CloseIcon';
import styles from './PasswordResetDialog.module.css';

interface PasswordResetDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PasswordResetDialog({
  isOpen,
  onClose,
}: PasswordResetDialogProps) {
  const { updatePassword } = useAuth();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const focusTrapRef = useFocusTrap<HTMLDivElement>(isOpen);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfo(null);

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setSubmitting(true);
    const { error: authError } = await updatePassword(newPassword);

    if (authError) {
      setSubmitting(false);
      setError(authError.message);
      return;
    }

    setInfo('Password updated.');
    setTimeout(() => {
      onClose();
    }, 1200);
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div
      className={styles.backdrop}
      onClick={handleBackdropClick}
      ref={focusTrapRef}
    >
      <div
        className={styles.dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby="password-reset-dialog-title"
      >
        <div className={styles.header}>
          <h2 id="password-reset-dialog-title" className={styles.title}>
            Set New Password
          </h2>
          <button
            className={styles.closeButton}
            onClick={onClose}
            aria-label="Close"
          >
            <CloseIcon className={styles.closeIcon} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <label className={styles.label}>
            New Password
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className={styles.input}
              required
              minLength={6}
              autoFocus
              autoComplete="new-password"
            />
          </label>

          <label className={styles.label}>
            Confirm Password
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={styles.input}
              required
              minLength={6}
              autoComplete="new-password"
            />
          </label>

          {error && <div className={styles.error}>{error}</div>}
          {info && <div className={styles.info}>{info}</div>}

          <button
            type="submit"
            className={styles.submitButton}
            disabled={submitting || !newPassword || !confirmPassword}
          >
            {submitting ? 'Working…' : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  );
}
