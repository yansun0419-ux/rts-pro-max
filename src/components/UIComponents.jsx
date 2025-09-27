import React, { useState } from "react";

export const Chip = ({ children }) => (
  <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-xs border border-slate-200">
    {children}
  </span>
);

export function Stars({ value = 0, onChange, size = "text-xl" }) {
  const [hover, setHover] = useState(0);
  const stars = [1, 2, 3, 4, 5];
  return (
    <div className="flex items-center gap-1">
      {stars.map((n) => (
        <button
          key={n}
          type="button"
          onMouseEnter={() => setHover(n)}
          onMouseLeave={() => setHover(0)}
          onClick={() => onChange && onChange(n)}
          className={size}
          aria-label={`rate ${n}`}
        >
          {(hover || value) >= n ? "★" : "☆"}
        </button>
      ))}
    </div>
  );
}

export function Stat({ label, value, hint }) {
  return (
    <div className="px-3 py-2 rounded-xl bg-slate-50 border text-sm">
      <div className="text-slate-500">{label}</div>
      <div className="font-semibold">{value}</div>
      {hint && <div className="text-xs text-slate-400">{hint}</div>}
    </div>
  );
}

export function DaysPicker({ value, onChange }) {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const toggle = (d) => {
    const has = value.includes(d);
    const next = has ? value.filter((x) => x !== d) : [...value, d];
    onChange(next);
  };
  return (
    <div className="flex flex-wrap gap-1.5 items-center">
      {days.map((d) => (
        <button
          key={d}
          type="button"
          onClick={() => toggle(d)}
          className={`px-2.5 py-1 rounded-xl border text-sm ${
            value.includes(d)
              ? "bg-slate-900 text-white border-slate-900"
              : "bg-white hover:bg-slate-50"
          }`}
        >
          {d}
        </button>
      ))}
    </div>
  );
}
