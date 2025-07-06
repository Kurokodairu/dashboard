import fs from 'fs'
import path from 'path'

// api/command.js
let cached = null
let lastFetch = 0

const TTL = 1000 * 60 * 60 * 12 // 12 hours

const commands = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'public/cheats.json'), 'utf8'))

export default async function handler(req, res) {
    const now = Date.now()
    if (!cached || now - lastFetch > TTL) {
        cached = commands[Math.floor(Math.random() * commands.length)]
        lastFetch = now
    }

    res.status(200).json(cached)
}
