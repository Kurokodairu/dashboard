import fs from 'fs'
import path from 'path'

// api/command.js
let cached = null
let lastFetch = 0

const TTL = 1000 * 60 * 60 * 12 // 12 hours

function resolveCheatsPath() {
    const candidates = [
        path.join(process.cwd(), 'dist', 'cheats.json'),
        path.join(process.cwd(), 'dist', 'public', 'cheats.json'),
        path.join(process.cwd(), 'public', 'cheats.json')
    ]
    for (const p of candidates) {
        if (fs.existsSync(p)) return p
    }
    return null
}

let commands = []
const cheatsPath = resolveCheatsPath()
if (cheatsPath) {
    try {
        commands = JSON.parse(fs.readFileSync(cheatsPath, 'utf8'))
    } catch (e) {
        console.error('Failed to load cheats.json:', e)
    }
} else {
    console.warn('cheats.json not found in expected locations')
}

export default async function handler(req, res) {
    const now = Date.now()
    if (!cached || now - lastFetch > TTL) {
        cached = commands[Math.floor(Math.random() * commands.length)]
        lastFetch = now
    }

    res.status(200).json(cached)
}
