import { useState } from 'react';
import { useGameLibrary } from '../../contexts/useGameLibrary';
import { useFocusTrap } from '../../hooks/useFocusTrap';
import { CloseIcon } from '../icons/CloseIcon';
import { PlusIcon } from '../icons/PlusIcon';
import styles from './TagManagerDialog.module.css';

interface TagManagerDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function TagManagerDialog({ isOpen, onClose }: TagManagerDialogProps) {
  const { state, addTag, deleteTag } = useGameLibrary();
  const [newTagName, setNewTagName] = useState('');
  const availableTags = state.tags || [];
  const focusTrapRef = useFocusTrap<HTMLDivElement>(isOpen);

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
    <div className={styles.backdrop} onClick={handleBackdropClick} ref={focusTrapRef}>
      <div className={styles.dialog} role="dialog" aria-modal="true" aria-labelledby="tag-manager-title">
        <div className={styles.header}>
          <h2 id="tag-manager-title" className={styles.title}>Manage Tags</h2>
          <button
            className={styles.closeButton}
            onClick={onClose}
            aria-label="Close"
          >
            <CloseIcon className={styles.closeIcon} />
          </button>
        </div>

        <form onSubmit={handleAddTag} className={styles.addForm}>
          <input
            type="text"
            value={newTagName}
            onChange={(e) => setNewTagName(e.target.value)}
            placeholder="Enter tag name..."
            className={styles.input}
            aria-label="New tag name"
            autoFocus
          />
          <button
            type="submit"
            className={styles.addButton}
            disabled={!newTagName.trim()}
          >
            <PlusIcon className={styles.addIcon} strokeWidth={2.5} />
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
                  <CloseIcon className={styles.deleteIcon} />
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
