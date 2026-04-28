import type { Variants } from "framer-motion";

export const introPanelVariants: Variants = {
  initial: { opacity: 0, scale: 0.985 },
  animate: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.58, ease: [0.22, 1, 0.36, 1] },
  },
  exit: {
    opacity: 0,
    scale: 1.03,
    y: -12,
    transition: { duration: 0.4, ease: [0.4, 0, 1, 1] },
  },
};

export const searchPanelVariants: Variants = {
  initial: { opacity: 0, y: 20, scale: 0.99 },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { delay: 0.08, duration: 0.55, ease: [0.22, 1, 0.36, 1] },
  },
  exit: {
    opacity: 0,
    y: -10,
    transition: { duration: 0.35 },
  },
};

export const resultCardVariants: Variants = {
  initial: { opacity: 0, y: 12 },
  animate: (index: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: 0.05 * index,
      duration: 0.45,
      ease: [0.22, 1, 0.36, 1],
    },
  }),
};
