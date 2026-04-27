import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [tailwindcss(), sveltekit()],
  ssr: {
    external: ['bun:sqlite'],
    noExternal: ['@budden/core', '@budden/config', '@budden/mcp', '@budden/shared'],
  },
  optimizeDeps: {
    exclude: ['bun:sqlite'],
  },
});
