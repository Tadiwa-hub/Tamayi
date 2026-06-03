import React, { useEffect, useState } from 'react';
import AdminSidebar from '../components/AdminSidebar';
import { BookOpen, AlertCircle, CheckCircle, XCircle, DollarSign, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
  const [bookings, setBookings] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    confirmed: 0,
    cancelled: 0,
    revenue: 0 // Estimated revenue of confirmed stays
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchBookings = async () => {
    const token = localStorage.getItem('tamayi_admin_token');
    try {
      const res = await fetch('https://tamayi.zimbabwe.workers.dev/api/bookings', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setBookings(data);
        calculateStats(data);
        setError(null);
      } else {
        throw new Error('Failed to retrieve bookings.');
      }
    } catch (err) {
      console.error(err);
      setError('Could not update live dashboard metrics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const calculateStats = (list) => {
    let total = list.length;
    let pending = 0;
    let confirmed = 0;
    let cancelled = 0;
    let revenue = 0;

    const propertyRates = {
      holiday_home: 150,
      full_house: 100,
      new_cottage: 40,
      private_rooms: 30,
      outdoor_setup: 30
    };

    list.forEach(b => {
      if (b.status === 'pending') pending++;
      else if (b.status === 'confirmed') {
        confirmed++;
        // Estimate stay duration or fallback to 1 night
        let nights = 1;
        if (b.check_in && b.check_out) {
          const diff = new Date(b.check_out) - new Date(b.check_in);
          if (diff > 0) {
            nights = Math.ceil(diff / (1000 * 3600 * 24));
          }
        }
        const rate = propertyRates[b.property_id] || 30;
        revenue += rate * nights;
      }
      else if (b.status === 'cancelled') cancelled++;
    });

    setStats({ total, pending, confirmed, cancelled, revenue });
  };

  const handleUpdateStatus = async (id, newStatus) => {
    const token = localStorage.getItem('tamayi_admin_token');
    try {
      const res = await fetch(`https://tamayi.zimbabwe.workers.dev/api/bookings/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        fetchBookings();
      } else {
        alert('Failed to update booking status');
      }
    } catch (err) {
      console.error(err);
      alert('Error updating status');
    }
  };

  const statCards = [
    { label: 'Total Inquiries', value: stats.total, icon: BookOpen, color: 'text-blue-400 bg-blue-500/10' },
    { label: 'Pending Verification', value: stats.pending, icon: AlertCircle, color: 'text-amber-400 bg-amber-500/10' },
    { label: 'Stay Confirmed', value: stats.confirmed, icon: CheckCircle, color: 'text-emerald-400 bg-emerald-500/10' },
    { label: 'Cancelled Requests', value: stats.cancelled, icon: XCircle, color: 'text-red-400 bg-red-500/10' },
  ];

  return (
    <div className="flex bg-[#121212] min-h-screen text-white font-sans">
      <AdminSidebar />
      
      <main className="flex-grow p-8 md:p-12 overflow-y-auto">
        <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="font-serif text-3xl md:text-4xl text-white font-light tracking-wide">Dashboard</h1>
            <p className="text-white/40 text-xs mt-1 uppercase tracking-wider font-semibold">System metrics at a glance</p>
          </div>
          <div className="bg-[#1A1A1A] border border-[#C9A96E]/20 px-6 py-3.5 flex items-center gap-3">
            <DollarSign className="text-[#C9A96E]" size={20} />
            <div>
              <span className="text-[10px] text-white/40 uppercase tracking-widest block">Est. Confirmed Revenue</span>
              <span className="text-lg font-serif font-bold text-[#C9A96E]">${stats.revenue} USD</span>
            </div>
          </div>
        </header>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-300 p-4 text-xs mb-8">
            {error}
          </div>
        )}

        {/* Stats Grid */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {statCards.map((card, idx) => {
            const Icon = card.icon;
            return (
              <div key={idx} className="bg-[#1A1A1A] border border-white/5 p-6 flex items-center justify-between shadow-md">
                <div>
                  <span className="text-xs text-white/40 uppercase tracking-wider font-semibold block">{card.label}</span>
                  <span className="text-3xl font-serif font-bold text-white mt-2 block">
                    {loading ? '...' : card.value}
                  </span>
                </div>
                <div className={`p-3.5 rounded-none ${card.color}`}>
                  <Icon size={24} />
                </div>
              </div>
            );
          })}
        </section>

        {/* Main Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Inquiries List */}
          <section className="lg:col-span-2 bg-[#1A1A1A] border border-white/5 p-6 shadow-md">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-serif text-xl text-white">Recent Inquiries</h2>
              <Link to="/admin/bookings" className="text-[#C9A96E] hover:text-[#B4955E] text-xs uppercase tracking-wider font-semibold flex items-center gap-1 transition-colors">
                View All <ArrowRight size={12} />
              </Link>
            </div>

            {loading ? (
              <div className="text-center py-12 text-sm text-white/30">Loading database entries...</div>
            ) : bookings.length === 0 ? (
              <div className="text-center py-12 text-sm text-white/30">No bookings available.</div>
            ) : (
              <div className="space-y-4">
                {bookings.slice(0, 5).map((b) => (
                  <div key={b.id} className="bg-[#222222] border border-white/5 p-4 flex flex-col sm:flex-row justify-between sm:items-center gap-4 transition-all hover:border-[#C9A96E]/20">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-serif text-sm font-semibold text-white">{b.client_name}</span>
                        <span className="text-[10px] font-mono text-[#C9A96E] bg-[#C9A96E]/10 px-1.5 py-0.5 font-bold uppercase">{b.id}</span>
                      </div>
                      <p className="text-xs text-white/50">{b.property_name} • {b.check_in} {b.check_out && `to ${b.check_out}`}</p>
                      <p className="text-[11px] text-white/40 italic font-serif">"{b.special_requests || 'No special requests'}"</p>
                    </div>

                    <div className="flex items-center gap-3 self-end sm:self-center">
                      <span className={`text-[10px] uppercase font-semibold tracking-wider px-2.5 py-1 rounded-none border ${
                        b.status === 'confirmed' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' :
                        b.status === 'cancelled' ? 'bg-red-500/10 border-red-500/30 text-red-400' :
                        b.status === 'no_show' ? 'bg-gray-500/10 border-gray-500/30 text-gray-400' :
                        'bg-amber-500/10 border-amber-500/30 text-amber-400'
                      }`}>
                        {b.status}
                      </span>
                      
                      {b.status === 'pending' && (
                        <div className="flex gap-1.5">
                          <button
                            onClick={() => handleUpdateStatus(b.id, 'confirmed')}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white px-2.5 py-1.5 text-[10px] uppercase font-bold tracking-wider rounded-none cursor-pointer"
                          >
                            Accept
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(b.id, 'cancelled')}
                            className="bg-red-950 hover:bg-red-900 border border-red-800 text-red-400 px-2.5 py-1.5 text-[10px] uppercase font-bold tracking-wider rounded-none cursor-pointer"
                          >
                            Reject
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Quick Info Sidebar */}
          <section className="bg-[#1A1A1A] border border-white/5 p-6 shadow-md flex flex-col gap-6">
            <h2 className="font-serif text-xl text-white border-b border-white/5 pb-3">Accommodations</h2>
            <div className="space-y-4 font-sans text-xs">
              <div className="flex justify-between items-center border-b border-white/5 pb-2">
                <span className="text-white/60">Tamayi Holiday Home</span>
                <span className="text-[#C9A96E] font-semibold font-serif text-sm">$150/night</span>
              </div>
              <div className="flex justify-between items-center border-b border-white/5 pb-2">
                <span className="text-white/60">Full House (3 Bed)</span>
                <span className="text-[#C9A96E] font-semibold font-serif text-sm">$100/night</span>
              </div>
              <div className="flex justify-between items-center border-b border-white/5 pb-2">
                <span className="text-white/60">New Cottage (1 Bed)</span>
                <span className="text-[#C9A96E] font-semibold font-serif text-sm">$40/night</span>
              </div>
              <div className="flex justify-between items-center border-b border-white/5 pb-2">
                <span className="text-white/60">Private Rooms</span>
                <span className="text-[#C9A96E] font-semibold font-serif text-sm">$30/night</span>
              </div>
              <div className="flex justify-between items-center pb-2">
                <span className="text-white/60">Outdoor Setup</span>
                <span className="text-[#C9A96E] font-semibold font-serif text-sm">$30 Flat</span>
              </div>
            </div>
            
            <div className="bg-[#222222] border border-[#C9A96E]/10 p-4 font-sans text-xs text-white/50 leading-relaxed mt-auto">
              <h4 className="font-semibold text-white mb-1.5 uppercase tracking-wide">Quick Tip</h4>
              Admins can toggle availability blocks for holidays or maintenance in the <strong>Availability Manager</strong> tab. Confirmed bookings will block dates automatically if you manually flag them in the Availability list.
            </div>
          </section>
        </div>

      </main>
    </div>
  );
};

export default AdminDashboard;
