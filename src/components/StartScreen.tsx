import React, { useEffect, useState } from 'react';
import { Shield, Zap, Keyboard, Terminal, Play, Bomb, Snowflake, Award, Film, X, ExternalLink } from 'lucide-react';
import { soundEngine } from '../utils/SoundEngine';

interface StartScreenProps {
  onStart: () => void;
  highScore: number;
}

export const StartScreen: React.FC<StartScreenProps> = ({ onStart, highScore }) => {
  const [showTrailer, setShowTrailer] = useState<boolean>(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (showTrailer) {
        if (e.key === 'Escape') {
          setShowTrailer(false);
        }
        return;
      }
      if (e.key === 'Enter' || e.key === ' ') {
        soundEngine.unlock();
        onStart();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onStart, showTrailer]);

  const handleStartGame = () => {
    soundEngine.unlock();
    onStart();
  };

  return (
    <div className="fixed inset-0 bg-[#060913]/95 backdrop-blur-lg z-50 flex items-center justify-center p-4">
      {/* Background Cyber Grid */}
      <div className="absolute inset-0 cyber-grid opacity-20 pointer-events-none" />

      {/* Ambient Radial Lights */}
      <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-cyan-500/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/3 w-96 h-96 bg-purple-500/15 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-2xl w-full bg-slate-900/90 border border-cyan-500/40 rounded-2xl p-6 sm:p-8 shadow-2xl relative text-center">
        {/* Top Protocol Tag */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-400/40 text-cyan-400 text-xs font-tech font-bold uppercase mb-4 shadow-cyan-glow">
          <Terminal className="w-3.5 h-3.5" />
          AKIRA WAEWBANDHIT
        </div>

        {/* Game Title */}
        <h1 className="text-4xl sm:text-5xl font-black font-display tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-200 to-amber-400 mb-2 drop-shadow-md">
          TYPING TOWER DEFENSE
        </h1>
        <p className="text-xs sm:text-sm font-mono text-cyan-300/80 uppercase tracking-widest mb-6">
          CYBER FORTRESS PROTOCOL
        </p>

        {/* High Score Badge */}
        {highScore > 0 && (
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono mb-6">
            <Award className="w-4 h-4 text-amber-400" />
            <span>High Score Record: <strong className="font-display font-black text-amber-300">{highScore.toLocaleString()} PTS</strong></span>
          </div>
        )}

        {/* How to Play Guide Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8 text-left">
          <div className="bg-slate-950/70 border border-slate-800 p-3.5 rounded-xl">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-400/30 flex items-center justify-center text-cyan-400 mb-2">
              <Keyboard className="w-4 h-4" />
            </div>
            <div className="text-xs font-bold text-white font-tech uppercase mb-1">
              1. Type to Lock & Fire
            </div>
            <p className="text-[11px] font-mono text-slate-400 leading-relaxed">
              Press the first letter of any incoming hostile to lock on. Complete the word to fire defense lasers.
            </p>
          </div>

          <div className="bg-slate-950/70 border border-slate-800 p-3.5 rounded-xl">
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-400/30 flex items-center justify-center text-purple-400 mb-2">
              <Zap className="w-4 h-4" />
            </div>
            <div className="text-xs font-bold text-white font-tech uppercase mb-1">
              2. Upgrade Turrets
            </div>
            <p className="text-[11px] font-mono text-slate-400 leading-relaxed">
              Spend earned gold on lane mounts: Cryo Pylon for permanent slow, or Tesla Coil for chain damage.
            </p>
          </div>

          <div className="bg-slate-950/70 border border-slate-800 p-3.5 rounded-xl">
            <div className="w-8 h-8 rounded-lg bg-rose-500/10 border border-rose-400/30 flex items-center justify-center text-rose-400 mb-2">
              <Bomb className="w-4 h-4" />
            </div>
            <div className="text-xs font-bold text-white font-tech uppercase mb-1">
              3. Panic Commands
            </div>
            <p className="text-[11px] font-mono text-slate-400 leading-relaxed">
              In emergencies, type <strong className="text-rose-400">NUKE</strong> to obliterate the screen, <strong className="text-cyan-400">FREEZE</strong>, or <strong className="text-emerald-400">REPAIR</strong>.
            </p>
          </div>
        </div>

        {/* Launch Button */}
        <button
          onClick={handleStartGame}
          className="w-full py-4 px-8 rounded-xl font-display font-black text-base tracking-widest text-slate-950 bg-gradient-to-r from-cyan-400 via-sky-300 to-amber-400 hover:from-cyan-300 hover:to-amber-300 shadow-cyan-glow flex items-center justify-center gap-3 transition-transform transform active:scale-95 cursor-pointer"
        >
          <Play className="w-5 h-5 fill-slate-950" />
          <span>START DEFENSE SYSTEM</span>
          <span className="text-xs font-mono opacity-80">[PRESS ENTER OR SPACE]</span>
        </button>

        {/* Trailer Clip Stream Link Section */}
        <div className="mt-5 pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => setShowTrailer(true)}
            className="inline-flex items-center gap-2.5 px-4 py-2 rounded-lg bg-cyan-950/40 hover:bg-cyan-900/50 border border-cyan-500/40 hover:border-cyan-300 text-cyan-300 hover:text-cyan-100 transition-all duration-200 group cursor-pointer shadow-sm hover:shadow-[0_0_15px_rgba(6,182,212,0.3)] w-full sm:w-auto justify-center"
          >
            <Film className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
            <span className="font-tech font-bold tracking-wider text-xs sm:text-sm">
              WATCH TRAILER HERE !!!
            </span>
          </button>
        </div>
      </div>

      {/* Trailer Streaming Modal */}
      {showTrailer && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-6"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowTrailer(false);
          }}
        >
          <div className="relative w-full max-w-4xl bg-slate-950 border border-cyan-500/50 rounded-2xl overflow-hidden shadow-[0_0_50px_rgba(6,182,212,0.3)] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-4 sm:px-6 py-3 bg-slate-900/90 border-b border-cyan-500/30">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-400/40 flex items-center justify-center text-cyan-400">
                  <Film className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <h3 className="text-sm sm:text-base font-display font-bold text-white tracking-wider flex items-center gap-2">
                    TYPING DEFENSE TRAILER
                  </h3>

                </div>
              </div>

              <div className="flex items-center gap-2">

                <button
                  type="button"
                  onClick={() => setShowTrailer(false)}
                  className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800/80 transition-colors cursor-pointer"
                  title="Close [ESC]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Video Player (Streaming HTML5 Video) */}
            <div className="relative bg-black aspect-video flex items-center justify-center">
              <video
                controls
                autoPlay
                playsInline
                preload="auto"
                className="w-full h-full object-contain"
              >
                <source src="./cyber_typing_defense_trailer.mp4" type="video/mp4" />
                เบราว์เซอร์ของคุณไม่รองรับการเล่นวิดีโอ HTML5
              </video>
            </div>

            {/* Modal Footer Info */}
            <div className="px-4 py-2.5 bg-slate-900/80 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono text-slate-400">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                Spacebar : Stop/Play
              </span>
              <button
                type="button"
                onClick={() => setShowTrailer(false)}
                className="px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors text-xs font-tech cursor-pointer"
              >
                CLOSE [ESC]
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
