import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useQuota } from '../../hooks/useQuota';

const QuoteGenerator = () => {
  const { checkAndUseQuota, isChecking, quotaError } = useQuota();

  // Templates par défaut
  const defaultTemplates = {
    'dev-web': {
      name: '💻 Développement Web',
      lines: [
        { description: 'Conception et maquettes', quantity: 1, unit: 'forfait', unitPrice: 500 },
        { description: 'Développement front-end', quantity: 1, unit: 'jour', unitPrice: 450 },
        { description: 'Développement back-end', quantity: 1, unit: 'jour', unitPrice: 500 },
        { description: 'Tests et recette', quantity: 1, unit: 'forfait', unitPrice: 300 }
      ],
      conditions: 'Acompte de 30% à la commande. Solde à la livraison.\nDélai de réalisation : selon planning convenu.'
    },
    'design': {
      name: '🎨 Design Graphique',
      lines: [
        { description: 'Brief et recherches', quantity: 1, unit: 'forfait', unitPrice: 200 },
        { description: 'Propositions graphiques', quantity: 3, unit: 'proposition', unitPrice: 150 },
        { description: 'Retouches et ajustements', quantity: 2, unit: 'révision', unitPrice: 100 },
        { description: 'Livraison fichiers sources', quantity: 1, unit: 'forfait', unitPrice: 50 }
      ],
      conditions: 'Acompte de 50% à la commande.\n3 propositions incluses, révisions supplémentaires facturées.'
    },
    'consulting': {
      name: '📊 Consulting',
      lines: [
        { description: 'Audit initial', quantity: 1, unit: 'jour', unitPrice: 800 },
        { description: 'Accompagnement stratégique', quantity: 1, unit: 'jour', unitPrice: 750 },
        { description: 'Rapport et recommandations', quantity: 1, unit: 'forfait', unitPrice: 500 }
      ],
      conditions: 'Facturation mensuelle. Frais de déplacement en sus.'
    },
    'formation': {
      name: '📚 Formation',
      lines: [
        { description: 'Préparation pédagogique', quantity: 1, unit: 'forfait', unitPrice: 400 },
        { description: 'Animation formation', quantity: 1, unit: 'jour', unitPrice: 900 },
        { description: 'Supports de cours', quantity: 1, unit: 'forfait', unitPrice: 200 }
      ],
      conditions: 'Formation intra-entreprise. Jusqu\'à 8 participants.'
    }
  };

  // Informations entreprise
  const [companyName, setCompanyName] = useState('');
  const [companyAddress, setCompanyAddress] = useState('');
  const [companyEmail, setCompanyEmail] = useState('');
  const [companyPhone, setCompanyPhone] = useState('');
  const [companySiret, setCompanySiret] = useState('');

  // Informations client
  const [clientName, setClientName] = useState('');
  const [clientAddress, setClientAddress] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientPhone, setClientPhone] = useState('');

  // Informations devis
  const [quoteNumber, setQuoteNumber] = useState('');
  const [quoteDate, setQuoteDate] = useState(new Date().toISOString().split('T')[0]);
  const [validUntil, setValidUntil] = useState(
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [tvaRate, setTvaRate] = useState(20);

  // Conditions
  const [conditions, setConditions] = useState('');

  // Lignes de devis
  const [items, setItems] = useState([
    { description: '', quantity: 1, unit: 'unité', unitPrice: 0 }
  ]);

  const [generatedQuote, setGeneratedQuote] = useState(null);
  const [customTemplates, setCustomTemplates] = useState({});

  // Charger les templates personnalisés depuis localStorage
  useEffect(() => {
    const saved = localStorage.getItem('quoteTemplates');
    if (saved) {
      try {
        setCustomTemplates(JSON.parse(saved));
      } catch (e) {
        console.error('Error loading templates:', e);
      }
    }
    // Générer un numéro de devis automatique
    const year = new Date().getFullYear();
    const random = String(Math.floor(Math.random() * 1000)).padStart(3, '0');
    setQuoteNumber(`DEV-${year}-${random}`);
  }, []);

  const getAllTemplates = () => {
    return { ...defaultTemplates, ...customTemplates };
  };

  const loadTemplate = (templateId) => {
    const templates = getAllTemplates();
    const template = templates[templateId];
    if (template) {
      setItems(JSON.parse(JSON.stringify(template.lines)));
      setConditions(template.conditions || '');
    }
  };

  const clearForm = () => {
    setItems([{ description: '', quantity: 1, unit: 'unité', unitPrice: 0 }]);
    setConditions('');
  };

  const saveTemplate = () => {
    const name = prompt('Nom du template:');
    if (!name) return;

    const id = 'custom-' + Date.now();
    const newTemplates = {
      ...customTemplates,
      [id]: {
        name: '⭐ ' + name,
        lines: JSON.parse(JSON.stringify(items)),
        conditions
      }
    };

    setCustomTemplates(newTemplates);
    localStorage.setItem('quoteTemplates', JSON.stringify(newTemplates));
    alert('Template sauvegardé !');
  };

  const addItem = () => {
    setItems([...items, { description: '', quantity: 1, unit: 'unité', unitPrice: 0 }]);
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
    return subtotal * (tvaRate / 100);
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
      company: {
        name: companyName,
        address: companyAddress,
        email: companyEmail,
        phone: companyPhone,
        siret: companySiret
      },
      client: {
        name: clientName,
        address: clientAddress,
        email: clientEmail,
        phone: clientPhone
      },
      quoteNumber,
      quoteDate,
      validUntil,
      items,
      subtotal: calculateSubtotal(),
      tva: calculateTVA(calculateSubtotal()),
      total: calculateTotal(),
      tvaRate,
      conditions
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
            {/* Sélection de template */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">📁 Sélectionner un template</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {Object.entries(getAllTemplates()).map(([id, template]) => (
                  <button
                    key={id}
                    onClick={() => loadTemplate(id)}
                    className="p-3 bg-white hover:bg-blue-50 rounded-lg text-left border border-gray-300 hover:border-blue-500 transition-all"
                  >
                    <div className="font-medium text-sm">{template.name}</div>
                    <div className="text-xs text-gray-500">{template.lines.length} lignes</div>
                  </button>
                ))}
                <button
                  onClick={clearForm}
                  className="p-3 bg-white hover:bg-yellow-50 rounded-lg text-left border border-gray-300 hover:border-yellow-500 transition-all"
                >
                  <div className="font-medium text-sm">📝 Vierge</div>
                  <div className="text-xs text-gray-500">Devis vide</div>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              {/* Informations entreprise */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">👤 Émetteur</h3>
                <div className="space-y-2">
                  <input
                    type="text"
                    placeholder="Nom de l'entreprise"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="text"
                    placeholder="Adresse"
                    value={companyAddress}
                    onChange={(e) => setCompanyAddress(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="email"
                    placeholder="Email"
                    value={companyEmail}
                    onChange={(e) => setCompanyEmail(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="tel"
                    placeholder="Téléphone"
                    value={companyPhone}
                    onChange={(e) => setCompanyPhone(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="text"
                    placeholder="SIRET"
                    value={companySiret}
                    onChange={(e) => setCompanySiret(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Informations client */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">🏢 Client</h3>
                <div className="space-y-2">
                  <input
                    type="text"
                    placeholder="Nom du client"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="text"
                    placeholder="Adresse client"
                    value={clientAddress}
                    onChange={(e) => setClientAddress(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="email"
                    placeholder="Email client"
                    value={clientEmail}
                    onChange={(e) => setClientEmail(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="tel"
                    placeholder="Téléphone client"
                    value={clientPhone}
                    onChange={(e) => setClientPhone(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Informations devis */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">📄 Devis</h3>
                <div className="space-y-2">
                  <input
                    type="text"
                    placeholder="N° Devis"
                    value={quoteNumber}
                    onChange={(e) => setQuoteNumber(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="date"
                    value={quoteDate}
                    onChange={(e) => setQuoteDate(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="date"
                    value={validUntil}
                    onChange={(e) => setValidUntil(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <select
                    value={tvaRate}
                    onChange={(e) => setTvaRate(parseFloat(e.target.value))}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="0">TVA 0% (Non applicable)</option>
                    <option value="5.5">TVA 5.5%</option>
                    <option value="10">TVA 10%</option>
                    <option value="20">TVA 20%</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Lignes de devis */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">📝 Prestations</h3>
              <div className="space-y-2">
                {items.map((item, index) => (
                  <div key={index} className="flex gap-2 items-center">
                    <input
                      type="text"
                      placeholder="Description"
                      value={item.description}
                      onChange={(e) => updateItem(index, 'description', e.target.value)}
                      className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="number"
                      placeholder="Qté"
                      value={item.quantity}
                      onChange={(e) => updateItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                      className="w-16 px-3 py-2 text-sm text-center border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <select
                      value={item.unit}
                      onChange={(e) => updateItem(index, 'unit', e.target.value)}
                      className="w-24 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="unité">unité</option>
                      <option value="jour">jour</option>
                      <option value="heure">heure</option>
                      <option value="forfait">forfait</option>
                      <option value="mois">mois</option>
                    </select>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="Prix"
                      value={item.unitPrice}
                      onChange={(e) => updateItem(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                      className="w-24 px-3 py-2 text-sm text-right border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {items.length > 1 ? (
                      <button
                        onClick={() => removeItem(index)}
                        className="text-red-600 hover:text-red-700 px-2"
                      >
                        ✕
                      </button>
                    ) : (
                      <div className="w-6"></div>
                    )}
                  </div>
                ))}
              </div>
              <button
                onClick={addItem}
                className="mt-3 text-blue-600 hover:text-blue-700 text-sm font-semibold"
              >
                + Ajouter une prestation
              </button>
            </div>

            {/* Conditions */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">📌 Conditions</h3>
              <textarea
                value={conditions}
                onChange={(e) => setConditions(e.target.value)}
                placeholder="Conditions de paiement, délais, mentions légales..."
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[80px]"
                rows="3"
              />
            </div>

            {/* Totaux */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="flex justify-between mb-2">
                <span className="text-gray-700">Sous-total HT</span>
                <span className="font-semibold">{calculateSubtotal().toFixed(2)} €</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-700">TVA ({tvaRate}%)</span>
                <span className="font-semibold">{calculateTVA(calculateSubtotal()).toFixed(2)} €</span>
              </div>
              <div className="flex justify-between text-lg font-bold border-t pt-2">
                <span>Total TTC</span>
                <span>{calculateTotal().toFixed(2)} €</span>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={generateQuote}
                disabled={isChecking || !companyName || !clientName || !quoteNumber}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                {isChecking ? 'Vérification...' : '👁 Prévisualiser'}
              </button>
              <button
                onClick={saveTemplate}
                className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                💾 Sauvegarder template
              </button>
              <button
                onClick={async () => {
                  await generateQuote();
                  setTimeout(() => window.print(), 100);
                }}
                disabled={isChecking || !companyName || !clientName || !quoteNumber}
                className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                🖨 Imprimer/PDF
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Devis généré */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-6">
              <div className="mb-8 flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold text-blue-600 mb-1">{generatedQuote.company.name}</h2>
                  <p className="text-gray-600 text-sm">{generatedQuote.company.address}</p>
                  <p className="text-gray-500 text-sm">
                    {generatedQuote.company.email} {generatedQuote.company.phone && `• ${generatedQuote.company.phone}`}
                  </p>
                  {generatedQuote.company.siret && (
                    <p className="text-gray-500 text-xs">SIRET: {generatedQuote.company.siret}</p>
                  )}
                </div>
                <div className="text-right">
                  <h1 className="text-3xl font-bold text-gray-800">DEVIS</h1>
                  <p className="text-gray-600">{generatedQuote.quoteNumber}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-8 mb-8">
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-500 text-sm mb-1 font-medium">Client</p>
                  <p className="font-semibold text-lg">{generatedQuote.client.name}</p>
                  <p className="text-gray-600 text-sm">{generatedQuote.client.address}</p>
                  <p className="text-gray-500 text-sm">
                    {generatedQuote.client.email} {generatedQuote.client.phone && `• ${generatedQuote.client.phone}`}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-gray-500 text-sm">
                    Date: <span className="text-gray-800 font-medium">{new Date(generatedQuote.quoteDate).toLocaleDateString('fr-FR')}</span>
                  </p>
                  {generatedQuote.validUntil && (
                    <p className="text-gray-500 text-sm">
                      Valable jusqu'au: <span className="text-gray-800 font-medium">{new Date(generatedQuote.validUntil).toLocaleDateString('fr-FR')}</span>
                    </p>
                  )}
                </div>
              </div>

              <table className="w-full mb-8">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="text-left py-3 px-2 rounded-l-lg text-gray-700">Description</th>
                    <th className="text-center py-3 px-2 text-gray-700">Qté</th>
                    <th className="text-center py-3 px-2 text-gray-700">Unité</th>
                    <th className="text-right py-3 px-2 text-gray-700">Prix unit.</th>
                    <th className="text-right py-3 px-2 rounded-r-lg text-gray-700">Total HT</th>
                  </tr>
                </thead>
                <tbody>
                  {generatedQuote.items.filter(item => item.description).map((item, index) => (
                    <tr key={index} className="border-b border-gray-100">
                      <td className="py-3 px-2">{item.description}</td>
                      <td className="text-center py-3 px-2">{item.quantity}</td>
                      <td className="text-center py-3 px-2">{item.unit}</td>
                      <td className="text-right py-3 px-2">{item.unitPrice.toFixed(2)} €</td>
                      <td className="text-right py-3 px-2 font-medium">{(item.quantity * item.unitPrice).toFixed(2)} €</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="flex justify-end mb-8">
                <div className="w-72 bg-gray-50 rounded-lg p-4">
                  <div className="flex justify-between py-1">
                    <span className="text-gray-600">Total HT</span>
                    <span className="font-medium">{generatedQuote.subtotal.toFixed(2)} €</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-gray-600">TVA ({generatedQuote.tvaRate}%)</span>
                    <span className="font-medium">{generatedQuote.tva.toFixed(2)} €</span>
                  </div>
                  <div className="flex justify-between py-2 border-t-2 border-gray-800 mt-2 font-bold text-xl">
                    <span>Total TTC</span>
                    <span className="text-blue-600">{generatedQuote.total.toFixed(2)} €</span>
                  </div>
                </div>
              </div>

              {generatedQuote.conditions && (
                <div className="border-t border-gray-200 pt-4 mb-8">
                  <p className="text-gray-500 text-sm font-medium mb-2">Conditions</p>
                  <p className="text-gray-600 text-sm whitespace-pre-line">{generatedQuote.conditions}</p>
                </div>
              )}

              <div className="mt-8 pt-4 border-t border-gray-200 grid grid-cols-2 gap-8">
                <div>
                  <p className="text-gray-500 text-sm mb-2">Bon pour accord - Date et signature client :</p>
                  <div className="h-20 border border-dashed border-gray-300 rounded"></div>
                </div>
                <div className="text-right">
                  {generatedQuote.tvaRate === 0 && (
                    <p className="text-gray-400 text-xs">TVA non applicable, art. 293 B du CGI</p>
                  )}
                </div>
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
