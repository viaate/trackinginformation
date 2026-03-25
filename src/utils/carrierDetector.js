/**
 * carrierDetector.js
 * Regex-based carrier identification for major shipping carriers.
 * No API keys required — pure pattern matching.
 */

// ---------------------------------------------------------------------------
// Carrier Pattern Definitions
// Each entry: { pattern: RegExp, service: string, confidence: 'high'|'medium' }
// ---------------------------------------------------------------------------
const CARRIER_PATTERNS = {
  UPS: [
    // Standard UPS (1Z + 16 alphanumeric chars)
    {
      pattern: /\b1Z[A-Z0-9]{16}\b/i,
      service: 'Ground / Air',
      confidence: 'high',
    },
    // UPS Mail Innovations / SurePost (begins with 92 + 20 digits)
    {
      pattern: /\b(92\d{20}|93\d{20})\b/,
      service: 'Mail Innovations / SurePost',
      confidence: 'high',
    },
    // UPS freight (T + 10 digits)
    {
      pattern: /\bT\d{10}\b/,
      service: 'Freight',
      confidence: 'high',
    },
    // UPS 9-digit freight
    {
      pattern: /^\d{9}$/,
      service: 'Freight (9-digit)',
      confidence: 'medium',
    },
  ],

  FedEx: [
    // FedEx Ground96 (96 + 20 digits = 22 total)
    {
      pattern: /\b96\d{20}\b/,
      service: 'Ground 96',
      confidence: 'high',
    },
    // FedEx SmartPost (92 + 20 digits) — overlaps with UPS; FedEx first if starts 9261/9274
    {
      pattern: /\b(9261|9274|9400|9274|9205|9261)\d{16}\b/,
      service: 'SmartPost',
      confidence: 'high',
    },
    // FedEx 15-digit
    {
      pattern: /\b\d{15}\b/,
      service: 'Express / Ground',
      confidence: 'medium',
    },
    // FedEx 12-digit (most common express)
    {
      pattern: /\b\d{12}\b/,
      service: 'Express',
      confidence: 'medium',
    },
    // FedEx 20-digit
    {
      pattern: /\b\d{20}\b/,
      service: 'Ground',
      confidence: 'medium',
    },
  ],

  USPS: [
    // USPS Certified Mail (94 + 20 digits)
    {
      pattern: /\b94\d{20}\b/,
      service: 'Certified Mail',
      confidence: 'high',
    },
    // USPS Priority Mail Express (EA/EC/EB + 9 digits + US)
    {
      pattern: /\bE[A-Z]\d{9}US\b/i,
      service: 'Priority Mail Express',
      confidence: 'high',
    },
    // USPS Registered Mail (RA/RB/RC + 9 digits + US)
    {
      pattern: /\bR[A-Z]\d{9}US\b/i,
      service: 'Registered Mail',
      confidence: 'high',
    },
    // USPS First-Class Package International (CX/CP + 9 digits + US)
    {
      pattern: /\bC[A-Z]\d{9}US\b/i,
      service: 'First-Class International',
      confidence: 'high',
    },
    // USPS generic 91/92/93/94/95 + 18-20 digits
    {
      pattern: /\b9[1-5]\d{18,20}\b/,
      service: 'Priority / Ground Advantage',
      confidence: 'high',
    },
    // USPS Priority Mail International (PM + 9 digits + US)
    {
      pattern: /\bP[A-Z]\d{9}US\b/i,
      service: 'Priority Mail International',
      confidence: 'high',
    },
    // USPS 22-digit (Intelligent Mail Package Barcode)
    {
      pattern: /\b\d{22}\b/,
      service: 'Ground Advantage (IMpb)',
      confidence: 'medium',
    },
  ],

  DHL: [
    // DHL Express 10-digit
    {
      pattern: /\b\d{10}\b/,
      service: 'Express',
      confidence: 'medium',
    },
    // DHL eCommerce (GM + 16 alphanumeric)
    {
      pattern: /\bGM\d{16}\b/i,
      service: 'eCommerce',
      confidence: 'high',
    },
    // DHL Parcel (3 letters + 10 digits)
    {
      pattern: /\b[A-Z]{3}\d{10}\b/,
      service: 'Parcel',
      confidence: 'medium',
    },
    // DHL Waybill (JD + 18 digits)
    {
      pattern: /\bJD\d{18}\b/,
      service: 'Waybill',
      confidence: 'high',
    },
    // DHL yellow label (2 letters + 9 digits + 2 letters, international)
    {
      pattern: /\b[A-Z]{2}\d{9}[A-Z]{2}\b/,
      service: 'Express International',
      confidence: 'medium',
    },
  ],

  Amazon: [
    // Amazon Logistics TBA (TBA + 12 digits)
    {
      pattern: /\bTBA\d{12}\b/i,
      service: 'Amazon Logistics',
      confidence: 'high',
    },
    // Amazon Flex (AMZN_US + alphanumeric)
    {
      pattern: /\bAMZN_US_\w+\b/i,
      service: 'Amazon Flex',
      confidence: 'high',
    },
    // Amazon order-shipped confirmation format
    {
      pattern: /\b(D\d{2}-\d{7}-\d{7})\b/,
      service: 'Amazon Order',
      confidence: 'high',
    },
  ],

  ChinaPost: [
    // China Post registered / EMS / airmail: 2 uppercase letters + 9 digits + CN
    {
      pattern: /\b[A-Z]{2}\d{9}CN\b/i,
      service: 'China Post International',
      confidence: 'high',
    },
    // Cainiao / AliExpress format
    {
      pattern: /\bLP\d{9}[A-Z]{2}\b/i,
      service: 'Cainiao / AliExpress',
      confidence: 'high',
    },
    // YW + 28 digits (Yanwen)
    {
      pattern: /\bYW\d{28}\b/,
      service: 'Yanwen Economy',
      confidence: 'high',
    },
  ],
};

// Order matters: more specific patterns first
const DETECTION_ORDER = ['Amazon', 'UPS', 'ChinaPost', 'USPS', 'DHL', 'FedEx'];

// ---------------------------------------------------------------------------
// Carrier metadata for UI display
// ---------------------------------------------------------------------------
export const CARRIER_META = {
  UPS: {
    color: '#d97706',        // amber
    bgColor: 'rgba(217,119,6,0.15)',
    borderColor: 'rgba(217,119,6,0.4)',
    icon: '🟤',
    trackUrl: (n) => `https://www.ups.com/track?tracknum=${n}`,
    international: false,
  },
  FedEx: {
    color: '#7c3aed',        // purple
    bgColor: 'rgba(124,58,237,0.15)',
    borderColor: 'rgba(124,58,237,0.4)',
    icon: '🟣',
    trackUrl: (n) => `https://www.fedex.com/fedextrack/?trknbr=${n}`,
    international: false,
  },
  USPS: {
    color: '#2563eb',        // blue
    bgColor: 'rgba(37,99,235,0.15)',
    borderColor: 'rgba(37,99,235,0.4)',
    icon: '🔵',
    trackUrl: (n) => `https://tools.usps.com/go/TrackConfirmAction?tLabels=${n}`,
    international: false,
  },
  DHL: {
    color: '#dc2626',        // red
    bgColor: 'rgba(220,38,38,0.15)',
    borderColor: 'rgba(220,38,38,0.4)',
    icon: '🔴',
    trackUrl: (n) => `https://www.dhl.com/en/express/tracking.html?AWB=${n}`,
    international: true,
  },
  Amazon: {
    color: '#f59e0b',        // yellow/orange
    bgColor: 'rgba(245,158,11,0.15)',
    borderColor: 'rgba(245,158,11,0.4)',
    icon: '🟡',
    trackUrl: (n) => `https://track.amazon.com/tracking/${n}`,
    international: false,
  },
  ChinaPost: {
    color: '#ef4444',        // bright red
    bgColor: 'rgba(239,68,68,0.15)',
    borderColor: 'rgba(239,68,68,0.4)',
    icon: '🟠',
    trackUrl: (n) => `https://www.17track.net/en/track#nums=${n}`,
    international: true,
  },
};

// ---------------------------------------------------------------------------
// Main detection function
// ---------------------------------------------------------------------------

/**
 * Detects the carrier and service type from a tracking number string.
 * @param {string} raw - Raw tracking number input (may have spaces/dashes)
 * @returns {{ carrier: string|null, service: string|null, confidence: string, cleaned: string }}
 */
export function detectCarrier(raw) {
  if (!raw || typeof raw !== 'string') {
    return { carrier: null, service: null, confidence: 'none', cleaned: '' };
  }

  // Normalize: trim, uppercase, remove spaces and dashes
  const cleaned = raw.trim().replace(/[\s\-]/g, '').toUpperCase();

  if (cleaned.length < 8) {
    return { carrier: null, service: null, confidence: 'none', cleaned };
  }

  for (const carrier of DETECTION_ORDER) {
    const patterns = CARRIER_PATTERNS[carrier];
    for (const { pattern, service, confidence } of patterns) {
      if (pattern.test(cleaned)) {
        return {
          carrier,
          service,
          confidence,
          cleaned,
          meta: CARRIER_META[carrier],
        };
      }
    }
  }

  return { carrier: null, service: null, confidence: 'none', cleaned };
}

/**
 * Determines if a detected tracking number likely represents an international shipment.
 */
export function isInternational(carrier, service) {
  if (!carrier) return false;
  if (CARRIER_META[carrier]?.international) return true;
  // USPS international patterns are in the service name
  if (carrier === 'USPS' && service && service.toLowerCase().includes('international')) return true;
  return false;
}

/**
 * Returns a list of all carriers that could match this tracking number.
 */
export function detectAllPossible(raw) {
  const cleaned = raw.trim().replace(/[\s\-]/g, '').toUpperCase();
  const matches = [];

  for (const carrier of DETECTION_ORDER) {
    const patterns = CARRIER_PATTERNS[carrier];
    for (const { pattern, service, confidence } of patterns) {
      if (pattern.test(cleaned)) {
        matches.push({ carrier, service, confidence, meta: CARRIER_META[carrier] });
        break; // one match per carrier
      }
    }
  }

  return matches;
}
