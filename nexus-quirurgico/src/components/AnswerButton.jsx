import { motion } from 'framer-motion';

const SHAPES = ['▲', '◆', '●', '■'];
const COLORS = ['#e21b3c', '#1368ce', '#d89e00', '#26890c'];

export default function AnswerButton({ index, text, onClick, selected, correct, revealed, disabled }) {
  let opacity = 1;
  let border = 'none';
  let extra = null;

  if (revealed) {
    if (index === correct) {
      border = '3px solid #4ade80';
      extra = '✅';
    } else if (selected === index) {
      opacity = 0.4;
      extra = '❌';
    } else {
      opacity = 0.5;
    }
  }

  return (
    <motion.button
      whileHover={!disabled ? { scale: 1.03, filter: 'brightness(1.1)' } : {}}
      whileTap={!disabled ? { scale: 0.97 } : {}}
      onClick={onClick}
      disabled={disabled}
      className="flex items-center gap-3 rounded-xl p-4 text-white font-bold text-sm md:text-base w-full min-h-[80px] md:min-h-[90px] text-left transition-all"
      style={{ background: COLORS[index], opacity, border, cursor: disabled ? 'not-allowed' : 'pointer' }}
    >
      <span className="text-xl flex-shrink-0">{SHAPES[index]}</span>
      <span className="flex-1">{text}</span>
      {extra && <span className="text-lg">{extra}</span>}
    </motion.button>
  );
}
