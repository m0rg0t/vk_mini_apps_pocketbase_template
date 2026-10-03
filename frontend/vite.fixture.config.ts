import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';
// Separate test-only config. Production vite.config.ts has no mock aliases.
export default defineConfig({
  plugins: [react()],
  resolve: { alias: { 'vk-helpers': fileURLToPath(new URL('./tests/browser/signing.ts', import.meta.url)) } },
});
