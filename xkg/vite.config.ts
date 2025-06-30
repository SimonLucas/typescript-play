import { defineConfig } from 'vite';

export default defineConfig({
  base: '/typescript-play/',  // 👈 matches GitHub Pages URL path
  server: {
    port: 5173
  }
});
