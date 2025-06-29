import { useState, useEffect } from 'react'
import { Cloud, Sun, CloudRain, CloudSnow, Wind, Droplets } from 'lucide-react'

const WeatherCard = ({ cityCoords }) => {
  const [weather, setWeather] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!cityCoords) {
      setWeather(null)
      setError(null)
      return
    }

    const fetchWeather = async () => {
      setLoading(true)
      setError(null)
      
      try {
        const { latitude, longitude } = cityCoords

        // Use Vercel function in production, proxy in development
        const apiUrl = import.meta.env.PROD 
          ? `/api/weather?lat=${latitude}&lon=${longitude}`
          : `/weather?lat=${latitude}&lon=${longitude}`

        const response = await fetch(apiUrl)

        if (!response.ok) {
          throw new Error('Weather data unavailable')
        }

        const data = await response.json()
        
        // Check if the expected data structure exists
        if (!data.properties || !data.properties.timeseries || data.properties.timeseries.length === 0) {
          throw new Error('Invalid weather data structure')
        }
        
        const current = data.properties.timeseries[0].data.instant.details
        const next1h = data.properties.timeseries[0].data.next_1_hours?.summary?.symbol_code
        
        setWeather({
          temperature: Math.round(current.air_temperature),
          humidity: Math.round(current.relative_humidity),
          windSpeed: Math.round(current.wind_speed * 3.6), // Convert m/s to km/h
          condition: next1h || 'clearsky_day'
        })
      } catch (err) {
        setError(err.message)
        setWeather(null)
      } finally {
        setLoading(false)
      }
    }

    fetchWeather()
  }, [cityCoords])

  const getWeatherIcon = (condition) => {
    if (condition.includes('rain')) return <CloudRain size={48} />
    if (condition.includes('snow')) return <CloudSnow size={48} />
    if (condition.includes('cloud')) return <Cloud size={48} />
    return <Sun size={48} />
  }

  const getWeatherDescription = (condition) => {
    if (condition.includes('rain')) return 'Rainy'
    if (condition.includes('snow')) return 'Snowy'
    if (condition.includes('cloud')) return 'Cloudy'
    if (condition.includes('clear')) return 'Clear'
    return 'Fair'
  }

  if (!cityCoords) {
    return (
      <div className="glass-card">
        <h2 className="card-title">
          <Cloud size={24} />
          Weather
        </h2>
        <div className="no-location">
          <p>No location set</p>
          <p className="text-sm mt-2">Press Escape to set your city</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="glass-card">
        <h2 className="card-title">
          <Cloud size={24} />
          Weather
        </h2>
        <div className="loading">
          <div className="spinner"></div>
        </div>
      </div>
    )
  }

  if (error || !weather) {
    return (
      <div className="glass-card">
        <h2 className="card-title">
          <Cloud size={24} />
          Weather
        </h2>
        <div className="error">
          <p>Unable to load weather data</p>
          <p className="text-sm mt-2">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="glass-card">
      <h2 className="card-title">
        <Cloud size={24} />
        Weather
      </h2>
      
      <div className="weather-content">
        <div className="weather-main">
          <div className="weather-icon">
            {getWeatherIcon(weather.condition)}
          </div>
          <div className="weather-info">
            <div className="temperature">{weather.temperature}°C</div>
            <div className="condition">{getWeatherDescription(weather.condition)}</div>
          </div>
        </div>
        
        <div className="weather-details">
          <div className="weather-detail">
            <Droplets size={20} />
            <span>{weather.humidity}%</span>
            <small>Humidity</small>
          </div>
          <div className="weather-detail">
            <Wind size={20} />
            <span>{weather.windSpeed} km/h</span>
            <small>Wind</small>
          </div>
        </div>
      </div>

      <style>{`
        .weather-content {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }

        .weather-main {
          display: flex;
          align-items: center;
          gap: 1.5rem;
        }

        .weather-icon {
          opacity: 0.9;
        }

        .weather-info {
          flex: 1;
        }

        .temperature {
          font-size: 3rem;
          font-weight: 200;
          line-height: 1;
          background: linear-gradient(135deg, #ffffff 0%, #e0e7ff 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .condition {
          font-size: 1.2rem;
          opacity: 0.8;
          margin-top: 0.5rem;
        }

        .weather-details {
          display: flex;
          gap: 2rem;
        }

        .weather-detail {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
          flex: 1;
          padding: 1rem;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .weather-detail span {
          font-size: 1.1rem;
          font-weight: 600;
        }

        .weather-detail small {
          font-size: 0.8rem;
          opacity: 0.7;
        }

        .no-location {
          text-align: center;
          padding: 2rem;
          opacity: 0.6;
        }

        .no-location .text-sm {
          font-size: 0.9rem;
          margin-top: 0.5rem;
        }

        @media (max-width: 480px) {
          .weather-main {
            flex-direction: column;
            text-align: center;
          }
          
          .weather-details {
            flex-direction: column;
            gap: 1rem;
          }
        }
      `}</style>
    </div>
  )
}

export default WeatherCard