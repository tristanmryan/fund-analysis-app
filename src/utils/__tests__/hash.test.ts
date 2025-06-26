import { sha1Hex } from '../hash'
import { TextEncoder } from 'util'

// polyfill TextEncoder for jsdom environment
(global as any).TextEncoder = (global as any).TextEncoder || TextEncoder

describe('sha1Hex', () => {
  it('computes SHA-1 hex for Uint8Array', async () => {
    const enc = new TextEncoder()
    const data = enc.encode('hello')
    const hex = await sha1Hex(data)
    expect(hex).toBe('aaf4c61ddcc5e8a2dabede0f3b482cd9aea9434d')
  })

})
