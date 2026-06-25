import { motion } from 'framer-motion';
import { useGame } from '../context/GameContext';
import { staggerChildren, fadeInUp } from '../utils/animations';

export default function LeaderboardScreen() {
  const { state, dispatch } = useGame();
  const { player, players, game } = state;

  const allPlayers = [
    { name: player.nickname, emoji: player.avatar, score: player.score, isUser: true },
    ...players.map(p => ({ ...p, isUser: false }))
  ].sort((a, b) => b.score - a.score);

  const medals = ['🥇', '🥈', '🥉'];

  return (
    <div className="min-h-screen flex flex-col px-4 py-8" style={{ background: '#46178f' }}>
      <div className="text-center mb-6">
        <h2 className="text-white font-black text-3xl">🏆 Clasificación</h2>
        <p style={{ color: '#c9a8f5' }}>Después de la pregunta {game.currentQuestion}</p>
      </div>

      <motion.div
        variants={staggerChildren}
        initial="hidden"
        animate="visible"
        className="flex flex-col gap-2 max-w-md mx-auto w-full"
      >
        {allPlayers.slice(0, 5).map((p, i) => (
          <motion.div
            key={p.name}
            variants={fadeInUp}
            className="flex items-center gap-3 p-3 rounded-xl"
            style={{
              background: p.isUser ? 'rgba(255,51,85,0.3)' : 'rgba(255,255,255,0.1)',
              border: p.isUser ? '2px solid #ff3355' : '2px solid transparent',
            }}
          >
            <span className="text-xl w-8">{medals[i] || `#${i + 1}`}</span>
            <span className="text-2xl">{p.emoji}</span>
            <span className="text-white font-bold flex-1">{p.name}</span>
            <span className="font-black" style={{ color: '#f7a600' }}>{p.score.toLocaleString()}</span>
          </motion.div>
        ))}
      </motion.div>

      <div className="mt-auto pt-6 max-w-md mx-auto w-full">
        <button
          onClick={() => dispatch({ type: 'CONTINUE_FROM_LEADERBOARD' })}
          className="w-full py-4 rounded-xl font-black text-white text-lg"
          style={{ background: '#ff3355' }}
        >
          Continuar →
        </button>
      </div>
    </div>
  );
}
