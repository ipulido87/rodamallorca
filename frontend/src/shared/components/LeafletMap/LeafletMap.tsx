import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import type { LeafletMapProps, MapCoords } from './types'

// Fix leaflet marker icons en bundlers (Vite/Webpack)
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

// Icono personalizado con color de marca
const createCustomIcon = () =>
  L.divIcon({
    className: '',
    html: `
      <div style="
        width: 32px;
        height: 32px;
        background: #3949ab;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        border: 3px solid white;
        box-shadow: 0 2px 8px rgba(57,73,171,0.4);
      "></div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -36],
  })

// Subcomponente para centrar el mapa cuando cambia el centro
const MapRecenter = ({ center }: { center: MapCoords }) => {
  const map = useMap()
  useEffect(() => {
    map.setView([center.lat, center.lng])
  }, [center, map])
  return null
}

// Centro por defecto: Palma de Mallorca
const MALLORCA_CENTER: MapCoords = { lat: 39.5696, lng: 2.6502 }

/**
 * Componente de mapa genérico y reutilizable.
 * Acepta cualquier tipo de datos T a través de markers y renderPopup.
 *
 * Uso:
 *   <LeafletMap
 *     markers={workshops.map(w => ({ id: w.id, coords: w.coords, data: w }))}
 *     renderPopup={(workshop) => <WorkshopPopup workshop={workshop} />}
 *   />
 */
export function LeafletMap<T>({
  markers,
  center = MALLORCA_CENTER,
  zoom = 10,
  height = 500,
  renderPopup,
  onMarkerClick,
}: LeafletMapProps<T>) {
  const customIcon = createCustomIcon()

  return (
    <MapContainer
      center={[center.lat, center.lng]}
      zoom={zoom}
      style={{ height, width: '100%', borderRadius: 12 }}
    >
      <MapRecenter center={center} />

      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {markers.map((marker) => (
        <Marker
          key={marker.id}
          position={[marker.coords.lat, marker.coords.lng]}
          icon={customIcon}
          eventHandlers={{
            click: () => onMarkerClick?.(marker.data),
          }}
        >
          <Popup maxWidth={280} minWidth={200}>
            {renderPopup(marker.data)}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  )
}
