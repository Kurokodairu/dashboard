          import { useState, useEffect } from 'react'
import { Terminal, Clipboard } from 'lucide-react'
import './LinuxCommand.css'

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
    </div>
  )
}

export default LinuxCommandCard
