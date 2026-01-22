import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { hltbPlugin } from './vite-hltb-plugin'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), hltbPlugin()],
})
