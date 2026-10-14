import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// 앱 코드와 라이브러리를 분리해 브라우저 캐시를 활용한다.
function vendorChunk(id) {
  if (!id.includes('node_modules')) return undefined
  if (/node_modules[\/](react|react-dom|scheduler)[\/]/.test(id)) return 'react'
  return 'vendor'
}

// GitHub Pages 프로젝트 사이트(https://<user>.github.io/seoul-rental-analysis/) 하위 경로.
// 코드에서는 경로를 직접 쓰지 않고 import.meta.env.BASE_URL 을 통해 참조한다.
const BASE_PATH = '/seoul-rental-analysis/'

export default defineConfig({
  base: BASE_PATH,
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: vendorChunk,
      },
    },
  },
})
