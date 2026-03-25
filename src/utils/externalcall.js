/**
 * externalcall.js
 * Wrapper for the 17Track YQV5 external call API.
 * Loads the 17track.net external script and exposes a clean interface.
 *
 * Usage: The script <https://www.17track.net/externalcall.js> is loaded in
 * index.html, making YQV5 available globally.  This module provides a React-
 * friendly wrapper with promise-based loading and error handling.
 */

let scriptLoaded = false;
let scriptLoading = false;
const callbacks = [];

/**
 * Ensures the 17Track external script is loaded.
 * Returns a Promise that resolves when YQV5 is available.
 */
export function ensureScriptLoaded() {
  return new Promise((resolve, reject) => {
    // Already available (script in <head> of index.html)
    if (typeof window !== 'undefined' && window.YQV5) {
      scriptLoaded = true;
      resolve(window.YQV5);
      return;
    }

    if (scriptLoaded) {
      resolve(window.YQV5);
      return;
    }

    // Queue callback
    callbacks.push({ resolve, reject });

    if (scriptLoading) return;
    scriptLoading = true;

    // Dynamically inject if not already in <head>
    if (document.querySelector('script[src*="17track.net/externalcall"]')) {
      // Script tag exists — poll for YQV5 to become available
      const poll = setInterval(() => {
        if (window.YQV5) {
          clearInterval(poll);
          scriptLoaded = true;
          callbacks.forEach(cb => cb.resolve(window.YQV5));
          callbacks.length = 0;
        }
      }, 100);

      // Timeout after 10 seconds
      setTimeout(() => {
        clearInterval(poll);
        if (!scriptLoaded) {
          const err = new Error('17Track script timed out');
          callbacks.forEach(cb => cb.reject(err));
          callbacks.length = 0;
        }
      }, 10_000);
      return;
    }

    // Inject the script
    const script = document.createElement('script');
    script.src = 'https://www.17track.net/externalcall.js';
    script.async = true;

    script.onload = () => {
      scriptLoaded = true;
      callbacks.forEach(cb => cb.resolve(window.YQV5));
      callbacks.length = 0;
    };

    script.onerror = () => {
      const err = new Error('Failed to load 17Track external script');
      callbacks.forEach(cb => cb.reject(err));
      callbacks.length = 0;
    };

    document.head.appendChild(script);
  });
}

/**
 * Renders the 17Track tracking widget into the specified container element.
 *
 * @param {string} containerId  - The DOM element ID to render the widget into.
 * @param {string} trackingNumber - The (cleaned) tracking number.
 * @param {object} [options]    - Optional widget configuration.
 */
export async function trackSingle(containerId, trackingNumber, options = {}) {
  if (!trackingNumber) return;

  const container = document.getElementById(containerId);
  if (!container) {
    console.warn(`[externalcall] Container #${containerId} not found`);
    return;
  }

  try {
    await ensureScriptLoaded();

    if (!window.YQV5) {
      throw new Error('YQV5 not available after script load');
    }

    // Clear any previous widget content
    container.innerHTML = '';

    window.YQV5.trackSingle({
      YQ_ContainerId: containerId,
      YQ_Height: options.height ?? 560,
      YQ_Fc: options.fc ?? '0',
      YQ_Lang: options.lang ?? 'auto',
      YQ_Num: trackingNumber,
      ...options.extra,
    });
  } catch (err) {
    console.error('[externalcall] trackSingle error:', err);
    if (container) {
      container.innerHTML = `
        <div style="
          padding: 24px;
          text-align: center;
          color: #94a3b8;
          font-family: Inter, sans-serif;
          font-size: 14px;
        ">
          <div style="font-size: 32px; margin-bottom: 12px;">⚠️</div>
          <div style="color: #f87171; margin-bottom: 8px;">Could not load tracking widget</div>
          <div>The 17Track service may be temporarily unavailable.<br/>
               Use the Direct Links below to track on the carrier's official website.</div>
        </div>
      `;
    }
  }
}

/**
 * Clears the tracking widget from a container.
 */
export function clearTracker(containerId) {
  const container = document.getElementById(containerId);
  if (container) container.innerHTML = '';
}
