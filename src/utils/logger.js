/**
 * Centralized logging utility
 * Respects environment and provides consistent logging interface
 */

const isDev = import.meta.env?.DEV || process.env.NODE_ENV === 'development'

const logger = {
  info: (...args) => {
    if (isDev) {
      console.log('[INFO]', ...args)
    }
  },

  warn: (...args) => {
    if (isDev) {
      console.warn('[WARN]', ...args)
    }
  },

  error: (...args) => {
    // Always log errors, even in production
    console.error('[ERROR]', ...args)
  },

  debug: (...args) => {
    if (isDev) {
      console.log('[DEBUG]', ...args)
    }
  }
}

export default logger
