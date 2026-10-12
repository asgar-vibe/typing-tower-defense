import React, { useEffect } from 'react';
import { Trophy, ArrowRight, Zap, Target, Coins, ShieldCheck } from 'lucide-react';

interface VictoryModalProps {
  wave: number;
  enemiesDefeated: number;
  wpm: number;
  accuracy: number;
  bonusGold: number;
  onNextWave: () => void;
}

export const VictoryModal: React.FC<VictoryModalProps> = ({
  wave,
  enemiesDefeated,
  wpm,
  accuracy,
  bonusGold,
  onNextWave,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        onNextWave();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onNextWave]);

  return (
    <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-slate-900 border-2 border-cyan-400 rounded-2xl p-6 shadow-cyan-glow relative overflow-hidden text-center animate-in fade-in zoom-in-95 duration-200">
        {/* Glow ambient background */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Header Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-400/40 text-cyan-400 text-xs font-tech font-bold uppercase mb-3">
          <ShieldCheck className="w-4 h-4 text-cyan-400" />
          Sector Defense Secured
        </div>

        <h2 className="text-3xl font-black font-display text-white tracking-wider mb-1">
          WAVE {wave} CLEARED
        </h2>
        <p className="text-xs font-mono text-slate-400 mb-6">
          All hostile incursions successfully neutralized. Fortress integrity intact.
        </p>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 mb-6 font-mono">
          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3 text-left">
            <span className="text-[10px] text-slate-400 block uppercase font-tech">Defeated</span>
            <div className="flex items-center gap-1.5 text-lg font-bold text-cyan-300 font-display">
              <Zap className="w-4 h-4 text-cyan-400" />
              {enemiesDefeated} Bots
            </div>
          </div>

          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3 text-left">
            <span className="text-[10px] text-slate-400 block uppercase font-tech">Typing Speed</span>
            <div className="flex items-center gap-1.5 text-lg font-bold text-amber-300 font-display">
              <Zap className="w-4 h-4 text-amber-400" />
              {Math.round(wpm)} WPM
            </div>
          </div>

          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3 text-left">
            <span className="text-[10px] text-slate-400 block uppercase font-tech">Accuracy</span>
            <div className="flex items-center gap-1.5 text-lg font-bold text-emerald-300 font-display">
              <Target className="w-4 h-4 text-emerald-400" />
              {Math.round(accuracy)}%
            </div>
          </div>

          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3 text-left">
            <span className="text-[10px] text-slate-400 block uppercase font-tech">Bonus Award</span>
            <div className="flex items-center gap-1.5 text-lg font-bold text-amber-300 font-display">
              <Coins className="w-4 h-4 text-amber-400" />
              +{bonusGold}g
            </div>
          </div>
        </div>

        {/* Next Wave Button */}
        <button
          onClick={onNextWave}
          className="w-full py-3.5 px-6 rounded-xl font-display font-black text-sm tracking-widest text-slate-950 bg-gradient-to-r from-cyan-400 to-emerald-400 hover:from-cyan-300 hover:to-emerald-300 shadow-cyan-glow flex items-center justify-center gap-2 transition-transform transform active:scale-95 cursor-pointer"
        >
          <span>ENGAGE WAVE {wave + 1}</span>
          <ArrowRight className="w-4 h-4" />
          <span className="text-[10px] font-mono opacity-70 ml-1">[PRESS ENTER]</span>
        </button>
      </div>
    </div>
  );
};
