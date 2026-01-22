import { useState } from 'react';
import { Header } from './components/Header';
import { Board } from './components/Board';
import { AddGameForm } from './components/AddGameForm';
import { ConfirmDialog } from './components/ConfirmDialog';
import { TagManagerDialog } from './components/TagManagerDialog';
import { useGameLibrary } from './contexts/useGameLibrary';
import type { Game, Platform, HltbData } from './types';
import styles from './App.module.css';

function App() {
  const { state, addGame, updateGame, deleteGame } = useGameLibrary();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingGame, setEditingGame] = useState<Game | null>(null);
  const [formKey, setFormKey] = useState(0);
  const [gameToDelete, setGameToDelete] = useState<string | null>(null);
  const [isTagManagerOpen, setIsTagManagerOpen] = useState(false);
  const [activeTagFilters, setActiveTagFilters] = useState<string[]>([]);

  const gameToDeleteTitle = gameToDelete
    ? state.games[gameToDelete]?.title
    : '';

  const handleAddGame = () => {
    setEditingGame(null);
    setFormKey((k) => k + 1);
    setIsFormOpen(true);
  };

  const handleEditGame = (game: Game) => {
    setEditingGame(game);
    setIsFormOpen(true);
  };

  const handleDeleteGame = (id: string) => {
    setGameToDelete(id);
  };

  const handleConfirmDelete = () => {
    if (gameToDelete) {
      deleteGame(gameToDelete);
      setGameToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setGameToDelete(null);
  };

  const handleFormSubmit = (
    title: string,
    platforms: Platform[],
    hltb?: HltbData,
    tags?: string[]
  ) => {
    addGame(title, platforms, hltb, tags);
  };

  const handleFormUpdate = (
    id: string,
    title: string,
    platforms: Platform[],
    hltb?: HltbData,
    tags?: string[]
  ) => {
    updateGame(id, { title, platforms, hltb, tags });
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingGame(null);
  };

  return (
    <div className={styles.app}>
      <Header
        onAddGame={handleAddGame}
        onManageTags={() => setIsTagManagerOpen(true)}
        activeTagFilters={activeTagFilters}
        onTagFiltersChange={setActiveTagFilters}
      />
      <Board
        onEditGame={handleEditGame}
        onDeleteGame={handleDeleteGame}
        activeTagFilters={activeTagFilters}
      />
      <AddGameForm
        key={editingGame?.id ?? `new-${formKey}`}
        isOpen={isFormOpen}
        onClose={handleFormClose}
        onSubmit={handleFormSubmit}
        editingGame={editingGame}
        onUpdate={handleFormUpdate}
      />
      <ConfirmDialog
        isOpen={gameToDelete !== null}
        title="Delete Game"
        message={`Are you sure you want to delete "${gameToDeleteTitle}"? This action cannot be undone.`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
      <TagManagerDialog
        isOpen={isTagManagerOpen}
        onClose={() => setIsTagManagerOpen(false)}
      />
    </div>
  );
}

export default App;
