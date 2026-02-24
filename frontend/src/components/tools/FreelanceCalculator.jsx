import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuota } from '../../hooks/useQuota';

const FreelanceCalculator = () => {
  const { t } = useTranslation();
  const { checkAndUseQuota, quotaError } = useQuota();
  const quotaChecked = useRef(false);
  const [desiredSalary, setDesiredSalary] = useState(50000);
  const [workingDays, setWorkingDays] = useState(218);
  const [expenses, setExpenses] = useState(5000);
  const [profitMargin, setProfitMargin] = useState(20);

  const calculateRates = () => {
    const totalNeeded = desiredSalary + expenses;
    const withMargin = totalNeeded * (1 + profitMargin / 100);
    const dailyRate = withMargin / workingDays;
    const hourlyRate = dailyRate / 7; // 7 heures par jour

    return {
      daily: Math.round(dailyRate),
      hourly: Math.round(hourlyRate),
      monthly: Math.round(withMargin / 12),
      yearly: Math.round(withMargin)
    };
  };

  useEffect(() => {
    if (!quotaChecked.current) {
      quotaChecked.current = true;
      checkAndUseQuota('freelance-calculator', 'finance');
    }
  }, [checkAndUseQuota]);

  const rates = calculateRates();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Link to="/tools" className="text-blue-600 hover:text-blue-700 mb-6 inline-flex items-center gap-2">
          {t('common.backToTools')}
        </Link>

        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">{t('toolPages.freelance.title')}</h1>
          <p className="text-gray-600">{t('toolPages.freelance.subtitle')}</p>
        </div>

        {quotaError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start gap-3">
              <span className="text-2xl">⛔</span>
              <div className="flex-1">
                <h3 className="font-semibold text-red-900 mb-1">{t('common.limitReached')}</h3>
                <p className="text-sm text-red-800">{quotaError.message}</p>
                <Link to="/pricing" className="inline-block mt-2 text-sm font-semibold text-red-700 underline hover:text-red-600">
                  {t('common.viewPlans')}
                </Link>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">{t('toolPages.freelance.paramsTitle')}</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('toolPages.freelance.salaryLabel')}
                </label>
                <input
                  type="number"
                  value={desiredSalary}
                  onChange={(e) => setDesiredSalary(parseInt(e.target.value) || 0)}
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('toolPages.freelance.workingDaysLabel')}
                </label>
                <input
                  type="number"
                  value={workingDays}
                  onChange={(e) => setWorkingDays(parseInt(e.target.value) || 0)}
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">{t('toolPages.freelance.workingDaysHint')}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('toolPages.freelance.expensesLabel')}
                </label>
                <input
                  type="number"
                  value={expenses}
                  onChange={(e) => setExpenses(parseInt(e.target.value) || 0)}
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">{t('toolPages.freelance.expensesHint')}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('toolPages.freelance.marginLabel', { margin: profitMargin })}
                </label>
                <input
                  type="range"
                  min="0"
                  max="50"
                  value={profitMargin}
                  onChange={(e) => setProfitMargin(parseInt(e.target.value))}
                  className="w-full"
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">{t('toolPages.freelance.ratesTitle')}</h2>

            <div className="space-y-4">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="text-sm text-blue-700 mb-1">{t('toolPages.freelance.dailyRate')}</div>
                <div className="text-3xl font-bold text-blue-900">{rates.daily} €</div>
              </div>

              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="text-sm text-green-700 mb-1">{t('toolPages.freelance.hourlyRate')}</div>
                <div className="text-3xl font-bold text-green-900">{rates.hourly} €</div>
              </div>

              <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                <div className="text-sm text-purple-700 mb-1">{t('toolPages.freelance.monthlyRevenue')}</div>
                <div className="text-3xl font-bold text-purple-900">{rates.monthly} €</div>
              </div>

              <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                <div className="text-sm text-orange-700 mb-1">{t('toolPages.freelance.yearlyRevenue')}</div>
                <div className="text-3xl font-bold text-orange-900">{rates.yearly} €</div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-xl p-6">
          <h3 className="font-semibold text-yellow-900 mb-2">{t('toolPages.freelance.noteTitle')}</h3>
          <p className="text-sm text-yellow-800">
            {t('toolPages.freelance.noteText')}
          </p>
        </div>
      </div>
    </div>
  );
};

export default FreelanceCalculator;

