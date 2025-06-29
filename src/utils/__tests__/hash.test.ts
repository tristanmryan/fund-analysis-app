import { sha1Hex } from '../hash'
import { TextEncoder } from 'util'
import { webcrypto as nodeCrypto } from 'crypto'

// polyfill TextEncoder for jsdom environment
(global as any).TextEncoder = (global as any).TextEncoder || TextEncoder;
(global as any).crypto = (global as any).crypto || nodeCrypto;

describe('sha1Hex', () => {
  it('computes SHA-1 hex for Uint8Array', async () => {
    const enc = new TextEncoder()
    const data = enc.encode('hello')
    const hex = await sha1Hex(data)
    expect(hex).toBe('aaf4c61ddcc5e8a2dabede0f3b482cd9aea9434d')
  })

})
