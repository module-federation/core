import { runCommand } from '@/utils/runCommand';

let installs = 0;
let pruneScheduled = false;
let pruning = false;

const DEFAULT_INTERVAL = 60 * 60 * 1000;

export const markInstallStart = (): void => {
  installs++;
};

export const markInstallEnd = (): void => {
  installs = Math.max(0, installs - 1);
  schedulePruneSoon();
};

const schedulePruneSoon = (delay = 30000): void => {
  if (pruneScheduled) return;
  pruneScheduled = true;
  setTimeout(() => {
    pruneScheduled = false;
    void maybePrune();
  }, delay);
};

export const maybePrune = async (): Promise<void> => {
  if (pruning || installs > 0) {
    schedulePruneSoon(60000);
    return;
  }
  pruning = true;
  try {
    await runCommand('pnpm store prune');
  } catch {
  } finally {
    pruning = false;
  }
};

export const startPeriodicPrune = (
  intervalMs: number = DEFAULT_INTERVAL,
): void => {
  if (intervalMs <= 0) return;
  setInterval(() => {
    void maybePrune();
  }, intervalMs);
};
