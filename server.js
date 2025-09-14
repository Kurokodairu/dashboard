import express from 'express'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'

// Helper to import default-exported handlers as functions
async function loadHandler(modulePath) {
  const mod = await import(modulePath)
  return mod.default || mod
}

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const port = process.env.PORT || 8080

// Trust proxy if behind reverse proxy
app.set('trust proxy', true)

// Basic health endpoint
app.get('/healthz', (req, res) => res.status(200).json({ ok: true }))

// JSON body just in case (most endpoints are GET)
app.use(express.json())

// Serve static assets from dist
const distDir = path.join(__dirname, 'dist')
app.use(express.static(distDir))

// API routes wired to existing handlers
const apiRouter = express.Router()

// Public runtime config for the client (safe values only)
apiRouter.get('/config', (req, res) => {
  const twitchClientId = process.env.VITE_TWITCH_CLIENT_ID || process.env.TWITCH_CLIENT_ID || ''
  const twitchRedirectUri = process.env.VITE_TWITCH_REDIRECT_URI || process.env.TWITCH_REDIRECT_URI || ''

  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Cache-Control', 'public, max-age=300')
  return res.status(200).json({
    twitchClientId,
    twitchRedirectUri
  })
})

apiRouter.get('/weather', async (req, res) => (await loadHandler('./api/weather.js'))(req, res))
apiRouter.get('/crypto', async (req, res) => (await loadHandler('./api/crypto.js'))(req, res))
apiRouter.get('/github', async (req, res) => (await loadHandler('./api/github.js'))(req, res))
apiRouter.get('/twitch', async (req, res) => (await loadHandler('./api/twitch.js'))(req, res))
apiRouter.get('/twitch-users', async (req, res) => (await loadHandler('./api/twitch-users.js'))(req, res))
apiRouter.get('/vg-summary', async (req, res) => (await loadHandler('./api/vg-summary.js'))(req, res))
apiRouter.get('/suggest', async (req, res) => (await loadHandler('./api/suggest.js'))(req, res))
apiRouter.get('/command', async (req, res) => (await loadHandler('./api/command.js'))(req, res))

// Preflight for all /api routes
apiRouter.options('*', (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Client-Id')
  res.status(200).end()
})

app.use('/api', apiRouter)

// SPA fallback
app.get('*', (req, res) => {
  const indexPath = path.join(distDir, 'index.html')
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath)
  } else {
    res.status(500).send('Build not found. Please run build first.')
  }
})

app.listen(port, () => {
  console.log(`[server] listening on http://0.0.0.0:${port}`)
})
