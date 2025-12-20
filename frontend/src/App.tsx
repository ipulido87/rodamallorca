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
import { MyOrders } from './features/orders/pages/my-orders'
import { OrderDetail } from './features/orders/pages/order-detail'
import { WorkshopOrders } from './features/orders/pages/workshop-orders'
import { Orders } from './features/orders/pages/orders'
import { WorkshopServices } from './features/services/pages/workshop-services'
import { BillingInvoices } from './features/billing/pages/billing-invoices'
import { CreateInvoice } from './features/billing/pages/create-invoice'
import { InvoiceDetails } from './features/billing/pages/invoice-details'
import { Cart } from './features/cart/pages/Cart'
import { Checkout } from './features/cart/pages/Checkout'
import { Home } from './pages/HomePage'
import { LandingPage } from './pages/LandingPage'
import { LoginForm } from './features/auth/pages/login-form'
import { Register } from './features/auth/pages/register-form'
import { AuthProvider } from './providers/auth-provider'
import { CartProvider } from './features/cart/contexts/CartContext'
import { SnackbarProvider } from './shared/hooks/use-snackbar'
import { ForgotPassword } from './features/auth/pages/forgot-password'
import { ResetPassword } from './features/auth/pages/reset-password'
import { GoogleCallbackHandler } from './pages/google-callback-handler'

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <SnackbarProvider>
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

          <Route path="/auth/callback" element={<GoogleCallbackHandler />} />
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
            <Route path="orders/:orderId" element={<OrderDetail />} />

            {/* Rutas solo para USER */}
            <Route path="home" element={<Home />} />
            <Route path="my-orders" element={<MyOrders />} />
            <Route path="cart" element={<Cart />} />
            <Route path="checkout" element={<Checkout />} />
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
              path="orders"
              element={
                <RoleRoute requiredRole="WORKSHOP_OWNER">
                  <Orders />
                </RoleRoute>
              }
            />
            <Route
              path="services/:workshopId"
              element={
                <RoleRoute requiredRole="WORKSHOP_OWNER">
                  <WorkshopServices />
                </RoleRoute>
              }
            />
            <Route
              path="workshop-orders/:workshopId"
              element={
                <RoleRoute requiredRole="WORKSHOP_OWNER">
                  <WorkshopOrders />
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
              path="billing/:workshopId"
              element={
                <RoleRoute requiredRole="WORKSHOP_OWNER">
                  <BillingInvoices />
                </RoleRoute>
              }
            />
            <Route
              path="billing/:workshopId/invoice/:invoiceId"
              element={
                <RoleRoute requiredRole="WORKSHOP_OWNER">
                  <InvoiceDetails />
                </RoleRoute>
              }
            />
            <Route
              path="billing/:workshopId/create"
              element={
                <RoleRoute requiredRole="WORKSHOP_OWNER">
                  <CreateInvoice />
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
          </SnackbarProvider>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
