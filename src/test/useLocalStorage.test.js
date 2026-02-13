import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import useLocalStorage from '../hooks/useLocalStorage'

describe('useLocalStorage', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('returns initial value when localStorage is empty', () => {
    const { result } = renderHook(() => useLocalStorage('test-key', 'default'))
    
    expect(result.current[0]).toBe('default')
  })

  it('stores and retrieves values from localStorage', () => {
    const { result } = renderHook(() => useLocalStorage('test-key', ''))
    
    act(() => {
      result.current[1]('stored value')
    })
    
    expect(result.current[0]).toBe('stored value')
    expect(localStorage.getItem('test-key')).toBe(JSON.stringify('stored value'))
  })

  it('handles complex objects', () => {
    const { result } = renderHook(() => useLocalStorage('test-object', {}))
    
    const testObject = { name: 'Test', count: 42 }
    
    act(() => {
      result.current[1](testObject)
    })
    
    expect(result.current[0]).toEqual(testObject)
  })

  it('supports functional updates', () => {
    const { result } = renderHook(() => useLocalStorage('counter', 0))
    
    act(() => {
      result.current[1](prev => prev + 1)
    })
    
    expect(result.current[0]).toBe(1)
    
    act(() => {
      result.current[1](prev => prev + 1)
    })
    
    expect(result.current[0]).toBe(2)
  })

  it('removes value from localStorage', () => {
    const { result } = renderHook(() => useLocalStorage('test-key', 'default'))
    
    act(() => {
      result.current[1]('stored')
    })
    
    expect(result.current[0]).toBe('stored')
    
    act(() => {
      result.current[2]() // removeValue
    })
    
    expect(result.current[0]).toBe('default')
    expect(localStorage.getItem('test-key')).toBeNull()
  })

  it('validates values with custom validator', () => {
    const validator = (value) => typeof value === 'number' && value > 0
    
    const { result } = renderHook(() => 
      useLocalStorage('validated', 10, { validate: validator })
    )
    
    // Valid value should be stored
    act(() => {
      result.current[1](20)
    })
    expect(result.current[0]).toBe(20)
    
    // Invalid value should not be stored
    act(() => {
      result.current[1](-5)
    })
    expect(result.current[0]).toBe(20) // Should remain unchanged
  })

  it('uses custom serializer and deserializer', () => {
    const { result } = renderHook(() =>
      useLocalStorage('custom', '', {
        serialize: (val) => `custom:${val}`,
        deserialize: (val) => val.replace('custom:', '')
      })
    )
    
    act(() => {
      result.current[1]('test')
    })
    
    expect(localStorage.getItem('custom')).toBe('custom:test')
    expect(result.current[0]).toBe('test')
  })
})
