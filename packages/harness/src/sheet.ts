import sharp from 'sharp';
import { SHEET_MODEL } from './models';

// Reading order of the cells, left to right, top to bottom.
export const VIEWS = [
  'front',
  'front_right',
  'right',
  'back_right',
  'back',
  'back_left',
  'left',
  'front_left',
  'top',
] as const;

export const SHEET_PROMPT = `Using the product in the reference photo, create a 3x3 turnaround sheet of this exact object.
Keep the same shape, proportions, materials, colour and every detail. Do not add, remove or redesign any part. Show the full object in every cell, centred, at the same scale, with a small margin.
Row 1: straight-on front view, front-right three-quarter view, right side view.
Row 2: back-right three-quarter view, straight-on back view, back-left three-quarter view.
Row 3: left side view, front-left three-quarter view, top-down view.
Plain pure white background, even soft studio light, no cast shadows. Nine equal square cells with no text, labels, grid lines or borders.`;

const MAX_USER_PROMPT = 500;

// The user's note is appended as guidance; it never replaces the turnaround instructions.
export function sheetPrompt(userPrompt?: string | null): string {
  const note = userPrompt?.trim().slice(0, MAX_USER_PROMPT);
  return note ? `${SHEET_PROMPT}\nAdditional notes about the object: ${note}` : SHEET_PROMPT;
}

export function sheetRequest(sourceUrl: string, userPrompt?: string | null) {
  return {
    path: SHEET_MODEL.path,
    body: {
      input: {
        prompt: sheetPrompt(userPrompt),
        image_input: [sourceUrl],
        aspect_ratio: '1:1',
        resolution: '2K',
        output_format: 'png',
      },
    },
  };
}

export function sheetOutputUrl(output: unknown): string | null {
  if (typeof output === 'string') return output;
  if (Array.isArray(output) && typeof output[0] === 'string') return output[0];
  return null;
}

// Insets each crop because the model sometimes draws faint lines between cells despite the prompt.
export async function cutCells(sheet: Uint8Array, inset = 8): Promise<Uint8Array[]> {
  const { width = 0, height = 0 } = await sharp(sheet).metadata();
  const cell = Math.floor(Math.min(width, height) / 3);
  if (cell <= inset * 2) throw new Error(`sheet too small to cut: ${width}x${height}`);
  return Promise.all(
    VIEWS.map(async (_view, index) => {
      const buffer = await sharp(sheet)
        .extract({
          left: (index % 3) * cell + inset,
          top: Math.floor(index / 3) * cell + inset,
          width: cell - inset * 2,
          height: cell - inset * 2,
        })
        .png()
        .toBuffer();
      return new Uint8Array(buffer);
    }),
  );
}
