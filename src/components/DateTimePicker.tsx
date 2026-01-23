import { useState } from 'react';
import { FaCalendarAlt, FaClock } from 'react-icons/fa';
import { format } from 'date-fns';

interface DateTimePickerProps {
  date: Date;
  time: string;
  onDateChange: (date: Date) => void;
  onTimeChange: (time: string) => void;
}

const DateTimePicker = ({ date, time, onDateChange, onTimeChange }: DateTimePickerProps) => {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const formatDate = (date: Date) => {
    return format(date, "MMMM do, yyyy");
  };

  const formatTime = (time: string) => {
    try {
      const [hours, minutes] = time.split(':');
      const hour = parseInt(hours);
      const ampm = hour >= 12 ? 'pm' : 'am';
      const displayHour = hour % 12 || 12;
      return `${displayHour}:${minutes} ${ampm}`;
    } catch {
      return time;
    }
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = new Date(e.target.value);
    onDateChange(newDate);
    setShowDatePicker(false);
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onTimeChange(e.target.value);
    setShowTimePicker(false);
  };

  return (
    <div className="flex gap-4">
      {/* Date Picker */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setShowDatePicker(!showDatePicker)}
          className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors"
        >
          <FaCalendarAlt />
          <span>{formatDate(date)}</span>
        </button>
        {showDatePicker && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setShowDatePicker(false)}
            />
            <div className="absolute top-full mt-2 z-20 bg-slate-800 rounded-lg p-2 shadow-xl">
              <input
                type="date"
                value={format(date, 'yyyy-MM-dd')}
                onChange={handleDateChange}
                className="bg-slate-700 text-white px-3 py-2 rounded border border-slate-600 focus:outline-none focus:ring-2 focus:ring-primary"
                min={format(new Date(), 'yyyy-MM-dd')}
              />
            </div>
          </>
        )}
      </div>

      {/* Time Picker */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setShowTimePicker(!showTimePicker)}
          className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors"
        >
          <FaClock />
          <span>{formatTime(time)}</span>
        </button>
        {showTimePicker && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setShowTimePicker(false)}
            />
            <div className="absolute top-full mt-2 z-20 bg-slate-800 rounded-lg p-2 shadow-xl">
              <input
                type="time"
                value={time}
                onChange={handleTimeChange}
                className="bg-slate-700 text-white px-3 py-2 rounded border border-slate-600 focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default DateTimePicker;
