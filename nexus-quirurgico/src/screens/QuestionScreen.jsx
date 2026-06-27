import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useGame } from '../context/GameContext';
import { useTimer } from '../hooks/useTimer';
import TimerCircle from '../components/TimerCircle';
import ProgressBar from '../components/ProgressBar';
import AnswerButton from '../components/AnswerButton';
import StreakBadge from '../components/StreakBadge';
import { playCorrect, playWrong, playTick } from '../utils/sound';

export default function QuestionScreen() {
  const { state, dispatch } = useGame();
  const { game, player } = state;
  const question = game.questions[game.currentQuestion];
  const [answered, setAnswered] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const timeRemaining = useRef(game.timePerQuestion);

  const timeLeft = useTimer(
    game.timePerQuestion,
    (t) => {
      timeRemaining.current = t;
      if (t <= 5) playTick();
    },
    () => handleAnswer(-1),
    !answered
  );

  function handleAnswer(idx) {
    if (answered) return;
    setAnswered(true);
    setSelectedAnswer(idx);
    const isCorrect = idx === question.correct;
    if (isCorrect) playCorrect();
    else playWrong();
    dispatch({ type: 'ANSWER_QUESTION', answerIndex: idx, timeRemaining: timeRemaining.current });
    setTimeout(() => dispatch({ type: 'SET_PHASE', phase: 'feedback' }), 1800);
  }

  return (
    <div className="min-h-screen flex flex-col px-4 py-4" style={{ background: '#46178f' }}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-white/70 text-sm font-bold">
          Pregunta {game.currentQuestion + 1}/{game.totalQuestions}
        </span>
        <TimerCircle timeLeft={timeLeft} totalTime={game.timePerQuestion} />
        <span className="text-white font-black text-sm">
          {player.score.toLocaleString()} pts
        </span>
      </div>

      <ProgressBar timeLeft={timeLeft} totalTime={game.timePerQuestion} />

      <div className="flex-1 flex flex-col items-center justify-center py-4 relative">
        <StreakBadge streak={player.streak} />

        <div className="px-3 py-1 rounded-full text-xs font-bold mb-3" style={{ background: 'rgba(255,255,255,0.12)', color: '#c9a8f5' }}>
          {question.icon} {question.category}
        </div>

        <p className="text-white font-bold text-lg text-center max-w-lg mb-6 leading-snug">
          {question.text}
        </p>

        <div className="w-full max-w-lg grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {question.options.map((opt, i) => (
            <AnswerButton
              key={i}
              index={i}
              text={opt}
              onClick={() => handleAnswer(i)}
              selected={selectedAnswer}
              correct={question.correct}
              revealed={answered}
              disabled={answered}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
