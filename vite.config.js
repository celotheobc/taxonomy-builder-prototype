import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => ({
  base: mode === 'ghpages' ? '/taxonomy-builder-prototype/' : '/',
  plugins: [react()],
  server: {
    port: 5199,
    strictPort: true,
    open: true,
    host: '127.0.0.1',
  },
  preview: {
    port: 5199,
    strictPort: true,
    open: true,
    host: '127.0.0.1',
  },
}));
