import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'


describe('getImageUrl', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.stubEnv('VITE_API_URL', 'http://localhost:4000/api')
  })

  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('returns absolute urls untouched', async () => {
    const { getImageUrl } = await import('../../utils/api-urls')
    expect(getImageUrl('https://cdn.example.com/photo.jpg')).toBe('https://cdn.example.com/photo.jpg')
    expect(getImageUrl('blob:123')).toBe('blob:123')
    expect(getImageUrl('data:image/png;base64,abc')).toBe('data:image/png;base64,abc')
  })

  it('normalizes relative paths with and without leading slash', async () => {
    const { getImageUrl } = await import('../../utils/api-urls')
    expect(getImageUrl('/uploads/a.jpg')).toBe('http://localhost:4000/uploads/a.jpg')
    expect(getImageUrl('uploads/b.jpg')).toBe('http://localhost:4000/uploads/b.jpg')
  })

  it('returns empty string for empty path', async () => {
    const { getImageUrl } = await import('../../utils/api-urls')
    expect(getImageUrl('')).toBe('')
  })
})
