export function daysUntil(isoDate: string): number {
  const target = new Date(isoDate);
  target.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
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
