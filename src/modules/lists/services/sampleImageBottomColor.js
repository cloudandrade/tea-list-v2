'use client';

/**
 * Amostra a cor média da faixa inferior de uma imagem (data URL ou URL).
 * Usado para criar o fade do hero da lista pública.
 */
export function sampleImageBottomColor(imageUrl, {
  stripRatio = 0.14,
  fallback = '#fff8f5',
} = {}) {
  if (!imageUrl || typeof window === 'undefined') {
    return Promise.resolve(fallback);
  }

  return new Promise((resolve) => {
    const image = new window.Image();

    if (!String(imageUrl).startsWith('data:')) {
      image.crossOrigin = 'anonymous';
    }

    image.onload = () => {
      try {
        const sourceWidth = image.naturalWidth || image.width;
        const sourceHeight = image.naturalHeight || image.height;

        if (!sourceWidth || !sourceHeight) {
          resolve(fallback);
          return;
        }

        const maxSide = 240;
        const scale = Math.min(maxSide / sourceWidth, maxSide / sourceHeight, 1);
        const width = Math.max(1, Math.round(sourceWidth * scale));
        const height = Math.max(1, Math.round(sourceHeight * scale));
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d', { willReadFrequently: true });

        if (!context) {
          resolve(fallback);
          return;
        }

        canvas.width = width;
        canvas.height = height;
        context.drawImage(image, 0, 0, width, height);

        const stripHeight = Math.max(1, Math.round(height * stripRatio));
        const pixels = context.getImageData(0, height - stripHeight, width, stripHeight).data;
        let red = 0;
        let green = 0;
        let blue = 0;
        let count = 0;

        for (let index = 0; index < pixels.length; index += 4) {
          if (pixels[index + 3] < 40) {
            continue;
          }

          red += pixels[index];
          green += pixels[index + 1];
          blue += pixels[index + 2];
          count += 1;
        }

        if (!count) {
          resolve(fallback);
          return;
        }

        resolve(
          `rgb(${Math.round(red / count)}, ${Math.round(green / count)}, ${Math.round(blue / count)})`,
        );
      } catch {
        resolve(fallback);
      }
    };

    image.onerror = () => resolve(fallback);
    image.src = String(imageUrl);
  });
}
