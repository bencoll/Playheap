import { useGameLibrary } from '../../contexts/useGameLibrary';
import { CheckIcon } from '../icons/CheckIcon';
import styles from './TagSelector.module.css';

interface TagSelectorProps {
  selectedTags: string[];
  onTagsChange: (tags: string[]) => void;
}

export function TagSelector({ selectedTags, onTagsChange }: TagSelectorProps) {
  const { state } = useGameLibrary();
  const availableTags = state.tags || [];

  const handleTagToggle = (tag: string) => {
    if (selectedTags.includes(tag)) {
      onTagsChange(selectedTags.filter((t) => t !== tag));
    } else {
      onTagsChange([...selectedTags, tag]);
    }
  };

  if (availableTags.length === 0) {
    return (
      <div className={styles.emptyState}>
        No tags available. Add tags from the header menu.
      </div>
    );
  }

  return (
    <div className={styles.tagSelector}>
      {availableTags.map((tag) => (
        <button
          key={tag}
          type="button"
          className={`${styles.tagChip} ${selectedTags.includes(tag) ? styles.selected : ''}`}
          onClick={() => handleTagToggle(tag)}
        >
          <CheckIcon className={styles.checkIcon} />
          {tag}
        </button>
      ))}
    </div>
  );
}
