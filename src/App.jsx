import { useState, useEffect } from 'react'
import WeatherCard from './components/WeatherCard.jsx'
import CryptoCard from './components/CryptoCard.jsx'
import Globe from './components/Globe.jsx'
import SettingsPanel from './components/SettingsPanel.jsx'
import './App.css'

function App() {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [showSettings, setShowSettings] = useState(false)
  const [cityCoords, setCityCoords] = useState(null)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

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
          <Globe />
        </div>
      </header>

      <main className="dashboard-grid">
        <div className="weather-card">
          <WeatherCard cityCoords={cityCoords} />
        </div>
        <div className="empty-column">
          {/* Reserved for future content */}
        </div>
        <div className="crypto-card">
          <CryptoCard />
        </div>
      </main>

      <SettingsPanel 
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        onCitySelect={handleCitySelect}
        currentCity={cityCoords}
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
      <p>Press <kbd>Escape</kbd> or tap here to set your city</p>
    </div>
  )}
    </div>
  )
}

export default App