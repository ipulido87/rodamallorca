// config/productFilters.ts

import type { FilterConfig } from '../components/common/filter-bar'

export const productFilterConfig: FilterConfig[] = [
  {
    key: 'city',
    label: 'Ciudad',
    type: 'text',
    placeholder: 'Palma, Manacor, Inca...',
  },
  {
    key: 'condition',
    label: 'Condición',
    type: 'select',
    options: [
      { value: 'new', label: 'Nuevo' },
      { value: 'used', label: 'Usado' },
      { value: 'refurbished', label: 'Reacondicionado' },
    ],
  },
  {
    key: 'price',
    label: 'Rango de precio',
    type: 'range',
    min: 0,
    max: 10000,
    step: 50,
  },
]

export const workshopFilterConfig: FilterConfig[] = [
  {
    key: 'city',
    label: 'Ciudad',
    type: 'text',
    placeholder: 'Palma, Manacor, Inca...',
  },
]
