import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from 'react-i18next';

const ApiKeysPage = () => {
  const { token } = useAuth();
  const { t } = useTranslation();
  const API = process.env.REACT_APP_API_URL;

  const [keys, setKeys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [name, setName] = useState('');
  const [generating, setGenerating] = useState(false);
  const [newKey, setNewKey] = useState(null); // full key shown once
  const [copied, setCopied] = useState(false);

  const headers = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };

  const fetchKeys = useCallback(async () => {
    try {
      const res = await fetch(`${API}/api/enterprise/api-keys`, { headers });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error?.message); }
      const data = await res.json();
      setKeys(data.keys || []);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }, [token]); // eslint-disable-line

  useEffect(() => { fetchKeys(); }, [fetchKeys]);

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setGenerating(true);
    setError('');
    try {
      const res = await fetch(`${API}/api/enterprise/api-keys`, {
        method: 'POST', headers,
        body: JSON.stringify({ name: name.trim() })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message);
      setNewKey(data.full_key);
      setName('');
      fetchKeys();
    } catch (err) { setError(err.message); }
    finally { setGenerating(false); }
  };

  const handleRevoke = async (id) => {
    if (!window.confirm(t('enterprise.apiKeys.revokeConfirm'))) return;
    try {
      const res = await fetch(`${API}/api/enterprise/api-keys/${id}`, { method: 'DELETE', headers });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error?.message); }
      fetchKeys();
    } catch (err) { setError(err.message); }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(newKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-1">{t('enterprise.apiKeys.title')}</h1>
        <p className="text-sm text-gray-500 mb-6">{t('enterprise.apiKeys.description')}</p>

        {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">❌ {error}</div>}

        {/* Generate form */}
        <form onSubmit={handleGenerate} className="bg-white rounded-xl border border-gray-200 p-4 mb-6 flex gap-2">
          <input
            type="text" value={name} onChange={e => setName(e.target.value)}
            placeholder={t('enterprise.apiKeys.namePlaceholder')}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            maxLength={100}
          />
          <button type="submit" disabled={generating || !name.trim()}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium px-4 py-2 rounded-lg whitespace-nowrap">
            {generating ? '...' : t('enterprise.apiKeys.generate')}
          </button>
        </form>

        {/* Keys list */}
        {keys.length === 0
          ? <p className="text-center text-gray-400 italic mt-12">{t('enterprise.apiKeys.empty')}</p>
          : <div className="space-y-3">
              {keys.map(k => (
                <div key={k.id} className="bg-white rounded-xl border border-gray-200 p-4 flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-gray-900">{k.name}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      <span className="font-mono bg-gray-100 px-1 rounded">{k.key_prefix}…</span>
                      {' · '}{t('enterprise.apiKeys.created')}: {new Date(k.created_at).toLocaleDateString()}
                      {' · '}{t('enterprise.apiKeys.lastUsed')}: {k.last_used_at ? new Date(k.last_used_at).toLocaleDateString() : t('enterprise.apiKeys.never')}
                    </p>
                  </div>
                  <button onClick={() => handleRevoke(k.id)}
                    className="text-red-500 hover:text-red-700 text-sm font-medium ml-4 shrink-0">
                    {t('enterprise.apiKeys.revoke')}
                  </button>
                </div>
              ))}
            </div>
        }

        {/* New key modal */}
        {newKey && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-xl">
              <h3 className="text-lg font-bold text-gray-900 mb-2">{t('enterprise.apiKeys.modal.title')}</h3>
              <p className="text-sm text-amber-600 bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
                {t('enterprise.apiKeys.modal.warning')}
              </p>
              <div className="font-mono text-xs bg-gray-100 rounded-lg p-3 break-all mb-4 select-all">{newKey}</div>
              <div className="flex gap-2">
                <button onClick={handleCopy}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg text-sm">
                  {copied ? t('enterprise.apiKeys.modal.copied') : t('enterprise.apiKeys.modal.copy')}
                </button>
                <button onClick={() => { setNewKey(null); setCopied(false); }}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 rounded-lg text-sm">
                  {t('enterprise.apiKeys.modal.close')}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ApiKeysPage;

