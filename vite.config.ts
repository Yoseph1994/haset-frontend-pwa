import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import { fileURLToPath, URL } from 'node:url'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'apple-touch-icon.png'],
      manifest: {
        name: 'MAMS — Manpower Marketplace',
        short_name: 'MAMS',
        description: 'Find verified workers or gig jobs near you.',
        theme_color: '#3880ff',
        background_color: '#3880ff',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        icons: [
          { src: 'icons/icon-48.webp', sizes: '48x48', type: 'image/webp' },
          { src: 'icons/icon-72.webp', sizes: '72x72', type: 'image/webp' },
          { src: 'icons/icon-96.webp', sizes: '96x96', type: 'image/webp' },
          { src: 'icons/icon-128.webp', sizes: '128x128', type: 'image/webp' },
          { src: 'icons/icon-192.webp', sizes: '192x192', type: 'image/webp', purpose: 'any' },
          { src: 'icons/icon-192.webp', sizes: '192x192', type: 'image/webp', purpose: 'maskable' },
          { src: 'icons/icon-256.webp', sizes: '256x256', type: 'image/webp' },
          { src: 'icons/icon-512.webp', sizes: '512x512', type: 'image/webp', purpose: 'any' },
          { src: 'icons/icon-512.webp', sizes: '512x512', type: 'image/webp', purpose: 'maskable' },
        ],
      },
      workbox: {
        // Native app shells (Capacitor) load from capacitor://localhost, not http —
        // never try to precache/navigate-fallback there, only for the real PWA/web build.
        navigateFallbackDenylist: [/^\/api/],
      },
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    host: true,
    port: 5173,
  },
})
