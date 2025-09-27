import { uid, load, save } from "../utils/helpers";

const seedPlans = [
  {
    id: uid(),
    title: "Reitz → Butler Plaza (morning)",
    origin: "Reitz Union",
    destination: "Butler Plaza",
    days: ["Mon", "Tue", "Wed", "Thu", "Fri"],
    departWindow: "08:00-09:30",
    legs: [
      {
        route: "34",
        from: "Reitz Union",
        to: "Butler Plaza Transfer",
        notes: "~10-12 min headway at peak",
      },
    ],
    author: "demo@ufl.edu",
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 3,
  },
  {
    id: uid(),
    title: "Broward → New Engineering Bldg (class rush)",
    origin: "Broward Hall",
    destination: "New Engineering Building",
    days: ["Mon", "Wed", "Fri"],
    departWindow: "10:10-10:40",
    legs: [
      {
        route: "9",
        from: "Broward Area",
        to: "Hub",
        notes: "Short hop; walk 5-7 min",
      },
    ],
    author: "alex@ufl.edu",
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 2,
  },
  {
    id: uid(),
    title: "Shands → Newell (afternoon labs)",
    origin: "UF Health Shands",
    destination: "Newell Hall",
    days: ["Tue", "Thu"],
    departWindow: "15:00-16:30",
    legs: [
      {
        route: "20",
        from: "Shands",
        to: "Tigert / Newell",
        notes: "Often crowded; try front car",
      },
    ],
    author: "maya@ufl.edu",
    createdAt: Date.now() - 1000 * 60 * 60 * 36,
  },
];

const seedRatings = [
  {
    id: uid(),
    planId: seedPlans[0].id,
    rating: 5,
    comment: "Consistent timing.",
    user: "u1",
    createdAt: Date.now() - 1000 * 60 * 60 * 10,
  },
  {
    id: uid(),
    planId: seedPlans[0].id,
    rating: 4,
    comment: "Crowded on Fri.",
    user: "u2",
    createdAt: Date.now() - 1000 * 60 * 60 * 9,
  },
  {
    id: uid(),
    planId: seedPlans[1].id,
    rating: 3,
    comment: "OK but tight transfer.",
    user: "u3",
    createdAt: Date.now() - 1000 * 60 * 60 * 5,
  },
  {
    id: uid(),
    planId: seedPlans[2].id,
    rating: 5,
    comment: "Great for labs.",
    user: "u4",
    createdAt: Date.now() - 1000 * 60 * 60 * 8,
  },
];

const seedExperiences = [
  {
    id: uid(),
    planId: seedPlans[0].id,
    waitMin: 8,
    onboardMin: 14,
    crowd: 4,
    onTime: true,
    rating: 5,
    comment: "Smooth ride",
    user: "u1",
    createdAt: Date.now() - 1000 * 60 * 60 * 24,
  },
  {
    id: uid(),
    planId: seedPlans[0].id,
    waitMin: 12,
    onboardMin: 16,
    crowd: 5,
    onTime: true,
    rating: 4,
    comment: "Full bus",
    user: "u2",
    createdAt: Date.now() - 1000 * 60 * 60 * 20,
  },
  {
    id: uid(),
    planId: seedPlans[1].id,
    waitMin: 9,
    onboardMin: 6,
    crowd: 3,
    onTime: false,
    rating: 3,
    comment: "Tight xfer",
    user: "u3",
    createdAt: Date.now() - 1000 * 60 * 60 * 15,
  },
  {
    id: uid(),
    planId: seedPlans[2].id,
    waitMin: 6,
    onboardMin: 12,
    crowd: 2,
    onTime: true,
    rating: 5,
    comment: "Perfect",
    user: "u4",
    createdAt: Date.now() - 1000 * 60 * 60 * 12,
  },
];

export function ensureSeed() {
  const has = load("ufx_plans", null);
  if (!has || !Array.isArray(has) || has.length === 0)
    save("ufx_plans", seedPlans);
  const rs = load("ufx_ratings", null);
  if (!rs || !Array.isArray(rs) || rs.length === 0)
    save("ufx_ratings", seedRatings);
  const ex = load("ufx_exps", null);
  if (!ex || !Array.isArray(ex) || ex.length === 0)
    save("ufx_exps", seedExperiences);
}
