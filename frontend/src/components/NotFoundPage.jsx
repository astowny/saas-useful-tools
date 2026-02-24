import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';

const NotFoundPage = () => {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="text-8xl font-black text-indigo-100 select-none mb-2">404</div>
        <div className="text-5xl mb-4">🔍</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-3">{t('notFound.title')}</h1>
        <p className="text-gray-500 mb-8">{t('notFound.message')}</p>
        <Link
          to={isAuthenticated ? '/dashboard' : '/'}
          className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors"
        >
          ← {t('notFound.backHome')}
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;

