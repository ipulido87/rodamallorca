import { AppProviders } from './providers/AppProviders'
import { AppRoutes } from './router'
import { CookieBanner } from './shared/components/CookieBanner'

function App() {
  return (
    <AppProviders>
      <AppRoutes />
      <CookieBanner />
    </AppProviders>
  )
}

export default App
