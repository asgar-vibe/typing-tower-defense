import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GameState, Lane, BaseStats } from './types/game';
import { Enemy, ENEMY_ARCHETYPES, EnemyType } from './types/enemy';
import { LaneTurret, TacticalCommandType, TURRET_MODULES, TurretModuleType } from './types/tactics';
import { soundEngine } from './utils/SoundEngine';
import { particleManager } from './utils/particleEmitter';
import { GameHUD } from './components/GameHUD';
import { BossHUD } from './components/BossHUD';
import { DefenseArena } from './components/DefenseArena';
import { CommandDeck } from './components/CommandDeck';
import { VictoryModal } from './components/VictoryModal';
import { GameOverModal } from './components/GameOverModal';
import { StartScreen } from './components/StartScreen';
import { useTacticalAbilities } from './hooks/useTacticalAbilities';
import { useTypingCombat } from './hooks/useTypingCombat';
import { useWaveDirector } from './hooks/useWaveDirector';

const LANES: Lane[] = [
  { id: 'lane-0', index: 0, yPosition: 12.5 },
  { id: 'lane-1', index: 1, yPosition: 37.5 },
  { id: 'lane-2', index: 2, yPosition: 62.5 },
  { id: 'lane-3', index: 3, yPosition: 87.5 },
];

const INITIAL_BASE_STATS: BaseStats = {
  maxHp: 100,
  currentHp: 100,
  gold: 150,
  wave: 1,
  score: 0,
  highScore: 0,
  streak: 0,
  multiplier: 1.0,
};

export default function App() {
  const [gameState, setGameState] = useState<GameState>('IDLE');
  const [stats, setStats] = useState<BaseStats>(() => {
    const savedHighScore = localStorage.getItem('typing_defense_high_score');
    return {
      ...INITIAL_BASE_STATS,
      highScore: savedHighScore ? parseInt(savedHighScore, 10) : 0,
    };
  });

  const [enemies, setEnemies] = useState<Enemy[]>([]);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [traumaLevel, setTraumaLevel] = useState<'none' | 'light' | 'heavy'>('none');
  const [showDamageVignette, setShowDamageVignette] = useState<boolean>(false);

  // Wave Director Hook (Handles modifiers & Wave 5 Boss encounter)
  const {
    bossAlertActive,
    initWave,
    spawnNextEnemy,
    isWaveComplete,
  } = useWaveDirector();

  // Tactical abilities hook
  const {
    laneTurrets,
    setLaneTurrets,
    upgradeTurret,
    cooldowns,
    isFreezing,
    isNuking,
    triggerTactical,
    resetTactics,
  } = useTacticalAbilities();

  // Trauma trigger helper
  const triggerTrauma = useCallback((type: 'light' | 'heavy') => {
    setTraumaLevel(type);
    if (type === 'heavy') {
      setShowDamageVignette(true);
      setTimeout(() => setShowDamageVignette(false), 450);
    }
    setTimeout(() => setTraumaLevel('none'), type === 'heavy' ? 350 : 120);
  }, []);

  // Stats mutations
  const handleAddGold = useCallback((amount: number) => {
    setStats((prev) => ({ ...prev, gold: prev.gold + amount }));
  }, []);

  const handleDeductGold = useCallback((amount: number) => {
    setStats((prev) => ({ ...prev, gold: Math.max(0, prev.gold - amount) }));
  }, []);

  const handleAddScore = useCallback((amount: number) => {
    setStats((prev) => {
      const nextScore = prev.score + amount;
      const nextHigh = Math.max(prev.highScore, nextScore);
      if (nextHigh > prev.highScore) {
        localStorage.setItem('typing_defense_high_score', nextHigh.toString());
      }
      return { ...prev, score: nextScore, highScore: nextHigh };
    });
  }, []);

  const handleIncrementStreak = useCallback(() => {
    setStats((prev) => {
      const nextStreak = prev.streak + 1;
      // Multiplier increases every 4 streak (up to 4.0x)
      const nextMultiplier = Math.min(4.0, 1.0 + Math.floor(nextStreak / 4) * 0.5);
      return { ...prev, streak: nextStreak, multiplier: nextMultiplier };
    });
  }, []);

  const handleResetStreak = useCallback(() => {
    setStats((prev) => ({ ...prev, streak: 0, multiplier: 1.0 }));
  }, []);

  const handleRepairCore = useCallback((amount: number) => {
    setStats((prev) => ({
      ...prev,
      currentHp: Math.min(prev.maxHp, prev.currentHp + amount),
    }));
  }, []);

  // Execute Nuke: Wipe all active enemies on screen (deal 1 phase damage if Boss)
  const handleExecuteNuke = useCallback(() => {
    triggerTrauma('heavy');
    setEnemies((currentList) => {
      const arenaEl = document.querySelector('main');
      const arenaWidth = arenaEl?.clientWidth || 1000;
      const arenaHeight = arenaEl?.clientHeight || 600;

      const remaining: Enemy[] = [];
      currentList.forEach((e) => {
        const px = (e.x / 100) * arenaWidth;
        const py = e.isBoss ? 0.5 * arenaHeight : ((12.5 + e.laneIndex * 25) / 100) * arenaHeight;
        particleManager.emitExplosion(px, py, '#ffaa00');
        particleManager.emitFloatingText(px, py - 20, `+${e.goldReward}G`, '#ffaa00', 16);

        if (e.isBoss) {
          // Nuke deals 1 phase damage to Boss
          const nextPhase = (e.bossCurrentPhase || 0) + 1;
          if (nextPhase < (e.bossMaxPhases || 3)) {
            remaining.push({
              ...e,
              bossCurrentPhase: nextPhase,
              typedLetters: 0,
              word: e.bossPhaseWords ? e.bossPhaseWords[nextPhase] : e.word,
            });
          }
        }
      });
      return remaining;
    });
  }, [triggerTrauma]);

  // Tactical spell invocation
  const onTriggerTactical = useCallback(
    (type: TacticalCommandType) => {
      triggerTactical(
        type,
        stats.gold,
        handleDeductGold,
        handleExecuteNuke,
        handleRepairCore
      );
    },
    [handleDeductGold, handleExecuteNuke, handleRepairCore, stats.gold, triggerTactical]
  );

  // Turret purchase handler
  const handleUpgradeTurret = useCallback(
    (laneIndex: number, moduleType: TurretModuleType) => {
      if (moduleType === 'NONE') return;
      const cost = TURRET_MODULES[moduleType].cost;
      if (stats.gold >= cost) {
        handleDeductGold(cost);
        upgradeTurret(laneIndex, moduleType);
        soundEngine.playRepairSound();
      } else {
        soundEngine.playTypoError();
      }
    },
    [handleDeductGold, stats.gold, upgradeTurret]
  );

  // Typing combat hook
  const {
    lockedTargetId,
    laserBeams,
    recentKeys,
    lastTypo,
    shakingEnemyId,
    combatStats,
    resetCombatStats,
    panicInput,
  } = useTypingCombat({
    enemies,
    setEnemies,
    laneTurrets,
    gold: stats.gold,
    onAddGold: handleAddGold,
    onAddScore: handleAddScore,
    onIncrementStreak: handleIncrementStreak,
    onResetStreak: handleResetStreak,
    multiplier: stats.multiplier,
    onTriggerTactical,
    isActive: gameState === 'PLAYING',
    onTriggerTrauma: triggerTrauma,
  });

  // Toggle audio mute
  const handleToggleMute = useCallback(() => {
    const nextMuted = soundEngine.toggleMute();
    setIsMuted(nextMuted);
  }, []);

  // Refs for Game Loop to avoid closure staleness and unneeded effect re-creations
  const enemiesRef = useRef<Enemy[]>(enemies);
  enemiesRef.current = enemies;

  const isFreezingRef = useRef<boolean>(isFreezing);
  isFreezingRef.current = isFreezing;

  const laneTurretsRef = useRef<LaneTurret[]>(laneTurrets);
  laneTurretsRef.current = laneTurrets;

  const waveRef = useRef<number>(stats.wave);
  waveRef.current = stats.wave;

  // Start game from start screen
  const handleStartGame = useCallback(() => {
    setGameState('PLAYING');
    setStats((prev) => ({
      ...INITIAL_BASE_STATS,
      highScore: prev.highScore,
    }));
    setEnemies([]);
    enemiesRef.current = [];
    resetTactics();
    resetCombatStats();
    particleManager.clear();
    initWave(1);
  }, [initWave, resetCombatStats, resetTactics]);

  // Advance to next wave
  const handleNextWave = useCallback(() => {
    soundEngine.playKeyClick();
    const nextWaveNum = stats.wave + 1;
    const bonusAward = stats.wave === 5 ? 400 : 50 + stats.wave * 25;
    setStats((prev) => ({
      ...prev,
      wave: nextWaveNum,
      gold: prev.gold + bonusAward,
    }));
    setEnemies([]);
    enemiesRef.current = [];
    setGameState('PLAYING');
    initWave(nextWaveNum);
  }, [initWave, stats.wave]);

  // Restart after game over
  const handleRestart = useCallback(() => {
    handleStartGame();
  }, [handleStartGame]);

  // ============================================================
  // 60 FPS GAME LOOP (Movement, Spawner, Base Breaches, Wave End)
  // ============================================================
  useEffect(() => {
    if (gameState !== 'PLAYING') return;

    let animationFrameId: number;
    let lastTime = performance.now();

    const loop = (currentTime: number) => {
      const dt = Math.min((currentTime - lastTime) / 1000, 0.1);
      lastTime = currentTime;

      // 1. WAVE SPAWNER
      let activeList = [...enemiesRef.current];
      const newEnemy = spawnNextEnemy(currentTime, waveRef.current);
      if (newEnemy) {
        activeList.push(newEnemy);
      }

      // 2. ENEMY MOVEMENT & COLLISION
      let hpDeduction = 0;
      let baseBreached = false;
      const remainingList: Enemy[] = [];

      for (const enemy of activeList) {
        // Check Cryo Pylon slow
        const turret = laneTurretsRef.current.find((t) => t.laneIndex === enemy.laneIndex);
        const slowFactor = turret?.module === 'CRYO' ? 0.65 : 1.0;
        const currentSpeed = isFreezingRef.current ? 0 : enemy.speed * slowFactor;

        const nextX = enemy.x - currentSpeed * dt;

        // Check if reached Fortress Base perimeter (x <= 1 reaches fortress wall)
        if (nextX <= 1) {
          // Check if lane has a Kinetic Overclock shield (Boss penetrates shield)
          if (turret?.hasShield && !enemy.isBoss) {
            // Shield absorbs the breach!
            setLaneTurrets((prev) =>
              prev.map((t) =>
                t.laneIndex === enemy.laneIndex ? { ...t, hasShield: false } : t
              )
            );
            soundEngine.playExplosion();
            triggerTrauma('light');
          } else {
            // Core takes damage
            hpDeduction += enemy.damageToBase;
            baseBreached = true;
          }

          // Explosion at base perimeter
          const arenaEl = document.querySelector('main');
          const arenaWidth = arenaEl?.clientWidth || 1000;
          const arenaHeight = arenaEl?.clientHeight || 600;
          const px = 0.18 * arenaWidth;
          const py = enemy.isBoss
            ? 0.5 * arenaHeight
            : ((12.5 + enemy.laneIndex * 25) / 100) * arenaHeight;
          particleManager.emitExplosion(px, py, '#ff2a55');

          // Drop breached enemy
          continue;
        }

        remainingList.push({ ...enemy, x: nextX });
      }

      // Synchronously update enemies ref and state
      enemiesRef.current = remainingList;
      setEnemies(remainingList);

      // Handle Base Damage & Breach effects synchronously
      if (baseBreached) {
        soundEngine.playBaseBreach();
        triggerTrauma('heavy');

        setStats((prev) => {
          const nextHp = Math.max(0, prev.currentHp - hpDeduction);
          if (nextHp <= 0) {
            soundEngine.playGameOverSound();
            setGameState('GAME_OVER');
          }
          return { ...prev, currentHp: nextHp, streak: 0, multiplier: 1.0 };
        });
      }

      // 3. CHECK WAVE COMPLETION
      if (isWaveComplete(remainingList.length) && gameState === 'PLAYING') {
        soundEngine.playVictorySound();
        setGameState('WAVE_CLEARED');
        return;
      }

      animationFrameId = requestAnimationFrame(loop);
    };

    animationFrameId = requestAnimationFrame(loop);

    return () => cancelAnimationFrame(animationFrameId);
  }, [
    gameState,
    isWaveComplete,
    setLaneTurrets,
    spawnNextEnemy,
    triggerTrauma,
  ]);

  // Find currently locked enemy object for CommandDeck
  const lockedEnemy = enemies.find((e) => e.id === lockedTargetId) || null;

  // Find active Boss entity if present
  const activeBoss = enemies.find((e) => e.isBoss) || null;

  return (
    <div
      className={`w-screen h-screen flex flex-col bg-[#060913] text-slate-100 select-none overflow-hidden relative font-mono transition-transform duration-75 ${
        traumaLevel === 'light'
          ? 'screen-shake-light'
          : traumaLevel === 'heavy'
          ? 'screen-shake-heavy'
          : ''
      }`}
    >
      {/* Damage Vignette Border */}
      {showDamageVignette && (
        <div className="absolute inset-0 pointer-events-none z-50 damage-vignette" />
      )}

      {/* Scanline CRT overlay */}
      <div className="absolute inset-0 pointer-events-none z-40 scanlines opacity-50" />

      {/* Top Status HUD */}
      <GameHUD
        stats={stats}
        combatStats={combatStats}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
      />

      {/* Dedicated Boss Health Bar HUD (When Boss is Active) */}
      {activeBoss && <BossHUD boss={activeBoss} />}

      {/* Central Defense Arena */}
      <DefenseArena
        lanes={LANES}
        enemies={enemies}
        lockedTargetId={lockedTargetId}
        laneTurrets={laneTurrets}
        gold={stats.gold}
        onUpgradeTurret={handleUpgradeTurret}
        laserBeams={laserBeams}
        isFreezing={isFreezing}
        isNuking={isNuking}
        shakingEnemyId={shakingEnemyId}
        bossAlertActive={bossAlertActive}
      />

      {/* Bottom Command Deck */}
      <CommandDeck
        lockedEnemy={lockedEnemy}
        gold={stats.gold}
        tacticalCooldowns={cooldowns}
        onTriggerTactical={onTriggerTactical}
        recentKeys={recentKeys}
        lastTypo={lastTypo}
        panicInput={panicInput}
      />

      {/* Modals & Screens */}
      {gameState === 'IDLE' && (
        <StartScreen onStart={handleStartGame} highScore={stats.highScore} />
      )}

      {gameState === 'WAVE_CLEARED' && (
        <VictoryModal
          wave={stats.wave}
          enemiesDefeated={combatStats.enemiesDefeated}
          wpm={combatStats.wpm}
          accuracy={combatStats.accuracy}
          bonusGold={stats.wave === 5 ? 400 : 50 + stats.wave * 25}
          onNextWave={handleNextWave}
        />
      )}

      {gameState === 'GAME_OVER' && (
        <GameOverModal
          finalScore={stats.score}
          highScore={stats.highScore}
          wavesSurvived={stats.wave}
          enemiesDefeated={combatStats.enemiesDefeated}
          wpm={combatStats.wpm}
          accuracy={combatStats.accuracy}
          onRestart={handleRestart}
        />
      )}
    </div>
  );
}
