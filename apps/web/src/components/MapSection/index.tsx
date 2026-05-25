"use client";

import { motion, AnimatePresence, useInView } from "motion/react";
import { useRef, useState, useCallback } from "react";
import { SITE_CONFIG } from "@repo/utils";
import dynamic from "next/dynamic";
import { Loader2, ChevronLeft, ChevronRight, Plus, Minus } from "lucide-react";
import type { Map as LeafletMap } from "leaflet";

const DynamicMap = dynamic(() => import("./DynamicMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex flex-col items-center justify-center bg-[#0a0a0a] text-white">
      <Loader2 className="animate-spin text-primary w-10 h-10 mb-3" />
      <span className="font-grotesk tracking-[0.3em] uppercase text-xs font-bold animate-pulse">
        Loading Map...
      </span>
    </div>
  ),
});

const total = SITE_CONFIG.locations.length;

// Shared dot indicator used by both mobile and desktop nav
const Dots = ({
  activeIndex,
  onSelect,
}: {
  activeIndex: number;
  onSelect: (i: number) => void;
}) => (
  <div className="flex items-center gap-2">
    {SITE_CONFIG.locations.map((loc, idx) => (
      <button
        key={idx}
        onClick={() => onSelect(idx)}
        aria-label={`Go to ${loc.name}`}
        className="h-1.5 rounded-full transition-all duration-500"
        style={{
          width: idx === activeIndex ? "36px" : "14px",
          backgroundColor:
            idx === activeIndex ? "hsl(16 100% 50%)" : "rgba(255,255,255,0.3)",
          boxShadow:
            idx === activeIndex ? "0 0 8px hsl(16 100% 50% / 0.5)" : "none",
        }}
      />
    ))}
  </div>
);

const MapSection = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const leafletMapRef = useRef<LeafletMap | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const isInView = useInView(sectionRef, { once: true, margin: "-10% 0px" });

  const onMapReady = useCallback((map: LeafletMap) => {
    leafletMapRef.current = map;
  }, []);

  const prev = () => setActiveIndex((i) => Math.max(0, i - 1));
  const next = () => setActiveIndex((i) => Math.min(total - 1, i + 1));
  const goTo = (i: number) => setActiveIndex(i);

  const activeLocation = SITE_CONFIG.locations[activeIndex];

  return (
    <section
      id="map"
      ref={sectionRef}
      className="relative bg-black h-[100svh]"
    >
      <div className="h-full w-full overflow-hidden relative">

        {/* ── MAP ─────────────────────────────────────────── */}
        <div className="absolute inset-0 z-0">
          {isInView && (
            <DynamicMap activeIndex={activeIndex} onMapReady={onMapReady} />
          )}
        </div>

        {/* ── ZOOM CONTROLS (above gradient on both layouts) ── */}
        <div className="absolute top-6 left-4 z-30 flex flex-col gap-1 pointer-events-auto">
          <button
            onClick={() => leafletMapRef.current?.zoomIn()}
            aria-label="Zoom in"
            className="w-9 h-9 flex items-center justify-center
                       bg-black/70 border border-white/20 text-white
                       hover:bg-white hover:text-black
                       active:scale-95 transition-all duration-200"
          >
            <Plus size={16} />
          </button>
          <button
            onClick={() => leafletMapRef.current?.zoomOut()}
            aria-label="Zoom out"
            className="w-9 h-9 flex items-center justify-center
                       bg-black/70 border border-white/20 text-white
                       hover:bg-white hover:text-black
                       active:scale-95 transition-all duration-200"
          >
            <Minus size={16} />
          </button>
        </div>

        {/* ── GRADIENTS ───────────────────────────────────── */}
        {/* Mobile: bottom-up so map is fully visible */}
        <div className="absolute inset-0 z-10 pointer-events-none lg:hidden bg-gradient-to-t from-black via-black/60 to-transparent" />
        {/* Desktop: right-side so map shows on left */}
        <div className="absolute inset-0 z-10 pointer-events-none hidden lg:block">
          <div className="absolute top-0 bottom-0 right-0 w-[60%] bg-gradient-to-l from-black via-black/80 to-transparent" />
        </div>

        {/* ══════════════════════════════════════════════════
            MOBILE LAYOUT  (hidden on lg+)
        ══════════════════════════════════════════════════ */}

        {/* Side arrow — LEFT */}
        <button
          onClick={prev}
          disabled={activeIndex === 0}
          aria-label="Previous location"
          className="lg:hidden absolute left-3 top-1/2 -translate-y-1/2 z-30
                     w-11 h-11 flex items-center justify-center
                     rounded-full bg-black/50 border border-white/20
                     text-white active:scale-95 transition-transform
                     disabled:opacity-20 disabled:pointer-events-none"
        >
          <ChevronLeft size={22} />
        </button>

        {/* Side arrow — RIGHT */}
        <button
          onClick={next}
          disabled={activeIndex === total - 1}
          aria-label="Next location"
          className="lg:hidden absolute right-3 top-1/2 -translate-y-1/2 z-30
                     w-11 h-11 flex items-center justify-center
                     rounded-full bg-black/50 border border-white/20
                     text-white active:scale-95 transition-transform
                     disabled:opacity-20 disabled:pointer-events-none"
        >
          <ChevronRight size={22} />
        </button>

        {/* Bottom info bar — location name + dots */}
        <div className="lg:hidden absolute bottom-0 left-0 right-0 z-20 px-5 pb-8 pt-16">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeIndex}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
            >
              <span className="font-grotesk text-[10px] tracking-[0.45em] uppercase font-bold text-primary block mb-2">
                LOCATION {(activeIndex + 1).toString().padStart(2, "0")} · THAILAND
              </span>
              <h2 className="font-barlow font-black italic text-5xl sm:text-6xl uppercase tracking-tight leading-[0.85] text-white drop-shadow-2xl mb-5">
                {activeLocation.name}
              </h2>
            </motion.div>
          </AnimatePresence>

          <Dots activeIndex={activeIndex} onSelect={goTo} />
        </div>

        {/* ══════════════════════════════════════════════════
            DESKTOP LAYOUT  (hidden below lg)
        ══════════════════════════════════════════════════ */}

        {/* Right-side location name */}
        <div className="hidden lg:block absolute inset-0 z-20 pointer-events-none">
          <div className="max-w-7xl mx-auto h-full px-20">
            <div className="grid grid-cols-2 h-full">
              {/* Left half: map shows through */}
              <div />

              {/* Right half: location name */}
              <div className="relative flex flex-col justify-center">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeIndex}
                    initial={{ opacity: 0, y: 30, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -30, scale: 0.95 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    className="absolute inset-0 flex flex-col justify-center items-end text-right origin-right"
                  >
                    <span className="font-grotesk text-xs tracking-[0.5em] uppercase font-bold mb-4 text-primary drop-shadow-lg">
                      LOCATION {(activeIndex + 1).toString().padStart(2, "0")}
                    </span>
                    <h2 className="font-barlow font-black italic text-8xl xl:text-9xl uppercase tracking-tight leading-[0.85] text-white drop-shadow-2xl">
                      {activeLocation.name}
                    </h2>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>

        {/* Desktop bottom nav: arrow · dots · arrow */}
        <div className="hidden lg:flex absolute bottom-8 left-1/2 -translate-x-1/2 z-30 items-center gap-4 pointer-events-auto">
          <button
            onClick={prev}
            disabled={activeIndex === 0}
            aria-label="Previous location"
            className="w-9 h-9 flex items-center justify-center rounded-full
                       border border-white/20 text-white/60
                       hover:border-primary hover:text-primary
                       transition-colors duration-300
                       disabled:opacity-20 disabled:cursor-not-allowed"
          >
            <ChevronLeft size={18} />
          </button>

          <Dots activeIndex={activeIndex} onSelect={goTo} />

          <button
            onClick={next}
            disabled={activeIndex === total - 1}
            aria-label="Next location"
            className="w-9 h-9 flex items-center justify-center rounded-full
                       border border-white/20 text-white/60
                       hover:border-primary hover:text-primary
                       transition-colors duration-300
                       disabled:opacity-20 disabled:cursor-not-allowed"
          >
            <ChevronRight size={18} />
          </button>
        </div>

      </div>
    </section>
  );
};

export default MapSection;
