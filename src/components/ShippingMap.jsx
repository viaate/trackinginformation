import { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { carrierHubs } from '../data/shippingStats';

// Fix Leaflet default icon paths broken by bundlers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl:       'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl:     'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// ---------------------------------------------------------------------------
// Path helpers (declared before use)
// ---------------------------------------------------------------------------

/**
 * Build a slightly curved path between two points using a quadratic Bezier curve,
 * simulating a great-circle arc appearance.
 */
function buildCurvedPath(hub, dest, numPoints = 20) {
  const midLat = (hub.lat + dest.lat) / 2;
  const midLng = (hub.lng + dest.lng) / 2;

  const dLat = dest.lat - hub.lat;
  const dLng = dest.lng - hub.lng;
  const dist  = Math.sqrt(dLat * dLat + dLng * dLng) || 1;
  const curve = dist * 0.12;

  // Offset mid point perpendicular to the straight line
  const offLat = midLat - (dLng / dist) * curve;
  const offLng = midLng + (dLat / dist) * curve;

  const path = [];
  for (let i = 0; i <= numPoints; i++) {
    const t = i / numPoints;
    const u = 1 - t;
    // Quadratic Bezier: B(t) = (1-t)²P0 + 2(1-t)tP1 + t²P2
    const lat = u * u * hub.lat + 2 * u * t * offLat + t * t * dest.lat;
    const lng = u * u * hub.lng + 2 * u * t * offLng + t * t * dest.lng;
    path.push([lat, lng]);
  }
  return path;
}

/** Returns only the portion of the curved path up to fraction t [0,1]. */
function getLeadingPath(path, t) {
  const cutIdx = Math.ceil(t * (path.length - 1));
  return path.slice(0, Math.max(2, cutIdx + 1));
}

/** Interpolate a position along a pre-built curved path at fraction t [0,1]. */
function interpolatePath(path, t) {
  const maxIdx = path.length - 1;
  const raw    = t * maxIdx;
  const idx    = Math.min(Math.floor(raw), maxIdx - 1);
  const frac   = raw - idx;
  if (!path[idx] || !path[idx + 1]) return path[0] || [0, 0];
  return [
    path[idx][0] + (path[idx + 1][0] - path[idx][0]) * frac,
    path[idx][1] + (path[idx + 1][1] - path[idx][1]) * frac,
  ];
}

// ---------------------------------------------------------------------------
// Icon factories
// ---------------------------------------------------------------------------

function createColoredIcon(color, emoji) {
  return L.divIcon({
    className: '',
    html: `
      <div style="
        width: 36px; height: 36px;
        background: ${color};
        border: 2px solid rgba(255,255,255,0.3);
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 12px rgba(0,0,0,0.4);
      ">
        <span style="transform: rotate(45deg); font-size: 14px;">${emoji}</span>
      </div>
    `,
    iconSize:   [36, 36],
    iconAnchor: [18, 36],
    popupAnchor:[0, -36],
  });
}

function createPackageIcon(color) {
  return L.divIcon({
    className: '',
    html: `
      <div style="
        width: 28px; height: 28px;
        background: ${color};
        border: 2px solid white;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 0 12px ${color}80, 0 4px 8px rgba(0,0,0,0.4);
        font-size: 13px;
      ">📦</div>
    `,
    iconSize:   [28, 28],
    iconAnchor: [14, 14],
  });
}

function createDestIcon() {
  return L.divIcon({
    className: '',
    html: `
      <div style="
        width: 32px; height: 32px;
        background: #10b981;
        border: 2px solid rgba(255,255,255,0.4);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 0 12px rgba(16,185,129,0.5), 0 4px 8px rgba(0,0,0,0.3);
        font-size: 14px;
      ">🏠</div>
    `,
    iconSize:   [32, 32],
    iconAnchor: [16, 16],
  });
}

// ---------------------------------------------------------------------------
// FitBounds: adjusts map view to include both markers
// ---------------------------------------------------------------------------
function FitBounds({ positions }) {
  const map = useMap();
  useEffect(() => {
    if (positions.length >= 2) {
      const bounds = L.latLngBounds(positions);
      map.fitBounds(bounds, { padding: [60, 60], maxZoom: 7 });
    }
  }, [map, positions]);
  return null;
}

// Default destination when geolocation is unavailable
const DEFAULT_DEST = { lat: 40.7128, lng: -74.006, name: 'New York, NY (estimated)' };

// ---------------------------------------------------------------------------
// Main ShippingMap component
// ---------------------------------------------------------------------------
export default function ShippingMap({ carrier, carrierMeta }) {
  const hub = carrierHubs[carrier] || carrierHubs.UPS;
  const [dest, setDest] = useState(DEFAULT_DEST);
  const [geoStatus, setGeoStatus] = useState('pending'); // pending | ok | denied | unsupported
  const [progress, setProgress] = useState(0);
  const [animating, setAnimating] = useState(true);
  const intervalRef = useRef(null);

  // Build the curved path once (hub and dest can change if geolocation resolves)
  const curvedPath = buildCurvedPath(hub, dest, 40);

  // Attempt browser geolocation
  useEffect(() => {
    if (!navigator.geolocation) {
      setGeoStatus('unsupported');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setDest({ lat: pos.coords.latitude, lng: pos.coords.longitude, name: 'Your Location' });
        setGeoStatus('ok');
      },
      () => {
        setGeoStatus('denied');
      },
      { timeout: 8000 },
    );
  }, []);

  // Package animation along route
  useEffect(() => {
    if (!animating) {
      clearInterval(intervalRef.current);
      return;
    }
    intervalRef.current = setInterval(() => {
      setProgress(p => {
        const next = p + 0.004;
        if (next >= 1) {
          // Pause at destination, then restart
          setTimeout(() => setProgress(0), 2000);
          return 1;
        }
        return next;
      });
    }, 50);
    return () => clearInterval(intervalRef.current);
  }, [animating]);

  // Current package position interpolated along the curve
  const packagePos = interpolatePath(curvedPath, progress);

  const accentColor = carrierMeta?.color || '#3b82f6';
  const hubIcon = createColoredIcon(accentColor, hub.emoji);
  const destIcon = createDestIcon();
  const pkgIcon = createPackageIcon(accentColor);

  const boundsPositions = [
    [hub.lat, hub.lng],
    [dest.lat, dest.lng],
  ];

  return (
    <div className="glass-card overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
        <div>
          <p className="section-label mb-1">Journey Simulator</p>
          <h3 className="text-lg font-bold text-white">Interactive Shipping Map</h3>
        </div>
        <div className="flex items-center gap-3">
          {geoStatus === 'ok' && (
            <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              GPS detected
            </span>
          )}
          {(geoStatus === 'denied' || geoStatus === 'unsupported') && (
            <span className="text-xs text-slate-500 font-mono">📍 Estimated location</span>
          )}
          {geoStatus === 'pending' && (
            <span className="text-xs text-slate-500 font-mono animate-pulse">Locating…</span>
          )}

          <button
            onClick={() => setAnimating(a => !a)}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono border transition-all ${
              animating
                ? 'border-blue-500/40 text-blue-400 bg-blue-500/10'
                : 'border-slate-700 text-slate-500 hover:text-slate-300'
            }`}
          >
            {animating ? '⏸ Pause' : '▶ Play'}
          </button>
        </div>
      </div>

      {/* Map */}
      <div className="h-[380px] relative">
        <MapContainer
          center={[38, -95]}
          zoom={4}
          style={{ height: '100%', width: '100%' }}
          zoomControl
          scrollWheelZoom={false}
          attributionControl={false}
        >
          {/* Dark-mode OSM tiles (Stadia free tier, no key needed) */}
          <TileLayer
            url="https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://stadiamaps.com/">Stadia Maps</a> &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a> &copy; <a href="https://openstreetmap.org">OpenStreetMap</a>'
          />

          {/* Full dashed route */}
          <Polyline
            positions={curvedPath}
            pathOptions={{ color: '#334155', weight: 2, dashArray: '6 4' }}
          />

          {/* Leading animated path */}
          <Polyline
            positions={getLeadingPath(curvedPath, progress)}
            pathOptions={{ color: accentColor, weight: 3, opacity: 0.85 }}
          />

          {/* Hub marker */}
          <Marker position={[hub.lat, hub.lng]} icon={hubIcon}>
            <Popup>
              <div className="p-1">
                <p className="font-bold text-sm">{carrier} Hub</p>
                <p className="text-xs text-slate-400">{hub.fullName}</p>
              </div>
            </Popup>
          </Marker>

          {/* Destination marker */}
          <Marker position={[dest.lat, dest.lng]} icon={destIcon}>
            <Popup>
              <div className="p-1">
                <p className="font-bold text-sm">Destination</p>
                <p className="text-xs text-slate-400">{dest.name}</p>
              </div>
            </Popup>
          </Marker>

          {/* Animated package dot */}
          <Marker position={packagePos} icon={pkgIcon} />

          {/* Auto-fit bounds on mount */}
          <FitBounds positions={boundsPositions} />
        </MapContainer>

        {/* Top gradient overlay */}
        <div className="absolute top-0 left-0 right-0 h-6 bg-gradient-to-b from-navy-800/60 to-transparent pointer-events-none z-[400]" />
      </div>

      {/* Legend */}
      <div className="px-6 py-4 border-t border-slate-800">
        <div className="flex flex-wrap items-center gap-6 text-xs font-mono mb-2">
          <div className="flex items-center gap-2">
            <span style={{ color: accentColor }}>●</span>
            <span className="text-slate-400">{hub.fullName}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-emerald-400">●</span>
            <span className="text-slate-400">{dest.name}</span>
          </div>
          <div className="flex items-center gap-2">
            <span>📦</span>
            <span className="text-slate-400">Simulated package position</span>
          </div>
        </div>
        <p className="text-xs text-slate-600">
          Routing path originates from the {carrier} primary hub toward your browser-detected location.
          Actual transit routes vary by shipment origin.
        </p>
      </div>
    </div>
  );
}
