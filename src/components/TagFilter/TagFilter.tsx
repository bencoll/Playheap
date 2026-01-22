import { useState, useRef, useEffect } from 'react';
import { useGameLibrary } from '../../contexts/useGameLibrary';
import styles from './TagFilter.module.css';

interface TagFilterProps {
  activeFilters: string[];
  onFiltersChange: (filters: string[]) => void;
}

export function TagFilter({ activeFilters, onFiltersChange }: TagFilterProps) {
  const { state } = useGameLibrary();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const availableTags = state.tags || [];

  const handleToggle = () => {
    setIsOpen((prev) => !prev);
  };

  const handleTagToggle = (tag: string) => {
    if (activeFilters.includes(tag)) {
      onFiltersChange(activeFilters.filter((t) => t !== tag));
    } else {
      onFiltersChange([...activeFilters, tag]);
    }
  };

  const handleClearFilters = () => {
    onFiltersChange([]);
    setIsOpen(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const hasActiveFilters = activeFilters.length > 0;

  return (
    <div className={styles.container} ref={containerRef}>
      <button
        className={`${styles.filterButton} ${hasActiveFilters ? styles.active : ''}`}
        onClick={handleToggle}
        aria-expanded={isOpen}
      >
        <svg
          className={styles.filterIcon}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
        </svg>
        Filter
        {hasActiveFilters && (
          <span className={styles.badge}>{activeFilters.length}</span>
        )}
      </button>

      {isOpen && (
        <div className={styles.dropdown}>
          {availableTags.length === 0 ? (
            <div className={styles.emptyState}>
              No tags available. Add tags to start filtering.
            </div>
          ) : (
            <>
              <div className={styles.tagList}>
                {availableTags.map((tag) => (
                  <label key={tag} className={styles.tagOption}>
                    <input
                      type="checkbox"
                      checked={activeFilters.includes(tag)}
                      onChange={() => handleTagToggle(tag)}
                      className={styles.checkbox}
                    />
                    <span
                      className={`${styles.checkmark} ${activeFilters.includes(tag) ? styles.checked : ''}`}
                    >
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </span>
                    <span className={styles.tagLabel}>{tag}</span>
                  </label>
                ))}
              </div>
              {hasActiveFilters && (
                <button
                  type="button"
                  className={styles.clearButton}
                  onClick={handleClearFilters}
                >
                  Clear filters
                </button>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
