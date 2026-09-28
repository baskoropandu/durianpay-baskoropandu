import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Serve index.html for unknown paths so client-side routes work on refresh.
  appType: 'spa',
  server: {
    port: 5173,
    // Proxy API calls to the Go backend during development to avoid CORS issues.
    // Only forward the API prefix, not the frontend /dashboard route.
    proxy: {
      '/dashboard/v1': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
  },
});
