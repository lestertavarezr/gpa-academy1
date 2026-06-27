import { motion } from 'framer-motion';

export default function PodiumDisplay({ players }) {
  const top3 = players.slice(0, 3);
  const order = [top3[1], top3[0], top3[2]].filter(Boolean);
  const heights = [120, 160, 100];
  const medals = ['🥈', '🥇', '🥉'];
  const positions = [2, 1, 3];

  return (
    <div className="flex items-end justify-center gap-2 mt-4">
      {order.map((p, i) => (
        <div key={p?.name} className="flex flex-col items-center gap-1">
          <span className="text-3xl">{medals[i]}</span>
          <span className="text-2xl">{p?.emoji}</span>
          <span className="text-white text-xs font-bold">{p?.name}</span>
          <span className="text-yellow-400 text-xs">{p?.score?.toLocaleString()} pts</span>
          <motion.div
            initial={{ scaleY: 0 }}
            animate={{ scaleY: 1 }}
            transition={{ delay: i * 0.2, duration: 0.6, ease: 'easeOut' }}
            style={{ height: heights[i], transformOrigin: 'bottom', background: i === 1 ? '#f7a600' : i === 0 ? '#9ca3af' : '#b45309' }}
            className="w-20 rounded-t-lg flex items-start justify-center pt-2"
          >
            <span className="text-white font-black text-xl">#{positions[i]}</span>
          </motion.div>
        </div>
      ))}
    </div>
  );
}
