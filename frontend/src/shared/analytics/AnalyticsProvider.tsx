import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { posthog } from './posthog'

export function AnalyticsProvider({ children }: Readonly<{ children: React.ReactNode }>) {
  const location = useLocation()

  useEffect(() => {
    posthog.capture('$pageview', {
      $current_url: globalThis.location.href,
    })
  }, [location.pathname])

  return <>{children}</>
}
