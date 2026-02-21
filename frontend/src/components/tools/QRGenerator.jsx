import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const QRGenerator = () => {
  const [text, setText] = useState('');
  const [size, setSize] = useState(256);
  const [fgColor, setFgColor] = useState('#000000');
  const [bgColor, setBgColor] = useState('#ffffff');
  const [qrCode, setQrCode] = useState('');

  useEffect(() => {
    // Load QRious library dynamically
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/qrious@4.0.2/dist/qrious.min.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const generateQR = () => {
    if (!text.trim()) {
      alert('Veuillez entrer du texte');
      return;
    }

    if (window.QRious) {
      const canvas = document.createElement('canvas');
      const qr = new window.QRious({
        element: canvas,
        value: text,
        size: size,
        foreground: fgColor,
        background: bgColor,
        level: 'M'
      });
      setQrCode(canvas.toDataURL('image/png'));
    }
  };

  const downloadQR = () => {
    if (!qrCode) return;
    const link = document.createElement('a');
    link.download = 'qrcode.png';
    link.href = qrCode;
    link.click();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Link to="/tools" className="text-blue-600 hover:text-blue-700 mb-6 inline-flex items-center gap-2">
          ← Retour aux outils
        </Link>

        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">📱 Générateur QR Code</h1>
          <p className="text-gray-600">Génère des QR codes à partir de texte ou URL</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Texte ou URL</label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows="4"
              placeholder="https://example.com ou votre texte..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Taille: {size}px</label>
              <input
                type="range"
                min="128"
                max="512"
                value={size}
                onChange={(e) => setSize(parseInt(e.target.value))}
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Couleur</label>
              <input
                type="color"
                value={fgColor}
                onChange={(e) => setFgColor(e.target.value)}
                className="w-full h-10 rounded cursor-pointer border border-gray-300"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Fond</label>
              <input
                type="color"
                value={bgColor}
                onChange={(e) => setBgColor(e.target.value)}
                className="w-full h-10 rounded cursor-pointer border border-gray-300"
              />
            </div>
          </div>

          <button
            onClick={generateQR}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            Générer QR Code
          </button>
        </div>

        {qrCode && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Votre QR Code</h3>
            <div className="bg-gray-50 p-6 rounded-lg inline-block mb-4 border border-gray-200">
              <img src={qrCode} alt="QR Code" className="max-w-full" />
            </div>
            <div>
              <button
                onClick={downloadQR}
                className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                📥 Télécharger PNG
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QRGenerator;

