import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useQuota } from '../../hooks/useQuota';

const BoxShadow = () => {
  const { checkAndUseQuota, quotaError } = useQuota();
  const quotaChecked = useRef(false);
  const [horizontal, setHorizontal] = useState(0);
  const [vertical, setVertical] = useState(4);
  const [blur, setBlur] = useState(6);
  const [spread, setSpread] = useState(0);
  const [opacity, setOpacity] = useState(0.1);
  const [inset, setInset] = useState(false);

  const getShadowCSS = () => {
    const rgba = `rgba(0, 0, 0, ${opacity})`;
    return `box-shadow: ${inset ? 'inset ' : ''}${horizontal}px ${vertical}px ${blur}px ${spread}px ${rgba};`;
  };

  const getShadowStyle = () => {
    const rgba = `rgba(0, 0, 0, ${opacity})`;
    return {
      boxShadow: `${inset ? 'inset ' : ''}${horizontal}px ${vertical}px ${blur}px ${spread}px ${rgba}`
    };
  };

  useEffect(() => {
    if (!quotaChecked.current) {
      quotaChecked.current = true;
      checkAndUseQuota('box-shadow', 'design');
    }
  }, [checkAndUseQuota]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(getShadowCSS());
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Link to="/tools" className="text-blue-600 hover:text-blue-700 mb-6 inline-flex items-center gap-2">
          ← Retour aux outils
        </Link>

        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">📦 Box Shadow Generator</h1>
          <p className="text-gray-600">Créez des ombres CSS personnalisées</p>
        </div>

        {quotaError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start gap-3">
              <span className="text-2xl">⛔</span>
              <div className="flex-1">
                <h3 className="font-semibold text-red-900 mb-1">Limite atteinte</h3>
                <p className="text-sm text-red-800">{quotaError.message}</p>
                <Link to="/pricing" className="inline-block mt-2 text-sm font-semibold text-red-700 underline hover:text-red-600">
                  Voir les plans →
                </Link>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="mb-8 flex items-center justify-center p-12 bg-gray-100 rounded-lg">
            <div
              className="w-48 h-48 bg-white rounded-lg"
              style={getShadowStyle()}
            />
          </div>

          <div className="space-y-4 mb-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Horizontal: {horizontal}px
                </label>
                <input
                  type="range"
                  min="-50"
                  max="50"
                  value={horizontal}
                  onChange={(e) => setHorizontal(parseInt(e.target.value))}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Vertical: {vertical}px
                </label>
                <input
                  type="range"
                  min="-50"
                  max="50"
                  value={vertical}
                  onChange={(e) => setVertical(parseInt(e.target.value))}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Blur: {blur}px
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={blur}
                  onChange={(e) => setBlur(parseInt(e.target.value))}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Spread: {spread}px
                </label>
                <input
                  type="range"
                  min="-50"
                  max="50"
                  value={spread}
                  onChange={(e) => setSpread(parseInt(e.target.value))}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Opacité: {opacity}
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={opacity}
                  onChange={(e) => setOpacity(parseFloat(e.target.value))}
                  className="w-full"
                />
              </div>

              <div className="flex items-end">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={inset}
                    onChange={(e) => setInset(e.target.checked)}
                    className="w-5 h-5 mr-2 text-blue-600"
                  />
                  <span className="text-gray-700">Inset</span>
                </label>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">Code CSS</label>
              <button
                onClick={copyToClipboard}
                className="text-blue-600 hover:text-blue-700 text-sm"
              >
                📋 Copier
              </button>
            </div>
            <code className="text-sm text-gray-900 font-mono">{getShadowCSS()}</code>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BoxShadow;

