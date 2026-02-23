import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuota } from '../../hooks/useQuota';

const InvoiceGenerator = () => {
  const { t, i18n } = useTranslation();
  const { checkAndUseQuota, isChecking, quotaError } = useQuota();

  // Informations entreprise
  const [companyName, setCompanyName] = useState('');
  const [companyAddress, setCompanyAddress] = useState('');
  const [companyEmail] = useState('');
  const [companyPhone] = useState('');
  const [companySiret, setCompanySiret] = useState('');

  // Informations client
  const [clientName, setClientName] = useState('');
  const [clientAddress, setClientAddress] = useState('');
  const [clientEmail] = useState('');
  const [clientSiret, setClientSiret] = useState('');

  // Informations facture
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState(
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [tvaRate, setTvaRate] = useState(20);

  // Coordonnées bancaires
  const [iban, setIban] = useState('');
  const [bic, setBic] = useState('');
  const [showBank, setShowBank] = useState(false);

  // Notes
  const [notes, setNotes] = useState('');

  // Options d'impression
  const [hidePrintHeaders, setHidePrintHeaders] = useState(true);

  // Lignes de facture
  const [items, setItems] = useState([
    { description: '', quantity: 1, unitPrice: 0 }
  ]);

  const [generatedInvoice, setGeneratedInvoice] = useState(null);

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
    return subtotal * (tvaRate / 100);
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    return subtotal + calculateTVA(subtotal);
  };

  const generateInvoice = async () => {
    // Vérifier le quota avant de générer
    const result = await checkAndUseQuota('invoice-generator', 'productivity');

    if (!result.success) {
      return; // L'erreur est déjà gérée par le hook
    }

    const invoice = {
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
        siret: clientSiret
      },
      invoiceNumber,
      invoiceDate,
      dueDate,
      items,
      subtotal: calculateSubtotal(),
      tva: calculateTVA(calculateSubtotal()),
      total: calculateTotal(),
      tvaRate,
      bank: showBank ? { iban, bic } : null,
      notes
    };

    setGeneratedInvoice(invoice);
  };

  const printInvoice = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <Link to="/tools" className="text-blue-600 hover:text-blue-700 mb-6 inline-flex items-center gap-2 no-print">
          {t('common.backToTools')}
        </Link>

        <div className="mb-8 no-print">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">{t('toolPages.invoice.title')}</h1>
          <p className="text-gray-600">{t('toolPages.invoice.subtitle')}</p>
        </div>

        {/* Affichage des erreurs de quota */}
        {quotaError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg no-print">
            <div className="flex items-start gap-3">
              <span className="text-2xl">⛔</span>
              <div className="flex-1">
                <h3 className="font-semibold text-red-900 mb-1">{t('common.limitReached')}</h3>
                <p className="text-sm text-red-800">{quotaError.message}</p>
                {quotaError.type === 'NO_SUBSCRIPTION' && (
                  <Link to="/pricing" className="inline-block mt-2 text-sm font-semibold text-red-700 underline hover:text-red-600">
                    {t('common.viewPlans')}
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}

        {!generatedInvoice ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 no-print">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {/* Informations entreprise */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">{t('toolPages.invoice.emitterTitle')}</h3>
                <div className="space-y-2">
                  <input
                    type="text"
                    placeholder={t('toolPages.invoice.companyPlaceholder')}
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="text"
                    placeholder={t('toolPages.invoice.addressPlaceholder')}
                    value={companyAddress}
                    onChange={(e) => setCompanyAddress(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="text"
                    placeholder={t('toolPages.invoice.siretPlaceholder')}
                    value={companySiret}
                    onChange={(e) => setCompanySiret(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Informations client */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">{t('toolPages.invoice.clientTitle')}</h3>
                <div className="space-y-2">
                  <input
                    type="text"
                    placeholder={t('toolPages.invoice.clientNamePlaceholder')}
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="text"
                    placeholder={t('toolPages.invoice.clientAddressPlaceholder')}
                    value={clientAddress}
                    onChange={(e) => setClientAddress(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="text"
                    placeholder={t('toolPages.invoice.clientSiretPlaceholder')}
                    value={clientSiret}
                    onChange={(e) => setClientSiret(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Informations facture */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">{t('toolPages.invoice.invoiceInfoTitle')}</h3>
                <div className="space-y-2">
                  <input
                    type="text"
                    placeholder={t('toolPages.invoice.invoiceNumberPlaceholder')}
                    value={invoiceNumber}
                    onChange={(e) => setInvoiceNumber(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="date"
                    value={invoiceDate}
                    onChange={(e) => setInvoiceDate(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <select
                    value={tvaRate}
                    onChange={(e) => setTvaRate(parseFloat(e.target.value))}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="0">{t('toolPages.invoice.tvaOptions.zero')}</option>
                    <option value="5.5">{t('toolPages.invoice.tvaOptions.five')}</option>
                    <option value="10">{t('toolPages.invoice.tvaOptions.ten')}</option>
                    <option value="20">{t('toolPages.invoice.tvaOptions.twenty')}</option>
                  </select>
                </div>
              </div>

              {/* Coordonnées bancaires */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">{t('toolPages.invoice.bankTitle')}</h3>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showBank}
                      onChange={(e) => setShowBank(e.target.checked)}
                      className="rounded"
                    />
                    <span>{t('toolPages.invoice.showOnInvoice')}</span>
                  </label>
                  <input
                    type="text"
                    placeholder="IBAN"
                    value={iban}
                    onChange={(e) => setIban(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                  />
                  <input
                    type="text"
                    placeholder="BIC"
                    value={bic}
                    onChange={(e) => setBic(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Lignes de facture */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">{t('toolPages.invoice.billingLinesTitle')}</h3>
              <div className="space-y-2">
                {items.map((item, index) => (
                  <div key={index} className="flex gap-2 items-center">
                    <input
                      type="text"
                      placeholder={t('toolPages.invoice.descriptionPlaceholder')}
                      value={item.description}
                      onChange={(e) => updateItem(index, 'description', e.target.value)}
                      className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="number"
                      placeholder={t('toolPages.invoice.qtyLabel')}
                      value={item.quantity}
                      onChange={(e) => updateItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                      className="w-20 px-3 py-2 text-sm text-center border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="number"
                      step="0.01"
                      placeholder={t('toolPages.invoice.priceHTPlaceholder')}
                      value={item.unitPrice}
                      onChange={(e) => updateItem(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                      className="w-28 px-3 py-2 text-sm text-right border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                {t('toolPages.invoice.addLine')}
              </button>
            </div>

            {/* Notes & Mentions */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">{t('toolPages.invoice.notesTitle')}</h3>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={t('toolPages.invoice.notesPlaceholder')}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[80px]"
              />
            </div>

            {/* Options d'impression */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">{t('toolPages.invoice.printOptionsTitle')}</h3>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={hidePrintHeaders}
                  onChange={(e) => setHidePrintHeaders(e.target.checked)}
                  className="rounded"
                />
                <span>{t('toolPages.invoice.hidePrintHeaders')}</span>
              </label>
            </div>

            {/* Totaux */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="flex justify-between mb-2">
                <span className="text-gray-700">{t('toolPages.invoice.subtotalHT')}</span>
                <span className="font-semibold">{calculateSubtotal().toFixed(2)} €</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-700">{t('toolPages.invoice.tvaLabel', { rate: tvaRate })}</span>
                <span className="font-semibold">{calculateTVA(calculateSubtotal()).toFixed(2)} €</span>
              </div>
              <div className="flex justify-between text-lg font-bold border-t pt-2">
                <span>{t('toolPages.invoice.totalTTC')}</span>
                <span>{calculateTotal().toFixed(2)} €</span>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={generateInvoice}
                disabled={isChecking || !companyName || !clientName || !invoiceNumber}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                {isChecking ? t('common.verifying') : t('toolPages.invoice.previewBtn')}
              </button>
              <button
                onClick={async () => {
                  await generateInvoice();
                  setTimeout(() => window.print(), 100);
                }}
                disabled={isChecking || !companyName || !clientName || !invoiceNumber}
                className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                {t('toolPages.invoice.printBtn')}
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Facture générée */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-6">
              <div className="mb-8 flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold text-blue-600 mb-1">{generatedInvoice.company.name}</h2>
                  <p className="text-gray-600 text-sm">{generatedInvoice.company.address}</p>
                  {generatedInvoice.company.siret && (
                    <p className="text-gray-500 text-xs">SIRET: {generatedInvoice.company.siret}</p>
                  )}
                </div>
                <div className="text-right">
                  <h1 className="text-3xl font-bold text-gray-900">{t('toolPages.invoice.invoiceTitle')}</h1>
                  <p className="text-gray-600">{generatedInvoice.invoiceNumber}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-8 mb-8">
                <div>
                  <p className="text-gray-500 text-sm mb-1">{t('toolPages.invoice.billedTo')}</p>
                  <p className="font-semibold">{generatedInvoice.client.name}</p>
                  <p className="text-gray-600 text-sm">{generatedInvoice.client.address}</p>
                  {generatedInvoice.client.siret && (
                    <p className="text-gray-500 text-xs">SIRET: {generatedInvoice.client.siret}</p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-gray-500 text-sm">
                    {t('toolPages.invoice.dateLabel')} <span className="text-gray-800">{new Date(generatedInvoice.invoiceDate).toLocaleDateString(i18n.language)}</span>
                  </p>
                  {generatedInvoice.dueDate && (
                    <p className="text-gray-500 text-sm">
                      {t('toolPages.invoice.dueDateLabel')} <span className="text-gray-800">{new Date(generatedInvoice.dueDate).toLocaleDateString(i18n.language)}</span>
                    </p>
                  )}
                </div>
              </div>

              <table className="w-full mb-8">
                <thead>
                  <tr className="border-b-2 border-gray-200">
                    <th className="text-left py-2 text-gray-700">{t('toolPages.invoice.descriptionPlaceholder')}</th>
                    <th className="text-right py-2 text-gray-700">{t('toolPages.invoice.qtyLabel')}</th>
                    <th className="text-right py-2 text-gray-700">{t('toolPages.invoice.unitPriceLabel')}</th>
                    <th className="text-right py-2 text-gray-700">{t('toolPages.invoice.totalHTLabel')}</th>
                  </tr>
                </thead>
                <tbody>
                  {generatedInvoice.items.filter(item => item.description).map((item, index) => (
                    <tr key={index} className="border-b border-gray-100">
                      <td className="py-2">{item.description}</td>
                      <td className="text-right py-2">{item.quantity}</td>
                      <td className="text-right py-2">{item.unitPrice.toFixed(2)} €</td>
                      <td className="text-right py-2">{(item.quantity * item.unitPrice).toFixed(2)} €</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="flex justify-end mb-6">
                <div className="w-72">
                  <div className="flex justify-between py-2">
                    <span className="text-gray-700">{t('toolPages.invoice.totalHTLabel')}</span>
                    <span className="font-semibold">{generatedInvoice.subtotal.toFixed(2)} €</span>
                  </div>
                  {generatedInvoice.tvaRate > 0 ? (
                    <>
                      <div className="flex justify-between py-2">
                        <span className="text-gray-700">{t('toolPages.invoice.tvaLabel', { rate: generatedInvoice.tvaRate })}</span>
                        <span className="font-semibold">{generatedInvoice.tva.toFixed(2)} €</span>
                      </div>
                      <div className="flex justify-between py-2 border-t-2 border-gray-800 font-bold text-lg">
                        <span>{t('toolPages.invoice.totalTTC')}</span>
                        <span>{generatedInvoice.total.toFixed(2)} €</span>
                      </div>
                    </>
                  ) : (
                    <div className="flex justify-between py-2 border-t-2 border-gray-800 font-bold text-lg">
                      <span>{t('toolPages.invoice.totalTTC')}</span>
                      <span>{generatedInvoice.total.toFixed(2)} €</span>
                    </div>
                  )}
                </div>
              </div>

              {generatedInvoice.bank && (generatedInvoice.bank.iban || generatedInvoice.bank.bic) && (
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <p className="text-gray-600 text-sm font-semibold mb-2">{t('toolPages.invoice.bankDetailsTitle')}</p>
                  {generatedInvoice.bank.iban && (
                    <p className="text-gray-700 text-sm font-mono">IBAN: {generatedInvoice.bank.iban}</p>
                  )}
                  {generatedInvoice.bank.bic && (
                    <p className="text-gray-700 text-sm font-mono">BIC: {generatedInvoice.bank.bic}</p>
                  )}
                </div>
              )}

              {generatedInvoice.notes && (
                <div className="mt-6 pt-4 border-t border-gray-200 text-gray-600 text-sm">
                  <p className="font-semibold text-gray-700 mb-2">{t('toolPages.invoice.notesLabel')}</p>
                  <p className="whitespace-pre-line">{generatedInvoice.notes}</p>
                </div>
              )}

              {generatedInvoice.tvaRate === 0 && (
                <p className="text-gray-500 text-xs mt-8 text-center">
                  {t('toolPages.invoice.vatNotApplicable')}
                </p>
              )}
            </div>

            <div className="flex gap-4 no-print">
              <button
                onClick={() => setGeneratedInvoice(null)}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                {t('toolPages.invoice.newInvoiceBtn')}
              </button>
              <button
                onClick={printInvoice}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                {t('toolPages.invoice.printPdfBtn')}
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
            background: white !important;
          }
          ${hidePrintHeaders ? `
            @page {
              margin: 0;
            }
            body {
              margin: 1.5cm;
            }
          ` : ''}
        }
      `}</style>
    </div>
  );
};

export default InvoiceGenerator;


