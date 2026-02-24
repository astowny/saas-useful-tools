import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuota } from '../../hooks/useQuota';

const DcaCalculator = () => {
  const { t } = useTranslation();
  const { checkAndUseQuota, quotaError } = useQuota();
  const quotaChecked = useRef(false);
  const [investmentAmount, setInvestmentAmount] = useState(100);
  const [frequency, setFrequency] = useState('monthly');
  const [duration, setDuration] = useState(12);
  const [averageReturn, setAverageReturn] = useState(7);

  const calculateDCA = () => {
    const periods = frequency === 'weekly' ? duration * 4 : 
                   frequency === 'monthly' ? duration : 
                   duration / 12;
    
    const periodicRate = averageReturn / 100 / (frequency === 'weekly' ? 52 : frequency === 'monthly' ? 12 : 1);
    
    let totalInvested = investmentAmount * periods;
    let futureValue = 0;
    
    for (let i = 0; i < periods; i++) {
      futureValue = (futureValue + investmentAmount) * (1 + periodicRate);
    }
    
    const totalGain = futureValue - totalInvested;
    const returnPercentage = (totalGain / totalInvested) * 100;
    
    return {
      totalInvested: Math.round(totalInvested),
      futureValue: Math.round(futureValue),
      totalGain: Math.round(totalGain),
      returnPercentage: returnPercentage.toFixed(2)
    };
  };

  useEffect(() => {
    if (!quotaChecked.current) {
      quotaChecked.current = true;
      checkAndUseQuota('dca-calculator', 'finance');
    }
  }, [checkAndUseQuota]);

  const results = calculateDCA();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Link to="/tools" className="text-blue-600 hover:text-blue-700 mb-6 inline-flex items-center gap-2">
          {t('common.backToTools')}
        </Link>

        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">{t('toolPages.dca.title')}</h1>
          <p className="text-gray-600">{t('toolPages.dca.subtitle')}</p>
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
            <h2 className="text-xl font-semibold text-gray-900 mb-6">{t('toolPages.dca.paramsTitle')}</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('toolPages.dca.amountLabel')}
                </label>
                <input
                  type="number"
                  value={investmentAmount}
                  onChange={(e) => setInvestmentAmount(parseInt(e.target.value) || 0)}
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('toolPages.dca.frequencyLabel')}
                </label>
                <select
                  value={frequency}
                  onChange={(e) => setFrequency(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="weekly">{t('toolPages.dca.weekly')}</option>
                  <option value="monthly">{t('toolPages.dca.monthly')}</option>
                  <option value="yearly">{t('toolPages.dca.yearly')}</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('toolPages.dca.durationLabel')}
                </label>
                <input
                  type="number"
                  value={duration}
                  onChange={(e) => setDuration(parseInt(e.target.value) || 0)}
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('toolPages.dca.returnLabel', { rate: averageReturn })}
                </label>
                <input
                  type="range"
                  min="0"
                  max="20"
                  step="0.5"
                  value={averageReturn}
                  onChange={(e) => setAverageReturn(parseFloat(e.target.value))}
                  className="w-full"
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">{t('toolPages.dca.resultsTitle')}</h2>

            <div className="space-y-4">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="text-sm text-blue-700 mb-1">{t('toolPages.dca.totalInvested')}</div>
                <div className="text-3xl font-bold text-blue-900">{results.totalInvested} €</div>
              </div>

              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="text-sm text-green-700 mb-1">{t('toolPages.dca.futureValue')}</div>
                <div className="text-3xl font-bold text-green-900">{results.futureValue} €</div>
              </div>

              <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                <div className="text-sm text-purple-700 mb-1">{t('toolPages.dca.totalGain')}</div>
                <div className="text-3xl font-bold text-purple-900">+{results.totalGain} €</div>
              </div>

              <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                <div className="text-sm text-orange-700 mb-1">{t('toolPages.dca.returnRate')}</div>
                <div className="text-3xl font-bold text-orange-900">+{results.returnPercentage}%</div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-xl p-6">
          <h3 className="font-semibold text-yellow-900 mb-2">{t('toolPages.dca.warningTitle')}</h3>
          <p className="text-sm text-yellow-800">
            {t('toolPages.dca.warningText')}
          </p>
        </div>
      </div>
    </div>
  );
};

export default DcaCalculator;

