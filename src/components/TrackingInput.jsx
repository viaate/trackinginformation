import { useState, useCallback, useRef, useEffect } from 'react';
import { detectCarrier, detectAllPossible } from '../utils/carrierDetector';

const PLACEHOLDER_NUMBERS = [
  '1Z999AA10123456784',
  '9400111899223397987318',
  '7489 6391 6901',
  'TBA123456789000',
  'LX123456789CN',
];

export default function TrackingInput({ onTrack, onCarrierDetected }) {
  const [value, setValue] = useState('');
  const [detected, setDetected] = useState(null);
  const [allMatches, setAllMatches] = useState([]);
  const [focused, setFocused] = useState(false);
  const [animateBadge, setAnimateBadge] = useState(false);
  const [placeholderIdx, setPlaceholderIdx] = useState(0);
  const inputRef = useRef(null);
  const prevCarrierRef = useRef(null);

  // Cycle placeholder text
  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIdx(i => (i + 1) % PLACEHOLDER_NUMBERS.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleChange = useCallback((e) => {
    const raw = e.target.value;
    setValue(raw);

    const result = detectCarrier(raw);
    const all = raw.length >= 8 ? detectAllPossible(raw) : [];
    setAllMatches(all);

    if (result.carrier !== prevCarrierRef.current) {
      setAnimateBadge(true);
      setTimeout(() => setAnimateBadge(false), 400);
      prevCarrierRef.current = result.carrier;
    }

    setDetected(result.carrier ? result : null);
    onCarrierDetected?.(result.carrier ? result : null);
  }, [onCarrierDetected]);

  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    if (!value.trim()) return;
    const result = detectCarrier(value);
    onTrack?.(value.trim(), result);
  }, [value, onTrack]);

  const handlePaste = useCallback((e) => {
    setTimeout(() => {
      const raw = inputRef.current?.value || '';
      const result = detectCarrier(raw);
      if (result.carrier) {
        setDetected(result);
        onCarrierDetected?.(result);
      }
    }, 50);
  }, [onCarrierDetected]);

  const clearInput = () => {
    setValue('');
    setDetected(null);
    setAllMatches([]);
    prevCarrierRef.current = null;
    onCarrierDetected?.(null);
    inputRef.current?.focus();
  };

  const { meta, carrier, service } = detected || {};

  return (
    <div className="w-full max-w-3xl mx-auto">
      {/* Main search form */}
      <form onSubmit={handleSubmit} className="relative">
        <div
          className={`relative flex items-center rounded-2xl border-2 transition-all duration-300 ${
            focused
              ? 'border-blue-500 shadow-lg shadow-blue-900/30'
              : detected
              ? 'border-opacity-60'
              : 'border-slate-700'
          }`}
          style={
            detected && meta
              ? { borderColor: meta.borderColor, boxShadow: `0 0 24px ${meta.bgColor}` }
              : {}
          }
        >
          {/* Left icon */}
          <div className="pl-5 pr-3 flex-shrink-0">
            {detected && meta ? (
              <span
                className={`text-2xl ${animateBadge ? 'animate-bounce' : ''}`}
                title={carrier}
              >
                {meta.icon}
              </span>
            ) : (
              <svg className="w-6 h-6 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            )}
          </div>

          {/* Input */}
          <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={handleChange}
            onPaste={handlePaste}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder={`e.g. ${PLACEHOLDER_NUMBERS[placeholderIdx]}`}
            className="flex-1 bg-transparent py-5 text-white text-lg font-mono placeholder-slate-600
                       outline-none tracking-wide"
            autoComplete="off"
            spellCheck="false"
          />

          {/* Clear button */}
          {value && (
            <button
              type="button"
              onClick={clearInput}
              className="px-3 text-slate-500 hover:text-slate-300 transition-colors"
              aria-label="Clear"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}

          {/* Track button */}
          <button
            type="submit"
            disabled={!value.trim()}
            className={`m-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-200
              ${value.trim()
                ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/40 active:scale-95'
                : 'bg-slate-800 text-slate-600 cursor-not-allowed'
              }`}
          >
            Track
          </button>
        </div>
      </form>

      {/* Carrier detection badge */}
      {detected && carrier && (
        <div className={`mt-4 flex flex-wrap items-center gap-3 ${animateBadge ? 'animate-fade-in' : ''}`}>
          <div
            className="flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-semibold"
            style={{
              backgroundColor: meta.bgColor,
              borderColor: meta.borderColor,
              color: meta.color,
            }}
          >
            <span>{meta.icon}</span>
            <span>{carrier}</span>
            <span className="opacity-60">·</span>
            <span className="font-normal opacity-80">{service}</span>
          </div>

          {detected.confidence === 'high' && (
            <span className="flex items-center gap-1 text-xs text-emerald-400 font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-pulse" />
              High confidence
            </span>
          )}
          {detected.confidence === 'medium' && (
            <span className="flex items-center gap-1 text-xs text-yellow-400 font-mono">
              <span className="w-2 h-2 rounded-full bg-yellow-400 inline-block" />
              Medium confidence — verify carrier
            </span>
          )}

          {/* Multiple carrier possibilities */}
          {allMatches.length > 1 && (
            <span className="text-xs text-slate-500">
              Also matches: {allMatches
                .filter(m => m.carrier !== carrier)
                .map(m => m.carrier)
                .join(', ')}
            </span>
          )}
        </div>
      )}

      {/* No match hint */}
      {value.length >= 8 && !detected && (
        <p className="mt-3 text-xs text-slate-600 font-mono">
          No carrier detected — try pasting your full tracking number
        </p>
      )}
    </div>
  );
}
