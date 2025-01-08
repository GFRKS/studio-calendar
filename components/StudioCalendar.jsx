import React, { useState, useEffect } from 'react';
import { Calendar } from 'lucide-react';

const COLORS = {
  blue: 'rgb(96, 165, 250)',   // Lighter blue
  red: 'rgb(251, 113, 133)',   // Lighter red
  green: 'rgb(74, 222, 128)'   // Lighter green
};

const generateUserId = () => {
  return Math.random().toString(36).substring(2, 15);
};

const StudioCalendar = () => {
  const [initialized, setInitialized] = useState(false);
  const [namePrompt, setNamePrompt] = useState(true);
  const [userName, setUserName] = useState('');
  const [userId] = useState(() => {
    const stored = localStorage.getItem('studioUserId');
    return stored || generateUserId();
  });
  const [userColor, setUserColor] = useState(() => {
    return localStorage.getItem('studioUserColor') || '';
  });
  const [selectedBlocks, setSelectedBlocks] = useState({});
  const [users, setUsers] = useState(() => {
    const stored = localStorage.getItem('studioUsers');
    return stored ? JSON.parse(stored) : [
      { id: 'slot1', color: COLORS.blue, name: '', taken: false },
      { id: 'slot2', color: COLORS.red, name: '', taken: false },
      { id: 'slot3', color: COLORS.green, name: '', taken: false }
    ];
  });

  useEffect(() => {
    localStorage.setItem('studioUserId', userId);
    localStorage.setItem('studioUsers', JSON.stringify(users));
    if (userColor) {
      localStorage.setItem('studioUserColor', userColor);
    }
  }, [userId, users, userColor]);

  const initializeUser = (name) => {
    const availableSlots = users.filter(user => !user.taken);
    if (availableSlots.length > 0) {
      const randomIndex = Math.floor(Math.random() * availableSlots.length);
      const selectedSlot = availableSlots[randomIndex];
      
      const newUsers = users.map(user => 
        user.id === selectedSlot.id 
          ? { ...user, name: name, taken: true }
          : user
      );
      
      setUsers(newUsers);
      setUserColor(selectedSlot.color);
      setUserName(name);
      setNamePrompt(false);
      setInitialized(true);
    }
  };

  const getRollingDates = () => {
    const dates = [];
    const today = new Date();
    
    // Add past 7 days
    for (let i = 7; i > 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      dates.push(date);
    }
    
    // Add today
    dates.push(today);
    
    // Add next 27 days (instead of 28) to make it exactly 35 days total
    for (let i = 1; i <= 27; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push(date);
    }
    
    return dates;
  };

  const toggleBlock = (date, block) => {
    const key = `${date.toDateString()}-${block}`;
    setSelectedBlocks(prev => {
      const newBlocks = { ...prev };
      if (newBlocks[key]?.user === userId) {
        delete newBlocks[key];
      } else {
        newBlocks[key] = { user: userId, color: userColor };
      }
      return newBlocks;
    });
  };

  const isToday = (date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isPast = (date) => {
    const today = new Date();
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
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
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