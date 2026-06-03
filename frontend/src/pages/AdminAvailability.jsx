import React, { useState } from 'react';
import AdminSidebar from '../components/AdminSidebar';
import AvailabilityCalendar from '../components/AvailabilityCalendar';
import { Calendar, Layers, CheckCircle, RefreshCcw } from 'lucide-react';

const PROPERTIES = [
  { id: 'holiday_home', label: 'Holiday Home' },
  { id: 'full_house', label: 'Full House' },
  { id: 'private_rooms', label: 'Private Rooms' },
  { id: 'new_cottage', label: 'Cottage' },
  { id: 'outdoor_setup', label: 'Outdoor Setup' }
];

const AdminAvailability = () => {
  // Calendar Key to force reload when override is submitted
  const [calendarKey, setCalendarKey] = useState(0);

  // Single Day Form State
  const [singleProp, setSingleProp] = useState('holiday_home');
  const [singleDate, setSingleDate] = useState('');
  const [singleStatus, setSingleStatus] = useState('fully_booked');
  const [singleNote, setSingleNote] = useState('');
  
  // Bulk Form State
  const [bulkProp, setBulkProp] = useState('holiday_home');
  const [bulkFrom, setBulkFrom] = useState('');
  const [bulkTo, setBulkTo] = useState('');
  const [bulkStatus, setBulkStatus] = useState('fully_booked');

  // Loaders / Messages
  const [singleLoading, setSingleLoading] = useState(false);
  const [bulkLoading, setBulkLoading] = useState(false);
  const [msg, setMsg] = useState({ text: null, type: null });

  const triggerCalendarRefresh = () => {
    setCalendarKey(prev => prev + 1);
  };

  const handleSingleSubmit = async (e) => {
    e.preventDefault();
    setMsg({ text: null, type: null });
    setSingleLoading(true);

    if (!singleDate || !singleProp || !singleStatus) {
      setMsg({ text: 'Please fill in all single override parameters.', type: 'error' });
      setSingleLoading(false);
      return;
    }

    const token = localStorage.getItem('tamayi_admin_token');

    try {
      const res = await fetch('https://tamayi.zimbabwe.workers.dev/api/availability', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          property_id: singleProp,
          date: singleDate,
          status: singleStatus,
          note: singleNote
        })
      });

      if (res.ok) {
        setMsg({ text: `Day override applied successfully for ${singleDate}.`, type: 'success' });
        setSingleDate('');
        setSingleNote('');
        triggerCalendarRefresh();
      } else {
        const data = await res.json();
        throw new Error(data.error || 'Failed to update day availability.');
      }
    } catch (err) {
      console.error(err);
      setMsg({ text: err.message, type: 'error' });
    } finally {
      setSingleLoading(false);
    }
  };

  const handleBulkSubmit = async (e) => {
    e.preventDefault();
    setMsg({ text: null, type: null });
    setBulkLoading(true);

    if (!bulkFrom || !bulkTo || !bulkProp || !bulkStatus) {
      setMsg({ text: 'Please fill in all bulk override parameters.', type: 'error' });
      setBulkLoading(false);
      return;
    }

    if (new Date(bulkTo) < new Date(bulkFrom)) {
      setMsg({ text: 'End date must be on or after start date.', type: 'error' });
      setBulkLoading(false);
      return;
    }

    const token = localStorage.getItem('tamayi_admin_token');

    try {
      const res = await fetch('https://tamayi.zimbabwe.workers.dev/api/availability/bulk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          property_id: bulkProp,
          from: bulkFrom,
          to: bulkTo,
          status: bulkStatus
        })
      });

      if (res.ok) {
        const data = await res.json();
        setMsg({ text: `Bulk overrides applied successfully to ${data.count} dates.`, type: 'success' });
        setBulkFrom('');
        setBulkTo('');
        triggerCalendarRefresh();
      } else {
        const data = await res.json();
        throw new Error(data.error || 'Failed to apply bulk ranges.');
      }
    } catch (err) {
      console.error(err);
      setMsg({ text: err.message, type: 'error' });
    } finally {
      setBulkLoading(false);
    }
  };

  return (
    <div className="flex bg-[#121212] min-h-screen text-white font-sans">
      <AdminSidebar />

      <main className="flex-grow p-8 md:p-12 overflow-y-auto">
        <header className="mb-10 flex justify-between items-start">
          <div>
            <h1 className="font-serif text-3xl md:text-4xl text-white font-light tracking-wide">Availability Control</h1>
            <p className="text-white/40 text-xs mt-1 uppercase tracking-wider font-semibold">Block, open, or request-flag specific properties</p>
          </div>
          <button
            onClick={triggerCalendarRefresh}
            className="flex items-center gap-2 border border-white/10 hover:border-white/20 bg-white/5 px-4 py-2 text-xs uppercase tracking-wider font-bold transition-all cursor-pointer"
          >
            <RefreshCcw size={14} /> Refresh Calendar
          </button>
        </header>

        {msg.text && (
          <div className={`p-4 text-xs font-sans mb-8 border ${
            msg.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-red-500/10 border-red-500/30 text-red-400'
          }`}>
            {msg.text}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          
          {/* Override Controls Layout */}
          <div className="space-y-12">
            
            {/* Single Override Form */}
            <section className="bg-[#1A1A1A] border border-white/5 p-6 shadow-md">
              <div className="flex items-center gap-3 border-b border-white/5 pb-4 mb-6">
                <Calendar size={18} className="text-[#C9A96E]" />
                <h2 className="font-serif text-lg text-white">Single Day Override</h2>
              </div>

              <form onSubmit={handleSingleSubmit} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="single-prop" className="block text-white/50 mb-1.5 uppercase font-semibold tracking-wider">Accommodation</label>
                    <select
                      id="single-prop"
                      value={singleProp}
                      onChange={(e) => setSingleProp(e.target.value)}
                      className="w-full p-3 bg-[#222222] border border-white/5 text-white rounded-none focus:outline-none focus:border-[#C9A96E]"
                    >
                      {PROPERTIES.map(p => (
                        <option key={p.id} value={p.id}>{p.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="single-date" className="block text-white/50 mb-1.5 uppercase font-semibold tracking-wider">Specific Date</label>
                    <input
                      id="single-date"
                      type="date"
                      value={singleDate}
                      onChange={(e) => setSingleDate(e.target.value)}
                      className="w-full p-3 bg-[#222222] border border-white/5 text-white rounded-none focus:outline-none focus:border-[#C9A96E]"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="single-status" className="block text-white/50 mb-1.5 uppercase font-semibold tracking-wider">Status Override</label>
                    <select
                      id="single-status"
                      value={singleStatus}
                      onChange={(e) => setSingleStatus(e.target.value)}
                      className="w-full p-3 bg-[#222222] border border-white/5 text-white rounded-none focus:outline-none focus:border-[#C9A96E]"
                    >
                      <option value="available">🟢 Available</option>
                      <option value="on_request">🟡 On Request</option>
                      <option value="fully_booked">🔴 Fully Booked</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="single-note" className="block text-white/50 mb-1.5 uppercase font-semibold tracking-wider">Note (Internal / Customer)</label>
                    <input
                      id="single-note"
                      type="text"
                      placeholder="e.g. Corporate retreat, Maintenance..."
                      value={singleNote}
                      onChange={(e) => setSingleNote(e.target.value)}
                      className="w-full p-3 bg-[#222222] border border-white/5 text-white rounded-none focus:outline-none focus:border-[#C9A96E]"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={singleLoading}
                  className="w-full mt-4 bg-transparent hover:bg-[#C9A96E] hover:text-[#1A1A1A] border border-[#C9A96E] text-[#C9A96E] py-3 uppercase tracking-widest font-bold font-mono transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  {singleLoading ? 'Applying...' : 'Save Override'}
                </button>
              </form>
            </section>

            {/* Bulk Range Form */}
            <section className="bg-[#1A1A1A] border border-white/5 p-6 shadow-md">
              <div className="flex items-center gap-3 border-b border-white/5 pb-4 mb-6">
                <Layers size={18} className="text-[#C9A96E]" />
                <h2 className="font-serif text-lg text-white">Bulk Range Overlay</h2>
              </div>

              <form onSubmit={handleBulkSubmit} className="space-y-4 text-xs">
                <div>
                  <label htmlFor="bulk-prop" className="block text-white/50 mb-1.5 uppercase font-semibold tracking-wider">Accommodation</label>
                  <select
                    id="bulk-prop"
                    value={bulkProp}
                    onChange={(e) => setBulkProp(e.target.value)}
                    className="w-full p-3 bg-[#222222] border border-white/5 text-white rounded-none focus:outline-none focus:border-[#C9A96E]"
                  >
                    {PROPERTIES.map(p => (
                      <option key={p.id} value={p.id}>{p.label}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="bulk-from" className="block text-white/50 mb-1.5 uppercase font-semibold tracking-wider">From Start Date</label>
                    <input
                      id="bulk-from"
                      type="date"
                      value={bulkFrom}
                      onChange={(e) => setBulkFrom(e.target.value)}
                      className="w-full p-3 bg-[#222222] border border-white/5 text-white rounded-none focus:outline-none focus:border-[#C9A96E]"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="bulk-to" className="block text-white/50 mb-1.5 uppercase font-semibold tracking-wider">To End Date</label>
                    <input
                      id="bulk-to"
                      type="date"
                      value={bulkTo}
                      onChange={(e) => setBulkTo(e.target.value)}
                      className="w-full p-3 bg-[#222222] border border-white/5 text-white rounded-none focus:outline-none focus:border-[#C9A96E]"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="bulk-status" className="block text-white/50 mb-1.5 uppercase font-semibold tracking-wider">Status Override</label>
                  <select
                    id="bulk-status"
                    value={bulkStatus}
                    onChange={(e) => setBulkStatus(e.target.value)}
                    className="w-full p-3 bg-[#222222] border border-white/5 text-white rounded-none focus:outline-none focus:border-[#C9A96E]"
                  >
                    <option value="available">🟢 Open / Available</option>
                    <option value="on_request">🟡 On Request Block</option>
                    <option value="fully_booked">🔴 Full Lockout Block</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={bulkLoading}
                  className="w-full mt-4 bg-[#C9A96E] hover:bg-[#B4955E] text-[#1A1A1A] py-3 uppercase tracking-widest font-bold font-mono transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  {bulkLoading ? 'Processing Bulk Overlay...' : 'Apply Bulk Range'}
                </button>
              </form>
            </section>

          </div>

          {/* Right Side: Verification Calendar Block */}
          <div className="bg-[#1A1A1A] border border-white/5 p-6 shadow-md space-y-6">
            <h2 className="font-serif text-lg text-white border-b border-white/5 pb-3">Visual Calendar Verification</h2>
            
            {/* Inject styled calendar block */}
            <div className="rounded-none overflow-hidden [&_*]:text-[#1A1A1A]">
              <AvailabilityCalendar key={calendarKey} />
            </div>
            
            <div className="bg-[#222222] border border-[#C9A96E]/15 p-4 flex gap-3 text-xs text-white/50 font-sans leading-relaxed">
              <CheckCircle size={18} className="text-[#C9A96E] shrink-0 mt-0.5" />
              <div>
                <strong>Verify Live Calendar updates:</strong> When overlays are saved, the right calendar blocks automatically pull in new datasets matching the selected filters. Verify dates align before closing this panel.
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};

export default AdminAvailability;
