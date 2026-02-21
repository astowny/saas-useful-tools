import React from 'react';
import { Link } from 'react-router-dom';

const ToolComingSoon = ({ icon, title, description }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Link to="/tools" className="text-blue-600 hover:text-blue-700 mb-6 inline-flex items-center gap-2">
          ← Retour aux outils
        </Link>

        <div className="text-center py-20">
          <div className="text-8xl mb-6">{icon}</div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">{title}</h1>
          <p className="text-xl text-gray-600 mb-8">{description}</p>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 max-w-md mx-auto">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">🚧 En cours de développement</h2>
            <p className="text-gray-600 mb-6">
              Cet outil sera bientôt disponible. Nous travaillons activement sur son développement.
            </p>
            <Link
              to="/tools"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors"
            >
              Voir les autres outils
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ToolComingSoon;

