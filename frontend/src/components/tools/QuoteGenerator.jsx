import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuota } from '../../hooks/useQuota';

const QuoteGenerator = () => {
  const { checkAndUseQuota, isChecking, quotaError } = useQuota();

  // Informations entreprise
  const [companyName, setCompanyName] = useState('');
  const [companyAddress, setCompanyAddress] = useState('');
  const [companyEmail, setCompanyEmail] = useState('');
  const [companyPhone, setCompanyPhone] = useState('');

  // Informations client
  const [clientName, setClientName] = useState('');
  const [clientAddress, setClientAddress] = useState('');
  const [clientEmail, setClientEmail] = useState('');

  // Informations devis
  const [quoteNumber, setQuoteNumber] = useState('');
  const [quoteDate, setQuoteDate] = useState(new Date().toISOString().split('T')[0]);
  const [validUntil, setValidUntil] = useState('');

  // Lignes de devis
  const [items, setItems] = useState([
    { description: '', quantity: 1, unitPrice: 0 }
  ]);

  const [generatedQuote, setGeneratedQuote] = useState(null);

  const addItem = () => {
    setItems([...items, { description: '', quantity: 1, unitPrice: 0 }]);
  };

  const removeItem = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
  };

  const calculateSubtotal = () => {
    return items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  };

  const calculateTVA = (subtotal) => {
    return subtotal * 0.20; // TVA 20%
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    return subtotal + calculateTVA(subtotal);
  };

  const generateQuote = async () => {
    // Vérifier le quota avant de générer
    const result = await checkAndUseQuota('quote-generator', 'productivity');

    if (!result.success) {
      return; // L'erreur est déjà gérée par le hook
    }

    const quote = {
      company: { name: companyName, address: companyAddress, email: companyEmail, phone: companyPhone },
      client: { name: clientName, address: clientAddress, email: clientEmail },
      quoteNumber,
      quoteDate,
      validUntil,
      items,
      subtotal: calculateSubtotal(),
      tva: calculateTVA(calculateSubtotal()),
      total: calculateTotal()
    };

    setGeneratedQuote(quote);
  };

  const printQuote = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <Link to="/tools" className="text-blue-600 hover:text-blue-700 mb-6 inline-flex items-center gap-2 no-print">
          ← Retour aux outils
        </Link>

        <div className="mb-8 no-print">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">📋 Générateur de Devis</h1>
          <p className="text-gray-600">Créez des devis professionnels en quelques clics</p>
        </div>

        {/* Affichage des erreurs de quota */}
        {quotaError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg no-print">
            <div className="flex items-start gap-3">
              <span className="text-2xl">⛔</span>
              <div className="flex-1">
                <h3 className="font-semibold text-red-900 mb-1">Limite atteinte</h3>
                <p className="text-sm text-red-800">{quotaError.message}</p>
                {quotaError.type === 'NO_SUBSCRIPTION' && (
                  <Link to="/pricing" className="inline-block mt-2 text-sm font-semibold text-red-700 underline hover:text-red-600">
                    Voir les plans disponibles →
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}

        {!generatedQuote ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 no-print">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Informations entreprise */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Votre entreprise</h3>
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Nom de l'entreprise"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <textarea
                    placeholder="Adresse"
                    value={companyAddress}
                    onChange={(e) => setCompanyAddress(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows="2"
                  />
                  <input
                    type="email"
                    placeholder="Email"
                    value={companyEmail}
                    onChange={(e) => setCompanyEmail(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="tel"
                    placeholder="Téléphone"
                    value={companyPhone}
                    onChange={(e) => setCompanyPhone(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Informations client */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Client</h3>
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Nom du client"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <textarea
                    placeholder="Adresse"
                    value={clientAddress}
                    onChange={(e) => setClientAddress(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows="2"
                  />
                  <input
                    type="email"
                    placeholder="Email"
                    value={clientEmail}
                    onChange={(e) => setClientEmail(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Informations devis */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <input
                type="text"
                placeholder="N° Devis"
                value={quoteNumber}
                onChange={(e) => setQuoteNumber(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="date"
                value={quoteDate}
                onChange={(e) => setQuoteDate(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="date"
                placeholder="Valide jusqu'au"
                value={validUntil}
                onChange={(e) => setValidUntil(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Lignes de devis */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Prestations</h3>
              <div className="space-y-3">
                {items.map((item, index) => (
                  <div key={index} className="grid grid-cols-12 gap-2">
                    <input
                      type="text"
                      placeholder="Description"
                      value={item.description}
                      onChange={(e) => updateItem(index, 'description', e.target.value)}
                      className="col-span-6 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="number"
                      placeholder="Qté"
                      value={item.quantity}
                      onChange={(e) => updateItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                      className="col-span-2 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="number"
                      placeholder="Prix unitaire"
                      value={item.unitPrice}
                      onChange={(e) => updateItem(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                      className="col-span-3 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      onClick={() => removeItem(index)}
                      className="col-span-1 text-red-600 hover:text-red-700"
                      disabled={items.length === 1}
                    >
                      🗑️
                    </button>
                  </div>
                ))}
              </div>
              <button
                onClick={addItem}
                className="mt-3 text-blue-600 hover:text-blue-700 text-sm font-semibold"
              >
                + Ajouter une ligne
              </button>
            </div>

            {/* Totaux */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="flex justify-between mb-2">
                <span className="text-gray-700">Sous-total HT</span>
                <span className="font-semibold">{calculateSubtotal().toFixed(2)} €</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-700">TVA (20%)</span>
                <span className="font-semibold">{calculateTVA(calculateSubtotal()).toFixed(2)} €</span>
              </div>
              <div className="flex justify-between text-lg font-bold border-t pt-2">
                <span>Total TTC</span>
                <span>{calculateTotal().toFixed(2)} €</span>
              </div>
            </div>

            <button
              onClick={generateQuote}
              disabled={isChecking || !companyName || !clientName || !quoteNumber}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              {isChecking ? 'Vérification...' : 'Générer le devis'}
            </button>
          </div>
        ) : (
          <>
            {/* Devis généré */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-6">
            <div className="mb-8 flex justify-between items-start">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">{generatedQuote.company.name}</h2>
                <p className="text-gray-600 whitespace-pre-line">{generatedQuote.company.address}</p>
                <p className="text-gray-600">{generatedQuote.company.email}</p>
                <p className="text-gray-600">{generatedQuote.company.phone}</p>
              </div>
              <div className="text-right">
                <h3 className="text-2xl font-bold text-green-600 mb-2">DEVIS</h3>
                <p className="text-gray-700">N° {generatedQuote.quoteNumber}</p>
                <p className="text-gray-600">Date: {new Date(generatedQuote.quoteDate).toLocaleDateString('fr-FR')}</p>
                {generatedQuote.validUntil && (
                  <p className="text-gray-600">Valide jusqu'au: {new Date(generatedQuote.validUntil).toLocaleDateString('fr-FR')}</p>
                )}
              </div>
            </div>

            <div className="mb-8 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-2">Devis pour:</h4>
              <p className="font-semibold">{generatedQuote.client.name}</p>
              <p className="text-gray-600 whitespace-pre-line">{generatedQuote.client.address}</p>
              <p className="text-gray-600">{generatedQuote.client.email}</p>
            </div>

            <table className="w-full mb-8">
              <thead>
                <tr className="border-b-2 border-gray-300">
                  <th className="text-left py-3 text-gray-700">Description</th>
                  <th className="text-right py-3 text-gray-700">Quantité</th>
                  <th className="text-right py-3 text-gray-700">Prix unitaire</th>
                  <th className="text-right py-3 text-gray-700">Total</th>
                </tr>
              </thead>
              <tbody>
                {generatedQuote.items.map((item, index) => (
                  <tr key={index} className="border-b border-gray-200">
                    <td className="py-3">{item.description}</td>
                    <td className="text-right py-3">{item.quantity}</td>
                    <td className="text-right py-3">{item.unitPrice.toFixed(2)} €</td>
                    <td className="text-right py-3">{(item.quantity * item.unitPrice).toFixed(2)} €</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="flex justify-end mb-8">
              <div className="w-64">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-700">Sous-total HT</span>
                  <span className="font-semibold">{generatedQuote.subtotal.toFixed(2)} €</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-700">TVA (20%)</span>
                  <span className="font-semibold">{generatedQuote.tva.toFixed(2)} €</span>
                </div>
                <div className="flex justify-between text-xl font-bold border-t-2 border-gray-300 pt-2">
                  <span>Total TTC</span>
                  <span className="text-green-600">{generatedQuote.total.toFixed(2)} €</span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Conditions:</strong> Ce devis est valable {generatedQuote.validUntil ? `jusqu'au ${new Date(generatedQuote.validUntil).toLocaleDateString('fr-FR')}` : '30 jours'}.
                Acompte de 30% à la commande. Solde à la livraison.
              </p>
            </div>
          </div>

          <div className="flex gap-4 no-print">
            <button
              onClick={() => setGeneratedQuote(null)}
              className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              ← Nouveau devis
            </button>
            <button
              onClick={printQuote}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              🖨️ Imprimer / PDF
            </button>
          </div>
          </>
        )}
      </div>

      <style>{`
        @media print {
          .no-print {
            display: none !important;
          }
          body {
            background: white;
          }
        }
      `}</style>
    </div>
  );
};

export default QuoteGenerator;
