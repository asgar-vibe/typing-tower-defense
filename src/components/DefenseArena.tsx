import React from 'react';
import { Enemy } from '../types/enemy';
import { Lane, LaserBeam } from '../types/game';
import { LaneTurret, TURRET_MODULES, TurretModuleType } from '../types/tactics';
import { EnemyUnit } from './EnemyUnit';
import { ParticleOverlay } from './ParticleOverlay';
import { Shield, Snowflake, Zap, Sparkles, ChevronRight, Plus } from 'lucide-react';

interface DefenseArenaProps {
  lanes: Lane[];
  enemies: Enemy[];
  lockedTargetId: string | null;
  laneTurrets: LaneTurret[];
  gold: number;
  onUpgradeTurret: (laneIndex: number, module: TurretModuleType) => void;
  laserBeams: LaserBeam[];
  isFreezing: boolean;
  isNuking: boolean;
  shakingEnemyId: string | null;
  bossAlertActive?: boolean;
}

export const DefenseArena: React.FC<DefenseArenaProps> = ({
  lanes,
  enemies,
  lockedTargetId,
  laneTurrets,
  gold,
  onUpgradeTurret,
  laserBeams,
  isFreezing,
  isNuking,
  shakingEnemyId,
  bossAlertActive = false,
}) => {
  return (
    <main className="flex-1 w-full h-full relative overflow-hidden bg-[#060913] flex flex-col justify-stretch select-none">
      {/* Background Cyber Grid */}
      <div className="absolute inset-0 cyber-grid opacity-35 pointer-events-none" />

      {/* Boss Detection Alert Banner */}
      {bossAlertActive && (
        <div className="absolute top-1/4 left-0 right-0 z-50 flex items-center justify-center pointer-events-none animate-in fade-in zoom-in-95 duration-200">
          <div className="bg-rose-950/95 border-y-2 border-rose-500 text-rose-300 font-display text-lg sm:text-2xl font-black uppercase tracking-widest px-8 py-3.5 shadow-crimson-glow flex items-center gap-3 backdrop-blur-md animate-pulse">
            <span className="w-3 h-3 rounded-full bg-rose-500 animate-ping" />
            <span>WARNING: HOSTILE TITAN DETECTED</span>
            <span className="w-3 h-3 rounded-full bg-rose-500 animate-ping" />
          </div>
        </div>
      )}

      {/* Screen Nuke Flash Overlay */}
      {isNuking && (
        <div className="absolute inset-0 bg-white nuke-overlay z-50 pointer-events-none" />
      )}

      {/* Freeze Stasis Frost Overlay */}
      {isFreezing && (
        <div className="absolute inset-0 bg-cyan-950/30 border-4 border-cyan-400/60 pointer-events-none z-30 transition-all duration-300 backdrop-blur-[1px] shadow-inner flex items-center justify-center">
          <div className="text-cyan-300 font-display text-2xl font-black uppercase tracking-widest bg-slate-950/80 px-6 py-2 rounded-xl border border-cyan-400 shadow-cyan-glow animate-pulse">
            CRYO STASIS ACTIVE
          </div>
        </div>
      )}

      {/* Danger Line (at 18% position) */}
      <div className="absolute top-0 bottom-0 left-[18%] w-0.5 border-l-2 border-dashed border-rose-500/40 z-10 pointer-events-none flex flex-col justify-between py-2 text-[9px] font-mono text-rose-500/70 select-none">
        <span className="bg-rose-950/80 px-1 rounded -translate-x-1/2">DANGER PERIMETER</span>
        <span className="bg-rose-950/80 px-1 rounded -translate-x-1/2">BREACH THRESHOLD</span>
      </div>

      {/* Laser Beams SVG Overlay */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none z-20">
        <defs>
          <linearGradient id="laserGradCyan" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#00f0ff" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#38bdf8" stopOpacity="1" />
          </linearGradient>
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        {laserBeams.map((beam) => (
          <g key={beam.id}>
            {/* Outer Glow Line */}
            <line
              x1={`${beam.startX}%`}
              y1={`${beam.startY}%`}
              x2={`${beam.targetX}%`}
              y2={`${beam.targetY}%`}
              stroke={beam.color}
              strokeWidth="5"
              strokeOpacity="0.4"
              filter="url(#glow)"
            />
            {/* Core Bright Beam */}
            <line
              x1={`${beam.startX}%`}
              y1={`${beam.startY}%`}
              x2={`${beam.targetX}%`}
              y2={`${beam.targetY}%`}
              stroke="#ffffff"
              strokeWidth="2"
              strokeOpacity="0.9"
            />
          </g>
        ))}
      </svg>

      {/* Particle Canvas Overlay */}
      <ParticleOverlay isFreezing={isFreezing} />

      {/* The 4 Horizontal Defense Lanes */}
      <div className="flex-1 flex flex-col w-full h-full relative z-10 divide-y divide-cyan-500/10">
        {lanes.map((lane) => {
          const turret = laneTurrets.find((t) => t.laneIndex === lane.index) || {
            laneIndex: lane.index,
            module: 'NONE' as TurretModuleType,
            hasShield: false,
          };
          const moduleInfo = TURRET_MODULES[turret.module];
          const laneEnemies = enemies.filter((e) => e.laneIndex === lane.index);

          return (
            <div
              key={lane.id}
              className="flex-1 relative flex items-center w-full lane-grid group"
            >
              {/* Lane Subtle Ambient Number */}
              <div className="absolute right-4 top-2 text-6xl font-black font-display text-slate-800/20 pointer-events-none">
                0{lane.index + 1}
              </div>

              {/* Fortress Turret Mount on the Left */}
              <div className="w-[18%] h-full bg-gradient-to-r from-slate-950 via-slate-900/90 to-transparent border-r border-cyan-500/30 flex items-center justify-between px-3 relative shrink-0 z-20">
                {/* Turret Chassis */}
                <div className="flex items-center gap-2">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center border relative shadow-md transition-all"
                    style={{
                      borderColor: moduleInfo.color,
                      backgroundColor: `${moduleInfo.color}15`,
                      boxShadow: `0 0 12px ${moduleInfo.color}33`,
                    }}
                  >
                    {/* Module Icon */}
                    {turret.module === 'NONE' && (
                      <Zap className="w-6 h-6 text-cyan-400" />
                    )}
                    {turret.module === 'CRYO' && (
                      <Snowflake className="w-6 h-6 text-sky-400 animate-spin" style={{ animationDuration: '10s' }} />
                    )}
                    {turret.module === 'TESLA' && (
                      <Zap className="w-6 h-6 text-purple-400 animate-pulse" />
                    )}
                    {turret.module === 'OVERCLOCK' && (
                      <Sparkles className="w-6 h-6 text-amber-400" />
                    )}

                    {/* Turret Barrel pointing right */}
                    <div
                      className="absolute right-[-6px] top-1/2 -translate-y-1/2 w-3 h-2 rounded-r"
                      style={{ backgroundColor: moduleInfo.color }}
                    />
                  </div>

                  {/* Turret Title & Status */}
                  <div className="hidden lg:block text-left">
                    <div className="text-[11px] font-bold font-tech text-white leading-tight">
                      LANE {lane.index + 1}
                    </div>
                    <div
                      className="text-[10px] font-mono font-bold uppercase tracking-wider"
                      style={{ color: moduleInfo.color }}
                    >
                      {moduleInfo.name}
                    </div>
                  </div>
                </div>

                {/* Turret Kinetic Shield Indicator if installed */}
                {turret.hasShield && (
                  <div className="absolute -right-2 top-2 bottom-2 w-1.5 bg-amber-400 rounded-full shadow-amber-glow animate-pulse" title="Kinetic Shield Active" />
                )}

                {/* Upgrade Dropdown / Button Menu */}
                <div className="flex items-center gap-1">
                  {turret.module === 'NONE' ? (
                    <div className="flex flex-col gap-1">
                      <button
                        onClick={() => onUpgradeTurret(lane.index, 'CRYO')}
                        disabled={gold < 150}
                        title="Install Cryo Pylon (150g) - Slows enemies by 35%"
                        className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-sky-950/80 border border-sky-600/60 text-sky-300 hover:bg-sky-600 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                      >
                        CRYO 150g
                      </button>
                      <button
                        onClick={() => onUpgradeTurret(lane.index, 'TESLA')}
                        disabled={gold < 250}
                        title="Install Tesla Coil (250g) - Chain lightning auto-hits"
                        className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-purple-950/80 border border-purple-600/60 text-purple-300 hover:bg-purple-600 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                      >
                        TESLA 250g
                      </button>
                      <button
                        onClick={() => onUpgradeTurret(lane.index, 'OVERCLOCK')}
                        disabled={gold < 200}
                        title="Install Kinetic Overclock (200g) - +50% Gold & Lane Shield"
                        className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-amber-950/80 border border-amber-600/60 text-amber-300 hover:bg-amber-600 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                      >
                        BOOST 200g
                      </button>
                    </div>
                  ) : (
                    <div className="text-right">
                      <span
                        className="text-[9px] font-mono font-black uppercase px-1.5 py-0.5 rounded border"
                        style={{
                          borderColor: moduleInfo.color,
                          color: moduleInfo.color,
                          backgroundColor: `${moduleInfo.color}15`,
                        }}
                      >
                        {moduleInfo.badge}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Lane Track Area (Enemies March from Right to Left) */}
              <div className="flex-1 h-full relative overflow-visible">
                {/* Lane Guide Lines */}
                <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-px bg-cyan-500/10 pointer-events-none" />

                {/* Render Enemies in this lane */}
                {laneEnemies.map((enemy) => (
                  <EnemyUnit
                    key={enemy.id}
                    enemy={enemy}
                    isLocked={enemy.id === lockedTargetId}
                    isShaking={enemy.id === shakingEnemyId}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </main>
  );
};
