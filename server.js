import express from 'express'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'
import weatherHandler from './api/weather.js'
import cryptoHandler from './api/crypto.js'
import githubHandler from './api/github.js'
import twitchHandler from './api/twitch.js'
import twitchUsersHandler from './api/twitch-users.js'
import vgSummaryHandler from './api/vg-summary.js'
import suggestHandler from './api/suggest.js'
import commandHandler from './api/command.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const port = process.env.PORT || 8080

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


apiRouter.get('/weather', weatherHandler)
apiRouter.get('/crypto', cryptoHandler)
apiRouter.get('/github', githubHandler)
apiRouter.get('/twitch', twitchHandler)
apiRouter.get('/twitch-users', twitchUsersHandler)
apiRouter.get('/vg-summary', vgSummaryHandler)
apiRouter.get('/suggest', suggestHandler)
apiRouter.get('/command', commandHandler)

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
