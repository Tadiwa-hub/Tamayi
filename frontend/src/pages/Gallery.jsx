import React, { useState } from 'react';
import { X, ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react';

const GALLERY_IMAGES = [
  {
    src: '/Images/Tamayi Holiday Home.jpeg',
    category: 'homes',
    title: 'Tamayi Holiday Home - Exterior Lounge',
    description: 'A beautiful look at the luxury outdoor lounge area of the Tamayi Holiday Home.'
  },
  {
    src: '/Images/Full house.jpeg',
    category: 'homes',
    title: 'Full House - Front Facade',
    description: 'Modern 3-bedroom styling featuring high-end architectural layout.'
  },
  {
    src: '/Images/Full house 2.jpeg',
    category: 'homes',
    title: 'Full House - Interior View',
    description: 'Spacious and elegant interior design with premium finishes.'
  },
  {
    src: '/Images/Full house 3.jpeg',
    category: 'homes',
    title: 'Full House - Master Suite',
    description: 'A look into the luxurious master bedroom setup.'
  },
  {
    src: '/Images/New Cottage.jpeg',
    category: 'cottages',
    title: 'New Cottage - Tranquil Entrance',
    description: 'Elegant and peaceful 1-bedroom suite entrance tailored for couple getaways.'
  },
  {
    src: '/Images/New Cottage 2.jpeg',
    category: 'cottages',
    title: 'New Cottage - Interior Charm',
    description: 'Cozy and stylish interior of our private 1-bedroom cottage.'
  },
  {
    src: '/Images/Outdoor.jpeg',
    category: 'events',
    title: 'Outdoor Setup - Garden Luncheon',
    description: 'Perfect setup layout in Harare gardens for baby showers and family lunches.'
  },
  {
    src: '/Images/Outdoor2.jpeg',
    category: 'events',
    title: 'Outdoor Setup - Evening Ambience',
    description: 'Beautiful evening lighting for intimate garden events and dinners.'
  }
];

const Gallery = () => {
  const [activeFilter, setActiveFilter] = useState('all');
  const [lightboxIndex, setLightboxIndex] = useState(null);

  // Filter Logic
  const filteredImages = activeFilter === 'all'
    ? GALLERY_IMAGES
    : GALLERY_IMAGES.filter(img => img.category === activeFilter);

  const handlePrev = (e) => {
    e.stopPropagation();
    setLightboxIndex((prev) => (prev === 0 ? filteredImages.length - 1 : prev - 1));
  };

  const handleNext = (e) => {
    e.stopPropagation();
    setLightboxIndex((prev) => (prev === filteredImages.length - 1 ? 0 : prev + 1));
  };

  const filters = [
    { id: 'all', label: 'All Media' },
    { id: 'homes', label: 'Villas & Homes' },
    { id: 'cottages', label: 'Cottages' },
    { id: 'rooms', label: 'Private Rooms' },
    { id: 'events', label: 'Events & Gardens' }
  ];

  return (
    <div className="min-h-screen bg-[#FAF8F5] pt-28 pb-20 px-6">
      <div className="max-w-7xl mx-auto">
        
        {/* Gallery Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-[#C9A96E] text-xs uppercase tracking-widest font-bold block mb-3">Our Imagery</span>
          <h1 className="text-4xl md:text-5xl font-serif text-[#1A1A1A]">The Tamayi Experience</h1>
          <p className="text-[#1A1A1A]/60 mt-4 text-sm font-sans">
            Browse through our portfolio of properties and event venues, capturing the luxury comfort waiting for you.
          </p>
          <div className="w-16 h-[1px] bg-[#C9A96E] mx-auto mt-6"></div>
        </div>

        {/* Filter Navigation Tabs */}
        <div className="flex flex-wrap gap-2 mb-12 justify-center border-b border-[#E8E3DC] pb-6">
          {filters.map((f) => (
            <button
              key={f.id}
              onClick={() => setActiveFilter(f.id)}
              className={`px-5 py-2.5 text-xs uppercase tracking-widest font-semibold transition-all duration-300 rounded-none border ${
                activeFilter === f.id
                  ? 'bg-[#1A1A1A] border-[#1A1A1A] text-white'
                  : 'bg-white border-[#E8E3DC] text-[#1A1A1A]/70 hover:border-[#1A1A1A] hover:text-[#1A1A1A]'
              } cursor-pointer`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Image Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredImages.map((img, idx) => (
            <div
              key={idx}
              onClick={() => setLightboxIndex(idx)}
              className="group relative bg-[#1A1A1A] overflow-hidden aspect-[4/3] cursor-pointer shadow-md border border-[#E8E3DC]"
            >
              <img
                src={img.src}
                alt={img.title}
                className="w-full h-full object-cover transition-all duration-700 ease-out group-hover:scale-105 group-hover:opacity-40"
                loading="lazy"
              />
              
              {/* Gold decorative border on hover */}
              <div className="absolute inset-0 border border-transparent group-hover:border-[#C9A96E]/40 m-3 transition-all duration-500 pointer-events-none"></div>

              {/* Hover Text Details */}
              <div className="absolute inset-0 flex flex-col justify-end p-6 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <span className="text-[#C9A96E] text-[10px] uppercase tracking-widest font-bold mb-1">
                  {img.category}
                </span>
                <h3 className="font-serif text-white text-lg font-semibold leading-snug">
                  {img.title}
                </h3>
                <div className="mt-3 text-white/70 text-xs flex items-center gap-1.5 font-sans">
                  <ZoomIn size={12} className="text-[#C9A96E]" />
                  <span>Click to view larger</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Lightbox Modal */}
        {lightboxIndex !== null && (
          <div
            className="fixed inset-0 z-50 bg-black/95 flex flex-col justify-center items-center p-4 transition-all duration-300"
            onClick={() => setLightboxIndex(null)}
          >
            {/* Top Close Button */}
            <button
              onClick={() => setLightboxIndex(null)}
              className="absolute top-6 right-6 text-white/70 hover:text-white transition-colors cursor-pointer"
              aria-label="Close Lightbox"
            >
              <X size={28} />
            </button>

            {/* Navigation Arrows */}
            <button
              onClick={handlePrev}
              className="absolute left-4 p-3 bg-white/5 hover:bg-white/10 text-white border border-white/10 hover:border-white/30 transition-all cursor-pointer"
              aria-label="Previous Image"
            >
              <ChevronLeft size={24} />
            </button>

            <button
              onClick={handleNext}
              className="absolute right-4 p-3 bg-white/5 hover:bg-white/10 text-white border border-white/10 hover:border-white/30 transition-all cursor-pointer"
              aria-label="Next Image"
            >
              <ChevronRight size={24} />
            </button>

            {/* Central Media Box */}
            <div
              className="max-w-5xl w-full max-h-[75vh] flex justify-center items-center overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={filteredImages[lightboxIndex].src}
                alt={filteredImages[lightboxIndex].title}
                className="max-w-full max-h-[75vh] object-contain border border-white/10"
              />
            </div>

            {/* Text Description Block */}
            <div
              className="text-center mt-6 max-w-xl px-4"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="font-serif text-white text-xl md:text-2xl font-light tracking-wide mb-2">
                {filteredImages[lightboxIndex].title}
              </h3>
              <p className="text-white/60 text-xs md:text-sm font-sans leading-relaxed">
                {filteredImages[lightboxIndex].description}
              </p>
              <span className="inline-block mt-3 px-3 py-1 bg-white/5 border border-white/10 text-white/50 text-[10px] uppercase font-mono tracking-widest">
                Image {lightboxIndex + 1} of {filteredImages.length}
              </span>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};

export default Gallery;
