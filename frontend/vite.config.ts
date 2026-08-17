import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Load environment variables with fallback
  const env = loadEnv(mode, process.cwd(), '');
  
  // In production, use root path
  // In development, use environment variable or default to /
  const base = '/';

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
