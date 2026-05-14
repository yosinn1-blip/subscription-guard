export interface ServicePlan {
  name: string;
  price: number;
}

export interface ServiceEntry {
  id: string;
  name: string;
  color: string;
  iconSlug: string;
  plans: ServicePlan[];
  cancelUrl: string | null;
}

export const SERVICES: ServiceEntry[] = [
  {
    id: 'netflix', name: 'Netflix', color: '#E50914', iconSlug: 'netflix',
    plans: [
      { name: '広告つきスタンダード', price: 790 },
      { name: 'スタンダード',         price: 1590 },
      { name: 'プレミアム',           price: 1980 },
    ],
    cancelUrl: 'https://www.netflix.com/cancelplan',
  },
  {
    id: 'spotify', name: 'Spotify', color: '#1DB954', iconSlug: 'spotify',
    plans: [
      { name: '個人',       price: 980 },
      { name: 'Duo',        price: 1280 },
      { name: 'ファミリー', price: 1580 },
    ],
    cancelUrl: 'https://www.spotify.com/jp/account/subscription/cancel/',
  },
  {
    id: 'disney', name: 'Disney+', color: '#113CCF', iconSlug: 'disneyplus',
    plans: [{ name: '月額', price: 990 }],
    cancelUrl: 'https://www.disneyplus.com/ja-jp/account',
  },
  {
    id: 'amazon', name: 'Amazon Prime', color: '#FF9900', iconSlug: 'amazonprime',
    plans: [
      { name: '月額', price: 600 },
      { name: '年間（月換算）', price: 492 },
    ],
    cancelUrl: 'https://www.amazon.co.jp/mc/pipelines/cancellation',
  },
  {
    id: 'youtube', name: 'YouTube Premium', color: '#FF0000', iconSlug: 'youtube',
    plans: [
      { name: '個人',       price: 1280 },
      { name: 'ファミリー', price: 2280 },
    ],
    cancelUrl: 'https://www.youtube.com/paid_memberships',
  },
  {
    id: 'apple', name: 'Apple One', color: '#000000', iconSlug: 'apple',
    plans: [
      { name: '個人',       price: 1200 },
      { name: 'ファミリー', price: 1980 },
    ],
    cancelUrl: null,
  },
  {
    id: 'hulu', name: 'Hulu', color: '#3DBB3D', iconSlug: 'hulu',
    plans: [{ name: '月額', price: 1026 }],
    cancelUrl: 'https://help.hulu.com',
  },
  {
    id: 'linemusic', name: 'LINE MUSIC', color: '#06C755', iconSlug: 'line',
    plans: [
      { name: '個人',       price: 980 },
      { name: 'ファミリー', price: 1480 },
    ],
    cancelUrl: null,
  },
  {
    id: 'dazn', name: 'DAZN', color: '#000000', iconSlug: 'dazn',
    plans: [{ name: '月額', price: 3700 }],
    cancelUrl: null,
  },
];
