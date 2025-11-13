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
      <div className="bg-slate-900 rounded-2xl shadow-2xl p-8 w-full max-w-md border border-cyan-400/20">
        <h2 className="text-3xl font-bold text-center text-white mb-2">Willkommen bei SpotFinder AI!</h2>
        <p className="text-center text-slate-400 mb-6">Bitte gib deinen Google Gemini API-Schlüssel ein, um fortzufahren.</p>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-slate-300 text-sm font-bold mb-2" htmlFor="apiKey">
              Gemini API Key
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-3 px-4 bg-slate-800 border-slate-700 text-white leading-tight focus:outline-none focus:ring-2 focus:ring-fuchsia-600"
              id="apiKey"
              type="password"
              placeholder="Gib deinen API-Schlüssel hier ein"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
            />
          </div>
           <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-xs text-cyan-400 hover:underline mb-6 block text-center">
             Hier einen API-Schlüssel erstellen.
            </a>
          <div className="flex items-center justify-center">
            <button
              className="w-full bg-fuchsia-600 hover:bg-fuchsia-700 text-white font-bold py-3 px-4 rounded-lg focus:outline-none focus:shadow-outline transition-colors disabled:bg-slate-600"
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
