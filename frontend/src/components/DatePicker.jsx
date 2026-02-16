import { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  addDays, 
  addMonths, 
  subMonths, 
  isSameMonth, 
  isSameDay, 
  parse 
} from 'date-fns';

const DatePicker = ({ value, onChange, name, className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const dropdownRef = useRef(null);

  // Parse the value to a Date object
  const selectedDate = value ? parse(value, 'yyyy-MM-dd', new Date()) : null;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Update currentMonth when a valid date is selected
  useEffect(() => {
    if (selectedDate && !isNaN(selectedDate.getTime())) {
      setCurrentMonth(selectedDate);
    }
  }, [selectedDate]);

  const handleDateClick = (date) => {
    const formattedDate = format(date, 'yyyy-MM-dd');
    onChange({ target: { name, value: formattedDate } });
    setIsOpen(false);
  };

  const renderHeader = () => {
    return (
      <div className="flex items-center justify-between mb-4">
        <button
          type="button"
          onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
          className="p-1 hover:bg-slate-600 rounded transition-colors"
        >
          <ChevronLeft className="w-5 h-5 text-slate-300" />
        </button>
        <span className="text-white font-semibold">
          {format(currentMonth, 'MMMM yyyy')}
        </span>
        <button
          type="button"
          onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
          className="p-1 hover:bg-slate-600 rounded transition-colors"
        >
          <ChevronRight className="w-5 h-5 text-slate-300" />
        </button>
      </div>
    );
  };

  const renderDays = () => {
    const days = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
    return (
      <div className="grid grid-cols-7 gap-1 mb-2">
        {days.map((day) => (
          <div key={day} className="text-center text-xs font-semibold text-slate-400 py-1">
            {day}
          </div>
        ))}
      </div>
    );
  };

  const renderCells = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const rows = [];
    let days = [];
    let day = startDate;

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        const cloneDay = day;
        const isSelected = selectedDate && isSameDay(day, selectedDate);
        const isCurrentMonth = isSameMonth(day, monthStart);
        const isToday = isSameDay(day, new Date());

        days.push(
          <button
            type="button"
            key={day}
            onClick={() => handleDateClick(cloneDay)}
            className={`
              p-2 text-sm rounded transition-colors
              ${!isCurrentMonth ? 'text-slate-600' : 'text-slate-200'}
              ${isSelected ? 'bg-amber-500 text-white font-bold' : ''}
              ${!isSelected && isCurrentMonth ? 'hover:bg-slate-600' : ''}
              ${isToday && !isSelected ? 'ring-1 ring-amber-400' : ''}
            `}
          >
            {format(day, 'd')}
          </button>
        );
        day = addDays(day, 1);
      }
      rows.push(
        <div key={day} className="grid grid-cols-7 gap-1">
          {days}
        </div>
      );
      days = [];
    }

    return <div className="space-y-1">{rows}</div>;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <div className="relative">
        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
        <input
          type="text"
          name={name}
          value={selectedDate && !isNaN(selectedDate.getTime()) ? format(selectedDate, 'MMM dd, yyyy') : ''}
          onClick={() => setIsOpen(!isOpen)}
          readOnly
          placeholder="Select a date"
          className={`w-full pl-11 pr-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent cursor-pointer ${className}`}
        />
      </div>

      {isOpen && (
        <div className="absolute z-50 mt-2 p-4 bg-slate-800 border border-slate-600 rounded-lg shadow-2xl w-80">
          {renderHeader()}
          {renderDays()}
          {renderCells()}
          <div className="mt-3 pt-3 border-t border-slate-600 flex justify-between">
            <button
              type="button"
              onClick={() => {
                const today = new Date();
                handleDateClick(today);
              }}
              className="px-3 py-1 text-sm text-amber-400 hover:bg-slate-700 rounded transition-colors"
            >
              Today
            </button>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="px-3 py-1 text-sm text-slate-400 hover:bg-slate-700 rounded transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DatePicker;
