import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from 'react-i18next';

const WhiteLabelPage = () => {
  const { token, refreshWhiteLabel } = useAuth();
  const { t } = useTranslation();
  const API = process.env.REACT_APP_API_URL;

  const [config, setConfig] = useState({ app_name: 'Useful Tools', logo_url: '', primary_color: '#3B82F6', accent_color: '#8B5CF6' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  const headers = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`${API}/api/enterprise/white-label`, { headers });
        if (!res.ok) { const d = await res.json(); throw new Error(d.error?.message); }
        const data = await res.json();
        setConfig({ ...data.config, logo_url: data.config.logo_url || '' });
      } catch (err) { setError(err.message); }
      finally { setLoading(false); }
    };
    load();
  }, [token]); // eslint-disable-line

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSaved(false);
    try {
      const res = await fetch(`${API}/api/enterprise/white-label`, {
        method: 'PUT', headers,
        body: JSON.stringify(config)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message);
      setConfig({ ...data.config, logo_url: data.config.logo_url || '' });
      await refreshWhiteLabel();
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) { setError(err.message); }
    finally { setSaving(false); }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-1">{t('enterprise.whiteLabel.title')}</h1>
        <p className="text-sm text-gray-500 mb-6">{t('enterprise.whiteLabel.description')}</p>

        {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">❌ {error}</div>}
        {saved && <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">✅ {t('enterprise.whiteLabel.saved')}</div>}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Form */}
          <form onSubmit={handleSave} className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('enterprise.whiteLabel.appName')}</label>
              <input type="text" value={config.app_name}
                onChange={e => setConfig(c => ({ ...c, app_name: e.target.value }))}
                placeholder={t('enterprise.whiteLabel.appNamePlaceholder')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                maxLength={100} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('enterprise.whiteLabel.logoUrl')}</label>
              <input type="url" value={config.logo_url}
                onChange={e => setConfig(c => ({ ...c, logo_url: e.target.value }))}
                placeholder={t('enterprise.whiteLabel.logoUrlPlaceholder')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                maxLength={500} />
            </div>
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('enterprise.whiteLabel.primaryColor')}</label>
                <div className="flex items-center gap-2">
                  <input type="color" value={config.primary_color}
                    onChange={e => setConfig(c => ({ ...c, primary_color: e.target.value }))}
                    className="h-9 w-12 rounded border border-gray-300 cursor-pointer p-0.5" />
                  <span className="text-sm font-mono text-gray-600">{config.primary_color}</span>
                </div>
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('enterprise.whiteLabel.accentColor')}</label>
                <div className="flex items-center gap-2">
                  <input type="color" value={config.accent_color}
                    onChange={e => setConfig(c => ({ ...c, accent_color: e.target.value }))}
                    className="h-9 w-12 rounded border border-gray-300 cursor-pointer p-0.5" />
                  <span className="text-sm font-mono text-gray-600">{config.accent_color}</span>
                </div>
              </div>
            </div>
            <button type="submit" disabled={saving}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold py-2 rounded-lg text-sm transition-colors">
              {saving ? '...' : t('enterprise.whiteLabel.save')}
            </button>
          </form>

          {/* Preview */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-sm font-medium text-gray-700 mb-3">{t('enterprise.whiteLabel.preview')}</p>
            <div className="rounded-lg overflow-hidden border border-gray-200">
              <div style={{ backgroundColor: config.primary_color }} className="px-4 py-3 flex items-center gap-2">
                {config.logo_url
                  ? <img src={config.logo_url} alt="logo" className="h-6 w-auto object-contain" onError={e => { e.target.style.display = 'none'; }} />
                  : <span className="text-white text-lg">🛠️</span>
                }
                <span className="text-white font-bold text-sm">{config.app_name || 'Useful Tools'}</span>
              </div>
              <div className="p-3 bg-gray-50 text-xs text-gray-500 space-y-2">
                <div className="h-3 rounded w-3/4" style={{ backgroundColor: config.primary_color, opacity: 0.2 }}></div>
                <div className="h-3 rounded w-1/2" style={{ backgroundColor: config.accent_color, opacity: 0.2 }}></div>
                <div className="flex gap-2">
                  <div className="h-6 flex-1 rounded text-white flex items-center justify-center text-xs font-medium" style={{ backgroundColor: config.primary_color }}>Button</div>
                  <div className="h-6 flex-1 rounded text-white flex items-center justify-center text-xs font-medium" style={{ backgroundColor: config.accent_color }}>Accent</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WhiteLabelPage;

