import { motion, AnimatePresence } from 'framer-motion';

export default function StreakBadge({ streak }) {
  if (streak < 2) return null;
  return (
    <AnimatePresence>
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0, opacity: 0 }}
        className="absolute top-2 right-2 z-10 px-3 py-1 rounded-full font-black text-sm text-white"
        style={{ background: '#ff3355' }}
      >
        🔥 Racha x{streak}
      </motion.div>
    </AnimatePresence>
  );
}
