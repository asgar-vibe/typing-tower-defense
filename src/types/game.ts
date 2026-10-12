export type GameState = 'IDLE' | 'PLAYING' | 'WAVE_CLEARED' | 'GAME_OVER';

export interface Lane {
  id: string;
  index: number; // 0, 1, 2, 3
  yPosition: number; // 0 to 100 percentage or visual offset
}

export interface BaseStats {
  maxHp: number;
  currentHp: number;
  gold: number;
  wave: number;
  score: number;
  highScore: number;
  streak: number;
  multiplier: number;
}

export interface CombatStats {
  totalKeystrokes: number;
  correctKeystrokes: number;
  typos: number;
  wordsCompleted: number;
  enemiesDefeated: number;
  startTime: number;
  wpm: number;
  accuracy: number;
}

export interface LaserBeam {
  id: string;
  laneIndex: number;
  startX: number; // percentage
  startY: number; // percentage
  targetX: number; // percentage
  targetY: number; // percentage
  color: string;
  createdAt: number;
}
