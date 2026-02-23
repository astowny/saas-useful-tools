import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuota } from '../../hooks/useQuota';

const TextDiff = () => {
  const { t } = useTranslation();
  const { checkAndUseQuota, isChecking, quotaError } = useQuota();
  const [text1, setText1] = useState('');
  const [text2, setText2] = useState('');
  const [diff, setDiff] = useState(null);

  const calculateDiff = async () => {
    const result = await checkAndUseQuota('text-diff', 'productivity');
    if (!result.success) return;

    if (!text1.trim() || !text2.trim()) {
      alert(t('toolPages.textDiff.compareBtn'));
      return;
    }

    const lines1 = text1.split('\\n');
    const lines2 = text2.split('\\n');
    const diffResult = [];

    const maxLines = Math.max(lines1.length, lines2.length);
    for (let i = 0; i < maxLines; i++) {
      const line1 = lines1[i] || '';
      const line2 = lines2[i] || '';
      if (line1 === line2) {
        diffResult.push({ type: 'same', content: line1 });
      } else {
        if (line1) diffResult.push({ type: 'removed', content: line1 });
        if (line2) diffResult.push({ type: 'added', content: line2 });
      }
    }
    setDiff(diffResult);
  };

  return (
    <div className='min-h-screen bg-gray-50'>
      <div className='container mx-auto px-4 py-8 max-w-4xl'>
        <Link to='/tools' className='text-blue-600 hover:text-blue-700 mb-6 inline-flex items-center gap-2'>
          {t('common.backToTools')}
        </Link>
        <div className='mb-8'>
          <h1 className='text-4xl font-bold text-gray-900 mb-2'>{t('toolPages.textDiff.title')}</h1>
          <p className='text-gray-600'>{t('toolPages.textDiff.subtitle')}</p>
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
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6 mb-6'>
          <div className='bg-white rounded-xl shadow-sm border border-gray-200 p-6'>
            <label className='block text-sm font-medium text-gray-700 mb-2'>{t('toolPages.textDiff.originalLabel')}</label>
            <textarea
              value={text1}
              onChange={(e) => setText1(e.target.value)}
              className='w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
              rows='8'
              placeholder={t('toolPages.textDiff.originalPlaceholder')}
            />
          </div>
          <div className='bg-white rounded-xl shadow-sm border border-gray-200 p-6'>
            <label className='block text-sm font-medium text-gray-700 mb-2'>{t('toolPages.textDiff.modifiedLabel')}</label>
            <textarea
              value={text2}
              onChange={(e) => setText2(e.target.value)}
              className='w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
              rows='8'
              placeholder={t('toolPages.textDiff.modifiedPlaceholder')}
            />
          </div>
        </div>
        <button
          onClick={calculateDiff}
          disabled={isChecking}
          className='w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold py-3 px-6 rounded-lg transition-colors mb-6'
        >
          {isChecking ? t('common.verifying') : t('toolPages.textDiff.compareBtn')}
        </button>
        {diff && (
          <div className='bg-white rounded-xl shadow-sm border border-gray-200 p-6'>
            <h3 className='text-xl font-semibold text-gray-900 mb-4'>{t('toolPages.textDiff.resultTitle')}</h3>
            <div className='space-y-1 font-mono text-sm'>
              {diff.map((item, idx) => (
                <div
                  key={idx}
                  className={
                    item.type === 'added' ? 'bg-green-50 text-green-900' :
                    item.type === 'removed' ? 'bg-red-50 text-red-900' :
                    'bg-gray-50 text-gray-900'
                  }
                >
                  <span className='inline-block w-6 text-center font-bold'>
                    {item.type === 'added' ? '+' : item.type === 'removed' ? '-' : ' '}
                  </span>
                  {item.content}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TextDiff;
