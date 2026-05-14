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
  // 動画
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
    id: 'hulu', name: 'Hulu', color: '#3DBB3D', iconSlug: 'hulu',
    plans: [{ name: '月額', price: 1026 }],
    cancelUrl: 'https://help.hulu.com',
  },
  {
    id: 'unext', name: 'U-NEXT', color: '#000000', iconSlug: 'unext',
    plans: [{ name: '月額', price: 2189 }],
    cancelUrl: 'https://video.unext.jp/account',
  },
  {
    id: 'crunchyroll', name: 'Crunchyroll', color: '#F47521', iconSlug: 'crunchyroll',
    plans: [
      { name: 'Fan',      price: 980 },
      { name: 'Mega Fan', price: 1480 },
    ],
    cancelUrl: 'https://www.crunchyroll.com/account/membership',
  },
  {
    id: 'appletv', name: 'Apple TV+', color: '#000000', iconSlug: 'appletv',
    plans: [{ name: '月額', price: 900 }],
    cancelUrl: null,
  },
  {
    id: 'dazn', name: 'DAZN', color: '#000000', iconSlug: 'dazn',
    plans: [
      { name: 'エントリー', price: 1200 },
      { name: 'スタンダード', price: 3700 },
    ],
    cancelUrl: null,
  },
  // 音楽
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
    id: 'applemusic', name: 'Apple Music', color: '#FC3C44', iconSlug: 'applemusic',
    plans: [
      { name: '個人',       price: 1080 },
      { name: 'ファミリー', price: 1680 },
    ],
    cancelUrl: null,
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
    id: 'linemusic', name: 'LINE MUSIC', color: '#06C755', iconSlug: 'line',
    plans: [
      { name: '個人',       price: 980 },
      { name: 'ファミリー', price: 1480 },
    ],
    cancelUrl: null,
  },
  // Apple / クラウド
  {
    id: 'apple', name: 'Apple One', color: '#555555', iconSlug: 'apple',
    plans: [
      { name: '個人',       price: 1200 },
      { name: 'ファミリー', price: 1980 },
    ],
    cancelUrl: null,
  },
  {
    id: 'icloud', name: 'iCloud+', color: '#3478F6', iconSlug: 'icloud',
    plans: [
      { name: '50GB',  price: 130 },
      { name: '200GB', price: 400 },
      { name: '2TB',   price: 1300 },
    ],
    cancelUrl: null,
  },
  {
    id: 'dropbox', name: 'Dropbox', color: '#0061FF', iconSlug: 'dropbox',
    plans: [
      { name: 'Plus',       price: 1200 },
      { name: 'Business',   price: 2000 },
    ],
    cancelUrl: 'https://www.dropbox.com/account/plan',
  },
  // ゲーム
  {
    id: 'playstation', name: 'PS Plus', color: '#003087', iconSlug: 'playstation',
    plans: [
      { name: 'エッセンシャル', price: 850 },
      { name: 'エクストラ',     price: 1300 },
      { name: 'プレミアム',     price: 1550 },
    ],
    cancelUrl: 'https://www.playstation.com/ja-jp/playstation-plus/',
  },
  {
    id: 'nintendo', name: 'Nintendo Switch Online', color: '#E60012', iconSlug: 'nintendo',
    plans: [
      { name: '個人',       price: 306 },
      { name: 'ファミリー', price: 514 },
    ],
    cancelUrl: 'https://accounts.nintendo.com/membership_service',
  },
  // ツール / 仕事
  {
    id: 'microsoft365', name: 'Microsoft 365', color: '#D83B01', iconSlug: 'microsoftoffice',
    plans: [
      { name: 'Personal', price: 1284 },
      { name: 'Family',   price: 1850 },
    ],
    cancelUrl: 'https://account.microsoft.com/services',
  },
  {
    id: 'notion', name: 'Notion', color: '#000000', iconSlug: 'notion',
    plans: [
      { name: 'Plus',     price: 1650 },
      { name: 'Business', price: 1760 },
    ],
    cancelUrl: 'https://www.notion.so/my-account',
  },
  {
    id: 'github', name: 'GitHub', color: '#181717', iconSlug: 'github',
    plans: [
      { name: 'Pro',     price: 1100 },
      { name: 'Copilot', price: 1100 },
    ],
    cancelUrl: 'https://github.com/settings/billing',
  },
  {
    id: 'zoom', name: 'Zoom', color: '#2D8CFF', iconSlug: 'zoom',
    plans: [{ name: 'Pro', price: 1899 }],
    cancelUrl: 'https://zoom.us/account/billing',
  },
  // コミュニティ
  {
    id: 'discord', name: 'Discord Nitro', color: '#5865F2', iconSlug: 'discord',
    plans: [
      { name: 'Nitro Basic', price: 950 },
      { name: 'Nitro',       price: 1900 },
    ],
    cancelUrl: 'https://discord.com/settings/subscriptions',
  },
  {
    id: 'niconico', name: 'ニコニコプレミアム', color: '#231815', iconSlug: 'niconico',
    plans: [{ name: '月額', price: 550 }],
    cancelUrl: 'https://account.nicovideo.jp/my/premium',
  },
  {
    id: 'twitch', name: 'Twitch', color: '#9146FF', iconSlug: 'twitch',
    plans: [{ name: 'チャンネル登録', price: 499 }],
    cancelUrl: 'https://www.twitch.tv/subscriptions',
  },
  // 読書 / 学習
  {
    id: 'audible', name: 'Audible', color: '#FF9900', iconSlug: 'audible',
    plans: [{ name: '月額', price: 1500 }],
    cancelUrl: 'https://www.audible.co.jp/account/cancel-membership',
  },
];
