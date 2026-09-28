import { StrictMode, useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import './admin.css'
import AdminDashboard from './AdminDashboard.jsx'
import AdminLogin from './AdminLogin.jsx'

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? '';

function AdminGate() {
  const [status, setStatus] = useState('checking');
  const [admin, setAdmin] = useState(null);

  useEffect(() => {
    fetch(`${API_BASE}/api/admin/me`, { credentials: 'include' })
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data) => {
        setAdmin(data);
        setStatus('authed');
      })
      .catch(() => setStatus('anon'));
  }, []);

  if (status === 'checking') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#030712] text-slate-400 text-sm">
        Checking sessionâ€¦
      </div>
    );
  }

  if (status === 'anon') {
    return (
      <AdminLogin
        onSuccess={(data) => {
          setAdmin(data);
          setStatus('authed');
        }}
      />
    );
  }

  return <AdminDashboard admin={admin} />;
}

createRoot(document.getElementById('admin-root')).render(
  <StrictMode>
    <AdminGate />
  </StrictMode>,
)

