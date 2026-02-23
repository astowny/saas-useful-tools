import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from 'react-i18next';

const PricingPage = () => {
  const { token, isAuthenticated } = useAuth();
  const { t } = useTranslation();
  const [plans, setPlans] = useState([]);
  const [billingCycle, setBillingCycle] = useState('monthly');
  const [loading, setLoading] = useState(true);
  const [processingPlanId, setProcessingPlanId] = useState(null);

  const fetchPlans = useCallback(async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/subscription/plans`);
      const data = await response.json();
      setPlans(data.plans);
    } catch (err) {
      console.error('Error fetching plans:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  const handleSubscribe = async (planId) => {
    if (!isAuthenticated) {
      window.location.href = '/login?redirect=/pricing';
      return;
    }

    setProcessingPlanId(planId);

    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/subscription/create-checkout-session`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            planId,
            billingCycle
          })
        }
      );

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      console.error('Error creating checkout session:', err);
      alert(t('pricing.errorCheckout'));
    } finally {
      setProcessingPlanId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            {t('pricing.title')}
          </h1>
          <p className="text-lg text-gray-500">
            {t('pricing.subtitle')}
          </p>
        </div>

        {/* Billing toggle */}
        <div className="flex justify-center mb-10">
          <div className="bg-white border border-gray-200 rounded-lg p-1 inline-flex shadow-sm">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
                billingCycle === 'monthly'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {t('pricing.monthly')}
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`px-6 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
                billingCycle === 'yearly'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {t('pricing.yearly')}
              <span className="text-xs bg-green-100 text-green-700 font-semibold px-2 py-0.5 rounded-full">
                -17%
              </span>
            </button>
          </div>
        </div>

        {/* Plans grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {plans.map((plan) => {
            const price = billingCycle === 'monthly' ? plan.price_monthly : plan.price_yearly;
            const isPro = plan.name === 'pro';
            const isEnterprise = plan.name === 'enterprise';

            return (
              <div
                key={plan.id}
                className={`relative bg-white rounded-xl p-8 border-2 shadow-sm flex flex-col ${
                  isPro ? 'border-blue-500' : 'border-gray-200'
                }`}
              >
                {isPro && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <span className="bg-blue-600 text-white px-4 py-1 rounded-full text-xs font-semibold shadow">
                      {t('pricing.popular')}
                    </span>
                  </div>
                )}

                <div className="mb-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-1">{plan.display_name}</h3>
                  {isEnterprise && (
                    <p className="text-xs text-gray-400">{t('pricing.enterpriseDesc') || 'For teams & businesses'}</p>
                  )}
                </div>

                <div className="mb-6">
                  <span className="text-4xl font-bold text-gray-900">{price}€</span>
                  <span className="text-gray-400 text-sm ml-1">
                    {billingCycle === 'monthly' ? t('pricing.perMonth') : t('pricing.perYear')}
                  </span>
                </div>

                <ul className="space-y-3 mb-8 flex-1">
                  {plan.features && plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2 text-gray-600 text-sm">
                      <span className="text-green-500 font-bold mt-0.5 shrink-0">✓</span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleSubscribe(plan.id)}
                  disabled={processingPlanId === plan.id || plan.name === 'free'}
                  className={`w-full py-3 px-6 rounded-lg font-semibold text-sm transition-colors ${
                    isPro
                      ? 'bg-blue-600 hover:bg-blue-700 text-white'
                      : plan.name === 'free'
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-gray-900 hover:bg-gray-700 text-white'
                  }`}
                >
                  {processingPlanId === plan.id ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                      {t('pricing.loading')}
                    </span>
                  ) : plan.name === 'free' ? (
                    t('pricing.currentPlan')
                  ) : (
                    t('pricing.choosePlan')
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default PricingPage;

