import React from 'react';
import { Enemy, ENEMY_ARCHETYPES } from '../types/enemy';
import { TacticalCommandType, TACTICAL_SPELLS, TacticalSpellInfo } from '../types/tactics';
import { Crosshair, Bomb, Snowflake, Wrench, Shield, Zap, Sparkles, ArrowLeft, ShieldCheck, Skull } from 'lucide-react';

interface CommandDeckProps {
  lockedEnemy: Enemy | null;
  gold: number;
  tacticalCooldowns: Record<TacticalCommandType, number>;
  onTriggerTactical: (type: TacticalCommandType) => void;
  recentKeys: string[];
  lastTypo: boolean;
  panicInput: string;
}

export const CommandDeck: React.FC<CommandDeckProps> = ({
  lockedEnemy,
  gold,
  tacticalCooldowns,
  onTriggerTactical,
  recentKeys,
  lastTypo,
  panicInput,
}) => {
  const getIcon = (type: TacticalCommandType) => {
    switch (type) {
      case 'NUKE':
        return <Bomb className="w-4 h-4" />;
      case 'FREEZE':
        return <Snowflake className="w-4 h-4" />;
      case 'REPAIR':
        return <Wrench className="w-4 h-4" />;
    }
  };

  // Helper for rendering word state in Command Deck
  const renderWordInDeck = (enemy: Enemy) => {
    // 1. Armored with active shield
    if (enemy.shieldWord && !enemy.isShieldBroken) {
      const shield = enemy.shieldWord;
      const typed = enemy.shieldTypedLetters || 0;
      return (
        <div>
          <div className="flex items-center gap-1.5 text-xs text-cyan-400 font-bold mb-0.5">
            <ShieldCheck className="w-3.5 h-3.5 animate-pulse" />
            <span>SHIELD OVERRIDE:</span>
            <span className="font-mono font-black text-sm tracking-widest text-white">
              <span className="text-cyan-400 underline decoration-cyan-400">
                {shield.slice(0, typed).toUpperCase()}
              </span>
              <span className="bg-cyan-500 text-slate-950 px-1 rounded animate-pulse">
                {shield.slice(typed, typed + 1).toUpperCase()}
              </span>
              <span className="text-slate-500">
                {shield.slice(typed + 1).toUpperCase()}
              </span>
            </span>
          </div>
          <div className="text-[10px] text-slate-500 font-mono">
            HULL WORD: {enemy.word.toUpperCase()} [LOCKED BEHIND SHIELD]
          </div>
        </div>
      );
    }

    // 2. Reverse typing
    if (enemy.modifier === 'REVERSE' || enemy.isReversed) {
      const word = enemy.word;
      const typed = enemy.typedLetters || 0;
      const nextCharIndex = word.length - 1 - typed;
      const remainingPart = nextCharIndex > 0 ? word.slice(0, nextCharIndex) : '';
      const nextChar = nextCharIndex >= 0 ? word.slice(nextCharIndex, nextCharIndex + 1) : '';
      const typedPart = word.slice(nextCharIndex + 1);

      return (
        <div>
          <div className="flex items-center gap-1.5 text-xs text-purple-400 font-bold mb-0.5">
            <ArrowLeft className="w-3.5 h-3.5 animate-pulse" />
            <span>REVERSE SEQUENCE (TYPE RIGHT-TO-LEFT):</span>
          </div>
          <div className="font-mono text-base font-extrabold tracking-widest text-slate-100 flex items-center">
            <span className="text-slate-500">
              {remainingPart.toUpperCase()}
            </span>
            <span className="bg-purple-500 text-white px-1 rounded animate-pulse">
              {nextChar.toUpperCase()}
            </span>
            <span className="text-purple-400 underline decoration-purple-400">
              {typedPart.toUpperCase()}
            </span>
          </div>
        </div>
      );
    }

    // 3. Boss or Standard
    const word = enemy.isBoss && enemy.bossPhaseWords
      ? enemy.bossPhaseWords[enemy.bossCurrentPhase || 0] || enemy.word
      : enemy.word;
    const typed = enemy.typedLetters || 0;

    return (
      <div className="font-mono text-base font-extrabold tracking-widest text-slate-100 flex items-center">
        <span className="text-cyan-400 underline decoration-cyan-400 underline-offset-4">
          {word.slice(0, typed).toUpperCase()}
        </span>
        <span className="bg-cyan-500/30 text-white px-1 rounded animate-pulse">
          {word.slice(typed, typed + 1).toUpperCase()}
        </span>
        <span className="text-slate-500">
          {word.slice(typed + 1).toUpperCase()}
        </span>
      </div>
    );
  };

  return (
    <footer className="w-full bg-slate-950/90 backdrop-blur-md border-t border-cyan-500/20 px-4 py-3 z-40 relative shadow-2xl">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
        {/* Left: Active Lock-On Target Monitor (Col 1 to 5) */}
        <div className="md:col-span-5 bg-slate-900/80 border border-slate-800 rounded-xl p-3 relative overflow-hidden flex items-center gap-3">
          {lockedEnemy ? (
            <>
              {/* Target Portrait */}
              <div
                className="w-12 h-12 rounded-lg flex items-center justify-center shrink-0 border relative"
                style={{
                  borderColor: lockedEnemy.isBoss
                    ? '#ff007f'
                    : lockedEnemy.modifier === 'REVERSE'
                    ? '#a855f7'
                    : ENEMY_ARCHETYPES[lockedEnemy.type].color,
                  backgroundColor: `${ENEMY_ARCHETYPES[lockedEnemy.type].color}15`,
                }}
              >
                {lockedEnemy.isBoss ? (
                  <Skull className="w-6 h-6 text-rose-500 animate-pulse" />
                ) : (
                  <Crosshair
                    className={`w-6 h-6 animate-spin ${
                      lockedEnemy.modifier === 'REVERSE' ? 'text-purple-400' : 'text-cyan-400'
                    }`}
                    style={{ animationDuration: '6s' }}
                  />
                )}
                <span className="absolute -bottom-1 text-[8px] font-black px-1 rounded bg-black text-cyan-300">
                  {lockedEnemy.isBoss ? 'BOSS' : `LANE ${lockedEnemy.laneIndex + 1}`}
                </span>
              </div>

              {/* Word & Progress Details */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-[10px] uppercase font-tech tracking-wider text-cyan-400 font-bold flex items-center gap-1">
                    TARGET LOCKED // {ENEMY_ARCHETYPES[lockedEnemy.type].name}
                    {lockedEnemy.shieldWord && !lockedEnemy.isShieldBroken && (
                      <span className="text-cyan-300 bg-cyan-950 px-1 rounded text-[8px]">
                        ARMORED
                      </span>
                    )}
                    {(lockedEnemy.modifier === 'REVERSE' || lockedEnemy.isReversed) && (
                      <span className="text-purple-300 bg-purple-950 px-1 rounded text-[8px]">
                        REVERSE
                      </span>
                    )}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {lockedEnemy.shieldWord && !lockedEnemy.isShieldBroken
                      ? `${lockedEnemy.shieldTypedLetters || 0}/${lockedEnemy.shieldWord.length} SHIELD`
                      : `${lockedEnemy.typedLetters}/${lockedEnemy.word.length} CH`}
                  </span>
                </div>

                {/* Word display */}
                {renderWordInDeck(lockedEnemy)}

                {/* Progress Bar */}
                <div className="w-full h-1.5 bg-slate-800 rounded-full mt-2 overflow-hidden">
                  <div
                    className={`h-full transition-all duration-100 ${
                      lockedEnemy.isBoss
                        ? 'bg-rose-500 shadow-crimson-glow'
                        : lockedEnemy.modifier === 'REVERSE'
                        ? 'bg-purple-500 shadow-violet-glow'
                        : 'bg-cyan-400 shadow-cyan-glow'
                    }`}
                    style={{
                      width: `${
                        lockedEnemy.shieldWord && !lockedEnemy.isShieldBroken
                          ? ((lockedEnemy.shieldTypedLetters || 0) / lockedEnemy.shieldWord.length) * 100
                          : (lockedEnemy.typedLetters / lockedEnemy.word.length) * 100
                      }%`,
                    }}
                  />
                </div>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-3 w-full py-1 text-slate-400">
              <div className="w-10 h-10 rounded-lg bg-slate-800/60 border border-slate-700/60 flex items-center justify-center shrink-0">
                <Crosshair className="w-5 h-5 text-slate-500 animate-pulse" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-300 font-tech uppercase tracking-wider">
                  Targeting Radar Active
                </div>
                <div className="text-[11px] text-slate-500 font-mono">
                  Press first letter of incoming hostile to lock on
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Center: Tactical Emergency Spells / Panic Deck (Col 6 to 9) */}
        <div className="md:col-span-4 flex items-center gap-2">
          {(Object.values(TACTICAL_SPELLS) as TacticalSpellInfo[]).map((spell) => {
            const cd = tacticalCooldowns[spell.type] || 0;
            const canAfford = gold >= spell.cost;
            const isReady = cd <= 0 && canAfford;

            return (
              <button
                key={spell.type}
                disabled={!isReady}
                onClick={() => onTriggerTactical(spell.type)}
                className={`flex-1 py-2 px-2 rounded-xl border flex flex-col items-center justify-center transition-all relative overflow-hidden group ${
                  isReady
                    ? 'bg-slate-900/90 border-slate-700 hover:border-cyan-400 hover:shadow-cyan-glow cursor-pointer'
                    : 'bg-slate-950/60 border-slate-900 opacity-60 cursor-not-allowed'
                }`}
              >
                {/* Cooldown overlay */}
                {cd > 0 && (
                  <div className="absolute inset-0 bg-slate-950/80 flex items-center justify-center font-mono font-bold text-xs text-amber-400 z-10">
                    {cd.toFixed(1)}s
                  </div>
                )}

                <div className="flex items-center gap-1.5 mb-0.5">
                  <span style={{ color: spell.color }}>{getIcon(spell.type)}</span>
                  <span className="text-xs font-extrabold tracking-wider font-tech text-white">
                    {spell.name.split(' ')[1] || spell.name}
                  </span>
                </div>

                <div className="flex items-center gap-1 text-[10px] font-mono">
                  <span className="text-amber-400 font-bold">{spell.cost}g</span>
                  <span className="text-slate-500">|</span>
                  <span className="text-cyan-300 font-mono uppercase bg-slate-800 px-1 rounded">
                    [{spell.word}]
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Right: Keyboard Activity HUD & Hotkey Tips (Col 10 to 12) */}
        <div className="md:col-span-3 bg-slate-900/50 border border-slate-800/80 rounded-xl p-2.5 flex items-center justify-between">
          <div>
            <div className="text-[10px] uppercase font-tech text-slate-400 tracking-wider">
              Input Buffer
            </div>
            {/* Show recently pressed keys */}
            <div className="flex items-center gap-1 mt-1">
              {recentKeys.length > 0 ? (
                recentKeys.map((k, i) => (
                  <span
                    key={i}
                    className={`w-6 h-6 rounded flex items-center justify-center text-xs font-mono font-bold border ${
                      i === recentKeys.length - 1
                        ? lastTypo
                          ? 'bg-red-500/20 border-red-500 text-red-400 animate-pulse'
                          : 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                        : 'bg-slate-800/60 border-slate-700 text-slate-400'
                    }`}
                  >
                    {k.toUpperCase()}
                  </span>
                ))
              ) : (
                <span className="text-[11px] text-slate-600 font-mono">READY</span>
              )}
            </div>
          </div>

          {/* Quick shortcuts */}
          <div className="text-right text-[10px] font-mono text-slate-500">
            <div><span className="text-cyan-400">[ESC]</span> Cancel</div>
            <div><span className="text-amber-400">[TYPE]</span> Spells</div>
          </div>
        </div>
      </div>
    </footer>
  );
};
