import { useState, useEffect } from 'react'
import { X, Search, MapPin, Settings } from 'lucide-react'

const SettingsPanel = ({ isOpen, onClose, onCitySelect, currentCity, visibleWidgets, onToggleWidget }) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

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
      } catch (err) {
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


  // Widget management
  const moveWidgetUp = (id) => {
    setWidgetLayout(prev => {
      const updated = [...prev]
      const index = updated.findIndex(w => w.id === id)
      if (index > 0) {
        [updated[index], updated[index - 1]] = [updated[index - 1], updated[index]]
      }
      return updated
    })
  }

  const toggleColumn = (id) => {
    setWidgetLayout(prev => prev.map(w =>
      w.id === id ? { ...w, column: w.column === 'left' ? 'right' : 'left' } : w
    ))
  }


  // TWITCH LOGOUT
  const [isTwitchLoggedIn, setIsTwitchLoggedIn] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('twitch-access-token')
    setIsTwitchLoggedIn(!!token)
  }, [isOpen]) // refresh check when settings panel opens
  const handleTwitchLogout = () => {
  localStorage.removeItem('twitch-access-token')
  setIsTwitchLoggedIn(false)

  // Notify parent to update TwitchCard if passed as prop
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
            <p className="setting-description">
              Set your city to get accurate weather information
            </p>
            
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
        </div>


      <h3>Widgets</h3>
      {Object.entries(visibleWidgets).map(([key, value]) => (
        <label key={key} className="widget-toggle">
          <input
              type="checkbox"
              checked={value}
              onChange={() => onToggleWidget(key, !value)}
          />
          <span>{key.charAt(0).toUpperCase() + key.slice(1)} Widget</span>
        </label>
      ))}
 
        
      <button onClick={() => moveWidgetUp(widget.id)}>↑</button>
      <button onClick={() => moveWidgetDown(widget.id)}>↓</button>
      <button onClick={() => toggleColumn(widget.id)}>⇄</button>


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
          background: rgba(0, 0, 0, 0.3);
          backdrop-filter: blur(4px);
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
          background: rgba(255, 255, 255, 0.1);
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

        .setting-section {
          margin-bottom: 2rem;
        }

        .setting-section h3 {
          font-size: 1.2rem;
          font-weight: 600;
          margin-bottom: 0.5rem;
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

        .widget-toggle {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin: 0.25rem 0;
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