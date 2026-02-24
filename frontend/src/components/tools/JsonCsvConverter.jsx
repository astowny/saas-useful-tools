import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuota } from '../../hooks/useQuota';

const JsonCsvConverter = () => {
  const { t } = useTranslation();
  const { checkAndUseQuota, isChecking, quotaError } = useQuota();
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [mode, setMode] = useState('json-to-csv');

  const jsonToCsv = (jsonStr) => {
    try {
      const json = JSON.parse(jsonStr);
      const array = Array.isArray(json) ? json : [json];
      
      if (array.length === 0) return '';
      
      const headers = Object.keys(array[0]);
      const csvRows = [headers.join(',')];
      
      for (const row of array) {
        const values = headers.map(header => {
          const val = row[header];
          return typeof val === 'string' && val.includes(',') ? `"${val}"` : val;
        });
        csvRows.push(values.join(','));
      }
      
      return csvRows.join('\n');
    } catch (error) {
      throw new Error(t('toolPages.jsonCsv.invalidJson'));
    }
  };

  const csvToJson = (csvStr) => {
    try {
      const lines = csvStr.trim().split('\n');
      const headers = lines[0].split(',').map(h => h.trim());
      const result = [];
      
      for (let i = 1; i < lines.length; i++) {
        const obj = {};
        const values = lines[i].split(',').map(v => v.trim().replace(/^"|"$/g, ''));
        
        headers.forEach((header, index) => {
          obj[header] = values[index];
        });
        
        result.push(obj);
      }
      
      return JSON.stringify(result, null, 2);
    } catch (error) {
      throw new Error(t('toolPages.jsonCsv.invalidCsv'));
    }
  };

  const handleConvert = async () => {
    const result = await checkAndUseQuota('json-csv-converter', 'developer');
    if (!result.success) return;
    try {
      if (mode === 'json-to-csv') {
        setOutput(jsonToCsv(input));
      } else {
        setOutput(csvToJson(input));
      }
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <Link to="/tools" className="text-blue-600 hover:text-blue-700 mb-6 inline-flex items-center gap-2">
          {t('common.backToTools')}
        </Link>

        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">{t('toolPages.jsonCsv.title')}</h1>
          <p className="text-gray-600">{t('toolPages.jsonCsv.subtitle')}</p>
        </div>

        {quotaError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
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

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex gap-4 mb-6">
            <button
              onClick={() => setMode('json-to-csv')}
              className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-colors ${
                mode === 'json-to-csv' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              JSON → CSV
            </button>
            <button
              onClick={() => setMode('csv-to-json')}
              className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-colors ${
                mode === 'csv-to-json' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              CSV → JSON
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {mode === 'json-to-csv' ? 'JSON' : 'CSV'}
              </label>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows="15"
                placeholder={mode === 'json-to-csv' ? '[{"name":"John","age":30}]' : 'name,age\nJohn,30'}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {mode === 'json-to-csv' ? 'CSV' : 'JSON'}
              </label>
              <textarea
                value={output}
                readOnly
                className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 font-mono text-sm"
                rows="15"
              />
            </div>
          </div>

          <button
            onClick={handleConvert}
            disabled={isChecking}
            className="w-full mt-6 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            {isChecking ? t('common.verifying') : t('toolPages.jsonCsv.convertBtn')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default JsonCsvConverter;

