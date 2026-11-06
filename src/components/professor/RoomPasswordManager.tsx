/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Copy, RefreshCw, Power, Check, Users, KeyRound, Sparkles } from 'lucide-react';
import { RoomId, RoomState } from '../../types/game';
import { gameStateManager } from '../../services/gameStateManager';
import { sounds } from '../../utils/soundEffects';

interface RoomPasswordManagerProps {
  rooms: Record<RoomId, RoomState>;
  selectedRoom: RoomId;
  onSelectRoom: (roomId: RoomId) => void;
  onClose?: () => void;
}

export const RoomPasswordManager: React.FC<RoomPasswordManagerProps> = ({
  rooms,
  selectedRoom,
  onSelectRoom,
  onClose,
}) => {
  const [copiedId, setCopiedId] = React.useState<string | null>(null);

  const roomList: RoomId[] = ['SALA 1', 'SALA 2', 'SALA 3', 'SALA 4'];

  const handleCopyCode = (roomId: RoomId, code: string) => {
    navigator.clipboard.writeText(code);
    sounds.playClick();
    setCopiedId(roomId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleRegenerate = (roomId: RoomId) => {
    sounds.playSuccess();
    gameStateManager.regenerateRoomCode(roomId);
  };

  const handleToggleActive = (roomId: RoomId) => {
    sounds.playClick();
    gameStateManager.toggleRoomActive(roomId);
  };

  return (
    <div className="bg-slate-900/95 border-2 border-emerald-500/50 rounded-3xl p-5 md:p-6 shadow-[0_10px_30px_rgba(0,0,0,0.8)] backdrop-blur-xl">
      <div className="flex items-center justify-between pb-4 border-b border-emerald-500/30 mb-5">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-400">
            <KeyRound className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-['Lilita_One',sans-serif] text-xl md:text-2xl text-emerald-300 uppercase tracking-wide">
              SALAS E SENHAS
            </h2>
            <p className="text-xs text-slate-400">
              Gerencie as 4 salas simultâneas, senhas de 4 dígitos e status de conexão.
            </p>
          </div>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition"
          >
            Fechar
          </button>
        )}
      </div>

      {/* Room Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {roomList.map((roomId) => {
          const room = rooms[roomId] || { id: roomId, code: '1234', active: true, currentGame: 'none' };
          const isSelected = selectedRoom === roomId;
          const playersCount = gameStateManager.getPlayers(roomId).length;

          return (
            <div
              key={roomId}
              className={`relative rounded-2xl p-4 border-2 transition-all flex flex-col justify-between ${
                isSelected
                  ? 'bg-emerald-950/50 border-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                  : 'bg-slate-950/60 border-slate-800 hover:border-emerald-500/40'
              }`}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-3">
                <button
                  onClick={() => {
                    sounds.playClick();
                    onSelectRoom(roomId);
                  }}
                  className="font-['Lilita_One',sans-serif] text-lg text-white hover:text-emerald-300 transition flex items-center gap-2"
                >
                  <span>{roomId}</span>
                  {isSelected && (
                    <span className="text-[10px] bg-emerald-500 text-slate-950 font-bold px-1.5 py-0.5 rounded-full">
                      SELECIONADA
                    </span>
                  )}
                </button>

                <div
                  className={`w-3 h-3 rounded-full ${
                    room.active ? 'bg-emerald-400 shadow-[0_0_8px_#34d399]' : 'bg-rose-500'
                  }`}
                  title={room.active ? 'Sala Ativa' : 'Sala Encerrada'}
                />
              </div>

              {/* 4-digit PIN */}
              <div className="my-2 bg-slate-900 border border-slate-700 rounded-2xl p-3 flex flex-col items-center justify-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  SENHA DE ACESSO
                </span>
                <div className="font-['Lilita_One',sans-serif] text-3xl tracking-widest text-amber-300 font-extrabold drop-shadow">
                  {room.code}
                </div>
              </div>

              {/* Info */}
              <div className="flex items-center justify-between text-xs text-slate-400 py-1 mb-3">
                <div className="flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{playersCount} alunos</span>
                </div>
                <div className="text-[11px] font-semibold text-emerald-400 uppercase">
                  {room.currentGame === 'none' ? 'Aguardando' : room.currentGame.replace('_', ' ')}
                </div>
              </div>

              {/* Actions */}
              <div className="grid grid-cols-3 gap-1.5 pt-2 border-t border-slate-800">
                <button
                  onClick={() => handleCopyCode(roomId, room.code)}
                  className="flex items-center justify-center gap-1 p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition"
                  title="Copiar Senha"
                >
                  {copiedId === roomId ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>

                <button
                  onClick={() => handleRegenerate(roomId)}
                  className="flex items-center justify-center gap-1 p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-bold transition"
                  title="Regenerar Senha (novo PIN)"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => handleToggleActive(roomId)}
                  className={`flex items-center justify-center gap-1 p-2 rounded-xl text-xs font-bold transition ${
                    room.active
                      ? 'bg-rose-500/20 text-rose-300 hover:bg-rose-500/30'
                      : 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30'
                  }`}
                  title={room.active ? 'Encerrar Sala' : 'Reabrir Sala'}
                >
                  <Power className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
