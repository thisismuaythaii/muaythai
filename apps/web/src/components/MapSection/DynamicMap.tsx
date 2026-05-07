"use client";

import { useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { SITE_CONFIG } from "@repo/utils";
import { useRouter } from "next/navigation";
import { renderToString } from "react-dom/server";
import { X } from "lucide-react";

// Images for popup
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
  "Bangkok": [13.7539, 100.5014],
  "Phuket": [7.8906, 98.3981],
  "Krabi": [8.0850, 98.9063],
  "Koh Samui": [9.5120, 100.0139],
};

// Component to handle programmatic map movements based on scroll
function MapController({ activeIndex }: { activeIndex: number }) {
  const map = useMap();

  useEffect(() => {
    const location = SITE_CONFIG.locations[activeIndex];
    if (location) {
      const coords = REAL_COORDS[location.name];
      if (coords) {
        // Offset the center slightly so the marker isn't exactly in the middle 
        // Adding to longitude moves the map right, pushing the marker to the left
        // Adding to latitude moves the map UP, pushing the marker DOWNWARDS (so the popup fits above it)
        const offsetCoords: [number, number] = [coords[0] + 0.25, coords[1] + 0.45];
        map.flyTo(offsetCoords, 10, {
          duration: 1.5,
          easeLinearity: 0.25,
        });
      }
    }
  }, [activeIndex, map]);

  return null;
}

// Function to create a custom div icon
const createCustomIcon = (isActive: boolean) => {
  const xIconSvg = renderToString(
    <X 
      size={isActive ? 36 : 28} 
      strokeWidth={isActive ? 3 : 2.5} 
      color={isActive ? "hsl(16, 100%, 50%)" : "white"} 
    />
  );

  return L.divIcon({
    className: "custom-leaflet-marker",
    html: `
      <div class="gta-marker ${isActive ? 'active' : ''}">
        <div class="gta-x-icon">
          ${xIconSvg}
        </div>
        ${isActive ? '<div class="gta-marker-pulse"></div>' : ''}
      </div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -16],
  });
};

interface DynamicMapProps {
  activeIndex: number;
}

export default function DynamicMap({ activeIndex }: DynamicMapProps) {
  const router = useRouter();
  const mapRef = useRef<L.Map | null>(null);
  const markerRefs = useRef<Record<string, L.Marker | null>>({});

  // Auto-open popup when activeIndex changes
  useEffect(() => {
    const activeLocation = SITE_CONFIG.locations[activeIndex];
    if (activeLocation) {
      const marker = markerRefs.current[activeLocation.name];
      if (marker) {
        marker.openPopup();
      }
    }
  }, [activeIndex]);

  // Initial center (Thailand overview)
  const initialCenter: [number, number] = [13.0, 100.0];

  return (
    <div className="w-full h-full relative z-0 bg-black">
      <MapContainer
        center={initialCenter}
        zoom={6}
        scrollWheelZoom={true}
        style={{ height: "100%", width: "100%", background: "#0a0a0a" }}
        ref={mapRef}
        zoomControl={false}
        worldCopyJump={true}
      >
        {/* Dark Matter CartoDB tiles for the GTA aesthetic */}
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        
        <MapController activeIndex={activeIndex} />

        {SITE_CONFIG.locations.map((location, idx) => {
          const coords = REAL_COORDS[location.name];
          if (!coords) return null;

          const isActive = idx === activeIndex;
          const imgSrc = locationImages[location.name]?.src || bangkokImg.src;

          return (
            <Marker
              key={location.name}
              position={coords}
              icon={createCustomIcon(isActive)}
              zIndexOffset={isActive ? 1000 : 0}
              ref={(r) => {
                if (r) markerRefs.current[location.name] = r;
              }}
            >
              <Popup
                className="gta-popup"
                closeButton={false}
                autoPan={false}
              >
                <div 
                  className="gta-popup-content"
                  onClick={() => {
                    router.push("/locations");
                  }}
                >
                  <div className="gta-popup-image-wrapper">
                    <img src={imgSrc} alt={location.name} className="gta-popup-image" />
                    <div className="gta-popup-overlay"></div>
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
      
      {/* Custom Map Controls */}
      <div className="absolute top-4 right-4 z-[400] flex flex-col gap-1 pointer-events-auto shadow-2xl">
        <button 
          onClick={() => mapRef.current?.zoomIn()}
          className="w-10 h-10 bg-black/90 border border-white/20 text-white font-grotesk text-xl flex items-center justify-center hover:bg-white hover:text-black transition-colors"
          aria-label="Zoom in"
        >
          +
        </button>
        <button 
          onClick={() => mapRef.current?.zoomOut()}
          className="w-10 h-10 bg-black/90 border border-white/20 text-white font-grotesk text-xl flex items-center justify-center hover:bg-white hover:text-black transition-colors"
          aria-label="Zoom out"
        >
          -
        </button>
      </div>

    </div>
  );
}
