import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuota } from '../../hooks/useQuota';

const PasswordGenerator = () => {
  const { t } = useTranslation();
  const { checkAndUseQuota, isChecking, quotaError } = useQuota();
  const [password, setPassword] = useState('');
  const [length, setLength] = useState(16);
  const [useUppercase, setUseUppercase] = useState(true);
  const [useLowercase, setUseLowercase] = useState(true);
  const [useNumbers, setUseNumbers] = useState(true);
  const [useSymbols, setUseSymbols] = useState(true);

  const generatePassword = async () => {
    const result = await checkAndUseQuota('password-generator', 'security');
    if (!result.success) return;

    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const symbols = "!@#$%^&*()_+-=[]{}|;:',.<>?";

    let chars = '';
    if (useUppercase) chars += uppercase;
    if (useLowercase) chars += lowercase;
    if (useNumbers) chars += numbers;
    if (useSymbols) chars += symbols;

    if (!chars) {
      alert(t('toolPages.password.noTypeAlert'));
      return;
    }

    let pwd = '';
    for (let i = 0; i < length; i++) {
      pwd += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setPassword(pwd);
  };

  const copyToClipboard = () => {
    if (!password) return;
    navigator.clipboard.writeText(password);
    alert(t('common.copied'));
  };

  return (
    <div className='min-h-screen bg-gray-50'>
      <div className='container mx-auto px-4 py-8 max-w-4xl'>
        <Link to='/tools' className='text-blue-600 hover:text-blue-700 mb-6 inline-flex items-center gap-2'>
          {t('common.backToTools')}
        </Link>
        <div className='mb-8'>
          <h1 className='text-4xl font-bold text-gray-900 mb-2'>{t('toolPages.password.title')}</h1>
          <p className='text-gray-600'>{t('toolPages.password.subtitle')}</p>
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
          <div className='mb-6'>
            <label className='block text-sm font-medium text-gray-700 mb-2'>{t('toolPages.password.lengthLabel', { length })}</label>
            <input
              type='range'
              min='4'
              max='128'
              value={length}
              onChange={(e) => setLength(parseInt(e.target.value))}
              className='w-full'
            />
          </div>
          <div className='grid grid-cols-2 gap-4 mb-6'>
            <label className='flex items-center gap-2 cursor-pointer'>
              <input
                type='checkbox'
                checked={useUppercase}
                onChange={(e) => setUseUppercase(e.target.checked)}
                className='w-4 h-4'
              />
              <span className='text-sm text-gray-700'>{t('toolPages.password.uppercase')}</span>
            </label>
            <label className='flex items-center gap-2 cursor-pointer'>
              <input
                type='checkbox'
                checked={useLowercase}
                onChange={(e) => setUseLowercase(e.target.checked)}
                className='w-4 h-4'
              />
              <span className='text-sm text-gray-700'>{t('toolPages.password.lowercase')}</span>
            </label>
            <label className='flex items-center gap-2 cursor-pointer'>
              <input
                type='checkbox'
                checked={useNumbers}
                onChange={(e) => setUseNumbers(e.target.checked)}
                className='w-4 h-4'
              />
              <span className='text-sm text-gray-700'>{t('toolPages.password.numbers')}</span>
            </label>
            <label className='flex items-center gap-2 cursor-pointer'>
              <input
                type='checkbox'
                checked={useSymbols}
                onChange={(e) => setUseSymbols(e.target.checked)}
                className='w-4 h-4'
              />
              <span className='text-sm text-gray-700'>{t('toolPages.password.symbols')}</span>
            </label>
          </div>
          <button
            onClick={generatePassword}
            disabled={isChecking}
            className='w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold py-3 px-6 rounded-lg transition-colors mb-4'
          >
            {isChecking ? t('common.verifying') : t('toolPages.password.generateBtn')}
          </button>
        </div>
        {password && (
          <div className='bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center'>
            <h3 className='text-xl font-semibold text-gray-900 mb-4'>{t('toolPages.password.generatedLabel')}</h3>
            <div className='bg-gray-50 p-6 rounded-lg mb-4 border border-gray-200 break-all font-mono text-lg'>
              {password}
            </div>
            <button
              onClick={copyToClipboard}
              className='bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors'
            >
              {t('common.copy')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PasswordGenerator;
