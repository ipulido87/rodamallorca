export const landingStructuredData = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': 'https://rodamallorca.com/#organization',
      name: 'RodaMallorca',
      url: 'https://rodamallorca.com',
      logo: 'https://rodamallorca.com/logo.svg',
    },
    {
      '@type': 'WebSite',
      '@id': 'https://rodamallorca.com/#website',
      url: 'https://rodamallorca.com',
      name: 'RodaMallorca',
      inLanguage: 'es-ES',
      publisher: {
        '@id': 'https://rodamallorca.com/#organization',
      },
      potentialAction: {
        '@type': 'SearchAction',
        target: 'https://rodamallorca.com/productos?q={search_term_string}',
        'query-input': 'required name=search_term_string',
      },
    },
    {
      '@type': 'WebPage',
      '@id': 'https://rodamallorca.com/#webpage',
      url: 'https://rodamallorca.com/',
      name: 'RodaMallorca | Marketplace de bicicletas y talleres en Mallorca',
      isPartOf: {
        '@id': 'https://rodamallorca.com/#website',
      },
      about: {
        '@id': 'https://rodamallorca.com/#organization',
      },
      inLanguage: 'es-ES',
    },
    {
      '@type': 'SiteNavigationElement',
      name: 'Productos',
      url: 'https://rodamallorca.com/productos',
    },
    {
      '@type': 'SiteNavigationElement',
      name: 'Talleres',
      url: 'https://rodamallorca.com/talleres',
    },
    {
      '@type': 'SiteNavigationElement',
      name: 'Alquileres',
      url: 'https://rodamallorca.com/alquileres',
    },
    {
      '@type': 'SiteNavigationElement',
      name: 'Sobre Nosotros',
      url: 'https://rodamallorca.com/sobre-nosotros',
    },
    {
      '@type': 'SiteNavigationElement',
      name: 'Centro de Ayuda',
      url: 'https://rodamallorca.com/centro-de-ayuda',
    },
  ],
}
