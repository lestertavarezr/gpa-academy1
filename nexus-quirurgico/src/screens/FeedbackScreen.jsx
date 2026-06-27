import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useGame } from '../context/GameContext';
import { fadeInUp, bounceIn } from '../utils/animations';

function CountUp({ target }) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    const step = target / 30;
    let cur = 0;
    const interval = setInterval(() => {
      cur = Math.min(cur + step, target);
      setVal(Math.floor(cur));
      if (cur >= target) clearInterval(interval);
    }, 30);
    return () => clearInterval(interval);
  }, [target]);
  return <span>{val.toLocaleString()}</span>;
}

export default function FeedbackScreen() {
  const { state, dispatch } = useGame();
  const { game } = state;
  const question = game.questions[game.currentQuestion];
  const isCorrect = game.lastAnswerCorrect;
  const [showNext, setShowNext] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setShowNext(true), 2000);
    const t2 = setTimeout(() => dispatch({ type: 'NEXT_QUESTION' }), 4000);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8" style={{ background: '#46178f' }}>
      <motion.div
        variants={bounceIn}
        initial="hidden"
        animate="visible"
        className="text-8xl mb-4"
      >
        {isCorrect ? '✅' : '❌'}
      </motion.div>

      <motion.h2
        variants={fadeInUp}
        initial="hidden"
        animate="visible"
        className="text-white font-black text-3xl mb-6 text-center"
      >
        {isCorrect ? '¡Correcto! 🎉' : '¡Casi!'}
      </motion.h2>

      <div className="w-full max-w-md flex flex-col gap-3">
        <div className="p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.12)' }}>
          <p className="text-white/60 text-xs mb-1">Respuesta correcta</p>
          <p className="text-white font-bold">{question.options[question.correct]}</p>
        </div>

        <div className="p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.10)' }}>
          <p className="text-white/60 text-xs mb-1">Explicación clínica</p>
          <p className="text-white/90 text-sm leading-relaxed">{question.explain}</p>
        </div>

        {isCorrect && game.lastScore > 0 && (
          <motion.div
            variants={bounceIn}
            initial="hidden"
            animate="visible"
            className="text-center py-3"
          >
            <span className="font-black text-4xl" style={{ color: '#f7a600' }}>
              +<CountUp target={game.lastScore} /> pts
            </span>
          </motion.div>
        )}
      </div>

      {showNext && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => dispatch({ type: 'NEXT_QUESTION' })}
          className="mt-6 px-8 py-3 rounded-xl font-black text-white"
          style={{ background: '#ff3355' }}
        >
          Siguiente →
        </motion.button>
      )}
    </div>
  );
}
