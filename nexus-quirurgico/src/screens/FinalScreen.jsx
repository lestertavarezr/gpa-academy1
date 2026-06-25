import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { useGame } from '../context/GameContext';
import PodiumDisplay from '../components/PodiumDisplay';
import { playWinner } from '../utils/sound';
import { fadeInUp, bounceIn } from '../utils/animations';

export default function FinalScreen() {
  const { state, dispatch } = useGame();
  const { player, players, game } = state;
  const resultRef = useRef(null);

  const allPlayers = [
    { name: player.nickname, emoji: player.avatar, score: player.score, isUser: true },
    ...players.map(p => ({ ...p, isUser: false }))
  ].sort((a, b) => b.score - a.score);

  const userRank = allPlayers.findIndex(p => p.isUser) + 1;
  const accuracy = game.totalQuestions > 0 ? Math.round((player.correctAnswers / game.totalQuestions) * 100) : 0;
  const avgTime = player.responseTimes.length > 0
    ? (player.responseTimes.reduce((a, b) => a + b, 0) / player.responseTimes.length).toFixed(1)
    : '—';

  useEffect(() => {
    playWinner();
    confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
    setTimeout(() => confetti({ particleCount: 80, spread: 60, origin: { y: 0.5, x: 0.2 } }), 500);
    setTimeout(() => confetti({ particleCount: 80, spread: 60, origin: { y: 0.5, x: 0.8 } }), 800);
  }, []);

  async function handleShare() {
    if (!resultRef.current) return;
    try {
      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(resultRef.current, { backgroundColor: '#46178f' });
      const dataUrl = canvas.toDataURL('image/png');
      if (navigator.share) {
        const blob = await (await fetch(dataUrl)).blob();
        const file = new File([blob], 'nexus-resultado.png', { type: 'image/png' });
        navigator.share({ files: [file], title: 'Mi resultado en Nexus Quirúrgico — GPA Academy' });
      } else {
        const a = document.createElement('a');
        a.href = dataUrl;
        a.download = 'nexus-resultado.png';
        a.click();
      }
    } catch (e) {
      console.error(e);
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center px-4 py-8" style={{ background: '#46178f' }}>
      <motion.h2 variants={bounceIn} initial="hidden" animate="visible" className="text-white font-black text-3xl mb-2">
        🏆 ¡Partida Finalizada!
      </motion.h2>

      <PodiumDisplay players={allPlayers} />

      <motion.div
        ref={resultRef}
        variants={fadeInUp}
        initial="hidden"
        animate="visible"
        transition={{ delay: 0.8 }}
        className="w-full max-w-md mt-8 p-5 rounded-2xl"
        style={{ background: 'rgba(255,255,255,0.12)' }}
      >
        <h3 className="text-white font-black text-lg mb-4 text-center">Tu resultado</h3>
        <div className="text-center mb-4">
          <span className="font-black text-5xl" style={{ color: '#f7a600' }}>{player.score.toLocaleString()}</span>
          <span className="text-white/60 text-sm block">puntos totales</span>
        </div>

        <div className="grid grid-cols-2 gap-3 text-center">
          <div className="p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.1)' }}>
            <div className="text-white font-black text-xl">#{userRank}</div>
            <div className="text-white/60 text-xs">de {allPlayers.length} jugadores</div>
          </div>
          <div className="p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.1)' }}>
            <div className="text-white font-black text-xl">{player.correctAnswers}/{game.totalQuestions}</div>
            <div className="text-white/60 text-xs">respuestas correctas ✅</div>
          </div>
          <div className="p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.1)' }}>
            <div className="text-white font-black text-xl">🔥 {player.maxStreak}</div>
            <div className="text-white/60 text-xs">racha máxima</div>
          </div>
          <div className="p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.1)' }}>
            <div className="text-white font-black text-xl">⚡ {avgTime}s</div>
            <div className="text-white/60 text-xs">tiempo promedio</div>
          </div>
        </div>

        {accuracy >= 90 && (
          <div className="mt-4 p-3 rounded-xl text-center font-black text-white" style={{ background: '#f7a600', color: '#1a1a1a' }}>
            ⭐ Experto Quirúrgico — GPA Academy
          </div>
        )}
        {accuracy >= 70 && accuracy < 90 && (
          <div className="mt-4 p-3 rounded-xl text-center font-black" style={{ background: 'rgba(255,255,255,0.2)', color: 'white' }}>
            🎓 Aprobado — GPA Academy
          </div>
        )}
      </motion.div>

      <div className="w-full max-w-md mt-4 flex flex-col gap-2">
        <button onClick={handleShare} className="w-full py-3 rounded-xl font-black text-white" style={{ background: '#1368ce' }}>
          Compartir resultado 📱
        </button>
        <button onClick={() => dispatch({ type: 'RESET_GAME' })} className="w-full py-3 rounded-xl font-black text-white" style={{ background: '#ff3355' }}>
          🔄 Jugar de nuevo
        </button>
      </div>
    </div>
  );
}
