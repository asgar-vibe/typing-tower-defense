export type EnemyType = 'SCOUT' | 'ASSAULT' | 'TANK' | 'BOSS';
export type EnemyModifier = 'STANDARD' | 'ARMORED' | 'REVERSE' | 'BOSS';

export interface Enemy {
  id: string;
  laneIndex: number; // 0, 1, 2, or 3 (For Boss: anchor lane e.g. 1 or 1.5)
  type: EnemyType;
  modifier: EnemyModifier;
  x: number; // Position in percentage (100 = right spawn, 0 = base reached)
  speed: number; // Base percentage decremented per second
  damageToBase: number;
  goldReward: number;
  scoreReward: number;
  isBreached: boolean;

  // Standard / Hull word
  word: string;
  typedLetters: number; // Progress tracked (starts at 0)

  // 2-Layer Armored mechanic
  shieldWord?: string;
  shieldTypedLetters?: number;
  isShieldBroken?: boolean;

  // Reverse typing mechanic
  isReversed?: boolean; // When true: must be typed backwards (from last char to first)

  // Boss-specific fields
  isBoss?: boolean;
  bossMaxPhases?: number;
  bossCurrentPhase?: number;
  bossPhaseWords?: string[]; // Array of words for each phase
}

export interface EnemyArchetype {
  type: EnemyType;
  name: string;
  speed: number; // % per second
  wordMinLen: number;
  wordMaxLen: number;
  damageToBase: number;
  goldReward: number;
  scoreReward: number;
  color: string;
  badge: string;
}

export const ENEMY_ARCHETYPES: Record<EnemyType, EnemyArchetype> = {
  SCOUT: {
    type: 'SCOUT',
    name: 'Cyber Drone',
    speed: 8.5, // ~8.5% per second (traverses screen in ~11-12s)
    wordMinLen: 3,
    wordMaxLen: 4,
    damageToBase: 10,
    goldReward: 20,
    scoreReward: 150,
    color: '#00f0ff', // Cyan
    badge: 'FAST',
  },
  ASSAULT: {
    type: 'ASSAULT',
    name: 'Assault Mech',
    speed: 5.2, // ~5.2% per second (traverses in ~19s)
    wordMinLen: 5,
    wordMaxLen: 7,
    damageToBase: 20,
    goldReward: 35,
    scoreReward: 300,
    color: '#ffaa00', // Amber
    badge: 'MEDIUM',
  },
  TANK: {
    type: 'TANK',
    name: 'Siege Juggernaut',
    speed: 3.0, // ~3% per second (traverses in ~33s)
    wordMinLen: 8,
    wordMaxLen: 12,
    damageToBase: 35,
    goldReward: 70,
    scoreReward: 600,
    color: '#ff2a55', // Crimson
    badge: 'HEAVY',
  },
  BOSS: {
    type: 'BOSS',
    name: 'TITAN-0 // CORE OVERMIND',
    speed: 0.85, // Menacing slow crawl ~0.85%/s
    wordMinLen: 8,
    wordMaxLen: 14,
    damageToBase: 100,
    goldReward: 750,
    scoreReward: 7500,
    color: '#ff007f', // Neon Magenta
    badge: 'BOSS',
  },
};
