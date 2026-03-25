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
 * Customs buffer: extra days to add for international shipments.
 * Best-case and worst-case adjustments.
 */
export const CUSTOMS_BUFFER = {
  best: 3,
  avg: 7,
  worst: 14,
};

/**
 * Weekend buffer: if today is Friday (5) or Saturday (6), adds extra days
 * because most carriers don't move commercial freight on weekends.
 */
export function getWeekendBuffer(dayOfWeek) {
  if (dayOfWeek === 5) return 2; // Friday → add full weekend
  if (dayOfWeek === 6) return 1; // Saturday → add Sunday
  return 0;
}

/**
 * Probability Engine — computes arrival date range given shipping stats.
 *
 * @param {object} stats  - From getStats()
 * @param {boolean} international - Whether to apply customs buffer
 * @param {Date} [fromDate] - Start date (defaults to today)
 * @returns {{ best: Date, avg: Date, p75: Date, p90: Date, worst: Date, buffers: object }}
 */
export function computeArrivalDates(stats, international, fromDate = new Date()) {
  const weekendBuffer = getWeekendBuffer(fromDate.getDay());
  const customsBest = international ? CUSTOMS_BUFFER.best : 0;
  const customsAvg = international ? CUSTOMS_BUFFER.avg : 0;
  const customsWorst = international ? CUSTOMS_BUFFER.worst : 0;

  const addDays = (date, days) => {
    const d = new Date(date);
    d.setDate(d.getDate() + Math.ceil(days));
    return d;
  };

  const bestDays  = stats.best  + customsBest;
  const avgDays   = stats.avg   + customsAvg  + weekendBuffer;
  const p75Days   = stats.p75   + customsAvg  + weekendBuffer;
  const p90Days   = stats.p90   + customsAvg  + weekendBuffer;
  const worstDays = stats.worst + customsWorst + weekendBuffer;

  return {
    best:  addDays(fromDate, bestDays),
    avg:   addDays(fromDate, avgDays),
    p75:   addDays(fromDate, p75Days),
    p90:   addDays(fromDate, p90Days),
    worst: addDays(fromDate, worstDays),
    buffers: {
      weekend: weekendBuffer,
      customs: customsAvg,
      isInternational: international,
    },
    days: { best: bestDays, avg: avgDays, p75: p75Days, p90: p90Days, worst: worstDays },
  };
}
