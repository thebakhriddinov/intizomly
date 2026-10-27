import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

function adminApiPlugin() {
  return {
    name: 'admin-api-plugin',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.url && req.url.startsWith('/api/admin')) {
          try {
            const { handleAdminApi } = await import('../backend/adminHandler.js');
            const handled = await handleAdminApi(req, res);
            if (handled) return;
          } catch (err) {
            console.error('[Vite Admin API Middleware Error]:', err);
            res.statusCode = 500;
            res.end(JSON.stringify({ success: false, message: err.message }));
            return;
          }
        }
        next();
      });
    }
  };
}

export default defineConfig({
  plugins: [react(), adminApiPlugin()],
  build: {
    target: 'es2020',
    cssCodeSplit: true,
    chunkSizeWarningLimit: 800,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom'],
          'vendor-supabase': ['@supabase/supabase-js']
        }
      }
    }
  },
  server: {
    host: '0.0.0.0',
    port: process.env.PORT ? parseInt(process.env.PORT) : 5173,
    open: false
  },
  preview: {
    host: '0.0.0.0',
    port: process.env.PORT ? parseInt(process.env.PORT) : 4173
  }
});
