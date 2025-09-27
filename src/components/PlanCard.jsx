import React from "react";
import { Chip, Stars, Stat } from "./UIComponents";
import { bayesScore, planStats } from "../utils/helpers";

export default function PlanCard({ plan, ratings, exps, onRate, onSelect }) {
  const rts = ratings.filter((r) => r.planId === plan.id);
  const avg = rts.length
    ? rts.reduce((s, r) => s + r.rating, 0) / rts.length
    : 0;
  const score = bayesScore(rts);
  const st = planStats(plan.id, exps);

  return (
    <div className="rounded-2xl p-4 shadow-sm border bg-white flex flex-col gap-3">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold">{plan.title}</h3>
          <p className="text-sm text-slate-600">
            {plan.origin} → {plan.destination}
          </p>
        </div>
        <div className="text-right">
          <div className="text-sm">
            ⭐ {avg.toFixed(2)}{" "}
            <span className="text-slate-400">({rts.length})</span>
          </div>
          <div className="text-[11px] text-slate-400">
            Confidence: {score.toFixed(2)}
          </div>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        <Chip>{plan.departWindow}</Chip>
        <Chip>{plan.days.join(" • ")}</Chip>
        <Chip>by {plan.author}</Chip>
      </div>
      <ol className="list-decimal pl-6 text-sm text-slate-700">
        {plan.legs.map((l, i) => (
          <li key={i} className="mb-1">
            <span className="font-medium">
              {l.route ? `Route ${l.route}` : "Leg"}
            </span>
            : {l.from} → {l.to}{" "}
            {l.notes ? (
              <span className="text-slate-500">· {l.notes}</span>
            ) : null}
          </li>
        ))}
      </ol>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <Stat
          label="Avg wait"
          value={`${st.n ? st.avgWait.toFixed(1) : "-"} min`}
          hint={`${st.n} logs`}
        />
        <Stat
          label="On-time"
          value={`${st.n ? (st.onTimeRate * 100).toFixed(0) : "-"}%`}
        />
        <Stat
          label="Crowding"
          value={`${st.n ? st.avgCrowd.toFixed(1) : "-"}/5`}
        />
        <Stat
          label="Ride time"
          value={`${st.n ? st.avgOnboard.toFixed(1) : "-"} min`}
        />
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => onSelect && onSelect(plan)}
          className="px-3 py-2 rounded-xl border bg-white hover:bg-slate-50 text-sm"
        >
          Preview on map
        </button>
        <div className="flex items-center gap-3">
          <Stars onChange={(n) => onRate && onRate(n)} />
          <span className="text-xs text-slate-500">Quick rate</span>
        </div>
      </div>
    </div>
  );
}
