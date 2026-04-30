import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// To deploy under https://<user>.github.io/<repo>/, set BASE to "/<repo>/".
// For a custom domain or user/organization page at the root, leave it as "/".
// You can also set the VITE_BASE env var when running build.
const BASE = process.env.VITE_BASE ?? '/';

export default defineConfig({
  plugins: [react()],
  base: BASE,
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
});
