import React, { useState, useEffect, useMemo } from "react";
import { useData } from "./hooks/useData";
import { textSim, bayesScore, planFeatures } from "./utils/helpers";
import { trainTinyModel, loadModel } from "./utils/ml";
import { knownNames } from "./data/constants";
import PlanCard from "./components/PlanCard";
import ExperienceForm from "./components/ExperienceForm";
import InsightCard from "./components/InsightCard";
import MapView from "./components/MapView";
import { DaysPicker } from "./components/UIComponents";

export default function App() {
  const { plans, ratings, exps, addPlan, addRating, addExp } = useData();
  const [tab, setTab] = useState("explore");
  const [qOrigin, setQOrigin] = useState("");
  const [qDest, setQDest] = useState("");
  const [qTime, setQTime] = useState("");
  const [form, setForm] = useState({
    title: "",
    origin: "",
    destination: "",
    days: [],
    departWindow: "08:00-09:00",
    legs: [{ route: "", from: "", to: "", notes: "" }],
    author: "you@ufl.edu",
  });
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showStops, setShowStops] = useState(true);
  const [model, setModel] = useState(null);
  const [training, setTraining] = useState(false);
  const [modelMsg, setModelMsg] = useState("");

  useEffect(() => {
    (async () => {
      const m = await loadModel();
      if (m) setModel(m);
    })();
  }, []);

  const filtered = useMemo(() => {
    const scored = plans.map((p) => {
      const s1 = textSim(qOrigin, p.origin);
      const s2 = textSim(qDest, p.destination);
      const tBoost =
        qTime && p.departWindow.includes(qTime.split("-")[0].slice(0, 2))
          ? 0.1
          : 0;
      const rs = ratings.filter((r) => r.planId === p.id);
      const conf = bayesScore(rs);
      const f = planFeatures(p, exps);
      const ml =
        (1 - f.avgWaitN) * 0.5 + f.onTimeN * 0.3 + (1 - f.avgCrowdN) * 0.2;
      const composite = (s1 + s2) / 2 + conf / 10 + tBoost + ml * 0.4;
      return { p, rs, conf, composite };
    });
    return scored.sort((a, b) => b.composite - a.composite);
  }, [plans, ratings, exps, qOrigin, qDest, qTime, model]);

  const myPlans = useMemo(
    () => plans.filter((p) => p.author === "you@ufl.edu"),
    [plans]
  );

  const handleAddLeg = () =>
    setForm((f) => ({
      ...f,
      legs: [...f.legs, { route: "", from: "", to: "", notes: "" }],
    }));

  const handleRemoveLeg = (idx) =>
    setForm((f) => ({ ...f, legs: f.legs.filter((_, i) => i !== idx) }));

  const submitPlan = (e) => {
    e.preventDefault();
    const cleanLegs = form.legs.filter((l) => l.from && l.to);
    if (
      !form.title ||
      !form.origin ||
      !form.destination ||
      cleanLegs.length === 0
    )
      return alert(
        "Please fill title, origin, destination, and at least one leg."
      );
    const plan = {
      id: "",
      title: form.title.trim(),
      origin: form.origin.trim(),
      destination: form.destination.trim(),
      days: form.days,
      departWindow: form.departWindow,
      legs: cleanLegs,
      author: form.author.trim(),
      createdAt: Date.now(),
    };
    addPlan(plan);
    setForm({
      title: "",
      origin: "",
      destination: "",
      days: [],
      departWindow: "08:00-09:00",
      legs: [{ route: "", from: "", to: "", notes: "" }],
      author: form.author,
    });
    setTab("explore");
  };

  const onRate = (planId, n) => {
    addRating({
      id: "",
      planId,
      rating: n,
      comment: "",
      user: "anon",
      createdAt: Date.now(),
    });
  };

  const onLogExp = (e) => {
    addExp(e);
    addRating({
      id: "",
      planId: e.planId,
      rating: e.rating,
      comment: e.comment || "",
      user: e.user || "you",
      createdAt: Date.now(),
    });
  };

  const doTrain = async () => {
    setTraining(true);
    setModelMsg("");
    try {
      const m = await trainTinyModel(exps);
      setModel(m);
      setModelMsg(
        `Model trained on ${exps.length} experiences and saved to localStorage.`
      );
    } catch (err) {
      setModelMsg(err.message || String(err));
    } finally {
      setTraining(false);
    }
  };

  const handleMapReset = ({ type, value }) => {
    if (type === "reset") setSelectedPlan(null);
    if (type === "toggleStops") setShowStops(!!value);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-10 bg-white/90 backdrop-blur border-b">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-slate-900 text-white grid place-items-center text-sm">
              UF
            </div>
            <div>
              <h1 className="font-bold leading-tight">UF Transit Optimizer</h1>
              <p className="text-xs text-slate-500 -mt-0.5">
                Crowd-sourced trip logs + ratings + ML scoring + map
              </p>
            </div>
          </div>
          <nav className="flex flex-wrap items-center gap-2 text-sm">
            {[
              { k: "explore", t: "Explore" },
              { k: "new", t: "Add Plan" },
              { k: "log", t: "Log Experience" },
              { k: "analytics", t: "Analytics" },
              { k: "mine", t: "My Plans" },
            ].map((x) => (
              <button
                key={x.k}
                onClick={() => setTab(x.k)}
                className={`px-3 py-1.5 rounded-xl border ${
                  tab === x.k
                    ? "bg-slate-900 text-white border-slate-900"
                    : "bg-white hover:bg-slate-100"
                }`}
              >
                {x.t}
              </button>
            ))}
          </nav>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6">
        {tab === "explore" && (
          <section className="space-y-4">
            <div className="rounded-2xl p-4 border bg-white">
              <div className="grid md:grid-cols-5 gap-3">
                <div className="relative">
                  <input
                    list="landmark-list"
                    className="px-3 py-2 rounded-xl border w-full"
                    placeholder="Origin (e.g., Reitz Union)"
                    value={qOrigin}
                    onChange={(e) => setQOrigin(e.target.value)}
                  />
                </div>
                <div className="relative">
                  <input
                    list="landmark-list"
                    className="px-3 py-2 rounded-xl border w-full"
                    placeholder="Destination (e.g., Shands)"
                    value={qDest}
                    onChange={(e) => setQDest(e.target.value)}
                  />
                </div>
                <input
                  className="px-3 py-2 rounded-xl border"
                  placeholder="Time window (optional: 08:00-09:00)"
                  value={qTime}
                  onChange={(e) => setQTime(e.target.value)}
                />
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <span>{filtered.length} match(es)</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={doTrain}
                    disabled={training}
                    className="px-3 py-2 rounded-xl border bg-white hover:bg-slate-50 disabled:opacity-50"
                  >
                    {training ? "Training..." : "Train model"}
                  </button>
                  {model && (
                    <span className="text-xs text-green-700">model ✔</span>
                  )}
                </div>
              </div>
              <p className="text-xs text-slate-500 mt-2">
                Ranking uses text similarity + rating confidence +
                wait/crowding/on-time heuristic. If you train the tiny model,
                its signal is blended in.
              </p>
              {modelMsg && (
                <div className="mt-2 text-xs text-slate-600">{modelMsg}</div>
              )}
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <div className="order-2 lg:order-1 grid gap-4">
                {filtered.map(({ p }) => (
                  <PlanCard
                    key={p.id}
                    plan={p}
                    ratings={ratings}
                    exps={exps}
                    onRate={(n) => onRate(p.id, n)}
                    onSelect={(plan) => setSelectedPlan(plan)}
                  />
                ))}

                <div className="rounded-2xl p-4 border bg-white">
                  <div className="font-semibold mb-2">
                    Operational insights (auto)
                  </div>
                  <div className="grid gap-2">
                    {plans.map((p) => (
                      <InsightCard key={p.id} plan={p} exps={exps} />
                    ))}
                  </div>
                </div>
              </div>

              <div className="order-1 lg:order-2">
                <MapView
                  selectedPlan={selectedPlan}
                  qOrigin={qOrigin}
                  qDest={qDest}
                  showStops={showStops}
                  onReset={handleMapReset}
                />
              </div>
            </div>
          </section>
        )}

        {tab === "new" && (
          <section>
            <form
              onSubmit={submitPlan}
              className="rounded-2xl p-4 border bg-white space-y-4"
            >
              <div className="grid md:grid-cols-2 gap-3">
                <input
                  className="px-3 py-2 rounded-xl border"
                  placeholder="Title (e.g., Reitz → Butler fast AM)"
                  value={form.title}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, title: e.target.value }))
                  }
                />
                <input
                  className="px-3 py-2 rounded-xl border"
                  placeholder="Author (email or nickname)"
                  value={form.author}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, author: e.target.value }))
                  }
                />
                <input
                  list="landmark-list"
                  className="px-3 py-2 rounded-xl border"
                  placeholder="Origin"
                  value={form.origin}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, origin: e.target.value }))
                  }
                />
                <input
                  list="landmark-list"
                  className="px-3 py-2 rounded-xl border"
                  placeholder="Destination"
                  value={form.destination}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      destination: e.target.value,
                    }))
                  }
                />
                <input
                  className="px-3 py-2 rounded-xl border"
                  placeholder="Depart window (HH:MM-HH:MM)"
                  value={form.departWindow}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      departWindow: e.target.value,
                    }))
                  }
                />
                <DaysPicker
                  value={form.days}
                  onChange={(days) => setForm((f) => ({ ...f, days }))}
                />
              </div>

              <div className="space-y-3">
                <div className="font-medium">Legs</div>
                {form.legs.map((leg, idx) => (
                  <div key={idx} className="grid md:grid-cols-4 gap-2">
                    <input
                      className="px-3 py-2 rounded-xl border"
                      placeholder="Route (optional)"
                      value={leg.route}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          legs: f.legs.map((L, i) =>
                            i === idx ? { ...L, route: e.target.value } : L
                          ),
                        }))
                      }
                    />
                    <input
                      list="landmark-list"
                      className="px-3 py-2 rounded-xl border"
                      placeholder="From stop/landmark"
                      value={leg.from}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          legs: f.legs.map((L, i) =>
                            i === idx ? { ...L, from: e.target.value } : L
                          ),
                        }))
                      }
                    />
                    <input
                      list="landmark-list"
                      className="px-3 py-2 rounded-xl border"
                      placeholder="To stop/landmark"
                      value={leg.to}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          legs: f.legs.map((L, i) =>
                            i === idx ? { ...L, to: e.target.value } : L
                          ),
                        }))
                      }
                    />
                    <input
                      className="px-3 py-2 rounded-xl border"
                      placeholder="Notes (crowding, tips, etc.)"
                      value={leg.notes}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          legs: f.legs.map((L, i) =>
                            i === idx ? { ...L, notes: e.target.value } : L
                          ),
                        }))
                      }
                    />
                  </div>
                ))}
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleAddLeg}
                    className="px-3 py-2 rounded-xl border bg-white hover:bg-slate-50"
                  >
                    + Add leg
                  </button>
                  {form.legs.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveLeg(form.legs.length - 1)}
                      className="px-3 py-2 rounded-xl border bg-white hover:bg-slate-50"
                    >
                      − Remove last
                    </button>
                  )}
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-slate-900 text-white"
                >
                  Publish Plan
                </button>
              </div>

              <p className="text-xs text-slate-500">
                Note: This demo stores your data in your browser only. In
                production we would anonymize and store aggregate travel
                patterns on a secure backend.
              </p>
            </form>
          </section>
        )}

        {tab === "log" && (
          <section className="space-y-4">
            <ExperienceForm plans={plans} onSubmit={onLogExp} />

            <div className="rounded-2xl p-4 border bg-white">
              <div className="font-semibold mb-2">Recent experiences</div>
              <div className="grid gap-2 text-sm">
                {exps.slice(0, 20).map((e) => {
                  const p = plans.find((pp) => pp.id === e.planId);
                  return (
                    <div
                      key={e.id}
                      className="flex flex-wrap items-center gap-3 py-2 border-b last:border-b-0"
                    >
                      <div className="font-medium">
                        {p?.title || "(deleted plan)"}
                      </div>
                      <Chip>Wait {e.waitMin}m</Chip>
                      <Chip>Ride {e.onboardMin}m</Chip>
                      <Chip>Crowd {e.crowd}/5</Chip>
                      <Chip>{e.onTime ? "On-time" : "Late"}</Chip>
                      <Chip>⭐ {e.rating}</Chip>
                      {e.comment && (
                        <span className="text-slate-500">· {e.comment}</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {tab === "analytics" && (
          <section className="space-y-4">
            <div className="rounded-2xl p-4 border bg-white">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <div className="font-semibold">Model training</div>
                  <div className="text-sm text-slate-600">
                    Tiny 1-hidden-layer NN on your local experiences → predicts
                    satisfaction (0..1).
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={doTrain}
                    disabled={training}
                    className="px-3 py-2 rounded-xl border bg-white hover:bg-slate-50 disabled:opacity-50"
                  >
                    {training ? "Training..." : "Train / Retrain"}
                  </button>
                  {model && (
                    <span className="text-xs text-green-700">model ✔</span>
                  )}
                </div>
              </div>
              {modelMsg && (
                <div className="mt-2 text-xs text-slate-600">{modelMsg}</div>
              )}
            </div>

            <div className="rounded-2xl p-4 border bg-white">
              <div className="font-semibold mb-2">
                Predicted satisfaction by plan (heuristic shown)
              </div>
              <div className="grid gap-3">
                {plans.map((p) => {
                  const f = planFeatures(p, exps);
                  const approx =
                    (1 - f.avgWaitN) * 0.5 +
                    f.onTimeN * 0.3 +
                    (1 - f.avgCrowdN) * 0.2;
                  return (
                    <div key={p.id} className="flex items-center gap-3 text-sm">
                      <div className="w-60 truncate font-medium">{p.title}</div>
                      <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-slate-900"
                          style={{
                            width: `${Math.round(100 * approx)}%`,
                          }}
                        ></div>
                      </div>
                      <div className="w-14 text-right">
                        {Math.round(100 * approx)}%
                      </div>
                      <div className="text-xs text-slate-500">
                        (blend is used in ranking)
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="rounded-2xl p-4 border bg-white">
              <div className="font-semibold mb-1">What to add next</div>
              <ul className="list-disc pl-5 space-y-1 text-sm text-slate-700">
                <li>
                  Import UF RTS GTFS (routes/stops/shapes) to validate legs &
                  auto-suggest stops.
                </li>
                <li>
                  Use GTFS-Realtime for live arrivals and crowding signals.
                </li>
                <li>
                  Trust model: weigh ratings by rater reputation & recency;
                  detect outliers/brigading.
                </li>
                <li>
                  Privacy: anonymize & aggregate usage; opt-in geolocation with
                  differential privacy.
                </li>
                <li>
                  Back-end scorer API (Python/FastAPI + PyTorch/TF) for robust
                  training & inference.
                </li>
              </ul>
            </div>
          </section>
        )}

        {tab === "mine" && (
          <section className="space-y-4">
            <div className="rounded-2xl p-4 border bg-white">
              <div className="text-sm text-slate-600 mb-2">
                Showing plans authored by{" "}
                <span className="font-medium">you@ufl.edu</span> (change in the
                Add Plan form).
              </div>
              <div className="grid gap-4">
                {myPlans.length === 0 && (
                  <div className="text-slate-500">
                    No plans yet. Create one in{" "}
                    <button className="underline" onClick={() => setTab("new")}>
                      Add Plan
                    </button>
                    .
                  </div>
                )}
                {myPlans.map((p) => (
                  <PlanCard
                    key={p.id}
                    plan={p}
                    ratings={ratings}
                    exps={exps}
                    onRate={(n) => onRate(p.id, n)}
                    onSelect={(plan) => setSelectedPlan(plan)}
                  />
                ))}
              </div>
            </div>
          </section>
        )}

        <section className="mt-6 text-sm text-slate-600">
          <div className="rounded-2xl p-4 border bg-white">
            <div className="font-semibold mb-1">MVP recap</div>
            <ul className="list-disc pl-5 space-y-1">
              <li>User-generated route proposals with multi-leg structure</li>
              <li>Trip experience logging (wait, crowding, on-time, rating)</li>
              <li>
                Bayesian smoothing for ratings + heuristic/ML blended ranking
              </li>
              <li>
                Local-first prototype (no backend); model saved to localStorage
              </li>
              <li>
                Auto insights to flag peak mismatch (long wait, low on-time,
                high crowding)
              </li>
              <li>New: Leaflet map with RTS stops + plan leg preview</li>
            </ul>
          </div>
        </section>

        <datalist id="landmark-list">
          {knownNames.map((n) => (
            <option key={n} value={n} />
          ))}
        </datalist>
      </main>

      <footer className="py-10 text-center text-xs text-slate-400">
        MVP • UF Transit Optimizer • v2 (experiences + tiny NN + map)
      </footer>
    </div>
  );
}
