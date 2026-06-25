import { motion } from 'framer-motion';

export default function PlayerCard({ name, emoji, flag, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.3 }}
      className="flex flex-col items-center gap-1 p-3 rounded-xl"
      style={{ background: 'rgba(255,255,255,0.12)' }}
    >
      <span className="text-3xl">{emoji}</span>
      <span className="text-white text-xs font-bold truncate max-w-[80px] text-center">{name}</span>
      <span className="text-lg">{flag}</span>
    </motion.div>
  );
}
