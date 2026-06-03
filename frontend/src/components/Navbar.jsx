import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import logoImg from '../assets/logo.png';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Listen to scroll to update navbar background color
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  const handleNavClick = (sectionId) => {
    setIsMobileMenuOpen(false);
    if (location.pathname === '/') {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      navigate(`/#${sectionId}`);
      // Wait for navigation to complete before scrolling
      setTimeout(() => {
        const element = document.getElementById(sectionId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    }
  };

  const isHome = location.pathname === '/';

  return (
    <>
      <nav
        id="navbar"
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ease-in-out px-6 py-4 md:px-12 ${
          isScrolled || !isHome
            ? 'bg-[#1A1A1A] border-b border-[#C9A96E]/20 py-3 shadow-lg'
            : 'bg-transparent py-5'
        }`}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo & Branding */}
          <Link to="/" className="flex items-center gap-3 group">
            <img
              src={logoImg}
              alt="Tamayi Logo"
              className="w-10 h-10 object-contain filter brightness-100 group-hover:scale-105 transition-transform duration-300"
            />
            <span className="text-white font-serif font-semibold text-xl tracking-widest group-hover:text-[#C9A96E] transition-colors">
              TAMAYI
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-8">
            <button
              onClick={() => handleNavClick('properties')}
              className="text-white/80 hover:text-[#C9A96E] tracking-wider text-xs uppercase font-medium transition-colors cursor-pointer"
            >
              Properties
            </button>
            <Link
              to="/gallery"
              className={`tracking-wider text-xs uppercase font-medium transition-colors ${
                location.pathname === '/gallery' ? 'text-[#C9A96E]' : 'text-white/80 hover:text-[#C9A96E]'
              }`}
            >
              Gallery
            </Link>
            <button
              onClick={() => handleNavClick('contact')}
              className="text-white/80 hover:text-[#C9A96E] tracking-wider text-xs uppercase font-medium transition-colors cursor-pointer"
            >
              Contact
            </button>
            <Link
              to="/book"
              id="desktop-book-btn"
              className="bg-[#C9A96E] hover:bg-[#B4955E] text-[#1A1A1A] px-5 py-2.5 rounded-none font-medium tracking-wider text-xs uppercase transition-all duration-300 shadow-md hover:shadow-[#C9A96E]/10"
            >
              Book Now
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-white hover:text-[#C9A96E] transition-colors focus:outline-none"
              aria-label="Toggle Menu"
            >
              {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Fullscreen Overlay */}
      <div
        className={`fixed inset-0 z-40 bg-[#1A1A1A] flex flex-col justify-center items-center gap-8 transition-all duration-500 ease-in-out md:hidden ${
          isMobileMenuOpen ? 'opacity-100 pointer-events-auto visible' : 'opacity-0 pointer-events-none invisible'
        }`}
      >
        <button
          onClick={() => handleNavClick('properties')}
          className="text-white font-serif text-2xl tracking-widest hover:text-[#C9A96E] transition-colors"
        >
          PROPERTIES
        </button>
        <Link
          to="/gallery"
          onClick={() => setIsMobileMenuOpen(false)}
          className="text-white font-serif text-2xl tracking-widest hover:text-[#C9A96E] transition-colors"
        >
          GALLERY
        </Link>
        <button
          onClick={() => handleNavClick('contact')}
          className="text-white font-serif text-2xl tracking-widest hover:text-[#C9A96E] transition-colors"
        >
          CONTACT
        </button>
        <Link
          to="/book"
          onClick={() => setIsMobileMenuOpen(false)}
          className="bg-[#C9A96E] text-[#1A1A1A] px-8 py-3.5 mt-4 font-medium tracking-wider text-sm uppercase transition-colors hover:bg-[#B4955E]"
        >
          BOOK NOW
        </Link>

        {/* Subtle background branding watermark in mobile menu */}
        <img
          src={logoImg}
          alt="Watermark"
          className="absolute bottom-10 w-24 h-24 opacity-5 pointer-events-none"
        />
      </div>
    </>
  );
};

export default Navbar;
