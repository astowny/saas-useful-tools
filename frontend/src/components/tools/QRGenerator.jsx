import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuota } from '../../hooks/useQuota';

const QRGenerator = () => {
  const { t } = useTranslation();
  const { checkAndUseQuota, isChecking, quotaError } = useQuota();
  const [text, setText] = useState('');
  const [size, setSize] = useState(256);
  const [fgColor, setFgColor] = useState('#000000');
  const [bgColor, setBgColor] = useState('#ffffff');
  const [qrCode, setQrCode] = useState('');

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/qrious@4.0.2/dist/qrious.min.js';
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const generateQR = async () => {
    const result = await checkAndUseQuota('qr-generator', 'productivity');
    if (!result.success) return;
    if (!text.trim()) {
      alert(t('toolPages.qr.emptyAlert'));
      return;
    }
    if (window.QRious) {
      const canvas = document.createElement('canvas');
      new window.QRious({
        element: canvas,
        value: text,
        size: size,
        foreground: fgColor,
        background: bgColor,
        level: 'M'
      });
      setQrCode(canvas.toDataURL('image/png'));
    }
  };

  const downloadQR = () => {
    if (!qrCode) return;
    const link = document.createElement('a');
    link.download = 'qrcode.png';
    link.href = qrCode;
    link.click();
  };

  return (
    <div className='min-h-screen bg-gray-50'>
      <div className='container mx-auto px-4 py-8 max-w-4xl'>
        <Link to='/tools' className='text-blue-600 hover:text-blue-700 mb-6 inline-flex items-center gap-2'>
          {t('common.backToTools')}
        </Link>
        <div className='mb-8'>
          <h1 className='text-4xl font-bold text-gray-900 mb-2'>{t('toolPages.qr.title')}</h1>
          <p className='text-gray-600'>{t('toolPages.qr.subtitle')}</p>
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
            <label className='block text-sm font-medium text-gray-700 mb-2'>{t('toolPages.qr.textLabel')}</label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              className='w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
              rows='4'
              placeholder={t('toolPages.qr.placeholder')}
            />
          </div>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-6'>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>{t('toolPages.qr.sizeLabel', { size })}</label>
              <input
                type='range'
                min='128'
                max='512'
                value={size}
                onChange={(e) => setSize(parseInt(e.target.value))}
                className='w-full'
              />
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>{t('toolPages.qr.colorLabel')}</label>
              <input
                type='color'
                value={fgColor}
                onChange={(e) => setFgColor(e.target.value)}
                className='w-full h-10 rounded cursor-pointer border border-gray-300'
              />
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>{t('toolPages.qr.bgLabel')}</label>
              <input
                type='color'
                value={bgColor}
                onChange={(e) => setBgColor(e.target.value)}
                className='w-full h-10 rounded cursor-pointer border border-gray-300'
              />
            </div>
          </div>
          <button
            onClick={generateQR}
            disabled={isChecking}
            className='w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold py-3 px-6 rounded-lg transition-colors'
          >
            {isChecking ? t('common.verifying') : t('toolPages.qr.generateBtn')}
          </button>
        </div>
        {qrCode && (
          <div className='bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center'>
            <h3 className='text-xl font-semibold text-gray-900 mb-4'>{t('toolPages.qr.yourCode')}</h3>
            <div className='bg-gray-50 p-6 rounded-lg inline-block mb-4 border border-gray-200'>
              <img src={qrCode} alt='QR Code' className='max-w-full' />
            </div>
            <div>
              <button
                onClick={downloadQR}
                className='bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors'
              >
                {t('toolPages.qr.downloadBtn')}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QRGenerator;
