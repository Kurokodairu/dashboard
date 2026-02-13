/**
 * Google Calendar API handler
 * Returns upcoming calendar events
 * Supports:
 * 1) Public Google Calendar link/ID via ICS (no API key required)
 * 2) Google Calendar API (requires GOOGLE_CALENDAR_API_KEY)
 */

import ical from 'node-ical'

function extractCalendarId(input = '') {
  const trimmed = String(input).trim()
  if (!trimmed) return ''

  // Direct calendar ID/email
  if (trimmed.includes('@') && !trimmed.startsWith('http')) {
    return trimmed
  }

  // URL forms
  try {
    const url = new URL(trimmed)

    // common embed/public URL: .../calendar/embed?src=<calendarId>
    const src = url.searchParams.get('src')
    if (src) return src

    // API style path: .../calendars/<id>/events
    const match = url.pathname.match(/\/calendars\/([^/]+)\//)
    if (match && match[1]) {
      return decodeURIComponent(match[1])
    }
  } catch {
    // ignore parsing errors and fall through
  }

  return trimmed
}

function getIcsUrl(calendarInput = '') {
  const trimmed = String(calendarInput).trim()
  if (!trimmed) return ''

  // Already an ICS URL
  if (/^https?:\/\/.*\.ics(\?.*)?$/i.test(trimmed)) {
    return trimmed
  }

  // If a URL is provided, try to extract src=<calendarId>
  try {
    const url = new URL(trimmed)
    const src = url.searchParams.get('src')
    if (src) {
      return `https://calendar.google.com/calendar/ical/${encodeURIComponent(src)}/public/basic.ics`
    }
  } catch {
    // fall through
  }

  // If plain calendar ID/email is provided
  if (trimmed.includes('@')) {
    return `https://calendar.google.com/calendar/ical/${encodeURIComponent(trimmed)}/public/basic.ics`
  }

  return ''
}

function normalizeEvents(items = []) {
  return items
    .filter((event) => event && event.start instanceof Date)
    .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())
    .slice(0, 20)
    .map((event, index) => ({
      id: event.uid || event.id || `${event.summary || 'event'}-${index}`,
      summary: event.summary || 'No title',
      description: event.description || '',
      start: {
        dateTime: new Date(event.start).toISOString()
      },
      end: {
        dateTime: new Date(event.end || event.start).toISOString()
      },
      htmlLink: event.url || ''
    }))
}

export default async function calendarHandler(req, res) {
  try {
    const apiKey = process.env.GOOGLE_CALENDAR_API_KEY
    const rawCalendarInput = String(req.query?.calendarLink || process.env.GOOGLE_CALENDAR_ID || '').trim()

    // 1) Preferred path: public calendar link/ID via ICS (no API key needed)
    if (rawCalendarInput) {
      const icsUrl = getIcsUrl(rawCalendarInput)
      if (icsUrl) {
        const parsed = await ical.async.fromURL(icsUrl)
        const now = Date.now()
        const horizon = now + (7 * 24 * 60 * 60 * 1000)

        const icsEvents = Object.values(parsed)
          .filter((item) => item.type === 'VEVENT')
          .filter((item) => {
            const startMs = new Date(item.start).getTime()
            return Number.isFinite(startMs) && startMs >= now && startMs <= horizon
          })

        const events = normalizeEvents(icsEvents)

        res.setHeader('Cache-Control', 'public, max-age=900')
        return res.status(200).json({
          source: 'ics',
          events,
          count: events.length
        })
      }
    }

    // 2) Fallback path: Google Calendar API (requires API key)
    const calendarId = extractCalendarId(rawCalendarInput) || 'primary'

    if (!apiKey) {
      return res.status(200).json({
        error: 'Calendar not configured',
        message: 'Provide a public calendar link/ID in Settings or set GOOGLE_CALENDAR_API_KEY',
        events: []
      })
    }

    // Get events from now to 7 days ahead
    const timeMin = new Date().toISOString()
    const timeMax = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()

    const url = new URL('https://www.googleapis.com/calendar/v3/calendars/' + encodeURIComponent(calendarId) + '/events')
    url.searchParams.set('key', apiKey)
    url.searchParams.set('timeMin', timeMin)
    url.searchParams.set('timeMax', timeMax)
    url.searchParams.set('singleEvents', 'true')
    url.searchParams.set('orderBy', 'startTime')
    url.searchParams.set('maxResults', '20')

    const response = await fetch(url.toString())

    if (!response.ok) {
      const body = await response.text()
      throw new Error(`Google Calendar API error: ${response.status} ${response.statusText} ${body}`)
    }

    const data = await response.json()

    const events = normalizeEvents((data.items || []).map(event => ({
      id: event.id,
      uid: event.id,
      summary: event.summary,
      description: event.description,
      start: event.start?.dateTime || event.start?.date,
      end: event.end?.dateTime || event.end?.date,
      url: event.htmlLink
    })))

    res.setHeader('Cache-Control', 'public, max-age=900') // Cache for 15 minutes
    return res.status(200).json({
      source: 'google-api',
      events,
      count: events.length
    })

  } catch (error) {
    console.error('[calendar] Error:', error.message)
    return res.status(200).json({
      error: 'Failed to fetch calendar events',
      message: error.message,
      events: []
    })
  }
}
