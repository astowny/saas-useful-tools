import React from 'react';

const SubscriptionCard = ({ subscription }) => {
  if (!subscription) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Abonnement</h2>
        <p className="text-gray-600 mb-4">Aucun abonnement actif</p>
        <a
          href="/pricing"
          className="block w-full text-center bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Choisir un plan
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
      active: { color: 'bg-green-100 text-green-800', text: 'Actif' },
      canceled: { color: 'bg-red-100 text-red-800', text: 'Annulé' },
      past_due: { color: 'bg-yellow-100 text-yellow-800', text: 'Paiement en retard' },
      trialing: { color: 'bg-blue-100 text-blue-800', text: 'Essai gratuit' }
    };
    return badges[status] || badges.active;
  };

  const statusBadge = getStatusBadge(subscription.status);
  const planBadgeColor = getPlanBadgeColor(subscription.plan_name);

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4">Mon abonnement</h2>

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
          <div className="text-sm text-gray-600">Facturation</div>
          <div className="text-lg font-semibold">
            {subscription.billing_cycle === 'monthly' ? 'Mensuelle' : 'Annuelle'}
          </div>
        </div>
      )}

      {/* Period end */}
      {subscription.current_period_end && (
        <div className="mb-4">
          <div className="text-sm text-gray-600">
            {subscription.cancel_at_period_end ? 'Se termine le' : 'Renouvellement le'}
          </div>
          <div className="text-sm font-medium">
            {new Date(subscription.current_period_end).toLocaleDateString('fr-FR', {
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
          <div className="text-sm text-gray-600 mb-2">Fonctionnalités incluses</div>
          <ul className="space-y-1">
            {subscription.features.slice(0, 3).map((feature, index) => (
              <li key={index} className="text-sm text-gray-700 flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                {feature}
              </li>
            ))}
            {subscription.features.length > 3 && (
              <li className="text-sm text-gray-500">
                +{subscription.features.length - 3} autres fonctionnalités
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
            Améliorer mon plan
          </a>
        )}
        
        {subscription.stripe_subscription_id && !subscription.cancel_at_period_end && (
          <button
            onClick={() => {
              if (window.confirm('Êtes-vous sûr de vouloir annuler votre abonnement ?')) {
                // Call cancel API
                fetch(`${process.env.REACT_APP_API_URL}/api/subscription/cancel`, {
                  method: 'POST',
                  headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                  }
                })
                  .then(res => res.json())
                  .then(() => window.location.reload())
                  .catch(err => alert('Erreur lors de l\'annulation'));
              }
            }}
            className="block w-full text-center border border-red-300 text-red-600 py-2 px-4 rounded-lg hover:bg-red-50 transition-colors"
          >
            Annuler l'abonnement
          </button>
        )}
      </div>

      {subscription.cancel_at_period_end && (
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">
            ⚠️ Votre abonnement sera annulé à la fin de la période en cours.
          </p>
        </div>
      )}
    </div>
  );
};

export default SubscriptionCard;

