/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ArenaLogo } from '../common/ArenaLogo';
import { sounds } from '../../utils/soundEffects';
import { GraduationCap, Gamepad2, Sparkles, Trophy, Users, ShieldCheck } from 'lucide-react';

interface HomeScreenProps {
  onGoToProfessor: () => void;
  onGoToStudent: () => void;
  onGoToSplitTest: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onGoToProfessor,
  onGoToStudent,
  onGoToSplitTest,
}) => {
  return (
    <div className="relative min-h-[calc(100vh-57px)] flex flex-col items-center justify-between p-4 md:p-8 overflow-hidden bg-gradient-to-b from-emerald-950 via-slate-950 to-blue-950 select-none">
      {/* Background Neon Grid Effect */}
      <div
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(16, 185, 129, 0.2) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(59, 130, 246, 0.2) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
        }}
      />

      {/* Floating Neon Orbs */}
      <div className="absolute top-1/4 -left-20 w-72 h-72 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none animate-pulse delay-700" />

      {/* Top Section: "PAINEL DO PROFESSOR" (Yellow 3D Button) */}
      <div className="w-full flex justify-end z-10 pt-2 pr-2">
        <button
          onClick={() => {
            sounds.playClick();
            onGoToProfessor();
          }}
          className="group relative flex items-center gap-2.5 px-6 py-3.5 rounded-2xl bg-gradient-to-b from-amber-300 via-amber-400 to-amber-500 text-slate-950 font-['Lilita_One',sans-serif] text-base md:text-lg uppercase tracking-wider border-b-[5px] border-amber-700 active:border-b-0 active:translate-y-1 shadow-[0_8px_20px_rgba(245,158,11,0.4)] transition-all hover:brightness-110 cursor-pointer"
        >
          <GraduationCap className="w-5 h-5 text-slate-950 stroke-[2.5]" />
          <span>PAINEL DO PROFESSOR</span>
          <div className="w-2 h-2 rounded-full bg-emerald-700 animate-ping" />
        </button>
      </div>

      {/* Center Section: Iconic Golden Beveled Polygon Logo */}
      <div className="relative z-10 my-auto flex flex-col items-center text-center max-w-lg px-4">
        {/* Floating badge */}
        <div className="mb-4 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900/80 border border-amber-400/40 text-amber-300 text-xs md:text-sm font-bold shadow-lg backdrop-blur">
          <Sparkles className="w-4 h-4 text-amber-400 animate-spin" />
          <span>SALA DE AULA GAMIFICADA EM TEMPO REAL</span>
        </div>

        <ArenaLogo size="xl" showSubtitle={true} className="my-2" />

        <p className="mt-4 text-slate-300 text-sm md:text-base font-semibold max-w-md drop-shadow">
          5 Jogos Interativos para engajar seus alunos: <br />
          <span className="text-cyan-300 font-bold">Cores</span> •{' '}
          <span className="text-emerald-300 font-bold">Verdadeiro ou Falso</span> •{' '}
          <span className="text-pink-300 font-bold">Quiz</span> •{' '}
          <span className="text-amber-300 font-bold">Forca</span> •{' '}
          <span className="text-purple-300 font-bold">Stop/Adedonha</span>
        </p>
      </div>

      {/* Bottom Section: "ENTRA NO JOGO" (Blue 3D Button) */}
      <div className="w-full flex flex-col items-center gap-4 z-10 pb-4">
        <button
          onClick={() => {
            sounds.playClick();
            onGoToStudent();
          }}
          className="group relative flex items-center justify-center gap-3 w-full max-w-sm px-8 py-5 rounded-2xl bg-gradient-to-b from-cyan-400 via-blue-500 to-blue-600 text-white font-['Lilita_One',sans-serif] text-xl md:text-2xl uppercase tracking-widest border-b-[6px] border-blue-900 active:border-b-0 active:translate-y-1.5 shadow-[0_10px_25px_rgba(6,182,212,0.5)] transition-all hover:brightness-110 cursor-pointer"
        >
          <Gamepad2 className="w-7 h-7 text-cyan-100 group-hover:scale-110 transition-transform" />
          <span>ENTRA NO JOGO</span>
        </button>
      </div>
    </div>
  );
};
