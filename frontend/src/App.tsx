import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { MainLayout } from './components/layout/main-layout'
import { PublicLayout } from './components/layout/public-layout'
import { PrivateRoute } from './components/private-ruta'
import { RoleRoute } from './components/role-route'
import { Catalog } from './features/catalog/index'
import { Dashboard } from './features/dashboard/index'
import { MyProducts, ProductDetail } from './features/products'
import { CreateProduct, EditProduct } from './features/products/index'
import { CreateWorkshop } from './features/workshops/pages/create-workshop'
import { EditWorkshop } from './features/workshops/pages/edit-workshop'
import { MyWorkshops } from './features/workshops/pages/my-work-shops'
import { WorkshopDetail } from './features/workshops/pages/workshop-detail'
import { Home } from './pages/HomePage'
import { LandingPage } from './pages/LandingPage'
import { LoginForm } from './features/auth/pages/login-form'
import { Register } from './pages/register-user'
import { AuthProvider } from './providers/auth-provider'
import { ForgotPassword } from './features/auth/pages/forgot-password'
import { ResetPassword } from './features/auth/pages/reset-password'

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Rutas públicas con PublicLayout */}
          <Route
            path="/"
            element={
              <PublicLayout showFooter={false}>
                <LandingPage />
              </PublicLayout>
            }
          />
          <Route
            path="/login"
            element={
              <PublicLayout>
                <LoginForm />
              </PublicLayout>
            }
          />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route
            path="/register"
            element={
              <PublicLayout>
                <Register />
              </PublicLayout>
            }
          />
          {/* Rutas privadas con MainLayout */}
          <Route
            path="/*"
            element={
              <PrivateRoute>
                <MainLayout />
              </PrivateRoute>
            }
          >
            {/* Rutas para ambos roles */}
            <Route path="catalog" element={<Catalog />} />
            <Route path="product/:id" element={<ProductDetail />} />
            <Route path="workshop/:id" element={<WorkshopDetail />} />

            {/* Rutas solo para USER */}
            <Route path="home" element={<Home />} />
            <Route
              path="my-orders"
              element={<div>Mis Pedidos - Por implementar</div>}
            />
            <Route
              path="favorites"
              element={<div>Favoritos - Por implementar</div>}
            />
            <Route
              path="repairs"
              element={<div>Reparaciones - Por implementar</div>}
            />

            {/* Rutas solo para WORKSHOP_OWNER */}
            <Route
              path="dashboard"
              element={
                <RoleRoute requiredRole="WORKSHOP_OWNER">
                  <Dashboard />
                </RoleRoute>
              }
            />
            <Route
              path="my-workshops"
              element={
                <RoleRoute requiredRole="WORKSHOP_OWNER">
                  <MyWorkshops />
                </RoleRoute>
              }
            />
            <Route
              path="create-workshop"
              element={
                <RoleRoute requiredRole="WORKSHOP_OWNER">
                  <CreateWorkshop />
                </RoleRoute>
              }
            />
            <Route
              path="edit-workshop/:id"
              element={
                <RoleRoute requiredRole="WORKSHOP_OWNER">
                  <EditWorkshop />
                </RoleRoute>
              }
            />
            <Route
              path="my-products"
              element={
                <RoleRoute requiredRole="WORKSHOP_OWNER">
                  <MyProducts />
                </RoleRoute>
              }
            />
            <Route
              path="create-product"
              element={
                <RoleRoute requiredRole="WORKSHOP_OWNER">
                  <CreateProduct />
                </RoleRoute>
              }
            />
            <Route
              path="edit-product/:id"
              element={
                <RoleRoute requiredRole="WORKSHOP_OWNER">
                  <EditProduct />
                </RoleRoute>
              }
            />
            <Route
              path="services"
              element={
                <RoleRoute requiredRole="WORKSHOP_OWNER">
                  <div>Servicios - Por implementar</div>
                </RoleRoute>
              }
            />
            <Route
              path="orders"
              element={
                <RoleRoute requiredRole="WORKSHOP_OWNER">
                  <div>Pedidos - Por implementar</div>
                </RoleRoute>
              }
            />
            <Route
              path="customers"
              element={
                <RoleRoute requiredRole="WORKSHOP_OWNER">
                  <div>Clientes - Por implementar</div>
                </RoleRoute>
              }
            />
            <Route
              path="billing"
              element={
                <RoleRoute requiredRole="WORKSHOP_OWNER">
                  <div>Facturación - Por implementar</div>
                </RoleRoute>
              }
            />

            {/* Rutas comunes */}
            <Route
              path="profile"
              element={<div>Mi Perfil - Por implementar</div>}
            />
            <Route
              path="settings"
              element={<div>Configuración - Por implementar</div>}
            />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
