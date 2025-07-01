import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

const Login = () => {
  const { login, loading, error } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    login(email, password);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-te-dark">
      <div className="te-card w-full max-w-md flex flex-col items-center">
        <img src="/te-logo.png" alt="TotalEnergies Logo" className="h-16 mb-4" />
        <h2 className="te-title mb-1" style={{ fontFamily: 'Inter, Segoe UI, Arial, sans-serif' }}>
          Connexion à <span className="te-title-accent">QR4Safety</span>
        </h2>
        <p className="text-te-gray mb-6 text-center">La solution TotalEnergies pour la gestion et le contrôle de sécurité des équipements.</p>
        <form className="w-full mt-2" onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-te-gray mb-1">Email</label>
            <input
              type="email"
              className="w-full px-3 py-2 rounded bg-te-dark border border-te-gray text-white focus:outline-none focus:ring-2 focus:ring-te-accent"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoFocus
            />
          </div>
          <div className="mb-6">
            <label className="block text-te-gray mb-1">Mot de passe</label>
            <input
              type="password"
              className="w-full px-3 py-2 rounded bg-te-dark border border-te-gray text-white focus:outline-none focus:ring-2 focus:ring-te-accent"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <div className="text-red-500 mb-2 text-sm">{error}</div>}
          <button
            type="submit"
            className="te-accent-btn w-full py-2 text-lg font-semibold mt-2"
            disabled={loading}
          >
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login; 