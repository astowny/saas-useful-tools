import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LanguageSwitcher from './components/LanguageSwitcher';
import Dashboard from './components/Dashboard';
import PricingPage from './components/PricingPage';
import Settings from './components/Settings';
import ToolsPage from './components/ToolsPage';
import SupportPage from './components/enterprise/SupportPage';
import SLADashboard from './components/enterprise/SLADashboard';
import ApiKeysPage from './components/enterprise/ApiKeysPage';
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
  const isEnterprise = user?.plan_name === 'enterprise';
  const brandName = whiteLabelConfig ? whiteLabelConfig.app_name : t('nav.brand');
  const isBranded = !!whiteLabelConfig;
  const navStyle = isBranded ? { background: whiteLabelConfig.primary_color } : {};

  return (
    <nav className="navbar" style={navStyle} data-branded={isBranded ? 'true' : 'false'}>
      <div className="nav-container">
        <Link to="/dashboard" className="nav-brand">
          {whiteLabelConfig && whiteLabelConfig.logo_url && (
            <img
              src={whiteLabelConfig.logo_url}
              alt={brandName}
              className="inline-block h-5 w-auto mr-2 align-middle"
              onError={e => { e.target.style.display = 'none'; }}
            />
          )}
          {brandName}
        </Link>
        <div className="nav-links">
          <Link to="/dashboard">{t('nav.dashboard')}</Link>
          <Link to="/tools">{t('nav.tools')}</Link>
          <Link to="/pricing">{t('nav.pricing')}</Link>
          {isEnterprise && <Link to="/enterprise/api-keys">{t('enterprise.apiKeys.title')}</Link>}
          {isEnterprise && <Link to="/enterprise/white-label">{t('enterprise.whiteLabel.title')}</Link>}
          {isEnterprise && <Link to="/enterprise/support">{t('enterprise.support.title')}</Link>}
          {isEnterprise && <Link to="/enterprise/sla">{t('enterprise.sla.title')}</Link>}
          <LanguageSwitcher />
          <span className="user-info">{user?.email}</span>
          <button onClick={logout} className="btn-logout">{t('nav.logout')}</button>
        </div>
      </div>
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
        <Route path="/login" element={<LoginPage />} />
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
        <Route path="/enterprise/api-keys" element={<ProtectedRoute><ApiKeysPage /></ProtectedRoute>} />
        <Route path="/enterprise/white-label" element={<ProtectedRoute><WhiteLabelPage /></ProtectedRoute>} />
        <Route path="/enterprise/support" element={<ProtectedRoute><SupportPage /></ProtectedRoute>} />
        <Route path="/enterprise/sla" element={<ProtectedRoute><SLADashboard /></ProtectedRoute>} />

        <Route path="/pricing" element={
          <ProtectedRoute>
            <PricingPage />
          </ProtectedRoute>
        } />
        <Route path="/settings" element={
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        } />
        <Route path="/" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} />} />
      </Routes>
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

