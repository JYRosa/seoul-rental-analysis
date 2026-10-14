// 빌드 전에 dist/ 를 삭제한다.
// Windows의 Node 24 일부 버전에서 fs.rmSync가 한글 등 비 ASCII 경로에서 비정상 종료되는 문제가 있어,
// Vite의 emptyOutDir(rmSync 사용) 대신 unlinkSync / rmdirSync 로 직접 삭제한다.
import { existsSync, readdirSync, rmdirSync, unlinkSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

function removeDir(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const target = join(dir, entry.name)
    if (entry.isDirectory()) removeDir(target)
    else unlinkSync(target)
  }
  rmdirSync(dir)
}

const distDir = fileURLToPath(new URL('../dist', import.meta.url))
if (existsSync(distDir)) removeDir(distDir)
