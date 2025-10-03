export type GoalProgress = {
  baseline: number | null;
  latest: number | null;
  target: number;
  percent: number | null;
};

export function computeProgress(baseline: number | null, latest: number | null, target: number): GoalProgress {
  if (latest == null || target === 0) return { baseline, latest, target, percent: null };
  const base = baseline ?? latest; // if no baseline, treat first as baseline upstream
  const denom = target - base;
  if (denom === 0) return { baseline: base, latest, target, percent: latest >= target ? 100 : 0 };
  const pct = Math.max(0, Math.min(100, (100 * (latest - base)) / denom));
  return { baseline: base, latest, target, percent: Math.round(pct * 100) / 100 };
}
