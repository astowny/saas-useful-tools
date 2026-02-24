import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const Footer = () => {
  const { t } = useTranslation();
  const year = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-gray-100 mt-auto">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Brand */}
          <div className="flex items-center gap-2 text-gray-600 text-sm">
            <span className="text-lg">🛠️</span>
            <span className="font-semibold text-gray-900">Useful Tools SaaS</span>
          </div>

          {/* Legal links */}
          <nav className="flex items-center gap-6">
            <Link
              to="/legal/terms"
              className="text-sm text-gray-500 hover:text-gray-800 transition-colors"
            >
              {t('footer.terms')}
            </Link>
            <Link
              to="/legal/privacy"
              className="text-sm text-gray-500 hover:text-gray-800 transition-colors"
            >
              {t('footer.privacy')}
            </Link>
          </nav>

          {/* Copyright */}
          <p className="text-sm text-gray-400">
            {t('footer.copyright', { year })}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

