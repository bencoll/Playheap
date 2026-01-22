import { useContext } from 'react';
import { GameLibraryContext } from './GameLibraryContextDef';

export function useGameLibrary() {
  const context = useContext(GameLibraryContext);
  if (!context) {
    throw new Error('useGameLibrary must be used within a GameLibraryProvider');
  }
  return context;
}
