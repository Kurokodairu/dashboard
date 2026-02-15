import { useState, useEffect } from 'react'
import { X, Search, MapPin, Settings, ArrowUp, ArrowDown, ArrowLeftRight, Trash2, Plus, Bookmark } from 'lucide-react'
import useSettingsStore from '../stores/settingsStore'
import './SettingsPanel.css'

const SettingsPanel = ({ isOpen, onClose, onCitySelect, currentCity, widgetLayout, setWidgetLayout, githubUsername, onGithubUsernameChange, calendarLink, onCalendarLinkChange, showFocusTimer, setShowFocusTimer }) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [tempGithubUsername, setTempGithubUsername] = useState('')
  const [tempCalendarLink, setTempCalendarLink] = useState('')

  // Bookmarks management from store
  const { bookmarks, setBookmarks, backgroundTheme, setBackgroundTheme } = useSettingsStore()
  const [newBmTitle, setNewBmTitle] = useState('')
  const [newBmUrl, setNewBmUrl] = useState('')

  const handleAddBookmark = () => {
    if (!newBmTitle.trim() || !newBmUrl.trim()) return
    const url = newBmUrl.trim().startsWith('http') ? newBmUrl.trim() : `https://${newBmUrl.trim()}`
    try { new URL(url) } catch { return }
    const bm = {
      id: Date.now().toString(),
      title: newBmTitle.trim(),
      url,
      folder: 'default',
      createdAt: new Date().toISOString()
    }
    setBookmarks([...bookmarks, bm])
    setNewBmTitle('')
    setNewBmUrl('')
  }

  const handleDeleteBookmark = (id) => {
    setBookmarks(bookmarks.filter(b => b.id !== id))
  }

  const handleMoveBookmarkUp = (index) => {
    if (index === 0) return
    const newBookmarks = [...bookmarks]
    ;[newBookmarks[index], newBookmarks[index - 1]] = [newBookmarks[index - 1], newBookmarks[index]]
    setBookmarks(newBookmarks)
  }

  const handleMoveBookmarkDown = (index) => {
    if (index === bookmarks.length - 1) return
    const newBookmarks = [...bookmarks]
    ;[newBookmarks[index], newBookmarks[index + 1]] = [newBookmarks[index + 1], newBookmarks[index]]
    setBookmarks(newBookmarks)
  }

  const getFaviconUrl = (url) => {
    try { return `https://www.google.com/s2/favicons?domain=${new URL(url).hostname}&sz=32` } catch { return null }
  }

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
  // Normalize order values to ensure they're sequential within each column
  const normalizeOrders = (layout) => {
    const byColumn = { 0: [], 1: [], 2: [] }
    
    // Group widgets by column
    layout.forEach(w => {
      if (!byColumn[w.column]) byColumn[w.column] = []
      byColumn[w.column].push(w)
    })
    
    // Create a map of id -> new order
    const orderMap = {}
    Object.keys(byColumn).forEach(col => {
      byColumn[col]
        .sort((a, b) => {
          if (a.order !== b.order) return a.order - b.order
          // If orders are equal, maintain stable sort by id
          return a.id.localeCompare(b.id)
        })
        .forEach((w, index) => {
          orderMap[w.id] = index + 1
        })
    })
    
    // Return new array with updated orders
    return layout.map(w => ({
      ...w,
      order: orderMap[w.id] !== undefined ? orderMap[w.id] : w.order
    }))
  }

  const handleToggleVisibility = (id) => {
    setWidgetLayout(prev =>
      prev.map(w => w.id === id ? { ...w, visible: !w.visible } : w)
    )
  }

  const handleToggleColumn = (id) => {
    setWidgetLayout(prev => {
      const updated = prev.map(w => w.id === id ? { ...w, column: (w.column + 1) % 3 } : w)
      return normalizeOrders(updated)
    })
  }

  const handleMoveUp = (id) => {
    setWidgetLayout(prev => {
      const widget = prev.find(w => w.id === id)
      if (!widget) return prev
      
      // Get widgets in the same column, sorted by order then by id for stability
      const sameColumnWidgets = prev
        .filter(w => w.column === widget.column)
        .sort((a, b) => {
          if (a.order !== b.order) return a.order - b.order
          return a.id.localeCompare(b.id)
        })
      
      const index = sameColumnWidgets.findIndex(w => w.id === id)
      if (index <= 0) return prev // Already at the top of the column
      
      const previousId = sameColumnWidgets[index - 1].id
      const previousOrder = prev.find(ww => ww.id === previousId).order
      
      const updated = prev.map(w => {
        if (w.id === id) {
          return { ...w, order: previousOrder }
        }
        if (w.id === previousId) {
          return { ...w, order: widget.order }
        }
        return w
      })
      
      return normalizeOrders(updated)
    })
  }

  const handleMoveDown = (id) => {
    setWidgetLayout(prev => {
      const widget = prev.find(w => w.id === id)
      if (!widget) return prev
      
      // Get widgets in the same column, sorted by order then by id for stability
      const sameColumnWidgets = prev
        .filter(w => w.column === widget.column)
        .sort((a, b) => {
          if (a.order !== b.order) return a.order - b.order
          return a.id.localeCompare(b.id)
        })
      
      const index = sameColumnWidgets.findIndex(w => w.id === id)
      if (index >= sameColumnWidgets.length - 1) return prev // Already at the bottom of the column
      
      const nextId = sameColumnWidgets[index + 1].id
      const nextOrder = prev.find(ww => ww.id === nextId).order
      
      const updated = prev.map(w => {
        if (w.id === id) {
          return { ...w, order: nextOrder }
        }
        if (w.id === nextId) {
          return { ...w, order: widget.order }
        }
        return w
      })
      
      return normalizeOrders(updated)
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
            <h3>Background Theme</h3>
            <p className="setting-description">
              Choose between transparent background (for Zen browser) or dark modern gradient.
            </p>
            <div className="background-theme-toggle">
              <label className="theme-option">
                <input
                  type="radio"
                  name="backgroundTheme"
                  value="transparent"
                  checked={backgroundTheme === 'transparent'}
                  onChange={(e) => setBackgroundTheme(e.target.value)}
                />
                <span>Transparent (Default)</span>
              </label>
              <label className="theme-option">
                <input
                  type="radio"
                  name="backgroundTheme"
                  value="dark"
                  checked={backgroundTheme === 'dark'}
                  onChange={(e) => setBackgroundTheme(e.target.value)}
                />
                <span>Dark Modern</span>
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
            <h3><Bookmark size={18} style={{verticalAlign: 'middle', marginRight: 6}} />Bookmarks</h3>
            <p className="setting-description">Manage your quick-access bookmarks shown above the search bar.</p>

            <div className="bm-add-row">
              <input
                type="text"
                className="github-input"
                placeholder="Title"
                value={newBmTitle}
                onChange={(e) => setNewBmTitle(e.target.value)}
              />
              <input
                type="text"
                className="github-input"
                placeholder="URL"
                value={newBmUrl}
                onChange={(e) => setNewBmUrl(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddBookmark() } }}
              />
              <button className="set-button" onClick={handleAddBookmark} disabled={!newBmTitle.trim() || !newBmUrl.trim()}>
                <Plus size={16} />
              </button>
            </div>

            {bookmarks.length === 0 && (
              <p className="setting-description" style={{textAlign:'center', marginTop:'1rem'}}>No bookmarks yet.</p>
            )}

            <div className="bm-list">
              {bookmarks.map((bm, index) => (
                <div key={bm.id} className="bm-item">
                  {getFaviconUrl(bm.url) && (
                    <img src={getFaviconUrl(bm.url)} alt="" className="bm-favicon" onError={(e) => e.currentTarget.style.display='none'} />
                  )}
                  <div className="bm-info">
                    <span className="bm-title">{bm.title}</span>
                    <span className="bm-url">{(() => { try { return new URL(bm.url).hostname } catch { return bm.url } })()}</span>
                  </div>
                  <div className="bm-actions">
                    <button className="bm-action-btn" onClick={() => handleMoveBookmarkUp(index)} disabled={index === 0} title="Move up">
                      <ArrowUp size={14} />
                    </button>
                    <button className="bm-action-btn" onClick={() => handleMoveBookmarkDown(index)} disabled={index === bookmarks.length - 1} title="Move down">
                      <ArrowDown size={14} />
                    </button>
                    <button className="clear-button" onClick={() => handleDeleteBookmark(bm.id)} title="Remove">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="setting-section">
            <h3>Widgets</h3>
            <p className="setting-description">Organize widgets across 3 columns (L/M/R). Move them up/down within each column.</p>
            {widgetLayout
              .sort((a, b) => {
                // Sort by column first, then by order within column
                if (a.column !== b.column) return a.column - b.column
                return a.order - b.order
              })
              .map(widget => (
                <div key={widget.id} className="widget-control">
                  <label>
                    <input
                      type="checkbox"
                      checked={widget.visible}
                      onChange={() => handleToggleVisibility(widget.id)}
                    />
                    <span className="widget-name">
                      {widget.id.charAt(0).toUpperCase() + widget.id.slice(1)}
                    </span>
                    <span className="widget-column-badge">
                      {widget.column === 0 ? 'Left' : widget.column === 1 ? 'Middle' : 'Right'}
                    </span>
                  </label>
                  <div className="widget-actions">
                    <button onClick={() => handleToggleColumn(widget.id)} title="Switch column">
                      <ArrowLeftRight size={16} />
                    </button>
                    <button onClick={() => handleMoveUp(widget.id)} title="Move up in column">
                      <ArrowUp size={16} />
                    </button>
                    <button onClick={() => handleMoveDown(widget.id)} title="Move down in column">
                      <ArrowDown size={16} />
                    </button>
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
    </>
  )
}

export default SettingsPanel