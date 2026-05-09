/**
 * Client-only: only resizes truly oversized images before upload.
 * Goal: preserve as much quality as possible while keeping uploads sane.
 *
 * - Files <= 6MB are uploaded untouched (no re-encoding).
 * - Larger files are downscaled to a max width of 2400px and encoded at 0.95 quality.
 */
export async function resizeIfNeeded(file: File): Promise<File> {
  const SIZE_THRESHOLD_BYTES = 6 * 1024 * 1024;
  const MAX_WIDTH = 2400;
  const QUALITY = 0.95;

  if (file.size <= SIZE_THRESHOLD_BYTES) {
    return file;
  }

  const imageUrl = URL.createObjectURL(file);
  const image = new Image();
  image.src = imageUrl;

  await new Promise<void>((resolve, reject) => {
    image.onload = () => resolve();
    image.onerror = () => reject(new Error("Failed to read image for compression"));
  });

  if (image.width <= MAX_WIDTH) {
    URL.revokeObjectURL(imageUrl);
    return file;
  }

  const scale = MAX_WIDTH / image.width;
  const canvas = document.createElement("canvas");
  canvas.width = MAX_WIDTH;
  canvas.height = Math.round(image.height * scale);

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    URL.revokeObjectURL(imageUrl);
    throw new Error("Canvas is unavailable for image resize");
  }

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

  const outputType = file.type === "image/png" ? "image/jpeg" : file.type || "image/jpeg";

  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, outputType, QUALITY);
  });

  URL.revokeObjectURL(imageUrl);

  if (!blob) {
    throw new Error("Could not compress image");
  }

  return new File([blob], file.name, { type: blob.type || outputType });
}
