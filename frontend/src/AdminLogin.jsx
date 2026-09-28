import { useState } from 'react';
import { ShieldCheck, Lock, User } from 'lucide-react';
import logoImg from './assets/Gemini_Generated_Image_wt6ac1wt6ac1wt6a.jpeg';

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? '';

export default function AdminLogin({ onSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Login failed.');
        return;
      }

      onSuccess(data);
    } catch (err) {
      setError('Could not reach the server. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#020305] px-4">
      <form
        onSubmit={handleSubmit}
        className="admin-card w-full max-w-sm space-y-5"
      >
        <div className="flex flex-col items-center gap-2 text-center">
         <img 
  src={logoImg} 
  alt="Mabuyu Street Logo" 
  className="w-24 h-24 object-contain mx-auto mb-4" 
/>
          <h1 className="text-xl font-semibold text-slate-100">MABUYU STREET DASHBOARD</h1>
          <p className="text-sm text-slate-400">Authorized personnel only.</p>
        </div>

        {error && (
          <div className="rounded-lg bg-red-950/50 border border-red-900 text-red-300 text-sm px-3 py-2">
            {error}
          </div>
        )}

        <label className="block">
          <span className="text-xs uppercase tracking-wide text-slate-400">Username</span>
          <div className="mt-1 flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2">
            <User size={16} className="text-slate-500" />
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              required
              className="bg-transparent outline-none w-full text-slate-100 text-sm"
            />
          </div>
        </label>

        <label className="block">
          <span className="text-xs uppercase tracking-wide text-slate-400">Password</span>
          <div className="mt-1 flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2">
            <Lock size={16} className="text-slate-500" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
              className="bg-transparent outline-none w-full text-slate-100 text-sm"
            />
          </div>
        </label>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-[#ffb703] text-slate-900 font-medium py-2.5 hover:brightness-95 transition disabled:opacity-60"
        >
          {loading ? 'Signing in' : 'Sign in'}
        </button>
      </form>
    </div>
  );
}