import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const MarkdownEditor = () => {
  const [markdown, setMarkdown] = useState('# Titre\n\n## Sous-titre\n\nVotre texte **en gras** et *en italique*.\n\n- Liste item 1\n- Liste item 2\n\n```javascript\nconst hello = "world";\n```');

  const parseMarkdown = (text) => {
    let html = text;
    
    // Headers
    html = html.replace(/^### (.*$)/gim, '<h3 class="text-xl font-bold text-gray-900 mb-2">$1</h3>');
    html = html.replace(/^## (.*$)/gim, '<h2 class="text-2xl font-bold text-gray-900 mb-3">$1</h2>');
    html = html.replace(/^# (.*$)/gim, '<h1 class="text-3xl font-bold text-gray-900 mb-4">$1</h1>');
    
    // Bold
    html = html.replace(/\*\*(.*?)\*\*/gim, '<strong class="font-bold">$1</strong>');
    
    // Italic
    html = html.replace(/\*(.*?)\*/gim, '<em class="italic">$1</em>');
    
    // Code blocks
    html = html.replace(/```(.*?)\n([\s\S]*?)```/gim, '<pre class="bg-gray-800 text-white p-4 rounded-lg my-4 overflow-x-auto"><code>$2</code></pre>');
    
    // Inline code
    html = html.replace(/`(.*?)`/gim, '<code class="bg-gray-200 text-gray-900 px-2 py-1 rounded">$1</code>');
    
    // Links
    html = html.replace(/\[(.*?)\]\((.*?)\)/gim, '<a href="$2" class="text-blue-600 hover:underline">$1</a>');
    
    // Lists
    html = html.replace(/^\- (.*$)/gim, '<li class="ml-4">$1</li>');
    html = html.replace(/(<li.*<\/li>)/s, '<ul class="list-disc list-inside my-2">$1</ul>');
    
    // Line breaks
    html = html.replace(/\n\n/gim, '</p><p class="mb-4">');
    html = '<p class="mb-4">' + html + '</p>';
    
    return html;
  };

  const copyMarkdown = () => {
    navigator.clipboard.writeText(markdown);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <Link to="/tools" className="text-blue-600 hover:text-blue-700 mb-6 inline-flex items-center gap-2">
          ← Retour aux outils
        </Link>
        
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">✍️ Éditeur Markdown</h1>
          <p className="text-gray-600">Écrivez et prévisualisez du Markdown en temps réel</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Markdown</h2>
              <button
                onClick={copyMarkdown}
                className="text-blue-600 hover:text-blue-700 text-sm"
              >
                📋 Copier
              </button>
            </div>
            <textarea
              value={markdown}
              onChange={(e) => setMarkdown(e.target.value)}
              className="w-full h-[600px] px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              placeholder="Écrivez votre Markdown ici..."
            />
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Aperçu</h2>
            <div
              className="prose max-w-none h-[600px] overflow-y-auto"
              dangerouslySetInnerHTML={{ __html: parseMarkdown(markdown) }}
            />
          </div>
        </div>

        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-6">
          <h3 className="font-semibold text-blue-900 mb-2">💡 Syntaxe Markdown</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
            <div>
              <div className="font-mono"># Titre 1</div>
              <div className="font-mono">## Titre 2</div>
              <div className="font-mono">**gras**</div>
              <div className="font-mono">*italique*</div>
            </div>
            <div>
              <div className="font-mono">- Liste</div>
              <div className="font-mono">`code`</div>
              <div className="font-mono">[lien](url)</div>
              <div className="font-mono">```code block```</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarkdownEditor;

