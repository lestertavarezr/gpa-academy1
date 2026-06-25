import { motion } from 'framer-motion';

export default function TimerCircle({ timeLeft, totalTime }) {
  const pct = timeLeft / totalTime;
  const danger = timeLeft <= 3;
  const warning = timeLeft <= 7 && timeLeft > 3;

  const bg = danger ? '#e21b3c' : warning ? '#d89e00' : '#ff3355';
  const textColor = warning ? '#1a1a1a' : 'white';

  return (
    <motion.div
      animate={danger ? { scale: [1, 1.15, 1] } : { scale: 1 }}
      transition={danger ? { repeat: Infinity, duration: 0.5 } : {}}
      className="flex items-center justify-center rounded-full w-16 h-16 font-black text-2xl shadow-lg"
      style={{ background: bg, color: textColor, minWidth: 64 }}
    >
      {timeLeft}
    </motion.div>
  );
}
