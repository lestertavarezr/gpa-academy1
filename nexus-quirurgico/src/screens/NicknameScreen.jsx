import { useState } from 'react';
import { motion } from 'framer-motion';
import { useGame } from '../context/GameContext';
import { fadeInUp, bounceIn } from '../utils/animations';

const AVATARS = ['👨‍⚕️', '👩‍⚕️', '🩺', '💉', '🔬', '🏥', '🧬', '⚕️'];

export default function NicknameScreen() {
  const { state, dispatch } = useGame();
  const [nickname, setNickname] = useState(state.player.nickname);
  const [avatar, setAvatar] = useState(state.player.avatar);
  const [showConfig, setShowConfig] = useState(false);
  const [config, setConfig] = useState(state.config);

  function handleEnter() {
    if (!nickname.trim()) return;
    dispatch({ type: 'SET_NICKNAME', nickname: nickname.trim() });
    dispatch({ type: 'SET_AVATAR', avatar });
    dispatch({ type: 'UPDATE_CONFIG', config });
    dispatch({ type: 'SET_PHASE', phase: 'lobby' });
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8" style={{ background: '#46178f' }}>
      <motion.div
        variants={fadeInUp}
        initial="hidden"
        animate="visible"
        className="w-full max-w-md flex flex-col items-center gap-6"
      >
        <motion.div variants={bounceIn} className="px-4 py-2 rounded-full font-black text-white text-sm" style={{ background: '#ff3355' }}>
          GPA Academy
        </motion.div>

        <div className="text-center">
          <h1 className="text-4xl font-black text-white mb-1">🔬 NEXUS QUIRÚRGICO</h1>
          <p className="text-base" style={{ color: '#c9a8f5' }}>Trivia de Asistencia Quirúrgica</p>
        </div>

        <div className="w-full flex flex-col gap-4">
          <input
            type="text"
            value={nickname}
            onChange={e => setNickname(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleEnter()}
            maxLength={20}
            placeholder="Tu nombre o alias..."
            className="w-full px-5 py-4 rounded-xl text-white font-bold text-lg outline-none placeholder:text-white/40"
            style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)' }}
          />

          <div>
            <p className="text-white/60 text-sm mb-2 text-center">Elige tu avatar</p>
            <div className="flex justify-center gap-2 flex-wrap">
              {AVATARS.map(em => (
                <button
                  key={em}
                  onClick={() => setAvatar(em)}
                  className="text-3xl p-2 rounded-xl transition-all"
                  style={{
                    background: avatar === em ? 'rgba(255,255,255,0.25)' : 'transparent',
                    border: avatar === em ? '2px solid white' : '2px solid transparent',
                    transform: avatar === em ? 'scale(1.15)' : 'scale(1)',
                  }}
                >
                  {em}
                </button>
              ))}
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleEnter}
            disabled={!nickname.trim()}
            className="w-full py-4 rounded-xl font-black text-white text-lg disabled:opacity-40"
            style={{ background: '#ff3355' }}
          >
            ¡Entrar al Quirófano! 🏥
          </motion.button>

          <button onClick={() => setShowConfig(!showConfig)} className="text-white/50 text-sm text-center hover:text-white/80">
            ⚙️ Configuración
          </button>

          {showConfig && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="rounded-xl p-4 flex flex-col gap-3"
              style={{ background: 'rgba(255,255,255,0.1)' }}
            >
              <div>
                <p className="text-white/70 text-xs mb-1">Dificultad</p>
                <div className="flex gap-2 flex-wrap">
                  {['mixed', 'basico', 'intermedio', 'avanzado'].map(d => (
                    <button key={d} onClick={() => setConfig(c => ({ ...c, difficulty: d }))}
                      className="px-3 py-1 rounded-full text-xs font-bold transition-all"
                      style={{ background: config.difficulty === d ? '#ff3355' : 'rgba(255,255,255,0.15)', color: 'white' }}>
                      {d === 'mixed' ? 'Mixto' : d.charAt(0).toUpperCase() + d.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-white/70 text-xs mb-1">Preguntas</p>
                <div className="flex gap-2">
                  {[5, 10, 15, 20].map(n => (
                    <button key={n} onClick={() => setConfig(c => ({ ...c, totalQuestions: n }))}
                      className="px-3 py-1 rounded-full text-xs font-bold transition-all"
                      style={{ background: config.totalQuestions === n ? '#ff3355' : 'rgba(255,255,255,0.15)', color: 'white' }}>
                      {n}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-white/70 text-xs mb-1">Tiempo por pregunta</p>
                <div className="flex gap-2">
                  {[10, 15, 20, 30].map(t => (
                    <button key={t} onClick={() => setConfig(c => ({ ...c, timePerQuestion: t }))}
                      className="px-3 py-1 rounded-full text-xs font-bold transition-all"
                      style={{ background: config.timePerQuestion === t ? '#ff3355' : 'rgba(255,255,255,0.15)', color: 'white' }}>
                      {t}s
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
