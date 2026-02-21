import React from 'react';
import { Link } from 'react-router-dom';

const ToolsPage = () => {
  const tools = {
    utilities: [
      { name: "Générateur QR Code", icon: "📱", desc: "Génère des QR codes", route: "/tools/qr-generator" },
      { name: "JSON ↔ CSV", icon: "🔄", desc: "Convertit entre formats", route: "/tools/json-csv" },
      { name: "Générateur de mots de passe", icon: "🔑", desc: "Mots de passe sécurisés", route: "/tools/password-generator" },
      { name: "Base64 Encoder/Decoder", icon: "🔤", desc: "Encode/décode Base64", route: "/tools/base64" },
      { name: "Diff de texte", icon: "📝", desc: "Compare deux textes", route: "/tools/text-diff" },
      { name: "Minifieur CSS/JS", icon: "📦", desc: "Compresse le code", route: "/tools/minifier" }
    ],
    design: [
      { name: "Générateur de palettes", icon: "🎨", desc: "Palettes de couleurs", route: "/tools/color-palette" },
      { name: "Convertisseur couleurs", icon: "🌈", desc: "RGB, HEX, HSL...", route: "/tools/color-converter" },
      { name: "Générateur gradients", icon: "🌅", desc: "Dégradés CSS", route: "/tools/gradient-generator" },
      { name: "Box-shadow Generator", icon: "📦", desc: "Ombres CSS", route: "/tools/box-shadow" },
      { name: "Favicon Generator", icon: "🖼️", desc: "Créer des favicons", route: "/tools/favicon-generator" }
    ],
    productivity: [
      { name: "Pomodoro Timer", icon: "⏱️", desc: "Gestion du temps", route: "/tools/pomodoro" },
      { name: "Calculateur Freelance", icon: "💰", desc: "Tarifs freelance", route: "/tools/freelance-calculator" },
      { name: "Générateur de factures", icon: "🧾", desc: "Créer des factures", route: "/tools/invoice-generator" },
      { name: "Générateur de devis", icon: "📋", desc: "Créer des devis", route: "/tools/quote-generator" },
      { name: "Kanban Board", icon: "📊", desc: "Gestion de tâches", route: "/tools/kanban" },
      { name: "Markdown Editor", icon: "✍️", desc: "Éditeur Markdown", route: "/tools/markdown-editor" }
    ],
    security: [
      { name: "Hash Generator", icon: "🔐", desc: "MD5, SHA-256...", route: "/tools/hash-generator" },
      { name: "JWT Decoder", icon: "🔓", desc: "Décoder les JWT", route: "/tools/jwt-decoder" }
    ],
    finance: [
      { name: "Calculateur DCA", icon: "📈", desc: "Dollar Cost Averaging", route: "/tools/dca-calculator" },
      { name: "Impermanent Loss", icon: "💸", desc: "Calcul de perte", route: "/tools/impermanent-loss" }
    ]
  };

  const categories = [
    { id: 'utilities', name: '🛠️ Utilitaires', color: 'blue' },
    { id: 'design', name: '🎨 Design', color: 'purple' },
    { id: 'productivity', name: '⚡ Productivité', color: 'green' },
    { id: 'security', name: '🔒 Sécurité', color: 'red' },
    { id: 'finance', name: '💰 Finance', color: 'yellow' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🧰 Boîte à outils
          </h1>
          <p className="text-xl text-gray-600">
            Tous les outils dont vous avez besoin, au même endroit
          </p>
        </div>

        {/* Tools by category */}
        {categories.map(category => (
          <div key={category.id} className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {category.name}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tools[category.id].map((tool, index) => (
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
            💡 Astuce
          </h3>
          <p className="text-blue-800">
            Tous les outils sont gratuits et fonctionnent directement dans votre navigateur. 
            Vos données restent privées et ne sont jamais envoyées à nos serveurs.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ToolsPage;

