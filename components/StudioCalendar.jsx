import React, { useState } from 'react';
import { Calendar } from 'lucide-react';

const COLORS = {
  blue: 'rgb(96, 165, 250)',   // Lighter blue
  red: 'rgb(251, 113, 133)',   // Lighter red
  green: 'rgb(74, 222, 128)'   // Lighter green
};

const StudioCalendar = () => {
  const [namePrompt, setNamePrompt] = useState(true);
  const [userName, setUserName] = useState('');
  const [userColor, setUserColor] = useState('');
  const [selectedBlocks, setSelectedBlocks] = useState({});
  const [users, setUsers] = useState([
    { id: 'slot1', color: COLORS.blue, name: '', taken: false },
    { id: 'slot2', color: COLORS.red, name: '', taken: false },
    { id: 'slot3', color: COLORS.green, name: '', taken: false }
  ]);

  // Initialize from localStorage on client-side only
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedUsers = localStorage.getItem('studioUsers');
      const storedColor = localStorage.getItem('studioUserColor');
      
      if (storedUsers) {
        setUsers(JSON.parse(storedUsers));
      }
      if (storedColor) {
        setUserColor(storedColor);
        setNamePrompt(false);
      }
    }
  }, []);

  const getCurrentDate = () => {
    return new Date(2025, 0, 8); // January 8, 2025 - Replace with new Date() in production
  };

  const getStartOfCurrentWeek = (today) => {
    const currentDay = today.getDay();
    const monday = new Date(today);
    
    // Calculate how many days to subtract to get to Monday
    // If today is Sunday (0), we want the next day (Monday)
    // For all other days, we want the current week's Monday
    const daysToMonday = currentDay === 0 ? 1 : (currentDay - 1);
    
    // Move to Monday
    monday.setDate(today.getDate() - daysToMonday);
    
    // Reset time to start of day
    monday.setHours(0, 0, 0, 0);
    
    return monday;
  };

  const getRollingDates = () => {
    const dates = [];
    const today = getCurrentDate();
    
    // Get Monday of the current week
    const firstDay = getStartOfCurrentWeek(today);
    
    // Generate exactly 35 days (5 weeks) starting from current week's Monday
    for (let i = 0; i < 35; i++) {
      const date = new Date(firstDay);
      date.setDate(firstDay.getDate() + i);
      dates.push(date);
    }
    
    return dates;
  };

  const initializeUser = (name) => {
    // Check if user already exists
    const existingUser = users.find(user => user.name === name);
    
    if (existingUser) {
      // User exists, load their color
      setUserColor(existingUser.color);
      setUserName(name);
      setNamePrompt(false);
      
      // Save to localStorage on client-side only
      if (typeof window !== 'undefined') {
        localStorage.setItem('studioUserColor', existingUser.color);
      }
      return;
    }
    
    // Find available slot for new user
    const availableSlots = users.filter(user => !user.taken);
    if (availableSlots.length > 0) {
      // Assign first available slot
      const selectedSlot = availableSlots[0];
      
      // Update users array
      const newUsers = users.map(user => 
        user.id === selectedSlot.id 
          ? { ...user, name: name, taken: true }
          : user
      );
      
      setUsers(newUsers);
      setUserColor(selectedSlot.color);
      setUserName(name);
      setNamePrompt(false);

      // Save to localStorage on client-side only
      if (typeof window !== 'undefined') {
        localStorage.setItem('studioUsers', JSON.stringify(newUsers));
        localStorage.setItem('studioUserColor', selectedSlot.color);
      }
    } else {
      alert('No available slots. Please try again later.');
    }
  };

  const toggleBlock = (date, block) => {
    const key = `${date.toDateString()}-${block}`;
    setSelectedBlocks(prev => {
      const newBlocks = { ...prev };
      if (newBlocks[key]?.user === userName) {
        delete newBlocks[key];
      } else {
        newBlocks[key] = { user: userName, color: userColor };
      }
      return newBlocks;
    });
  };

  const isToday = (date) => {
    const today = getCurrentDate();
    return date.toDateString() === today.toDateString();
  };

  const isPast = (date) => {
    const today = getCurrentDate();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  if (namePrompt) {
    return (
      <div className="min-h-screen bg-gray-900 text-gray-100 flex items-center justify-center">
        <div className="bg-gray-800 p-8 rounded-lg max-w-md w-full">
          <h2 className="text-xl font-bold mb-4">Welcome to Studio Calendar</h2>
          <p className="mb-4">Please enter your name to get started:</p>
          <input
            type="text"
            className="w-full p-2 rounded bg-gray-700 text-white mb-4"
            placeholder="Your name"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && userName.trim()) {
                initializeUser(userName.trim());
              }
            }}
          />
          <button
            className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 disabled:opacity-50"
            disabled={!userName.trim()}
            onClick={() => initializeUser(userName.trim())}
          >
            Continue
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <Calendar className="w-6 h-6" />
            <h1 className="text-xl font-bold">Studio Calendar</h1>
          </div>
          <div className="flex items-center gap-4">
            {users.map(user => (
              <div
                key={user.id}
                className={`flex items-center gap-2 ${user.color === userColor ? 'ring-2 ring-white rounded-full px-2 py-1' : ''}`}
              >
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: user.color }}
                />
                <span className="text-sm">{user.name || 'Waiting...'}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-2">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
            <div key={day} className="text-center text-sm text-gray-400 py-2">
              {day}
            </div>
          ))}
          
          {getRollingDates().map((date) => {
            const past = isPast(date);
            const today = isToday(date);
            
            return (
              <div
                key={date.toString()}
                className={`aspect-square ${
                  today ? 'bg-gray-700' : 'bg-gray-800'
                } rounded-lg p-2 ${
                  past ? 'opacity-50' : ''
                }`}
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm">{date.getDate()}</span>
                  <span className="text-xs text-gray-400">
                    {date.toLocaleDateString('en-US', { month: 'short' })}
                  </span>
                </div>
                <div className="grid grid-rows-2 gap-1 h-3/4">
                  <div
                    className={`rounded cursor-pointer transition-colors ${
                      past ? 'cursor-not-allowed' : ''
                    }`}
                    style={{
                      backgroundColor: selectedBlocks[`${date.toDateString()}-day`]?.color || 'rgb(31, 41, 55)'
                    }}
                    onClick={() => !past && toggleBlock(date, 'day')}
                  />
                  <div
                    className={`rounded cursor-pointer transition-colors ${
                      past ? 'cursor-not-allowed' : ''
                    }`}
                    style={{
                      backgroundColor: selectedBlocks[`${date.toDateString()}-night`]?.color || 'rgb(31, 41, 55)'
                    }}
                    onClick={() => !past && toggleBlock(date, 'night')}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* QR Code Placeholder */}
        <div className="mt-8 p-4 bg-gray-800 rounded-lg text-center">
          <div className="mb-2">Share your calendar</div>
          <div className="w-32 h-32 bg-gray-700 mx-auto rounded-lg flex items-center justify-center">
            <span className="text-sm text-gray-400">QR Code</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudioCalendar;