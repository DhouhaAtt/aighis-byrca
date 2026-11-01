export interface RasterImage {
  canvas: HTMLCanvasElement;
  context: CanvasRenderingContext2D;
  imageData: ImageData;
  width: number;
  height: number;
  scale: number;
}

export const MAX_RECOLOR_DIMENSION = 1400;
export const MAX_SEGMENTATION_DIMENSION = 900;

export function createCanvas(width: number, height: number): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  return canvas;
}

export function loadImage(source: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.decoding = "async";
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Unable to load image"));
    image.src = source;
  });
}

export async function loadRaster(
  source: string,
  maxDimension = MAX_RECOLOR_DIMENSION
): Promise<RasterImage> {
  const image = await loadImage(source);
  const naturalWidth = image.naturalWidth || image.width;
  const naturalHeight = image.naturalHeight || image.height;
  if (!naturalWidth || !naturalHeight) {
    throw new Error("Image has no dimensions");
  }

  const scale = Math.min(1, maxDimension / Math.max(naturalWidth, naturalHeight));
  const width = Math.max(1, Math.round(naturalWidth * scale));
  const height = Math.max(1, Math.round(naturalHeight * scale));

  const canvas = createCanvas(width, height);
  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) throw new Error("Canvas is not available");

  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = "high";
  context.drawImage(image, 0, 0, width, height);
  return {
    canvas,
    context,
    imageData: context.getImageData(0, 0, width, height),
    width,
    height,
    scale,
  };
}

export async function loadMaskRaster(
  source: string,
  width: number,
  height: number
): Promise<Uint8ClampedArray> {
  const image = await loadImage(source);
  const sourceWidth = image.naturalWidth || image.width;
  const sourceHeight = image.naturalHeight || image.height;
  if (!sourceWidth || !sourceHeight) throw new Error("Mask has no dimensions");
  const sourceRatio = sourceWidth / sourceHeight;
  const targetRatio = width / height;
  if (Math.abs(sourceRatio - targetRatio) / targetRatio > 0.01) {
    throw new Error("Mask dimensions do not match the product image");
  }
  const canvas = createCanvas(width, height);
  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) throw new Error("Canvas is not available");

  context.clearRect(0, 0, width, height);
  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = "high";
  context.drawImage(image, 0, 0, width, height);
  const imageData = context.getImageData(0, 0, width, height);
  const data = imageData.data;

  // Segmentation providers commonly return either transparent white foreground
  // masks or opaque black/white masks. Treating alpha as coverage for both
  // formats turns an opaque black/white mask into an all-foreground mask.
  let alphaMin = 255;
  let alphaMax = 0;
  for (let i = 3; i < data.length; i += 4) {
    alphaMin = Math.min(alphaMin, data[i]);
    alphaMax = Math.max(alphaMax, data[i]);
  }
  if (alphaMin > 250 && alphaMax > 250) {
    for (let i = 0; i < data.length; i += 4) {
      data[i + 3] = Math.round(
        data[i] * 0.2126 + data[i + 1] * 0.7152 + data[i + 2] * 0.0722
      );
    }
  }
  return data;
}

export function imageDataToDataUrl(
  data: Uint8ClampedArray,
  width: number,
  height: number
): string {
  const canvas = createCanvas(width, height);
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Canvas is not available");
  const imageData = context.createImageData(width, height);
  imageData.data.set(data);
  context.putImageData(imageData, 0, 0);
  return canvas.toDataURL("image/png");
}

export function dataUrlToFile(dataUrl: string, filename: string): File {
  const [header, base64] = dataUrl.split(",");
  if (!base64) throw new Error("Invalid data URL");
  const mime = /data:([^;]+)/.exec(header)?.[1] || "image/png";
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new File([bytes], filename, { type: mime });
}

export async function uploadDataUrl(dataUrl: string, filename: string): Promise<string> {
  const formData = new FormData();
  formData.append("files", dataUrlToFile(dataUrl, filename));
  const response = await fetch("/api/upload", { method: "POST", body: formData });
  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new Error(body?.error || "Mask upload failed");
  }
  const data = (await response.json()) as { urls?: string[] };
  const url = data.urls?.[0];
  if (!url) throw new Error("Mask upload returned no URL");
  return url;
}
