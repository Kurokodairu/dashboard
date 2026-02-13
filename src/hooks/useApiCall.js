import { useState, useCallback } from 'react'
import logger from '../utils/logger'

/**
 * Custom hook for API calls with consistent error handling and loading states
 * @param {Function} apiFunction - Async function that makes the API call
 * @param {Object} options - Configuration options
 * @returns {Object} - { data, loading, error, execute, reset }
 */
export function useApiCall(apiFunction, options = {}) {
  const { onSuccess, onError, initialData = null } = options
  
  const [data, setData] = useState(initialData)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const execute = useCallback(async (...args) => {
    try {
      setLoading(true)
      setError(null)
       const result = await apiFunction(...args)
      setData(result)
      
      if (onSuccess) {
        onSuccess(result)
      }
      
      return result
    } catch (err) {
      const errorMessage = err.message || 'An error occurred'
      setError(errorMessage)
      logger.error('API call failed:', errorMessage, err)
      
      if (onError) {
        onError(err)
      }
      
      throw err
    } finally {
      setLoading(false)
    }
  }, [apiFunction, onSuccess, onError])

  const reset = useCallback(() => {
    setData(initialData)
    setError(null)
    setLoading(false)
  }, [initialData])

  return {
    data,
    loading,
    error,
    execute,
    reset
  }
}

export default useApiCall
