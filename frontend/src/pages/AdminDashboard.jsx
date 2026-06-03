import React, { useState, useEffect } from 'react';
import AdminSidebar from '../components/AdminSidebar';
import { Calendar, Plus, User, Phone, Home, LogOut, ChevronRight, Check, X, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PROPERTIES } from '../data/properties';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Manual Booking Form State
  const [form, setForm] = useState({
    property_id: 'holiday_home',
    client_name: '',
    client_phone: '',
    check_in: '',
    check_out: ''
  });

  const fetchBookings = async () => {
    const token = localStorage.getItem('tamayi_admin_token');
    try {
      const res = await fetch('https://tamayi.zimbabwe.workers.dev/api/bookings', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setBookings(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const token = localStorage.getItem('tamayi_admin_token');

    try {
      const property = PROPERTIES.find(p => p.id === form.property_id);
      const res = await fetch('https://tamayi.zimbabwe.workers.dev/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          property_name: property.name,
          special_requests: 'Manual Entry (Admin)'
        })
      });

      if (res.ok) {
        setShowAddForm(false);
        setForm({ property_id: 'holiday_home', client_name: '', client_phone: '', check_in: '', check_out: '' });
        fetchBookings();
      }
    } catch (err) {
      alert("Error adding booking");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateStatus = async (id, newStatus) => {
    const token = localStorage.getItem('tamayi_admin_token');
    try {
      await fetch(`https://tamayi.zimbabwe.workers.dev/api/bookings/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      fetchBookings();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-[#121212] text-white flex flex-col md:flex-row">
      <AdminSidebar />
      
      <main className="flex-grow p-4 md:p-10 lg:p-16">
        
        {/* Simple Mobile Header */}
        <header className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-serif text-white">Management</h1>
            <p className="text-[10px] uppercase tracking-widest text-[#C9A96E] font-bold">Tamayi Luxury Stays</p>
          </div>
          <button 
            onClick={() => setShowAddForm(!showAddForm)}
            className="w-10 h-10 bg-[#C9A96E] text-[#1A1A1A] rounded-full flex items-center justify-center shadow-lg active:scale-95 transition-transform"
          >
            {showAddForm ? <X size={20} /> : <Plus size={20} />}
          </button>
        </header>

        {/* Action: Manual Entry Form (Modal/Overlay for Mobile) */}
        {showAddForm && (
          <section className="bg-[#1A1A1A] border border-[#C9A96E]/20 p-6 mb-8 rounded-none animate-slide-up">
            <h2 className="font-serif text-lg mb-6 flex items-center gap-2">
              <Plus size={18} className="text-[#C9A96E]" /> Add Manual Booking
            </h2>
            <form onSubmit={handleManualSubmit} className="space-y-4">
              <div className="space-y-1 text-xs">
                <label className="text-white/40 uppercase font-bold tracking-widest">Select Room</label>
                <select 
                  value={form.property_id}
                  onChange={(e) => setForm({...form, property_id: e.target.value})}
                  className="w-full bg-[#222222] border border-white/10 p-3 outline-none focus:border-[#C9A96E]"
                >
                  {PROPERTIES.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1 text-xs">
                  <label className="text-white/40 uppercase font-bold tracking-widest">Guest Name</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Walk-in Guest"
                    value={form.client_name}
                    onChange={(e) => setForm({...form, client_name: e.target.value})}
                    className="w-full bg-[#222222] border border-white/10 p-3 outline-none focus:border-[#C9A96E]"
                    required
                  />
                </div>
                <div className="space-y-1 text-xs">
                  <label className="text-white/40 uppercase font-bold tracking-widest">Phone</label>
                  <input 
                    type="tel" 
                    placeholder="e.g. +263 77..."
                    value={form.client_phone}
                    onChange={(e) => setForm({...form, client_phone: e.target.value})}
                    className="w-full bg-[#222222] border border-white/10 p-3 outline-none focus:border-[#C9A96E]"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1 text-xs">
                  <label className="text-white/40 uppercase font-bold tracking-widest">Start Date</label>
                  <input 
                    type="date" 
                    value={form.check_in}
                    onChange={(e) => setForm({...form, check_in: e.target.value})}
                    className="w-full bg-[#222222] border border-white/10 p-3 outline-none focus:border-[#C9A96E]"
                    required
                  />
                </div>
                <div className="space-y-1 text-xs">
                  <label className="text-white/40 uppercase font-bold tracking-widest">End Date</label>
                  <input 
                    type="date" 
                    value={form.check_out}
                    onChange={(e) => setForm({...form, check_out: e.target.value})}
                    className="w-full bg-[#222222] border border-white/10 p-3 outline-none focus:border-[#C9A96E]"
                    required
                  />
                </div>
              </div>

              <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full py-4 bg-[#C9A96E] text-[#1A1A1A] font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2"
              >
                {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                {isSubmitting ? 'Slashing Dates...' : 'Register and Slash Dates'}
              </button>
            </form>
          </section>
        )}

        {/* Simple List of Bookings */}
        <section className="space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-4">
            <h2 className="text-sm uppercase tracking-widest text-white/50 font-bold">Recent History</h2>
            <span className="text-[10px] font-mono text-[#C9A96E]">{bookings.length} Total</span>
          </div>

          {loading ? (
            <div className="text-center py-20 opacity-20"><Loader2 className="animate-spin mx-auto" /></div>
          ) : bookings.length === 0 ? (
            <div className="text-center py-20 text-xs text-white/20">No bookings yet</div>
          ) : (
            bookings.map(b => (
              <div key={b.id} className="bg-[#1A1A1A] p-4 border-l-2 border-[#C9A96E]/40 flex items-center justify-between group transition-all active:bg-[#222222]">
                <div className="space-y-1">
                  <p className="text-sm font-serif">{b.client_name}</p>
                  <p className="text-[10px] text-white/40 uppercase">{b.property_name} • {b.check_in}</p>
                  <p className="text-[9px] font-mono text-[#C9A96E]">{b.client_phone}</p>
                </div>
                
                <div className="flex gap-2">
                  {b.status === 'confirmed' ? (
                    <button 
                      onClick={() => handleUpdateStatus(b.id, 'cancelled')}
                      className="p-2 bg-red-500/10 text-red-500 border border-red-500/20"
                    >
                      <X size={14} />
                    </button>
                  ) : (
                    <button 
                      onClick={() => handleUpdateStatus(b.id, 'confirmed')}
                      className="p-2 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                    >
                      <Check size={14} />
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </section>

      </main>
    </div>
  );
};

export default AdminDashboard;