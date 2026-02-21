import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const ColorConverter = () => {
  const [hex, setHex] = useState('#3B82F6');
  const [rgb, setRgb] = useState({ r: 59, g: 130, b: 246 });
  const [hsl, setHsl] = useState({ h: 217, s: 91, l: 60 });

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
      const hex = x.toString(16);
      return hex.length === 1 ? "0" + hex : hex;
    }).join('');
  };

  const rgbToHsl = (r, g, b) => {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;

    if (max === min) {
      h = s = 0;
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
        case g: h = ((b - r) / d + 2) / 6; break;
        case b: h = ((r - g) / d + 4) / 6; break;
        default: h = 0;
      }
    }

    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      l: Math.round(l * 100)
    };
  };

  const updateFromHex = (newHex) => {
    setHex(newHex);
    const rgbVal = hexToRgb(newHex);
    if (rgbVal) {
      setRgb(rgbVal);
      setHsl(rgbToHsl(rgbVal.r, rgbVal.g, rgbVal.b));
    }
  };

  const updateFromRgb = (r, g, b) => {
    setRgb({ r, g, b });
    setHex(rgbToHex(r, g, b));
    setHsl(rgbToHsl(r, g, b));
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Link to="/tools" className="text-blue-600 hover:text-blue-700 mb-6 inline-flex items-center gap-2">
          ← Retour aux outils
        </Link>
        
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">🌈 Convertisseur de couleurs</h1>
          <p className="text-gray-600">Convertissez entre HEX, RGB et HSL</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="mb-6">
            <div className="h-32 rounded-lg border border-gray-200" style={{ backgroundColor: hex }} />
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">HEX</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={hex}
                  onChange={(e) => updateFromHex(e.target.value)}
                  className="flex-1 px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={() => copyToClipboard(hex)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  📋
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">RGB</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  min="0"
                  max="255"
                  value={rgb.r}
                  onChange={(e) => updateFromRgb(parseInt(e.target.value) || 0, rgb.g, rgb.b)}
                  className="w-20 px-3 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="R"
                />
                <input
                  type="number"
                  min="0"
                  max="255"
                  value={rgb.g}
                  onChange={(e) => updateFromRgb(rgb.r, parseInt(e.target.value) || 0, rgb.b)}
                  className="w-20 px-3 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="G"
                />
                <input
                  type="number"
                  min="0"
                  max="255"
                  value={rgb.b}
                  onChange={(e) => updateFromRgb(rgb.r, rgb.g, parseInt(e.target.value) || 0)}
                  className="w-20 px-3 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="B"
                />
                <button
                  onClick={() => copyToClipboard(`rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  📋
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">HSL</label>
              <div className="flex gap-2 items-center">
                <div className="flex-1 px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 font-mono">
                  hsl({hsl.h}, {hsl.s}%, {hsl.l}%)
                </div>
                <button
                  onClick={() => copyToClipboard(`hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  📋
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ColorConverter;

