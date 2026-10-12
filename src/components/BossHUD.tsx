import React from 'react';
import { Enemy } from '../types/enemy';
import { Skull, AlertTriangle, Shield, Zap, Target } from 'lucide-react';

interface BossHUDProps {
  boss: Enemy;
}

export const BossHUD: React.FC<BossHUDProps> = ({ boss }) => {
  const currentPhase = (boss.bossCurrentPhase || 0) + 1;
  const maxPhases = boss.bossMaxPhases || 3;
  const phaseWords = boss.bossPhaseWords || [boss.word];
  const activeWord = phaseWords[boss.bossCurrentPhase || 0] || boss.word;
  const typedCount = boss.typedLetters || 0;
  const progressPercent = Math.min(100, (typedCount / activeWord.length) * 100);

  return (
    <div className="w-full max-w-4xl mx-auto px-4 pt-1 z-30 select-none animate-in fade-in slide-in-from-top-4 duration-300">
      <div className="bg-slate-950/90 border-2 border-rose-500/80 rounded-xl p-3 shadow-crimson-glow backdrop-blur-md relative overflow-hidden">
        {/* Ambient Top Glow */}
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-96 h-16 bg-rose-500/20 blur-xl pointer-events-none" />

        {/* Top Header Row */}
        <div className="flex items-center justify-between gap-3 mb-2">
          {/* Boss Icon & Name */}
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-rose-500/20 border border-rose-500 flex items-center justify-center animate-pulse">
              <Skull className="w-4 h-4 text-rose-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs sm:text-sm font-black font-display tracking-widest text-white drop-shadow">
                  TITAN-0 // CORE OVERMIND
                </span>
                <span className="text-[9px] font-bold font-mono px-1.5 py-0.5 rounded bg-rose-500/30 text-rose-300 border border-rose-500/50">
                  CLASS V THREAT
                </span>
              </div>
            </div>
          </div>

          {/* Phase Badge */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-tech text-slate-400 font-bold">
              PHASE STATUS
            </span>
            <span className="text-xs font-black font-display px-2 py-0.5 rounded bg-slate-900 border border-rose-500/60 text-rose-400">
              {currentPhase} / {maxPhases}
            </span>
          </div>
        </div>

        {/* Segmented Phase Health Bar */}
        <div className="flex gap-2 mb-2 w-full">
          {Array.from({ length: maxPhases }).map((_, idx) => {
            const isCompleted = idx < (boss.bossCurrentPhase || 0);
            const isCurrent = idx === (boss.bossCurrentPhase || 0);
            const isUpcoming = idx > (boss.bossCurrentPhase || 0);

            return (
              <div
                key={idx}
                className="flex-1 h-3.5 bg-slate-900 rounded border overflow-hidden relative"
                style={{
                  borderColor: isCurrent ? '#ff007f' : isCompleted ? '#334155' : '#1e293b',
                }}
              >
                {isCompleted && (
                  <div className="w-full h-full bg-slate-800 opacity-60" />
                )}
                {isCurrent && (
                  <div
                    className="h-full bg-gradient-to-r from-rose-600 via-pink-500 to-amber-400 transition-all duration-150 shadow-crimson-glow"
                    style={{ width: `${100 - progressPercent}%` }}
                  />
                )}
                {isUpcoming && (
                  <div className="w-full h-full bg-rose-950/70" />
                )}
                <span className="absolute inset-0 flex items-center justify-center text-[8px] font-mono font-bold text-slate-300 pointer-events-none">
                  {isCompleted ? 'OFFLINE' : `PHASE ${idx + 1}`}
                </span>
              </div>
            );
          })}
        </div>

        {/* Active Phase Command Word Display */}
        <div className="flex items-center justify-between text-xs font-mono bg-slate-900/80 px-3 py-1.5 rounded-lg border border-slate-800">
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-rose-400 font-bold uppercase font-tech">
              OVERRIDE SEQUENCE:
            </span>
            <span className="font-mono font-black text-sm tracking-widest text-slate-100">
              <span className="text-cyan-400 underline decoration-cyan-400">
                {activeWord.slice(0, typedCount).toUpperCase()}
              </span>
              <span className="bg-rose-500 text-slate-950 px-1 rounded animate-pulse">
                {activeWord.slice(typedCount, typedCount + 1).toUpperCase()}
              </span>
              <span className="text-slate-500">
                {activeWord.slice(typedCount + 1).toUpperCase()}
              </span>
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-[10px] text-amber-400 font-bold">
            <Zap className="w-3.5 h-3.5" />
            <span>PROGRESS: {Math.round(progressPercent)}%</span>
          </div>
        </div>
      </div>
    </div>
  );
};
