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

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

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
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
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
      </div>
    </div>
  );
};

export default Settings;

