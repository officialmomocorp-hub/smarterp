const { defineConfig } = require('vite');
const react = require('@vitejs/plugin-react');
const path = require('path');

module.exports = defineConfig({
  base: '/',
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    // Disable modulepreload to avoid potential sync errors in some environments
    modulePreload: false,
    rollupOptions: {
      output: {
        // Ensure manual chunks are stable
        manualChunks: undefined
      }
    }
  }
});
