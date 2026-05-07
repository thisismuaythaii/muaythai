"use client";

import { motion, useScroll, useMotionValueEvent, AnimatePresence } from "motion/react";
import { useRef, useState } from "react";
import { SITE_CONFIG } from "@repo/utils";
import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";

// Dynamically import the map component with SSR disabled because Leaflet uses the window object
const DynamicMap = dynamic(() => import("./DynamicMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex flex-col items-center justify-center bg-[#0a0a0a] text-white">
      <Loader2 className="animate-spin text-primary w-12 h-12 mb-4" />
      <span className="font-grotesk tracking-[0.3em] uppercase text-xs font-bold animate-pulse">Initializing Map Satellite...</span>
    </div>
  ),
});

const MapSection = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    const sectionCount = SITE_CONFIG.locations.length;
    const newIndex = Math.min(Math.floor(latest * sectionCount), sectionCount - 1);
    if (newIndex !== activeIndex) {
      setActiveIndex(newIndex);
    }
  });

  const totalHeight = `${SITE_CONFIG.locations.length * 100}vh`;

  return (
    <section
      id="map"
      ref={sectionRef}
      className="relative bg-black"
      style={{ height: totalHeight }}
    >
      {/* Sticky Container */}
      <div className="sticky top-0 h-screen w-full overflow-hidden flex">
        
        {/* Full-width Map Background */}
        <div className="absolute inset-0 z-0">
          <DynamicMap activeIndex={activeIndex} />
          {/* Gradient overlay to make text readable on the right ONLY */}
          <div className="absolute top-0 bottom-0 right-0 w-full lg:w-[60%] bg-gradient-to-l from-black via-black/80 to-transparent pointer-events-none z-[10]" />
        </div>

        <div className="relative z-20 w-full h-full pointer-events-none">
          <div className="max-w-7xl mx-auto h-full px-4 sm:px-6 md:px-12 lg:px-20">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 h-full">
              
              {/* Left Side is empty to let the map show through */}
              <div className="hidden lg:block h-full pointer-events-none" />

              {/* Right Side - Location Names (Syncs perfectly with activeIndex) */}
              <div className="relative h-full flex flex-col justify-center pointer-events-none">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeIndex}
                    initial={{ opacity: 0, y: 40, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -40, scale: 0.9 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className="absolute inset-0 flex flex-col justify-center items-end text-right pointer-events-auto origin-right"
                  >
                    <span 
                      className="font-grotesk text-[10px] md:text-xs tracking-[0.5em] uppercase font-bold mb-4 drop-shadow-lg transition-colors duration-500 text-primary"
                    >
                      LOCATION {(activeIndex + 1).toString().padStart(2, '0')}
                    </span>
                    <h2
                      className="font-barlow font-black italic text-6xl sm:text-7xl md:text-8xl lg:text-9xl uppercase tracking-tight leading-[0.85] drop-shadow-2xl transition-colors duration-500 text-white"
                    >
                      {SITE_CONFIG.locations[activeIndex].name}
                    </h2>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 flex gap-2 pointer-events-auto">
          {SITE_CONFIG.locations.map((location, idx) => (
            <button
              key={idx}
              onClick={() => {
                const targetScroll = (idx / SITE_CONFIG.locations.length) * (sectionRef.current?.offsetHeight || 0);
                window.scrollTo({
                  top: (sectionRef.current?.offsetTop || 0) + targetScroll,
                  behavior: "smooth",
                });
              }}
              className="h-1.5 rounded-full transition-all duration-500 cursor-pointer hover:h-2"
              style={{
                width: idx === activeIndex ? '40px' : '16px',
                backgroundColor: idx === activeIndex 
                  ? "hsl(16 100% 50%)" 
                  : "rgba(255, 255, 255, 0.3)",
                boxShadow: idx === activeIndex ? `0 0 10px hsl(16 100% 50% / 0.5)` : 'none'
              }}
              aria-label={`Go to ${location.name}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default MapSection;
