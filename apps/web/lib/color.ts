// glTF stores colour factors in linear RGB, while a colour picker speaks sRGB hex. These two
// functions are the only place the two meet.

export type Rgb = [number, number, number];

const toLinear = (channel: number) =>
  channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
const toSrgb = (channel: number) =>
  channel <= 0.0031308 ? channel * 12.92 : 1.055 * channel ** (1 / 2.4) - 0.055;

export function hexToLinear(hex: string): Rgb | null {
  const match = /^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(hex);
  if (!match) return null;
  return [1, 2, 3].map((group) => toLinear(Number.parseInt(match[group], 16) / 255)) as Rgb;
}

export function linearToHex([r, g, b]: Rgb): string {
  const byte = (channel: number) =>
    Math.round(Math.min(1, Math.max(0, toSrgb(channel))) * 255)
      .toString(16)
      .padStart(2, '0');
  return `#${byte(r)}${byte(g)}${byte(b)}`;
}
