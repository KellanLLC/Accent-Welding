/**
 * Resizes a photo in the browser before upload: a full size for the detail
 * page and a thumbnail for the grid. Phones shoot 12 MP; nobody needs that on
 * a listing, and doing it here means the server never touches image bytes.
 * JPEG because every browser can encode it (Safari still cannot encode WebP
 * from a canvas), and EXIF orientation is honoured by the decoder.
 */
export type Resized = { full: Blob; thumb: Blob; width: number; height: number };

const FULL_MAX = 1600;
const THUMB_MAX = 640;

async function decode(file: File): Promise<ImageBitmap | HTMLImageElement> {
  if ('createImageBitmap' in window) {
    try {
      return await createImageBitmap(file, { imageOrientation: 'from-image' });
    } catch {
      /* fall through to the <img> path */
    }
  }
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('That file could not be read as an image.'));
    };
    img.src = url;
  });
}

function draw(src: ImageBitmap | HTMLImageElement, max: number, quality: number): Promise<{ blob: Blob; w: number; h: number }> {
  const sw = 'naturalWidth' in src ? src.naturalWidth : src.width;
  const sh = 'naturalHeight' in src ? src.naturalHeight : src.height;
  const scale = Math.min(1, max / Math.max(sw, sh));
  const w = Math.max(1, Math.round(sw * scale));
  const h = Math.max(1, Math.round(sh * scale));
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) return Promise.reject(new Error('Canvas is not available.'));
  ctx.drawImage(src, 0, 0, w, h);
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve({ blob, w, h }) : reject(new Error('Could not encode the photo.'))),
      'image/jpeg',
      quality,
    );
  });
}

export async function resizeImage(file: File): Promise<Resized> {
  const src = await decode(file);
  const full = await draw(src, FULL_MAX, 0.84);
  const thumb = await draw(src, THUMB_MAX, 0.8);
  if ('close' in src) src.close();
  return { full: full.blob, thumb: thumb.blob, width: full.w, height: full.h };
}
