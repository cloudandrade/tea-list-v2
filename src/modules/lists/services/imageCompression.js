'use client';

export function compressImageFile(file, { maxWidth = 1280, maxHeight = 720, quality = 0.72 } = {}) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onerror = () => reject(new Error('Não foi possível ler a imagem.'));
    reader.onload = () => {
      const image = new Image();

      image.onerror = () => reject(new Error('Não foi possível processar a imagem.'));
      image.onload = () => {
        const scale = Math.min(maxWidth / image.width, maxHeight / image.height, 1);
        const width = Math.round(image.width * scale);
        const height = Math.round(image.height * scale);
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');

        canvas.width = width;
        canvas.height = height;
        context.drawImage(image, 0, 0, width, height);

        resolve(canvas.toDataURL('image/webp', quality));
      };

      image.src = String(reader.result || '');
    };

    reader.readAsDataURL(file);
  });
}
