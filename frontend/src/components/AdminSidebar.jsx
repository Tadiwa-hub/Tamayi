import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Calendar, BookOpen, DollarSign, Settings, LogOut } from 'lucide-react';
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
    { path: '/admin/dashboard', name: 'Dashboard', icon: LayoutDashboard },
    { path: '/admin/availability', name: 'Availability', icon: Calendar },
    { path: '/admin/bookings', name: 'Bookings', icon: BookOpen },
    { path: '/admin/settings', name: 'Settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-[#1A1A1A] border-r border-[#C9A96E]/20 text-white min-h-screen flex flex-col shrink-0">
      {/* Brand Header */}
      <div className="p-6 border-b border-[#C9A96E]/10 flex items-center gap-3">
        <img src={logoImg} alt="Gold logo" className="w-8 h-8 object-contain" />
        <div>
          <span className="font-serif font-semibold tracking-widest text-base text-[#C9A96E] block">TAMAYI</span>
          <span className="text-[10px] text-white/40 uppercase tracking-widest block -mt-1">Admin Portal</span>
        </div>
      </div>

      {/* Navigation Section */}
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

      {/* Logout Footer Button */}
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
  );
};

export default AdminSidebar;
