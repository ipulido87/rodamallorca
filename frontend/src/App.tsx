import { lazy, Suspense } from 'react'
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom'
import { SWRConfig } from 'swr'
import { MainLayout } from './components/layout/main-layout'
import { PublicLayout } from './components/layout/public-layout'
import { PrivateRoute } from './components/private-ruta'
import { RoleRoute } from './components/role-route'
import { AuthProvider } from './features/auth'
import { CartProvider } from './features/cart/contexts/CartContext'
import { SnackbarProvider } from './shared/hooks/use-snackbar'
import { ConfirmDialogProvider } from './shared/hooks/use-confirm-dialog'
import { PageLoader } from './shared/components/PageLoader'

// Eager loaded - critical path
import { LandingPage } from './pages/LandingPage'
import { LoginForm } from './features/auth/pages/login-form'
import { Register } from './features/auth/pages/register-form'
import { Home } from './pages/HomePage'
import { Talleres, Productos } from './features/catalog/index'

// Lazy loaded - public pages
const RentalCatalog = lazy(() =>
  import('./features/rentals/pages/RentalCatalog').then((m) => ({ default: m.RentalCatalog }))
)
const RentalDetail = lazy(() =>
  import('./features/rentals/pages/RentalDetail').then((m) => ({ default: m.RentalDetail }))
)
const ProductDetail = lazy(() =>
  import('./features/products').then((m) => ({ default: m.ProductDetail }))
)
const WorkshopDetail = lazy(() =>
  import('./features/workshops/pages/workshop-detail').then((m) => ({ default: m.WorkshopDetail }))
)

// Lazy loaded - auth pages
const ForgotPassword = lazy(() =>
  import('./features/auth/pages/forgot-password').then((m) => ({ default: m.ForgotPassword }))
)
const ResetPassword = lazy(() =>
  import('./features/auth/pages/reset-password').then((m) => ({ default: m.ResetPassword }))
)
const GoogleCallbackHandler = lazy(() =>
  import('./pages/google-callback-handler').then((m) => ({ default: m.GoogleCallbackHandler }))
)
const EmailVerifiedCallback = lazy(() =>
  import('./pages/email-verified-callback').then((m) => ({ default: m.EmailVerifiedCallback }))
)

// Lazy loaded - user pages
const Cart = lazy(() =>
  import('./features/cart/pages/Cart').then((m) => ({ default: m.Cart }))
)
const Checkout = lazy(() =>
  import('./features/cart/pages/Checkout').then((m) => ({ default: m.Checkout }))
)
const RentalCheckout = lazy(() =>
  import('./features/cart/pages/RentalCheckout').then((m) => ({ default: m.RentalCheckout }))
)
const CheckoutSuccess = lazy(() =>
  import('./features/cart/pages/CheckoutSuccess').then((m) => ({ default: m.CheckoutSuccess }))
)
const CheckoutCancel = lazy(() =>
  import('./features/cart/pages/CheckoutCancel').then((m) => ({ default: m.CheckoutCancel }))
)
const Favorites = lazy(() =>
  import('./features/favorites/pages/favorites').then((m) => ({ default: m.Favorites }))
)
const MyOrders = lazy(() =>
  import('./features/orders/pages/my-orders').then((m) => ({ default: m.MyOrders }))
)
const CustomerRentals = lazy(() =>
  import('./features/orders/pages/my-rentals').then((m) => ({ default: m.MyRentals }))
)
const OrderDetail = lazy(() =>
  import('./features/orders/pages/order-detail').then((m) => ({ default: m.OrderDetail }))
)
const Profile = lazy(() =>
  import('./pages/Profile').then((m) => ({ default: m.Profile }))
)
const Settings = lazy(() =>
  import('./pages/Settings').then((m) => ({ default: m.Settings }))
)

// Lazy loaded - workshop owner pages
const Dashboard = lazy(() =>
  import('./features/dashboard/index').then((m) => ({ default: m.Dashboard }))
)
const MyWorkshops = lazy(() =>
  import('./features/workshops/pages/my-work-shops').then((m) => ({ default: m.MyWorkshops }))
)
const CreateWorkshop = lazy(() =>
  import('./features/workshops/pages/create-workshop').then((m) => ({ default: m.CreateWorkshop }))
)
const EditWorkshop = lazy(() =>
  import('./features/workshops/pages/edit-workshop').then((m) => ({ default: m.EditWorkshop }))
)
const MyProducts = lazy(() =>
  import('./features/products').then((m) => ({ default: m.MyProducts }))
)
const MyRentals = lazy(() =>
  import('./features/products').then((m) => ({ default: m.MyRentals }))
)
const CreateProduct = lazy(() =>
  import('./features/products/index').then((m) => ({ default: m.CreateProduct }))
)
const EditProduct = lazy(() =>
  import('./features/products/index').then((m) => ({ default: m.EditProduct }))
)
const Orders = lazy(() =>
  import('./features/orders/pages/orders').then((m) => ({ default: m.Orders }))
)
const WorkshopOrders = lazy(() =>
  import('./features/orders/pages/workshop-orders').then((m) => ({ default: m.WorkshopOrders }))
)
const WorkshopServices = lazy(() =>
  import('./features/services/pages/workshop-services').then((m) => ({ default: m.WorkshopServices }))
)
const Customers = lazy(() =>
  import('./features/customers/pages/customers').then((m) => ({ default: m.Customers }))
)
const CustomerDetail = lazy(() =>
  import('./features/customers/pages/customer-detail').then((m) => ({ default: m.CustomerDetail }))
)
const CustomerForm = lazy(() =>
  import('./features/customers/pages/customer-form').then((m) => ({ default: m.CustomerForm }))
)

// Lazy loaded - billing pages
const BillingInvoices = lazy(() =>
  import('./features/billing/pages/billing-invoices').then((m) => ({ default: m.BillingInvoices }))
)
const CreateInvoice = lazy(() =>
  import('./features/billing/pages/create-invoice').then((m) => ({ default: m.CreateInvoice }))
)
const InvoiceDetails = lazy(() =>
  import('./features/billing/pages/invoice-details').then((m) => ({ default: m.InvoiceDetails }))
)

// Lazy loaded - subscription pages
const PricingPage = lazy(() =>
  import('./features/subscriptions/pages/pricing').then((m) => ({ default: m.PricingPage }))
)
const SubscriptionSuccess = lazy(() =>
  import('./features/subscriptions/pages/subscription-success').then((m) => ({ default: m.SubscriptionSuccess }))
)
const SubscriptionCancel = lazy(() =>
  import('./features/subscriptions/pages/subscription-cancel').then((m) => ({ default: m.SubscriptionCancel }))
)
const ActivateSubscription = lazy(() =>
  import('./features/subscriptions/pages/activate-subscription').then((m) => ({ default: m.ActivateSubscription }))
)

// Lazy loaded - stripe pages
const StripeConnectSuccess = lazy(() =>
  import('./features/payments/pages/stripe-connect-success').then((m) => ({ default: m.StripeConnectSuccess }))
)
const StripeConnectRefresh = lazy(() =>
  import('./features/payments/pages/stripe-connect-refresh').then((m) => ({ default: m.StripeConnectRefresh }))
)
const StripeDiagnosticPage = lazy(() =>
  import('./features/payments/pages/stripe-diagnostic-page').then((m) => ({ default: m.StripeDiagnosticPage }))
)

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
                <Suspense fallback={<PageLoader />}>
                  <Routes>
                    {/* Public routes with PublicLayout */}
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

                    {/* Public navigation */}
                    <Route
                      path="/talleres"
                      element={
                        <PublicLayout>
                          <Talleres />
                        </PublicLayout>
                      }
                    />
                    <Route
                      path="/productos"
                      element={
                        <PublicLayout>
                          <Productos />
                        </PublicLayout>
                      }
                    />
                    <Route
                      path="/alquileres"
                      element={
                        <PublicLayout>
                          <RentalCatalog />
                        </PublicLayout>
                      }
                    />
                    <Route
                      path="/alquileres/:id"
                      element={
                        <PublicLayout>
                          <RentalDetail />
                        </PublicLayout>
                      }
                    />

                    {/* Legacy routes */}
                    <Route path="/catalog" element={<Navigate to="/productos" replace />} />
                    <Route
                      path="/rentals"
                      element={
                        <PublicLayout>
                          <RentalCatalog />
                        </PublicLayout>
                      }
                    />
                    <Route
                      path="/rentals/:id"
                      element={
                        <PublicLayout>
                          <RentalDetail />
                        </PublicLayout>
                      }
                    />

                    {/* Product and workshop details */}
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

                    {/* Auth callbacks */}
                    <Route path="/auth/callback" element={<GoogleCallbackHandler />} />
                    <Route path="/email-verified" element={<EmailVerifiedCallback />} />

                    {/* Private routes with MainLayout */}
                    <Route
                      path="/*"
                      element={
                        <PrivateRoute>
                          <MainLayout />
                        </PrivateRoute>
                      }
                    >
                      {/* Routes for both roles */}
                      <Route path="orders/:orderId" element={<OrderDetail />} />

                      {/* User routes */}
                      <Route path="home" element={<Home />} />
                      <Route path="my-orders" element={<MyOrders />} />
                      <Route path="customer-rentals" element={<CustomerRentals />} />
                      <Route path="cart" element={<Cart />} />
                      <Route path="checkout" element={<Checkout />} />
                      <Route path="checkout/rental" element={<RentalCheckout />} />
                      <Route path="checkout/success" element={<CheckoutSuccess />} />
                      <Route path="checkout/cancel" element={<CheckoutCancel />} />
                      <Route path="favorites" element={<Favorites />} />
                      <Route path="repairs" element={<div>Reparaciones - Por implementar</div>} />

                      {/* Workshop owner routes */}
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
                        path="my-rentals"
                        element={
                          <RoleRoute requiredRole="WORKSHOP_OWNER">
                            <MyRentals />
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

                      {/* Common routes */}
                      <Route path="profile" element={<Profile />} />
                      <Route path="settings" element={<Settings />} />

                      {/* Subscription routes */}
                      <Route path="pricing" element={<PricingPage />} />
                      <Route path="activate-subscription" element={<ActivateSubscription />} />
                      <Route path="subscription/success" element={<SubscriptionSuccess />} />
                      <Route path="subscription/cancel" element={<SubscriptionCancel />} />

                      {/* Stripe Connect routes */}
                      <Route path="workshops/:id/stripe/success" element={<StripeConnectSuccess />} />
                      <Route path="workshops/:id/stripe/refresh" element={<StripeConnectRefresh />} />
                      <Route path="workshops/:workshopId/stripe/diagnostic" element={<StripeDiagnosticPage />} />
                    </Route>
                  </Routes>
                </Suspense>
              </ConfirmDialogProvider>
            </SnackbarProvider>
          </CartProvider>
        </AuthProvider>
      </SWRConfig>
    </BrowserRouter>
  )
}

export default App
