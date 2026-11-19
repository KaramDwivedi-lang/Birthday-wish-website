import QRCode from 'qrcode';

export async function generateQrPngDataUrl(targetUrl: string): Promise<string> {
  if (!targetUrl || !targetUrl.trim()) {
    throw new Error('Cannot generate a QR code for an empty link.');
  }

  return QRCode.toDataURL(targetUrl.trim(), {
    type: 'image/png',
    width: 560,
    margin: 4,
    errorCorrectionLevel: 'M',
    color: {
      dark: '#0f172a',
      light: '#ffffff',
    },
  });
}
