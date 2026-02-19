// Frontend server for Railway
// - Serves static files from dist/
// - Proxies /sitemap.xml to the backend so Google gets the dynamic sitemap
// - Falls back to index.html for SPA routing
// Requires: VITE_API_URL env var (e.g. https://api.rodamallorca.es/api)
//           PORT env var (set automatically by Railway)

const http = require('http')
const https = require('https')
const fs = require('fs')
const path = require('path')

const PORT = process.env.PORT || 3000
const DIST = path.join(__dirname, 'dist')

// Derive backend base URL from VITE_API_URL by stripping the /api suffix
const BACKEND_BASE_URL = (process.env.VITE_API_URL || process.env.BACKEND_BASE_URL || '')
  .replace(/\/api\/?$/, '')
  .replace(/\/+$/, '')

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.xml': 'application/xml',
  '.txt': 'text/plain',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.webp': 'image/webp',
  '.map': 'application/json',
}

function proxyToBackend(req, res) {
  const target = `${BACKEND_BASE_URL}/sitemap.xml`
  const lib = target.startsWith('https') ? https : http
  const proxyReq = lib.get(target, (proxyRes) => {
    res.writeHead(proxyRes.statusCode, {
      'Content-Type': proxyRes.headers['content-type'] || 'application/xml',
      'Cache-Control': 'public, max-age=3600',
    })
    proxyRes.pipe(res)
  })
  proxyReq.on('error', () => serveStatic(res, '/sitemap.xml'))
}

function serveStatic(res, urlPath) {
  let filePath = path.join(DIST, urlPath)

  try {
    const stat = fs.statSync(filePath)
    if (stat.isDirectory()) filePath = path.join(filePath, 'index.html')
  } catch {
    // File not found — fall back to SPA index.html
    filePath = path.join(DIST, 'index.html')
  }

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404)
      res.end('Not found')
      return
    }
    const ext = path.extname(filePath)
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' })
    res.end(data)
  })
}

const server = http.createServer((req, res) => {
  const urlPath = req.url.split('?')[0]

  if (urlPath === '/sitemap.xml' && BACKEND_BASE_URL) {
    proxyToBackend(req, res)
    return
  }

  serveStatic(res, urlPath)
})

server.listen(PORT, () => {
  console.log(`Frontend server listening on port ${PORT}`)
  if (BACKEND_BASE_URL) {
    console.log(`Proxying /sitemap.xml → ${BACKEND_BASE_URL}/sitemap.xml`)
  } else {
    console.warn('BACKEND_BASE_URL not set — serving static sitemap.xml')
  }
})
