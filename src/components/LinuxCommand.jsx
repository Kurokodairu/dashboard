          import { useState, useEffect } from 'react'
import { Terminal, Clipboard } from 'lucide-react'

const LinuxCommandCard = () => {
  const [command, setCommand] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [copied, setCopied] = useState(false)

  const fetchCommand = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/api/command')
      if (!response.ok) throw new Error('Failed to fetch command')
      
      const data = await response.json()
      setCommand(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCommand()
  }, [])

  const handleCopy = async () => {
    if (command?.command) {
      try {
        await navigator.clipboard.writeText(command.command)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      } catch (err) {
        console.error('Failed to copy:', err)
      }
    }
  }


  if (loading) {
    return (
      <div className="glass-card">
        <h2 className="card-title">
          <Terminal size={24} />
          Linux Command
        </h2>
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading command...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="glass-card">
        <h2 className="card-title">
          <Terminal size={24} />
          Linux Command
        </h2>
        <div className="error">
          <p>Error: {error}</p>
        </div>
      </div>
    )
  }

  if (!command) {
    return (
      <div className="glass-card">
        <h2 className="card-title">
          <Terminal size={24} />
          Linux Command
        </h2>
        <div className="no-command">
          <Terminal size={48} />
          <p>No command available</p>
        </div>
      </div>
    )
  }

  return (
    <div className="glass-card">
      <div className="terminal-card">
        <div className="command-line">
          <code>$ {command.command}</code>
          <button onClick={handleCopy} title="Copy to clipboard">
            <Clipboard size={14} />
            {copied ? 'Copied' : 'Copy'}
          </button>
        </div>

        <div className="command-desc">{command.description}</div>
        {command.example && (
          <pre className="command-example">$ {command.example}</pre>
        )}
      </div>

      <style>{`
        .terminal-card {
          background: rgba(0,0,0,0.6);
          border-radius: 8px;
          padding: 1rem;
          font-family: monospace;
          color: #0f0;
        }

        .command-line {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 0.5rem;
        }

        .command-line code {
          font-weight: bold;
        }

        .command-desc {
          margin-top: 1rem;
          color: #ccc;
        }

        .command-example {
          background: rgba(255,255,255,0.05);
          padding: 0.5rem;
          margin-top: 0.5rem;
          border-radius: 4px;
          color: #bada55;
          overflow: scroll;
          white-space: nowrap;
        }

        button {
          background: transparent;
          border: none;
          color: #0f0;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 0.25rem;
          font-size: 0.75rem;
        }


        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }

        .loading, .error, .no-command {
          text-align: center;
          padding: 2rem;
          opacity: 0.6;
        }

        .spinner {
          width: 24px;
          height: 24px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top: 2px solid white;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto 1rem;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}

export default LinuxCommandCard
