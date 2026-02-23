import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from 'react-i18next';

const Settings = () => {
  const { token, user } = useAuth();
  const { t, i18n } = useTranslation();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [fullName, setFullName] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Enterprise — API Keys
  const [apiKeys, setApiKeys] = useState([]);
  const [newKeyName, setNewKeyName] = useState('');
  const [generatingKey, setGeneratingKey] = useState(false);
  const [generatedKey, setGeneratedKey] = useState(null);
  const [keyCopied, setKeyCopied] = useState(false);

  // Enterprise — White-label
  const [wlConfig, setWlConfig] = useState({ app_name: '', logo_url: '', primary_color: '#3B82F6', accent_color: '#8B5CF6' });
  const [savingWl, setSavingWl] = useState(false);
  const [wlSuccess, setWlSuccess] = useState('');

  const fetchProfile = useCallback(async () => {
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/user/profile`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error(t('settings.errorLoadProfile'));
      const data = await res.json();
      setProfile(data);
      setFullName(data.user?.full_name || '');
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  }, [token, t]);

  const fetchApiKeys = useCallback(async () => {
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/enterprise/api-keys`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) { const data = await res.json(); setApiKeys(data.keys || []); }
    } catch {}
  }, [token]);

  const fetchWhiteLabel = useCallback(async () => {
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/enterprise/white-label`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) { const data = await res.json(); setWlConfig(data.config || {}); }
    } catch {}
  }, [token]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  useEffect(() => {
    if (profile?.subscription?.plan_name === 'enterprise') {
      fetchApiKeys();
      fetchWhiteLabel();
    }
  }, [profile, fetchApiKeys, fetchWhiteLabel]);

  const handleGenerateKey = async () => {
    if (!newKeyName.trim()) return;
    setGeneratingKey(true);
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/enterprise/api-keys`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ name: newKeyName.trim() })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || 'Error');
      setGeneratedKey(data.full_key);
      setNewKeyName('');
      fetchApiKeys();
    } catch (err) { setErrorMsg(err.message); }
    finally { setGeneratingKey(false); }
  };

  const handleRevokeKey = async (id) => {
    if (!window.confirm(t('enterprise.apiKeys.revokeConfirm'))) return;
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/enterprise/api-keys/${id}`, {
        method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) fetchApiKeys();
    } catch {}
  };

  const handleCopyKey = () => {
    navigator.clipboard.writeText(generatedKey);
    setKeyCopied(true);
    setTimeout(() => setKeyCopied(false), 2000);
  };

  const handleSaveWhiteLabel = async (e) => {
    e.preventDefault();
    setSavingWl(true);
    setWlSuccess('');
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/enterprise/white-label`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(wlConfig)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || 'Error');
      setWlConfig(data.config);
      setWlSuccess(t('enterprise.whiteLabel.saved'));
    } catch (err) { setErrorMsg(err.message); }
    finally { setSavingWl(false); }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg('');
    setErrorMsg('');
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/user/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ fullName })
      });
      if (!res.ok) throw new Error(t('settings.errorSaveProfile'));
      setSuccessMsg(t('settings.profileUpdated'));
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">{t('common.loading')}</div>
      </div>
    );
  }

  const subscription = profile?.subscription;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">{t('settings.title')}</h1>

        {/* Profil */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">{t('settings.profile')}</h2>

          {successMsg && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
              ✅ {successMsg}
            </div>
          )}
          {errorMsg && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              ❌ {errorMsg}
            </div>
          )}

          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('settings.emailLabel')}</label>
              <input
                type="email"
                value={profile?.user?.email || user?.email || ''}
                disabled
                className="w-full px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg text-gray-500 cursor-not-allowed"
              />
              <p className="text-xs text-gray-400 mt-1">{t('settings.emailNote')}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('settings.fullNameLabel')}</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder={t('settings.fullNamePlaceholder')}
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              {saving ? t('common.saving') : t('common.save')}
            </button>
          </form>
        </div>

        {/* Abonnement */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">{t('settings.subscriptionTitle')}</h2>
          {subscription ? (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">{t('settings.currentPlan')}</span>
                <span className="font-semibold text-blue-600">{subscription.display_name}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">{t('settings.status')}</span>
                <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">{t('settings.active')}</span>
              </div>
              {subscription.current_period_end && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">{t('settings.nextBilling')}</span>
                  <span className="text-gray-900">{new Date(subscription.current_period_end).toLocaleDateString(i18n.language === 'fr' ? 'fr-FR' : 'en-US')}</span>
                </div>
              )}
              <div className="flex justify-between items-center">
                <span className="text-gray-600">{t('settings.dailyLimit')}</span>
                <span className="text-gray-900">
                  {subscription.limits?.daily_usage === -1 ? t('common.unlimited') : `${subscription.limits?.daily_usage} ${t('settings.perDay')}`}
                </span>
              </div>
            </div>
          ) : (
            <p className="text-gray-500">{t('settings.noSub')}</p>
          )}
          <a
            href="/pricing"
            className="mt-4 inline-block text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            {t('settings.viewPlans')}
          </a>
        </div>

        {/* Compte */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">{t('settings.accountTitle')}</h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">{t('settings.memberSince')}</span>
              <span className="text-gray-900">
                {profile?.user?.created_at
                  ? new Date(profile.user.created_at).toLocaleDateString(i18n.language === 'fr' ? 'fr-FR' : 'en-US')
                  : '—'}
              </span>
            </div>
          </div>
        </div>

        {subscription?.plan_name === 'enterprise' && (<>
          {/* API Keys */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-1">{t('enterprise.apiKeys.title')}</h2>
            <p className="text-sm text-gray-500 mb-4">{t('enterprise.apiKeys.description')}</p>

            {/* Generate new key */}
            <div className="flex gap-2 mb-4">
              <input
                type="text" value={newKeyName} onChange={e => setNewKeyName(e.target.value)}
                placeholder={t('enterprise.apiKeys.namePlaceholder')}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button onClick={handleGenerateKey} disabled={generatingKey || !newKeyName.trim()}
                className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium px-4 py-2 rounded-lg">
                {generatingKey ? '...' : t('enterprise.apiKeys.generate')}
              </button>
            </div>

            {/* Keys list */}
            {apiKeys.filter(k => k.is_active).length === 0
              ? <p className="text-sm text-gray-400 italic">{t('enterprise.apiKeys.empty')}</p>
              : <div className="space-y-2">
                  {apiKeys.filter(k => k.is_active).map(key => (
                    <div key={key.id} className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2 text-sm">
                      <div>
                        <span className="font-medium text-gray-900">{key.name}</span>
                        <span className="ml-2 text-gray-400 font-mono">{key.key_prefix}…</span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-gray-400">
                        <span>{new Date(key.created_at).toLocaleDateString()}</span>
                        <button onClick={() => handleRevokeKey(key.id)}
                          className="text-red-500 hover:text-red-700 font-medium">{t('enterprise.apiKeys.revoke')}</button>
                      </div>
                    </div>
                  ))}
                </div>
            }

            {/* Modal — generated key (one-time display) */}
            {generatedKey && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-xl">
                  <h3 className="text-lg font-bold mb-2">{t('enterprise.apiKeys.modal.title')}</h3>
                  <p className="text-sm text-amber-600 bg-amber-50 rounded-lg p-3 mb-4">{t('enterprise.apiKeys.modal.warning')}</p>
                  <code className="block bg-gray-100 rounded-lg p-3 text-xs font-mono break-all mb-4">{generatedKey}</code>
                  <div className="flex gap-2">
                    <button onClick={handleCopyKey}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg text-sm">
                      {keyCopied ? t('enterprise.apiKeys.modal.copied') : t('enterprise.apiKeys.modal.copy')}
                    </button>
                    <button onClick={() => setGeneratedKey(null)}
                      className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 rounded-lg text-sm">
                      {t('enterprise.apiKeys.modal.close')}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* White-label */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-1">{t('enterprise.whiteLabel.title')}</h2>
            <p className="text-sm text-gray-500 mb-4">{t('enterprise.whiteLabel.description')}</p>
            {wlSuccess && <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">✅ {wlSuccess}</div>}
            <form onSubmit={handleSaveWhiteLabel} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('enterprise.whiteLabel.appName')}</label>
                <input type="text" value={wlConfig.app_name || ''} onChange={e => setWlConfig({...wlConfig, app_name: e.target.value})}
                  placeholder={t('enterprise.whiteLabel.appNamePlaceholder')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('enterprise.whiteLabel.logoUrl')}</label>
                <input type="url" value={wlConfig.logo_url || ''} onChange={e => setWlConfig({...wlConfig, logo_url: e.target.value})}
                  placeholder={t('enterprise.whiteLabel.logoUrlPlaceholder')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('enterprise.whiteLabel.primaryColor')}</label>
                  <div className="flex gap-2">
                    <input type="color" value={wlConfig.primary_color || '#3B82F6'} onChange={e => setWlConfig({...wlConfig, primary_color: e.target.value})}
                      className="h-10 w-14 rounded border border-gray-300 cursor-pointer" />
                    <input type="text" value={wlConfig.primary_color || ''} onChange={e => setWlConfig({...wlConfig, primary_color: e.target.value})}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('enterprise.whiteLabel.accentColor')}</label>
                  <div className="flex gap-2">
                    <input type="color" value={wlConfig.accent_color || '#8B5CF6'} onChange={e => setWlConfig({...wlConfig, accent_color: e.target.value})}
                      className="h-10 w-14 rounded border border-gray-300 cursor-pointer" />
                    <input type="text" value={wlConfig.accent_color || ''} onChange={e => setWlConfig({...wlConfig, accent_color: e.target.value})}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono" />
                  </div>
                </div>
              </div>
              {/* Preview */}
              <div className="rounded-lg p-3 text-sm font-medium text-white text-center" style={{ backgroundColor: wlConfig.primary_color || '#3B82F6' }}>
                {t('enterprise.whiteLabel.preview')}: {wlConfig.app_name || 'Useful Tools'}
              </div>
              <button type="submit" disabled={savingWl}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold py-3 rounded-lg">
                {savingWl ? t('common.saving') : t('enterprise.whiteLabel.save')}
              </button>
            </form>
          </div>
        </>)}

      </div>
    </div>
  );
};

export default Settings;

