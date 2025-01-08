import { useEffect, useState } from 'react';

const CalendarComponent = () => {
  const [isClient, setIsClient] = useState(false);
  const [userId, setUserId] = useState('');
  const [userColor, setUserColor] = useState('');
  const [users, setUsers] = useState([]);

  useEffect(() => {
    setIsClient(true);
    if (typeof window !== 'undefined') {
      const storedUserId = localStorage.getItem('studioUserId') || generateRandomId();
      const storedUserColor = localStorage.getItem('studioUserColor') || '';
      const storedUsers = JSON.parse(localStorage.getItem('studioUsers')) || getDefaultUsers();

      setUserId(storedUserId);
      setUserColor(storedUserColor);
      setUsers(storedUsers);

      localStorage.setItem('studioUserId', storedUserId);
      localStorage.setItem('studioUsers', JSON.stringify(storedUsers));
      if (storedUserColor) {
        localStorage.setItem('studioUserColor', storedUserColor);
      }
    }
  }, []);

  const generateRandomId = () => Math.random().toString(36).substring(2, 15);
  const getDefaultUsers = () => [
    { id: 'slot1', color: 'rgb(96, 165, 250)', name: '', taken: false },
    { id: 'slot2', color: 'rgb(251, 113, 133)', name: '', taken: false },
    { id: 'slot3', color: 'rgb(74, 222, 128)', name: '', taken: false },
  ];

  const handleUserNameSubmit = (name) => {
    const availableSlots = users.filter(user => !user.taken);
    if (availableSlots.length > 0) {
      const randomSlot = availableSlots[Math.floor(Math.random() * availableSlots.length)];
      const updatedUsers = users.map(user => user.id === randomSlot.id ? { ...user, name, taken: true } : user);
      setUsers(updatedUsers);
      setUserColor(randomSlot.color);
      localStorage.setItem('studioUsers', JSON.stringify(updatedUsers));
      localStorage.setItem('studioUserColor', randomSlot.color);
    }
  };

  if (!isClient) {
    return null; // Render nothing on the server
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex items-center justify-center">
      {/* Your component JSX here */}
    </div>
  );
};

export default CalendarComponent;