import { useState, useEffect } from 'react'
import { Tv, Users, Eye } from 'lucide-react'

const TwitchCard = () => {
  const [liveChannels, setLiveChannels] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isConfigured, setIsConfigured] = useState(false)

  useEffect(() => {
    // Check if Twitch is configured
    const clientId = import.meta.env.VITE_TWITCH_CLIENT_ID
    const accessToken = localStorage.getItem('twitch-access-token')
    
    if (!clientId || !accessToken) {
      setIsConfigured(false)
      setLoading(false)
      return
    }

    setIsConfigured(true)
    fetchLiveChannels()
  }, [])

  const fetchLiveChannels = async () => {
    try {
      setLoading(true)
      setError(null)

      const clientId = import.meta.env.VITE_TWITCH_CLIENT_ID
      const accessToken = localStorage.getItem('twitch-access-token')

      if (!clientId || !accessToken) {
        throw new Error('Twitch credentials not configured')
      }

      // Use Vercel function in production, direct API in development
      const apiUrl = import.meta.env.PROD 
        ? '/api/twitch'
        : '/twitch/helix/streams/followed'

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
  }

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

    // Use the exact current URL without any modifications
    const redirectUri = window.location.origin + window.location.pathname
    const scopes = 'user:read:follows'
    
    // Build the auth URL with proper encoding
    const authUrl = `https://id.twitch.tv/oauth2/authorize?` +
      `client_id=${clientId}&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `response_type=token&` +
      `scope=${encodeURIComponent(scopes)}`
    
    console.log('Redirect URI being used:', redirectUri)
    console.log('Full auth URL:', authUrl)
    
    window.location.href = authUrl
  }

  // Handle OAuth callback
  useEffect(() => {
    const hash = window.location.hash
    if (hash.includes('access_token')) {
      const params = new URLSearchParams(hash.substring(1))
      const accessToken = params.get('access_token')
      
      if (accessToken) {
        localStorage.setItem('twitch-access-token', accessToken)
        // Clean up URL
        window.history.replaceState({}, document.title, window.location.pathname)
        // Refresh the component
        window.location.reload()
      }
    }
  }, [])

  if (!isConfigured) {
    return (
      <div className="glass-card">
        <h2 className="card-title">
          <Tv size={24} />
          Live Channels
        </h2>
        <div className="twitch-setup">
          <p>Connect your Twitch account to see live channels you follow</p>
          <button className="connect-button" onClick={handleTwitchAuth}>
            Connect to Twitch
          </button>
          <div className="setup-instructions">
            <p className="text-sm">
              Make sure to add your <code>VITE_TWITCH_CLIENT_ID</code> to your environment variables
            </p>
            <p className="text-sm mt-2">
              <strong>Current redirect URI:</strong> {window.location.origin + window.location.pathname}
            </p>
            <p className="text-sm">
              Add this exact URL to your Twitch app's OAuth Redirect URLs
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
          <p className="text-sm mt-2">Check back later!</p>
        </div>
      </div>
    )
  }

  return (
    <div className="glass-card">
      <h2 className="card-title">
        <Tv size={24} />
        Live Channels ({liveChannels.length})
      </h2>
      
      <div className="streams-list">
        {liveChannels.slice(0, 5).map((stream) => (
          <div key={stream.id} className="stream-item">
            <div className="stream-thumbnail">
              <img 
                src={stream.thumbnail_url.replace('{width}', '80').replace('{height}', '45')}
                alt={`${stream.user_name} thumbnail`}
                onError={(e) => {
                  e.target.style.display = 'none'
                }}
              />
              <div className="live-indicator">LIVE</div>
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

        .setup-instructions code {
          background: rgba(255, 255, 255, 0.1);
          padding: 0.2rem 0.4rem;
          border-radius: 4px;
          font-family: monospace;
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
          width: 80px;
          height: 45px;
          border-radius: 8px;
          overflow: hidden;
          background: rgba(255, 255, 255, 0.1);
        }

        .stream-thumbnail img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .live-indicator {
          position: absolute;
          top: 4px;
          left: 4px;
          background: #ff0000;
          color: white;
          font-size: 0.6rem;
          font-weight: bold;
          padding: 0.1rem 0.3rem;
          border-radius: 3px;
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

        @media (max-width: 480px) {
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
      `}</style>
    </div>
  )
}

export default TwitchCard