import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { SWRConfig } from 'swr'
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
import { CheckoutSuccess } from './features/cart/pages/CheckoutSuccess'
import { CheckoutCancel } from './features/cart/pages/CheckoutCancel'
import { Favorites } from './features/favorites/pages/favorites'
import { Customers } from './features/customers/pages/customers'
import { CustomerDetail } from './features/customers/pages/customer-detail'
import { CustomerForm } from './features/customers/pages/customer-form'
import { PricingPage } from './features/subscriptions/pages/pricing'
import { SubscriptionSuccess } from './features/subscriptions/pages/subscription-success'
import { SubscriptionCancel } from './features/subscriptions/pages/subscription-cancel'
import { ActivateSubscription } from './features/subscriptions/pages/activate-subscription'
import { StripeConnectSuccess } from './features/payments/pages/stripe-connect-success'
import { StripeConnectRefresh } from './features/payments/pages/stripe-connect-refresh'
import { StripeDiagnosticPage } from './features/payments/pages/stripe-diagnostic-page'
import { Home } from './pages/HomePage'
import { LandingPage } from './pages/LandingPage'
import { LoginForm } from './features/auth/pages/login-form'
import { Register } from './features/auth/pages/register-form'
import { AuthProvider } from './providers/auth-provider'
import { CartProvider } from './features/cart/contexts/CartContext'
import { SnackbarProvider } from './shared/hooks/use-snackbar'
import { ConfirmDialogProvider } from './shared/hooks/use-confirm-dialog'
import { ForgotPassword } from './features/auth/pages/forgot-password'
import { ResetPassword } from './features/auth/pages/reset-password'
import { GoogleCallbackHandler } from './pages/google-callback-handler'
import { EmailVerifiedCallback } from './pages/email-verified-callback'
import { Profile } from './pages/Profile'
import { Settings } from './pages/Settings'

function App() {
  return (
    <BrowserRouter>
      <SWRConfig
        value={{
          revalidateOnFocus: true,
          revalidateOnReconnect: true,
          dedupingInterval: 2000,
          focusThrottleInterval: 5000,
          errorRetryCount: 3,
          errorRetryInterval: 5000,
          shouldRetryOnError: true,
          revalidateIfStale: true,
          keepPreviousData: true,
        }}
      >
        <AuthProvider>
          <CartProvider>
            <SnackbarProvider>
              <ConfirmDialogProvider>
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

          {/* ✅ CATÁLOGO PÚBLICO - Usuarios pueden explorar sin login */}
          <Route
            path="/catalog"
            element={
              <PublicLayout>
                <Catalog />
              </PublicLayout>
            }
          />
          <Route
            path="/product/:id"
            element={
              <PublicLayout>
                <ProductDetail />
              </PublicLayout>
            }
          />
          <Route
            path="/workshop/:id"
            element={
              <PublicLayout>
                <WorkshopDetail />
              </PublicLayout>
            }
          />

          <Route path="/auth/callback" element={<GoogleCallbackHandler />} />
          <Route path="/email-verified" element={<EmailVerifiedCallback />} />
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
            <Route path="orders/:orderId" element={<OrderDetail />} />

            {/* Rutas solo para USER */}
            <Route path="home" element={<Home />} />
            <Route path="my-orders" element={<MyOrders />} />
            <Route path="cart" element={<Cart />} />
            <Route path="checkout" element={<Checkout />} />
            <Route path="checkout/success" element={<CheckoutSuccess />} />
            <Route path="checkout/cancel" element={<CheckoutCancel />} />
            <Route path="favorites" element={<Favorites />} />
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
                  <Customers />
                </RoleRoute>
              }
            />
            <Route
              path="customers/new"
              element={
                <RoleRoute requiredRole="WORKSHOP_OWNER">
                  <CustomerForm />
                </RoleRoute>
              }
            />
            <Route
              path="customers/:id"
              element={
                <RoleRoute requiredRole="WORKSHOP_OWNER">
                  <CustomerDetail />
                </RoleRoute>
              }
            />
            <Route
              path="customers/:id/edit"
              element={
                <RoleRoute requiredRole="WORKSHOP_OWNER">
                  <CustomerForm />
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
            <Route path="profile" element={<Profile />} />
            <Route path="settings" element={<Settings />} />

            {/* Rutas de suscripciones */}
            <Route path="pricing" element={<PricingPage />} />
            <Route path="activate-subscription" element={<ActivateSubscription />} />
            <Route path="subscription/success" element={<SubscriptionSuccess />} />
            <Route path="subscription/cancel" element={<SubscriptionCancel />} />

            {/* Rutas de Stripe Connect */}
            <Route path="workshops/:id/stripe/success" element={<StripeConnectSuccess />} />
            <Route path="workshops/:id/stripe/refresh" element={<StripeConnectRefresh />} />
            <Route path="workshops/:workshopId/stripe/diagnostic" element={<StripeDiagnosticPage />} />
          </Route>
                </Routes>
              </ConfirmDialogProvider>
            </SnackbarProvider>
          </CartProvider>
        </AuthProvider>
      </SWRConfig>
    </BrowserRouter>
  )
}

export default App
