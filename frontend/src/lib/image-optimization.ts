export type ImageOptimizationOptions = {
  maxWidth: number;
  maxHeight: number;
  quality: number;
  preferredMimeType: 'image/webp' | 'image/jpeg';
};

export type ImageOptimizationResult = {
  file: File;
  optimized: boolean;
  originalSizeBytes: number;
  optimizedSizeBytes: number;
};

const DEFAULT_OPTIONS: ImageOptimizationOptions = {
  maxWidth: 1600,
  maxHeight: 1600,
  quality: 0.8,
  preferredMimeType: 'image/webp',
};

function getScaledDimensions(
  width: number,
  height: number,
  maxWidth: number,
  maxHeight: number,
): { width: number; height: number } {
  const scale = Math.min(1, maxWidth / width, maxHeight / height);

  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale)),
  };
}

function toCanvasBlob(canvas: HTMLCanvasElement, mimeType: string, quality: number): Promise<Blob | null> {
  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      resolve(blob);
    }, mimeType, quality);
  });
}

function toOptimizedFileName(originalName: string, mimeType: string): string {
  const dotIndex = originalName.lastIndexOf('.');
  const baseName = dotIndex > 0 ? originalName.slice(0, dotIndex) : originalName;

  if (mimeType === 'image/webp') {
    return `${baseName}.webp`;
  }

  if (mimeType === 'image/jpeg') {
    return `${baseName}.jpg`;
  }

  return originalName;
}

async function loadImageBitmap(file: File): Promise<ImageBitmap> {
  if (typeof createImageBitmap === 'function') {
    try {
      return await createImageBitmap(file);
    } catch {
      // Continue with image element fallback.
    }
  }

  const objectUrl = URL.createObjectURL(file);

  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const nextImage = new Image();
      nextImage.onload = () => resolve(nextImage);
      nextImage.onerror = () => reject(new Error('Unable to load image for optimization.'));
      nextImage.src = objectUrl;
    });

    const canvas = document.createElement('canvas');
    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;

    const context = canvas.getContext('2d');
    if (!context) {
      throw new Error('Unable to initialize image optimization context.');
    }

    context.drawImage(image, 0, 0);

    return await createImageBitmap(canvas);
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

export async function optimizeImageForUpload(
  file: File,
  options: Partial<ImageOptimizationOptions> = {},
): Promise<ImageOptimizationResult> {
  const mergedOptions: ImageOptimizationOptions = {
    ...DEFAULT_OPTIONS,
    ...options,
  };

  if (!file.type.startsWith('image/')) {
    return {
      file,
      optimized: false,
      originalSizeBytes: file.size,
      optimizedSizeBytes: file.size,
    };
  }

  const imageBitmap = await loadImageBitmap(file);

  try {
    const target = getScaledDimensions(
      imageBitmap.width,
      imageBitmap.height,
      mergedOptions.maxWidth,
      mergedOptions.maxHeight,
    );

    const canvas = document.createElement('canvas');
    canvas.width = target.width;
    canvas.height = target.height;

    const context = canvas.getContext('2d');
    if (!context) {
      return {
        file,
        optimized: false,
        originalSizeBytes: file.size,
        optimizedSizeBytes: file.size,
      };
    }

    context.drawImage(imageBitmap, 0, 0, target.width, target.height);

    let outputType = mergedOptions.preferredMimeType;
    let blob = await toCanvasBlob(canvas, outputType, mergedOptions.quality);

    if (!blob) {
      outputType = 'image/jpeg';
      blob = await toCanvasBlob(canvas, outputType, mergedOptions.quality);
    }

    if (!blob) {
      return {
        file,
        optimized: false,
        originalSizeBytes: file.size,
        optimizedSizeBytes: file.size,
      };
    }

    if (blob.size >= file.size) {
      return {
        file,
        optimized: false,
        originalSizeBytes: file.size,
        optimizedSizeBytes: file.size,
      };
    }

    const optimizedFile = new File([blob], toOptimizedFileName(file.name, outputType), {
      type: outputType,
      lastModified: Date.now(),
    });

    return {
      file: optimizedFile,
      optimized: true,
      originalSizeBytes: file.size,
      optimizedSizeBytes: optimizedFile.size,
    };
  } finally {
    imageBitmap.close();
  }
}

export function createImagePreviewUrl(file: File): string {
  return URL.createObjectURL(file);
}
