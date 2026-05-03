import { defineConfig } from 'vite';
import { resolve } from 'path';
import { VitePWA } from 'vite-plugin-pwa';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  root: resolve(__dirname, 'src'),
  envDir: resolve(__dirname),
  publicDir: resolve(__dirname, 'src', 'public'),
  build: {
    outDir: resolve(__dirname, 'dist'),
    emptyOutDir: true,
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  plugins: [
    tailwindcss(),
    VitePWA({
      strategies: 'injectManifest',
      srcDir: '.',
      filename: 'sw.js',
      injectManifest: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
      },
      devOptions: {
        enabled: true,
        type: 'module',
      },
      manifest: {
        id: '/#/',
        start_url: '/#/',
        scope: '/',
        name: 'Storiy Board',
        short_name: 'Storiy',
        description:
          'A web-based storyboard app that lets users create, share, and explore location-based stories with interactive maps and real-time updates.',
        display: 'standalone',
        background_color: '#FFFFFF',
        theme_color: '#70a5e0',
        screenshots: [
          {
            src: 'images/screenshots/storiy-board-001.png',
            sizes: '1920x1043',
            type: 'image/png',
            form_factor: 'wide',
          },
          {
            src: 'images/screenshots/storiy-board-002.png',
            sizes: '1920x1043',
            type: 'image/png',
            form_factor: 'wide',
          },
          {
            src: 'images/screenshots/storiy-board-003.png',
            sizes: '1920x1043',
            type: 'image/png',
            form_factor: 'wide',
          },
          {
            src: 'images/screenshots/storiy-board-004.png',
            sizes: '1080x2280',
            type: 'image/png',
            form_factor: 'narrow',
          },
          {
            src: 'images/screenshots/storiy-board-005.png',
            sizes: '1080x2280',
            type: 'image/png',
            form_factor: 'narrow',
          },
          {
            src: 'images/screenshots/storiy-board-006.png',
            sizes: '1080x2280',
            type: 'image/png',
            form_factor: 'narrow',
          },
        ],
        icons: [
          {
            src: 'images/icons/icon-x144.png',
            type: 'image/png',
            sizes: '144x144',
            purpose: 'any',
          },
          {
            src: 'images/icons/maskable-icon-x48.png',
            type: 'image/png',
            sizes: '48x48',
            purpose: 'maskable',
          },
          {
            src: 'images/icons/maskable-icon-x96.png',
            type: 'image/png',
            sizes: '96x96',
            purpose: 'maskable',
          },
          {
            src: 'images/icons/maskable-icon-x192.png',
            type: 'image/png',
            sizes: '192x192',
            purpose: 'maskable',
          },
          {
            src: 'images/icons/maskable-icon-x384.png',
            type: 'image/png',
            sizes: '384x384',
            purpose: 'maskable',
          },
          {
            src: 'images/icons/maskable-icon-x512.png',
            type: 'image/png',
            sizes: '512x512',
            purpose: 'maskable',
          },
        ],
        shortcuts: [
          {
            name: 'New Story',
            short_name: 'New',
            description: 'Share something interesting to others.',
            url: '/?source=pwa#/new-story',
            icons: [
              {
                src: 'images/icons/add-x512.png',
                type: 'image/png',
                sizes: '512x512',
              },
            ],
          },
          {
            name: 'Saved Stories',
            short_name: 'Saved',
            description: `See interesting stories you've saved`,
            url: '/?source=pwa#/saved-stories',
            icons: [
              {
                src: 'images/icons/bookmark-x512.png',
                type: 'image/png',
                sizes: '512x512',
              },
            ],
          },
        ],
      },
    }),
  ],
});
