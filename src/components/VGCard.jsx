import { useState, useCallback } from 'react'
import { Newspaper, RefreshCcw } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import useAutoRefresh from '../hooks/AutoRefresh.js'
import './VGCard.css'

const Motion = motion

const VGCard = () => {
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  const fetchSummaries = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/vg-summary')
      const json = await res.json()

      if (!res.ok) throw new Error(json.error || 'Failed to load summaries')

      setData(json)
    } catch (err) {
      console.error('VG summary fetch failed:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useAutoRefresh(fetchSummaries, 30 * 60 * 1000)

  return (
    <div className="glass-card">
      <h2 className="card-title">
        <Newspaper size={24} />
        VG News
        <button className="refresh-button" onClick={fetchSummaries} title="Refresh">
          <RefreshCcw size={16} />
        </button>
      </h2>

      {loading && (
        <div className="loading">
          <div className="spinner" />
          <p>Summarizing headlines…</p>
        </div>
      )}

      {error && (
        <div className="error">
          <p>Error loading news:</p>
          <p className="text-sm">{error}</p>
        </div>
      )}

      {data?.summaries && (
        <Motion.div
          className="news-list"
          initial="hidden"
          animate="visible"
          variants={{
            visible: { transition: { staggerChildren: 0.15 } },
          }}
        >
          <AnimatePresence>
            {data.summaries.map((item, idx) => (
              <Motion.div
                key={item.guid || idx}
                className="news-item"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.4, delay: idx * 0.05 }}
              >
                <a href={item.link} target="_blank" rel="noopener noreferrer" className="news-link">
                  {item.title}
                </a>
                <p className="summary">{item.summary}</p>
              </Motion.div>
            ))}
          </AnimatePresence>
          <p className="timestamp text-sm">
            Last updated:{' '}
            {new Date(data.updated || Date.now()).toLocaleTimeString('nb-NO', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        </Motion.div>
      )}
    </div>
  )
}

export default VGCard
