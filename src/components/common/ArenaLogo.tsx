/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

interface ArenaLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showSubtitle?: boolean;
  className?: string;
}

export const ArenaLogo: React.FC<ArenaLogoProps> = ({
  size = 'md',
  showSubtitle = false,
  className = '',
}) => {
  const sizeClasses = {
    sm: 'px-4 py-2 text-base md:text-lg min-w-[140px]',
    md: 'px-6 py-3 text-xl md:text-2xl min-w-[200px]',
    lg: 'px-8 py-5 text-2xl md:text-3xl min-w-[260px]',
    xl: 'px-10 py-6 text-3xl md:text-4xl min-w-[320px]',
  };

  return (
    <div className={`relative flex flex-col items-center justify-center select-none group ${className}`}>
      {/* Outer Glow */}
      <div className="absolute inset-0 bg-amber-400/30 blur-xl rounded-full scale-110 pointer-events-none animate-pulse" />

      {/* Outer Beveled Polygon Border */}
      <div
        className="relative p-[5px] bg-gradient-to-b from-amber-200 via-amber-600 to-amber-950 shadow-2xl transition-transform duration-200 hover:scale-105"
        style={{
          clipPath: 'polygon(15% 0%, 85% 0%, 100% 30%, 100% 70%, 85% 100%, 15% 100%, 0% 70%, 0% 30%)',
          filter: 'drop-shadow(0 10px 15px rgba(0,0,0,0.6))',
        }}
      >
        {/* Inner Golden Gradient Plate */}
        <div
          className={`flex flex-col items-center justify-center bg-gradient-to-b from-amber-300 via-yellow-400 to-amber-500 ${sizeClasses[size]} text-center`}
          style={{
            clipPath: 'polygon(15% 0%, 85% 0%, 100% 30%, 100% 70%, 85% 100%, 15% 100%, 0% 70%, 0% 30%)',
          }}
        >
          {/* Top highlight line */}
          <div className="w-3/4 h-[2px] bg-yellow-100/70 mb-1 rounded-full" />

          {/* Golden Polygon Text: "ARENA DE JOGOS" */}
          <h1
            className="font-['Lilita_One',sans-serif] tracking-wider text-black font-extrabold uppercase leading-none drop-shadow-[0_1px_1px_rgba(255,255,255,0.4)]"
            style={{
              textShadow: '0 2px 0 rgba(255, 255, 255, 0.4), 0 -1px 0 rgba(0,0,0,0.2)',
            }}
          >
            ARENA DE JOGOS
          </h1>

          {showSubtitle && (
            <span className="text-[10px] md:text-xs font-black tracking-widest text-amber-950 uppercase mt-0.5 opacity-90">
              PLATAFORMA EDUCATIVA
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
