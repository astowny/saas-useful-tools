import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuota } from '../../hooks/useQuota';

const JwtDecoder = () => {
  const { checkAndUseQuota, isChecking, quotaError: quotaErr } = useQuota();
  const [jwt, setJwt] = useState('');
  const [decoded, setDecoded] = useState(null);
  const [error, setError] = useState('');

  const decodeJWT = async () => {
    const result = await checkAndUseQuota('jwt-decoder', 'developer');
    if (!result.success) return;
    try {
      setError('');
      const parts = jwt.split('.');
      
      if (parts.length !== 3) {
        throw new Error('JWT invalide - doit contenir 3 parties séparées par des points');
      }

      const header = JSON.parse(atob(parts[0]));
      const payload = JSON.parse(atob(parts[1]));
      
      setDecoded({
        header,
        payload,
        signature: parts[2]
      });
    } catch (err) {
      setError(err.message);
      setDecoded(null);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(JSON.stringify(text, null, 2));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Link to="/tools" className="text-blue-600 hover:text-blue-700 mb-6 inline-flex items-center gap-2">
          ← Retour aux outils
        </Link>
        
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">🔓 JWT Decoder</h1>
          <p className="text-gray-600">Décodez et inspectez les JSON Web Tokens</p>
        </div>

        {quotaErr && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start gap-3">
              <span className="text-2xl">⛔</span>
              <div className="flex-1">
                <h3 className="font-semibold text-red-900 mb-1">Limite atteinte</h3>
                <p className="text-sm text-red-800">{quotaErr.message}</p>
                {quotaErr.type === 'NO_SUBSCRIPTION' && (
                  <Link to="/pricing" className="inline-block mt-2 text-sm font-semibold text-red-700 underline hover:text-red-600">
                    Voir les plans disponibles →
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">JWT Token</label>
            <textarea
              value={jwt}
              onChange={(e) => setJwt(e.target.value)}
              className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows="4"
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
            />
          </div>

          <button
            onClick={decodeJWT}
            disabled={isChecking}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            {isChecking ? 'Vérification...' : 'Décoder JWT'}
          </button>

          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}
        </div>

        {decoded && (
          <div className="space-y-4">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Header</h3>
                <button
                  onClick={() => copyToClipboard(decoded.header)}
                  className="text-blue-600 hover:text-blue-700 text-sm"
                >
                  📋 Copier
                </button>
              </div>
              <pre className="bg-gray-50 border border-gray-200 rounded-lg p-4 overflow-x-auto">
                <code className="text-sm text-gray-900">{JSON.stringify(decoded.header, null, 2)}</code>
              </pre>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Payload</h3>
                <button
                  onClick={() => copyToClipboard(decoded.payload)}
                  className="text-blue-600 hover:text-blue-700 text-sm"
                >
                  📋 Copier
                </button>
              </div>
              <pre className="bg-gray-50 border border-gray-200 rounded-lg p-4 overflow-x-auto">
                <code className="text-sm text-gray-900">{JSON.stringify(decoded.payload, null, 2)}</code>
              </pre>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Signature</h3>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <code className="text-sm text-gray-900 font-mono break-all">{decoded.signature}</code>
              </div>
            </div>
          </div>
        )}

        <div className="mt-6 bg-red-50 border border-red-200 rounded-xl p-6">
          <h3 className="font-semibold text-red-900 mb-2">⚠️ Avertissement de sécurité</h3>
          <p className="text-sm text-red-800">
            Cet outil décode uniquement le JWT. Il ne vérifie PAS la signature. Ne partagez jamais vos tokens JWT publiquement car ils peuvent contenir des informations sensibles.
          </p>
        </div>
      </div>
    </div>
  );
};

export default JwtDecoder;

