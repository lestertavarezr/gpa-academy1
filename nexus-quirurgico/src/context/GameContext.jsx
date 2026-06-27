import { createContext, useContext, useReducer } from 'react';
import { questions as allQuestions, AI_PLAYERS } from '../data/questions';
import { calculateScore } from '../utils/scoring';

const GameContext = createContext(null);

const initialState = {
  player: {
    nickname: '',
    avatar: '👨‍⚕️',
    score: 0,
    streak: 0,
    maxStreak: 0,
    correctAnswers: 0,
    totalAnswers: 0,
    responseTimes: [],
  },
  game: {
    phase: 'nickname',
    currentQuestion: 0,
    questions: [],
    totalQuestions: 10,
    timePerQuestion: 20,
    lastAnswerCorrect: null,
    lastScore: 0,
    selectedAnswer: null,
  },
  players: [],
  config: {
    soundEnabled: true,
    difficulty: 'mixed',
    category: 'all',
    totalQuestions: 10,
    timePerQuestion: 20,
  }
};

function pickQuestions(config) {
  let pool = [...allQuestions];
  if (config.category !== 'all') pool = pool.filter(q => q.category === config.category);
  if (config.difficulty !== 'mixed') pool = pool.filter(q => q.difficulty === config.difficulty);
  pool.sort(() => Math.random() - 0.5);
  return pool.slice(0, config.totalQuestions);
}

function initAIPlayers() {
  return AI_PLAYERS.map(p => ({ ...p, score: 0, streak: 0 }));
}

function updateAIPlayers(players, question, timePerQuestion) {
  return players.map(p => {
    const correct = Math.random() < p.skill;
    if (!correct) return { ...p, streak: 0 };
    const responseTime = 2 + Math.random() * 13;
    const timeRemaining = Math.max(0, timePerQuestion - responseTime);
    const score = calculateScore(true, timeRemaining, timePerQuestion, p.streak);
    return { ...p, score: p.score + score, streak: p.streak + 1 };
  });
}

function reducer(state, action) {
  switch (action.type) {
    case 'SET_NICKNAME':
      return { ...state, player: { ...state.player, nickname: action.nickname } };
    case 'SET_AVATAR':
      return { ...state, player: { ...state.player, avatar: action.avatar } };
    case 'UPDATE_CONFIG':
      return { ...state, config: { ...state.config, ...action.config } };
    case 'START_GAME': {
      const questions = pickQuestions(state.config);
      const players = initAIPlayers();
      return {
        ...state,
        game: {
          ...state.game,
          phase: 'question',
          currentQuestion: 0,
          questions,
          totalQuestions: questions.length,
          timePerQuestion: state.config.timePerQuestion,
          lastAnswerCorrect: null,
          lastScore: 0,
          selectedAnswer: null,
        },
        players,
        player: { ...state.player, score: 0, streak: 0, maxStreak: 0, correctAnswers: 0, totalAnswers: 0, responseTimes: [] }
      };
    }
    case 'ANSWER_QUESTION': {
      const { answerIndex, timeRemaining } = action;
      const question = state.game.questions[state.game.currentQuestion];
      const isCorrect = answerIndex === question.correct;
      const newStreak = isCorrect ? state.player.streak + 1 : 0;
      const score = calculateScore(isCorrect, timeRemaining, state.game.timePerQuestion, state.player.streak);
      const updatedPlayers = updateAIPlayers(state.players, question, state.game.timePerQuestion);
      return {
        ...state,
        player: {
          ...state.player,
          score: state.player.score + score,
          streak: newStreak,
          maxStreak: Math.max(state.player.maxStreak, newStreak),
          correctAnswers: state.player.correctAnswers + (isCorrect ? 1 : 0),
          totalAnswers: state.player.totalAnswers + 1,
          responseTimes: [...state.player.responseTimes, state.game.timePerQuestion - timeRemaining],
        },
        game: {
          ...state.game,
          phase: 'feedback',
          lastAnswerCorrect: isCorrect,
          lastScore: score,
          selectedAnswer: answerIndex,
        },
        players: updatedPlayers,
      };
    }
    case 'NEXT_QUESTION': {
      const next = state.game.currentQuestion + 1;
      const showLeaderboard = [2, 5, 8].includes(next) && next < state.game.questions.length;
      if (next >= state.game.questions.length) {
        return { ...state, game: { ...state.game, phase: 'final', currentQuestion: next } };
      }
      return {
        ...state,
        game: {
          ...state.game,
          phase: showLeaderboard ? 'leaderboard' : 'question',
          currentQuestion: next,
          lastAnswerCorrect: null,
          lastScore: 0,
          selectedAnswer: null,
        }
      };
    }
    case 'CONTINUE_FROM_LEADERBOARD':
      return { ...state, game: { ...state.game, phase: 'question', selectedAnswer: null } };
    case 'SET_PHASE':
      return { ...state, game: { ...state.game, phase: action.phase } };
    case 'RESET_GAME':
      return { ...initialState };
    default:
      return state;
  }
}

export function GameProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  return <GameContext.Provider value={{ state, dispatch }}>{children}</GameContext.Provider>;
}

export function useGame() {
  return useContext(GameContext);
}
