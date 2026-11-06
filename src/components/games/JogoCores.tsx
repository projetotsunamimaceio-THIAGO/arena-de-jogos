/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { COLOR_PALETTE, gameStateManager } from '../../services/gameStateManager';
import { Player, RoomState } from '../../types/game';
import { sounds } from '../../utils/soundEffects';
import { AlertOctagon, Check, Eye, Play, RotateCcw, ShieldAlert, Sparkles, Timer, Zap } from 'lucide-react';

interface JogoCoresProps {
  room: RoomState;
  isProfessor: boolean;
  currentPlayer?: Player | null;
}

export const JogoCores: React.FC<JogoCoresProps> = ({
  room,
  isProfessor,
  currentPlayer,
}) => {
  const [selectedColor, setSelectedColor] = React.useState<string | null>(null);
  const [feedback, setFeedback] = React.useState<{ hit: boolean; message: string } | null>(null);
  const [timeLeft, setTimeLeft] = React.useState<number>(room.cores.duration || 5);

  // Sync / reset timer & state when round becomes active
  React.useEffect(() => {
    if (room.cores.roundActive) {
      setTimeLeft(room.cores.duration || 5);
      setSelectedColor(null);
      setFeedback(null);
    }
  }, [room.cores.roundActive, room.cores.forbiddenColor, room.cores.duration]);

  // Timer countdown: 5 seconds
  React.useEffect(() => {
    let interval: any;
    if (room.cores.roundActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            return 0;
          }
          sounds.playTick();
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [room.cores.roundActive, timeLeft]);

  // When timer hits 0, auto reveal the teacher's secret color
  React.useEffect(() => {
    if (timeLeft === 0 && room.cores.roundActive && isProfessor) {
      handleRevealForbidden();
    }
  }, [timeLeft, room.cores.roundActive, isProfessor]);

  // Professor directly clicks any color to set it and start the 5s round
  const handleProfessorPickColor = (colorId: string) => {
    sounds.playClick();

    gameStateManager.updateRoom(room.id, {
      cores: {
        ...room.cores,
        forbiddenColor: colorId,
        roundActive: true,
        duration: 5,
      },
      phase: 'question_ready',
    });

    setTimeLeft(5);
    setSelectedColor(null);
    setFeedback(null);
  };

  const handleRevealForbidden = () => {
    sounds.playStopAlert();
    gameStateManager.updateRoom(room.id, {
      phase: 'question_revealed',
      cores: {
        ...room.cores,
        roundActive: false,
      },
    });
  };

  // Student attempts to pick a color that is NOT the professor's chosen color
  const handleStudentColorClick = (colorId: string) => {
    if (isProfessor) return;
    if (!room.cores.roundActive) return;
    if (selectedColor) return; // single pick per round

    setSelectedColor(colorId);

    // Goal: the student looks for which color is NOT the professor's chosen color!
    const isProfessorColor = room.cores.forbiddenColor === colorId;

    if (isProfessorColor) {
      // Student unfortunately picked the professor's secret color!
      sounds.playError();
      setFeedback({
        hit: false,
        message: '💥 VOCÊ CLICOU NA COR DO PROFESSOR! (-5 PTS)',
      });
      if (currentPlayer) {
        gameStateManager.updatePlayerScore(currentPlayer.id, -5);
      }
    } else {
      // Student correctly picked a color that is NOT the professor's color!
      sounds.playSuccess();
      setFeedback({
        hit: true,
        message: '✨ ACERTOU! ESSA COR NÃO É A DO PROFESSOR! (+10 PTS)',
      });
      if (currentPlayer) {
        gameStateManager.updatePlayerScore(currentPlayer.id, 10);
      }
    }
  };

  const forbiddenColorObj = COLOR_PALETTE.find((c) => c.id === room.cores.forbiddenColor);

  return (
    <div className="flex flex-col items-center justify-center p-3 md:p-6 max-w-xl mx-auto w-full select-none">
      {/* Title banner */}
      <div className="mb-3 text-center">
        <div className="inline-block px-4 py-1.5 rounded-full bg-slate-900/80 border border-cyan-400/50 text-cyan-300 font-['Lilita_One',sans-serif] text-sm uppercase tracking-widest shadow-lg">
          JOGO DAS CORES
        </div>
        <h2 className="mt-2 text-2xl md:text-3xl font-['Lilita_One',sans-serif] tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-rose-400 to-purple-400 uppercase drop-shadow">
          QUAL COR NÃO É?
        </h2>
        <p className="text-xs text-slate-300 max-w-md mx-auto mt-1">
          {isProfessor ? (
            <span className="text-emerald-300 font-semibold">
              Professor: clique em uma cor abaixo para iniciar a rodada de 5 segundos. Os alunos devem adivinhar qual NÃO É a sua cor!
            </span>
          ) : (
            <span>
              O professor escolheu uma cor secreta! Em <strong>5 segundos</strong>, clique em uma cor que{' '}
              <strong className="text-amber-300">NÃO SEJA</strong> a que ele escolheu!
            </span>
          )}
        </p>
      </div>

      {/* Professor Controls: Direct Color Selection (No random draw needed) */}
      {isProfessor && (
        <div className="w-full bg-emerald-950/90 border-2 border-emerald-500/60 rounded-2xl p-4 mb-4 backdrop-blur shadow-xl flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-['Lilita_One',sans-serif] text-amber-300 uppercase tracking-wide">
                CLIQUE NA COR PARA INICIAR A RODADA DE 5 SEGUNDOS:
              </span>
            </div>
            {room.cores.roundActive && (
              <button
                onClick={handleRevealForbidden}
                className="flex items-center gap-1 px-3 py-1 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-['Lilita_One',sans-serif] text-xs uppercase shadow transition"
              >
                <AlertOctagon className="w-3.5 h-3.5" />
                REVELAR AGORA
              </button>
            )}
          </div>

          {/* 6 Color Buttons for Professor */}
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {COLOR_PALETTE.map((color) => {
              const isChosen = room.cores.forbiddenColor === color.id;
              return (
                <button
                  key={color.id}
                  onClick={() => handleProfessorPickColor(color.id)}
                  style={{ backgroundColor: color.hex }}
                  className={`relative flex flex-col items-center justify-center p-2.5 rounded-xl text-white font-['Lilita_One',sans-serif] text-xs uppercase shadow-md transition transform active:scale-95 border-2 ${
                    isChosen
                      ? 'border-white ring-4 ring-amber-400 scale-105 z-10'
                      : 'border-slate-800/40 hover:brightness-110 opacity-90'
                  }`}
                >
                  <span className="drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] font-black">
                    {color.name}
                  </span>
                  {isChosen && (
                    <div className="absolute -top-2 -right-1 bg-amber-400 text-slate-950 rounded-full p-0.5 shadow">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-300 pt-1 border-t border-emerald-900/60">
            <div>
              {forbiddenColorObj ? (
                <span className="text-amber-300 font-bold">
                  Sua cor secreta atual: <span className="uppercase underline">{forbiddenColorObj.name}</span>
                </span>
              ) : (
                <span className="text-slate-400">Nenhuma cor escolhida ainda.</span>
              )}
            </div>
            <div>
              {room.cores.roundActive ? (
                <span className="text-rose-400 font-bold animate-pulse">
                  ⏳ RODADA ATIVA: {timeLeft}s restantes!
                </span>
              ) : (
                <span className="text-emerald-400">Pronto para a próxima rodada</span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Timer & Status Bar */}
      <div className="flex items-center justify-center gap-3 mb-3 w-full">
        <div
          className={`flex items-center gap-2 px-4 py-1.5 rounded-full border shadow-lg transition-all ${
            room.cores.roundActive && timeLeft <= 2
              ? 'bg-rose-950/90 border-rose-500 text-rose-300 animate-pulse'
              : 'bg-slate-900/90 border-slate-700 text-amber-400'
          }`}
        >
          <Timer className="w-4 h-4 text-amber-400" />
          <span className="font-['Lilita_One',sans-serif] text-sm tracking-wider">
            TEMPO: {timeLeft.toString().padStart(2, '0')}s
          </span>
        </div>

        {room.phase === 'question_revealed' && forbiddenColorObj && (
          <div className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-rose-500/20 border border-rose-500/60 text-xs font-bold text-rose-300 shadow animate-bounce">
            <ShieldAlert className="w-4 h-4 text-rose-400" />
            <span>A COR DO PROFESSOR ERA: {forbiddenColorObj.name}!</span>
          </div>
        )}
      </div>

      {/* The 6-color circular Wheel */}
      <div className="relative w-64 h-64 sm:w-72 sm:h-72 flex items-center justify-center my-2">
        {/* Outer Dark Ring */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-b from-slate-800 via-slate-900 to-black p-3.5 shadow-[0_0_35px_rgba(0,0,0,0.8)] border-4 border-slate-700/60">
          <div className="w-full h-full rounded-full relative overflow-hidden">
            {/* SVG 6-Slices Wheel */}
            <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-30">
              {COLOR_PALETTE.map((color, index) => {
                const angle = 60; // 360 / 6
                const startAngle = index * angle;
                const endAngle = startAngle + angle;

                const startRad = (startAngle * Math.PI) / 180;
                const endRad = (endAngle * Math.PI) / 180;

                const x1 = 50 + 50 * Math.cos(startRad);
                const y1 = 50 + 50 * Math.sin(startRad);
                const x2 = 50 + 50 * Math.cos(endRad);
                const y2 = 50 + 50 * Math.sin(endRad);

                const pathData = `M 50 50 L ${x1} ${y1} A 50 50 0 0 1 ${x2} ${y2} Z`;

                const isRevealedForbidden =
                  room.phase === 'question_revealed' && room.cores.forbiddenColor === color.id;
                const isSelectedByMe = selectedColor === color.id;
                const isTeacherPicked = isProfessor && room.cores.forbiddenColor === color.id;

                return (
                  <path
                    key={color.id}
                    d={pathData}
                    fill={color.hex}
                    stroke="#1e293b"
                    strokeWidth="1.5"
                    className={`cursor-pointer transition-all duration-200 ${
                      isSelectedByMe
                        ? 'brightness-125 filter drop-shadow-[0_0_12px_white]'
                        : 'hover:brightness-110'
                    } ${isRevealedForbidden || isTeacherPicked ? 'animate-pulse' : ''}`}
                    onClick={() => {
                      if (isProfessor) {
                        handleProfessorPickColor(color.id);
                      } else {
                        handleStudentColorClick(color.id);
                      }
                    }}
                  />
                );
              })}
            </svg>
          </div>
        </div>

        {/* Center Black Bullseye Ring */}
        <div className="absolute w-20 h-20 rounded-full bg-gradient-to-b from-slate-900 to-black border-4 border-slate-700 flex flex-col items-center justify-center shadow-2xl pointer-events-none z-10">
          <div className="w-3.5 h-3.5 rounded-full bg-slate-950 border-2 border-slate-800" />
          <span className="text-[9px] font-['Lilita_One',sans-serif] text-slate-300 tracking-wider uppercase mt-0.5">
            ARENA
          </span>
        </div>
      </div>

      {/* Alternative mobile-friendly button row for students to tap easily */}
      {!isProfessor && (
        <div className="w-full mt-3">
          <p className="text-[11px] text-center text-slate-400 mb-1.5 uppercase font-bold tracking-wider">
            Ou toque diretamente na cor abaixo:
          </p>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {COLOR_PALETTE.map((color) => {
              const isSelected = selectedColor === color.id;
              const isRevealed = room.phase === 'question_revealed';
              const isForbidden = isRevealed && room.cores.forbiddenColor === color.id;

              return (
                <button
                  key={color.id}
                  disabled={!room.cores.roundActive || !!selectedColor}
                  onClick={() => handleStudentColorClick(color.id)}
                  style={{ backgroundColor: color.hex }}
                  className={`py-2 px-1 rounded-xl text-white font-['Lilita_One',sans-serif] text-xs uppercase shadow transition active:scale-95 disabled:cursor-not-allowed border-2 ${
                    isSelected
                      ? 'border-white ring-4 ring-amber-300 scale-105 z-10'
                      : isForbidden
                      ? 'border-rose-500 ring-4 ring-rose-500 animate-pulse'
                      : 'border-slate-800/40 hover:brightness-110'
                  } ${!room.cores.roundActive && !isRevealed ? 'opacity-60' : 'opacity-100'}`}
                >
                  <span className="drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] font-black">
                    {color.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Student Feedback & State Message */}
      {!isProfessor && (
        <div className="mt-4 text-center min-h-[44px]">
          {feedback ? (
            <div
              className={`inline-block px-4 py-2 rounded-2xl font-['Lilita_One',sans-serif] text-sm uppercase tracking-wide border shadow-lg animate-bounce ${
                feedback.hit
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
                  : 'bg-rose-500/20 text-rose-300 border-rose-500/50'
              }`}
            >
              {feedback.message}
            </div>
          ) : room.cores.roundActive ? (
            <p className="text-xs text-amber-300 font-bold animate-pulse">
              ⚡ RÁPIDO! TOQUE EM UMA COR QUE NÃO SEJA A DO PROFESSOR! (5 SEGUNDOS)
            </p>
          ) : timeLeft === 0 && !selectedColor ? (
            <p className="text-xs text-rose-400 font-bold">
              ⏱️ TEMPO ESGOTADO! Você não tocou em nenhuma cor a tempo.
            </p>
          ) : (
            <p className="text-xs text-slate-400">
              Aguarde o professor clicar em uma cor para iniciar a rodada de 5 segundos...
            </p>
          )}
        </div>
      )}
    </div>
  );
};
