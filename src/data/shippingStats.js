/**
 * shippingStats.js
 * Hardcoded shipping performance statistics used by the Probability Engine.
 *
 * Structure per service:
 *   avg        — median transit days (50th percentile)
 *   best       — 10th percentile (fastest 10% of deliveries)
 *   worst      — 95th percentile (slowest 5% of deliveries)
 *   p75        — 75th percentile
 *   p90        — 90th percentile (used as primary "on time" estimate)
 *   international — adds customs buffer logic
 *   label      — human-readable service name
 */
export const shippingStats = {
  UPS: {
    default: {
      label: 'UPS Ground',
      avg: 5,
      best: 2,
      p75: 6,
      p90: 8,
      worst: 12,
      international: false,
    },
    Ground: {
      label: 'UPS Ground',
      avg: 5,
      best: 2,
      p75: 6,
      p90: 8,
      worst: 12,
      international: false,
    },
    'Mail Innovations / SurePost': {
      label: 'UPS Mail Innovations',
      avg: 7,
      best: 4,
      p75: 9,
      p90: 11,
      worst: 16,
      international: false,
    },
    'Ground / Air': {
      label: 'UPS Ground / Air',
      avg: 5,
      best: 1,
      p75: 6,
      p90: 8,
      worst: 12,
      international: false,
    },
    Freight: {
      label: 'UPS Freight',
      avg: 3,
      best: 1,
      p75: 4,
      p90: 5,
      worst: 7,
      international: false,
    },
  },

  FedEx: {
    default: {
      label: 'FedEx Ground',
      avg: 5,
      best: 2,
      p75: 6,
      p90: 8,
      worst: 11,
      international: false,
    },
    'Ground 96': {
      label: 'FedEx Ground',
      avg: 5,
      best: 2,
      p75: 6,
      p90: 8,
      worst: 11,
      international: false,
    },
    SmartPost: {
      label: 'FedEx SmartPost',
      avg: 7,
      best: 4,
      p75: 9,
      p90: 12,
      worst: 18,
      international: false,
    },
    Express: {
      label: 'FedEx Express',
      avg: 2,
      best: 1,
      p75: 2,
      p90: 3,
      worst: 4,
      international: false,
    },
    'Express / Ground': {
      label: 'FedEx Express / Ground',
      avg: 3,
      best: 1,
      p75: 4,
      p90: 5,
      worst: 7,
      international: false,
    },
    Ground: {
      label: 'FedEx Ground',
      avg: 5,
      best: 2,
      p75: 6,
      p90: 8,
      worst: 11,
      international: false,
    },
  },

  USPS: {
    default: {
      label: 'USPS Ground Advantage',
      avg: 4,
      best: 2,
      p75: 5,
      p90: 7,
      worst: 9,
      international: false,
    },
    'Priority / Ground Advantage': {
      label: 'USPS Ground Advantage',
      avg: 4,
      best: 2,
      p75: 5,
      p90: 7,
      worst: 9,
      international: false,
    },
    'Ground Advantage (IMpb)': {
      label: 'USPS Ground Advantage',
      avg: 4,
      best: 2,
      p75: 5,
      p90: 7,
      worst: 9,
      international: false,
    },
    'Priority Mail Express': {
      label: 'USPS Priority Mail Express',
      avg: 1,
      best: 1,
      p75: 1,
      p90: 2,
      worst: 2,
      international: false,
    },
    'Registered Mail': {
      label: 'USPS Registered Mail',
      avg: 10,
      best: 5,
      p75: 13,
      p90: 16,
      worst: 21,
      international: false,
    },
    'Certified Mail': {
      label: 'USPS Certified Mail',
      avg: 3,
      best: 2,
      p75: 4,
      p90: 5,
      worst: 7,
      international: false,
    },
    'First-Class International': {
      label: 'USPS First-Class International',
      avg: 14,
      best: 7,
      p75: 18,
      p90: 24,
      worst: 35,
      international: true,
    },
    'Priority Mail International': {
      label: 'USPS Priority Mail International',
      avg: 10,
      best: 6,
      p75: 13,
      p90: 17,
      worst: 25,
      international: true,
    },
  },

  DHL: {
    default: {
      label: 'DHL Express',
      avg: 4,
      best: 2,
      p75: 5,
      p90: 7,
      worst: 10,
      international: true,
    },
    Express: {
      label: 'DHL Express',
      avg: 4,
      best: 2,
      p75: 5,
      p90: 7,
      worst: 10,
      international: true,
    },
    eCommerce: {
      label: 'DHL eCommerce',
      avg: 10,
      best: 6,
      p75: 13,
      p90: 18,
      worst: 28,
      international: true,
    },
    Parcel: {
      label: 'DHL Parcel',
      avg: 5,
      best: 3,
      p75: 6,
      p90: 8,
      worst: 12,
      international: false,
    },
    Waybill: {
      label: 'DHL Express Waybill',
      avg: 3,
      best: 1,
      p75: 4,
      p90: 5,
      worst: 8,
      international: true,
    },
    'Express International': {
      label: 'DHL Express International',
      avg: 4,
      best: 2,
      p75: 5,
      p90: 7,
      worst: 12,
      international: true,
    },
  },

  Amazon: {
    default: {
      label: 'Amazon Logistics',
      avg: 2,
      best: 1,
      p75: 2,
      p90: 3,
      worst: 5,
      international: false,
    },
    'Amazon Logistics': {
      label: 'Amazon Logistics',
      avg: 2,
      best: 1,
      p75: 2,
      p90: 3,
      worst: 5,
      international: false,
    },
    'Amazon Flex': {
      label: 'Amazon Flex',
      avg: 1,
      best: 1,
      p75: 1,
      p90: 2,
      worst: 3,
      international: false,
    },
    'Amazon Order': {
      label: 'Amazon Standard',
      avg: 4,
      best: 2,
      p75: 5,
      p90: 7,
      worst: 10,
      international: false,
    },
  },

  ChinaPost: {
    default: {
      label: 'China Post International',
      avg: 25,
      best: 14,
      p75: 32,
      p90: 45,
      worst: 65,
      international: true,
    },
    'China Post International': {
      label: 'China Post Air Mail',
      avg: 25,
      best: 14,
      p75: 32,
      p90: 45,
      worst: 65,
      international: true,
    },
    'Cainiao / AliExpress': {
      label: 'Cainiao Standard',
      avg: 20,
      best: 12,
      p75: 26,
      p90: 35,
      worst: 55,
      international: true,
    },
    'Yanwen Economy': {
      label: 'Yanwen Economy Air',
      avg: 22,
      best: 14,
      p75: 28,
      p90: 40,
      worst: 60,
      international: true,
    },
  },
};

/**
 * Retrieve stats for a given carrier + service.
 * Falls back to carrier's `default` if service not found.
 */
export function getStats(carrier, service) {
  if (!carrier || !shippingStats[carrier]) return null;
  const carrierStats = shippingStats[carrier];
  return carrierStats[service] ?? carrierStats.default ?? null;
}

// ---------------------------------------------------------------------------
// Geographic Hub Lookup Table
// Used by the Journey Simulator map component.
// ---------------------------------------------------------------------------
export const carrierHubs = {
  UPS: {
    lat: 38.1938,
    lng: -85.7367,
    name: 'Louisville, KY',
    fullName: 'UPS Worldport — Louisville, KY',
    emoji: '🟤',
  },
  FedEx: {
    lat: 35.0424,
    lng: -89.9767,
    name: 'Memphis, TN',
    fullName: 'FedEx SuperHub — Memphis, TN',
    emoji: '🟣',
  },
  USPS: {
    lat: 38.8951,
    lng: -77.0364,
    name: 'Washington, DC',
    fullName: 'USPS Network Distribution Center — DC Metro',
    emoji: '🔵',
  },
  DHL: {
    lat: 39.0485,
    lng: -84.6678,
    name: 'Cincinnati, OH',
    fullName: 'DHL Americas Hub — Cincinnati, OH',
    emoji: '🔴',
  },
  Amazon: {
    lat: 47.6062,
    lng: -122.3321,
    name: 'Seattle, WA',
    fullName: 'Amazon HQ — Seattle, WA',
    emoji: '🟡',
  },
  ChinaPost: {
    lat: 39.9042,
    lng: 116.4074,
    name: 'Beijing, China',
    fullName: 'China Post HQ — Beijing, China',
    emoji: '🟠',
  },
};

/**
 * Carrier delivery schedule definitions.
 * Defines which days each carrier actually attempts delivery.
 */
export const CARRIER_SCHEDULE = {
  UPS:      { days: [1,2,3,4,5],   label: 'Mon–Fri',  note: 'UPS Ground does not deliver on weekends' },
  FedEx:    { days: [1,2,3,4,5],   label: 'Mon–Fri',  note: 'FedEx Ground does not deliver on weekends' },
  USPS:     { days: [1,2,3,4,5,6], label: 'Mon–Sat',  note: 'USPS delivers Monday through Saturday' },
  DHL:      { days: [1,2,3,4,5,6], label: 'Mon–Sat',  note: 'DHL Express delivers Monday through Saturday' },
  Amazon:   { days: [0,1,2,3,4,5,6], label: 'Every day', note: 'Amazon Logistics delivers 7 days a week' },
  ChinaPost:{ days: [1,2,3,4,5,6], label: 'Calendar days', note: 'International transit uses calendar days' },
};

/**
 * Customs buffer: extra days added for international shipments.
 */
export const CUSTOMS_BUFFER = { best: 3, avg: 7, worst: 14 };

/**
 * Advance a date by N *delivery days* for a given carrier, skipping days
 * the carrier does not deliver (e.g. USPS skips Sunday, UPS skips weekends).
 * International/postal carriers (ChinaPost) use raw calendar days.
 */
function addDeliveryDays(startDate, deliveryDays, carrier) {
  const d = new Date(startDate);
  if (deliveryDays <= 0) return d;

  const schedule = CARRIER_SCHEDULE[carrier];
  // If schedule covers all 7 days, or carrier is unknown, use calendar days
  if (!schedule || schedule.days.length === 7) {
    d.setDate(d.getDate() + Math.ceil(deliveryDays));
    return d;
  }

  // International postal: calendar days (too variable for weekday math)
  if (carrier === 'ChinaPost') {
    d.setDate(d.getDate() + Math.ceil(deliveryDays));
    return d;
  }

  // Walk forward day by day, counting only carrier delivery days
  let remaining = Math.ceil(deliveryDays);
  while (remaining > 0) {
    d.setDate(d.getDate() + 1);
    if (schedule.days.includes(d.getDay())) {
      remaining--;
    }
  }
  return d;
}

/**
 * Returns a human-readable note about why a weekend gap was added.
 */
export function getWeekendGapNote(fromDate, carrier) {
  const dow = fromDate.getDay();
  const schedule = CARRIER_SCHEDULE[carrier];
  if (!schedule) return null;

  if (dow === 5 && !schedule.days.includes(6)) {
    return 'Shipped Friday — next UPS/FedEx pickup is Monday (+2 days)';
  }
  if (dow === 5 && schedule.days.includes(6) && !schedule.days.includes(0)) {
    return 'Shipped Friday — carrier delivers Sat but not Sun, added 1 buffer day';
  }
  if (dow === 6 && !schedule.days.includes(0)) {
    return 'Shipped Saturday — next delivery day is Monday (+1 day)';
  }
  if (dow === 0 && !schedule.days.includes(0)) {
    return 'Shipped Sunday — first delivery day is Monday (+1 day)';
  }
  return null;
}

/**
 * Probability Engine — computes realistic arrival dates using carrier-aware
 * delivery day counting (no more USPS Sunday deliveries!).
 *
 * @param {object} stats       - From getStats()
 * @param {boolean} international
 * @param {string}  carrier    - Carrier key (UPS, FedEx, USPS, …)
 * @param {Date}    [fromDate]
 */
export function computeArrivalDates(stats, international, carrier, fromDate = new Date()) {
  const customsBest  = international ? CUSTOMS_BUFFER.best  : 0;
  const customsAvg   = international ? CUSTOMS_BUFFER.avg   : 0;
  const customsWorst = international ? CUSTOMS_BUFFER.worst : 0;

  // Add delivery days using carrier schedule (skips non-delivery days)
  const addDays = (days) => addDeliveryDays(fromDate, days, carrier);

  const bestDays  = stats.best  + customsBest;
  const avgDays   = stats.avg   + customsAvg;
  const p75Days   = stats.p75   + customsAvg;
  const p90Days   = stats.p90   + customsAvg;
  const worstDays = stats.worst + customsWorst;

  const schedule = CARRIER_SCHEDULE[carrier] || CARRIER_SCHEDULE.USPS;
  const weekendGapNote = getWeekendGapNote(fromDate, carrier);

  return {
    best:  addDays(bestDays),
    avg:   addDays(avgDays),
    p75:   addDays(p75Days),
    p90:   addDays(p90Days),
    worst: addDays(worstDays),
    buffers: {
      customs: customsAvg,
      isInternational: international,
      weekendGapNote,
      scheduleLabel: schedule.label,
      scheduleNote: schedule.note,
    },
    days: { best: bestDays, avg: avgDays, p75: p75Days, p90: p90Days, worst: worstDays },
  };
}
