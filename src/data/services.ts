export interface ServiceEntry {
  id: string;
  name: string;
  emoji: string;
  color: string;
  defaultPrice: number;
  cancelUrl: string | null;
}

export const SERVICES: ServiceEntry[] = [
  { id: 'netflix',   name: 'Netflix',         emoji: '🎬', color: '#E50914', defaultPrice: 1590, cancelUrl: 'https://www.netflix.com/cancelplan' },
  { id: 'spotify',   name: 'Spotify',         emoji: '🎵', color: '#1DB954', defaultPrice: 980,  cancelUrl: 'https://www.spotify.com/jp/account/subscription/cancel/' },
  { id: 'disney',    name: 'Disney+',         emoji: '🏰', color: '#113CCF', defaultPrice: 990,  cancelUrl: 'https://www.disneyplus.com/ja-jp/account' },
  { id: 'amazon',    name: 'Amazon Prime',    emoji: '📦', color: '#FF9900', defaultPrice: 600,  cancelUrl: 'https://www.amazon.co.jp/mc/pipelines/cancellation' },
  { id: 'youtube',   name: 'YouTube Premium', emoji: '▶️', color: '#FF0000', defaultPrice: 1280, cancelUrl: 'https://www.youtube.com/paid_memberships' },
  { id: 'apple',     name: 'Apple One',       emoji: '🍎', color: '#555555', defaultPrice: 1200, cancelUrl: null },
  { id: 'hulu',      name: 'Hulu',            emoji: '📺', color: '#3DBB3D', defaultPrice: 1026, cancelUrl: 'https://help.hulu.com' },
  { id: 'linemusic', name: 'LINE MUSIC',      emoji: '🎤', color: '#06C755', defaultPrice: 980,  cancelUrl: null },
  { id: 'dazn',      name: 'DAZN',            emoji: '⚽', color: '#000000', defaultPrice: 3700, cancelUrl: null },
];
