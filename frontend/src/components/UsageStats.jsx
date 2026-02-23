import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from 'react-i18next';

const UsageStats = () => {
  const { token } = useAuth();
  const [stats, setStats] = useState(null);
  const [period, setPeriod] = useState('month');
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation();

  const fetchStats = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/usage/stats?period=${period}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (err) {
      console.error('Error fetching stats:', err);
    } finally {
      setLoading(false);
    }
  }, [period, token]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const periodLabels = {
    day: t('stats.today'),
    week: t('stats.thisWeek'),
    month: t('stats.thisMonth'),
    year: t('stats.thisYear')
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">{t('stats.title')}</h2>
        
        {/* Period selector */}
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="day">{t('stats.today')}</option>
          <option value="week">{t('stats.thisWeek')}</option>
          <option value="month">{t('stats.thisMonth')}</option>
          <option value="year">{t('stats.thisYear')}</option>
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <>
          {/* Total usage */}
          <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
            <div className="text-sm text-gray-600">{t('stats.total')}</div>
            <div className="text-3xl font-bold text-gray-900">{stats?.totalUsage || 0}</div>
            <div className="text-xs text-gray-500 mt-1">{periodLabels[period]}</div>
          </div>

          {/* Tools usage breakdown */}
          {stats?.toolsUsage && stats.toolsUsage.length > 0 ? (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">{t('stats.topTools')}</h3>
              <div className="space-y-2">
                {stats.toolsUsage.slice(0, 10).map((tool, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center">
                        <span className="text-sm font-medium text-gray-700">
                          {tool.tool_name}
                        </span>
                        <span className="ml-2 text-xs text-gray-500">
                          ({tool.tool_category})
                        </span>
                      </div>
                      <div className="mt-1 w-full bg-gray-200 rounded-full h-1.5">
                        <div
                          className="bg-blue-500 h-1.5 rounded-full"
                          style={{
                            width: `${(parseInt(tool.usage_count) / stats.totalUsage) * 100}%`
                          }}
                        ></div>
                      </div>
                    </div>
                    <span className="ml-4 text-sm font-semibold text-gray-900">
                      {tool.usage_count}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p className="text-lg mb-2">📊</p>
              <p>{t('stats.noUsage')}</p>
              <a
                href="/tools"
                className="mt-4 inline-block text-blue-600 hover:text-blue-700 font-medium"
              >
                {t('stats.startUsing')}
              </a>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default UsageStats;