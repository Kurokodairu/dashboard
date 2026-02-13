import { create } from 'zustand'

/**
 * Timer store for focus timer state
 * Not persisted - timer state resets on page reload
 */
const useTimerStore = create((set, get) => ({
  // Timer state
  timeLeft: 25 * 60, // 25 minutes in seconds
  isRunning: false,
  isPaused: false,
  mode: 'focus', // 'focus', 'shortBreak', 'longBreak'
  sessionsCompleted: 0,

  // Timer actions
  startTimer: () => set({ isRunning: true, isPaused: false }),
  
  pauseTimer: () => set({ isPaused: true }),
  
  resumeTimer: () => set({ isPaused: false }),
  
  stopTimer: () => set({ 
    isRunning: false, 
    isPaused: false,
    timeLeft: get().getDefaultTime()
  }),
  
  resetTimer: () => {
    const defaultTime = get().getDefaultTime()
    set({ 
      timeLeft: defaultTime,
      isRunning: false,
      isPaused: false
    })
  },
  
  tick: () => {
    const { timeLeft, isRunning, isPaused } = get()
    
    if (isRunning && !isPaused && timeLeft > 0) {
      set({ timeLeft: timeLeft - 1 })
    }
    
    if (timeLeft === 0 && isRunning) {
      get().completeSession()
    }
  },
  
  completeSession: () => {
    const { mode, sessionsCompleted } = get()
    
    // Increment sessions count
    const newSessionsCompleted = mode === 'focus' ? sessionsCompleted + 1 : sessionsCompleted
    
    // Determine next mode
    let nextMode
    if (mode === 'focus') {
      nextMode = newSessionsCompleted % 4 === 0 ? 'longBreak' : 'shortBreak'
    } else {
      nextMode = 'focus'
    }
    
    set({
      mode: nextMode,
      sessionsCompleted: newSessionsCompleted,
      timeLeft: get().getDefaultTime(nextMode),
      isRunning: false,
      isPaused: false
    })
  },
  
  setMode: (mode) => {
    set({ 
      mode,
      timeLeft: get().getDefaultTime(mode),
      isRunning: false,
      isPaused: false
    })
  },
  
  // Helper to get default time for a mode
  getDefaultTime: (modeOverride) => {
    const mode = modeOverride || get().mode
    const times = {
      focus: 25 * 60,
      shortBreak: 5 * 60,
      longBreak: 15 * 60
    }
    return times[mode] || times.focus
  }
}))

export default useTimerStore
