import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { PrivateRoute } from './components/private-ruta'
import { RoleRoute } from './components/role-route'
import { Catalog } from './pages/catalog'
import { CreateProduct } from './pages/create-product'
import { CreateWorkshop } from './pages/create-workshop'
import { Dashboard } from './pages/dashboard'
import { Home } from './pages/home'
import { LandingPage } from './pages/landing-page'
import { LoginForm } from './pages/login-form'
import { ProductDetail } from './pages/product-detail'
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
          <Route
            path="/dashboard"
            element={
              <RoleRoute requiredRole="WORKSHOP_OWNER">
                <Dashboard />
              </RoleRoute>
            }
          />
          <Route
            path="/create-workshop"
            element={
              <RoleRoute requiredRole="WORKSHOP_OWNER">
                <CreateWorkshop />
              </RoleRoute>
            }
          />

          <Route
            path="/create-product"
            element={
              <RoleRoute requiredRole="WORKSHOP_OWNER">
                <CreateProduct />
              </RoleRoute>
            }
          />
          <Route path="/catalog" element={<Catalog />} />
          <Route path="/product/:id" element={<ProductDetail />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
