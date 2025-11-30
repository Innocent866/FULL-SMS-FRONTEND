import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: process.env.VITE_API_BASE_URL || 'https://full-sms-backend.onrender.com/',
        changeOrigin: true
      }
    }
  },
  base: process.env.VITE_BASE_PATH || "/FULL-SMS-FRONTEND",
});
