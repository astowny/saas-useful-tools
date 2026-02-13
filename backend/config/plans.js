/**
 * Configuration des plans d'abonnement
 * Ces plans sont insérés dans la base de données lors de l'initialisation
 */

const PLANS = {
  FREE: {
    name: 'free',
    displayName: 'Free',
    priceMonthly: 0,
    priceYearly: 0,
    limits: {
      daily_usage: 10,
      monthly_usage: 100
    },
    features: [
      'Accès à tous les outils',
      '10 utilisations par jour',
      '100 utilisations par mois',
      'Support communautaire',
      'Publicités affichées'
    ],
    description: 'Parfait pour découvrir nos outils'
  },

  PRO: {
    name: 'pro',
    displayName: 'Pro',
    priceMonthly: 9.99,
    priceYearly: 99.99, // ~17% de réduction
    limits: {
      daily_usage: 1000,
      monthly_usage: 30000
    },
    features: [
      'Tout du plan Free',
      '1000 utilisations par jour',
      '30 000 utilisations par mois',
      'Support prioritaire par email',
      'Export avancé (PDF, formats multiples)',
      'Pas de publicité',
      'Historique d\'utilisation 1 an',
      'Accès anticipé aux nouvelles fonctionnalités'
    ],
    description: 'Pour les professionnels et utilisateurs réguliers',
    popular: true
  },

  ENTERPRISE: {
    name: 'enterprise',
    displayName: 'Enterprise',
    priceMonthly: 49.99,
    priceYearly: 499.99, // ~17% de réduction
    limits: {
      daily_usage: -1, // -1 = illimité
      monthly_usage: -1
    },
    features: [
      'Tout du plan Pro',
      'Utilisations illimitées',
      'Support dédié 24/7',
      'Accès API complet',
      'White-label (personnalisation)',
      'SLA garanti 99.9%',
      'Historique illimité',
      'Intégrations personnalisées',
      'Formation et onboarding',
      'Facturation sur mesure'
    ],
    description: 'Pour les équipes et entreprises',
    contactSales: true
  }
};

/**
 * Comparaison des fonctionnalités par plan
 */
const FEATURE_COMPARISON = [
  {
    category: 'Utilisation',
    features: [
      { name: 'Accès aux outils', free: true, pro: true, enterprise: true },
      { name: 'Utilisations quotidiennes', free: '10', pro: '1 000', enterprise: 'Illimité' },
      { name: 'Utilisations mensuelles', free: '100', pro: '30 000', enterprise: 'Illimité' },
      { name: 'Historique', free: '7 jours', pro: '1 an', enterprise: 'Illimité' }
    ]
  },
  {
    category: 'Fonctionnalités',
    features: [
      { name: 'Export basique', free: true, pro: true, enterprise: true },
      { name: 'Export avancé (PDF, etc.)', free: false, pro: true, enterprise: true },
      { name: 'Accès API', free: false, pro: false, enterprise: true },
      { name: 'White-label', free: false, pro: false, enterprise: true },
      { name: 'Intégrations personnalisées', free: false, pro: false, enterprise: true }
    ]
  },
  {
    category: 'Support',
    features: [
      { name: 'Support communautaire', free: true, pro: true, enterprise: true },
      { name: 'Support email prioritaire', free: false, pro: true, enterprise: true },
      { name: 'Support dédié 24/7', free: false, pro: false, enterprise: true },
      { name: 'Formation & onboarding', free: false, pro: false, enterprise: true },
      { name: 'SLA garanti', free: false, pro: false, enterprise: '99.9%' }
    ]
  },
  {
    category: 'Autres',
    features: [
      { name: 'Publicités', free: 'Oui', pro: 'Non', enterprise: 'Non' },
      { name: 'Accès anticipé', free: false, pro: true, enterprise: true },
      { name: 'Facturation personnalisée', free: false, pro: false, enterprise: true }
    ]
  }
];

/**
 * Outils disponibles avec leurs catégories
 */
const TOOLS = {
  utilities: [
    { name: 'qr-generator', displayName: 'Générateur QR Code', category: 'utilities' },
    { name: 'json-csv', displayName: 'JSON ↔ CSV', category: 'utilities' },
    { name: 'password-generator', displayName: 'Générateur de mots de passe', category: 'utilities' },
    { name: 'base64', displayName: 'Base64 Encoder/Decoder', category: 'utilities' },
    { name: 'text-diff', displayName: 'Diff de texte', category: 'utilities' },
    { name: 'minifier', displayName: 'Minifieur CSS/JS', category: 'utilities' }
  ],
  design: [
    { name: 'color-palette', displayName: 'Générateur de palettes', category: 'design' },
    { name: 'color-converter', displayName: 'Convertisseur couleurs', category: 'design' },
    { name: 'gradient-generator', displayName: 'Générateur gradients', category: 'design' },
    { name: 'box-shadow', displayName: 'Box-shadow Generator', category: 'design' },
    { name: 'favicon-generator', displayName: 'Favicon Generator', category: 'design' }
  ],
  productivity: [
    { name: 'pomodoro', displayName: 'Pomodoro Timer', category: 'productivity' },
    { name: 'freelance-calculator', displayName: 'Calculateur Freelance', category: 'productivity' },
    { name: 'invoice-generator', displayName: 'Générateur de factures', category: 'productivity' },
    { name: 'quote-generator', displayName: 'Générateur de devis', category: 'productivity' },
    { name: 'kanban', displayName: 'Kanban Board', category: 'productivity' },
    { name: 'markdown-editor', displayName: 'Markdown Editor', category: 'productivity' }
  ],
  security: [
    { name: 'hash-generator', displayName: 'Hash Generator', category: 'security' },
    { name: 'jwt-decoder', displayName: 'JWT Decoder', category: 'security' }
  ],
  finance: [
    { name: 'dca-calculator', displayName: 'Calculateur DCA', category: 'finance' },
    { name: 'impermanent-loss', displayName: 'Impermanent Loss', category: 'finance' }
  ]
};

module.exports = {
  PLANS,
  FEATURE_COMPARISON,
  TOOLS
};

