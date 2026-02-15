import { useEffect, useState, useRef } from 'react'
import { Search, Bot } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import './SmartSearchBar.css'

const Motion = motion

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

  const apiUrl = `/api/suggest?q=${encodeURIComponent(inputText)}`

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
            <Motion.ul
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
            </Motion.ul>
          )}
        </AnimatePresence>
      </div>
      </form>

       <Motion.div
        className="suggestion-spacer"
        animate={{ height: suggestions.length > 0 ? 200 : 0 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
      />
      </div>
  )
}

export default SmartSearchBar
