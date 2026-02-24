import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuota } from '../../hooks/useQuota';

const HashGenerator = () => {
  const { t } = useTranslation();
  const { checkAndUseQuota, isChecking, quotaError } = useQuota();
  const [input, setInput] = useState('');
  const [hashes, setHashes] = useState({});

  const generateHash = async (algorithm, data) => {
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);
    const hashBuffer = await crypto.subtle.digest(algorithm, dataBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  };

  const handleGenerate = async () => {
    const result = await checkAndUseQuota('hash-generator', 'developer');
    if (!result.success) return;
    if (!input.trim()) {
      alert(t('toolPages.hash.emptyAlert'));
      return;
    }

    const results = {};
    results['SHA-1'] = await generateHash('SHA-1', input);
    results['SHA-256'] = await generateHash('SHA-256', input);
    results['SHA-384'] = await generateHash('SHA-384', input);
    results['SHA-512'] = await generateHash('SHA-512', input);
    
    setHashes(results);
  };

  const copyHash = (hash) => {
    navigator.clipboard.writeText(hash);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Link to="/tools" className="text-blue-600 hover:text-blue-700 mb-6 inline-flex items-center gap-2">
          {t('common.backToTools')}
        </Link>

        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">{t('toolPages.hash.title')}</h1>
          <p className="text-gray-600">{t('toolPages.hash.subtitle')}</p>
        </div>

        {quotaError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start gap-3">
              <span className="text-2xl">⛔</span>
              <div className="flex-1">
                <h3 className="font-semibold text-red-900 mb-1">{t('common.limitReached')}</h3>
                <p className="text-sm text-red-800">{quotaError.message}</p>
                {quotaError.type === 'NO_SUBSCRIPTION' && (
                  <Link to="/pricing" className="inline-block mt-2 text-sm font-semibold text-red-700 underline hover:text-red-600">
                    {t('common.viewPlans')}
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">{t('toolPages.hash.inputLabel')}</label>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows="4"
              placeholder={t('toolPages.hash.inputPlaceholder')}
            />
          </div>

          <button
            onClick={handleGenerate}
            disabled={isChecking}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            {isChecking ? t('common.verifying') : t('toolPages.hash.generateBtn')}
          </button>
        </div>

        {Object.keys(hashes).length > 0 && (
          <div className="space-y-4">
            {Object.entries(hashes).map(([algorithm, hash]) => (
              <div key={algorithm} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">{algorithm}</h3>
                  <button
                    onClick={() => copyHash(hash)}
                    className="text-blue-600 hover:text-blue-700 text-sm"
                  >
                    {t('common.copy')}
                  </button>
                </div>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <code className="text-sm text-gray-900 font-mono break-all">{hash}</code>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-xl p-6">
          <h3 className="font-semibold text-yellow-900 mb-2">{t('toolPages.hash.securityTitle')}</h3>
          <p className="text-sm text-yellow-800">
            {t('toolPages.hash.securityNote')}
          </p>
        </div>
      </div>
    </div>
  );
};

export default HashGenerator;

