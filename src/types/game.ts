/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type RoomId = 'SALA 1' | 'SALA 2' | 'SALA 3' | 'SALA 4';

export type GameType = 'none' | 'cores' | 'verdadeiro_falso' | 'quiz' | 'forca' | 'stop';

export interface RoomState {
  id: RoomId;
  code: string; // 4-digit PIN
  active: boolean;
  currentGame: GameType;
  themeId: string;
  phase: 'lobby' | 'question_ready' | 'question_revealed' | 'round_end';
  currentQuestionIndex: number;
  questionTimer: number; // in seconds
  isTimerRunning: boolean;

  // Specific game parameters
  cores: {
    forbiddenColor: string | null;
    roundActive: boolean;
    duration: number;
    colorOptions: string[];
  };

  forca: {
    word: string;
    category: string;
    hint1: string;
    hint2: string;
    extraHint: string;
    revealedHintsCount: number; // 0, 1, 2, 3
    guessedLetters: string[];
    maxErrors: number;
    turnTeamId?: string;
  };

  stop: {
    letter: string;
    usedLetters: string[];
    blockedLetters?: string[]; // Letras excluídas do sorteio (ex: K, W, Y, X, Z)
    categories: string[];
    timer: number;
    isStopTriggered: boolean;
    stoppedByPlayerName?: string;
    answersRevealed: boolean;
    submissions?: Record<string, StopSubmission>;
    scoresApplied?: boolean;
  };

  updatedAt: number;
}

export type PlayerMode = 'individual' | 'equipe';

export interface Player {
  id: string;
  name: string;
  roomId: RoomId;
  mode: PlayerMode;
  teamId?: string;
  score: number;
  lastActive: number;
  currentAnswer?: any;
  hasAnsweredCurrentQuestion?: boolean;
  isEliminated?: boolean;
}

export interface Team {
  id: string;
  name: string;
  roomId: RoomId;
  color: string;
  score: number;
}

export interface QuestionVF {
  id: string;
  themeId: string;
  question: string;
  answer: boolean; // true = Verdadeiro, false = Falso
  explanation?: string;
}

export interface QuestionQuiz {
  id: string;
  themeId: string;
  question: string;
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  correct: 'A' | 'B' | 'C' | 'D';
  explanation?: string;
}

export interface ForcaWordItem {
  id: string;
  word: string;
  category: string;
  hint1: string;
  hint2: string;
  extraHint: string;
}

export interface StopCategoryTemplate {
  id: string;
  name: string;
}

export interface Theme {
  id: string;
  name: string;
  icon?: string;
  description?: string;
}

export interface StopSubmission {
  playerId: string;
  playerName: string;
  teamId?: string;
  roomId: RoomId;
  letter: string;
  answers: Record<string, string>; // category -> word
  pointsPerCategory: Record<string, number>;
  totalPoints: number;
  approved: boolean;
}
