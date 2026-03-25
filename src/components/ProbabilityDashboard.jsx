import { useMemo } from 'react';
import { getStats, computeArrivalDates } from '../data/shippingStats';
import { isInternational } from '../utils/carrierDetector';

// ---------------------------------------------------------------------------
// Bell Curve SVG Generator
// Produces a path element for a normal distribution (Gaussian) curve.
// ---------------------------------------------------------------------------
function gaussianY(x, mean, stdDev) {
  return Math.exp(-0.5 * ((x - mean) / stdDev) ** 2);
}

function BellCurveSVG({ stats, arrival, carrierColor }) {
  const { best, avg, p75, p90, worst } = arrival.days;

  const svgW = 560;
  const svgH = 160;
  const padL = 20;
  const padR = 20;
  const padT = 20;
  const padB = 30;

  const plotW = svgW - padL - padR;
  const plotH = svgH - padT - padB;

  // Estimate std dev from range
  const range = worst - best;
  const stdDev = Math.max(1, range / 3.5);
  const mean = avg;

  // x domain: best-1 to worst+2
  const xMin = Math.max(0, best - 1);
  const xMax = worst + 2;

  const toSvgX = (x) => padL + ((x - xMin) / (xMax - xMin)) * plotW;
  const toSvgY = (y) => padT + plotH - y * plotH;

  // Generate curve points
  const points = [];
  const steps = 200;
  const step = (xMax - xMin) / steps;
  let maxY = 0;

  for (let i = 0; i <= steps; i++) {
    const x = xMin + i * step;
    const y = gaussianY(x, mean, stdDev);
    if (y > maxY) maxY = y;
    points.push({ x, y });
  }

  // Normalize
  const normPoints = points.map(p => ({ ...p, yn: p.y / maxY }));

  // Build path string
  const pathData = normPoints
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${toSvgX(p.x).toFixed(1)} ${toSvgY(p.yn).toFixed(1)}`)
    .join(' ');

  // Area path (closed at bottom)
  const areaData =
    pathData +
    ` L ${toSvgX(xMax).toFixed(1)} ${toSvgY(0).toFixed(1)}` +
    ` L ${toSvgX(xMin).toFixed(1)} ${toSvgY(0).toFixed(1)} Z`;

  // Vertical markers
  const markers = [
    { x: best,  label: '10%', color: '#10b981', dashed: true },
    { x: avg,   label: '50%', color: carrierColor || '#3b82f6', dashed: false },
    { x: p90,   label: '90%', color: '#f59e0b', dashed: true },
    { x: worst, label: '95%', color: '#ef4444', dashed: true },
  ];

  return (
    <svg
      viewBox={`0 0 ${svgW} ${svgH}`}
      className="w-full h-auto"
      aria-label="Arrival probability bell curve"
    >
      <defs>
        {/* Gradient fill for area */}
        <linearGradient id="bellGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={carrierColor || '#3b82f6'} stopOpacity="0.35" />
          <stop offset="100%" stopColor={carrierColor || '#3b82f6'} stopOpacity="0.03" />
        </linearGradient>
        {/* Glow filter */}
        <filter id="glow">
          <feGaussianBlur stdDeviation="2" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Grid lines */}
      {[0.25, 0.5, 0.75, 1].map(f => (
        <line
          key={f}
          x1={padL} y1={toSvgY(f)}
          x2={svgW - padR} y2={toSvgY(f)}
          stroke="#1e293b"
          strokeWidth="1"
        />
      ))}

      {/* X axis */}
      <line
        x1={padL} y1={toSvgY(0)}
        x2={svgW - padR} y2={toSvgY(0)}
        stroke="#334155"
        strokeWidth="1"
      />

      {/* Area fill */}
      <path d={areaData} fill="url(#bellGradient)" />

      {/* Curve line */}
      <path
        d={pathData}
        fill="none"
        stroke={carrierColor || '#3b82f6'}
        strokeWidth="2"
        filter="url(#glow)"
      />

      {/* Vertical markers */}
      {markers.map(({ x, label, color, dashed }) => {
        if (x < xMin || x > xMax) return null;
        const sx = toSvgX(x);
        const sy = toSvgY(gaussianY(x, mean, stdDev) / maxY);
        return (
          <g key={label}>
            <line
              x1={sx} y1={sy}
              x2={sx} y2={toSvgY(0)}
              stroke={color}
              strokeWidth="1.5"
              strokeDasharray={dashed ? '4 3' : 'none'}
              opacity="0.8"
            />
            {/* Dot on curve */}
            <circle cx={sx} cy={sy} r="3.5" fill={color} opacity="0.9" />
            {/* Label */}
            <text
              x={sx}
              y={svgH - 4}
              fill={color}
              fontSize="9"
              fontFamily="JetBrains Mono, monospace"
              textAnchor="middle"
              opacity="0.9"
            >
              {label}
            </text>
          </g>
        );
      })}

      {/* X-axis day labels */}
      {[best, avg, p90, worst].map((d, i) => {
        if (d < xMin || d > xMax) return null;
        const sx = toSvgX(d);
        return (
          <text
            key={i}
            x={sx}
            y={toSvgY(0) + 14}
            fill="#475569"
            fontSize="8"
            fontFamily="JetBrains Mono, monospace"
            textAnchor="middle"
          >
            {d}d
          </text>
        );
      })}
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Date formatter
// ---------------------------------------------------------------------------
function formatDate(date) {
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

function DaysBadge({ days, color }) {
  return (
    <span
      className="font-mono font-bold text-lg"
      style={{ color }}
    >
      {days === 1 ? '1 day' : `${days} days`}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------
export default function ProbabilityDashboard({ carrier, service, carrierMeta }) {
  const today = useMemo(() => new Date(), []);
  const stats = useMemo(() => getStats(carrier, service), [carrier, service]);
  const international = useMemo(() => isInternational(carrier, service), [carrier, service]);

  const arrival = useMemo(() => {
    if (!stats) return null;
    return computeArrivalDates(stats, international, today);
  }, [stats, international, today]);

  if (!stats || !arrival) return null;

  const color = carrierMeta?.color || '#3b82f6';
  const isWeekend = arrival.buffers.weekend > 0;

  const probabilities = [
    {
      pct: 10,
      label: 'Best case',
      sublabel: 'Fastest 10% of shipments',
      date: arrival.best,
      days: arrival.days.best,
      color: '#10b981',
      bg: 'rgba(16,185,129,0.08)',
      border: 'rgba(16,185,129,0.3)',
    },
    {
      pct: 50,
      label: 'Most likely',
      sublabel: 'Median arrival',
      date: arrival.avg,
      days: arrival.days.avg,
      color: color,
      bg: `${color}15`,
      border: `${color}40`,
      highlight: true,
    },
    {
      pct: 75,
      label: '75% on time',
      sublabel: '3 in 4 shipments arrive by this date',
      date: arrival.p75,
      days: arrival.days.p75,
      color: '#f59e0b',
      bg: 'rgba(245,158,11,0.08)',
      border: 'rgba(245,158,11,0.3)',
    },
    {
      pct: 90,
      label: '90% on time',
      sublabel: '9 in 10 shipments arrive by this date',
      date: arrival.p90,
      days: arrival.days.p90,
      color: '#f97316',
      bg: 'rgba(249,115,22,0.08)',
      border: 'rgba(249,115,22,0.3)',
    },
    {
      pct: 5,
      label: 'Delay risk',
      sublabel: '5% chance of delay beyond this date',
      date: arrival.worst,
      days: arrival.days.worst,
      color: '#ef4444',
      bg: 'rgba(239,68,68,0.08)',
      border: 'rgba(239,68,68,0.3)',
    },
  ];

  return (
    <div className="glass-card p-6 animate-slide-up">
      {/* Header */}
      <div className="flex items-start justify-between mb-5">
        <div>
          <p className="section-label mb-1">Probability Engine</p>
          <h3 className="text-lg font-bold text-white">Arrival Forecast</h3>
          <p className="text-xs text-slate-500 mt-1 font-mono">
            {stats.label} · Based on historical data
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-500 font-mono">Today</p>
          <p className="text-sm font-semibold text-slate-300">{formatDate(today)}</p>
        </div>
      </div>

      {/* Active warning banners */}
      <div className="flex flex-col gap-2 mb-5">
        {isWeekend && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs">
            <span>📅</span>
            <span>Weekend buffer applied: +{arrival.buffers.weekend} day(s) added to estimates</span>
          </div>
        )}
        {arrival.buffers.isInternational && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs">
            <span>🌍</span>
            <span>International shipment: +{arrival.buffers.customs} days added for customs clearance</span>
          </div>
        )}
      </div>

      {/* Bell Curve */}
      <div className="mb-5 rounded-xl bg-navy-900/50 border border-slate-800 p-3">
        <p className="text-xs text-slate-600 font-mono mb-2 text-center">
          Probability Distribution — Transit Days
        </p>
        <BellCurveSVG stats={stats} arrival={arrival} carrierColor={color} />
        <div className="flex justify-center gap-5 mt-1">
          {[
            { label: '10%', color: '#10b981' },
            { label: '50%', color },
            { label: '90%', color: '#f59e0b' },
            { label: '95%', color: '#ef4444' },
          ].map(({ label, color: c }) => (
            <div key={label} className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c }} />
              <span className="text-xs text-slate-600 font-mono">{label} percentile</span>
            </div>
          ))}
        </div>
      </div>

      {/* Probability list */}
      <div className="space-y-2">
        {probabilities.map(({ pct, label, sublabel, date, days, color: c, bg, border, highlight }) => (
          <div
            key={label}
            className={`flex items-center justify-between px-4 py-3 rounded-xl border transition-all duration-200
              ${highlight ? 'ring-1' : ''}`}
            style={{
              backgroundColor: bg,
              borderColor: border,
              ...(highlight ? { ringColor: c } : {}),
            }}
          >
            <div className="flex items-center gap-3">
              {/* Percentage ring */}
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
              <p className="text-sm font-semibold text-white">{formatDate(date)}</p>
              <DaysBadge days={days} color={c} />
            </div>
          </div>
        ))}
      </div>

      {/* Footer disclaimer */}
      <p className="mt-4 text-xs text-slate-600 leading-relaxed text-center">
        Estimates derived from historical carrier performance data.
        Actual delivery may vary due to weather, volume surges, or carrier delays.
      </p>
    </div>
  );
}
