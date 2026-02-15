import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const DEFAULT_WIDGET_LAYOUT = [
  { id: 'weather', column: 0, order: 1, visible: true },
  { id: 'vg', column: 0, order: 2, visible: true },
  { id: 'calendar', column: 0, order: 3, visible: false },
  { id: 'twitch', column: 1, order: 1, visible: true },
  { id: 'crypto', column: 1, order: 2, visible: true },
  { id: 'command', column: 2, order: 1, visible: true },
  { id: 'github', column: 2, order: 2, visible: true }
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
        showSettings: false
      })
    }),
    {
      name: 'dashboard-settings',
      version: 4,
      migrate: (persistedState, version) => {
        if (!persistedState || typeof persistedState !== 'object') {
          return persistedState
        }

        let state = { ...persistedState }

        // Migration from version 2 to 3: Remove column property from widgetLayout
        if (version < 3 && Array.isArray(state.widgetLayout)) {
          const leftWidgets = state.widgetLayout
            .filter(w => w.column === 'left')
            .sort((a, b) => a.order - b.order)
          
          const rightWidgets = state.widgetLayout
            .filter(w => w.column === 'right')
            .sort((a, b) => a.order - b.order)
          
          // Combine: left widgets first, then right widgets
          const combined = [...leftWidgets, ...rightWidgets]
          
          // Remove column property and renumber orders
          state.widgetLayout = combined.map((widget, index) => ({
            id: widget.id,
            order: index + 1,
            visible: widget.visible
          }))
        }

        // Migration from version 3 to 4: Add column property back (0=left, 1=middle, 2=right)
        if (version < 4 && Array.isArray(state.widgetLayout)) {
          // Group widgets by their future columns
          const columns = { 0: [], 1: [], 2: [] }
          
          state.widgetLayout.forEach((widget, index) => {
            const col = index % 3
            columns[col].push(widget)
          })
          
          // Assign column and order based on position within each column
          state.widgetLayout = state.widgetLayout.map((widget, index) => {
            const col = index % 3
            const orderInColumn = columns[col].findIndex(w => w.id === widget.id) + 1
            
            return {
              id: widget.id,
              column: col,
              order: orderInColumn,
              visible: widget.visible
            }
          })
        }

        // Normalize orders to ensure they're sequential within each column
        if (Array.isArray(state.widgetLayout)) {
          const byColumn = { 0: [], 1: [], 2: [] }
          
          state.widgetLayout.forEach(w => {
            if (byColumn[w.column] !== undefined) {
              byColumn[w.column].push(w)
            }
          })
          
          const orderMap = {}
          Object.keys(byColumn).forEach(col => {
            byColumn[col]
              .sort((a, b) => {
                if (a.order !== b.order) return a.order - b.order
                return a.id.localeCompare(b.id)
              })
              .forEach((w, index) => {
                orderMap[w.id] = index + 1
              })
          })
          
          state.widgetLayout = state.widgetLayout.map(w => ({
            ...w,
            order: orderMap[w.id] !== undefined ? orderMap[w.id] : w.order
          }))
        }

        return {
          ...state,
          widgetLayout: getSafeWidgetLayout(state.widgetLayout),
          calendarLink: typeof state.calendarLink === 'string' ? state.calendarLink : '',
          bookmarks: Array.isArray(state.bookmarks) ? state.bookmarks : []
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
          bookmarks: Array.isArray(typedPersistedState.bookmarks) ? typedPersistedState.bookmarks : []
        }
      }
    }
  )
)

export default useSettingsStore
