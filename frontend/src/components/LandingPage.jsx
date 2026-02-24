import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const TOOLS_PREVIEW = [
  { icon: '📱', name: 'QR Generator' },
  { icon: '🔑', name: 'Password Generator' },
  { icon: '🎨', name: 'Color Palette' },
  { icon: '🌅', name: 'Gradient Generator' },
  { icon: '⏱️', name: 'Pomodoro Timer' },
  { icon: '💰', name: 'Freelance Calculator' },
  { icon: '🔐', name: 'Hash Generator' },
  { icon: '📈', name: 'DCA Calculator' },
  { icon: '🎬', name: 'AI Video Generator' },
  { icon: '✍️', name: 'Markdown Editor' },
  { icon: '🔄', name: 'JSON ↔ CSV' },
  { icon: '🔤', name: 'Base64 Tool' },
];

const FEATURES = [
  { icon: '⚡', titleKey: 'landing.features.f1.title', descKey: 'landing.features.f1.desc' },
  { icon: '🔒', titleKey: 'landing.features.f2.title', descKey: 'landing.features.f2.desc' },
  { icon: '🌍', titleKey: 'landing.features.f3.title', descKey: 'landing.features.f3.desc' },
  { icon: '📊', titleKey: 'landing.features.f4.title', descKey: 'landing.features.f4.desc' },
  { icon: '🎨', titleKey: 'landing.features.f5.title', descKey: 'landing.features.f5.desc' },
  { icon: '🏢', titleKey: 'landing.features.f6.title', descKey: 'landing.features.f6.desc' },
];

export default function LandingPage() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <span className="font-bold text-gray-900 text-lg">🛠️ Useful Tools SaaS</span>
          <div className="flex items-center gap-3">
            <Link to="/pricing" className="text-sm font-medium text-gray-600 hover:text-gray-900">{t('nav.pricing')}</Link>
            <Link to="/login" className="text-sm font-medium text-gray-600 hover:text-gray-900">{t('auth.login')}</Link>
            <Link to="/login" className="text-sm font-semibold bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors">
              {t('landing.getStarted')}
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-6 pt-20 pb-16 text-center">
        <div className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
          ✨ {t('landing.badge')}
        </div>
        <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 mb-6 leading-tight">
          {t('landing.hero.title')}
        </h1>
        <p className="text-xl text-gray-500 max-w-2xl mx-auto mb-10">
          {t('landing.hero.subtitle')}
        </p>
        <div className="flex items-center justify-center gap-4 flex-wrap">
          <Link to="/login" className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-8 py-4 rounded-xl text-lg transition-colors shadow-lg shadow-indigo-200">
            {t('landing.hero.cta')} →
          </Link>
          <Link to="/pricing" className="border border-gray-200 text-gray-700 hover:border-gray-300 font-semibold px-8 py-4 rounded-xl text-lg transition-colors">
            {t('landing.hero.seePricing')}
          </Link>
        </div>
        <p className="mt-4 text-sm text-gray-400">{t('landing.hero.noCreditCard')}</p>
      </section>

      {/* Tools preview grid */}
      <section className="max-w-7xl mx-auto px-6 pb-20">
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
          {TOOLS_PREVIEW.map((tool, i) => (
            <div key={i} className="flex flex-col items-center gap-2 p-4 bg-gray-50 hover:bg-indigo-50 border border-gray-100 hover:border-indigo-200 rounded-xl transition-all cursor-default">
              <span className="text-2xl">{tool.icon}</span>
              <span className="text-xs text-gray-600 text-center font-medium leading-tight">{tool.name}</span>
            </div>
          ))}
        </div>
        <p className="text-center text-sm text-gray-400 mt-4">{t('landing.toolsCount')}</p>
      </section>

      {/* Features */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">{t('landing.features.title')}</h2>
          <p className="text-gray-500 text-center mb-12 max-w-xl mx-auto">{t('landing.features.subtitle')}</p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((f, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-100 p-6 hover:shadow-md transition-shadow">
                <div className="text-3xl mb-3">{f.icon}</div>
                <h3 className="font-semibold text-gray-900 mb-1">{t(f.titleKey)}</h3>
                <p className="text-sm text-gray-500">{t(f.descKey)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing teaser */}
      <section className="max-w-7xl mx-auto px-6 py-20 text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">{t('landing.pricing.title')}</h2>
        <p className="text-gray-500 mb-8">{t('landing.pricing.subtitle')}</p>
        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-10">
          {[
            { name: 'Free', price: '$0', features: ['10 uses/day', '6 tools categories', 'EN & FR support'], cta: t('landing.getStarted'), highlight: false },
            { name: 'Pro', price: '$9.99/mo', features: ['1,000 uses/day', 'All tools', 'AI Video generator', 'Priority support'], cta: t('common.upgrade'), highlight: true },
            { name: 'Enterprise', price: '$49.99/mo', features: ['Unlimited uses', 'API access', 'White-label', 'SLA 99.9%'], cta: t('landing.contactUs'), highlight: false },
          ].map((plan, i) => (
            <div key={i} className={`rounded-xl border p-6 text-left ${plan.highlight ? 'border-indigo-500 ring-2 ring-indigo-500 ring-offset-2' : 'border-gray-200'}`}>
              {plan.highlight && <div className="text-xs font-bold text-indigo-600 mb-2">⭐ MOST POPULAR</div>}
              <div className="text-xl font-bold text-gray-900">{plan.name}</div>
              <div className="text-3xl font-extrabold text-gray-900 mt-1 mb-4">{plan.price}</div>
              <ul className="space-y-2 mb-6">
                {plan.features.map((f, j) => <li key={j} className="text-sm text-gray-600 flex items-center gap-2"><span className="text-green-500">✓</span>{f}</li>)}
              </ul>
              <Link to="/login" className={`block text-center font-semibold py-2 px-4 rounded-lg transition-colors ${plan.highlight ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'border border-gray-300 text-gray-700 hover:border-gray-400'}`}>
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Banner */}
      <section className="bg-indigo-600 py-16 text-center text-white">
        <h2 className="text-3xl font-bold mb-3">{t('landing.cta.title')}</h2>
        <p className="text-indigo-200 mb-8">{t('landing.cta.subtitle')}</p>
        <Link to="/login" className="bg-white text-indigo-600 hover:bg-indigo-50 font-semibold px-8 py-4 rounded-xl text-lg transition-colors">
          {t('landing.getStarted')} →
        </Link>
      </section>
    </div>
  );
}

