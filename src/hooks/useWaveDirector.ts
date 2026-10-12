import { useState, useRef, useCallback } from 'react';
import { Enemy, EnemyType, EnemyModifier, ENEMY_ARCHETYPES } from '../types/enemy';
import { getRandomWord } from '../utils/words';

export interface WaveDirectorState {
  totalToSpawn: number;
  spawnedCount: number;
  nextSpawnTime: number;
  usedWords: Set<string>;
  isBossWave: boolean;
  bossSpawned: boolean;
}

export function useWaveDirector() {
  const [bossAlertActive, setBossAlertActive] = useState<boolean>(false);

  const directorRef = useRef<WaveDirectorState>({
    totalToSpawn: 10,
    spawnedCount: 0,
    nextSpawnTime: 0,
    usedWords: new Set<string>(),
    isBossWave: false,
    bossSpawned: false,
  });

  // Setup wave parameters
  const initWave = useCallback((waveNum: number) => {
    const isBoss = waveNum === 5;
    const totalToSpawn = isBoss ? 1 : 7 + waveNum * 3;

    directorRef.current = {
      totalToSpawn,
      spawnedCount: 0,
      nextSpawnTime: performance.now() + (isBoss ? 2800 : 800),
      usedWords: new Set<string>(),
      isBossWave: isBoss,
      bossSpawned: false,
    };

    if (isBoss) {
      setBossAlertActive(true);
      setTimeout(() => {
        setBossAlertActive(false);
      }, 3500);
    } else {
      setBossAlertActive(false);
    }
  }, []);

  // Spawn an enemy entity based on wave rules
  const spawnNextEnemy = useCallback((currentTime: number, waveNum: number): Enemy | null => {
    const director = directorRef.current;

    if (director.spawnedCount >= director.totalToSpawn) {
      return null;
    }

    if (currentTime < director.nextSpawnTime) {
      return null;
    }

    // ============================================
    // WAVE 5: SPECIAL TITAN BOSS ENCOUNTER
    // ============================================
    if (director.isBossWave) {
      if (director.bossSpawned) return null;

      director.bossSpawned = true;
      director.spawnedCount = 1;

      // 5 Multi-phase words for the boss
      const phaseWords: string[] = [];
      for (let p = 0; p < 5; p++) {
        const pWord = getRandomWord('LONG', director.usedWords).toLowerCase();
        director.usedWords.add(pWord);
        phaseWords.push(pWord);
      }

      const bossArchetype = ENEMY_ARCHETYPES.BOSS;
      const bossEnemy: Enemy = {
        id: `boss-${Date.now()}`,
        laneIndex: 1, // Spans lanes 1 and 2
        type: 'BOSS',
        modifier: 'BOSS',
        word: phaseWords[0],
        typedLetters: 0,
        x: 104,
        speed: bossArchetype.speed, // Menacing crawl ~0.85%/s
        damageToBase: bossArchetype.damageToBase,
        goldReward: bossArchetype.goldReward,
        scoreReward: bossArchetype.scoreReward,
        isBreached: false,
        isBoss: true,
        bossMaxPhases: 5,
        bossCurrentPhase: 0,
        bossPhaseWords: phaseWords,
      };

      return bossEnemy;
    }

    // ============================================
    // REGULAR WAVES: WITH MODIFIERS
    // ============================================
    // 1. Archetype selection
    let type: EnemyType = 'SCOUT';
    const roll = Math.random();

    if (waveNum === 1) {
      type = roll < 0.75 ? 'SCOUT' : 'ASSAULT';
    } else if (waveNum === 2) {
      type = roll < 0.5 ? 'SCOUT' : roll < 0.85 ? 'ASSAULT' : 'TANK';
    } else {
      type = roll < 0.35 ? 'SCOUT' : roll < 0.75 ? 'ASSAULT' : 'TANK';
    }

    const archetype = ENEMY_ARCHETYPES[type];
    const assignedWord = getRandomWord(type, director.usedWords);
    director.usedWords.add(assignedWord);

    // 2. Modifier selection
    let modifier: EnemyModifier = 'STANDARD';
    let shieldWord: string | undefined;
    let isReversed: boolean | undefined;

    // Starting Wave 2-3: 20% chance Armored enemy (Tank or Assault)
    // Starting Wave 3-4: 15% chance Reverse enemy (Mirror Drone)
    const modifierRoll = Math.random();

    if (waveNum >= 2 && modifierRoll < 0.22 && (type === 'TANK' || type === 'ASSAULT')) {
      modifier = 'ARMORED';
      shieldWord = getRandomWord('SHORT', director.usedWords);
      director.usedWords.add(shieldWord);
    } else if (waveNum >= 3 && modifierRoll >= 0.22 && modifierRoll < 0.38) {
      modifier = 'REVERSE';
      isReversed = true;
    }

    // Pick random lane (0 to 3)
    const randomLane = Math.floor(Math.random() * 4);

    const newEnemy: Enemy = {
      id: `enemy-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      laneIndex: randomLane,
      type,
      modifier,
      word: assignedWord,
      typedLetters: 0,
      x: 102,
      speed: archetype.speed * (0.9 + Math.random() * 0.2),
      damageToBase: archetype.damageToBase,
      goldReward: modifier === 'ARMORED' ? archetype.goldReward + 25 : archetype.goldReward,
      scoreReward: modifier === 'ARMORED' ? archetype.scoreReward + 200 : archetype.scoreReward,
      isBreached: false,
      shieldWord,
      shieldTypedLetters: shieldWord ? 0 : undefined,
      isShieldBroken: shieldWord ? false : undefined,
      isReversed,
    };

    director.spawnedCount += 1;

    // Spawning interval
    const baseInterval = Math.max(1100, 2500 - waveNum * 230);
    director.nextSpawnTime = currentTime + baseInterval + Math.random() * 500;

    return newEnemy;
  }, []);

  const isWaveComplete = useCallback((currentEnemiesCount: number): boolean => {
    const director = directorRef.current;
    return director.spawnedCount >= director.totalToSpawn && currentEnemiesCount === 0;
  }, []);

  return {
    directorRef,
    bossAlertActive,
    initWave,
    spawnNextEnemy,
    isWaveComplete,
  };
}
