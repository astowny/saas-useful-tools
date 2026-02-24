import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const ToolsPage = () => {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  const tools = useMemo(() => ({
    utilities: [
      { name: t('tools.list.qrGenerator.name'), icon: "📱", desc: t('tools.list.qrGenerator.desc'), route: "/tools/qr-generator" },
      { name: t('tools.list.jsonCsv.name'), icon: "🔄", desc: t('tools.list.jsonCsv.desc'), route: "/tools/json-csv" },
      { name: t('tools.list.passwordGenerator.name'), icon: "🔑", desc: t('tools.list.passwordGenerator.desc'), route: "/tools/password-generator" },
      { name: t('tools.list.base64.name'), icon: "🔤", desc: t('tools.list.base64.desc'), route: "/tools/base64" },
      { name: t('tools.list.textDiff.name'), icon: "📝", desc: t('tools.list.textDiff.desc'), route: "/tools/text-diff" },
      { name: t('tools.list.minifier.name'), icon: "📦", desc: t('tools.list.minifier.desc'), route: "/tools/minifier" }
    ],
    design: [
      { name: t('tools.list.colorPalette.name'), icon: "🎨", desc: t('tools.list.colorPalette.desc'), route: "/tools/color-palette" },
      { name: t('tools.list.colorConverter.name'), icon: "🌈", desc: t('tools.list.colorConverter.desc'), route: "/tools/color-converter" },
      { name: t('tools.list.gradientGenerator.name'), icon: "🌅", desc: t('tools.list.gradientGenerator.desc'), route: "/tools/gradient-generator" },
      { name: t('tools.list.boxShadow.name'), icon: "📦", desc: t('tools.list.boxShadow.desc'), route: "/tools/box-shadow" },
      { name: t('tools.list.faviconGenerator.name'), icon: "🖼️", desc: t('tools.list.faviconGenerator.desc'), route: "/tools/favicon-generator" }
    ],
    productivity: [
      { name: t('tools.list.pomodoro.name'), icon: "⏱️", desc: t('tools.list.pomodoro.desc'), route: "/tools/pomodoro" },
      { name: t('tools.list.freelanceCalculator.name'), icon: "💰", desc: t('tools.list.freelanceCalculator.desc'), route: "/tools/freelance-calculator" },
      { name: t('tools.list.invoiceGenerator.name'), icon: "🧾", desc: t('tools.list.invoiceGenerator.desc'), route: "/tools/invoice-generator" },
      { name: t('tools.list.quoteGenerator.name'), icon: "📋", desc: t('tools.list.quoteGenerator.desc'), route: "/tools/quote-generator" },
      { name: t('tools.list.kanban.name'), icon: "📊", desc: t('tools.list.kanban.desc'), route: "/tools/kanban" },
      { name: t('tools.list.markdownEditor.name'), icon: "✍️", desc: t('tools.list.markdownEditor.desc'), route: "/tools/markdown-editor" }
    ],
    security: [
      { name: t('tools.list.hashGenerator.name'), icon: "🔐", desc: t('tools.list.hashGenerator.desc'), route: "/tools/hash-generator" },
      { name: t('tools.list.jwtDecoder.name'), icon: "🔓", desc: t('tools.list.jwtDecoder.desc'), route: "/tools/jwt-decoder" }
    ],
    finance: [
      { name: t('tools.list.dcaCalculator.name'), icon: "📈", desc: t('tools.list.dcaCalculator.desc'), route: "/tools/dca-calculator" },
      { name: t('tools.list.impermanentLoss.name'), icon: "💸", desc: t('tools.list.impermanentLoss.desc'), route: "/tools/impermanent-loss" }
    ],
    ai: [
      { name: t('tools.list.videoGenerator.name'), icon: "🎬", desc: t('tools.list.videoGenerator.desc'), route: "/tools/video-generator" }
    ]
  }), [t]);

  const categories = useMemo(() => [
    { id: 'utilities', name: t('tools.categories.utilities'), color: 'blue' },
    { id: 'design', name: t('tools.categories.design'), color: 'purple' },
    { id: 'productivity', name: t('tools.categories.productivity'), color: 'green' },
    { id: 'security', name: t('tools.categories.security'), color: 'red' },
    { id: 'finance', name: t('tools.categories.finance'), color: 'yellow' },
    { id: 'ai', name: t('tools.categories.ai'), color: 'indigo' }
  ], [t]);

  // Filtered tools based on search + active category
  const filteredCategories = useMemo(() => {
    const q = search.toLowerCase().trim();
    return categories
      .filter(cat => activeCategory === 'all' || cat.id === activeCategory)
      .map(cat => ({
        ...cat,
        items: tools[cat.id].filter(tool =>
          !q || tool.name.toLowerCase().includes(q) || tool.desc.toLowerCase().includes(q)
        )
      }))
      .filter(cat => cat.items.length > 0);
  }, [search, activeCategory, categories, tools]);

  const totalResults = filteredCategories.reduce((acc, c) => acc + c.items.length, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {t('tools.pageTitle')}
          </h1>
          <p className="text-xl text-gray-600">
            {t('tools.pageSubtitle')}
          </p>
        </div>

        {/* Search bar */}
        <div className="max-w-xl mx-auto mb-6">
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg">🔍</span>
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={t('tools.searchPlaceholder')}
              className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-sm"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-lg"
              >✕</button>
            )}
          </div>
        </div>

        {/* Category filter tabs */}
        <div className="flex flex-wrap gap-2 justify-center mb-10">
          <button
            onClick={() => setActiveCategory('all')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${activeCategory === 'all' ? 'bg-indigo-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-indigo-300'}`}
          >
            {t('tools.allCategories')}
          </button>
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${activeCategory === cat.id ? 'bg-indigo-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-indigo-300'}`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* No results */}
        {totalResults === 0 && (
          <div className="text-center py-16 text-gray-400">
            <div className="text-5xl mb-4">🔍</div>
            <p className="text-lg">{t('tools.noResults', { query: search })}</p>
            <button onClick={() => { setSearch(''); setActiveCategory('all'); }} className="mt-4 text-indigo-600 hover:underline text-sm">{t('tools.clearSearch')}</button>
          </div>
        )}

        {/* Tools by category */}
        {filteredCategories.map(category => (
          <div key={category.id} className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {category.name}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {category.items.map((tool, index) => (
                <Link
                  key={index}
                  to={tool.route}
                  className="block p-6 bg-white rounded-xl border border-gray-200 hover:border-blue-500 hover:shadow-lg transition-all group"
                >
                  <div className="text-4xl mb-3">{tool.icon}</div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
                    {tool.name}
                  </h3>
                  <p className="text-gray-600 text-sm">{tool.desc}</p>
                </Link>
              ))}
            </div>
          </div>
        ))}

        {/* Info box */}
        <div className="mt-12 p-6 bg-blue-50 border border-blue-200 rounded-xl">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">
            {t('tools.tipTitle')}
          </h3>
          <p className="text-blue-800">
            {t('tools.tipText')}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ToolsPage;
