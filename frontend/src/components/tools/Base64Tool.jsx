import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuota } from '../../hooks/useQuota';

const Base64Tool = () => {
  const { t } = useTranslation();
  const { checkAndUseQuota, isChecking, quotaError } = useQuota();
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [mode, setMode] = useState('encode');

  const handleConvert = async () => {
    const result = await checkAndUseQuota('base64-tool', 'productivity');
    if (!result.success) return;

    if (!input.trim()) {
      alert(t('toolPages.base64.encodeError'));
      return;
    }

    try {
      if (mode === 'encode') {
        setOutput(btoa(input));
      } else {
        setOutput(atob(input));
      }
    } catch (error) {
      alert(t('toolPages.base64.decodeError'));
    }
  };

  const copyToClipboard = () => {
    if (!output) return;
    navigator.clipboard.writeText(output);
    alert(t('common.copied'));
  };

  return (
    <div className='min-h-screen bg-gray-50'>
      <div className='container mx-auto px-4 py-8 max-w-4xl'>
        <Link to='/tools' className='text-blue-600 hover:text-blue-700 mb-6 inline-flex items-center gap-2'>
          {t('common.backToTools')}
        </Link>
        <div className='mb-8'>
          <h1 className='text-4xl font-bold text-gray-900 mb-2'>{t('toolPages.base64.title')}</h1>
          <p className='text-gray-600'>{t('toolPages.base64.subtitle')}</p>
        </div>
        {quotaError && (
          <div className='mb-6 p-4 bg-red-50 border border-red-200 rounded-lg'>
            <div className='flex items-start gap-3'>
              <span className='text-2xl'>⛔</span>
              <div className='flex-1'>
                <h3 className='font-semibold text-red-900 mb-1'>{t('common.limitReached')}</h3>
                <p className='text-sm text-red-800'>{quotaError.message}</p>
                {quotaError.type === 'NO_SUBSCRIPTION' && (
                  <Link to='/pricing' className='inline-block mt-2 text-sm font-semibold text-red-700 underline hover:text-red-600'>
                    {t('common.viewPlans')}
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}
        <div className='bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6'>
          <div className='mb-4'>
            <div className='flex gap-4 mb-4'>
              <label className='flex items-center gap-2 cursor-pointer'>
                <input
                  type='radio'
                  name='mode'
                  value='encode'
                  checked={mode === 'encode'}
                  onChange={(e) => setMode(e.target.value)}
                  className='w-4 h-4'
                />
                <span className='text-sm text-gray-700'>{t('toolPages.base64.encodeBtn')}</span>
              </label>
              <label className='flex items-center gap-2 cursor-pointer'>
                <input
                  type='radio'
                  name='mode'
                  value='decode'
                  checked={mode === 'decode'}
                  onChange={(e) => setMode(e.target.value)}
                  className='w-4 h-4'
                />
                <span className='text-sm text-gray-700'>{t('toolPages.base64.decodeBtn')}</span>
              </label>
            </div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>{mode === 'encode' ? t('toolPages.base64.encodeLabel') : t('toolPages.base64.decodeLabel')}</label>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className='w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
              rows='8'
              placeholder={mode === 'encode' ? t('toolPages.base64.encodePlaceholder') : t('toolPages.base64.decodePlaceholder')}
            />
          </div>
          <button
            onClick={handleConvert}
            disabled={isChecking}
            className='w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold py-3 px-6 rounded-lg transition-colors mb-4'
          >
            {isChecking ? t('common.verifying') : (mode === 'encode' ? t('toolPages.base64.encodeBtn') : t('toolPages.base64.decodeBtn'))}
          </button>
        </div>
        {output && (
          <div className='bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center'>
            <h3 className='text-xl font-semibold text-gray-900 mb-4'>{t('toolPages.base64.result')}</h3>
            <div className='bg-gray-50 p-6 rounded-lg mb-4 border border-gray-200 break-all font-mono text-sm max-h-64 overflow-y-auto'>
              {output}
            </div>
            <button
              onClick={copyToClipboard}
              className='bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors'
            >
              {t('common.copy')}
            </button>
          </div>
        )}
        <div className='bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6'>
          <h4 className='font-semibold text-blue-900 mb-2'>{t('toolPages.base64.aboutTitle')}</h4>
          <p className='text-sm text-blue-800'>{t('toolPages.base64.aboutText')}</p>
        </div>
      </div>
    </div>
  );
};

export default Base64Tool;
