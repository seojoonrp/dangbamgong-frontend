import { useRef, useState, useCallback, useEffect } from "react";
import * as SecureStore from "expo-secure-store";

const COOLDOWN_MS = 5 * 60 * 1000;
const STORE_KEY = "nudge_cooldowns";

async function loadCooldownMap(): Promise<Map<string, number>> {
  try {
    const raw = await SecureStore.getItemAsync(STORE_KEY);
    if (!raw) return new Map();
    const obj: Record<string, number> = JSON.parse(raw);
    return new Map(Object.entries(obj));
  } catch {
    return new Map();
  }
}

async function saveCooldownMap(map: Map<string, number>) {
  const obj = Object.fromEntries(map);
  await SecureStore.setItemAsync(STORE_KEY, JSON.stringify(obj));
}

export function useNudgeCooldown() {
  const cooldownMap = useRef<Map<string, number>>(new Map());
  const [, forceUpdate] = useState(0);

  useEffect(() => {
    loadCooldownMap().then((map) => {
      cooldownMap.current = map;
      forceUpdate((n) => n + 1);
    });
  }, []);

  const canNudge = useCallback((userId: string): boolean => {
    const lastNudged = cooldownMap.current.get(userId);
    if (!lastNudged) return true;
    return Date.now() - lastNudged >= COOLDOWN_MS;
  }, []);

  const recordNudge = useCallback((userId: string) => {
    cooldownMap.current.set(userId, Date.now());
    forceUpdate((n) => n + 1);
    saveCooldownMap(cooldownMap.current);
    setTimeout(() => forceUpdate((n) => n + 1), COOLDOWN_MS);
  }, []);

  const getRemainingSeconds = useCallback((userId: string): number => {
    const lastNudged = cooldownMap.current.get(userId);
    if (!lastNudged) return 0;
    return Math.max(
      0,
      Math.ceil((COOLDOWN_MS - (Date.now() - lastNudged)) / 1000),
    );
  }, []);

  return { canNudge, recordNudge, getRemainingSeconds };
}
