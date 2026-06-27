import { AnimatePresence, motion } from 'framer-motion';
import { GameProvider, useGame } from './context/GameContext';
import NicknameScreen from './screens/NicknameScreen';
import LobbyScreen from './screens/LobbyScreen';
import QuestionScreen from './screens/QuestionScreen';
import FeedbackScreen from './screens/FeedbackScreen';
import LeaderboardScreen from './screens/LeaderboardScreen';
import FinalScreen from './screens/FinalScreen';

function GameRouter() {
  const { state } = useGame();
  const phase = state.game.phase;

  const screens = {
    nickname: <NicknameScreen />,
    lobby: <LobbyScreen />,
    question: <QuestionScreen />,
    feedback: <FeedbackScreen />,
    leaderboard: <LeaderboardScreen />,
    final: <FinalScreen />,
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={phase}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        {screens[phase]}
      </motion.div>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <GameProvider>
      <GameRouter />
    </GameProvider>
  );
}
