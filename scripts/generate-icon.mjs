/**
 * アイコン生成スクリプト
 * 使い方: node scripts/generate-icon.mjs
 *
 * assets/icon.png (1024x1024) と assets/splash-icon.png (512x512) を生成します。
 * デザインを変えたい場合は SVG 文字列を編集してください。
 */

import sharp from 'sharp';
import { writeFileSync } from 'fs';

const SIZE = 1024;
const SPLASH_SIZE = 512;

// アイコン SVG: 緑の丸背景 + シールド + 時計の針
const iconSvg = `
<svg xmlns="http://www.w3.org/2000/svg" width="${SIZE}" height="${SIZE}" viewBox="0 0 100 100">
  <!-- 背景 -->
  <rect width="100" height="100" rx="22" fill="#5C8A6E"/>

  <!-- シールド -->
  <path d="M50 18 L72 27 L72 50 Q72 66 50 76 Q28 66 28 50 L28 27 Z"
        fill="none" stroke="white" stroke-width="3.5" stroke-linejoin="round"/>

  <!-- 時計の文字盤 -->
  <circle cx="50" cy="49" r="13" fill="none" stroke="white" stroke-width="2.8"/>

  <!-- 時計の針（11時55分） -->
  <line x1="50" y1="49" x2="46.5" y2="40" stroke="white" stroke-width="2.2" stroke-linecap="round"/>
  <line x1="50" y1="49" x2="57" y2="45" stroke="white" stroke-width="2.2" stroke-linecap="round"/>

  <!-- 中心点 -->
  <circle cx="50" cy="49" r="1.5" fill="white"/>
</svg>
`;

// スプラッシュ用（小さめ、余白あり）
const splashSvg = `
<svg xmlns="http://www.w3.org/2000/svg" width="${SPLASH_SIZE}" height="${SPLASH_SIZE}" viewBox="0 0 100 100">
  <rect width="100" height="100" rx="22" fill="#5C8A6E"/>
  <path d="M50 18 L72 27 L72 50 Q72 66 50 76 Q28 66 28 50 L28 27 Z"
        fill="none" stroke="white" stroke-width="3.5" stroke-linejoin="round"/>
  <circle cx="50" cy="49" r="13" fill="none" stroke="white" stroke-width="2.8"/>
  <line x1="50" y1="49" x2="46.5" y2="40" stroke="white" stroke-width="2.2" stroke-linecap="round"/>
  <line x1="50" y1="49" x2="57" y2="45" stroke="white" stroke-width="2.2" stroke-linecap="round"/>
  <circle cx="50" cy="49" r="1.5" fill="white"/>
</svg>
`;

async function generate() {
  await sharp(Buffer.from(iconSvg))
    .resize(SIZE, SIZE)
    .png()
    .toFile('assets/icon.png');
  console.log('✅ assets/icon.png (1024x1024)');

  await sharp(Buffer.from(splashSvg))
    .resize(SPLASH_SIZE, SPLASH_SIZE)
    .png()
    .toFile('assets/splash-icon.png');
  console.log('✅ assets/splash-icon.png (512x512)');

  // adaptive-icon は icon.png と同じものを使う
  await sharp(Buffer.from(iconSvg))
    .resize(SIZE, SIZE)
    .png()
    .toFile('assets/adaptive-icon.png');
  console.log('✅ assets/adaptive-icon.png (1024x1024)');
}

generate().catch(console.error);
