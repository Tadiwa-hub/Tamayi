import React, { useEffect, useState } from 'react';
import AdminSidebar from '../components/AdminSidebar';
import { Search, Filter, Phone, Check, X, Calendar, AlertCircle } from 'lucide-react';

const AdminBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

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
        setError(null);
      } else {
        throw new Error('Failed to retrieve bookings.');
      }
    } catch (err) {
      console.error(err);
      setError('Could not retrieve bookings from the server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

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
        alert('Failed to update booking status.');
      }
    } catch (err) {
      console.error(err);
      alert('Error updating status.');
    }
  };

  // Filtering Logic
  const filteredBookings = bookings.filter(b => {
    const matchesSearch = 
      b.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.client_phone.includes(searchTerm) ||
      b.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.property_name.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesStatus = statusFilter === 'all' || b.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="flex bg-[#121212] min-h-screen text-white font-sans">
      <AdminSidebar />

      <main className="flex-grow p-8 md:p-12 overflow-y-auto">
        <header className="mb-10">
          <h1 className="font-serif text-3xl md:text-4xl text-white font-light tracking-wide">Bookings Ledger</h1>
          <p className="text-white/40 text-xs mt-1 uppercase tracking-wider font-semibold">View and manage all guest inquiries</p>
        </header>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-300 p-4 text-xs mb-8">
            {error}
          </div>
        )}

        {/* Controls Layout */}
        <div className="flex flex-col md:flex-row gap-4 justify-between items-stretch mb-8">
          {/* Search Input */}
          <div className="relative flex-grow max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" size={16} />
            <input
              type="text"
              placeholder="Search by client name, ID, phone, or stay..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-[#1A1A1A] border border-white/5 text-white rounded-none focus:outline-none focus:border-[#C9A96E] font-sans text-xs transition-all"
            />
          </div>

          {/* Status Filter Tab Group */}
          <div className="flex items-center gap-1 bg-[#1A1A1A] border border-white/5 p-1">
            {['all', 'pending', 'confirmed', 'cancelled', 'no_show'].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1.5 text-[10px] uppercase font-bold tracking-wider transition-all rounded-none cursor-pointer ${
                  statusFilter === status
                    ? 'bg-[#C9A96E] text-[#1A1A1A]'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                {status.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Table Layout */}
        <div className="bg-[#1A1A1A] border border-white/5 overflow-x-auto shadow-md">
          {loading ? (
            <div className="text-center py-16 text-sm text-white/30">Loading booking database...</div>
          ) : filteredBookings.length === 0 ? (
            <div className="text-center py-16 text-sm text-white/30">No booking entries match the filters.</div>
          ) : (
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-white/5 bg-[#222222] text-white/40 font-bold uppercase tracking-wider text-[10px]">
                  <th className="p-4">ID</th>
                  <th className="p-4">Client Contact</th>
                  <th className="p-4">Accommodation Details</th>
                  <th className="p-4">Stay Dates</th>
                  <th className="p-4">Requests / Inquiries</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredBookings.map((b) => (
                  <tr key={b.id} className="hover:bg-white/5 transition-all">
                    <td className="p-4 font-mono font-bold text-[#C9A96E] whitespace-nowrap">{b.id}</td>
                    <td className="p-4">
                      <div className="font-semibold text-white text-sm">{b.client_name}</div>
                      <div className="text-[#C9A96E]/80 flex items-center gap-1.5 mt-0.5 font-mono">
                        <Phone size={10} />
                        <span>{b.client_phone}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="font-serif text-sm text-white/90">{b.property_name}</div>
                      <div className="text-white/40 mt-0.5">{b.num_guests} Guests</div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1.5 text-white/80">
                        <Calendar size={12} className="text-[#C9A96E]/70" />
                        <span>{b.check_in}</span>
                      </div>
                      {b.check_out && (
                        <div className="text-white/40 ml-5 font-light">to {b.check_out}</div>
                      )}
                    </td>
                    <td className="p-4 max-w-xs">
                      <p className="text-white/60 line-clamp-2 italic font-serif">
                        "{b.special_requests || 'No special requests'}"
                      </p>
                    </td>
                    <td className="p-4">
                      <span className={`inline-block px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider border rounded-none ${
                        b.status === 'confirmed' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' :
                        b.status === 'cancelled' ? 'bg-red-500/10 border-red-500/30 text-red-400' :
                        b.status === 'no_show' ? 'bg-gray-500/10 border-gray-500/30 text-gray-400' :
                        'bg-amber-500/10 border-amber-500/30 text-amber-400'
                      }`}>
                        {b.status}
                      </span>
                    </td>
                    <td className="p-4 text-right whitespace-nowrap">
                      <div className="inline-flex gap-1.5 justify-end">
                        {b.status !== 'confirmed' && (
                          <button
                            onClick={() => handleUpdateStatus(b.id, 'confirmed')}
                            className="bg-emerald-600/20 hover:bg-emerald-600 border border-emerald-500/20 text-emerald-400 hover:text-white p-1.5 transition-colors cursor-pointer"
                            title="Confirm Booking"
                          >
                            <Check size={14} />
                          </button>
                        )}
                        {b.status !== 'cancelled' && (
                          <button
                            onClick={() => handleUpdateStatus(b.id, 'cancelled')}
                            className="bg-red-500/10 hover:bg-red-600 border border-red-500/20 text-red-400 hover:text-white p-1.5 transition-colors cursor-pointer"
                            title="Cancel Booking"
                          >
                            <X size={14} />
                          </button>
                        )}
                        {b.status !== 'no_show' && (
                          <button
                            onClick={() => handleUpdateStatus(b.id, 'no_show')}
                            className="bg-gray-500/10 hover:bg-gray-600 border border-gray-500/20 text-gray-400 hover:text-white px-2 py-1.5 transition-colors cursor-pointer text-[10px] uppercase font-bold tracking-wider"
                            title="Mark No Show"
                          >
                            No Show
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminBookings;
