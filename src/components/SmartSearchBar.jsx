import { useEffect, useState, useRef } from 'react'
import { Search, Bot } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { div } from 'framer-motion/client'


const SEARCH_ENGINES = [
  { name: 'Google', url: 'https://www.google.com/search?q=', icon: <Search size={18} /> },
  { name: 'Perplexity', url: 'https://www.perplexity.ai/search?q=', icon: <Bot size={18} /> }
]

const SmartSearchBar = ({ onSuggestionsChange }) => {
  const [engineIndex, setEngineIndex] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)
  const inputRef = useRef(null)
  const [inputText, setInputText] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [focusedIndex, setFocusedIndex] = useState(-1)


  const currentEngine = SEARCH_ENGINES[engineIndex]

   // Animation handler
  const animateEngineChange = (nextIndex) => {
    setIsAnimating(true)
    setTimeout(() => {
      setEngineIndex(nextIndex)
      setIsAnimating(false)
    }, 250)
  }

  //Auto-suggest
  useEffect(() => {
    if (!inputText.trim()) {
      setSuggestions([])
      onSuggestionsChange?.(false) // Notify that suggestions are hidden
      return
    }

  const apiUrl = import.meta.env.PROD 
      ? `/api/suggest?q=${encodeURIComponent(inputText)}`
      : `/suggest?q=${encodeURIComponent(inputText)}`

    const controller = new AbortController()
    const fetchSuggestions = async () => {
      try {
        const res = await fetch(apiUrl, {
          signal: controller.signal
        })
        const data = await res.json()
        const list = Array.isArray(data)
          ? data[1]
          : (Array.isArray(data?.suggestions) ? data.suggestions : [])
        const filteredSuggestions = (list || []).filter(s => s.length > 1 && s !== 'q')
        setSuggestions(filteredSuggestions)
        onSuggestionsChange?.(filteredSuggestions.length > 0) // Notify about suggestions visibility
      } catch (err) {
        if (err.name !== 'AbortError') console.error(err)
      }
    }

    const debounce = setTimeout(fetchSuggestions, 200)
    return () => {
      controller.abort()
      clearTimeout(debounce)
    }
  }, [inputText, onSuggestionsChange])


  const handleSubmit = (e) => {
    e.preventDefault()
    const query = inputText.trim()
    if (!query) return

    window.open(`${currentEngine.url}${encodeURIComponent(query)}`, '_blank')
    setInputText('')
    setSuggestions([])
    onSuggestionsChange?.(false) // Notify that suggestions are hidden
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Tab') {
      e.preventDefault()
      animateEngineChange((engineIndex + 1) % SEARCH_ENGINES.length)
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setFocusedIndex((prev) => Math.min(prev + 1, suggestions.length - 1))
      setTimeout(() => {
        const focusedElement = document.querySelector('.suggestion-item.focused')
        if (focusedElement) {
          focusedElement.scrollIntoView({
            behavior: 'smooth',
            block: 'nearest'
          })
        }
      }, 0)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setFocusedIndex((prev) => Math.max(prev - 1, -1))
      setTimeout(() => {
        const focusedElement = document.querySelector('.suggestion-item.focused')
        if (focusedElement) {
          focusedElement.scrollIntoView({
            behavior: 'smooth',
            block: 'nearest'
          })
        }
      }, 0)
    } else if (e.key === 'Enter') {
      e.preventDefault()
      const selected = focusedIndex >= 0 ? suggestions[focusedIndex] : inputText
      if (!selected.trim()) return
      window.open(`${currentEngine.url}${encodeURIComponent(selected)}`, '_blank')
      setInputText('')
      setSuggestions([])
      setFocusedIndex(-1)
      onSuggestionsChange?.(false) // Notify that suggestions are hidden
    }
    
  }

  return (
    <div>
    <form className="search-bar" onSubmit={handleSubmit}>
      <div className="search-wrapper">
        <span className={`search-icon fade-anim ${isAnimating ? 'fade' : ''}`}>
          {currentEngine.icon}
        </span>
        <input
          ref={inputRef}
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={`Search with ${currentEngine.name}...`}
          className="search-input"
          autoFocus
        />
        <span
          className={`engine-badge fade-anim ${isAnimating ? 'fade' : ''}`}
          onClick={() => {
            animateEngineChange((engineIndex + 1) % SEARCH_ENGINES.length)
          }}
        >
          {currentEngine.name}
        </span>

        {/* SUGGESTIONS */}
        <AnimatePresence>
          {suggestions.length > 0 && (
            <motion.ul
              className="suggestions-list"
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.2 }}
            >
              {suggestions.map((s, i) => (
                <li
                  key={i}
                  className={`suggestion-item ${i === focusedIndex ? 'focused' : ''}`}
                  onMouseDown={() => {
                    window.open(`${currentEngine.url}${encodeURIComponent(s)}`, '_blank')
                    setInputText('')
                    setSuggestions([])
                    setFocusedIndex(-1)
                    onSuggestionsChange?.(false) // Notify that suggestions are hidden
                  }}
                >
                  {s}
                </li>
              ))}
            </motion.ul>
          )}
        </AnimatePresence>
      </div>
      </form>

       <motion.div
        className="suggestion-spacer"
        animate={{ height: suggestions.length > 0 ? 200 : 0 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
      />


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


        .suggestions-list {
          position: absolute;
          top: 100%;
          left: 0;
          right: 0;
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.15);
          border-top: none;
          border-radius: 0 0 12px 12px;
          max-height: 220px;
          overflow-y: auto;
          z-index: 10;
          margin-top: -1px;
          box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
        }

        .suggestion-item {
          padding: 0.75rem 1.25rem;
          font-size: 0.95rem;
          color: white;
          cursor: pointer;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          transition: background 0.2s ease;
        }

        .suggestion-item:last-child {
          border-bottom: none;
        }

        .suggestion-item:hover,
        .suggestion-item.focused {
          background: rgba(255, 255, 255, 0.1);
        }


        @media (max-width: 480px) {
          .suggestions-list {
            max-height: 160px;
            font-size: 0.85rem;

          }
        }

        .fade-anim.fade {
          opacity: 0.2;
        }
        .fade-anim {
          opacity: 1;
          transition: opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        @media (min-width: 1156px) {
        .suggestion-spacer {
          display: none;
        }
      `}</style>
      </div>
  )
}

export default SmartSearchBar
