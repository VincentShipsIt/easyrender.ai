import sharp from 'sharp';

// The free preview is the sheet, downscaled and tiled with a watermark, so the unpaid
// image is never good enough to feed a 3D model elsewhere.
export async function watermark(
  image: Uint8Array,
  text = 'easyrender.ai preview',
): Promise<Uint8Array> {
  const resized = await sharp(image).resize(1024, 1024, { fit: 'inside' }).toBuffer();
  const { width = 1024, height = 1024 } = await sharp(resized).metadata();
  const marks = Array.from({ length: 8 }, (_, row) =>
    Array.from({ length: 4 }, (_, col) => {
      const x = col * 300 + (row % 2) * 150 - 60;
      const y = row * 140 + 60;
      return `<text x="${x}" y="${y}" transform="rotate(-24 ${x} ${y})">${text}</text>`;
    }).join(''),
  ).join('');
  const overlay = Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}"><style>text{font:600 28px sans-serif;fill:rgba(24,24,27,0.28)}</style>${marks}</svg>`,
  );
  const output = await sharp(resized)
    .composite([{ input: overlay, top: 0, left: 0 }])
    .webp({ quality: 72 })
    .toBuffer();
  return new Uint8Array(output);
}
