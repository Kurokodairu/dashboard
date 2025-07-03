import { useState, useEffect } from 'react'
import WeatherCard from './components/WeatherCard.jsx'
import CryptoCard from './components/CryptoCard.jsx'
import TwitchCard from './components/TwitchCard.jsx'
import Globe from './components/Globe.jsx'
import SettingsPanel from './components/SettingsPanel.jsx'
import SmartSearchBar from './components/SmartSearchBar.jsx'
import './App.css'

function App() {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [showSettings, setShowSettings] = useState(false)
  const [cityCoords, setCityCoords] = useState(null)

  const defaultLayout = [
  { id: 'weather', column: 'left', order: 1, visible: true },
  { id: 'twitch', column: 'left', order: 2, visible: true },
  { id: 'crypto', column: 'right', order: 1, visible: true }
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
      default:
        return null
    }
  }

  useEffect(() => {
    localStorage.setItem('dashboard-layout', JSON.stringify(widgetLayout))
  }, [widgetLayout])

  useEffect(() => {
    // Load saved city from localStorage on app start
    const savedCity = localStorage.getItem('dashboard-city')
    if (savedCity) {
      const cityData = JSON.parse(savedCity)
      setCityCoords(cityData)
    }
  }, [])

  useEffect(() => {
    // Handle Escape key to toggle settings
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setShowSettings(prev => !prev)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const handleCitySelect = (cityData) => {
    setCityCoords(cityData)
    localStorage.setItem('dashboard-city', JSON.stringify(cityData))
    setShowSettings(false)
  }


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

      <SmartSearchBar />

      <main className="dashboard-columns">
        <div className="left-column">
          {widgetLayout
            .filter(w => w.column === 'left' && w.visible)
            .sort((a, b) => a.order - b.order)
            .map(w => (
              <div className="widget" key={w.id}>
                {renderWidgetById(w.id)}
              </div>
            ))}
        </div>

        <div className="right-column">
          {widgetLayout
            .filter(w => w.column === 'right' && w.visible)
            .sort((a, b) => a.order - b.order)
            .map(w => (
              <div className="widget" key={w.id}>
                {renderWidgetById(w.id)}
              </div>
            ))}
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