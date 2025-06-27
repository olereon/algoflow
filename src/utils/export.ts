export async function exportToPng(svgElement: SVGSVGElement, scale: number = 2): Promise<void> {
  // Get SVG data
  const svgData = new XMLSerializer().serializeToString(svgElement);
  const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(svgBlob);

  // Create canvas
  const img = new Image();
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Failed to get canvas context');
  }

  return new Promise((resolve, reject) => {
    img.onload = () => {
      // Set canvas size
      canvas.width = svgElement.width.baseVal.value * scale;
      canvas.height = svgElement.height.baseVal.value * scale;

      // Set white background
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw image
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      // Convert to blob and download
      canvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error('Failed to create blob'));
          return;
        }

        const downloadUrl = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = `flowchart-${Date.now()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Cleanup
        URL.revokeObjectURL(url);
        URL.revokeObjectURL(downloadUrl);
        resolve();
      }, 'image/png');
    };

    img.onerror = () => {
      reject(new Error('Failed to load SVG'));
    };

    img.src = url;
  });
}