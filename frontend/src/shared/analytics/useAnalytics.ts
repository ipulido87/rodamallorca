import { posthog } from './posthog'

// ─── Tipos de eventos del marketplace ─────────────────────────────────────────

interface WorkshopViewedProps {
  workshopId: string
  workshopName: string
  city: string
  isVerified?: boolean
  hasClaimed?: boolean
}

interface ProductViewedProps {
  productId: string
  productTitle: string
  price: number
  condition: string
  workshopCity?: string
}

interface RentalViewedProps {
  rentalId: string
  bikeTitle: string
  bikeType: string
  pricePerDay: number
  city: string
}

interface SearchPerformedProps {
  query: string
  section: 'talleres' | 'productos' | 'alquileres' | 'rutas'
  resultsCount: number
  filtersApplied?: string[]
}

interface KomootLinkClickedProps {
  routeId: string
  routeName: string
  komootUrl: string
}

interface ClaimShopClickedProps {
  workshopId: string
  workshopName: string
  source: 'banner' | 'email' | 'detail_page'
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useAnalytics() {
  const track = posthog.capture.bind(posthog)

  return {
    workshopViewed: (props: WorkshopViewedProps) =>
      track('workshop_viewed', props),

    productViewed: (props: ProductViewedProps) =>
      track('product_viewed', props),

    rentalViewed: (props: RentalViewedProps) =>
      track('rental_viewed', props),

    searchPerformed: (props: SearchPerformedProps) =>
      track('search_performed', props),

    komootLinkClicked: (props: KomootLinkClickedProps) =>
      track('komoot_link_clicked', props),

    claimShopClicked: (props: ClaimShopClickedProps) =>
      track('claim_shop_clicked', props),

    subscriptionStarted: (plan: string) =>
      track('subscription_started', { plan }),

    checkoutStarted: (type: 'product' | 'rental' | 'service', totalAmount: number) =>
      track('checkout_started', { type, totalAmount }),
  }
}
