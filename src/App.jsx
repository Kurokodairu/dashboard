import { useState, useEffect } from 'react'
import WeatherCard from './components/WeatherCard.jsx'
import CryptoCard from './components/CryptoCard.jsx'
import TwitchCard from './components/TwitchCard.jsx'
import Globe from './components/Globe.jsx'
import SettingsPanel from './components/SettingsPanel.jsx'
import SmartSearchBar from './components/SmartSearchBar.jsx'
import GithubCard from './components/GithubCard.jsx'
import VGCard from './components/VGCard.jsx'
import LinuxCommandCard from './components/LinuxCommand.jsx'
import FocusTimer from './components/FocusTimer.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'
import BookmarksCard from './components/BookmarksCard.tsx'
import CalendarCard from './components/CalendarCard.tsx'
import useSettingsStore from './stores/settingsStore.js'
import { motion, AnimatePresence } from 'framer-motion'
import './App.css'

const Motion = motion

function App() {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [suggestionsVisible, setSuggestionsVisible] = useState(false)

  // Get state and actions from Zustand store
  const {
    cityCoords,
    setCityCoords,
    githubUsername,
    setGithubUsername,
    calendarLink,
    setCalendarLink,
    widgetLayout,
    setWidgetLayout,
    showFocusTimer,
    setShowFocusTimer,
    showSettings,
    setShowSettings,
    toggleSettings
  } = useSettingsStore()

  const renderColumn = (column) => (
    <AnimatePresence>
      {widgetLayout
        .filter(w => w.column === column && w.visible)
        .sort((a, b) => a.order - b.order)
        .map(w => (
          <Motion.div
            className="widget"
            key={w.id}
            layout
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            transition={{
              duration: 0.4,
              ease: 'easeInOut',
              layout: { duration: 0.3 }
            }}
          >
            {renderWidgetById(w.id)}
          </Motion.div>
        ))}
    </AnimatePresence>
  )

  const renderWidgetById = (id) => {
    const widgetMap = {
      weather: { component: <WeatherCard cityCoords={cityCoords} />, name: 'Weather' },
      twitch: { component: <TwitchCard />, name: 'Twitch' },
      crypto: { component: <CryptoCard />, name: 'Crypto' },
      github: { component: <GithubCard username={githubUsername} />, name: 'GitHub' },
      vg: { component: <VGCard />, name: 'VG News' },
      command: { component: <LinuxCommandCard />, name: 'Linux Command' },
      bookmarks: { component: <BookmarksCard />, name: 'Bookmarks' },
      calendar: { component: <CalendarCard />, name: 'Calendar' }
    }
    
    const widget = widgetMap[id]
    if (!widget) return null
    
    return (
      <ErrorBoundary widgetName={widget.name}>
        {widget.component}
      </ErrorBoundary>
    )
  }

  const handleCitySelect = (cityData) => {
    setCityCoords(cityData)
  }

  const handleSetGithubUsername = (username) => {
    setGithubUsername(username || 'kurokodairu')
  }

  // Settings panel - toggle with Escape key
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        toggleSettings()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [toggleSettings])

  // Handle time & Date formatting
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const formatTime = (date) => {
    return date.toLocaleTimeString('nb-NO', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  }

  const formatDate = (date) => {
    return date.toLocaleDateString('nb-NO', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  // RETURN RENDER
  return (
    <div className="app">
      <header className="header">
        <div className="time-section">
          <h1 className="time">{formatTime(currentTime)}</h1>
          <p className="date">{formatDate(currentTime)}</p>
          {cityCoords && (
            <p className="location">{cityCoords.name}, {cityCoords.country}</p>
          )}
        </div>

        <div className="globe-container">
          <Globe onClick={() => setShowSettings(true)}/>
        </div>
      </header>

      <SmartSearchBar onSuggestionsChange={setSuggestionsVisible} />

      <AnimatePresence mode="wait">
        {showFocusTimer && (
          <Motion.div
            key="focus-timer"
            initial={{ opacity: 0, y: -20 }}
            animate={{ 
              opacity: suggestionsVisible ? 0 : 1, 
              y: suggestionsVisible ? -20 : 0,
              pointerEvents: suggestionsVisible ? 'none' : 'auto'
            }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            style={{ 
              visibility: suggestionsVisible ? 'hidden' : 'visible'
            }}
          >
            <FocusTimer isVisible={showFocusTimer} />
          </Motion.div>
        )}
      </AnimatePresence>

      <main className="dashboard-columns">
        <div className="left-column">
          {renderColumn('left')}
        </div>

        <div className="right-column">
          {renderColumn('right')}
        </div>
      </main>


      <footer className="footer">
        <p className="footer-text">Dashboard App by <a className="footer-link" href="https://github.com/Kurokodairu" target="_blank" rel="noopener noreferrer">Kurokodairu</a></p>
      </footer>

      <SettingsPanel
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        onCitySelect={handleCitySelect}
        currentCity={cityCoords}
        widgetLayout={widgetLayout}
        setWidgetLayout={setWidgetLayout}
        githubUsername={githubUsername}
        onGithubUsernameChange={handleSetGithubUsername}
        calendarLink={calendarLink}
        onCalendarLinkChange={setCalendarLink}
        showFocusTimer={showFocusTimer}
        setShowFocusTimer={setShowFocusTimer}
      />

      {!cityCoords && (
        <button
          type="button"
          className="setup-hint"
          onClick={() => setShowSettings(true)}
        >
          Press <kbd>Escape</kbd> or tap here to set your city - Use <kbd>Tab</kbd> to switch search engines
        </button>
      )}
    </div>
  )
}

export default App