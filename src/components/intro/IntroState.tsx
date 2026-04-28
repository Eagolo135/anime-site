"use client";

import { motion } from "framer-motion";

type IntroStateProps = {
  onPush: () => void;
};

export function IntroState({ onPush }: IntroStateProps) {
  return (
    <motion.section
      className="relative z-10 flex w-full max-w-4xl flex-col items-center px-6 text-center"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
    >
      <motion.button
        type="button"
        onClick={onPush}
        className="group relative mx-auto h-48 w-48 rounded-full border border-white/30 bg-[radial-gradient(circle_at_30%_28%,_#ffd391_0%,_#f59f50_38%,_#d9552d_74%,_#7f2f1f_100%)] text-3xl font-black uppercase tracking-[0.08em] text-zinc-950 shadow-[0_0_0_8px_rgba(255,255,255,0.06),0_28px_64px_rgba(13,4,4,0.62)] outline-none md:h-56 md:w-56 md:text-4xl"
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.96, rotate: -1.2 }}
        transition={{ type: "spring", stiffness: 260, damping: 18 }}
        aria-label="Push Here"
      >
        <span className="relative z-10">Push Here</span>
        <span className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_52%_18%,_rgba(255,255,255,0.56),_transparent_55%)]" />
        <span className="absolute inset-2 rounded-full border border-black/20" />
      </motion.button>

      <motion.p
        className="mt-12 max-w-lg text-xl leading-relaxed tracking-[0.02em] text-amber-100/92 md:text-2xl"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.18, duration: 0.6 }}
      >
        Where anime meets poetry
      </motion.p>
    </motion.section>
  );
}
