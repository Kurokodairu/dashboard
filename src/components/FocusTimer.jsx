import { useState, useEffect, useRef, useCallback } from 'react'
import { Play, Pause, RotateCcw, Clock, Coffee, Brain } from 'lucide-react'
import './FocusTimer.css'

const FocusTimer = ({ isVisible = true }) => {
  const [minutes, setMinutes] = useState(25)
  const [seconds, setSeconds] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const [isBreak, setIsBreak] = useState(false)
  const [sessions, setSessions] = useState(0)
  const [initialDuration, setInitialDuration] = useState(25 * 60) // Track initial duration in seconds
  const intervalRef = useRef(null)

  const handleTimerComplete = useCallback(() => {
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
  }, [isBreak, sessions])

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
  }, [isRunning, minutes, seconds, handleTimerComplete])

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
          <div className="timer-icon" style={{ color: isBreak ? '#22c55e' : '#3b82f6' }}>
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
            style={{
              background: isBreak ? 'rgba(34, 197, 94, 0.2)' : 'rgba(59, 130, 246, 0.2)',
              borderColor: isBreak ? 'rgba(34, 197, 94, 0.4)' : 'rgba(59, 130, 246, 0.4)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = isBreak ? 'rgba(34, 197, 94, 0.3)' : 'rgba(59, 130, 246, 0.3)'
              e.currentTarget.style.borderColor = isBreak ? 'rgba(34, 197, 94, 0.6)' : 'rgba(59, 130, 246, 0.6)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = isBreak ? 'rgba(34, 197, 94, 0.2)' : 'rgba(59, 130, 246, 0.2)'
              e.currentTarget.style.borderColor = isBreak ? 'rgba(34, 197, 94, 0.4)' : 'rgba(59, 130, 246, 0.4)'
            }}
          >
            {isRunning ? <Pause size={24} /> : <Play size={24} />}
          </button>
          <div className="control-spacer"></div>
        </div>
      </div>
    </div>
  )
}

export default FocusTimer