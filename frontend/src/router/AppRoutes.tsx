import { Suspense } from 'react'
import { Route, Routes, Navigate, useParams } from 'react-router-dom'
import { MainLayout } from '../components/layout/main-layout'
import { PublicLayout } from '../components/layout/public-layout'
import { PrivateRoute } from '../components/private-ruta'
import { RoleRoute } from '../components/role-route'
import { PageLoader } from '../shared/components/PageLoader'

import {
  // Eager loaded
  LandingPage,
  LoginForm,
  Register,
  Home,
  Talleres,
  Productos,
  // Public pages
  RentalCatalog,
  RentalDetail,
  ProductDetail,
  WorkshopDetail,
  // Auth pages
  ForgotPassword,
  ResetPassword,
  GoogleCallbackHandler,
  EmailVerifiedCallback,
  // User pages
  Cart,
  Checkout,
  RentalCheckout,
  CheckoutSuccess,
  CheckoutCancel,
  Favorites,
  MyOrders,
  CustomerRentals,
  OrderDetail,
  Profile,
  Settings,
  // Workshop owner pages
  Dashboard,
  MyWorkshops,
  CreateWorkshop,
  EditWorkshop,
  MyProducts,
  MyRentals,
  CreateProduct,
  EditProduct,
  Orders,
  WorkshopOrders,
  WorkshopServices,
  // Customer management
  Customers,
  CustomerDetail,
  CustomerForm,
  // Billing
  BillingInvoices,
  CreateInvoice,
  InvoiceDetails,
  // Subscriptions
  PricingPage,
  SubscriptionSuccess,
  SubscriptionCancel,
  ActivateSubscription,
  // Stripe
  StripeConnectSuccess,
  StripeConnectRefresh,
  StripeDiagnosticPage,
  // SEO pages
  AboutUsPage,
  HowItWorksPage,
  RoutesPage,
  RutasPage,
  HelpCenterPage,
  TermsPage,
  PrivacyPage,
  NotFoundPage,
} from './lazy-imports'

const RentalsIdRedirect = () => {
  const { id } = useParams<{ id: string }>()
  return <Navigate to={`/alquileres/${id}`} replace />
}

export function AppRoutes() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* ========== PUBLIC ROUTES ========== */}
        <Route path="/" element={<PublicLayout><LandingPage /></PublicLayout>} />
        <Route path="/login" element={<PublicLayout><LoginForm /></PublicLayout>} />
        <Route path="/register" element={<PublicLayout><Register /></PublicLayout>} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Public catalog */}
        <Route path="/talleres" element={<PublicLayout><Talleres /></PublicLayout>} />
        <Route path="/productos" element={<PublicLayout><Productos /></PublicLayout>} />
        <Route path="/alquileres" element={<PublicLayout><RentalCatalog /></PublicLayout>} />
        <Route path="/alquileres/:id" element={<PublicLayout><RentalDetail /></PublicLayout>} />
        <Route path="/product/:id" element={<PublicLayout><ProductDetail /></PublicLayout>} />
        <Route path="/workshop/:id" element={<PublicLayout><WorkshopDetail /></PublicLayout>} />

        {/* SEO pages */}
        <Route path="/sobre-nosotros" element={<PublicLayout><AboutUsPage /></PublicLayout>} />
        <Route path="/como-funciona" element={<PublicLayout><HowItWorksPage /></PublicLayout>} />
        <Route path="/rutas-recomendadas" element={<PublicLayout><RoutesPage /></PublicLayout>} />
        <Route path="/rutas" element={<PublicLayout><RutasPage /></PublicLayout>} />
        <Route path="/centro-de-ayuda" element={<PublicLayout><HelpCenterPage /></PublicLayout>} />
        <Route path="/terminos-de-servicio" element={<PublicLayout><TermsPage /></PublicLayout>} />
        <Route path="/politica-de-privacidad" element={<PublicLayout><PrivacyPage /></PublicLayout>} />

        {/* Legacy redirects */}
        <Route path="/catalog" element={<Navigate to="/productos" replace />} />
        <Route path="/rentals" element={<Navigate to="/alquileres" replace />} />
        <Route path="/rentals/:id" element={<RentalsIdRedirect />} />

        {/* Auth callbacks */}
        <Route path="/auth/callback" element={<GoogleCallbackHandler />} />
        <Route path="/email-verified" element={<EmailVerifiedCallback />} />

        {/* Pricing - público para SEO (talleres potenciales) */}
        <Route path="/pricing" element={<PublicLayout><PricingPage /></PublicLayout>} />

        {/* ========== PRIVATE ROUTES ========== */}
        <Route path="/*" element={<PrivateRoute><MainLayout /></PrivateRoute>}>
          {/* Shared routes */}
          <Route path="home" element={<Home />} />
          <Route path="orders/:orderId" element={<OrderDetail />} />
          <Route path="profile" element={<Profile />} />
          <Route path="settings" element={<Settings />} />

          {/* User routes */}
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
          <Route path="dashboard" element={<RoleRoute requiredRole="WORKSHOP_OWNER"><Dashboard /></RoleRoute>} />
          <Route path="my-workshops" element={<RoleRoute requiredRole="WORKSHOP_OWNER"><MyWorkshops /></RoleRoute>} />
          <Route path="create-workshop" element={<RoleRoute requiredRole="WORKSHOP_OWNER"><CreateWorkshop /></RoleRoute>} />
          <Route path="edit-workshop/:id" element={<RoleRoute requiredRole="WORKSHOP_OWNER"><EditWorkshop /></RoleRoute>} />
          <Route path="my-products" element={<RoleRoute requiredRole="WORKSHOP_OWNER"><MyProducts /></RoleRoute>} />
          <Route path="my-rentals" element={<RoleRoute requiredRole="WORKSHOP_OWNER"><MyRentals /></RoleRoute>} />
          <Route path="create-product" element={<RoleRoute requiredRole="WORKSHOP_OWNER"><CreateProduct /></RoleRoute>} />
          <Route path="edit-product/:id" element={<RoleRoute requiredRole="WORKSHOP_OWNER"><EditProduct /></RoleRoute>} />
          <Route path="orders" element={<RoleRoute requiredRole="WORKSHOP_OWNER"><Orders /></RoleRoute>} />
          <Route path="services/:workshopId" element={<RoleRoute requiredRole="WORKSHOP_OWNER"><WorkshopServices /></RoleRoute>} />
          <Route path="workshop-orders/:workshopId" element={<RoleRoute requiredRole="WORKSHOP_OWNER"><WorkshopOrders /></RoleRoute>} />

          {/* Customer management */}
          <Route path="customers" element={<RoleRoute requiredRole="WORKSHOP_OWNER"><Customers /></RoleRoute>} />
          <Route path="customers/new" element={<RoleRoute requiredRole="WORKSHOP_OWNER"><CustomerForm /></RoleRoute>} />
          <Route path="customers/:id" element={<RoleRoute requiredRole="WORKSHOP_OWNER"><CustomerDetail /></RoleRoute>} />
          <Route path="customers/:id/edit" element={<RoleRoute requiredRole="WORKSHOP_OWNER"><CustomerForm /></RoleRoute>} />

          {/* Billing */}
          <Route path="billing/:workshopId" element={<RoleRoute requiredRole="WORKSHOP_OWNER"><BillingInvoices /></RoleRoute>} />
          <Route path="billing/:workshopId/invoice/:invoiceId" element={<RoleRoute requiredRole="WORKSHOP_OWNER"><InvoiceDetails /></RoleRoute>} />
          <Route path="billing/:workshopId/create" element={<RoleRoute requiredRole="WORKSHOP_OWNER"><CreateInvoice /></RoleRoute>} />

          {/* Subscriptions */}
          <Route path="activate-subscription" element={<ActivateSubscription />} />
          <Route path="subscription/success" element={<SubscriptionSuccess />} />
          <Route path="subscription/cancel" element={<SubscriptionCancel />} />

          {/* Stripe Connect */}
          <Route path="workshops/:id/stripe/success" element={<StripeConnectSuccess />} />
          <Route path="workshops/:id/stripe/refresh" element={<StripeConnectRefresh />} />
          <Route path="workshops/:workshopId/stripe/diagnostic" element={<StripeDiagnosticPage />} />

          {/* 404 para rutas privadas desconocidas */}
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </Suspense>
  )
}
