import React, { useRef, useEffect } from "react";
import { campusCenter, landmarks } from "../data/constants";
import { coordOf, icon } from "../utils/mapHelpers";

export default function MapView({
  selectedPlan,
  qOrigin,
  qDest,
  showStops,
  onReset,
}) {
  const mapRef = useRef(null);
  const layerRef = useRef({ markers: [], lines: [] });

  useEffect(() => {
    if (mapRef.current) return;
    const map = L.map("map", {
      zoomControl: true,
      preferCanvas: true,
    }).setView(campusCenter, 14);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: "&copy; OpenStreetMap contributors",
    }).addTo(map);

    const Legend = L.Control.extend({
      onAdd: function () {
        const div = L.DomUtil.create(
          "div",
          "legend bg-white/90 rounded-xl p-2 shadow border"
        );
        div.innerHTML = `<div class="font-semibold text-sm mb-1">Map</div>
          <div class="text-xs text-slate-700">• Dark markers: selected plan legs</div>
          <div class="text-xs text-slate-700">• Gray markers: known RTS stops</div>`;
        return div;
      },
      onRemove: function () {},
    });
    new Legend({ position: "bottomleft" }).addTo(map);

    mapRef.current = map;
  }, []);

  function clearLayers() {
    const map = mapRef.current;
    if (!map) return;
    const { markers, lines } = layerRef.current;
    markers.forEach((m) => map.removeLayer(m));
    lines.forEach((l) => map.removeLayer(l));
    layerRef.current.markers = [];
    layerRef.current.lines = [];
  }

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    clearLayers();

    const bounds = L.latLngBounds([]);

    if (showStops) {
      for (const [name, info] of Object.entries(landmarks)) {
        const m = L.marker([info.lat, info.lng], {
          icon: icon("#475569"),
        }).addTo(map);
        m.bindPopup(
          `<div class='text-sm font-medium'>${name}</div><div class='text-xs text-slate-600'>${info.type}</div>`
        );
        layerRef.current.markers.push(m);
        bounds.extend([info.lat, info.lng]);
      }
    }

    let drewSomething = false;

    if (selectedPlan) {
      selectedPlan.legs.forEach((leg, idx) => {
        const a = coordOf(leg.from);
        const b = coordOf(leg.to);
        if (a) {
          const ma = L.marker(a, { icon: icon("#0f172a") }).addTo(map);
          ma.bindPopup(
            `<div class='text-sm font-medium'>${
              leg.from
            }</div><div class='text-xs'>Route ${leg.route || ""}</div>`
          );
          layerRef.current.markers.push(ma);
          bounds.extend(a);
          drewSomething = true;
        }
        if (b) {
          const mb = L.marker(b, { icon: icon("#0f172a") }).addTo(map);
          mb.bindPopup(
            `<div class='text-sm font-medium'>${
              leg.to
            }</div><div class='text-xs'>Route ${leg.route || ""}</div>`
          );
          layerRef.current.markers.push(mb);
          bounds.extend(b);
          drewSomething = true;
        }
        if (a && b) {
          const line = L.polyline([a, b], {
            weight: 4,
            opacity: 0.8,
          }).addTo(map);
          layerRef.current.lines.push(line);
        }
      });
    } else {
      const a = coordOf(qOrigin);
      const b = coordOf(qDest);
      if (a) {
        const m = L.marker(a, { icon: icon("#0f172a") }).addTo(map);
        layerRef.current.markers.push(m);
        bounds.extend(a);
        drewSomething = true;
      }
      if (b) {
        const m = L.marker(b, { icon: icon("#0f172a") }).addTo(map);
        layerRef.current.markers.push(m);
        bounds.extend(b);
        drewSomething = true;
      }
      if (a && b) {
        const line = L.polyline([a, b], {
          weight: 4,
          opacity: 0.8,
        }).addTo(map);
        layerRef.current.lines.push(line);
      }
    }

    if (drewSomething) {
      map.fitBounds(bounds.pad(0.2));
    } else {
      map.setView(campusCenter, 14);
    }

    setTimeout(() => map.invalidateSize(), 50);
  }, [selectedPlan, qOrigin, qDest, showStops]);

  return (
    <div className="rounded-2xl border bg-white overflow-hidden">
      <div className="flex items-center justify-between px-3 py-2 border-b bg-slate-50">
        <div className="font-semibold">RTS Map (demo)</div>
        <div className="flex items-center gap-3 text-sm">
          <label className="flex items-center gap-2 text-slate-600">
            <input
              type="checkbox"
              checked={showStops}
              onChange={(e) =>
                onReset({ type: "toggleStops", value: e.target.checked })
              }
            />{" "}
            Show known stops
          </label>
          <button
            className="px-3 py-1.5 rounded-xl border bg-white hover:bg-slate-100"
            onClick={() => onReset({ type: "reset" })}
          >
            Reset view
          </button>
        </div>
      </div>
      <div id="map"></div>
      <div className="p-3 text-xs text-slate-500 border-t">
        Shapes are straight segments between selected stops for demo purposes.
        Replace with GTFS shapes to follow street geometry.
      </div>
    </div>
  );
}
