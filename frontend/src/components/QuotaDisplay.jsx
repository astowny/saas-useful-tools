import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from 'react-i18next';

const QuotaDisplay = () => {
  const { token } = useAuth();
  const { t } = useTranslation();
  const [quota, setQuota] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchQuota = useCallback(async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/usage/quota`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setQuota(data);
      }
    } catch (err) {
      console.error('Error fetching quota:', err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchQuota();
    // Rafraîchir toutes les 30 secondes
    const interval = setInterval(fetchQuota, 30000);
    return () => clearInterval(interval);
  }, [fetchQuota]);

  if (loading || !quota) {
    return null;
  }

  const dailyPercentage = quota.daily.unlimited 
    ? 100 
    : (quota.daily.used / quota.daily.limit) * 100;

  const monthlyPercentage = quota.monthly.unlimited 
    ? 100 
    : (quota.monthly.used / quota.monthly.limit) * 100;

  const getProgressColor = (percentage) => {
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 70) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4">{t('quota.title')}</h2>
      
      <div className="space-y-6">
        {/* Quota quotidien */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">{t('quota.today')}</span>
            <span className="text-sm text-gray-600">
              {quota.daily.unlimited ? (
                <span className="text-green-600 font-semibold">{t('quota.unlimited')}</span>
              ) : (
                `${quota.daily.used} / ${quota.daily.limit}`
              )}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all ${getProgressColor(dailyPercentage)}`}
              style={{ width: `${Math.min(dailyPercentage, 100)}%` }}
            ></div>
          </div>
          {!quota.daily.unlimited && quota.daily.remaining <= 5 && quota.daily.remaining > 0 && (
            <p className="text-xs text-yellow-600 mt-1">
              {t('quota.warningRemaining', { count: quota.daily.remaining })}
            </p>
          )}
          {!quota.daily.unlimited && quota.daily.remaining === 0 && (
            <p className="text-xs text-red-600 mt-1">
              {t('quota.dailyLimitReached')}
            </p>
          )}
        </div>

        {/* Quota mensuel */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">{t('quota.thisMonth')}</span>
            <span className="text-sm text-gray-600">
              {quota.monthly.unlimited ? (
                <span className="text-green-600 font-semibold">{t('quota.unlimited')}</span>
              ) : (
                `${quota.monthly.used} / ${quota.monthly.limit}`
              )}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all ${getProgressColor(monthlyPercentage)}`}
              style={{ width: `${Math.min(monthlyPercentage, 100)}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Upgrade CTA si proche de la limite */}
      {!quota.daily.unlimited && (dailyPercentage >= 70 || monthlyPercentage >= 70) && (
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            {t('quota.needMore')}{' '}
            <a href="/pricing" className="font-semibold underline hover:text-blue-600">
              {t('quota.upgradePro')}
            </a>
          </p>
        </div>
      )}
    </div>
  );
};

export default QuotaDisplay;