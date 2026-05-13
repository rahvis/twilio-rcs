import { deflateSync } from 'zlib';
import { brandTokens } from './brand';

type Rgba = [number, number, number, number];

interface Canvas {
  width: number;
  height: number;
  pixels: Uint8Array;
}

export interface RcsAsset {
  fileName: string;
  contentType: 'image/png';
  width: number;
  height: number;
  buffer: Buffer;
}

interface AssetSpec {
  fileName: string;
  width: number;
  height: number;
  draw: (canvas: Canvas) => void;
}

const colors = brandTokens.colors;
const assetCache = new Map<string, RcsAsset>();

const assetSpecs: AssetSpec[] = [
  {
    fileName: 'workonward-logo.png',
    width: 224,
    height: 224,
    draw: drawLogo
  },
  {
    fileName: 'workonward-banner.png',
    width: 1440,
    height: 448,
    draw: drawBanner
  },
  {
    fileName: 'consent.png',
    width: 640,
    height: 320,
    draw: (canvas) => drawMessageCard(canvas, 'consent')
  },
  {
    fileName: 'language.png',
    width: 640,
    height: 320,
    draw: (canvas) => drawMessageCard(canvas, 'language')
  },
  {
    fileName: 'role.png',
    width: 640,
    height: 320,
    draw: (canvas) => drawMessageCard(canvas, 'role')
  },
  {
    fileName: 'location.png',
    width: 640,
    height: 320,
    draw: (canvas) => drawMessageCard(canvas, 'location')
  },
  {
    fileName: 'shift.png',
    width: 640,
    height: 320,
    draw: (canvas) => drawMessageCard(canvas, 'shift')
  },
  {
    fileName: 'actions.png',
    width: 640,
    height: 320,
    draw: (canvas) => drawMessageCard(canvas, 'actions')
  },
  {
    fileName: 'apply-followup.png',
    width: 640,
    height: 320,
    draw: (canvas) => drawMessageCard(canvas, 'apply')
  },
  {
    fileName: 'apply-closing.png',
    width: 640,
    height: 320,
    draw: (canvas) => drawMessageCard(canvas, 'closing')
  },
  {
    fileName: 'help.png',
    width: 640,
    height: 320,
    draw: (canvas) => drawMessageCard(canvas, 'help')
  },
  {
    fileName: 'handoff.png',
    width: 640,
    height: 320,
    draw: (canvas) => drawMessageCard(canvas, 'handoff')
  },
  {
    fileName: 'job-warehouse.png',
    width: 640,
    height: 320,
    draw: (canvas) => drawJobCard(canvas, 'warehouse')
  },
  {
    fileName: 'job-restaurant.png',
    width: 640,
    height: 320,
    draw: (canvas) => drawJobCard(canvas, 'restaurant')
  },
  {
    fileName: 'job-caregiving.png',
    width: 640,
    height: 320,
    draw: (canvas) => drawJobCard(canvas, 'caregiving')
  }
];

const assetsByName = new Map(assetSpecs.map((spec) => [spec.fileName, spec]));

export function getRcsAsset(fileName: string): RcsAsset | undefined {
  const spec = assetsByName.get(fileName);
  if (!spec) {
    return undefined;
  }

  const cached = assetCache.get(fileName);
  if (cached) {
    return cached;
  }

  const canvas = createCanvas(spec.width, spec.height, hexToRgba(colors.pageBackground));
  spec.draw(canvas);

  const asset = {
    fileName: spec.fileName,
    contentType: 'image/png' as const,
    width: spec.width,
    height: spec.height,
    buffer: encodePng(canvas)
  };
  assetCache.set(fileName, asset);
  return asset;
}

export function listRcsAssetMetadata(): Array<Omit<RcsAsset, 'buffer'>> {
  return assetSpecs.map((spec) => {
    const asset = getRcsAsset(spec.fileName);
    return {
      fileName: spec.fileName,
      contentType: 'image/png',
      width: spec.width,
      height: spec.height
    };
  });
}

function createCanvas(width: number, height: number, background: Rgba): Canvas {
  const canvas = {
    width,
    height,
    pixels: new Uint8Array(width * height * 4)
  };

  fillRect(canvas, 0, 0, width, height, background);
  return canvas;
}

function drawLogo(canvas: Canvas): void {
  const black = hexToRgba('#050505');
  const green = hexToRgba(colors.green);
  const orange = hexToRgba(colors.orange);

  fillRect(canvas, 0, 0, canvas.width, canvas.height, rgba(255, 255, 255, 0));
  fillRoundedRect(canvas, 19, 19, 186, 186, 34, black);

  drawThickLine(canvas, 63, 72, 83, 152, 28, green);
  drawThickLine(canvas, 83, 152, 113, 72, 28, green);
  drawThickLine(canvas, 113, 72, 139, 152, 28, orange);
  drawThickLine(canvas, 139, 152, 165, 72, 28, orange);
}

function drawBanner(canvas: Canvas): void {
  fillRect(canvas, 0, 0, canvas.width, canvas.height, hexToRgba(colors.softSurface));
  fillRect(canvas, 0, 0, canvas.width, 26, hexToRgba(colors.orange));
  fillRect(canvas, 0, 26, canvas.width, 18, hexToRgba(colors.green));
  fillRect(canvas, 0, canvas.height - 42, canvas.width, 42, hexToRgba(colors.darkGray));

  drawLargeMark(canvas, 112, 72, 286);

  fillRoundedRect(canvas, 505, 86, 790, 88, 22, hexToRgba(colors.lightOrange));
  fillRoundedRect(canvas, 505, 199, 625, 58, 18, hexToRgba(colors.lightGreen));
  fillRoundedRect(canvas, 505, 285, 470, 42, 14, hexToRgba(colors.gray));
  fillCircle(canvas, 1234, 160, 74, hexToRgba(colors.lightGreen));
  fillCircle(canvas, 1298, 228, 52, hexToRgba(colors.lightOrange));
}

function drawMessageCard(canvas: Canvas, variant: string): void {
  const background = variant === 'consent' || variant === 'help'
    ? hexToRgba(colors.lightGreen)
    : hexToRgba(colors.lightOrange);

  fillRect(canvas, 0, 0, canvas.width, canvas.height, hexToRgba(colors.softSurface));
  fillRect(canvas, 0, 0, canvas.width, 18, hexToRgba(colors.darkGray));
  fillRect(canvas, 0, 18, canvas.width, 12, hexToRgba(colors.orange));
  fillRoundedRect(canvas, 36, 52, canvas.width - 72, canvas.height - 88, 24, background);

  drawLargeMark(canvas, 64, 84, 146);
  drawChoiceLines(canvas, 252, 94, 300, variant === 'actions' ? 5 : 4);

  if (variant === 'apply' || variant === 'closing') {
    drawCheck(canvas, 510, 184);
  } else if (variant === 'location') {
    drawPin(canvas, 511, 185);
  } else if (variant === 'shift') {
    drawClock(canvas, 510, 184);
  } else if (variant === 'help' || variant === 'handoff') {
    drawSupport(canvas, 508, 184);
  } else {
    fillCircle(canvas, 510, 184, 42, hexToRgba(colors.orange));
    fillCircle(canvas, 533, 184, 42, hexToRgba(colors.green));
  }
}

function drawJobCard(canvas: Canvas, variant: 'warehouse' | 'restaurant' | 'caregiving'): void {
  fillRect(canvas, 0, 0, canvas.width, canvas.height, hexToRgba(colors.softSurface));
  fillRect(canvas, 0, 0, canvas.width, 24, hexToRgba(colors.darkGray));

  const accent = variant === 'warehouse'
    ? hexToRgba(colors.orange)
    : variant === 'restaurant'
      ? hexToRgba(colors.green)
      : hexToRgba(colors.lightOrange);

  fillRoundedRect(canvas, 34, 52, 572, 214, 26, hexToRgba('#FFFFFF'));
  fillRect(canvas, 34, 52, 572, 72, accent);
  fillRoundedRect(canvas, 67, 151, 248, 24, 8, hexToRgba(colors.darkGray));
  fillRoundedRect(canvas, 67, 195, 318, 20, 7, hexToRgba(colors.gray));
  fillRoundedRect(canvas, 67, 231, 198, 18, 7, hexToRgba(colors.green));

  if (variant === 'warehouse') {
    drawWarehouse(canvas, 458, 157);
  } else if (variant === 'restaurant') {
    drawRestaurant(canvas, 458, 157);
  } else {
    drawCare(canvas, 458, 157);
  }
}

function drawLargeMark(canvas: Canvas, x: number, y: number, size: number): void {
  const scale = size / 224;
  fillRoundedRect(canvas, x, y, size, size, Math.round(34 * scale), hexToRgba('#050505'));
  drawThickLine(canvas, x + 44 * scale, y + 70 * scale, x + 66 * scale, y + 151 * scale, 28 * scale, hexToRgba(colors.green));
  drawThickLine(canvas, x + 66 * scale, y + 151 * scale, x + 98 * scale, y + 70 * scale, 28 * scale, hexToRgba(colors.green));
  drawThickLine(canvas, x + 98 * scale, y + 70 * scale, x + 128 * scale, y + 151 * scale, 28 * scale, hexToRgba(colors.orange));
  drawThickLine(canvas, x + 128 * scale, y + 151 * scale, x + 158 * scale, y + 70 * scale, 28 * scale, hexToRgba(colors.orange));
}

function drawChoiceLines(canvas: Canvas, x: number, y: number, width: number, count: number): void {
  for (let index = 0; index < count; index += 1) {
    const lineY = y + index * 34;
    fillRoundedRect(canvas, x, lineY, width - index * 22, 14, 6, hexToRgba(colors.darkGray));
    fillRoundedRect(canvas, x, lineY + 18, Math.max(120, width - 72 - index * 18), 10, 5, hexToRgba(colors.gray));
  }
}

function drawPin(canvas: Canvas, x: number, y: number): void {
  fillCircle(canvas, x, y - 18, 46, hexToRgba(colors.green));
  fillCircle(canvas, x, y - 18, 18, hexToRgba('#FFFFFF'));
  drawThickLine(canvas, x, y + 18, x, y + 60, 28, hexToRgba(colors.green));
}

function drawClock(canvas: Canvas, x: number, y: number): void {
  fillCircle(canvas, x, y, 56, hexToRgba(colors.orange));
  fillCircle(canvas, x, y, 42, hexToRgba('#FFFFFF'));
  drawThickLine(canvas, x, y, x, y - 27, 9, hexToRgba(colors.darkGray));
  drawThickLine(canvas, x, y, x + 26, y + 18, 9, hexToRgba(colors.darkGray));
}

function drawCheck(canvas: Canvas, x: number, y: number): void {
  fillCircle(canvas, x, y, 58, hexToRgba(colors.green));
  drawThickLine(canvas, x - 31, y + 1, x - 8, y + 25, 13, hexToRgba('#FFFFFF'));
  drawThickLine(canvas, x - 8, y + 25, x + 36, y - 30, 13, hexToRgba('#FFFFFF'));
}

function drawSupport(canvas: Canvas, x: number, y: number): void {
  fillCircle(canvas, x, y - 8, 49, hexToRgba(colors.green));
  fillRoundedRect(canvas, x - 50, y + 18, 100, 62, 20, hexToRgba(colors.green));
  fillCircle(canvas, x - 17, y - 16, 8, hexToRgba('#FFFFFF'));
  fillCircle(canvas, x + 17, y - 16, 8, hexToRgba('#FFFFFF'));
  fillRoundedRect(canvas, x - 24, y + 9, 48, 8, 4, hexToRgba('#FFFFFF'));
}

function drawWarehouse(canvas: Canvas, x: number, y: number): void {
  fillRoundedRect(canvas, x - 70, y + 20, 140, 72, 6, hexToRgba(colors.darkGray));
  fillRect(canvas, x - 52, y - 18, 104, 38, hexToRgba(colors.orange));
  drawThickLine(canvas, x - 58, y - 18, x, y - 58, 18, hexToRgba(colors.orange));
  drawThickLine(canvas, x, y - 58, x + 58, y - 18, 18, hexToRgba(colors.orange));
  fillRect(canvas, x - 46, y + 42, 28, 50, hexToRgba(colors.lightOrange));
  fillRect(canvas, x + 18, y + 42, 28, 50, hexToRgba(colors.lightOrange));
}

function drawRestaurant(canvas: Canvas, x: number, y: number): void {
  drawThickLine(canvas, x - 45, y - 46, x - 45, y + 76, 12, hexToRgba(colors.darkGray));
  drawThickLine(canvas, x - 72, y - 46, x - 20, y - 46, 12, hexToRgba(colors.darkGray));
  drawThickLine(canvas, x + 38, y - 42, x + 38, y + 76, 14, hexToRgba(colors.green));
  fillCircle(canvas, x + 38, y - 42, 28, hexToRgba(colors.green));
}

function drawCare(canvas: Canvas, x: number, y: number): void {
  fillCircle(canvas, x - 30, y - 8, 40, hexToRgba(colors.green));
  fillCircle(canvas, x + 30, y - 8, 40, hexToRgba(colors.orange));
  fillCircle(canvas, x, y + 27, 52, hexToRgba(colors.lightOrange));
}

function fillRect(canvas: Canvas, x: number, y: number, width: number, height: number, color: Rgba): void {
  const startX = Math.max(0, Math.floor(x));
  const startY = Math.max(0, Math.floor(y));
  const endX = Math.min(canvas.width, Math.ceil(x + width));
  const endY = Math.min(canvas.height, Math.ceil(y + height));

  for (let row = startY; row < endY; row += 1) {
    for (let col = startX; col < endX; col += 1) {
      setPixel(canvas, col, row, color);
    }
  }
}

function fillRoundedRect(canvas: Canvas, x: number, y: number, width: number, height: number, radius: number, color: Rgba): void {
  const startX = Math.max(0, Math.floor(x));
  const startY = Math.max(0, Math.floor(y));
  const endX = Math.min(canvas.width, Math.ceil(x + width));
  const endY = Math.min(canvas.height, Math.ceil(y + height));
  const r = Math.max(0, radius);

  for (let row = startY; row < endY; row += 1) {
    for (let col = startX; col < endX; col += 1) {
      const left = col < x + r;
      const right = col >= x + width - r;
      const top = row < y + r;
      const bottom = row >= y + height - r;

      if ((left || right) && (top || bottom)) {
        const cornerX = left ? x + r : x + width - r - 1;
        const cornerY = top ? y + r : y + height - r - 1;
        if (Math.hypot(col - cornerX, row - cornerY) > r) {
          continue;
        }
      }

      setPixel(canvas, col, row, color);
    }
  }
}

function fillCircle(canvas: Canvas, cx: number, cy: number, radius: number, color: Rgba): void {
  const startX = Math.max(0, Math.floor(cx - radius));
  const startY = Math.max(0, Math.floor(cy - radius));
  const endX = Math.min(canvas.width, Math.ceil(cx + radius));
  const endY = Math.min(canvas.height, Math.ceil(cy + radius));
  const r2 = radius * radius;

  for (let row = startY; row < endY; row += 1) {
    for (let col = startX; col < endX; col += 1) {
      const dx = col - cx;
      const dy = row - cy;
      if (dx * dx + dy * dy <= r2) {
        setPixel(canvas, col, row, color);
      }
    }
  }
}

function drawThickLine(
  canvas: Canvas,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  thickness: number,
  color: Rgba
): void {
  const radius = thickness / 2;
  const startX = Math.max(0, Math.floor(Math.min(x1, x2) - radius));
  const startY = Math.max(0, Math.floor(Math.min(y1, y2) - radius));
  const endX = Math.min(canvas.width, Math.ceil(Math.max(x1, x2) + radius));
  const endY = Math.min(canvas.height, Math.ceil(Math.max(y1, y2) + radius));
  const lineDx = x2 - x1;
  const lineDy = y2 - y1;
  const lengthSquared = lineDx * lineDx + lineDy * lineDy;

  for (let row = startY; row < endY; row += 1) {
    for (let col = startX; col < endX; col += 1) {
      const t = Math.max(0, Math.min(1, ((col - x1) * lineDx + (row - y1) * lineDy) / lengthSquared));
      const px = x1 + t * lineDx;
      const py = y1 + t * lineDy;
      if (Math.hypot(col - px, row - py) <= radius) {
        setPixel(canvas, col, row, color);
      }
    }
  }
}

function setPixel(canvas: Canvas, x: number, y: number, color: Rgba): void {
  const index = (y * canvas.width + x) * 4;
  const alpha = color[3] / 255;

  if (alpha >= 1) {
    canvas.pixels[index] = color[0];
    canvas.pixels[index + 1] = color[1];
    canvas.pixels[index + 2] = color[2];
    canvas.pixels[index + 3] = color[3];
    return;
  }

  const existingAlpha = canvas.pixels[index + 3] / 255;
  const outAlpha = alpha + existingAlpha * (1 - alpha);

  if (outAlpha === 0) {
    canvas.pixels[index] = 0;
    canvas.pixels[index + 1] = 0;
    canvas.pixels[index + 2] = 0;
    canvas.pixels[index + 3] = 0;
    return;
  }

  canvas.pixels[index] = Math.round((color[0] * alpha + canvas.pixels[index] * existingAlpha * (1 - alpha)) / outAlpha);
  canvas.pixels[index + 1] = Math.round((color[1] * alpha + canvas.pixels[index + 1] * existingAlpha * (1 - alpha)) / outAlpha);
  canvas.pixels[index + 2] = Math.round((color[2] * alpha + canvas.pixels[index + 2] * existingAlpha * (1 - alpha)) / outAlpha);
  canvas.pixels[index + 3] = Math.round(outAlpha * 255);
}

function encodePng(canvas: Canvas): Buffer {
  const rowLength = canvas.width * 4 + 1;
  const raw = Buffer.alloc(rowLength * canvas.height);

  for (let row = 0; row < canvas.height; row += 1) {
    const rawRowStart = row * rowLength;
    raw[rawRowStart] = 0;
    const sourceStart = row * canvas.width * 4;
    Buffer.from(canvas.pixels.subarray(sourceStart, sourceStart + canvas.width * 4)).copy(raw, rawRowStart + 1);
  }

  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(canvas.width, 0);
  ihdr.writeUInt32BE(canvas.height, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  return Buffer.concat([
    signature,
    pngChunk('IHDR', ihdr),
    pngChunk('IDAT', deflateSync(raw, { level: 9 })),
    pngChunk('IEND', Buffer.alloc(0))
  ]);
}

function pngChunk(type: string, data: Buffer): Buffer {
  const typeBuffer = Buffer.from(type, 'ascii');
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);

  const checksum = Buffer.alloc(4);
  checksum.writeUInt32BE(crc32(Buffer.concat([typeBuffer, data])), 0);

  return Buffer.concat([length, typeBuffer, data, checksum]);
}

const crcTable = new Uint32Array(256).map((_, index) => {
  let value = index;
  for (let bit = 0; bit < 8; bit += 1) {
    value = value & 1 ? 0xedb88320 ^ (value >>> 1) : value >>> 1;
  }
  return value >>> 0;
});

function crc32(buffer: Buffer): number {
  let value = 0xffffffff;

  for (const byte of buffer) {
    value = crcTable[(value ^ byte) & 0xff] ^ (value >>> 8);
  }

  return (value ^ 0xffffffff) >>> 0;
}

function hexToRgba(hex: string, alpha = 255): Rgba {
  const normalized = hex.replace('#', '');
  return [
    parseInt(normalized.slice(0, 2), 16),
    parseInt(normalized.slice(2, 4), 16),
    parseInt(normalized.slice(4, 6), 16),
    alpha
  ];
}

function rgba(red: number, green: number, blue: number, alpha: number): Rgba {
  return [red, green, blue, alpha];
}
