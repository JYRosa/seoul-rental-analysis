import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// 앱 코드와 라이브러리를 분리해 브라우저 캐시를 활용한다.
function vendorChunk(id) {
  if (!id.includes('node_modules')) return undefined
  if (/node_modules[\/](react|react-dom|scheduler)[\/]/.test(id)) return 'react'
  return 'vendor'
}

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: vendorChunk,
      },
    },
  },
})
