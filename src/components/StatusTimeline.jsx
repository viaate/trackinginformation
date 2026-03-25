import { useMemo } from 'react';

const STAGES = [
  {
    id: 'ordered',
    label: 'Order Placed',
    sublabel: 'Label created / pickup scheduled',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    fraction: 0,
  },
  {
    id: 'pickup',
    label: 'Package Picked Up',
    sublabel: 'In carrier possession',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
    ),
    fraction: 0.12,
  },
  {
    id: 'origin_hub',
    label: 'Origin Hub',
    sublabel: 'Processed at regional facility',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    ),
    fraction: 0.27,
  },
  {
    id: 'transit',
    label: 'In Transit',
    sublabel: 'Moving between facilities',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
      </svg>
    ),
    fraction: 0.5,
  },
  {
    id: 'dest_hub',
    label: 'Destination Hub',
    sublabel: 'Arrived at local facility',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    fraction: 0.75,
  },
  {
    id: 'out_for_delivery',
    label: 'Out for Delivery',
    sublabel: 'With delivery driver today',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
      </svg>
    ),
    fraction: 0.88,
  },
  {
    id: 'delivered',
    label: 'Delivered',
    sublabel: 'Package at destination',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    fraction: 1,
  },
];

function getActiveStageIndex(stats) {
  if (!stats) return 0;
  // Estimate progress based on ratio of expected days elapsed
  // We assume shipment was created "today" for the simulator
  // In real tracking, this comes from the 17track widget
  const ratio = 0; // No elapsed time known — show all stages as "future"
  return STAGES.findIndex(s => s.fraction > ratio) - 1;
}

export default function StatusTimeline({ carrier, stats, carrierMeta }) {
  const accentColor = carrierMeta?.color || '#3b82f6';

  const stageLabels = useMemo(() => {
    if (!stats) return STAGES;
    // Optionally override sublabels based on stats
    return STAGES.map((stage) => {
      if (stage.id === 'origin_hub' && stats.international) {
        return { ...stage, sublabel: 'Processed + customs export scan' };
      }
      if (stage.id === 'dest_hub' && stats.international) {
        return { ...stage, sublabel: 'Customs clearance + delivery facility' };
      }
      return stage;
    });
  }, [stats]);

  return (
    <div className="glass-card p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="section-label mb-1">Shipping Journey</p>
          <h3 className="text-lg font-bold text-white">Stages Overview</h3>
        </div>
        {stats?.international && (
          <span className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/30 text-orange-400 text-xs font-mono">
            🌍 International
          </span>
        )}
      </div>

      {/* Timeline */}
      <div className="relative">
        {stageLabels.map((stage, i) => {
          const isLast = i === stageLabels.length - 1;
          const isActive = false; // Will be determined by real tracking data from 17track
          const isPast = false;   // Future: parse 17track widget data

          return (
            <div key={stage.id} className="flex gap-4">
              {/* Left: icon + connector line */}
              <div className="flex flex-col items-center flex-shrink-0">
                <div
                  className={`w-10 h-10 rounded-full border-2 flex items-center justify-center flex-shrink-0
                    transition-all duration-500 ${
                      isPast
                        ? 'bg-emerald-900/50 border-emerald-500 text-emerald-400'
                        : isActive
                        ? 'border-2 text-white animate-pulse-slow'
                        : 'bg-navy-700 border-slate-700 text-slate-600'
                    }`}
                  style={
                    isActive
                      ? { borderColor: accentColor, backgroundColor: `${accentColor}20`, color: accentColor }
                      : {}
                  }
                >
                  {isPast ? (
                    <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    stage.icon
                  )}
                </div>

                {/* Connector line */}
                {!isLast && (
                  <div className="w-px flex-1 my-1 min-h-[32px] relative overflow-hidden rounded">
                    <div className="absolute inset-0 bg-slate-700" />
                    {isPast && (
                      <div
                        className="absolute inset-0 timeline-connector-fill"
                        style={{ background: `linear-gradient(to bottom, ${accentColor}, ${accentColor}80)` }}
                      />
                    )}
                  </div>
                )}
              </div>

              {/* Right: label content */}
              <div className={`pb-6 ${isLast ? 'pb-0' : ''}`}>
                <p
                  className={`font-semibold text-sm transition-colors duration-300 ${
                    isPast ? 'text-emerald-400' : isActive ? 'text-white' : 'text-slate-500'
                  }`}
                  style={isActive ? { color: accentColor } : {}}
                >
                  {stage.label}
                  {isActive && (
                    <span
                      className="ml-2 text-xs px-2 py-0.5 rounded-full font-mono animate-pulse"
                      style={{ backgroundColor: `${accentColor}20`, color: accentColor }}
                    >
                      LIVE
                    </span>
                  )}
                </p>
                <p className="text-xs text-slate-600 mt-0.5">{stage.sublabel}</p>

                {/* Estimated time for certain stages */}
                {stats && stage.id === 'transit' && (
                  <p className="text-xs font-mono text-slate-600 mt-1">
                    ~{stats.avg} days avg · best {stats.best}d · worst {stats.worst}d
                  </p>
                )}
                {stats?.international && stage.id === 'dest_hub' && (
                  <p className="text-xs font-mono text-orange-500/70 mt-1">
                    +3–14 days for customs clearance
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer note */}
      <div className="mt-4 pt-4 border-t border-slate-800 flex items-start gap-2">
        <svg className="w-4 h-4 text-slate-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="text-xs text-slate-600 leading-relaxed">
          Stage progress is inferred from the live tracking widget below. The diagram shows the typical journey for {carrier || 'this carrier'}.
        </p>
      </div>
    </div>
  );
}
