import React from 'react';
import { Link } from 'react-router-dom';
import { MessageSquare, Mail, Phone, MapPin, ExternalLink } from 'lucide-react';
import logoImg from '../assets/logo.png';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  // Helper to open WhatsApp with general inquiry text
  const handleGeneralWhatsApp = () => {
    const defaultPhone = '+263787891150'; // Default WhatsApp Contact
    const message = encodeURIComponent("Hello Tamayi Hospitality Group! I would like to make an inquiry regarding your luxury accommodations.");
    window.open(`https://wa.me/${defaultPhone.replace('+', '')}?text=${message}`, '_blank');
  };

  return (
    <footer id="contact" className="bg-[#1A1A1A] text-white border-t border-[#C9A96E]/20">
      {/* Top Footer Section */}
      <div className="max-w-7xl mx-auto px-6 py-16 md:px-12 md:py-24 grid grid-cols-1 md:grid-cols-4 gap-12">
        
        {/* Brand Column */}
        <div className="flex flex-col gap-6 md:col-span-1">
          <div className="flex items-center gap-3">
            <img src={logoImg} alt="Gold Phoenix Eagle Logo" className="w-12 h-12 object-contain" />
            <span className="font-serif font-semibold tracking-widest text-xl text-[#C9A96E]">TAMAYI</span>
          </div>
          <p className="font-serif italic text-white/60 text-sm leading-relaxed">
            "Elevating Your Stay Experience"
          </p>
          <p className="text-white/40 text-xs leading-relaxed">
            Providing premium boutique accommodation, combining African hospitality warmth with contemporary luxury.
          </p>
        </div>

        {/* Properties Column */}
        <div className="flex flex-col gap-4">
          <h3 className="font-serif text-[#C9A96E] uppercase tracking-wider text-sm font-semibold">Our Properties</h3>
          <ul className="flex flex-col gap-3 text-sm text-white/60">
            <li className="flex justify-between border-b border-white/5 pb-1">
              <span>Tamayi Holiday Home</span>
              <span className="text-[#C9A96E] font-medium">$150/n</span>
            </li>
            <li className="flex justify-between border-b border-white/5 pb-1">
              <span>Full House (3 Bed)</span>
              <span className="text-[#C9A96E] font-medium">$100/n</span>
            </li>
            <li className="flex justify-between border-b border-white/5 pb-1">
              <span>New Cottage (1 Bed)</span>
              <span className="text-[#C9A96E] font-medium">$40/n</span>
            </li>
            <li className="flex justify-between border-b border-white/5 pb-1">
              <span>Private Rooms</span>
              <span className="text-[#C9A96E] font-medium">$30/n</span>
            </li>
            <li className="flex justify-between border-b border-white/5 pb-1">
              <span>Outdoor Setup</span>
              <span className="text-[#C9A96E] font-medium">$30</span>
            </li>
          </ul>
        </div>

        {/* Navigation & Services */}
        <div className="flex flex-col gap-4">
          <h3 className="font-serif text-[#C9A96E] uppercase tracking-wider text-sm font-semibold">Quick Links</h3>
          <ul className="flex flex-col gap-2.5 text-sm text-white/60">
            <li>
              <Link to="/" className="hover:text-[#C9A96E] transition-colors">Home Page</Link>
            </li>
            <li>
              <Link to="/gallery" className="hover:text-[#C9A96E] transition-colors">Photo Gallery</Link>
            </li>
            <li>
              <Link to="/book" className="hover:text-[#C9A96E] transition-colors">Book a Stay</Link>
            </li>
            <li>
              <a 
                href="https://tamayihospitalitygroup.com" 
                target="_blank" 
                rel="noreferrer" 
                className="hover:text-[#C9A96E] transition-colors flex items-center gap-1.5"
              >
                tamayihospitalitygroup.com <ExternalLink size={12} className="opacity-60" />
              </a>
            </li>
            <li>
              <Link to="/admin" className="hover:text-[#C9A96E] text-white/30 text-xs mt-2 block transition-colors">Admin Portal</Link>
            </li>
          </ul>
        </div>

        {/* Contact Info Column */}
        <div className="flex flex-col gap-4">
          <h3 className="font-serif text-[#C9A96E] uppercase tracking-wider text-sm font-semibold">Contact Us</h3>
          <div className="flex flex-col gap-3 text-sm text-white/60">
            <div className="flex items-start gap-2.5">
              <MapPin size={16} className="text-[#C9A96E] shrink-0 mt-0.5" />
              <span>Mainway Meadows & Mt Pleasant, Harare, Zimbabwe</span>
            </div>
            <div className="flex items-center gap-2.5">
              <Phone size={16} className="text-[#C9A96E] shrink-0" />
              <span>+263 78 789 1150</span>
            </div>
            <div className="flex items-center gap-2.5">
              <Mail size={16} className="text-[#C9A96E] shrink-0" />
              <span>info@tamayihospitality.com</span>
            </div>
            
            <button
              onClick={handleGeneralWhatsApp}
              id="footer-whatsapp-btn"
              className="flex items-center justify-center gap-2 border border-[#C9A96E] hover:bg-[#C9A96E] hover:text-[#1A1A1A] text-[#C9A96E] px-4 py-2.5 mt-2 text-xs uppercase tracking-wider font-semibold rounded-none transition-all duration-300 w-full cursor-pointer"
            >
              <MessageSquare size={14} />
              WhatsApp Booking
            </button>
          </div>
        </div>

      </div>

      {/* Bottom Legal Section */}
      <div className="border-t border-white/10 py-6 px-6 md:px-12 text-center text-xs text-white/40">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <p>© {currentYear} Tamayi Hospitality Group. All rights reserved.</p>
          <p className="tracking-wide">
            Site by <span className="text-[#C9A96E] font-medium">Tadiwa</span>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
