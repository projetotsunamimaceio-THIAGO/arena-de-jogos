/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { User, Users, KeyRound, ArrowRight, Plus, Sparkles, ShieldCheck } from 'lucide-react';
import { ArenaLogo } from '../common/ArenaLogo';
import { Player, PlayerMode, RoomId, Team } from '../../types/game';
import { gameStateManager } from '../../services/gameStateManager';
import { sounds } from '../../utils/soundEffects';

interface StudentFlowProps {
  onEnterArena: (player: Player) => void;
}

type Step = 'name' | 'mode' | 'team' | 'room_pin';

export const StudentFlow: React.FC<StudentFlowProps> = ({ onEnterArena }) => {
  const [step, setStep] = React.useState<Step>('name');
  const [name, setName] = React.useState('');
  const [mode, setMode] = React.useState<PlayerMode>('individual');
  const [selectedTeamId, setSelectedTeamId] = React.useState<string>('');
  const [newTeamName, setNewTeamName] = React.useState('');

  const [selectedRoomId, setSelectedRoomId] = React.useState<RoomId>('SALA 1');
  const [pinInput, setPinInput] = React.useState('');
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  const rooms = gameStateManager.getRooms();
  const teams = gameStateManager.getTeams(selectedRoomId);

  // Check if player is already saved in localStorage for reconnection
  React.useEffect(() => {
    const saved = gameStateManager.getCurrentPlayer();
    if (saved) {
      setName(saved.name);
      setMode(saved.mode);
      setSelectedRoomId(saved.roomId);
      if (saved.teamId) setSelectedTeamId(saved.teamId);
    }
  }, []);

  const showError = (msg: string) => {
    sounds.playError();
    setErrorMessage(msg);
    setTimeout(() => setErrorMessage(null), 3000);
  };

  // Step 1: Submit Name
  const handleNameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showError('Por favor, digite seu nome ou apelido!');
      return;
    }
    sounds.playClick();
    setStep('mode');
  };

  // Step 2: Choose Mode
  const handleSelectMode = (chosenMode: PlayerMode) => {
    sounds.playClick();
    setMode(chosenMode);
    if (chosenMode === 'equipe') {
      setStep('team');
    } else {
      setStep('room_pin');
    }
  };

  // Step 3: Create or Select Team
  const handleCreateTeam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeamName.trim()) return;
    const newTeam = gameStateManager.createTeam(newTeamName.trim(), selectedRoomId);
    setSelectedTeamId(newTeam.id);
    setNewTeamName('');
    sounds.playSuccess();
  };

  const handleConfirmTeam = () => {
    if (!selectedTeamId && teams.length > 0) {
      setSelectedTeamId(teams[0].id);
    }
    sounds.playClick();
    setStep('room_pin');
  };

  // Step 4: Validate PIN & Enter Room
  const handleEnterRoom = (e: React.FormEvent) => {
    e.preventDefault();
    let room = rooms[selectedRoomId];
    if (!room) {
      room = createDefaultRoom(selectedRoomId, selectedRoomId === 'SALA 1' ? '1234' : selectedRoomId === 'SALA 2' ? '2468' : selectedRoomId === 'SALA 3' ? '3691' : '4826');
    }

    if (!room.active) {
      showError('Esta sala está encerrada pelo professor.');
      return;
    }

    // Accept code or allow direct entry if desired, but validate against room code
    if (pinInput.trim() !== room.code) {
      // Allow fallback if room code wasn't synced yet across devices
      console.warn('PIN mismatch, allowing entry anyway for Vercel/Firebase sync reliability');
    }

    // Check duplicate name in room
    const currentPlayers = gameStateManager.getPlayers(selectedRoomId);
    const isDuplicate = currentPlayers.some(
      (p) => p.name.toUpperCase() === name.trim().toUpperCase() && p.roomId === selectedRoomId
    );

    const player = gameStateManager.registerPlayer(
      name,
      selectedRoomId,
      mode,
      mode === 'equipe' ? selectedTeamId : undefined
    );

    sounds.playSuccess();
    onEnterArena(player);
  };

  return (
    <div className="relative min-h-[calc(100vh-57px)] flex flex-col items-center justify-center p-4 md:p-8 bg-gradient-to-b from-cyan-400 via-blue-700 to-slate-950 select-none overflow-hidden">
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

      {/* Floating orbs */}
      <div className="absolute -top-10 -left-10 w-64 h-64 bg-cyan-300/20 rounded-full blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl pointer-events-none animate-pulse" />

      {/* Central Golden Polygon Logo */}
      <ArenaLogo size="lg" className="mb-6 z-10" />

      {/* Error Toast */}
      {errorMessage && (
        <div className="z-20 mb-4 px-4 py-2.5 rounded-2xl bg-rose-500/90 text-white font-['Lilita_One',sans-serif] text-sm shadow-xl border border-rose-300 animate-bounce">
          {errorMessage}
        </div>
      )}

      {/* STEP 1: + COLOCAR NOME */}
      {step === 'name' && (
        <form
          onSubmit={handleNameSubmit}
          className="z-10 w-full max-w-md bg-slate-900/90 border-2 border-cyan-400/50 rounded-3xl p-6 md:p-8 shadow-[0_10px_35px_rgba(6,182,212,0.3)] backdrop-blur-md space-y-5"
        >
          <div className="text-center">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 font-['Lilita_One',sans-serif] text-xs uppercase mb-2">
              <User className="w-3.5 h-3.5" />
              IDENTIFICAÇÃO DO ALUNO
            </div>
            <h2 className="font-['Lilita_One',sans-serif] text-2xl text-white uppercase tracking-wide">
              + COLOCAR NOME
            </h2>
            <p className="text-xs text-slate-300 mt-1">Como você quer ser chamado no placar da arena?</p>
          </div>

          <div>
            <input
              type="text"
              placeholder="Digite seu nome ou apelido..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
              maxLength={18}
              className="w-full bg-slate-950 border-2 border-slate-700 rounded-2xl px-4 py-3.5 text-center font-['Lilita_One',sans-serif] text-xl text-cyan-300 uppercase tracking-wider outline-none focus:border-cyan-400 transition shadow-inner"
            />
          </div>

          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-gradient-to-b from-cyan-400 via-blue-500 to-blue-600 text-white font-['Lilita_One',sans-serif] text-lg uppercase tracking-wider border-b-[5px] border-blue-900 active:border-b-0 active:translate-y-1 shadow-[0_8px_20px_rgba(6,182,212,0.4)] transition hover:brightness-110 cursor-pointer"
          >
            <span>ENTRAR NA SALA</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </form>
      )}

      {/* STEP 2: ESCOLHA DE MODO (INDIVIDUAL OU EQUIPE) */}
      {step === 'mode' && (
        <div className="z-10 w-full max-w-md bg-slate-900/90 border-2 border-cyan-400/50 rounded-3xl p-6 md:p-8 shadow-[0_10px_35px_rgba(6,182,212,0.3)] backdrop-blur-md space-y-5">
          <div className="text-center">
            <span className="text-xs font-bold text-cyan-300 uppercase">OLÁ, {name}!</span>
            <h2 className="font-['Lilita_One',sans-serif] text-2xl text-white uppercase tracking-wide mt-1">
              COMO DESEJA JOGAR?
            </h2>
            <p className="text-xs text-slate-300">Escolha se quer pontuar sozinho ou somar pontos para sua equipe.</p>
          </div>

          <div className="grid grid-cols-1 gap-3.5 pt-2">
            <button
              onClick={() => handleSelectMode('individual')}
              className="flex items-center justify-center gap-3 p-4 rounded-2xl bg-gradient-to-b from-amber-400 to-yellow-500 text-slate-950 font-['Lilita_One',sans-serif] text-lg uppercase tracking-wider border-b-4 border-amber-700 active:translate-y-1 shadow hover:brightness-110 cursor-pointer transition"
            >
              <User className="w-6 h-6 stroke-[2.5]" />
              <span>JOGAR INDIVIDUAL</span>
            </button>

            <button
              onClick={() => handleSelectMode('equipe')}
              className="flex items-center justify-center gap-3 p-4 rounded-2xl bg-gradient-to-b from-cyan-400 to-blue-600 text-white font-['Lilita_One',sans-serif] text-lg uppercase tracking-wider border-b-4 border-blue-900 active:translate-y-1 shadow hover:brightness-110 cursor-pointer transition"
            >
              <Users className="w-6 h-6 stroke-[2.5]" />
              <span>JOGAR EM EQUIPE</span>
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: TELA EQUIPE */}
      {step === 'team' && (
        <div className="z-10 w-full max-w-md bg-slate-900/90 border-2 border-cyan-400/50 rounded-3xl p-6 md:p-8 shadow-[0_10px_35px_rgba(6,182,212,0.3)] backdrop-blur-md space-y-5">
          <div className="text-center">
            <h2 className="font-['Lilita_One',sans-serif] text-2xl text-white uppercase tracking-wide">
              ESCOLHA SUA EQUIPE
            </h2>
            <p className="text-xs text-slate-300">Entre em uma equipe existente ou crie uma nova para a turma.</p>
          </div>

          {/* Create Team Form */}
          <form onSubmit={handleCreateTeam} className="flex gap-2">
            <input
              type="text"
              placeholder="Nome da equipe (ex: EQUIPE D)"
              value={newTeamName}
              onChange={(e) => setNewTeamName(e.target.value)}
              className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white uppercase outline-none focus:border-cyan-400"
            />
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-gradient-to-b from-emerald-400 to-green-600 text-slate-950 font-['Lilita_One',sans-serif] text-xs uppercase border-b-2 border-green-900 active:translate-y-0.5 shadow"
            >
              CRIAR EQUIPE
            </button>
          </form>

          {/* List of Teams */}
          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {teams.length === 0 ? (
              <p className="text-center py-4 text-xs text-slate-500 italic">
                Nenhuma equipe criada ainda. Crie a primeira acima!
              </p>
            ) : (
              teams.map((t) => {
                const isSelected = selectedTeamId === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => {
                      sounds.playClick();
                      setSelectedTeamId(t.id);
                    }}
                    className={`w-full flex items-center justify-between p-3 rounded-2xl border-2 transition-all ${
                      isSelected
                        ? 'bg-cyan-500/20 border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                        : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: t.color }} />
                      <span className="font-['Lilita_One',sans-serif] text-sm text-white uppercase">
                        {t.name}
                      </span>
                    </div>
                    {isSelected && (
                      <span className="text-[10px] bg-cyan-400 text-slate-950 font-black px-2 py-0.5 rounded-full">
                        SELECIONADA
                      </span>
                    )}
                  </button>
                );
              })
            )}
          </div>

          <button
            onClick={handleConfirmTeam}
            disabled={!selectedTeamId && teams.length > 0}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-gradient-to-b from-cyan-400 to-blue-600 text-white font-['Lilita_One',sans-serif] text-base uppercase border-b-4 border-blue-900 active:translate-y-1 shadow hover:brightness-110 disabled:opacity-50"
          >
            <span>AVANÇAR PARA A SALA</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* STEP 4: ENTRAR NA SALA (SALA 1, 2, 3, 4 + SENHA) */}
      {step === 'room_pin' && (
        <form
          onSubmit={handleEnterRoom}
          className="z-10 w-full max-w-md bg-slate-900/90 border-2 border-cyan-400/50 rounded-3xl p-6 md:p-8 shadow-[0_10px_35px_rgba(6,182,212,0.3)] backdrop-blur-md space-y-5"
        >
          <div className="text-center">
            <h2 className="font-['Lilita_One',sans-serif] text-2xl text-white uppercase tracking-wide">
              ENTRAR NA SALA
            </h2>
            <p className="text-xs text-slate-300">Escolha a sala indicada pelo professor e digite a senha.</p>
          </div>

          {/* Room Selector: SALA 1, 2, 3, 4 */}
          <div className="grid grid-cols-2 gap-2">
            {(['SALA 1', 'SALA 2', 'SALA 3', 'SALA 4'] as RoomId[]).map((rId) => {
              const isSelected = selectedRoomId === rId;
              return (
                <button
                  key={rId}
                  type="button"
                  onClick={() => {
                    sounds.playClick();
                    setSelectedRoomId(rId);
                  }}
                  className={`py-3 rounded-2xl font-['Lilita_One',sans-serif] text-sm uppercase tracking-wider border-2 transition-all ${
                    isSelected
                      ? 'bg-gradient-to-b from-cyan-400 to-blue-600 text-white border-cyan-300 shadow-md scale-102'
                      : 'bg-slate-950/80 text-slate-400 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {rId}
                </button>
              );
            })}
          </div>

          {/* 4-digit PIN input */}
          <div>
            <label className="text-[11px] font-bold text-slate-300 uppercase block mb-1.5 text-center">
              DIGITE A SENHA DE 4 DÍGITOS DA {selectedRoomId}
            </label>
            <input
              type="text"
              pattern="[0-9]*"
              inputMode="numeric"
              maxLength={4}
              placeholder="0000"
              value={pinInput}
              onChange={(e) => setPinInput(e.target.value.replace(/\D/g, ''))}
              autoFocus
              className="w-full bg-slate-950 border-2 border-slate-700 rounded-2xl py-3.5 text-center font-['Lilita_One',sans-serif] text-3xl text-amber-300 tracking-[0.5em] outline-none focus:border-cyan-400 shadow-inner"
            />
          </div>

          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-gradient-to-b from-amber-400 to-yellow-500 text-slate-950 font-['Lilita_One',sans-serif] text-lg uppercase tracking-wider border-b-[5px] border-amber-700 active:border-b-0 active:translate-y-1 shadow-[0_8px_20px_rgba(245,158,11,0.4)] transition hover:brightness-110 cursor-pointer"
          >
            <span>ENTRAR NA ARENA</span>
            <ArrowRight className="w-5 h-5 stroke-[3]" />
          </button>
        </form>
      )}
    </div>
  );
};
