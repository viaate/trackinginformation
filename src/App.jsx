import { useState, useCallback, useRef, useEffect, Suspense, lazy } from 'react';
import TrackingInput from './components/TrackingInput';
import ProbabilityDashboard from './components/ProbabilityDashboard';
import StatusTimeline from './components/StatusTimeline';
import DirectLinks from './components/DirectLinks';
import { getStats } from './data/shippingStats';
import { isInternational } from './utils/carrierDetector';

// Lazy-load the map (leaflet is heavy)
const ShippingMap = lazy(() => import('./components/ShippingMap'));

// ---------------------------------------------------------------------------
// Logo / Header
// ---------------------------------------------------------------------------
function Logo() {
  return (
    <div className="flex items-center gap-3">
      <div className="relative w-10 h-10">
        <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 opacity-20 blur-md" />
        <div className="relative w-10 h-10 rounded-xl bg-navy-700 border border-blue-500/30 flex items-center justify-center">
          <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        </div>
      </div>
      <div>
        <h1 className="text-xl font-bold text-white leading-none">
          Track<span className="text-blue-400">IQ</span>
        </h1>
        <p className="text-xs text-slate-500 font-mono">Smart Logistics Tracker</p>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Stats bar
// ---------------------------------------------------------------------------
function StatsBar() {
  return (
    <div className="hidden md:flex items-center gap-6 text-xs font-mono text-slate-500">
      {[
        { label: 'Carriers', value: '6' },
        { label: 'Pattern Rules', value: '24' },
        { label: 'Data Source', value: '17Track + OSM' },
        { label: 'API Keys', value: '0 required' },
      ].map(({ label, value }) => (
        <div key={label} className="flex items-center gap-2">
          <span className="text-slate-600">{label}:</span>
          <span className="text-slate-300">{value}</span>
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Section wrapper with animated entry
// ---------------------------------------------------------------------------
function Section({ children, delay = 0 }) {
  return (
    <div
      className="animate-slide-up"
      style={{ animationDelay: `${delay}ms`, animationFillMode: 'both', opacity: 0 }}
    >
      {children}
    </div>
  );
}

// ---------------------------------------------------------------------------
// 17Track Embed Widget — direct iframe embed (no YQV5 script dependency)
// ---------------------------------------------------------------------------
function TrackingWidget({ trackingNumber, isVisible }) {
  const [iframeKey, setIframeKey] = useState(0);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoaded(false);
    setIframeKey(k => k + 1);
  }, [trackingNumber]);

  if (!isVisible) return null;

  const embedUrl = `https://t.17track.net/en#nums=${encodeURIComponent(trackingNumber)}`;

  return (
    <div className="glass-card overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
        <div>
          <p className="section-label mb-1">Live Tracking</p>
          <h3 className="text-lg font-bold text-white">
            Real-Time Status
            <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-400 font-mono align-middle">
              via 17Track
            </span>
          </h3>
        </div>
        <div className="flex items-center gap-2">
          {loaded && <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />}
          <span className="text-xs text-slate-500 font-mono">{loaded ? 'Live feed' : 'Loading…'}</span>
          <a
            href={embedUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-blue-400 hover:text-blue-300 font-mono underline underline-offset-2"
          >
            Open full ↗
          </a>
        </div>
      </div>

      <div className="relative" style={{ height: 560 }}>
        {!loaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-navy-900/80 z-10">
            <div className="text-center text-slate-600 font-mono text-sm">
              <div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-400 rounded-full animate-spin mx-auto mb-3" />
              Loading tracking data…
            </div>
          </div>
        )}
        <iframe
          key={iframeKey}
          src={embedUrl}
          width="100%"
          height="560"
          frameBorder="0"
          title="17Track live tracking"
          onLoad={() => setLoaded(true)}
          style={{ display: 'block', border: 'none', background: '#0a0e1a' }}
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
        />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Carrier info banner
// ---------------------------------------------------------------------------
function CarrierBanner({ detection }) {
  const { carrier, service, confidence, meta, cleaned } = detection;
  if (!carrier || !meta) return null;

  return (
    <div
      className="flex flex-wrap items-center justify-between gap-4 px-5 py-4 rounded-2xl border animate-fade-in"
      style={{ backgroundColor: meta.bgColor, borderColor: meta.borderColor }}
    >
      <div className="flex items-center gap-4">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl border"
          style={{ borderColor: meta.borderColor, backgroundColor: `${meta.color}20` }}
        >
          {meta.icon}
        </div>
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-bold text-white">{carrier}</h2>
            {confidence === 'high' && (
              <span className="px-2 py-0.5 rounded-full text-xs font-mono bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
                ✓ High confidence
              </span>
            )}
            {confidence === 'medium' && (
              <span className="px-2 py-0.5 rounded-full text-xs font-mono bg-yellow-500/15 text-yellow-400 border border-yellow-500/20">
                ⚠ Verify carrier
              </span>
            )}
          </div>
          <p className="text-sm" style={{ color: meta.color }}>{service}</p>
        </div>
      </div>
      <div className="font-mono text-xs text-slate-400 bg-navy-900/50 px-3 py-2 rounded-lg border border-slate-800">
        {cleaned}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main App
// ---------------------------------------------------------------------------
export default function App() {
  const [detection, setDetection] = useState(null);   // { carrier, service, meta, cleaned, ... }
  const [activeTracking, setActiveTracking] = useState(null); // { number, detection }
  const [widgetKey, setWidgetKey] = useState(0);

  const handleCarrierDetected = useCallback((result) => {
    setDetection(result);
  }, []);

  const handleTrack = useCallback((raw, result) => {
    const cleaned = result?.cleaned || raw.replace(/[\s\-]/g, '').toUpperCase();
    setActiveTracking({ number: cleaned, detection: result });
    setWidgetKey(k => k + 1); // force widget re-init
    // Smooth scroll to results
    setTimeout(() => {
      document.getElementById('results')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 200);
  }, []);

  const carrier    = activeTracking?.detection?.carrier || detection?.carrier;
  const service    = activeTracking?.detection?.service || detection?.service;
  const meta       = activeTracking?.detection?.meta    || detection?.meta;
  const stats      = getStats(carrier, service);
  const hasResults = !!activeTracking;

  return (
    <div className="min-h-screen bg-navy-900 bg-grid-pattern">
      {/* ── Header ────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 border-b border-slate-800/50 bg-navy-900/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <Logo />
          <StatsBar />
          <div className="flex items-center gap-2">
            <span className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Zero API keys
            </span>
          </div>
        </div>
      </header>

      {/* ── Hero / Input Section ──────────────────────────────────────── */}
      <section className="relative py-16 px-4 sm:px-6 overflow-hidden">
        {/* Decorative glow */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-[600px] h-[300px] bg-blue-600/5 rounded-full blur-3xl" />
          <div className="absolute w-[400px] h-[200px] bg-purple-600/5 rounded-full blur-3xl translate-x-32" />
        </div>

        <div className="relative max-w-4xl mx-auto text-center">
          {/* Tagline */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-mono mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
            Regex carrier detection · Probability engine · Live map
          </div>

          <h1 className="text-4xl sm:text-5xl font-extrabold text-white mb-4 leading-tight">
            Track Any Package{' '}
            <span className="gradient-text">Intelligently</span>
          </h1>

          <p className="text-slate-400 text-lg mb-10 max-w-2xl mx-auto leading-relaxed">
            Paste any tracking number — TrackIQ auto-detects your carrier, predicts arrival
            with probability curves, and plots your shipment's journey on a live map.
          </p>

          <TrackingInput
            onTrack={handleTrack}
            onCarrierDetected={handleCarrierDetected}
          />

          {/* Supported carriers */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <span className="text-xs text-slate-600 font-mono">Supports:</span>
            {[
              { name: 'UPS', color: '#d97706', icon: '🟤' },
              { name: 'FedEx', color: '#7c3aed', icon: '🟣' },
              { name: 'USPS', color: '#2563eb', icon: '🔵' },
              { name: 'DHL', color: '#dc2626', icon: '🔴' },
              { name: 'Amazon', color: '#f59e0b', icon: '🟡' },
              { name: 'China Post', color: '#ef4444', icon: '🟠' },
            ].map(({ name, color, icon }) => (
              <span
                key={name}
                className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono border"
                style={{
                  color,
                  backgroundColor: `${color}10`,
                  borderColor: `${color}30`,
                }}
              >
                {icon} {name}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Real-time detection feedback (before Track is pressed) ──── */}
      {detection && !hasResults && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-8">
          <CarrierBanner detection={detection} />
        </div>
      )}

      {/* ── Results Section ───────────────────────────────────────────── */}
      {hasResults && (
        <div id="results" className="max-w-7xl mx-auto px-4 sm:px-6 pb-16 space-y-6">
          {/* Carrier banner */}
          <Section delay={0}>
            <CarrierBanner detection={activeTracking.detection} />
          </Section>

          {/* Two-column: Probability + Timeline */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* Probability Dashboard — wider */}
            <div className="lg:col-span-3">
              <Section delay={100}>
                <ProbabilityDashboard
                  carrier={carrier}
                  service={service}
                  carrierMeta={meta}
                />
              </Section>
            </div>

            {/* Status Timeline — narrower */}
            <div className="lg:col-span-2">
              <Section delay={150}>
                <StatusTimeline
                  carrier={carrier}
                  stats={stats}
                  carrierMeta={meta}
                />
              </Section>
            </div>
          </div>

          {/* Interactive Map */}
          {carrier && (
            <Section delay={200}>
              <Suspense
                fallback={
                  <div className="glass-card h-[480px] flex items-center justify-center">
                    <div className="text-center text-slate-600">
                      <div className="w-10 h-10 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto mb-3" />
                      <p className="font-mono text-sm">Loading map…</p>
                    </div>
                  </div>
                }
              >
                <ShippingMap carrier={carrier} carrierMeta={meta} />
              </Suspense>
            </Section>
          )}

          {/* 17Track Live Widget */}
          <Section delay={250}>
            <TrackingWidget
              key={widgetKey}
              trackingNumber={activeTracking.number}
              isVisible
            />
          </Section>

          {/* Direct Links */}
          <Section delay={300}>
            <DirectLinks
              carrier={carrier}
              trackingNumber={activeTracking.number}
            />
          </Section>
        </div>
      )}

      {/* ── Empty state info cards ────────────────────────────────────── */}
      {!hasResults && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-16">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              {
                icon: '🔍',
                title: 'Auto-Detection',
                desc: 'Paste any tracking number. Our regex engine identifies UPS, FedEx, USPS, DHL, Amazon, and China Post instantly.',
              },
              {
                icon: '📊',
                title: 'Arrival Probability',
                desc: 'Statistical arrival forecasts with bell curve visualization. Includes weekend and customs buffers.',
              },
              {
                icon: '🗺️',
                title: 'Zero-Key Map',
                desc: 'Interactive journey simulator using Leaflet.js and free OpenStreetMap tiles. No Mapbox or Google API required.',
              },
            ].map(({ icon, title, desc }) => (
              <div key={title} className="glass-card-hover p-6">
                <div className="text-3xl mb-3">{icon}</div>
                <h3 className="font-bold text-white mb-2">{title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Footer ───────────────────────────────────────────────────── */}
      <footer className="border-t border-slate-800 py-8 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Logo />
          </div>
          <p className="text-xs text-slate-600 font-mono text-center">
            No private APIs · No paid keys · Open data only
            <span className="mx-2 text-slate-700">·</span>
            Tracking via 17Track · Maps via OpenStreetMap
          </p>
          <p className="text-xs text-slate-700 font-mono">
            Built with React + Tailwind + Leaflet
          </p>
        </div>
      </footer>
    </div>
  );
}
