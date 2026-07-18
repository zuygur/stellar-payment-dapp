import { describe, it, expect } from 'vitest'
import { generatePaymentId, isValidRecipient, isValidAmount } from './utils'

describe('generatePaymentId', () => {
  it('generates unique IDs on consecutive calls', () => {
    const id1 = generatePaymentId()
    const id2 = generatePaymentId()
    expect(id1).not.toBe(id2)
  })
})

describe('isValidRecipient', () => {
  it('accepts a valid 56-character Stellar address starting with G', () => {
    const validAddress = 'G' + 'A'.repeat(55)
    expect(isValidRecipient(validAddress)).toBe(true)
  })

  it('rejects an address that does not start with G', () => {
    const invalidAddress = 'C' + 'A'.repeat(55)
    expect(isValidRecipient(invalidAddress)).toBe(false)
  })

  it('rejects an empty recipient', () => {
    expect(isValidRecipient('')).toBe(false)
  })
})

describe('isValidAmount', () => {
  it('accepts a positive number', () => {
    expect(isValidAmount('10')).toBe(true)
  })

  it('rejects zero or negative amounts', () => {
    expect(isValidAmount('0')).toBe(false)
    expect(isValidAmount('-5')).toBe(false)
  })

  it('rejects non-numeric input', () => {
    expect(isValidAmount('abc')).toBe(false)
  })
})