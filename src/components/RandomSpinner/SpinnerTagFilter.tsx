import { CheckIcon } from '../icons/CheckIcon';
import styles from './RandomSpinner.module.css';

interface SpinnerTagFilterProps {
  availableTags: string[];
  selectedTags: string[];
  eligibleCount: number;
  onTagToggle: (tag: string) => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
}

export function SpinnerTagFilter({
  availableTags,
  selectedTags,
  eligibleCount,
  onTagToggle,
  onSelectAll,
  onDeselectAll,
}: SpinnerTagFilterProps) {
  if (availableTags.length === 0) return null;

  return (
    <div className={styles.tagFilter}>
      <div className={styles.tagFilterHeader}>
        <span className={styles.tagFilterLabel}>Filter by tags:</span>
        <div className={styles.tagFilterActions}>
          <button
            type="button"
            className={styles.tagFilterAction}
            onClick={onSelectAll}
            disabled={selectedTags.length === availableTags.length}
          >
            All
          </button>
          <button
            type="button"
            className={styles.tagFilterAction}
            onClick={onDeselectAll}
            disabled={selectedTags.length === 0}
          >
            None
          </button>
        </div>
      </div>
      <div className={styles.tagList}>
        {availableTags.map((tag) => (
          <label key={tag} className={styles.tagOption}>
            <input
              type="checkbox"
              checked={selectedTags.includes(tag)}
              onChange={() => onTagToggle(tag)}
              className={styles.tagCheckbox}
            />
            <span
              className={`${styles.tagCheckmark} ${selectedTags.includes(tag) ? styles.checked : ''}`}
            >
              <CheckIcon />
            </span>
            <span className={styles.tagName}>{tag}</span>
          </label>
        ))}
      </div>
      <div className={styles.eligibleCount}>
        {eligibleCount} game{eligibleCount !== 1 ? 's' : ''} eligible
      </div>
    </div>
  );
}
