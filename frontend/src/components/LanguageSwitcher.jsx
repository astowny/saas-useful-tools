import React from 'react';
import { useTranslation } from 'react-i18next';

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();

  const toggle = () => {
    const next = i18n.language === 'en' ? 'fr' : 'en';
    i18n.changeLanguage(next);
    localStorage.setItem('lang', next);
  };

  const isEn = i18n.language?.startsWith('en');

  return (
    <button
      onClick={toggle}
      className="flex items-center gap-1 px-3 py-1.5 text-sm font-semibold bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full border border-gray-200 transition-colors"
      title={isEn ? 'Switch to French' : 'Switch to English'}
    >
      {isEn ? '🇫🇷 FR' : '🇬🇧 EN'}
    </button>
  );
};

export default LanguageSwitcher;

