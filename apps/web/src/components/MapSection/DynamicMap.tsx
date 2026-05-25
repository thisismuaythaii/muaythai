"use client";

import { useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { SITE_CONFIG } from "@repo/utils";
import { useRouter } from "next/navigation";
import { renderToString } from "react-dom/server";
import { X } from "lucide-react";

import phuketImg from "@/assets/phuket.jpg";
import bangkokImg from "@/assets/bangkok.jpg";
import chiangmaiImg from "@/assets/chiangmai.jpg";
import krabiImg from "@/assets/krabi.jpg";
import kohsamuiImg from "@/assets/kohsamui.jpg";

const locationImages: Record<string, any> = {
  Phuket: phuketImg,
  Bangkok: bangkokImg,
  "Chiang Mai": chiangmaiImg,
  Krabi: krabiImg,
  "Koh Samui": kohsamuiImg,
};

const REAL_COORDS: Record<string, [number, number]> = {
  "Chiang Mai": [18.7904, 98.9847],
  Bangkok: [13.7539, 100.5014],
  Phuket: [7.8906, 98.3981],
  Krabi: [8.085, 98.9063],
  "Koh Samui": [9.512, 100.0139],
};

// Build both icon variants once at module init — never again per render
const buildIcon = (isActive: boolean) => {
  const svg = renderToString(
    <X
      size={isActive ? 36 : 28}
      strokeWidth={isActive ? 3 : 2.5}
      color={isActive ? "hsl(16, 100%, 50%)" : "white"}
    />
  );
  return L.divIcon({
    className: "custom-leaflet-marker",
    html: `<div class="gta-marker ${isActive ? "active" : ""}">
             <div class="gta-x-icon">${svg}</div>
             ${isActive ? '<div class="gta-marker-pulse"></div>' : ""}
           </div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -16],
  });
};

// Computed once when the module loads — zero cost per render
const ICON_INACTIVE = buildIcon(false);
const ICON_ACTIVE = buildIcon(true);

function MapController({
  activeIndex,
  markerRefs,
}: {
  activeIndex: number;
  markerRefs: React.RefObject<Record<string, L.Marker | null>>;
}) {
  const map = useMap();

  useEffect(() => {
    const location = SITE_CONFIG.locations[activeIndex];
    if (!location) return;
    const coords = REAL_COORDS[location.name];
    if (!coords) return;

    const isMobile = window.innerWidth < 1024;

    // Desktop: shift east so the marker sits in the left half (right half has text overlay)
    // Mobile: shift north so the marker lands in the lower half of the screen —
    //         popup opens above the marker and is fully visible
    const offsetCoords: [number, number] = isMobile
      ? [coords[0] + 0.35, coords[1]]
      : [coords[0] + 0.25, coords[1] + 0.45];

    map.stop();
    map.flyTo(offsetCoords, isMobile ? 9 : 10, {
      duration: 1.2,
      easeLinearity: 0.25,
    });

    // Open popup after the fly finishes — markers are guaranteed rendered by then
    map.once("moveend", () => {
      markerRefs.current?.[location.name]?.openPopup();
    });
  }, [activeIndex, map, markerRefs]);

  return null;
}

interface DynamicMapProps {
  activeIndex: number;
  onMapReady?: (map: L.Map) => void;
}

export default function DynamicMap({ activeIndex, onMapReady }: DynamicMapProps) {
  const router = useRouter();
  const mapRef = useRef<L.Map | null>(null);
  const markerRefs = useRef<Record<string, L.Marker | null>>({});


  const initialCenter: [number, number] = [13.0, 100.0];

  return (
    <div className="w-full h-full relative z-0 bg-black">
      <MapContainer
        center={initialCenter}
        zoom={6}
        scrollWheelZoom={false}
        style={{ height: "100%", width: "100%", background: "#0a0a0a" }}
        ref={(instance) => {
          mapRef.current = instance;
          if (instance) onMapReady?.(instance);
        }}
        zoomControl={false}
        worldCopyJump={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />

        <MapController activeIndex={activeIndex} markerRefs={markerRefs} />

        {SITE_CONFIG.locations.map((location, idx) => {
          const coords = REAL_COORDS[location.name];
          if (!coords) return null;

          const isActive = idx === activeIndex;
          const imgSrc = locationImages[location.name]?.src ?? bangkokImg.src;

          return (
            <Marker
              key={location.name}
              position={coords}
              icon={isActive ? ICON_ACTIVE : ICON_INACTIVE}
              zIndexOffset={isActive ? 1000 : 0}
              ref={(r) => {
                if (r) markerRefs.current[location.name] = r;
              }}
            >
              <Popup className="gta-popup" closeButton={false} autoPan={false}>
                <div
                  className="gta-popup-content"
                  onClick={() => router.push("/locations")}
                >
                  <div className="gta-popup-image-wrapper">
                    <img src={imgSrc} alt={location.name} className="gta-popup-image" />
                    <div className="gta-popup-overlay" />
                  </div>
                  <div className="gta-popup-info">
                    <div className="gta-popup-header">
                      <span className="gta-popup-title">{location.name}</span>
                    </div>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

    </div>
  );
}
