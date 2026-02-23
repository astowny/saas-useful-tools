import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useQuota } from '../../hooks/useQuota';

const FaviconGenerator = () => {
  const { checkAndUseQuota, isChecking, quotaError } = useQuota();
  const [text, setText] = useState('A');
  const [bgColor, setBgColor] = useState('#3B82F6');
  const [textColor, setTextColor] = useState('#FFFFFF');
  const [fontSize, setFontSize] = useState(32);
  const [favicon, setFavicon] = useState('');
  const canvasRef = useRef(null);

  const generateFavicon = async () => {
    const result = await checkAndUseQuota('favicon-generator', 'design');
    if (!result.success) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Clear canvas
    ctx.clearRect(0, 0, 64, 64);
    
    // Draw background
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, 64, 64);
    
    // Draw text
    ctx.fillStyle = textColor;
    ctx.font = `bold ${fontSize}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text.charAt(0).toUpperCase(), 32, 32);
    
    // Convert to data URL
    setFavicon(canvas.toDataURL('image/png'));
  };

  const downloadFavicon = () => {
    if (!favicon) return;
    const link = document.createElement('a');
    link.download = 'favicon.png';
    link.href = favicon;
    link.click();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Link to="/tools" className="text-blue-600 hover:text-blue-700 mb-6 inline-flex items-center gap-2">
          ← Retour aux outils
        </Link>
        
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">🖼️ Générateur de Favicon</h1>
          <p className="text-gray-600">Créez un favicon simple avec une lettre</p>
        </div>

        {quotaError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start gap-3">
              <span className="text-2xl">⛔</span>
              <div className="flex-1">
                <h3 className="font-semibold text-red-900 mb-1">Limite atteinte</h3>
                <p className="text-sm text-red-800">{quotaError.message}</p>
                {quotaError.type === 'NO_SUBSCRIPTION' && (
                  <Link to="/pricing" className="inline-block mt-2 text-sm font-semibold text-red-700 underline hover:text-red-600">
                    Voir les plans disponibles →
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <canvas ref={canvasRef} width="64" height="64" className="hidden" />
          
          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Lettre ou Emoji</label>
              <input
                type="text"
                maxLength="2"
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 text-center text-2xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="A"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Couleur de fond</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                    className="h-12 w-16 rounded cursor-pointer border border-gray-300"
                  />
                  <input
                    type="text"
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                    className="flex-1 px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Couleur du texte</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={textColor}
                    onChange={(e) => setTextColor(e.target.value)}
                    className="h-12 w-16 rounded cursor-pointer border border-gray-300"
                  />
                  <input
                    type="text"
                    value={textColor}
                    onChange={(e) => setTextColor(e.target.value)}
                    className="flex-1 px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Taille du texte: {fontSize}px</label>
              <input
                type="range"
                min="16"
                max="48"
                value={fontSize}
                onChange={(e) => setFontSize(parseInt(e.target.value))}
                className="w-full"
              />
            </div>
          </div>

          <button
            onClick={generateFavicon}
            disabled={isChecking}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold py-3 px-6 rounded-lg transition-colors mb-6"
          >
            {isChecking ? 'Vérification...' : 'Générer Favicon'}
          </button>

          {favicon && (
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Aperçu</h3>
              <div className="inline-block p-6 bg-gray-100 rounded-lg mb-4">
                <img src={favicon} alt="Favicon" className="w-16 h-16" />
              </div>
              <div>
                <button
                  onClick={downloadFavicon}
                  className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                >
                  📥 Télécharger (64x64)
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FaviconGenerator;

