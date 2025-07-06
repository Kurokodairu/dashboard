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
import { motion, AnimatePresence } from 'framer-motion'
import './App.css'

function App() {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [showSettings, setShowSettings] = useState(false)
  const [cityCoords, setCityCoords] = useState(null)
  const [githubUsername, setGithubUsername] = useState(localStorage.getItem('github-username') || 'kurokodairu')
  const [suggestionsVisible, setSuggestionsVisible] = useState(false)


  // WIDGET
  const defaultLayout = [
  { id: 'weather', column: 'left', order: 1, visible: true },
  { id: 'twitch', column: 'left', order: 2, visible: true },
  { id: 'crypto', column: 'right', order: 1, visible: true },
  { id: 'vg', column: 'right', order: 2, visible: true },
  { id: 'github', column: 'right', order: 3, visible: true },
  { id: 'command', column: 'left', order: 3, visible: true }
  ]

  const [widgetLayout, setWidgetLayout] = useState(() => {
  const saved = localStorage.getItem('dashboard-layout')
  return saved ? JSON.parse(saved) : defaultLayout
  })

  const renderWidgetById = (id) => {
    switch (id) {
      case 'weather':
        return <WeatherCard cityCoords={cityCoords} />
      case 'twitch':
        return <TwitchCard />
      case 'crypto':
        return <CryptoCard />
      case 'github':
        return <GithubCard username={githubUsername} />
      case 'vg':
        return <VGCard />
      case 'command':
        return <LinuxCommandCard />
      default:
        return null
    }
  }

  useEffect(() => {
    localStorage.setItem('dashboard-layout', JSON.stringify(widgetLayout))
  }, [widgetLayout])


  // FOCUS TIMER
  const [showFocusTimer, setShowFocusTimer] = useState(() => {
    const saved = localStorage.getItem('dashboard-focus-timer')
    return saved ? JSON.parse(saved) : false})

  useEffect(() => {
    localStorage.setItem('dashboard-focus-timer', JSON.stringify(showFocusTimer))
  }, [showFocusTimer])


  // City coords
  useEffect(() => {
    // Load saved city from localStorage on app start
    const savedCity = localStorage.getItem('dashboard-city')
    if (savedCity) {
      const cityData = JSON.parse(savedCity)
      setCityCoords(cityData)
    }
  }, [])

  const handleCitySelect = (cityData) => {
    setCityCoords(cityData)
    localStorage.setItem('dashboard-city', JSON.stringify(cityData))
    setShowSettings(false)
  }

  // Settings panel
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setShowSettings(prev => !prev)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const handleSetGithubUsername = (username) => {
    if (username) {
      localStorage.setItem('github-username', username)
      setGithubUsername(username)
    } else {
      localStorage.removeItem('github-username')
      setGithubUsername('')
    }
  }

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
      <div className="background-gradient"></div>
      
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
          <motion.div
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
          </motion.div>
        )}
      </AnimatePresence>

      <main className="dashboard-columns">
        <div className="left-column">
          <AnimatePresence>
            {widgetLayout
              .filter(w => w.column === 'left' && w.visible)
              .sort((a, b) => a.order - b.order)
              .map(w => (
                <motion.div 
                  className="widget" 
                  key={w.id}
                  layout
                  initial={{ opacity: 0, y: 20, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -20, scale: 0.9 }}
                  transition={{ 
                    duration: 0.4, 
                    ease: "easeInOut",
                    layout: { duration: 0.3 }
                  }}
                >
                  {renderWidgetById(w.id)}
                </motion.div>
              ))}
          </AnimatePresence>
        </div>

        <div className="right-column">
          <AnimatePresence>
            {widgetLayout
              .filter(w => w.column === 'right' && w.visible)
              .sort((a, b) => a.order - b.order)
              .map(w => (
                <motion.div 
                  className="widget" 
                  key={w.id}
                  layout
                  initial={{ opacity: 0, y: 20, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -20, scale: 0.9 }}
                  transition={{ 
                    duration: 0.4, 
                    ease: "easeInOut",
                    layout: { duration: 0.3 }
                  }}
                >
                  {renderWidgetById(w.id)}
                </motion.div>
              ))}
          </AnimatePresence>
        </div>
      </main>


      <footer className="footer">
        <p className="footer-text">Dashboard App by <a style={{ color: 'inherit' }} href="https://github.com/Kurokodairu" target="_blank" rel="noopener noreferrer">Kurokodairu</a></p>
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
        showFocusTimer={showFocusTimer}
        setShowFocusTimer={setShowFocusTimer}
      />


  {!cityCoords && (
    <div
      className="setup-hint"
      tabIndex={0}
      role="button"
      onClick={() => setShowSettings(true)}
      onKeyDown={e => {
        if (e.key === 'Enter' || e.key === ' ') setShowSettings(true)
      }}
      style={{ cursor: 'pointer' }}
    >
      <p>Press <kbd>Escape</kbd> or tap here to set your city - Use <kbd>Tab</kbd> to switch search engines</p>
    </div>
  )}
    </div>
  )
}

export default App