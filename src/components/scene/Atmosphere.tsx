"use client";

import { motion } from "framer-motion";

type AtmosphereProps = {
  mode: "intro" | "search";
};

export function Atmosphere({ mode }: AtmosphereProps) {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <motion.div
        className="absolute -top-40 left-1/2 h-[32rem] w-[32rem] -translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_center,_rgba(252,164,78,0.26)_0%,_rgba(252,164,78,0.05)_45%,_transparent_75%)]"
        animate={{ scale: mode === "intro" ? 1 : 1.18, opacity: mode === "intro" ? 1 : 0.78 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      />
      <motion.div
        className="absolute bottom-[-7rem] left-[-10rem] h-[24rem] w-[24rem] rotate-12 rounded-full bg-[radial-gradient(circle_at_center,_rgba(236,86,53,0.32)_0%,_rgba(236,86,53,0.04)_58%,_transparent_80%)]"
        animate={{ x: mode === "intro" ? 0 : 22, y: mode === "intro" ? 0 : -8 }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
      />
      <motion.div
        className="absolute right-[-8rem] top-1/4 h-[20rem] w-[20rem] rounded-full bg-[radial-gradient(circle_at_center,_rgba(102,190,232,0.26)_0%,_rgba(102,190,232,0.04)_55%,_transparent_80%)]"
        animate={{ x: mode === "intro" ? 0 : -18, y: mode === "intro" ? 0 : 15 }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
      />

      <div className="absolute inset-0 bg-[linear-gradient(130deg,_rgba(14,17,31,0.92)_0%,_rgba(17,20,38,0.86)_44%,_rgba(31,23,33,0.9)_100%)]" />
      <div className="absolute inset-0 opacity-[0.18] [background-image:radial-gradient(rgba(255,255,255,0.52)_1px,transparent_1px)] [background-size:22px_22px]" />
      <div className="absolute inset-0 bg-[linear-gradient(160deg,_rgba(255,255,255,0.06)_0%,_transparent_45%,_rgba(245,159,80,0.08)_100%)]" />
    </div>
  );
}
