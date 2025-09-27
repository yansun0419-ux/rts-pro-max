import { useState, useEffect } from "react";
import { load, save, uid } from "../utils/helpers";
import { ensureSeed } from "../data/seed";

export function useData() {
  const [plans, setPlans] = useState(load("ufx_plans", []));
  const [ratings, setRatings] = useState(load("ufx_ratings", []));
  const [exps, setExps] = useState(load("ufx_exps", []));

  useEffect(() => {
    ensureSeed();
    setPlans(load("ufx_plans", []));
    setRatings(load("ufx_ratings", []));
    setExps(load("ufx_exps", []));
  }, []);

  useEffect(() => {
    save("ufx_plans", plans);
  }, [plans]);

  useEffect(() => {
    save("ufx_ratings", ratings);
  }, [ratings]);

  useEffect(() => {
    save("ufx_exps", exps);
  }, [exps]);

  const addPlan = (p) =>
    setPlans((prev) => [{ ...p, id: uid(), createdAt: Date.now() }, ...prev]);

  const addRating = (r) =>
    setRatings((prev) => [{ ...r, id: uid(), createdAt: Date.now() }, ...prev]);

  const addExp = (e) =>
    setExps((prev) => [{ ...e, id: uid(), createdAt: Date.now() }, ...prev]);

  return { plans, ratings, exps, addPlan, addRating, addExp };
}
