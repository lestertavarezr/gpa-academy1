import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '../context/GameContext';
import { AI_PLAYERS } from '../data/questions';
import PlayerCard from '../components/PlayerCard';

export default function LobbyScreen() {
  const { state, dispatch } = useGame();
  const [visible, setVisible] = useState([]);
  const [showStart, setShowStart] = useState(false);
  const [countdown, setCountdown] = useState(null);

  const allPlayers = [
    { name: state.player.nickname, emoji: state.player.avatar, flag: '⭐' },
    ...AI_PLAYERS,
  ];

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      if (i < allPlayers.length) {
        setVisible(v => [...v, allPlayers[i]]);
        i++;
      } else {
        clearInterval(interval);
      }
    }, 800);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setShowStart(true), 4000);
    return () => clearTimeout(t);
  }, []);

  function startGame() {
    setCountdown(3);
  }

  useEffect(() => {
    if (countdown === null) return;
    if (countdown === 0) {
      dispatch({ type: 'START_GAME' });
      return;
    }
    const t = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  return (
    <div className="min-h-screen flex flex-col px-4 py-6" style={{ background: '#46178f' }}>
      <div className="flex justify-between items-center mb-6">
        <span className="px-3 py-1 rounded-full font-black text-white text-sm" style={{ background: '#ff3355' }}>GPA Academy</span>
        <span className="px-3 py-1 rounded-full font-black text-sm" style={{ background: '#d89e00', color: '#1a1a1a' }}>Código: GPA-2024</span>
      </div>

      {countdown !== null ? (
        <div className="flex-1 flex items-center justify-center">
          <motion.div
            key={countdown}
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 2, opacity: 0 }}
            className="text-white font-black text-9xl"
          >
            {countdown === 0 ? '🏥' : countdown}
          </motion.div>
        </div>
      ) : (
        <>
          <div className="text-center mb-6">
            <div className="flex items-center justify-center gap-2 mb-2">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
                className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full"
              />
              <h2 className="text-white font-black text-xl">Esperando jugadores...</h2>
            </div>
            <p style={{ color: '#c9a8f5' }}>{visible.length} jugadores listos</p>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mb-6">
            {visible.map((p, i) => (
              <PlayerCard key={p.name} name={p.name} emoji={p.emoji} flag={p.flag} delay={0} />
            ))}
          </div>

          <AnimatePresence>
            {showStart && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-auto"
              >
                <button
                  onClick={startGame}
                  className="w-full py-4 rounded-xl font-black text-white text-xl"
                  style={{ background: '#ff3355' }}
                >
                  ¡Comenzar! 🚀
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </div>
  );
}
