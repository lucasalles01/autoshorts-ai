import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // In production, use actual domain from environment
  // In development, use environment variable or default to /
  const base = mode === 'production' 
    ? import.meta.env.VITE_BASE_URL || '/'
    : import.meta.env.VITE_BASE_URL || '/';

  return {
    plugins: [react()],
    base,
    server: {
      port: 3000,
      host: true,
      allowedHosts: [
        'localhost',
        '.ngrok-free.dev',
        '.vercel.app',
        '.onrender.com'
      ],
      proxy: {
        '/api': {
          target: 'http://localhost:3001',
          changeOrigin: true
        }
      }
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom'],
            lucide: ['lucide-react']
          }
        }
      }
    }
  };
});
