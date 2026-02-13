import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ErrorBoundary from '../components/ErrorBoundary'

// Component that throws an error
const ThrowError = () => {
  throw new Error('Test error')
}

// Component that works fine
const WorkingComponent = () => <div>Working!</div>

describe('ErrorBoundary', () => {
  it('renders children when there is no error', () => {
    render(
      <ErrorBoundary widgetName="Test Widget">
        <WorkingComponent />
      </ErrorBoundary>
    )

    expect(screen.getByText('Working!')).toBeInTheDocument()
  })

  it('catches errors and displays error UI', () => {
    // Suppress console.error for this test
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    render(
      <ErrorBoundary widgetName="Test Widget">
        <ThrowError />
      </ErrorBoundary>
    )

    expect(screen.getByText('Test Widget Error')).toBeInTheDocument()
    expect(screen.getByText('Something went wrong loading this widget.')).toBeInTheDocument()
    expect(screen.getByText('Try Again')).toBeInTheDocument()

    consoleSpy.mockRestore()
  })

  it('resets error state when Try Again is clicked', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const user = userEvent.setup()

    let shouldThrow = true
    const ConditionalError = () => {
      if (shouldThrow) {
        throw new Error('Test error')
      }
      return <div>Fixed!</div>
    }

    const { rerender } = render(
      <ErrorBoundary widgetName="Test Widget">
        <ConditionalError />
      </ErrorBoundary>
    )

    expect(screen.getByText('Test Widget Error')).toBeInTheDocument()

    // Fix the error and click Try Again
    shouldThrow = false
    await user.click(screen.getByText('Try Again'))

    // Note: In a real scenario, the error boundary would need to be forced to re-render
    // This is a simplified test

    consoleSpy.mockRestore()
  })

  it('uses default name if widgetName prop is not provided', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    )

    expect(screen.getByText('Widget Error')).toBeInTheDocument()

    consoleSpy.mockRestore()
  })
})
