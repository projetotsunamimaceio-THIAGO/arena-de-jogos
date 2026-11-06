/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import confetti from 'canvas-confetti';
import {
  Timer,
  AlertOctagon,
  CheckCircle2,
  RotateCcw,
  Shuffle,
  Sparkles,
  BookOpen,
  Trophy,
  Users,
  Award,
  Check,
  X,
  AlertCircle,
  HelpCircle,
  Ban,
  Settings2,
} from 'lucide-react';
import { Player, RoomState, StopSubmission } from '../../types/game';
import {
  DEFAULT_STOP_CATEGORIES,
  DEFAULT_BLOCKED_LETTERS,
  gameStateManager,
} from '../../services/gameStateManager';
import { sounds } from '../../utils/soundEffects';

interface JogoStopProps {
  room: RoomState;
  isProfessor: boolean;
  currentPlayer?: Player | null;
}

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

export const JogoStop: React.FC<JogoStopProps> = ({
  room,
  isProfessor,
  currentPlayer,
}) => {
  const stopState = room.stop;
  const currentLetter = (stopState.letter || 'B').toUpperCase();
  const categories = stopState.categories || DEFAULT_STOP_CATEGORIES;
  const blockedLetters = stopState.blockedLetters || DEFAULT_BLOCKED_LETTERS;
  const submissions: Record<string, StopSubmission> = stopState.submissions || {};

  const [showBlockedModal, setShowBlockedModal] = React.useState(false);

  // Local student answers
  const [answers, setAnswers] = React.useState<Record<string, string>>(() => {
    if (currentPlayer && submissions[currentPlayer.id]) {
      return submissions[currentPlayer.id].answers || {};
    }
    return {};
  });

  const [timerLeft, setTimerLeft] = React.useState<number>(stopState.timer || 84);

  // Sync student answers with remote submission
  React.useEffect(() => {
    if (currentPlayer && submissions[currentPlayer.id]) {
      setAnswers(submissions[currentPlayer.id].answers || {});
    }
  }, [currentPlayer, stopState.letter]);

  // Timer countdown
  React.useEffect(() => {
    let interval: any;
    if (!stopState.isStopTriggered && !stopState.answersRevealed && timerLeft > 0) {
      interval = setInterval(() => {
        setTimerLeft((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            sounds.playStopAlert();
            return 0;
          }
          if (prev <= 5) sounds.playTick();
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [stopState.isStopTriggered, stopState.answersRevealed, timerLeft]);

  // When timer hits 0, trigger Stop
  React.useEffect(() => {
    if (timerLeft === 0 && !stopState.isStopTriggered && !stopState.answersRevealed && isProfessor) {
      handleTriggerStop();
    }
  }, [timerLeft, stopState.isStopTriggered, stopState.answersRevealed, isProfessor]);

  const handleInputChange = (cat: string, value: string) => {
    if (stopState.isStopTriggered || stopState.answersRevealed) return;

    const updated = {
      ...answers,
      [cat]: value.toUpperCase(),
    };
    setAnswers(updated);

    // Sync to room submissions so professor sees in real-time
    if (currentPlayer) {
      gameStateManager.submitStopAnswers(
        room.id,
        currentPlayer.id,
        currentPlayer.name,
        updated,
        currentPlayer.teamId
      );
    }
  };

  const handleTriggerStop = () => {
    sounds.playStopAlert();

    // Submit final answers before stopping
    if (currentPlayer) {
      gameStateManager.submitStopAnswers(
        room.id,
        currentPlayer.id,
        currentPlayer.name,
        answers,
        currentPlayer.teamId
      );
    }

    gameStateManager.updateRoom(room.id, {
      stop: {
        ...stopState,
        isStopTriggered: true,
        stoppedByPlayerName: currentPlayer?.name || (isProfessor ? 'PROFESSOR' : 'ALUNO'),
      },
    });

    // Automatically trigger evaluation for the teacher to review
    setTimeout(() => {
      gameStateManager.evaluateStopSubmissions(room.id);
    }, 300);
  };

  const handleSorteiaLetra = () => {
    sounds.playClick();
    const currentBlocked = stopState.blockedLetters || DEFAULT_BLOCKED_LETTERS;

    // Filter letters that are neither used nor blocked
    let available = ALPHABET.filter(
      (l) => !stopState.usedLetters?.includes(l) && !currentBlocked.includes(l)
    );

    // If all eligible letters have been used, recycle the pool (still excluding blocked letters!)
    let resetUsed = false;
    if (available.length === 0) {
      available = ALPHABET.filter((l) => !currentBlocked.includes(l));
      resetUsed = true;
    }

    const nextLetter = available.length > 0
      ? available[Math.floor(Math.random() * available.length)]
      : 'A';

    setAnswers({});
    setTimerLeft(84);

    gameStateManager.updateRoom(room.id, {
      stop: {
        ...stopState,
        letter: nextLetter,
        categories: [...DEFAULT_STOP_CATEGORIES],
        usedLetters: resetUsed
          ? [nextLetter]
          : [...(stopState.usedLetters || []), nextLetter],
        isStopTriggered: false,
        answersRevealed: false,
        scoresApplied: false,
        stoppedByPlayerName: undefined,
        submissions: {},
        timer: 84,
      },
    });
  };

  const handleToggleLetter = (letter: string) => {
    sounds.playClick();
    gameStateManager.toggleStopBlockedLetter(room.id, letter);
  };

  const handleSetPreset = (preset: 'dificeis' | 'raras' | 'todas') => {
    sounds.playClick();
    if (preset === 'dificeis') {
      gameStateManager.setStopBlockedLetters(room.id, ['K', 'W', 'Y', 'X', 'Z']);
    } else if (preset === 'raras') {
      gameStateManager.setStopBlockedLetters(room.id, ['K', 'W', 'Y', 'X', 'Z', 'Q']);
    } else {
      gameStateManager.setStopBlockedLetters(room.id, []);
    }
  };

  const handleLiberarCorrecao = () => {
    sounds.playSuccess();
    gameStateManager.evaluateStopSubmissions(room.id);
  };

  const handleOverrideScore = (playerId: string, category: string, points: number) => {
    sounds.playClick();
    gameStateManager.overrideStopCategoryPoints(room.id, playerId, category, points);
  };

  const handleApplyScores = () => {
    sounds.playSuccess();
    try {
      confetti({ particleCount: 80, spread: 90, origin: { y: 0.6 } });
    } catch {}
    gameStateManager.applyStopScoresToRoom(room.id);
  };

  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const mySubmission = currentPlayer ? submissions[currentPlayer.id] : null;
  const submissionsList = Object.values(submissions);

  return (
    <div className="flex flex-col items-center justify-center p-3 md:p-6 max-w-5xl mx-auto w-full select-none">
      {/* Top Banner & Title */}
      <div className="text-center mb-4">
        <div className="inline-block px-4 py-1.5 rounded-full bg-slate-900 border border-rose-500/50 text-rose-300 font-['Lilita_One',sans-serif] text-xs uppercase tracking-widest shadow">
          STOP / ADEDONHA!
        </div>
        <h2 className="mt-1 text-2xl md:text-3xl font-['Lilita_One',sans-serif] text-transparent bg-clip-text bg-gradient-to-r from-rose-400 via-amber-300 to-purple-400 uppercase drop-shadow">
          PREENCHA RÁPIDO COM A LETRA DO TURNO!
        </h2>
      </div>

      {/* Main Game Container */}
      <div className="w-full bg-gradient-to-b from-slate-900 via-purple-950 to-slate-950 rounded-3xl border-2 border-purple-500/50 p-4 md:p-6 shadow-[0_10px_35px_rgba(168,85,247,0.25)] space-y-5">
        {/* Top Control Bar: LETRA DO TURNO, TEMPO, and BIG RED STOP BUTTON */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-slate-950/80 rounded-2xl border border-purple-500/30">
          {/* Badge Letra do Turno */}
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-b from-amber-300 to-yellow-500 flex flex-col items-center justify-center border-b-4 border-amber-700 shadow-lg">
              <span className="text-[9px] font-black text-slate-950 tracking-tighter">LETRA</span>
              <span className="font-['Lilita_One',sans-serif] text-3xl text-slate-950 leading-none">
                {currentLetter}
              </span>
            </div>

            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase">TURNO ATIVO</span>
              <div className="font-['Lilita_One',sans-serif] text-base text-amber-300">
                COMEÇA COM "{currentLetter}"
              </div>
            </div>
          </div>

          {/* Letras Proibidas Indicator & Teacher Config Button */}
          {isProfessor ? (
            <button
              type="button"
              onClick={() => setShowBlockedModal(true)}
              className="flex items-center gap-2.5 px-3.5 py-2 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-purple-500/40 hover:border-amber-400 text-xs text-slate-200 transition shadow cursor-pointer group"
              title="Configurar letras que NÃO podem ser sorteadas"
            >
              <div className="p-1.5 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30 group-hover:scale-110 transition">
                <Ban className="w-4 h-4" />
              </div>
              <div className="text-left">
                <div className="text-[10px] text-slate-400 font-bold uppercase leading-none">
                  LETRAS PROIBIDAS ({blockedLetters.length})
                </div>
                <div className="font-['Lilita_One',sans-serif] text-xs text-rose-400 tracking-wider mt-0.5">
                  {blockedLetters.length > 0 ? blockedLetters.join(', ') : 'NENHUMA'}
                </div>
              </div>
              <span className="ml-1 text-[10px] px-2 py-0.5 rounded-full bg-purple-500/30 text-amber-300 font-bold border border-purple-400/40 flex items-center gap-1">
                <Settings2 className="w-3 h-3" />
                EDITAR
              </span>
            </button>
          ) : (
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-slate-900/80 border border-slate-800 text-slate-400 text-xs">
              <Ban className="w-3.5 h-3.5 text-rose-400 shrink-0" />
              <span className="text-[11px]">
                Letras proibidas:{' '}
                <strong className="text-rose-400 font-['Lilita_One',sans-serif]">
                  {blockedLetters.length > 0 ? blockedLetters.join(', ') : 'Nenhuma'}
                </strong>
              </span>
            </div>
          )}

          {/* Cronômetro Regressivo */}
          <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-slate-900 border border-slate-700 font-['Lilita_One',sans-serif] text-lg text-amber-400 shadow">
            <Timer className="w-5 h-5 text-amber-400 animate-pulse" />
            <span>TEMPO: {formatSeconds(timerLeft)}</span>
          </div>

          {/* Botão Vermelho STOP! */}
          <button
            onClick={handleTriggerStop}
            disabled={stopState.isStopTriggered}
            className={`flex items-center gap-2 px-7 py-3 rounded-2xl font-['Lilita_One',sans-serif] text-xl uppercase tracking-widest text-white border-b-4 transition-all shadow-[0_5px_20px_rgba(239,68,68,0.4)] ${
              stopState.isStopTriggered
                ? 'bg-slate-800 border-slate-900 text-slate-500 opacity-60 cursor-not-allowed'
                : 'bg-gradient-to-b from-rose-500 via-red-600 to-red-700 border-red-950 active:translate-y-1 hover:brightness-110 cursor-pointer animate-pulse'
            }`}
          >
            <AlertOctagon className="w-6 h-6 stroke-[2.5]" />
            <span>STOP!</span>
          </button>
        </div>

        {/* STOP Triggered Alert */}
        {stopState.isStopTriggered && (
          <div className="p-3.5 rounded-2xl bg-rose-500/20 border-2 border-rose-500 text-rose-300 font-['Lilita_One',sans-serif] text-base text-center animate-bounce flex items-center justify-center gap-2">
            <AlertOctagon className="w-5 h-5 text-rose-400" />
            <span>🛑 STOP ACIONADO POR {stopState.stoppedByPlayerName || 'ALGUÉM'}! CANETAS PARA CIMA!</span>
          </div>
        )}

        {/* ========================================================================= */}
        {/* PARTE 1: VISÃO DO ALUNO — Tabela de Preenchimento / Folha de Respostas   */}
        {/* ========================================================================= */}
        {!isProfessor && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-slate-300">
              <span className="uppercase flex items-center gap-1.5">
                <Trophy className="w-4 h-4 text-amber-400" />
                SUA CARTELA DE PALAVRAS (LETRA: {currentLetter})
              </span>
              {mySubmission && stopState.answersRevealed && (
                <span className="font-['Lilita_One',sans-serif] text-emerald-400 text-sm">
                  TOTAL DESTA RODADA: +{mySubmission.totalPoints} PTS
                </span>
              )}
            </div>

            <div className="overflow-x-auto rounded-2xl border border-purple-500/30 bg-slate-950/70">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-gradient-to-r from-purple-900 via-slate-900 to-purple-900 text-amber-300 font-['Lilita_One',sans-serif] border-b border-purple-500/30">
                    {categories.map((cat) => (
                      <th key={cat} className="p-3 uppercase whitespace-nowrap">
                        {cat}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    {categories.map((cat) => {
                      const val = answers[cat] || '';
                      const pts = mySubmission?.pointsPerCategory?.[cat];
                      const isRevealed = stopState.answersRevealed;

                      return (
                        <td key={cat} className="p-2 border-r border-slate-800/80 last:border-none min-w-[140px]">
                          <input
                            type="text"
                            value={val}
                            disabled={stopState.isStopTriggered || stopState.answersRevealed}
                            onChange={(e) => handleInputChange(cat, e.target.value)}
                            placeholder={`${currentLetter}...`}
                            className={`w-full bg-slate-900 border rounded-xl px-2.5 py-2 text-xs text-white uppercase outline-none transition ${
                              isRevealed
                                ? pts === 10
                                  ? 'border-emerald-500 bg-emerald-950/40 text-emerald-300'
                                  : pts === 5
                                  ? 'border-amber-500 bg-amber-950/40 text-amber-300'
                                  : 'border-rose-500 bg-rose-950/40 text-rose-300'
                                : 'border-slate-700 focus:border-amber-400'
                            }`}
                          />

                          {/* Post-reveal score badge for student */}
                          {isRevealed && (
                            <div className="mt-1 text-center font-['Lilita_One',sans-serif] text-[11px]">
                              {pts === 10 && (
                                <span className="text-emerald-400">★ 10 PTS (ÚNICA)</span>
                              )}
                              {pts === 5 && (
                                <span className="text-amber-400">● 5 PTS (REPETIDA)</span>
                              )}
                              {(!pts || pts === 0) && (
                                <span className="text-rose-400">✕ 0 PTS (INVÁLIDA)</span>
                              )}
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* PARTE 2: VISÃO DO PROFESSOR — Mesa de Correção de Todos os Alunos        */}
        {/* ========================================================================= */}
        {isProfessor && (
          <div className="space-y-4 bg-slate-950/90 rounded-2xl p-4 md:p-5 border-2 border-purple-500/40">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-purple-500/30">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-400/30">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-['Lilita_One',sans-serif] text-lg text-amber-300 uppercase tracking-wide">
                    MESA DE CORREÇÃO DO PROFESSOR (LETRA: {currentLetter})
                  </h3>
                  <p className="text-xs text-slate-400">
                    O sistema identifica palavras repetidas (5 pts), únicas (10 pts) e inválidas (0 pts). Clique nos
                    botões de pontos para alterar manualmente qualquer resposta.
                  </p>
                </div>
              </div>

              {stopState.scoresApplied && (
                <div className="px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/50 text-emerald-300 font-bold text-xs flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" />
                  PONTOS APLICADOS AO PLACAR!
                </div>
              )}
            </div>

            {/* Submissions List / Correction Grid */}
            {submissionsList.length === 0 ? (
              <div className="text-center py-8 text-slate-500 italic text-xs">
                Nenhum aluno enviou respostas ainda nesta rodada.
              </div>
            ) : (
              <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
                {submissionsList.map((sub) => {
                  return (
                    <div
                      key={sub.playerId}
                      className="p-3.5 rounded-2xl bg-slate-900 border border-purple-500/30 space-y-2.5"
                    >
                      {/* Student Header & Total */}
                      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-['Lilita_One',sans-serif] text-base text-white uppercase">
                            {sub.playerName}
                          </span>
                          {sub.teamId && (
                            <span className="px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-cyan-300 text-[10px] font-bold">
                              EQUIPE
                            </span>
                          )}
                        </div>

                        <div className="font-['Lilita_One',sans-serif] text-sm text-emerald-400">
                          TOTAL DA RODADA:{' '}
                          <span className="text-base font-extrabold text-amber-300">
                            {sub.totalPoints} PTS
                          </span>
                        </div>
                      </div>

                      {/* Categories Correction Row */}
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
                        {categories.map((cat) => {
                          const word = (sub.answers[cat] || '').trim();
                          const pts = sub.pointsPerCategory?.[cat] ?? 0;

                          return (
                            <div
                              key={cat}
                              className={`p-2.5 rounded-xl border flex flex-col justify-between transition-all ${
                                pts === 10
                                  ? 'bg-emerald-950/40 border-emerald-500/50'
                                  : pts === 5
                                  ? 'bg-amber-950/40 border-amber-500/50'
                                  : 'bg-rose-950/30 border-rose-500/40'
                              }`}
                            >
                              <div>
                                <span className="text-[9px] font-bold text-slate-400 uppercase truncate block">
                                  {cat}
                                </span>
                                <span className="font-['Lilita_One',sans-serif] text-xs text-white truncate block my-1">
                                  {word || <em className="text-slate-600 font-normal">Vazio</em>}
                                </span>
                              </div>

                              {/* Interactive Override Buttons: [0] [5] [10] */}
                              <div className="flex items-center justify-between gap-1 pt-1.5 border-t border-slate-800/80">
                                <button
                                  type="button"
                                  onClick={() => handleOverrideScore(sub.playerId, cat, 0)}
                                  className={`flex-1 py-0.5 rounded text-[10px] font-bold transition ${
                                    pts === 0
                                      ? 'bg-rose-500 text-white font-black ring-1 ring-white'
                                      : 'bg-slate-800 text-slate-400 hover:text-white'
                                  }`}
                                  title="Marcar como 0 pontos (errada ou vazia)"
                                >
                                  0
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleOverrideScore(sub.playerId, cat, 5)}
                                  className={`flex-1 py-0.5 rounded text-[10px] font-bold transition ${
                                    pts === 5
                                      ? 'bg-amber-500 text-slate-950 font-black ring-1 ring-white'
                                      : 'bg-slate-800 text-slate-400 hover:text-white'
                                  }`}
                                  title="Marcar como 5 pontos (palavra repetida)"
                                >
                                  5
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleOverrideScore(sub.playerId, cat, 10)}
                                  className={`flex-1 py-0.5 rounded text-[10px] font-bold transition ${
                                    pts === 10
                                      ? 'bg-emerald-500 text-slate-950 font-black ring-1 ring-white'
                                      : 'bg-slate-800 text-slate-400 hover:text-white'
                                  }`}
                                  title="Marcar como 10 pontos (palavra única/exclusiva)"
                                >
                                  10
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Professor Action Buttons Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-purple-500/30">
              <div className="flex items-center gap-2">
                <button
                  onClick={handleLiberarCorrecao}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-cyan-300 font-['Lilita_One',sans-serif] text-xs uppercase border border-slate-700 transition"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  RECALCULAR AUTOMATICAMENTE
                </button>
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  onClick={handleApplyScores}
                  disabled={stopState.scoresApplied || submissionsList.length === 0}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-b from-emerald-400 to-green-600 text-slate-950 font-['Lilita_One',sans-serif] text-xs md:text-sm uppercase tracking-wide border-b-4 border-green-950 active:translate-y-1 shadow transition hover:brightness-110 disabled:opacity-50 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
                  <span>CONFIRMAR E SOMAR PONTOS NO PLACAR</span>
                </button>

                <button
                  onClick={handleSorteiaLetra}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-gradient-to-b from-amber-400 to-yellow-500 text-slate-950 font-['Lilita_One',sans-serif] text-xs md:text-sm uppercase tracking-wide border-b-4 border-amber-700 active:translate-y-1 shadow transition hover:brightness-110"
                >
                  <Shuffle className="w-3.5 h-3.5" />
                  <span>PRÓXIMA RODADA (NOVA LETRA)</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Quadro DICAS E REGRAS */}
        <div className="bg-slate-950/80 rounded-2xl p-4 border border-purple-500/30 text-xs space-y-2">
          <div className="flex items-center gap-2 font-['Lilita_One',sans-serif] text-amber-300 text-sm">
            <BookOpen className="w-4 h-4 text-amber-400" />
            <span>DICAS E REGRAS DE PONTUAÇÃO DO STOP:</span>
          </div>

          <ol className="list-decimal list-inside space-y-1 text-slate-300">
            <li>
              <strong>Letra do turno:</strong> todas as palavras devem começar com a letra{' '}
              <strong className="text-amber-300">{currentLetter}</strong>.
            </li>
            <li>
              <strong>Palavra única (10 pts):</strong> se nenhum outro aluno escreveu a mesma palavra.
            </li>
            <li>
              <strong>Palavra repetida (5 pts):</strong> se dois ou mais alunos escreveram a mesma palavra.
            </li>
            <li>
              <strong>Palavra em branco ou que não começa com a letra (0 pts):</strong> resposta inválida.
            </li>
            <li>
              <strong>Correção do Professor:</strong> o sistema calcula tudo automaticamente, e o professor pode
              ajustar manualmente clicando nos botões 0, 5 ou 10 em cada categoria antes de confirmar no placar.
            </li>
          </ol>
        </div>

        {/* Alphabet keyboard showing used letters and blocked letters */}
        <div className="bg-slate-950/90 rounded-2xl p-4 border border-slate-800 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <span className="text-[11px] font-bold text-slate-300 uppercase block font-['Lilita_One',sans-serif]">
                ALFABETO DO STOP {isProfessor && '• CLIQUE NA LETRA PARA BLOQUEAR / LIBERAR'}
              </span>
              <span className="text-[10px] text-slate-400">
                Letras em vermelho com faixa estão proibidas e nunca serão sorteadas.
              </span>
            </div>

            {isProfessor && (
              <button
                type="button"
                onClick={() => setShowBlockedModal(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-950/80 border border-purple-500/40 text-amber-300 text-xs font-['Lilita_One',sans-serif] uppercase hover:bg-purple-900 transition cursor-pointer"
              >
                <Ban className="w-3.5 h-3.5 text-rose-400" />
                <span>GERENCIAR PROIBIDAS ({blockedLetters.length})</span>
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-1.5">
            {ALPHABET.map((letter) => {
              const isBlocked = blockedLetters.includes(letter);
              const isUsed = stopState.usedLetters?.includes(letter);
              const isCurrent = letter === currentLetter;

              return (
                <button
                  key={letter}
                  type="button"
                  disabled={!isProfessor}
                  onClick={() => {
                    if (isProfessor) {
                      handleToggleLetter(letter);
                    }
                  }}
                  title={
                    isCurrent
                      ? `Letra da rodada atual: ${letter}`
                      : isBlocked
                      ? `Letra proibida: ${letter} (não será sorteada no jogo)`
                      : isUsed
                      ? `Letra já sorteada: ${letter}`
                      : `Letra disponível para sorteio: ${letter}${
                          isProfessor ? ' (clique para bloquear/liberar)' : ''
                        }`
                  }
                  className={`relative w-8 h-8 rounded-xl flex items-center justify-center font-['Lilita_One',sans-serif] text-xs transition select-none ${
                    isCurrent
                      ? 'bg-amber-400 text-slate-950 font-black ring-2 ring-white scale-110 z-10 shadow-lg'
                      : isBlocked
                      ? 'bg-rose-950/80 border-2 border-rose-500 text-rose-300 shadow-[0_0_8px_rgba(244,63,94,0.4)]'
                      : isUsed
                      ? 'bg-slate-800 text-slate-500 line-through opacity-60'
                      : 'bg-slate-900 text-slate-300 border border-slate-800 hover:border-purple-400'
                  } ${isProfessor ? 'cursor-pointer hover:scale-105 active:scale-95' : 'cursor-default'}`}
                >
                  {letter}
                  {isBlocked && (
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-rose-500 border border-slate-950 ring-1 ring-white/50" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Legenda do Alfabeto */}
          <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-900 text-[10px] text-slate-400">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-amber-400 border border-amber-600 inline-block" />
              <span>Letra da Rodada Atual</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-rose-950 border border-rose-500 inline-block" />
              <span>Proibida (Nunca Sorteia)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-slate-900 border border-slate-700 inline-block" />
              <span>Disponível</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-slate-800 border border-slate-800 text-[8px] flex items-center justify-center text-slate-500">
                ✕
              </span>
              <span>Já Sorteada</span>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL: CONFIGURAR LETRAS PROIBIDAS NO SORTEIO DO STOP                     */}
      {/* ========================================================================= */}
      {showBlockedModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-gradient-to-b from-slate-900 via-purple-950 to-slate-900 border-2 border-purple-500/50 rounded-3xl p-5 md:p-6 max-w-2xl w-full shadow-[0_15px_50px_rgba(168,85,247,0.35)] space-y-4">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-purple-500/30 pb-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/40">
                  <Ban className="w-6 h-6 stroke-[2.5]" />
                </div>
                <div>
                  <h3 className="font-['Lilita_One',sans-serif] text-xl text-amber-300 uppercase tracking-wide">
                    CONFIGURAR LETRAS PROIBIDAS NO SORTEIO
                  </h3>
                  <p className="text-xs text-slate-300 mt-0.5">
                    As letras marcadas em vermelho <strong>nunca serão sorteadas</strong>, evitando travar o raciocínio dos alunos com letras muito difíceis.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowBlockedModal(false)}
                className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Presets Rápidos */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-slate-400 uppercase">
                ATALHOS RÁPIDOS:
              </span>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => handleSetPreset('dificeis')}
                  className="px-3 py-1.5 rounded-xl bg-rose-950/70 border border-rose-500/60 hover:bg-rose-900 text-rose-300 font-['Lilita_One',sans-serif] text-xs uppercase flex items-center gap-1.5 transition cursor-pointer shadow"
                >
                  <Ban className="w-3.5 h-3.5 text-rose-400" />
                  <span>Bloquear Difíceis (K, W, Y, X, Z)</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSetPreset('raras')}
                  className="px-3 py-1.5 rounded-xl bg-purple-950/70 border border-purple-500/60 hover:bg-purple-900 text-purple-300 font-['Lilita_One',sans-serif] text-xs uppercase flex items-center gap-1.5 transition cursor-pointer shadow"
                >
                  <Ban className="w-3.5 h-3.5 text-purple-400" />
                  <span>Bloquear Raras (K, W, Y, X, Z, Q)</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSetPreset('todas')}
                  className="px-3 py-1.5 rounded-xl bg-emerald-950/70 border border-emerald-500/60 hover:bg-emerald-900 text-emerald-300 font-['Lilita_One',sans-serif] text-xs uppercase flex items-center gap-1.5 transition cursor-pointer shadow"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Liberar Todo o Alfabeto (A-Z)</span>
                </button>
              </div>
            </div>

            {/* Grid 26 letras interativo */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-300 uppercase">
                  CLIQUE EM UMA LETRA PARA BLOQUEAR OU LIBERAR:
                </span>
                <span className="font-['Lilita_One',sans-serif] text-rose-400">
                  {blockedLetters.length} BLOQUEADA{blockedLetters.length === 1 ? '' : 'S'} DE 26
                </span>
              </div>

              <div className="grid grid-cols-6 sm:grid-cols-9 md:grid-cols-13 gap-2 p-3 rounded-2xl bg-slate-950/80 border border-purple-500/20 max-h-[260px] overflow-y-auto">
                {ALPHABET.map((letter) => {
                  const isBlocked = blockedLetters.includes(letter);

                  return (
                    <button
                      key={letter}
                      type="button"
                      onClick={() => handleToggleLetter(letter)}
                      className={`p-2 rounded-xl flex flex-col items-center justify-center transition cursor-pointer ${
                        isBlocked
                          ? 'bg-rose-950/90 border-2 border-rose-500 text-rose-300 shadow-[0_0_12px_rgba(244,63,94,0.35)] scale-102'
                          : 'bg-slate-900 border border-slate-700 text-slate-200 hover:border-cyan-400 hover:bg-slate-800'
                      }`}
                    >
                      <span className="font-['Lilita_One',sans-serif] text-xl leading-none">
                        {letter}
                      </span>
                      <span
                        className={`text-[8px] font-black uppercase mt-1 leading-none ${
                          isBlocked ? 'text-rose-400' : 'text-slate-500'
                        }`}
                      >
                        {isBlocked ? 'PROIBIDA' : 'LIVRE'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Resumo e Ação */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-purple-500/30">
              <div className="text-xs text-slate-400">
                Total de letras elegíveis no sorteio:{' '}
                <strong className="text-emerald-400 font-['Lilita_One',sans-serif] text-sm">
                  {26 - blockedLetters.length} LETRAS DISPONÍVEIS
                </strong>
              </div>

              <button
                type="button"
                onClick={() => setShowBlockedModal(false)}
                className="px-6 py-2.5 rounded-2xl bg-gradient-to-b from-amber-400 to-yellow-500 text-slate-950 font-['Lilita_One',sans-serif] text-sm uppercase tracking-wide border-b-4 border-amber-700 active:translate-y-1 shadow transition hover:brightness-110 cursor-pointer"
              >
                CONCLUIR E SALVAR
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
