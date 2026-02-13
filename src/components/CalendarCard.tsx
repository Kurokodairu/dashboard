import { useState, useEffect } from 'react'
import { Calendar as CalendarIcon, Clock, ExternalLink, RefreshCw } from 'lucide-react'
import logger from '../utils/logger'
import useSettingsStore from '../stores/settingsStore.js'
import './CalendarCard.css'

interface CalendarEvent {
  id: string
  summary: string
  description?: string
  start: {
    dateTime: string
    timeZone?: string
  }
  end: {
    dateTime: string
    timeZone?: string
  }
  htmlLink?: string
}

const CalendarCard = () => {
  const calendarLink = useSettingsStore((state) => state.calendarLink)
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastFetch, setLastFetch] = useState<Date | null>(null)

  const fetchEvents = async () => {
    setLoading(true)
    setError(null)

    try {
      const query = calendarLink ? `?calendarLink=${encodeURIComponent(calendarLink)}` : ''
      const response = await fetch(`/api/calendar${query}`)
      
      if (!response.ok) {
        throw new Error(`Failed to fetch calendar events: ${response.statusText}`)
      }

      const data = await response.json()
      setEvents(data.events || [])
      setLastFetch(new Date())
      logger.info('Calendar events fetched successfully')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch calendar'
      setError(message)
      logger.error('Calendar fetch error:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEvents()
    // Refresh every 30 minutes
    const interval = setInterval(fetchEvents, 30 * 60 * 1000)
    return () => clearInterval(interval)
  }, [calendarLink])

  const formatEventTime = (dateTimeStr: string) => {
    const date = new Date(dateTimeStr)
    return date.toLocaleTimeString('nb-NO', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    })
  }

  const formatEventDate = (dateTimeStr: string) => {
    const date = new Date(dateTimeStr)
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    if (date.toDateString() === today.toDateString()) {
      return 'Today'
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow'
    } else {
      return date.toLocaleDateString('nb-NO', {
        weekday: 'short',
        month: 'short',
        day: 'numeric'
      })
    }
  }

  const isEventNow = (start: string, end: string) => {
    const now = new Date()
    const startTime = new Date(start)
    const endTime = new Date(end)
    return now >= startTime && now <= endTime
  }

  // Group events by date
  const groupedEvents = events.reduce((groups, event) => {
    const dateKey = new Date(event.start.dateTime).toDateString()
    if (!groups[dateKey]) {
      groups[dateKey] = []
    }
    groups[dateKey].push(event)
    return groups
  }, {} as Record<string, CalendarEvent[]>)

  return (
    <div className="calendar-card glass-card">
      <div className="card-header">
        <div className="header-title">
          <CalendarIcon size={20} />
          <h2>Calendar</h2>
        </div>
        <button
          className="refresh-button"
          onClick={fetchEvents}
          disabled={loading}
          title="Refresh events"
        >
          <RefreshCw size={16} className={loading ? 'spinning' : ''} />
        </button>
      </div>

      <div className="calendar-content">
        {error && (
          <div className="error-message">
            <p>{error}</p>
            <button onClick={fetchEvents} className="retry-button">
              Retry
            </button>
          </div>
        )}

        {!error && events.length === 0 && !loading && (
          <div className="empty-state">
            <CalendarIcon size={32} opacity={0.3} />
            <p>No upcoming events</p>
          </div>
        )}

        {!error && events.length > 0 && (
          <div className="events-list">
            {Object.entries(groupedEvents).slice(0, 3).map(([dateKey, dateEvents]) => (
              <div key={dateKey} className="event-group">
                <div className="event-date-header">
                  {formatEventDate(dateEvents[0].start.dateTime)}
                </div>
                {dateEvents.slice(0, 5).map(event => (
                  <div
                    key={event.id}
                    className={`event-item ${isEventNow(event.start.dateTime, event.end.dateTime) ? 'event-now' : ''}`}
                  >
                    <div className="event-time">
                      <Clock size={14} />
                      <span>{formatEventTime(event.start.dateTime)}</span>
                    </div>
                    <div className="event-details">
                      <div className="event-summary">{event.summary}</div>
                      {event.description && (
                        <div className="event-description">
                          {event.description.substring(0, 80)}
                          {event.description.length > 80 ? '...' : ''}
                        </div>
                      )}
                    </div>
                    {event.htmlLink && (
                      <a
                        href={event.htmlLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="event-link"
                        title="Open in Google Calendar"
                      >
                        <ExternalLink size={14} />
                      </a>
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>

      {lastFetch && (
        <div className="calendar-footer">
          <span className="last-updated">
            Updated {lastFetch.toLocaleTimeString('nb-NO', { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      )}
    </div>
  )
}

export default CalendarCard
