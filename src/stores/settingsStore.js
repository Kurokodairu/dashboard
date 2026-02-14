import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const DEFAULT_WIDGET_LAYOUT = [
  { id: 'weather', column: 'left', order: 1, visible: true },
  { id: 'twitch', column: 'left', order: 2, visible: true },
  { id: 'crypto', column: 'right', order: 1, visible: true },
  { id: 'vg', column: 'right', order: 2, visible: true },
  { id: 'github', column: 'right', order: 3, visible: true },
  { id: 'calendar', column: 'right', order: 4, visible: false },
  { id: 'command', column: 'left', order: 4, visible: true }
]

const getSafeWidgetLayout = (value) => {
  return Array.isArray(value) ? value : DEFAULT_WIDGET_LAYOUT
}

/**
 * Settings store for dashboard configuration
 * Persists to localStorage automatically
 */
const useSettingsStore = create(
  persist(
    (set) => ({
      // City/location settings
      cityCoords: null,
      setCityCoords: (cityCoords) => set({ cityCoords }),

      // GitHub username
      githubUsername: 'kurokodairu',
      setGithubUsername: (username) => set({ githubUsername: username }),

      // Calendar link (public Google Calendar link or calendar ID)
      calendarLink: '',
      setCalendarLink: (calendarLink) => set({ calendarLink }),

      // Bookmarks
      bookmarks: [],
      setBookmarks: (bookmarks) => set({ bookmarks }),

      // Widget layout configuration
      widgetLayout: DEFAULT_WIDGET_LAYOUT,
      setWidgetLayout: (layoutOrUpdater) =>
        set((state) => {
          const nextLayout =
            typeof layoutOrUpdater === 'function'
              ? layoutOrUpdater(state.widgetLayout)
              : layoutOrUpdater

          return { widgetLayout: getSafeWidgetLayout(nextLayout) }
        }),

      // Focus timer visibility
      showFocusTimer: false,
      setShowFocusTimer: (show) => set({ showFocusTimer: show }),

      // Background theme ('transparent' or 'dark')
      backgroundTheme: 'transparent',
      setBackgroundTheme: (theme) => set({ backgroundTheme: theme }),

      // Settings panel state
      showSettings: false,
      setShowSettings: (show) => set({ showSettings: show }),
      toggleSettings: () => set((state) => ({ showSettings: !state.showSettings })),

      // Reset all settings to defaults
      resetSettings: () => set({
        cityCoords: null,
        githubUsername: 'kurokodairu',
        calendarLink: '',
        bookmarks: [],
        widgetLayout: DEFAULT_WIDGET_LAYOUT,
        showFocusTimer: false,
        backgroundTheme: 'transparent',
        showSettings: false
      })
    }),
    {
      name: 'dashboard-settings',
      version: 2,
      migrate: (persistedState) => {
        if (!persistedState || typeof persistedState !== 'object') {
          return persistedState
        }

        return {
          ...persistedState,
          widgetLayout: getSafeWidgetLayout(persistedState.widgetLayout),
          calendarLink: typeof persistedState.calendarLink === 'string' ? persistedState.calendarLink : '',
          bookmarks: Array.isArray(persistedState.bookmarks) ? persistedState.bookmarks : [],
          backgroundTheme: typeof persistedState.backgroundTheme === 'string' && ['transparent', 'dark'].includes(persistedState.backgroundTheme) ? persistedState.backgroundTheme : 'transparent'
        }
      },
      merge: (persistedState, currentState) => {
        const typedPersistedState =
          persistedState && typeof persistedState === 'object' ? persistedState : {}

        return {
          ...currentState,
          ...typedPersistedState,
          widgetLayout: getSafeWidgetLayout(typedPersistedState.widgetLayout),
          calendarLink: typeof typedPersistedState.calendarLink === 'string' ? typedPersistedState.calendarLink : '',
          bookmarks: Array.isArray(typedPersistedState.bookmarks) ? typedPersistedState.bookmarks : [],
          backgroundTheme: typeof typedPersistedState.backgroundTheme === 'string' && ['transparent', 'dark'].includes(typedPersistedState.backgroundTheme) ? typedPersistedState.backgroundTheme : 'transparent'
        }
      }
    }
  )
)

export default useSettingsStore
