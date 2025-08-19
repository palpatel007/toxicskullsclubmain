import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // Optimize build for large asset imports
    rollupOptions: {
              output: {
          manualChunks: {
            // Separate vendor chunks
            vendor: ['react', 'react-dom'],
            three: ['three'],
            ui: ['lucide-react'],
          },
        },
    },
    // Increase memory limit for build
    chunkSizeWarningLimit: 2000,
    // Optimize asset handling
    assetsInlineLimit: 4096, // 4kb
  },
  optimizeDeps: {
    // Pre-bundle large dependencies
    include: ['three', 'lucide-react'],
  },
}));
