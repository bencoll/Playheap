import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { GameLibraryProvider } from './contexts/GameLibraryContext'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <GameLibraryProvider>
      <App />
    </GameLibraryProvider>
  </StrictMode>,
)
