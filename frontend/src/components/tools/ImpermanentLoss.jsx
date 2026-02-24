import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuota } from '../../hooks/useQuota';

const ImpermanentLoss = () => {
  const { t } = useTranslation();
  const { checkAndUseQuota, quotaError } = useQuota();
  const quotaChecked = useRef(false);
  const [initialPriceA, setInitialPriceA] = useState(100);
  const [initialPriceB, setInitialPriceB] = useState(2000);
  const [currentPriceA, setCurrentPriceA] = useState(150);
  const [currentPriceB, setCurrentPriceB] = useState(2500);
  const [investmentAmount, setInvestmentAmount] = useState(1000);

  const calculateImpermanentLoss = () => {
    // Initial ratio
    const initialRatio = initialPriceA / initialPriceB;
    const currentRatio = currentPriceA / currentPriceB;
    
    // Price change ratio
    const priceRatio = currentRatio / initialRatio;
    
    // Impermanent loss formula
    const impermanentLoss = (2 * Math.sqrt(priceRatio) / (1 + priceRatio)) - 1;
    const impermanentLossPercent = impermanentLoss * 100;
    
    // Calculate values
    const initialValueHold = investmentAmount;
    const currentValueHold = (investmentAmount / 2 / initialPriceA * currentPriceA) + 
                             (investmentAmount / 2 / initialPriceB * currentPriceB);
    
    const currentValuePool = initialValueHold * (1 + impermanentLoss);
    const gainHold = currentValueHold - initialValueHold;
    const gainPool = currentValuePool - initialValueHold;
    const difference = gainPool - gainHold;
    
    return {
      impermanentLossPercent: impermanentLossPercent.toFixed(2),
      initialValueHold: initialValueHold.toFixed(2),
      currentValueHold: currentValueHold.toFixed(2),
      currentValuePool: currentValuePool.toFixed(2),
      gainHold: gainHold.toFixed(2),
      gainPool: gainPool.toFixed(2),
      difference: difference.toFixed(2),
      priceChangeA: ((currentPriceA / initialPriceA - 1) * 100).toFixed(2),
      priceChangeB: ((currentPriceB / initialPriceB - 1) * 100).toFixed(2)
    };
  };

  useEffect(() => {
    if (!quotaChecked.current) {
      quotaChecked.current = true;
      checkAndUseQuota('impermanent-loss', 'finance');
    }
  }, [checkAndUseQuota]);

  const results = calculateImpermanentLoss();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <Link to="/tools" className="text-blue-600 hover:text-blue-700 mb-6 inline-flex items-center gap-2">
          {t('common.backToTools')}
        </Link>

        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">{t('toolPages.impermanentLoss.title')}</h1>
          <p className="text-gray-600">{t('toolPages.impermanentLoss.subtitle')}</p>
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">{t('toolPages.impermanentLoss.initialPrices')}</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('toolPages.impermanentLoss.tokenALabel')}
                </label>
                <input
                  type="number"
                  value={initialPriceA}
                  onChange={(e) => setInitialPriceA(parseFloat(e.target.value) || 0)}
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('toolPages.impermanentLoss.tokenBLabel')}
                </label>
                <input
                  type="number"
                  value={initialPriceB}
                  onChange={(e) => setInitialPriceB(parseFloat(e.target.value) || 0)}
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('toolPages.impermanentLoss.investedLabel')}
                </label>
                <input
                  type="number"
                  value={investmentAmount}
                  onChange={(e) => setInvestmentAmount(parseFloat(e.target.value) || 0)}
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">{t('toolPages.impermanentLoss.currentPrices')}</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('toolPages.impermanentLoss.tokenALabel')}
                </label>
                <input
                  type="number"
                  value={currentPriceA}
                  onChange={(e) => setCurrentPriceA(parseFloat(e.target.value) || 0)}
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {t('toolPages.impermanentLoss.variation')} {results.priceChangeA > 0 ? '+' : ''}{results.priceChangeA}%
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('toolPages.impermanentLoss.tokenBLabel')}
                </label>
                <input
                  type="number"
                  value={currentPriceB}
                  onChange={(e) => setCurrentPriceB(parseFloat(e.target.value) || 0)}
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {t('toolPages.impermanentLoss.variation')} {results.priceChangeB > 0 ? '+' : ''}{results.priceChangeB}%
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">{t('toolPages.impermanentLoss.resultsTitle')}</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="text-sm text-red-700 mb-1">{t('toolPages.impermanentLoss.impLoss')}</div>
              <div className="text-2xl font-bold text-red-900">{results.impermanentLossPercent}%</div>
            </div>

            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="text-sm text-blue-700 mb-1">{t('toolPages.impermanentLoss.hodlValue')}</div>
              <div className="text-2xl font-bold text-blue-900">${results.currentValueHold}</div>
            </div>

            <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
              <div className="text-sm text-purple-700 mb-1">{t('toolPages.impermanentLoss.poolValue')}</div>
              <div className="text-2xl font-bold text-purple-900">${results.currentValuePool}</div>
            </div>

            <div className={`p-4 rounded-lg border ${parseFloat(results.difference) >= 0 ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
              <div className={`text-sm mb-1 ${parseFloat(results.difference) >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                {t('toolPages.impermanentLoss.difference')}
              </div>
              <div className={`text-2xl font-bold ${parseFloat(results.difference) >= 0 ? 'text-green-900' : 'text-red-900'}`}>
                ${results.difference}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
          <h3 className="font-semibold text-blue-900 mb-2">{t('toolPages.impermanentLoss.infoTitle')}</h3>
          <p className="text-sm text-blue-800">
            {t('toolPages.impermanentLoss.infoText')}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ImpermanentLoss;

