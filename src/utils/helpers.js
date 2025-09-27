export const uid = () => Math.random().toString(36).slice(2, 10);

export const load = (key, fallback) => {
  try {
    const v = localStorage.getItem(key);
    return v ? JSON.parse(v) : fallback;
  } catch {
    return fallback;
  }
};

export const save = (key, val) => {
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch {}
};

export const clamp = (x, lo, hi) => Math.min(hi, Math.max(lo, x));

export function textSim(a, b) {
  const A = new Set(
    (a || "")
      .toLowerCase()
      .split(/[^a-z0-9]+/)
      .filter(Boolean)
  );
  const B = new Set(
    (b || "")
      .toLowerCase()
      .split(/[^a-z0-9]+/)
      .filter(Boolean)
  );
  if (!A.size || !B.size) return 0;
  let inter = 0;
  A.forEach((x) => {
    if (B.has(x)) inter++;
  });
  return inter / Math.max(A.size, B.size);
}

export function bayesScore(ratings) {
  const n = ratings.length;
  if (!n) return 0;
  const sum = ratings.reduce((s, r) => s + r.rating, 0);
  const prior = 3.8;
  const weight = 2;
  return (sum + prior * weight) / (n + weight);
}

export function parseStartHour(win) {
  const m = /^(\d{2}):(\d{2})\s*-\s*(\d{2}):(\d{2})$/.exec((win || "").trim());
  if (!m) return 8;
  return parseInt(m[1], 10);
}

export function planStats(planId, exps) {
  const xs = exps.filter((e) => e.planId === planId);
  const n = xs.length;
  if (!n)
    return {
      n: 0,
      avgWait: 0,
      avgCrowd: 0,
      onTimeRate: 0,
      avgOnboard: 0,
    };
  const avgWait = xs.reduce((s, e) => s + e.waitMin, 0) / n;
  const avgCrowd = xs.reduce((s, e) => s + e.crowd, 0) / n;
  const avgOnboard = xs.reduce((s, e) => s + e.onboardMin, 0) / n;
  const onTimeRate = xs.reduce((s, e) => s + (e.onTime ? 1 : 0), 0) / n;
  return { n, avgWait, avgCrowd, onTimeRate, avgOnboard };
}

export function planFeatures(plan, exps) {
  const s = planStats(plan.id, exps);
  const h = parseStartHour(plan.departWindow);
  const f = {
    avgWaitN: clamp(s.avgWait / 30, 0, 1),
    avgCrowdN: clamp(s.avgCrowd / 5, 0, 1),
    onTimeN: clamp(s.onTimeRate, 0, 1),
    hourN: clamp(h / 23, 0, 1),
    avgOnboardN: clamp(s.avgOnboard / 40, 0, 1),
    samplesN: clamp(Math.log10(1 + s.n) / 2, 0, 1),
  };
  return f;
}
