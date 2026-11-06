/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import confetti from 'canvas-confetti';
import { Lock, Eye, ArrowRight, ArrowLeft, Timer, Check, X } from 'lucide-react';
import { Player, QuestionQuiz, RoomState } from '../../types/game';
import { gameStateManager } from '../../services/gameStateManager';
import { sounds } from '../../utils/soundEffects';

interface JogoQuizProps {
  room: RoomState;
  isProfessor: boolean;
  currentPlayer?: Player | null;
}

export const JogoQuiz: React.FC<JogoQuizProps> = ({
  room,
  isProfessor,
  currentPlayer,
}) => {
  const questions: QuestionQuiz[] = gameStateManager.getQuizQuestions(room.themeId);
  const currentIdx = Math.min(room.currentQuestionIndex, Math.max(0, questions.length - 1));
  const currentQuestion: QuestionQuiz | undefined = questions[currentIdx];

  const [studentChoice, setStudentChoice] = React.useState<'A' | 'B' | 'C' | 'D' | null>(null);
  const [timeLeft, setTimeLeft] = React.useState<number>(room.questionTimer || 30);

  // Reset student choice on question change
  React.useEffect(() => {
    setStudentChoice(null);
    setTimeLeft(30);
  }, [room.currentQuestionIndex]);

  // Countdown timer when question is ready
  React.useEffect(() => {
    let interval: any;
    if (room.phase === 'question_ready' && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          if (prev <= 5) sounds.playTick();
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [room.phase, timeLeft]);

  // Reveal effect
  React.useEffect(() => {
    if (room.phase === 'question_revealed' && currentQuestion && studentChoice && !isProfessor) {
      if (studentChoice === currentQuestion.correct) {
        sounds.playSuccess();
        try {
          confetti({
            particleCount: 60,
            spread: 70,
            origin: { y: 0.7 },
          });
        } catch {
          // ignore
        }
      } else {
        sounds.playError();
      }
    }
  }, [room.phase, currentQuestion, studentChoice, isProfessor]);

  const handleLiberarPergunta = () => {
    sounds.playClick();
    gameStateManager.resetCurrentAnswers(room.id);
    gameStateManager.updateRoom(room.id, {
      phase: 'question_ready',
      questionTimer: 30,
    });
    setTimeLeft(30);
  };

  const handleLiberarResposta = () => {
    sounds.playSuccess();
    gameStateManager.updateRoom(room.id, {
      phase: 'question_revealed',
    });
  };

  const handleNextQuestion = () => {
    sounds.playClick();
    if (currentIdx < questions.length - 1) {
      gameStateManager.resetCurrentAnswers(room.id);
      gameStateManager.updateRoom(room.id, {
        currentQuestionIndex: currentIdx + 1,
        phase: 'lobby',
      });
    }
  };

  const handlePrevQuestion = () => {
    sounds.playClick();
    if (currentIdx > 0) {
      gameStateManager.resetCurrentAnswers(room.id);
      gameStateManager.updateRoom(room.id, {
        currentQuestionIndex: currentIdx - 1,
        phase: 'lobby',
      });
    }
  };

  const handleStudentAnswer = (letter: 'A' | 'B' | 'C' | 'D') => {
    if (isProfessor) return;
    if (room.phase !== 'question_ready') return;
    if (studentChoice !== null) return;

    setStudentChoice(letter);
    sounds.playClick();

    if (currentPlayer) {
      gameStateManager.submitPlayerAnswer(currentPlayer.id, letter);
      if (currentQuestion && letter === currentQuestion.correct) {
        // Speed bonus: base 10 + up to 5 points based on remaining time
        const speedBonus = Math.min(5, Math.floor(timeLeft / 6));
        gameStateManager.updatePlayerScore(currentPlayer.id, 10 + speedBonus);
      }
    }
  };

  if (!currentQuestion) {
    return (
      <div className="text-center py-12 text-slate-400">
        <p className="font-['Lilita_One',sans-serif] text-xl text-rose-400">
          Nenhuma pergunta de Quiz para este tema!
        </p>
        <p className="text-xs mt-2">
          {isProfessor ? 'Importe uma planilha ou cadastre perguntas no painel.' : 'Aguardando o professor.'}
        </p>
      </div>
    );
  }

  const isQuestionVisible = isProfessor || room.phase === 'question_ready' || room.phase === 'question_revealed';
  const isAnswerRevealed = room.phase === 'question_revealed';

  // Palette alternating between green and pink/magenta as specified: "Os botões ficam em verde e rosa"
  const optionStyles = {
    A: {
      bg: 'from-emerald-400 to-green-600 border-green-900',
      activeRing: 'ring-emerald-400',
      badge: 'bg-emerald-950 text-emerald-300 border-emerald-400',
    },
    B: {
      bg: 'from-pink-500 to-rose-600 border-pink-950',
      activeRing: 'ring-pink-400',
      badge: 'bg-pink-950 text-pink-300 border-pink-400',
    },
    C: {
      bg: 'from-cyan-400 to-blue-600 border-blue-900',
      activeRing: 'ring-cyan-400',
      badge: 'bg-cyan-950 text-cyan-300 border-cyan-400',
    },
    D: {
      bg: 'from-purple-500 to-violet-600 border-purple-950',
      activeRing: 'ring-purple-400',
      badge: 'bg-purple-950 text-purple-300 border-purple-400',
    },
  };

  return (
    <div className="flex flex-col items-center justify-center p-3 md:p-6 max-w-2xl mx-auto w-full select-none">
      {/* Title Header */}
      <div className="text-center mb-3">
        <div className="inline-block px-4 py-1.5 rounded-full bg-slate-900/80 border border-pink-500/50 text-pink-300 font-['Lilita_One',sans-serif] text-xs md:text-sm uppercase tracking-widest shadow-lg">
          QUESTÃO {currentIdx + 1} DE {questions.length}
        </div>
        <h2 className="mt-2 text-2xl md:text-3xl font-['Lilita_One',sans-serif] tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-yellow-300 to-purple-400 uppercase drop-shadow">
          QUIZ DO DIA?
        </h2>
      </div>

      {/* Timer Bar */}
      {isQuestionVisible && (
        <div className="flex items-center gap-2 mb-3 px-3 py-1 rounded-full bg-slate-900 border border-slate-700 text-xs font-bold text-amber-300">
          <Timer className="w-4 h-4 text-amber-400 animate-pulse" />
          <span>TEMPO: 00:{timeLeft.toString().padStart(2, '0')}</span>
        </div>
      )}

      {/* Main Question Card with synthwave styling */}
      <div className="w-full relative rounded-3xl bg-gradient-to-b from-slate-900 via-purple-950 to-slate-950 p-6 md:p-8 border-2 border-purple-500/50 shadow-[0_10px_35px_rgba(168,85,247,0.3)] mb-6">
        <div className="min-h-[80px] flex items-center justify-center text-center">
          {isQuestionVisible ? (
            <p className="text-lg md:text-2xl font-bold text-white leading-relaxed tracking-wide drop-shadow">
              {currentQuestion.question}
            </p>
          ) : (
            <div className="flex flex-col items-center gap-2 py-4 text-slate-400">
              <Lock className="w-8 h-8 text-pink-400 animate-bounce" />
              <p className="font-['Lilita_One',sans-serif] text-base text-pink-300 uppercase">
                Aguardando o professor liberar a pergunta...
              </p>
            </div>
          )}
        </div>

        {/* Revealed correct banner */}
        {isAnswerRevealed && (
          <div className="mt-4 p-3 rounded-2xl bg-emerald-500/20 border border-emerald-400 text-center animate-bounce">
            <span className="font-['Lilita_One',sans-serif] text-base text-emerald-300 uppercase">
              ALTERNATIVA CORRETA: {currentQuestion.correct} — {currentQuestion.options[currentQuestion.correct]}
            </span>
          </div>
        )}
      </div>

      {/* 4 Alternative Buttons: A, B, C, D */}
      <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-3.5 mb-6">
        {(['A', 'B', 'C', 'D'] as const).map((letter) => {
          const style = optionStyles[letter];
          const isSelected = studentChoice === letter;
          const isCorrect = isAnswerRevealed && currentQuestion.correct === letter;

          return (
            <button
              key={letter}
              onClick={() => handleStudentAnswer(letter)}
              disabled={!isQuestionVisible || isProfessor || isAnswerRevealed || studentChoice !== null}
              className={`relative flex items-center gap-3 p-4 md:p-5 rounded-2xl font-bold text-base md:text-lg text-white uppercase tracking-wide border-b-[5px] transition-all shadow-lg text-left ${
                isSelected
                  ? 'brightness-125 scale-[1.02] ring-4 ring-white'
                  : `bg-gradient-to-b ${style.bg} hover:brightness-110 active:border-b-0 active:translate-y-1`
              } ${isCorrect ? 'ring-4 ring-emerald-300 animate-pulse' : ''} ${
                (!isQuestionVisible || studentChoice !== null) && !isAnswerRevealed ? 'opacity-85' : ''
              }`}
            >
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center font-['Lilita_One',sans-serif] text-lg border-2 ${style.badge}`}
              >
                {letter}
              </div>
              <span className="flex-1 drop-shadow">{currentQuestion.options[letter]}</span>
              {isAnswerRevealed && isCorrect && <Check className="w-6 h-6 text-white stroke-[3]" />}
            </button>
          );
        })}
      </div>

      {/* Teacher Controls (Section 3.5 & 6.3) */}
      {isProfessor && (
        <div className="w-full bg-slate-900/90 border-2 border-pink-500/50 rounded-2xl p-4 shadow-xl flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrevQuestion}
              disabled={currentIdx === 0}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 transition"
              title="Pergunta Anterior"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-bold text-slate-400">
              {currentIdx + 1} / {questions.length}
            </span>
            <button
              onClick={handleNextQuestion}
              disabled={currentIdx >= questions.length - 1}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 transition"
              title="Próxima Pergunta"
            >
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleLiberarPergunta}
              className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-b from-cyan-400 to-blue-600 text-white font-['Lilita_One',sans-serif] text-sm uppercase tracking-wide border-b-4 border-blue-900 active:translate-y-1 shadow transition hover:brightness-110"
            >
              <Lock className="w-4 h-4" />
              <span>LIBERAR PERGUNTA</span>
            </button>

            <button
              onClick={handleLiberarResposta}
              className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-b from-amber-400 to-orange-500 text-slate-950 font-['Lilita_One',sans-serif] text-sm uppercase tracking-wide border-b-4 border-amber-800 active:translate-y-1 shadow transition hover:brightness-110"
            >
              <Eye className="w-4 h-4" />
              <span>LIBERAR</span>
            </button>
          </div>
        </div>
      )}

      {/* Student submitted banner */}
      {!isProfessor && studentChoice !== null && !isAnswerRevealed && (
        <div className="text-center text-xs text-pink-300 font-bold bg-pink-500/10 border border-pink-500/30 px-4 py-2 rounded-xl animate-pulse">
          ✓ Você escolheu a alternativa <strong>{studentChoice}</strong>! Aguarde a revelação do professor.
        </div>
      )}
    </div>
  );
};
