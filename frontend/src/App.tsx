import { AppProviders } from './providers/AppProviders'
import { AppRoutes } from './router'

function App() {
  return (
    <AppProviders>
      <AppRoutes />
    </AppProviders>
  )
}

export default App
