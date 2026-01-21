import { useState, useEffect } from 'react';
import type { Game, Platform } from '../../types';
import { PLATFORMS } from '../../types';
import styles from './AddGameForm.module.css';

interface AddGameFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (title: string, platforms: Platform[]) => void;
  editingGame?: Game | null;
  onUpdate?: (id: string, title: string, platforms: Platform[]) => void;
}

export function AddGameForm({ isOpen, onClose, onSubmit, editingGame, onUpdate }: AddGameFormProps) {
  const [title, setTitle] = useState('');
  const [selectedPlatforms, setSelectedPlatforms] = useState<Platform[]>([]);

  useEffect(() => {
    if (editingGame) {
      setTitle(editingGame.title);
      setSelectedPlatforms([...editingGame.platforms]);
    } else {
      setTitle('');
      setSelectedPlatforms([]);
    }
  }, [editingGame, isOpen]);

  const handlePlatformToggle = (platform: Platform) => {
    setSelectedPlatforms((prev) =>
      prev.includes(platform)
        ? prev.filter((p) => p !== platform)
        : [...prev, platform]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    if (editingGame && onUpdate) {
      onUpdate(editingGame.id, title.trim(), selectedPlatforms);
    } else {
      onSubmit(title.trim(), selectedPlatforms);
    }
    setTitle('');
    setSelectedPlatforms([]);
    onClose();
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.backdrop} onClick={handleBackdropClick}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2 className={styles.modalTitle}>
            {editingGame ? 'Edit Game' : 'Add Game'}
          </h2>
          <button className={styles.closeButton} onClick={onClose} aria-label="Close">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className={styles.field}>
            <label htmlFor="gameTitle" className={styles.label}>
              Title
            </label>
            <input
              id="gameTitle"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={styles.input}
              placeholder="Enter game title"
              autoFocus
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Platforms</label>
            <div className={styles.platforms}>
              {PLATFORMS.map((platform) => (
                <label
                  key={platform.id}
                  className={`${styles.platformCheckbox} ${
                    selectedPlatforms.includes(platform.id) ? styles.selected : ''
                  }`}
                  style={{
                    backgroundColor: selectedPlatforms.includes(platform.id)
                      ? platform.color
                      : undefined,
                    color: selectedPlatforms.includes(platform.id)
                      ? platform.textColor
                      : undefined,
                    borderColor: selectedPlatforms.includes(platform.id)
                      ? platform.textColor
                      : undefined,
                  }}
                >
                  <input
                    type="checkbox"
                    checked={selectedPlatforms.includes(platform.id)}
                    onChange={() => handlePlatformToggle(platform.id)}
                    className={styles.checkbox}
                  />
                  {platform.name}
                </label>
              ))}
            </div>
          </div>
          <div className={styles.actions}>
            <button type="button" className={styles.cancelButton} onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className={styles.submitButton} disabled={!title.trim()}>
              {editingGame ? 'Save Changes' : 'Add Game'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
