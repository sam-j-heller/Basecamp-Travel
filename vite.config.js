import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // For GitHub Pages served from a repo subpath (username.github.io/repo-name),
  // set VITE_BASE_PATH=/repo-name/ when building. Leave unset for Vercel/Netlify/custom domains.
  base: process.env.VITE_BASE_PATH || '/',
})
