import { useEffect, useCallback, useState, useMemo, useRef } from 'react';
import { useGameLibrary } from '../../contexts/useGameLibrary';
import { useSpinnerAnimation, MIN_ITEMS_BUFFER } from './useSpinnerAnimation';
import { useFocusTrap } from '../../hooks/useFocusTrap';
import { SpinnerTagFilter } from './SpinnerTagFilter';
import { SpinnerWheel } from './SpinnerWheel';
import { SpinnerActions } from './SpinnerActions';
import { CloseIcon } from '../icons/CloseIcon';
import type { Game } from '../../types';
import styles from './RandomSpinner.module.css';

interface RandomSpinnerProps {
  isOpen: boolean;
  onClose: () => void;
}

const ITEM_HEIGHT = 70;
const VIEWPORT_HEIGHT = 280;

export function RandomSpinner({ isOpen, onClose }: RandomSpinnerProps) {
  const { state, moveGame } = useGameLibrary();
  const [winner, setWinner] = useState<Game | null>(null);
  const [hasSpun, setHasSpun] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const prevIsOpenRef = useRef(isOpen);
  const focusTrapRef = useFocusTrap<HTMLDivElement>(isOpen);

  const availableTags = useMemo(() => state.tags || [], [state.tags]);

  // Initialize selectedTags to all tags when modal opens (transition from closed to open)
  useEffect(() => {
    if (isOpen && !prevIsOpenRef.current) {
      // Modal just opened - reset to all tags selected
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSelectedTags(availableTags);
    }
    prevIsOpenRef.current = isOpen;
  }, [isOpen, availableTags]);

  const allBacklogGames = useMemo(() => {
    const backlogColumn = state.columns['backlog'];
    return backlogColumn.gameIds
      .map((id) => state.games[id])
      .filter((game): game is Game => !!game);
  }, [state.columns, state.games]);

  // Filter games by selected tags
  const backlogGames = useMemo(() => {
    if (selectedTags.length === 0) {
      // No tags selected = no games eligible
      return [];
    }
    return allBacklogGames.filter((game) => {
      // Games with no tags are included if all tags are selected
      if (!game.tags || game.tags.length === 0) {
        return selectedTags.length === availableTags.length;
      }
      // Game matches if any of its tags are selected (OR logic)
      return game.tags.some((tag) => selectedTags.includes(tag));
    });
  }, [allBacklogGames, selectedTags, availableTags.length]);

  const handleTagToggle = useCallback((tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  }, []);

  const handleSelectAllTags = useCallback(() => {
    setSelectedTags(availableTags);
  }, [availableTags]);

  const handleDeselectAllTags = useCallback(() => {
    setSelectedTags([]);
  }, []);

  const prefersReducedMotion = useMemo(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);

  const handleSpinComplete = useCallback(
    (winnerIndex: number) => {
      const selectedGame = backlogGames[winnerIndex];
      if (selectedGame) {
        setWinner(selectedGame);
        setHasSpun(true);
      }
    },
    [backlogGames]
  );

  const { position, isSpinning, startSpin, reset, totalCopies } =
    useSpinnerAnimation({
      itemCount: backlogGames.length,
      itemHeight: ITEM_HEIGHT,
      onComplete: handleSpinComplete,
    });

  // Reset position when filtered games change (before spinning)
  useEffect(() => {
    if (!hasSpun && !isSpinning) {
      reset();
    }
  }, [backlogGames.length, hasSpun, isSpinning, reset]);

  const handleSpin = useCallback(() => {
    if (backlogGames.length === 0) return;

    setWinner(null);

    if (prefersReducedMotion) {
      const winnerIndex = Math.floor(Math.random() * backlogGames.length);
      const selectedGame = backlogGames[winnerIndex];
      setWinner(selectedGame);
      setHasSpun(true);
    } else {
      startSpin();
    }
  }, [backlogGames, prefersReducedMotion, startSpin]);

  const handleAccept = useCallback(() => {
    if (winner) {
      const upNextColumn = state.columns['up-next'];
      moveGame(winner.id, 'up-next', upNextColumn.gameIds.length);
      onClose();
    }
  }, [winner, state.columns, moveGame, onClose]);

  const handleSpinAgain = useCallback(() => {
    setWinner(null);
    setHasSpun(false);
    reset();
    // Small delay to ensure reset is applied before starting new spin
    setTimeout(() => {
      if (prefersReducedMotion) {
        const winnerIndex = Math.floor(Math.random() * backlogGames.length);
        const selectedGame = backlogGames[winnerIndex];
        setWinner(selectedGame);
        setHasSpun(true);
      } else {
        startSpin();
      }
    }, 50);
  }, [reset, startSpin, prefersReducedMotion, backlogGames]);

  const handleClose = useCallback(() => {
    reset();
    setWinner(null);
    setHasSpun(false);
    setSelectedTags(availableTags);
    onClose();
  }, [reset, onClose, availableTags]);

  const handleBackdropClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget && !isSpinning) {
        handleClose();
      }
    },
    [isSpinning, handleClose]
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isSpinning) {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, isSpinning, handleClose]);

  if (!isOpen) return null;

  const hasNoBacklogGames = allBacklogGames.length === 0;
  const hasNoFilteredGames = backlogGames.length === 0 && !hasNoBacklogGames;

  if (hasNoBacklogGames) {
    return (
      <div className={styles.backdrop} onClick={handleBackdropClick} ref={focusTrapRef}>
        <div className={styles.modal} role="dialog" aria-modal="true" aria-labelledby="spinner-title-empty">
          <div className={styles.header}>
            <h2 id="spinner-title-empty" className={styles.title}>
              <svg
                className={styles.titleIcon}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="2" y="4" width="20" height="16" rx="2" />
                <path d="M12 8v8" />
                <path d="M8 12h8" />
              </svg>
              Random Pick
            </h2>
            <button
              className={styles.closeButton}
              onClick={handleClose}
              aria-label="Close"
            >
              <CloseIcon className={styles.closeIcon} />
            </button>
          </div>
          <div className={styles.emptyState}>
            <svg
              className={styles.emptyIcon}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M8 15h8" />
              <path d="M9 9h.01" />
              <path d="M15 9h.01" />
            </svg>
            <h3 className={styles.emptyTitle}>No Games in Backlog</h3>
            <p className={styles.emptyText}>
              Add some games to your backlog first, then come back to spin!
            </p>
            <button className={styles.emptyCloseButton} onClick={handleClose}>
              Got It
            </button>
          </div>
        </div>
      </div>
    );
  }

  const extendedGamesList = Array(totalCopies).fill(backlogGames).flat();
  const centerOffset = VIEWPORT_HEIGHT / 2 - ITEM_HEIGHT / 2;

  // Ensure position is valid for the current list size to prevent blank areas
  const totalHeight = backlogGames.length * ITEM_HEIGHT;
  const maxValidPosition = totalHeight * (totalCopies - 1);
  // Use same initial position calculation as the hook: at least 3 items above
  const minItemsAbove = MIN_ITEMS_BUFFER;
  const defaultPosition = Math.max(minItemsAbove * ITEM_HEIGHT, totalHeight);
  const safePosition =
    totalHeight > 0 && position > maxValidPosition ? defaultPosition : position;

  return (
    <div className={styles.backdrop} onClick={handleBackdropClick} ref={focusTrapRef}>
      <div className={styles.modal} role="dialog" aria-modal="true" aria-labelledby="spinner-title">
        <div className={styles.header}>
          <h2 id="spinner-title" className={styles.title}>
            <svg
              className={styles.titleIcon}
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
            Random Pick
          </h2>
          <button
            className={styles.closeButton}
            onClick={handleClose}
            disabled={isSpinning}
            aria-label="Close"
          >
            <CloseIcon className={styles.closeIcon} />
          </button>
        </div>

        <SpinnerTagFilter
          availableTags={availableTags}
          selectedTags={selectedTags}
          eligibleCount={backlogGames.length}
          onTagToggle={handleTagToggle}
          onSelectAll={handleSelectAllTags}
          onDeselectAll={handleDeselectAllTags}
        />

        <SpinnerWheel
          games={extendedGamesList}
          winner={winner}
          hasNoFilteredGames={hasNoFilteredGames}
          translateY={centerOffset - safePosition}
        />

        <SpinnerActions
          hasSpun={hasSpun}
          isSpinning={isSpinning}
          hasNoFilteredGames={hasNoFilteredGames}
          onSpin={handleSpin}
          onAccept={handleAccept}
          onSpinAgain={handleSpinAgain}
          onClose={handleClose}
        />

        {winner && (
          <div aria-live="polite" className="sr-only">
            Selected game: {winner.title}
          </div>
        )}
      </div>
    </div>
  );
}
