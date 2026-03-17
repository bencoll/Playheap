import type { Platform } from '../../types';
import { PLATFORMS } from '../../types';
import { TagSelector } from '../TagSelector';
import { CheckIcon } from '../icons/CheckIcon';
import styles from './AddGameForm.module.css';

interface PlatformSelectStepProps {
  selectedPlatforms: Platform[];
  onPlatformToggle: (platform: Platform) => void;
  selectedTags: string[];
  onTagsChange: (tags: string[]) => void;
  notes: string;
  onNotesChange: (notes: string) => void;
  isEditing: boolean;
  titleValid: boolean;
  onBack: () => void;
  onCancel: () => void;
}

export function PlatformSelectStep({
  selectedPlatforms,
  onPlatformToggle,
  selectedTags,
  onTagsChange,
  notes,
  onNotesChange,
  isEditing,
  titleValid,
  onBack,
  onCancel,
}: PlatformSelectStepProps) {
  return (
    <>
      <div className={styles.field}>
        <label className={styles.label}>Platforms</label>
        <div className={styles.platforms}>
          {PLATFORMS.map((platform) => (
            <label
              key={platform.id}
              data-platform={platform.id}
              className={`${styles.platformCheckbox} ${
                selectedPlatforms.includes(platform.id) ? styles.selected : ''
              }`}
            >
              <input
                type="checkbox"
                checked={selectedPlatforms.includes(platform.id)}
                onChange={() => onPlatformToggle(platform.id)}
                className={styles.checkbox}
              />
              <CheckIcon className={styles.checkIcon} />
              {platform.name}
            </label>
          ))}
        </div>
      </div>
      <div className={styles.field}>
        <label className={styles.label}>Tags</label>
        <TagSelector selectedTags={selectedTags} onTagsChange={onTagsChange} />
      </div>
      {isEditing && (
        <div className={styles.field}>
          <label htmlFor="gameNotes" className={styles.label}>
            Notes
          </label>
          <textarea
            id="gameNotes"
            value={notes}
            onChange={(e) => onNotesChange(e.target.value)}
            className={styles.textarea}
            placeholder="Add notes about this game..."
            rows={4}
          />
        </div>
      )}
      <div className={styles.actions}>
        {!isEditing && (
          <button
            type="button"
            className={styles.backButton}
            onClick={onBack}
          >
            Back
          </button>
        )}
        <button
          type="button"
          className={styles.cancelButton}
          onClick={onCancel}
        >
          Cancel
        </button>
        <button
          type="submit"
          className={styles.submitButton}
          disabled={!titleValid}
        >
          <CheckIcon className={styles.submitIcon} strokeWidth={2.5} />
          {isEditing ? 'Save' : 'Add Game'}
        </button>
      </div>
    </>
  );
}
