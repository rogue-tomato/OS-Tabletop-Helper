var _a;
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
// To deploy under https://<user>.github.io/<repo>/, set BASE to "/<repo>/".
// For a custom domain or user/organization page at the root, leave it as "/".
// You can also set the VITE_BASE env var when running build.
var BASE = (_a = process.env.VITE_BASE) !== null && _a !== void 0 ? _a : '/';
export default defineConfig({
    plugins: [react()],
    base: BASE,
    build: {
        outDir: 'dist',
        sourcemap: false,
    },
    server: {
        // Cloudflare quick tunnels rotate the subdomain on every restart.
        // The leading "." matches any subdomain of trycloudflare.com so we
        // don't need to edit this file each time the tunnel URL changes.
        allowedHosts: ['.trycloudflare.com'],
    },
});
