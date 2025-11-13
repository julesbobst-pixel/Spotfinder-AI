import React, { useState } from 'react';

interface AuthModalProps {
  onLogin: (username: string) => void;
  onClose: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ onLogin, onClose }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim()) {
      onLogin(username.trim());
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-gray-800 rounded-2xl shadow-2xl p-8 w-full max-w-sm border border-gray-700" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-3xl font-bold text-center text-white mb-2">Willkommen!</h2>
        <p className="text-center text-gray-400 mb-6">Logge dich ein, um deine Spots zu speichern.</p>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-300 text-sm font-bold mb-2" htmlFor="username">
              Username
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 bg-gray-700 border-gray-600 text-white leading-tight focus:outline-none focus:ring-2 focus:ring-primary-500"
              id="username"
              type="text"
              placeholder="Dein Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div className="mb-6">
            <label className="block text-gray-300 text-sm font-bold mb-2" htmlFor="password">
              Passwort (optional)
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 bg-gray-700 border-gray-600 text-white mb-3 leading-tight focus:outline-none focus:ring-2 focus:ring-primary-500"
              id="password"
              type="password"
              placeholder="******************"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
             <p className="text-xs text-gray-500">Für diese Demo ist kein echtes Passwort erforderlich.</p>
          </div>
          <div className="flex items-center justify-between">
            <button
              className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-2 px-4 rounded-lg focus:outline-none focus:shadow-outline transition-colors disabled:bg-gray-500"
              type="submit"
              disabled={!username.trim()}
            >
              Login / Registrieren
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AuthModal;