import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import legacy from '@vitejs/plugin-legacy';
/// <reference types="vitest" />

function handleModuleDirectivesPlugin() {
  return {
    name: 'handle-module-directives-plugin',
    transform(code, id) {
      if (id.includes('@vkontakte/icons')) {
        code = code.replace(/"use-client";?/g, '');
      }
      return { code };
    },
  };
}

/**
 * Some chunks may be large.
 * This will not affect the loading speed of the site.
 * We collect several versions of scripts that are applied depending on the browser version.
 * This is done so that your code runs equally well on the site and in the odr.
 * The details are here: https://dev.vk.com/mini-apps/development/on-demand-resources.
 */
export default defineConfig({
  base: './',

  server: {
    allowedHosts: ['85d9-57-129-46-106.ngrok-free.app',
      '3e6c-57-129-46-106.ngrok-free.app',
      '2561-57-129-46-106.ngrok-free.app',
      'cc2e-57-129-46-106.ngrok-free.app',
      'cd8f-57-129-46-106.ngrok-free.app',
      'ngrok-free.app'],
    cors: {
      origin: ['https://vk.com', 'https://vk.ru', 'https://m.vk.com'],
      credentials: true
    }
  },

  plugins: [
    react(),
    handleModuleDirectivesPlugin(),
    legacy({
      targets: ['defaults', 'not IE 11'],
    }),
  ],

  build: {
    outDir: 'build',
  },

  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    css: true,
    include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/coverage/**',
        'src/**/*.test.*',
        'src/**/*.spec.*',
      ],
    },
  },
});
