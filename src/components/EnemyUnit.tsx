import React from 'react';
import { Enemy, ENEMY_ARCHETYPES } from '../types/enemy';
import { Crosshair, ShieldAlert, Cpu, Zap, Skull, ShieldCheck, ArrowLeft, Bot } from 'lucide-react';

interface EnemyUnitProps {
  enemy: Enemy;
  isLocked: boolean;
  isShaking?: boolean;
}

export const EnemyUnit: React.FC<EnemyUnitProps> = ({
  enemy,
  isLocked,
  isShaking = false,
}) => {
  const archetype = ENEMY_ARCHETYPES[enemy.type];
  const isArmored = enemy.modifier === 'ARMORED' || Boolean(enemy.shieldWord);
  const isReverse = enemy.modifier === 'REVERSE' || enemy.isReversed;
  const isBoss = enemy.type === 'BOSS' || enemy.isBoss;

  // Active word calculation
  const isShieldActive = isArmored && !enemy.isShieldBroken && Boolean(enemy.shieldWord);

  // Hull Word parts
  const hullWord = enemy.word;
  const hullTypedCount = enemy.typedLetters;

  // Render Word Tag for Normal / Forward typing
  const renderForwardWord = (word: string, typedCount: number, isTargetLocked: boolean) => {
    const typedPart = word.slice(0, typedCount);
    const nextChar = word.slice(typedCount, typedCount + 1);
    const remainingPart = word.slice(typedCount + 1);

    return (
      <div className="flex items-center">
        {typedPart && (
          <span className="text-cyan-400 font-extrabold text-shadow-glow">
            {typedPart.toUpperCase()}
          </span>
        )}
        {nextChar && (
          <span
            className={`relative px-1 py-0.5 rounded font-black ${
              isTargetLocked
                ? 'bg-cyan-500 text-slate-950 shadow-sm animate-pulse'
                : 'text-amber-300 bg-amber-500/20'
            }`}
          >
            {nextChar.toUpperCase()}
          </span>
        )}
        {remainingPart && (
          <span className="text-slate-400 font-medium opacity-80">
            {remainingPart.toUpperCase()}
          </span>
        )}
      </div>
    );
  };

  // Render Word Tag for Reverse typing (Right-to-Left from last char to first)
  const renderReverseWord = (word: string, typedCount: number, isTargetLocked: boolean) => {
    // Characters already typed from the back: word.length - typedCount to word.length
    // Next character to type: index (word.length - 1 - typedCount)
    // Characters remaining on the left: index 0 to (word.length - 2 - typedCount)
    const nextCharIndex = word.length - 1 - typedCount;
    const remainingPart = nextCharIndex > 0 ? word.slice(0, nextCharIndex) : '';
    const nextChar = nextCharIndex >= 0 ? word.slice(nextCharIndex, nextCharIndex + 1) : '';
    const typedPart = word.slice(nextCharIndex + 1);

    return (
      <div className="flex items-center">
        {remainingPart && (
          <span className="text-slate-400 font-medium opacity-80">
            {remainingPart.toUpperCase()}
          </span>
        )}
        {nextChar && (
          <span
            className={`relative px-1 py-0.5 rounded font-black ${
              isTargetLocked
                ? 'bg-purple-500 text-white shadow-sm animate-pulse'
                : 'text-purple-300 bg-purple-500/20'
            }`}
          >
            {nextChar.toUpperCase()}
          </span>
        )}
        {typedPart && (
          <span className="text-purple-400 font-extrabold text-shadow-glow">
            {typedPart.toUpperCase()}
          </span>
        )}
      </div>
    );
  };

  return (
    <div
      className={`absolute top-1/2 -translate-y-1/2 flex flex-col items-center select-none transition-transform duration-75 ${
        isShaking ? 'translate-x-1.5 rotate-2 scale-95' : ''
      }`}
      style={{
        left: `${enemy.x}%`,
        transform: `translate(-50%, -50%) ${isShaking ? 'scale(0.95)' : 'scale(1)'}`,
        zIndex: isBoss ? 30 : isLocked ? 25 : 15,
      }}
    >
      {/* Word Tags Container */}
      <div className="flex flex-col items-center gap-1 mb-2">
        {/* ARMORED 2-LAYER: Top Shield Word Tag */}
        {isArmored && enemy.shieldWord && (
          <div
            className={`relative px-2.5 py-1 rounded-lg font-mono text-xs tracking-wider font-bold shadow-lg transition-all flex items-center gap-1.5 backdrop-blur-md ${
              isShieldActive
                ? isLocked
                  ? 'bg-cyan-950/95 border-2 border-cyan-400 shadow-cyan-glow scale-105'
                  : 'bg-slate-900/90 border border-cyan-500/60 text-cyan-300'
                : 'bg-slate-950/50 border border-slate-800 text-slate-600 line-through opacity-50'
            }`}
          >
            <ShieldCheck className={`w-3.5 h-3.5 ${isShieldActive ? 'text-cyan-400 animate-pulse' : 'text-slate-600'}`} />
            <span className="text-[9px] uppercase font-tech text-cyan-400/90 font-bold">
              SHIELD:
            </span>
            {isShieldActive ? (
              renderForwardWord(enemy.shieldWord, enemy.shieldTypedLetters || 0, isLocked)
            ) : (
              <span className="font-mono text-slate-500 line-through">
                {enemy.shieldWord.toUpperCase()} [BROKEN]
              </span>
            )}
          </div>
        )}

        {/* Main Word Tag (Hull or Reverse or Boss Phase Word) */}
        <div
          className={`relative px-3 py-1.5 rounded-lg font-mono tracking-wider font-bold shadow-lg transition-all flex items-center gap-1.5 backdrop-blur-md ${
            isBoss
              ? 'bg-rose-950/95 border-2 border-rose-500 shadow-crimson-glow scale-110 text-base'
              : isLocked
              ? isReverse
                ? 'bg-slate-900/95 border-2 border-purple-400 shadow-violet-glow scale-110 text-sm'
                : 'bg-slate-900/95 border-2 border-cyan-400 shadow-cyan-glow scale-110 text-sm'
              : isShieldActive
              ? 'bg-slate-950/70 border border-slate-800 text-slate-500 opacity-60 text-xs'
              : 'bg-slate-950/80 border border-slate-700/80 hover:border-slate-500 text-sm'
          }`}
        >
          {/* Target Lock Icon */}
          {isLocked && (
            <Crosshair
              className={`w-3.5 h-3.5 animate-spin mr-0.5 ${
                isBoss ? 'text-rose-400' : isReverse ? 'text-purple-400' : 'text-cyan-400'
              }`}
              style={{ animationDuration: '6s' }}
            />
          )}

          {/* Reverse Indicator Badge */}
          {isReverse && (
            <span className="inline-flex items-center text-[9px] font-black uppercase px-1 py-0.2 rounded bg-purple-500/30 text-purple-300 border border-purple-500/50 mr-0.5">
              <ArrowLeft className="w-2.5 h-2.5 mr-0.5 animate-pulse" /> REV
            </span>
          )}

          {/* Boss Phase Badge */}
          {isBoss && (
            <span className="text-[10px] font-black uppercase px-1.5 py-0.5 rounded bg-rose-500/30 text-rose-300 border border-rose-500/50 mr-0.5">
              P{(enemy.bossCurrentPhase || 0) + 1}
            </span>
          )}

          {/* Render Text Based on Typing Direction */}
          {isReverse
            ? renderReverseWord(hullWord, hullTypedCount, isLocked && !isShieldActive)
            : renderForwardWord(hullWord, hullTypedCount, isLocked && !isShieldActive)}

          {/* Mini Reward Tag */}
          <span
            className="ml-1 text-[10px] px-1 py-0.5 rounded font-mono font-bold"
            style={{
              backgroundColor: `${archetype.color}25`,
              color: archetype.color,
            }}
          >
            +{enemy.goldReward}g
          </span>
        </div>
      </div>

      {/* Target Unit Body with Reticle */}
      <div className="relative group">
        {/* Pulsating Neon Target Lock Reticle Ring */}
        {isLocked && (
          <div
            className={`absolute ${
              isBoss ? '-inset-5' : '-inset-3'
            } rounded-full border-2 border-dashed ${
              isBoss ? 'border-rose-500' : isReverse ? 'border-purple-400' : 'border-cyan-400'
            } animate-spin pointer-events-none`}
            style={{ animationDuration: '4s' }}
          >
            <div className={`absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 ${isBoss ? 'bg-rose-500' : 'bg-cyan-400'} rounded-full`} />
            <div className={`absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 ${isBoss ? 'bg-rose-500' : 'bg-cyan-400'} rounded-full`} />
            <div className={`absolute top-1/2 -left-1 -translate-y-1/2 w-2 h-2 ${isBoss ? 'bg-rose-500' : 'bg-cyan-400'} rounded-full`} />
            <div className={`absolute top-1/2 -right-1 -translate-y-1/2 w-2 h-2 ${isBoss ? 'bg-rose-500' : 'bg-cyan-400'} rounded-full`} />
          </div>
        )}

        {/* Armored Neon Shield Bubble */}
        {isShieldActive && (
          <div className="absolute -inset-2.5 rounded-2xl border-2 border-cyan-400/80 bg-cyan-500/10 shadow-cyan-glow pointer-events-none animate-pulse">
            <div className="absolute inset-0 rounded-2xl bg-cyan-400/5 backdrop-blur-[0.5px]" />
          </div>
        )}

        {/* BOSS Entity Model: Imposing Large Chassis */}
        {isBoss ? (
          <div
            className={`w-28 h-28 sm:w-32 sm:h-32 rounded-3xl flex flex-col items-center justify-center relative transition-all duration-150 border-2 bg-slate-950/95 shadow-2xl ${
              isLocked
                ? 'ring-4 ring-rose-500 shadow-crimson-glow border-rose-400'
                : 'border-rose-600 shadow-crimson-glow'
            }`}
          >
            {/* Core Reactor Glow */}
            <div className="w-14 h-14 rounded-full bg-rose-500/20 border border-rose-500/60 flex items-center justify-center animate-pulse shadow-inner">
              <Skull className="w-9 h-9 text-rose-500 animate-bounce" />
            </div>

            {/* Boss Sub-thrusters */}
            <div className="flex gap-2 mt-1">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            </div>

            {/* Boss Threat Badge */}
            <span className="absolute -bottom-2.5 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border border-rose-400 bg-rose-600 text-slate-950 shadow-md">
              TITAN OVERMIND
            </span>
          </div>
        ) : (
          /* Standard Unit Chassis */
          <div
            className={`w-14 h-14 rounded-xl flex items-center justify-center relative transition-all duration-150 border ${
              isLocked
                ? isReverse
                  ? 'ring-2 ring-purple-400 shadow-violet-glow bg-slate-900'
                  : 'ring-2 ring-cyan-400 shadow-cyan-glow bg-slate-900'
                : 'bg-slate-900/90 shadow-md'
            }`}
            style={{
              borderColor: isReverse ? '#a855f7' : archetype.color,
              boxShadow: isLocked
                ? `0 0 20px ${isReverse ? '#a855f7' : archetype.color}88, inset 0 0 10px ${isReverse ? '#a855f7' : archetype.color}44`
                : `0 0 10px ${archetype.color}33`,
            }}
          >
            {/* Inner archetype visual icon */}
            {enemy.type === 'SCOUT' && (
              isReverse ? (
                <Bot className="w-7 h-7 text-purple-400 animate-pulse" />
              ) : (
                <Cpu className="w-7 h-7 text-cyan-400 animate-pulse" />
              )
            )}
            {enemy.type === 'ASSAULT' && (
              <Zap className="w-7 h-7 text-amber-400" />
            )}
            {enemy.type === 'TANK' && (
              <ShieldAlert className="w-8 h-8 text-rose-500 animate-pulse" />
            )}

            {/* Unit Type / Modifier Badge */}
            <span
              className="absolute -bottom-2 text-[9px] font-black uppercase px-1.5 py-0.2 rounded-full border border-black/50"
              style={{
                backgroundColor: isReverse ? '#a855f7' : isArmored ? '#00f0ff' : archetype.color,
                color: '#090d16',
              }}
            >
              {isArmored && !enemy.isShieldBroken
                ? 'SHIELD'
                : isReverse
                ? 'MIRROR'
                : archetype.badge}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
