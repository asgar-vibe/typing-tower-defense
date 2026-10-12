import { useState, useEffect, useCallback, useRef } from 'react';
import { Enemy } from '../types/enemy';
import { LaserBeam, CombatStats } from '../types/game';
import { LaneTurret, TacticalCommandType } from '../types/tactics';
import { soundEngine } from '../utils/SoundEngine';
import { particleManager } from '../utils/particleEmitter';

interface UseTypingCombatParams {
  enemies: Enemy[];
  setEnemies: React.Dispatch<React.SetStateAction<Enemy[]>>;
  laneTurrets: LaneTurret[];
  gold: number;
  onAddGold: (amount: number) => void;
  onAddScore: (amount: number) => void;
  onIncrementStreak: () => void;
  onResetStreak: () => void;
  multiplier: number;
  onTriggerTactical: (type: TacticalCommandType) => void;
  isActive: boolean;
  onTriggerTrauma: (type: 'light' | 'heavy') => void;
}

export function useTypingCombat({
  enemies,
  setEnemies,
  laneTurrets,
  gold,
  onAddGold,
  onAddScore,
  onIncrementStreak,
  onResetStreak,
  multiplier,
  onTriggerTactical,
  isActive,
  onTriggerTrauma,
}: UseTypingCombatParams) {
  const [lockedTargetId, setLockedTargetId] = useState<string | null>(null);
  const [laserBeams, setLaserBeams] = useState<LaserBeam[]>([]);
  const [recentKeys, setRecentKeys] = useState<string[]>([]);
  const [lastTypo, setLastTypo] = useState<boolean>(false);
  const [shakingEnemyId, setShakingEnemyId] = useState<string | null>(null);
  const [panicBuffer, setPanicBuffer] = useState<string>('');

  // Combat Stats Tracking
  const combatStatsRef = useRef<CombatStats>({
    totalKeystrokes: 0,
    correctKeystrokes: 0,
    typos: 0,
    wordsCompleted: 0,
    enemiesDefeated: 0,
    startTime: Date.now(),
    wpm: 0,
    accuracy: 100,
  });

  const enemiesRef = useRef(enemies);
  enemiesRef.current = enemies;

  const lockedTargetIdRef = useRef(lockedTargetId);
  lockedTargetIdRef.current = lockedTargetId;

  const laneTurretsRef = useRef(laneTurrets);
  laneTurretsRef.current = laneTurrets;

  // Clean up old laser beams after 120ms
  useEffect(() => {
    if (laserBeams.length === 0) return;
    const timer = setTimeout(() => {
      setLaserBeams((prev) => prev.slice(1));
    }, 120);
    return () => clearTimeout(timer);
  }, [laserBeams]);

  // Recalculate WPM and Accuracy
  const updateCombatMetrics = useCallback(() => {
    const stats = combatStatsRef.current;
    const elapsedMinutes = Math.max((Date.now() - stats.startTime) / 60000, 0.05);
    stats.wpm = (stats.correctKeystrokes / 5) / elapsedMinutes;
    stats.accuracy =
      stats.totalKeystrokes > 0
        ? (stats.correctKeystrokes / stats.totalKeystrokes) * 100
        : 100;
  }, []);

  // Fire laser beam from fortress turret of enemy's lane to enemy's position
  const fireLaser = useCallback((enemy: Enemy, color: string = '#00f0ff') => {
    // 4 lanes: Y positions roughly 12.5%, 37.5%, 62.5%, 87.5%
    const laneY = enemy.isBoss ? 50 : 12.5 + enemy.laneIndex * 25;
    const turretLane = enemy.isBoss ? 1 : enemy.laneIndex;
    const turretY = 12.5 + turretLane * 25;

    const beam: LaserBeam = {
      id: Math.random().toString(),
      laneIndex: turretLane,
      startX: 18, // Fortress edge
      startY: turretY,
      targetX: enemy.x,
      targetY: laneY,
      color,
      createdAt: Date.now(),
    };
    setLaserBeams((prev) => [...prev, beam]);
  }, []);

  // Helper to get active character expected for an enemy when checking initial lock
  const getEnemyStartingChar = useCallback((enemy: Enemy): string => {
    // 1. Armored with active shield
    if (enemy.shieldWord && !enemy.isShieldBroken) {
      return enemy.shieldWord[0]?.toLowerCase() || '';
    }
    // 2. Reverse typing enemy (checks the LAST character)
    if (enemy.modifier === 'REVERSE' || enemy.isReversed) {
      return enemy.word[enemy.word.length - 1]?.toLowerCase() || '';
    }
    // 3. Boss enemy
    if (enemy.isBoss && enemy.bossPhaseWords) {
      const activeWord = enemy.bossPhaseWords[enemy.bossCurrentPhase || 0] || enemy.word;
      return activeWord[0]?.toLowerCase() || '';
    }
    // 4. Standard
    return enemy.word[0]?.toLowerCase() || '';
  }, []);

  // Helper to get active expected character for an already locked enemy
  const getLockedEnemyExpectedChar = useCallback((enemy: Enemy): string => {
    // 1. Armored with active shield
    if (enemy.shieldWord && !enemy.isShieldBroken) {
      return enemy.shieldWord[enemy.shieldTypedLetters || 0]?.toLowerCase() || '';
    }
    // 2. Reverse typing enemy (right-to-left)
    if (enemy.modifier === 'REVERSE' || enemy.isReversed) {
      const charIndex = enemy.word.length - 1 - (enemy.typedLetters || 0);
      return charIndex >= 0 ? enemy.word[charIndex]?.toLowerCase() || '' : '';
    }
    // 3. Boss enemy
    if (enemy.isBoss && enemy.bossPhaseWords) {
      const activeWord = enemy.bossPhaseWords[enemy.bossCurrentPhase || 0] || enemy.word;
      return activeWord[enemy.typedLetters || 0]?.toLowerCase() || '';
    }
    // 4. Standard
    return enemy.word[enemy.typedLetters || 0]?.toLowerCase() || '';
  }, []);

  // Handle enemy defeat logic
  const handleDefeatEnemy = useCallback(
    (enemy: Enemy) => {
      combatStatsRef.current.wordsCompleted += 1;
      combatStatsRef.current.enemiesDefeated += 1;
      updateCombatMetrics();

      soundEngine.playExplosion();
      onTriggerTrauma(enemy.isBoss ? 'heavy' : 'light');

      // Calculate gold bonus (Kinetic Overclock gives +50% gold)
      const turret = laneTurretsRef.current.find((t) => t.laneIndex === enemy.laneIndex);
      const isOverclocked = turret?.module === 'OVERCLOCK';
      const goldEarned = Math.round(enemy.goldReward * (isOverclocked ? 1.5 : 1.0));
      const scoreEarned = Math.round(enemy.scoreReward * multiplier);

      onAddGold(goldEarned);
      onAddScore(scoreEarned);
      onIncrementStreak();

      // Lane approximate coordinates for canvas particles
      const arenaEl = document.querySelector('main');
      const arenaWidth = arenaEl?.clientWidth || 1000;
      const arenaHeight = arenaEl?.clientHeight || 600;
      const pixelX = (enemy.x / 100) * arenaWidth;
      const pixelY = enemy.isBoss ? 0.5 * arenaHeight : ((12.5 + enemy.laneIndex * 25) / 100) * arenaHeight;

      // Particle explosions & floating rewards
      particleManager.emitExplosion(pixelX, pixelY, enemy.isBoss ? '#ff007f' : '#00f0ff');
      if (enemy.isBoss) {
        particleManager.emitExplosion(pixelX + 30, pixelY - 20, '#ffaa00');
        particleManager.emitExplosion(pixelX - 30, pixelY + 20, '#00ff66');
      }
      particleManager.emitFloatingText(pixelX, pixelY - 20, `+${goldEarned}G`, '#ffaa00', enemy.isBoss ? 24 : 16);
      particleManager.emitFloatingText(pixelX, pixelY - 45, `+${scoreEarned} PTS`, '#00f0ff', enemy.isBoss ? 20 : 14);

      // Tesla Coil Chain Effect (for standard enemies)
      if (turret?.module === 'TESLA' && !enemy.isBoss) {
        const adjacent = enemiesRef.current.filter(
          (other) =>
            other.id !== enemy.id &&
            !other.isBoss &&
            Math.abs(other.laneIndex - enemy.laneIndex) === 1
        );
        const chainTargets = adjacent.slice(0, 2);

        chainTargets.forEach((target) => {
          const targetPixelX = (target.x / 100) * arenaWidth;
          const targetPixelY = ((12.5 + target.laneIndex * 25) / 100) * arenaHeight;
          particleManager.emitElectricArc(pixelX, pixelY, targetPixelX, targetPixelY, '#a855f7');
          soundEngine.playLaserShot();
        });

        if (chainTargets.length > 0) {
          setEnemies((currentList) =>
            currentList.map((target) => {
              if (chainTargets.some((ct) => ct.id === target.id)) {
                const autoTyped = Math.min(target.word.length - 1, (target.typedLetters || 0) + 2);
                return { ...target, typedLetters: autoTyped };
              }
              return target;
            })
          );
        }
      }

      // Remove defeated enemy & release lock
      setEnemies((prev) => prev.filter((e) => e.id !== enemy.id));
      setLockedTargetId(null);
    },
    [multiplier, onAddGold, onAddScore, onIncrementStreak, onTriggerTrauma, setEnemies, updateCombatMetrics]
  );

  // Main keydown handler
  useEffect(() => {
    if (!isActive) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore functional modifier keys
      if (
        e.ctrlKey ||
        e.altKey ||
        e.metaKey ||
        e.key === 'Tab' ||
        e.key.startsWith('Arrow') ||
        e.key === 'Shift'
      ) {
        return;
      }

      const key = e.key.toLowerCase();

      // 1. Target Unlock via Escape
      if (e.key === 'Escape') {
        setLockedTargetId(null);
        setPanicBuffer('');
        soundEngine.playKeyClick();
        return;
      }

      // Check emergency panic words buffer (typing 'nuke', 'freeze', 'repair')
      const nextPanic = (panicBuffer + key).slice(-6);
      setPanicBuffer(nextPanic);
      if (nextPanic.endsWith('nuke')) {
        onTriggerTactical('NUKE');
        setPanicBuffer('');
        return;
      } else if (nextPanic.endsWith('freeze')) {
        onTriggerTactical('FREEZE');
        setPanicBuffer('');
        return;
      } else if (nextPanic.endsWith('repair')) {
        onTriggerTactical('REPAIR');
        setPanicBuffer('');
        return;
      }

      // Only handle alphabet characters a-z
      if (!/^[a-z]$/.test(key)) {
        return;
      }

      // Log recent key for keyboard HUD
      setRecentKeys((prev) => [...prev.slice(-6), key]);
      combatStatsRef.current.totalKeystrokes += 1;

      const currentEnemies = enemiesRef.current;
      const currentLockedId = lockedTargetIdRef.current;

      // ============================================
      // CASE A: NO ENEMY CURRENTLY LOCKED
      // ============================================
      if (!currentLockedId) {
        // Find all active enemies starting with this letter
        const matching = currentEnemies.filter((enemy) => {
          if (enemy.isBreached) return false;
          const startChar = getEnemyStartingChar(enemy);
          return startChar === key;
        });

        if (matching.length > 0) {
          // Tie breaker: Threat Priority - smallest x (closest to fortress)
          matching.sort((a, b) => a.x - b.x);
          const chosen = matching[0];

          // Acquire lock & advance 1st character
          setLockedTargetId(chosen.id);
          combatStatsRef.current.correctKeystrokes += 1;
          setLastTypo(false);

          soundEngine.playTargetLock();
          soundEngine.playLaserShot();
          fireLaser(chosen, chosen.isBoss ? '#ff007f' : chosen.modifier === 'REVERSE' ? '#a855f7' : '#00f0ff');

          // Sparks
          const arenaEl = document.querySelector('main');
          const arenaWidth = arenaEl?.clientWidth || 1000;
          const arenaHeight = arenaEl?.clientHeight || 600;
          const px = (chosen.x / 100) * arenaWidth;
          const py = chosen.isBoss ? 0.5 * arenaHeight : ((12.5 + chosen.laneIndex * 25) / 100) * arenaHeight;
          particleManager.emitLetterHitSparks(px, py, '#00f0ff');

          // Check if single character completion
          const isArmoredShield = chosen.shieldWord && !chosen.isShieldBroken;
          if (isArmoredShield) {
            if (chosen.shieldWord!.length === 1) {
              // Shield breaks immediately
              soundEngine.playExplosion();
              particleManager.emitExplosion(px, py, '#00f0ff');
              particleManager.emitFloatingText(px, py - 30, 'SHIELD DOWN!', '#00f0ff', 16);
              setEnemies((prev) =>
                prev.map((e) =>
                  e.id === chosen.id
                    ? { ...e, shieldTypedLetters: 1, isShieldBroken: true }
                    : e
                )
              );
            } else {
              setEnemies((prev) =>
                prev.map((e) =>
                  e.id === chosen.id ? { ...e, shieldTypedLetters: 1 } : e
                )
              );
            }
          } else {
            // Forward, Reverse, or Boss
            const activeLen = chosen.isBoss && chosen.bossPhaseWords
              ? (chosen.bossPhaseWords[chosen.bossCurrentPhase || 0] || chosen.word).length
              : chosen.word.length;

            if (activeLen === 1) {
              handleDefeatEnemy(chosen);
            } else {
              setEnemies((prev) =>
                prev.map((e) =>
                  e.id === chosen.id ? { ...e, typedLetters: 1 } : e
                )
              );
            }
          }
          updateCombatMetrics();
        } else {
          // Letter didn't match any hostile start letter
          soundEngine.playTypoError();
          combatStatsRef.current.typos += 1;
          setLastTypo(true);
          onResetStreak();
          updateCombatMetrics();
        }
        return;
      }

      // ============================================
      // CASE B: AN ENEMY IS ALREADY LOCKED
      // ============================================
      const lockedEnemy = currentEnemies.find((e) => e.id === currentLockedId);
      if (!lockedEnemy) {
        // Locked enemy no longer exists (e.g. breached or deleted)
        setLockedTargetId(null);
        return;
      }

      const expectedChar = getLockedEnemyExpectedChar(lockedEnemy);

      if (key === expectedChar) {
        // Correct letter match!
        combatStatsRef.current.correctKeystrokes += 1;
        setLastTypo(false);

        soundEngine.playKeyClick();
        soundEngine.playLaserShot();
        fireLaser(
          lockedEnemy,
          lockedEnemy.isBoss ? '#ff007f' : lockedEnemy.modifier === 'REVERSE' ? '#a855f7' : '#00f0ff'
        );

        // Emit hit sparks
        const arenaEl = document.querySelector('main');
        const arenaWidth = arenaEl?.clientWidth || 1000;
        const arenaHeight = arenaEl?.clientHeight || 600;
        const px = (lockedEnemy.x / 100) * arenaWidth;
        const py = lockedEnemy.isBoss
          ? 0.5 * arenaHeight
          : ((12.5 + lockedEnemy.laneIndex * 25) / 100) * arenaHeight;
        particleManager.emitLetterHitSparks(px, py, '#00f0ff');

        // SUB-CASE 1: ARMORED SHIELD IS ACTIVE
        if (lockedEnemy.shieldWord && !lockedEnemy.isShieldBroken) {
          const newShieldTyped = (lockedEnemy.shieldTypedLetters || 0) + 1;
          if (newShieldTyped >= lockedEnemy.shieldWord.length) {
            // Shield broken! Seamlessly keep target locked onto hull word!
            soundEngine.playExplosion();
            particleManager.emitExplosion(px, py, '#00f0ff');
            particleManager.emitFloatingText(px, py - 30, 'SHIELD DOWN!', '#00f0ff', 18);
            onTriggerTrauma('light');

            setEnemies((prev) =>
              prev.map((e) =>
                e.id === lockedEnemy.id
                  ? {
                      ...e,
                      shieldTypedLetters: newShieldTyped,
                      isShieldBroken: true,
                      typedLetters: 0, // Reset hull word progress to 0
                    }
                  : e
              )
            );
          } else {
            setEnemies((prev) =>
              prev.map((e) =>
                e.id === lockedEnemy.id
                  ? { ...e, shieldTypedLetters: newShieldTyped }
                  : e
              )
            );
          }
          updateCombatMetrics();
          return;
        }

        // SUB-CASE 2: BOSS ENTITY PHASE ADVANCEMENT
        if (lockedEnemy.isBoss && lockedEnemy.bossPhaseWords) {
          const currentPhaseIndex = lockedEnemy.bossCurrentPhase || 0;
          const phaseWord = lockedEnemy.bossPhaseWords[currentPhaseIndex] || lockedEnemy.word;
          const newTyped = (lockedEnemy.typedLetters || 0) + 1;

          if (newTyped >= phaseWord.length) {
            // Completed this phase word!
            const nextPhaseIndex = currentPhaseIndex + 1;
            const maxPhases = lockedEnemy.bossMaxPhases || 3;

            if (nextPhaseIndex < maxPhases) {
              // Advance to next boss phase
              soundEngine.playExplosion();
              particleManager.emitExplosion(px, py, '#ff007f');
              particleManager.emitFloatingText(px, py - 40, `PHASE ${nextPhaseIndex} OVERCOME!`, '#ffaa00', 20);
              onTriggerTrauma('heavy');

              setEnemies((prev) =>
                prev.map((e) =>
                  e.id === lockedEnemy.id
                    ? {
                        ...e,
                        bossCurrentPhase: nextPhaseIndex,
                        typedLetters: 0,
                        word: e.bossPhaseWords![nextPhaseIndex],
                      }
                    : e
                )
              );
            } else {
              // All phases defeated! Boss crushed!
              handleDefeatEnemy(lockedEnemy);
            }
          } else {
            setEnemies((prev) =>
              prev.map((e) =>
                e.id === lockedEnemy.id ? { ...e, typedLetters: newTyped } : e
              )
            );
          }
          updateCombatMetrics();
          return;
        }

        // SUB-CASE 3: STANDARD & REVERSE UNITS (HULL WORD)
        const newTyped = (lockedEnemy.typedLetters || 0) + 1;
        if (newTyped >= lockedEnemy.word.length) {
          // Word completed! Enemy defeated!
          handleDefeatEnemy(lockedEnemy);
        } else {
          // Advance progress
          setEnemies((prev) =>
            prev.map((e) =>
              e.id === lockedEnemy.id ? { ...e, typedLetters: newTyped } : e
            )
          );
        }
        updateCombatMetrics();
      } else {
        // Typo! Mismatch on locked enemy
        soundEngine.playTypoError();
        combatStatsRef.current.typos += 1;
        setLastTypo(true);
        onResetStreak();
        onTriggerTrauma('light');

        // Visual recoil/shake on enemy
        setShakingEnemyId(lockedEnemy.id);
        setTimeout(() => setShakingEnemyId(null), 120);

        updateCombatMetrics();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    isActive,
    fireLaser,
    getEnemyStartingChar,
    getLockedEnemyExpectedChar,
    handleDefeatEnemy,
    onResetStreak,
    onTriggerTactical,
    onTriggerTrauma,
    panicBuffer,
    setEnemies,
    updateCombatMetrics,
  ]);

  const unlockTarget = useCallback(() => {
    setLockedTargetId(null);
  }, []);

  const resetCombatStats = useCallback(() => {
    combatStatsRef.current = {
      totalKeystrokes: 0,
      correctKeystrokes: 0,
      typos: 0,
      wordsCompleted: 0,
      enemiesDefeated: 0,
      startTime: Date.now(),
      wpm: 0,
      accuracy: 100,
    };
    setLockedTargetId(null);
    setLaserBeams([]);
    setRecentKeys([]);
    setLastTypo(false);
  }, []);

  return {
    lockedTargetId,
    unlockTarget,
    laserBeams,
    recentKeys,
    lastTypo,
    shakingEnemyId,
    combatStats: combatStatsRef.current,
    resetCombatStats,
    panicInput: panicBuffer,
  };
}
