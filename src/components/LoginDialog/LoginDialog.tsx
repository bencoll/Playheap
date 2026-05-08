import { useState } from 'react';
import { useAuth } from '../../contexts/useAuth';
import { useFocusTrap } from '../../hooks/useFocusTrap';
import { CloseIcon } from '../icons/CloseIcon';
import styles from './LoginDialog.module.css';

interface LoginDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

type Mode = 'sign-in' | 'sign-up';

export function LoginDialog({ isOpen, onClose }: LoginDialogProps) {
  const { signInWithEmail, signUpWithEmail, signInWithGoogle, resetPassword } =
    useAuth();
  const [mode, setMode] = useState<Mode>('sign-in');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const focusTrapRef = useFocusTrap<HTMLDivElement>(isOpen);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setSubmitting(true);

    const action =
      mode === 'sign-in'
        ? signInWithEmail(email, password)
        : signUpWithEmail(email, password);

    const { error: authError } = await action;
    setSubmitting(false);

    if (authError) {
      setError(authError.message);
      return;
    }

    if (mode === 'sign-up') {
      setInfo('Check your email to confirm your account.');
      return;
    }

    onClose();
  };

  const handleGoogle = async () => {
    setError(null);
    setInfo(null);
    const { error: authError } = await signInWithGoogle();
    if (authError) setError(authError.message);
  };

  const handleForgot = async () => {
    setError(null);
    setInfo(null);
    if (!email) {
      setError('Enter your email above first.');
      return;
    }
    const { error: authError } = await resetPassword(email);
    if (authError) {
      setError(authError.message);
      return;
    }
    setInfo('Password reset email sent.');
  };

  const switchMode = (next: Mode) => {
    setMode(next);
    setError(null);
    setInfo(null);
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
        aria-labelledby="login-dialog-title"
      >
        <div className={styles.header}>
          <h2 id="login-dialog-title" className={styles.title}>
            {mode === 'sign-in' ? 'Sign In' : 'Sign Up'}
          </h2>
          <button
            className={styles.closeButton}
            onClick={onClose}
            aria-label="Close"
          >
            <CloseIcon className={styles.closeIcon} />
          </button>
        </div>

        <div className={styles.tabs} role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'sign-in'}
            className={`${styles.tab} ${mode === 'sign-in' ? styles.tabActive : ''}`}
            onClick={() => switchMode('sign-in')}
          >
            Sign In
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'sign-up'}
            className={`${styles.tab} ${mode === 'sign-up' ? styles.tabActive : ''}`}
            onClick={() => switchMode('sign-up')}
          >
            Sign Up
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <label className={styles.label}>
            Email
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={styles.input}
              required
              autoFocus
              autoComplete="email"
            />
          </label>

          <label className={styles.label}>
            Password
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={styles.input}
              required
              minLength={6}
              autoComplete={
                mode === 'sign-in' ? 'current-password' : 'new-password'
              }
            />
          </label>

          {error && <div className={styles.error}>{error}</div>}
          {info && <div className={styles.info}>{info}</div>}

          <button
            type="submit"
            className={styles.submitButton}
            disabled={submitting || !email || !password}
          >
            {submitting
              ? 'Working…'
              : mode === 'sign-in'
                ? 'Sign In'
                : 'Create Account'}
          </button>

          {mode === 'sign-in' && (
            <button
              type="button"
              className={styles.forgotLink}
              onClick={handleForgot}
            >
              Forgot password?
            </button>
          )}
        </form>

        <div className={styles.divider}>
          <span>or</span>
        </div>

        <button
          type="button"
          className={styles.googleButton}
          onClick={handleGoogle}
        >
          <GoogleIcon />
          Continue with Google
        </button>
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg
      className={styles.googleIcon}
      viewBox="0 0 48 48"
      aria-hidden="true"
    >
      <path
        fill="#FFC107"
        d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"
      />
      <path
        fill="#FF3D00"
        d="M6.3 14.7l6.6 4.8C14.7 16 19 13 24 13c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.4 6.3 14.7z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.3 35 26.8 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z"
      />
      <path
        fill="#1976D2"
        d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.2-4.1 5.6l6.2 5.2C41 35 44 30 44 24c0-1.3-.1-2.4-.4-3.5z"
      />
    </svg>
  );
}
