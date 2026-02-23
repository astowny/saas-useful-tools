import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuota } from '../../hooks/useQuota';

const Base64Tool = () => {
  const { checkAndUseQuota, isChecking, quotaError } = useQuota();
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [mode, setMode] = useState('encode');

  const handleEncode = async () => {
    const result = await checkAndUseQuota('base64-tool', 'developer');
    if (!result.success) return;
    try {
      const encoded = btoa(unescape(encodeURIComponent(input)));
      setOutput(encoded);
    } catch (error) {
      alert('Erreur lors de l\'encodage');
    }
  };

  const handleDecode = async () => {
    const result = await checkAndUseQuota('base64-tool', 'developer');
    if (!result.success) return;
    try {
      const decoded = decodeURIComponent(escape(atob(input)));
      setOutput(decoded);
    } catch (error) {
      alert('Erreur lors du décodage. Vérifiez que le texte est bien encodé en Base64.');
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(output);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Link to="/tools" className="text-blue-600 hover:text-blue-700 mb-6 inline-flex items-center gap-2">
          ← Retour aux outils
        </Link>

        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">🔤 Base64 Encoder/Decoder</h1>
          <p className="text-gray-600">Encodez et décodez du texte en Base64</p>
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
              onClick={() => setMode('encode')}
              className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-colors ${
                mode === 'encode' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Encoder
            </button>
            <button
              onClick={() => setMode('decode')}
              className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-colors ${
                mode === 'decode' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Décoder
            </button>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {mode === 'encode' ? 'Texte à encoder' : 'Base64 à décoder'}
            </label>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows="6"
              placeholder={mode === 'encode' ? 'Entrez votre texte...' : 'Entrez le texte Base64...'}
            />
          </div>

          <button
            onClick={mode === 'encode' ? handleEncode : handleDecode}
            disabled={isChecking}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold py-3 px-6 rounded-lg transition-colors mb-4"
          >
            {isChecking ? 'Vérification...' : mode === 'encode' ? 'Encoder' : 'Décoder'}
          </button>

          {output && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">Résultat</label>
                <button
                  onClick={copyToClipboard}
                  className="text-blue-600 hover:text-blue-700 text-sm"
                >
                  📋 Copier
                </button>
              </div>
              <textarea
                value={output}
                readOnly
                className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 font-mono"
                rows="6"
              />
            </div>
          )}
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
          <h3 className="font-semibold text-blue-900 mb-2">💡 À propos de Base64</h3>
          <p className="text-sm text-blue-800">
            Base64 est un système d'encodage qui convertit des données binaires en texte ASCII.
            Utile pour transmettre des données dans des formats qui n'acceptent que du texte (emails, URLs, JSON, etc.).
          </p>
        </div>
      </div>
    </div>
  );
};

export default Base64Tool;

