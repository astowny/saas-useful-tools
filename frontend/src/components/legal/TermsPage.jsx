import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const TermsPage = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-6 py-12">
        <Link to="/" className="text-sm text-indigo-600 hover:text-indigo-700 mb-6 inline-block">← {t('notFound.backHome')}</Link>
        <h1 className="text-4xl font-bold text-gray-900 mb-2">{t('footer.terms')}</h1>
        <p className="text-gray-500 mb-10">{t('legal.lastUpdated', { date: 'February 2026' })}</p>

        <div className="prose prose-gray max-w-none space-y-8">
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">1. {t('legal.terms.s1.title')}</h2>
            <p className="text-gray-600">{t('legal.terms.s1.body')}</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">2. {t('legal.terms.s2.title')}</h2>
            <p className="text-gray-600">{t('legal.terms.s2.body')}</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">3. {t('legal.terms.s3.title')}</h2>
            <p className="text-gray-600">{t('legal.terms.s3.body')}</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">4. {t('legal.terms.s4.title')}</h2>
            <p className="text-gray-600">{t('legal.terms.s4.body')}</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">5. {t('legal.terms.s5.title')}</h2>
            <p className="text-gray-600">{t('legal.terms.s5.body')}</p>
          </section>

          <section className="bg-indigo-50 border border-indigo-100 rounded-xl p-6">
            <p className="text-sm text-gray-600">
              {t('legal.contact')}: <a href="mailto:astowny@gmail.com" className="text-indigo-600 hover:underline">astowny@gmail.com</a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default TermsPage;

