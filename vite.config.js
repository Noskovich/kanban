import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// base — имя репозитория на GitHub Pages, с слешами по краям.
// Если сайт будет на корне (репозиторий username.github.io), поставь '/'.
export default defineConfig({
  base: '/kanban-board/',
  plugins: [react()],
})
