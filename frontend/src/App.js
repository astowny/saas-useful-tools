import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Dashboard from './components/Dashboard';
import PricingPage from './components/PricingPage';
import ToolsPage from './components/ToolsPage';
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
  ToolComingSoon
} from './components/tools';
import './App.css';

// Composant de connexion
function LoginPage() {
  const { login, register } = useAuth();
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
      setError(err.message || 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h1>🛠️ Useful Tools SaaS</h1>
        <h2>{isLogin ? 'Connexion' : 'Inscription'}</h2>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="form-group">
              <label>Nom complet</label>
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
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="email@example.com"
            />
          </div>
          
          <div className="form-group">
            <label>Mot de passe</label>
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
            {loading ? 'Chargement...' : (isLogin ? 'Se connecter' : "S'inscrire")}
          </button>
        </form>
        
        <p className="toggle-form">
          {isLogin ? "Pas encore de compte ?" : "Déjà un compte ?"}
          <button onClick={() => setIsLogin(!isLogin)} className="btn-link">
            {isLogin ? "S'inscrire" : "Se connecter"}
          </button>
        </p>
      </div>
    </div>
  );
}

// Composant de navigation
function Navigation() {
  const { user, logout } = useAuth();

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/dashboard" className="nav-brand">🛠️ Useful Tools</Link>
        <div className="nav-links">
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/tools">Outils</Link>
          <Link to="/pricing">Pricing</Link>
          <span className="user-info">{user?.email}</span>
          <button onClick={logout} className="btn-logout">Déconnexion</button>
        </div>
      </div>
    </nav>
  );
}

// Route protégée
function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div className="loading">Chargement...</div>;
  }

  return isAuthenticated ? children : <Navigate to="/login" />;
}

// App principal
function AppContent() {
  const { isAuthenticated } = useAuth();

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
        <Route path="/tools/kanban" element={<ProtectedRoute><ToolComingSoon icon="📊" title="Kanban Board" description="Gestion de tâches" /></ProtectedRoute>} />
        <Route path="/tools/markdown-editor" element={<ProtectedRoute><MarkdownEditor /></ProtectedRoute>} />

        {/* Security Tools */}
        <Route path="/tools/hash-generator" element={<ProtectedRoute><HashGenerator /></ProtectedRoute>} />
        <Route path="/tools/jwt-decoder" element={<ProtectedRoute><JwtDecoder /></ProtectedRoute>} />

        {/* Finance Tools */}
        <Route path="/tools/dca-calculator" element={<ProtectedRoute><DcaCalculator /></ProtectedRoute>} />
        <Route path="/tools/impermanent-loss" element={<ProtectedRoute><ImpermanentLoss /></ProtectedRoute>} />

        <Route path="/pricing" element={
          <ProtectedRoute>
            <PricingPage />
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

