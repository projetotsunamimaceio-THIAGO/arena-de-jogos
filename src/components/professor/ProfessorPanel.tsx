/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  Palette,
  CheckSquare,
  HelpCircle,
  Layers,
  AlertOctagon,
  KeyRound,
  FileSpreadsheet,
  Users,
  Trophy,
  RotateCcw,
  UserX,
  PlusCircle,
  MinusCircle,
  Eye,
  Lock,
  Sparkles,
  Play,
  Square,
} from 'lucide-react';
import { ArenaLogo } from '../common/ArenaLogo';
import { Scoreboard } from '../common/Scoreboard';
import { ContentManagerModal, ContentTab } from './ContentManagerModal';
import { RoomPasswordManager } from './RoomPasswordManager';
import { GameType, Player, RoomId, RoomState, Team, Theme } from '../../types/game';
import { gameStateManager } from '../../services/gameStateManager';
import { sounds } from '../../utils/soundEffects';

// Games
import { JogoCores } from '../games/JogoCores';
import { JogoVerdadeiroFalso } from '../games/JogoVerdadeiroFalso';
import { JogoQuiz } from '../games/JogoQuiz';
import { JogoForca } from '../games/JogoForca';
import { JogoStop } from '../games/JogoStop';

import { LogOut } from 'lucide-react';

interface ProfessorPanelProps {
  onBackToHome?: () => void;
  onLogout?: () => void;
}

export const ProfessorPanel: React.FC<ProfessorPanelProps> = ({ onBackToHome, onLogout }) => {
  const [selectedRoomId, setSelectedRoomId] = React.useState<RoomId>('SALA 1');
  const [rooms, setRooms] = React.useState<Record<RoomId, RoomState>>(gameStateManager.getRooms());
  const [players, setPlayers] = React.useState<Player[]>(gameStateManager.getPlayers(selectedRoomId));
  const [teams, setTeams] = React.useState<Team[]>(gameStateManager.getTeams(selectedRoomId));
  const [themes, setThemes] = React.useState<Theme[]>(gameStateManager.getThemes());

  // Modals
  const [passwordModalOpen, setPasswordModalOpen] = React.useState(false);
  const [contentModalTab, setContentModalTab] = React.useState<ContentTab | null>(null);

  const currentRoom = rooms[selectedRoomId] || gameStateManager.getRoom(selectedRoomId);

  const refresh = React.useCallback(() => {
    const updatedRooms = gameStateManager.getRooms();
    setRooms(updatedRooms);
    setPlayers(gameStateManager.getPlayers(selectedRoomId));
    setTeams(gameStateManager.getTeams(selectedRoomId));
    setThemes(gameStateManager.getThemes());
  }, [selectedRoomId]);

  React.useEffect(() => {
    refresh();
    const unsub = gameStateManager.subscribe(refresh);
    return unsub;
  }, [refresh]);

  const handleSelectGame = (game: GameType) => {
    sounds.playClick();
    gameStateManager.updateRoom(selectedRoomId, {
      currentGame: game,
      phase: 'lobby',
      currentQuestionIndex: 0,
    });
  };

  const handleStopGame = () => {
    sounds.playClick();
    gameStateManager.updateRoom(selectedRoomId, {
      currentGame: 'none',
      phase: 'lobby',
    });
  };

  const handleSelectTheme = (themeId: string) => {
    sounds.playClick();
    gameStateManager.updateRoom(selectedRoomId, {
      themeId,
      currentQuestionIndex: 0,
      phase: 'lobby',
    });
  };

  const handleScoreAdjust = (playerId: string, delta: number) => {
    sounds.playClick();
    gameStateManager.updatePlayerScore(playerId, delta);
  };

  const handleKick = (playerId: string) => {
    sounds.playClick();
    gameStateManager.kickPlayer(playerId);
  };

  const handleResetScores = () => {
    if (confirm('Tem certeza que deseja zerar o placar desta sala?')) {
      sounds.playClick();
      gameStateManager.resetRoomScores(selectedRoomId);
    }
  };

  const gamesConfig = [
    { id: 'cores' as GameType, label: 'JOGO DAS CORES', icon: Palette },
    { id: 'forca' as GameType, label: 'JOGO DA FORCA', icon: Layers },
    { id: 'verdadeiro_falso' as GameType, label: 'VERDADEIRO OU FALSO', icon: CheckSquare },
    { id: 'stop' as GameType, label: 'STOP / ADEDONHA', icon: AlertOctagon },
    { id: 'quiz' as GameType, label: 'QUIZ', icon: HelpCircle },
  ];

  return (
    <div className="min-h-[calc(100vh-57px)] bg-gradient-to-b from-emerald-600 via-green-800 to-emerald-950 p-3 md:p-6 text-white select-none">
      {/* Top Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-950/80 backdrop-blur-md p-3 md:px-5 rounded-3xl border border-emerald-400/40 shadow-xl mb-6">
        <div className="flex items-center gap-3">
          <ArenaLogo size="sm" />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-['Lilita_One',sans-serif] text-emerald-300 text-lg md:text-xl uppercase tracking-wider">
                PAINEL DO PROFESSOR
              </span>
              <span className="text-[10px] bg-emerald-500 text-slate-950 font-black px-2 py-0.5 rounded-full">
                ADMIN: ThiagoRocha
              </span>
            </div>
            <p className="text-xs text-slate-300">
              Controle em tempo real de salas, jogos, temas e placar dos alunos.
            </p>
          </div>
        </div>

        {/* 3.2 CRIAR SALA (Botão verde-limão) & Salas e Senhas & Logout */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              sounds.playClick();
              setPasswordModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-b from-lime-300 to-lime-500 text-slate-950 font-['Lilita_One',sans-serif] text-xs md:text-sm uppercase tracking-wide border-b-4 border-lime-700 active:translate-y-1 shadow-[0_5px_15px_rgba(132,204,22,0.4)] transition hover:brightness-110 cursor-pointer"
          >
            <KeyRound className="w-4 h-4 stroke-[2.5]" />
            <span>SALAS E SENHAS (CRIAR SALA)</span>
          </button>

          {onLogout && (
            <button
              onClick={() => {
                sounds.playClick();
                onLogout();
              }}
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-xs font-bold transition shadow"
              title="Sair / Bloquear Painel do Professor"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">SAIR</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Grid: Controls & Live Arena */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Room Selector, Games Menu, Content Buttons, Themes */}
        <div className="lg:col-span-5 space-y-5">
          {/* Active Room Selector */}
          <div className="bg-slate-900/90 rounded-3xl p-4 md:p-5 border-2 border-emerald-500/40 shadow-lg space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-['Lilita_One',sans-serif] text-sm text-emerald-300 uppercase">
                SALA ATIVA NO PAINEL:
              </span>
              <span className="text-xs text-amber-300 font-bold">
                SENHA: <strong>{currentRoom.code}</strong>
              </span>
            </div>

            <div className="grid grid-cols-4 gap-2">
              {(['SALA 1', 'SALA 2', 'SALA 3', 'SALA 4'] as RoomId[]).map((rId) => {
                const isSelected = selectedRoomId === rId;
                const rState = rooms[rId];
                return (
                  <button
                    key={rId}
                    onClick={() => {
                      sounds.playClick();
                      setSelectedRoomId(rId);
                    }}
                    className={`py-2.5 rounded-2xl font-['Lilita_One',sans-serif] text-xs uppercase tracking-wide border-2 transition-all ${
                      isSelected
                        ? 'bg-gradient-to-b from-amber-300 to-amber-500 text-slate-950 border-amber-600 shadow-md scale-102 font-extrabold'
                        : 'bg-slate-950/70 text-slate-300 border-slate-800 hover:border-emerald-500/40'
                    }`}
                  >
                    <div>{rId}</div>
                    <div className="text-[10px] opacity-80">{rState?.code}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3.1 Menu de Jogos (Botões Azuis Gamer) */}
          <div className="bg-slate-900/90 rounded-3xl p-4 md:p-5 border-2 border-emerald-500/40 shadow-lg space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-['Lilita_One',sans-serif] text-sm text-cyan-300 uppercase">
                3.1 SELECIONAR JOGO ATIVO
              </span>
              {currentRoom.currentGame !== 'none' && (
                <button
                  onClick={handleStopGame}
                  className="flex items-center gap-1 text-[11px] font-bold text-rose-400 hover:text-rose-300"
                >
                  <Square className="w-3 h-3 fill-rose-400" />
                  Encerrar Jogo
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {gamesConfig.map((g) => {
                const isCurrent = currentRoom.currentGame === g.id;
                const Icon = g.icon;

                return (
                  <button
                    key={g.id}
                    onClick={() => handleSelectGame(g.id)}
                    className={`flex items-center gap-2.5 p-3 rounded-2xl font-['Lilita_One',sans-serif] text-xs md:text-sm uppercase tracking-wide border-b-4 transition-all shadow-md text-left ${
                      isCurrent
                        ? 'bg-gradient-to-b from-amber-300 to-amber-500 text-slate-950 border-amber-700 ring-2 ring-white scale-102'
                        : 'bg-gradient-to-b from-cyan-400 to-blue-600 text-white border-blue-900 hover:brightness-110 active:translate-y-1'
                    }`}
                  >
                    <div className="p-1.5 rounded-xl bg-black/20">
                      <Icon className="w-4 h-4 stroke-[2.5]" />
                    </div>
                    <span className="truncate">{g.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3.4 TEMA (Ciências, Geografia, Filme: Jack, Filme: Vingadores) */}
          <div className="bg-slate-900/90 rounded-3xl p-4 md:p-5 border-2 border-emerald-500/40 shadow-lg space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-['Lilita_One',sans-serif] text-sm text-yellow-300 uppercase">
                3.4 TEMA DAS PERGUNTAS
              </span>
              <button
                onClick={() => setContentModalTab('temas')}
                className="text-[11px] font-bold text-cyan-300 hover:underline"
              >
                + Gerenciar Temas
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {themes.map((t) => {
                const isSelected = currentRoom.themeId === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => handleSelectTheme(t.id)}
                    className={`p-2.5 rounded-2xl font-['Lilita_One',sans-serif] text-xs uppercase tracking-wide border-2 transition-all text-center ${
                      isSelected
                        ? 'bg-emerald-500 text-slate-950 border-emerald-300 shadow-md font-black'
                        : 'bg-slate-950/70 text-slate-300 border-slate-800 hover:border-emerald-500/40'
                    }`}
                  >
                    {t.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3.3 Botões Cinza de Inserir Conteúdo */}
          <div className="bg-slate-900/90 rounded-3xl p-4 md:p-5 border-2 border-emerald-500/40 shadow-lg space-y-3">
            <span className="font-['Lilita_One',sans-serif] text-sm text-slate-300 uppercase block">
              3.3 INSERIR CONTEÚDO & PLANILHAS
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                onClick={() => {
                  sounds.playClick();
                  setContentModalTab('forca');
                }}
                className="p-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-['Lilita_One',sans-serif] text-xs uppercase border-b-4 border-slate-950 active:translate-y-1 shadow transition text-center"
              >
                INSERIR FORCA (.xlsx)
              </button>

              <button
                onClick={() => {
                  sounds.playClick();
                  setContentModalTab('vf');
                }}
                className="p-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-['Lilita_One',sans-serif] text-xs uppercase border-b-4 border-slate-950 active:translate-y-1 shadow transition text-center"
              >
                INSERIR V / F (.xlsx)
              </button>

              <button
                onClick={() => {
                  sounds.playClick();
                  setContentModalTab('quiz');
                }}
                className="p-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-['Lilita_One',sans-serif] text-xs uppercase border-b-4 border-slate-950 active:translate-y-1 shadow transition text-center"
              >
                INSERIR QUIZ (.xlsx)
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Active Live Game & Real-Time Student Controls */}
        <div className="lg:col-span-7 space-y-5">
          {/* Active Game Window */}
          <div className="bg-slate-900/95 rounded-3xl border-2 border-emerald-500/50 shadow-2xl p-4 md:p-6 overflow-hidden">
            <div className="flex items-center justify-between pb-3 border-b border-emerald-500/30 mb-4">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-emerald-400 animate-ping" />
                <span className="font-['Lilita_One',sans-serif] text-emerald-300 text-base md:text-lg uppercase">
                  TELA DO JOGO: {currentRoom.currentGame === 'none' ? 'LOBBY DE ESPERA' : currentRoom.currentGame.replace('_', ' ').toUpperCase()}
                </span>
              </div>

              <div className="text-xs font-bold text-amber-300">
                SALA ATIVA: {selectedRoomId}
              </div>
            </div>

            {/* Render active game in Professor mode */}
            {currentRoom.currentGame === 'cores' && <JogoCores room={currentRoom} isProfessor={true} />}
            {currentRoom.currentGame === 'verdadeiro_falso' && (
              <JogoVerdadeiroFalso room={currentRoom} isProfessor={true} />
            )}
            {currentRoom.currentGame === 'quiz' && <JogoQuiz room={currentRoom} isProfessor={true} />}
            {currentRoom.currentGame === 'forca' && (
              <JogoForca room={currentRoom} isProfessor={true} teams={teams} />
            )}
            {currentRoom.currentGame === 'stop' && <JogoStop room={currentRoom} isProfessor={true} />}
            {currentRoom.currentGame === 'none' && (
              <div className="text-center py-16 text-slate-400 space-y-3">
                <Sparkles className="w-12 h-12 text-emerald-400 mx-auto animate-pulse" />
                <p className="font-['Lilita_One',sans-serif] text-xl text-slate-300 uppercase">
                  NENHUM JOGO ATIVO NO MOMENTO
                </p>
                <p className="text-xs max-w-sm mx-auto text-slate-400">
                  Clique em um dos botões azuis à esquerda (JOGO DAS CORES, FORCA, V/F, STOP ou QUIZ) para iniciar!
                </p>
              </div>
            )}
          </div>

          {/* Real-time Students Manager & Live Scoreboard */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Live Scoreboard */}
            <Scoreboard roomId={selectedRoomId} players={players} teams={teams} />

            {/* Students List with manual point adjust and kick */}
            <div className="bg-slate-950/90 rounded-2xl border-2 border-emerald-500/40 p-3.5 space-y-3">
              <div className="flex items-center justify-between border-b border-emerald-500/30 pb-2">
                <span className="font-['Lilita_One',sans-serif] text-xs text-emerald-300 uppercase flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5" />
                  ALUNOS CONECTADOS ({players.length})
                </span>

                <button
                  onClick={handleResetScores}
                  className="text-[10px] text-rose-400 hover:text-rose-300 font-bold flex items-center gap-1"
                  title="Zerar pontuações"
                >
                  <RotateCcw className="w-3 h-3" />
                  Zerar Placar
                </button>
              </div>

              <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
                {players.length === 0 ? (
                  <p className="text-center py-4 text-xs text-slate-500 italic">
                    Nenhum aluno entrou nesta sala ainda.
                  </p>
                ) : (
                  players.map((p) => (
                    <div
                      key={p.id}
                      className="flex items-center justify-between p-2 rounded-xl bg-slate-900 border border-slate-800 text-xs"
                    >
                      <div className="truncate pr-2">
                        <span className="font-bold text-white uppercase">{p.name}</span>
                        <div className="text-[10px] text-emerald-400 font-bold">
                          {p.score} PTS {p.hasAnsweredCurrentQuestion && '• Respondeu!'}
                        </div>
                      </div>

                      {/* Controls: +5, -5, Kick */}
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleScoreAdjust(p.id, 5)}
                          className="p-1 rounded bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30"
                          title="+5 pontos"
                        >
                          <PlusCircle className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleScoreAdjust(p.id, -5)}
                          className="p-1 rounded bg-amber-500/20 text-amber-300 hover:bg-amber-500/30"
                          title="-5 pontos"
                        >
                          <MinusCircle className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleKick(p.id)}
                          className="p-1 rounded bg-rose-500/20 text-rose-400 hover:bg-rose-500/30"
                          title="Expulsar da sala"
                        >
                          <UserX className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {passwordModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-4xl">
            <RoomPasswordManager
              rooms={rooms}
              selectedRoom={selectedRoomId}
              onSelectRoom={(r) => {
                setSelectedRoomId(r);
                setPasswordModalOpen(false);
              }}
              onClose={() => setPasswordModalOpen(false)}
            />
          </div>
        </div>
      )}

      {contentModalTab && (
        <ContentManagerModal
          initialTab={contentModalTab}
          onClose={() => setContentModalTab(null)}
        />
      )}
    </div>
  );
};
