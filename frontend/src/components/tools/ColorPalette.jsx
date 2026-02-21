import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const ColorPalette = () => {
  const [baseColor, setBaseColor] = useState('#3B82F6');
  const [palette, setPalette] = useState([]);

  const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  };

  const rgbToHex = (r, g, b) => {
    return "#" + [r, g, b].map(x => {
      const hex = Math.round(x).toString(16);
      return hex.length === 1 ? "0" + hex : hex;
    }).join('');
  };

  const generateMonochromatic = () => {
    const rgb = hexToRgb(baseColor);
    const colors = [];
    for (let i = 0; i < 5; i++) {
      const factor = 0.3 + (i * 0.175);
      colors.push(rgbToHex(rgb.r * factor, rgb.g * factor, rgb.b * factor));
    }
    setPalette(colors);
  };

  const generateComplementary = () => {
    const rgb = hexToRgb(baseColor);
    setPalette([
      baseColor,
      rgbToHex(255 - rgb.r, 255 - rgb.g, 255 - rgb.b)
    ]);
  };

  const generateAnalogous = () => {
    const rgb = hexToRgb(baseColor);
    setPalette([
      rgbToHex(rgb.r, rgb.g * 0.8, rgb.b * 1.2),
      baseColor,
      rgbToHex(rgb.r * 1.2, rgb.g, rgb.b * 0.8)
    ]);
  };

  const generateTriadic = () => {
    const rgb = hexToRgb(baseColor);
    setPalette([
      baseColor,
      rgbToHex(rgb.b, rgb.r, rgb.g),
      rgbToHex(rgb.g, rgb.b, rgb.r)
    ]);
  };

  const copyColor = (color) => {
    navigator.clipboard.writeText(color);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Link to="/tools" className="text-blue-600 hover:text-blue-700 mb-6 inline-flex items-center gap-2">
          ← Retour aux outils
        </Link>
        
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">🎨 Générateur de palettes</h1>
          <p className="text-gray-600">Créez des palettes de couleurs harmonieuses</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Couleur de base</label>
            <div className="flex gap-4">
              <input
                type="color"
                value={baseColor}
                onChange={(e) => setBaseColor(e.target.value)}
                className="h-12 w-20 rounded cursor-pointer border border-gray-300"
              />
              <input
                type="text"
                value={baseColor}
                onChange={(e) => setBaseColor(e.target.value)}
                className="flex-1 px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="#3B82F6"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <button
              onClick={generateMonochromatic}
              className="py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
            >
              Monochromatique
            </button>
            <button
              onClick={generateComplementary}
              className="py-3 px-4 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-colors"
            >
              Complémentaire
            </button>
            <button
              onClick={generateAnalogous}
              className="py-3 px-4 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors"
            >
              Analogue
            </button>
            <button
              onClick={generateTriadic}
              className="py-3 px-4 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-lg transition-colors"
            >
              Triadique
            </button>
          </div>
        </div>

        {palette.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Votre palette</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {palette.map((color, index) => (
                <div key={index} className="text-center">
                  <div
                    className="h-24 rounded-lg mb-2 cursor-pointer border border-gray-200 hover:scale-105 transition-transform"
                    style={{ backgroundColor: color }}
                    onClick={() => copyColor(color)}
                    title="Cliquer pour copier"
                  />
                  <div className="text-sm font-mono text-gray-700">{color}</div>
                  <button
                    onClick={() => copyColor(color)}
                    className="text-xs text-blue-600 hover:text-blue-700 mt-1"
                  >
                    Copier
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ColorPalette;

