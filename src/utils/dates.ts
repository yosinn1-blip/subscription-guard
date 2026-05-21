export function daysUntil(isoDate: string): number {
  const now = new Date();
  const todayUTC = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  const [y, m, d] = isoDate.split('-').map(Number);
  const targetUTC = Date.UTC(y, m - 1, d);
  return Math.round((targetUTC - todayUTC) / (1000 * 60 * 60 * 24));
}

export function formatDate(isoDate: string): string {
  const [, month, day] = isoDate.split('-').map(Number);
  return `${month}月${day}日`;
}

export function isUrgent(isoDate: string | null, thresholdDays = 3): boolean {
  if (!isoDate) return false;
  const days = daysUntil(isoDate);
  return days >= 0 && days <= thresholdDays;
}

export function addDays(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}

export function addMonths(n: number): string {
  const d = new Date();
  d.setMonth(d.getMonth() + n);
  return d.toISOString().slice(0, 10);
}
