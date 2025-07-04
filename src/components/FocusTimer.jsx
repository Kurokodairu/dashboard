import { useState, useEffect, useRef } from 'react'
import { Play, Pause, RotateCcw, Clock, Coffee, Brain } from 'lucide-react'

const FocusTimer = ({ isVisible = true }) => {
  const [minutes, setMinutes] = useState(25)
  const [seconds, setSeconds] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const [isBreak, setIsBreak] = useState(false)
  const [sessions, setSessions] = useState(0)
  const [initialDuration, setInitialDuration] = useState(25 * 60) // Track initial duration in seconds
  const intervalRef = useRef(null)

  useEffect(() => {
    if (isRunning && (minutes > 0 || seconds > 0)) {
      intervalRef.current = setInterval(() => {
        setSeconds(prevSeconds => {
          if (prevSeconds > 0) {
            return prevSeconds - 1
          } else if (minutes > 0) {
            setMinutes(prevMinutes => prevMinutes - 1)
            return 59
          } else {
            // Timer finished
            setIsRunning(false)
            handleTimerComplete()
            return 0
          }
        })
      }, 1000)
    } else {
      clearInterval(intervalRef.current)
    }

    return () => clearInterval(intervalRef.current)
  }, [isRunning, minutes, seconds])

  const handleTimerComplete = () => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(isBreak ? 'Break time over!' : 'Focus session complete!', {
        body: isBreak ? 'Time to get back to work!' : 'Take a well-deserved break!',
        icon: '/icon.svg'
      })
    }

    if (isBreak) {
      setIsBreak(false)
      setMinutes(25)
      setSeconds(0)
      setInitialDuration(25 * 60)
    } else {
      setSessions(prev => prev + 1)
      setIsBreak(true)
      // Short break (5 min) or long break (15 min) every 4 sessions
      const isLongBreak = (sessions + 1) % 4 === 0
      const breakMinutes = isLongBreak ? 15 : 5
      setMinutes(breakMinutes)
      setSeconds(0)
      setInitialDuration(breakMinutes * 60)
    }
  }

  const toggleTimer = () => {
    setIsRunning(!isRunning)
  }

  const resetTimer = () => {
    setIsRunning(false)
    setIsBreak(false)
    setMinutes(25)
    setSeconds(0)
    setInitialDuration(25 * 60)
  }

  const adjustMinutes = (delta) => {
    if (!isRunning) {
      const newMinutes = Math.max(1, Math.min(60, minutes + delta))
      setMinutes(newMinutes)
      setSeconds(0)
      setInitialDuration(newMinutes * 60)
    }
  }

  const formatTime = (mins, secs) => {
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const getProgress = () => {
    const currentTime = minutes * 60 + seconds
    const elapsedTime = initialDuration - currentTime
    return Math.max(0, Math.min(100, (elapsedTime / initialDuration) * 100))
  }

  // Request notification permission on mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }
  }, [])

  if (!isVisible) return null

  return (
    <div className="focus-timer">
      <div className="timer-container">
        <div className="timer-header">
          <div className="timer-icon">
            {isBreak ? <Coffee size={20} /> : <Brain size={20} />}
          </div>
          <span className="timer-mode">
            {isBreak ? (sessions % 4 === 3 ? 'Long Break' : 'Short Break') : 'Focus'}
          </span>
          <div className="session-counter">
            <Clock size={16} />
            <span>{sessions}</span>
          </div>
        </div>

        <div className="timer-display">
          <div className="time-controls">
            {!isRunning && !isBreak && (
              <button 
                className="time-adjust"
                onClick={() => adjustMinutes(-5)}
                disabled={minutes <= 5}
              >
                -5
              </button>
            )}
            <div className="time-text">
              {formatTime(minutes, seconds)}
            </div>
            {!isRunning && !isBreak && (
              <button 
                className="time-adjust"
                onClick={() => adjustMinutes(5)}
                disabled={minutes >= 55}
              >
                +5
              </button>
            )}
          </div>

          <div className="progress-ring">
            <svg className="progress-circle" width="120" height="120">
              <circle
                cx="60"
                cy="60"
                r="54"
                fill="none"
                stroke="rgba(255, 255, 255, 0.1)"
                strokeWidth="4"
              />
              <circle
                cx="60"
                cy="60"
                r="54"
                fill="none"
                stroke={isBreak ? "#22c55e" : "#3b82f6"}
                strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 54}`}
                strokeDashoffset={`${2 * Math.PI * 54 * (1 - getProgress() / 100)}`}
                transform="rotate(-90 60 60)"
                style={{ transition: 'stroke-dashoffset 1s ease' }}
              />
            </svg>
          </div>
        </div>

        <div className="timer-controls">
          <button className="control-button secondary" onClick={resetTimer}>
            <RotateCcw size={20} />
          </button>
          <button 
            className={`control-button primary ${isRunning ? 'pause' : 'play'}`}
            onClick={toggleTimer}
          >
            {isRunning ? <Pause size={24} /> : <Play size={24} />}
          </button>
          <div className="control-spacer"></div>
        </div>
      </div>

      <style>{`
        .focus-timer {
          display: flex;
          justify-content: center;
          width: 100%;
          margin: 1rem 0 2rem 0;
          z-index: 5;
        }

        .timer-container {
          background: rgba(255, 255, 255, 0.08);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.15);
          border-radius: 20px;
          padding: 1.5rem;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
          min-width: 280px;
          max-width: 320px;
        }

        .timer-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 1rem;
          color: white;
        }

        .timer-icon {
          display: flex;
          align-items: center;
          color: ${isBreak ? '#22c55e' : '#3b82f6'};
        }

        .timer-mode {
          font-weight: 600;
          font-size: 1rem;
        }

        .session-counter {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.9rem;
          opacity: 0.8;
        }

        .timer-display {
          display: flex;
          flex-direction: column;
          align-items: center;
          margin-bottom: 1.5rem;
          position: relative;
        }

        .time-controls {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 1rem;
        }

        .time-adjust {
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          color: white;
          padding: 0.4rem 0.8rem;
          border-radius: 8px;
          font-size: 0.8rem;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .time-adjust:hover:not(:disabled) {
          background: rgba(255, 255, 255, 0.2);
        }

        .time-adjust:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        .time-text {
          font-size: 2.5rem;
          font-weight: 700;
          color: white;
          font-family: 'Courier New', monospace;
          text-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
          min-width: 120px;
          text-align: center;
        }

        .progress-ring {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          z-index: -1;
        }

        .progress-circle {
          transform: rotate(-90deg);
        }

        .timer-controls {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 1rem;
        }

        .control-button {
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          color: white;
          padding: 0.8rem;
          border-radius: 12px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
          position: relative;
        }

        .control-button.primary {
          background: ${isBreak ? 'rgba(34, 197, 94, 0.2)' : 'rgba(59, 130, 246, 0.2)'};
          border-color: ${isBreak ? 'rgba(34, 197, 94, 0.4)' : 'rgba(59, 130, 246, 0.4)'};
          padding: 1rem;
        }

        .control-button.primary:hover {
          background: ${isBreak ? 'rgba(34, 197, 94, 0.3)' : 'rgba(59, 130, 246, 0.3)'};
          border-color: ${isBreak ? 'rgba(34, 197, 94, 0.6)' : 'rgba(59, 130, 246, 0.6)'};
          transform: translateY(-2px);
        }

        .control-button.secondary:hover {
          background: rgba(255, 255, 255, 0.2);
          border-color: rgba(255, 255, 255, 0.3);
        }

        .control-spacer {
          width: 56px;
        }

        @media (max-width: 480px) {
          .timer-container {
            min-width: 250px;
            max-width: 280px;
            padding: 1rem;
          }

          .time-text {
            font-size: 2rem;
          }
        }
      `}</style>
    </div>
  )
}

export default FocusTimer