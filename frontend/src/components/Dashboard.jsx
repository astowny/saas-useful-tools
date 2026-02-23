import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import UsageStats from './UsageStats';
import SubscriptionCard from './SubscriptionCard';
import QuotaDisplay from './QuotaDisplay';

const Dashboard = () => {
  const { token } = useAuth();
  const { t } = useTranslation();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProfile = useCallback(async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/user/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(t('dashboard.errorProfile'));
      }

      const data = await response.json();
      setProfile(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token, t]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          {t('dashboard.greeting', { name: profile?.user?.full_name || profile?.user?.email })}
        </h1>
        <p className="text-gray-600 mt-2">
          {t('dashboard.subtitle')}
        </p>
      </div>

      {/* Quota Display */}
      <div className="mb-8">
        <QuotaDisplay />
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Subscription Card */}
        <div className="lg:col-span-1">
          <SubscriptionCard subscription={profile?.subscription} />
        </div>

        {/* Usage Stats */}
        <div className="lg:col-span-2">
          <UsageStats />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">{t('dashboard.quickActions')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <a
            href="/tools"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
          >
            <span className="text-2xl mr-3">🧰</span>
            <div>
              <div className="font-medium">{t('dashboard.goToTools')}</div>
              <div className="text-sm text-gray-500">{t('dashboard.useTools')}</div>
            </div>
          </a>

          <a
            href="/pricing"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
          >
            <span className="text-2xl mr-3">⬆️</span>
            <div>
              <div className="font-medium">{t('dashboard.upgradePlan')}</div>
              <div className="text-sm text-gray-500">{t('dashboard.viewOptions')}</div>
            </div>
          </a>

          <a
            href="/settings"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
          >
            <span className="text-2xl mr-3">⚙️</span>
            <div>
              <div className="font-medium">{t('dashboard.settingsLabel')}</div>
              <div className="text-sm text-gray-500">{t('dashboard.manageAccount')}</div>
            </div>
          </a>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
