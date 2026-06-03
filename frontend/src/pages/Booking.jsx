import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { PROPERTIES } from '../data/properties';
import { Calendar, User, Phone, MessageSquare, ArrowLeft, CheckCircle2, ShieldCheck } from 'lucide-react';

const Booking = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Query Params Extraction
  const queryProperty = searchParams.get('property') || 'holiday_home';
  const queryCheckIn = searchParams.get('check_in') || '';

  // Form State
  const [propertyId, setPropertyId] = useState(queryProperty);
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [checkIn, setCheckIn] = useState(queryCheckIn);
  const [checkOut, setCheckOut] = useState('');
  const [numGuests, setNumGuests] = useState(1);
  const [specialRequests, setSpecialRequests] = useState('');

  // Status State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [successBookingId, setSuccessBookingId] = useState(null);

  // Sync state if query params change
  useEffect(() => {
    if (searchParams.get('property')) {
      setPropertyId(searchParams.get('property'));
    }
    if (searchParams.get('check_in')) {
      setCheckIn(searchParams.get('check_in'));
    }
  }, [searchParams]);

  // Selected Property Object Helper
  const selectedPropertyObj = PROPERTIES.find(p => p.id === propertyId) || PROPERTIES[0];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    // Core validation checks
    if (!clientName.trim() || !clientPhone.trim() || !checkIn) {
      setError('Please fill in all required fields (Name, Phone, Check-in Date).');
      setIsSubmitting(false);
      return;
    }

    const checkInDate = new Date(checkIn);
    const todayCutoff = new Date(2026, 5, 3); // June 3, 2026
    
    // Quick validation check against 2026-06-03
    if (checkInDate < todayCutoff) {
      setError('Check-in date cannot be in the past.');
      setIsSubmitting(false);
      return;
    }

    if (checkOut) {
      const checkOutDate = new Date(checkOut);
      if (checkOutDate <= checkInDate) {
        setError('Check-out date must be after the check-in date.');
        setIsSubmitting(false);
        return;
      }
    }

    try {
      const payload = {
        property_id: propertyId,
        property_name: selectedPropertyObj.name,
        client_name: clientName,
        client_phone: clientPhone,
        check_in: checkIn,
        check_out: checkOut || null,
        num_guests: parseInt(numGuests) || 1,
        special_requests: specialRequests
      };

      const res = await fetch('https://tamayi.zimbabwe.workers.dev/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const data = await res.json();
        setSuccessBookingId(data.booking_id);
      } else {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to submit booking request.');
      }
    } catch (err) {
      console.error(err);
      setError(err.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleWhatsAppConfirm = () => {
    if (!successBookingId) return;

    const phoneNumber = '263771234567'; // Default WhatsApp destination
    const dateRange = checkOut ? `${checkIn} to ${checkOut}` : `${checkIn}`;
    const textMsg = `Hello Tamayi Hospitality Group! I have just submitted a booking request online. 
  
*Booking ID:* ${successBookingId}
*Property:* ${selectedPropertyObj.name}
*Client Name:* ${clientName}
*Check-in/Out:* ${dateRange}
*Guests:* ${numGuests}

Please review and confirm my request. Thank you!`;

    const encoded = encodeURIComponent(textMsg);
    window.open(`https://wa.me/${phoneNumber}?text=${encoded}`, '_blank');
  };

  // Success view layout
  if (successBookingId) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] pt-28 pb-16 px-6 flex items-center justify-center">
        <div className="max-w-xl w-full bg-white border border-[#E8E3DC] p-8 md:p-12 text-center shadow-lg animate-slide-up">
          <div className="w-16 h-16 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={36} />
          </div>
          
          <span className="text-[#C9A96E] text-xs uppercase tracking-widest font-bold block mb-2">Request Submitted</span>
          <h2 className="text-3xl font-serif text-[#1A1A1A] mb-4">Inquiry Received Successfully</h2>
          
          <div className="bg-[#FAF8F5] border border-[#E8E3DC] p-4 text-left space-y-2 mb-8 text-sm font-sans text-[#1A1A1A]/80">
            <p><strong className="text-[#1A1A1A]">Booking ID:</strong> <span className="text-[#C9A96E] font-mono font-bold text-base">{successBookingId}</span></p>
            <p><strong className="text-[#1A1A1A]">Selected Property:</strong> {selectedPropertyObj.name}</p>
            <p><strong className="text-[#1A1A1A]">Dates:</strong> {checkIn} {checkOut && `to ${checkOut}`}</p>
            <p><strong className="text-[#1A1A1A]">Number of Guests:</strong> {numGuests}</p>
            <p><strong className="text-[#1A1A1A]">Status:</strong> <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">Pending Verification</span></p>
          </div>

          <p className="text-[#1A1A1A]/60 text-sm mb-8 font-sans leading-relaxed">
            Your request has been filed in our database. To prioritize and speed up your verification, please click the button below to send your Booking ID directly to our reservation agents on WhatsApp.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/"
              className="px-6 py-3 border border-[#E8E3DC] hover:border-[#1A1A1A] hover:bg-[#FAF8F5] text-[#1A1A1A]/70 text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer flex items-center justify-center"
            >
              Back to Home
            </Link>
            <button
              onClick={handleWhatsAppConfirm}
              className="px-6 py-3 bg-[#C9A96E] hover:bg-[#B4955E] text-[#1A1A1A] text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2 shadow-md"
            >
              <MessageSquare size={14} />
              Confirm on WhatsApp
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF8F5] pt-28 pb-16 px-6">
      <div className="max-w-5xl mx-auto flex flex-col lg:flex-row gap-12 items-stretch">
        
        {/* Left Side: Booking Form */}
        <div className="w-full lg:w-3/5 bg-white border border-[#E8E3DC] p-8 md:p-12 shadow-sm flex flex-col">
          <Link to="/" className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-[#1A1A1A]/60 hover:text-[#C9A96E] transition-colors mb-6 font-semibold">
            <ArrowLeft size={14} /> Back to explore
          </Link>
          
          <h2 className="text-4xl font-serif text-[#1A1A1A] mb-2">Book Your Luxury Stay</h2>
          <p className="text-[#1A1A1A]/50 text-sm mb-8 font-sans">
            Please fill in the details below. Our booking team will review your requests and reach out shortly.
          </p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-4 mb-6 text-sm font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6 flex-grow flex flex-col justify-between">
            <div className="space-y-6">
              {/* Property Selector */}
              <div>
                <label htmlFor="property-select" className="block text-xs uppercase tracking-widest font-semibold text-[#1A1A1A]/75 mb-2">
                  Select Accommodation *
                </label>
                <select
                  id="property-select"
                  value={propertyId}
                  onChange={(e) => setPropertyId(e.target.value)}
                  className="w-full p-3.5 border border-[#E8E3DC] bg-[#FAF8F5] rounded-none focus:outline-none focus:border-[#C9A96E] font-sans text-sm"
                  required
                >
                  {PROPERTIES.map(p => (
                    <option key={p.id} value={p.id}>{p.name} - ${p.rate}/night</option>
                  ))}
                </select>
              </div>

              {/* Client Info Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="client-name" className="block text-xs uppercase tracking-widest font-semibold text-[#1A1A1A]/75 mb-2">
                    Full Name *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#1A1A1A]/40" size={16} />
                    <input
                      id="client-name"
                      type="text"
                      placeholder="e.g. John Doe"
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      className="w-full pl-10 pr-4 py-3.5 border border-[#E8E3DC] bg-[#FAF8F5] rounded-none focus:outline-none focus:border-[#C9A96E] font-sans text-sm"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="client-phone" className="block text-xs uppercase tracking-widest font-semibold text-[#1A1A1A]/75 mb-2">
                    Phone Number *
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#1A1A1A]/40" size={16} />
                    <input
                      id="client-phone"
                      type="tel"
                      placeholder="e.g. +263 77 123 4567"
                      value={clientPhone}
                      onChange={(e) => setClientPhone(e.target.value)}
                      className="w-full pl-10 pr-4 py-3.5 border border-[#E8E3DC] bg-[#FAF8F5] rounded-none focus:outline-none focus:border-[#C9A96E] font-sans text-sm"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Dates Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="check-in" className="block text-xs uppercase tracking-widest font-semibold text-[#1A1A1A]/75 mb-2">
                    Check-In Date *
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#1A1A1A]/40" size={16} />
                    <input
                      id="check-in"
                      type="date"
                      value={checkIn}
                      onChange={(e) => setCheckIn(e.target.value)}
                      className="w-full pl-10 pr-4 py-3.5 border border-[#E8E3DC] bg-[#FAF8F5] rounded-none focus:outline-none focus:border-[#C9A96E] font-sans text-sm"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="check-out" className="block text-xs uppercase tracking-widest font-semibold text-[#1A1A1A]/75 mb-2">
                    Check-Out Date
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#1A1A1A]/40" size={16} />
                    <input
                      id="check-out"
                      type="date"
                      value={checkOut}
                      onChange={(e) => setCheckOut(e.target.value)}
                      className="w-full pl-10 pr-4 py-3.5 border border-[#E8E3DC] bg-[#FAF8F5] rounded-none focus:outline-none focus:border-[#C9A96E] font-sans text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Number of Guests */}
              <div>
                <label htmlFor="num-guests" className="block text-xs uppercase tracking-widest font-semibold text-[#1A1A1A]/75 mb-2">
                  Number of Guests
                </label>
                <input
                  id="num-guests"
                  type="number"
                  min="1"
                  max="30"
                  value={numGuests}
                  onChange={(e) => setNumGuests(e.target.value)}
                  className="w-full p-3.5 border border-[#E8E3DC] bg-[#FAF8F5] rounded-none focus:outline-none focus:border-[#C9A96E] font-sans text-sm"
                />
              </div>

              {/* Special Requests */}
              <div>
                <label htmlFor="special-requests" className="block text-xs uppercase tracking-widest font-semibold text-[#1A1A1A]/75 mb-2">
                  Special Requests / Inquiries
                </label>
                <textarea
                  id="special-requests"
                  rows="3"
                  placeholder="e.g. Late check-in, honeymoon room setup, dietary requirements..."
                  value={specialRequests}
                  onChange={(e) => setSpecialRequests(e.target.value)}
                  className="w-full p-3.5 border border-[#E8E3DC] bg-[#FAF8F5] rounded-none focus:outline-none focus:border-[#C9A96E] font-sans text-sm resize-none"
                ></textarea>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-8 bg-[#1A1A1A] hover:bg-[#C9A96E] text-white hover:text-[#1A1A1A] py-4 text-xs font-semibold uppercase tracking-widest rounded-none transition-all duration-300 shadow-md cursor-pointer flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Submitting Request...
                </>
              ) : (
                'Submit Booking Request'
              )}
            </button>
          </form>
        </div>

        {/* Right Side: Selected Property Details (Luxury Card) */}
        <div className="w-full lg:w-2/5 bg-white border border-[#E8E3DC] p-8 shadow-sm flex flex-col justify-between">
          <div className="space-y-6">
            <h3 className="font-serif text-2xl text-[#1A1A1A] border-b border-[#E8E3DC] pb-4">Stay Summary</h3>
            
            <div className="aspect-[4/3] overflow-hidden shadow-sm">
              <img
                src={selectedPropertyObj.image}
                alt={selectedPropertyObj.name}
                className="w-full h-full object-cover"
              />
            </div>
            
            <div className="space-y-3">
              <h4 className="text-xl font-serif text-[#1A1A1A]">{selectedPropertyObj.name}</h4>
              <p className="text-sm text-[#1A1A1A]/70 leading-relaxed font-sans">{selectedPropertyObj.description}</p>
            </div>
            
            <div className="py-4 border-t border-b border-[#E8E3DC] space-y-2.5 font-sans text-xs text-[#1A1A1A]/75">
              <div className="flex justify-between">
                <span>Base Rate</span>
                <span className="font-serif text-sm font-semibold text-[#C9A96E]">${selectedPropertyObj.rate} / night</span>
              </div>
              <div className="flex justify-between">
                <span>Capacity</span>
                <span>{selectedPropertyObj.guests}</span>
              </div>
              <div className="flex justify-between">
                <span>Direct booking fee</span>
                <span className="text-emerald-600 font-semibold">0% (None)</span>
              </div>
            </div>
          </div>

          <div className="mt-8 bg-[#FAF8F5] border border-[#C9A96E]/20 p-4 flex gap-3.5 items-start">
            <ShieldCheck size={20} className="text-[#C9A96E] shrink-0 mt-0.5" />
            <div className="font-sans text-xs text-[#1A1A1A]/60 leading-relaxed">
              <strong className="text-[#1A1A1A]">Direct Guarantee:</strong> Your information is stored securely. No charges are taken during this step. Booking terms and invoices are finalized directly with the management.
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Booking;
