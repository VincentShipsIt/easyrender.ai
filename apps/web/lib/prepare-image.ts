const MAX_SIDE = 2048;

// Downscales on the client so uploads stay under the 4 MB request limit. Its error is shown as is,
// so callers pass the message in the visitor's language.
export async function prepare(file: File, unreadable = 'Could not read this photo'): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext('2d')?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  return new Promise((resolve, reject) =>
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error(unreadable))),
      'image/jpeg',
      0.9,
    ),
  );
}
