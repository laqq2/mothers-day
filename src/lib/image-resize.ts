/** Client-only: resizes large images before upload. */
export async function resizeIfNeeded(file: File): Promise<File> {
  if (file.size <= 2 * 1024 * 1024) {
    return file;
  }

  const imageUrl = URL.createObjectURL(file);
  const image = new Image();
  image.src = imageUrl;

  await new Promise<void>((resolve, reject) => {
    image.onload = () => resolve();
    image.onerror = () => reject(new Error("Failed to read image for compression"));
  });

  const maxWidth = 1200;
  if (image.width <= maxWidth) {
    URL.revokeObjectURL(imageUrl);
    return file;
  }

  const scale = maxWidth / image.width;
  const canvas = document.createElement("canvas");
  canvas.width = maxWidth;
  canvas.height = Math.round(image.height * scale);

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    URL.revokeObjectURL(imageUrl);
    throw new Error("Canvas is unavailable for image resize");
  }

  ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, file.type || "image/jpeg", 0.82);
  });

  URL.revokeObjectURL(imageUrl);

  if (!blob) {
    throw new Error("Could not compress image");
  }

  return new File([blob], file.name, { type: blob.type || file.type });
}
