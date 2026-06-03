import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Calendar, BookOpen, Settings, LogOut } from 'lucide-react';
import logoImg from '../assets/logo.png';

const AdminSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    const token = localStorage.getItem('tamayi_admin_token');
    try {
      if (token) {
        await fetch('https://tamayi.zimbabwe.workers.dev/api/admin/logout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
      }
    } catch (err) {
      console.error('Logout error on worker endpoint:', err);
    } finally {
      localStorage.removeItem('tamayi_admin_token');
      navigate('/admin');
    }
  };

  const navItems = [
    { path: '/admin/dashboard', name: 'Home', icon: LayoutDashboard },
    { path: '/admin/availability', name: 'Dates', icon: Calendar },
    { path: '/admin/bookings', name: 'Ledger', icon: BookOpen },
    { path: '/admin/settings', name: 'Config', icon: Settings },
  ];

  return (
    <>
      {/* Desktop Sidebar (Hidden on Mobile) */}
      <aside className="hidden md:flex w-64 bg-[#1A1A1A] border-r border-[#C9A96E]/20 text-white min-h-screen flex-col shrink-0">
        <div className="p-6 border-b border-[#C9A96E]/10 flex items-center gap-3">
          <img src={logoImg} alt="Gold logo" className="w-8 h-8 object-contain" />
          <div>
            <span className="font-serif font-semibold tracking-widest text-base text-[#C9A96E] block">TAMAYI</span>
            <span className="text-[10px] text-white/40 uppercase tracking-widest block -mt-1">Admin Portal</span>
          </div>
        </div>

        <nav className="flex-grow p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 text-sm font-medium tracking-wide transition-all duration-300 rounded-none border-l-2 ${
                  isActive
                    ? 'bg-[#C9A96E]/10 border-[#C9A96E] text-[#C9A96E]'
                    : 'border-transparent text-white/70 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon size={18} className={isActive ? 'text-[#C9A96E]' : 'text-white/50'} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-[#C9A96E]/10">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 text-sm font-medium tracking-wide text-red-400 hover:text-red-300 hover:bg-red-500/5 transition-all duration-300 border-l-2 border-transparent cursor-pointer"
          >
            <LogOut size={18} className="opacity-70" />
            Logout
          </button>
        </div>
      </aside>

      {/* Mobile Bottom Navigation (Hidden on Desktop) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[#1A1A1A] border-t border-[#C9A96E]/20 px-4 py-2 flex items-center justify-around z-50 shadow-[0_-4px_20px_rgba(0,0,0,0.5)]">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center gap-1 p-2 transition-all duration-300 ${
                isActive ? 'text-[#C9A96E]' : 'text-white/40'
              }`}
            >
              <Icon size={20} className={isActive ? 'animate-pulse' : ''} />
              <span className="text-[9px] uppercase font-bold tracking-tighter">{item.name}</span>
            </Link>
          );
        })}
        {/* Mobile Logout Button */}
        <button
          onClick={handleLogout}
          className="flex flex-col items-center gap-1 p-2 text-red-500/60 active:text-red-500 transition-colors cursor-pointer"
        >
          <LogOut size={20} />
          <span className="text-[9px] uppercase font-bold tracking-tighter">Exit</span>
        </button>
      </nav>
    </>
  );
};

export default AdminSidebar;