import { lazy } from 'react'

// ============================================
// EAGER LOADED - Critical path (first paint)
// ============================================
export { LandingPage } from '../pages/LandingPage'
export { LoginForm } from '../features/auth/pages/login-form'
export { Register } from '../features/auth/pages/register-form'
export { Home } from '../pages/HomePage'
export { Talleres, Productos } from '../features/catalog/index'

// ============================================
// LAZY LOADED - Public pages
// ============================================
export const RentalCatalog = lazy(() =>
  import('../features/rentals/pages/RentalCatalog').then((m) => ({ default: m.RentalCatalog }))
)
export const RentalDetail = lazy(() =>
  import('../features/rentals/pages/RentalDetail').then((m) => ({ default: m.RentalDetail }))
)
export const ProductDetail = lazy(() =>
  import('../features/products').then((m) => ({ default: m.ProductDetail }))
)
export const WorkshopDetail = lazy(() =>
  import('../features/workshops/pages/workshop-detail').then((m) => ({ default: m.WorkshopDetail }))
)

// ============================================
// LAZY LOADED - Auth pages
// ============================================
export const ForgotPassword = lazy(() =>
  import('../features/auth/pages/forgot-password').then((m) => ({ default: m.ForgotPassword }))
)
export const ResetPassword = lazy(() =>
  import('../features/auth/pages/reset-password').then((m) => ({ default: m.ResetPassword }))
)
export const GoogleCallbackHandler = lazy(() =>
  import('../pages/google-callback-handler').then((m) => ({ default: m.GoogleCallbackHandler }))
)
export const EmailVerifiedCallback = lazy(() =>
  import('../pages/email-verified-callback').then((m) => ({ default: m.EmailVerifiedCallback }))
)

// ============================================
// LAZY LOADED - User pages
// ============================================
export const Cart = lazy(() =>
  import('../features/cart/pages/Cart').then((m) => ({ default: m.Cart }))
)
export const Checkout = lazy(() =>
  import('../features/cart/pages/Checkout').then((m) => ({ default: m.Checkout }))
)
export const RentalCheckout = lazy(() =>
  import('../features/cart/pages/RentalCheckout').then((m) => ({ default: m.RentalCheckout }))
)
export const CheckoutSuccess = lazy(() =>
  import('../features/cart/pages/CheckoutSuccess').then((m) => ({ default: m.CheckoutSuccess }))
)
export const CheckoutCancel = lazy(() =>
  import('../features/cart/pages/CheckoutCancel').then((m) => ({ default: m.CheckoutCancel }))
)
export const Favorites = lazy(() =>
  import('../features/favorites/pages/favorites').then((m) => ({ default: m.Favorites }))
)
export const MyOrders = lazy(() =>
  import('../features/orders/pages/my-orders').then((m) => ({ default: m.MyOrders }))
)
export const CustomerRentals = lazy(() =>
  import('../features/orders/pages/my-rentals').then((m) => ({ default: m.MyRentals }))
)
export const OrderDetail = lazy(() =>
  import('../features/orders/pages/order-detail').then((m) => ({ default: m.OrderDetail }))
)
export const Profile = lazy(() =>
  import('../pages/Profile').then((m) => ({ default: m.Profile }))
)
export const Settings = lazy(() =>
  import('../pages/Settings').then((m) => ({ default: m.Settings }))
)

// ============================================
// LAZY LOADED - Workshop owner pages
// ============================================
export const Dashboard = lazy(() =>
  import('../features/dashboard/index').then((m) => ({ default: m.Dashboard }))
)
export const MyWorkshops = lazy(() =>
  import('../features/workshops/pages/my-work-shops').then((m) => ({ default: m.MyWorkshops }))
)
export const CreateWorkshop = lazy(() =>
  import('../features/workshops/pages/create-workshop').then((m) => ({ default: m.CreateWorkshop }))
)
export const EditWorkshop = lazy(() =>
  import('../features/workshops/pages/edit-workshop').then((m) => ({ default: m.EditWorkshop }))
)
export const MyProducts = lazy(() =>
  import('../features/products').then((m) => ({ default: m.MyProducts }))
)
export const MyRentals = lazy(() =>
  import('../features/products').then((m) => ({ default: m.MyRentals }))
)
export const CreateProduct = lazy(() =>
  import('../features/products/index').then((m) => ({ default: m.CreateProduct }))
)
export const EditProduct = lazy(() =>
  import('../features/products/index').then((m) => ({ default: m.EditProduct }))
)
export const Orders = lazy(() =>
  import('../features/orders/pages/orders').then((m) => ({ default: m.Orders }))
)
export const WorkshopOrders = lazy(() =>
  import('../features/orders/pages/workshop-orders').then((m) => ({ default: m.WorkshopOrders }))
)
export const WorkshopServices = lazy(() =>
  import('../features/services/pages/workshop-services').then((m) => ({ default: m.WorkshopServices }))
)

// ============================================
// LAZY LOADED - Customer management
// ============================================
export const Customers = lazy(() =>
  import('../features/customers/pages/customers').then((m) => ({ default: m.Customers }))
)
export const CustomerDetail = lazy(() =>
  import('../features/customers/pages/customer-detail').then((m) => ({ default: m.CustomerDetail }))
)
export const CustomerForm = lazy(() =>
  import('../features/customers/pages/customer-form').then((m) => ({ default: m.CustomerForm }))
)

// ============================================
// LAZY LOADED - Billing pages
// ============================================
export const BillingInvoices = lazy(() =>
  import('../features/billing/pages/billing-invoices').then((m) => ({ default: m.BillingInvoices }))
)
export const CreateInvoice = lazy(() =>
  import('../features/billing/pages/create-invoice').then((m) => ({ default: m.CreateInvoice }))
)
export const InvoiceDetails = lazy(() =>
  import('../features/billing/pages/invoice-details').then((m) => ({ default: m.InvoiceDetails }))
)

// ============================================
// LAZY LOADED - Subscription pages
// ============================================
export const PricingPage = lazy(() =>
  import('../features/subscriptions/pages/pricing').then((m) => ({ default: m.PricingPage }))
)
export const SubscriptionSuccess = lazy(() =>
  import('../features/subscriptions/pages/subscription-success').then((m) => ({ default: m.SubscriptionSuccess }))
)
export const SubscriptionCancel = lazy(() =>
  import('../features/subscriptions/pages/subscription-cancel').then((m) => ({ default: m.SubscriptionCancel }))
)
export const ActivateSubscription = lazy(() =>
  import('../features/subscriptions/pages/activate-subscription').then((m) => ({ default: m.ActivateSubscription }))
)

// ============================================
// LAZY LOADED - Stripe pages
// ============================================
export const StripeConnectSuccess = lazy(() =>
  import('../features/payments/pages/stripe-connect-success').then((m) => ({ default: m.StripeConnectSuccess }))
)
export const StripeConnectRefresh = lazy(() =>
  import('../features/payments/pages/stripe-connect-refresh').then((m) => ({ default: m.StripeConnectRefresh }))
)
export const StripeDiagnosticPage = lazy(() =>
  import('../features/payments/pages/stripe-diagnostic-page').then((m) => ({ default: m.StripeDiagnosticPage }))
)


// ============================================
// LAZY LOADED - SEO info pages
// ============================================
export const AboutUsPage = lazy(() =>
  import('../pages/info/about-us-page').then((m) => ({ default: m.AboutUsPage }))
)
export const HowItWorksPage = lazy(() =>
  import('../pages/info/how-it-works-page').then((m) => ({ default: m.HowItWorksPage }))
)
export const RoutesPage = lazy(() =>
  import('../pages/info/routes-page').then((m) => ({ default: m.RoutesPage }))
)
export const HelpCenterPage = lazy(() =>
  import('../pages/info/help-center-page').then((m) => ({ default: m.HelpCenterPage }))
)
export const TermsPage = lazy(() =>
  import('../pages/info/terms-page').then((m) => ({ default: m.TermsPage }))
)
export const PrivacyPage = lazy(() =>
  import('../pages/info/privacy-page').then((m) => ({ default: m.PrivacyPage }))
)
