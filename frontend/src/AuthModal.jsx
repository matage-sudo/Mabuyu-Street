import { useState } from 'react';
import { X } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export default function AuthModal({ isOpen, onClose, onLoginSuccess }) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '', fullName: '', phone: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const endpoint = isSignUp ? '/api/auth/signup' : '/api/auth/login';

    try {
      const res = await fetch(`${API_BASE}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Authentication failed.');

      if (isSignUp) {
        // Switch to login tab after successful signup
        setIsSignUp(false);
        setError('Account created successfully! Please log in.');
      } else {
        // Save user session in localStorage or state handler passed from parent
        localStorage.setItem('customer_user', JSON.stringify(data.user));
        if (onLoginSuccess) onLoginSuccess(data.user);
        onClose();
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
      <div className="bg-[#0f172a] text-slate-100 border border-slate-800 w-full max-w-md p-6 rounded-xl shadow-2xl relative space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">{isSignUp ? 'Create Account' : 'Welcome Back'}</h3>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        {error && <p className={`text-xs p-2 rounded ${isSignUp && error.includes(' successfully') ? 'bg-emerald-950/50 text-emerald-300 border border-emerald-800' : 'bg-red-950/50 text-red-300 border border-red-800'}`}>{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-3">
          {isSignUp && (
            <>
              <div>
                <label className="text-xs uppercase text-slate-400 block mb-1">Full Name</label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-[#ffb703]"
                  required
                />
              </div>
              <div>
                <label className="text-xs uppercase text-slate-400 block mb-1">Phone Number</label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="07XXXXXXXX"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-[#ffb703]"
                />
              </div>
            </>
          )}

          <div>
            <label className="text-xs uppercase text-slate-400 block mb-1">Email Address</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-[#ffb703]"
              required
            />
          </div>

          <div>
            <label className="text-xs uppercase text-slate-400 block mb-1">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-[#ffb703]"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#ffb703] text-slate-900 font-semibold py-2.5 rounded-lg text-sm hover:brightness-95 transition disabled:opacity-60"
          >
            {loading ? 'Processing...' : isSignUp ? 'Sign Up' : 'Log In'}
          </button>
        </form>

        <div className="text-center pt-2 border-t border-slate-800">
          <button
            type="button"
            onClick={() => { setIsSignUp(!isSignUp); setError(''); }}
            className="text-xs text-slate-400 hover:text-[#ffb703] transition"
          >
            {isSignUp ? 'Already have an account? Log in' : "Don't have an account? Sign up"}
          </button>
        </div>
      </div>
    </div>
  );
}