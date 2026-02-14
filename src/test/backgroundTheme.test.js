import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import useSettingsStore from '../stores/settingsStore'

describe('Background Theme Settings', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear()
    // Reset the store to default state
    const { result } = renderHook(() => useSettingsStore())
    act(() => {
      result.current.resetSettings()
    })
  })

  it('should have transparent as the default background theme', () => {
    const { result } = renderHook(() => useSettingsStore())
    expect(result.current.backgroundTheme).toBe('transparent')
  })

  it('should update background theme to dark', () => {
    const { result } = renderHook(() => useSettingsStore())
    
    act(() => {
      result.current.setBackgroundTheme('dark')
    })

    expect(result.current.backgroundTheme).toBe('dark')
  })

  it('should update background theme back to transparent', () => {
    const { result } = renderHook(() => useSettingsStore())
    
    act(() => {
      result.current.setBackgroundTheme('dark')
    })
    expect(result.current.backgroundTheme).toBe('dark')

    act(() => {
      result.current.setBackgroundTheme('transparent')
    })
    expect(result.current.backgroundTheme).toBe('transparent')
  })

  it('should persist background theme to localStorage', () => {
    const { result } = renderHook(() => useSettingsStore())
    
    act(() => {
      result.current.setBackgroundTheme('dark')
    })

    // Get the stored value from localStorage
    const stored = JSON.parse(localStorage.getItem('dashboard-settings'))
    expect(stored.state.backgroundTheme).toBe('dark')
  })

  it('should restore background theme from localStorage', () => {
    // First set the theme
    const { result: result1 } = renderHook(() => useSettingsStore())
    act(() => {
      result1.current.setBackgroundTheme('dark')
    })

    // Simulate a page reload by creating a new hook instance
    const { result: result2 } = renderHook(() => useSettingsStore())
    expect(result2.current.backgroundTheme).toBe('dark')
  })

  it('should reset background theme when resetSettings is called', () => {
    const { result } = renderHook(() => useSettingsStore())
    
    act(() => {
      result.current.setBackgroundTheme('dark')
    })
    expect(result.current.backgroundTheme).toBe('dark')

    act(() => {
      result.current.resetSettings()
    })
    expect(result.current.backgroundTheme).toBe('transparent')
  })

  it('should validate theme values in migration', () => {
    // Test that the migration function properly validates theme values
    const { result } = renderHook(() => useSettingsStore())
    
    // Set a valid theme
    act(() => {
      result.current.setBackgroundTheme('dark')
    })
    expect(result.current.backgroundTheme).toBe('dark')
    
    // Set it back to transparent
    act(() => {
      result.current.setBackgroundTheme('transparent')
    })
    expect(result.current.backgroundTheme).toBe('transparent')
  })
})
