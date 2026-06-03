import React, { useEffect, useState } from 'react';
import AdminSidebar from '../components/AdminSidebar';
import { Settings, Shield, Globe, HardDrive, PhoneCall, Key } from 'lucide-react';

const AdminSettings = () => {
  const [sessionDetails, setSessionDetails] = useState({
    token: '...',
    expiry: '...'
  });

  useEffect(() => {
    const token = localStorage.getItem('tamayi_admin_token');
    if (token) {
      // Decode or truncate token
      const displayToken = token.slice(0, 8) + '...' + token.slice(-8);
      // Fallback session expiry: standard 8h from local token insertion if expiry cannot be validated
      const estimatedExpiry = new Date(Date.now() + 8 * 3600 * 1000).toLocaleString();
      setSessionDetails({ token: displayToken, expiry: estimatedExpiry });
    }
  }, []);

  return (
    <div className="flex bg-[#121212] min-h-screen text-white font-sans">
      <AdminSidebar />

      <main className="flex-grow p-8 md:p-12 overflow-y-auto">
        <header className="mb-10">
          <h1 className="font-serif text-3xl md:text-4xl text-white font-light tracking-wide">System Settings</h1>
          <p className="text-white/40 text-xs mt-1 uppercase tracking-wider font-semibold">Verify portal configurations and session health</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          
          {/* Left Block: Security & Session */}
          <div className="space-y-8">
            <section className="bg-[#1A1A1A] border border-white/5 p-6 shadow-md">
              <div className="flex items-center gap-3 border-b border-white/5 pb-4 mb-6">
                <Shield size={18} className="text-[#C9A96E]" />
                <h2 className="font-serif text-lg text-white">Active Session Credentials</h2>
              </div>
              
              <div className="space-y-4 text-xs font-sans">
                <div className="flex justify-between items-center border-b border-white/5 pb-2">
                  <span className="text-white/40 uppercase font-semibold">Active Auth Token</span>
                  <span className="font-mono text-white/80">{sessionDetails.token}</span>
                </div>
                <div className="flex justify-between items-center border-b border-white/5 pb-2">
                  <span className="text-white/40 uppercase font-semibold">Session Lifetime</span>
                  <span className="text-white/80">8 Hours (Auto Expire)</span>
                </div>
                <div className="flex justify-between items-center pb-2">
                  <span className="text-white/40 uppercase font-semibold">Expiration Est.</span>
                  <span className="text-white/80 font-mono text-[#C9A96E]">{sessionDetails.expiry}</span>
                </div>
              </div>
            </section>

            <section className="bg-[#1A1A1A] border border-white/5 p-6 shadow-md">
              <div className="flex items-center gap-3 border-b border-white/5 pb-4 mb-6">
                <Key size={18} className="text-[#C9A96E]" />
                <h2 className="font-serif text-lg text-white">Security Policies</h2>
              </div>
              
              <p className="text-xs text-white/50 leading-relaxed font-sans mb-4">
                The management credentials are authenticated via isolated Cloudflare Worker configuration secrets. To change the master login key, edit the `ADMIN_PASSWORD` variable inside `wrangler.toml` or set it in your Cloudflare dashboard environment variables.
              </p>
            </section>
          </div>

          {/* Right Block: System Metadata & General Config */}
          <div className="space-y-8">
            <section className="bg-[#1A1A1A] border border-white/5 p-6 shadow-md">
              <div className="flex items-center gap-3 border-b border-white/5 pb-4 mb-6">
                <Globe size={18} className="text-[#C9A96E]" />
                <h2 className="font-serif text-lg text-white">Application Parameters</h2>
              </div>
              
              <div className="space-y-4 text-xs font-sans">
                <div className="flex justify-between items-center border-b border-white/5 pb-2">
                  <span className="text-white/40 uppercase font-semibold">App Version</span>
                  <span className="text-white/80">1.0.0 (Harare Release)</span>
                </div>
                <div className="flex justify-between items-center border-b border-white/5 pb-2">
                  <span className="text-white/40 uppercase font-semibold">Frameworks</span>
                  <span className="text-white/80">React 19, Hono API, Tailwind v4</span>
                </div>
                <div className="flex justify-between items-center pb-2">
                  <span className="text-white/40 uppercase font-semibold">Deploy Environment</span>
                  <span className="text-[#C9A96E] font-semibold">Cloudflare Pages & Workers</span>
                </div>
              </div>
            </section>

            <section className="bg-[#1A1A1A] border border-white/5 p-6 shadow-md">
              <div className="flex items-center gap-3 border-b border-white/5 pb-4 mb-6">
                <PhoneCall size={18} className="text-[#C9A96E]" />
                <h2 className="font-serif text-lg text-white">WhatsApp Integration</h2>
              </div>
              
              <div className="space-y-4 text-xs font-sans">
                <p className="text-white/50 leading-relaxed font-sans">
                  The current integration utilizes standard WhatsApp click-to-chat links pre-loaded with query tokens. Direct contact target is:
                </p>
                <div className="bg-[#222222] border border-white/5 p-3 font-mono text-[#C9A96E] text-center text-sm font-bold">
                  +263 78 789 1150
                </div>
              </div>
            </section>
          </div>

        </div>
      </main>
    </div>
  );
};

export default AdminSettings;
