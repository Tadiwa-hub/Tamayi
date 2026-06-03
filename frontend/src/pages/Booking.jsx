import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { PROPERTIES } from '../data/properties';
import AvailabilityCalendar from '../components/AvailabilityCalendar';
import { Calendar, MessageSquare, ArrowLeft, ShieldCheck, Loader2, Info } from 'lucide-react';

const Booking = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const propertyId = searchParams.get('property') || 'holiday_home';
  const initialCheckIn = searchParams.get('check_in') || '';
  
  const [checkIn, setCheckIn] = useState(initialCheckIn);
  const [checkOut, setCheckOut] = useState('');
  const [error, setError] = useState(null);

  // Selected Property Object Helper
  const property = PROPERTIES.find(p => p.id === propertyId) || PROPERTIES[0];

  // Logic: When a user clicks a date on the calendar
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

  const handleWhatsAppConfirm = async () => {
    if (!checkIn || !checkOut) {
      setError("Please select both a Start and End date.");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    
    // 1. Call Backend to "Slash" the range in the database
    try {
      const res = await fetch('https://tamayi.zimbabwe.workers.dev/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          property_id: property.id,
          property_name: property.name,
          check_in: checkIn,
          check_out: checkOut,
          client_name: 'Website Guest',
          client_phone: 'WhatsApp User'
        })
      });
      if (!res.ok) throw new Error("Failed to update database.");
    } catch (err) {
      console.error('Auto-slash failed, but proceeding to WhatsApp:', err);
    }

    // 2. Open WhatsApp with the full range
    const phoneNumber = '263771234567'; // Your WhatsApp Number
    const textMsg = `Hello Tamayi Hospitality Group! I'm interested in booking:
  
*Property:* ${property.name}
*Dates:* ${checkIn} to ${checkOut}

Please let me know the next steps for confirmation. Thank you!`;

    const encoded = encodeURIComponent(textMsg);
    window.open(`https://wa.me/${phoneNumber}?text=${encoded}`, '_blank');
    
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] pt-28 pb-16 px-6">
      <div className="max-w-5xl mx-auto flex flex-col lg:flex-row gap-12">
        
        {/* Left: Property Specific Calendar */}
        <div className="lg:w-3/5 space-y-6">
          <Link to="/" className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-[#1A1A1A]/60 hover:text-[#C9A96E] transition-colors font-semibold">
            <ArrowLeft size={14} /> Back to explore
          </Link>
          
          <div className="bg-white border border-[#E8E3DC] p-2 shadow-sm">
            <div className="p-6 border-b border-[#E8E3DC]">
              <h2 className="font-serif text-2xl text-[#1A1A1A]">Select Your Dates</h2>
              <p className="text-xs text-[#1A1A1A]/50 uppercase tracking-widest mt-1">Calendar for: {property.name}</p>
            </div>
            
            <AvailabilityCalendar 
              initialPropertyId={property.id} 
              onDateClick={handleDateSelection} 
              showTabs={false} 
            />
            
            <div className="p-4 bg-[#FAF8F5] flex gap-3 items-start border-t border-[#E8E3DC]">
              <Info size={16} className="text-[#C9A96E] shrink-0 mt-0.5" />
              <p className="text-[11px] text-[#1A1A1A]/60 leading-relaxed font-sans">
                <strong>How to select:</strong> Click the calendar once for your <span className="text-[#1A1A1A] font-bold">Start Date</span> and then click again for your <span className="text-[#1A1A1A] font-bold">End Date</span>.
              </p>
            </div>
          </div>
        </div>

        {/* Right: Stay Summary & Confirm */}
        <div className="lg:w-2/5">
          <div className="bg-white border border-[#E8E3DC] p-8 md:p-10 shadow-lg sticky top-32">
            <span className="text-[#C9A96E] text-xs uppercase tracking-widest font-bold block mb-2">Booking Summary</span>
            <h3 className="text-2xl font-serif text-[#1A1A1A] mb-6">{property.name}</h3>

            <div className="aspect-video overflow-hidden mb-8 border border-[#E8E3DC]">
              <img src={property.image} alt={property.name} className="w-full h-full object-cover" />
            </div>

            <div className="space-y-4 mb-8">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] uppercase font-bold text-[#1A1A1A]/40 tracking-widest">Check-In</label>
                <div className="p-3 bg-[#FAF8F5] border border-[#E8E3DC] text-sm font-semibold text-[#1A1A1A] flex items-center gap-2">
                  <Calendar size={14} className="text-[#C9A96E]" />
                  {checkIn || 'Click calendar...'}
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] uppercase font-bold text-[#1A1A1A]/40 tracking-widest">Check-Out</label>
                <div className="p-3 bg-[#FAF8F5] border border-[#E8E3DC] text-sm font-semibold text-[#1A1A1A] flex items-center gap-2">
                  <Calendar size={14} className="text-[#C9A96E]" />
                  {checkOut || 'Click calendar...'}
                </div>
              </div>
            </div>

            {error && (
              <div className="mb-6 p-3 bg-red-50 border border-red-100 text-red-600 text-[11px] font-semibold text-center">
                {error}
              </div>
            )}

            <button
              onClick={handleWhatsAppConfirm}
              disabled={isSubmitting}
              className="w-full py-4 bg-[#1A1A1A] hover:bg-[#C9A96E] text-white hover:text-[#1A1A1A] text-xs font-bold uppercase tracking-widest transition-all cursor-pointer flex items-center justify-center gap-3 shadow-md disabled:opacity-70"
            >
              {isSubmitting ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <MessageSquare size={18} />
              )}
              {isSubmitting ? 'Processing...' : 'Confirm via WhatsApp'}
            </button>

            <div className="mt-8 pt-6 border-t border-[#E8E3DC] flex gap-3 items-center justify-center text-[10px] text-[#1A1A1A]/40 uppercase tracking-widest font-semibold">
              <ShieldCheck size={14} className="text-[#C9A96E]" />
              Direct Inquiry logic active
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Booking;