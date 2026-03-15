import { useRef, useState, useCallback } from "react";

const COOLDOWN_MS = 5 * 60 * 1000; // 5분

export function useNudgeCooldown() {
  const cooldownMap = useRef<Map<string, number>>(new Map());
  const [, forceUpdate] = useState(0);

  const canNudge = useCallback((userId: string): boolean => {
    const lastNudged = cooldownMap.current.get(userId);
    if (!lastNudged) return true;
    return Date.now() - lastNudged >= COOLDOWN_MS;
  }, []);

  const recordNudge = useCallback((userId: string) => {
    cooldownMap.current.set(userId, Date.now());
    forceUpdate((n) => n + 1);
    // 5분 후 자동으로 UI 업데이트
    setTimeout(() => forceUpdate((n) => n + 1), COOLDOWN_MS);
  }, []);

  const getRemainingSeconds = useCallback((userId: string): number => {
    const lastNudged = cooldownMap.current.get(userId);
    if (!lastNudged) return 0;
    const remaining = Math.max(
      0,
      Math.ceil((COOLDOWN_MS - (Date.now() - lastNudged)) / 1000),
    );
    return remaining;
  }, []);

  return { canNudge, recordNudge, getRemainingSeconds };
}
