import React from "react";
import { planStats, parseStartHour } from "../utils/helpers";

export default function InsightCard({ plan, exps }) {
  const s = planStats(plan.id, exps);
  if (!s.n) return null;
  const msgs = [];
  if (s.avgWait > 12) msgs.push(`Avg wait ${s.avgWait.toFixed(1)} min (>12).`);
  if (s.onTimeRate < 0.85)
    msgs.push(`On-time ${(s.onTimeRate * 100).toFixed(0)}% (<85%).`);
  if (s.avgCrowd >= 4) msgs.push(`Crowding high (${s.avgCrowd.toFixed(1)}/5).`);
  if (msgs.length === 0) return null;

  const h = parseStartHour(plan.departWindow);
  const windowLabel = `${plan.departWindow}`;
  let rec = `Consider +1 bus (or shorter headway) around ${windowLabel}.`;
  if (s.avgCrowd >= 4 && s.avgWait <= 10)
    rec = `Crowding is primary; consider larger vehicle or staggered departures in ${windowLabel}.`;

  return (
    <div className="rounded-xl p-3 border bg-amber-50 border-amber-200 text-amber-900 text-sm">
      <div className="font-semibold">{plan.title}</div>
      <div className="">{msgs.join(" ")}</div>
      <div className="text-amber-800 mt-1">Suggestion: {rec}</div>
    </div>
  );
}
