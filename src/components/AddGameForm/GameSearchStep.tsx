import type { HltbSearchResult } from '../../types';
import styles from './AddGameForm.module.css';

const MAX_SEARCH_RESULTS = 6;

interface GameSearchStepProps {
  title: string;
  results: HltbSearchResult[];
  isLoading: boolean;
  onSelectResult: (result: HltbSearchResult) => void;
  onSkip: () => void;
}

export function GameSearchStep({
  title,
  results,
  isLoading,
  onSelectResult,
  onSkip,
}: GameSearchStepProps) {
  if (title.trim().length === 0) return null;

  if (isLoading) {
    return (
      <div className={styles.searchResultsSection}>
        <div className={styles.loadingSpinner}>
          <div className={styles.spinner} />
          <span>Searching...</span>
        </div>
      </div>
    );
  }

  if (results.length > 0) {
    return (
      <div className={styles.searchResultsSection}>
        <div className={styles.searchResults}>
          {results.slice(0, MAX_SEARCH_RESULTS).map((result) => (
            <button
              key={result.id}
              type="button"
              className={styles.resultItem}
              onClick={() => onSelectResult(result)}
            >
              {result.imageUrl && (
                <img
                  src={result.imageUrl}
                  alt={result.name}
                  className={styles.resultImage}
                  loading="lazy"
                />
              )}
              <div className={styles.resultInfo}>
                <span className={styles.resultTitle}>{result.name}</span>
                {result.gameplayMain > 0 && (
                  <span className={styles.resultHours}>
                    {Math.floor(result.gameplayMain / 3600)}h main
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>
        <button
          type="button"
          className={styles.skipButton}
          onClick={onSkip}
        >
          Skip &mdash; add without image
        </button>
      </div>
    );
  }

  if (title.trim().length > 2) {
    return (
      <div className={styles.searchResultsSection}>
        <div className={styles.noResults}>
          <p>No games found</p>
          <button
            type="button"
            className={styles.skipButton}
            onClick={onSkip}
          >
            Continue without image
          </button>
        </div>
      </div>
    );
  }

  return null;
}
