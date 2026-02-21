import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const GradientGenerator = () => {
  const [color1, setColor1] = useState('#3B82F6');
  const [color2, setColor2] = useState('#8B5CF6');
  const [angle, setAngle] = useState(90);
  const [type, setType] = useState('linear');

  const getGradientCSS = () => {
    if (type === 'linear') {
      return `background: linear-gradient(${angle}deg, ${color1}, ${color2});`;
    } else {
      return `background: radial-gradient(circle, ${color1}, ${color2});`;
    }
  };

  const getGradientStyle = () => {
    if (type === 'linear') {
      return { background: `linear-gradient(${angle}deg, ${color1}, ${color2})` };
    } else {
      return { background: `radial-gradient(circle, ${color1}, ${color2})` };
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(getGradientCSS());
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Link to="/tools" className="text-blue-600 hover:text-blue-700 mb-6 inline-flex items-center gap-2">
          ← Retour aux outils
        </Link>
        
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">🌅 Générateur de dégradés</h1>
          <p className="text-gray-600">Créez des dégradés CSS personnalisés</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="mb-6">
            <div className="h-48 rounded-lg border border-gray-200" style={getGradientStyle()} />
          </div>

          <div className="space-y-4 mb-6">
            <div className="flex gap-4">
              <button
                onClick={() => setType('linear')}
                className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-colors ${
                  type === 'linear' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Linéaire
              </button>
              <button
                onClick={() => setType('radial')}
                className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-colors ${
                  type === 'radial' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Radial
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Couleur 1</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={color1}
                    onChange={(e) => setColor1(e.target.value)}
                    className="h-12 w-16 rounded cursor-pointer border border-gray-300"
                  />
                  <input
                    type="text"
                    value={color1}
                    onChange={(e) => setColor1(e.target.value)}
                    className="flex-1 px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Couleur 2</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={color2}
                    onChange={(e) => setColor2(e.target.value)}
                    className="h-12 w-16 rounded cursor-pointer border border-gray-300"
                  />
                  <input
                    type="text"
                    value={color2}
                    onChange={(e) => setColor2(e.target.value)}
                    className="flex-1 px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {type === 'linear' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Angle: {angle}°</label>
                <input
                  type="range"
                  min="0"
                  max="360"
                  value={angle}
                  onChange={(e) => setAngle(parseInt(e.target.value))}
                  className="w-full"
                />
              </div>
            )}
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">Code CSS</label>
              <button
                onClick={copyToClipboard}
                className="text-blue-600 hover:text-blue-700 text-sm"
              >
                📋 Copier
              </button>
            </div>
            <code className="text-sm text-gray-900 font-mono">{getGradientCSS()}</code>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GradientGenerator;

