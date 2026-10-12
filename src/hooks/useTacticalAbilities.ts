import { useState, useEffect, useCallback } from 'react';
import { LaneTurret, TacticalCommandType, TACTICAL_SPELLS, TurretModuleType } from '../types/tactics';
import { soundEngine } from '../utils/SoundEngine';

export function useTacticalAbilities() {
  const [laneTurrets, setLaneTurrets] = useState<LaneTurret[]>([
    { laneIndex: 0, module: 'NONE', hasShield: false },
    { laneIndex: 1, module: 'NONE', hasShield: false },
    { laneIndex: 2, module: 'NONE', hasShield: false },
    { laneIndex: 3, module: 'NONE', hasShield: false },
  ]);

  const [cooldowns, setCooldowns] = useState<Record<TacticalCommandType, number>>({
    NUKE: 0,
    FREEZE: 0,
    REPAIR: 0,
  });

  const [isFreezing, setIsFreezing] = useState<boolean>(false);
  const [isNuking, setIsNuking] = useState<boolean>(false);

  // Tick cooldown timers down every 100ms
  useEffect(() => {
    const timer = setInterval(() => {
      setCooldowns((prev) => {
        let changed = false;
        const next = { ...prev };
        for (const key of Object.keys(next) as TacticalCommandType[]) {
          if (next[key] > 0) {
            next[key] = Math.max(0, next[key] - 0.1);
            changed = true;
          }
        }
        return changed ? next : prev;
      });
    }, 100);

    return () => clearInterval(timer);
  }, []);

  // Upgrade or change turret module for a lane
  const upgradeTurret = useCallback((laneIndex: number, module: TurretModuleType) => {
    setLaneTurrets((prev) =>
      prev.map((t) =>
        t.laneIndex === laneIndex
          ? {
              ...t,
              module,
              hasShield: module === 'OVERCLOCK' ? true : t.hasShield,
            }
          : t
      )
    );
  }, []);

  // Trigger tactical command
  const triggerTactical = useCallback(
    (
      type: TacticalCommandType,
      currentGold: number,
      onDeductGold: (amount: number) => void,
      onExecuteNuke: () => void,
      onRepairCore: (amount: number) => void
    ): boolean => {
      const spell = TACTICAL_SPELLS[type];
      if (currentGold < spell.cost || (cooldowns[type] || 0) > 0) {
        soundEngine.playTypoError();
        return false;
      }

      // Deduct gold & start cooldown
      onDeductGold(spell.cost);
      setCooldowns((prev) => ({ ...prev, [type]: spell.cooldownSeconds }));

      if (type === 'NUKE') {
        soundEngine.playNukeAlarm();
        setIsNuking(true);
        setTimeout(() => setIsNuking(false), 600);
        onExecuteNuke();
      } else if (type === 'FREEZE') {
        soundEngine.playFreezeSound();
        setIsFreezing(true);
        setTimeout(() => {
          setIsFreezing(false);
        }, 5000);
      } else if (type === 'REPAIR') {
        soundEngine.playRepairSound();
        onRepairCore(25);
      }

      return true;
    },
    [cooldowns]
  );

  const resetTactics = useCallback(() => {
    setLaneTurrets([
      { laneIndex: 0, module: 'NONE', hasShield: false },
      { laneIndex: 1, module: 'NONE', hasShield: false },
      { laneIndex: 2, module: 'NONE', hasShield: false },
      { laneIndex: 3, module: 'NONE', hasShield: false },
    ]);
    setCooldowns({ NUKE: 0, FREEZE: 0, REPAIR: 0 });
    setIsFreezing(false);
    setIsNuking(false);
  }, []);

  return {
    laneTurrets,
    setLaneTurrets,
    upgradeTurret,
    cooldowns,
    isFreezing,
    isNuking,
    triggerTactical,
    resetTactics,
  };
}
