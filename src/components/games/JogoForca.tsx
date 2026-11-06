/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import confetti from 'canvas-confetti';
import { Heart, Sparkles, HelpCircle, Send, Key, RotateCcw } from 'lucide-react';
import { ForcaWordItem, Player, RoomState, Team } from '../../types/game';
import { gameStateManager } from '../../services/gameStateManager';
import { sounds } from '../../utils/soundEffects';

interface JogoForcaProps {
  room: RoomState;
  isProfessor: boolean;
  currentPlayer?: Player | null;
  teams?: Team[];
}

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

export const JogoForca: React.FC<JogoForcaProps> = ({
  room,
  isProfessor,
  currentPlayer,
  teams = [],
}) => {
  const words = gameStateManager.getForcaWords();
  const forcaState = room.forca;
  const targetWord = (forcaState.word || 'AMAZONIA').toUpperCase();

  const [guessModalOpen, setGuessModalOpen] = React.useState(false);
  const [guessInput, setGuessInput] = React.useState('');

  const guessedLetters = forcaState.guessedLetters || [];

  // Calculate wrong guesses
  const wrongLetters = guessedLetters.filter((l) => !targetWord.includes(l));
  const correctLetters = guessedLetters.filter((l) => targetWord.includes(l));
  const errorsCount = wrongLetters.length;
  const maxErrors = forcaState.maxErrors || 6;
  const isGameOver = errorsCount >= maxErrors;

  // Check if all letters guessed
  const uniqueTargetLetters = Array.from(new Set(targetWord.split('')));
  const isWon = uniqueTargetLetters.every((l) => guessedLetters.includes(l));

  // Play win/lose sounds
  React.useEffect(() => {
    if (isWon) {
      sounds.playSuccess();
      try {
        confetti({ particleCount: 70, spread: 80, origin: { y: 0.6 } });
      } catch {}
    } else if (isGameOver) {
      sounds.playError();
    }
  }, [isWon, isGameOver]);

  const handleGuessLetter = (letter: string) => {
    if (isGameOver || isWon) return;
    if (guessedLetters.includes(letter)) return;

    sounds.playClick();
    const isHit = targetWord.includes(letter);
    if (isHit) {
      sounds.playSuccess();
      if (currentPlayer) gameStateManager.updatePlayerScore(currentPlayer.id, 5);
    } else {
      sounds.playError();
    }

    const updated = [...guessedLetters, letter];
    gameStateManager.updateRoom(room.id, {
      forca: {
        ...forcaState,
        guessedLetters: updated,
      },
    });
  };

  const handleLiberarDica = () => {
    sounds.playClick();
    const currentHints = forcaState.revealedHintsCount || 0;
    const nextHints = Math.min(3, currentHints + 1);

    gameStateManager.updateRoom(room.id, {
      forca: {
        ...forcaState,
        revealedHintsCount: nextHints,
      },
    });
  };

  const handleChutarPalavra = (e: React.FormEvent) => {
    e.preventDefault();
    if (!guessInput.trim()) return;

    const cleaned = guessInput.trim().toUpperCase();
    setGuessModalOpen(false);

    if (cleaned === targetWord) {
      sounds.playSuccess();
      try {
        confetti({ particleCount: 100, spread: 100, origin: { y: 0.5 } });
      } catch {}

      if (currentPlayer) gameStateManager.updatePlayerScore(currentPlayer.id, 30);

      // reveal all letters
      gameStateManager.updateRoom(room.id, {
        forca: {
          ...forcaState,
          guessedLetters: Array.from(new Set([...guessedLetters, ...targetWord.split('')])),
        },
      });
    } else {
      sounds.playError();
      if (currentPlayer) gameStateManager.updatePlayerScore(currentPlayer.id, -5);

      // Add a penalty wrong guess
      const randomWrong = 'XYZ'.split('').find((l) => !targetWord.includes(l) && !guessedLetters.includes(l)) || 'Z';
      gameStateManager.updateRoom(room.id, {
        forca: {
          ...forcaState,
          guessedLetters: [...guessedLetters, randomWrong],
        },
      });
    }
    setGuessInput('');
  };

  const handleResetForca = () => {
    sounds.playClick();
    const randomWord = words[Math.floor(Math.random() * words.length)] || {
      word: 'AMAZONIA',
      category: 'Geografia',
      hint1: 'Um país muito grande na América do Sul.',
      hint2: 'Tem a maior floresta tropical do mundo.',
      extraHint: 'Se estende por 9 países.',
    };

    gameStateManager.updateRoom(room.id, {
      forca: {
        word: randomWord.word,
        category: randomWord.category,
        hint1: randomWord.hint1,
        hint2: randomWord.hint2,
        extraHint: randomWord.extraHint,
        revealedHintsCount: 1,
        guessedLetters: [],
        maxErrors: 6,
      },
    });
  };

  return (
    <div className="flex flex-col items-center justify-center p-3 md:p-6 max-w-3xl mx-auto w-full select-none">
      {/* Title */}
      <div className="text-center mb-3">
        <div className="inline-block px-4 py-1 rounded-full bg-slate-900 border border-amber-400/50 text-amber-300 font-['Lilita_One',sans-serif] text-xs uppercase tracking-widest shadow">
          JOGO DA FORCA
        </div>
        <h2 className="mt-1 text-2xl md:text-3xl font-['Lilita_One',sans-serif] text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-rose-400 to-purple-400 uppercase drop-shadow">
          DESCUBRA A PALAVRA SECRETA!
        </h2>
      </div>

      {/* Main Game Screen Card */}
      <div className="w-full bg-gradient-to-b from-slate-900 via-purple-950 to-slate-950 rounded-3xl border-2 border-purple-500/50 p-4 md:p-6 shadow-[0_10px_35px_rgba(168,85,247,0.25)] space-y-4">
        {/* Top Status Bar: Errors with Heart icon */}
        <div className="flex items-center justify-between border-b border-purple-500/30 pb-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-300">CATEGORIA:</span>
            <span className="px-3 py-1 rounded-full bg-amber-400/20 border border-amber-400/50 text-amber-300 font-bold text-xs uppercase">
              {forcaState.category || 'Geral'}
            </span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/20 border border-rose-500/50 text-rose-300 font-['Lilita_One',sans-serif] text-sm">
            <Heart className="w-4 h-4 text-rose-400 fill-rose-400 animate-pulse" />
            <span>
              ERROS: {errorsCount} / {maxErrors}
            </span>
          </div>
        </div>

        {/* Gallows Stickman SVG Illustration */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 py-2">
          {/* Neon Gallows SVG */}
          <div className="w-44 h-48 bg-slate-950/70 border border-purple-500/30 rounded-2xl flex items-center justify-center p-2 shadow-inner">
            <svg viewBox="0 0 100 120" className="w-full h-full stroke-cyan-400 stroke-2 fill-none stroke-linecap-round">
              {/* Base */}
              <line x1="10" y1="110" x2="60" y2="110" stroke="#a855f7" strokeWidth="3" />
              {/* Pole */}
              <line x1="25" y1="110" x2="25" y2="15" stroke="#a855f7" strokeWidth="3" />
              {/* Top beam */}
              <line x1="25" y1="15" x2="70" y2="15" stroke="#a855f7" strokeWidth="3" />
              {/* Rope */}
              <line x1="70" y1="15" x2="70" y2="35" stroke="#eab308" strokeWidth="2" />

              {/* Head (Error 1) */}
              {errorsCount >= 1 && <circle cx="70" cy="45" r="10" stroke="#f43f5e" strokeWidth="2.5" />}
              {/* Body (Error 2) */}
              {errorsCount >= 2 && <line x1="70" y1="55" x2="70" y2="80" stroke="#f43f5e" strokeWidth="2.5" />}
              {/* Left Arm (Error 3) */}
              {errorsCount >= 3 && <line x1="70" y1="62" x2="55" y2="72" stroke="#f43f5e" strokeWidth="2.5" />}
              {/* Right Arm (Error 4) */}
              {errorsCount >= 4 && <line x1="70" y1="62" x2="85" y2="72" stroke="#f43f5e" strokeWidth="2.5" />}
              {/* Left Leg (Error 5) */}
              {errorsCount >= 5 && <line x1="70" y1="80" x2="58" y2="100" stroke="#f43f5e" strokeWidth="2.5" />}
              {/* Right Leg (Error 6) */}
              {errorsCount >= 6 && <line x1="70" y1="80" x2="82" y2="100" stroke="#f43f5e" strokeWidth="2.5" />}
            </svg>
          </div>

          {/* Word Blanks Display (ex: _ _ _ O O _ I _ A) */}
          <div className="flex-1 flex flex-col items-center sm:items-start">
            <div className="text-xs text-slate-400 font-bold uppercase mb-2">PALAVRA COM LACUNAS:</div>
            <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
              {targetWord.split('').map((letter, idx) => {
                const isRevealed = guessedLetters.includes(letter) || isGameOver;
                return (
                  <div
                    key={idx}
                    className={`w-9 h-11 md:w-11 md:h-13 rounded-xl border-2 flex items-center justify-center font-['Lilita_One',sans-serif] text-xl md:text-2xl transition-all shadow-md ${
                      isRevealed
                        ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                        : 'bg-slate-900 border-slate-700 text-slate-500'
                    }`}
                  >
                    {isRevealed ? letter : '_'}
                  </div>
                );
              })}
            </div>

            {/* Letras Usadas */}
            <div className="mt-4 w-full">
              <span className="text-[11px] font-bold text-slate-400 uppercase">LETRAS USADAS:</span>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {correctLetters.map((l) => (
                  <span
                    key={l}
                    className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 font-['Lilita_One',sans-serif] text-xs border border-amber-500/40"
                  >
                    {l}
                  </span>
                ))}
                {wrongLetters.map((l) => (
                  <span
                    key={l}
                    className="px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-['Lilita_One',sans-serif] text-xs border border-slate-700 line-through"
                  >
                    {l}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Quadro DICAS */}
        <div className="bg-slate-950/80 rounded-2xl p-4 border border-purple-500/30">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 font-['Lilita_One',sans-serif] text-amber-300 text-sm">
              <HelpCircle className="w-4 h-4 text-amber-400" />
              <span>QUADRO DE DICAS:</span>
            </div>
            <span className="text-[10px] text-slate-400 font-bold">
              {forcaState.revealedHintsCount || 1} DE 3 LIBERADAS
            </span>
          </div>

          <div className="space-y-1.5 text-xs text-slate-300">
            <div className="flex items-start gap-2">
              <span className="text-amber-400 font-bold">1. Categoria:</span>
              <span>{forcaState.category || 'Geral'}</span>
            </div>

            <div className="flex items-start gap-2">
              <span className="text-amber-400 font-bold">2. Dica:</span>
              <span>
                {(forcaState.revealedHintsCount || 1) >= 2 ? (
                  forcaState.hint1 || forcaState.hint2
                ) : (
                  <span className="italic text-slate-500">[Bloqueada pelo professor]</span>
                )}
              </span>
            </div>

            <div className="flex items-start gap-2">
              <span className="text-amber-400 font-bold">3. Dica extra:</span>
              <span>
                {(forcaState.revealedHintsCount || 1) >= 3 ? (
                  forcaState.extraHint || 'Dica bônus revelada!'
                ) : (
                  <span className="italic text-slate-500">[Bloqueada pelo professor]</span>
                )}
              </span>
            </div>
          </div>
        </div>

        {/* Virtual Keyboard A-Z */}
        <div className="bg-slate-950/90 rounded-2xl p-3 border border-slate-800">
          <div className="grid grid-cols-7 sm:grid-cols-9 md:grid-cols-13 gap-1">
            {ALPHABET.map((letter) => {
              const isUsed = guessedLetters.includes(letter);
              const isHit = isUsed && targetWord.includes(letter);

              return (
                <button
                  key={letter}
                  onClick={() => handleGuessLetter(letter)}
                  disabled={isUsed || isGameOver || isWon}
                  className={`h-9 rounded-lg font-['Lilita_One',sans-serif] text-xs transition-all ${
                    isUsed
                      ? isHit
                        ? 'bg-amber-500 text-slate-950 font-black'
                        : 'bg-slate-800 text-slate-600 line-through'
                      : 'bg-slate-800 hover:bg-purple-600 text-white active:scale-95'
                  }`}
                >
                  {letter}
                </button>
              );
            })}
          </div>
        </div>

        {/* Game End Banner */}
        {isWon && (
          <div className="p-3 rounded-2xl bg-emerald-500/20 border border-emerald-400 text-emerald-300 font-['Lilita_One',sans-serif] text-base text-center animate-bounce">
            🎉 PARABÉNS! A PALAVRA FOI ACERTADA: "{targetWord}"!
          </div>
        )}

        {isGameOver && (
          <div className="p-3 rounded-2xl bg-rose-500/20 border border-rose-400 text-rose-300 font-['Lilita_One',sans-serif] text-base text-center animate-pulse">
            ☠️ FORCA! A palavra secreta era: "{targetWord}".
          </div>
        )}

        {/* Controls: LIBERAR DICA (Blue) & CHUTAR PALAVRA (Orange) */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          {isProfessor ? (
            <div className="flex items-center gap-2">
              <button
                onClick={handleLiberarDica}
                disabled={(forcaState.revealedHintsCount || 1) >= 3}
                className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-b from-cyan-400 to-blue-600 text-white font-['Lilita_One',sans-serif] text-xs md:text-sm uppercase tracking-wide border-b-4 border-blue-900 active:translate-y-1 disabled:opacity-50 shadow transition hover:brightness-110"
              >
                <HelpCircle className="w-4 h-4" />
                <span>LIBERAR DICA</span>
              </button>

              <button
                onClick={handleResetForca}
                className="flex items-center gap-1.5 px-3 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 font-bold border border-slate-700 transition cursor-pointer"
                title="Sortear outra palavra aleatória do banco"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Sortear Nova
              </button>

              {words.length > 0 && (
                <select
                  onChange={(e) => {
                    const selected = words.find((w) => w.id === e.target.value);
                    if (selected) {
                      sounds.playClick();
                      gameStateManager.loadForcaWordIntoRoom(room.id, selected);
                    }
                  }}
                  value={words.find((w) => w.word.toUpperCase() === targetWord)?.id || ''}
                  className="bg-slate-800 border border-slate-700 text-xs font-bold text-amber-300 rounded-2xl px-3 py-2.5 outline-none cursor-pointer max-w-[170px] truncate"
                  title="Escolher palavra cadastrada ou importada por planilha"
                >
                  <option value="" disabled>Escolher Palavra...</option>
                  {words.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.word} ({w.category})
                    </option>
                  ))}
                </select>
              )}
            </div>
          ) : (
            <div className="text-xs text-slate-400">
              Alternem as letras ou arrisque a palavra inteira!
            </div>
          )}

          <button
            onClick={() => setGuessModalOpen(true)}
            disabled={isGameOver || isWon}
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-b from-amber-400 to-orange-500 text-slate-950 font-['Lilita_One',sans-serif] text-xs md:text-sm uppercase tracking-wide border-b-4 border-amber-800 active:translate-y-1 shadow transition hover:brightness-110 disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
            <span>CHUTAR PALAVRA</span>
          </button>
        </div>
      </div>

      {/* Chutar Palavra Modal */}
      {guessModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleChutarPalavra}
            className="w-full max-w-md bg-slate-900 border-2 border-amber-400 rounded-3xl p-6 shadow-2xl space-y-4"
          >
            <h3 className="font-['Lilita_One',sans-serif] text-xl text-amber-300 uppercase">
              CHUTAR A PALAVRA INTEIRA
            </h3>
            <p className="text-xs text-slate-300">
              Cuidado: acertar dá <strong>+30 pontos</strong>, mas errar desconta 5 pontos e adiciona um erro na forca!
            </p>

            <input
              type="text"
              placeholder="Digite seu palpite aqui..."
              value={guessInput}
              onChange={(e) => setGuessInput(e.target.value)}
              autoFocus
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-lg font-['Lilita_One',sans-serif] text-amber-300 uppercase tracking-widest outline-none focus:border-amber-400"
            />

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setGuessModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-6 py-2 rounded-xl bg-gradient-to-b from-amber-400 to-orange-500 text-slate-950 font-['Lilita_One',sans-serif] text-sm uppercase shadow"
              >
                Confirmar Chute
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
