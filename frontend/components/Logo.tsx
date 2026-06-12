interface LogoMarkProps {
  className?: string;
  stroke?: string;
  width?: number;
  strokeWidth?: number;
}

/**
 * Fachwerk IssykKul mark — small front-left peak + large peak whose right
 * slope sweeps far down to the right. Matches the official vector silhouette.
 */
export function LogoMark({ className = "", stroke = "currentColor", width = 48, strokeWidth = 4 }: LogoMarkProps) {
  return (
    <svg width={width} viewBox="0 0 200 68" fill="none" className={className} aria-hidden="true">
      {/* Large peak — long right sweep */}
      <path d="M8 58 L82 10 L196 60"
        stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
      {/* Small front-left peak */}
      <path d="M30 58 L58 31 L94 58"
        stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

interface LogoFullProps {
  color?: string;
  className?: string;
}

/** Full stacked lockup: mark + "Fachwerk" wordmark + "ISSYKKUL" with flanking rules. */
export function LogoFull({ color = "#ffffff", className = "" }: LogoFullProps) {
  return (
    <div className={`flex flex-col items-center ${className}`}>
      <LogoMark stroke={color} width={150} strokeWidth={3} />
      <p className="font-serif mt-3" style={{ color, fontSize: "34px", letterSpacing: "0.02em" }}>
        Fachwerk
      </p>
      <div className="flex items-center gap-3 mt-1">
        <span style={{ width: 30, height: 1, background: color, opacity: 0.6 }} />
        <span className="font-sans" style={{ color, fontSize: "12px", letterSpacing: "0.45em", fontWeight: 500 }}>
          ISSYKKUL
        </span>
        <span style={{ width: 30, height: 1, background: color, opacity: 0.6 }} />
      </div>
    </div>
  );
}
