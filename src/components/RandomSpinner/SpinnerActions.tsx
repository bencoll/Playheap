import styles from './RandomSpinner.module.css';

interface SpinnerActionsProps {
  hasSpun: boolean;
  isSpinning: boolean;
  hasNoFilteredGames: boolean;
  onSpin: () => void;
  onAccept: () => void;
  onSpinAgain: () => void;
  onClose: () => void;
}

export function SpinnerActions({
  hasSpun,
  isSpinning,
  hasNoFilteredGames,
  onSpin,
  onAccept,
  onSpinAgain,
  onClose,
}: SpinnerActionsProps) {
  return (
    <div className={styles.actions}>
      {!hasSpun ? (
        <button
          className={styles.spinButton}
          onClick={onSpin}
          disabled={isSpinning || hasNoFilteredGames}
        >
          {isSpinning
            ? 'Spinning...'
            : hasNoFilteredGames
              ? 'No Games Match'
              : 'Spin!'}
        </button>
      ) : (
        <div className={styles.resultActions}>
          <button className={styles.acceptButton} onClick={onAccept}>
            Let's Play!
          </button>
          <button
            className={styles.spinAgainButton}
            onClick={onSpinAgain}
            disabled={isSpinning}
          >
            Spin Again
          </button>
        </div>
      )}
      <button
        className={styles.cancelButton}
        onClick={onClose}
        disabled={isSpinning}
      >
        Cancel
      </button>
    </div>
  );
}
