/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Trophy, Users, User, Medal } from 'lucide-react';
import { Player, RoomId, Team } from '../../types/game';

interface ScoreboardProps {
  roomId: RoomId;
  players: Player[];
  teams: Team[];
  mode?: 'individual' | 'equipe';
  compact?: boolean;
}

export const Scoreboard: React.FC<ScoreboardProps> = ({
  players,
  teams,
  mode = 'individual',
  compact = false,
}) => {
  const [activeTab, setActiveTab] = React.useState<'individual' | 'equipe'>(mode);

  // Sync with prop if changed
  React.useEffect(() => {
    setActiveTab(mode);
  }, [mode]);

  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);
  const sortedTeams = [...teams].sort((a, b) => b.score - a.score);

  return (
    <div
      className={`bg-slate-950/90 backdrop-blur-md border-2 border-emerald-500/40 rounded-2xl shadow-[0_0_20px_rgba(16,185,129,0.25)] overflow-hidden transition-all ${
        compact ? 'w-full md:w-64 text-xs' : 'w-full md:w-72 text-sm'
      }`}
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-950 px-3 py-2 border-b border-emerald-500/30 flex items-center justify-between">
        <div className="flex items-center gap-1.5 font-['Lilita_One',sans-serif] text-emerald-400 tracking-wider">
          <Trophy className="w-4 h-4 text-amber-400 animate-bounce" />
          <span>PLACAR</span>
        </div>

        {/* Tab switch */}
        <div className="flex bg-slate-800/80 p-0.5 rounded-lg border border-slate-700 text-[10px]">
          <button
            onClick={() => setActiveTab('individual')}
            className={`px-2 py-0.5 rounded font-bold transition flex items-center gap-1 ${
              activeTab === 'individual'
                ? 'bg-emerald-500 text-slate-950 shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <User className="w-2.5 h-2.5" />
            IND
          </button>
          <button
            onClick={() => setActiveTab('equipe')}
            className={`px-2 py-0.5 rounded font-bold transition flex items-center gap-1 ${
              activeTab === 'equipe'
                ? 'bg-amber-400 text-slate-950 shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Users className="w-2.5 h-2.5" />
            EQP
          </button>
        </div>
      </div>

      {/* List */}
      <div className="p-2 space-y-1.5 max-h-56 overflow-y-auto">
        {activeTab === 'individual' ? (
          sortedPlayers.length === 0 ? (
            <div className="text-center py-3 text-slate-500 text-xs italic">
              Nenhum aluno conectado
            </div>
          ) : (
            sortedPlayers.map((player, idx) => {
              const isFirst = idx === 0;
              const isSecond = idx === 1;
              const isThird = idx === 2;

              return (
                <div
                  key={player.id}
                  className={`flex items-center justify-between px-2.5 py-1.5 rounded-xl border transition-all ${
                    isFirst
                      ? 'bg-amber-500/15 border-amber-500/50 text-amber-300 shadow-sm'
                      : isSecond
                      ? 'bg-slate-300/10 border-slate-400/40 text-slate-200'
                      : isThird
                      ? 'bg-amber-800/15 border-amber-700/40 text-amber-600'
                      : 'bg-slate-900/60 border-slate-800 text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate pr-2">
                    <span
                      className={`font-['Lilita_One',sans-serif] text-xs w-4 text-center ${
                        isFirst ? 'text-amber-400 font-black' : 'text-slate-400'
                      }`}
                    >
                      {idx + 1}.
                    </span>
                    <span className="font-bold truncate uppercase">{player.name}</span>
                    {player.teamId && (
                      <span className="text-[9px] bg-slate-800 px-1 py-0.5 rounded text-cyan-400">
                        {teams.find((t) => t.id === player.teamId)?.name?.replace('EQUIPE ', 'EQ.') || 'EQ'}
                      </span>
                    )}
                  </div>
                  <div className="font-['Lilita_One',sans-serif] text-xs font-bold text-emerald-400 whitespace-nowrap">
                    {player.score} <span className="text-[10px] text-emerald-500/80">PTS</span>
                  </div>
                </div>
              );
            })
          )
        ) : sortedTeams.length === 0 ? (
          <div className="text-center py-3 text-slate-500 text-xs italic">
            Nenhuma equipe cadastrada
          </div>
        ) : (
          sortedTeams.map((team, idx) => {
            const isFirst = idx === 0;

            return (
              <div
                key={team.id}
                className={`flex items-center justify-between px-2.5 py-1.5 rounded-xl border transition-all ${
                  isFirst
                    ? 'bg-amber-500/15 border-amber-500/50 text-amber-300 shadow-sm'
                    : 'bg-slate-900/60 border-slate-800 text-slate-300'
                }`}
              >
                <div className="flex items-center gap-2 truncate pr-2">
                  <div
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: team.color }}
                  />
                  <span className="font-['Lilita_One',sans-serif] text-xs text-slate-400">
                    {idx + 1}.
                  </span>
                  <span className="font-bold truncate uppercase">{team.name}</span>
                </div>
                <div className="font-['Lilita_One',sans-serif] text-xs font-bold text-amber-400 whitespace-nowrap">
                  {team.score} <span className="text-[10px] text-amber-500/80">PTS</span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
