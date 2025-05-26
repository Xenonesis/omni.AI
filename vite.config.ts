import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react()],
    optimizeDeps: {
      exclude: ['lucide-react'],
      include: ['framer-motion', 'react', 'react-dom', 'react-router-dom'],
    },
    define: {
      // Make environment variables available to the app
      __APP_ENV__: JSON.stringify(env.VITE_APP_ENVIRONMENT || mode),
    },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          animations: ['framer-motion'],
          ui: ['lucide-react'],
          charts: ['recharts'],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
    sourcemap: false,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug'],
      },
      mangle: {
        safari10: true,
      },
    },
    target: 'es2020',
    cssCodeSplit: true,
    assetsInlineLimit: 4096,
  },
    server: {
      hmr: {
        overlay: false,
      },
      proxy: {
        // Proxy API requests to the local server in development
        '/api': {
          target: env.VITE_API_URL || 'http://localhost:3001',
          changeOrigin: true,
          secure: false,
        },
      },
    },
    preview: {
      port: 4173,
      host: true,
    },
  };
});
