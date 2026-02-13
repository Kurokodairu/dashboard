import { useState, useEffect, useCallback } from 'react'
import logger from '../utils/logger'

/**
 * Custom hook for localStorage with validation and sync
 * @param {string} key - localStorage key
 * @param {*} initialValue - Default value if key doesn't exist
 * @param {Object} options - Configuration options
 * @returns {Array} - [value, setValue, removeValue]
 */
export function useLocalStorage(key, initialValue, options = {}) {
  const { validate, serialize = JSON.stringify, deserialize = JSON.parse } = options

  // Get initial value from localStorage or use provided initial value
  const readValue = useCallback(() => {
    if (typeof window === 'undefined') {
      return initialValue
    }

    try {
      const item = window.localStorage.getItem(key)
      if (item === null) {
        return initialValue
      }

      const parsed = deserialize(item)
      
      // Validate if validator function provided
      if (validate && !validate(parsed)) {
        logger.warn(`Validation failed for localStorage key: ${key}`)
        return initialValue
      }

      return parsed
    } catch (error) {
      logger.error(`Error reading localStorage key "${key}":`, error)
      return initialValue
    }
  }, [key, initialValue, validate, deserialize])

  const [storedValue, setStoredValue] = useState(readValue)

  // Update localStorage when value changes
  const setValue = useCallback((value) => {
    try {
      // Allow value to be a function for same API as useState
      const valueToStore = value instanceof Function ? value(storedValue) : value

      // Validate before storing
      if (validate && !validate(valueToStore)) {
        logger.warn(`Validation failed for localStorage key: ${key}, not storing`)
        return
      }

      setStoredValue(valueToStore)

      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, serialize(valueToStore))
      }
    } catch (error) {
      logger.error(`Error setting localStorage key "${key}":`, error)
    }
  }, [key, storedValue, validate, serialize])

  const removeValue = useCallback(() => {
    try {
      setStoredValue(initialValue)
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(key)
      }
    } catch (error) {
      logger.error(`Error removing localStorage key "${key}":`, error)
    }
  }, [key, initialValue])

  // Listen for changes in other tabs/windows
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === key && e.newValue !== null) {
        try {
          const newValue = deserialize(e.newValue)
          if (!validate || validate(newValue)) {
            setStoredValue(newValue)
          }
        } catch (error) {
          logger.error(`Error parsing storage event for key "${key}":`, error)
        }
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [key, validate, deserialize])

  return [storedValue, setValue, removeValue]
}

export default useLocalStorage
