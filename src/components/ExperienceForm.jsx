import React, { useState } from "react";
import { Stars } from "./UIComponents";

export default function ExperienceForm({ plans, onSubmit }) {
  const [planId, setPlanId] = useState(plans[0]?.id || "");
  const [waitMin, setWaitMin] = useState(8);
  const [onboardMin, setOnboardMin] = useState(12);
  const [crowd, setCrowd] = useState(3);
  const [onTime, setOnTime] = useState(true);
  const [rating, setRating] = useState(4);
  const [comment, setComment] = useState("");

  const submit = (e) => {
    e.preventDefault();
    if (!planId) return alert("Select a plan");
    onSubmit({
      planId,
      waitMin: Number(waitMin) || 0,
      onboardMin: Number(onboardMin) || 0,
      crowd: Number(crowd) || 3,
      onTime: !!onTime,
      rating: Number(rating) || 3,
      comment,
      user: "you",
    });
    setComment("");
  };

  return (
    <form
      onSubmit={submit}
      className="rounded-2xl p-4 border bg-white space-y-4"
    >
      <div className="grid md:grid-cols-3 gap-3">
        <select
          className="px-3 py-2 rounded-xl border"
          value={planId}
          onChange={(e) => setPlanId(e.target.value)}
        >
          {plans.map((p) => (
            <option key={p.id} value={p.id}>
              {p.title}
            </option>
          ))}
        </select>
        <div className="grid grid-cols-2 gap-2">
          <input
            className="px-3 py-2 rounded-xl border"
            type="number"
            min="0"
            placeholder="Wait (min)"
            value={waitMin}
            onChange={(e) => setWaitMin(e.target.value)}
          />
          <input
            className="px-3 py-2 rounded-xl border"
            type="number"
            min="0"
            placeholder="Ride (min)"
            value={onboardMin}
            onChange={(e) => setOnboardMin(e.target.value)}
          />
        </div>
        <div className="grid grid-cols-2 gap-2 items-center">
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-600">Crowd</span>
            <input
              className="px-3 py-2 rounded-xl border w-20"
              type="number"
              min="1"
              max="5"
              value={crowd}
              onChange={(e) => setCrowd(e.target.value)}
            />
          </div>
          <label className="flex items-center gap-2 text-sm text-slate-600">
            <input
              type="checkbox"
              checked={onTime}
              onChange={(e) => setOnTime(e.target.checked)}
            />{" "}
            On time
          </label>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-3 items-center">
        <div className="flex items-center gap-3">
          <span className="text-sm text-slate-600">Your rating</span>{" "}
          <Stars value={rating} onChange={setRating} />
        </div>
        <input
          className="px-3 py-2 rounded-xl border md:col-span-2"
          placeholder="Comment (optional)"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          className="px-4 py-2 rounded-xl bg-slate-900 text-white"
        >
          Log experience
        </button>
      </div>

      <p className="text-xs text-slate-500">
        We record your trip locally in your browser for this MVP. In production,
        this would be anonymized and stored securely.
      </p>
    </form>
  );
}
