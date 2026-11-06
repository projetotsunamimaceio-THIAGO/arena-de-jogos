/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import confetti from 'canvas-confetti';
import { Check, X, Lock, Eye, ArrowRight, ArrowLeft, Trophy, Sparkles } from 'lucide-react';
import { Player, QuestionVF, RoomState } from '../../types/game';
import { gameStateManager } from '../../services/gameStateManager';
import { sounds } from '../../utils/soundEffects';

interface JogoVerdadeiroFalsoProps {
  room: RoomState;
  isProfessor: boolean;
  currentPlayer?: Player | null;
}

export const JogoVerdadeiroFalso: React.FC<JogoVerdadeiroFalsoProps> = ({
  room,
  isProfessor,
  currentPlayer,
}) => {
  const questions: QuestionVF[] = gameStateManager.getVFQuestions(room.themeId);
  const currentIdx = Math.min(room.currentQuestionIndex, Math.max(0, questions.length - 1));
  const currentQuestion: QuestionVF | undefined = questions[currentIdx];

  const [studentChoice, setStudentChoice] = React.useState<boolean | null>(null);

  // Reset student choice when question changes
  React.useEffect(() => {
    setStudentChoice(null);
  }, [room.currentQuestionIndex]);

  // When teacher reveals answer, play fanfare/sound if student got it right
  React.useEffect(() => {
    if (room.phase === 'question_revealed' && currentQuestion && studentChoice !== null && !isProfessor) {
      if (studentChoice === currentQuestion.answer) {
        sounds.playSuccess();
        try {
          confetti({
            particleCount: 50,
            spread: 60,
            origin: { y: 0.7 },
          });
        } catch {
          // ignore confetti if canvas not ready
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
      isTimerRunning: true,
      questionTimer: 30,
    });
  };

  const handleLiberarResposta = () => {
    sounds.playSuccess();
    gameStateManager.updateRoom(room.id, {
      phase: 'question_revealed',
      isTimerRunning: false,
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

  const handleStudentAnswer = (choice: boolean) => {
    if (isProfessor) return;
    if (room.phase !== 'question_ready') return;
    if (studentChoice !== null) return; // already answered

    setStudentChoice(choice);
    sounds.playClick();

    if (currentPlayer) {
      gameStateManager.submitPlayerAnswer(currentPlayer.id, choice);
      // If student was right, award points
      if (currentQuestion && choice === currentQuestion.answer) {
        gameStateManager.updatePlayerScore(currentPlayer.id, 10);
      }
    }
  };

  if (!currentQuestion) {
    return (
      <div className="text-center py-12 text-slate-400">
        <p className="font-['Lilita_One',sans-serif] text-xl text-rose-400">
          Nenhuma pergunta cadastrada para este tema!
        </p>
        <p className="text-xs mt-2">
          {isProfessor
            ? 'Importe uma planilha .xlsx ou selecione outro tema no painel do professor.'
            : 'Aguardando o professor carregar as perguntas.'}
        </p>
      </div>
    );
  }

  const isQuestionVisible = isProfessor || room.phase === 'question_ready' || room.phase === 'question_revealed';
  const isAnswerRevealed = room.phase === 'question_revealed';

  return (
    <div className="flex flex-col items-center justify-center p-3 md:p-6 max-w-2xl mx-auto w-full select-none">
      {/* Game Card Header */}
      <div className="text-center mb-4">
        <div className="inline-block px-4 py-1.5 rounded-full bg-slate-900/80 border border-emerald-500/50 text-emerald-300 font-['Lilita_One',sans-serif] text-xs md:text-sm uppercase tracking-widest shadow-lg">
          QUESTÃO {currentIdx + 1} DE {questions.length}
        </div>
        <h2 className="mt-2 text-2xl md:text-3xl font-['Lilita_One',sans-serif] tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-yellow-300 to-rose-400 uppercase drop-shadow">
          VERDADEIRO OU FALSO?
        </h2>
      </div>

      {/* Main Question Card with synthwave/purple neon frame */}
      <div className="w-full relative rounded-3xl bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-950 p-6 md:p-8 border-2 border-indigo-500/50 shadow-[0_10px_35px_rgba(79,70,229,0.3)] mb-6">
        <div className="min-h-[100px] flex items-center justify-center text-center">
          {isQuestionVisible ? (
            <p className="text-lg md:text-2xl font-bold text-white leading-relaxed tracking-wide drop-shadow">
              "{currentQuestion.question}"
            </p>
          ) : (
            <div className="flex flex-col items-center gap-3 py-4 text-slate-400">
              <Lock className="w-8 h-8 text-amber-400 animate-bounce" />
              <p className="font-['Lilita_One',sans-serif] text-base text-amber-300 uppercase">
                Aguardando o professor liberar a pergunta...
              </p>
            </div>
          )}
        </div>

        {/* Answer Reveal Banner */}
        {isAnswerRevealed && (
          <div
            className={`mt-6 p-4 rounded-2xl border-2 text-center transition-all animate-bounce ${
              currentQuestion.answer
                ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300'
                : 'bg-rose-500/20 border-rose-400 text-rose-300'
            }`}
          >
            <div className="font-['Lilita_One',sans-serif] text-xl uppercase tracking-wider flex items-center justify-center gap-2">
              {currentQuestion.answer ? (
                <>
                  <Check className="w-6 h-6 text-emerald-400" /> RESPOSTA: É VERDADEIRO!
                </>
              ) : (
                <>
                  <X className="w-6 h-6 text-rose-400" /> RESPOSTA: É FALSO!
                </>
              )}
            </div>
            {currentQuestion.explanation && (
              <p className="text-xs text-slate-300 mt-1 font-semibold">{currentQuestion.explanation}</p>
            )}
          </div>
        )}
      </div>

      {/* Two Big Answer Buttons: VERDADEIRO (Green) & FALSO (Pink/Red) */}
      <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        {/* VERDADEIRO */}
        <button
          onClick={() => handleStudentAnswer(true)}
          disabled={!isQuestionVisible || isProfessor || isAnswerRevealed || studentChoice !== null}
          className={`relative group flex items-center justify-center gap-3 p-5 md:p-6 rounded-3xl font-['Lilita_One',sans-serif] text-xl md:text-2xl uppercase tracking-wider transition-all border-b-[6px] shadow-lg ${
            studentChoice === true
              ? 'bg-emerald-400 text-slate-950 border-emerald-700 scale-105 shadow-emerald-500/50'
              : 'bg-gradient-to-b from-emerald-400 to-green-600 text-white border-green-900 active:border-b-0 active:translate-y-1.5 hover:brightness-110 shadow-green-500/30'
          } ${isAnswerRevealed && currentQuestion.answer ? 'ring-4 ring-emerald-300 animate-pulse' : ''} ${
            (!isQuestionVisible || studentChoice !== null) && !isAnswerRevealed ? 'opacity-80' : ''
          }`}
        >
          <div className="p-2 rounded-full bg-black/20">
            <Check className="w-7 h-7 text-white stroke-[3]" />
          </div>
          <span>VERDADEIRO</span>
        </button>

        {/* FALSO */}
        <button
          onClick={() => handleStudentAnswer(false)}
          disabled={!isQuestionVisible || isProfessor || isAnswerRevealed || studentChoice !== null}
          className={`relative group flex items-center justify-center gap-3 p-5 md:p-6 rounded-3xl font-['Lilita_One',sans-serif] text-xl md:text-2xl uppercase tracking-wider transition-all border-b-[6px] shadow-lg ${
            studentChoice === false
              ? 'bg-rose-400 text-white border-rose-800 scale-105 shadow-rose-500/50'
              : 'bg-gradient-to-b from-rose-500 to-red-600 text-white border-red-950 active:border-b-0 active:translate-y-1.5 hover:brightness-110 shadow-rose-500/30'
          } ${isAnswerRevealed && !currentQuestion.answer ? 'ring-4 ring-rose-300 animate-pulse' : ''} ${
            (!isQuestionVisible || studentChoice !== null) && !isAnswerRevealed ? 'opacity-80' : ''
          }`}
        >
          <div className="p-2 rounded-full bg-black/20">
            <X className="w-7 h-7 text-white stroke-[3]" />
          </div>
          <span>FALSO</span>
        </button>
      </div>

      {/* Professor Controls (Section 3.5 & 6.2) */}
      {isProfessor && (
        <div className="w-full bg-slate-900/90 border-2 border-emerald-500/50 rounded-2xl p-4 shadow-xl flex flex-wrap items-center justify-between gap-3">
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
            {/* LIBERAR PERGUNTA (Blue with lock) */}
            <button
              onClick={handleLiberarPergunta}
              className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-b from-cyan-400 to-blue-600 text-white font-['Lilita_One',sans-serif] text-sm uppercase tracking-wide border-b-4 border-blue-900 active:translate-y-1 shadow transition hover:brightness-110"
            >
              <Lock className="w-4 h-4" />
              <span>LIBERAR PERGUNTA</span>
            </button>

            {/* LIBERAR (Orange with eye) */}
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

      {/* Student answer status feedback */}
      {!isProfessor && studentChoice !== null && !isAnswerRevealed && (
        <div className="text-center text-xs text-amber-300 font-bold bg-amber-500/10 border border-amber-500/30 px-4 py-2 rounded-xl animate-pulse">
          ✓ Sua resposta foi registrada! Aguarde o professor revelar o gabarito.
        </div>
      )}
    </div>
  );
};
