import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { GameLibraryProvider } from './contexts/GameLibraryContext'
import { AuthProvider } from './contexts/AuthContext'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <GameLibraryProvider>
        <App />
      </GameLibraryProvider>
    </AuthProvider>
  </StrictMode>,
)
