import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'


// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [
      react(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
        manifest: {
          name: 'Suhoor - Wake up together',
          short_name: 'Suhoor',
          description: 'Wake up for Suhoor with your friends and family.',
          theme_color: '#0f172a',
          background_color: '#0f172a',
          display: 'standalone',
          icons: [
            {
              src: 'pwa-192x192.png',
              sizes: '192x192',
              type: 'image/png'
            },
            {
              src: 'pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png'
            }
          ]
        }
      })
    ],
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            'vendor-react': ['react', 'react-dom', 'react-router-dom'],
            'vendor-firebase-core': ['firebase/app', 'firebase/auth'],
            'vendor-firebase-db': ['firebase/firestore', 'firebase/storage'],
            'vendor-ui-libs': ['framer-motion', 'lucide-react'],
            'vendor-charts': ['chart.js', 'react-chartjs-2'],
            'vendor-capacitor': ['@capacitor/core', '@capacitor/geolocation', '@capacitor/local-notifications'],
            'vendor-utils': ['socket.io-client', 'cors']
          }
        }
      },
      chunkSizeWarningLimit: 1000,
      sourcemap: false,
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: mode === 'production',
        }
      }
    }
  }
})
