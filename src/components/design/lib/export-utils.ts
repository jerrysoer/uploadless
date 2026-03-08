/** Convert a data URL to a Blob */
export function dataUrlToBlob(dataUrl: string): Blob {
  const [header, data] = dataUrl.split(",");
  const mime = header.match(/:(.*?);/)?.[1] || "image/png";
  const binary = atob(data);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new Blob([bytes], { type: mime });
}

/** Trigger a browser download for a Blob */
export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/** Export canvas data URL as a PDF using pdf-lib */
export async function exportAsPdf(
  dataUrl: string,
  width: number,
  height: number,
  filename: string,
) {
  const { PDFDocument } = await import("pdf-lib");
  const doc = await PDFDocument.create();

  const imageBytes = dataUrlToBlob(dataUrl);
  const arrayBuffer = await imageBytes.arrayBuffer();
  const pngImage = await doc.embedPng(new Uint8Array(arrayBuffer));

  const page = doc.addPage([width, height]);
  page.drawImage(pngImage, {
    x: 0,
    y: 0,
    width,
    height,
  });

  const pdfBytes = await doc.save();
  const pdfBlob = new Blob(
    [pdfBytes.buffer.slice(pdfBytes.byteOffset, pdfBytes.byteOffset + pdfBytes.byteLength) as ArrayBuffer],
    { type: "application/pdf" },
  );
  downloadBlob(pdfBlob, filename);
}
