import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/',
  build: {
    outDir: 'public',
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('proxy error', err);
          });
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            // Rewrite Origin header to avoid backend CORS rejection in dev
            try {
              const currentOrigin = proxyReq.getHeader('origin');
              if (currentOrigin) {
                // Set origin to backend target so server-side CORS allows it
                proxyReq.setHeader('origin', 'http://localhost:3000');
              }
            } catch (e) {
              // noop
            }
            console.log('Sending Request to the Target:', req.method, req.url);
          });
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            console.log('Received Response from the Target:', proxyRes.statusCode, req.url);
          });
        },
      },
    },
  },
  define: {
    // Define global constants for environment detection
    __IS_DEV__: JSON.stringify(process.env.NODE_ENV === 'development'),
    __IS_PROD__: JSON.stringify(process.env.NODE_ENV === 'production'),
  },
});
