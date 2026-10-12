import React, { useEffect } from 'react';
import { Skull, RotateCcw, Target, Trophy, Zap, AlertOctagon } from 'lucide-react';

interface GameOverModalProps {
  finalScore: number;
  highScore: number;
  wavesSurvived: number;
  enemiesDefeated: number;
  wpm: number;
  accuracy: number;
  onRestart: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  finalScore,
  highScore,
  wavesSurvived,
  enemiesDefeated,
  wpm,
  accuracy,
  onRestart,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        onRestart();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onRestart]);

  const isNewHighScore = finalScore > highScore && finalScore > 0;

  return (
    <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-slate-900 border-2 border-rose-500 rounded-2xl p-6 shadow-crimson-glow relative overflow-hidden text-center animate-in fade-in zoom-in-95 duration-200">
        {/* Glow ambient background */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-rose-600/20 rounded-full blur-3xl pointer-events-none" />

        {/* Header Alert */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/40 text-rose-400 text-xs font-tech font-bold uppercase mb-3">
          <AlertOctagon className="w-4 h-4 text-rose-500 animate-pulse" />
          Critical Core Breach
        </div>

        <h2 className="text-3xl font-black font-display text-rose-500 tracking-wider mb-1">
          FORTRESS DESTROYED
        </h2>
        <p className="text-xs font-mono text-slate-400 mb-6">
          Defensive integrity depleted. All defense protocols offline.
        </p>

        {/* Score banner */}
        <div className="bg-slate-950/80 border border-rose-950 rounded-xl p-4 mb-4">
          <span className="text-[10px] text-slate-500 block uppercase font-tech">Final Score</span>
          <span className="text-3xl font-black text-rose-400 font-display">
            {finalScore.toLocaleString()}
          </span>
          {isNewHighScore && (
            <div className="mt-1 text-[11px] font-bold text-amber-400 flex items-center justify-center gap-1">
              <Trophy className="w-3.5 h-3.5" />
              NEW HIGH SCORE RECORDED!
            </div>
          )}
        </div>

        {/* Performance Breakdown */}
        <div className="grid grid-cols-2 gap-3 mb-6 font-mono text-left text-xs">
          <div className="bg-slate-950/60 border border-slate-800 rounded-lg p-2.5">
            <span className="text-slate-400 text-[10px] block font-tech">Sectors Defended</span>
            <span className="text-white font-bold font-display text-base">
              Wave {wavesSurvived}
            </span>
          </div>

          <div className="bg-slate-950/60 border border-slate-800 rounded-lg p-2.5">
            <span className="text-slate-400 text-[10px] block font-tech">Enemies Crushed</span>
            <span className="text-white font-bold font-display text-base">
              {enemiesDefeated} Bots
            </span>
          </div>

          <div className="bg-slate-950/60 border border-slate-800 rounded-lg p-2.5">
            <span className="text-slate-400 text-[10px] block font-tech">Average WPM</span>
            <span className="text-amber-300 font-bold font-display text-base">
              {Math.round(wpm)} WPM
            </span>
          </div>

          <div className="bg-slate-950/60 border border-slate-800 rounded-lg p-2.5">
            <span className="text-slate-400 text-[10px] block font-tech">Typing Accuracy</span>
            <span className="text-emerald-400 font-bold font-display text-base">
              {Math.round(accuracy)}%
            </span>
          </div>
        </div>

        {/* Reboot Button */}
        <button
          onClick={onRestart}
          className="w-full py-3.5 px-6 rounded-xl font-display font-black text-sm tracking-widest text-white bg-gradient-to-r from-rose-600 to-red-500 hover:from-rose-500 hover:to-red-400 shadow-crimson-glow flex items-center justify-center gap-2 transition-transform transform active:scale-95 cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
          <span>REBOOT SYSTEM / PLAY AGAIN</span>
        </button>
      </div>
    </div>
  );
};
