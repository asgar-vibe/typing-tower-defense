export type TurretModuleType = 'NONE' | 'CRYO' | 'TESLA' | 'OVERCLOCK';

export interface TurretModuleInfo {
  type: TurretModuleType;
  name: string;
  cost: number;
  description: string;
  iconName: string;
  color: string;
  badge: string;
}

export const TURRET_MODULES: Record<TurretModuleType, TurretModuleInfo> = {
  NONE: {
    type: 'NONE',
    name: 'Standard Laser',
    cost: 0,
    description: 'Basic turret capable of manual typing defense.',
    iconName: 'Zap',
    color: '#00f0ff',
    badge: 'BASIC',
  },
  CRYO: {
    type: 'CRYO',
    name: 'Cryo Pylon',
    cost: 150,
    description: 'Emits a permanent slow aura, reducing lane enemy speeds by 35%.',
    iconName: 'Snowflake',
    color: '#38bdf8',
    badge: 'SLOW',
  },
  TESLA: {
    type: 'TESLA',
    name: 'Tesla Coil',
    cost: 250,
    description: 'Electric arcs bounce to 2 adjacent enemies on kill, typing 2 letters.',
    iconName: 'Zap',
    color: '#a855f7',
    badge: 'CHAIN',
  },
  OVERCLOCK: {
    type: 'OVERCLOCK',
    name: 'Kinetic Overclock',
    cost: 200,
    description: 'Grants +50% Gold bonus and deploys a 1-hit kinetic shield for this lane.',
    iconName: 'ShieldAlert',
    color: '#ffaa00',
    badge: 'BOOST',
  },
};

export interface LaneTurret {
  laneIndex: number;
  module: TurretModuleType;
  hasShield: boolean;
}

export type TacticalCommandType = 'NUKE' | 'FREEZE' | 'REPAIR';

export interface TacticalSpellInfo {
  type: TacticalCommandType;
  word: string;
  name: string;
  cost: number;
  description: string;
  cooldownSeconds: number;
  color: string;
}

export const TACTICAL_SPELLS: Record<TacticalCommandType, TacticalSpellInfo> = {
  NUKE: {
    type: 'NUKE',
    word: 'NUKE',
    name: 'Orbital Nuke',
    cost: 300,
    description: 'Obliterates all active enemies with an orbital strike.',
    cooldownSeconds: 20,
    color: '#ff2a55',
  },
  FREEZE: {
    type: 'FREEZE',
    word: 'FREEZE',
    name: 'Cryo Stasis',
    cost: 150,
    description: 'Freezes all enemies in place across all lanes for 5.0s.',
    cooldownSeconds: 15,
    color: '#00f0ff',
  },
  REPAIR: {
    type: 'REPAIR',
    word: 'REPAIR',
    name: 'Nanite Repair',
    cost: 100,
    description: 'Restores +25 HP to Fortress Core instantly.',
    cooldownSeconds: 10,
    color: '#00ff66',
  },
};
