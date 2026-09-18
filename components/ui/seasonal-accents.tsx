const bulbs = [
  { left: "4%", top: "0.22rem", color: "#b58b46", mobile: true },
  { left: "16%", top: "0.42rem", color: "#4d7895", mobile: false },
  { left: "28%", top: "0.55rem", color: "#47725f", mobile: true },
  { left: "40%", top: "0.38rem", color: "#9f5a58", mobile: false },
  { left: "52%", top: "0.2rem", color: "#b58b46", mobile: true },
  { left: "64%", top: "0.38rem", color: "#4d7895", mobile: false },
  { left: "76%", top: "0.55rem", color: "#47725f", mobile: true },
  { left: "88%", top: "0.38rem", color: "#9f5a58", mobile: false },
  { left: "97%", top: "0.22rem", color: "#b58b46", mobile: true },
] as const;

export function SeasonalLightString() {
  return (
    <div aria-hidden="true" className="relative h-5 w-full overflow-hidden opacity-75">
      <svg className="absolute inset-x-0 top-0 h-3 w-full" viewBox="0 0 100 10" preserveAspectRatio="none" focusable="false">
        <path d="M0 1.2 Q25 8 50 2 Q75 8 100 1.2" fill="none" stroke="#8fa0ad" strokeWidth="0.55" vectorEffect="non-scaling-stroke" />
      </svg>
      {bulbs.map((bulb) => (
        <span key={bulb.left} className={`absolute flex -translate-x-1/2 flex-col items-center ${bulb.mobile ? "" : "hidden sm:flex"}`} style={{ left: bulb.left, top: bulb.top }}>
          <span className="h-1 w-1.5 rounded-sm bg-slate-500" />
          <span className="h-2.5 w-1.5 rounded-b-full rounded-t-sm shadow-[0_1px_5px_currentColor]" style={{ backgroundColor: bulb.color, color: bulb.color }} />
        </span>
      ))}
    </div>
  );
}

export function MiniWreath({ className = "" }: { className?: string }) {
  return (
    <svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" className={className}>
      <circle cx="12" cy="11" r="6.6" fill="none" stroke="#6f8a7e" strokeWidth="3.1" strokeDasharray="1.6 1.15" strokeLinecap="round" />
      <circle cx="8.5" cy="7.1" r="0.75" fill="#c5a15e" />
      <circle cx="15.7" cy="9.1" r="0.75" fill="#a96662" />
      <circle cx="10.1" cy="15.9" r="0.75" fill="#c5a15e" />
      <path d="M10.7 16.9 8.8 21l3.2-1.7 3.2 1.7-1.9-4.1" fill="#9f5a58" opacity="0.9" />
    </svg>
  );
}
