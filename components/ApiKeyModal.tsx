import React, { useState } from 'react';

interface ApiKeyModalProps {
  onSave: (apiKey: string) => void;
}

const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ onSave }) => {
  const [apiKey, setApiKey] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (apiKey.trim()) {
      onSave(apiKey.trim());
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950 flex items-center justify-center z-50 p-4">
      <div className="futuristic-bg rounded-2xl shadow-2xl p-8 w-full max-w-md futuristic-border">
        <h2 className="text-3xl font-bold text-center text-white mb-2">Willkommen bei SpotFinder AI!</h2>
        <p className="text-center text-gray-400 mb-2">Bitte gib deinen Google Gemini API-Schlüssel ein, um fortzufahren.</p>
        <p className="text-center text-gray-500 text-xs mb-6">Dein Schlüssel wird nur sicher in deinem Browser auf diesem Gerät gespeichert. Du musst ihn auf jedem neuen Gerät (z.B. deinem Handy) erneut eingeben.</p>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-300 text-sm font-bold mb-2" htmlFor="apiKey">
              Gemini API Key
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-3 px-4 bg-gray-700 border-gray-600 text-white leading-tight focus:outline-none focus:ring-2 focus:ring-primary-500"
              id="apiKey"
              type="password"
              placeholder="Gib deinen API-Schlüssel hier ein"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
            />
          </div>
           <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-xs text-cyan-400 hover:underline mb-6 block text-center">
             Kostenlosen API-Schlüssel hier erstellen
            </a>
          <div className="flex items-center justify-center">
            <button
              className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 px-4 rounded-lg focus:outline-none focus:shadow-outline transition-colors disabled:bg-gray-500"
              type="submit"
              disabled={!apiKey.trim()}
            >
              Speichern & App starten
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ApiKeyModal;