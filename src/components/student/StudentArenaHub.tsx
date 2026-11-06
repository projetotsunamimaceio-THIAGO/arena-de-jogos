/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Gamepad2, LogOut, User, Users } from 'lucide-react';
import { ArenaLogo } from '../common/ArenaLogo';
import { Scoreboard } from '../common/Scoreboard';
import { Player, RoomState } from '../../types/game';
import { gameStateManager } from '../../services/gameStateManager';
import { sounds } from '../../utils/soundEffects';
import { JogoCores } from '../games/JogoCores';
import { JogoVerdadeiroFalso } from '../games/JogoVerdadeiroFalso';
import { JogoQuiz } from '../games/JogoQuiz';
import { JogoForca } from '../games/JogoForca';
import { JogoStop } from '../games/JogoStop';

interface StudentArenaHubProps {
  player: Player;
  onExitArena: () => void;
}

export const StudentArenaHub: React.FC<StudentArenaHubProps> = ({
  player,
  onExitArena,
}) => {
  const [room, setRoom] = React.useState<RoomState>(gameStateManager.getRoom(player.roomId));
  const [players, setPlayers] = React.useState<Player[]>(gameStateManager.getPlayers(player.roomId));
  const [teams, setTeams] = React.useState(gameStateManager.getTeams(player.roomId));

  const refresh = React.useCallback(() => {
    setRoom(gameStateManager.getRoom(player.roomId));
    setPlayers(gameStateManager.getPlayers(player.roomId));
    setTeams(gameStateManager.getTeams(player.roomId));
  }, [player.roomId]);

  React.useEffect(() => {
    refresh();
    const unsub = gameStateManager.subscribe(refresh);
    return unsub;
  }, [refresh]);

  // Find updated current player data
  const updatedMe = players.find((p) => p.id === player.id) || player;
  const activeGame = room.currentGame;

  return (
    <div className="relative min-h-[calc(100vh-57px)] flex flex-col justify-between p-3 md:p-6 bg-gradient-to-b from-cyan-600 via-blue-900 to-slate-950 select-none overflow-x-hidden">
      {/* Background Neon Grid Effect */}
      <div
        className="absolute inset-0 opacity-15 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(255, 255, 255, 0.2) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255, 255, 255, 0.2) 1px, transparent 1px)
          `,
          backgroundSize: '36px 36px',
        }}
      />

      {/* Header Bar */}
      <div className="relative z-20 flex flex-wrap items-center justify-between gap-3 bg-slate-950/80 backdrop-blur-md p-3 md:px-5 rounded-2xl border border-cyan-400/40 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 font-['Lilita_One',sans-serif] text-base md:text-lg border-b-2 border-amber-800 shadow">
            {room.id}
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="font-bold text-slate-300 uppercase flex items-center gap-1">
              {updatedMe.mode === 'individual' ? <User className="w-3.5 h-3.5 text-cyan-400" /> : <Users className="w-3.5 h-3.5 text-amber-400" />}
              {updatedMe.name}
            </span>
            {updatedMe.mode === 'equipe' && updatedMe.teamId && (
              <span className="bg-slate-800 px-2 py-0.5 rounded-full text-[10px] text-amber-300 font-bold border border-slate-700">
                {teams.find((t) => t.id === updatedMe.teamId)?.name || 'Equipe'}
              </span>
            )}
            <span className="text-emerald-400 font-['Lilita_One',sans-serif] text-sm">
              ★ {updatedMe.score} PTS
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {activeGame !== 'none' ? (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/60 text-emerald-300 text-xs font-bold animate-pulse">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>JOGO LIBERADO: {activeGame.replace('_', ' ').toUpperCase()}</span>
            </div>
          ) : (
            <div className="text-xs text-slate-400 italic">
              Aguardando o professor liberar um jogo...
            </div>
          )}

          <button
            onClick={() => {
              sounds.playClick();
              onExitArena();
            }}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-rose-400 transition"
            title="Sair da sala"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      {activeGame !== 'none' ? (
        /* If a game is currently active, show that game directly */
        <div className="relative z-10 my-4 flex-1 flex flex-col items-center justify-center">
          {activeGame === 'cores' && <JogoCores room={room} isProfessor={false} currentPlayer={updatedMe} />}
          {activeGame === 'verdadeiro_falso' && (
            <JogoVerdadeiroFalso room={room} isProfessor={false} currentPlayer={updatedMe} />
          )}
          {activeGame === 'quiz' && <JogoQuiz room={room} isProfessor={false} currentPlayer={updatedMe} />}
          {activeGame === 'forca' && (
            <JogoForca room={room} isProfessor={false} currentPlayer={updatedMe} teams={teams} />
          )}
          {activeGame === 'stop' && <JogoStop room={room} isProfessor={false} currentPlayer={updatedMe} />}
        </div>
      ) : (
        /* Clean Student Waiting Lobby: Aluno entra e aguarda o professor iniciar */
        <div className="relative z-10 my-auto flex flex-col items-center justify-center py-4 px-2 max-w-lg mx-auto w-full text-center space-y-5">
          {/* Central Logo */}
          <ArenaLogo size="xl" showSubtitle={true} className="my-2" />

          {/* Student Status Card */}
          <div className="w-full bg-slate-900/90 border-2 border-cyan-400/50 rounded-3xl p-5 md:p-6 shadow-[0_10px_30px_rgba(6,182,212,0.3)] backdrop-blur-md space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <span className="text-xs font-bold text-slate-400 uppercase">SUA CONEXÃO:</span>
              <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                SALA CONECTADA
              </span>
            </div>

            <div>
              <span className="text-[11px] font-bold text-cyan-300 uppercase tracking-wider block mb-1">
                JOGADOR(A)
              </span>
              <h2 className="font-['Lilita_One',sans-serif] text-3xl text-white uppercase tracking-wide">
                {updatedMe.name}
              </h2>
              {updatedMe.mode === 'equipe' && updatedMe.teamId && (
                <div className="mt-1 inline-block px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/50 text-amber-300 font-bold text-xs uppercase">
                  {teams.find((t) => t.id === updatedMe.teamId)?.name || 'Equipe'}
                </div>
              )}
            </div>

            {/* Waiting Radar Message */}
            <div className="bg-slate-950/80 rounded-2xl p-4 border border-cyan-500/30 flex flex-col items-center justify-center space-y-2">
              <div className="relative w-12 h-12 flex items-center justify-center">
                <div className="absolute inset-0 rounded-full bg-cyan-400/20 animate-ping" />
                <div className="w-10 h-10 rounded-full bg-cyan-500/30 border border-cyan-400 flex items-center justify-center text-cyan-300">
                  <Gamepad2 className="w-5 h-5 animate-pulse" />
                </div>
              </div>

              <h3 className="font-['Lilita_One',sans-serif] text-base md:text-lg text-cyan-200 uppercase tracking-wide">
                AGUARDANDO O PROFESSOR INICIAR
              </h3>
              <p className="text-xs text-slate-400 max-w-xs">
                Fique atento! Assim que o professor liberar uma pergunta ou jogo, sua tela iniciará automaticamente.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Floating Bottom Scoreboard Drawer */}
      <div className="relative z-20 w-full flex justify-end mt-4">
        <Scoreboard
          roomId={player.roomId}
          players={players}
          teams={teams}
          mode={player.mode}
          compact={true}
        />
      </div>
    </div>
  );
};
