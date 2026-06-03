import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, User, DollarSign, MessageSquare } from 'lucide-react';

const PropertyCard = ({ property, index, todayStatus = 'available' }) => {
  const navigate = useNavigate();
  const isReversed = index % 2 === 1;

  const handleBookClick = () => {
    navigate(`/book?property=${property.id}`);
  };

  const handleWhatsAppClick = () => {
    const phoneNumber = '263771234567';
    const message = encodeURIComponent(`Hello! I'm interested in booking ${property.name}. Is it available?`);
    window.open(`https://wa.me/${phoneNumber}?text=${message}`, '_blank');
  };

  // Status Badge configurations
  const getBadgeDetails = (status) => {
    switch (status) {
      case 'fully_booked':
        return {
          text: 'Fully Booked',
          color: 'bg-red-50 text-red-700 border-red-200',
          dot: 'bg-red-500'
        };
      case 'on_request':
        return {
          text: 'On Request',
          color: 'bg-amber-50 text-amber-700 border-amber-200',
          dot: 'bg-amber-500'
        };
      case 'available':
      default:
        return {
          text: 'Available Now',
          color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          dot: 'bg-emerald-500'
        };
    }
  };

  const badge = getBadgeDetails(todayStatus);

  return (
    <div 
      className={`flex flex-col lg:flex-row gap-8 lg:gap-16 items-center py-12 md:py-16 border-b border-[#E8E3DC] last:border-b-0 ${
        isReversed ? 'lg:flex-row-reverse' : ''
      }`}
    >
      {/* Property Image Container */}
      <div className="w-full lg:w-1/2 overflow-hidden aspect-[4/3] group relative shadow-md">
        <img 
          src={property.image} 
          alt={property.name} 
          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          loading="lazy"
        />
        
        {/* Subtle Luxury Gold Border Decoration on Hover */}
        <div className="absolute inset-0 border border-transparent group-hover:border-[#C9A96E]/40 m-3 transition-all duration-500 pointer-events-none"></div>
      </div>

      {/* Property Information Container */}
      <div className="w-full lg:w-1/2 flex flex-col items-start gap-4">
        {/* Status Badge */}
        <div className={`inline-flex items-center gap-1.5 px-3 py-1 text-[10px] tracking-wider uppercase font-semibold border rounded-full ${badge.color}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`}></span>
          {badge.text}
        </div>

        {/* Property Name */}
        <h3 className="text-3xl md:text-4xl font-serif text-[#1A1A1A] hover:text-[#C9A96E] transition-colors duration-300">
          {property.name}
        </h3>

        {/* Rate Tag */}
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-serif text-[#C9A96E] font-semibold">${property.rate}</span>
          <span className="text-xs text-[#1A1A1A]/50 uppercase tracking-widest font-sans">/ night</span>
        </div>

        {/* Description */}
        <p className="text-[#1A1A1A]/70 leading-relaxed font-sans text-sm md:text-base">
          {property.description}
        </p>

        {/* Highlight Details */}
        <div className="flex items-center gap-6 py-2 border-t border-b border-[#E8E3DC] w-full text-xs text-[#1A1A1A]/60">
          <div className="flex items-center gap-1.5">
            <User size={14} className="text-[#C9A96E]" />
            <span>{property.guests}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Calendar size={14} className="text-[#C9A96E]" />
            <span>Instant Confirmation</span>
          </div>
          <div className="flex items-center gap-1.5">
            <DollarSign size={14} className="text-[#C9A96E]" />
            <span>0% Direct Booking Fee</span>
          </div>
        </div>

        {/* CTA Action */}
        <div className="flex flex-wrap gap-3 mt-4">
          <button
            onClick={handleBookClick}
            className="px-8 py-3.5 bg-[#1A1A1A] hover:bg-[#C9A96E] text-white hover:text-[#1A1A1A] border border-[#1A1A1A] hover:border-[#C9A96E] rounded-none font-semibold text-xs uppercase tracking-widest transition-all duration-300 shadow-sm cursor-pointer"
          >
            Book {property.shortName}
          </button>
          <button
            onClick={handleWhatsAppClick}
            className="px-6 py-3.5 bg-transparent hover:bg-[#C9A96E]/5 text-[#1A1A1A] border border-[#1A1A1A]/20 hover:border-[#C9A96E] rounded-none font-semibold text-xs uppercase tracking-widest transition-all duration-300 flex items-center gap-2 cursor-pointer"
          >
            <MessageSquare size={16} className="text-[#C9A96E]" />
            WhatsApp Inquiry
          </button>
        </div>
      </div>
    </div>
  );
};

export default PropertyCard;
