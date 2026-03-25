import { useMemo, useState } from 'react';
import { getStats, computeArrivalDates, CARRIER_SCHEDULE, CUSTOMS_BUFFER } from '../data/shippingStats';
import { isInternational } from '../utils/carrierDetector';

const DAY_NAMES = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

function fmtFull(date) {
  return `${DAY_NAMES[date.getDay()]}, ${MONTH_NAMES[date.getMonth()]} ${date.getDate()}`;
}

function formatDate(date) {
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

// ---------------------------------------------------------------------------
// Bell Curve — x axis is delivery days (always valid, no ship date needed)
// ---------------------------------------------------------------------------
function gaussianY(x, mean, stdDev) {
  return Math.exp(-0.5 * ((x - mean) / stdDev) ** 2);
}

function BellCurveSVG({ arrival, carrierColor }) {
  const { best, avg, p75, p90, worst } = arrival.days;

  const svgW = 560, svgH = 160;
  const padL = 20, padR = 20, padT = 20, padB = 30;
  const plotW = svgW - padL - padR;
  const plotH = svgH - padT - padB;

  const range  = worst - best;
  const stdDev = Math.max(1, range / 3.5);
  const mean   = avg;
  const xMin   = Math.max(0, best - 1);
  const xMax   = worst + 2;

  const toSvgX = (x) => padL + ((x - xMin) / (xMax - xMin)) * plotW;
  const toSvgY = (y) => padT + plotH - y * plotH;

  const steps = 200;
  const step  = (xMax - xMin) / steps;
  let maxY = 0;
  const points = [];
  for (let i = 0; i <= steps; i++) {
    const x = xMin + i * step;
    const y = gaussianY(x, mean, stdDev);
    if (y > maxY) maxY = y;
    points.push({ x, y });
  }
  const normPoints = points.map(p => ({ ...p, yn: p.y / maxY }));
  const pathData = normPoints
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${toSvgX(p.x).toFixed(1)} ${toSvgY(p.yn).toFixed(1)}`)
    .join(' ');
  const areaData =
    pathData +
    ` L ${toSvgX(xMax).toFixed(1)} ${toSvgY(0).toFixed(1)}` +
    ` L ${toSvgX(xMin).toFixed(1)} ${toSvgY(0).toFixed(1)} Z`;

  const markers = [
    { x: best,  label: '10%', color: '#10b981', dashed: true },
    { x: avg,   label: '50%', color: carrierColor || '#3b82f6', dashed: false },
    { x: p90,   label: '90%', color: '#f59e0b', dashed: true },
    { x: worst, label: '95%', color: '#ef4444', dashed: true },
  ];

  return (
    <svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full h-auto" aria-label="Arrival probability bell curve">
      <defs>
        <linearGradient id="bellGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={carrierColor || '#3b82f6'} stopOpacity="0.35" />
          <stop offset="100%" stopColor={carrierColor || '#3b82f6'} stopOpacity="0.03" />
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="2" result="coloredBlur" />
          <feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      {[0.25, 0.5, 0.75, 1].map(f => (
        <line key={f} x1={padL} y1={toSvgY(f)} x2={svgW - padR} y2={toSvgY(f)} stroke="#1e293b" strokeWidth="1" />
      ))}
      <line x1={padL} y1={toSvgY(0)} x2={svgW - padR} y2={toSvgY(0)} stroke="#334155" strokeWidth="1" />
      <path d={areaData} fill="url(#bellGradient)" />
      <path d={pathData} fill="none" stroke={carrierColor || '#3b82f6'} strokeWidth="2" filter="url(#glow)" />

      {markers.map(({ x, label, color, dashed }) => {
        if (x < xMin || x > xMax) return null;
        const sx = toSvgX(x);
        const sy = toSvgY(gaussianY(x, mean, stdDev) / maxY);
        return (
          <g key={label}>
            <line x1={sx} y1={sy} x2={sx} y2={toSvgY(0)} stroke={color} strokeWidth="1.5"
              strokeDasharray={dashed ? '4 3' : 'none'} opacity="0.8" />
            <circle cx={sx} cy={sy} r="3.5" fill={color} opacity="0.9" />
            <text x={sx} y={svgH - 4} fill={color} fontSize="9" fontFamily="JetBrains Mono, monospace"
              textAnchor="middle" opacity="0.9">{label}</text>
          </g>
        );
      })}

      {[best, avg, p90, worst].map((d, i) => {
        if (d < xMin || d > xMax) return null;
        return (
          <text key={i} x={toSvgX(d)} y={toSvgY(0) + 14} fill="#475569" fontSize="8"
            fontFamily="JetBrains Mono, monospace" textAnchor="middle">
            {d}d
          </text>
        );
      })}
    </svg>
  );
}

function DaysBadge({ days, color }) {
  return (
    <span className="font-mono font-bold text-lg" style={{ color }}>
      {days === 1 ? '1 day' : `${days} days`}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------
export default function ProbabilityDashboard({ carrier, service, carrierMeta }) {
  const [shipDateStr, setShipDateStr] = useState('');
  const [showCalc, setShowCalc]       = useState(false);

  const stats         = useMemo(() => getStats(carrier, service), [carrier, service]);
  const international = useMemo(() => isInternational(carrier, service), [carrier, service]);

  // Parse the user-entered ship date — null if not provided
  const shipDate = useMemo(() => {
    if (!shipDateStr) return null;
    const d = new Date(shipDateStr + 'T12:00:00'); // noon local to avoid timezone off-by-one
    return isNaN(d.getTime()) ? null : d;
  }, [shipDateStr]);

  // Only compute specific arrival dates when a ship date is provided
  const arrival = useMemo(() => {
    if (!stats || !shipDate) return null;
    return computeArrivalDates(stats, international, carrier, shipDate);
  }, [stats, international, carrier, shipDate]);

  // Always compute day ranges (no date dependency) for the bell curve + ranges
  const dayRanges = useMemo(() => {
    if (!stats) return null;
    return computeArrivalDates(stats, international, carrier, new Date());
  }, [stats, international, carrier]);

  if (!stats || !dayRanges) return null;

  const color    = carrierMeta?.color || '#3b82f6';
  const schedule = CARRIER_SCHEDULE[carrier];

  const probabilities = [
    {
      pct: 10, label: 'Best case',    sublabel: 'Fastest 10% of shipments arrive this quickly',
      days: dayRanges.days.best,  date: arrival?.best,  color: '#10b981',
      bg: 'rgba(16,185,129,0.08)', border: 'rgba(16,185,129,0.3)',
    },
    {
      pct: 50, label: 'Most likely',  sublabel: 'Median — half of shipments arrive before this',
      days: dayRanges.days.avg,   date: arrival?.avg,   color,
      bg: `${color}15`, border: `${color}40`, highlight: true,
    },
    {
      pct: 75, label: '75% arrive by', sublabel: '3 in 4 shipments delivered by this date',
      days: dayRanges.days.p75,  date: arrival?.p75,  color: '#f59e0b',
      bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.3)',
    },
    {
      pct: 90, label: '90% arrive by', sublabel: '9 in 10 shipments delivered by this date',
      days: dayRanges.days.p90,  date: arrival?.p90,  color: '#f97316',
      bg: 'rgba(249,115,22,0.08)', border: 'rgba(249,115,22,0.3)',
    },
    {
      pct: 5,  label: 'Delay risk',   sublabel: '5% of shipments exceed this (lost/held)',
      days: dayRanges.days.worst, date: arrival?.worst, color: '#ef4444',
      bg: 'rgba(239,68,68,0.08)', border: 'rgba(239,68,68,0.3)',
    },
  ];

  const calcSteps = [
    {
      icon: '📅',
      label: 'Ship date',
      value: shipDate ? fmtFull(shipDate) : 'Not provided',
      detail: shipDate
        ? 'Date you entered as the ship/handoff date'
        : 'Enter a ship date above to get specific calendar dates',
    },
    {
      icon: '📦',
      label: 'Service',
      value: stats.label,
      detail: `Historical avg: ${stats.avg} delivery days  ·  Best: ${stats.best}d  ·  Worst: ${stats.worst}d`,
    },
    {
      icon: '🗓️',
      label: 'Delivery schedule',
      value: schedule ? schedule.label : 'Unknown',
      detail: schedule ? schedule.note : '',
    },
    arrival?.buffers.weekendGapNote && {
      icon: '⚠️', label: 'Weekend gap', value: 'Extra delay applied',
      detail: arrival.buffers.weekendGapNote, warn: true,
    },
    dayRanges.buffers.isInternational && {
      icon: '🌍', label: 'Customs clearance', value: `+${CUSTOMS_BUFFER.best}–${CUSTOMS_BUFFER.worst} days`,
      detail: `International shipments average +${CUSTOMS_BUFFER.avg} extra days for customs. Best case +${CUSTOMS_BUFFER.best}d, worst case +${CUSTOMS_BUFFER.worst}d.`,
      warn: true,
    },
    {
      icon: '📊',
      label: 'Data source',
      value: 'Historical carrier performance',
      detail: 'Based on aggregated delivery records. Percentiles from normal distribution fitted to carrier-reported ranges.',
    },
  ].filter(Boolean);

  return (
    <div className="glass-card p-6 animate-slide-up">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="section-label mb-1">Probability Engine</p>
          <h3 className="text-lg font-bold text-white">Arrival Forecast</h3>
          <p className="text-xs text-slate-500 mt-1 font-mono">
            {stats.label} · {schedule?.label || 'Calendar'} delivery
          </p>
        </div>
        <div
          className="text-xs px-3 py-1.5 rounded-full font-mono border"
          style={{ backgroundColor: `${color}10`, borderColor: `${color}30`, color }}
        >
          Statistical model
        </div>
      </div>

      {/* Ship date input — the key piece that makes dates real */}
      <div className="mb-5 p-4 rounded-xl border border-slate-700 bg-navy-900/60">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex-1">
            <label className="text-xs text-slate-400 font-mono uppercase tracking-wider block mb-1.5">
              Ship Date <span className="text-slate-600 normal-case">(when did the carrier pick it up?)</span>
            </label>
            <input
              type="date"
              value={shipDateStr}
              max={new Date().toISOString().slice(0, 10)}
              onChange={e => setShipDateStr(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-navy-900 border border-slate-700 text-slate-200
                         font-mono text-sm focus:outline-none focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/30"
            />
          </div>
          {shipDate && (
            <div className="sm:text-right">
              <p className="text-xs text-slate-500 font-mono">Entered ship date</p>
              <p className="text-sm font-semibold text-slate-200">{formatDate(shipDate)}</p>
            </div>
          )}
        </div>
        {!shipDate && (
          <p className="mt-2 text-xs text-amber-500/80 font-mono flex items-center gap-1.5">
            <span>⚠</span>
            Without a ship date, only transit day ranges are shown — no calendar dates.
          </p>
        )}
      </div>

      {/* Banners */}
      <div className="flex flex-col gap-2 mb-5">
        {arrival?.buffers.weekendGapNote && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs">
            <span>📅</span><span>{arrival.buffers.weekendGapNote}</span>
          </div>
        )}
        {dayRanges.buffers.isInternational && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs">
            <span>🌍</span>
            <span>International: +{CUSTOMS_BUFFER.best}–{CUSTOMS_BUFFER.worst} days for customs (avg +{CUSTOMS_BUFFER.avg}d)</span>
          </div>
        )}
        {schedule && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-500/5 border border-blue-500/15 text-blue-400/80 text-xs">
            <span>🗓️</span>
            <span>{schedule.note} — dates skip non-delivery days automatically</span>
          </div>
        )}
      </div>

      {/* Bell Curve — always valid (x = days, not dates) */}
      <div className="mb-5 rounded-xl bg-navy-900/50 border border-slate-800 p-3">
        <p className="text-xs text-slate-600 font-mono mb-2 text-center">
          Probability Distribution — Transit Days from Ship Date
        </p>
        <BellCurveSVG arrival={dayRanges} carrierColor={color} />
        <div className="flex justify-center gap-5 mt-1">
          {[
            { label: '10%', color: '#10b981' },
            { label: '50%', color },
            { label: '90%', color: '#f59e0b' },
            { label: '95%', color: '#ef4444' },
          ].map(({ label, color: c }) => (
            <div key={label} className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c }} />
              <span className="text-xs text-slate-600 font-mono">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Probability rows */}
      <div className="space-y-2">
        {probabilities.map(({ pct, label, sublabel, date, days, color: c, bg, border, highlight }) => (
          <div
            key={label}
            className={`flex items-center justify-between px-4 py-3 rounded-xl border transition-all duration-200 ${highlight ? 'ring-1' : ''}`}
            style={{ backgroundColor: bg, borderColor: border, ...(highlight ? { ringColor: c } : {}) }}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-full border-2 flex items-center justify-center flex-shrink-0 font-bold text-sm font-mono"
                style={{ borderColor: c, color: c }}
              >
                {pct}%
              </div>
              <div>
                <p className="text-sm font-semibold text-white">{label}</p>
                <p className="text-xs text-slate-500">{sublabel}</p>
              </div>
            </div>
            <div className="text-right">
              {date ? (
                <p className="text-sm font-semibold text-white">{formatDate(date)}</p>
              ) : (
                <p className="text-xs text-slate-600 font-mono italic">enter ship date</p>
              )}
              <DaysBadge days={days} color={c} />
            </div>
          </div>
        ))}
      </div>

      {/* Why these dates — collapsible */}
      <div className="mt-5 rounded-xl border border-slate-800 overflow-hidden">
        <button
          onClick={() => setShowCalc(c => !c)}
          className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-navy-700/40 transition-colors"
        >
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-slate-300">How are these calculated?</span>
            <span className="text-xs text-slate-600 font-mono">Methodology</span>
          </div>
          <svg
            className={`w-4 h-4 text-slate-500 transition-transform duration-200 ${showCalc ? 'rotate-180' : ''}`}
            fill="none" viewBox="0 0 24 24" stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {showCalc && (
          <div className="px-4 pb-4 border-t border-slate-800">
            <div className="mt-3 space-y-0">
              {calcSteps.map((step, i) => (
                <div key={i} className="flex gap-3 py-3 border-b border-slate-800/50 last:border-0">
                  <div className="flex flex-col items-center flex-shrink-0">
                    <span className="text-base">{step.icon}</span>
                    {i < calcSteps.length - 1 && <div className="w-px flex-1 bg-slate-800 mt-1" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs text-slate-500 font-mono uppercase tracking-wider">{step.label}</span>
                      <span className={`text-sm font-semibold ${step.warn ? 'text-amber-400' : 'text-white'}`}>
                        {step.value}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{step.detail}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-3 px-3 py-2.5 rounded-lg bg-navy-900/60 border border-slate-800 font-mono text-xs text-slate-500 leading-relaxed">
              <span className="text-slate-400">Formula: </span>
              ship_date + base_transit_days (skipping {schedule?.label || 'non-delivery'} days)
              {dayRanges.buffers.isInternational && <> + customs ({CUSTOMS_BUFFER.avg}d avg)</>}
            </div>
          </div>
        )}
      </div>

      <p className="mt-4 text-xs text-slate-600 leading-relaxed text-center">
        Statistical model based on historical {carrier || 'carrier'} performance data.
        Actual delivery depends on origin, destination, and conditions at time of shipment.
      </p>
    </div>
  );
}
