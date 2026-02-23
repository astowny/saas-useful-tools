import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuota } from '../../hooks/useQuota';

const Minifier = () => {
  const { checkAndUseQuota, isChecking, quotaError } = useQuota();
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [mode, setMode] = useState('css');
  const [stats, setStats] = useState(null);

  const minifyCSS = (css) => {
    return css
      .replace(/\/\*[\s\S]*?\*\//g, '') // Remove comments
      .replace(/\s+/g, ' ') // Replace multiple spaces with single space
      .replace(/\s*{\s*/g, '{') // Remove spaces around {
      .replace(/\s*}\s*/g, '}') // Remove spaces around }
      .replace(/\s*:\s*/g, ':') // Remove spaces around :
      .replace(/\s*;\s*/g, ';') // Remove spaces around ;
      .replace(/;}/g, '}') // Remove last semicolon
      .trim();
  };

  const minifyJS = (js) => {
    return js
      .replace(/\/\*[\s\S]*?\*\//g, '') // Remove multi-line comments
      .replace(/\/\/.*/g, '') // Remove single-line comments
      .replace(/\s+/g, ' ') // Replace multiple spaces with single space
      .replace(/\s*([{}();,:])\s*/g, '$1') // Remove spaces around operators
      .trim();
  };

  const handleMinify = async () => {
    const result = await checkAndUseQuota('minifier', 'developer');
    if (!result.success) return;
    const minified = mode === 'css' ? minifyCSS(input) : minifyJS(input);
    setOutput(minified);
    
    const originalSize = new Blob([input]).size;
    const minifiedSize = new Blob([minified]).size;
    const reduction = ((originalSize - minifiedSize) / originalSize * 100).toFixed(2);
    
    setStats({
      original: originalSize,
      minified: minifiedSize,
      reduction: reduction
    });
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(output);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <Link to="/tools" className="text-blue-600 hover:text-blue-700 mb-6 inline-flex items-center gap-2">
          ← Retour aux outils
        </Link>
        
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">📦 Minifieur CSS/JS</h1>
          <p className="text-gray-600">Compresse votre code CSS ou JavaScript</p>
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
          <div className="flex gap-4 mb-6">
            <button
              onClick={() => setMode('css')}
              className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-colors ${
                mode === 'css' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              CSS
            </button>
            <button
              onClick={() => setMode('js')}
              className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-colors ${
                mode === 'js' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              JavaScript
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Code original</label>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows="15"
                placeholder={mode === 'css' ? '.class {\n  color: red;\n  margin: 10px;\n}' : 'function hello() {\n  console.log("Hello");\n}'}
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">Code minifié</label>
                {output && (
                  <button
                    onClick={copyToClipboard}
                    className="text-blue-600 hover:text-blue-700 text-sm"
                  >
                    📋 Copier
                  </button>
                )}
              </div>
              <textarea
                value={output}
                readOnly
                className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 font-mono text-sm"
                rows="15"
              />
            </div>
          </div>

          <button
            onClick={handleMinify}
            disabled={isChecking}
            className="w-full mt-6 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            {isChecking ? 'Vérification...' : 'Minifier'}
          </button>

          {stats && (
            <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <h3 className="font-semibold text-green-900 mb-2">📊 Statistiques</h3>
              <div className="grid grid-cols-3 gap-4 text-sm text-green-800">
                <div>
                  <div className="font-medium">Taille originale</div>
                  <div className="text-lg font-bold">{stats.original} octets</div>
                </div>
                <div>
                  <div className="font-medium">Taille minifiée</div>
                  <div className="text-lg font-bold">{stats.minified} octets</div>
                </div>
                <div>
                  <div className="font-medium">Réduction</div>
                  <div className="text-lg font-bold">{stats.reduction}%</div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
          <h3 className="font-semibold text-yellow-900 mb-2">⚠️ Note importante</h3>
          <p className="text-sm text-yellow-800">
            Ce minifieur est basique et convient pour des tests rapides. Pour la production, utilisez des outils professionnels comme UglifyJS, Terser (JS) ou cssnano (CSS).
          </p>
        </div>
      </div>
    </div>
  );
};

export default Minifier;

