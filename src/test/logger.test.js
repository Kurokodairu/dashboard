import { describe, it, expect } from 'vitest'
import logger from '../utils/logger'

describe('logger utility', () => {
  it('exports logger object with required methods', () => {
    expect(logger).toBeDefined()
    expect(typeof logger.info).toBe('function')
    expect(typeof logger.warn).toBe('function')
    expect(typeof logger.error).toBe('function')
    expect(typeof logger.debug).toBe('function')
  })

  it('logger methods can be called without errors', () => {
    expect(() => logger.info('test info')).not.toThrow()
    expect(() => logger.warn('test warn')).not.toThrow()
    expect(() => logger.error('test error')).not.toThrow()
    expect(() => logger.debug('test debug')).not.toThrow()
  })

  it('logger handles multiple arguments', () => {
    expect(() => logger.info('message', { data: 'test' }, 123)).not.toThrow()
    expect(() => logger.error('error', new Error('test'))).not.toThrow()
  })
})
