import React, { useEffect, useState } from 'react';
import { PROPERTIES } from '../data/properties';
import PropertyCard from '../components/PropertyCard';
import AvailabilityCalendar from '../components/AvailabilityCalendar';
import { MessageSquare, Phone, Mail, MapPin, Clock } from 'lucide-react';

const Home = () => {
  const [todayStatuses, setTodayStatuses] = useState({});

  useEffect(() => {
    // Fetch current month's availability to determine today's status (2026-06-03)
    const fetchTodayStatuses = async () => {
      try {
        const res = await fetch('https://tamayi.zimbabwe.workers.dev/api/availability?month=2026-06');
        if (res.ok) {
          const data = await res.json();
          // Target today's date: June 3, 2026
          const todayStr = '2026-06-03';
          const statuses = {};
          
          // Initialize all to available
          PROPERTIES.forEach(p => {
            statuses[p.id] = 'available';
          });

          // Override with database records
          data.forEach(item => {
            if (item.date === todayStr) {
              statuses[item.property_id] = item.status;
            }
          });

          setTodayStatuses(statuses);
        }
      } catch (err) {
        console.error('Failed to fetch today\'s statuses:', err);
      }
    };

    fetchTodayStatuses();
  }, []);

  const handleScrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center bg-black">
        <img
          src="/Images/Tamayi Holiday Home.jpeg"
          alt="Luxury Villa Hero"
          className="absolute inset-0 w-full h-full object-cover opacity-60"
        />
        <div className="absolute inset-0 luxury-overlay"></div>
        
        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto flex flex-col items-center gap-6">
          <span className="text-[#C9A96E] font-sans tracking-[0.3em] text-xs md:text-sm font-semibold uppercase animate-slide-up">
            Tamayi Hospitality Group
          </span>
          <h1 className="text-5xl md:text-7xl font-serif text-white font-light tracking-wide leading-tight luxury-text-shadow animate-slide-up animation-delay-200">
            Bespoke Luxury Living in Harare
          </h1>
          <p className="text-white/80 font-sans text-sm md:text-lg max-w-xl leading-relaxed animate-slide-up animation-delay-400">
            Discover a collection of premium boutique accommodations blending contemporary comfort with the warmth of African hospitality.
          </p>
          <div className="flex gap-4 mt-4 animate-slide-up animation-delay-400">
            <button
              onClick={() => handleScrollToSection('properties')}
              className="bg-transparent hover:bg-white/10 text-white border border-white px-8 py-3.5 text-xs uppercase tracking-widest font-semibold transition-all duration-300 rounded-none cursor-pointer"
            >
              Explore Stays
            </button>
            <button
              onClick={() => handleScrollToSection('calendar-section')}
              className="bg-[#C9A96E] hover:bg-[#B4955E] text-[#1A1A1A] px-8 py-3.5 text-xs uppercase tracking-widest font-semibold transition-all duration-300 rounded-none shadow-lg cursor-pointer"
            >
              Check Availability
            </button>
          </div>
        </div>
      </section>

      {/* Properties Section */}
      <section id="properties" className="py-24 bg-[#FAF8F5] px-6 md:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-[#C9A96E] text-xs uppercase tracking-widest font-bold block mb-3">Our Portfolio</span>
            <h2 className="text-4xl md:text-5xl font-serif text-[#1A1A1A]">Curated Accommodations</h2>
            <div className="w-16 h-[1px] bg-[#C9A96E] mx-auto mt-6"></div>
          </div>

          <div className="flex flex-col">
            {PROPERTIES.map((property, idx) => (
              <PropertyCard
                key={property.id}
                property={property}
                index={idx}
                todayStatus={todayStatuses[property.id] || 'available'}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Availability Section */}
      <section id="calendar-section" className="py-24 bg-white px-6 md:px-12 border-t border-[#E8E3DC]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-[#C9A96E] text-xs uppercase tracking-widest font-bold block mb-3">Reservations</span>
            <h2 className="text-4xl md:text-5xl font-serif text-[#1A1A1A]">Live Availability Calendar</h2>
            <p className="text-[#1A1A1A]/60 mt-4 text-sm font-sans">
              Select your preferred property to view open slots. Click any green (available) or yellow (on-request) date to pre-fill a booking inquiry.
            </p>
            <div className="w-16 h-[1px] bg-[#C9A96E] mx-auto mt-6"></div>
          </div>

          <AvailabilityCalendar />
        </div>
      </section>

      {/* Luxury Contact/Details Section */}
      <section id="contact-details" className="py-24 bg-[#1A1A1A] text-white px-6 md:px-12 border-t border-[#C9A96E]/20">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <span className="text-[#C9A96E] text-xs uppercase tracking-widest font-bold block mb-3">Connect With Us</span>
            <h2 className="text-4xl md:text-5xl font-serif text-white mb-6">Plan Your Luxury Getaway</h2>
            <p className="text-white/60 text-sm md:text-base leading-relaxed mb-8 font-sans">
              Whether you need to reserve a corporate retreat, family vacation, wedding guest accommodation, or an intimate outdoor setup, our hosting team is ready to assist. Contact us via phone, email, or direct WhatsApp messaging.
            </p>
            
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-white/5 flex items-center justify-center border border-white/10">
                  <MapPin size={18} className="text-[#C9A96E]" />
                </div>
                <div>
                  <h4 className="text-xs uppercase tracking-widest text-[#C9A96E] font-semibold">Location</h4>
                  <p className="text-sm text-white/70 mt-0.5">Harare, Zimbabwe (Mainway Meadows & Mt Pleasant)</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-white/5 flex items-center justify-center border border-white/10">
                  <Phone size={18} className="text-[#C9A96E]" />
                </div>
                <div>
                  <h4 className="text-xs uppercase tracking-widest text-[#C9A96E] font-semibold">Phone Contact</h4>
                  <p className="text-sm text-white/70 mt-0.5">+263 78 789 1150</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-white/5 flex items-center justify-center border border-white/10">
                  <Mail size={18} className="text-[#C9A96E]" />
                </div>
                <div>
                  <h4 className="text-xs uppercase tracking-widest text-[#C9A96E] font-semibold">Email</h4>
                  <p className="text-sm text-white/70 mt-0.5">info@tamayihospitality.com</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-white/5 flex items-center justify-center border border-white/10">
                  <Clock size={18} className="text-[#C9A96E]" />
                </div>
                <div>
                  <h4 className="text-xs uppercase tracking-widest text-[#C9A96E] font-semibold">Hours</h4>
                  <p className="text-sm text-white/70 mt-0.5">Reception is open daily from 7:00 AM - 10:00 PM</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white/5 border border-white/10 p-8 md:p-12 relative overflow-hidden flex flex-col justify-center gap-6">
            <h3 className="font-serif text-2xl text-[#C9A96E]">WhatsApp Direct Booking</h3>
            <p className="text-white/60 text-sm font-sans">
              Have special configuration requests or want an instant quote? Connect directly with our reservation team on WhatsApp.
            </p>
            <a
              href="https://wa.me/263787891150?text=Hello%20Tamayi%2C%20I'm%20interested%20in%20booking%20one%20of%20your%20properties."
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-3 bg-[#C9A96E] hover:bg-[#B4955E] text-[#1A1A1A] py-3.5 px-6 font-semibold uppercase tracking-wider text-xs transition-colors w-full md:w-auto self-start cursor-pointer"
            >
              <MessageSquare size={16} />
              Open WhatsApp Chat
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
