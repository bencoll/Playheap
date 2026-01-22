import { useState } from 'react';
import type { Game, Platform, HltbData, HltbSearchResult } from '../../types';
import { PLATFORMS } from '../../types';
import { useHltbSearch } from '../../hooks/useHltbSearch';
import { TagSelector } from '../TagSelector';
import styles from './AddGameForm.module.css';

type Step = 'search' | 'platforms';

interface AddGameFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (
    title: string,
    platforms: Platform[],
    hltb?: HltbData,
    tags?: string[]
  ) => void;
  editingGame?: Game | null;
  onUpdate?: (
    id: string,
    title: string,
    platforms: Platform[],
    hltb?: HltbData,
    tags?: string[]
  ) => void;
}

export function AddGameForm({
  isOpen,
  onClose,
  onSubmit,
  editingGame,
  onUpdate,
}: AddGameFormProps) {
  const [title, setTitle] = useState(editingGame?.title ?? '');
  const [selectedPlatforms, setSelectedPlatforms] = useState<Platform[]>(
    editingGame?.platforms ?? []
  );
  const [step, setStep] = useState<Step>(editingGame ? 'platforms' : 'search');
  const [selectedHltb, setSelectedHltb] = useState<HltbData | null>(
    editingGame?.hltb ?? null
  );
  const [isChangingImage, setIsChangingImage] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>(
    editingGame?.tags ?? []
  );

  const { results, isLoading, search, clearResults } = useHltbSearch();

  const handleTitleChange = (value: string) => {
    setTitle(value);
    if (!editingGame || isChangingImage) {
      search(value);
    }
  };

  const handleSelectResult = (result: HltbSearchResult) => {
    setTitle(result.name);
    setSelectedHltb({
      hltbId: result.id,
      imageUrl: result.imageUrl,
      gameplayMain: result.gameplayMain,
      gameplayMainExtra: result.gameplayMainExtra,
      gameplayCompletionist: result.gameplayCompletionist,
    });
    clearResults();
    setStep('platforms');
    setIsChangingImage(false);
  };

  const handleSkip = () => {
    setSelectedHltb(null);
    clearResults();
    setStep('platforms');
  };

  const handleBack = () => {
    setStep('search');
    search(title);
  };

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

    const tagsToSubmit = selectedTags.length > 0 ? selectedTags : undefined;

    if (editingGame && onUpdate) {
      onUpdate(
        editingGame.id,
        title.trim(),
        selectedPlatforms,
        selectedHltb || undefined,
        tagsToSubmit
      );
    } else {
      onSubmit(
        title.trim(),
        selectedPlatforms,
        selectedHltb || undefined,
        tagsToSubmit
      );
    }
    setTitle('');
    setSelectedPlatforms([]);
    setSelectedHltb(null);
    setSelectedTags([]);
    setStep('search');
    onClose();
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleChangeImage = () => {
    setIsChangingImage(true);
    setStep('search');
    search(title);
  };

  const handleRemoveImage = () => {
    setSelectedHltb(null);
  };

  if (!isOpen) return null;

  const showSearchResults = step === 'search' && title.trim().length > 0;

  return (
    <div className={styles.backdrop} onClick={handleBackdropClick}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2 className={styles.modalTitle}>
            {editingGame
              ? 'Edit Game'
              : step === 'search'
                ? 'Search Game'
                : 'Add Game'}
          </h2>
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

        {/* Edit mode image preview */}
        {editingGame && step === 'platforms' && !isChangingImage && (
          <div className={styles.imagePreviewSection}>
            {selectedHltb?.imageUrl ? (
              <>
                <img
                  src={selectedHltb.imageUrl}
                  alt={title}
                  className={styles.previewImage}
                />
                <div className={styles.imageActions}>
                  <button
                    type="button"
                    className={styles.changeImageButton}
                    onClick={handleChangeImage}
                  >
                    Change Image
                  </button>
                  <button
                    type="button"
                    className={styles.removeImageButton}
                    onClick={handleRemoveImage}
                  >
                    Remove
                  </button>
                </div>
              </>
            ) : (
              <button
                type="button"
                className={styles.addImageButton}
                onClick={handleChangeImage}
              >
                + Add Image
              </button>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className={styles.field}>
            <label htmlFor="gameTitle" className={styles.label}>
              Title
            </label>
            <input
              id="gameTitle"
              type="text"
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              className={styles.input}
              placeholder="Enter game title..."
              autoFocus
            />
          </div>

          {/* Search results */}
          {showSearchResults && (
            <div className={styles.searchResultsSection}>
              {isLoading ? (
                <div className={styles.loadingSpinner}>
                  <div className={styles.spinner} />
                  <span>Searching...</span>
                </div>
              ) : results.length > 0 ? (
                <>
                  <div className={styles.searchResults}>
                    {results.slice(0, 6).map((result) => (
                      <button
                        key={result.id}
                        type="button"
                        className={styles.resultItem}
                        onClick={() => handleSelectResult(result)}
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
                          <span className={styles.resultTitle}>
                            {result.name}
                          </span>
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
                    onClick={handleSkip}
                  >
                    Skip &mdash; add without image
                  </button>
                </>
              ) : title.trim().length > 2 ? (
                <div className={styles.noResults}>
                  <p>No games found</p>
                  <button
                    type="button"
                    className={styles.skipButton}
                    onClick={handleSkip}
                  >
                    Continue without image
                  </button>
                </div>
              ) : null}
            </div>
          )}

          {/* Platforms step */}
          {step === 'platforms' && (
            <>
              <div className={styles.field}>
                <label className={styles.label}>Platforms</label>
                <div className={styles.platforms}>
                  {PLATFORMS.map((platform) => (
                    <label
                      key={platform.id}
                      data-platform={platform.id}
                      className={`${styles.platformCheckbox} ${
                        selectedPlatforms.includes(platform.id)
                          ? styles.selected
                          : ''
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedPlatforms.includes(platform.id)}
                        onChange={() => handlePlatformToggle(platform.id)}
                        className={styles.checkbox}
                      />
                      <svg
                        className={styles.checkIcon}
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      {platform.name}
                    </label>
                  ))}
                </div>
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Tags</label>
                <TagSelector
                  selectedTags={selectedTags}
                  onTagsChange={setSelectedTags}
                />
              </div>
              <div className={styles.actions}>
                {!editingGame && (
                  <button
                    type="button"
                    className={styles.backButton}
                    onClick={handleBack}
                  >
                    Back
                  </button>
                )}
                <button
                  type="button"
                  className={styles.cancelButton}
                  onClick={onClose}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={styles.submitButton}
                  disabled={!title.trim()}
                >
                  <svg
                    className={styles.submitIcon}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  {editingGame ? 'Save' : 'Add Game'}
                </button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
}
