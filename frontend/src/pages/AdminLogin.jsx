import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import logoImg from '../assets/logo.png';
import { Lock, ArrowRight, AlertCircle, ShieldAlert } from 'lucide-react';

const AdminLogin = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  // If already authenticated, bypass login
  useEffect(() => {
    const checkToken = async () => {
      const token = localStorage.getItem('tamayi_admin_token');
      if (token) {
        try {
          const res = await fetch('https://tamayi.zimbabwe.workers.dev/api/admin/verify', {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (res.ok) {
            navigate('/admin/dashboard', { replace: true });
          } else {
            localStorage.removeItem('tamayi_admin_token');
          }
        } catch (err) {
          console.error('Session verify failed on load:', err);
        }
      }
    };
    checkToken();
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsLoggingIn(true);

    if (!password) {
      setErrorMsg('Please enter a password.');
      setIsLoggingIn(false);
      return;
    }

    try {
      const res = await fetch('https://tamayi.zimbabwe.workers.dev/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem('tamayi_admin_token', data.token);
        navigate('/admin/dashboard', { replace: true });
      } else {
        // Backend handles lockout (returns 401 or 429)
        setErrorMsg(data.error || 'Authentication failed.');
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('Cannot connect to authorization server.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="flex h-screen w-screen items-center justify-center bg-[#1A1A1A] px-6">
      <div className="w-full max-w-md bg-[#222222] border border-[#C9A96E]/20 p-8 shadow-2xl relative overflow-hidden flex flex-col justify-center gap-6">
        
        {/* Subtle Watermark Logo */}
        <div className="absolute -right-16 -bottom-16 w-48 h-48 opacity-[0.03] pointer-events-none">
          <img src={logoImg} alt="Brand" className="w-full h-full object-contain" />
        </div>

        {/* Brand Header */}
        <div className="text-center">
          <img src={logoImg} alt="Tamayi Logo" className="w-16 h-16 object-contain mx-auto mb-4 filter brightness-105" />
          <h1 className="font-serif text-2xl text-white tracking-widest uppercase">TAMAYI</h1>
          <p className="text-white/40 text-[10px] uppercase tracking-widest mt-1">Management Portal</p>
        </div>

        {errorMsg && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-300 p-4 text-xs font-sans flex items-start gap-2.5 leading-relaxed">
            <ShieldAlert size={16} className="shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="admin-pw" className="block text-xs uppercase tracking-widest font-semibold text-white/60 mb-2">
              Security Key
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" size={16} />
              <input
                id="admin-pw"
                type="password"
                placeholder="Enter password..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3.5 bg-white/5 border border-white/10 hover:border-white/20 text-white rounded-none focus:outline-none focus:border-[#C9A96E] font-sans text-sm transition-all"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoggingIn}
            className="w-full bg-[#C9A96E] hover:bg-[#B4955E] text-[#1A1A1A] py-3.5 text-xs font-semibold uppercase tracking-widest transition-all duration-300 shadow-md cursor-pointer flex items-center justify-center gap-2"
          >
            {isLoggingIn ? (
              <>
                <div className="w-4 h-4 border-2 border-[#1A1A1A] border-t-transparent rounded-full animate-spin"></div>
                Verifying Credentials...
              </>
            ) : (
              <>
                Access Admin Portal
                <ArrowRight size={14} />
              </>
            )}
          </button>
        </form>

        {/* Additional security note */}
        <div className="text-center text-[10px] text-white/30 font-sans border-t border-white/5 pt-4">
          Direct connections are encrypted and logged for auditing purposes.
        </div>

      </div>
    </div>
  );
};

export default AdminLogin;
