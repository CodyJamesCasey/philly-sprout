"use client";

import { useEffect, useRef } from "react";
import { useTheme } from "next-themes";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

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
  </div>`;
}

export function SubmissionsMap({
  submissions,
  height = "400px",
}: SubmissionsMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const { resolvedTheme } = useTheme();

  const isDark = resolvedTheme === "dark";

  // Initialize map
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      zoomControl: false,
    }).setView(PHILADELPHIA_CENTER, DEFAULT_ZOOM);
    mapRef.current = map;

    // Add zoom control to bottom-right
    L.control.zoom({ position: "bottomright" }).addTo(map);

    for (const submission of submissions) {
      L.marker([submission.latitude, submission.longitude], {
        icon: createColoredIcon(submission.overall_suitability),
      })
        .addTo(map)
        .bindPopup(buildPopupHtml(submission, isDark));
    }

    return () => {
      map.remove();
      mapRef.current = null;
      tileLayerRef.current = null;
    };
  }, [submissions]);

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

  return (
    <div
      ref={containerRef}
      style={{ height, width: "100%", borderRadius: "0.75rem", overflow: "hidden" }}
    />
  );
}
