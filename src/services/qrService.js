import QRCode from 'qrcode';

export const generateQRCode = async (url) => {
  try {
    const qrCodeDataURL = await QRCode.toDataURL(url, {
      width: 300,
      margin: 2,
      color: {
        dark: '#2e7d32',
        light: '#FFFFFF'
      }
    });
    return qrCodeDataURL;
  } catch (err) {
    console.error('Error generating QR code:', err);
    throw err;
  }
};

export const downloadQRCode = (qrCodeDataURL, filename = 'offer-qr-code.png') => {
  const link = document.createElement('a');
  link.href = qrCodeDataURL;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};