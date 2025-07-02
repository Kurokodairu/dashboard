import { useState, useRef } from 'react'
import { Search, Bot } from 'lucide-react'

const SEARCH_ENGINES = [
  { name: 'Google', url: 'https://www.google.com/search?q=', icon: <Search size={18} /> },
  { name: 'Perplexity', url: 'https://www.perplexity.ai/search?q=', icon: <Bot size={18} /> }
]

const SmartSearchBar = () => {
  const [engineIndex, setEngineIndex] = useState(0)
  const inputRef = useRef(null)

  const currentEngine = SEARCH_ENGINES[engineIndex]

  const handleSubmit = (e) => {
    e.preventDefault()
    const query = inputRef.current.value.trim()
    if (!query) return

    window.open(`${currentEngine.url}${encodeURIComponent(query)}`, '_blank')
    inputRef.current.value = ''
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Tab') {
      e.preventDefault()
      setEngineIndex((prev) => (prev + 1) % SEARCH_ENGINES.length)
    }
  }

  return (
    <form className="search-bar" onSubmit={handleSubmit}>
      <div className="search-wrapper">
        <span className="search-icon">{currentEngine.icon}</span>
        <input
          type="text"
          ref={inputRef}
          className="search-input"
          placeholder={`Search with ${currentEngine.name}...`}
          onKeyDown={handleKeyDown}
          autoFocus
        />
        <span onClick={() => setEngineIndex((prev) => (prev + 1) % SEARCH_ENGINES.length)} className="engine-badge">{currentEngine.name}</span>
      </div>

      <style>{`
        .search-bar {
          display: flex;
          justify-content: center;
          width: 100%;
          margin: 0 0 2rem 0;
        }

        .search-wrapper {
          position: relative;
          width: 100%;
          max-width: 500px;
        }

        .search-input {
          width: 100%;
          padding: 0.8rem 3rem 0.8rem 2.5rem;
          font-size: 1rem;
          border-radius: 999px;
          border: none;
          background: rgba(255, 255, 255, 0.1);
          color: white;
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          box-shadow: 0 0 8px rgba(0, 0, 0, 0.05);
          outline: none;
        }

        .search-input::placeholder {
          color: rgba(255, 255, 255, 0.6);
        }

        .search-icon {
          position: absolute;
          left: 0.9rem;
          top: 50%;
          transform: translateY(-50%);
          color: white;
          opacity: 0.7;
        }

        .engine-badge {
          position: absolute;
          right: 1rem;
          top: 50%;
          transform: translateY(-50%);
          font-size: 0.75rem;
          padding: 0.2rem 0.6rem;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.15);
          color: white;
          font-weight: 500;
          cursor: pointer;
        }

        @media (max-width: 480px) {
          .search-wrapper {
            max-width: 90%;
          }
        }
      `}</style>
    </form>
  )
}

export default SmartSearchBar
