import { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import {
  OSM_TILE_URL, OSM_ATTRIBUTION,
  ESRI_WORLD_IMAGERY_URL, ESRI_WORLD_IMAGERY_ATTRIBUTION,
} from '../config/onboarding'

// Default Leaflet marker icon URLs break under Vite's asset pipeline
// unless explicitly re-pointed — standard, well-known Leaflet+bundler
// workaround (not specific to this app).
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

/**
 * Initializes a Leaflet map with a street/satellite layer toggle, shared
 * by the address-search step (Step 1) and the corner-tracing step
 * (Step 2). Deliberately hand-rolled rather than react-leaflet — this app
 * has no existing map integration to match conventions with, and a thin
 * direct-Leaflet wrapper avoids an extra abstraction layer / version-
 * compat surface for what these two steps need (a map instance + a couple
 * of imperative layer/marker calls), which react-leaflet's declarative
 * model doesn't make meaingfully simpler here.
 *
 * @param {React.RefObject<HTMLDivElement>} containerRef
 * @param {{center: {lat:number,lng:number}, zoom: number}} options
 * @returns {{ map: L.Map|null, satelliteOn: boolean, toggleSatellite: () => void }}
 */
export function useLeafletMap(containerRef, { center, zoom }) {
  const mapRef = useRef(null)
  const streetLayerRef = useRef(null)
  const satelliteLayerRef = useRef(null)
  const [, forceRender] = useState(0)
  const [satelliteOn, setSatelliteOn] = useState(true)

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    const map = L.map(containerRef.current, {
      center: [center.lat, center.lng],
      zoom,
      zoomControl: true,
    })

    const street = L.tileLayer(OSM_TILE_URL, { attribution: OSM_ATTRIBUTION, maxZoom: 19 })
    // Esri World Imagery — free tier, no API key, attribution required per
    // their terms (see config/onboarding.js).
    const satellite = L.tileLayer(ESRI_WORLD_IMAGERY_URL, { attribution: ESRI_WORLD_IMAGERY_ATTRIBUTION, maxZoom: 19 })

    satellite.addTo(map) // satellite on by default per Step 2's spec

    mapRef.current = map
    streetLayerRef.current = street
    satelliteLayerRef.current = satellite
    forceRender(n => n + 1)

    return () => {
      map.remove()
      mapRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function toggleSatellite() {
    const map = mapRef.current
    if (!map) return
    if (satelliteOn) {
      map.removeLayer(satelliteLayerRef.current)
      streetLayerRef.current.addTo(map)
    } else {
      map.removeLayer(streetLayerRef.current)
      satelliteLayerRef.current.addTo(map)
    }
    setSatelliteOn(v => !v)
  }

  return { map: mapRef.current, satelliteOn, toggleSatellite }
}
