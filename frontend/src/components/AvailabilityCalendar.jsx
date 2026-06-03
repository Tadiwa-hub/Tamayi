import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, HelpCircle, AlertCircle } from 'lucide-react';

const PROPERTIES = [
  { id: 'holiday_home', label: 'Holiday Home' },
  { id: 'full_house', label: 'Full House' },
  { id: 'private_rooms', label: 'Private Rooms' },
  { id: 'new_cottage', label: 'Cottage' },
  { id: 'outdoor_setup', label: 'Outdoor Setup' }
];

const AvailabilityCalendar = ({ initialPropertyId = 'holiday_home', onDateClick, showTabs = true }) => {
  const navigate = useNavigate();
  const [selectedProperty, setSelectedProperty] = useState(initialPropertyId);
  
  // Set default calendar month to June 2026 as per local time context
  const [currentDate, setCurrentDate] = useState(new Date(2026, 5, 1)); // Month is 0-indexed (5 = June)
  const [availability, setAvailability] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [onRequestNotice, setOnRequestNotice] = useState(null);
  
  const timerRef = useRef(null);

  // Keep selectedProperty in sync with initialPropertyId if tabs are hidden
  useEffect(() => {
    if (!showTabs) {
      setSelectedProperty(initialPropertyId);
    }
  }, [initialPropertyId, showTabs]);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth(); // 0-11
  const monthStr = `${year}-${String(month + 1).padStart(2, '0')}`; // YYYY-MM

  // Fetch availability for the active month
  const fetchAvailability = async (showLoader = false) => {
    if (showLoader) setLoading(true);
    try {
      const res = await fetch(`https://tamayi.zimbabwe.workers.dev/api/availability?month=${monthStr}`);
      if (res.ok) {
        const data = await res.json();
        // Index by date for faster lookups: { "2026-06-10": { status, note } }
        const indexed = {};
        data.forEach(item => {
          if (item.property_id === selectedProperty) {
            indexed[item.date] = { status: item.status, note: item.note };
          }
        });
        setAvailability(indexed);
        setError(null);
      } else {
        throw new Error('Failed to fetch availability data');
      }
    } catch (err) {
      console.error(err);
      setError('Could not update live availability. Showing default values.');
    } finally {
      if (showLoader) setLoading(false);
    }
  };

  // Sync on property or month changes, and start polling every 60s
  useEffect(() => {
    fetchAvailability(true);

    // Setup polling interval (60 seconds)
    timerRef.current = setInterval(() => {
      fetchAvailability(false);
    }, 60000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [selectedProperty, monthStr]);

  // Calendar math
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startDayIndex = new Date(year, month, 1).getDay(); // Day of week (0-6, 0=Sunday)

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
    setOnRequestNotice(null);
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
    setOnRequestNotice(null);
  };

  const getDayStatus = (day) => {
    const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    
    // Disable past dates relative to 2026-06-03
    const cellDate = new Date(year, month, day);
    const todayCutoff = new Date(2026, 5, 3); // June 3, 2026
    if (cellDate < todayCutoff) {
      return { status: 'past', clickable: false };
    }

    const record = availability[dateKey];
    if (!record) {
      return { status: 'available', clickable: true };
    }
    
    return {
      status: record.status,
      note: record.note,
      clickable: record.status !== 'fully_booked'
    };
  };

  const handleDateClick = (day, dayInfo) => {
    if (!dayInfo.clickable) return;

    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

    if (onDateClick) {
      onDateClick(dateStr, dayInfo);
      return;
    }

    if (dayInfo.status === 'on_request') {
      setOnRequestNotice({
        date: dateStr,
        message: "This date is 'On Request'. We will verify availability and confirm within 2 hours of submitting the request."
      });
      return;
    }

    // Proceed to pre-fill booking form
    navigate(`/book?property=${selectedProperty}&check_in=${dateStr}`);
  };

  const handleConfirmOnRequest = () => {
    if (onRequestNotice) {
      if (onDateClick) {
        onDateClick(onRequestNotice.date, { status: 'on_request' });
      } else {
        navigate(`/book?property=${selectedProperty}&check_in=${onRequestNotice.date}`);
      }
    }
  };

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const daysOfWeek = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

  // Prepare calendar cells
  const cells = [];
  // Empty slots for alignment
  for (let i = 0; i < startDayIndex; i++) {
    cells.push({ type: 'empty', key: `empty-${i}` });
  }
  // Days of month
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ type: 'day', day: d, key: `day-${d}`, info: getDayStatus(d) });
  }

  return (
    <div className="w-full bg-[#FAF8F5] border border-[#E8E3DC] p-6 md:p-8">
      {/* Property Selector Tabs */}
      {showTabs && (
        <div className="flex flex-wrap gap-2 mb-8 border-b border-[#E8E3DC] pb-4 justify-center md:justify-start">
          {PROPERTIES.map((p) => (
            <button
              key={p.id}
              onClick={() => {
                setSelectedProperty(p.id);
                setOnRequestNotice(null);
              }}
              className={`px-4 py-2 text-xs uppercase tracking-widest font-semibold transition-all duration-300 rounded-none border ${
                selectedProperty === p.id
                  ? 'bg-[#1A1A1A] border-[#1A1A1A] text-white'
                  : 'bg-white border-[#E8E3DC] text-[#1A1A1A]/70 hover:border-[#1A1A1A]'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      )}

      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-serif text-2xl text-[#1A1A1A] font-semibold">
          {monthNames[month]} {year}
        </h3>
        <div className="flex gap-2">
          <button
            onClick={handlePrevMonth}
            className="p-2 border border-[#E8E3DC] bg-white hover:border-[#C9A96E] text-[#1A1A1A] transition-colors cursor-pointer"
            aria-label="Previous Month"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={handleNextMonth}
            className="p-2 border border-[#E8E3DC] bg-white hover:border-[#C9A96E] text-[#1A1A1A] transition-colors cursor-pointer"
            aria-label="Next Month"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Error or Loading Indicator */}
      {loading && (
        <div className="text-center py-2 text-xs text-[#C9A96E] font-medium tracking-wide">
          Syncing live availability...
        </div>
      )}
      {error && (
        <div className="text-center py-2 text-xs text-red-500 font-medium">
          {error}
        </div>
      )}

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1 text-center font-sans text-sm mb-6">
        {/* Days of Week Headers */}
        {daysOfWeek.map((day) => (
          <div key={day} className="py-2 text-xs uppercase font-bold text-[#1A1A1A]/50 tracking-wider">
            {day}
          </div>
        ))}

        {/* Month Day Cells */}
        {cells.map((cell) => {
          if (cell.type === 'empty') {
            return <div key={cell.key} className="bg-transparent"></div>;
          }

          const { info, day } = cell;
          let cellStyle = "bg-white text-[#1A1A1A] hover:bg-[#FAF8F5] border border-[#E8E3DC]/40 cursor-pointer";
          let labelStyle = "";

          if (info.status === 'past') {
            cellStyle = "bg-[#FAF8F5] text-[#1A1A1A]/30 cursor-not-allowed border border-[#E8E3DC]/20";
          } else if (info.status === 'fully_booked') {
            cellStyle = "bg-red-50 text-red-400 line-through cursor-not-allowed border border-red-100";
            labelStyle = "opacity-60";
          } else if (info.status === 'on_request') {
            cellStyle = "bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 cursor-pointer";
          }

          return (
            <button
              key={cell.key}
              onClick={() => handleDateClick(day, info)}
              disabled={info.status === 'past' || info.status === 'fully_booked'}
              className={`aspect-square flex flex-col justify-center items-center relative transition-all duration-200 ${cellStyle}`}
            >
              <span className={`font-semibold ${labelStyle}`}>{day}</span>
              {/* Optional cell detail helper dot */}
              {info.status === 'on_request' && (
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 absolute bottom-1"></span>
              )}
            </button>
          );
        })}
      </div>

      {/* Interactive Notice for On Request */}
      {onRequestNotice && (
        <div className="bg-amber-50 border border-amber-200 p-4 mb-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 animate-slide-up">
          <div className="flex gap-3">
            <AlertCircle className="text-amber-600 shrink-0 mt-0.5 md:mt-0" size={20} />
            <p className="text-sm text-amber-800 font-medium">
              <strong>Date Selected: {onRequestNotice.date}</strong> — {onRequestNotice.message}
            </p>
          </div>
          <button
            onClick={handleConfirmOnRequest}
            className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 text-xs uppercase tracking-wider font-semibold transition-colors shrink-0 cursor-pointer"
          >
            Confirm Date
          </button>
        </div>
      )}

      {/* Color Keys */}
      <div className="flex items-center justify-center gap-6 text-xs text-[#1A1A1A]/70 border-t border-[#E8E3DC] pt-4 flex-wrap">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-white border border-[#E8E3DC]"></span>
          <span>🟢 Available</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
          <span>🟡 On Request</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-red-400"></span>
          <span>🔴 Fully Booked</span>
        </div>
      </div>
    </div>
  );
};

export default AvailabilityCalendar;