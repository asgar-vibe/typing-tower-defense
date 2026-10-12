import React from 'react';
import { BaseStats, CombatStats } from '../types/game';
import { Shield, Coins, Trophy, Flame, Volume2, VolumeX, Activity, Zap } from 'lucide-react';
import { soundEngine } from '../utils/SoundEngine';

interface GameHUDProps {
  stats: BaseStats;
  combatStats: CombatStats;
  isMuted: boolean;
  onToggleMute: () => void;
  panicModeActive?: boolean;
}

export const GameHUD: React.FC<GameHUDProps> = ({
  stats,
  combatStats,
  isMuted,
  onToggleMute,
  panicModeActive = false,
}) => {
  const hpPercentage = Math.max(0, Math.min(100, (stats.currentHp / stats.maxHp) * 100));

  // Determine health bar gradient & color
  let hpColorClass = 'bg-gradient-to-r from-emerald-500 to-green-400 shadow-green-glow';
  let hpTextColor = 'text-green-400';
  if (hpPercentage < 30) {
    hpColorClass = 'bg-gradient-to-r from-rose-600 to-red-500 shadow-crimson-glow animate-pulse';
    hpTextColor = 'text-red-400';
  } else if (hpPercentage < 65) {
    hpColorClass = 'bg-gradient-to-r from-amber-500 to-yellow-400 shadow-amber-glow';
    hpTextColor = 'text-amber-400';
  }

  return (
    <header className="w-full bg-slate-950/85 backdrop-blur-md border-b border-cyan-500/20 px-4 py-2.5 z-40 relative shadow-2xl">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Left: Brand & Fortress HP */}
        <div className="flex items-center gap-5">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-cyan-500/10 border border-cyan-400/40 flex items-center justify-center shadow-cyan-glow">
              <Shield className="w-5 h-5 text-cyan-400 animate-pulse" />
            </div>
            <div>
              <div className="text-[11px] uppercase tracking-widest text-cyan-400 font-tech font-bold">
                Fortress Core
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-base font-black font-display ${hpTextColor}`}>
                  {stats.currentHp}
                  <span className="text-xs text-slate-500 font-normal"> / {stats.maxHp} HP</span>
                </span>
              </div>
            </div>
          </div>

          {/* Core HP Bar */}
          <div className="w-36 sm:w-48 h-3 bg-slate-900 rounded-full border border-slate-700/80 overflow-hidden relative p-0.5">
            <div
              className={`h-full rounded-full transition-all duration-300 ${hpColorClass}`}
              style={{ width: `${hpPercentage}%` }}
            />
            {/* Health Grid Lines */}
            <div className="absolute inset-0 flex justify-between px-2 pointer-events-none opacity-20">
              <span className="w-px h-full bg-white" />
              <span className="w-px h-full bg-white" />
              <span className="w-px h-full bg-white" />
            </div>
          </div>
        </div>

        {/* Center: Wave & Score & Multiplier */}
        <div className="flex items-center gap-4 sm:gap-6 bg-slate-900/60 border border-slate-800 rounded-xl px-4 py-1.5 shadow-inner">
          {/* Wave */}
          <div className="text-center">
            <span className="text-[10px] text-slate-400 uppercase tracking-widest block font-tech">
              Sector Wave
            </span>
            <span className="text-lg font-black text-white font-display tracking-wider">
              WAVE {stats.wave}
            </span>
          </div>

          <div className="w-px h-7 bg-slate-800" />

          {/* Score */}
          <div className="text-center">
            <span className="text-[10px] text-slate-400 uppercase tracking-widest block font-tech">
              Score
            </span>
            <span className="text-lg font-black text-cyan-400 font-display">
              {stats.score.toLocaleString()}
            </span>
          </div>

          <div className="w-px h-7 bg-slate-800" />

          {/* Streak & Multiplier */}
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
              <Flame className={`w-4 h-4 ${stats.streak > 5 ? 'text-amber-400 animate-bounce' : 'text-slate-400'}`} />
            </div>
            <div>
              <span className="text-[10px] text-amber-400 uppercase tracking-wider block font-tech font-bold">
                {stats.multiplier.toFixed(1)}x Combo
              </span>
              <span className="text-xs font-bold text-slate-300 font-mono">
                {stats.streak} Streak
              </span>
            </div>
          </div>
        </div>

        {/* Right: Gold, WPM & Audio Controls */}
        <div className="flex items-center gap-4">
          {/* Gold Counter */}
          <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 px-3 py-1.5 rounded-lg shadow-sm">
            <Coins className="w-4 h-4 text-amber-400" />
            <div className="text-left font-mono">
              <span className="text-sm font-extrabold text-amber-300 font-display">
                {stats.gold}
              </span>
              <span className="text-[10px] text-amber-400/80 ml-1">CREDITS</span>
            </div>
          </div>

          {/* WPM & Accuracy Badge */}
          <div className="hidden md:flex items-center gap-2 text-xs font-mono text-slate-400 bg-slate-900/40 px-2.5 py-1.5 rounded-lg border border-slate-800">
            <Activity className="w-3.5 h-3.5 text-cyan-400" />
            <span>{Math.round(combatStats.wpm)} WPM</span>
            <span className="text-slate-600">|</span>
            <span className="text-emerald-400">{Math.round(combatStats.accuracy)}% ACC</span>
          </div>

          {/* Audio Mute Toggle */}
          <button
            onClick={() => {
              onToggleMute();
              soundEngine.playKeyClick();
            }}
            className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-700 hover:border-cyan-400 text-slate-400 hover:text-cyan-400 flex items-center justify-center transition-colors"
            title={isMuted ? "Unmute Audio" : "Mute Audio"}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
          </button>
        </div>
      </div>
    </header>
  );
};
