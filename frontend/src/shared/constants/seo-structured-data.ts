export const landingStructuredData = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': 'https://rodamallorca.es/#organization',
      name: 'RodaMallorca',
      url: 'https://rodamallorca.es',
      logo: 'https://rodamallorca.es/logo.svg',
    },
    {
      '@type': 'WebSite',
      '@id': 'https://rodamallorca.es/#website',
      url: 'https://rodamallorca.es',
      name: 'RodaMallorca',
      inLanguage: 'es-ES',
      publisher: {
        '@id': 'https://rodamallorca.es/#organization',
      },
      potentialAction: {
        '@type': 'SearchAction',
        target: 'https://rodamallorca.es/productos?q={search_term_string}',
        'query-input': 'required name=search_term_string',
      },
    },
    {
      '@type': 'WebPage',
      '@id': 'https://rodamallorca.es/#webpage',
      url: 'https://rodamallorca.es/',
      name: 'RodaMallorca | Marketplace de bicicletas y talleres en Mallorca',
      isPartOf: {
        '@id': 'https://rodamallorca.es/#website',
      },
      about: {
        '@id': 'https://rodamallorca.es/#organization',
      },
      inLanguage: 'es-ES',
    },
    {
      '@type': 'SiteNavigationElement',
      name: 'Productos',
      url: 'https://rodamallorca.es/productos',
    },
    {
      '@type': 'SiteNavigationElement',
      name: 'Talleres',
      url: 'https://rodamallorca.es/talleres',
    },
    {
      '@type': 'SiteNavigationElement',
      name: 'Alquileres',
      url: 'https://rodamallorca.es/alquileres',
    },
    {
      '@type': 'SiteNavigationElement',
      name: 'Sobre Nosotros',
      url: 'https://rodamallorca.es/sobre-nosotros',
    },
    {
      '@type': 'SiteNavigationElement',
      name: 'Centro de Ayuda',
      url: 'https://rodamallorca.es/centro-de-ayuda',
    },
  ],
}
