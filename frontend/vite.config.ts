import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [svelte()],
  resolve: {
    alias: {
      // Allow importing from the project root
      '@resources': path.resolve(__dirname, '..', 'resources'),
    },
  },
  server: {
    // Serve the resources directory for static assets (cover images, STL files, etc.)
    fs: {
      allow: [
        // Allow serving files from the project root (for resources/)
        path.resolve(__dirname, '..'),
      ],
    },
  },
})
