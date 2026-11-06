/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ProfessorPanel } from '../professor/ProfessorPanel';
import { StudentArenaHub } from '../student/StudentArenaHub';
import { StudentFlow } from '../student/StudentFlow';
import { ProfessorLogin, isProfessorLoggedIn, setProfessorLoggedIn } from '../professor/ProfessorLogin';
import { Player } from '../../types/game';
import { gameStateManager } from '../../services/gameStateManager';

export const DualScreenView: React.FC = () => {
  const [studentPlayer, setStudentPlayer] = React.useState<Player | null>(null);
  const [isProfAuth, setIsProfAuth] = React.useState<boolean>(isProfessorLoggedIn());

  React.useEffect(() => {
    setIsProfAuth(isProfessorLoggedIn());

    // Try to auto-connect or retrieve current player
    const current = gameStateManager.getCurrentPlayer();
    if (current) {
      setStudentPlayer(current);
    } else {
      // Auto register a sample player for immediate testing in split view
      const player = gameStateManager.registerPlayer('ALUNO TESTE', 'SALA 1', 'individual');
      setStudentPlayer(player);
    }
  }, []);

  return (
    <div className="w-full min-h-[calc(100vh-57px)] bg-slate-950 p-2 md:p-4">
      {/* Split view banner */}
      <div className="mb-3 px-4 py-2 rounded-2xl bg-purple-950/80 border border-purple-500/40 text-center flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
          <strong className="text-purple-300 font-['Lilita_One',sans-serif] text-sm">
            MODO TESTE SIMULTÂNEO (SINCRONIZAÇÃO EM TEMPO REAL)
          </strong>
        </div>
        <span className="text-slate-300">
          À esquerda: <strong>Professor (Tema Verde)</strong> • À direita: <strong>Aluno (Tema Azul)</strong>
        </span>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {/* Left Side: Professor */}
        <div className="rounded-3xl border-2 border-emerald-500/50 overflow-hidden shadow-2xl flex flex-col">
          <div className="bg-emerald-950 px-4 py-2 text-xs font-bold text-emerald-300 border-b border-emerald-500/40 flex items-center justify-between">
            <span>PAINEL DO PROFESSOR (CONTROLE CENTRAL)</span>
            <span className="bg-emerald-500 text-slate-950 px-2 py-0.5 rounded text-[10px] font-black">
              LADO A
            </span>
          </div>
          <div className="flex-1 overflow-y-auto">
            {isProfAuth ? (
              <ProfessorPanel
                onLogout={() => {
                  setProfessorLoggedIn(false);
                  setIsProfAuth(false);
                }}
              />
            ) : (
              <ProfessorLogin
                onSuccess={() => setIsProfAuth(true)}
              />
            )}
          </div>
        </div>

        {/* Right Side: Student */}
        <div className="rounded-3xl border-2 border-cyan-500/50 overflow-hidden shadow-2xl flex flex-col">
          <div className="bg-blue-950 px-4 py-2 text-xs font-bold text-cyan-300 border-b border-cyan-500/40 flex items-center justify-between">
            <span>PAINEL DO ALUNO (EXPERIÊNCIA DO ALUNO)</span>
            <span className="bg-cyan-400 text-slate-950 px-2 py-0.5 rounded text-[10px] font-black">
              LADO B
            </span>
          </div>
          <div className="flex-1 overflow-y-auto">
            {studentPlayer ? (
              <StudentArenaHub
                player={studentPlayer}
                onExitArena={() => setStudentPlayer(null)}
              />
            ) : (
              <StudentFlow onEnterArena={(p) => setStudentPlayer(p)} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
