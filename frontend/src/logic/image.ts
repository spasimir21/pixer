async function resizeAndCropImage(
  image: HTMLImageElement,
  background: string,
  size: { width: number; height: number }
) {
  const canvas = document.createElement('canvas');
  canvas.width = size.width;
  canvas.height = size.height;

  const ctx = canvas.getContext('2d')!;

  const widthRatio = size.width / image.naturalWidth;
  const heightRatio = size.height / image.naturalHeight;

  const ratio = widthRatio > heightRatio ? widthRatio : heightRatio;

  const scaledWidth = image.naturalWidth * ratio;
  const scaledHeight = image.naturalHeight * ratio;

  ctx.fillStyle = background;

  ctx.fillRect(0, 0, size.width, size.height);
  ctx.drawImage(image, -(scaledWidth - size.width) / 2, -(scaledHeight - size.height) / 2, scaledWidth, scaledHeight);

  const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/png'));

  return blob;
}

export { resizeAndCropImage };
