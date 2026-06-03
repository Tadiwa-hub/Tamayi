import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { PROPERTIES } from '../data/properties';
import AvailabilityCalendar from '../components/AvailabilityCalendar';
import { Calendar, MessageSquare, ArrowLeft, ShieldCheck, Loader2, User, Phone } from 'lucide-react';

const Booking = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Scroll to top on entry
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Form State
  const propertyId = searchParams.get('property') || 'holiday_home';
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [error, setError] = useState(null);

  // Selected Property Object Helper
  const property = PROPERTIES.find(p => p.id === propertyId) || PROPERTIES[0];

  const handleDateSelection = (dateStr) => {
    setError(null);
    if (!checkIn || (checkIn && checkOut)) {
      setCheckIn(dateStr);
      setCheckOut('');
    } else {
      if (new Date(dateStr) <= new Date(checkIn)) {
        setCheckIn(dateStr);
        setCheckOut('');
      } else {
        setCheckOut(dateStr);
      }
    }
  };

  const handleWhatsAppConfirm = async (e) => {
    e.preventDefault();
    
    if (!clientName.trim() || !clientPhone.trim()) {
      setError("Please enter your name and phone number.");
      return;
    }

    if (!checkIn || !checkOut) {
      setError("Please select both a Start and End date on the calendar.");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    
    try {
      await fetch('https://tamayi.zimbabwe.workers.dev/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          property_id: property.id,
          property_name: property.name,
          check_in: checkIn,
          check_out: checkOut,
          client_name: clientName,
          client_phone: clientPhone
        })
      });
    } catch (err) {
      console.error('Auto-slash failed:', err);
    }

    const phoneNumber = '263787891150';
    const textMsg = `Hello Tamayi! My name is ${clientName}.
  
I'm interested in booking: *${property.name}*
Dates: *${checkIn}* to *${checkOut}*
My Phone: ${clientPhone}

Please confirm availability. Thank you!`;

    const encoded = encodeURIComponent(textMsg);
    window.open(`https://wa.me/${phoneNumber}?text=${encoded}`, '_blank');
    
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] pt-28 pb-20 px-6">
      <div className="max-w-2xl mx-auto">
        <Link to="/" className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-[#1A1A1A]/60 hover:text-[#C9A96E] transition-colors mb-8 font-semibold">
          <ArrowLeft size={14} /> Back to explore
        </Link>

        <div className="bg-white border border-[#E8E3DC] shadow-xl overflow-hidden animate-slide-up">
          {/* Header */}
          <div className="bg-[#1A1A1A] p-8 text-center border-b border-[#C9A96E]/20">
            <span className="text-[#C9A96E] text-[10px] uppercase tracking-[0.3em] font-bold block mb-2">Reservation Inquiry</span>
            <h2 className="text-2xl font-serif text-white uppercase tracking-wider">Book Your Stay</h2>
          </div>

          <form onSubmit={handleWhatsAppConfirm} className="p-8 md:p-12 space-y-8">
            
            {/* Step 1: Guest Info */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 border-b border-[#E8E3DC] pb-2">
                <span className="w-6 h-6 rounded-full bg-[#C9A96E] text-[#1A1A1A] flex items-center justify-center text-[10px] font-bold">1</span>
                <h3 className="font-serif text-lg text-[#1A1A1A]">Contact Details</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold text-[#1A1A1A]/50 tracking-widest ml-1">Full Name</label>
                  <div className="relative">
                    <User size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#C9A96E]" />
                    <input 
                      type="text" 
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      placeholder="e.g. John Doe"
                      className="w-full pl-10 pr-4 py-3 bg-[#FAF8F5] border border-[#E8E3DC] focus:border-[#C9A96E] outline-none text-sm font-sans transition-all"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold text-[#1A1A1A]/50 tracking-widest ml-1">Phone Number</label>
                  <div className="relative">
                    <Phone size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#C9A96E]" />
                    <input 
                      type="tel" 
                      value={clientPhone}
                      onChange={(e) => setClientPhone(e.target.value)}
                      placeholder="+263 77..."
                      className="w-full pl-10 pr-4 py-3 bg-[#FAF8F5] border border-[#E8E3DC] focus:border-[#C9A96E] outline-none text-sm font-sans transition-all"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Step 2: Selected Room (Autofilled) */}
            <div className="space-y-4">
               <div className="flex items-center gap-3 border-b border-[#E8E3DC] pb-2">
                <span className="w-6 h-6 rounded-full bg-[#C9A96E] text-[#1A1A1A] flex items-center justify-center text-[10px] font-bold">2</span>
                <h3 className="font-serif text-lg text-[#1A1A1A]">Property Selection</h3>
              </div>
              <div className="p-4 bg-[#FAF8F5] border border-[#E8E3DC] flex items-center gap-4">
                <img src={property.image} alt="" className="w-16 h-16 object-cover border border-[#E8E3DC]" />
                <div>
                  <p className="text-[10px] uppercase font-bold text-[#C9A96E] tracking-widest">Selected Accommodation</p>
                  <p className="font-serif text-base text-[#1A1A1A]">{property.name}</p>
                </div>
              </div>
            </div>

            {/* Step 3: Small Calendar */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 border-b border-[#E8E3DC] pb-2">
                <span className="w-6 h-6 rounded-full bg-[#C9A96E] text-[#1A1A1A] flex items-center justify-center text-[10px] font-bold">3</span>
                <h3 className="font-serif text-lg text-[#1A1A1A]">Stay Dates</h3>
              </div>
              
              <div className="max-w-md mx-auto transform scale-90 md:scale-100 origin-top">
                <AvailabilityCalendar 
                  initialPropertyId={property.id} 
                  onDateClick={handleDateSelection} 
                  showTabs={false} 
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-[#FAF8F5] border border-[#E8E3DC] text-center">
                  <p className="text-[9px] uppercase font-bold text-[#1A1A1A]/40 mb-1">Check-In</p>
                  <p className="text-xs font-semibold text-[#1A1A1A]">{checkIn || '-- -- ----'}</p>
                </div>
                <div className="p-3 bg-[#FAF8F5] border border-[#E8E3DC] text-center">
                  <p className="text-[9px] uppercase font-bold text-[#1A1A1A]/40 mb-1">Check-Out</p>
                  <p className="text-xs font-semibold text-[#1A1A1A]">{checkOut || '-- -- ----'}</p>
                </div>
              </div>
            </div>

            {error && (
              <div className="p-4 bg-red-50 border border-red-100 text-red-600 text-xs font-semibold text-center">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-5 bg-[#1A1A1A] hover:bg-[#C9A96E] text-white hover:text-[#1A1A1A] text-xs font-bold uppercase tracking-widest transition-all cursor-pointer flex items-center justify-center gap-3 shadow-lg disabled:opacity-70"
            >
              {isSubmitting ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <MessageSquare size={20} />
              )}
              {isSubmitting ? 'Sending Request...' : 'Confirm Inquiry via WhatsApp'}
            </button>

            <div className="flex items-center justify-center gap-2 text-[10px] text-[#1A1A1A]/40 uppercase tracking-widest font-semibold pt-4">
              <ShieldCheck size={14} className="text-[#C9A96E]" />
              Secure Direct Booking System
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Booking;