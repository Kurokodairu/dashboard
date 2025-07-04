import { useEffect, useState } from 'react'
import { Newspaper, RefreshCcw } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const VGCard = () => {
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  const fetchSummaries = async () => {
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
  }

  // Initial + interval refresh every 30 minutes
  useEffect(() => {
    fetchSummaries()
    const interval = setInterval(fetchSummaries, 30 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

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
        <motion.div
          className="news-list"
          initial="hidden"
          animate="visible"
          variants={{
            visible: { transition: { staggerChildren: 0.15 } },
          }}
        >
          <AnimatePresence>
            {data.summaries.map((item, idx) => (
              <motion.div
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
              </motion.div>
            ))}
          </AnimatePresence>
          <p className="timestamp text-sm">
            Last updated:{' '}
            {new Date(data.updated || Date.now()).toLocaleTimeString('nb-NO', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        </motion.div>
      )}

      <style>{`
        .refresh-button {
          background: none;
          border: none;
          margin-left: auto;
          cursor: pointer;
          color: white;
          opacity: 0.6;
          transition: opacity 0.2s ease;
        }

        .refresh-button:hover {
          opacity: 1;
        }

        .news-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          margin-top: 1rem;
        }

        .news-item {
          background: rgba(255, 255, 255, 0.05);
          padding: 1rem;
          border-radius: 8px;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .news-link {
          font-weight: 600;
          color: white;
          text-decoration: none;
        }

        .news-link:hover {
          text-decoration: underline;
        }

        .summary {
          font-size: 0.9rem;
          margin-top: 0.5rem;
          opacity: 0.85;
        }

        .timestamp {
          margin-top: 0.5rem;
          text-align: right;
          opacity: 0.6;
        }

        .loading, .error {
          padding: 1.5rem;
          text-align: center;
          opacity: 0.7;
        }

        .spinner {
          width: 18px;
          height: 18px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top: 2px solid white;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto 1rem;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}

export default VGCard
