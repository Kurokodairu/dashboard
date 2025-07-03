import { useState, useEffect, useCallback } from 'react'
import { Tv, Users, Eye } from 'lucide-react'
import useAutoRefresh from '../hooks/AutoRefresh.js'

const TwitchCard = () => {
  const [liveChannels, setLiveChannels] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isConfigured, setIsConfigured] = useState(false)

  const fetchLiveChannels = useCallback(async () => {
    const clientId = import.meta.env.VITE_TWITCH_CLIENT_ID
    const accessToken = localStorage.getItem('twitch-access-token')

    if (!clientId || !accessToken) {
      setIsConfigured(false)
      setLoading(false)
      return 
    }

    // If credentials exist, proceed with the fetch.
    setIsConfigured(true)
    setLoading(true)
    setError(null)

    try {
      // Use Vercel function in production, direct API in development
      const apiUrl = import.meta.env.PROD 
        ? '/api/twitch'
        : '/twitch/helix/streams/followed?user_id=237308507'

      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Client-Id': clientId,
          'Accept': 'application/json',
        },
        signal: AbortSignal.timeout(10000)
      })

      if (!response.ok) {
        if (response.status === 401) {
          // Token expired, clear it
          localStorage.removeItem('twitch-access-token')
          throw new Error('Authentication expired. Please reconnect to Twitch.')
        }
        throw new Error(`HTTP ${response.status}: Unable to fetch live channels`)
      }

      const data = await response.json()
      
      if (!data.data) {
        throw new Error('Invalid response format')
      }

      // Get user info for each stream
      const userIds = data.data.map(stream => stream.user_id)
      if (userIds.length > 0) {
        const usersUrl = import.meta.env.PROD 
          ? `/api/twitch-users?ids=${userIds.join(',')}`
          : `/twitch/helix/users?id=${userIds.join('&id=')}`

        const usersResponse = await fetch(usersUrl, {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Client-Id': clientId,
          }
        })

        if (usersResponse.ok) {
          const usersData = await usersResponse.json()
          const usersMap = {}
          usersData.data.forEach(user => {
            usersMap[user.id] = user
          })

          // Combine stream and user data
          const enrichedStreams = data.data.map(stream => ({
            ...stream,
            user: usersMap[stream.user_id]
          }))

          setLiveChannels(enrichedStreams)
        } else {
          setLiveChannels(data.data)
        }
      } else {
        setLiveChannels([])
      }

    } catch (err) {
      console.error('Twitch API error:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, []) // This useCallback has no dependencies as it reads from localStorage and env vars directly.

  // Use the single hook to manage all refresh logic
  useAutoRefresh(fetchLiveChannels)

  const formatViewerCount = (count) => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}k`
    }
    return count.toString()
  }

  const handleTwitchAuth = () => {
    const clientId = import.meta.env.VITE_TWITCH_CLIENT_ID
    if (!clientId) {
      alert('Please add your Twitch Client ID to the environment variables')
      return
    }

    const redirectUri = import.meta.env.VITE_TWITCH_REDIRECT_URI ||
      `${window.location.origin}${window.location.pathname}auth/callback`
    const scopes = 'user:read:follows'
    
    const authUrl = `https://id.twitch.tv/oauth2/authorize?` +
      `client_id=${clientId}&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `response_type=token&` +
      `scope=${encodeURIComponent(scopes)}`
    
    window.location.href = authUrl
  }


  // Effect for handling logout events
  useEffect(() => {
    const handleLogout = () => {
      localStorage.removeItem('twitch-access-token')
      setLiveChannels([])
      setIsConfigured(false)
    }

    window.addEventListener('twitch-logout', handleLogout)
    return () => window.removeEventListener('twitch-logout', handleLogout)
  }, [])

  // Effect for handling login events
  useEffect(() => {
    const handleLogin = () => {
      setIsConfigured(true)
      fetchLiveChannels() // Manually trigger a fetch on login
    }

    window.addEventListener('twitch-login', handleLogin)
    return () => window.removeEventListener('twitch-login', handleLogin)
  }, [fetchLiveChannels])


  // Effect for handling the OAuth callback from Twitch
  useEffect(() => {
    const hash = window.location.hash
    if (hash.includes('access_token')) {
      const params = new URLSearchParams(hash.substring(1))
      const accessToken = params.get('access_token')
      
      if (accessToken) {
        localStorage.setItem('twitch-access-token', accessToken)
        window.history.replaceState({}, document.title, window.location.pathname)
        window.dispatchEvent(new Event('twitch-login')) // Dispatch event to trigger login logic
      }
    }
  }, [])

  // --- Render Logic ---

  if (!isConfigured) {
    return (
      <div className="glass-card">
        <h2 className="card-title">
          <Tv size={24} />
          Live Channels
        </h2>
        <div className="twitch-setup">
          <button className="connect-button" onClick={handleTwitchAuth}>
            Connect to Twitch
          </button>
          <div className="setup-instructions">
            <p className="text-sm mt-2">
              <strong>Current redirect URI:</strong> {import.meta.env.VITE_TWITCH_REDIRECT_URI || 'Not Set'}
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="glass-card">
        <h2 className="card-title">
          <Tv size={24} />
          Live Channels
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
          <Tv size={24} />
          Live Channels
        </h2>
        <div className="error">
          <p>Unable to load live channels</p>
          <p className="text-sm mt-2">{error}</p>
          {error.includes('Authentication') && (
            <button className="reconnect-button" onClick={handleTwitchAuth}>
              Reconnect to Twitch
            </button>
          )}
        </div>
      </div>
    )
  }

  if (liveChannels.length === 0) {
    return (
      <div className="glass-card">
        <h2 className="card-title">
          <Tv size={24} />
          Live Channels
        </h2>
        <div className="no-streams">
          <p>No followed channels are currently live</p>
        </div>
      </div>
    )
  }

  return (
    <div className="glass-card">
      <h2 className="card-title">
        <Tv size={24} />
        Live Channels <p style={{ color: '#f87171' }}>({liveChannels.length})</p>
      </h2>
      
      <div className="streams-list">
        {liveChannels.slice(0, 5).map((stream) => (
          <div
            key={stream.id}
            className="stream-item"
            onClick={() => {
              window.open(`https://twitch.tv/${stream.user_login || stream.user_name}`, '_blank', 'noopener,noreferrer')
            }}
            style={{ cursor: 'pointer' }}
          >
            <div className="stream-thumbnail">
              <img 
                src={stream.thumbnail_url.replace('{width}', '320').replace('{height}', '180')}
                alt={`${stream.user_name} thumbnail`}
                onError={(e) => {
                  e.target.style.display = 'none'
                }}
              />
            </div>
            
            <div className="stream-info">
              <div className="stream-header">
                <div className="streamer-info">
                  {stream.user?.profile_image_url && (
                    <img 
                      src={stream.user.profile_image_url}
                      alt={`${stream.user_name} avatar`}
                      className="avatar"
                    />
                  )}
                  <span className="streamer-name">{stream.user_name}</span>
                </div>
                <div className="viewer-count">
                  <Eye size={14} />
                  {formatViewerCount(stream.viewer_count)}
                </div>
              </div>

              <div className="stream-title">{stream.title}</div>
              <div className="stream-game">{stream.game_name}</div>
            </div>
          </div>
        ))}
      </div>

      {liveChannels.length > 5 && (
        <div className="more-streams">
          <p>+{liveChannels.length - 5} more channels live</p>
        </div>
      )}

      <style>{`
        .twitch-setup {
          text-align: center;
          padding: 2rem;
        }

        .connect-button, .reconnect-button {
          background: #9146ff;
          border: none;
          color: white;
          padding: 0.75rem 1.5rem;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          margin-top: 1rem;
          transition: background-color 0.2s ease;
        }

        .connect-button:hover, .reconnect-button:hover {
          background: #7c3aed;
        }

        .setup-instructions {
          margin-top: 1rem;
          opacity: 0.7;
        }

        .streams-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .stream-item {
          display: flex;
          gap: 1rem;
          padding: 1rem;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          transition: all 0.2s ease;
          cursor: pointer;
        }

        .stream-item:hover {
          background: rgba(255, 255, 255, 0.08);
          border-color: rgba(255, 255, 255, 0.2);
          transform: translateY(-2px);
        }

        .stream-thumbnail {
          position: relative;
          flex-shrink: 0;
          width: 128px;
          height: 72px;
          border-radius: 8px;
          overflow: hidden;
          background: rgba(255, 255, 255, 0.1);
        }

        .stream-thumbnail img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .stream-info {
          flex: 1;
          min-width: 0;
        }

        .stream-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.5rem;
        }

        .streamer-info {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .avatar {
          width: 24px;
          height: 24px;
          border-radius: 50%;
        }

        .streamer-name {
          font-weight: 600;
          font-size: 0.9rem;
        }

        .viewer-count {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          font-size: 0.8rem;
          opacity: 0.8;
        }

        .stream-title {
          font-size: 0.9rem;
          font-weight: 500;
          margin-bottom: 0.25rem;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          max-width: 80vw;
        }

        .stream-game {
          font-size: 0.8rem;
          opacity: 0.7;
        }

        .no-streams {
          text-align: center;
          padding: 2rem;
          opacity: 0.6;
        }

        .more-streams {
          text-align: center;
          padding: 1rem;
          opacity: 0.7;
          font-size: 0.9rem;
        }

        .text-sm {
          font-size: 0.8rem;
        }

        .mt-2 {
          margin-top: 0.5rem;
        }
        

        @media (max-width: 1156px) {
          .stream-item {
            flex-direction: column;
            gap: 0.75rem;
          }
          
          .stream-thumbnail {
            width: 100%;
            height: 120px;
          }
          
          .stream-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.5rem;
          }
        }
        @media (max-width: 640px) {
          .stream-title {
            max-width: 65vw;
          }
        }
      `}</style>
    </div>
  )
}

export default TwitchCard