/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Volume2, VolumeX, Home, GraduationCap, Gamepad2, Columns3, LogOut, ShieldCheck } from 'lucide-react';
import { sounds } from '../../utils/soundEffects';

export type MainViewMode = 'home' | 'professor' | 'student' | 'split';

interface HeaderNavProps {
  currentView: MainViewMode;
  onSelectView: (view: MainViewMode) => void;
  activeRoomName?: string;
  isProfessorAuth: boolean;
  onLogout?: () => void;
}

export const HeaderNav: React.FC<HeaderNavProps> = ({
  currentView,
  onSelectView,
  activeRoomName,
  isProfessorAuth,
  onLogout,
}) => {
  const [isMuted, setIsMuted] = React.useState(sounds.isMuted);

  const handleToggleSound = () => {
    const muted = sounds.toggleMute();
    setIsMuted(muted);
    if (!muted) sounds.playClick();
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-slate-950/90 backdrop-blur-md border-b border-slate-800 px-3 py-2 flex items-center justify-between shadow-lg">
      {/* Left: Brand / Home Button / Room Badge */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => {
            sounds.playClick();
            onSelectView('home');
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs font-bold text-slate-200 hover:bg-slate-800 transition shadow"
          title="Ir para a Tela Inicial"
        >
          <Home className="w-3.5 h-3.5 text-amber-400" />
          <span className="font-['Lilita_One',sans-serif] tracking-wider text-white">ARENA DE JOGOS</span>
        </button>

        {activeRoomName && (
          <div className="px-2.5 py-1 rounded-xl bg-amber-500/20 border border-amber-400/50 text-amber-300 font-['Lilita_One',sans-serif] text-xs">
            {activeRoomName}
          </div>
        )}
      </div>

      {/* Center: EXCLUSIVELY for authenticated professor when in professor view */}
      {isProfessorAuth && currentView === 'professor' && (
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-xs font-bold shadow">
            <GraduationCap className="w-3.5 h-3.5 text-emerald-400" />
            <span className="font-['Lilita_One',sans-serif] tracking-wider">PAINEL DO PROFESSOR</span>
          </div>

          {onLogout && (
            <button
              onClick={() => {
                sounds.playClick();
                onLogout();
              }}
              className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-rose-950/60 border border-rose-500/30 text-rose-400 hover:text-rose-300 hover:bg-rose-500/20 transition text-xs font-bold"
              title="Sair do modo professor"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>SAIR</span>
            </button>
          )}
        </div>
      )}

      {/* Right: Audio Toggle */}
      <div className="flex items-center gap-2">
        <button
          onClick={handleToggleSound}
          className={`p-2 rounded-xl border transition ${
            isMuted
              ? 'bg-slate-900 border-slate-800 text-slate-500'
              : 'bg-amber-500/20 border-amber-400/40 text-amber-400 hover:bg-amber-500/30'
          }`}
          title={isMuted ? 'Ativar Sons' : 'Silenciar Sons'}
        >
          {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </button>
      </div>
    </header>
  );
};
