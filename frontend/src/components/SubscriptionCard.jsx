import React from 'react';
import { useTranslation } from 'react-i18next';

const SubscriptionCard = ({ subscription }) => {
  const { t, i18n } = useTranslation();

  if (!subscription) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">{t('subscription.title')}</h2>
        <p className="text-gray-600 mb-4">{t('subscription.noSub')}</p>
        <a
          href="/pricing"
          className="block w-full text-center bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
        >
          {t('subscription.choosePlan')}
        </a>
      </div>
    );
  }

  const getPlanBadgeColor = (planName) => {
    switch (planName) {
      case 'free':
        return 'bg-gray-100 text-gray-800';
      case 'pro':
        return 'bg-blue-100 text-blue-800';
      case 'enterprise':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      active: { color: 'bg-green-100 text-green-800', text: t('subscription.status.active') },
      canceled: { color: 'bg-red-100 text-red-800', text: t('subscription.status.canceled') },
      past_due: { color: 'bg-yellow-100 text-yellow-800', text: t('subscription.status.past_due') },
      trialing: { color: 'bg-blue-100 text-blue-800', text: t('subscription.status.trialing') }
    };
    return badges[status] || badges.active;
  };

  const statusBadge = getStatusBadge(subscription.status);
  const planBadgeColor = getPlanBadgeColor(subscription.plan_name);

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4">{t('subscription.title')}</h2>

      {/* Plan name */}
      <div className="mb-4">
        <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${planBadgeColor}`}>
          {subscription.display_name}
        </span>
        <span className={`ml-2 inline-block px-3 py-1 rounded-full text-xs font-medium ${statusBadge.color}`}>
          {statusBadge.text}
        </span>
      </div>

      {/* Billing info */}
      {subscription.billing_cycle && (
        <div className="mb-4">
          <div className="text-sm text-gray-600">{t('subscription.billing')}</div>
          <div className="text-lg font-semibold">
            {subscription.billing_cycle === 'monthly' ? t('subscription.monthly') : t('subscription.yearly')}
          </div>
        </div>
      )}

      {/* Period end */}
      {subscription.current_period_end && (
        <div className="mb-4">
          <div className="text-sm text-gray-600">
            {subscription.cancel_at_period_end ? t('subscription.endsOn') : t('subscription.renewsOn')}
          </div>
          <div className="text-sm font-medium">
            {new Date(subscription.current_period_end).toLocaleDateString(i18n.language === 'fr' ? 'fr-FR' : 'en-US', {
              day: 'numeric',
              month: 'long',
              year: 'numeric'
            })}
          </div>
        </div>
      )}

      {/* Features */}
      {subscription.features && subscription.features.length > 0 && (
        <div className="mb-4">
          <div className="text-sm text-gray-600 mb-2">{t('subscription.features')}</div>
          <ul className="space-y-1">
            {subscription.features.slice(0, 3).map((feature, index) => (
              <li key={index} className="text-sm text-gray-700 flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                {feature}
              </li>
            ))}
            {subscription.features.length > 3 && (
              <li className="text-sm text-gray-500">
                {t('subscription.moreFeatures', { count: subscription.features.length - 3 })}
              </li>
            )}
          </ul>
        </div>
      )}

      {/* Actions */}
      <div className="space-y-2 mt-6">
        {subscription.plan_name !== 'enterprise' && (
          <a
            href="/pricing"
            className="block w-full text-center bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
          >
            {t('subscription.upgradePlan')}
          </a>
        )}
        
        {subscription.stripe_subscription_id && !subscription.cancel_at_period_end && (
          <button
            onClick={() => {
              if (window.confirm(t('subscription.cancelConfirm'))) {
                // Call cancel API
                fetch(`${process.env.REACT_APP_API_URL}/api/subscription/cancel`, {
                  method: 'POST',
                  headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                  }
                })
                  .then(res => res.json())
                  .then(() => window.location.reload())
                  .catch(err => alert(t('subscription.cancelError')));
              }
            }}
            className="block w-full text-center border border-red-300 text-red-600 py-2 px-4 rounded-lg hover:bg-red-50 transition-colors"
          >
            {t('subscription.cancelSub')}
          </button>
        )}
      </div>

      {subscription.cancel_at_period_end && (
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">
            {t('subscription.cancelWarning')}
          </p>
        </div>
      )}
    </div>
  );
};

export default SubscriptionCard;

