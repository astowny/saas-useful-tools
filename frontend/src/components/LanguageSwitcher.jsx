import React from 'react';
import { useTranslation } from 'react-i18next';

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();

  const toggle = () => {
    const next = i18n.language === 'en' ? 'fr' : 'en';
    i18n.changeLanguage(next);
    localStorage.setItem('lang', next);
  };

  return (
    <button
      onClick={toggle}
      className="px-3 py-1 text-sm font-medium border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
      title={i18n.language === 'en' ? 'Switch to French' : 'Passer en anglais'}
    >
      {i18n.language === 'en' ? '🇫🇷 FR' : '🇬🇧 EN'}
    </button>
  );
};

export default LanguageSwitcher;

