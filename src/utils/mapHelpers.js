import { landmarks } from "../data/constants";

export function coordOf(name) {
  const k = name?.trim();
  return k && landmarks[k] ? [landmarks[k].lat, landmarks[k].lng] : null;
}

export function icon(color = "#0f172a") {
  const svg = encodeURIComponent(
    `<?xml version="1.0"?><svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 28 28"><circle cx="14" cy="14" r="9" fill="${color}"/></svg>`
  );
  return L.icon({
    iconUrl: `data:image/svg+xml,${svg}`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });
}
