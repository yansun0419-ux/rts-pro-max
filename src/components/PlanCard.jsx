import React from "react";
import { Chip, Stars, Stat } from "./UIComponents";
import { bayesScore, planStats } from "../utils/helpers";

export default function PlanCard({
  plan,
  ratings,
  exps,
  onRate,
  onSelect,
  showHistory = false, // 新增的属性
}) {
  const rts = ratings.filter((r) => r.planId === plan.id);
  const avg = rts.length
    ? rts.reduce((s, r) => s + r.rating, 0) / rts.length
    : 0;
  const score = bayesScore(rts);
  const st = planStats(plan.id, exps);

  // 新增的评分分布计算逻辑
  const total = rts.length || 0;
  const dist = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  rts.forEach((r) => {
    dist[r.rating] = (dist[r.rating] || 0) + 1;
  });

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

      {/* 历史评分分布：只在选了起终点时展示 */}
      {showHistory && (
        <div className="rounded-xl p-3 border bg-slate-50">
          <div className="text-sm font-medium mb-1">历史用户评分</div>
          <div className="space-y-1">
            {[5, 4, 3, 2, 1].map((s) => {
              const cnt = dist[s] || 0;
              const pct = total ? (cnt / total) * 100 : 0;
              return (
                <div key={s} className="flex items-center gap-2 text-xs">
                  <span className="w-8">{s}★</span>
                  <div className="flex-1 h-2 bg-white rounded-full overflow-hidden border">
                    <div
                      className="h-full bg-slate-900"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="w-10 text-right">{cnt}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

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