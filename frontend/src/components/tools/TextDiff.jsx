import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const TextDiff = () => {
  const [text1, setText1] = useState('');
  const [text2, setText2] = useState('');
  const [diffResult, setDiffResult] = useState([]);

  const computeDiff = () => {
    const lines1 = text1.split('\n');
    const lines2 = text2.split('\n');
    const maxLines = Math.max(lines1.length, lines2.length);
    const result = [];

    for (let i = 0; i < maxLines; i++) {
      const line1 = lines1[i] || '';
      const line2 = lines2[i] || '';

      if (line1 === line2) {
        result.push({ type: 'equal', line1, line2, lineNum: i + 1 });
      } else if (!line1) {
        result.push({ type: 'added', line1, line2, lineNum: i + 1 });
      } else if (!line2) {
        result.push({ type: 'removed', line1, line2, lineNum: i + 1 });
      } else {
        result.push({ type: 'modified', line1, line2, lineNum: i + 1 });
      }
    }

    setDiffResult(result);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <Link to="/tools" className="text-blue-600 hover:text-blue-700 mb-6 inline-flex items-center gap-2">
          ← Retour aux outils
        </Link>
        
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">📝 Diff de texte</h1>
          <p className="text-gray-600">Compare deux textes ligne par ligne</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Texte original</label>
              <textarea
                value={text1}
                onChange={(e) => setText1(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows="15"
                placeholder="Entrez le texte original..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Texte modifié</label>
              <textarea
                value={text2}
                onChange={(e) => setText2(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows="15"
                placeholder="Entrez le texte modifié..."
              />
            </div>
          </div>

          <button
            onClick={computeDiff}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            Comparer
          </button>
        </div>

        {diffResult.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Résultat de la comparaison</h3>
            <div className="space-y-1 font-mono text-sm">
              {diffResult.map((diff, index) => (
                <div
                  key={index}
                  className={`p-2 rounded ${
                    diff.type === 'equal' ? 'bg-gray-50' :
                    diff.type === 'added' ? 'bg-green-50 border-l-4 border-green-500' :
                    diff.type === 'removed' ? 'bg-red-50 border-l-4 border-red-500' :
                    'bg-yellow-50 border-l-4 border-yellow-500'
                  }`}
                >
                  <div className="flex gap-4">
                    <span className="text-gray-500 w-12">{diff.lineNum}</span>
                    {diff.type === 'modified' ? (
                      <div className="flex-1">
                        <div className="text-red-700">- {diff.line1}</div>
                        <div className="text-green-700">+ {diff.line2}</div>
                      </div>
                    ) : diff.type === 'removed' ? (
                      <div className="flex-1 text-red-700">- {diff.line1}</div>
                    ) : diff.type === 'added' ? (
                      <div className="flex-1 text-green-700">+ {diff.line2}</div>
                    ) : (
                      <div className="flex-1 text-gray-700">{diff.line1}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-6">
          <h3 className="font-semibold text-blue-900 mb-2">💡 Légende</h3>
          <div className="text-sm text-blue-800 space-y-1">
            <div><span className="text-green-700">+ Vert</span> : Ligne ajoutée</div>
            <div><span className="text-red-700">- Rouge</span> : Ligne supprimée</div>
            <div><span className="text-yellow-700">~ Jaune</span> : Ligne modifiée</div>
            <div><span className="text-gray-700">Gris</span> : Ligne identique</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TextDiff;

