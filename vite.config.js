import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  console.log('🔍 Vite Environment Variables:')
  console.log('VITE_FIREBASE_API_KEY:', env.VITE_FIREBASE_API_KEY)
  console.log('VITE_FIREBASE_PROJECT_ID:', env.VITE_FIREBASE_PROJECT_ID)

  return {
    plugins: [react()],
  }
})
