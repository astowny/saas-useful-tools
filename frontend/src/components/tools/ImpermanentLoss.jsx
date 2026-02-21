import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const ImpermanentLoss = () => {
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

  const results = calculateImpermanentLoss();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <Link to="/tools" className="text-blue-600 hover:text-blue-700 mb-6 inline-flex items-center gap-2">
          ← Retour aux outils
        </Link>
        
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">💸 Calculateur Impermanent Loss</h1>
          <p className="text-gray-600">Calculez la perte impermanente dans les pools de liquidité</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Prix initiaux</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Prix Token A ($)
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
                  Prix Token B ($)
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
                  Montant investi ($)
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
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Prix actuels</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Prix Token A ($)
                </label>
                <input
                  type="number"
                  value={currentPriceA}
                  onChange={(e) => setCurrentPriceA(parseFloat(e.target.value) || 0)}
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Variation: {results.priceChangeA > 0 ? '+' : ''}{results.priceChangeA}%
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Prix Token B ($)
                </label>
                <input
                  type="number"
                  value={currentPriceB}
                  onChange={(e) => setCurrentPriceB(parseFloat(e.target.value) || 0)}
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Variation: {results.priceChangeB > 0 ? '+' : ''}{results.priceChangeB}%
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Résultats</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="text-sm text-red-700 mb-1">Perte impermanente</div>
              <div className="text-2xl font-bold text-red-900">{results.impermanentLossPercent}%</div>
            </div>

            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="text-sm text-blue-700 mb-1">Valeur si HODL</div>
              <div className="text-2xl font-bold text-blue-900">${results.currentValueHold}</div>
            </div>

            <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
              <div className="text-sm text-purple-700 mb-1">Valeur dans le pool</div>
              <div className="text-2xl font-bold text-purple-900">${results.currentValuePool}</div>
            </div>

            <div className={`p-4 rounded-lg border ${parseFloat(results.difference) >= 0 ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
              <div className={`text-sm mb-1 ${parseFloat(results.difference) >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                Différence
              </div>
              <div className={`text-2xl font-bold ${parseFloat(results.difference) >= 0 ? 'text-green-900' : 'text-red-900'}`}>
                ${results.difference}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
          <h3 className="font-semibold text-blue-900 mb-2">💡 Qu'est-ce que la perte impermanente ?</h3>
          <p className="text-sm text-blue-800">
            La perte impermanente survient lorsque le prix des tokens dans un pool de liquidité change par rapport au moment du dépôt. Plus la variation de prix est importante, plus la perte impermanente est élevée. Cette perte peut être compensée par les frais de trading générés par le pool.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ImpermanentLoss;

