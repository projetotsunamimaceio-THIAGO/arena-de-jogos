/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Lock, User, Eye, EyeOff, ShieldCheck, ArrowRight, AlertCircle, Sparkles } from 'lucide-react';
import { ArenaLogo } from '../common/ArenaLogo';
import { sounds } from '../../utils/soundEffects';

const AUTH_STORAGE_KEY = 'arena_professor_auth_v1';
export const VALID_PROFESSOR_USER = 'ThiagoRocha';
export const VALID_PROFESSOR_PASS = '123456';

export const isProfessorLoggedIn = (): boolean => {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(AUTH_STORAGE_KEY) === 'true';
};

export const setProfessorLoggedIn = (loggedIn: boolean) => {
  if (typeof window === 'undefined') return;
  if (loggedIn) {
    localStorage.setItem(AUTH_STORAGE_KEY, 'true');
  } else {
    localStorage.removeItem(AUTH_STORAGE_KEY);
  }
};

interface ProfessorLoginProps {
  onSuccess: () => void;
  onCancel?: () => void;
}

export const ProfessorLogin: React.FC<ProfessorLoginProps> = ({ onSuccess, onCancel }) => {
  const [username, setUsername] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [showPassword, setShowPassword] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [isShaking, setIsShaking] = React.useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Check credentials (case-insensitive for username convenience, exact for password)
    const cleanUser = username.trim();
    const cleanPass = password.trim();

    if (cleanUser.toLowerCase() === VALID_PROFESSOR_USER.toLowerCase() && cleanPass === VALID_PROFESSOR_PASS) {
      sounds.playSuccess();
      setProfessorLoggedIn(true);
      onSuccess();
    } else {
      sounds.playError();
      setErrorMessage('Usuário ou senha incorretos! Verifique suas credenciais.');
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 600);
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-57px)] flex flex-col items-center justify-center p-4 md:p-8 bg-gradient-to-b from-emerald-700 via-green-900 to-slate-950 select-none overflow-hidden">
      {/* Background Neon Grid Effect */}
      <div
        className="absolute inset-0 opacity-15 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(16, 185, 129, 0.25) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(16, 185, 129, 0.25) 1px, transparent 1px)
          `,
          backgroundSize: '36px 36px',
        }}
      />

      {/* Floating emerald neon orbs */}
      <div className="absolute top-10 left-10 w-72 h-72 bg-emerald-400/20 rounded-full blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-green-500/20 rounded-full blur-3xl pointer-events-none animate-pulse delay-500" />

      {/* Logo */}
      <ArenaLogo size="lg" className="mb-6 z-10" />

      {/* Login Card */}
      <div
        className={`z-10 w-full max-w-md bg-slate-900/95 border-2 border-emerald-400/50 rounded-3xl p-6 md:p-8 shadow-[0_15px_40px_rgba(16,185,129,0.3)] backdrop-blur-xl transition-transform ${
          isShaking ? 'translate-x-2 animate-bounce' : ''
        }`}
      >
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 font-['Lilita_One',sans-serif] text-xs uppercase mb-2">
            <Lock className="w-3.5 h-3.5" />
            ÁREA RESTRITA DO PROFESSOR
          </div>
          <h2 className="font-['Lilita_One',sans-serif] text-2xl md:text-3xl text-white uppercase tracking-wide">
            LOGIN DO PROFESSOR
          </h2>
          <p className="text-xs text-slate-300 mt-1">
            Entre com suas credenciais de administrador para gerenciar salas e jogos.
          </p>
        </div>

        {/* Error alert */}
        {errorMessage && (
          <div className="mb-4 p-3 rounded-2xl bg-rose-500/20 border border-rose-500/60 text-rose-300 text-xs font-bold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Usuário */}
          <div>
            <label className="text-[11px] font-bold text-slate-300 uppercase block mb-1.5 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-emerald-400" />
              <span>USUÁRIO</span>
            </label>
            <input
              type="text"
              autoFocus
              placeholder="Digite o usuário..."
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                if (errorMessage) setErrorMessage(null);
              }}
              className="w-full bg-slate-950 border-2 border-slate-700 rounded-2xl px-4 py-3 text-sm font-semibold text-white placeholder-slate-500 outline-none focus:border-emerald-400 transition shadow-inner"
            />
          </div>

          {/* Senha */}
          <div>
            <label className="text-[11px] font-bold text-slate-300 uppercase block mb-1.5 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-emerald-400" />
              <span>SENHA</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Digite a senha..."
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errorMessage) setErrorMessage(null);
                }}
                className="w-full bg-slate-950 border-2 border-slate-700 rounded-2xl px-4 py-3 pr-11 text-sm font-semibold text-white placeholder-slate-500 outline-none focus:border-emerald-400 transition shadow-inner"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-slate-200 transition"
                title={showPassword ? 'Ocultar senha' : 'Ver senha'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full mt-2 flex items-center justify-center gap-2 py-4 rounded-2xl bg-gradient-to-b from-amber-300 via-amber-400 to-amber-500 text-slate-950 font-['Lilita_One',sans-serif] text-lg uppercase tracking-wider border-b-[5px] border-amber-700 active:border-b-0 active:translate-y-1 shadow-[0_8px_20px_rgba(245,158,11,0.4)] transition hover:brightness-110 cursor-pointer"
          >
            <ShieldCheck className="w-5 h-5 stroke-[2.5]" />
            <span>ENTRAR NO PAINEL</span>
            <ArrowRight className="w-5 h-5" />
          </button>

          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="w-full py-2.5 text-xs text-slate-400 hover:text-white transition font-bold"
            >
              Voltar ao Início
            </button>
          )}
        </form>
      </div>
    </div>
  );
};
