import { bucket } from '@/routes/AnalysisView'

describe('bucket', () => {
  test('categorises scores', () => {
    expect(bucket(null)).toBe('blank')
    expect(bucket(85)).toBe('top')
    expect(bucket(65)).toBe('good')
    expect(bucket(45)).toBe('weak')
    expect(bucket(20)).toBe('poor')
  })
})
