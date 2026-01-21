import { useState } from 'react';
import { Header } from './components/Header';
import { Board } from './components/Board';
import { AddGameForm } from './components/AddGameForm';
import { useGameLibrary } from './contexts/GameLibraryContext';
import type { Game, Platform } from './types';
import styles from './App.module.css';

function App() {
  const { addGame, updateGame, deleteGame } = useGameLibrary();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingGame, setEditingGame] = useState<Game | null>(null);

  const handleAddGame = () => {
    setEditingGame(null);
    setIsFormOpen(true);
  };

  const handleEditGame = (game: Game) => {
    setEditingGame(game);
    setIsFormOpen(true);
  };

  const handleDeleteGame = (id: string) => {
    deleteGame(id);
  };

  const handleFormSubmit = (title: string, platforms: Platform[]) => {
    addGame(title, platforms);
  };

  const handleFormUpdate = (id: string, title: string, platforms: Platform[]) => {
    updateGame(id, { title, platforms });
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingGame(null);
  };

  return (
    <div className={styles.app}>
      <Header onAddGame={handleAddGame} />
      <Board onEditGame={handleEditGame} onDeleteGame={handleDeleteGame} />
      <AddGameForm
        isOpen={isFormOpen}
        onClose={handleFormClose}
        onSubmit={handleFormSubmit}
        editingGame={editingGame}
        onUpdate={handleFormUpdate}
      />
    </div>
  );
}

export default App;
