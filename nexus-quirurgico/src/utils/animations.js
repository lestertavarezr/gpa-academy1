export const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } }
};

export const staggerChildren = {
  visible: { transition: { staggerChildren: 0.08 } }
};

export const bounceIn = {
  hidden: { scale: 0, opacity: 0 },
  visible: { scale: 1, opacity: 1, transition: { type: "spring", bounce: 0.5, duration: 0.5 } }
};

export const slideFromRight = {
  hidden: { x: 100, opacity: 0 },
  visible: { x: 0, opacity: 1, transition: { duration: 0.35 } }
};

export const podiumRise = {
  hidden: { scaleY: 0, originY: 1 },
  visible: (h) => ({
    scaleY: 1,
    transition: { delay: h * 0.1, duration: 0.6, ease: "easeOut" }
  })
};
