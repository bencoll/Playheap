import { useState } from 'react';
import { useGameLibrary } from '../../contexts/useGameLibrary';
import styles from './TagManagerDialog.module.css';

interface TagManagerDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function TagManagerDialog({ isOpen, onClose }: TagManagerDialogProps) {
  const { state, addTag, deleteTag } = useGameLibrary();
  const [newTagName, setNewTagName] = useState('');
  const availableTags = state.tags || [];

  const handleAddTag = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTagName.trim()) {
      addTag(newTagName.trim());
      setNewTagName('');
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.backdrop} onClick={handleBackdropClick}>
      <div className={styles.dialog}>
        <div className={styles.header}>
          <h2 className={styles.title}>Manage Tags</h2>
          <button
            className={styles.closeButton}
            onClick={onClose}
            aria-label="Close"
          >
            <svg
              className={styles.closeIcon}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleAddTag} className={styles.addForm}>
          <input
            type="text"
            value={newTagName}
            onChange={(e) => setNewTagName(e.target.value)}
            placeholder="Enter tag name..."
            className={styles.input}
            autoFocus
          />
          <button
            type="submit"
            className={styles.addButton}
            disabled={!newTagName.trim()}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={styles.addIcon}
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Add
          </button>
        </form>

        <div className={styles.tagList}>
          {availableTags.length === 0 ? (
            <div className={styles.emptyState}>
              No tags yet. Add your first tag above.
            </div>
          ) : (
            availableTags.map((tag) => (
              <div key={tag} className={styles.tagItem}>
                <span className={styles.tagName}>{tag}</span>
                <button
                  type="button"
                  className={styles.deleteButton}
                  onClick={() => deleteTag(tag)}
                  aria-label={`Delete ${tag}`}
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className={styles.deleteIcon}
                  >
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
            ))
          )}
        </div>

        <div className={styles.actions}>
          <button type="button" className={styles.doneButton} onClick={onClose}>
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
