import { useState, useEffect } from 'react'
import { X, Search, MapPin, Settings, ArrowUp, ArrowDown, ArrowLeftRight } from 'lucide-react'

const SettingsPanel = ({ isOpen, onClose, onCitySelect, currentCity, widgetLayout, setWidgetLayout, githubUsername, onGithubUsernameChange, calendarLink, onCalendarLinkChange, showFocusTimer, setShowFocusTimer }) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [tempGithubUsername, setTempGithubUsername] = useState('')
  const [tempCalendarLink, setTempCalendarLink] = useState('')

  useEffect(() => {
    setTempCalendarLink(calendarLink || '')
  }, [calendarLink, isOpen])

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([])
      return
    }

    const timeoutId = setTimeout(async () => {
      setLoading(true)
      setError(null)
      
      try {
        const response = await fetch(
          `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(searchQuery)}&count=5&language=en&format=json`
        )
        
        if (!response.ok) {
          throw new Error('Search failed')
        }
        
        const data = await response.json()
        setSearchResults(data.results || [])
      } catch {
        setError('Failed to search cities')
        setSearchResults([])
      } finally {
        setLoading(false)
      }
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [searchQuery])

  const handleCitySelect = (city) => {
    const cityData = {
      name: city.name,
      country: city.country,
      latitude: city.latitude,
      longitude: city.longitude
    }
    onCitySelect(cityData)
    setSearchQuery('')
    setSearchResults([])
  }

  const handleClearCity = () => {
    localStorage.removeItem('dashboard-city')
    onCitySelect(null)
  }

  const handleSetGithubUsername = () => {
    const username = tempGithubUsername.trim()
    if (username) {
      onGithubUsernameChange(username)
      setTempGithubUsername('')
    }
  }

  const handleClearGithubUsername = () => {
    onGithubUsernameChange('')
    setTempGithubUsername('')
  }

  const handleSetCalendarLink = () => {
    onCalendarLinkChange(tempCalendarLink.trim())
  }

  const handleClearCalendarLink = () => {
    onCalendarLinkChange('')
    setTempCalendarLink('')
  }


  // Widget management
  const handleToggleVisibility = (id) => {
    setWidgetLayout(prev =>
      prev.map(w => w.id === id ? { ...w, visible: !w.visible } : w)
    )
  }


  const normalizeOrderValues = (layout) => {
    return layout.map(widget => {
      const sameColumnWidgets = layout
        .filter(w => w.column === widget.column)
        .sort((a, b) => a.order - b.order || layout.indexOf(a) - layout.indexOf(b)) // fallback to original array position
      
      const newOrder = sameColumnWidgets.findIndex(w => w.id === widget.id) + 1
      
      return { ...widget, order: newOrder }
    })
  }

  const handleMoveUp = (id) => {
    setWidgetLayout(prev => {
      const normalized = normalizeOrderValues(prev)
      
      const widget = normalized.find(w => w.id === id)
      if (!widget) return prev

      // Get widgets in the same column, sorted by order
      const sameColumnWidgets = normalized
        .filter(w => w.column === widget.column)
        .sort((a, b) => a.order - b.order)
      
      const index = sameColumnWidgets.findIndex(w => w.id === id)
      
      if (index <= 0) return normalized

      const updated = [...normalized]
      const currentWidget = updated.find(w => w.id === id)
      const previousWidget = updated.find(w => w.id === sameColumnWidgets[index - 1].id)
      
      const tempOrder = currentWidget.order
      currentWidget.order = previousWidget.order
      previousWidget.order = tempOrder
      
      return updated
    })
  }

  const handleMoveDown = (id) => {
    setWidgetLayout(prev => {
      const normalized = normalizeOrderValues(prev)
      
      const widget = normalized.find(w => w.id === id)
      if (!widget) return prev

      const sameColumnWidgets = normalized
        .filter(w => w.column === widget.column)
        .sort((a, b) => a.order - b.order)
      
      const index = sameColumnWidgets.findIndex(w => w.id === id)
      
      if (index >= sameColumnWidgets.length - 1) return normalized

      const updated = [...normalized]
      const currentWidget = updated.find(w => w.id === id)
      const nextWidget = updated.find(w => w.id === sameColumnWidgets[index + 1].id)
      
      const tempOrder = currentWidget.order
      currentWidget.order = nextWidget.order
      nextWidget.order = tempOrder
      
      return updated
    })
  }

  const handleToggleColumn = (id) => {
    setWidgetLayout(prev => {
      const widget = prev.find(w => w.id === id)
      if (!widget) return prev

      const newColumn = widget.column === 'left' ? 'right' : 'left'
      
      const targetColumnWidgets = prev.filter(w => w.column === newColumn)
      const maxOrder = targetColumnWidgets.length > 0 
        ? Math.max(...targetColumnWidgets.map(w => w.order))
        : 0

      return prev.map(w =>
        w.id === id
          ? { ...w, column: newColumn, order: maxOrder + 1 }
          : w
      )
    })
  }


  // TWITCH LOGOUT
  const [isTwitchLoggedIn, setIsTwitchLoggedIn] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('twitch-access-token')
    setIsTwitchLoggedIn(!!token)
  }, [isOpen])
  const handleTwitchLogout = () => {
  localStorage.removeItem('twitch-access-token')
  setIsTwitchLoggedIn(false)
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('twitch-logout'))
  }
}


  return (
    <>
      {/* Backdrop */}
      <div 
        className={`settings-backdrop ${isOpen ? 'open' : ''}`}
        onClick={onClose}
      />
      
      {/* Settings Panel */}
      <div className={`settings-panel ${isOpen ? 'open' : ''}`}>
        <div className="settings-header">
          <div className="settings-title">
            <Settings size={24} />
            <h2>Settings</h2>
          </div>
          <button className="close-button" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <div className="settings-content">
          <div className="setting-section">
            <h3>Location</h3>
            {currentCity && (
              <div className="current-city">
                <MapPin size={16} />
                <span>{currentCity.name}, {currentCity.country}</span>
                <button className="clear-button" onClick={handleClearCity}>
                  Clear
                </button>
              </div>
            )}

            <div className="search-container">
              <div className="search-input-wrapper">
                <Search size={20} />
                <input
                  type="text"
                  placeholder="Search for a city..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="search-input"
                />
              </div>

              {loading && (
                <div className="search-loading">
                  <div className="spinner-small"></div>
                  <span>Searching...</span>
                </div>
              )}

              {error && (
                <div className="search-error">
                  {error}
                </div>
              )}

              {searchResults.length > 0 && (
                <div className="search-results">
                  {searchResults.map((city, index) => (
                    <button
                      key={index}
                      className="search-result"
                      onClick={() => handleCitySelect(city)}
                    >
                      <MapPin size={16} />
                      <div className="city-info">
                        <span className="city-name">{city.name}</span>
                        <span className="city-details">
                          {city.admin1 && `${city.admin1}, `}{city.country}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="setting-section">
            <h3>GitHub</h3>
            {githubUsername && (
              <div className="current-github">
                <span>@{githubUsername}</span>
                <button className="clear-button" onClick={handleClearGithubUsername}>
                  Clear
                </button>
              </div>
            )}

            <div className="github-input-container">
              <div className="github-input-wrapper">
                <input
                  type="text"
                  className="github-input"
                  placeholder="Enter GitHub username"
                  value={tempGithubUsername}
                  onChange={(e) => setTempGithubUsername(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      handleSetGithubUsername()
                    }
                  }}
                />
                <button 
                  className="set-button"
                  onClick={handleSetGithubUsername}
                  disabled={!tempGithubUsername.trim()}
                >
                  Set
                </button>
              </div>
            </div>
          </div>

          <div className="setting-section">
            <h3>Focus Timer</h3>
            <div className="focus-timer-toggle">
              <label className="toggle-label">
                <input
                  type="checkbox"
                  checked={showFocusTimer}
                  onChange={(e) => setShowFocusTimer(e.target.checked)}
                />
                <span>Show Focus Timer</span>
              </label>
            </div>
          </div>

          <div className="setting-section">
            <h3>Calendar</h3>
            <p className="setting-description">
              Paste a public Google Calendar link, embed link, or calendar ID/email.
            </p>

            {calendarLink && (
              <div className="current-github">
                <span style={{ wordBreak: 'break-all' }}>{calendarLink}</span>
                <button className="clear-button" onClick={handleClearCalendarLink}>
                  Clear
                </button>
              </div>
            )}

            <div className="github-input-container">
              <div className="github-input-wrapper">
                <input
                  type="text"
                  className="github-input"
                  placeholder="https://calendar.google.com/... or your_calendar@gmail.com"
                  value={tempCalendarLink}
                  onChange={(e) => setTempCalendarLink(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      handleSetCalendarLink()
                    }
                  }}
                />
                <button
                  className="set-button"
                  onClick={handleSetCalendarLink}
                  disabled={!tempCalendarLink.trim()}
                >
                  Set
                </button>
              </div>
            </div>
          </div>

          <div className="setting-section">
            <h3>Widgets</h3>
            {widgetLayout
              
              .map(widget => (
                <div key={widget.id} className="widget-control">
                  <label>
                    <input
                      type="checkbox"
                      checked={widget.visible}
                      onChange={() => handleToggleVisibility(widget.id)}
                    />
                    {widget.id.charAt(0).toUpperCase() + widget.id.slice(1)}
                  </label>
                  <div className="widget-actions">
                    <button onClick={() => handleMoveUp(widget.id)}><ArrowUp size={16} /></button>
                    <button onClick={() => handleMoveDown(widget.id)}><ArrowDown size={16} /></button>
                    <button onClick={() => handleToggleColumn(widget.id)}><ArrowLeftRight size={16} /></button>
                      </div>
                </div>
              ))}
          </div>
      </div>
      {isTwitchLoggedIn && (
      <div className="twitch-logout">
        <button className="logout-button" onClick={handleTwitchLogout}>
          Logout from Twitch
        </button>
      </div>
      )}

        <div className="settings-footer">
          <p onClick={onClose} className="hint">Press <kbd>Escape</kbd> to close</p>
        </div>
      </div>

      <style>{`
        .settings-backdrop {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.4);
          backdrop-filter: blur(8px);
          z-index: 998;
          opacity: 0;
          visibility: hidden;
          transition: all 0.3s ease;
        }

        .settings-backdrop.open {
          opacity: 1;
          visibility: visible;
        }

        .settings-panel {
          position: fixed;
          top: 0;
          right: 0;
          width: 400px;
          height: 100vh;
          background: rgba(255, 255, 255, 0.15);
          backdrop-filter: blur(20px);
          border-left: 1px solid rgba(255, 255, 255, 0.2);
          z-index: 999;
          transform: translateX(100%);
          transition: transform 0.3s ease;
          display: flex;
          flex-direction: column;
        }

        .settings-panel.open {
          transform: translateX(0);
        }

        .settings-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 2rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .settings-title {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .settings-title h2 {
          font-size: 1.5rem;
          font-weight: 600;
          margin: 0;
        }

        .close-button {
          background: none;
          border: none;
          color: white;
          cursor: pointer;
          padding: 0.5rem;
          border-radius: 8px;
          transition: background-color 0.2s ease;
        }

        .close-button:hover {
          background: rgba(255, 255, 255, 0.1);
        }

        .settings-content {
          flex: 1;
          padding: 2rem;
          overflow-y: auto;
        }

        .setting-description {
          font-size: 0.9rem;
          opacity: 0.7;
          margin-bottom: 1.5rem;
        }

        .current-city {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 1rem;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          margin-bottom: 1rem;
        }

        .clear-button {
          margin-left: auto;
          background: rgba(255, 107, 107, 0.2);
          border: 1px solid rgba(255, 107, 107, 0.3);
          color: #ff6b6b;
          padding: 0.25rem 0.75rem;
          border-radius: 6px;
          font-size: 0.8rem;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .clear-button:hover {
          background: rgba(255, 107, 107, 0.3);
        }

        .search-container {
          position: relative;
        }

        .search-input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }

        .search-input-wrapper svg {
          position: absolute;
          left: 1rem;
          opacity: 0.5;
          z-index: 1;
        }

        .search-input {
          width: 100%;
          padding: 1rem 1rem 1rem 3rem;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          color: white;
          font-size: 1rem;
          transition: all 0.2s ease;
        }

        .search-input:focus {
          outline: none;
          border-color: rgba(255, 255, 255, 0.3);
          background: rgba(255, 255, 255, 0.08);
        }

        .search-input::placeholder {
          color: rgba(255, 255, 255, 0.5);
        }

        .search-loading {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 1rem;
          opacity: 0.7;
        }

        .spinner-small {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top: 2px solid white;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        .search-error {
          color: #ff6b6b;
          padding: 1rem;
          text-align: center;
          font-size: 0.9rem;
        }

        .search-results {
          margin-top: 0.5rem;
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          overflow: hidden;
          background: rgba(255, 255, 255, 0.05);
        }

        .search-result {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 1rem;
          background: none;
          border: none;
          color: white;
          cursor: pointer;
          transition: background-color 0.2s ease;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }

        .search-result:last-child {
          border-bottom: none;
        }

        .search-result:hover {
          background: rgba(255, 255, 255, 0.1);
        }

        .city-info {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          text-align: left;
        }

        .city-name {
          font-weight: 600;
          font-size: 1rem;
        }

        .city-details {
          font-size: 0.8rem;
          opacity: 0.7;
        }

        .settings-footer {
          padding: 1.5rem 2rem;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
        }

        .hint {
          font-size: 0.8rem;
          opacity: 0.6;
          text-align: center;
        }

        .hint kbd {
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 4px;
          padding: 0.2rem 0.4rem;
          font-size: 0.7rem;
          font-family: monospace;
        }



        .twitch-logout {
          padding: 0 2rem 1rem;
        }

        .logout-button {
          width: 100%;
          background: rgba(145, 70, 255, 0.15);
          border: 1px solid rgba(145, 70, 255, 0.4);
          color: #b88cff;
          padding: 0.75rem 1rem;
          border-radius: 10px;
          font-size: 0.95rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .logout-button:hover {
          background: rgba(145, 70, 255, 0.25);
          color: #ffffff;
          border-color: rgba(145, 70, 255, 0.6);
        }
        
        .github-input {
          width: 100%;
          padding: 0.75rem 1rem;
          border-radius: 12px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: white;
          font-size: 1rem;
        }

        .github-input::placeholder {
          color: rgba(255, 255, 255, 0.4);
        }

        .current-github {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 1rem;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          margin-bottom: 1rem;
          font-family: monospace;
          font-weight: 500;
        }

        .github-input-container {
          position: relative;
        }

        .github-input-wrapper {
          display: flex;
          gap: 0.5rem;
          align-items: center;
        }

        .github-input-wrapper input {
          flex: 1;
        }

        .set-button {
          background: rgba(34, 197, 94, 0.2);
          border: 1px solid rgba(34, 197, 94, 0.3);
          color: #22c55e;
          padding: 0.75rem 1.5rem;
          border-radius: 12px;
          font-size: 0.95rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          white-space: nowrap;
        }

        .set-button:hover {
          background: rgba(34, 197, 94, 0.3);
          border-color: rgba(34, 197, 94, 0.5);
          color: white;
        }

        .set-button:disabled {
          background: rgba(255, 255, 255, 0.05);
          border-color: rgba(255, 255, 255, 0.1);
          color: rgba(255, 255, 255, 0.3);
          cursor: not-allowed;
        }

        .set-button:disabled:hover {
          background: rgba(255, 255, 255, 0.05);
          border-color: rgba(255, 255, 255, 0.1);
          color: rgba(255, 255, 255, 0.3);
        }

        .focus-timer-toggle {
          margin-top: 1rem;
        }

        .toggle-label {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          cursor: pointer;
          font-size: 1rem;
          font-weight: 500;
          padding: 1rem;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          transition: all 0.2s ease;
        }

        .toggle-label:hover {
          background: rgba(255, 255, 255, 0.08);
          border-color: rgba(255, 255, 255, 0.2);
        }

        .toggle-label input[type="checkbox"] {
          width: 18px;
          height: 18px;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.3);
          border-radius: 4px;
          cursor: pointer;
          position: relative;
          appearance: none;
          transition: all 0.2s ease;
        }

        .toggle-label input[type="checkbox"]:checked {
          background: rgba(59, 130, 246, 0.3);
          border-color: rgba(59, 130, 246, 0.6);
        }

        .toggle-label input[type="checkbox"]:checked::after {
          content: '✓';
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          color: white;
          font-size: 12px;
          font-weight: bold;
        }

        .toggle-label input[type="checkbox"]:hover {
          background: rgba(255, 255, 255, 0.15);
        }



        .widget-control {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          margin-bottom: 0.75rem;
          transition: all 0.2s ease;
        }

        .widget-control:hover {
          background: rgba(255, 255, 255, 0.08);
          border-color: rgba(255, 255, 255, 0.2);
        }

        .widget-control label {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          cursor: pointer;
          font-size: 1rem;
          font-weight: 500;
          flex: 1;
          text-shadow: 
            0 1px 2px rgba(0, 0, 0, 0.6),
            0 0 4px rgba(0, 0, 0, 0.5);
        }

        .widget-control input[type="checkbox"] {
          width: 18px;
          height: 18px;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.3);
          border-radius: 4px;
          cursor: pointer;
          position: relative;
          appearance: none;
          transition: all 0.2s ease;
        }

        .widget-control input[type="checkbox"]:checked {
          background: rgba(255, 255, 255, 0.2);
          border-color: rgba(255, 255, 255, 0.6);
        }

        .widget-control input[type="checkbox"]:checked::after {
          content: '✓';
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          color: white;
          font-size: 12px;
          font-weight: bold;
        }

        .widget-control input[type="checkbox"]:hover {
          background: rgba(255, 255, 255, 0.15);
        }

        .widget-actions {
          display: flex;
          gap: 0.5rem;
        }

        .widget-actions button {
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          color: white;
          padding: 0.5rem;
          border-radius: 8px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
          width: 36px;
          height: 36px;
        }

        .widget-actions button:hover {
          background: rgba(255, 255, 255, 0.2);
          border-color: rgba(255, 255, 255, 0.3);
          transform: translateY(-1px);
        }

        .widget-actions button:active {
          transform: translateY(0);
        }

        .widget-actions button:disabled {
          opacity: 0.4;
          cursor: not-allowed;
          transform: none;
        }

        .widget-actions button:disabled:hover {
          background: rgba(255, 255, 255, 0.1);
          border-color: rgba(255, 255, 255, 0.2);
          transform: none;
        }

        /* Add some spacing between sections */
        .setting-section:not(:last-child) {
          margin-bottom: 1.5rem;
        }

        .setting-section h3 {
          font-size: 1.2rem;
          font-weight: 600;
          margin-bottom: 0.5rem;
          color: white;
        }

        /* Improve the overall layout */
        .settings-content {
          flex: 1;
          padding: 2rem;
          overflow-y: auto;
          scrollbar-width: thin;
          scrollbar-color: rgba(255, 255, 255, 0.2) transparent;
        }

        .settings-content::-webkit-scrollbar {
          width: 6px;
        }

        .settings-content::-webkit-scrollbar-track {
          background: transparent;
        }

        .settings-content::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.2);
          border-radius: 3px;
        }

        .settings-content::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.3);
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @media (max-width: 480px) {
          .settings-panel {
            width: 100%;
          }
        }
      `}</style>
    </>
  )
}

export default SettingsPanel