"use client";

import { useEffect, useRef } from "react";
import { useTheme } from "next-themes";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";

const PHILADELPHIA_CENTER: [number, number] = [39.9526, -75.1652];
const DEFAULT_ZOOM = 12;

const TILE_LAYERS = {
  light: {
    url: "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>',
  },
  dark: {
    url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>',
  },
};

// Custom cluster icon styled to match the app
function createClusterIcon(cluster: L.MarkerCluster) {
  const count = cluster.getChildCount();
  let size = 32;
  let fontSize = 12;
  if (count >= 10) { size = 38; fontSize = 13; }
  if (count >= 25) { size = 44; fontSize = 14; }

  return L.divIcon({
    className: "",
    html: `<div style="
      display: flex;
      align-items: center;
      justify-content: center;
      width: ${size}px;
      height: ${size}px;
      background: rgba(34, 107, 60, 0.85);
      border: 2px solid white;
      border-radius: 50%;
      box-shadow: 0 2px 6px rgba(0,0,0,0.3);
      color: white;
      font-weight: 700;
      font-size: ${fontSize}px;
      font-family: system-ui, sans-serif;
    ">${count}</div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

export type Submission = {
  id: string;
  latitude: number;
  longitude: number;
  street_address: string | null;
  overall_suitability: string | null;
  created_at: string;
  notes: string | null;
};

type SubmissionsMapProps = {
  submissions: Submission[];
  height?: string;
  showCanopy?: boolean;
  defaultZoom?: number;
};

const suitabilityConfig: Record<string, { color: string; label: string }> = {
  "Likely Suitable": { color: "#22c55e", label: "Likely Suitable" },
  "Possibly Suitable": { color: "#eab308", label: "Possibly Suitable" },
  "Likely Unsuitable": { color: "#ef4444", label: "Likely Unsuitable" },
};

function createColoredIcon(suitability: string | null) {
  const config = suitabilityConfig[suitability ?? ""] ?? {
    color: "#6b7280",
    label: "Unknown",
  };

  return L.divIcon({
    className: "",
    html: `<div style="
      display: flex;
      align-items: center;
      justify-content: center;
      width: 22px;
      height: 22px;
      background: ${config.color};
      border: 2px solid white;
      border-radius: 50%;
      box-shadow: 0 1px 3px rgba(0,0,0,0.3);
      font-size: 11px;
      line-height: 1;
    ">🌳</div>`,
    iconSize: [22, 22],
    iconAnchor: [11, 11],
    popupAnchor: [0, -13],
  });
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function buildPopupHtml(submission: Submission, isDark: boolean) {
  const color =
    suitabilityConfig[submission.overall_suitability ?? ""]?.color ?? "#6b7280";
  const textColor = isDark ? "#e5e5e5" : "#1a1a1a";
  const mutedColor = isDark ? "#a3a3a3" : "#666";
  const bgColor = isDark ? "#262626" : "#fff";
  const notesHtml = submission.notes
    ? `<p style="margin:6px 0 0;font-size:0.8em;color:${mutedColor};font-style:italic">${
        submission.notes.length > 100
          ? submission.notes.slice(0, 100) + "..."
          : submission.notes
      }</p>`
    : "";

  return `<div style="min-width:180px;color:${textColor};background:${bgColor};margin:-13px -20px;padding:12px 16px;border-radius:8px">
    <p style="font-weight:600;margin:0 0 4px">${submission.street_address || "No address"}</p>
    <p style="margin:0 0 4px;font-size:0.85em">
      <span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:${color};margin-right:6px;vertical-align:middle"></span>
      ${submission.overall_suitability ?? "Not rated"}
    </p>
    <p style="margin:0;font-size:0.8em;color:${mutedColor}">${formatDate(submission.created_at)}</p>
    ${notesHtml}
    <a href="/protected/submission/${submission.id}" style="display:inline-block;margin-top:8px;font-size:0.8em;color:${isDark ? "#93c5fd" : "#2563eb"};text-decoration:none;font-weight:500">View details →</a>
  </div>`;
}

const CANOPY_COLORS: Record<string, string> = {
  very_low: "#ef4444",
  low: "#f97316",
  moderate: "#eab308",
  good: "#22c55e",
  high: "#15803d",
};

export function SubmissionsMap({
  submissions,
  height = "400px",
  showCanopy = false,
  defaultZoom,
}: SubmissionsMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const canopyLayerRef = useRef<L.GeoJSON | null>(null);
  const { resolvedTheme } = useTheme();

  const isDark = resolvedTheme === "dark";

  // Initialize map
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const center: [number, number] =
      submissions.length === 1
        ? [submissions[0].latitude, submissions[0].longitude]
        : PHILADELPHIA_CENTER;

    const map = L.map(containerRef.current, {
      zoomControl: false,
      maxZoom: 19,
    }).setView(center, defaultZoom ?? DEFAULT_ZOOM);
    mapRef.current = map;

    // Add zoom control to bottom-right
    L.control.zoom({ position: "bottomright" }).addTo(map);

    // Create marker cluster group
    const clusterGroup = L.markerClusterGroup({
      iconCreateFunction: createClusterIcon,
      maxClusterRadius: 50,
      spiderfyOnMaxZoom: true,
      showCoverageOnHover: false,
      zoomToBoundsOnClick: true,
      animate: true,
    });

    for (const submission of submissions) {
      const marker = L.marker([submission.latitude, submission.longitude], {
        icon: createColoredIcon(submission.overall_suitability),
      }).bindPopup(buildPopupHtml(submission, isDark));

      clusterGroup.addLayer(marker);
    }

    map.addLayer(clusterGroup);

    return () => {
      map.remove();
      mapRef.current = null;
      tileLayerRef.current = null;
      canopyLayerRef.current = null;
    };
  }, [submissions, defaultZoom, isDark]);

  // Swap tile layer when theme changes
  useEffect(() => {
    if (!mapRef.current) return;

    if (tileLayerRef.current) {
      tileLayerRef.current.remove();
    }

    const tiles = isDark ? TILE_LAYERS.dark : TILE_LAYERS.light;
    tileLayerRef.current = L.tileLayer(tiles.url, {
      attribution: tiles.attribution,
      maxZoom: 19,
    }).addTo(mapRef.current);
  }, [isDark, submissions]);

  // Toggle canopy overlay
  useEffect(() => {
    if (!mapRef.current) return;

    if (!showCanopy) {
      if (canopyLayerRef.current) {
        canopyLayerRef.current.remove();
        canopyLayerRef.current = null;
      }
      return;
    }

    // Already loaded
    if (canopyLayerRef.current) return;

    fetch("/data/philly-neighborhoods.geojson")
      .then((res) => res.json())
      .then((geojson) => {
        if (!mapRef.current || !showCanopy) return;

        canopyLayerRef.current = L.geoJSON(geojson, {
          style: (feature) => {
            const tier = feature?.properties?.canopy_tier ?? "moderate";
            return {
              fillColor: CANOPY_COLORS[tier] ?? CANOPY_COLORS.moderate,
              fillOpacity: 0.25,
              color: isDark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.15)",
              weight: 1,
            };
          },
          onEachFeature: (feature, layer) => {
            const props = feature.properties;
            layer.bindTooltip(
              `<strong>${props.MAPNAME}</strong><br/>Canopy: ${props.canopy_label}`,
              { sticky: true }
            );
          },
        }).addTo(mapRef.current);
      });
  }, [showCanopy, isDark]);

  return (
    <div
      ref={containerRef}
      style={{ height, width: "100%", borderRadius: "0.75rem", overflow: "hidden" }}
    />
  );
}
