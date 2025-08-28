import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { PrivateRoute } from './components/PrivateRoute'
import { Home } from './pages/home'
import { LandingPage } from './pages/landing-page'
import { LoginForm } from './pages/login-form'
import { Register } from './pages/register-user'
import { AuthProvider } from './providers/auth-provider'

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginForm />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/home"
            element={
              <PrivateRoute>
                <Home />
              </PrivateRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
