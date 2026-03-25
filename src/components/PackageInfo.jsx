import { CARRIER_SCHEDULE } from '../data/shippingStats';
import { isInternational } from '../utils/carrierDetector';

const DAY_NAMES = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

function fmt(date) {
  return `${DAY_NAMES[date.getDay()]}, ${MONTH_NAMES[date.getMonth()]} ${date.getDate()}`;
}

function InfoRow({ label, value, mono = false, accent }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2.5 border-b border-slate-800/60 last:border-0">
      <span className="text-xs text-slate-500 flex-shrink-0 pt-0.5">{label}</span>
      <span
        className={`text-sm font-medium text-right ${mono ? 'font-mono' : ''}`}
        style={accent ? { color: accent } : { color: '#e2e8f0' }}
      >
        {value}
      </span>
    </div>
  );
}

export default function PackageInfo({ carrier, service, trackingNumber, carrierMeta }) {
  const today = new Date();
  const intl  = isInternational(carrier, service);
  const schedule = CARRIER_SCHEDULE[carrier];

  // Human-readable detection explanation
  const detectionNote = carrier
    ? `Matched ${carrier} regex pattern — ${service}`
    : 'No carrier detected';

  return (
    <div className="glass-card p-6 animate-slide-up">
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        {carrierMeta && (
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center text-2xl border flex-shrink-0"
            style={{ borderColor: carrierMeta.borderColor, backgroundColor: carrierMeta.bgColor }}
          >
            {carrierMeta.icon}
          </div>
        )}
        <div>
          <p className="section-label mb-0.5">Package Details</p>
          <h3 className="text-lg font-bold text-white leading-tight">
            {carrierMeta ? carrier : 'Unknown Carrier'}
            {intl && (
              <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-orange-500/15 text-orange-400 border border-orange-500/20 font-mono">
                International
              </span>
            )}
          </h3>
        </div>
      </div>

      {/* Tracking number */}
      <div className="mb-4 px-4 py-3 rounded-xl bg-navy-900/60 border border-slate-800">
        <p className="text-xs text-slate-600 mb-1 font-mono uppercase tracking-wider">Tracking Number</p>
        <p className="font-mono text-base font-semibold text-white tracking-wider break-all">
          {trackingNumber}
        </p>
      </div>

      {/* Info rows */}
      <div className="mb-4">
        <InfoRow label="Carrier" value={carrier || '—'} accent={carrierMeta?.color} />
        <InfoRow label="Service Type" value={service || '—'} />
        <InfoRow label="Shipment Type" value={intl ? '🌍 International' : '🏠 Domestic'} />
        <InfoRow
          label="Delivery Schedule"
          value={schedule ? `${schedule.label}` : '—'}
        />
        {schedule && (
          <InfoRow label="" value={<span className="text-slate-500 text-xs">{schedule.note}</span>} />
        )}
        <InfoRow label="Tracked Since" value={fmt(today)} />
      </div>

      {/* Detection note */}
      <div className="flex items-start gap-2 px-3 py-2.5 rounded-lg bg-navy-900/40 border border-slate-800/60">
        <svg className="w-3.5 h-3.5 text-slate-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="text-xs text-slate-600 leading-relaxed font-mono">{detectionNote}</p>
      </div>
    </div>
  );
}
