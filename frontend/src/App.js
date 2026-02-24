import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LanguageSwitcher from './components/LanguageSwitcher';
import Dashboard from './components/Dashboard';
import PricingPage from './components/PricingPage';
import Settings from './components/Settings';
import ToolsPage from './components/ToolsPage';
import LandingPage from './components/LandingPage';
import ForgotPasswordPage from './components/ForgotPasswordPage';
import ResetPasswordPage from './components/ResetPasswordPage';
import NotFoundPage from './components/NotFoundPage';
import Footer from './components/Footer';
import AdminPage from './components/AdminPage';
import TermsPage from './components/legal/TermsPage';
import PrivacyPage from './components/legal/PrivacyPage';
import SupportPage from './components/enterprise/SupportPage';
import SLADashboard from './components/enterprise/SLADashboard';
import ApiKeysPage from './components/enterprise/ApiKeysPage';
import ApiDocsPage from './components/enterprise/ApiDocsPage';
import WhiteLabelPage from './components/enterprise/WhiteLabelPage';
import {
  QRGenerator,
  JsonCsvConverter,
  PasswordGenerator,
  Base64Tool,
  TextDiff,
  Minifier,
  ColorPalette,
  ColorConverter,
  GradientGenerator,
  BoxShadow,
  FaviconGenerator,
  Pomodoro,
  FreelanceCalculator,
  MarkdownEditor,
  InvoiceGenerator,
  QuoteGenerator,
  HashGenerator,
  JwtDecoder,
  DcaCalculator,
  ImpermanentLoss,
  VideoGenerator,
  ToolComingSoon
} from './components/tools';
import './App.css';

// Composant de connexion
function LoginPage() {
  const { login, register } = useAuth();
  const { t } = useTranslation();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await register(email, password, fullName);
      }
      window.location.href = '/dashboard';
    } catch (err) {
      setError(err.message || t('auth.error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h1>🛠️ Useful Tools SaaS</h1>
        <h2>{isLogin ? t('auth.loginTitle') : t('auth.registerTitle')}</h2>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="form-group">
              <label>{t('auth.fullName')}</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                placeholder="John Doe"
              />
            </div>
          )}

          <div className="form-group">
            <label>{t('auth.email')}</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="email@example.com"
            />
          </div>

          <div className="form-group">
            <label>{t('auth.password')}</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              minLength="6"
            />
          </div>

          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? t('auth.loading') : (isLogin ? t('auth.login') : t('auth.register'))}
          </button>
        </form>

        {isLogin && (
          <p style={{ textAlign: 'center', marginTop: '8px' }}>
            <Link to="/forgot-password" className="btn-link" style={{ fontSize: '0.875rem' }}>
              {t('auth.forgotPassword')}
            </Link>
          </p>
        )}

        <p className="toggle-form">
          {isLogin ? t('auth.noAccount') : t('auth.alreadyAccount')}
          <button onClick={() => setIsLogin(!isLogin)} className="btn-link">
            {isLogin ? t('auth.register') : t('auth.login')}
          </button>
        </p>
      </div>
    </div>
  );
}

// Composant de navigation
function Navigation() {
  const { user, logout, whiteLabelConfig } = useAuth();
  const { t } = useTranslation();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userDropOpen, setUserDropOpen] = useState(false);
  const [enterpriseDropOpen, setEnterpriseDropOpen] = useState(false);
  const userDropRef = useRef(null);
  const enterpriseDropRef = useRef(null);

  const isEnterprise = user?.plan_name === 'enterprise';
  const isPro = user?.plan_name === 'pro';
  const brandName = whiteLabelConfig?.app_name || t('nav.brand');
  const isBranded = !!whiteLabelConfig;

  useEffect(() => {
    const handler = (e) => {
      if (userDropRef.current && !userDropRef.current.contains(e.target)) setUserDropOpen(false);
      if (enterpriseDropRef.current && !enterpriseDropRef.current.contains(e.target)) setEnterpriseDropOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  const isActive = (path) => location.pathname === path || (path !== '/' && location.pathname.startsWith(path + '/'));
  const isEnterpriseActive = location.pathname.startsWith('/enterprise');
  const navLinkCls = (path) =>
    `text-sm font-medium transition-colors pb-0.5 border-b-2 ${
      isActive(path) ? 'text-indigo-600 border-indigo-500' : 'text-gray-600 border-transparent hover:text-gray-900'
    }`;

  const planBadge = isEnterprise
    ? { label: 'Enterprise', cls: 'bg-purple-100 text-purple-700' }
    : isPro
    ? { label: 'Pro', cls: 'bg-indigo-100 text-indigo-700' }
    : { label: 'Free', cls: 'bg-gray-100 text-gray-500' };

  const initial = (user?.email || 'U').charAt(0).toUpperCase();
  const navStyle = isBranded ? { backgroundColor: whiteLabelConfig.primary_color } : {};

  const enterpriseLinks = [
    { to: '/enterprise/api-docs',    label: t('enterprise.apiDocs.title'),    icon: '📖' },
    { to: '/enterprise/api-keys',    label: t('enterprise.apiKeys.title'),    icon: '🔑' },
    { to: '/enterprise/white-label', label: t('enterprise.whiteLabel.title'), icon: '🎨' },
    { to: '/enterprise/support',     label: t('enterprise.support.title'),    icon: '💬' },
    { to: '/enterprise/sla',         label: t('enterprise.sla.title'),        icon: '📊' },
  ];

  return (
    <nav className={`sticky top-0 z-50 ${isBranded ? '' : 'bg-white border-b border-gray-100'}`} style={navStyle}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-14">

          {/* Brand */}
          <Link to="/dashboard" className={`flex items-center gap-2 font-bold text-base shrink-0 ${isBranded ? 'text-white' : 'text-gray-900'}`}>
            {whiteLabelConfig?.logo_url && (
              <img src={whiteLabelConfig.logo_url} alt={brandName} className="h-6 w-auto" onError={e => { e.target.style.display = 'none'; }} />
            )}
            {brandName}
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-6">
            {isBranded ? (
              <>
                <Link to="/dashboard" className="text-sm font-medium text-white/80 hover:text-white transition-colors">{t('nav.dashboard')}</Link>
                <Link to="/tools"     className="text-sm font-medium text-white/80 hover:text-white transition-colors">{t('nav.tools')}</Link>
                <Link to="/pricing"   className="text-sm font-medium text-white/80 hover:text-white transition-colors">{t('nav.pricing')}</Link>
              </>
            ) : (
              <>
                <Link to="/dashboard" className={navLinkCls('/dashboard')}>{t('nav.dashboard')}</Link>
                <Link to="/tools"     className={navLinkCls('/tools')}>{t('nav.tools')}</Link>
                <Link to="/pricing"   className={navLinkCls('/pricing')}>{t('nav.pricing')}</Link>
              </>
            )}
            {isEnterprise && (
              <div className="relative" ref={enterpriseDropRef}>
                <button onClick={() => setEnterpriseDropOpen(v => !v)}
                  className={`flex items-center gap-1 text-sm font-medium transition-colors pb-0.5 border-b-2 ${
                    isBranded ? 'text-white/80 hover:text-white border-transparent'
                    : isEnterpriseActive ? 'text-indigo-600 border-indigo-500' : 'text-gray-600 border-transparent hover:text-gray-900'
                  }`}>
                  Enterprise
                  <svg className={`h-3.5 w-3.5 transition-transform ${enterpriseDropOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {enterpriseDropOpen && (
                  <div className="absolute left-0 top-full mt-2 w-52 bg-white rounded-xl border border-gray-100 shadow-xl py-1 z-50">
                    {enterpriseLinks.map(link => (
                      <Link key={link.to} to={link.to} onClick={() => setEnterpriseDropOpen(false)}
                        className={`flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors ${location.pathname === link.to ? 'text-indigo-600 font-medium' : 'text-gray-700'}`}>
                        <span>{link.icon}</span>{link.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right side */}
          <div className="hidden md:flex items-center gap-3">
            <LanguageSwitcher />
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${planBadge.cls}`}>{planBadge.label}</span>
            <div className="relative" ref={userDropRef}>
              <button onClick={() => setUserDropOpen(v => !v)}
                className="w-8 h-8 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center hover:bg-indigo-700 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1">
                {initial}
              </button>
              {userDropOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl border border-gray-100 shadow-xl py-1 z-50">
                  <div className="px-4 py-3 border-b border-gray-50">
                    <p className="text-xs text-gray-400 truncate">{user?.email}</p>
                  </div>
                  <Link to="/settings" onClick={() => setUserDropOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                    <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94H9.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                    </svg>
                    {t('nav.settings')}
                  </Link>
                  <div className="border-t border-gray-50 mt-1 pt-1">
                    <button onClick={() => { setUserDropOpen(false); logout(); }}
                      className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors">
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l-3 3m0 0 3 3m-3-3h12.75" />
                      </svg>
                      {t('nav.logout')}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Mobile hamburger */}
          <button onClick={() => setMobileOpen(v => !v)}
            className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors" aria-label="Toggle menu">
            {mobileOpen
              ? <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              : <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
            }
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white shadow-lg">
          <div className="px-4 py-3 space-y-0.5">
            <Link to="/dashboard" className={`flex items-center px-3 py-2.5 rounded-lg text-sm font-medium ${location.pathname === '/dashboard' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-700 hover:bg-gray-50'}`}>{t('nav.dashboard')}</Link>
            <Link to="/tools"     className={`flex items-center px-3 py-2.5 rounded-lg text-sm font-medium ${location.pathname.startsWith('/tools') ? 'bg-indigo-50 text-indigo-700' : 'text-gray-700 hover:bg-gray-50'}`}>{t('nav.tools')}</Link>
            <Link to="/pricing"   className={`flex items-center px-3 py-2.5 rounded-lg text-sm font-medium ${location.pathname === '/pricing' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-700 hover:bg-gray-50'}`}>{t('nav.pricing')}</Link>
            {isEnterprise && (
              <>
                <p className="px-3 pt-3 pb-1 text-xs font-semibold text-gray-400 uppercase tracking-wider">Enterprise</p>
                {enterpriseLinks.map(link => (
                  <Link key={link.to} to={link.to} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm ${location.pathname === link.to ? 'bg-indigo-50 text-indigo-700 font-medium' : 'text-gray-700 hover:bg-gray-50'}`}>
                    <span>{link.icon}</span>{link.label}
                  </Link>
                ))}
              </>
            )}
            <div className="border-t border-gray-100 pt-2 mt-2 space-y-0.5">
              <Link to="/settings" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">⚙️ {t('nav.settings')}</Link>
              <div className="flex items-center justify-between px-3 py-2">
                <span className="text-xs text-gray-400 truncate max-w-[160px]">{user?.email}</span>
                <LanguageSwitcher />
              </div>
              <button onClick={logout} className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50">🚪 {t('nav.logout')}</button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}

// Route protégée
function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  const { t } = useTranslation();

  if (loading) {
    return <div className="loading">{t('common.loading')}</div>;
  }

  return isAuthenticated ? children : <Navigate to="/login" />;
}

// App principal
function AppContent() {
  const { isAuthenticated } = useAuth();
  const { t } = useTranslation();

  return (
    <Router>
      {isAuthenticated && <Navigation />}
      <Routes>
        {/* Public routes */}
        <Route path="/" element={isAuthenticated ? <Navigate to="/dashboard" /> : <LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/legal/terms" element={<TermsPage />} />
        <Route path="/legal/privacy" element={<PrivacyPage />} />

        {/* Protected routes */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
        <Route path="/tools" element={
          <ProtectedRoute>
            <ToolsPage />
          </ProtectedRoute>
        } />

        {/* Utilities Tools */}
        <Route path="/tools/qr-generator" element={<ProtectedRoute><QRGenerator /></ProtectedRoute>} />
        <Route path="/tools/json-csv" element={<ProtectedRoute><JsonCsvConverter /></ProtectedRoute>} />
        <Route path="/tools/password-generator" element={<ProtectedRoute><PasswordGenerator /></ProtectedRoute>} />
        <Route path="/tools/base64" element={<ProtectedRoute><Base64Tool /></ProtectedRoute>} />
        <Route path="/tools/text-diff" element={<ProtectedRoute><TextDiff /></ProtectedRoute>} />
        <Route path="/tools/minifier" element={<ProtectedRoute><Minifier /></ProtectedRoute>} />

        {/* Design Tools */}
        <Route path="/tools/color-palette" element={<ProtectedRoute><ColorPalette /></ProtectedRoute>} />
        <Route path="/tools/color-converter" element={<ProtectedRoute><ColorConverter /></ProtectedRoute>} />
        <Route path="/tools/gradient-generator" element={<ProtectedRoute><GradientGenerator /></ProtectedRoute>} />
        <Route path="/tools/box-shadow" element={<ProtectedRoute><BoxShadow /></ProtectedRoute>} />
        <Route path="/tools/favicon-generator" element={<ProtectedRoute><FaviconGenerator /></ProtectedRoute>} />

        {/* Productivity Tools */}
        <Route path="/tools/pomodoro" element={<ProtectedRoute><Pomodoro /></ProtectedRoute>} />
        <Route path="/tools/freelance-calculator" element={<ProtectedRoute><FreelanceCalculator /></ProtectedRoute>} />
        <Route path="/tools/invoice-generator" element={<ProtectedRoute><InvoiceGenerator /></ProtectedRoute>} />
        <Route path="/tools/quote-generator" element={<ProtectedRoute><QuoteGenerator /></ProtectedRoute>} />
        <Route path="/tools/kanban" element={<ProtectedRoute><ToolComingSoon icon="📊" title="Kanban Board" description={t('tools.list.kanban.desc')} /></ProtectedRoute>} />
        <Route path="/tools/markdown-editor" element={<ProtectedRoute><MarkdownEditor /></ProtectedRoute>} />

        {/* Security Tools */}
        <Route path="/tools/hash-generator" element={<ProtectedRoute><HashGenerator /></ProtectedRoute>} />
        <Route path="/tools/jwt-decoder" element={<ProtectedRoute><JwtDecoder /></ProtectedRoute>} />

        {/* Finance Tools */}
        <Route path="/tools/dca-calculator" element={<ProtectedRoute><DcaCalculator /></ProtectedRoute>} />
        <Route path="/tools/impermanent-loss" element={<ProtectedRoute><ImpermanentLoss /></ProtectedRoute>} />

        {/* AI Tools */}
        <Route path="/tools/video-generator" element={<ProtectedRoute><VideoGenerator /></ProtectedRoute>} />

        {/* Enterprise Tools */}
        <Route path="/enterprise/api-docs" element={<ProtectedRoute><ApiDocsPage /></ProtectedRoute>} />
        <Route path="/enterprise/api-keys" element={<ProtectedRoute><ApiKeysPage /></ProtectedRoute>} />
        <Route path="/enterprise/white-label" element={<ProtectedRoute><WhiteLabelPage /></ProtectedRoute>} />
        <Route path="/enterprise/support" element={<ProtectedRoute><SupportPage /></ProtectedRoute>} />
        <Route path="/enterprise/sla" element={<ProtectedRoute><SLADashboard /></ProtectedRoute>} />

        <Route path="/settings" element={
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        } />

        {/* Admin (guards internally) */}
        <Route path="/admin" element={<AdminPage />} />

        {/* 404 catch-all */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      <Footer />
    </Router>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;

