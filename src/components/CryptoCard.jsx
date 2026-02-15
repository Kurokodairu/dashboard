import { useState, useCallback } from 'react'
import { TrendingUp, TrendingDown, DollarSign } from 'lucide-react'
import useAutoRefresh from '../hooks/AutoRefresh.js'
import './CryptoCard.css'

const CryptoCard = () => {
  const [cryptoData, setCryptoData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchCryptoData = useCallback(async () => {
      try {
        setLoading(true)
        setError(null)
        
        const apiUrl = `/api/crypto?ids=bitcoin,ethereum,monero,ripple&vs_currencies=usd&include_24hr_change=true`

        const response = await fetch(apiUrl, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
          signal: AbortSignal.timeout(15000)
        })

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: Crypto data unavailable`)
        }

        const data = await response.json()
        
        // Validate data structure
        if (!data || typeof data !== 'object') {
          throw new Error('Invalid data format received')
        }
        
        const cryptoList = [
          {
            id: 'bitcoin',
            name: 'Bitcoin',
            symbol: 'BTC',
            price: data.bitcoin?.usd || 0,
            change: data.bitcoin?.usd_24h_change || 0
          },
          {
            id: 'ethereum',
            name: 'Ethereum',
            symbol: 'ETH',
            price: data.ethereum?.usd || 0,
            change: data.ethereum?.usd_24h_change || 0
          },
          {
            id: 'monero',
            name: 'Monero',
            symbol: 'XMR',
            price: data.monero?.usd || 0,
            change: data.monero?.usd_24h_change || 0
          },
          {
            id: 'ripple',
            name: 'Ripple',
            symbol: 'XRP',
            price: data.ripple?.usd || 0,
            change: data.ripple?.usd_24h_change || 0
          }
        ]

        setCryptoData(cryptoList)
      } catch (err) {
        console.error('Crypto fetch error:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }, [])

    useAutoRefresh(fetchCryptoData)

  const formatPrice = (price) => {
    if (price >= 1) {
      return `$${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    }
    return `$${price.toFixed(4)}`
  }

  const formatChange = (change) => {
    return `${change >= 0 ? '+' : ''}${change.toFixed(2)}%`
  }

  if (loading) {
    return (
      <div className="glass-card">
        <h2 className="card-title">
          <DollarSign size={24} />
          Crypto Prices
        </h2>
        <div className="loading">
          <div className="spinner"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="glass-card">
        <h2 className="card-title">
          <DollarSign size={24} />
          Crypto Prices
        </h2>
        <div className="error">
          <p>Unable to load crypto data</p>
          <p className="text-sm mt-2">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="glass-card">
      <h2 className="card-title">
        <DollarSign size={24} />
        Crypto Prices
      </h2>
      
      <div className="crypto-list">
        {cryptoData.map((crypto) => (
          <div key={crypto.id} className="crypto-item">
            <div className="crypto-info">
              <div className="crypto-name">
                <span className="name">{crypto.name}</span>
                <span className="symbol">{crypto.symbol}</span>
              </div>
              <div className="crypto-price">
                <span className="price">{formatPrice(crypto.price)}</span>
                <span className={`change ${crypto.change >= 0 ? 'positive' : 'negative'}`}>
                  {crypto.change >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                  {formatChange(crypto.change)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default CryptoCard