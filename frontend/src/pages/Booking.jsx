import React, { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { PROPERTIES } from '../data/properties';
import { Calendar, MessageSquare, ArrowLeft, ShieldCheck, Loader2 } from 'lucide-react';

const Booking = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Query Params Extraction
  const propertyId = searchParams.get('property') || 'holiday_home';
  const checkIn = searchParams.get('check_in') || 'Not selected';

  // Selected Property Object Helper
  const property = PROPERTIES.find(p => p.id === propertyId) || PROPERTIES[0];

  const handleWhatsAppConfirm = async () => {
    setIsSubmitting(true);
    
    // 1. Call Backend to "Slash" the date and record the inquiry
    try {
      await fetch('https://tamayi.zimbabwe.workers.dev/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          property_id: property.id,
          property_name: property.name,
          check_in: checkIn,
          client_name: 'Website Guest',
          client_phone: 'WhatsApp User'
        })
      });
    } catch (err) {
      console.error('Auto-slash failed, but proceeding to WhatsApp:', err);
    }

    // 2. Open WhatsApp
    const phoneNumber = '263771234567'; // Your WhatsApp Number
    const textMsg = `Hello Tamayi Hospitality Group! I'm interested in booking:
  
*Property:* ${property.name}
*Check-in Date:* ${checkIn}

Please let me know the next steps for confirmation. Thank you!`;

    const encoded = encodeURIComponent(textMsg);
    window.open(`https://wa.me/${phoneNumber}?text=${encoded}`, '_blank');
    
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] pt-28 pb-16 px-6">
      <div className="max-w-xl mx-auto">
        <Link to="/" className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-[#1A1A1A]/60 hover:text-[#C9A96E] transition-colors mb-8 font-semibold">
          <ArrowLeft size={14} /> Back to explore
        </Link>

        <div className="bg-white border border-[#E8E3DC] p-8 md:p-12 shadow-lg text-center animate-slide-up">
          <span className="text-[#C9A96E] text-xs uppercase tracking-widest font-bold block mb-2">Instant Inquiry</span>
          <h2 className="text-3xl font-serif text-[#1A1A1A] mb-6">Confirm Your Selection</h2>
          
          <div className="aspect-[16/9] overflow-hidden mb-8 border border-[#E8E3DC]">
            <img src={property.image} alt={property.name} className="w-full h-full object-cover" />
          </div>

          <div className="bg-[#FAF8F5] border border-[#E8E3DC] p-6 text-left space-y-4 mb-8 text-sm font-sans">
            <div className="flex justify-between border-b border-[#E8E3DC] pb-2">
              <span className="text-[#1A1A1A]/50 uppercase font-semibold text-[10px]">Accommodation</span>
              <span className="font-serif font-bold text-[#1A1A1A]">{property.name}</span>
            </div>
            <div className="flex justify-between border-b border-[#E8E3DC] pb-2">
              <span className="text-[#1A1A1A]/50 uppercase font-semibold text-[10px]">Rate</span>
              <span className="text-[#C9A96E] font-bold">${property.rate} / night</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[#1A1A1A]/50 uppercase font-semibold text-[10px]">Selected Date</span>
              <div className="flex items-center gap-2 text-[#1A1A1A] font-semibold">
                <Calendar size={14} className="text-[#C9A96E]" />
                {checkIn}
              </div>
            </div>
          </div>

          <p className="text-[#1A1A1A]/60 text-sm mb-8 font-sans leading-relaxed">
            Click the button below to send your request directly to our reservation team on WhatsApp. We will confirm availability and price details instantly.
          </p>

          <button
            onClick={handleWhatsAppConfirm}
            disabled={isSubmitting}
            className="w-full py-4 bg-[#C9A96E] hover:bg-[#B4955E] text-[#1A1A1A] text-xs font-bold uppercase tracking-widest transition-all cursor-pointer flex items-center justify-center gap-3 shadow-md disabled:opacity-70"
          >
            {isSubmitting ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <MessageSquare size={18} />
            )}
            {isSubmitting ? 'Confirming...' : 'Confirm via WhatsApp'}
          </button>

          <div className="mt-8 pt-6 border-t border-[#E8E3DC] flex gap-3 items-center justify-center text-[10px] text-[#1A1A1A]/40 uppercase tracking-widest font-semibold">
            <ShieldCheck size={14} className="text-[#C9A96E]" />
            Secure Direct Communication
          </div>
        </div>
      </div>
    </div>
  );
};

export default Booking;
