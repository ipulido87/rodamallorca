import { describe, it, expect, beforeEach, vi } from 'vitest'

const interceptorHandlers: {
  rejected?: (error: unknown) => Promise<never>
} = {}

vi.mock('axios', () => {
  return {
    default: {
      create: vi.fn(() => ({
        interceptors: {
          response: {
            use: vi.fn((_onFulfilled: unknown, onRejected: (error: unknown) => Promise<never>) => {
              interceptorHandlers.rejected = onRejected
              return 0
            }),
          },
        },
      })),
    },
  }
})

describe('API response interceptor subscription redirect', () => {
  beforeEach(() => {
    interceptorHandlers.rejected = undefined
    vi.resetModules()

    Object.defineProperty(globalThis, 'location', {
      value: {
        pathname: '/',
        href: '',
      },
      writable: true,
      configurable: true,
    })
  })

  it('redirects to activate-subscription when outside subscription pages', async () => {
    await import('../../shared/api/api-client')

    await expect(
      interceptorHandlers.rejected?.({
        response: {
          status: 403,
          data: { error: 'NO_ACTIVE_SUBSCRIPTION' },
        },
      })
    ).rejects.toMatchObject({ isSubscriptionRequired: true })

    expect(globalThis.location.href).toBe('/activate-subscription')
  })

  it('does not redirect when user is already in pricing page', async () => {
    globalThis.location.pathname = '/pricing'
    await import('../../shared/api/api-client')

    await expect(
      interceptorHandlers.rejected?.({
        response: {
          status: 403,
          data: { error: 'NO_ACTIVE_SUBSCRIPTION' },
        },
      })
    ).rejects.toMatchObject({ isSubscriptionRequired: true })

    expect(globalThis.location.href).toBe('')
  })

  it('does not redirect when user is in subscription result pages', async () => {
    globalThis.location.pathname = '/subscription/success'
    await import('../../shared/api/api-client')

    await expect(
      interceptorHandlers.rejected?.({
        response: {
          status: 403,
          data: { error: 'NO_ACTIVE_SUBSCRIPTION' },
        },
      })
    ).rejects.toMatchObject({ isSubscriptionRequired: true })

    expect(globalThis.location.href).toBe('')
  })
})
