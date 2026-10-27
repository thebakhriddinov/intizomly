import fs from 'fs';
import path from 'path';
import sharp from '../frontend/node_modules/sharp/lib/index.js';

const publicDir = path.resolve('frontend/public');
const iconsDir = path.join(publicDir, 'icons');

if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Full standard app icon SVG (square squircle with glow)
const createIconSvg = (size, isMaskable = false) => {
  // Safe zone for maskable icon is inside 80% of size (padding 10% on each side)
  const padding = isMaskable ? size * 0.12 : size * 0.04;
  const innerSize = size - padding * 2;
  const rx = isMaskable ? 0 : innerSize * 0.28;

  return `
  <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="emblemBgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#141E28" />
        <stop offset="50%" stop-color="#0A1017" />
        <stop offset="100%" stop-color="#05080C" />
      </linearGradient>

      <linearGradient id="emblemBorderGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#B6F36B" stop-opacity="0.9" />
        <stop offset="45%" stop-color="#10B981" stop-opacity="0.6" />
        <stop offset="100%" stop-color="#06B6D4" stop-opacity="0.95" />
      </linearGradient>

      <linearGradient id="flameGradPrimary" x1="20%" y1="0%" x2="80%" y2="100%">
        <stop offset="0%" stop-color="#D4FF78" />
        <stop offset="35%" stop-color="#B6F36B" />
        <stop offset="75%" stop-color="#10B981" />
        <stop offset="100%" stop-color="#059669" />
      </linearGradient>

      <linearGradient id="sparkGradCyan" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#67E8F9" />
        <stop offset="50%" stop-color="#06B6D4" />
        <stop offset="100%" stop-color="#0284C7" />
      </linearGradient>

      <linearGradient id="specularGleam" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.4" />
        <stop offset="60%" stop-color="#FFFFFF" stop-opacity="0.0" />
      </linearGradient>

      <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="${size * 0.02}" stdDeviation="${size * 0.03}" flood-color="#10B981" flood-opacity="0.45" />
      </filter>
    </defs>

    <!-- Background for maskable or full bleed -->
    ${isMaskable ? `<rect width="${size}" height="${size}" fill="#080B11" />` : ''}

    <g transform="translate(${padding}, ${padding})">
      <!-- Outer Squircle with Iridescent Border -->
      <rect
        x="0"
        y="0"
        width="${innerSize}"
        height="${innerSize}"
        rx="${rx}"
        fill="url(#emblemBgGrad)"
        stroke="url(#emblemBorderGrad)"
        stroke-width="${Math.max(2, innerSize * 0.035)}"
      />

      <!-- Specular Shimmer -->
      <path
        d="M 2 ${innerSize * 0.3} Q ${innerSize * 0.5} ${innerSize * 0.25} ${innerSize - 2} ${innerSize * 0.3} L ${innerSize - 2} 4 Q ${innerSize * 0.5} 2 2 4 Z"
        fill="url(#specularGleam)"
      />

      <!-- Vector Center Emblem (scaled into innerSize) -->
      <g transform="scale(${innerSize / 48})">
        <!-- Cyan Flame Left Wing -->
        <path
          d="M24 8C20.5 13 14 18 14 26C14 32.5 18.5 37 24 37C22.5 34 22 30.5 23 27C23.8 24.2 26 22 27.5 19.5C28.8 17.3 29.5 14.8 29.2 12C27 10 25.5 8.8 24 8Z"
          fill="url(#sparkGradCyan)"
          opacity="0.9"
        />

        <!-- Main Rising Discipline Flame -->
        <path
          d="M24 7C22 13 16 17.5 16 26.5C16 33.5 20.2 38 25.5 38C31 38 34.5 33.5 34.5 27C34.5 20.5 29 16 27.5 12C26.5 9.5 25.2 8 24 7Z"
          fill="url(#flameGradPrimary)"
          filter="url(#glow)"
        />

        <!-- Diamond Core -->
        <path
          d="M24 18L28.5 24.5L24 31L19.5 24.5L24 18Z"
          fill="#FFFFFF"
          opacity="0.25"
        />

        <!-- Lightning / Checkmark Action -->
        <path
          d="M19 25.5L22.5 29L30 19"
          stroke="#080D05"
          stroke-width="3.2"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <path
          d="M19 25.5L22.5 29L30 19"
          stroke="#FFFFFF"
          stroke-width="1.6"
          stroke-linecap="round"
          stroke-linejoin="round"
        />

        <!-- Spark at crown -->
        <circle cx="24" cy="7.5" r="1.5" fill="#FFFFFF" />
      </g>
    </g>
  </svg>
  `;
};

async function generate() {
  console.log('Generating PWA icons...');
  
  // 1. icon-192.png
  const svg192 = Buffer.from(createIconSvg(192, false));
  await sharp(svg192).png().toFile(path.join(iconsDir, 'icon-192.png'));
  console.log('Created icon-192.png');

  // 2. icon-512.png
  const svg512 = Buffer.from(createIconSvg(512, false));
  await sharp(svg512).png().toFile(path.join(iconsDir, 'icon-512.png'));
  console.log('Created icon-512.png');

  // 3. icon-maskable-512.png (for Android adaptive icons)
  const svgMaskable = Buffer.from(createIconSvg(512, true));
  await sharp(svgMaskable).png().toFile(path.join(iconsDir, 'icon-maskable-512.png'));
  console.log('Created icon-maskable-512.png');

  // 4. apple-touch-icon.png (180x180 for iOS Safari home screen)
  const svgApple = Buffer.from(createIconSvg(180, false));
  await sharp(svgApple).png().toFile(path.join(iconsDir, 'apple-touch-icon.png'));
  console.log('Created apple-touch-icon.png');

  // Also put apple-touch-icon.png in public root for Safari default fallback
  await sharp(svgApple).png().toFile(path.join(publicDir, 'apple-touch-icon.png'));

  // 5. favicon-32.png and favicon-16.png
  const svg32 = Buffer.from(createIconSvg(32, false));
  await sharp(svg32).png().toFile(path.join(iconsDir, 'icon-32.png'));
  await sharp(svg32).png().toFile(path.join(publicDir, 'favicon.png'));
  console.log('Created favicon.png');

  // Also save SVG icon
  fs.writeFileSync(path.join(iconsDir, 'icon.svg'), createIconSvg(512, false));
  fs.writeFileSync(path.join(publicDir, 'favicon.svg'), createIconSvg(64, false));

  console.log('All icons generated successfully!');
}

generate().catch(console.error);
