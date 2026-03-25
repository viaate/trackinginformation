import { CARRIER_META } from '../utils/carrierDetector';

const ALL_CARRIERS = [
  {
    key: 'UPS',
    name: 'UPS',
    fullName: 'United Parcel Service',
    trackUrl: (n) => `https://www.ups.com/track?tracknum=${n}`,
    description: 'Track on the official UPS website',
  },
  {
    key: 'FedEx',
    name: 'FedEx',
    fullName: 'Federal Express',
    trackUrl: (n) => `https://www.fedex.com/fedextrack/?trknbr=${n}`,
    description: 'Track on the official FedEx website',
  },
  {
    key: 'USPS',
    name: 'USPS',
    fullName: 'US Postal Service',
    trackUrl: (n) => `https://tools.usps.com/go/TrackConfirmAction?tLabels=${n}`,
    description: 'Track on USPS Informed Delivery',
  },
  {
    key: 'DHL',
    name: 'DHL',
    fullName: 'DHL Express',
    trackUrl: (n) => `https://www.dhl.com/en/express/tracking.html?AWB=${n}`,
    description: 'Track on the official DHL website',
  },
  {
    key: 'Amazon',
    name: 'Amazon',
    fullName: 'Amazon Logistics',
    trackUrl: (n) => `https://track.amazon.com/tracking/${n}`,
    description: 'Track via Amazon order dashboard',
  },
  {
    key: 'ChinaPost',
    name: '17Track',
    fullName: 'Universal Tracker (17track)',
    trackUrl: (n) => `https://www.17track.net/en/track#nums=${n}`,
    description: 'Best for China Post, Yanwen, Cainiao',
  },
];

// External tracking aggregators
const AGGREGATORS = [
  {
    name: 'PackageRadar',
    url: (n) => `https://packageradar.com/track/${n}`,
    icon: '📡',
    description: 'Tracks 800+ carriers worldwide',
  },
  {
    name: 'Parcel Monitor',
    url: (n) => `https://www.parcelmonitor.com/track/?id=${n}`,
    icon: '🌐',
    description: 'Global parcel tracking',
  },
  {
    name: 'Track24',
    url: (n) => `https://track24.net/?number=${n}`,
    icon: '🔎',
    description: 'International tracking aggregator',
  },
];

export default function DirectLinks({ carrier, trackingNumber }) {
  const detectedMeta = carrier ? CARRIER_META[carrier] : null;

  // Sort: detected carrier first
  const sorted = [
    ...ALL_CARRIERS.filter(c => c.key === carrier),
    ...ALL_CARRIERS.filter(c => c.key !== carrier),
  ];

  const tn = trackingNumber?.trim() || '';

  return (
    <div className="glass-card p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <p className="section-label mb-1">Official Carrier Links</p>
          <h3 className="text-lg font-bold text-white">Direct Tracking Portals</h3>
        </div>
        <span className="text-xs text-slate-500 font-mono">Fallback options</span>
      </div>

      {/* Primary carrier highlight */}
      {carrier && detectedMeta && (
        <div
          className="mb-4 flex items-center justify-between px-5 py-4 rounded-xl border"
          style={{ backgroundColor: detectedMeta.bgColor, borderColor: detectedMeta.borderColor }}
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">{detectedMeta.icon}</span>
            <div>
              <p className="font-bold text-white text-sm">Detected: {carrier}</p>
              <p className="text-xs" style={{ color: detectedMeta.color }}>
                Recommended tracking portal
              </p>
            </div>
          </div>
          <a
            href={detectedMeta.trackUrl(tn || 'ENTER_TRACKING_NUMBER')}
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-2.5 rounded-xl font-semibold text-sm text-white
                       transition-all duration-200 hover:opacity-90 active:scale-95 shadow-lg"
            style={{ backgroundColor: detectedMeta.color }}
          >
            Track Now →
          </a>
        </div>
      )}

      {/* All carrier grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
        {sorted.map((c) => {
          const meta = CARRIER_META[c.key] || CARRIER_META.UPS;
          const isDetected = c.key === carrier;

          return (
            <a
              key={c.key}
              href={c.trackUrl(tn || 'TRACKING_NUMBER')}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all duration-200
                hover:border-opacity-80 hover:scale-[1.01] group ${
                  isDetected ? 'ring-1' : ''
                }`}
              style={{
                backgroundColor: `${meta.color}10`,
                borderColor: isDetected ? meta.color : `${meta.color}30`,
                ...(isDetected ? { ringColor: meta.color } : {}),
              }}
            >
              <span className="text-xl flex-shrink-0">{meta.icon}</span>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-sm text-white group-hover:text-white truncate">
                  {c.fullName}
                  {isDetected && (
                    <span
                      className="ml-2 text-xs px-1.5 py-0.5 rounded font-mono"
                      style={{ backgroundColor: `${meta.color}25`, color: meta.color }}
                    >
                      detected
                    </span>
                  )}
                </p>
                <p className="text-xs text-slate-500 truncate">{c.description}</p>
              </div>
              <svg
                className="w-4 h-4 text-slate-600 group-hover:text-slate-400 transition-colors flex-shrink-0"
                fill="none" viewBox="0 0 24 24" stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          );
        })}
      </div>

      {/* Divider */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex-1 h-px bg-slate-800" />
        <span className="text-xs text-slate-600 font-mono">Universal Trackers</span>
        <div className="flex-1 h-px bg-slate-800" />
      </div>

      {/* Aggregators */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {AGGREGATORS.map((agg) => (
          <a
            key={agg.name}
            href={agg.url(tn || 'TRACKING_NUMBER')}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 px-4 py-3 rounded-xl border border-slate-800
                       hover:border-slate-700 transition-all duration-200 hover:scale-[1.01] group
                       bg-navy-700/50"
          >
            <span className="text-xl">{agg.icon}</span>
            <div className="min-w-0">
              <p className="font-semibold text-sm text-white truncate">{agg.name}</p>
              <p className="text-xs text-slate-600 truncate">{agg.description}</p>
            </div>
          </a>
        ))}
      </div>

      {/* Tip */}
      <div className="mt-4 flex items-start gap-2 px-4 py-3 rounded-xl bg-blue-500/5 border border-blue-500/10">
        <svg className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
        <p className="text-xs text-slate-500 leading-relaxed">
          Links open the carrier's official tracking page pre-filled with your tracking number.
          {tn ? ' Your number has been pre-filled.' : ' Enter a tracking number above to auto-fill.'}
        </p>
      </div>
    </div>
  );
}
