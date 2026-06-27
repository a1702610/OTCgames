import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve, join, extname, sep } from 'path'
import { fileURLToPath } from 'url'
import { existsSync, readFileSync, statSync, createReadStream } from 'fs'
import { exec } from 'child_process'

const __dirname = fileURLToPath(new URL('.', import.meta.url))

// Vite plugin: in dev mode, exposes /api/build (triggers npm run build) and
// serves the resulting dist/ files so the export can fetch the manifest + assets.
function autoExportPlugin() {
  return {
    name: 'auto-export',
    configureServer(server) {
      const MIME = {
        '.json': 'application/json',
        '.js':   'application/javascript',
        '.css':  'text/css',
        '.woff2': 'font/woff2',
        '.woff':  'font/woff',
        '.ttf':   'font/ttf',
      }

      // Serve built assets from dist/ (manifest + JS/CSS chunks + built index.html)
      // /dist-index.html → dist/index.html  (avoids Vite intercepting /index.html)
      server.middlewares.use((req, res, next) => {
        const fromDist =
          req.url === '/.vite/manifest.json' ||
          req.url?.startsWith('/assets/') ||
          req.url === '/dist-index.html'

        if (fromDist) {
          const distRelPath = req.url === '/dist-index.html' ? '/index.html' : req.url
          const filePath = join(__dirname, 'dist', distRelPath)
          if (existsSync(filePath)) {
            const content = readFileSync(filePath)
            res.setHeader('Content-Type', MIME[extname(filePath)] || 'application/octet-stream')
            res.setHeader('Cache-Control', 'no-store')
            res.end(content)
            return
          }
        }
        next()
      })

      // Build API — POST /api/build triggers npm run build
      server.middlewares.use('/api/build', (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405
          res.end('Method Not Allowed')
          return
        }
        exec('npm run build', { cwd: __dirname }, (err, _stdout, stderr) => {
          res.setHeader('Content-Type', 'application/json')
          if (err) {
            res.statusCode = 500
            res.end(JSON.stringify({ error: stderr || err.message }))
          } else {
            res.end(JSON.stringify({ success: true }))
          }
        })
      })
    },
  }
}

// Serves /medications/... from IMAGE_LIBRARY_PATH (set in .env.local) when
// public/medications/ doesn't exist locally — lets lecturers point to OneDrive.
function imageLibraryPlugin() {
  return {
    name: 'image-library',
    configureServer(server) {
      const libPath = process.env.IMAGE_LIBRARY_PATH
      if (!libPath) return
      console.log(`[image-library] serving /medications from: ${libPath}`)

      server.middlewares.use((req, res, next) => {
        if (!req.url?.startsWith('/medications/')) return next()

        const relativeUrl = req.url.slice('/medications/'.length).split('?')[0]
        const filePath = join(
          libPath,
          ...relativeUrl.split('/').map(decodeURIComponent)
        )

        if (existsSync(filePath) && statSync(filePath).isFile()) {
          const mime = { '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp' }
          res.setHeader('Content-Type', mime[extname(filePath).toLowerCase()] || 'application/octet-stream')
          res.setHeader('Cache-Control', 'public, max-age=3600')
          createReadStream(filePath).pipe(res)
        } else {
          next()
        }
      })
    },
  }
}

export default defineConfig({
  plugins: [react(), autoExportPlugin(), imageLibraryPlugin()],
  build: {
    manifest: true,
    rollupOptions: {
      input: {
        main:    resolve(__dirname, 'index.html'),
        builder: resolve(__dirname, 'builder.html'),
      },
      output: {
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[chunk]-[hash].js',
        assetFileNames: 'assets/[name]-[hash][extname]',
      },
    },
    outDir:     'dist',
    assetsDir:  'assets',
  },
  server: { port: 5173 },
})
